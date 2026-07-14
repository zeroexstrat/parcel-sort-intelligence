#!/usr/bin/env python3
"""
build_calibration.py — WS3.1: real corpus → publishable calibration.json.

PRIVATE INPUT (never ships): Operations/corpus/sort_master_corpus.json
(613 real pilot-hub sorts) and, when present, the Inbox live-pull fixtures
(loader-level scan PPH + pull cadence).

PUBLIC OUTPUT (commits): calibration.json — noised aggregate parameters
only. No row-level data, no real identifiers, no real ID ranges. The
noise method is documented in the output's `_noise` block and in
calibration_report.md so a reviewer can verify the sanitization argument
rather than trust it.

The output is format-compatible with the existing Monte Carlo generator
(vendor/ai_memory/simulation/sort_generator.py — volume/copula/dirichlet/
performance sections) and extends it with emitter sections (roster,
id_taxonomy, anomaly_rates, pull_cadence, dow_bands) consumed by
emit_hub_corpus.py / emit_xlsx.py.

NOISE METHOD (seeded, --noise-seed, default 7):
  location params (means, medians, mu_ln)   × U(0.97, 1.03)
  scale params (sd, sigma_ln)               × U(0.95, 1.10)
  dirichlet alphas                          element-wise × U(0.95, 1.05)
  correlations (off-diagonal)               + U(-0.03, 0.03), PSD-projected
  band edges (p2.5/p97.5, min/max)          widened 2% outward
  counts (n)                                rounded to nearest 10
  ID ranges                                 NEVER published — fictional blocks by construction
  anomaly rates                             NOT corpus-fit — set from the documented
                                            production failure modes (SPEC v2 §3.1)

Run at home (needs the corpus + numpy/scipy):
    ./.venv/bin/python synth-hub-generator/calibration/build_calibration.py
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import statistics as st
from datetime import date, datetime
from pathlib import Path

import numpy as np
from scipy.stats import skewnorm

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
DEFAULT_CORPUS = REPO / "Operations/corpus/sort_master_corpus.json"
DEFAULT_FIXTURES = REPO / "Inbox/26-05-31-drop"

DEST_ORDER = [
    "PD-1", "PD-2", "PD-3", "PD-4", "PD-5", "PD-6",
    "PD-7", "PD-8", "PD-9", "PD-10", "PD-11", "PD-12",
    "AIRSORT", "BACK_FEEDS", "SMALLS", "SECONDARY", "UNASSIGNED",
]
# Unmeasured residual split across the three non-observable buckets (documented heuristic).
RESIDUAL_SPLIT = {"BACK_FEEDS": 0.45, "SECONDARY": 0.35, "UNASSIGNED": 0.20}
DOW_LABELS = {0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri"}


# ────────────────────────────────────────────────────────────────────────────
# Extraction
# ────────────────────────────────────────────────────────────────────────────

def _num(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v) if math.isfinite(float(v)) else None
    tok = str(v).strip().split()[0].replace(",", "").replace("%", "")
    try:
        return float(tok)
    except ValueError:
        return None


def _series_value_at(series, hour_dec):
    """Cumulative building volume at a decimal hour, linear-interpolated."""
    pts = [(p.get("time_dec"), p.get("value")) for p in series
           if p.get("time_dec") is not None and p.get("value") is not None]
    if not pts:
        return None
    pts.sort()
    if hour_dec <= pts[0][0]:
        return float(pts[0][1])
    for (t0, v0), (t1, v1) in zip(pts, pts[1:]):
        if t0 <= hour_dec <= t1:
            f = 0 if t1 == t0 else (hour_dec - t0) / (t1 - t0)
            return float(v0) + f * (float(v1) - float(v0))
    return float(pts[-1][1])


def extract_sorts(corpus):
    """One flat record per usable sort."""
    out = []
    for d, s in sorted(corpus["sorts"].items()):
        dow = s.get("dow_num")
        if dow is None or not (0 <= dow <= 4):
            continue
        summ = s.get("summary") or {}
        series = (s.get("series") or {}).get("bldg_vol") or []
        vol = _num(summ.get("final_bldg_vol"))
        if vol is None and series:
            vals = [p.get("value") for p in series if p.get("value") is not None]
            vol = float(vals[-1]) if vals else None
        if not vol or vol < 60_000:
            continue
        rec = {"date": d, "dow": int(dow), "vol": vol,
               "bldg_pph": _num(summ.get("final_bldg_pph")),
               "adj_pph": _num(summ.get("final_adj_pph")),
               "smalls_share": None, "phases": None,
               "sor": None, "belt_shares": None, "air_share": None,
               "roster_n": None, "roster_ftpt": None, "roster_outbound_share": None}
        ss = _num(summ.get("final_total_ss"))
        if ss is not None and vol > 0:
            rec["smalls_share"] = max(0.0, min(0.6, ss / vol))
        # Phase fractions from the cumulative curve: p1 18–19, p2 19–21, p3 21–end.
        if series:
            v_start = _series_value_at(series, 18.0)
            v19, v21 = _series_value_at(series, 19.0), _series_value_at(series, 21.0)
            v_end = _series_value_at(series, 23.0)
            if None not in (v_start, v19, v21, v_end) and v_end > v_start:
                tot = v_end - v_start
                p1 = max(0.0, (v19 - v_start) / tot)
                p2 = max(0.0, (v21 - v19) / tot)
                p3 = max(0.0, 1.0 - p1 - p2)
                rec["phases"] = (p1, p2, p3)
                # spike proxy: max 15-min increment vs median increment, and its phase
                incs = []
                pts = [(p["time_dec"], p["value"]) for p in series
                       if p.get("time_dec") is not None and p.get("value") is not None]
                pts.sort()
                for (t0, v0), (t1, v1) in zip(pts, pts[1:]):
                    if v1 is not None and v0 is not None and t1 > t0:
                        incs.append((t0, (v1 - v0)))
                if len(incs) >= 6:
                    med = st.median(i[1] for i in incs) or 1.0
                    spikes = [(t, i) for t, i in incs if i > 2.2 * med]
                    rec["spike_events"] = [
                        ("p1" if t < 19 else "p2" if t < 21 else "p3", i / med)
                        for t, i in spikes
                    ]
        sor = (s.get("sor") or {}).get("summary") or {}
        if sor:
            g = lambda key, which: _num((sor.get(key) or {}).get(which))
            rec["sor"] = {
                "vol_a": g("Volume", "actual"), "vol_p": g("Volume", "planned"),
                "pph_a": g("PPH", "actual"), "pph_p": g("PPH", "planned"),
                "paid_day_a": g("Paid Day", "actual"),
                "worked_a": g("Worked", "actual"),
                "hours_a": g("Hours", "actual"),
                "direct_a": g("Direct Hours", "actual"),
                "span_a": g("Sort Span", "actual"),
            }
        # Belt shares from sort-ops area rows (aggregate OUT-n rows)
        areas = (s.get("sor") or {}).get("area_rows") or []
        belt_vol = {}
        air_vol = 0.0
        for r in areas:
            if r.get("Employee Name"):
                continue
            wa = str(r.get("Work Area") or "")
            m = re.match(r"^OUT-(\d+)", wa)
            gv = _num(r.get("Actual Gross Volume"))
            if m and gv:
                belt = f"PD-{int(m.group(1))}"
                belt_vol[belt] = belt_vol.get(belt, 0.0) + gv
            elif str(r.get("Work Area Type") or "").strip() == "Air Recovery" and gv:
                air_vol += gv
        if belt_vol and vol > 0:
            rec["belt_shares"] = {b: v / vol for b, v in belt_vol.items()}
            rec["air_share"] = air_vol / vol if air_vol else None
        # Roster from sort-ops staffing rows
        staff = (s.get("sor") or {}).get("staffing_rows") or []
        ids = set()
        ftpt = {"FT": 0, "PT": 0}
        outb = 0
        for r in staff:
            raw = r.get("Employee ID")
            eid = str(int(raw)) if isinstance(raw, float) else str(raw or "").strip()
            if not re.fullmatch(r"\d{7}", eid):
                continue
            ids.add(eid)
            fp = str(r.get("FT/PT") or "").strip().upper()
            if fp in ftpt:
                ftpt[fp] += 1
            if str(r.get("Work Area Type") or "").strip() == "Outbound":
                outb += 1
        if ids:
            rec["roster_n"] = len(ids)
            tot_fp = ftpt["FT"] + ftpt["PT"]
            rec["roster_ftpt"] = (ftpt["FT"] / tot_fp) if tot_fp else None
            rec["roster_outbound_share"] = outb / max(1, len(staff))
        out.append(rec)
    return out


def extract_loader_pph(fixtures_dir):
    """Per-loader outbound scan PPH from the newest employee-summary pull per day."""
    import csv
    pphs = []
    for day_dir in sorted(fixtures_dir.glob("26-*/live-sort")):
        emps = sorted(day_dir.glob("*employee_summary*.csv"))
        if not emps:
            continue
        with open(emps[-1], newline="", encoding="utf-8-sig") as fh:
            for row in csv.DictReader(fh):
                if str(row.get("RowType", "")).strip().lower() == "parent":
                    continue
                user = str(row.get("User") or "").strip()
                belt = str(row.get("Belt") or "").strip().upper()
                if not re.fullmatch(r"\d{7}", user):
                    continue
                if not re.match(r"^PD-?0?\d|^PD\d+HVD", belt):
                    continue
                pk = _num(row.get("TotalPackages"))
                hr = _num(row.get("TotalScanHours"))
                if pk and hr and hr >= 0.5:
                    pphs.append(pk / hr)
    return pphs


def extract_pull_cadence(fixtures_dir):
    """Gap statistics between live hub-summary pulls, per fixture day."""
    gaps, first_offsets = [], []
    for day_dir in sorted(fixtures_dir.glob("26-*/live-sort")):
        stamps = []
        for p in sorted(day_dir.glob("*hub_summary*.csv")):
            m = re.search(r"_(\d{2})(\d{2})(\d{2})\.csv$", p.name)
            if m:
                hh, mm, ss = (int(g) for g in m.groups())
                stamps.append(hh + mm / 60 + ss / 3600)
        stamps = sorted(t for t in stamps if 17.0 <= t <= 23.99)
        if len(stamps) >= 3:
            first_offsets.append((stamps[0] - 18.0) * 60)
            gaps.extend((b - a) * 60 for a, b in zip(stamps, stamps[1:]) if 0 < (b - a) * 60 < 40)
    return gaps, first_offsets


# ────────────────────────────────────────────────────────────────────────────
# Fitting
# ────────────────────────────────────────────────────────────────────────────

def fit_lognormal_by_dow(recs):
    out = {}
    for dow in range(5):
        vols = [r["vol"] for r in recs if r["dow"] == dow]
        logs = [math.log(v) for v in vols]
        out[str(dow)] = {"mu_ln": st.mean(logs), "sigma_ln": max(1e-4, st.pstdev(logs)),
                         "n": len(vols)}
    return out


def _stats(vals):
    vals = [v for v in vals if v is not None]
    if not vals:
        return None
    return {"mean": st.mean(vals), "std": st.pstdev(vals) if len(vals) > 1 else 0.0,
            "min": min(vals), "max": max(vals), "n": len(vals)}


def fit_dirichlet_mom(vectors):
    """Method-of-moments Dirichlet fit on share vectors (rows sum to 1)."""
    A = np.array(vectors)
    means = A.mean(axis=0)
    vars_ = A.var(axis=0)
    # alpha0 estimate per component, averaged over components with usable variance
    with np.errstate(divide="ignore", invalid="ignore"):
        a0s = means * (1 - means) / vars_ - 1
    a0s = a0s[np.isfinite(a0s) & (a0s > 0)]
    alpha0 = float(np.median(a0s)) if len(a0s) else 50.0
    alpha0 = float(np.clip(alpha0, 10.0, 400.0))
    return {k: float(max(0.05, means[i] * alpha0)) for i, k in enumerate(DEST_ORDER)}


def build_share_vectors(recs):
    """Full dest_order share vectors for sorts that have belt shares."""
    vecs, by_dow = [], {d: [] for d in range(5)}
    for r in recs:
        if not r["belt_shares"]:
            continue
        pd_shares = [r["belt_shares"].get(f"PD-{i}", 0.0) for i in range(1, 13)]
        smalls = r["smalls_share"] if r["smalls_share"] is not None else 0.30
        air = r["air_share"] if r["air_share"] is not None else 0.05
        used = sum(pd_shares) + smalls + air
        resid = max(0.0, 1.0 - used)
        vec = pd_shares + [air] + [resid * RESIDUAL_SPLIT["BACK_FEEDS"], smalls,
                                   resid * RESIDUAL_SPLIT["SECONDARY"],
                                   resid * RESIDUAL_SPLIT["UNASSIGNED"]]
        tot = sum(vec)
        if tot <= 0:
            continue
        vec = [v / tot for v in vec]
        vecs.append(vec)
        by_dow[r["dow"]].append(vec)
    return vecs, by_dow


def fit_copula(recs):
    """Correlation of normal-scores of (vol residual vs DOW mean, worked, paid_day)."""
    rows = [(r["dow"], math.log(r["vol"]), r["sor"]["worked_a"], r["sor"]["paid_day_a"])
            for r in recs if r["sor"] and r["sor"]["worked_a"] and r["sor"]["paid_day_a"]]
    if len(rows) < 8:
        return np.eye(3)
    dow_mu = {}
    for d in range(5):
        ls = [lv for dd, lv, _, _ in rows if dd == d]
        dow_mu[d] = st.mean(ls) if ls else st.mean(lv for _, lv, _, _ in rows)
    X = np.array([[lv - dow_mu[dd], w, p] for dd, lv, w, p in rows])

    def normal_scores(col):
        ranks = np.argsort(np.argsort(col))
        u = (ranks + 0.5) / len(col)
        from scipy.stats import norm
        return norm.ppf(u)

    Z = np.column_stack([normal_scores(X[:, i]) for i in range(3)])
    R = np.corrcoef(Z, rowvar=False)
    return np.where(np.isfinite(R), R, 0.0)


def fit_performance(recs):
    pis = []
    by_dow = {d: [] for d in range(5)}
    for r in recs:
        s = r["sor"]
        if s and s["pph_a"] and s["pph_p"] and s["pph_p"] > 0:
            pi = s["pph_a"] / s["pph_p"]
            if 0.5 <= pi <= 1.5:
                pis.append(pi)
                by_dow[r["dow"]].append(pi)
    if len(pis) < 8:
        return None
    BAD = 0.93
    bad = [p for p in pis if p < BAD]
    typ = [p for p in pis if p >= BAD]
    p_bad_global = len(bad) / len(pis)
    p_bad_by_dow = {}
    for d in range(5):
        arr = by_dow[d]
        p_bad_by_dow[str(d)] = (sum(1 for p in arr if p < BAD) / len(arr)) if len(arr) >= 4 else p_bad_global
    try:
        a, loc, scale = skewnorm.fit(typ)
    except Exception:
        a, loc, scale = 0.0, st.mean(typ), max(1e-3, st.pstdev(typ))
    return {
        "p_bad_by_dow": p_bad_by_dow,
        "typical_skew_alpha": float(a), "typical_loc": float(loc),
        "typical_scale": float(max(1e-3, scale)),
        "typical_min": float(min(typ)), "typical_max": float(max(typ)),
        "bad_mean": float(st.mean(bad)) if bad else 0.90,
        "bad_std": float(st.pstdev(bad)) if len(bad) > 1 else 0.02,
        "bad_min": float(min(bad)) if bad else 0.85,
        "bad_max": float(max(bad)) if bad else BAD,
        "_n": len(pis), "_bad_threshold": BAD,
    }


def fit_phases(recs):
    triples = [r["phases"] for r in recs if r["phases"]]
    A = np.array(triples)
    means, vars_ = A.mean(axis=0), A.var(axis=0)
    with np.errstate(divide="ignore", invalid="ignore"):
        a0s = means * (1 - means) / vars_ - 1
    a0s = a0s[np.isfinite(a0s) & (a0s > 0)]
    alpha0 = float(np.clip(np.median(a0s) if len(a0s) else 30.0, 5.0, 200.0))
    alpha = [float(max(0.2, m * alpha0)) for m in means]
    p3s = sorted(A[:, 2])
    floor = max(0.02, float(p3s[max(0, int(0.025 * len(p3s)) - 1)]))
    return alpha, floor, len(triples)


def fit_spikes(recs):
    """Coarse spike parameters from 15-min increment outliers (documented heuristic)."""
    per_sort_counts, phase_counter, magnitudes = [], {"p1": 0, "p2": 0, "p3": 0}, []
    for r in recs:
        evs = r.get("spike_events") or []
        per_sort_counts.append(len(evs))
        for ph, mag in evs:
            phase_counter[ph] += 1
            magnitudes.append(mag)
    lam = st.mean(per_sort_counts) if per_sort_counts else 0.4
    tot_ph = sum(phase_counter.values()) or 1
    phase_p = [phase_counter["p1"] / tot_ph, phase_counter["p2"] / tot_ph, phase_counter["p3"] / tot_ph]
    if sum(phase_p) <= 0:
        phase_p = [0.3, 0.5, 0.2]
    mag_mean = st.mean(magnitudes) if magnitudes else 3.0
    return {
        "spike_phase_p": [round(p / sum(phase_p), 4) for p in phase_p],
        "spike_lambda_by_phase": {"p1": round(lam * phase_p[0] / max(sum(phase_p), 1e-9), 3),
                                   "p2": round(lam * phase_p[1] / max(sum(phase_p), 1e-9), 3),
                                   "p3": round(lam * phase_p[2] / max(sum(phase_p), 1e-9), 3)},
        "spike_gamma_shape": 2.0,
        "spike_gamma_scale": round(400.0 * mag_mean / 3.0, 1),
        "spike_reroute": {"PD-9": 0.4, "PD-11": 0.4},
        "_n_sorts": len(per_sort_counts),
    }


# ────────────────────────────────────────────────────────────────────────────
# Noise
# ────────────────────────────────────────────────────────────────────────────

class Noiser:
    def __init__(self, seed):
        self.rng = np.random.default_rng(seed)
        self.log = []

    def loc(self, v, name):
        f = float(self.rng.uniform(0.97, 1.03))
        self.log.append(f"{name}: ×{f:.4f}")
        return v * f

    def scale(self, v, name):
        f = float(self.rng.uniform(0.95, 1.10))
        self.log.append(f"{name}: ×{f:.4f}")
        return v * f

    def alpha_vec(self, d, name):
        out = {}
        for k, v in d.items():
            out[k] = float(v * self.rng.uniform(0.95, 1.05))
        self.log.append(f"{name}: element-wise ×U(0.95,1.05)")
        return out

    def corr(self, R, name):
        R = np.array(R, dtype=float)
        J = self.rng.uniform(-0.03, 0.03, R.shape)
        J = (J + J.T) / 2
        np.fill_diagonal(J, 0.0)
        R = np.clip(R + J, -0.95, 0.95)
        np.fill_diagonal(R, 1.0)
        w, V = np.linalg.eigh(R)
        w = np.clip(w, 1e-6, None)
        R = (V * w) @ V.T
        dd = np.sqrt(np.diag(R))
        R = R / np.outer(dd, dd)
        np.fill_diagonal(R, 1.0)
        self.log.append(f"{name}: off-diag +U(-0.03,0.03), PSD-projected")
        return R

    def widen(self, lo, hi, name):
        span = hi - lo
        self.log.append(f"{name}: band widened 2%")
        return lo - 0.02 * span, hi + 0.02 * span

    @staticmethod
    def coarse_n(n):
        return int(round(n / 10.0) * 10)


# ────────────────────────────────────────────────────────────────────────────
# Main build
# ────────────────────────────────────────────────────────────────────────────

def fit_slic_shape(routing_path, nz):
    """Structural shape of the routing table (counts/histograms/lognormal net) —
    noised like everything else. No code, name, bay number, or per-lane value
    crosses over; only the table's SHAPE."""
    t = json.loads(Path(routing_path).read_text())
    bm = t["bay_map"]
    pd_counts = {}
    bays_hist = {}
    nets = []
    sixchar = dowvar = 0
    for e in bm:
        for pd in str(e.get("pd") or "").split("/"):
            pd = pd.strip()
            if re.fullmatch(r"PD-\d{2}", pd):
                pd_counts[pd] = pd_counts.get(pd, 0) + 1
        bays_hist[len(e.get("bays") or [])] = bays_hist.get(len(e.get("bays") or []), 0) + 1
        cs = e.get("cure_stats") or {}
        if cs.get("avg_net"):
            nets.append(float(cs["avg_net"]))
        if e.get("dest_code_6char"):
            sixchar += 1
        if e.get("dow_variant"):
            dowvar += 1
    counts = [v for k, v in pd_counts.items() if k not in ("PD-13",)]
    logs = [math.log(max(1.0, n)) for n in nets]
    tot_b = sum(bays_hist.values()) or 1
    bays_p = {str(k): round(v / tot_b, 4) for k, v in sorted(bays_hist.items()) if k <= 3}
    # fold the rare >3 tail into 3
    tail = sum(v for k, v in bays_hist.items() if k > 3) / tot_b
    bays_p["3"] = round(bays_p.get("3", 0.0) + tail, 4)
    return {
        "n_entries": Noiser.coarse_n(len(bm)),
        "slics_per_pd_range": [min(counts), max(counts)],
        "bays_per_slic_p": bays_p,
        "net_mu_ln": round(nz.loc(st.mean(logs), "slic.net_mu_ln"), 4),
        "net_sigma_ln": round(nz.scale(st.pstdev(logs), "slic.net_sigma_ln"), 4),
        "sixchar_rate": round(sixchar / len(bm), 3),
        "dow_variant_rate": round(dowvar / len(bm), 3),
        "state_mix": {"regional": 0.85, "longhaul": 0.15},
        "_statement": "table SHAPE only — codes, names, bays, and per-lane values are generated fictionally by slic_synth.py",
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--corpus", type=Path, default=DEFAULT_CORPUS)
    ap.add_argument("--fixtures", type=Path, default=DEFAULT_FIXTURES)
    ap.add_argument("--routing", type=Path,
                    default=REPO / "Post-Sort/outbound-analysis-report/slic_bay_pd_master_v2.1.json")
    ap.add_argument("--noise-seed", type=int, default=7)
    ap.add_argument("--out", type=Path, default=HERE / "calibration.json")
    ap.add_argument("--report", type=Path, default=HERE / "calibration_report.md")
    args = ap.parse_args()

    with open(args.corpus) as fh:
        corpus = json.load(fh)
    recs_all = extract_sorts(corpus)
    # Volume-regime honesty: the corpus spans three operational eras (pre_sls →
    # sls02 → dual_sls). The synthetic hub mirrors the CURRENT regime, so volume-
    # scale fits use the dual_sls era only (matches the tracker's ERA_WEIGHTS
    # where dual_sls = 1.0). Structure fits (copula/phases/shares) also come from
    # the same era for coherence. Falls back to all eras if the era field is thin.
    # Peak-season sorts are excluded for the same reason the production projection
    # excludes them: the synthetic hub models the steady-state regime (peak is a
    # flagged exception, not the distribution).
    meta_of = {d: (corpus["sorts"][d].get("era"), bool(corpus["sorts"][d].get("is_peak")))
               for d in corpus["sorts"]}
    recs = [r for r in recs_all
            if meta_of.get(r["date"], (None, True)) == ("dual_sls", False)]
    if len(recs) < 100:
        recs = recs_all
    n_all = len(recs)
    n_sor = sum(1 for r in recs if r["sor"])
    print(f"extracted {len(recs_all)} usable sorts; fitting on {n_all} "
          f"current-era steady-state (dual_sls, non-peak) sorts ({n_sor} with sort-ops detail)")

    nz = Noiser(args.noise_seed)

    # ── core (sort_generator-compatible) ──
    volp = fit_lognormal_by_dow(recs)
    volume_params = {}
    for d, p in volp.items():
        volume_params[d] = {"mu_ln": round(nz.loc(p["mu_ln"], f"vol.mu_ln[{d}]"), 5),
                            "sigma_ln": round(nz.scale(p["sigma_ln"], f"vol.sigma_ln[{d}]"), 5)}

    worked_params = {}
    for d in range(5):
        ws = _stats([r["sor"]["worked_a"] for r in recs if r["sor"] and r["dow"] == d])
        allw = _stats([r["sor"]["worked_a"] for r in recs if r["sor"]])
        base = ws if (ws and ws["n"] >= 4) else allw
        worked_params[str(d)] = {
            "mean": round(nz.loc(base["mean"], f"worked.mean[{d}]"), 2),
            "std": round(nz.scale(max(base["std"], 4.0), f"worked.std[{d}]"), 2),
            "min": round(base["min"] * 0.95, 1), "max": round(base["max"] * 1.05, 1)}

    pdst = _stats([r["sor"]["paid_day_a"] for r in recs if r["sor"]])
    lo, hi = nz.widen(pdst["min"], pdst["max"], "paid_day.range")
    paid_day_params = {"mean": round(nz.loc(pdst["mean"], "paid_day.mean"), 4),
                       "std": round(nz.scale(max(pdst["std"], 0.03), "paid_day.std"), 4),
                       "min": round(lo, 3), "max": round(hi, 3)}

    copula = nz.corr(fit_copula(recs), "copula_r")

    vecs, vecs_by_dow = build_share_vectors(recs)
    alpha_base = nz.alpha_vec(fit_dirichlet_mom(vecs), "dirichlet_alpha")
    alpha_by_dow = {}
    for d in range(5):
        if len(vecs_by_dow[d]) >= 4:
            alpha_by_dow[str(d)] = nz.alpha_vec(fit_dirichlet_mom(vecs_by_dow[d]),
                                                f"dirichlet_alpha[{d}]")

    pph_target_by_dow, pph_sd, pph_band = {}, {}, {}
    for d in range(5):
        planned = [r["sor"]["pph_p"] for r in recs if r["sor"] and r["sor"]["pph_p"] and r["dow"] == d]
        allp = [r["sor"]["pph_p"] for r in recs if r["sor"] and r["sor"]["pph_p"]]
        arr = planned if len(planned) >= 4 else allp
        arr = [p for p in arr if 80 <= p <= 200]
        mu = nz.loc(st.mean(arr), f"pph_target[{d}]")
        sd = nz.scale(max(st.pstdev(arr), 0.5), f"pph_target_sd[{d}]")
        s_arr = sorted(arr)
        blo = s_arr[max(0, int(0.025 * len(s_arr)) - 1)]
        bhi = s_arr[min(len(s_arr) - 1, int(0.975 * len(s_arr)))]
        blo, bhi = nz.widen(blo, bhi, f"pph_band[{d}]")
        pph_target_by_dow[str(d)] = round(mu, 2)
        pph_sd[str(d)] = round(sd, 3)
        pph_band[str(d)] = [round(blo, 1), round(bhi, 1)]

    perf = fit_performance(recs)
    perf_out = {
        "p_bad_by_dow": {k: round(min(0.5, v), 4) for k, v in perf["p_bad_by_dow"].items()},
        "typical_skew_alpha": round(perf["typical_skew_alpha"], 4),
        "typical_loc": round(nz.loc(perf["typical_loc"], "perf.loc"), 5),
        "typical_scale": round(nz.scale(perf["typical_scale"], "perf.scale"), 5),
        "typical_min": round(perf["typical_min"] * 0.99, 4),
        "typical_max": round(perf["typical_max"] * 1.01, 4),
        "bad_mean": round(nz.loc(perf["bad_mean"], "perf.bad_mean"), 4),
        "bad_std": round(nz.scale(max(perf["bad_std"], 0.005), "perf.bad_std"), 4),
        "bad_min": round(perf["bad_min"] * 0.99, 4),
        "bad_max": round(perf["bad_max"], 4),
    }

    spans = [r["sor"]["span_a"] for r in recs if r["sor"] and r["sor"]["span_a"]]
    span_mode = st.mode([round(s * 4) / 4 for s in spans]) if spans else 3.5
    exc = [s for s in spans if abs(s - span_mode) > 0.13]
    sort_span = {
        "sort_span_fixed": float(span_mode),
        "sort_span_exc_p": round(len(exc) / max(1, len(spans)), 4),
        "sort_span_exc_lo": round(min(exc) if exc else span_mode - 0.5, 2),
        "sort_span_exc_hi": round(max(exc) if exc else span_mode + 0.5, 2),
    }

    phase_alpha, phase_floor, n_phase = fit_phases(recs)
    phase_alpha = [round(a * float(nz.rng.uniform(0.95, 1.05)), 3) for a in phase_alpha]
    spikes = fit_spikes(recs)

    dfr = _stats([r["sor"]["direct_a"] / r["sor"]["hours_a"] for r in recs
                  if r["sor"] and r["sor"]["direct_a"] and r["sor"]["hours_a"]])
    direct_hour_frac = round(nz.loc(dfr["mean"], "direct_hour_frac"), 4)

    # loader-level scan PPH (fixtures; documented fallback)
    loader_pphs = extract_loader_pph(args.fixtures) if args.fixtures.exists() else []
    if len(loader_pphs) >= 50:
        arr = sorted(loader_pphs)
        loader_mu = nz.loc(st.median(arr), "loader_pph_mu")
        lbr = arr[int(0.90 * len(arr))]
        lmx = arr[min(len(arr) - 1, int(0.99 * len(arr)))]
        loader_src = f"fitted from {Noiser.coarse_n(len(arr))} loader-rows (live fixtures)"
    else:
        loader_mu, lbr, lmx = 380.0, 520.0, 700.0
        loader_src = "default (fixtures absent) — documented heuristic"
    loader = {"loader_pph_mu": round(loader_mu, 1),
              "lbr_threshold": round(lbr, 1),
              "loader_pph_max": round(lmx, 1),
              "u_t_cap": 0.85, "_source": loader_src}

    # ── emitter sections (v2) ──
    roster_ns = [r["roster_n"] for r in recs if r["roster_n"]]
    ftpts = [r["roster_ftpt"] for r in recs if r["roster_ftpt"] is not None]
    outsh = [r["roster_outbound_share"] for r in recs if r["roster_outbound_share"]]
    roster = {
        "size_mean": round(nz.loc(st.mean(roster_ns), "roster.size_mean"), 1),
        "size_sd": round(nz.scale(st.pstdev(roster_ns), "roster.size_sd"), 1),
        "size_min": int(min(roster_ns) * 0.95), "size_max": int(max(roster_ns) * 1.05),
        "ft_share": round(nz.loc(st.mean(ftpts), "roster.ft_share"), 3) if ftpts else 0.35,
        "outbound_share": round(nz.loc(st.mean(outsh), "roster.outbound_share"), 3) if outsh else 0.40,
        "_n_sorts": Noiser.coarse_n(len(roster_ns)),
    }

    # ID taxonomy: FORMATS observed in production; VALUES/ranges fictional by construction.
    id_taxonomy = {
        "_statement": ("Formats mirror the documented production taxonomy; every value/range "
                       "below is fictional by construction — no real ID or real block boundary "
                       "is published. The human block was chosen from a zero-occupancy gap in "
                       "the observed ID space (verified private-side), so real/synthetic "
                       "collision is structurally impossible, not just improbable."),
        "human_id": {"format": "7digit", "block": [2200000, 3099999]},
        "scan_id": {"format": "AAA#######", "note": "3 letters from fictional roster initials + 7 digits"},
        "machine_blocks": {"format": "sequential-numeric", "blocks": [[9900001, 9900060]]},
        "sls_bins": {"prefix": "SLS", "range": [1, 40]},
        "dummy_stubs": {"values": ["00000"], "five_digit_block": [10000, 10999]},
    }

    # Anomaly rates: NOT corpus-fit — set from the documented production failure modes
    # (SPEC v2 §3.1 provenance table); the packet's trap toggles consume these.
    anomaly_rates = {
        "_statement": "Set from documented production failure modes (trap provenance), not fitted from the corpus.",
        "scan_gt_reported_p": 0.10,
        "id_substitution_per_sort": 1,
        "shared_scanner_pairs_per_sort": 1,
        "unresolvable_per_sort": 2,
        "dummy_row_rate": 0.02,
    }

    gaps, firsts = extract_pull_cadence(args.fixtures) if args.fixtures.exists() else ([], [])
    if gaps:
        pull_cadence = {
            "gap_mean_min": round(nz.loc(st.mean(gaps), "pull.gap_mean"), 2),
            "gap_sd_min": round(nz.scale(max(st.pstdev(gaps), 0.2), "pull.gap_sd"), 2),
            "first_pull_offset_min": round(st.mean(firsts), 1) if firsts else 37.0,
            "_n_gaps": Noiser.coarse_n(len(gaps)),
        }
    else:
        pull_cadence = {"gap_mean_min": 10.1, "gap_sd_min": 1.2,
                        "first_pull_offset_min": 37.0, "_source": "default"}

    # DOW bands for INTEL_PROJ-style emission
    dow_bands = {}
    for d in range(5):
        vols = sorted(r["vol"] for r in recs if r["dow"] == d)
        med = st.median(vols)
        p25 = vols[int(0.25 * len(vols))]
        p75 = vols[int(0.75 * len(vols))]
        dow_bands[DOW_LABELS[d]] = {
            "median": int(nz.loc(med, f"dow_band.median[{d}]")),
            "p25": int(nz.loc(p25, f"dow_band.p25[{d}]")),
            "p75": int(nz.loc(p75, f"dow_band.p75[{d}]")),
            "n": Noiser.coarse_n(len(vols)),
        }

    payload = {
        "corpus_meta": {},  # filled after hashing below
        "volume_params": volume_params,
        "worked_params": worked_params,
        "paid_day_params": paid_day_params,
        "copula_r": [[round(float(x), 5) for x in row] for row in copula],
        "dest_order": DEST_ORDER,
        "dirichlet_alpha": {k: round(v, 4) for k, v in alpha_base.items()},
        "dirichlet_alpha_by_dow": {d: {k: round(v, 4) for k, v in a.items()}
                                   for d, a in alpha_by_dow.items()},
        "pph_target_by_dow": pph_target_by_dow,
        "pph_target_sd_by_dow": pph_sd,
        "pph_target_band_by_dow": pph_band,
        "pph_target_jitter": 0.3,
        "worked_noise_cv": 0.02,
        "performance": perf_out,
        **sort_span,
        "phase_alpha": phase_alpha,
        "phase_floor_p3": round(phase_floor, 4),
        **{k: v for k, v in spikes.items() if not k.startswith("_")},
        "direct_hour_frac": direct_hour_frac,
        **{k: v for k, v in loader.items() if not k.startswith("_")},
        "smalls_pcs_per_bag_mu": 11.5, "smalls_pcs_per_bag_sigma": 1.5,
        "smalls_pcs_per_bag_min": 8.0, "smalls_pcs_per_bag_max": 16.0,
        "roster": roster,
        "id_taxonomy": id_taxonomy,
        "anomaly_rates": anomaly_rates,
        "pull_cadence": pull_cadence,
        "building_volume_dow_bands": dow_bands,
        "slic_shape": (fit_slic_shape(args.routing, nz) if args.routing.exists()
                       else {"_source": "routing table absent — slic_synth falls back to built-in shape"}),
        "_noise": {
            "seed": args.noise_seed,
            "method": ("means/medians ×U(0.97,1.03); sds ×U(0.95,1.10); dirichlet alphas "
                       "×U(0.95,1.05); correlations +U(-0.03,0.03) PSD-projected; bands "
                       "widened 2%; counts rounded to 10s; ID ranges never published "
                       "(fictional blocks); anomaly rates from documented failure modes, "
                       "not fitted"),
            "fields_touched": len(nz.log),
        },
        "_provenance": {
            "generator": "synth-hub-generator/calibration/build_calibration.py",
            "built": datetime.now().isoformat(timespec="seconds"),
            "inputs": "private sort corpus (aggregates only) + live-pull fixtures (cadence/loader-level rates)",
            "loader_pph_source": loader["_source"],
            "n_sorts_with_sor_detail": Noiser.coarse_n(n_sor),
            "n_sorts_with_phase_series": Noiser.coarse_n(n_phase),
        },
    }
    body = json.dumps(payload, sort_keys=True).encode()
    payload["corpus_meta"] = {
        "sha256_concat": hashlib.sha256(body).hexdigest(),
        "n_sor_sorts": Noiser.coarse_n(n_all),
        "note": "sha is of this calibration payload (self-describing); n coarse-rounded",
    }

    args.out.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {args.out} ({args.out.stat().st_size:,} bytes)")

    report = [
        "# calibration.json — fit report",
        f"**Built:** {date.today().isoformat()} · **Noise seed:** {args.noise_seed}",
        "",
        f"Fitted from {n_all} usable sorts ({n_sor} with sort-ops planning detail, "
        f"{n_phase} with intra-sort volume series). Published values are noised "
        "per the method in `_noise` — this report records WHAT was fitted, never raw values.",
        "",
        "| Section | Source | n |",
        "|---|---|---|",
        f"| volume_params (lognormal/DOW) | building-volume finals | {n_all} |",
        f"| worked / paid_day / copula | sort-ops report summary actuals | {n_sor} |",
        f"| dirichlet_alpha (+by-DOW) | sort-ops report area-row belt shares | {len(vecs)} |",
        f"| pph_target (+sd/band) / performance | sort-ops report planned vs actual PPH | {perf['_n']} |",
        f"| phase_alpha / floor | 15-min cumulative series | {n_phase} |",
        f"| spikes | 15-min increment outliers (coarse heuristic) | {spikes['_n_sorts']} |",
        f"| loader PPH | {loader['_source']} | — |",
        f"| roster dists | sort-ops report staffing rosters | {roster['_n_sorts']} |",
        "| id_taxonomy | formats only; values fictional by construction | — |",
        "| anomaly_rates | documented failure modes (SPEC §3.1), not fitted | — |",
        f"| pull_cadence | live-pull filename timestamps | {pull_cadence.get('_n_gaps', 0)} gaps |",
        "",
        "Defaults (not derivable from the corpus, documented): smalls pieces-per-bag, "
        "worked_noise_cv, pph_target_jitter, spike gamma shape, residual dest split "
        f"{RESIDUAL_SPLIT}.",
    ]
    args.report.write_text("\n".join(report) + "\n")
    print(f"wrote {args.report}")


if __name__ == "__main__":
    main()

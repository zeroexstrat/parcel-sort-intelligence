#!/usr/bin/env python3
"""
emit_hub_corpus.py — WS3.5: the HII demo-mode emitter (SPEC v2 §6).

Consumes calibration.json + the NGATE world (profile, SLIC table, roster) and
emits everything tracker demo mode needs, into dist/ngate-demo/:

  intel_proj.northgate.json    synthetic projection corpus, same schema as the
                               tracker's embedded INTEL_PROJ
  history_seed.northgate.json  N past NGATE sorts (History-tab seed)
  replay/                      ONE NGATE sort as a timed live-pull sequence:
                               ngate_hub_summary_*.csv, ngate_employee_summary_*.csv,
                               ngate_spr_SPR_Header/Operations_*.csv at the
                               calibrated ~10-min cadence, formats byte-faithful
                               to the production live feed (BOM, header spellings,
                               M/D/YYYY hh:mm:ss AM/PM timestamps, RowType, the
                               sort-ops aggregate-only live shape)
  replay/manifest.json         pull sequence + timing for the demo player

WS4b adds the demo-mode bundle packager: the replay dir is wrapped into ONE
self-contained JS file (window.DEMO_REPLAY, DEMO_MODE_DESIGN.md contract) the
tracker loads via <script src> — file://-safe, no fetch. Packing reads the
committed dist, so it is corpus-free and stdlib-only:

    ./.venv/bin/python synth-hub-generator/emit_hub_corpus.py --pack-bundle

The sort skeleton (volume, belt shares, staffing, performance) comes from the
existing Monte Carlo engine (vendor sort_generator, calibration-driven); this
script adds the intra-sort time dimension (phase-shaped cumulative curves
sampled at pull times) and the export-file dressing.

Full generation is a home-machine tool (numpy/scipy via the [generator]
extra). Deterministic under --seed.

    ./.venv/bin/python synth-hub-generator/emit_hub_corpus.py --seed 17
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import math
import random
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
sys.path.insert(0, str(REPO / "vendor/ai_memory/simulation"))

CALIB = HERE / "calibration/calibration.json"
PROFILE = HERE / "world/hub_profile.northgate.json"
SLIC_TABLE = HERE / "world/slic_table.northgate.json"
ROSTER = HERE / "world/roster.northgate.json"
DIST = HERE / "dist/ngate-demo"

DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"]
PD_KEYS = [f"PD-{i}" for i in range(1, 13)]           # sort_generator dest naming
BELTS = [f"PD-{i:02d}" for i in range(1, 13)]          # export belt naming
OTHER_BELTS = ["SLS01", "SLS02", "SS", "AIRSORT", "AF02BLU", "SSAIR01", "DWSSCAN"]

HUB_HEADER = ["Belt", "LooseOutbound", "LooseInbound", "ULDsInbound", "InBuilding",
              "BagsCreated", "BagsLinked", "PackagesInLinkedBags", "MissedBags",
              "PackagesInMissedBags", "BypassBagsLinked", "ZeroPieceBagsLinked",
              "GrossVolume", "PreloadBagsNotLinked", "HoldoverBagsLinked",
              "HoldoverBagsCreated"]
EMP_HEADER = ["User", "Belt", "TotalPackages", "InboundVolume", "OutboundVolume",
              "KeyedPackages", "KeyedBags", "BagsCreated", "BagsLinked",
              "PackagesInMissedBags", "FirstScanTimestamp", "LastScanTimestamp",
              "TotalScanHours", "ScanPPH", "RowType"]


def ts_ampm(dt):
    """M/D/YYYY hh:mm:ss AM/PM — the production live-CSV timestamp format."""
    return dt.strftime("%m/%d/%Y %I:%M:%S %p").lstrip("0").replace("/0", "/", 1)


def phase_progress(t_dec, phases, start=18.0, p1_end=19.0, p2_end=21.0, end=21.5):
    """Cumulative volume fraction at decimal hour t, piecewise-linear over the
    calibrated phase fractions (p1: 18–19, p2: 19–21, p3: 21–end)."""
    p1, p2, p3 = phases
    if t_dec <= start:
        return 0.0
    if t_dec >= end:
        return 1.0
    if t_dec <= p1_end:
        return p1 * (t_dec - start) / (p1_end - start)
    if t_dec <= p2_end:
        return p1 + p2 * (t_dec - p1_end) / (p2_end - p1_end)
    return p1 + p2 + p3 * (t_dec - p2_end) / (end - p2_end)


def write_csv(path, header, rows):
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\r\n")
    w.writerow(header)
    w.writerows(rows)
    path.write_text("﻿" + buf.getvalue(), encoding="utf-8")


# ────────────────────────────────────────────────────────────────────────────
# INTEL_PROJ emission
# ────────────────────────────────────────────────────────────────────────────

def emit_intel_proj(cal, profile, rng, sort_rows):
    """Same schema as the tracker's embedded INTEL_PROJ, values synthetic."""
    pd_fraction = round(profile["metric_contract"]["structural_constants"]["rho_pd_hub"]["value"]
                        * rng.uniform(1.0, 1.06), 4)   # scan-net PD units run slightly above ρ
    bands = cal["building_volume_dow_bands"]
    by_dow = {}
    for di, dlab in enumerate(DOW_LABELS):
        rows = [r for r in sort_rows if r["dow"] == di]
        belt_stats = {}
        shares = {}
        for pk in PD_KEYS:
            vols = sorted(r[f'vol_{pk.replace("PD-", "pd")}'] for r in rows)
            pd_tot = [sum(r[f"vol_pd{i}"] for i in range(1, 13)) for r in rows]
            share = (sum(vols) / sum(pd_tot)) if sum(pd_tot) else 1 / 12
            shares[pk] = share
        s_tot = sum(shares.values())
        for pk in PD_KEYS:
            vols = sorted(r[f'vol_{pk.replace("PD-", "pd")}'] for r in rows)
            n = len(vols)
            med = vols[n // 2]
            p25v, p75v = vols[max(0, n // 4)], vols[min(n - 1, (3 * n) // 4)]
            pph_mean = rng.uniform(155, 215)
            belt_stats[pk.replace("PD-", "PD").replace("-", "")] = {
                "n_level": bands[dlab]["n"], "n_belt": rng.randint(2, 4),
                "volume": {"median": int(med), "p25": int(p25v), "p75": int(p75v)},
                "paid_hours_target": {"lean_at_plan230": round(med / 230, 1),
                                      "rich_at_plan190": round(med / 190, 1)},
                "observed_belt_pph": {"mean": round(pph_mean, 1),
                                      "min": round(pph_mean * rng.uniform(0.82, 0.92), 1),
                                      "max": round(pph_mean * rng.uniform(1.08, 1.2), 1)},
                "belt_share": round(shares[pk] / s_tot, 4),
            }
        by_dow[dlab] = belt_stats
    return {
        "meta": {
            "version": "ngate-0.1-synthetic",
            "built": date.today().isoformat(),
            "method": "belt_vol = building_volume_DOW_band x PD_FRACTION x belt_share_DOW; "
                      "all values generated from noised calibration aggregates (synthetic hub).",
            "sources": {
                "building_volume": "synth-hub-generator calibration (noised DOW bands)",
                "per_belt_share_and_PPH": "calibrated Dirichlet belt shares; synthetic PPH bands",
                "pd_fraction": {"value": pd_fraction,
                                "basis": "NGATE synthetic contract rho_pd_hub, jittered",
                                "note": "converts building volume to PD units"},
            },
            "plan_pph_band": [190, 230],
            "shrinkage_K": 2.0,
            "staffing_model": "PAID-DAY = projected_volume / plan_PPH; band = DOW volume band scaled to belt.",
            "note": "SYNTHETIC (NORTHGATE). Generated by emit_hub_corpus.py — no production values.",
        },
        "building_volume_DOW": {d: dict(bands[d]) for d in DOW_LABELS},
        "DOW": by_dow,
    }


# ────────────────────────────────────────────────────────────────────────────
# Replay bundle
# ────────────────────────────────────────────────────────────────────────────

def build_staffing(rng, roster, skel, belt_vols):
    """Assign outbound loaders to belts from the skeleton's zone staffing —
    weighted by belt volume, like a coordinator staffs to the flow — plus
    smalls bins, air loaders, and a DWS scanner."""
    humans = [e for e in roster["employees"]]
    rng.shuffle(humans)
    it = iter(humans)
    belt_loaders = {}
    zone_belts = {"z1": BELTS[0:4], "z2": BELTS[4:8], "z3": BELTS[8:12]}
    for zk, belts in zone_belts.items():
        n = max(4, skel[f"loaders_{zk}"])
        zv = sum(belt_vols[b] for b in belts) or 1
        per = {b: max(1, round(n * belt_vols[b] / zv)) for b in belts}
        # keep the zone total honest after rounding
        while sum(per.values()) > n:
            per[max(per, key=per.get)] -= 1
        for b in belts:
            belt_loaders[b] = [next(it) for _ in range(per[b])]
    air = [next(it) for _ in range(rng.randint(3, 5))]
    dws = [next(it)]
    return belt_loaders, air, dws


def emit_replay(cal, profile, roster, skel, sortdate, seed, out_dir):
    rng = random.Random(seed * 31 + 5)
    out_dir.mkdir(parents=True, exist_ok=True)
    prefix = profile["identity"]["file_prefix"]
    phases = (skel["p1_frac"], skel["p2_frac"], skel["p3_frac"])
    span_end = 18.0 + skel["sort_span"]

    # pull schedule from the calibrated cadence
    cad = cal["pull_cadence"]
    t = 18.0 + max(4.0, rng.gauss(cad["first_pull_offset_min"], 4.0)) / 60.0
    pulls = []
    while t < span_end + 0.25:
        pulls.append(round(t, 4))
        t += max(4.0, rng.gauss(cad["gap_mean_min"], cad["gap_sd_min"])) / 60.0

    # The skeleton's PD volumes are sort-ops-gross basis (that's what the calibration
    # measured). The live hub summary is the scan-net view, which must cohere
    # with the profile's own structural contract: Σ(PD net) = ρ × building and
    # zone-3/PD = κ(DOW) — otherwise the tracker's κ-engine would flag the
    # synthetic hub as anomalous every day. Rescale zone sums to the contract,
    # preserving the skeleton's within-zone belt mix.
    sc = profile["metric_contract"]["structural_constants"]
    rho_t = sc["rho_pd_hub"]["value"]
    dow_name = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][
        datetime.strptime(sortdate, "%Y-%m-%d").weekday()]
    kappa_t = sc["kappa_dow_steady"].get(dow_name, 0.385)
    pd_net_target = rho_t * skel["total_volume"]
    raw = {BELTS[i - 1]: max(1.0, float(skel[f"vol_pd{i}"])) for i in range(1, 13)}
    z1_raw = sum(raw[b] for b in BELTS[0:4])
    z2_raw = sum(raw[b] for b in BELTS[4:8])
    z3_raw = sum(raw[b] for b in BELTS[8:12])
    z3_tgt = kappa_t * pd_net_target
    rem = pd_net_target - z3_tgt
    z1_tgt = rem * z1_raw / max(1.0, z1_raw + z2_raw)
    z2_tgt = rem - z1_tgt
    belt_vols = {}
    for belts_z, z_raw, z_tgt in ((BELTS[0:4], z1_raw, z1_tgt),
                                  (BELTS[4:8], z2_raw, z2_tgt),
                                  (BELTS[8:12], z3_raw, z3_tgt)):
        for b in belts_z:
            belt_vols[b] = int(z_tgt * raw[b] / z_raw)
    smalls_total = skel["vol_smalls"]
    air_total = skel["vol_airsort"]
    belt_loaders, air_crew, dws_crew = build_staffing(rng, roster, skel, belt_vols)
    # per-belt curve jitter so belts don't move in lockstep
    belt_jitter = {b: rng.uniform(0.92, 1.08) for b in BELTS}
    # loader start offsets (minutes after 18:00) and weights within their belt
    loader_meta = {}
    for b, crew in belt_loaders.items():
        weights = [rng.uniform(0.7, 1.3) for _ in crew]
        wsum = sum(weights)
        for e, w in zip(crew, weights):
            loader_meta[e["employee_id"]] = {
                "belt": b, "share": w / wsum,
                "start_min": max(0, rng.gauss(6, 4)),
                "util": rng.uniform(0.78, 0.92),
            }
    d0 = datetime.strptime(sortdate, "%Y-%m-%d")
    manifest = []

    worked = skel["worked"]
    total_hours = skel["total_hours"]
    ops_rows_static = [("Sort", 1.0), ("Outbound", 0.42), ("Smalls", 0.22),
                       ("Primary", 0.18), ("Air", 0.08), ("Inbound", 0.10)]

    for t_dec in pulls:
        frac = phase_progress(t_dec, phases, end=span_end)
        now = d0 + timedelta(hours=t_dec)
        stamp = now.strftime("%H%M%S")
        mdY = f"{d0.month}-{d0.day}-{d0.year}"
        iso = d0.strftime("%Y-%m-%d")

        # ── hub summary ──
        hub_rows = []
        for b in BELTS:
            prog = min(1.0, frac * belt_jitter[b])
            loose = int(belt_vols[b] * prog * 0.93)
            bags = int(belt_vols[b] * prog * 0.07)
            gross = int((loose + bags) * 1.08)
            hub_rows.append([b, loose, 0, 0, rng.randint(0, 3), 0, bags, 0, 0, 0,
                             int(bags * 0.12), 0, gross, 0, 0, 0])
        smalls_prog = int(smalls_total * min(1.0, frac * rng.uniform(0.95, 1.05)))
        hub_rows.append(["SLS01", int(smalls_prog * 0.45), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, int(smalls_prog * 0.45), 0, 0, 0])
        hub_rows.append(["SLS02", int(smalls_prog * 0.42), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, int(smalls_prog * 0.42), 0, 0, 0])
        hub_rows.append(["SS", int(smalls_prog * 0.13), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, int(smalls_prog * 0.13), 0, 0, 0])
        air_prog = int(air_total * min(1.0, frac * 1.1))
        hub_rows.append(["AIRSORT", int(air_prog * 0.7), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, int(air_prog * 0.7), 0, 0, 0])
        hub_rows.append(["AF02BLU", int(air_prog * 0.2), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, int(air_prog * 0.2), 0, 0, 0])
        hub_rows.append(["SSAIR01", int(air_prog * 0.1), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, int(air_prog * 0.1), 0, 0, 0])
        hub_rows.append(["DWSSCAN", 0, int(skel["total_volume"] * 0.12 * frac), 0, 0, 0, 0, 0, 0, 0, 0, 0, int(skel["total_volume"] * 0.12 * frac), 0, 0, 0])
        hub_name = f"{prefix}_hub_summary_{mdY}_{iso}_{stamp}.csv"
        write_csv(out_dir / hub_name, HUB_HEADER, hub_rows)

        # ── employee summary ──
        emp_rows = []
        for b in BELTS:
            prog = min(1.0, frac * belt_jitter[b])
            belt_pkgs = int(belt_vols[b] * prog)
            for e in belt_loaders[b]:
                m = loader_meta[e["employee_id"]]
                first = d0 + timedelta(hours=18.0, minutes=m["start_min"])
                if now <= first:
                    continue
                hours = (now - first).total_seconds() / 3600 * m["util"]
                pkgs = int(belt_pkgs * m["share"])
                pph = int(pkgs / hours) if hours > 0.05 else 0
                emp_rows.append([e["employee_id"], b, pkgs, 0, pkgs, 0, 0, 0, 0, 0,
                                 ts_ampm(first), ts_ampm(now), round(hours, 2), pph, "single"])
        # smalls bins appear as SLS-prefixed Users (taxonomy)
        for i, bin_id in enumerate(roster["sls_bins"][:8]):
            pkgs = int(smalls_prog * 0.08 * rng.uniform(0.6, 1.4))
            first = d0 + timedelta(hours=18.1)
            emp_rows.append([bin_id, "SLS01" if i % 2 == 0 else "SLS02", pkgs, 0, pkgs,
                             0, 0, 0, 0, 0, ts_ampm(first), ts_ampm(now),
                             round((now - first).total_seconds() / 3600, 2),
                             int(pkgs / max(0.1, (now - first).total_seconds() / 3600)), "single"])
        for e in air_crew:
            first = d0 + timedelta(hours=17.9, minutes=rng.uniform(0, 10))
            if now <= first:
                continue
            hours = (now - first).total_seconds() / 3600 * 0.8
            pkgs = int(air_prog / len(air_crew))
            emp_rows.append([e["employee_id"], "AIRSORT", pkgs, 0, pkgs, 0, 0, 0, 0, 0,
                             ts_ampm(first), ts_ampm(now), round(hours, 2),
                             int(pkgs / max(0.05, hours)), "single"])
        for e in dws_crew:
            first = d0 + timedelta(hours=18.0)
            pkgs = int(skel["total_volume"] * 0.12 * frac)
            hours = (now - first).total_seconds() / 3600 * 0.9
            emp_rows.append([e["employee_id"], "DWSSCAN", pkgs, pkgs, 0, 0, 0, 0, 0, 0,
                             ts_ampm(first), ts_ampm(now), round(max(0.01, hours), 2),
                             int(pkgs / max(0.05, hours)), "single"])
        emp_name = f"{prefix}_employee_summary_{mdY}_{iso}_{stamp}.csv"
        write_csv(out_dir / emp_name, EMP_HEADER, emp_rows)

        # ── sort-ops header + operations (live shape: aggregate only, no OUT- doors) ──
        vol_now = int(skel["total_volume"] * frac)
        hours_now = round(total_hours * frac, 2)
        hdr = [("PlannedSortStart", "18:00"), ("ActualSortStart", "18:00"),
               ("PlannedSortDown", f"{int(span_end)}:{int((span_end % 1) * 60):02d}"),
               ("ActualSortDown", ""),
               ("PlannedSortSpan", round(skel["sort_span"], 2)),
               ("ActualSortSpan", round(max(0.0, t_dec - 18.0), 2)),
               ("PlannedVolume", int(skel["total_volume"] * 0.97)),
               ("ActualVolume", vol_now),
               ("PlannedHours", round(skel["total_hours_planned"], 2)),
               ("ActualHours", hours_now),
               ("PlannedPaidDay", round(skel["paid_day"], 2)),
               ("ActualPaidDay", round(skel["paid_day"] * rng.uniform(0.97, 1.03), 2)),
               ("PlannedWorked", worked), ("ActualWorked", worked),
               ("ActualPackagesPerHour", 0)]
        sor_h = f"{prefix}_spr_SPR_Header_{iso}_{stamp}.csv"
        write_csv(out_dir / sor_h, ["Metric", "Value"], hdr)

        ops_rows = []
        for op, share in ops_rows_static:
            nv = int(vol_now * share)
            hrs = round(hours_now * share, 2)
            staff = int(worked * share)
            pph = round(nv / hrs, 2) if hrs > 0 else 0
            # the production export annotates computed cells: "<value> <a> / <b> = <value4>"
            pph_cell = f"{pph} {nv} / {hrs} = {pph:.4f}" if hrs > 0 else "0"
            ops_rows.append([op, f"{nv:,}", f"{int(nv*1.05):,}", f"{int(nv*1.3):,}",
                             f"{int(nv*1.15):,}", f"{int(nv*1.2):,}",
                             pph_cell, round(pph * 1.05, 2), round(pph * 0.98, 2),
                             round(pph * 1.02, 2), f"{staff}", hrs, round(hrs * 1.03, 2)])
        sor_o = f"{prefix}_spr_SPR_Operations_{iso}_{stamp}.csv"
        write_csv(out_dir / sor_o,
                  ["Operation", "ActualNetVolume", "PlannedNetVolume", "ScannedVolume",
                   "ActualGrossVolume", "PlannedGrossVolume", "ActualNetPackagesPerHour",
                   "PlannedNetPackagesPerHour", "ActualPackagesPerHour",
                   "PlannedPackagesPerHour", "ActualStaffing", "ActualHours", "PlannedHours"],
                  ops_rows)

        manifest.append({"t_dec": t_dec, "clock": now.strftime("%H:%M:%S"),
                         "files": [hub_name, emp_name, sor_h, sor_o]})

    (out_dir / "manifest.json").write_text(json.dumps({
        "world": "NORTHGATE / NGATE", "sort_date": sortdate,
        "sort_code": profile["sort_profile"]["sort_code"],
        "skeleton": {k: skel[k] for k in ("total_volume", "worked", "paid_day",
                                          "pph_sor", "sort_span", "is_bad_day")},
        "pulls": manifest,
    }, indent=2) + "\n")
    return len(pulls)


# ────────────────────────────────────────────────────────────────────────────
# Demo-mode replay bundle (WS4b) — DEMO_MODE_DESIGN.md contract
# ────────────────────────────────────────────────────────────────────────────

BUNDLE_OUT = REPO / "Live-Sort/demo/ngate_replay_bundle.js"


def pack_replay_bundle(replay_dir, profile):
    """Wrap an emitted replay dir (manifest + live CSVs) into the demo-mode JS
    bundle: window.DEMO_REPLAY = {hub, label, sortDate, generated, pulls}.
    Pulls stay flat and manifest-ordered ({name, csv} per file); the tracker
    groups them by pull bucket from the filename HHMMSS, exactly as it does
    for the real feed. Reads only the committed dist — corpus-free, stdlib-
    only, deterministic (no wall-clock in the payload)."""
    replay_dir = Path(replay_dir)
    manifest = json.loads((replay_dir / "manifest.json").read_text())
    payload = {
        "hub": profile["identity"]["hub_code"],
        "label": f'{profile["identity"]["site"]} — synthetic replay',
        "sortDate": manifest["sort_date"],
        "generated": "emit_hub_corpus.py pack-bundle (WS4b)",
        "pulls": [
            # read_bytes, not read_text: universal-newline translation would
            # rewrite the production \r\n endings and break byte-faithfulness
            {"name": fname,
             "csv": (replay_dir / fname).read_bytes().decode("utf-8")}
            for pull in manifest["pulls"] for fname in pull["files"]
        ],
    }
    return ("// generated by emit_hub_corpus.py — do not hand-edit "
            "(WS4b demo-mode replay bundle; DEMO_MODE_DESIGN.md contract)\n"
            "window.DEMO_REPLAY = " + json.dumps(payload) + ";\n")


def write_replay_bundle(replay_dir, bundle_out):
    profile = json.loads(PROFILE.read_text())
    bundle_out = Path(bundle_out)
    bundle_out.parent.mkdir(parents=True, exist_ok=True)
    js = pack_replay_bundle(replay_dir, profile)
    bundle_out.write_text(js, encoding="utf-8")
    return len(js.encode("utf-8"))


# ────────────────────────────────────────────────────────────────────────────
# Main
# ────────────────────────────────────────────────────────────────────────────

def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=17)
    ap.add_argument("--sortdate", default="2026-06-17")   # a Wednesday
    ap.add_argument("--history-n", type=int, default=40)
    ap.add_argument("--out", type=Path, default=DIST)
    ap.add_argument("--pack-bundle", action="store_true",
                    help="only wrap <out>/replay into the demo JS bundle "
                         "(no generation, no numpy — works from the committed dist)")
    ap.add_argument("--bundle-out", type=Path, default=BUNDLE_OUT)
    args = ap.parse_args(argv)

    if args.pack_bundle:
        n = write_replay_bundle(args.out / "replay", args.bundle_out)
        print(f"emit_hub_corpus: replay bundle → {args.bundle_out} ({n/1024:.0f} KB)")
        return 0

    import numpy as np
    from sort_generator import load_calibration, generate_one_sort

    cal = json.loads(CALIB.read_text())
    profile = json.loads(PROFILE.read_text())
    roster = json.loads(ROSTER.read_text())
    p = load_calibration(str(CALIB))

    rng_np = np.random.default_rng(args.seed)
    rng = random.Random(args.seed)
    args.out.mkdir(parents=True, exist_ok=True)

    # history seeds: N sorts on business days ending the day before the replay
    d_replay = datetime.strptime(args.sortdate, "%Y-%m-%d").date()
    hist_rows, d = [], d_replay
    while len(hist_rows) < args.history_n:
        d = d - timedelta(days=1)
        if d.weekday() > 4:
            continue
        row = generate_one_sort(rng_np, d.weekday(), p)
        hist_rows.append({"date": d.isoformat(), "dow": DOW_LABELS[d.weekday()],
                          "volume": row["total_volume"], "pph": row["pph_sor"],
                          "paid_day": row["paid_day"], "worked": row["worked"],
                          "is_bad_day": row["is_bad_day"]})
    hist_rows.reverse()
    (args.out / "history_seed.northgate.json").write_text(json.dumps({
        "_meta": {"world": "NORTHGATE / NGATE", "generator": f"emit_hub_corpus.py (seed {args.seed})",
                  "statement": "Synthetic history — Monte Carlo sorts from noised calibration."},
        "sorts": hist_rows}, indent=2) + "\n")

    # the replay sort itself (fixed DOW from the sortdate)
    skel = generate_one_sort(rng_np, d_replay.weekday(), p)
    # a demo should be a TYPICAL sort: redraw a bad/extreme day once or twice
    tries = 0
    while (skel["is_bad_day"] or skel["copula_extreme"]) and tries < 3:
        skel = generate_one_sort(rng_np, d_replay.weekday(), p)
        tries += 1

    # INTEL_PROJ needs a population of sorts per DOW
    pop = [generate_one_sort(rng_np, i % 5, p) for i in range(600)]
    intel = emit_intel_proj(cal, profile, rng, pop)
    (args.out / "intel_proj.northgate.json").write_text(json.dumps(intel, indent=2) + "\n")

    n_pulls = emit_replay(cal, profile, roster, skel, args.sortdate, args.seed,
                          args.out / "replay")
    bundle_bytes = write_replay_bundle(args.out / "replay", args.bundle_out)
    print(f"emit_hub_corpus: {n_pulls} pulls, {args.history_n} history sorts, "
          f"INTEL_PROJ ({len(DOW_LABELS)} DOW) → {args.out}; "
          f"demo bundle → {args.bundle_out} ({bundle_bytes/1024:.0f} KB)")
    print(f"  replay sort: vol {skel['total_volume']:,} · pph {skel['pph_sor']} · "
          f"paid day {skel['paid_day']:.2f} · worked {skel['worked']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""
slic_synth.py — WS3.3: fictional SLIC/destination/bay table for NORTHGATE.

Generates a routing table in the same schema as the production
slic_bay_pd_master (the shape every consumer reads: slic, dest_code,
dest_code_6char, dest_name_observed, pd, pd_index, bays, dow_variant,
cure_stats) with every VALUE fictional:

- SLIC codes: unique 4-digit strings from a seeded draw
- Destinations: invented New-England-plausible town names assembled from
  morpheme pools (with a blocklist of well-known real towns), suffixed with
  a regional/long-haul state per the calibrated mix
- Bays: sequential per-PD blocks; bays-per-SLIC drawn from the calibrated
  histogram (0-bay entries are floor-sort lanes, like production)
- cure_stats: synthetic per-lane aggregates coherent with the calibrated
  net-volume lognormal (percentiles derived from the same draw)

Structural shape (counts, histograms, net distribution) comes from
calibration.json's `slic_shape` block — noised aggregates, never values.
Pure stdlib; deterministic under --seed.

    python3 synth-hub-generator/world/slic_synth.py --seed 11
"""
from __future__ import annotations

import argparse
import json
import math
import random
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_CALIB = HERE.parent / "calibration/calibration.json"
DEFAULT_OUT = HERE / "slic_table.northgate.json"

FALLBACK_SHAPE = {
    "n_entries": 80, "slics_per_pd_range": [4, 7],
    "bays_per_slic_p": {"0": 0.36, "1": 0.40, "2": 0.20, "3": 0.04},
    "net_mu_ln": 6.7, "net_sigma_ln": 0.5,
    "sixchar_rate": 0.64, "dow_variant_rate": 0.02,
    "state_mix": {"regional": 0.85, "longhaul": 0.15},
}

# Invented-morpheme pools. Combinations are checked against a blocklist of
# well-known real New England towns; the goal is plausible, not real.
PREFIXES = ["BRAN", "CALD", "DORV", "ELMS", "FENW", "GARN", "HALV", "KELD",
            "LORN", "MARV", "NORV", "OREL", "PELH", "QUIN", "RAVN", "SUTL",
            "TALB", "VERN", "WINL", "YARR", "ASHW", "BIRK", "CROV", "DELM",
            "EASV", "FALK", "GRAN", "HOLB", "IVER", "KIRN"]
SUFFIXES = ["BROOK", "DALE", "FIELD", "FORDE", "HAM", "MONT", "PORTE", "RIDGE",
            "TON", "VALE", "VIEW", "WICK", "WORTH", "BURY", "HAVEN", "MERE",
            "STEAD", "CROSS", "MOOR", "GLEN"]
REAL_TOWN_BLOCKLIST = {
    "BRANFORD", "MILFORD", "STAMFORD", "CONCORD", "PORTLAND", "BURLINGTON",
    "RUTLAND", "BANGOR", "WORCESTER", "SPRINGFIELD", "NORWICH", "PELHAM",
    "QUINCY", "ELMSFORD", "GRANBY", "HOLBROOK", "ASHFORD", "WINDHAM",
}
REGIONAL_STATES = ["MA", "NH", "VT", "ME", "CT", "RI"]
LONGHAUL_STATES = ["NY", "PA", "OH", "IL", "TX", "NJ"]


def make_town(rng, used_names):
    for _ in range(200):
        name = rng.choice(PREFIXES) + rng.choice(SUFFIXES)
        if name in REAL_TOWN_BLOCKLIST or name in used_names:
            continue
        used_names.add(name)
        return name
    raise RuntimeError("town-name pool exhausted")


def dest_codes(rng, town, state, used_codes, sixchar_rate):
    for take in (3, 4):
        code = (town[:take] + state)[:5 if take == 3 else 6][:5]
        code = (town[:3] + state) if take == 3 else None
        break
    # 5-char: 3 town letters + state; de-collide by advancing the take window
    for start in range(0, len(town) - 2):
        code5 = (town[start:start + 3] + state)
        if code5 not in used_codes:
            used_codes.add(code5)
            code6 = (town[start:start + 4] + state) if rng.random() < sixchar_rate else None
            return code5, code6
    raise RuntimeError("dest-code space exhausted for " + town)


def synth_cure_stats(rng, mu_ln, sigma_ln, sortdate_anchor):
    net = max(60.0, rng.lognormvariate(mu_ln, sigma_ln))
    spread = rng.uniform(0.25, 0.55)
    util = min(0.95, max(0.2, rng.gauss(0.55, 0.12)))
    n_rows = rng.randint(5, 30)
    return {
        "n_rows": n_rows,
        "n_unique_dates": n_rows,
        "date_range": [sortdate_anchor, sortdate_anchor],
        "dow_distribution": {},
        "avg_net": round(net, 1),
        "p25_net": round(net * (1 - spread), 1),
        "p50_net": round(net, 1),
        "p75_net": round(net * (1 + spread), 1),
        "p95_net": round(net * (1 + 1.8 * spread), 1),
        "avg_pkg_cube": round(rng.uniform(1.5, 2.1), 3),
        "avg_bags": round(net * rng.uniform(0.02, 0.09), 1),
        "avg_irgs": round(net * rng.uniform(0.005, 0.03), 1),
        "avg_ppw": round(rng.uniform(30, 60), 1),
        "avg_util_pct": round(util * 100, 1),
        "p25_util_pct": round(max(5, util * 100 - 12), 1),
        "p50_util_pct": round(util * 100, 1),
        "p75_util_pct": round(min(99, util * 100 + 12), 1),
        "p95_util_pct": round(min(99.5, util * 100 + 22), 1),
    }


def generate(shape, seed, anchor_date, exclude_slics=(), exclude_codes=()):
    rng = random.Random(seed)
    used_names = set()
    used_codes = set(exclude_codes)   # pre-seeding = "never generate these"
    used_slics = set(exclude_slics)
    bays_p = [(int(k), float(v)) for k, v in sorted(shape["bays_per_slic_p"].items())]
    lo, hi = shape["slics_per_pd_range"]

    def draw_slic():
        while True:
            s = f"{rng.randint(100, 9899):04d}"
            if s not in used_slics:
                used_slics.add(s)
                return s

    def draw_bay_count():
        r, acc = rng.random(), 0.0
        for k, p in bays_p:
            acc += p
            if r <= acc:
                return k
        return bays_p[-1][0]

    bay_map = []
    bay_cursor = 40  # bays are 4-digit strings in per-PD sequential blocks
    for pd_i in range(1, 13):
        pd = f"PD-{pd_i:02d}"
        n = rng.randint(lo, hi)
        block_start = bay_cursor
        for _ in range(n):
            town = make_town(rng, used_names)
            state = rng.choice(REGIONAL_STATES if rng.random() < shape["state_mix"]["regional"]
                               else LONGHAUL_STATES)
            code5, code6 = dest_codes(rng, town, state, used_codes, shape["sixchar_rate"])
            n_bays = draw_bay_count()
            bays = [f"{bay_cursor + j:04d}" for j in range(n_bays)]
            bay_cursor += n_bays
            bay_map.append({
                "slic": draw_slic(),
                "dest_code": code5,
                "dest_code_6char": code6,
                "dest_name_observed": town,
                "pd": pd,
                "pd_index": pd_i - 1,
                "bays": bays,
                "dow_variant": ("FRI" if rng.random() < shape["dow_variant_rate"] else None),
                "notes": "",
                "resolution_source": "slic_synth",
                "cure_stats": synth_cure_stats(rng, shape["net_mu_ln"], shape["net_sigma_ln"], anchor_date),
            })
        bay_cursor = max(bay_cursor, block_start + 18)  # keep PD blocks visually distinct
    # Specials mirroring the production table's non-PD lanes (1 air, 2 night, 1 HVD)
    for pd, town in (("AIR-SORT", make_town(rng, used_names)),
                     ("NIGHT-SORT", make_town(rng, used_names)),
                     ("NIGHT-SORT", make_town(rng, used_names)),
                     ("PD-13", make_town(rng, used_names))):
        state = rng.choice(REGIONAL_STATES)
        code5, code6 = dest_codes(rng, town, state, used_codes, shape["sixchar_rate"])
        bay_map.append({
            "slic": draw_slic(), "dest_code": code5, "dest_code_6char": code6,
            "dest_name_observed": town, "pd": pd,
            "pd_index": None, "bays": [], "dow_variant": None, "notes": "",
            "resolution_source": "slic_synth",
            "cure_stats": synth_cure_stats(rng, shape["net_mu_ln"], shape["net_sigma_ln"], anchor_date),
        })
    return bay_map


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--calibration", type=Path, default=DEFAULT_CALIB)
    ap.add_argument("--seed", type=int, default=11)
    ap.add_argument("--anchor-date", default="2026-06-17")
    ap.add_argument("--exclude", type=Path, default=None,
                    help="optional routing table whose slics/dest_codes must never be "
                         "generated (private-side de-collision; the public run omits it)")
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = ap.parse_args(argv)

    shape = FALLBACK_SHAPE
    if args.calibration.exists():
        cal = json.loads(args.calibration.read_text())
        if isinstance(cal.get("slic_shape"), dict) and "net_mu_ln" in cal["slic_shape"]:
            shape = cal["slic_shape"]

    ex_slics, ex_codes = (), ()
    if args.exclude and args.exclude.exists():
        ex = json.loads(args.exclude.read_text())["bay_map"]
        ex_slics = {e["slic"] for e in ex}
        ex_codes = {c for e in ex for c in (e.get("dest_code"), e.get("dest_code_6char")) if c}

    bay_map = generate(shape, args.seed, args.anchor_date, ex_slics, ex_codes)
    out = {
        "_meta": {
            "generated": date.today().isoformat(),
            "generator": f"slic_synth.py (seed {args.seed})",
            "world": "NORTHGATE / NGATE — fully fictional routing (SPEC v2 §0.1)",
            "n_entries": len(bay_map),
            "statement": "Every SLIC, destination, bay, and per-lane statistic is synthetic. Structural shape from noised calibration aggregates only.",
        },
        "bay_map": bay_map,
    }
    args.out.write_text(json.dumps(out, indent=2) + "\n")
    print(f"slic_synth: {len(bay_map)} fictional lanes → {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

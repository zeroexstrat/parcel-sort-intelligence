#!/usr/bin/env python3
"""
roster_synth.py — WS3.4: fictional NORTHGATE roster with the production ID taxonomy.

Emits roster.northgate.json: `Employee-1…Employee-n` display names, 7-digit
employee IDs drawn from the FICTIONAL block declared in calibration
id_taxonomy (never a real range), format-faithful `AAA#######` scanning IDs,
plus the non-human rows that share production employee tables — machine-ID
sequential blocks, SLS bin IDs, and dummy stubs. The taxonomy IS packet trap
T2/T3, so its structure is preserved deliberately (SPEC v2 §0.1, §3).

Roster size and FT/PT mix come from calibration `roster` (noised aggregates).
Pure stdlib; deterministic under --seed.

    python3 synth-hub-generator/world/roster_synth.py --seed 13
"""
from __future__ import annotations

import argparse
import json
import random
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_CALIB = HERE.parent / "calibration/calibration.json"
DEFAULT_OUT = HERE / "roster.northgate.json"

FALLBACK = {
    "roster": {"size_mean": 270, "size_sd": 18, "size_min": 230, "size_max": 320,
               "ft_share": 0.55, "outbound_share": 0.33},
    "id_taxonomy": {
        "human_id": {"format": "7digit", "block": [2200000, 3099999]},
        "scan_id": {"format": "AAA#######"},
        "machine_blocks": {"blocks": [[9900001, 9900060]]},
        "sls_bins": {"prefix": "SLS", "range": [1, 40]},
        "dummy_stubs": {"values": ["00000"], "five_digit_block": [10000, 10999]},
    },
}

WORK_AREAS = ["Outbound", "Smalls", "Air", "Inbound", "Primary", "Wrap"]


def _letters(rng):
    return "".join(rng.choice("ABCDEFGHJKLMNPRSTUVWXYZ") for _ in range(3))


def generate(cal, seed, size_override=None):
    rng = random.Random(seed)
    roster_p = cal.get("roster") or FALLBACK["roster"]
    tax = cal.get("id_taxonomy") or FALLBACK["id_taxonomy"]

    n = size_override or int(round(rng.gauss(roster_p["size_mean"], roster_p["size_sd"])))
    n = max(int(roster_p.get("size_min", 200)), min(int(roster_p.get("size_max", 360)), n))

    lo, hi = tax["human_id"]["block"]
    # sparse, order-scrambled draw from the fictional block — sequential-looking
    # neighborhoods happen naturally, exact ordering doesn't leak roster order
    id_pool = rng.sample(range(lo, hi), n)

    ob_share = roster_p.get("outbound_share", 0.33)
    ft_share = roster_p.get("ft_share", 0.55)
    employees = []
    for i in range(1, n + 1):
        area = "Outbound" if rng.random() < ob_share else rng.choice(WORK_AREAS[1:])
        employees.append({
            "name": f"Employee-{i}",
            "employee_id": f"{id_pool[i-1]:07d}",
            "scan_id": f"{_letters(rng)}{id_pool[i-1]:07d}",
            "ft_pt": "FT" if rng.random() < ft_share else "PT",
            "home_area": area,
        })

    machines = []
    for blk_lo, blk_hi in (tax.get("machine_blocks", {}).get("blocks") or [[9900001, 9900060]]):
        machines.extend(f"{v:07d}" for v in range(blk_lo, min(blk_hi, blk_lo + 59) + 1))

    sls_lo, sls_hi = tax.get("sls_bins", {}).get("range", [1, 40])
    sls_bins = [f"SLS{i:02d}" for i in range(sls_lo, sls_hi + 1)]

    stubs = list(tax.get("dummy_stubs", {}).get("values") or ["00000"])
    f_lo, f_hi = tax.get("dummy_stubs", {}).get("five_digit_block", [10000, 10999])
    stubs += [f"{rng.randint(f_lo, f_hi):05d}" for _ in range(6)]

    return {
        "_meta": {
            "generated": date.today().isoformat(),
            "generator": f"roster_synth.py (seed {seed})",
            "world": "NORTHGATE / NGATE",
            "statement": ("Fictional roster: names are Employee-N, all IDs from fictional "
                          "blocks. The non-human rows (machines/bins/stubs) preserve the "
                          "production ID taxonomy deliberately — it is packet trap T2/T3."),
            "n_employees": n,
        },
        "employees": employees,
        "machine_ids": machines,
        "sls_bins": sls_bins,
        "dummy_stubs": stubs,
    }


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--calibration", type=Path, default=DEFAULT_CALIB)
    ap.add_argument("--seed", type=int, default=13)
    ap.add_argument("--size", type=int, default=None)
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = ap.parse_args(argv)

    cal = json.loads(args.calibration.read_text()) if args.calibration.exists() else FALLBACK
    roster = generate(cal, args.seed, args.size)
    args.out.write_text(json.dumps(roster, indent=2) + "\n")
    print(f"roster_synth: {roster['_meta']['n_employees']} employees, "
          f"{len(roster['machine_ids'])} machine IDs, {len(roster['sls_bins'])} bins, "
          f"{len(roster['dummy_stubs'])} stubs → {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

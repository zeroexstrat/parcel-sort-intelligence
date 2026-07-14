#!/usr/bin/env python3
"""
ltc_truth_synth.py — WS4a: the LTC public-build data generator.

Consumes the NGATE routing world (slic_table.northgate.json) and emits
everything the Label-Training-Certification public build swaps in:

  truth-data.northgate.js   TRUTH_RAW in the production grammar
                            (ZIP|SLIC|BAY|BELT_INDEX|STATE|CITY)
  config-data.northgate.js  the config.js hub-data region: belt color layout
                            (a seeded permutation of the standard slots, with
                            the confusability families following the
                            permutation), no megadest analog, synthetic
                            high-miss zones / shipper-error exceptions /
                            air-sort thresholds

Sanitization: fictional ZIPs are drawn from ZERO-OCCUPANCY 3-digit prefix
blocks of the real truth table's zip space (--exclude, structural — the same
argument as the roster's ID block). Every SLIC/bay/belt/town is already
fictional (slic_synth). The real chart's air thresholds and operator-curated
high-miss/exception content never ship: the synthetic equivalents reference
only NGATE lanes and shifted thresholds.

Stdlib-only, seeded, deterministic:

    ./.venv/bin/python synth-hub-generator/world/ltc_truth_synth.py \
        --exclude Label-Training-Certification/js/truth-data.js
"""
from __future__ import annotations

import argparse
import json
import random
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
GEN = HERE.parent
REPO = GEN.parent
SLIC_TABLE = HERE / "slic_table.northgate.json"
LTC = REPO / "Label-Training-Certification"
OUT_DIR = LTC / "data/routing"

# The standard belt-slot vocabulary (position semantics are structural: twelve
# PD outbounds, PD-13 HVD, a secondary, two air belts). The PUBLIC layout is a
# seeded permutation of these color assignments — never the private one.
BASE_COLOR_WORDS = [
    ("Top", "Black", "#212121"), ("Top", "Yellow", "#F9A825"),
    ("Top", "White", "#BDBDBD"), ("Middle", "Yellow", "#F9A825"),
    ("Bottom", "Red", "#C62828"), ("Middle", "White", "#BDBDBD"),
    ("Top", "Green", "#2E7D32"), ("Middle", "Red", "#C62828"),
    ("Top", "Red", "#C62828"), ("", "Orange", "#E65100"),
    ("Bottom", "Yellow", "#F9A825"), ("Top", "Blue", "#1565C0"),
    ("Middle", "Blue", "#1565C0"), ("Middle", "Black", "#212121"),
    ("Middle", "Green", "#388E3C"), ("Bottom", "Green", "#1B5E20"),
]
CITY_SUFFIXES = ["", " NORTH", " JUNCTION", " FALLS", " HEIGHTS", " CROSSING",
                 " EAST", " GROVE", " RIDGE", " PARK", " WEST", " LANDING",
                 " MILLS", " SOUTH", " CENTER"]


def real_zips_from_truth_js(path):
    m = re.search(r"const TRUTH_RAW = `([\s\S]*?)`;", Path(path).read_text())
    if not m:
        raise SystemExit(f"no TRUTH_RAW in {path}")
    return {line.split("|")[0] for line in m.group(1).strip().splitlines()}


def _free_prefix_blocks(exclude_zips):
    """3-digit prefixes with ZERO occupancy in the excluded zip space."""
    occupied = {z[:3] for z in exclude_zips}
    return [f"{p:03d}" for p in range(10, 1000) if f"{p:03d}" not in occupied]


def _color_family_indices(colors):
    """Confusable slots = same color word, else same shade row — mirrors the
    production heuristic structurally, computed from the (permuted) layout."""
    fams = {}
    for i, (_, word, _hex) in enumerate(colors):
        same_word = [j for j, (_, w, _h) in enumerate(colors) if j != i and w == word]
        if len(same_word) < 3:
            extra = [j for j, (pos, _w, _h) in enumerate(colors)
                     if j != i and j not in same_word and pos == colors[i][0]]
            same_word += extra
        fams[i] = same_word[:3]
    return fams


def _pd_index(lane):
    """Belt index from the lane's pd name (PD-13 has a null pd_index in the
    table but IS a quiz-able belt). Air/night-sort lanes return None — they
    are service-routed, not zip-routed, so they carry no truth rows."""
    m = re.match(r"PD-(\d+)$", str(lane.get("pd") or ""))
    return int(m.group(1)) - 1 if m else None


def build_world(table, seed, exclude_zips):
    rng = random.Random(seed * 47 + 3)
    lanes = [l for l in table["bay_map"] if _pd_index(l) is not None]

    # ── fictional zip blocks: one zero-occupancy 3-digit prefix per lane ──
    free = _free_prefix_blocks(exclude_zips)
    if len(free) < len(lanes):
        raise SystemExit(f"only {len(free)} free zip blocks for {len(lanes)} lanes")
    rng.shuffle(free)
    rows = []
    for lane, prefix in zip(lanes, free):
        state = lane["dest_code"][-2:]
        town = lane["dest_name_observed"].upper()
        n = rng.randint(6, 12)
        lasts = rng.sample(range(100), n)
        lasts.sort()
        suffixes = rng.sample(CITY_SUFFIXES, min(n, len(CITY_SUFFIXES)))
        bay = "/".join(lane["bays"]) or "0"   # real-grammar convention for bay-less lanes
        for k, last in enumerate(lasts):
            city = (town + suffixes[k % len(suffixes)]).strip()
            rows.append(f"{prefix}{last:02d}|{lane['slic']}|{bay}"
                        f"|{_pd_index(lane)}|{state}|{city}")
    rows.sort()

    # ── belt color layout: seeded permutation, families follow ──
    perm = list(range(16))
    rng.shuffle(perm)
    colors = [BASE_COLOR_WORDS[perm[i]] for i in range(16)]
    def cname(i):
        pos, word, _hex = colors[i]
        return (pos + " " + word).strip()
    names = ([f"PD-{i+1:02d} · {cname(i)}" for i in range(13)]
             + [cname(13), f"AF1 · {cname(14)}", f"AF2 · {cname(15)}"])
    hexes = [colors[i][2] for i in range(16)]
    families = _color_family_indices(colors)

    # ── synthetic air thresholds (structure real, values not the chart's) ──
    air_rules = [
        {"service": "UPS NEXT DAY AIR", "serviceCode": "NDA", "level": "1",
         "prefixMin": "120", "belt": 14},
        {"service": "UPS NEXT DAY AIR EARLY A.M.", "serviceCode": "NDA_EARLY",
         "level": "1", "aliases": ["NDAEARLY"], "belt": 14},
        {"service": "UPS 2ND DAY AIR", "serviceCode": "2DA_SAT", "level": "2",
         "satNote": True, "aliases": ["2S", "2DAY SATURDAY COMMITTED"], "belt": 14},
        {"service": "INTERNATIONAL", "serviceCode": "INTL", "intl": True,
         "aliases": ["INTERNATIONAL"], "belt": 14},
        {"service": "UPS 2ND DAY AIR", "serviceCode": "2DA", "level": "2",
         "prefixMin": "310", "belt": 15},
        {"service": "UPS 3 DAY SELECT", "serviceCode": "3DA", "level": "3",
         "aliases": ["3DS"], "prefixMin": "410", "belt": 15},
    ]

    # ── synthetic high-miss zones + shipper-error exceptions on NGATE lanes ──
    by_slic = {r.split("|")[1]: r for r in rows}
    picks = rng.sample(sorted(by_slic), 5)
    def zone_for(slic):
        zp = by_slic[slic].split("|")[0][:4]
        lane = next(l for l in lanes if l["slic"] == slic)
        return {"state": lane["dest_code"][-2:], "slicLow": int(zp),
                "slicHigh": int(zp), "slic": slic,
                "note": f"{lane['dest_code']} {names[_pd_index(lane)].split(' · ')[1]}"
                        " — synthetic drill zone (NGATE)"}
    high_miss = [zone_for(s) for s in picks[:3]]

    exceptions = []
    for i, slic in enumerate(picks[3:], start=1):
        lane = next(l for l in lanes if l["slic"] == slic)
        other = next(l for l in lanes if l["slic"] == picks[i % 3])
        row_zip = by_slic[slic].split("|")[0]
        exceptions.append({
            "id": f"NG{i}",
            "note": f"Shipper error: {lane['dest_code'][-2:]} address with "
                    f"{other['dest_code'][-2:]} ZIP — synthetic (NGATE)",
            "routingState": other["dest_code"][-2:],
            "prefixStart": int(by_slic[other["slic"]].split("|")[0][:3]),
            "prefixEnd": int(by_slic[other["slic"]].split("|")[0][:3]),
            "zipState": lane["dest_code"][-2:],
            "city": lane["dest_name_observed"].upper(),
            "zipPrefixes": [row_zip[:3]],
            "slic": slic,
            "belt": _pd_index(lane),
        })

    # ── admin identity + service overrides (public build swaps) ──
    # IDs are arbitrary values inside the roster's zero-occupancy block.
    admin = {"admin_ids": {"2411111": "Training Admin"},
             "easter_egg_id": "2422222", "easter_egg_msg": "Nice try."}
    service_overrides = {}
    for r in air_rules:
        note = r["service"].title() + (f" {r['prefixMin']}xx+" if r.get("prefixMin") else "")
        entry = {"belt": r["belt"], "name": names[r["belt"]], "note": note}
        service_overrides[r["serviceCode"]] = entry
        for alias in r.get("aliases", []):
            if re.fullmatch(r"[A-Z0-9_]+", alias):
                service_overrides[alias] = dict(entry)

    return {
        "truth_rows": rows,
        "belt_layout": {"names": names, "colors": hexes,
                        "families": families, "permutation": perm},
        "air_rules": air_rules,
        "high_miss_zones": high_miss,
        "exceptions": exceptions,
        "admin": admin,
        "service_overrides": service_overrides,
    }


HEADER = ("/* generated by ltc_truth_synth.py — do not hand-edit.\n"
          "   NGATE synthetic quiz world (WS4a): every ZIP/SLIC/bay/belt/town is\n"
          "   fictional; zips come from zero-occupancy blocks of the real zip\n"
          "   space; the real routing truth never ships. */\n")


def emit_truth_js(world):
    return (HEADER
            + "/* global TRUTH_RAW */\n"
            + "// Format per line: ZIP|SLIC|BAY|BELT_INDEX[,BELT_INDEX...]|STATE|CITY\n"
            + "const TRUTH_RAW = `\n"
            + "\n".join(world["truth_rows"])
            + "\n`;\n")


def emit_config_data_js(world):
    L = world["belt_layout"]
    fam = ",\n".join(f"  {k}: {json.dumps(v)}" for k, v in L["families"].items())
    exc = ",\n".join("  " + json.dumps({k: v for k, v in e.items() if k != "slic"})
                     for e in world["exceptions"])
    hm = ",\n".join("  " + json.dumps({k: v for k, v in z.items() if k != "slic"})
                    for z in world["high_miss_zones"])
    air = ",\n".join("  " + json.dumps(r) for r in world["air_rules"])
    return (HEADER
            + "const BELT_NAMES = " + json.dumps(L["names"], indent=2) + ";\n\n"
            + "const BELT_COLORS = " + json.dumps(L["colors"], indent=2) + ";\n\n"
            + "const BELT_FAMILIES = {\n" + fam + "\n};\n\n"
            + "// No megadest analog in the NGATE world — single-belt lanes only.\n"
            + "const MULTIDEST_BELTS = [];\n"
            + "const MULTIDEST_STATES = [];\n\n"
            + "const HIGH_MISS_ZONES = [\n" + hm + "\n];\n\n"
            + "const QUIZ_EXCEPTIONS = [\n" + exc + "\n];\n\n"
            + "const AIR_SORT_RULES = [\n" + air + "\n];\n")


def emit_admin_js(world):
    a = world["admin"]
    return (HEADER
            + "// Synthetic training admin — IDs sit in the roster's zero-occupancy block.\n"
            + "const ADMIN_IDS = " + json.dumps(a["admin_ids"], indent=2) + ";\n\n"
            + f"const EASTER_EGG_ID  = {json.dumps(a['easter_egg_id'])};\n"
            + f"const EASTER_EGG_MSG = {json.dumps(a['easter_egg_msg'])};\n")


def emit_service_overrides_js(world):
    rows = ",\n".join(f"  {json.dumps(code)}: {json.dumps(o)}"
                      for code, o in world["service_overrides"].items())
    return (HEADER
            + "// Service-level overrides (override ZIP routing entirely)\n"
            + "const SERVICE_OVERRIDES = {\n" + rows + "\n};\n")


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=11)
    ap.add_argument("--exclude", type=Path,
                    default=LTC / "js/truth-data.js",
                    help="real truth table whose zip space must stay untouched")
    ap.add_argument("--out-dir", type=Path, default=OUT_DIR)
    args = ap.parse_args(argv)

    table = json.loads(SLIC_TABLE.read_text())
    exclude = real_zips_from_truth_js(args.exclude) if args.exclude.exists() else set()
    world = build_world(table, seed=args.seed, exclude_zips=exclude)

    args.out_dir.mkdir(parents=True, exist_ok=True)
    outs = {
        "truth-data.northgate.js": emit_truth_js(world),
        "config-data.northgate.js": emit_config_data_js(world),
        "config-admin.northgate.js": emit_admin_js(world),
        "config-service.northgate.js": emit_service_overrides_js(world),
    }
    for name, text in outs.items():
        (args.out_dir / name).write_text(text, encoding="utf-8")
    print(f"ltc_truth_synth: {len(world['truth_rows'])} rows over "
          f"{len(table['bay_map'])} lanes → {', '.join(outs)} (seed {args.seed})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

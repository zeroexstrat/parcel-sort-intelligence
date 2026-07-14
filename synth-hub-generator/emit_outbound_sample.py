"""WS7 full-analytics outbound sample generator.

Reuses build_night from emit_xlsx (the shared NGATE world model) and
writes an NGATE night in the outbound engine's FULL input schema: the
Hub Summary (reused as-is) and an Employee Summary carrying scan-hours +
first/last timestamps + a loose/bags net split — so the engine renders
throughput analytics (scan-PPH, per-loader distributions, the
operational-window split), not just NET sums.

emit_xlsx.py is IMPORTED, never modified, so the byte-pinned
reconciliation packet stays byte-identical. Traps are disabled here —
this is a clean outbound-performance night, not the reconciliation
puzzle. The paid-hours SOR layer (paid-PPH, vs-plan, benchmark) is
cycle 2.

Derivations, from the world's own calibration:
  scan-hours = net ÷ pph,  pph ~ N(loader_pph_mu≈380, cap loader_pph_max)
  session span = scan-hours ÷ direct_hour_frac, clamped inside the sort
  window; bags = 5–9% of the row's volume (the Hub Summary's own split).
"""

import argparse
import datetime as dt
import importlib.util
import json
import math
import random
import re
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
SORT_START = dt.time(18, 0)
SORT_END = dt.time(22, 0)
TARGET_NET = 1100.0     # window-feasible net per loader (≈380 pph × ~2.9 h)
MAX_SPAN_H = 3.5        # session span cap so last-scan stays in the window


def _belt_num(belt):
    return int(re.findall(r"\d+", str(belt))[0])


def _load_emit():
    spec = importlib.util.spec_from_file_location(
        "emit_xlsx", HERE / "emit_xlsx.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def write_outbound_employee(night, calib, loader_rows, out_dir, emit):
    """The engine matches header-row-2 columns BY NAME, so only the names
    must be exact; positions are the real export's hostile layout."""
    ts = night["export_dt"].strftime("%Y%m%d_%H%M")
    wb = emit._fresh_wb()
    ws = wb.active
    ws.title = "Sheet1"
    ws.append((None, "Employee Summary", None, None, "Volume Attribution",
               None, None, "Device Link", None, "Net", None,
               "Scan Window", None, "Hours"))
    ws.append((None, "User", "Belt", "Total Packages", "Inbound Volume",
               "Outbound Volume", "Keyed Packages", "Scanner ID", None,
               "Bags Linked", None, "First Scan Timestamp",
               "Last Scan Timestamp", "Total Scan Hours"))

    rng = random.Random(f"{night['sortdate']}:outbound-hours")
    mu = calib["loader_pph_mu"]
    cap = calib["loader_pph_max"]
    dhf = calib["direct_hour_frac"]
    date = dt.date.fromisoformat(night["sortdate"])
    win_start = dt.datetime.combine(date, SORT_START)
    win_end = dt.datetime.combine(date, SORT_END)
    hours_cap = MAX_SPAN_H * dhf                  # direct-scan hours ceiling

    for uid, belt, vol in loader_rows:
        bags = round(vol * rng.uniform(0.05, 0.09))
        loose = vol - bags                       # F + J = vol (ties hub)
        # pph ~ calibration draw, floored so derived hours fit the window
        # (a high-volume loader simply worked faster, never > the sort).
        pph = min(cap, max(mu * 0.4, vol / hours_cap, rng.gauss(mu, 90.0)))
        hours = round(vol / pph, 2)              # net ÷ pph ≤ hours_cap
        span = min(hours / dhf, MAX_SPAN_H)
        first = win_start + dt.timedelta(minutes=rng.uniform(0, 25))
        last = min(first + dt.timedelta(hours=span), win_end)
        ws.append((None, f"{uid}.0", belt, float(vol), 0.0, float(loose),
                   0.0, f"EMP{uid}", None, float(bags), None,
                   first, last, hours))

    path = out_dir / f"SCN_EmployeeSummary_{ts}.xlsx"
    emit._save_deterministic(wb, path)
    return path.name


def _feasible_loader_rows(night, rng):
    """build_night splits some high-volume belts among too few loaders
    (fine for the reconciliation task, not window-feasible for
    throughput). Reused here without touching emit_xlsx: keep each
    belt's covered volume, but spread it across enough loaders that no
    one loader's share exceeds a single sort's realistic output. Pads
    from roster members not already loading; falls back to reuse (a
    multi-belt loader, which the engine handles) only if the roster is
    exhausted. Yields (user_id, belt, net)."""
    by_belt = defaultdict(list)
    for r in night["scan_rows"]:
        if isinstance(r["user"], int):           # skip any non-roster rows
            by_belt[r["belt"]].append(r)
    used = {r["user"] for rows in by_belt.values() for r in rows}
    spare = [p["id"] for p in night["roster"] if p["id"] not in used]
    rng.shuffle(spare)

    for belt in night["belts"]:
        rows = by_belt.get(belt, [])
        if not rows:
            continue
        covered = sum(r["outbound"] for r in rows)
        ids = [r["user"] for r in rows]
        need = max(len(ids), math.ceil(covered / TARGET_NET))
        while len(ids) < need:
            ids.append(spare.pop() if spare else rng.choice(ids))
        weights = [rng.uniform(0.7, 1.3) for _ in ids]
        wsum = sum(weights)
        acc = 0
        for i, (uid, w) in enumerate(zip(ids, weights)):
            net = covered - acc if i == len(ids) - 1 else round(covered * w / wsum)
            acc += net
            if net > 0:
                yield uid, belt, net


def write_outbound_sor(night, calib, loader_rows, out_dir, emit):
    """The SOR: paid-hours per belt (Staffing sheet) + a per-belt net-PPH
    benchmark (Work Area Types area-header rows) + the sort window
    (Summary sheet). All matched BY NAME; Work Area 'OUT-<belt-number>'
    maps to the belt. Paid hours = full belt net ÷ the calibration's
    paid net-PPH, so pph_paid lands on ~125 despite the loader
    attribution gap."""
    dow = dt.date.fromisoformat(night["sortdate"]).weekday()
    paid_pph = calib["pph_target_by_dow"][str(dow)]
    rng = random.Random(f"{night['sortdate']}:outbound-sor")
    name_of = {p["id"]: p["name"] for p in night["roster"]}

    wb = emit._fresh_wb()
    sm = wb.active
    sm.title = "Summary"
    for row in (("Planned", "Values", "Actual"),
                ("18:00", "Sort Start", "18:00"),
                ("21:30", "Sort Down", "21:40"),
                (night["spr_planned"], "Volume", night["spr_actual"]),
                (round(night["spr_planned"] / paid_pph, 1), "Paid Hours",
                 round(night["scn_total"] / paid_pph, 1))):
        sm.append(row)

    grouped = defaultdict(lambda: {"loaders": [], "covered": 0})
    for uid, belt, net in loader_rows:
        grouped[belt]["loaders"].append((uid, net))
        grouped[belt]["covered"] += net

    st = wb.create_sheet("Staffing")
    st.append(("Work Area Type", "Work Area", "Work Area Job",
               "Employee Name", "Employee ID", "FT/PT", "Pay Guarantee",
               "Pre-Start", "Hours"))
    for belt in night["belts"]:
        g = grouped.get(belt)
        if not g or not g["covered"]:
            continue
        n = _belt_num(belt)
        belt_paid = night["scan_belt_vol"][belt] / paid_pph
        for uid, net in g["loaders"]:
            hours = round(belt_paid * net / g["covered"], 2)
            st.append(("Outbound", f"OUT-{n}", "Outbound Load",
                       name_of.get(uid, f"Employee-{uid}"), str(uid),
                       "FT", 0, 0, hours))

    wt = wb.create_sheet("Work Area Types")
    wt.append(("Work Area Type", "Work Area", "Work Area Job",
               "Employee Name", "Employee ID", "Planned Net Volume",
               "Actual Net Volume", "Planned Net Packages Per Hour",
               "Actual Net Packages Per Hour", "Planned Hours",
               "Actual Hours"))
    for belt in night["belts"]:
        if belt not in grouped:
            continue
        n = _belt_num(belt)
        belt_net = night["scan_belt_vol"][belt]
        planned_net = round(belt_net * rng.uniform(0.97, 1.03))
        p_pph = round(paid_pph * rng.uniform(0.98, 1.02), 1)
        a_pph = round(paid_pph * rng.uniform(0.96, 1.04), 1)
        # AREA-HEADER row: Work Area Job blank AND Employee Name blank
        wt.append(("Outbound", f"OUT-{n}", None, None, "",
                   planned_net, belt_net, p_pph, a_pph,
                   round(planned_net / p_pph, 1), round(belt_net / a_pph, 1)))

    path = out_dir / f"SOR_NGATE_{night['sortdate']}.xlsx"
    emit._save_deterministic(wb, path)
    return path.name


def build(seed, sortdate, out_dir, emit=None):
    """Write the engine-input set for one NGATE night (Hub + Employee +
    SOR). Returns the written filenames. SLIC master ships separately
    (world/slic_table.northgate.json) — pass it to the engine via
    --slic-master."""
    emit = emit or _load_emit()
    calib = json.loads((HERE / "calibration/calibration.json").read_text())
    profile = json.loads(
        (HERE / "world/hub_profile.northgate.json").read_text())
    night = emit.build_night(calib, profile, seed, sortdate, [])
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    loader_rows = list(_feasible_loader_rows(
        night, random.Random(f"{sortdate}:outbound-loaders")))
    return {
        "hub": emit.write_scn_hub(night, out_dir),
        "employee": write_outbound_employee(
            night, calib, loader_rows, out_dir, emit),
        "sor": write_outbound_sor(
            night, calib, loader_rows, out_dir, emit),
    }


def main(argv=None):
    ap = argparse.ArgumentParser(
        description="Emit an NGATE outbound-performance night in the "
                    "engine's full input schema (Hub + Employee w/ hours).")
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--seed", type=int, default=11)
    ap.add_argument("--sortdate", default="2026-06-24")
    args = ap.parse_args(argv)
    written = build(args.seed, args.sortdate, args.out)
    for role, name in written.items():
        print(f"emit_outbound_sample: {role} → {name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

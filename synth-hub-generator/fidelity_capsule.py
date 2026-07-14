#!/usr/bin/env python3
"""
fidelity_capsule.py — WS3.6: prove the generator satisfies the real pipeline.

Runs the REAL Operations ingestion adapter (Operations/adapters/
live_sort_ingestion.py — the same code that audits production live pulls)
against the emitted NGATE replay bundle, gates the result on the world's own
structural contract, and writes a paired json/md evidence capsule (the
Operations capsule discipline).

Acceptance gates:
  G1  exactly one sort date, equal to the manifest's
  G2  every pull recognized: hub/emp/header/ops snapshot counts == manifest pulls
  G3  cumulative honesty: timeline igate_net_total is non-decreasing
  G4  ρ: latest PD net / skeleton building volume within contract ρ ± 0.03
  G5  κ: zone-3 share of PD (latest belts) within contract κ(DOW) ± 0.02
  G6  adjusted-building-PPH overlap computes (status ready-real-overlap,
      value inside a plausible band)
  G7  loader count plausible for the staffing model (≥ 40 PD loaders)

The SI/MTA recalibration adapter is NOT run here, deliberately: it consumes
the Twilight per-sort digestion outputs (a different pipeline stage), not
live pulls — the capsule records that with its reason.

    ./.venv/bin/python synth-hub-generator/fidelity_capsule.py
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from datetime import date, datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
ADAPTER = REPO / "Operations/adapters/live_sort_ingestion.py"
REPLAY = HERE / "dist/ngate-demo/replay"
PROFILE = HERE / "world/hub_profile.northgate.json"
AUDITS = HERE / "audits"

DOW_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]


def load_adapter():
    spec = importlib.util.spec_from_file_location("live_sort_ingestion", ADAPTER)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def run_gates(baseline, manifest, profile):
    gates = []

    def gate(gid, desc, ok, detail):
        gates.append({"gate": gid, "check": desc, "pass": bool(ok), "detail": detail})
        return ok

    sort_dates = baseline["sort_dates"]
    g1 = list(sort_dates.keys()) == [manifest["sort_date"]]
    gate("G1", "one sort date, equal to manifest", g1,
         {"found": list(sort_dates.keys()), "expected": manifest["sort_date"]})
    day = sort_dates.get(manifest["sort_date"]) or {}

    n_pulls = len(manifest["pulls"])
    counts = {k: day.get(k) for k in ("hub_snapshots", "employee_snapshots",
                                      "sor_header_snapshots", "sor_operations_snapshots")}
    gate("G2", "every emitted pull recognized by the adapter",
         all(v == n_pulls for v in counts.values()),
         {"pulls": n_pulls, **counts, "ignored": baseline["ignored_csv_files"]})

    tl = [p.get("igate_net_total") for p in (day.get("timeline") or [])
          if p.get("igate_net_total") is not None]
    mono = all(a <= b for a, b in zip(tl, tl[1:]))
    gate("G3", "cumulative net volume non-decreasing across pulls",
         bool(tl) and mono, {"points": len(tl), "first": tl[0] if tl else None,
                             "last": tl[-1] if tl else None})

    sc = profile["metric_contract"]["structural_constants"]
    rho_c = sc["rho_pd_hub"]["value"]
    total = manifest["skeleton"]["total_volume"]
    pd_net = day.get("latest_hub_pd_igate_net_total") or 0
    rho_e = pd_net / total if total else 0
    gate("G4", "latest PD net / building volume within contract rho ± 0.03",
         abs(rho_e - rho_c) <= 0.03,
         {"emitted": round(rho_e, 4), "contract": rho_c})

    dow = DOW_NAMES[datetime.strptime(manifest["sort_date"], "%Y-%m-%d").weekday()]
    kappa_c = sc["kappa_dow_steady"][dow]
    belts = day.get("latest_belts") or {}
    pd_tot = sum(belts.values())
    z3 = sum(v for b, v in belts.items() if b in ("PD-09", "PD-10", "PD-11", "PD-12"))
    kappa_e = z3 / pd_tot if pd_tot else 0
    gate("G5", f"zone-3 PD share within contract kappa({dow}) ± 0.02",
         abs(kappa_e - kappa_c) <= 0.02,
         {"emitted": round(kappa_e, 4), "contract": kappa_c})

    ov = day.get("adjusted_building_pph_overlap") or {}
    pph = ov.get("igate_net_over_sor_hours")
    gate("G6", "adjusted-building-PPH overlap ready and plausible",
         ov.get("status") == "ready-real-overlap" and pph and 60 <= pph <= 260,
         {"status": ov.get("status"), "igate_net_over_sor_hours": pph})

    gate("G7", "PD loader count plausible (>= 40)",
         (day.get("latest_employee_pd_loaders") or 0) >= 40,
         {"latest_employee_pd_loaders": day.get("latest_employee_pd_loaders")})
    return gates


def render_md(capsule):
    g = capsule["gates"]
    lines = [
        "# NGATE Fidelity Capsule — generator vs the real ingestion pipeline",
        "",
        f"Generated: {capsule['generated_at']} · Verdict: "
        f"**{'PASS' if capsule['verdict'] == 'pass' else 'FAIL'}** "
        f"({sum(1 for x in g if x['pass'])}/{len(g)} gates)",
        "",
        "The emitted NORTHGATE replay bundle was ingested by the UNMODIFIED "
        "production ingestion adapter (`Operations/adapters/live_sort_ingestion.py`, "
        "`--prefix ngate`) and gated on the synthetic world's own structural contract.",
        "",
        "| Gate | Check | Result | Detail |",
        "|---|---|---|---|",
    ]
    for x in g:
        lines.append(f"| {x['gate']} | {x['check']} | "
                     f"{'✅' if x['pass'] else '❌'} | `{json.dumps(x['detail'])}` |")
    lines += [
        "",
        "## Not run, with reason",
        "",
        "- `si_mta_recalibration.py` — consumes the Twilight per-sort digestion "
        "outputs (a different pipeline stage), not live pulls; the demo bundle "
        "does not and should not emit that artifact class.",
        "",
        f"Inputs: `{capsule['inputs']['replay']}` ({capsule['inputs']['csv_files']} CSVs) · "
        f"skeleton vol {capsule['inputs']['skeleton_volume']:,} · "
        f"profile `{capsule['inputs']['profile']}`",
    ]
    return "\n".join(lines) + "\n"


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--replay", type=Path, default=REPLAY)
    ap.add_argument("--profile", type=Path, default=PROFILE)
    ap.add_argument("--out-dir", type=Path, default=AUDITS)
    args = ap.parse_args(argv)

    mod = load_adapter()
    baseline = mod.build_live_sort_baseline(args.replay, prefix="ngate")
    manifest = json.loads((args.replay / "manifest.json").read_text())
    profile = json.loads(args.profile.read_text())

    gates = run_gates(baseline, manifest, profile)
    verdict = "pass" if all(x["pass"] for x in gates) else "fail"
    capsule = {
        "capsule": "ngate_generator_fidelity.v1",
        "generated_at": datetime.now().replace(microsecond=0).isoformat(),
        "verdict": verdict,
        "gates": gates,
        "inputs": {
            "replay": str(args.replay),
            "csv_files": baseline["csv_files"],
            "skeleton_volume": manifest["skeleton"]["total_volume"],
            "profile": str(args.profile),
            "adapter": str(ADAPTER),
        },
        "adapter_summary": {
            "recognized": baseline["recognized_csv_files"],
            "ignored": baseline["ignored_csv_files"],
            "sort_dates": {d: {k: v for k, v in day.items() if k != "timeline" and k != "latest_belts"}
                           for d, day in baseline["sort_dates"].items()},
        },
        "not_run": {"si_mta_recalibration": "consumes Twilight per-sort digestion outputs, not live pulls"},
    }
    args.out_dir.mkdir(parents=True, exist_ok=True)
    stamp = date.today().isoformat()
    (args.out_dir / f"ngate_fidelity_capsule_{stamp}.json").write_text(
        json.dumps(capsule, indent=2) + "\n")
    (args.out_dir / f"ngate_fidelity_capsule_{stamp}.md").write_text(render_md(capsule))
    print(f"fidelity capsule: {verdict.upper()} "
          f"({sum(1 for x in gates if x['pass'])}/{len(gates)} gates) → {args.out_dir}")
    for x in gates:
        print(f"  {x['gate']} {'PASS' if x['pass'] else 'FAIL'} — {x['check']}")
    return 0 if verdict == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())

# NGATE Fidelity Capsule — generator vs the real ingestion pipeline

Generated: 2026-07-09T13:58:45 · Verdict: **PASS** (7/7 gates)

The emitted NORTHGATE replay bundle was ingested by the UNMODIFIED production ingestion adapter (`Operations/adapters/live_sort_ingestion.py`, `--prefix ngate`) and gated on the synthetic world's own structural contract.

| Gate | Check | Result | Detail |
|---|---|---|---|
| G1 | one sort date, equal to manifest | ✅ | `{"found": ["2026-06-17"], "expected": "2026-06-17"}` |
| G2 | every emitted pull recognized by the adapter | ✅ | `{"pulls": 20, "hub_snapshots": 20, "employee_snapshots": 20, "sor_header_snapshots": 20, "sor_operations_snapshots": 20, "ignored": 0}` |
| G3 | cumulative net volume non-decreasing across pulls | ✅ | `{"points": 20, "first": 6679, "last": 67967}` |
| G4 | latest PD net / building volume within contract rho ± 0.03 | ✅ | `{"emitted": 0.5061, "contract": 0.515}` |
| G5 | zone-3 PD share within contract kappa(Wednesday) ± 0.02 | ✅ | `{"emitted": 0.3824, "contract": 0.383}` |
| G6 | adjusted-building-PPH overlap ready and plausible | ✅ | `{"status": "ready-real-overlap", "igate_net_over_sor_hours": 85.135}` |
| G7 | PD loader count plausible (>= 40) | ✅ | `{"latest_employee_pd_loaders": 75}` |

## Not run, with reason

- `si_mta_recalibration.py` — consumes the Twilight per-sort digestion outputs (a different pipeline stage), not live pulls; the demo bundle does not and should not emit that artifact class.

Inputs: `~/Desktop/Hub-Intelligence-Initiative/synth-hub-generator/dist/ngate-demo/replay` (80 CSVs) · skeleton vol 102,044 · profile `~/Desktop/Hub-Intelligence-Initiative/synth-hub-generator/world/hub_profile.northgate.json`

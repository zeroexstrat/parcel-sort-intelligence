# calibration.json — fit report
**Built:** 2026-07-09 · **Noise seed:** 7

Fitted from 160 usable sorts (30 with sort-ops planning detail, 160 with intra-sort volume series). Published values are noised per the method in `_noise` — this report records WHAT was fitted, never raw values.

| Section | Source | n |
|---|---|---|
| volume_params (lognormal/DOW) | building-volume finals | 160 |
| worked / paid_day / copula | sort-ops report summary actuals | 30 |
| dirichlet_alpha (+by-DOW) | sort-ops report area-row belt shares | 30 |
| pph_target (+sd/band) / performance | sort-ops report planned vs actual PPH | 27 |
| phase_alpha / floor | 15-min cumulative series | 160 |
| spikes | 15-min increment outliers (coarse heuristic) | 160 |
| loader PPH | default (fixtures absent) — documented heuristic | — |
| roster dists | sort-ops report staffing rosters | 30 |
| id_taxonomy | formats only; values fictional by construction | — |
| anomaly_rates | documented failure modes (SPEC §3.1), not fitted | — |
| pull_cadence | live-pull filename timestamps | 60 gaps |

Defaults (not derivable from the corpus, documented): smalls pieces-per-bag, worked_noise_cv, pph_target_jitter, spike gamma shape, residual dest split {'BACK_FEEDS': 0.45, 'SECONDARY': 0.35, 'UNASSIGNED': 0.2}.

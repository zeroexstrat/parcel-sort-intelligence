# synth-hub-generator — the shared NGATE engine (WS3 / SPEC v2 §6)

One calibration layer, two emitters. This generator powers **both** public
tracks from a single fictional world:

- **HII demo mode** — `emit_hub_corpus.py` emits a synthetic `INTEL_PROJ`
  corpus, history seeds, and a timed replay bundle (sequenced live-CSV pulls of
  one NORTHGATE sort) that the tracker ingests through its real pipeline.
- **Reconciliation packet** (`psi-reconciliation-env`) — `emit_xlsx.py`
  emits hostile workbook instances + ground truth; that repo pins this
  generator (SPEC v2 §6–7).

```
synth-hub-generator/
├── calibration/
│   ├── build_calibration.py   # PRIVATE input → PUBLIC output (see below)
│   ├── calibration.json       # noised aggregate parameters — publishable
│   └── calibration_report.md  # what was fitted, from how many sorts
├── world/
│   ├── hub_profile.northgate.json  # NGATE topology; boots the tracker via
│   │                               #   Live-Sort/embed_profile.py, zero code edits
│   ├── slic_synth.py               # fictional SLIC/dest/bay table
│   └── roster_synth.py             # fictional roster + ID taxonomy
└── emit_hub_corpus.py              # demo-mode corpus/replay emitter
```

## The sanitization argument (read before publishing anything)

`build_calibration.py` reads the **private** 84 MB sort corpus (613 real
sorts — never ships) and the live-pull fixtures, and publishes **noised
aggregates only**:

- means / medians / lognormal μ  → × U(0.97, 1.03)
- standard deviations / σ        → × U(0.95, 1.10)
- Dirichlet alphas               → element-wise × U(0.95, 1.05)
- correlations                   → off-diag + U(−0.03, 0.03), PSD-projected
- band edges                     → widened 2% outward
- sample counts                  → rounded to the nearest 10
- **ID values/ranges             → never published.** The `id_taxonomy` block
  contains *formats* observed in production and *fictional* value blocks
  constructed here.
- **anomaly rates                → not fitted.** Set from the documented
  production failure modes (packet SPEC §3.1), so no rate is a corpus statistic.

No row-level record, identifier, date-keyed value, or unnoised statistic
crosses from the corpus into `calibration.json`. The noise seed and per-field
method are recorded in the output's `_noise` block; `calibration_report.md`
records what was fitted and from how many sorts.

**Fitting regime:** current-era steady state only (`dual_sls`, non-peak — 160
sorts). Peak season is a flagged exception in production and is excluded here
for the same reason the production projection excludes it.

## Compatibility

`calibration.json` is format-compatible with the existing Monte Carlo engine
(`vendor/ai_memory/simulation/sort_generator.py`) — verified by loading it
through `load_calibration()` and generating sorts — and extends it with
emitter sections (`roster`, `id_taxonomy`, `anomaly_rates`, `pull_cadence`,
`building_volume_dow_bands`) that `sort_generator` ignores.

## Regenerating (home machine only)

```
./.venv/bin/python -m pip install -e '.[generator]'   # numpy/scipy/openpyxl
./.venv/bin/python synth-hub-generator/calibration/build_calibration.py
```

The work laptop never runs this — it only consumes emitted artifacts
(single-file HTML + CSV bundles), per the standing constraint.

# Parcel Sort Intelligence

Operational intelligence tooling for a package-sortation hub, built and run
in production by one supervisor — published here against **NORTHGATE
(NGATE)**, a fully synthetic hub, so every demo is real software running on
data that identifies no one.

## See it run (two clicks)

| Demo | Open | What you're looking at |
|---|---|---|
| **Live-Sort tracker** | [`Live-Sort/tracker_northgate.html`](Live-Sort/tracker_northgate.html) → add `?demo=1` to the URL | A full 4-hour sort replayed through the production ingest path at 120× — belts go BEHIND/ON-TRACK/AHEAD, the κ-engine and pace panel run live. `?demo=1&speed=600` for a 24-second sort. |
| **Label Training / Certification quiz** | [`Label-Training-Certification/index.html`](Label-Training-Certification/index.html) | Adaptive routing-label training built from ground-truth routing data — item selection adapts to your miss profile. |
| **Pre-Sort dashboard** | [`Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`](Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html) | The shift-planning view: volume projection, staffing bands, cutoff arithmetic. |
| **Volume & constants** | [`Post-Sort/volume_analytics.html`](Post-Sort/volume_analytics.html) | One synthetic steady-state year and the structural constants (κ, γ) the models rest on. |

Everything is a single local HTML file — clone, double-click, no server, no
build, no network dependency (vendored libraries; CDN is a fallback only).

## The synthetic hub

NORTHGATE mirrors the real pilot hub's *shape* — 12 outbound belts, air and
smalls operations, the same file formats, the same metric contract
structure — with fictional destinations, coordinators, employee IDs, and
noised operational constants. It is generated, not anonymized:
[`synth-hub-generator/`](synth-hub-generator/) builds the whole world from
noised aggregate calibration, and its README carries the sanitization
argument a reviewer can check. The fidelity capsule in
[`synth-hub-generator/audits/`](synth-hub-generator/audits/) shows the
unmodified production ingestion adapter accepting the synthetic hub's data:
same pipeline, fictional world.

## The research record

[`manuscript.md`](manuscript.md) — the book-length technical record behind
these tools: measurement discipline, denominators, routing truth, the live
tracker's methods, planning constants (κ, γ, ρ, ε), simulation boundaries,
and the research-engine machinery, closed by a 259-row claim ledger that
ties every formal claim to its source and evidence status. Facility
identifiers are masked for publication (the multi-belt consolidation
destination appears under its public alias `MULTIDEST`, matching the
training demo); every quoted measurement is real.

## The real data that does ship

[`data/zip-slic-atlas/`](data/zip-slic-atlas/) — a ~42k-row ZIP→serviceable-SLIC
atlas compiled by the author (own work product; construction documented in
its README). It is the one real dataset here, because it describes the
public network, not any hub's internals.

## Publication discipline

Every file in this repository passed a scripted publication gate before
export — forbidden-value classes are harvested from the private sources at
release time, so the gate tightens as the project grows. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the capsule pattern this project uses
to prove claims like that one.

A companion repository,
[`PSI Reconciliation Environment`](https://github.com/zeroexstrat/psi-reconciliation-env),
packages the same synthetic world as a graded work-sample evaluation
environment.

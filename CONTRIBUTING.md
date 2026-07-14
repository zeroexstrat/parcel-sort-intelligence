# How this project proves things

This repository is the public half of a private production project. Two
disciplines carry over, and they are the reason you can trust what you see.

## The capsule pattern

Any claim of the form "X passes Y" ships with a **capsule**: a dated,
committed artifact recording what ran, against what input, with what
result — regenerable by one script. The synthetic hub's fidelity capsule
(`synth-hub-generator/audits/`) is the template: the *unmodified* production
ingestion adapter ingests the synthetic hub's replay bundle and the capsule
records every acceptance gate's verdict. When a capsule can't run (a
dependency is private), the capsule says so and why, instead of being
quietly skipped.

If you contribute anything that makes a checkable claim, make it a capsule:
script → dated artifact → committed evidence.

## The publication gate

Nothing reaches this repository by `cp`. The export is built by a manifest,
then scanned by a gate whose forbidden values are harvested from the private
sources at release time — coordinator names, employee IDs, destination
codes, routing tables, hub branding. Reviewed false positives live in an
allowlist where every entry carries a written reason. The gate failed loud
several times during remediation and caught things build-time tests had
passed; the lesson stuck: **trust the gate, not the builder.**

## Tests

`python3 -m pytest` from the repository root. Tests that need private
inputs skip with a reason on a public checkout — a green public run is
green honestly.

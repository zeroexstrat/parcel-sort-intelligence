# Live-Sort tracker

A single-file, offline-first operations tracker for a live 4-hour sort:
belt-level PPH against plan, zone pacing (BEHIND / ON-TRACK / AHEAD), a
κ-engine that reads zone share against day-of-week baselines, loader scan
intelligence, and an end-of-sort export. In production it ingests timed CSV
pulls from the building's reporting loop; here it replays a full synthetic
NORTHGATE sort through that same ingest path.

**Run the demo:** open
[`tracker_northgate.html`](tracker_northgate.html) and add `?demo=1` to the
URL (`?demo=1&speed=600` compresses the sort to ~24 seconds). The demo uses
an in-memory store and leaves nothing behind — no IndexedDB, no
localStorage residue.

## Build provenance

This artifact is not hand-edited. It is built from the tracker source by
`embed_profile.py` (kept with the private working tree), which:

1. embeds the NORTHGATE hub profile between marker comments — every
   hub-specific constant comes from one profile object;
2. regenerates the SLIC routing tables from the synthetic world's lane
   table (`--slic-table`); building for a foreign hub **without** a lane
   table is a build error, so real routing can never ship by omission;
3. inlines the calc core for single-file distribution.

The result must pass the publication gate before export (see
[CONTRIBUTING.md](../CONTRIBUTING.md)).

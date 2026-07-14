# zip→SLIC atlas

A ~42k-row mapping from US ZIP code to the serviceable destination SLIC
(facility code), with the state and city each ZIP belongs to.

## Construction

The public ZIP space is a few hundred thousand codes; the operational
question is coarser — *which sort destination serves this ZIP*. This table
is that reduction: every serviceable ZIP observed across per-destination
sort charts and a year of live sortation data, joined against the public
ZIP/city/state registry, collapsed to one row per ZIP with the SLIC that
serves it.

Columns: `zip, slic, state, city`. Nothing hub-internal ships: bay and belt
assignments (how one particular building physically loads these
destinations) are deliberately absent.

## Provenance & rights

Compiled and validated by the author from public ZIP data plus first-hand
operational observation; it is published here as the project's own work
product. It is a snapshot, not a live feed — routing changes over time, and
no service commitment of any kind is implied.

# Hub Intelligence Initiative Manuscript

Status: complete manuscript
Date: 2026-06-02
Last editorial pass: 2026-07-10 (pilot-hub publication pass; claims re-verified against the synthetic-generator findings, CL-0254 through CL-0259)
Repository root: `Hub-Intelligence-Initiative/`
Completion: 100%
Active file: `manuscript.md`

This manuscript is a living dossier for the Hub Intelligence Initiative. It is meant to grow into a book-length technical record that explains the mathematics, statistics, operations research, software architecture, data engineering, simulation, and autonomous research machinery behind the project.

The goal is not only to document what was built. The goal is to explain the system from first principles up to the current project state, so a future reader can understand why the models exist, what each metric means operationally, what evidence supports each claim, and where the work remains experimental.

## Editorial Contract

Every future chapter should separate four layers:

1. Operational fact: what happens in the hub or training workflow.
2. Measurement model: what files, fields, denominators, and joins represent that fact.
3. Mathematical model: the formula, estimator, algorithm, or simulation used.
4. Evidence status: validated, simulation-validated, operator-ready, research-only, or blocked.

Every nontrivial claim should eventually link to a source file, audit, simulator output, notebook, adapter, tracker function, dashboard parser, or knowledge graph node.

Publication note (2026-07-10): this manuscript is written for public release alongside the project's public repositories. Real facility identifiers are masked: the hub appears as "the pilot hub" or simply "the hub", its SLIC is never written as a literal, and the multi-belt consolidation destination appears throughout under its public alias `MULTIDEST` — the same alias the public training-tool build uses — with its real SLIC, destination name, and destination code withheld. The masked identifiers change nothing quantitative: every volume, share, and date quoted from the audits is the real measured value. A few private-side `ai_memory` filenames and model names that carry the hub's name are likewise shown under neutral aliases (for example `hub_rag.py`, `hub-qwen`); the referenced code is private and never ships, so the alias costs nothing except the literal string.

## Current Source Map

This manuscript is based on repeated source-backed passes through these active project areas:

- `Label-Training-Certification/`: test generation, route truth tables, MULTIDEST weighting, quiz analytics, certification telemetry.
- `Pre-Sort/presort-dashboard/`: SPR, SVQ, SCANTRACK, CURE, misload, LIB, employee summary, cube, and productivity analytics.
- `Live-Sort/`: tracker v6.3-codex (workspace head now v6.4-codex with profile embedding and `calc_core.js` extraction; see Chapter 16), live CSV ingestion, Outbounds, Intel, DOP/Plan, timeline, queue state, projection, and operator payload methods.
- `Operations/`: adapter contracts, blocked metric gates, live analog forecast, simulation validation capsule.
- `ai_memory/`: knowledge graph, memory database, RAG, SPECTER2/Chroma, corpus ingestion, autoresearch loop, ADMM reconciliation, MCTS selection, postmortem workflow, simulation generator.
- `synth-hub-generator/`: NORTHGATE world, noised calibration, corpus/replay and workbook emitters, and the production-adapter fidelity capsule (added 2026-07-09; consumed by Chapters 12, 26, 34, and 56).

## How This Manuscript Should Grow

Each chapter should eventually contain:

- A plain-language problem statement.
- A first-principles derivation.
- Project implementation notes.
- Source references.
- Known limitations.
- Validation status.
- Open questions.

Recommended chapter statuses:

- `seed`: title and intent only.
- `outline`: chapter sections defined.
- `draft`: explanatory prose exists.
- `verified`: claims cross-checked against source code, audits, or data.
- `publishable`: prose, figures, notation, and evidence ledger are complete.

# Table of Contents

## Part I. The Work Before the Mathematics

Part I gives the reader the operating vocabulary before formulas appear. The sequence is deliberate: Chapter 1 names the program, Chapter 2 names the physical system, and Chapter 3 defines the measurement discipline that later chapters must obey.

### 1. What the Hub Intelligence Initiative Is

Status: final

The Hub Intelligence Initiative is not one application. It is a research and operating program around a hub sort. The project contains a label-training certification tool, a pre-sort dashboard, a live tracker, operations adapters, simulation and validation code, and an `ai_memory` research layer. Those parts exist because the same operation has several different questions:

- Can a person learn the label and routing truth table well enough to avoid predictable errors?
- Can a supervisor turn pre-sort files into a useful plan before the shift starts?
- Can live files show whether the sort is on pace without mixing incompatible denominators?
- Can post-sort evidence explain what happened without overclaiming causality?
- Can the research memory preserve constants, gaps, decisions, and formal claims across sessions?

The opening chapter should be read as the project thesis, not as a technical catalog. The tools are introduced only to show the shape of the evidence pipeline that the rest of the manuscript will formalize.

The project's central discipline is separation of surfaces. The operator surface must be concise, current, and safe to act on. The analyst surface may contain uncertainty bands, simulation diagnostics, validation gates, and research-only metrics. The manuscript should preserve that separation. It should not make advanced mathematics look like an operator command unless the code and tests already support that promotion.

#### The Hub as a Measured System

A sort is a physical workflow, but the project observes it through files. SCANTRACK supplies scan and belt evidence. SPR supplies hours, staffing, production, and work-area summaries. CURE, misload, LIB, SVQ, and employee reports supply narrower quality and labor views. The tools do not treat any one file as absolute truth. They combine files only when the denominator is named and when the resulting metric has a clear operational meaning.

That is why the project repeatedly distinguishes volume, paid hours, scan hours, headcount, loaders, sort span, and adjusted building PPH. A metric can change meaning when the denominator changes. The book must teach this before it teaches formulas, because most later mathematics only makes sense after the measurement surface is stable.

#### Why Training, Dashboards, Trackers, Simulation, and Memory Belong Together

The label-training project starts at the smallest decision unit: a destination, SLIC, state, ZIP, or belt answer. It builds controlled exposure to routing truth, including multi-valid MULTIDEST answers. The dashboard and tracker move up one level: they convert operational files into shift-level and belt-level views. Simulation and validation move one level further: they ask which metrics survive controlled stress tests and which should remain blocked. `ai_memory` stores the research context so that constants, caveats, and decisions do not reset every session.

These are not separate stories. They are layers of the same evidence pipeline:

1. Raw operational file or truth table.
2. Parser or adapter.
3. Normalized field.
4. Metric with named denominator.
5. Readiness or validation gate.
6. Operator, analyst, or manuscript surface.
7. Claim-ledger entry and future test.

#### The Book's Starting Promise

This manuscript should eventually become a book about how to build operational intelligence from first principles. The first-principles path is not only mathematical. It starts with the operational question, then the observable data, then the denominator, then the statistic or algorithm, then the implementation, then the safety boundary.

The future full manuscript should be readable by a technical operator who wants to understand the system and by a programmer who wants to reproduce the methods. The operator needs plain explanations of what a metric means and what action it supports. The programmer needs enough detail to rebuild the parser, test the denominator, reproduce the simulation boundary, and inspect the RAG or MCTS layer without treating it as a black box.

#### Source Basis

- The local project layout under `~/Desktop/Hub-Intelligence-Initiative/`: `Label-Training-Certification/`, `Pre-Sort/`, `Live-Sort/`, `Operations/`, `Post-Sort/`, and `Research/`.
- Existing drafted chapters in this manuscript for label training, dashboard analytics, tracker metrics, simulation validation, operator payloads, and `ai_memory`.
- `Operations/adapters/tracker_operator_payload.py`: operator-ready, analyst-detail, blocked, and tracker-contract surfaces.

### 2. The Twilight Sort as a System

Status: final

The Twilight Sort is the operating system underneath the software. Packages arrive with labels, routing information, service commitments, and destination signals. People and equipment convert that incoming flow into sorted outbound work. The HII tools observe that process through files: label-training truth tables, SPR staffing and production records, SCANTRACK scan summaries, CURE cube records, SVQ misload and LIB records, and live CSV pulls.

The first principle is simple:

```text
sort performance = package flow constrained by labor capacity, routing correctness, scan visibility, and destination readiness
```

The project does not model the whole physical building at once. It models the parts that can be measured and that can support a decision.

This chapter therefore defines scope. It is not trying to explain every physical motion in the building. It names the objects that later chapters measure: belts, zones, package volume, hours, headcount, loaders, routing correctness, and readiness surfaces.

#### Sort Areas, Belts, and Outbound Flow

The tracker and dashboard use normalized PD belt names such as `PD-01` through `PD-12`. The live tracker groups them into three outbound zones:

```text
Zone 1: PD-01 through PD-04
Zone 2: PD-05 through PD-08
Zone 3: PD-09 through PD-12
```

The tracker also carries air-related names such as `AIRSORT`, `AF02BLU`, and `SSAIR01` as separate from the PD belt family. The label-training project has its own belt metadata, where belt indices map to named physical belt positions such as `PD-01 - Top Black`, `PD-04 - Middle Yellow`, and air belts `AF1` and `AF2`.

Those naming layers are not cosmetic. They are the bridge from a raw file value to an operator-facing object. If `PD09HVD`, `PD-09`, and `OUT-9` are not normalized to the same operational belt, then a volume, scan hour, or route answer can land in the wrong bucket.

#### Volume and Capacity

Volume is a package count, but the source matters. The live tracker uses SCANTRACK hub rows for live outbound net volume:

```text
outbound net = LooseOutbound + BagsLinked
```

The dashboard preserves SPR Summary fields such as planned and actual `Volume`, `PPH`, `Hours`, `Paid Day`, `Worked`, and `Sort Span`. The operations adapter uses a stricter adjusted-building-PPH basis:

```text
adjusted building PPH = SCANTRACK canonical net volume / SPR actual hours
```

Capacity is not just headcount. A loader is a person doing outbound scan/load work. A headcount number may be planned, actual, worked, PD-only, SPR-derived, or SCANTRACK-active depending on the source. Paid hours are SPR labor-hour quantities. Scan hours are SCANTRACK employee scan-hour quantities. Sort span is a clock interval. These are related, but they are not interchangeable.

The most common rate in the project is:

```text
PPH = package count / hour denominator
```

The denominator determines the meaning. `net / paid hours` is paid PPH. `net / scan hours` is scan PPH. `volume / sort span` is a flow rate, not a labor productivity rate. The book should keep those distinctions visible from the beginning.

#### Before, During, and After the Sort

Before the sort, the supervisor needs a plan. The DOP/Plan generator turns projected building volume and planned adjusted building PPH into total paid hours. It then combines actual headcount and target paid day to identify whether the plan is covered, tight, or short. Per-belt outbound load staffing uses a separate belt-load PPH, not the building adjusted PPH.

During the sort, the tracker asks whether live scanned volume is moving as expected. It compares live belt net against projection bands, computes Outbounds paid PPH and scan PPH, tracks timeline snapshots, and can display queue-state and forecast diagnostics. The live view is useful only when it says what it is measuring right now.

After the sort, the project can save snapshots, compare live and post-sort belt totals, inspect CURE gaps, count misloads and LIB, and add evidence to the research layer. Post-sort analysis is where the project can learn. It is not automatically proof of causality.

#### What This Chapter Can Claim

This chapter can claim that HII models Twilight Sort through normalized belt and zone names, package-count sources, labor-hour sources, scan-hour sources, and explicit operator/analyst surfaces. It can claim that the live tracker uses `LooseOutbound + BagsLinked` as live outbound net and that Outbounds paid PPH and scan PPH use different hour denominators.

It cannot claim that a given staffing change caused a live performance change. It cannot claim that every headcount field means loaders. It cannot claim that SPR Summary PPH and adjusted building PPH are equivalent. Those are exactly the confusions the system is designed to prevent.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: belt normalization, `INTEL_ZONES`, Outbounds net, paid PPH, scan PPH, utilization, DOP plan copy, and live projection copy.
- `Operations/adapters/live_sort_ingestion.py`: live CSV parsing and adjusted-building-PPH overlap.
- `Operations/adapters/tracker_operator_payload.py`: accepted adjusted-building-PPH basis and blocked metrics.
- `Label-Training-Certification/js/config.js`: belt-index metadata and air/MULTIDEST belt definitions.

### 3. Measurement Philosophy

Status: final

HII's measurement philosophy is defensive. A number is not ready because it is available. A number is ready when its source, denominator, unit, and allowed surface are clear.

This chapter is the bridge between the operational story and the technical method chapters. From this point forward, every formula should be read as a claim about a measured object, not as an abstract number detached from files and workflows.

The project treats raw files as evidence, not as self-interpreting truth. SCANTRACK, SPR, CURE, SVQ, LIB, employee summaries, simulation databases, and knowledge-graph records each answer different questions. The manuscript should teach the reader to ask:

```text
What is counted?
Which file counted it?
Which denominator turns it into a rate?
What surface is allowed to display it?
What claim is blocked?
```

#### Raw Files Are Not Ground Truth by Themselves

A raw file can be authoritative for one field and weak for another. Live SPR can supply actual hours while reporting zero PPH in a way the project refuses to use as adjusted-building truth. SCANTRACK can supply live net volume and scan hours, but it is not a payroll system. Simulation can test whether an estimator behaves under controlled conditions, but it does not create live operator calibration by itself.

This is why the operations payload explicitly blocks several tempting metrics:

- SPR summary PPH.
- simulation `pph_sor`.
- sort-span headcount denominators.
- carryover adjustment flags when no reliable input exists.
- causal staffing claims.
- scanner attribution claims.

Each blocked item is still useful as a warning about what the system must not say.

#### Descriptive, Predictive, Causal, and Diagnostic

The project uses four levels of language.

| Level | Meaning | Example in HII |
| --- | --- | --- |
| Descriptive | Reports what was measured. | `net = LooseOutbound + BagsLinked`; paid PPH = net divided by SPR paid hours. |
| Diagnostic | Helps inspect a condition but does not prescribe cause. | A low entropy zone means scan work is concentrated among few users. |
| Predictive | Estimates a future or final state with validation gates. | Live analog forecast summarizing matched trajectory final outcomes. |
| Causal | Claims an intervention produced an outcome. | Blocked unless a specific causal validation design exists. |

Most current HII metrics are descriptive or diagnostic. Some forecasts are predictive when their gates pass. The project deliberately blocks causal language for staffing and scanner attribution.

#### Operator-Ready Versus Analyst Detail

The operator-ready surface must be conservative. It can show calibrated adjusted building PPH, DOW building bands, outbound load bands, live timeline evidence, and a gated live analog forecast. The analyst-detail surface can show recalibration candidates, method checks, entropy, Wilson intervals, simulation results, and blocked-metric explanations.

That split is not only a UI decision. It is an epistemic boundary. A method can be mathematically interesting and still not be operator-ready. Conversely, an operator-ready number can be simple if it has the right denominator and test coverage.

#### The Denominator Rule

Before a rate appears in prose, the manuscript should name:

```text
numerator
denominator
source of numerator
source of denominator
allowed surface
```

For example:

```text
Paid PPH = SCANTRACK outbound net / SPR paid hours
Scan PPH = SCANTRACK outbound net / SCANTRACK scan hours
Misload frequency = handled volume / misload count
LIB frequency = LIB report volume / LIB total
Cube utilization = sum loaded cube / sum equipment capacity
```

The project is allowed to compare these quantities, but it should not collapse them into one generic "productivity" number.

#### Source Basis

- `Operations/adapters/tracker_operator_payload.py`: blocked metric list, operator-ready payload, analyst detail, and tracker contract.
- `Live-Sort/tracker_v6.3-codex.html`: Outbounds metric labels, analyst-detail copy, live projection copy, and blocked/payload copy.
- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: snapshot and denominator logic for misload, LIB, cube, SCANTRACK, and work-area metrics.
- `Operations/tests/test_tracker_operator_payload.py`: readiness and blocked-claim tests.

## Part II. Data Sources, Denominators, and Truth Tables

Part II stabilizes the evidence vocabulary. Chapter 4 says what each source can and cannot prove, Chapter 5 fixes the denominator rules, and Chapter 6 narrows the discussion to route truth before the manuscript enters label training.

### 4. The Data Source Atlas

Status: final

The project has no single master data source. It has a data source atlas: a map of what each file can prove, what it cannot prove, and how it enters the system.

The atlas should be read as a capability map. A source is useful only for the claims its fields and tests can support. When later chapters introduce a metric, the reader should be able to trace it back to one row in this atlas.

#### Operational Files

| Source | Project role | Stable identifiers | Allowed claims |
| --- | --- | --- | --- |
| SPR Summary | Planned/actual sort-level fields. | sort date, sort code, facility, Summary labels. | Planned/actual SPR values and SPR actual hours. Not adjusted-building PPH truth by itself. |
| SPR Staffing | Employee-level and PAYACTUAL staffing rows. | employee id/name, work area type, work area, job, pay code. | Staffing hours, paid day, headcount rollups by work area or coordination group. |
| SPR Work Area Types | Work-area production subtotals. | work area type, work area, subtotal rows. | Net volume, net PPH, production-derived hours by work area. |
| SCANTRACK Hub Summary | Live belt and building scan volume. | belt name, loose outbound, bags linked, gross volume. | Live net volume and per-belt volume after normalization. |
| SCANTRACK Employee Summary | Employee scan activity. | user id, belt, packages, total scan hours, scan PPH, first/last scan timestamps. | Scan hours, scan PPH, active-loader intervals, loader coverage. |
| CURE | Load and cube quality. | destination, OS, date, utilization, TFCS, pieces per wall, loaded cube, equipment capacity. | Cube utilization, TFCS subsets, gap rows, destination/date heatmaps. |
| SVQ Twilight | Aggregate scan and misload volume. | area, scan totals, misload totals, date range. | Misload frequency denominators and area/coordination-group aggregation. |
| SVQ Misload report | Row-level exception detail. | tracking number, plan flow, next scan, destination, area, employee. | Misload event counts and pattern breakdowns. |
| LIB Breakdown | LIB report-specific volume and scan-log rows. | report date, LIB Total, work area, plan flow, next scan, state. | LIB frequency and LIB detail, with report-date caveat. |

#### Training and Research Sources

| Source | Project role | Stable identifiers | Allowed claims |
| --- | --- | --- | --- |
| Label truth table | ZIP/SLIC/bay/belt/state/city routing truth. | ZIP, SLIC, bay, belt index, state, city. | Quiz routing prompts and training correctness rules. |
| Routing correction artifacts | Audited SLIC-to-PD corrections. | SLIC, old/new PD, destination, audit rows. | Source-backed routing corrections and open routing issues. |
| Sort events JSONL / IDB | Training-answer history. | sorter id, ZIP, expected belt, actual belt, correctness, timestamp. | Certification analytics and supervisor trends. |
| Simulation SQLite DBs | Controlled synthetic sort corpus. | run id, sort rows, DOW, PD columns, invariant columns. | Simulation stress tests and estimator validation, not live operator calibration. |
| Knowledge graph JSON | Project memory graph. | node id, node type, labels, tags, metadata, edges. | Research continuity, retrieval context, branch state, open gaps. |
| Memory export JSON | Searchable session and postmortem memory. | memory id, category, content, timestamp. | Session continuity and learned-process recall. |

#### File Format and Parser Notes

The dashboard parses SPR, CURE, misload, LIB, employee, SVQ Twilight, and SCANTRACK sources into a shared `DATA` object, then builds a trend snapshot. The live tracker parses browser-loaded or auto-pulled files into live state, timeline snapshots, and Outbounds models. The operations adapters create smaller auditable JSON capsules around specific questions such as live sort ingestion, simulation validation, live analog forecast, and tracker operator payloads.

The atlas should be updated whenever a parser begins using a new file, a field changes meaning, or a test fixture captures a new source behavior.

#### Failure Modes

Common failure modes are:

- Same physical belt represented by different strings.
- SPR Summary PPH used when adjusted-building PPH is required.
- Scan hours used as paid hours.
- Paid hours used as scan hours.
- LIB report date assumed to equal SPR sort date.
- CURE row count confused with total loads.
- Simulation output promoted to operator-ready evidence.
- Training set-valued answers collapsed to single-label answers.

The atlas is where these failure modes should be named before formulas are introduced.

#### Source Basis

- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: dashboard parser and snapshot source map.
- `Live-Sort/tracker_v6.3-codex.html`: live parser, upload source labels, timeline, Outbounds, and persistence.
- `Operations/adapters/live_sort_ingestion.py`: live CSV baseline source names and parsed fields.
- `Operations/adapters/simulation_validation_capsule.py`: simulation DB manifest and invariant audits.
- `Label-Training-Certification/js/storage.js`: truth table, sort events, overlays, flags, audit log, and shared/local storage modes.

### 5. Canonical Denominators

Status: final

Canonical denominators are the project's guardrail against plausible but wrong metrics. The same numerator can mean different things depending on which denominator is used.

This chapter converts the measurement philosophy into a rule of composition: do not combine a numerator and denominator unless both source, unit, and operational meaning are named.

#### Package-Count Denominators

| Quantity | Definition | Source |
| --- | --- | --- |
| SCANTRACK live net | `LooseOutbound + BagsLinked` summed over relevant SCANTRACK Hub rows. | Live tracker and live sort ingestion adapter. |
| SPR actual volume | SPR Summary actual `Volume`. | Dashboard SPR parser. |
| handled volume for misloads | SVQ Twilight total scan volume when available; otherwise SPR actual `Volume + Air Volume`. | Dashboard denominator helper. |
| LIB volume | LIB report labeled volume, not SPR sort volume. | LIB parser. |
| cube loaded/equipment volume | sum loaded cube and equipment capacity. | CURE parser and cube aggregators. |

#### Hour Denominators

| Quantity | Definition | Meaning |
| --- | --- | --- |
| SPR actual hours | SPR Header or Summary actual hours. | Accepted denominator for adjusted building PPH when paired with SCANTRACK canonical net. |
| SPR paid hours | Paid labor hours from SPR staffing or live operations. | Denominator for paid PPH. |
| SCANTRACK scan hours | Employee scan time from SCANTRACK. | Denominator for scan PPH and scan-hour allocation. |
| sort span | Clock time from start to end. | Timeline/flow context, not a paid-hour denominator. |
| paid day | paid hours divided by headcount. | Management lever and DOP planning quantity. |

#### Core Rates

The safe formulas are:

```text
adjusted building PPH = SCANTRACK canonical net volume / SPR actual hours
paid PPH              = outbound net / SPR paid hours
scan PPH              = outbound net / SCANTRACK scan hours
misload frequency     = handled volume / misload count
LIB frequency         = LIB report volume / LIB total
cube utilization      = sum(total loaded cube) / sum(total equipment capacity)
```

The DOP/Plan chapter adds one more planning identity:

```text
required paid hours = projected building volume / planned adjusted building PPH
```

and one outbound staffing identity:

```text
loaders = belt volume / belt load PPH / target paid day
```

The two PPHs are different. Planned adjusted building PPH drives the building manifold. Per-belt load PPH drives outbound loader staffing. The manuscript should never use the adjusted building PPH as if it were a per-loader outbound rate.

#### Blocked Denominators

The payload adapter blocks SPR Summary PPH from being used as adjusted-building truth, blocks simulation `pph_sor` from live operator calibration, and blocks sort-span headcount as a paid-day denominator. These are not minor details. They define the project's mathematical safety boundary.

#### Source Basis

- `Operations/adapters/live_sort_ingestion.py`: adjusted-building-PPH overlap formula and rejected bases.
- `Operations/adapters/tracker_operator_payload.py`: blocked denominators and operator-ready adjusted PPH basis.
- `Live-Sort/tracker_v6.3-codex.html`: Outbounds paid PPH, scan PPH, utilization, DOP planning copy, and projection basis.
- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: misload, LIB, cube, SCANTRACK, and work-area denominator logic.

### 6. Route Truth and SLIC-to-PD Mapping

Status: final

The label-training system treats routing as a truth-table problem. A learner does not just memorize a color. The software stores the mapping from ZIP, SLIC, bay, belt index, state, and city into an answer surface.

The raw embedded truth table has rows shaped like:

```text
ZIP|SLIC|BAY|BELT_INDEX|STATE|CITY
```

The quiz parser turns each row into:

```text
{ zip, slic, bay, belts, state, city }
```

where `belts` is an array because some rows may have more than one valid belt.

#### SLIC, Bay, Belt, State, City

The SLIC identifies a destination or routing object. The bay identifies a local loading or sort-location detail. The belt index maps into the configured belt topology. State and city make the label prompt realistic and allow the sampler to build state-specific curriculum buckets.

The training system therefore has two related truths:

- route truth: what belt or belt set is accepted for a prompt,
- curriculum truth: how often a learner should see that concept.

Those should stay separate. Changing a sampling weight should not rewrite the truth table.

#### Audited Corrections

Routing correction artifacts live with the label-training project. The tests verify that local audit artifacts exist, that selected clean reassignment examples stay aligned, and that the documented MULTIDEST split-belt behavior for its SLIC is preserved.

The audit report also rolls CURE volume by SLIC and PD belt. For example, it identifies the MULTIDEST routing object — one SLIC, one destination, one destination code, real identifiers withheld — as a major PD-09 rollup item in the audit window. That evidence supports the existence and operational importance of the routing object. The configured training rule still comes from the training constants.

#### Exceptions and Overrides

Shipper-error exceptions are not ordinary ground routes. The config lists exception templates where the label routing state and the address state disagree, and the template supplies the correct belt. Air sort rules are separate again: service code and state/prefix logic can override the ordinary ground route.

The route truth chapter should teach that a label question may be generated from:

```text
ordinary truth row
MULTIDEST state family
shipper-error template
air service rule
```

The learner sees one label, but the software knows which rule family produced it.

#### Editable Truth and Audit Surface

The storage layer separates truth, overlays, flags, and audit logs. The truth table is stored in IndexedDB under `truth_zip_routing`. Overlays can add local route changes. Sorters can flag a questionable answer, producing a flag record with status. Admin truth updates write audit entries.

That means the project is not only a static quiz. It is a controlled route-truth maintenance tool. The manuscript should preserve that distinction: a flagged package is not automatically a truth-table change. It is a review item.

This is the handoff from Part II to Part III. Once route truth is stable enough to name, the project can ask how a learner practices that truth and how a supervisor reads the resulting training evidence.

#### Source Basis

- `Label-Training-Certification/js/quiz.js`: truth parsing, belt arrays, question family selection, and answer scoring.
- `Label-Training-Certification/js/config.js`: belt topology, MULTIDEST, exceptions, air rules, and service overrides.
- `Label-Training-Certification/js/storage.js`: truth table loading, overlays, flags, audit log, and truth-belt update functions.
- `Label-Training-Certification/tests/test_truth_routing.py`: routing artifact and SLIC alignment tests.
- `Label-Training-Certification/audits/routing/SLIC_to_PD_mapping_audit.md`: SLIC-to-PD audit context.

## Part III. Label Training and Certification

Part III turns route truth into a supervised-learning surface. Chapter 7 defines the training problem, Chapter 8 derives the weighted generator, Chapter 9 uses MULTIDEST as the multi-label case study, and Chapter 10 explains what the recorded events can and cannot prove.

### 7. The Training Problem

Status: final

Label training is a supervised classification problem, but it is not the clean textbook version where every example has one immutable class and every class appears with the same value to the learner. In the project, the learner sees a generated shipping label and chooses a belt. The software knows the route-truth entry, the question family, the accepted belt set, and whether the answer belongs to a special case such as MULTIDEST, shipper-error exceptions, or air service.

This chapter follows route truth because the classifier's label space is not invented by the model. It comes from the route table, MULTIDEST constants, exception templates, and air rules described in Part II.

The basic mathematical object is:

```text
example = (label display, accepted belt set)
prediction = chosen belt
correct = chosen belt in accepted belt set
```

That last line is the first departure from ordinary single-label classification. For most ordinary ZIP routes, the accepted belt set has one element. For MULTIDEST-state routes, the accepted belt set has three elements: PD-04, PD-05, and PD-09. The implementation stores those as belt indices `[3, 4, 8]` and scores any of them as correct.

#### What the Sorter Sees

The learner does not see a database row. The learner sees a rendered label shell with sender details, recipient details, city/state/ZIP, tracking code, routing code, and sometimes an air-service bar or exception-style presentation. The question generator builds that display from one of four families:

```text
ordinary ground ZIP route
MULTIDEST-state route
shipper-error exception
air service rule
```

The display matters because the training target is recognition under the same kind of partial cueing a person sees on the floor. The code can know SLIC, bay, state, city, route family, and full accepted belt set. The learner sees the label and a small set of button choices.

#### What Correctness Means

For a single-belt label, correctness is equality:

```text
correct = (chosen_belt == expected_belt)
```

For a multi-valid label, correctness is set membership:

```text
correct = chosen_belt in accepted_belts
```

The current event record stores `expected_belt` as the first accepted belt, `actual_belt` as the chosen belt, `correct` as a Boolean, and `multi_valid` as a Boolean. That is enough to compute ordinary accuracy and to mark MULTIDEST attempts as multi-valid. It is not enough to reconstruct the full accepted belt set from the event row alone. For MULTIDEST analytics, the system recovers the family through the ZIP/state truth map and the `multi_valid` flag, but a future event schema should consider storing `expected_belts` directly.

This is a small schema choice with a real statistical consequence. If a learner chooses PD-09 for a MULTIDEST label, the event can be correct while the stored `expected_belt` remains PD-04. Any downstream analysis that groups only by `expected_belt` can make MULTIDEST look more scalar than it really is. Chapter 10 records this as the current full-set analytics gap.

#### Why the Generator Is Not Uniform

A naive training generator would sample uniformly from raw ZIP rows:

```text
P(example row i) = 1 / number_of_truth_rows
```

That distribution would be easy to explain but weak as training. It would overrepresent whatever is large in the truth table and underrepresent rare cases that matter operationally. Shipper-error exceptions and air-service rules would be nearly invisible. MULTIDEST would also be distorted, because it is not just a large set of ordinary ZIP rows. It is a special multi-valid routing family.

The project therefore treats training as curriculum sampling, not as an unbiased survey of live volume. The generator lets supervisors boost state families, control MULTIDEST exposure, include or exclude air questions, emphasize shipper-error exceptions, and optionally restrict prompts to selected belts. That is appropriate for training, but it changes the interpretation of the measured accuracy.

The valid claim is:

```text
quiz accuracy estimates performance under the configured curriculum distribution
```

The invalid claim would be:

```text
quiz accuracy is an unbiased estimate of live floor accuracy under the true package distribution
```

The latter would require a sampling distribution tied to observed live package flow or a separate validation study.

#### Training as a Feedback System

The storage layer records quiz attempts and supports exports. The analytics layer then computes overview stats, per-belt accuracy, per-sorter accuracy, missort patterns, sorter sessions, belt breakdowns, time-window trends, knowledge-map filters, and MULTIDEST/air category views. These are descriptive training analytics. They can identify which people, belts, states, or categories need more coaching. They do not by themselves prove that the curriculum caused a later floor-performance improvement.

Flags and overlays add another feedback path. A sorter can flag a questionable routing answer. The flag starts as a review item, not as a truth-table change. Admin actions and audit records are the controlled route from user feedback back into route truth.

#### Source Basis

- `Label-Training-Certification/js/quiz.js`: generated label families, accepted belt arrays, answer scoring, MULTIDEST override, and saved event fields.
- `Label-Training-Certification/js/config.js`: MULTIDEST belt family, MULTIDEST state list, exception templates, and air rules.
- `Label-Training-Certification/js/storage.js`: event storage, CSV export, flags, truth loading, quiz config persistence, and audit records.
- `Label-Training-Certification/js/analytics.js`: overview stats, belt/sorter stats, missort matrix, session chunks, knowledge-map filtering, and MULTIDEST/air filters.
- `Label-Training-Certification/tests/test_truth_routing.py`: routing artifact and documented split-belt behavior for its SLIC.

### 8. Quiz Generation From First Principles

Status: final

The label quiz is a weighted sampling system. It does not simply pick a random ZIP from the truth table. That would train the operator on the shape of the raw ZIP corpus, not on the shape of the mistakes and exceptions that matter on the sort.

The generator starts from a route truth table. Each row has this shape:

```text
ZIP|SLIC|BAY|BELT_INDEX|STATE|CITY
```

The parser turns each row into an entry with a ZIP, SLIC, bay, one or more valid belt indices, state, and city. It also builds a state index: `state -> entries`. That state index is what makes weighted curriculum control possible.

This chapter is where the manuscript moves from "what is true" to "what should be sampled." The two are different. A route-truth table defines valid answers; a quiz generator defines exposure.

#### The Sampling Problem

A training quiz has a different objective from a traffic report. A traffic report can ask, "How much volume did this destination receive?" A quiz asks, "What should a person learn to recognize?"

Those are not the same question. If the generator sampled uniformly from every ZIP row, large ordinary route families would dominate. Rare shipper-error exceptions and air-service overrides would barely appear. MULTIDEST would also behave badly: its states have enough ZIP mass to swamp other state boosts, but operationally MULTIDEST is a special multi-belt decision family, not just thirteen ordinary states.

The quiz therefore samples question classes first, then samples a concrete label inside the chosen class. The class weights are not raw counts. They are operator-controlled curriculum weights.

#### The Buckets

The current generator has four question buckets:

1. Regular ground ZIP routes.
2. MULTIDEST-state routes.
3. Shipper-error exceptions.
4. Air sort rules.

The regular bucket is built from non-MULTIDEST states only. For each non-MULTIDEST state `s`, the generator takes that state's truth-table entries, applies the optional belt filter, and gives the state this weight:

```text
state_weighted_mass_s = supervisor_state_weight_s * entry_count_s
```

The regular mass is:

```text
R = sum(state_weighted_mass_s for all non-MULTIDEST states s)
```

If the random draw lands in the regular bucket, the generator chooses the state by cumulative weighted mass, then chooses one entry uniformly from that state's filtered entries.

MULTIDEST is not left inside that regular state pool. The generator removes the configured MULTIDEST states from the regular pool and puts their entries into one separate MULTIDEST bucket.

Exception and air questions are also separate buckets. This matters because there are only a handful of shipper-error templates and air-service rules. If they competed by raw row count against the ground ZIP table, they would almost never be selected.

#### Average-State-Equivalent Weighting

The common unit is the "average-state equivalent." The generator first computes the average regular-state contribution:

```text
avg_state_contrib = R / count(non_MULTIDEST_states)
```

Then MULTIDEST, exceptions, and air receive mass in that same unit:

```text
C = multidestWeight    * avg_state_contrib
E = exceptionWeight * avg_state_contrib
A = airWeight      * avg_state_contrib
```

The full sampling mass is:

```text
G = R + C + E + A
```

So the probability of drawing each special bucket is:

```text
P(MULTIDEST)     = C / G
P(exception) = E / G
P(air)       = A / G
```

And for a regular non-MULTIDEST state:

```text
P(state s) = state_weighted_mass_s / G
```

This is the key design choice. `multidestWeight = 8` means "sample the MULTIDEST bucket like eight average states," not "multiply every MULTIDEST ZIP by eight." That distinction keeps the MULTIDEST share stable when a supervisor boosts another state family. It also makes exception, air, and MULTIDEST weights comparable even though those buckets have very different raw row counts.

#### MULTIDEST Handling

MULTIDEST is handled twice: once during sampling and once during answer construction.

During sampling, the generator pulls all entries from these MULTIDEST states into one bucket:

```text
MS, IA, WI, MN, SD, ND, NE, LA, OK, CO, WY, AZ, NM
```

During answer construction, any entry whose state is in that MULTIDEST set has its valid belts overridden to the configured MULTIDEST belt family:

```text
PD-04, PD-05, PD-09
```

In code, those are belt indices `[3, 4, 8]`, which map to PD-04 Middle Yellow, PD-05 Bottom Red, and PD-09 Top Red.

The answer interface treats that as a set-valued answer. If the learner chooses any one of those belts, the answer is correct. The feedback then names the accepted belt set. Distractor selection also changes: for a multi-valid answer, the interface shows all valid MULTIDEST belts plus one unrelated wrong belt, instead of hiding two of the correct answers as if they were wrong.

That is the first important mathematical lesson from the training system: the target label is sometimes a set, not a scalar.

#### Belt Filters and Presets

The same sampler supports focused drills. If a belt filter is active, regular entries are filtered to those whose belts overlap the selected belts. Exceptions and air rules are filtered by their target belt. MULTIDEST entries are kept when the filter overlaps either the entry's belts or the MULTIDEST belt family.

The settings UI also supports boosted states and presets. The MULTIDEST preset selects the same thirteen MULTIDEST states listed above. That state boost is separate from the MULTIDEST bucket weight. A future test should pin the exact behavior when both the MULTIDEST bucket and MULTIDEST state boosts are active, because the generator intentionally excludes MULTIDEST states from the regular pool before regular state weights are applied.

There is one current consistency issue in the defaults. The quiz engine initializes `multidestWeight` to 4. The quiz settings screen falls back to 8 when no saved config exists and describes 8 as the default. The reset action writes 4. That does not break the sampling method, but it does mean the default should be normalized in code before this chapter is marked verified.

#### What This Proves and Does Not Prove

This source pass proves the generator's mechanism:

- Truth rows are parsed into route entries and state groups.
- MULTIDEST states are removed from the regular state pool.
- MULTIDEST, exceptions, and air are weighted in average-state-equivalent units.
- MULTIDEST answers are multi-valid across PD-04, PD-05, and PD-09.

It does not prove the optimal MULTIDEST weight. It does not prove that the current question mix is the best curriculum. It does not prove that a learner who passes the quiz will perform correctly under live sort pressure. Those claims require training outcomes, missort analysis, supervisor review, or a controlled before/after study.

For now, Chapter 8 can make one rigorous claim: the quiz generator is a weighted curriculum sampler with explicit safeguards for rare exceptions and MULTIDEST's multi-belt routing structure.

#### Source Basis

- `Label-Training-Certification/js/quiz.js`: truth parsing, weighted question selection, MULTIDEST bucket construction, average-state-equivalent mass, distractor selection, and multi-valid feedback.
- `Label-Training-Certification/js/config.js`: belt names, MULTIDEST belt family, MULTIDEST state list, shipper-error exceptions, and air sort rules.
- `Label-Training-Certification/js/app.js`: quiz settings UI, MULTIDEST weight control, MULTIDEST state preset, belt filters, and reset behavior.
- `Label-Training-Certification/audits/routing/SLIC_to_PD_mapping_audit.md`: MULTIDEST audit context for routing evidence.

### 9. MULTIDEST as a Case Study in Multi-Label Training

Status: final

MULTIDEST is the first clean example where the training problem is not single-label classification. A normal label question asks for one belt. MULTIDEST asks for a valid member of a belt set.

The chapter should be read as a case study in label-space design. It does not introduce a second MULTIDEST rule; it explains why the existing rule changes the mathematics of scoring and analytics.

The current training rule is explicit in the routing constants: MULTIDEST has three accepted belts, PD-04, PD-05, and PD-09. In code these are belt indices `[3, 4, 8]`, mapped to PD-04 Middle Yellow, PD-05 Bottom Red, and PD-09 Top Red. The state list attached to that rule is:

```text
MS, IA, WI, MN, SD, ND, NE, LA, OK, CO, WY, AZ, NM
```

That means the target is not a scalar like:

```text
y = PD-09
```

It is a set:

```text
Y = {PD-04, PD-05, PD-09}
```

A learner's answer is correct when the selected belt is an element of that set:

```text
correct(answer, Y) = 1 if answer in Y, else 0
```

This is a small change mathematically, but it matters operationally. If the software forced one canonical belt, then two valid floor answers would be marked wrong. That would train hesitation and false negatives into the certification process.

#### Why MULTIDEST Breaks the One-Label Model

Most route questions fit a one-label model. A ZIP maps to a destination. The destination maps to a belt. The learner chooses the belt. That gives a simple target:

```text
ZIP -> belt
```

MULTIDEST does not fit that simple shape. The project encodes MULTIDEST as a destination family servicing multiple states through three valid belts. The quiz therefore maps the state family to a valid belt set:

```text
MULTIDEST_state -> {PD-04, PD-05, PD-09}
```

The correct answer is not "the only belt." It is "one of the acceptable MULTIDEST belts." The answer UI follows that rule. When a MULTIDEST question is answered correctly, it reports:

```text
Correct - MULTIDEST load. Accepted: PD-04, PD-05, PD-09
```

The interface also shows all valid MULTIDEST belts as valid answer choices. It does not use two correct belts as distractors. That detail matters because a multi-label test can become incoherent if the display logic still assumes a single target.

#### The Routing Evidence Boundary

The routing audit gives MULTIDEST context. It identifies the routing object — one SLIC, one destination, one destination code, masked here as MULTIDEST — spanning five bays, with CURE volume `651,351`, `46.5%` of the PD-09 belt rollup, and `94` dates in the audit window.

That is evidence that MULTIDEST is a real routing object in the corpus and a major contributor in the audited PD-09 rollup. It is not, by itself, the full proof of the three-belt training rule. The three-belt rule comes from the training configuration. The manuscript should keep those two evidence types separate:

- Audit evidence: MULTIDEST appears in the CURE-backed SLIC-to-PD mapping and carries large volume in the audited corpus.
- Training-rule evidence: the quiz constants define MULTIDEST as a multi-belt valid answer family.

That distinction prevents the book from overstating the audit. The audit grounds the object. The code defines the current training behavior.

#### Curriculum Exposure Without Hard-Coding Questions

The generator does not need to hand-write a fixed bank of MULTIDEST questions. It uses the truth table and the MULTIDEST state list. During question selection, it builds a MULTIDEST bucket from all entries belonging to the configured MULTIDEST states. The sampler controls the bucket's frequency with `multidestWeight`.

This is better than hard-coding examples because the question surface still varies by ZIP, city, and label rendering. The repeated concept is the MULTIDEST decision rule, not the exact same label.

In first-principles terms, the generator separates two things:

```text
concept frequency: how often MULTIDEST appears
instance variation: which MULTIDEST-state ZIP appears this time
```

That is the core curriculum design. The supervisor can increase exposure to a concept without freezing the learner into memorizing a small set of fixed cards.

#### Measuring Confusion When the Target Is a Set

For a single-label target, the basic confusion question is:

```text
expected belt = b
chosen belt = c
```

The result is either a hit or a miss. For MULTIDEST, the target is a set:

```text
expected set = {PD-04, PD-05, PD-09}
chosen belt = c
```

That creates two useful measurements:

1. Set accuracy: did the learner choose any valid MULTIDEST belt?
2. Within-set preference: when the learner was correct, which valid MULTIDEST belt did they choose?

The first measure is certification logic. The second measure is diagnostic. If every learner chooses PD-09, that may be fine if the floor behavior supports it. If a supervisor expects balanced recognition across the MULTIDEST family, the training analytics should track the chosen valid belt inside the accepted set.

A future analytics pass should separate these outcomes:

```text
valid MULTIDEST answer: chosen in {PD-04, PD-05, PD-09}
near miss: chosen belt is in the same visual family but not valid
route miss: chosen belt is outside the MULTIDEST family
```

That would let the certification system distinguish "does not know MULTIDEST" from "knows the color family but picked an invalid belt" from "knows MULTIDEST but has a within-family preference."

#### What This Chapter Can Claim

This chapter can claim that the project implements MULTIDEST as a set-valued answer in the training system. It can claim that MULTIDEST is sampled as a separate curriculum bucket. It can claim that the audit contains a MULTIDEST routing object with substantial CURE volume in the audited window.

It cannot claim that the three-belt rule is empirically optimal. It cannot claim that the current MULTIDEST question rate is the best training rate. It cannot claim that within-set learner preference predicts live sort performance. Those are future research questions.

The rigorous version is narrower and stronger: MULTIDEST is the project's first formal multi-label training case, and the current software treats correctness as set membership rather than equality to one canonical belt.

#### Source Basis

- `Label-Training-Certification/js/config.js`: MULTIDEST belt family, MULTIDEST state list, and belt name mapping.
- `Label-Training-Certification/js/quiz.js`: MULTIDEST state override, multi-valid scoring, MULTIDEST feedback, and distractor behavior.
- `Label-Training-Certification/audits/routing/SLIC_to_PD_mapping_audit.md`: MULTIDEST SLIC audit context and CURE volume.

### 10. Certification Analytics

Status: final

Certification analytics turn quiz answers into supervisor evidence. The unit is a sort event, stored when the learner answers a question:

```text
sorter_id
zip
expected_belt
actual_belt
correct
multi_valid
timestamp
```

The analytics layer is built mostly from pure reducers over those events. It does not need to know how the label was drawn. It needs to know the expected belt, the chosen belt, whether the answer was correct, and when the event occurred.

#### Overview Metrics

The overview reducer computes:

```text
total events
correct events
active sorter count
error rate = round((1 - correct / total) * 100)
accuracy = round(correct / total * 100)
```

The dashboard also builds seven-day team accuracy, daily volume, active sorter counts, worst qualifying belt, worst qualifying sorter, and sorter-of-week. These are descriptive training metrics. They can guide coaching, but they do not by themselves prove live operational performance.

#### Belt and Sorter Statistics

For belt stats, the denominator is the number of events where that belt was the expected belt:

```text
belt_accuracy_b = round((1 - errors_b / total_b) * 100)
```

For sorter stats, the denominator is that sorter's answered events:

```text
sorter_accuracy_i = round(correct_i / total_i * 100)
```

The analytics layer uses minimum sample thresholds in the callouts. Worst belt requires at least five events for that belt. Worst sorter requires at least ten attempts. Sorter-of-week requires at least twenty attempts in the last seven days. These thresholds prevent single-event noise from being displayed as a leaderboard or coaching priority.

#### Missort Matrix

The missort matrix filters to wrong answers only, then counts:

```text
matrix[expected_belt][actual_belt] += 1
```

Rows are the belt a package should have gone to. Columns are the belt the learner chose. This is a confusion matrix over belt choices. It is especially useful because it distinguishes two different failures:

- learners missing a target belt,
- learners sending other target belts into the selected belt.

That distinction becomes explicit in the belt deep-dive.

#### False Negatives and False Positives

For a selected belt `b`, the belt deep-dive uses two views.

The false-negative side starts with all events where:

```text
expected_belt = b
```

A miss is any event in that set where `correct` is false. The reducer reports who misses that belt and which wrong belts they chose instead.

The false-positive side starts with all wrong events where:

```text
actual_belt = b and correct = false
```

Those are packages incorrectly sorted to belt `b`. The reducer reports which belts they should have gone to and which sorters contributed those false positives.

This is more useful than a single "belt accuracy" number. A belt may be a problem because people fail to send its packages there, or because they send unrelated packages there. The coaching action differs.

#### Sessions and Trends

Sorter drilldowns chunk a sorter's event stream into sessions of fifteen events. Each chunk has:

```text
session_accuracy = round(correct_in_chunk / chunk_size * 100)
```

The trend chart is therefore not a calendar-day estimate. It is an ordered sequence of fixed-size practice chunks. That matters: a learner who answers thirty questions in one day can produce two session points.

Team trend compares the last seven days against the prior seven days. Daily series use a recent day grid ending at the current day. The heatmap uses the last thirty days and aggregates by day of week and hour:

```text
grid[day_of_week][hour].total += 1
grid[day_of_week][hour].errors += 1
```

Cell accuracy is:

```text
round((total - errors) / total * 100)
```

#### Aisles and Sorter of the Week

Aisle analytics join events to the sorter roster. If a sorter has a `sort_aisle`, their events contribute to the corresponding aisle. The reducer counts total, correct, participating sorters, top missed belt, and per-sorter accuracy inside each aisle.

Sorter-of-week filters to the last seven days, ranks sorters who have at least twenty attempts by accuracy, then uses total attempts as a tie-breaker. Improvement is a half-split measure over that sorter's recent event sequence:

```text
improvement = accuracy(last half) - accuracy(first half)
```

Only when each half has at least five events does the improvement field appear.

#### Certification Boundary

These analytics support training supervision. They can identify problem belts, confused belt pairs, sorters needing coaching, aisle-level patterns, and practice trends. They cannot prove live sort productivity or causal training impact without a separate outcome study.

The current event schema stores `expected_belt` as the first accepted belt even when the answer is multi-valid. It stores `multi_valid = true`, which is enough to protect scoring, but future MULTIDEST analytics should preserve the full expected belt set if the manuscript wants within-set preference analysis.

#### Closing the Training Arc

Part III starts with route truth as a classification target and ends with event analytics as supervisor evidence. The next part changes scale. Instead of asking whether one learner chooses the right belt, the dashboard chapters ask how a supervisor reads a whole sort from SPR, CURE, SCANTRACK, SVQ, LIB, misload, and employee sources.

The transition matters because the denominator changes. Training accuracy is event-count based. Dashboard performance metrics use package counts, load rows, scan totals, cube capacity, report volumes, and labor-hour fields. The same evidence discipline carries forward, but the measured object is no longer a quiz attempt.

#### Source Basis

- `Label-Training-Certification/js/quiz.js`: answer recording and multi-valid scoring.
- `Label-Training-Certification/js/storage.js`: `sort_events` persistence and CSV export fields.
- `Label-Training-Certification/js/analytics.js`: overview, belt stats, sorter stats, missort matrix, team trend, session chunking, belt deep-dive, aisle stats, daily series, sorter-of-week, and heatmap reducers.
- `Label-Training-Certification/index.html`: supervisor analytics tabs.

## Part IV. Pre-Sort Dashboard Analytics

Part IV changes the unit of analysis from training events to sort-level operational files. The training chapters ask whether a learner chose an acceptable label or belt. The dashboard chapters ask whether a supervisor can read SPR, CURE, SCANTRACK, SVQ, LIB, misload, and employee files without collapsing their denominators into one vague performance number.

This part should be read as the manuscript's first full example of measurement architecture. Chapter 11 names the planning question. Chapter 12 names the parser boundary. Chapter 13 freezes the parsed result as a snapshot. Chapters 14 and 15 show why cube, misload, and LIB analytics need separate denominators and separate claim limits.

### 11. The Pre-Sort Planning Problem

Status: final

Pre-sort planning is the moment when the project must turn historical and current evidence into a plan before the building starts moving. The dashboard and DOP/Plan generator answer different sides of the same problem.

This chapter is the hinge between dashboard analytics and later planning math. It should not try to solve staffing in detail. Its job is to name the pre-sort decision, identify which evidence is stable enough to use, and prepare the reader for the DOP formulas in Part VI.

The dashboard asks:

```text
What did the files say about this sort?
```

The DOP/Plan generator asks:

```text
Given expected volume and a planned adjusted building PPH, how many paid hours and loaders are needed?
```

#### The Planning Questions

A pre-sort planning surface should answer:

- How much building volume is expected?
- What is the expected PD/outbound share?
- How many paid hours are required at the planned adjusted building PPH?
- Does available headcount cover those paid hours at the target paid day?
- Which belts require more outbound loaders under per-belt load PPH?
- Which areas have quality or denominator warnings from prior files?
- Which metrics are stable enough to show to an operator?

The key is that volume, hours, headcount, and loaders enter through different gates. A building-level plan can use adjusted building PPH. A per-belt load plan needs per-belt load PPH.

#### Dashboard Before DOP

The pre-sort dashboard parses SPR, CURE, misload, LIB, employee, SVQ Twilight, and SCANTRACK sources into a measurement snapshot. It preserves planned and actual SPR fields, cube utilization, misload and LIB frequencies, SCANTRACK scan metrics, and coordination-group production.

That snapshot history can inform planning, but it should not be confused with a live DOP manifold. The dashboard says what the prior or loaded files measured. The DOP plan uses a smaller set of planning identities:

```text
total paid hours = projected building volume / planned adjusted building PPH
needed average paid day = total paid hours / actual headcount
per-belt loaders = belt volume / belt load PPH / target paid day
```

Those formulas are intentionally simple. The complexity is not the algebra. The complexity is choosing safe inputs.

#### Stable Enough for Planning

The operator payload exposes adjusted building PPH only when its accepted basis is present. It carries DOW building bands and outbound load bands into the tracker contract. It leaves recalibration candidates in analyst detail and blocks unsupported metrics.

That means a pre-sort number can appear in one of three states:

| State | Meaning |
| --- | --- |
| Ready | Accepted basis and allowed surface exist. |
| Analyst detail | Useful but not ready for operator planning. |
| Blocked | Must not be used as an operator-facing planning claim. |

This classification is part of the planning method. A plan built from a blocked denominator may be arithmetically correct and operationally wrong.

#### Risk Areas

Pre-sort risk areas are not only high volume. Risk can come from:

- wide projection bands,
- low source depth,
- post-holiday volume effects,
- cube gaps,
- repeated misload patterns,
- LIB frequency,
- weak belt load PPH history,
- unavailable SPR or SCANTRACK overlap,
- and conflicting source dates.

The dashboard and tracker should show these as evidence conditions, not as causal explanations.

#### Source Basis

- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: dashboard file slots, rebuild path, snapshot builder, misload/LIB/cube/SCANTRACK analytics.
- `Live-Sort/tracker_v6.3-codex.html`: DOP/Plan generator copy, projection bands, paid-hour target, two-PPH distinction, and per-belt loader formulas.
- `Operations/adapters/tracker_operator_payload.py`: operator-ready DOP fields and analyst/blocked separation.

### 12. Parsing SPR, SVQ, SCANTRACK, CURE, Misload, LIB, and Employee Data

Status: final

The dashboard parser layer is the place where operational files become named measurement objects. It does not yet decide whether a metric is good or bad. Its first job is stricter: read each file, normalize fields, preserve source boundaries, and make denominator choices explicit enough that later analytics cannot accidentally mix unlike quantities.

The active implementation lives in `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`. The file uses one rebuild path: reset `DATA`, parse each uploaded source if present, render the dashboard, then build and save a snapshot when a SPR date exists. Optional files are additive. A missing CURE, LIB, SCANTRACK, or SVQ file does not invalidate the SPR parse; it only leaves the affected metrics empty.

#### SPR: Planned, Actual, Staffing, and Production

The SPR parser extracts three classes of information.

First, filename metadata:

```text
sortDate = date token in SPR filename
sortCode = final T, D, or N token
facility = token between SPR-US- and the date
```

Second, the Summary sheet becomes two dictionaries:

```text
summary.planned[label] = planned value
summary.actual[label]  = actual value
```

This is why later dashboard chapters can name planned and actual `Volume`, `PPH`, `Hours`, `Paid Day`, `% Smalls`, `Worked`, and `Sort Span` as SPR Summary fields rather than re-derived dashboard numbers.

Third, the Staffing sheet becomes employee-level rows and PAYACTUAL rollups. For each staffing row, the parser records work area type, work area, job, employee id/name, FT/PT, pay code, start/end fields, hours, paid day, and a coordination group. Only `PAYACTUAL` rows contribute to the staffing rollups:

```text
coordGroup.hours   = sum(PAYACTUAL hours)
coordGroup.paidDay = sum(PAYACTUAL paid day)
coordGroup.hcCount = count(distinct employee id/name)
```

The Work Area Types sheet is different. It is not an employee staffing table. The parser looks for subtotal rows where work area type and work area are filled but job and employee name are blank. Those subtotal rows produce per-work-area production records:

```text
netVol
netPPH
hours = netVol / netPPH
planNetVol
planNetPPH
actualStaffing
coordGroup
```

That separation prevents a common denominator error: staffing hours from PAYACTUAL and derived production hours from `netVol / netPPH` are both hours, but they are not the same measurement.

#### CURE: Load Rows, TFCS Subsets, and Cube Gaps

The CURE parser reads the first worksheet and maps column names such as `Ld Create Dt`, `OS`, `Dest`, `Util %`, `Avg TFCS %`, `Pieces per Wall`, `Total Loaded Cube`, `Total Equip Cap`, and `Total Loads`.

Each destination/date/sort-code row becomes a cube record. The parser then builds two derived sets:

```text
highTfcsRows = rows where Avg TFCS % >= 95
gapRows      = highTfcsRows where Util % < 75 and Pieces per Wall > 0
```

For each gap row, the parser computes the pieces-per-wall target needed to reach 75% utilization under a proportional scaling assumption:

```text
ppwGoal = ppw * (75 / util)
ppwGap  = ppwGoal - ppw
```

That is not a causal claim about why a destination missed cube. It is an inversion of the current row's displayed utilization and pieces-per-wall values.

#### Misload and SVQ Twilight

The dashboard has two related but distinct exception inputs.

The row-level misload parser reads a SVQ Report, finds the header row, and records each non-total error row with:

```text
error type
work area
employee
load date
tracking number
plan flow
next scan
destination
city/state
coordination group
```

It also builds count maps:

```text
byArea
byNextScan
byDest
byPattern[planFlow + "|||" + nextScan]
```

The SVQ Twilight Summary parser is aggregate. It reads per-area scan totals and misload totals, then stores a building total from the TOTAL row. It also groups area rows into coordination groups such as PD1-4, PD5-8, PD9-12, Smalls Sort, Air, Back Feeds, Unassigned, Primary, and Other.

The manuscript should keep these two sources separate: one is event-level detail, the other is volume and misload aggregation by area.

#### LIB

The LIB parser reads the `SVQ LIB Summary` sheet. It pulls labeled values from column A to column B:

```text
date
volume
lib total
derived
opl
lib scanned
rnp
```

Then it finds the scan-log header row and records each non-total row with error type, work area, employee, load date, tracking number, origin, destination, plan flow, next scan, and city/state. It builds counts by LIB type and work area.

If the report does not provide `LIB Total`, the parser falls back to the number of scan-log rows:

```text
totalLIB = labeled LIB Total if present
totalLIB = count(scan-log rows) otherwise
```

The LIB parser carries its own date and volume because the LIB report is not necessarily aligned to the SPR sort date.

#### SCANTRACK Employee Summary

The SCANTRACK parser reads the Twilight Employee Summary. It expects a title row, a header row, and employee rows below. It keeps the first occurrence per user and skips later duplicate rows, because the first occurrence is treated as the total row.

It excludes scanner IDs that begin with `SLS`, `ASX`, or `SS`, plus exact-match exclusions configured in the file. The output rows contain:

```text
user
packages
scan hours
scan PPH
```

Those values support SCANTRACK scan productivity metrics. They are not SPR paid-hour metrics.

#### Employee Data and Inbound Scanner Handling

The Employee Data parser reads from a fixed header offset and skips the final TOTALS row. It separates three classes of scanner rows:

```text
inbound group rows
SLS rows
standard employee rows
```

Inbound numeric IDs are routed into unload, bulk-belt, and primary-feed groups. SLS rows are retained separately. Standard employee rows must match the accepted employee-id pattern and must not be in the explicit exclusion set.

For each kept row the parser records scanned volume, reported volume, scan efficiency, misload count, derived misload frequency, LIB count, and LIB scan frequency. These rows support inbound and employee scan tables, not the SPR staffing model.

One field deserves an explicit warning. Scan efficiency is scanned volume over reported volume, and it is tempting to treat `scanned <= reported` as an invariant and "correct" any row that violates it. The project verified the opposite: scan volume legitimately exceeded reported volume on 3 of 30 audited production sorts, and an early analysis pass that silently corrected such rows was itself the error and had to be backtracked. The synthetic-generator calibration preserves this as a documented failure mode (`anomaly_rates.scan_gt_reported_p`) rather than a corpus statistic, and the reconciliation packet documents it as a difficulty-variant trap for exactly that reason. The rule: a scan-efficiency value above 100% is evidence about the sources, not a data error to normalize away (CL-0254).

#### Rebuild Order

The dashboard rebuild sequence is deliberately simple:

```text
reset DATA
parse uploaded SPR if present
parse CURE, misload, LIB, employee, SVQ Twilight, and SCANTRACK if present
render all tabs
build snapshot
save snapshot if the snapshot exists
```

This order means SPR is the spine for sort date, sort code, facility, and planned/actual fields. Other sources attach detail around that spine. The parser layer can therefore claim source lineage and denominator separation. It cannot claim operational causality, complete file availability, or interchangeability among scan hours, paid hours, production-derived hours, and report-specific volumes.

#### Source Basis

- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: `parseSORFile()`, `parseCURE()`, `parseMisload()`, `parseSEASTwilight()`, `parseLIB()`, `parseIGate()`, `parseEmployeeData()`, and `rebuildDashboard()`.

### 13. Snapshot Construction

Status: final

A dashboard snapshot is the daily record that survives after the uploaded files are parsed. It is not a raw file dump. It is a compact measurement object: one sort date, one sort code, one facility, a set of plan-versus-actual KPIs, and a set of derived denominators that can be compared over time.

The active dashboard writes snapshots into IndexedDB under the database name `hub_ops_trends_db`, object store `snapshots`. The snapshot key is:

```text
snapshotKey = sortDate + "_" + sortCode
```

That key matters. It says the unit of trend history is not merely "June 2." It is "June 2, Twilight" or "June 2, Day" or "June 2, Night."

#### Snapshot Preconditions

The dashboard only saves a snapshot when it has a sort date. The sort date comes from the SPR filename, not from a chart label or browser clock. If no SPR date is available, `buildSnapshot()` returns `null`.

That is the first evidence rule for the dashboard:

```text
no SPR date -> no saved trend snapshot
```

The rebuild flow parses available files, renders the dashboard, then calls `buildSnapshot()`. If the snapshot exists, it saves the record to IndexedDB. Missing optional files do not prevent a snapshot from being built, but their metrics become zeros or empty structures.

#### Overview KPIs

The overview metrics come from the SPR Summary sheet. The parser stores the SPR Summary into two dictionaries:

```text
summary.planned[label]
summary.actual[label]
```

The snapshot copies these plan-versus-actual fields:

```text
netVolume  = planned/actual Volume
netPPH     = planned/actual PPH
totalHours = planned/actual Hours
paidDay    = planned/actual Paid Day
pctSmalls  = planned/actual % Smalls
```

It also stores actual-only fields:

```text
headcount   = actual Worked
flowPerHour = actual Flow Per Hour
sortSpan    = actual Sort Span
```

This chapter should not reinterpret those values. In Chapter 13, they are SPR Summary fields preserved into a trend object. Later chapters can argue about whether a metric is a good operator metric, but the snapshot layer's first responsibility is lineage.

#### Smalls Volume

The snapshot stores smalls volume as a derived actual value:

```text
smalls_actual_volume = actual_volume * actual_percent_smalls
```

The implementation rounds that value. It also stores the planned and actual smalls percentages. This distinction matters because smalls percentage is a rate, while smalls volume is a count derived from a rate and a volume denominator.

#### Misload Frequency Denominator

The misload snapshot has two parts:

```text
totalMisloads = count(misload rows)
misloadFreqDenom = handled volume / totalMisloads
```

The denominator is not always the same source. The code prefers SVQ Twilight total volume when that value exists:

```text
handled_volume = SVQ_Twilight_total_volume
```

If SVQ Twilight volume is not available, it falls back to SPR actual volume plus SPR actual air volume:

```text
handled_volume = SPR_actual_Volume + SPR_actual_Air_Volume
```

Then:

```text
misload_frequency_denominator = round(handled_volume / totalMisloads)
```

If there are no misloads or no handled volume, the value is zero.

This metric should be read as "one misload per N handled packages" for the chosen denominator. It is not a causal explanation of why misloads happened.

#### LIB Frequency Denominator

The LIB snapshot uses the LIB report's own volume and LIB total:

```text
libFreqDenom = round(LIB_volume / totalLIB)
```

The LIB parser reads the report date, volume, LIB total, derived, OPL, scanned, and RNP from labeled rows in the SVQ LIB Summary sheet. If the report does not provide a LIB total, the parser falls back to the count of scan-log rows.

The code comments note that the LIB report is three days behind the SPR sort date. That is why the snapshot does not use SPR volume as the LIB denominator. It uses the volume packaged with the LIB report.

#### Cube Utilization

Cube utilization is stored as aggregated utilization, not an average of row percentages.

For a filtered set of CURE rows:

```text
cube_utilization = sum(total_loaded_cube) / sum(total_equipment_capacity) * 100
```

The snapshot stores four cube views:

```text
allUtil
allTFCS95Util
osUtil
osTFCS95Util
```

It also stores the load counts for the TFCS>=95 subsets. The OS-specific views use the current sort code, so a Twilight sort snapshot compares against CURE rows whose OS matches that sort code.

This is a good example of denominator discipline. Averaging `Util %` row by row would let tiny and large load groups contribute equally. The implemented snapshot uses loaded cube and capacity totals, so larger load groups carry proportional weight.

#### SCANTRACK Summary Metrics

SCANTRACK contributes an employee scan summary:

```text
empCount   = count(SCANTRACK rows)
totalPkgs  = sum(row.packages)
totalHours = sum(row.scan_hours)
avgPPH     = totalPkgs / totalHours
```

The SCANTRACK parser deduplicates users by taking the first occurrence per user and excludes synthetic or non-human scanner prefixes such as SLS, ASX, and SS, plus specific exact-match exclusions.

The snapshot therefore treats SCANTRACK PPH as scan-package volume divided by scan hours for the included employee rows. It is not the same denominator as SPR actual hours or paid day.

#### Work Area Volumes and PPH

Work area production comes from the SPR Work Area Types sheet. The parser extracts work-area subtotal rows, where the work area type and work area are filled but job and employee name are blank.

For each work area, it stores:

```text
netVol
netPPH
hours = netVol / netPPH
planNetVol
planNetPPH
actualStaffing
coordGroup
```

The snapshot then builds:

```text
coordGroupVols = sum(netVol by coord group)
workAreaVols   = netVol by work area
pdVols         = netVol for PD-1 through PD-12
workAreaPPH    = netPPH by work area
coordGroupHours = sum(derived work-area hours by coord group)
```

The important denominator is `netPPH`. Work-area hours in this part of the snapshot are derived from production:

```text
derived_hours = net_volume / net_PPH
```

They are not the same as paid hours from the Staffing sheet. The dashboard also parses PAYACTUAL staffing records, but Chapter 13's `coordGroupHours` field is built from Work Area Types production hours, not directly from PAYACTUAL staffing hours.

#### Persistence

After every rebuild, the dashboard calls:

```text
snapshot = buildSnapshot()
if snapshot exists:
    IDB.put(snapshot)
```

The persistence layer is local IndexedDB. That is appropriate for a browser-based operational dashboard because the trend record survives page reloads without requiring a server. It also means the trend database is a local browser artifact, not a central source of truth.

#### What This Chapter Can Claim

This chapter can claim that the dashboard snapshot is a source-lineage object built after parsing available operational files. It can claim the denominator rules for misload frequency, LIB frequency, cube utilization, SCANTRACK average PPH, and work-area derived hours. It can claim that snapshots are keyed by sort date and sort code and saved to IndexedDB when a SPR date exists.

It cannot claim that the snapshot alone proves operational causality. It cannot claim that all optional source files are always present. It cannot claim that SPR PPH, SCANTRACK PPH, paid day, scan hours, and work-area derived hours are interchangeable. The whole reason this chapter exists is to keep those denominators separate.

#### Source Basis

- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: `buildSnapshot()`, IndexedDB snapshot persistence, SPR Summary parsing, Work Area Types extraction, CURE parsing, SVQ Twilight parsing, misload parsing, LIB parsing, and SCANTRACK parsing.

### 14. Cube and CURE Analytics

Status: final

Cube analytics measure how trailer space is being used. In the dashboard, CURE is not treated as a single score. It is a set of destination/date/sort-code rows with loaded-cube, equipment-capacity, utilization, TFCS, pieces-per-wall, and load-count fields. The chapter's main mathematical rule is to preserve whether a calculation is row-level or aggregate.

#### The Row

After parsing, a CURE row represents one destination/date/sort-code load aggregate. The core fields are:

```text
date
OS
destination
destination name
TFCS percentage
utilization percentage
pieces per wall
average net
total loaded cube
total equipment capacity
total loads
```

The dashboard uses `Avg TFCS %` as a reliability filter. A row enters the high-TFCS set when:

```text
TFCS >= 95
```

The reason for this filter is practical: when trailer fill-by-count is high, utilization is more interpretable as a cube-space measure. A low-TFCS row can still matter operationally, but the dashboard's high-TFCS tables and heatmaps do not use it as a primary cube-performance row.

#### Aggregate Utilization

The snapshot and cube tiles use aggregate utilization for multi-row summaries:

```text
aggregate_utilization = sum(total_loaded_cube) / sum(total_equipment_capacity) * 100
```

This is different from the simple average:

```text
simple_average_utilization = mean(row.utilization_percent)
```

The aggregate formula weights larger load groups by their cube capacity. A simple row average would let a small destination and a large destination have the same influence. The implementation keeps both ideas visible in code, but the KPI tiles use the aggregate loaded-cube denominator.

The active cube tiles are:

```text
overall division, all OS
all OS where TFCS >= 95
selected OS
selected OS where TFCS >= 95
```

The selected OS follows the SPR sort code in auto mode, or can be set to all, T, D, or N from the cube tab control.

#### Goals and Bands

The dashboard has two goal concepts:

```text
overall cube goal fallback = 62.2%
high-TFCS cube goal        = 75.0%
```

The overall goal is editable in the UI and persisted in browser local storage. The high-TFCS goal is fixed in the implementation as 75%.

Row-level utilization bands are:

```text
0-65    deep red
65-70   red
70-75   orange
75-80   green
80+     deep green
```

These bands are display thresholds. They are not statistical confidence intervals.

#### Gap Rows and Pieces Per Wall

A cube gap row is a high-TFCS row whose utilization is below 75% and whose pieces per wall is positive:

```text
gap_row = (TFCS >= 95) and (utilization < 75) and (ppw > 0)
```

The parser computes the pieces-per-wall target needed to reach 75% under proportional scaling:

```text
ppw_goal = ppw * (75 / utilization)
ppw_gap  = ppw_goal - ppw
```

This is a local algebraic inversion. It says: if all else scaled proportionally, this is the pieces-per-wall number associated with 75% utilization. It does not prove that adding that many pieces would be feasible, safe, or sufficient in a real loading process.

#### Destination-Date Heatmap

The cube heatmap uses only high-TFCS rows. For each destination and date, it averages row utilization when multiple CURE rows land in the same cell:

```text
cell_util(destination, date) = mean(utilization rows for that destination/date)
```

The heatmap can rank destinations by:

```text
total loads
worst average utilization
standard deviation of utilization
```

The standard deviation is computed over that destination's utilization values with the sample denominator when there is more than one value. This makes the "volatile destination" view different from the "lowest average" view.

#### What This Chapter Can Claim

This chapter can claim the threshold rules, denominator formulas, goal constants, and heatmap ranking methods used by the dashboard. It can claim that aggregate cube utilization is loaded cube divided by equipment capacity. It can claim that the 75% PPW gap is a proportional target calculation.

It cannot claim that CURE alone explains the cause of low cube. It cannot claim that all low-utilization rows are bad loads. It cannot claim that a PPW target is an executable load instruction. Those require operational context outside the parser and rendering logic.

#### Source Basis

- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: `parseCURE()`, `cubeOSStats()`, `renderCubeTilesHTML()`, `utilBand()`, `renderCubeTab()`, `renderCubeAll()`, and `renderCubeHeatmap()`.

### 15. Misload and LIB Analytics

Status: final

Misload and LIB analytics turn exception events into rates, rankings, and searchable detail. The key mistake to avoid is treating all exception counts as if they share one denominator. In the dashboard, misload frequency and LIB frequency come from different source systems and different volume fields.

#### Event Counts Are Not Enough

An event count answers "how many." A frequency answers "how often relative to an eligible volume." The dashboard displays both because the count and the denominator can move in opposite directions.

For any exception family:

```text
frequency_denominator = eligible_volume / event_count
```

The display form is:

```text
1 exception per N eligible packages
```

This convention means larger `N` is better. It also means a zero-event case is not a ratio; the dashboard treats it as a zero-event condition, not as infinite performance.

#### Misload Frequency

The dashboard's handled-volume helper follows this priority:

```text
handled_volume = SVQ Twilight total scan volume, if available
handled_volume = SPR actual Volume + SPR actual Air Volume, otherwise
```

Then the misload frequency is:

```text
misload_frequency = handled_volume / total_misloads
```

The dashboard goal badge compares the frequency against:

```text
goal = 1 / 2500
```

In display terms, a frequency denominator at or above 2500 is a green condition; below 2500 is a red condition.

When SVQ Twilight is uploaded, its total misloads and volume drive the top-level KPI. When a legacy row-level misload file is uploaded, the dashboard can still use those rows for area, next-scan, destination, and pattern charts.

#### Misload Breakdown Maps

The row-level misload parser builds four count views:

```text
byArea[work_area]
byNextScan[next_scan]
byDest[destination]
byPattern[plan_flow + "|||" + next_scan]
```

The `byPattern` key is useful because a plan-flow/next-scan pair points to a repeated routing discrepancy without requiring a causal explanation. It is a pattern label, not proof that the plan flow caused the next scan.

SVQ Twilight adds an aggregate detail table by work area and coordination group. For each area:

```text
area_frequency = area_scan_total / area_misload_total
```

For each coordination group:

```text
group_frequency = group_volume / group_misloads
```

The coordination group labels are deterministic mappings from work-area text. They support scanning and comparison; they are not learned clusters.

#### LIB Frequency

LIB uses a separate report volume. The dashboard reads the LIB report's `Volume` field and the LIB total:

```text
lib_frequency = LIB_report_volume / total_LIB
```

The display goal is:

```text
goal = 1 / 1000
```

This is why the LIB chapter should not use SPR volume as the denominator. The source comments state that the LIB report lags the SPR sort date, so the denominator must remain attached to the LIB report's own date and volume.

#### LIB Categories and Filters

The LIB parser reads labeled category totals:

```text
derived
OPL
LIB scanned
RNP
```

The scan-log rows are also grouped by error type, area, plan-flow destination code, and state. By default, the LIB tab filters the detail view to:

```text
BACK FEEDS
UNASSIGNED
PD-*
```

The UI can include all rows, but the default view suppresses areas that are treated as noise or less relevant for the operational breakdown.

The states table is computed over all LIB rows, not only the area-filtered subset. That is a separate denominator choice:

```text
state_share = state_LIB_count / all_state_count_total
```

#### What This Chapter Can Claim

This chapter can claim how the dashboard computes misload frequency, LIB frequency, misload breakdown maps, SVQ Twilight aggregate frequencies, LIB filters, and LIB state shares. It can claim the implementation's goal thresholds of 1/2500 for misloads and 1/1000 for LIB.

It cannot claim that an area, next scan, destination, or employee caused an exception. It cannot use row-level scanner attribution as a blame model. It cannot compare misload and LIB frequency as the same process, because the event definitions and report windows differ.

#### Source Basis

- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: `totalHandledVolume()`, `misloadBadge()`, `renderMisloadTab()`, `renderMisloadDetail()`, `misloadCoordGroup()`, `libBadge()`, `libAreaAllowed()`, `renderLibTab()`, and `renderLibDetail()`.

#### Closing the Dashboard Arc

Part IV starts with the planning problem and ends with exception frequencies. The common thread is source discipline. SPR summary fields, Work Area Types production rows, CURE cube rows, SCANTRACK scan rows, SVQ Twilight totals, misload events, and LIB reports each answer a different question.

The next part keeps that discipline but changes time scale. Instead of rebuilding one pre-sort or post-sort dashboard from uploaded files, the live tracker repeatedly ingests Hub, Employee, and SPR exports and asks whether the current sort state is coherent enough to act on.

## Part V. Live Sort Tracker Methods

Part V turns file parsing into repeated measurement. The live tracker is not a server-side event stream; it is a browser application that groups periodically downloaded files into snapshots, activates the latest coherent state, and renders operator and analyst surfaces from that state.

The sequence is deliberate. Chapter 16 explains ingestion and persistence. Chapter 17 defines Outbounds denominators. Chapter 18 explains Intel as the decision-first surface. Chapters 19 through 23 then unpack the statistical panels that support, but should not dominate, that surface: queue state, completion forecasting, SQS, entropy, and Wilson ranking.

### 16. Live Sort as a Streaming Measurement Problem

Status: final

The live tracker turns repeated file exports into a moving estimate of the sort. It is not a true event stream from a server. It is a browser application that ingests periodically downloaded Hub, Employee, and SPR files, groups them into snapshots, activates the latest coherent state, and persists intra-sort records to IndexedDB.

Chapter 16 is the acquisition chapter for the live tracker arc. It should make the reader trust the timeline before asking them to trust any live metric. If two files belong to different pull buckets, a downstream formula can be correct and still describe the wrong moment.

The source basis for this chapter is `Live-Sort/tracker_v6.3-codex.html`. The plan originally pointed to v6.2, and the workspace head has since moved again: the current head is `tracker_v6.4-codex.html`, which boots from an embedded hub profile and extracts the pure calculation core to a sibling `calc_core.js`. The methods described here are unchanged, but tracker citations throughout this manuscript reference the v6.3-codex-era single-file layout; a citation refresh against the v6.4 head is queued as future-edition work (CL-0259).

#### CSV Ingestion

The live feed uses CSV files from the auto-download workflow. The filename prefix is profile-driven — each hub profile declares its own prefix, so the same parser serves the pilot hub and the synthetic NORTHGATE demo without code edits:

```text
<hub_prefix>_hub_summary_*
<hub_prefix>_employee_summary_*
<hub_prefix>_spr_SPR_Header_*
<hub_prefix>_spr_SPR_Operations_*
```

The CSV parsers re-alias space-stripped CSV headers back to legacy XLSX-style field names. That keeps downstream renderers stable. For example, Hub CSV fields such as `GrossVolume` are mapped back to `Gross Volume`, and Employee CSV fields such as `TotalScanHours` are mapped back to `Total Scan Hours`.

The Hub parser also filters meta or non-production belts, including TOTAL rows, 999 belts, and configured excluded belts. The Employee parser skips parent rollup rows, rows without user or belt, ASX users, a known exact user exclusion, and 999 belt rows.

#### Live SPR as Two Files

The live SPR source is split:

```text
SPR Header CSV     -> planned/actual summary fields
SPR Operations CSV -> operation hours, staffing, and OUT-door fields
```

The tracker parses each part and merges them into one `DATA.sor` shape. The header supplies planned and actual fields such as volume, PPH, hours, worked, paid day, flow per hour, sort span, percent smalls, direct hours, indirect hours, and loads. The operations file supplies operation-level and outbound door-level hours and staffing.

The code explicitly treats live SPR actual volume and actual PPH with caution: live SPR actual volume may be zero, so live volume and PPH often come from SCANTRACK-derived Hub state rather than SPR actual fields.

#### Pull Buckets

A single live pull can produce files a few seconds apart:

```text
SPR 23:10:59
Hub 23:11:00
Employee 23:11:03
```

If the tracker used exact seconds as snapshot keys, those files could land in separate snapshots. The implementation solves this by rounding live HHMMSS suffixes to the nearest 30 seconds:

```text
bucket_seconds = round(seconds_since_midnight / 30) * 30
```

For live files after midnight but before 06:00, the parser assigns the sort date to the previous calendar date and adds a large offset to the filename index. That preserves sort-day continuity for overnight pulls.

#### Timeline Snapshots

The tracker stores in-memory snapshots as:

```text
TIMELINE.snaps[idx] = { idx, ts, hub, emp, sor }
```

`onTlFiles()` classifies each file as Hub, Employee, or SPR, computes the pull index, parses the file, and inserts the parsed data into the matching snapshot. If the file is a live SPR CSV, Header and Operations parts with the same bucket are merged into the same SPR object.

Employee files provide the strongest timestamp because the tracker can take the maximum `Last Scan Timestamp` across employee rows. If a snapshot lacks an Employee timestamp, the tracker backfills timestamps using SPR sort-down time where possible, otherwise five-minute increments from neighboring known timestamps.

#### Activating the Current State

After a timeline batch loads, the tracker activates:

```text
latest Hub snapshot
latest Employee snapshot
merged SPR state across SPR snapshots
```

This matters because the latest Hub file and latest SPR file do not always arrive at the same instant. Merging SPR state across snapshots lets Header and Operations fields accumulate into one live SPR object. The activated state then re-renders Hub tables, belt grids, scan metrics, Outbounds, Intel, and DOP/Plan outputs.

#### Persistence

The tracker mirrors timeline snapshots into IndexedDB:

```text
store: sort_snapshots
key: [sort_date, source, snap_idx]
```

Each source is persisted separately:

```text
source = hub
source = emp
source = sor
```

That schema supports end-sort commits. The commit builder can read all snapshots for a sort date, group them by source, reconstruct a unified timeline, and export a JSON record with final state and derived fields.

#### Auto-Pull

The auto-pull mode uses the File System Access API. After a folder is granted, the tracker scans every two minutes, ingests unseen CSV files that classify as Hub, Employee, or SPR, and routes them through the same timeline path.

This is a polling stream, not a push stream. Its freshness is bounded by the export cadence and the two-minute scan interval.

#### What This Chapter Can Claim

This chapter can claim the grouping, bucketing, merge, activation, persistence, and auto-pull mechanics in the current tracker. It can claim why exact-second grouping is unsafe for live pulls. It can claim that the tracker creates a local browser timeline from periodically downloaded files.

It cannot claim that the tracker observes every package event. It cannot claim that all files in a pull are simultaneous. It cannot claim live SPR actual volume is always reliable. Those are exactly the reasons the grouping and source-boundary rules exist.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: live CSV parsers, `_livePullBucket()`, `_parseFilenameIdx()`, `parseSORLive()`, `_mergeSORLive()`, `TIMELINE`, `onTlFiles()`, `_interpolateTimelineTimestamps()`, `_activateLatestSnapshot()`, `_persistTimelineToIDB()`, `_buildEndSortCommitJSON()`, and auto-pull functions.

### 17. Outbounds Analytics

Status: final

Outbounds analytics measure live outbound productivity by belt, zone, and building. The active tracker computes these metrics from three live sources:

```text
SCANTRACK Hub Summary      -> belt-level net volume
SCANTRACK Employee Summary -> belt-level scan hours and scan windows
SPR Operations         -> paid hours and loaders
```

The method is designed to keep paid-time productivity and scan-time productivity separate.

#### Net Volume

For each PD outbound belt:

```text
net_volume = LooseOutbound + BagsLinked
```

Both terms come from the SCANTRACK Hub Summary row for that belt. This is why Outbounds net is not simply gross volume.

The current Outbounds set is the twelve PD doors:

```text
PD-01 through PD-12
```

They are grouped into three zones:

```text
Zone 1 = PD-01 through PD-04
Zone 2 = PD-05 through PD-08
Zone 3 = PD-09 through PD-12
```

#### Paid Hours and Loaders

The preferred paid-time basis is direct SPR OUT-door data:

```text
paid_hours_belt = SPR OUT-door actual hours for that belt
loaders_belt    = SPR OUT-door actual staffing for that belt
```

When direct OUT-door fields are not available, the tracker falls back to aggregate outbound allocation. It first reads total outbound hours and outbound staffing from SPR operation rows. Then it allocates those totals to belts by share:

```text
share = belt_scan_hours / total_PD_scan_hours, if scan hours exist
share = belt_net_volume / total_PD_net_volume, otherwise
```

Then:

```text
allocated_paid_hours_belt = outbound_operation_hours * share
allocated_loaders_belt    = outbound_operation_staffing * share
```

The manuscript should call this an allocation, not a direct measurement. The code records the basis as `door`, `allocated-outbound`, or `none`.

#### Paid PPH

Paid PPH answers how much outbound net volume was processed per paid SPR hour:

```text
paid_PPH_belt = net_volume_belt / paid_hours_belt
```

For a zone:

```text
paid_PPH_zone = sum(net_volume_belts) / sum(paid_hours_belts)
```

For the outbound building view:

```text
paid_PPH_outbound = sum(net_volume_all_PD_belts) / sum(paid_hours_all_PD_belts)
```

This is the main productivity denominator for paid labor. It should not be replaced by scan hours.

#### Scan Hours and Scan PPH

Scan hours come from SCANTRACK Employee Summary rows. The tracker sums `Total Scan Hours` by belt:

```text
scan_hours_belt = sum(employee Total Scan Hours for belt)
```

Then:

```text
scan_PPH_belt = net_volume_belt / scan_hours_belt
```

Scan PPH is a scan-active productivity ratio. It answers a different question than paid PPH. A belt can have high scan PPH and low paid PPH if paid time includes idle, waiting, or unscanned work intervals.

#### Utilization

Outbounds utilization is scan-active time divided by paid time:

```text
utilization_belt = scan_hours_belt / paid_hours_belt
```

Zone and building utilization use summed scan hours and summed paid hours:

```text
utilization_zone = sum(scan_hours_belts) / sum(paid_hours_belts)
```

This is a time-basis ratio. It is not cube utilization and it is not labor utilization in the HR sense. It means: of the paid outbound hours assigned to the belt or group, what share appears as SCANTRACK scan hours?

#### Loader Coverage from Scan Windows

The tracker also builds active-loader coverage from Employee Summary scan windows. Each employee row contributes:

```text
user
belt
first scan timestamp
last scan timestamp
total scan hours
outbound net
```

The coverage chart divides time into 30-minute buckets. For each bucket, it counts distinct users whose scan interval overlaps the bucket:

```text
active_loaders(bucket) = count(distinct users with first_scan < bucket_end and last_scan >= bucket_start)
```

The same logic is computed for the building and for each outbound zone.

#### Engine Parity Boundary

The tracker can also load an engine report or compact history. When present, engine outputs take priority in the Outbounds tab. Without those files, the live Outbounds path computes engine-parity fields from SCANTRACK Hub, SCANTRACK Employee, and live SPR.

The manuscript should describe this as a source-priority boundary:

```text
engine report loaded -> display engine figures
otherwise -> compute live Outbounds from Hub + Employee + SPR
```

The `tracker_operator_payload` is separate again. It supplies calibrated evidence and blocked-claim boundaries, but operator-facing decisions still come from live CSV and SPR inputs unless the UI explicitly displays the analytics payload as evidence.

#### What This Chapter Can Claim

This chapter can claim the formulas for net volume, paid hours, allocated fallback hours, paid PPH, scan PPH, utilization, zone aggregation, building aggregation, and active-loader coverage. It can claim that the live Outbounds path is computed every render from current Hub, Employee, and SPR state.

It cannot claim that scan hours equal paid hours. It cannot claim that allocated paid hours are direct per-belt measurements. It cannot use scanner attribution as individual blame. It cannot claim that an analytics payload replaces the live source files.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `OUTBOUND_PD_BELTS`, `OUTBOUND_ZONE_DEFS`, `_beltMetrics()`, `_groupMetrics()`, `_sorPaidBasisForBelt()`, `_sorOutboundAllocationForBelt()`, `_outboundBuildModel()`, `_outboundActiveIntervals()`, `_outboundBucketCoverage()`, `_renderOutboundsLive()`, and `renderAreaTable()`.
- `Operations/adapters/tracker_operator_payload.py`: blocked metrics and tracker contract separating operator-ready fields, analyst detail, and blocked claims.

### 18. Intel Tab: Decision-First Analytics

Status: final

The Intel tab is the tracker's decision layer. Its job is to turn pre-sort expectations, live scan state, payload health, method checks, and analyst-detail metrics into a small number of operator actions. The important design choice is separation: the operator sees "what to do"; the analyst detail keeps the formulas and diagnostics visible without making them the first screen.

The current source is `Live-Sort/tracker_v6.3-codex.html`.

#### Layer 1: Pre-Sort Projection

The embedded projection object is `INTEL_PROJ`, version `0.5-hierarchical`. It describes the belt-volume model as:

```text
belt_volume_DOW = building_volume_DOW_band * PD_fraction * belt_share_DOW
```

The building-volume band is day-of-week conditioned. The PD fraction is stored in the metadata as approximately `0.5389`, based on SCANTRACK PD sum divided by SPR building volume on overlap dates. The belt share is canonical SCANTRACK belt share, shrunk toward pooled share with shrinkage parameter `K = 2`.

The projection table shows, for each PD belt:

```text
projected median volume
p25-p75 volume band
paid-hour target
observed belt PPH
reliability bar
```

Paid-hour target uses a plan PPH band:

```text
lean paid hours = projected_volume / 230
rich paid hours = projected_volume / 190
```

This is a planning range, not a promise that the belt will receive those exact hours.

#### Reliability

Reliability has two visible ideas in the code.

The color is based on band width:

```text
spread = (p75 - p25) / median
spread < 0.15 -> tight
spread < 0.30 -> fair
otherwise     -> wide
```

The bar width is based on allocation depth:

```text
bar_width = min(100, n_belt / 6 * 100)
```

The tooltip also exposes the volume-level sample depth and allocation sample depth. This matters because volume level and belt allocation are not the same evidence source. A day-of-week volume band can have deep history while a belt allocation estimate still has shallow canonical SCANTRACK support.

#### Layer 2: Live Now Versus Projected

When Hub data is loaded, the Intel tab switches from pre-sort-only context into live comparison mode. The live per-belt net is:

```text
live_belt_net = LooseOutbound + BagsLinked
```

The comparison rule is:

```text
if live_belt_net < projected_p25 -> BEHIND
if live_belt_net > projected_p75 -> AHEAD
otherwise                        -> ON TRACK
```

The building row compares the live PD-belt sum with the sum of projected medians:

```text
building BEHIND if live_sum < 0.92 * projected_sum
building AHEAD  if live_sum > 1.08 * projected_sum
otherwise       ON TRACK
```

The important caveat is phase. A belt can be below the full-sort projection early in the sort and still be healthy. The live comparison is most useful when read with the phase engine and queue state.

#### Payload Health

The payload health strip reports whether Hub, SPR, Employee, and analytics payload evidence are loaded. It also states a denominator guardrail:

```text
live net uses Hub
paid-hour basis uses SPR actual hours
missing live input is not treated as ON TRACK
```

The analytics payload is an evidence layer, not a replacement for the live source files. The payload adapter separates operator-ready evidence from analyst detail and blocked claims.

#### Method Checks

The Intel method check computes a simple identity over Zone 3 and PD volume:

```text
kappa_912_pd = z3_total / pd_total
rho_pd_hub   = pd_total / building_volume
kappa_912    = z3_total / building_volume
identityResidual = kappa_912 - (rho_pd_hub * kappa_912_pd)
```

If the identity residual is close to zero, the algebraic check passes. If building volume is missing, the tab can still show `kappa_912_pd` but cannot compute `rho_pd_hub`, `kappa_912`, or the residual.

The implementation labels this method check as a simulation validation harness, not a live constant claim. That label should remain in the manuscript.

#### Operator View and Analyst Detail

The top of Intel renders an action queue. Below it are pre-sort projection, live belt status, queue state, phase, SQS, and other decision panels. The analyst detail is hidden under a collapsible section with queue model, entropy, reconciliation, and Wilson ranking.

That layout is part of the method. The advanced statistics are present, but the operator payload is still decision-first.

#### What This Chapter Can Claim

This chapter can claim the projection formula, paid-hour target formula, reliability rules, live band comparison, payload-health guardrail, and `kappa_912` identity check. It can also claim that the method check is a validation harness rather than a calibrated live constant claim.

It cannot claim that the pre-sort projection is a causal forecast of why a belt will be heavy. It cannot claim that a missing file is neutral. It cannot claim the live band status is meaningful without sort phase and source health.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `INTEL_PROJ`, `_relMeta()`, `_intelNextSortInfo()`, `_intelLatestHubRowsForLivePace()`, `_intelLiveBeltNet()`, `renderIntelPayloadHealth()`, `_intelMethodChecks()`, `renderIntelMethodChecks()`, `renderIntelContextBar()`, `renderIntelPreSort()`, `renderIntelLiveBelts()`, and `renderIntelLayersV61()`.
- `Operations/adapters/tracker_operator_payload.py`: tracker contract, operator-ready fields, analyst detail, and blocked metrics.

### 19. Queue State and Live Risk

Status: final

Queue state is the tracker's simplest operations-research model. It asks whether the live sort has enough service capacity to absorb planned induction.

The first-principles model is:

```text
lambda = arrival or induction rate, packages per hour
mu     = service rate per server, packages per hour per server
c      = number of servers
capacity = c * mu
rho = lambda / capacity
```

In an M/M/c queue, `rho` is traffic intensity. If `rho < 1`, capacity is above arrival rate. If `rho > 1`, work arrives faster than the modeled service system can clear it.

#### Thresholds

The tracker uses four state bands:

```text
rho < 0.60       -> clearing
0.60 <= rho < .85 -> balanced
0.85 <= rho < 1.00 -> building
rho >= 1.00      -> critical
```

The state is rendered as a health light with a recommendation.

#### Implementation Wiring

The Intel queue wrapper derives:

```text
hubNet       = live building net from Hub rows
actualHours  = SPR actual Hours, or SPR area hours fallback
actualPPH    = SPR actual PPH
derivedPPH   = hubNet / actualHours
pph          = actualPPH if present, else derivedPPH
hc           = SPR headcount/worked, SPR employee totals, or SPR area staffing fallback
planVol      = SPR planned Volume
actVol       = SPR actual Volume if present, else hubNet
remaining    = max(planVol - actVol, 0)
inductionRate = planVol / 4
```

Then it calls:

```text
computeSortQueueState(pph, hc, inductionRate, remaining)
```

Inside that function:

```text
capacity = hc * pph
rho = inductionRate / capacity
```

If `rho > 1` and remaining volume exists, the tracker estimates backlog minutes:

```text
projectedBacklogMinutes = remaining_volume / (lambda - capacity) * 60
```

#### Unit Audit

The formal model requires `mu` to be a per-server service rate. The current wrapper can pass SPR actual PPH or `hubNet / actualHours` as `mu`. If those values are building-level package-per-hour rates rather than per-loader rates, then multiplying by headcount double-counts labor capacity.

For that reason, the manuscript should label the current queue state as a decision aid with an open unit audit. The UI already treats it as a simplified light, not a physical queue proof. A future verification pass should test whether `pph` in this call is per-loader PPH or building-level PPH.

#### What This Chapter Can Claim

This chapter can claim the implemented `rho` formula, threshold bands, backlog calculation, and source fallbacks. It can also claim that the queue model is displayed as a simplified operator light.

It cannot claim that the current queue state is a precise M/M/c fit. It cannot claim that package arrivals are Poisson, service times are exponential, or loaders are homogeneous servers. It cannot mark the capacity formula as mathematically verified until the PPH unit audit is closed.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `RHO_OVERCAPACITY`, `RHO_BALANCED_HI`, `RHO_CRITICAL`, `computeSortQueueState()`, `_intelQueueState()`, `generateActionQueue()`, and the queue-state render block in `renderIntelTab()`.

### 20. Sort Completion Forecasting

Status: final

The tracker contains two completion-forecast families: an in-tracker PERT completion estimator and an analytics-payload live analog forecast. They should not be collapsed into one model.

#### Linear Fallback

The PERT estimator receives:

```text
currentTime
currentCumulVol
finalVol
currentPPH
historicalPhhByPhase
totalStaff
```

It computes remaining volume:

```text
remainingVol = max(finalVol - currentCumulVol, 0)
```

If historical phase data is unavailable or if current PPH or staffing is zero, it falls back to:

```text
hours_remaining = remainingVol / max(1, currentPPH * totalStaff)
completion_time = currentTime + hours_remaining
```

The displayed p10/p90 fallback band is a crude scaling of the completion decimal:

```text
p10 = completion_time * 0.97
p90 = completion_time * 1.03
```

That is a placeholder band, not a distributional interval.

#### Phase PERT Model

When history is available, the estimator uses three phase windows:

```text
ramp: 18:00-19:00
peak: 19:00-21:00
wind: 21:00-22:00
```

For each phase, it computes the PERT expected service rate from historical percentiles:

```text
te = (p10 + 4*p50 + p90) / 6
```

For a phase segment of duration `dur`:

```text
phase_capacity = te * totalStaff * dur
```

If phase capacity clears the remaining volume, completion occurs inside that phase:

```text
completion = phase_start + remainingVol / (te * totalStaff)
```

Otherwise, the model subtracts the phase capacity and continues to the next phase. If volume remains after 22:00, it extends beyond the nominal sort window using wind-phase `p50`.

The variance term uses percentile width:

```text
sigma_pph_squared = ((p90 - p10) / 6)^2
dT = -remainingVol / (te * totalStaff)^2
totalVariance += dT^2 * sigma_pph_squared
```

The displayed 80% band uses approximately:

```text
p10_completion = completion - 1.28 * sigma
p90_completion = completion + 1.28 * sigma
```

#### Render Gate

`renderPERTBand()` builds phase percentiles from the corpus canonical PPH trajectory for the current day-of-week and era. It only renders the live prediction during the active sort window, 18:00-22:00. Outside that window it displays a pre-sort or post-sort placeholder.

#### Unit Audit

The current render path builds phase values from a building PPH trajectory and then passes `totalStaff` into the estimator, which multiplies `te * totalStaff`. If the trajectory values are already building-level PPH, this multiplication is a unit error. If the trajectory values are per-staff PPH, the variable naming and source should make that explicit.

For now, this chapter should document the algorithm and mark the unit interpretation as open.

#### Live Analog Forecast

The analytics payload has a separate live analog forecast field. The payload adapter returns it as `ready` only when the validation gate passes. Otherwise it returns `blocked` with blocked claims and warnings. When ready, the payload contains current state, matched analog count, distance band, projected final volume, projected final paid hours, projected adjusted building PPH, and projected at-risk volume.

The tracker summary labels this as forecast evidence only. It does not replace live CSV/SPR state.

#### What This Chapter Can Claim

This chapter can claim the implemented linear fallback, phase windows, PERT expected-rate formula, variance approximation, render gate, and analog-forecast payload boundary.

It cannot claim the completion estimator is mathematically verified until the PPH unit audit is closed. It cannot claim the analog forecast is available unless the payload validation gate passes.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `_decHourToHHMM()`, `_percentile()`, `predictSortCompletion()`, `forecastFromHistory()`, `isWithinSortWindow()`, `renderPERTBand()`, `_payloadLiveAnalogForecast()`, and `_payloadAnalogForecastSummary()`.
- `Operations/adapters/tracker_operator_payload.py`: `_operator_live_analog_forecast()` and `build_tracker_operator_payload()`.

### 21. Sort Quality Score

Status: final

Sort Quality Score is a composite health score rendered in the Intel tab. It is useful because it combines production, data fidelity, staffing, and CURE gap evidence. It is risky because composite scores can hide denominator problems. For the manuscript, the weights and defaults must stay visible.

#### Component 1: PPH Score

The PPH score uses planned and actual SPR Summary PPH when both exist:

```text
pphScore = min(actualPPH / planPPH, 1)
```

If actual PPH exists but plan PPH does not, the fallback is:

```text
pphScore = min(actualPPH / 200, 1)
```

If neither input exists, the neutral default is:

```text
pphScore = 0.75
```

#### Component 2: Fidelity

Fidelity measures alignment between SPR and SCANTRACK evidence:

```text
alignment = 1 - min(abs(SPR_volume - SCANTRACK_volume) / SPR_volume, 1)
```

If SPR volume is zero but SCANTRACK has volume, alignment is set to `0.8`, meaning provisional rather than failed.

The ghost-rate term compares SPR employee IDs with SCANTRACK users:

```text
ghostRate = SPR employees missing from SCANTRACK / SPR employees
```

The late-punch term is a proxy based on SPR/SCANTRACK volume gap:

```text
epsProxy = abs(SPR_volume - SCANTRACK_volume) / SPR_volume
latePunchShare = min(epsProxy / 0.15, 1) * 0.3
```

The fidelity score is:

```text
fidelity = 0.40*alignment + 0.30*(1 - ghostRate) + 0.30*(1 - latePunchShare)
```

This is a data-quality score, not a worker-quality score.

#### Component 3: Staffing Adherence

When planned and actual headcount are present:

```text
staffAdherence = min(planHC, actualHC) / max(planHC, actualHC)
```

If headcount inputs are missing, the default is:

```text
staffAdherence = 0.80
```

The actual headcount fallback can use SPR employee totals when explicit headcount fields are missing.

#### Component 4: Missort / CURE Gap Quality

The CURE contribution penalizes high-TFCS rows that are underutilized. If CURE rows exist:

```text
missortQuality = max(0, 1 - gapRows / cureRows)
```

If no CURE rows exist, the default is:

```text
missortQuality = 0.85
```

The implementation comment is important: high-TFCS rows alone are not treated as bad. The penalty is for rows that are high TFCS and still cube-low.

#### Composite Score

The final score is:

```text
SQS = 0.40*pphScore
    + 0.25*fidelity
    + 0.20*staffAdherence
    + 0.15*missortQuality
```

Labels are:

```text
score >= 0.90 -> Excellent
score >= 0.75 -> Good
score >= 0.60 -> Fair
otherwise     -> Needs Attention
```

#### What This Chapter Can Claim

This chapter can claim the implemented component formulas, weights, labels, and defaults. It can claim that SQS is a composite score for display in Intel.

It cannot claim SQS is a validated causal score. It cannot compare one sort to another without checking which default values were active. It cannot hide the fact that the weights are design choices. A future verification pass should add fixtures showing each component under missing-source conditions.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `computeFidelityScore()`, `computeSQS()`, and the SQS ring render block in `renderIntelTab()`.

### 22. Zone Entropy and Concentration Risk

Status: final

Zone entropy measures whether package work is spread across multiple scanners or concentrated in one scanner inside a zone. It uses normalized Shannon entropy, so the result is scaled between 0 and 1.

#### Shannon Entropy

For a zone, let each included scanner have package count `x_i`. Let:

```text
total = sum(x_i)
p_i = x_i / total
```

Shannon entropy is:

```text
H = -sum(p_i * log2(p_i))
```

The maximum entropy for `n` active scanners is:

```text
Hmax = log2(n)
```

The normalized entropy is:

```text
Hnorm = H / Hmax
```

`Hnorm = 1` means the package work is evenly spread across active scanners. A lower value means more concentration.

#### Implementation Scope

The tracker computes entropy for the three Intel zones:

```text
Zone 1 = PD-01 through PD-04
Zone 2 = PD-05 through PD-08
Zone 3 = PD-09 through PD-12
```

For each zone, it reads SCANTRACK Employee rows whose belt is in the zone, groups rows by user, and sums:

```text
user_package_count = sum(Total Packages)
```

It excludes user IDs in `_IGATE_EXCLUDE_USERS` and IDs whose prefix is `SLS`, `ASX`, or `SS`.

The output includes:

```text
normalized entropy
number of active employees
dominant user
dominant user's share of zone packages
risk flag
```

#### Concentration Risk Flag

The current risk rule is:

```text
riskFlag = Hnorm < 0.40 and active_employee_count >= 3
```

The `active_employee_count >= 3` guard prevents two-person zones from being flagged merely because two-person entropy has a lower ceiling.

#### Limits

The entropy engine does not prove unfairness, underperformance, or scanner misuse. It only says the observed package distribution is concentrated.

It also uses `Total Packages`, whereas other Outbounds calculations use `Outbound Volume + Bags Linked` as the scan-net basis. That difference should be documented. A future pass should decide whether entropy should remain total-package based or be aligned to the Outbounds net definition.

The current risk flag has an employee-count guard but not a minimum package-volume guard. That means a low-volume zone with three scanners can still trigger a concentration flag. The manuscript should keep that as an open improvement.

#### What This Chapter Can Claim

This chapter can claim the normalized entropy formula, zone grouping, user exclusions, dominant-user calculation, and risk-flag rule. It cannot claim that entropy identifies fault or causality.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `INTEL_ZONES`, `_IGATE_EXCLUDE_USERS`, `shannonEntropy()`, `computeZoneEntropy()`, and the entropy render block in `renderIntelTab()`.

### 23. Wilson Ranking for Employee Performance

Status: final

The Wilson ranking panel answers a narrow question: "Which employee scan rates are credible enough to compare?" It is not a disciplinary model and it is not a causal model. It is a small-sample correction over observed scan PPH.

Raw PPH ranking has a familiar failure mode. A loader who scans for ten minutes can post a very high PPH because the denominator is tiny. A loader who scans for three hours has much more evidence behind the rate. The Wilson panel tries to rank by the lower end of a confidence interval instead of the point estimate alone.

#### Source Population

The panel delegates population construction to `_igatePerUserRows()`. That matters because `_igatePerUserRows()` already applies the outbound employee guardrails:

```text
user net = Outbound Volume + Bags Linked
scan hours = Total Scan Hours, capped by merged scan intervals when interval evidence is tighter
scan PPH = user net / scan hours
```

The row filter excludes empty users, SLS, SS, and ASX-prefixed users, exact system/test IDs, `NOLOADS` rows, and rows belonging to the hub's own SLIC. If no belt filter is selected, the function keeps PD belts only. The Wilson panel then applies an additional exposure rule:

```text
hours >= 0.25
```

This is a display eligibility rule. It prevents near-zero exposure from entering the reliability ranking.

#### Wilson Interval

The implementation rescales scan PPH into a pseudo-proportion:

```text
p_obs = min(scan_pph / 400, 1.0)
n_pseudo = max(round(scan_hours * 2), 1)
k = round(p_obs * n_pseudo)
```

It then calls `wilsonCI95(k, n_pseudo)`. With `z = 1.96`, the Wilson center and half-width are:

```text
p = k / n
center = (p + z^2 / (2n)) / (1 + z^2 / n)
half = z / (1 + z^2 / n) * sqrt(p(1-p)/n + z^2/(4n^2))
lower = max(0, center - half)
upper = min(1, center + half)
```

The panel converts the interval back onto the PPH scale:

```text
pph_lower = round(lower * 400)
pph_upper = round(upper * 400)
```

Rows are sorted by `wilson_lower`, not by raw PPH.

#### What the Math Means

The Wilson interval is normally introduced for a binomial success rate. Here the project is not modeling each package as a literal success/failure draw. The implementation uses Wilson as a conservative ranking transform: high raw PPH only ranks high when the exposure proxy is large enough to keep the lower bound high.

That proxy design is a manuscript caveat. The scale constant `400` and pseudo-sample rule `hours * 2` are implementation choices, not validated universal constants. The chapter can claim that the tracker uses Wilson lower bounds to penalize small exposure. It cannot claim that the interval is a fully calibrated probability statement about the loader's true long-run PPH.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `_igateIsExcludedRow()`, `_igatePerUserRows()`, `wilsonCI95()`, `wilsonRankedEmployees()`, and the Wilson render block in `renderIntelTab()`.

## Part VI. Planning, Staffing, and Operational Constants

Part VI separates planning formulas from live measurement formulas. The live tracker has already named the current-state evidence. The planning chapters now ask how projected volume, planned adjusted building PPH, actual headcount, target paid day, belt load PPH, and operational constants become a pre-sort plan.

This part exists because the manuscript should not bury DOP math inside the live-tracker statistics arc. The DOP/Plan generator is a planning surface, not just another live diagnostic panel. Chapters 24 through 27 therefore form their own bridge from measurement to planned intervention.

### 24. The DOP / Pre-Sort Plan Generator

Status: final

The Plan tab is a pre-sort manifold. It is not one staffing calculator. It separates the building labor budget from the outbound belt staffing model because those two calculations use different PPH meanings.

The source code states this distinction directly in the UI copy:

```text
Planned Adjusted Building PPH -> building manifold
Outbound load PPH -> outbound load staffing
```

The building PPH spans all direct and indirect hour buckets. The outbound load PPH is a belt-specific loading rate. Mixing those denominators would produce a staffing plan that looks precise but is wrong.

#### Building Manifold

The Plan tab chooses a target sort date and day of week with `_dopPlanSortInfo()`, then reads the corresponding projection from `INTEL_PROJ`. The building volume comes from:

```text
INTEL_PROJ.building_volume_DOW[day].median
```

Unless the user manually overrides it, the input field is filled with that day-of-week median. If the user does override it, the per-belt projections are scaled by:

```text
scale = typed_building_volume / projected_building_median
```

Let:

```text
V = building volume
Pi_building = planned adjusted building PPH
D_target = target managed average paid day
H_actual = actual headcount
D_max = 4.5 hours
```

The building manifold computes:

```text
required_paid_hours = V / Pi_building
cost_per_piece_hours = 1 / Pi_building
cost_per_piece_minutes = 60 / Pi_building
required_heads = required_paid_hours / D_target
needed_average_paid_day = required_paid_hours / H_actual
```

The paid day is treated as a managed average, not a hard employee-by-employee cap. The model assumes most full-time workers leave near the sort span, a wrap crew stays later, and surplus workers can be sent home early. The implemented soft ceiling is:

```text
D_max = 4.5
run_paid_day = min(max(needed_average_paid_day, D_target), D_max)
delivered_hours = H_actual * run_paid_day
short_hours = max(0, required_paid_hours - delivered_hours)
packages_at_risk = short_hours * Pi_building
```

The regime label is:

```text
short if needed_average_paid_day > D_max
tight if needed_average_paid_day > D_target + 0.05
covered otherwise
```

In the covered regime, the display estimates how many surplus heads can be sent home early:

```text
send_home = max(0, round(H_actual - required_heads))
```

#### Outbound Belt Staffing

The belt table is the direct outbound load plan. For each belt, the model reads projected belt volume and historical belt PPH from `INTEL_PROJ.DOW[day]`:

```text
V_b = projected belt volume
Pi_b = historical belt load PPH, or user override
D_run = average paid day chosen by the building manifold
load_hours_b = V_b / Pi_b
loaders_b = load_hours_b / D_run
display_loaders_b = ceil(loaders_b)
```

This is the same shape as the boss's Column M: belt volume divided by belt PPH divided by paid day. The user can type one outbound load PPH override, but the UI flags an override when it exceeds that belt's historical rate by more than 12%.

#### Limits

The Plan tab currently breaks out direct outbound loaders only. Pick-off and non-outbound areas such as unload, sort, smalls, and bulk roll into the building total. They are not decomposed in the first-cut belt table.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: Plan tab UI copy, `_dopPlanSortInfo()`, `renderDopPlan()`, and `dopRenderAll()`.
- `Live-Sort/metric_contract.json`: net-volume and PPH denominator policy.

### 25. LP-Lite Staffing Optimization

Status: final

This chapter should use the phrase "LP-lite" carefully. The current tracker does not run a full linear-programming solver, and the v6.1 Plan tab removed the old staffing-optimizer panel from the active UI. What remains is a constrained allocation heuristic that has the same first-principles shape as a small linear program.

#### The Optimization View

The decision variable for belt `b` is the number of outbound loaders assigned to that belt:

```text
x_b = loaders assigned to belt b
```

Each belt has a volume target and a loading-rate estimate:

```text
V_b = projected belt volume
Pi_b = belt load PPH
D = average paid day to run
```

The clearance constraint is:

```text
x_b * D * Pi_b >= V_b
```

Solving that one constraint directly gives:

```text
x_b >= V_b / (D * Pi_b)
```

The tracker displays:

```text
loaders_b = ceil(V_b / Pi_b / D)
```

That is why this is LP-lite rather than full LP. There is no simplex routine, no objective matrix, and no global solver. The active Plan tab computes the minimum direct loaders per outbound belt under fixed volume, fixed PPH, and fixed managed paid day.

#### Guardrails

The model's guardrails are denominator guardrails:

```text
building PPH -> all-bucket paid-hour budget
belt load PPH -> outbound loader staffing
PD fraction -> only for describing what share of building volume the PD outbound table represents
```

The implementation also keeps belt PPH historical by default. A single override is allowed for scenario modeling, but the displayed row warns when the override is more than 12% above the belt's historical mean. That warning prevents the plan from silently promising a rate the belt has not supported historically.

#### Relation to Linear Programming

A full LP version would define an objective such as minimizing total paid hours or minimizing projected at-risk volume subject to headcount, paid-day, belt, and zone constraints. The current tracker stops earlier. It computes the direct belt requirement and leaves broader headcount tradeoffs to the building manifold and supervisor decision.

The manuscript should preserve that boundary. The Plan tab is mathematically structured, but it is not yet a general optimization engine.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `renderDopPlan()`, Plan tab UI copy, and the v6.1 comment noting that old Phase/Pace/Scenarios/Back-Solve/Staffing-Optimizer panels were removed from the active tab.

### 26. Gamma, Kappa, Rho, Epsilon, and U_T

Status: final

This chapter collects the named constants and ratios that recur across the tracker, metric contract, and ai_memory reconciliation layer. The important rule is that a symbol is not a number by itself. A symbol is a number plus a basis, denominator, source, and allowed surface.

#### gamma: Weekly Volume Decay

The metric contract defines weekly decay as:

```text
V_d = V_Mon * gamma^(d - 1)
```

The contract's canonical value is:

```text
gamma = 0.982
```

The tracker embeds that contract but the literal fallback beside `GAMMA` remains `0.958`. Therefore any manuscript claim about gamma must name whether it is reading the contract value or the fallback. The live gamma forecast back-calculates a Monday volume from the current day's volume:

```text
V_Mon = today_volume / gamma^today_index
forecast_i = V_Mon * gamma^i
```

#### kappa: Zone Share

In the Intel layer, kappa is the Zone 3 share of live Hub net volume:

```text
kappa_actual = z3_volume / total_pd_volume
```

The expected value comes from the day-of-week table:

```text
Monday 0.413
Tuesday 0.395
Wednesday 0.385
Thursday 0.380
Friday 0.322
fallback 0.385
```

The live tracker marks the deviation significant when:

```text
abs(kappa_actual - kappa_expected) > 0.03
```

The metric contract records that this kappa table is SVQ day-of-week steady-state basis, not a flat SCANTRACK number. It also records the MULTIDEST attribution rule that explains why SVQ and SCANTRACK views can differ without contradiction.

Building the synthetic hub generator surfaced a third basis. Fitting the SPR Work Area Types area rows from 30 sorts puts Zone 3 at roughly a quarter of the PD total — well below both the SVQ steady-state table (~0.38) and the SCANTRACK view (~0.31-0.33). The SPR area-row planning basis is not a defective kappa; it is a different denominator world, and none of the three bases can be derived from another without the attribution rules. The generator's emitters make the translation explicit: they draw belt mix from the SPR-basis Dirichlet fit, then rescale the Zone 3 belts so the emitted night realizes the contract kappa(DOW) — one documented basis translation instead of a silent disagreement (CL-0255). Any future analysis that reads zone shares off SPR area rows and compares them against the kappa table without that translation will manufacture a contradiction.

#### rho_pd_hub

The contract defines:

```text
rho_pd_hub = 0.509
```

Operationally, this is the share of hub volume appearing in SCANTRACK PD outbound scans. The Intel method-check panel also computes a live identity:

```text
kappa_912_hub = rho_pd_hub * kappa_912_pd
identity_residual = kappa_912_hub_observed - rho_pd_hub * kappa_912_pd
```

That identity check is an analyst-detail validation harness. It should not be promoted into an operator constant claim without the right source basis loaded.

#### epsilon_schema

The metric contract records:

```text
epsilon_schema = 0.04
shape = DOW-flat
```

The tracker's local prior is:

```text
EPS_PRIOR = 0.039
```

The live reconciliation function computes:

```text
eps_actual = (SCANTRACK_volume - SPR_volume) / SPR_volume
delta = eps_actual - EPS_PRIOR
```

The signal becomes a warning when the delta is more than five percentage points from the prior. The metric contract explicitly says the schema offset is structural and should not automatically be treated as a data-quality error.

#### U_T

The metric contract and tracker use:

```text
U_T_cap = 0.85
```

In the action queue, CURE utilization at or above `U_T_cap` but below 0.95 becomes a high warning. At or above 0.95, it becomes urgent. This is a bottleneck threshold, not a general-purpose quality score.

#### ai_memory Invariant Bands

The ADMM utility uses the same constants as invariant ranges:

```text
kappa_z3_mon:   0.413 in [0.393, 0.433]
kappa_z3_fri:   0.322 in [0.302, 0.342]
gamma:          0.982 in [0.972, 0.992]
rho_pd_hub:     0.509 in [0.484, 0.534]
epsilon_schema: 0.040 in [0.020, 0.060]
U_T_cap:        0.850 in [0.820, 0.880]
```

This is the bridge between the operations tooling and autoresearch loop. The constants are not just displayed in the tracker; they are also used as anti-hallucination guardrails when branches reconcile claims.

#### Source Basis

- `Live-Sort/metric_contract.json`: contract definitions and constant basis notes.
- `Live-Sort/tracker_v6.3-codex.html`: embedded metric contract, `GAMMA`, `KAPPA_DOW`, `EPS_PRIOR`, `U_T_CAP`, `gammaDecayForecast()`, `computeKappaEngine()`, and `computeEpsSchema()`.
- `~/Desktop/Twilight 050426/ai_memory/mcts-upgrade/admm_utils.py`: invariant bands.

### 27. Borrow-Loan Recommendations

Status: final

Borrow-loan recommendations are meant to be decision support for moving loaders between zones. The implementation uses live zone volume, SPR-derived zone staffing, and a simple productivity comparison. It should not be described as proving that a move will cause a specific throughput gain.

#### Zone Inputs

The tracker defines three Intel zones:

```text
Zone 1 = PD-01 through PD-04
Zone 2 = PD-05 through PD-08
Zone 3 = PD-09 through PD-12
```

For each zone, the borrow-loan function computes:

```text
zone_volume = sum(LooseOutbound + BagsLinked over zone belts)
zone_staff_hours = sum(SPR belt paid hours over zone belts)
zone_staff = zone_staff_hours / SORT_HOURS
zone_productivity = zone_volume / zone_staff
```

Here productivity means packages per staff person over the sort window, not a causal estimate of what a new person would produce after moving.

#### Surplus and Deficit Rules

The function keeps zones with positive staff and computes the mean productivity:

```text
mean_productivity = average(zone_productivity over staffed zones)
```

It then applies symmetric thresholds:

```text
surplus if zone_productivity > 1.15 * mean_productivity and staff > 1
deficit if zone_productivity < 0.85 * mean_productivity
```

The intended interpretation is operational: a high-productivity zone may be under less pressure per person, while a low-productivity zone may need relief.

#### Current Formula Audit

The current move-generation formula is:

```text
gainEst = round(to.vol / (to.staff + 1) - to.vol / max(to.staff, 1))
emit move only if gainEst > 0
```

With productivity defined as `volume / staff`, this expression is nonpositive for a staffed destination. Adding one person lowers volume per person:

```text
to.vol / (staff + 1) <= to.vol / staff
```

That means the current implementation may never emit a move, even when surplus and deficit zones exist. The manuscript should treat this as an open implementation issue. A future formula should estimate relief, not increased per-person productivity. For example, it might compute reduction in overload, required staff to reach mean productivity, or capacity gain using a per-loader throughput estimate. That replacement needs source validation before operator language is strengthened.

#### Recommendation Language

If a move exists, the UI renders:

```text
Move 1 loader: from zone -> to zone
Projected gain: +gainEst pkgs/hr
```

Because the current `gainEst` formula is under audit, the chapter should not repeat that phrase as a validated claim. The safe claim is narrower: the tracker computes zone productivity, identifies surplus and deficit candidates with 15% bands around the mean, and has a borrow-loan move-generation path that needs correction before it can support projected-gain language.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `INTEL_ZONES`, `computeBorrowLoanRecommendation()`, `generateActionQueue()`, and the borrow-loan render block in `renderIntelTab()`.

## Part VII. Statistical Foundations

Part VII extracts the math vocabulary that earlier chapters have already used. It is not a separate theory layer floating above the project. Counts, rates, bands, sampling bias, entropy, queue utilization, and analog distance are introduced here because the dashboard, tracker, planning, and simulation chapters need those ideas to be precise.

The reader should be able to move backward from each statistical chapter to a project method. Counting and ratios point back to dashboard and Outbounds denominators. Uncertainty bands point back to projections, Wilson ranking, and analog forecasts. Sampling bias points back to quiz generation and simulation. Entropy and capacity point back to Intel. Analog reasoning points forward to simulation validation and operator payload gates.

### 28. Counting, Rates, and Ratios

Status: final

Every advanced statistic in this project begins with a count. A count is the number of objects in a defined set. The definition of the set is the first mathematical act.

Examples:

```text
misload_count = number of misload rows
LIB_total = labeled LIB Total, or scan-log row count fallback
loader_count = distinct users in accepted PD scan rows
sorter_attempts = number of quiz events for one sorter
cube_load_count = sum of total loads, not destination-row count
```

A count is only meaningful when the population is named.

#### Sums and Means

The project uses sums when the numerator is additive:

```text
outbound_net = sum(LooseOutbound + BagsLinked)
total_scan_hours = sum(SCANTRACK employee scan hours)
total_paid_hours = sum(SPR paid hours)
cube_utilization = sum(loaded cube) / sum(equipment capacity)
```

A mean is a sum divided by a count:

```text
mean = sum(values) / n
```

The dashboard sometimes computes average values across employees, such as mean scan PPH, but the snapshot chapter prefers ratio-of-sums for SCANTRACK average PPH:

```text
SCANTRACK avg PPH = total packages / total scan hours
```

That is a weighted mean of per-person PPH values, weighted by scan hours. It is usually the correct choice when each person has a different amount of exposure.

#### Rates and Ratios

A rate is a ratio with a time or exposure denominator:

```text
PPH = packages / hours
```

A ratio compares two quantities:

```text
rho_pd_hub = PD volume / hub volume
kappa_Z3 = Zone 3 volume / reference volume
utilization = scan hours / paid hours
```

The project should avoid calling all ratios "rates." Misload frequency is displayed as `1/N`:

```text
misload frequency denominator = handled volume / misload count
```

That is not a speed. It is an inverse event frequency: one misload per `N` handled packages.

#### Dedupe Rules

Counts can be wrong when duplicates are not handled. The label-training storage keeps sort events as event records, so repeated answers are real repeated attempts. The dashboard SCANTRACK parser keeps the first occurrence per user in the Twilight Employee Summary because that first occurrence is treated as the total row. Live tracker loader counts use distinct users and interval logic.

The rule is:

```text
dedupe only after naming the entity being counted
```

If the entity is an answer attempt, duplicates are attempts. If the entity is a person, duplicate rows for the same user may need consolidation.

#### Missing Data

Missing data should not be silently converted into truth. The code often uses fallbacks, but the manuscript must name them. For example:

- LIB total falls back to scan-log row count when the labeled total is absent.
- Misload handled volume falls back from SVQ Twilight total to SPR actual `Volume + Air Volume`.
- Live analog forecast blocks when paid-hour source is missing.
- Adjusted building PPH blocks when SCANTRACK or SPR hours are missing.

Zero, null, missing, and blocked are different states.

#### Source Basis

- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: dashboard counts, ratio-of-sums, misload/LIB/cube denominators, and fallback behavior.
- `Live-Sort/tracker_v6.3-codex.html`: live Outbounds ratios and utilization.
- `Label-Training-Certification/js/analytics.js`: quiz-event counts, accuracies, and thresholds.
- `Operations/adapters/live_analog_forecast.py`: blocked state when paid-hour source is missing.

### 29. Uncertainty, Intervals, and Bands

Status: final

Uncertainty is not an apology for bad data. It is the part of a measurement that says how far the next observation might reasonably move.

The project uses uncertainty in several forms:

- percentile bands for volume and completion forecasts,
- Wilson intervals for employee ranking,
- simulation gates for estimator validation,
- analog distance bands for live analog forecasts,
- and reliability bars driven by sample depth and band width.

#### Variance and Spread

For observed values `x_1, ..., x_n`, the mean is:

```text
mean = sum(x_i) / n
```

The population-style variance used in several JavaScript helper paths is:

```text
variance = sum((x_i - mean)^2) / n
```

The standard deviation is:

```text
std = sqrt(variance)
```

The dashboard and tracker often prefer percentiles because they are easier to explain operationally. A median says "middle observed value." A p25-p75 band says "middle half of observed values."

#### Percentile Bands

The tracker's percentile helper linearly interpolates between sorted observations:

```text
i = (p / 100) * (n - 1)
lo = floor(i)
hi = ceil(i)
percentile = sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo)
```

Projection tables use median, p25, and p75. Live belt pace compares scanned net volume against the p25-p75 projection band:

```text
scanned < p25 -> BEHIND
scanned > p75 -> AHEAD
otherwise     -> ON TRACK
```

This is not a guarantee that the belt will finish late or early. It is a band comparison against historical or projected support.

#### Confidence Intervals and Wilson Ranking

The tracker uses a Wilson 95% interval to rank employees in analyst detail. For `k` successes out of `n` trials, with `z = 1.96`, it computes:

```text
p = k / n
center = (p + z^2 / (2n)) / (1 + z^2/n)
half = z / (1 + z^2/n) * sqrt(p(1-p)/n + z^2/(4n^2))
lower = center - half
upper = center + half
```

The ranking uses the lower bound, not the raw observed value. In the current tracker, employee PPH is converted into a pseudo-success proportion by dividing by 400 and clipping at 1.0. Pseudo sample size is derived from scan hours:

```text
p_obs = min(pph / 400, 1)
n_pseudo = max(round(hours * 2), 1)
```

This is a practical ranking device, not a literal binomial success model. The chapter should state that caveat. It penalizes small samples and prevents a tiny scan window from outranking longer, steadier work solely because of a high raw PPH.

#### Prediction Bands and Completion Forecasts

The PERT completion estimator uses p10, p50, and p90 historical phase PPH values. Expected phase PPH is:

```text
te = (p10 + 4*p50 + p90) / 6
```

and the uncertainty proxy uses:

```text
s2_pph = ((p90 - p10) / 6)^2
```

The result renders a completion estimate and an 80% band. If required historical phase data is absent, the tracker falls back to a linear estimate.

#### Band Width as Reliability Signal

Wide bands mean the project has less precise support. The Intel projection view uses band width and sample depth to show reliability. A tight p25-p75 range with reasonable source depth is more actionable than a wide band from sparse allocation evidence.

The manuscript should describe reliability as evidence strength, not as truth. A strong band can still be wrong on a special day. A weak band can still be useful if it is clearly labeled.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `_percentile()`, projection bands, live pace band comparison, Wilson interval, PERT completion estimator, and reliability copy.
- `Operations/adapters/live_analog_forecast.py`: matched analog distance band and validation warnings.
- `Operations/adapters/simulation_validation_capsule.py`: simulation validation gates and DOW positive/negative controls.

### 30. Sampling and Bias

Status: final

Sampling is the act of choosing which observations enter a method. Bias is what happens when that choice changes the answer in a systematic way.

HII has several sampling surfaces:

- the label quiz samples truth-table entries and special question families,
- the dashboard samples whatever files were uploaded for one sort,
- the live tracker samples repeated CSV pulls during a sort,
- projection bands sample historical sorts and belt-days,
- simulation samples synthetic sort rows,
- RAG samples knowledge-graph nodes and references.

The project should name the sampling frame every time it reports a statistic.

#### Uniform Sampling

Uniform sampling gives each item in a set the same probability:

```text
P(item_i) = 1 / n
```

Uniform sampling is simple, but it can be wrong for training. If the quiz sampled uniformly from all ZIP rows, common ordinary routes would dominate and rare exception logic would be nearly invisible.

#### Weighted Sampling

Weighted sampling assigns each item or group a mass:

```text
P(i) = w_i / sum(w_j)
```

The quiz uses weighted sampling over route families. Regular states get weight proportional to supervisor state weight times entry count. MULTIDEST, exception, and air buckets use average-state-equivalent mass. That design intentionally oversamples rare or important concepts relative to raw ZIP count.

Weighted sampling is not cheating. It is a curriculum choice. The risk is that the resulting quiz accuracy estimates are no longer estimates of raw ZIP-distribution accuracy unless the weights are accounted for.

#### Stratified Sampling

Stratified sampling divides a population into groups, then samples within each group. In this project, natural strata include:

- state,
- belt,
- MULTIDEST versus ordinary ground,
- air versus ground,
- shipper-error exception templates,
- day of week,
- belt zone,
- sort phase,
- and source file type.

The MULTIDEST sampler is stratified by concept family. The Intel projection data is stratified by day of week and belt. The live analog forecast scores trajectories against a live-state vector rather than treating all historical or synthetic rows as equally relevant.

#### Rare Class Oversampling

Rare class oversampling is useful when the rare class matters more than its raw frequency. Exceptions and air rules are examples. If the training objective is "make sure the learner can handle the exception," the sampler should force exposure.

The danger is overinterpreting the resulting score. A quiz that oversamples exceptions is a better exception-training tool, but its overall accuracy is not the same as expected raw-volume-weighted live accuracy.

#### File Availability Bias

Dashboard and tracker analytics are biased by file availability. A snapshot with SPR but no CURE can describe planned/actual SPR fields but cannot describe CURE gaps. A live analog forecast with fewer than the minimum matched trajectories is blocked. A projection band from sparse belt-day allocation has weaker support than one built from deeper history.

The correct response is not to discard every partial file. It is to carry source coverage and readiness status into the output.

#### Survivorship and Selection Bias

Training analytics only observe people and sessions that used the quiz. If weaker learners avoid the quiz, observed accuracy can overstate certification readiness. If supervisors assign drills after a problem is noticed, the sampled questions can overrepresent problem areas. If live CSV pulls are missing during the most chaotic part of the sort, live tracker history can underrepresent the worst period.

The manuscript should not erase these biases. It should turn them into future validation tasks.

#### Source Basis

- `Label-Training-Certification/js/quiz.js`: weighted question selection and average-state-equivalent bucket mass.
- `Label-Training-Certification/js/analytics.js`: event-based training analytics and time-window reducers.
- `Live-Sort/tracker_v6.3-codex.html`: DOW/belt projection bands, live timeline pulls, and live pace comparison.
- `Operations/adapters/live_analog_forecast.py`: feature-weighted analog distance and minimum-match blocking.
- `Operations/adapters/simulation_validation_capsule.py`: positive and negative DOW gates for simulated corpora.

### 31. Entropy, Concentration, and Balance

Status: final

Entropy is the project's way to ask a simple operational question without turning it into gossip about one person:

```text
Is the work inside a zone spread across people, or is it concentrated on one scanner?
```

The mathematical starting point is a count vector:

```text
counts = [packages handled by user 1, packages handled by user 2, ...]
```

From counts, define a probability distribution:

```text
p_i = count_i / sum(counts)
```

`p_i` is a share, not a package count. It says how much of the observed zone work belongs to person `i` within that zone.

#### Shannon Entropy

The tracker uses normalized Shannon entropy:

```text
H = - sum_i p_i * log2(p_i)
H_max = log2(k)
H_norm = H / H_max
```

where `k` is the number of employees with positive package counts. The implementation returns zero when total count is zero, skips nonpositive counts inside the sum, and returns zero when there is only one positive employee because `H_max` is then zero.

`H_norm` is bounded between zero and one:

- near `1`: work is spread evenly across active employees;
- near `0`: work is concentrated in a small number of employees.

This is not a moral score. It is a concentration diagnostic. A low-entropy zone could mean one person is carrying the work, or it could mean the zone has a short sample, unusual belt mix, scanner assignment issue, or data artifact. The operator claim must stay narrow unless the source data supports more.

#### Project Implementation

`computeZoneEntropy()` reads `DATA.emp.rows`, then evaluates each configured Intel zone. For each zone it:

1. keeps rows whose `Belt` belongs to the zone's belt set;
2. reads the `User` field;
3. excludes configured ignored users and scanner IDs starting with `SLS`, `ASX`, or `SS`;
4. sums `Total Packages` by user;
5. filters to positive package counts;
6. computes normalized Shannon entropy;
7. records the dominant user and dominant share;
8. sets `riskFlag` when `H_norm < 0.40` and at least three employees have positive counts.

The three-employee condition matters. With one or two people, a low entropy number is usually not enough evidence to call a concentration risk. With three or more active employees, concentration has more operational meaning.

#### Belt and Zone Imbalance

Entropy is not the only balance measure in the project. The live analog forecast adapter computes two imbalance features:

```text
belt_imbalance = max(belt_volume) / average_positive_belt_volume - 1
zone_imbalance = max(zone_share) - min(zone_share)
```

`belt_imbalance` is zero when all positive belts have the same volume. It grows as one belt becomes heavy relative to the average. `zone_imbalance` compares the three zone shares and records the spread between the largest and smallest share.

These are features in an analog distance function, not direct proof that a supervisor should move a person. They help identify whether the current live state resembles prior or simulated trajectories with similar imbalance patterns.

#### When Imbalance Is Meaningful

An imbalance metric becomes operationally meaningful only after four checks:

```text
source rows are current
denominator is named
sample size is adequate
claim surface is bounded
```

For entropy, the denominator is within-zone observed package share by user. For belt imbalance, the denominator is average positive belt volume. For zone imbalance, the denominator is total observed zone volume converted to shares.

The manuscript should not collapse these into one vague idea of "balance." Entropy measures concentration of work among users. Belt imbalance measures heaviness of one belt against other positive belts. Zone imbalance measures spread across zone shares. They answer related but distinct questions.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `shannonEntropy(counts)` and `computeZoneEntropy()`.
- `Operations/adapters/live_analog_forecast.py`: `_belt_imbalance()`, `_zone_imbalance()`, and `NUMERIC_FEATURES`.
- `Live-Sort/tests/test_intel_live_population.py`: source checks for live Intel queue and denominator behavior.
- Existing Chapter 22: zone entropy and concentration-risk tracker discussion.

### 32. Queueing and Capacity

Status: final

A queue forms when arrivals exceed effective service capacity. In the live tracker, that idea is used as a diagnostic, not as a full queueing-theory model of the building.

The simplest service model has three quantities:

```text
lambda = arrival or induction rate
mu     = service rate per server
c      = number of servers
```

The total service capacity is:

```text
capacity = c * mu
```

The utilization ratio is:

```text
rho = lambda / capacity
```

When `rho < 1`, the modeled system has enough capacity to process arrivals at the current rate. When `rho > 1`, arrivals exceed modeled capacity and backlog can grow.

#### Tracker Queue State

The tracker function `computeSortQueueState(currentPPH, currentStaffing, inductionRate, remainingVol=null)` implements this model directly:

```text
mu = currentPPH
c = currentStaffing
lambda = inductionRate
capacity = c * mu
rho = lambda / capacity
```

Then it classifies the state with configured thresholds:

```text
rho < 0.60       -> clearing
0.60 <= rho < .85 -> balanced
0.85 <= rho < 1.00 -> building
rho >= 1.00      -> critical
```

The language in the UI is intentionally operational. "Clearing" means the modeled system is clearing faster than induction. "Balanced" means maintain current staffing. "Building" means watch and consider staffing changes. "Critical" means immediate action or late sort risk.

#### Backlog Time

When `rho > 1` and remaining volume is available, the tracker estimates backlog minutes:

```text
net_growth = lambda - capacity
projected_backlog_minutes = remaining_volume / net_growth * 60
```

The units matter. If `lambda` and `capacity` are packages per hour, then `remaining_volume / net_growth` is hours. Multiplying by 60 converts hours to minutes.

The formula is only meaningful when `net_growth > 0`. If capacity is zero, `rho` is treated as infinite. If remaining volume is missing, the function returns a state and recommendation without backlog minutes.

#### Why Hub Flow Is Only Approximately Queue-Like

The function header labels the model as `M/M/c`, but the project should describe it more carefully in the manuscript. A real hub sort is not a clean memoryless queue with identical servers and independent arrivals. Packages arrive in waves. Scanners and loaders have different assignments. Belt conditions change. SPR and SCANTRACK observations update on file-pull cadence, not continuously. Some work is constrained by physical trailer readiness or destination state rather than abstract service rate.

So the correct interpretation is:

```text
queue state is a live capacity diagnostic based on utilization, not a complete stochastic proof of queue behavior
```

That distinction prevents overclaiming. The tracker can use `rho` to make a simple risk light. It should not pretend that all assumptions of a formal M/M/c theorem have been validated.

#### Relationship to Other Forecasts

Queue state is local and immediate: compare current induction pressure against current capacity. Analog forecasting is comparative: find prior or simulated trajectories with similar state vectors. PERT-style completion is phase-based: estimate remaining completion from current volume and phase PPH. These methods can agree or disagree. When they disagree, the manuscript should treat that as an investigation target rather than forcing a single answer.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: `RHO_OVERCAPACITY`, `RHO_BALANCED_HI`, `RHO_CRITICAL`, and `computeSortQueueState()`.
- `Live-Sort/tests/test_intel_live_population.py`: source checks that Intel queue state uses live SPR fallback denominators.
- Existing Chapter 19: queue state and live risk.

### 33. Forecasting and Analog Reasoning

Status: final

Analog forecasting asks a practical question:

```text
Which known trajectory looks most like the live state we are seeing now?
```

This is not a neural network forecast. It is a deterministic nearest-neighbor method over explicitly named features. The current live state is represented as a vector. Candidate trajectories have interval-level vectors and final outcomes. The adapter scores distance, selects a family, collapses final outcomes, and blocks unsupported claims.

#### State Vector

The live-state vector includes:

```text
elapsed_sort_fraction
cumulative_volume_fraction
current_adjusted_building_pph
pph_slope_30m
paid_hours_burned
active_loader_count
belt_imbalance
zone_imbalance
```

The adapter can build this live state from pipeline artifacts. It reads a live-sort ingestion baseline and a tracker operator payload, selects a sort date, derives day of week, computes elapsed fraction for an 18:00-22:00 window, divides observed SCANTRACK net volume by planned median volume for cumulative fraction, pulls adjusted building PPH from the overlap artifact, reads SPR actual hours, reads employee PD loader count, and computes belt and zone imbalance from the latest belt totals.

`pph_slope_30m` is computed from timeline points inside the last thirty minutes when at least two usable adjusted-building-PPH points exist. If it cannot be computed, the live-state builder records a warning rather than inventing a value.

#### Weighted Distance

For each numeric feature, the adapter uses a weight and a scale:

```text
feature_distance = weight * abs(live_value - interval_value) / scale
```

The total numeric distance is the weighted average over features that exist in both the live state and the interval:

```text
distance = sum(feature_distance) / sum(used_weights)
```

The current feature weights are:

| Feature | Weight | Scale |
| --- | ---: | ---: |
| `elapsed_sort_fraction` | 3.0 | 0.10 |
| `cumulative_volume_fraction` | 3.0 | 0.10 |
| `current_adjusted_building_pph` | 2.0 | 20.0 |
| `pph_slope_30m` | 1.0 | 5.0 |
| `paid_hours_burned` | 1.0 | 150.0 |
| `active_loader_count` | 1.0 | 20.0 |
| `belt_imbalance` | 1.0 | 0.20 |
| `zone_imbalance` | 1.0 | 0.20 |

Day-of-week and sort mismatch each add a penalty of `1.0`. This means the method strongly prefers trajectories with the same temporal and sort context, while still scoring numeric similarity explicitly.

#### Nearest Intervals and Family Selection

Each trajectory must have interval rows. Final-only rows are blocked because they do not say how the sort evolved. For each trajectory, the adapter merges trajectory-level metadata with each interval and keeps the nearest interval to the live state.

Then it groups scored matches by `family_id`. The chosen family is the one with the smallest median distance, with smallest single distance used as a tie-breaker. Matches inside that family are sorted by distance.

This family step is important. The method does not simply take the top isolated row across unrelated trajectory families. It tries to keep the forecast inside one coherent analog family.

#### Forecast Collapse and Gating

When the validation gate passes, final outcomes are collapsed by median over matched final records:

```text
projected_final_volume
projected_final_paid_hours
projected_final_adjusted_building_pph
projected_final_outbound_load_pph
projected_at_risk_volume
```

The forecast also includes a matched-analog count and distance band. It always blocks the claim `causal staffing explanation`. The method can say that similar trajectories ended in certain final outcomes. It cannot say that a staffing decision caused those outcomes.

The validation gate blocks when:

- final-only simulator rows lack trajectory intervals;
- the live state is outside simulated support for key fields;
- matched analog count is below the required minimum;
- paid-hour source is missing.

It warns when match distances are too wide or when live inputs are stale. Through the operator payload adapter, a forecast is exposed only when `validation_gate_summary.overall` is `passes`. A blocked capsule produces a blocked status rather than forecast quantities.

#### Source Basis

- `Operations/adapters/live_analog_forecast.py`: live-state builder, feature list, distance function, interval scoring, family selection, support check, forecast collapse, warnings, and blocked claims.
- `Operations/tests/test_live_analog_forecast.py`: tests for final-only row rejection, nearest family scoring, median collapse, outside-support blocking, real-pipeline live-state construction, and `pph_slope_30m`.
- `Operations/tests/test_tracker_operator_payload.py`: operator payload readiness gate for live analog forecasts.
- Existing Chapters 20 and 29: forecasting and interval/band context.

#### Handoff to Simulation

Part VII explains the mathematical forms used by the operational tools. Part VIII asks a different question: if those forms are implemented in code, can they recover known truths and reject invalid claims under controlled synthetic conditions?

That handoff is important. A formula can be mathematically sensible, implemented incorrectly, and still look plausible on a dashboard. Simulation gives the project a controlled place to test identities, gates, false positives, stress envelopes, and circular evidence paths before a method is allowed to influence operator-facing language.

## Part VIII. Simulation and Validation

Part VIII is the manuscript's controlled-evidence layer. It should not read like a promise that synthetic data knows the building. It should read like a testing laboratory for denominator identities, recovery gates, edge cases, and claim promotion rules.

The core distinction is simple: real operational files can support claims about real sorts; simulation can support claims about method behavior. The simulator can validate arithmetic, stress an estimator, or expose a circular field. It cannot certify live PPH, causal staffing effects, scanner attribution, or tonight's carryover risk.

### 34. Why Simulate?

Status: final

Simulation in this project is a validation instrument. It lets the project ask whether a method behaves correctly when the true answer is known, whether denominators are wired correctly, and whether edge cases break the analytics. It is not a substitute for empirical hub evidence.

That distinction is central. A real sort file tells the project what happened in the hub. A synthetic sort tells the project what an algorithm does under controlled inputs. Synthetic data can validate arithmetic, stress a threshold, or expose a false positive. It cannot create new ground truth about real pilot-hub volume, PPH, staffing, CURE utilization, or weekly constants.

#### The Simulation Job

The simulator exists because several tracker and research methods depend on identities that should hold regardless of the data source. For example:

```text
kappa_912_pd = z3_volume / pd_total
kappa_912 = z3_volume / total_volume
rho_pd_hub = pd_total / total_volume
kappa_912 = rho_pd_hub * kappa_912_pd
```

If a method cannot recover those identities from a simulation table where every raw column is available, it should not be trusted on live data. The simulation is a clean room where the project can separate method failure from source-file noise.

The simulator also creates stress envelopes. It can push paid day, headcount, utilization, loader counts, phase fractions, spikes, and breach flags through unusual combinations. That is useful because real data may not contain enough rare cases to test every UI path.

#### What Simulation Cannot Prove

The validation capsule says the boundary directly: use the capsule to test denominator handling, estimator behavior, synthetic controls, and constraint consistency; do not use seeded simulation outputs as external evidence for real constants.

The most important blocked example is adjusted building PPH. The simulation table stores `pph_sor` near a seeded target. That makes it useful for arithmetic regression, but circular as evidence for live operator PPH calibration. The operator basis must be:

```text
canonical SCANTRACK volume / SPR Hours
```

The simulation database does not contain paired real SCANTRACK canonical volume and SPR Hours overlap rows, so it cannot validate that operator metric.

#### Evidence Tiers

For the manuscript, simulation evidence belongs in one of three tiers:

```text
method stress-test
synthetic positive/negative control
blocked for real-world operator claims
```

A method stress-test can say "the formula recovered its seeded truth." A positive or negative control can say "the estimator detected or did not invent the expected pattern." A blocked claim says "real data is still required."

#### A Second Synthetic Instrument

Since 2026-07-09 the project has a second synthetic instrument beside the Monte Carlo simulator: the shared NORTHGATE generator (`synth-hub-generator/`). It is calibrated from noised aggregates of 160 steady-state sorts — means, deviations, Dirichlet alphas, correlations, and band edges are perturbed before publication, identifiers are fictional by construction, and anomaly rates are set from documented failure modes, never fitted (CL-0258). Unlike the simulator, it emits full file-level artifacts: SCANTRACK Hub and Employee summaries and live SPR CSVs, sequenced as a replay of one synthetic sort.

That file-level fidelity closes a gap the simulator could not. The emitted replay is ingested by the unmodified production ingestion adapter, and the resulting fidelity capsule passes its structural gates — including a synthetic adjusted-building-PPH overlap computed on the accepted basis, canonical SCANTRACK net over SPR actual hours (CL-0256). The boundary from this chapter survives intact: a synthetic overlap validates the pipeline's mechanics end to end, and it still cannot calibrate the real operator display, for the same circularity reason as `pph_sor`. The generator also documents its own basis tensions instead of hiding them: its emitters rescale the SPR-basis belt mix to realize the contract kappa, as recorded in Chapter 26 (CL-0255).

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/simulation/sort_generator.py`: synthetic sort generator.
- `synth-hub-generator/README.md`, `synth-hub-generator/calibration/calibration_report.md`, and `synth-hub-generator/audits/ngate_fidelity_capsule_2026-07-09.md`: the NORTHGATE generator's sanitization argument, fit report, and production-adapter fidelity capsule.
- `Operations/adapters/simulation_validation_capsule.py`: claim boundaries, invariant checks, validation gates, and blocked adjusted-building-PPH gap.
- `Operations/adapters/tracker_operator_payload.py`: operator payload blocked metrics.

### 35. The Sort Generator

Status: final

The sort generator is a Monte Carlo data factory. It generates synthetic Twilight sorts, persists them to SQLite, and preserves enough raw structure for downstream methods to recompute the truth.

#### Persistence and Resume

The generator writes into three main tables:

```text
run_metadata
checkpoints
sorts
```

The `sorts` table has a uniqueness constraint:

```text
UNIQUE(run_id, sim_index) ON CONFLICT IGNORE
```

That makes resume idempotent. If a run is interrupted, the generator finds the next simulation index with:

```text
SELECT COALESCE(MAX(sim_index)+1, 0) FROM sorts WHERE run_id = ?
```

SQLite is opened in WAL mode, indexes are dropped during bulk insert, and indexes are recreated with an `ANALYZE` pass at the end. Worker processes generate batches; the main process performs database writes.

#### Random Structure

Each synthetic sort begins with a Gaussian copula draw:

```text
z ~ MVN(0, copula_r)
u = Phi(z)
```

The uniform vector `u` feeds marginal distributions. Total volume is drawn from a day-of-week lognormal:

```text
total_volume = lognormal_ppf(u_0; mu_ln[dow], sigma_ln[dow])
```

Paid day is drawn from a truncated normal:

```text
paid_day = truncnorm_ppf(u_2; mean, std, min, max)
```

Worked headcount is no longer drawn directly from a truncated normal. It is back-derived from volume, paid day, and planned PPH after the operating point is selected. That matches the operational idea that staffing is chosen to hit a planned PPH.

#### Destination Shares

Destination volume is allocated with a Dirichlet distribution. The generator supports day-of-week conditional Dirichlet alphas:

```text
shares ~ Dirichlet(alpha_dow)
destination_volume_i = round(shares_i * total_volume)
```

Spike events do not inflate total volume. They skew destination shares by increasing selected Dirichlet alphas and then redistribute phase share toward the spike phase.

#### PPH and Performance

The generator samples a planned PPH operating point by day of week. If calibrated standard deviations and bands exist, it draws from a clipped normal. Otherwise it falls back to a small jitter around the mean. The achieved PPH is:

```text
pph_sor = pph_sor_planned * performance_factor
```

The performance factor comes from a mixture:

```text
bad-day normal component
typical-day skew-normal component
```

It is clipped to a physically bounded range:

```text
0.5 <= performance_factor <= 1.5
```

Worked is then back-derived:

```text
worked_planned = total_volume / (paid_day * pph_sor_planned)
worked = round(worked_planned * noise)
```

The actual total hours field is:

```text
total_hours = total_volume / pph_sor
```

The cost field is carried per synthetic sort:

```text
cost_per_piece_h = 1 / pph_sor
cost_per_piece_min = 60 / pph_sor
```

#### Loader Subset and Breaches

For each zone, the generator computes an inverse LP-lite loader target:

```text
lplite_zone = ceil(zone_volume / (loader_pph_mu * sort_span * u_t_cap))
```

It then adds small integer noise and computes SCANTRACK-style zone PPH:

```text
pph_igate_zone = zone_volume / (actual_loaders_zone * sort_span)
util_zone = pph_igate_zone / loader_pph_mu
```

The breach flags are:

```text
lbr_breach: any zone PPH > lbr_threshold
hard_breach: any zone PPH > loader_pph_max
direct_overcommit: loader_hours > direct_hours_total
copula_extreme: max(abs(z)) > 3
```

#### Phase Fractions

Phase volume fractions are drawn from a three-dimensional Dirichlet distribution. The generator enforces a floor for Phase 3, then shifts spike volume into the spike phase if a spike occurred. The generated phase fields satisfy the intended conservation structure:

```text
phase1_vol + phase2_vol + phase3_vol = total_volume
p1_frac + p2_frac + p3_frac ~= 1
```

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/simulation/sort_generator.py`: schema, calibration loading, `generate_one_sort()`, database initialization, resume, checkpointing, and CLI.

### 36. Simulation Validation Capsule

Status: final

The simulation validation capsule compresses a large simulation database into the parts needed for method review. It does not write to the simulation database. It opens SQLite in read-only mode, computes audits, emits JSON, and renders a markdown report.

#### Read-Only Access

The capsule opens a database through a SQLite URI:

```text
file:/path/to/db?mode=ro&immutable=1
```

If immutable mode fails, it falls back to read-only mode and still sets:

```text
PRAGMA query_only=ON
```

That design prevents the validation process from mutating the WAL state or writing new database content.

#### Invariant Audit

The invariant audit recomputes the Zone 1, Zone 2, Zone 3, and PD totals from raw PD volume columns. It then recomputes:

```text
calc_kappa_pd = z3 / pd_total
calc_kappa_hub = z3 / total_volume
calc_rho = pd_total / total_volume
```

It compares those values to stored fields:

```text
kappa_912_pd
kappa_912
rho_pd_hub
```

It also checks the multiplicative identity:

```text
kappa_912 = rho_pd_hub * kappa_912_pd
```

The default tolerance is:

```text
0.0001
```

The output reports rows checked, failure counts, maximum absolute error, recomputed truth means, and example failing rows.

#### Controls

The negative-control gate checks whether a flat synthetic metric produces a large day-of-week effect. For the default metric `kappa_912_pd`, the large-gradient threshold is:

```text
0.02
```

If the maximum day-of-week mean gradient is above that threshold, the verdict is:

```text
review-dow-gradient
```

Otherwise it is:

```text
passes-negative-control
```

The positive-control gate does the opposite. It expects the main DOW-shaped simulation corpus to recover a visible Zone 3 PD-share gradient. The default minimum gradient threshold is:

```text
0.05
```

The pass verdict is:

```text
passes-positive-control
```

#### Estimator Recovery and Stress Envelopes

The estimator recovery summary computes weighted population quantities from raw simulated columns:

```text
z1_pd_share
z2_pd_share
z3_pd_share
z3_hub_share
rho_pd_hub
synthetic_pph_sor_seeded
```

The PPH field is explicitly labeled:

```text
pph_claim_boundary = circular-do-not-claim
```

The operator stress envelope summarizes building metrics, zone loader totals, utilization, and sanity flags. It checks cases such as:

```text
paid_day <= 0
paid_day > 6
worked > 600
zone_loader_total > 150
pph_sor < 80
pph_sor > 160
```

The phase audit checks that phase fractions sum to one within tolerance and that no phase fraction is negative.

#### Dual-Corpus Gate

The default non-legacy path builds a dual-corpus capsule:

```text
positive_dow_recovery_db = sort_simulations.db
negative_control_db = sort_simulations_bootstrap_v3.db
```

The overall summary passes only when invariant checks pass and both the positive and negative gates return pass verdicts.

#### Source Basis

- `Operations/adapters/simulation_validation_capsule.py`: `connect_readonly()`, `compute_invariant_audit()`, `compute_dow_negative_control()`, `compute_dow_recovery_gate()`, `compute_estimator_recovery_summary()`, `compute_operator_stress_envelopes()`, `_phase_constraint_audit()`, and `build_dual_corpus_capsule()`.

### 37. From Synthetic Runs to Operator Guardrails

Status: final

The operator guardrail rule is simple: simulation can promote methods, not facts about tonight's sort. A simulation can say that a denominator identity is wired correctly. It cannot say that tonight's adjusted building PPH, carryover risk, staffing effect, or scanner attribution is true.

#### Promotion Path

A simulated result may be promoted when the promoted object is a method property:

```text
formula recovers seeded truth
negative control does not invent a pattern
positive control recovers a seeded pattern
stress envelope stays inside sanity bounds
phase fractions conserve volume
```

This kind of claim belongs in analyst-detail, research notes, tests, or the manuscript. It is allowed because the claim is about the method.

#### Blocked Path

The tracker operator payload blocks simulation PPH directly:

```text
metric: simulation pph_sor
reason: synthetic-regression-only
operator boundary: use simulations for method stress tests, not live operator PPH calibration
```

The validation capsule says the same thing in more detail. It records the adjusted-building-PPH gap as:

```text
status = open-real-data-validation-gap
required_basis = canonical SCANTRACK volume / SPR Hours
simulation_pph_status = quarantined-seeded-field
```

That is the right architecture. The synthetic `pph_sor` field is deliberately useful for regression, but that usefulness is the reason it is unsafe as evidence for real PPH.

#### Other Blocked Operator Claims

The operator payload also blocks:

```text
synthetic carryover
causal staffing claims
scanner attribution claims
```

Those blocks matter because simulation can make a dashboard feel more certain than it is. If a payload field would tell an operator what happened, who caused it, or what live rate to trust, it needs real operational evidence. Synthetic validation only tells the project whether the method deserves further use.

#### Documentation Pattern

Every simulation-backed tracker method should carry a claim-boundary label:

```text
simulation stress-test
synthetic positive control
synthetic negative control
blocked-needs-real-overlap-data
circular-do-not-claim
operator-ready empirical
```

The manuscript should use the same labels as the payload and capsule. That keeps the book, tracker, and research artifacts from drifting into different evidence standards.

#### Source Basis

- `Operations/adapters/simulation_validation_capsule.py`: capsule claim boundaries and adjusted-building-PPH gap.
- `Operations/adapters/tracker_operator_payload.py`: blocked metrics and operator payload field contract.

## Part IX. Knowledge Systems and Memory

Part IX explains how the project remembers. The earlier parts define operational facts, formulas, simulations, and claim boundaries. The memory chapters ask how those facts survive across sessions without becoming vague chat history.

The order is intentional. Chapter 38 defines the typed knowledge graph. Chapter 39 separates durable JSON memory from disposable FTS cache. Chapter 40 turns long-form corpus files into addressable reference nodes. Chapter 41 ranks those nodes semantically with SPECTER2, Chroma, or TF-IDF fallback. Chapter 42 constrains model answers with retrieved context. Chapter 43 reloads that context at session start. Together, these chapters form the memory layer that the autoresearch engine uses in Part X.

### 38. The Project Knowledge Graph

Status: final

The knowledge graph is the project's structured memory. It stores constants, versions, decisions, data sources, artifacts, exceptions, concepts, and frameworks as typed nodes, then connects them with typed edges.

The implementation is JSON-primary:

```text
ai_memory/db/knowledge_graph.json
```

The source file states the philosophy directly: SQLite is a disposable cache; the JSON file is the database.

#### Nodes and Edges

The node factory creates records with:

```text
id
type
label
content
tags
metadata
session
created_at
updated_at
```

The declared node types are:

```text
constant
version
concept
operational
role
data_source
artifact
decision
exception
framework
```

The edge factory creates records with:

```text
id
from
to
type
label
created_at
```

The declared edge types are:

```text
derives_from
validates
implements
contradicts
depends_on
revised_by
grounds
parent_of
applies
connected_to
```

`add_edge()` skips duplicates when `from`, `to`, and `type` already match. `upsert_node()` updates content and merges tags when a node ID already exists.

#### Retrieval

The graph supports direct lookup, filtered node search, related-node search, and breadth-first subgraph retrieval:

```text
get_node(id)
find_nodes(type, tags, label_contains)
find_related(node_id, edge_types, direction)
get_subgraph(seed_ids, depth)
```

The subgraph function walks both incoming and outgoing edges up to the requested depth. That is important for RAG and session rituals because a current artifact may need its constants, decisions, data sources, exceptions, and parent versions at the same time.

#### Branch Context

`get_branch_context()` loads a structured packet for a branch:

```text
current_node
lineage
constants
decisions
concepts
data_sources
exceptions
```

The lineage is built by walking incoming `parent_of` edges upward. Constants, decisions, concepts, data sources, and exceptions are extracted from a depth-two subgraph around the current node.

This is how the graph supports branch-specific memory. A tracker version, whitepaper branch, or artifact can retrieve its local context without asking the model to remember the entire project.

#### Version Chains

Version nodes are retrieved by artifact tag:

```text
get_version_chain(artifact)
get_latest_version(artifact)
```

The chain is sorted by:

```text
metadata.sort_key
```

That gives the project a formal place to record lineage such as tracker versions, whitepaper branches, or manuscript versions.

#### Postmortem Integration

`add_session_nodes()` is the write path for session learnings. It can add constants, add decisions, and revise old nodes. When a `branch_id` is supplied:

```text
new constants -> branch depends_on constant
new decisions -> branch connected_to decision
revisions -> old node revised_by new node
```

This turns postmortems into memory updates instead of loose notes.

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/knowledge_graph.py`: node/edge factories, JSON persistence, search, subgraph retrieval, branch context, version chains, and postmortem integration.

### 39. Memory Database and Search

Status: final

The knowledge graph is the formal structure of the project: nodes, edges, branch context, and version lineage. The memory database is the working memory around that structure. It captures session facts, postmortems, takeaways, decisions, collaboration patterns, and short learned statements that may not yet belong in the graph as typed research objects.

The implementation is deliberately JSON-primary. The durable store is `ai_memory/db/memory_export.json`; session records are tracked in `ai_memory/db/sessions.json`; the SQLite database at `/tmp/hub_memory_v2/cache.sqlite` is a disposable full-text-search cache. This design is the answer to an earlier failure mode: if `/tmp` is cleared, memory must not disappear. In the current architecture, deleting the SQLite cache only removes a search index. The next query can rebuild it from JSON.

#### Write Path

`add_memory()` is the core write operation. It derives a memory id from the first 16 hex characters of `sha256(content + category)`, loads the JSON store, then either updates an existing record or inserts a new one. A memory row contains id, category, subcategory, content, JSON-encoded tags, session, created and updated timestamps, confidence, and source.

The store is saved before the cache is touched. `_save_store()` stamps export metadata, writes a temporary file in the durable database directory, and moves it into place as `memory_export.json`. The manuscript can therefore claim only that the implementation uses a temp-file-plus-move write pattern; it should not claim distributed transactional safety or crash consistency beyond the local POSIX-style move semantics used by the code.

After JSON is saved, `add_memory()` updates SQLite only if the cache file already exists. Cache update failures are intentionally non-fatal because JSON is the source of truth. The engineering invariant is:

```text
memory validity = durable JSON state
search speed     = optional SQLite FTS cache
```

This is the same separation of authority used elsewhere in the project: a cache may make retrieval faster, but it cannot become the canonical record.

#### Search Path

`query_memory()` searches through SQLite FTS5 when possible. Each call forces a cache-readiness check, opens the cache, creates two tables if needed, and rebuilds them from JSON when the cache is cold. The FTS table is declared with `tokenize='porter ascii'`, so the search layer applies stemming and ASCII tokenization over content, category, subcategory, and tags.

The query itself joins `mem_fts` to `mem_cache`, applies an optional category filter, orders by SQLite's FTS rank, and returns at most `n` rows. If the FTS query returns no rows, the function falls back to a direct case-insensitive substring scan over `memory_export.json`. If SQLite raises an exception, the function uses the same raw JSON fallback. This is not a semantic retrieval system. It is lexical memory search with a durable fallback.

#### Postmortems and Sessions

`save_postmortem()` stores a richer record than a short memory item. Its schema includes the session id, request, performance notes, takeaways, errors, decisions, Rafael patterns, next priority, project state, biography entry, and timestamps. It appends that record into the JSON store and also writes a per-postmortem JSON file under `ai_memory/postmortems/`.

The same function converts some postmortem fields back into searchable memory rows. Takeaways are stored as category `postmortem`, decisions as category `decision`, and collaboration patterns as category `collaboration` with `rafael_pattern` subcategory. That means the postmortem is both an archival object and a feeder into future retrieval.

Session registry functions are intentionally small: `register_session_start()` appends a session object with a start timestamp, and `register_session_end()` marks the latest open matching session with an end timestamp. `stats()` summarizes memory counts by category. `rebuild_cache()` forces a full SQLite rebuild from JSON.

#### What This Chapter Can Claim

The memory database can be described as a JSON-primary long-term memory store with a disposable SQLite FTS5 cache. The manuscript should not describe it as a relational database of record, a vector memory, or an inference engine. It stores, indexes, and retrieves textual memory. Semantic search belongs to the SPECTER2 and Chroma layer in the next chapter.

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/memory_db.py`: JSON store, SQLite FTS cache, memory CRUD, postmortems, session registry, stats, and cache rebuild.

### 40. Corpus Ingestion

Status: final

Corpus ingestion is the bridge between long-form research documents and the project knowledge graph. The whitepapers remain full documents on disk, but `corpus_ingest.py` turns them into smaller reference nodes that the graph and retrieval layers can search, score, and cite.

The default source directory is the sibling `whitepapers/` folder unless `NGATE_WHITEPAPER_DIR` or `--dir` overrides it. The default file pattern is `hub_ops_*.md`. If explicit filenames are provided, those exact files are used. If `--all` is passed, every matching file is ingested. Otherwise, the script parses `_vX.Y.md` suffixes and keeps the highest version for each lineage, with unversioned files kept as separate candidates. This prevents old whitepaper versions from flooding the reference graph during normal runs while still allowing all-version ingestion when the research question is historical.

#### Chunking

The chunker works at the markdown section level. `_split_sections()` records the document title from the first `# ` heading and splits sections on level-two `## ` headings. Text before the first level-two heading becomes a `(preamble)` section, so preface material is not dropped.

`chunk_markdown()` aims for chunks between 200 and 2000 characters by default. Sections shorter than the minimum are merged forward. Oversized sections are passed to `_hard_wrap()`, which tries to split on paragraph boundaries and only uses character windows for a paragraph that is itself too large. This is a practical locality rule. A chunk should usually contain enough text to carry meaning, but not so much that an embedding or RAG context block is dominated by one long section.

The code does not parse theorem/proof structure as a formal grammar. It preserves section and paragraph locality, which is a weaker and more accurate claim.

#### Reference Nodes

For each chunk, `build_reference_nodes()` creates a KG node of type `reference`. The node id is deterministic: an MD5 hash of `filename::chunk_index::chunk_title`, prefixed with `ref_`. Re-running ingestion on the same file and section sequence therefore upserts the same node ids rather than creating duplicates.

Each node content begins with a lightweight document-section header:

```text
[doc_title - chunk_title]
chunk_text
```

The label is the chunk title plus the parsed lineage. Tags include the file stem, `reference`, `whitepaper`, and the parsed version tag. Metadata records the source file, lineage, version, document title, section, chunk index, and character length. The session field is `corpus_ingest`.

#### Graph Writes, Grounding Edges, and Pruning

`ingest()` builds every node first. In dry-run mode it prints the file/chunk plan and writes nothing. In write mode it loads the knowledge graph, upserts each reference node, and, when a seeded whitepaper branch node has matching `metadata.filename`, adds a `grounds` edge from the reference chunk to that branch.

Pruning is opt-in. With `--prune`, the script removes stale reference nodes only for the file currently being re-ingested, and it removes edges connected to those stale nodes. It does not prune other sources or older lineages globally. This matters because "zero information loss" in this context means additive by default, not that every prior reference node is immortal.

After the graph is saved, the script optionally warms the embedding cache. It imports `embed_nodes()` and `SCOREABLE_TYPES`, embeds the full scoreable node set, and prints the backend used. If embedding fails, the reference nodes remain saved and the script reports that the embedding step was skipped.

#### What This Chapter Can Claim

Corpus ingestion can be described as deterministic chunk-to-reference-node construction with optional branch grounding and optional embedding-cache warming. It should not be described as document understanding. The script does not prove a theorem, infer a citation graph, or validate the truth of whitepaper claims. It makes the corpus addressable.

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/corpus_ingest.py`: file selection, version parsing, chunking, node construction, graph upsert, scoped pruning, and embedding warmup.

### 41. SPECTER2, Chroma, and Semantic Retrieval

Status: final

The semantic retrieval layer answers a different question than the memory FTS layer. FTS asks whether a text contains matching words. Semantic retrieval maps texts into vectors and asks which nodes are near a query in that vector space.

From first principles, an embedding model is a function:

```text
E(text) -> vector in R^d
```

If vectors are normalized, cosine similarity reduces to a dot product:

```text
similarity(query, node) = E(query) dot E(node)
```

This is a ranking score, not a proof of relevance. It is useful because a query about staffing constants may be close to queueing concepts or branch decisions even when the exact words do not match.

#### Backend Selection

`briefing_scorer.py` uses a three-tier backend:

1. `specter2_adapters`: loads `allenai/specter2_base` through the adapters library and adds two task-specific adapters. The proximity adapter encodes nodes/documents, and the `adhoc_query` adapter encodes short session queries.
2. `specter2`: loads `allenai/specter2_base` through sentence-transformers and uses the same model for nodes and queries.
3. `tfidf`: a zero-dependency fallback using a frozen vocabulary of up to 2000 non-stopword terms.

The code prefers the adapter split because node text and short queries are different retrieval objects. If the adapter path is unavailable, it degrades to the base SPECTER2 encoder. If that is unavailable, it still returns a normalized lexical vector so broad filtering continues to work.

The manuscript can mention SPECTER2's scientific-document origin as the project rationale for trying it on operations research, queueing, and statistical material. It should not claim that SPECTER2 is validated for hub-specific SLIC codes or PD belts. The RAG chapter below explicitly compensates for that weakness.

#### Node Text and Checksums

The text embedded for a node is built from the node label, the first 400 characters of content when content differs from the label, and tags. A 12-character MD5 checksum of this text drives incremental embedding. If the checksum has not changed, the node does not need to be re-embedded.

The cache metadata also guards against incompatible vector spaces. If the active backend changes, or if a stored SPECTER2 model name no longer matches `allenai/specter2_base`, the code rebuilds the cache rather than dotting vectors from different coordinate systems. For TF-IDF, the vocabulary is frozen and persisted so query vectors and node vectors stay in the same dimensions after new graph nodes are added.

#### Chroma Store

`chroma_store.py` is the persistent vector store wrapper. It creates a Chroma collection named `kg_nodes` under `ai_memory/db/chroma` and sets Chroma's HNSW space to cosine distance. Query results are converted back to similarity with:

```text
score = 1 - cosine_distance
```

The wrapper stores embeddings with metadata, supports batch upserts, can delete stale ids, returns per-node checksums, and exposes collection metadata for backend/model/dimension tracking. If `chromadb` is not installed, the same public interface falls back to an in-memory dictionary and computes cosine similarity directly. That fallback preserves the scoring flow for the current process, but it is not a persistent vector store.

#### Scoring

`score_nodes()` loads the knowledge graph, filters to scoreable node types, embeds the scoreable set, embeds the query in the same coordinate space, then asks Chroma for up to three times the requested result count so boosts can be applied before truncation.

The scoreable types are `concept`, `decision`, `framework`, `collaboration`, `operational`, `learned`, `reference`, and `constant`. Critical always-show types are `constant`, `exception`, and `version`; they are appended as pinned nodes if they are not already in the top result set.

There are two explicit boosts. Nodes mentioned in recent postmortem decisions, takeaways, or errors receive a 15 percent multiplicative recency boost, capped at 1.0. `decision` and `collaboration` nodes receive an 8 percent type boost, also capped at 1.0. These boosts are heuristics. They prioritize continuity and decision memory; they do not make a node true.

#### What This Chapter Can Claim

The semantic layer can be described as vector retrieval over selected KG node types, using SPECTER2 adapters when available, base SPECTER2 when available, and frozen-vocabulary TF-IDF as fallback. Chroma is the persistent vector index when installed. Claims about answer correctness must be deferred to the RAG and claim-ledger layers, because high similarity is only a retrieval signal.

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/briefing_scorer.py`: backend selection, node text, checksum cache, embedding, query embedding, scoring, boosts, pinned nodes, and session-query construction.
- `~/Desktop/Twilight 050426/ai_memory/chroma_store.py`: Chroma collection, cosine similarity, metadata storage, checksums, and in-memory fallback.

### 42. RAG for the Pilot Hub / HII

Status: final

RAG, or retrieval augmented generation, is the project's constrained-answer layer. The model is not asked to answer from its base weights alone. The system first retrieves project context, formats that context into the prompt, and then instructs the local model to answer only from that context.

`hub_rag.py` wraps a local Ollama model named `hub-qwen`. Its public `ask()` function retrieves KG nodes, builds a compact context block, and calls `http://localhost:11434/api/generate`.

#### Retrieval Pipeline

The retrieval pipeline combines semantic search and lexical protection.

First, `_extract_terms()` pulls key terms from the query: PD designators, SLIC numbers, bay numbers, four-digit codes, dotted abbreviations such as `L.L.`, and non-stopword tokens of at least three characters. These terms are used to detect when semantic retrieval has failed to cover the entity in the question.

Second, `_retrieve()` calls `score_nodes()` with an 8x over-fetch. It removes `reference` nodes from the immediate answer set, deduplicates by node id, and then re-ranks by node type tiers:

```text
Tier 1: operational, constant, exception, learned
Tier 2: decision, concept, framework, data_source, role, tool
Tier 3: collaboration, version, artifact
```

Within Tier 1, exception and operational nodes are placed before learned nodes and constants. This is a domain-specific correction: a constant may score highly but still be less useful than an entity-specific operational exception.

Third, the keyword supplement fires if either fewer than three Tier 1 nodes survive or the retrieved nodes fail the coverage test. Coverage means at least one retrieved node contains two or more key query terms. The supplement bypasses embeddings and scans `knowledge_graph.json` directly for non-reference nodes with at least two matched terms. Those keyword hits are merged with the semantic Tier 1 results, and the final answer context is capped at the requested top-k.

The reason for this hybrid design is explicit in the source comments: SPECTER2 can collapse out-of-domain operational jargon such as SLIC codes, PD belts, and company names into high-scoring but irrelevant technical nodes. Keyword supplement is an anti-collapse mechanism for entity queries.

#### Context Block

`_build_context_block()` formats each retrieved node as:

```text
[TYPE] Label
Content
```

The block begins with a `[CONTEXT - retrieved from the hub knowledge graph]` banner and stops when adding another node would exceed `MAX_CTX_CHARS`, currently 5000 characters. This cap is a prompt-size control, not an evidence-quality score.

#### Prompt Guardrail

When context exists, the prompt gives the model a strict answer contract. It says to use only the facts in the context block, find the context entry that directly names the entity in the question, quote the entry's key fact, state the answer from that quote, and say `Not found in context.` if no context entry mentions the entity. It also states that the model's base training knowledge is wrong for these operational specifics and that the context block is ground truth.

This guardrail does not make hallucination impossible. It makes the intended behavior auditable: if the answer is not supported by the context block, the failure is visible. The no-context fallback prompt is weaker; it asks the model to answer based only on known hub facts and say so if uncertain. That fallback should be treated as a hardening target for future revisions if the system is expected to be strictly grounded in every path.

#### What This Chapter Can Claim

The RAG layer can be described as a local-model answer wrapper grounded in KG retrieval, with semantic over-fetch, type-tier reranking, keyword supplementation for entity coverage, a 5000-character context cap, and a context-only prompt guardrail. It should not be described as a theorem prover or as a guarantee of truth. It is a constrained generation layer whose correctness depends on the retrieved context and the model following the prompt.

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/hub_rag.py`: query term extraction, semantic retrieval, tier ranking, keyword supplement, context block construction, Ollama call, and prompt guardrail.

### 43. The Start Ritual and Context Loading

Status: final

The start ritual is the continuity mechanism for long-running research. Its job is to rebuild working context at the beginning of a session: current branch, graph state, relevant constants, recent decisions, last-session errors, next priority, and optionally the top scored KG nodes for the current query.

The script is `ai_memory/start-ritual.py`. The installed `start-ritual` skill points the assistant to that script and instructs it to show the full briefing rather than summarize it. That is the correct user-facing behavior: the briefing is not merely a status line; it is the recovered operating context.

#### Branch Detection and Legacy Memory

`run()` starts by loading the knowledge graph and printing graph statistics. It then calls the legacy `session_start.run()` function, which preserves the older memory-start behavior such as FTS restoration and postmortem briefing. If the legacy import or run fails, the start ritual prints a warning and continues with an empty legacy context.

If no branch ids are passed, the script auto-detects the latest tracker branch by scanning the live tracker directory for `tracker_vX.Y.html` files and choosing the highest version. The fallback branch id is `tracker_v4.0`. The script also defines a helper that returns the known whitepaper branch ids, but the default `run()` path loads the detected tracker branch unless additional branch ids are supplied.

#### Branch Context

For each selected branch id, `render_branch_briefing()` calls `kg.get_branch_context("", branch_id)`. It prints the current node label and content preview, version lineage, constants, SLIC exceptions, active decisions, linked concepts, and data sources when those fields are present.

This is where the knowledge graph becomes operational. A version chain is not just stored; it is rendered as the branch lineage the next session should remember. Constants and exceptions are not buried in a database; they are pinned into the session open.

#### Smart Context

Smart context is the conscious-memory layer. It imports `score_nodes()` and `build_session_query()` from `briefing_scorer.py`. The query is built from the legacy next priority, the first selected branch id, and up to three recent decisions. The scorer returns the top nodes for that query, and the ritual prints their rank, score, type, and label.

Pinned constants, exceptions, and versions are skipped in the smart context table because the branch-context section already shows them. That prevents the top scored list from being consumed by always-show objects and leaves room for relevant concepts, decisions, references, and collaboration notes.

The default smart mode is on, with `smart_top=30`. The CLI can disable it with `--no-smart` or change the count with `--top`.

#### Continuity and End-of-Session Contract

After branch and smart context, the script prints the next priority, errors to avoid, decisions from the last session, and an end-of-session checklist. The checklist tells the operator to run the postmortem workflow, add new constants to the graph, link new tracker versions with `parent_of`, and register revisions when constants change.

This makes the start ritual a closed loop. It depends on the previous end ritual and, in turn, reminds the next end ritual what must be written back. The research system stays coherent only if both sides happen: session open loads context; session close formalizes what changed.

#### What This Chapter Can Claim

The start ritual can be described as a branch-aware context loader that combines KG branch context, legacy memory/postmortem context, and optional semantic smart context. It should not be described as an autonomous researcher. It does not decide what is true. It restores the state needed for a human-directed or assistant-directed research session to proceed without losing project continuity.

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/start-ritual.py`: branch detection, legacy session integration, branch briefing, smart context, next priority, errors, decisions, and end-of-session checklist.
- `~/.agents/skills/start-ritual/SKILL.md`: user-facing invocation behavior and fallback instructions.

#### Closing the Memory Arc

Part IX starts with storage and ends with session context. That is the right order for a long-running project. The graph and memory database preserve objects. Corpus ingestion makes documents searchable. Embeddings and Chroma rank context. RAG turns retrieved context into a constrained answer path. The start ritual then makes the best current context visible before work begins.

The next part uses those same objects as inputs to a research scheduler. Autoresearch should not be read as a separate intelligence source; it is a loop built on top of the knowledge, memory, retrieval, and context-loading layers introduced here.

## Part X. Autonomous Research Engine

Part X explains how the project spends research effort. The memory layer can preserve context, but it does not decide which branch, gap, or verification target should get the next model call. The autoresearch engine is the scheduling layer that makes that decision, records the result, and hands durable outputs back into memory and postmortem workflows.

The sequence should read as one loop. Chapter 44 defines the full cycle. Chapter 45 names the branch and experiment action space. Chapter 46 defines the reward signal. Chapter 47 explains the current MCTS/UCB1 selector. Chapter 48 explains reconciliation through ADMM prompt/state discipline. Chapter 49 closes the loop by turning session results into memory, graph updates, context docs, and formalization attempts.

### 44. The Autoresearch Loop

Status: final

The autoresearch loop is a controlled research scheduler. It selects a research action, builds a bounded prompt from local context, calls a model, parses a score block, decides whether to keep the output, logs the cycle, and updates the action-selection state.

It is not an autonomous truth engine. The loop can propose, summarize, verify against a simulator, and update branch files. It cannot make a claim true by scoring it. Truth still depends on source grounding, simulation gates, knowledge-graph verification, and later human review.

#### Preconditions and Inputs

The loop lives in `ai_memory/research_loop.py`. It requires the Anthropic SDK at import time and exits if the SDK is missing. At runtime it also requires `ANTHROPIC_API_KEY`; the script checks for the key before starting cycles.

The main configured runtime values are:

```text
N_MAX = 40
MODEL = "claude-opus-4-6"
MAX_TOKENS = 4096
SLEEP_BETWEEN = 3 seconds
```

The loop loads several local artifacts:

- `research_program.md`, which supplies standing research instructions.
- `knowledge_graph.json`, the live KG.
- `start-ritual.py` output, truncated into a KG context block.
- `sort_master_corpus.json`, sampled for sort context.
- current whitepaper branch heads.
- open-gap nodes from the KG.
- pending simulation-verification nodes.
- MCTS state from `mcts_state.json` or `research_results.tsv`.

Before the cycles begin, the MCTS path adds guardrails. It acquires a lockfile so two loop instances do not run at the same time, writes a timestamped KG backup, and checks that the KG node count is at least the configured baseline of 2700. That baseline is not a proof of KG correctness; it is a corruption tripwire.

#### One Cycle

Each cycle reloads open gaps, then selects a `(branch, experiment_type)` pair. When MCTS primitives are available, selection uses `ucb1_select()` over the MCTS state and branch-routed open gaps. When they are unavailable, the code falls back to weighted-random experiment selection and a random branch.

The loop then builds the context for the selected action:

1. If the experiment is `verify_against_sim`, select a pending simulation node and run a deterministic invariant query against `sort_simulations.db`.
2. Load the selected branch head and truncate it to the first 3000 characters.
3. Sample 12 sorts from the corpus.
4. If the experiment is `reconcile`, ask the ADMM helper for a reconcile pair and prompt block.
5. Assemble the model prompt from the research program, start-ritual KG context, branch head, corpus sample, optional target gap, optional ADMM block, and optional simulation-verification block.

The model must end with a JSON score block. `parse_score()` tries several patterns for fenced or bare JSON. If parsing fails, it returns a default score object with zero counts and summary `(score parse failed)`.

#### Keep, Discard, and Logging

`compute_score()` turns the parsed score block into a scalar reward. The output is kept only when the score is positive. A kept output is appended to a new versioned branch file through `write_output()`. A discarded output is not promoted to a branch head.

Every cycle is logged in two places:

- `research_results.tsv` stores compact cycle, experiment, branch, score, status, elapsed time, and summary fields.
- `research_cycle_log.jsonl` stores a fuller JSONL record with score data and response head/tail.

The code treats TSV as the replay source for MCTS warm starts. `persist_mcts_state()` is called after TSV append so the selector state can be rebuilt from the durable log if needed.

For kept MCTS cycles, `backpropagate()` updates `Q`, `N`, and `total_visits`. Discarded cycles skip backpropagation. This is a design choice, not a universal MCTS rule. The current policy learns from promoted output and avoids double-penalizing exploratory actions that already failed the keep gate.

If three consecutive cycles score low enough to be discarded, the loop prints that a fixed point may be approached and halts early. Every five cycles it refreshes KG context by re-running the start ritual.

#### End of Loop

At the end, the loop writes an autoresearch postmortem summary and a `.last_autoresearch_session` sentinel. The sentinel is intentionally consumed by `langgraph_postmortem.py` later; the loop prints that the user should run that script manually to complete the end ritual.

#### What This Chapter Can Claim

The autoresearch loop can be described as a model-backed research scheduler with lockfile, KG snapshot, KG integrity tripwire, MCTS or weighted-random selection, prompt construction, JSON score parsing, positive-score keep gate, TSV/JSONL logs, kept-cycle MCTS backpropagation, optional ADMM reconciliation, optional simulation verification, and postmortem sentinel handoff.

It should not be described as proving claims, autonomously maintaining the whole manuscript, or guaranteeing branch correctness. It creates candidate research outputs under a governed loop.

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/research_loop.py`: runtime config, guardrails, prompt construction, API call, parsing, reward, keep/discard, logging, MCTS update, ADMM update, simulation verification, and postmortem sentinel.
- `~/Desktop/Twilight 050426/ai_memory/mcts-upgrade/mcts_utils.py`: MCTS action space, UCB1 selection, and backpropagation.

### 45. Branches, Experiments, and Research State

Status: final

The loop's action space is the product of branch and experiment type. A branch is the research lane being updated. An experiment type is the kind of research move being attempted.

#### Branch Heads

The current branch heads in `research_loop.py` are:

```text
A       -> hub_ops_mathematical_framework_v1.27.md
B       -> hub_ops_digital_twin_v2.13.md
C       -> hub_ops_purposeful_systems_v3.26.md
D       -> hub_ops_unified_framework_v4.17.md
unified -> hub_ops_unified_opus_v5.7.md
```

These filenames are the frontier for the loop. When a kept output is written, `next_version()` increments the minor version number in the selected branch filename and `write_output()` appends the kept prose to that new file. In memory, `BRANCH_HEADS[branch]` is promoted to the new filename.

That is not the same thing as a full publication release. It is a branch-head update inside the research directory.

#### Experiment Types

The implemented experiment types are:

```text
gap_fill
synthesize
derive_constant
reconcile
cross_ref
verify_against_sim
```

With five branches, this gives 30 possible actions. `mcts_utils.py` is the source of truth for that action space. `research_loop.py` still contains one status-display line that subtracts populated nodes from 25, which is stale relative to the implemented 30-action space. The manuscript should preserve that as a drift note rather than copying the stale count.

The legacy weighted-random fallback also has experiment weights:

```text
gap_fill:           0.40
synthesize:         0.20
derive_constant:    0.12
reconcile:          0.10
cross_ref:          0.08
verify_against_sim: 0.10
```

When MCTS is available, these weights are not the main selection mechanism. They are fallback behavior.

#### Open Gaps

Open gaps are KG nodes tagged `open_gap`. The loop excludes gaps tagged `debt` from MCTS gap-bonus targeting because operational debt cannot usually be closed by a research cycle. For the remaining gaps, routing uses this precedence:

1. `metadata.branch`, if present.
2. `_classify_gap_branch()` keyword routing.
3. fallback to branch `D`.

The classifier is heuristic. It maps category-theory terms to A, digital-twin/MCTS/ADMM terms to B, CURE/SLIC/cube/utilization terms to C, cross-branch synthesis terms to `unified`, and operational/tracker terms to D.

#### Pending Simulation Verification

`verify_against_sim` uses a different target pool. It loads nodes whose metadata has `pending_verification == True` and `source == "sim"`. For one target node, `run_sim_verification()` reads `sim_column`, `sim_mean`, and `sim_std`, calls `sim_query.run_query(..., "invariant_test", ...)`, and returns a deterministic verdict such as `verified`, `failed_mean`, `failed_cv`, `inconclusive`, or `sim_db_missing`.

If a verify cycle is kept, `mark_node_verified()` sets `pending_verification` to false, stamps `verified_at`, stores verdict/evidence metadata, removes the `pending_verification` tag, and appends a `sim_verified_<verdict>` tag.

#### Research State

The branch head, KG, open gaps, pending sim-verification nodes, MCTS state, ADMM state, corpus sample, and research logs together form the research state. No single file fully describes the loop. That is why the start ritual, KG, logs, branch heads, and manuscript claim ledger need to agree.

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/research_loop.py`: branch heads, fallback experiment weights, open-gap loading/routing, pending sim verification, branch-head versioning, and output writing.
- `~/Desktop/Twilight 050426/ai_memory/mcts-upgrade/mcts_utils.py`: canonical branch and experiment action space.

### 46. Reward Design

Status: final

The reward function is the loop's local definition of research yield. It converts a model-returned score block into a scalar value used for keep/discard and, for kept MCTS cycles, backpropagation.

The current score is linear:

```text
reward = 2.0 * gaps_closed
       + 1.5 * new_grounded_claims
       + 2.0 * new_verified_claims
       + 1.0 * cross_refs_added
       - 3.0 * contradictions_found
```

This is implemented in `compute_score()`. The weights live in `SCORE_WEIGHTS`.

#### Components

`gaps_closed` rewards closing an explicitly named open gap. `new_grounded_claims` rewards claims tied to the corpus sample, standing constants, or branch context. `new_verified_claims` rewards claims that pass a stronger verification path, especially simulation checks. `cross_refs_added` rewards connecting branches or artifacts. `contradictions_found` is negative because a contradiction means the loop discovered a conflict with existing claims.

The contradiction penalty is larger in magnitude than most positive components. That is intentional. If new claims were cheap and contradictions were cheap too, the loop would learn to produce volume rather than rigor. A negative reward makes contradiction detection visible in the policy update.

#### Keep Gate

The keep rule is simple:

```text
if reward > 0:
    promote output to a new branch version
else:
    discard output
```

This gate is coarse. A positive score does not mean the output is true, polished, or manuscript-ready. It only means the score block claims enough useful work to justify preserving the cycle output.

The reward also depends on parsing. If the model fails to return a parseable JSON score block, `parse_score()` returns zeros and a `(score parse failed)` summary. That normally gives a score of zero and causes discard.

#### Reward Shaping Risk

Every reward function teaches behavior. This one could over-reward claim creation if `new_grounded_claims` is too easy to inflate. It could under-reward conservative contradiction detection if contradictions are counted only as a penalty. It could also bias the loop toward verification cycles when sim-verification targets exist, because verified claims carry high positive weight.

The right interpretation is therefore limited: the reward function is a scheduling signal, not a quality guarantee. It is useful because it gives MCTS a numerical update. It is dangerous if it becomes a substitute for claim-ledger review.

#### MCTS Backpropagation

For kept cycles, MCTS receives the scalar reward:

```text
Q(action) += reward
N(action) += 1
total_visits += 1
```

Discarded cycles are not backpropagated in the current implementation. This means MCTS learns from kept outputs only. The log still records discarded cycles, so failure history is not lost, but the selector state does not count those failures directly.

#### What This Chapter Can Claim

The chapter can claim that reward is a linear weighted score over the parsed score block and that positive score determines promotion. It can claim that kept MCTS cycles update the selector state. It cannot claim that the reward is calibrated, complete, or sufficient to decide truth.

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/research_loop.py`: `SCORE_WEIGHTS`, score parsing, reward computation, keep/discard gate, logs, and MCTS backpropagation.

### 47. MCTS in This Project

Status: final

Monte Carlo Tree Search usually appears in games. A program chooses a move, simulates possible futures, scores the result, and uses that score to choose better moves later. In this project, the word "game" has to be translated carefully. The system is not playing chess, and it is not simulating package flow during a Twilight sort. It is choosing what kind of research action to spend a model call on.

The current implementation is best described as a flat-bandit MCTS selector for the autoresearch loop. It uses MCTS/UCB1 primitives, but it does not yet build a deep tree of future states. One node is one research action: a branch and an experiment type.

#### The Game Board

The board is the research state at the start of a cycle. It is assembled from several local artifacts:

- Current branch heads: A, B, C, D, and unified.
- The live knowledge graph.
- Open research gaps grouped by branch.
- Pending simulation-verification nodes.
- The research program.
- A sample from the sort corpus.
- Prior research logs.
- The MCTS state file.

The MCTS state is deliberately small:

```json
{
  "Q": {},
  "N": {},
  "total_visits": 0,
  "warm_start_source": null,
  "created": "YYYY-MM-DD",
  "last_updated": null
}
```

`Q` stores cumulative reward by action. `N` stores visit count by action. `total_visits` stores the number of kept MCTS updates. The state is stored outside the knowledge graph in `ai_memory/mcts-upgrade/mcts_state.json`. That separation matters: the selector decides where to spend research effort; it does not write knowledge claims by itself.

#### The Move

One move is a pair:

```text
(branch, experiment_type)
```

The implemented branches are:

```text
A, B, C, D, unified
```

The implemented experiment types are:

```text
gap_fill
synthesize
derive_constant
reconcile
cross_ref
verify_against_sim
```

That gives 30 possible actions. The older build plan describes 25 nodes because it was written before `verify_against_sim` was added. The current code is the source of truth for the implemented action space.

Examples:

```text
(A, gap_fill)
(B, derive_constant)
(D, reconcile)
(unified, verify_against_sim)
```

The selector first gives absolute priority to unvisited actions. Once every action has a visit count, it applies UCB1:

```text
ucb(action) = Q(action) / N(action)
            + C * sqrt(log(total_visits) / N(action))
            + gap_bonus(action)
```

Where:

- `Q(action) / N(action)` is exploitation: how well this action has paid so far.
- `C` is the exploration constant. The code uses `sqrt(2)`.
- `sqrt(log(total_visits) / N(action))` is the exploration term for less-visited actions.
- `gap_bonus(action)` is `1.0` when the action is `gap_fill` and that branch has open research gaps.

This is the central tradeoff. The loop should not keep choosing a stale action just because old fixed weights say so. It should prefer actions that have earned reward, while still testing actions with little evidence.

#### The Rollout

In classic MCTS, a rollout often means simulating from the current game position until the game ends. Here the rollout is one autoresearch cycle.

The cycle is:

1. Reload open gaps.
2. Group open gaps by branch.
3. Select `(branch, experiment_type)` with UCB1.
4. If the experiment is `gap_fill`, choose a matching open gap for that branch.
5. If the experiment is `verify_against_sim`, choose a pending verification node and run the simulation check.
6. Load the selected branch head.
7. Sample the corpus.
8. Build a prompt from branch context, corpus, KG context, and optional ADMM or simulation blocks.
9. Call the model.
10. Parse the JSON score block.
11. Compute reward.
12. Keep or discard the output.
13. Log the cycle.
14. Backpropagate only if the output was kept.

This is why the word "simulation" can be confusing in this project. The MCTS rollout is the research attempt. The sort simulator is a separate system. It can be used by the `verify_against_sim` experiment type, but it is not the same thing as the MCTS rollout.

#### The Reward

The current reward is a weighted score parsed from the model's returned score block:

```text
reward = 2.0 * gaps_closed
       + 1.5 * new_grounded_claims
       + 2.0 * new_verified_claims
       + 1.0 * cross_refs_added
       - 3.0 * contradictions_found
```

That reward is a governance signal, not a truth oracle. It says whether the cycle produced useful research according to the loop's scoring rubric. It does not prove that the prose is correct. Correctness still depends on source grounding, simulation gates, knowledge-graph verification, and human review.

The reward also shapes behavior. If the reward gives too much credit for new claims, the loop will learn to produce more claims. If it gives too little penalty for contradictions, it will tolerate contradiction. If simulation verification is rewarded, the loop will prefer cycles that close the sim-to-KG verification path when those cycles produce kept outputs.

#### Backpropagation

Backpropagation updates the selected action after a kept cycle:

```text
Q(action) = Q(action) + reward
N(action) = N(action) + 1
total_visits = total_visits + 1
```

The implementation validates that the branch and experiment type are known. It also updates `last_updated`.

The research loop currently skips backpropagation on discarded cycles. That is an important design choice. A discarded cycle is already not promoted to a branch head. The MCTS state only learns from kept outputs. The benefit is that a high-variance action is not double-penalized by both discard and a zero/negative update. The cost is that discarded attempts are not direct negative evidence in `Q` and `N`.

#### Worked Example

Suppose action `(A, gap_fill)` has this state before selection:

```text
Q(A, gap_fill) = 6.0
N(A, gap_fill) = 3
total_visits = 40
open gaps exist for Branch A
C = sqrt(2)
```

Then:

```text
average_reward = 6.0 / 3 = 2.0
exploration = sqrt(2) * sqrt(log(40) / 3)
            ~= 1.414 * sqrt(3.689 / 3)
            ~= 1.414 * 1.109
            ~= 1.568
gap_bonus = 1.0
ucb ~= 2.0 + 1.568 + 1.0 = 4.568
```

If UCB1 selects `(A, gap_fill)` and the cycle is kept with reward `3.5`, the state becomes:

```text
Q(A, gap_fill) = 9.5
N(A, gap_fill) = 4
total_visits = 41
average_reward = 9.5 / 4 = 2.375
```

The next selection now sees that `(A, gap_fill)` has a higher observed average reward, but a slightly lower exploration bonus because it has been visited again. That is the exploitation/exploration tradeoff in this project.

#### Why This Is a Flat Bandit Today

The current system does not branch on future research states. It does not say:

```text
gap_fill -> derive_constant -> verify_against_sim -> manuscript formalization
```

as a multi-step plan inside the selector. It only chooses the next branch-experiment pair. That is why "flat bandit" is the accurate description.

The MCTS label still makes sense as a build direction because the selector uses MCTS state, UCB1 selection, rollout reward, and backpropagation. But the manuscript should be precise: the current implementation is not a deep tree search. It is an adaptive experiment scheduler built with MCTS/UCB1 primitives.

#### How a Deeper Tree Could Exist Later

A deeper tree would need to make the research state explicit. For example:

```text
state_0: Branch B has an open digital-twin gap.
action_1: gap_fill.
state_1: gap has candidate derivation but no simulator check.
action_2: verify_against_sim.
state_2: claim is verified, contradicted, or inconclusive.
action_3: formalize into manuscript or mark open gap.
```

That would make the sequence itself part of the search. The reward could then separate:

- operator value,
- mathematical rigor,
- source grounding,
- simulation support,
- contradiction reduction,
- manuscript value.

The current system is not there yet. It is the right first layer: a disciplined way to stop spending model calls according to fixed experiment weights and start allocating them according to observed research yield.

#### What This Chapter Can Claim

This chapter can claim that the autoresearch loop uses MCTS/UCB1 primitives to choose branch-experiment actions. It can claim that the implemented action space is 30 actions. It can claim that the rollout is one model-backed research cycle and that the sort simulator is separate. It can claim that kept cycles update `Q`, `N`, and `total_visits`.

It cannot claim that MCTS makes the research true. It cannot claim that the reward function captures all dimensions of quality. It cannot claim that the current selector is an optimal policy. Those are future validation questions.

The rigorous claim is narrower: MCTS gives the research loop an adaptive allocation mechanism. It learns which kinds of research actions have produced kept, scored outputs, while preserving exploration pressure and prioritizing branches with open gaps.

#### Source Basis

- `ai_memory/mcts-upgrade/mcts_utils.py`: implemented branch set, experiment set, UCB1 selection, gap bonus, warm start, backpropagation, and smoke tests.
- `ai_memory/research_loop.py`: MCTS state loading, gap grouping, UCB1 selection, prompt cycle, reward computation, keep/discard gate, logging, and kept-cycle backpropagation.
- `ai_memory/mcts-upgrade/MCTS_BUILD_PLAN.md`: original design intent, flat-bandit framing, UCB1 rationale, and the older 25-node description that is stale relative to the current code.

### 48. ADMM and Reconciliation

Status: final

ADMM stands for Alternating Direction Method of Multipliers. In its full mathematical form, ADMM solves constrained optimization problems by splitting a hard problem into smaller subproblems, then using dual variables to keep those subproblems moving toward agreement.

The project does not currently implement a full numerical ADMM solver over all whitepaper branches. The current implementation is narrower: ADMM is a reconciliation discipline inside `reconcile` cycles. It chooses which branch-pair dispute to revisit, injects a structured reconcile block into the model prompt, parses the model's proposed consensus and residual, updates a dual variable in Python, and decides whether the pair is converged, ongoing, or irreconcilable.

That boundary matters. Claude does not "do ADMM." Claude supplies domain reasoning and a proposed consensus. Python manages the state.

#### The Reconciliation Problem

The whitepaper branches can disagree. One branch may carry an older value for `gamma`. Another may carry a newer full-corpus value. A third may frame the same quantity under a different denominator. Without a reconciliation system, the loop can keep producing prose that sounds coherent inside one branch while contradicting another branch.

The ADMM layer treats those contradictions as pairwise disputes:

```text
pair_key = constant + branch_pair
```

Examples:

```text
kappa_z3_AB
gamma_AB
rho_AB
```

Each pair has:

- a current estimate from branch X,
- a current estimate from branch Y,
- a residual,
- a dual variable,
- a history of reconcile attempts,
- a convergence or irreconcilable status.

The practical question is not "Which branch sounds better?" The question is:

```text
Can these branch estimates be brought into agreement without violating corpus-derived invariant ranges?
```

#### Invariant Ranges

The implementation defines invariant bands for several constants:

```text
kappa_z3_mon:   center 0.413, low 0.393, high 0.433
kappa_z3_fri:   center 0.322, low 0.302, high 0.342
gamma:          center 0.982, low 0.972, high 0.992
rho_pd_hub:     center 0.509, low 0.484, high 0.534
epsilon_schema: center 0.040, low 0.020, high 0.060
U_T_cap:        center 0.850, low 0.820, high 0.880
```

The reconcile prompt tells the model that any proposed consensus must fall inside the relevant invariant range. A value outside the range is treated as a contradiction. That is the first guardrail: reconciliation is not free-form compromise. It is constrained by a known acceptable band.

#### Branch Estimates

The current helper looks for branch estimates in `state["branch_estimates"][branch][invariant_key]`. If no branch estimate exists yet, it initializes the two branch values around the invariant center with a small symmetric perturbation. That gives the reconcile prompt a nonzero residual even before full branch-estimate extraction is wired.

This is useful for the loop, but the manuscript should call it what it is: a bootstrap mechanism. It is not the same thing as extracting every claim from every branch and solving a calibrated optimization problem. Future work should replace bootstrapped estimates with extracted, cited branch estimates.

#### Residuals and Dual Variables

For one pair, define the branch disagreement as:

```text
residual = abs(value_x - value_y)
```

The ADMM prompt block includes:

- the branch pair,
- the two current branch estimates,
- the current dual variable,
- the `rho_admm` penalty,
- the invariant range,
- required output markers: `PROPOSED:` and `RESIDUAL:`,
- an anti-hallucination guard.

After the model responds, Python parses:

```text
PROPOSED: <consensus_value>
RESIDUAL: |val_X - val_Y| = <residual>
IRRECONCILABLE
```

Then Python updates the dual variable:

```text
lambda_new = lambda_old + rho_admm * (value_x - value_y)
```

The implementation clips the dual variable to a hard cap:

```text
abs(lambda) <= 5.0
```

That cap exists because a large dual value can distort the prompt. If the injected reconcile state becomes too forceful, the model may anchor on the desired residual rather than on evidence. The cap is a safety rule.

#### Consensus Updates

If the model returns a proposed consensus value, the implementation writes that value into both branch estimate slots for the pair. That makes the next cycle see a tighter residual rather than replaying the same dispute.

If the model returns both a proposed value and a residual, the research loop uses the reported residual to construct an effective pair of values around the proposal:

```text
value_x = proposed + residual / 2
value_y = proposed - residual / 2
```

That gives the dual update a signed disagreement to process even though the model returned a consensus summary.

#### Convergence and Irreconcilable Findings

A pair is converged when the last residual is below the configured threshold:

```text
residual < 0.01
```

A pair becomes irreconcilable when either:

- the response explicitly says `IRRECONCILABLE`, or
- the pair reaches the maximum reconcile cycle count without convergence.

The current maximum is three cycles per pair.

This is one of the most important ideas in the manuscript. Unresolved disagreement is not always failure. Sometimes the rigorous answer is:

```text
The current corpus and branch claims do not justify a consensus.
```

When that happens, the right move is to mark the pair irreconcilable, stop spending reconcile cycles on it, and move the outer MCTS loop forward.

The build plan says irreconcilable constants should be flagged in the knowledge graph. The current utility tracks them in `admm_state.json`; it does not itself write knowledge graph nodes. That is a useful gap to keep visible.

#### Anti-Hallucination Guard

The reconcile prompt explicitly tells the model not to invent corpus data to satisfy the residual. If the corpus does not resolve the discrepancy, the model must output `IRRECONCILABLE`.

This protects against a common failure mode in AI-assisted research. A model can produce a smooth consensus number even when the evidence does not support one. The ADMM layer forces the response into one of two accountable paths:

```text
produce a grounded consensus inside the invariant range
or declare the dispute irreconcilable
```

#### Worked Example

Suppose the pair is `gamma_AB`.

```text
Branch A estimate: 0.987
Branch B estimate: 0.977
rho_admm: 1.0
lambda_old: 0.25
dual_cap: 5.0
```

The residual is:

```text
abs(0.987 - 0.977) = 0.010
```

The prompt asks for a consensus inside the `gamma` invariant range:

```text
[0.972, 0.992]
```

If the model proposes:

```text
PROPOSED: 0.982
RESIDUAL: |val_X - val_Y| = 0.004
```

then the loop uses the reported residual around the proposal:

```text
value_x = 0.982 + 0.004 / 2 = 0.984
value_y = 0.982 - 0.004 / 2 = 0.980
```

The dual update becomes:

```text
lambda_new = 0.25 + 1.0 * (0.984 - 0.980)
           = 0.254
```

The residual is now below `0.01`, so the pair is converged.

If the response instead says:

```text
IRRECONCILABLE
```

the pair is marked irreconcilable and excluded from future reconcile targeting.

#### What This Chapter Can Claim

This chapter can claim that ADMM is implemented as a reconciliation layer for branch-pair constant disputes. It can claim that Python manages invariant ranges, prompt blocks, response parsing, dual updates, convergence checks, and irreconcilable state. It can claim that the current implementation owns `admm_state.json` and does not write the knowledge graph directly.

It cannot claim that the current system is a full ADMM optimizer across every branch claim. It cannot claim that Claude's proposed consensus is mathematically proven. It cannot claim that every branch estimate is currently extracted from source text. Those are future work items.

The rigorous claim is narrower: ADMM gives the autoresearch loop a disciplined way to reconcile branch-level numerical disagreements without pretending every disagreement must be resolvable.

#### Source Basis

- `ai_memory/mcts-upgrade/admm_utils.py`: invariant ranges, pair selection, branch-estimate bootstrap, prompt block, response parsing, dual update, convergence check, irreconcilable handling, and smoke tests.
- `ai_memory/research_loop.py`: optional ADMM import, reconcile-cycle injection, candidate pair filtering, prompt assembly, response parsing, dual update, convergence check, and state persistence.
- `ai_memory/mcts-upgrade/MCTS_BUILD_PLAN.md`: original ADMM design intent, prompt discipline, convergence criteria, dual cap, and anti-hallucination risk.

### 49. Postmortems and Formalization

Status: final

Postmortems are how session work becomes durable. The memory database stores the record. The knowledge graph receives decisions, collaboration patterns, and open gaps. The context document is rewritten. When available, the formalization pipeline extracts structured knowledge from transcript text and kept autoresearch output.

The implementation is `ai_memory/langgraph_postmortem.py`. It is called "LangGraph" because the preferred path uses `langgraph.graph.StateGraph`, but the file also carries a built-in linear-DAG shim. If LangGraph is unavailable, the six-node workflow still runs as a deterministic sequence.

#### The Six Nodes

The workflow has six nodes:

```text
parse_session
score_performance
extract_takeaways
extract_decisions
extract_patterns
persist
```

`parse_session` currently returns the state as given. `score_performance` computes four scores:

```text
completeness = min(10, done / max(done + missed, 1) * 10)
accuracy     = max(0, 10 - 1.5 * permanent_errors - 0.3 * caught_errors)
depth        = min(10, number_of_decisions * 2.0)
collaboration = min(10, number_of_rafael_patterns * 3.3)
overall      = average(completeness, accuracy, depth, collaboration)
```

The accuracy score intentionally treats caught-and-fixed errors as light friction and unresolved errors as larger penalties. This is not a statistically calibrated score. It is a session-quality rubric.

`extract_takeaways` creates bounded memory statements from errors, missed actions, and completed actions. Caught errors become `RESILIENCE`, permanent errors become `OPEN GAP`, missed actions become `MISSED`, and completed actions become `DONE`. Duplicate takeaways are removed and the list is capped at 25.

`extract_decisions` and `extract_patterns` validate user-supplied decision and collaboration-pattern lists by removing blank strings.

#### Persist

`persist` calls `save_postmortem()` from `memory_db.py`. That writes the postmortem to the JSON-primary memory store, writes a per-postmortem JSON file, and stores selected fields as searchable memories.

After that, `_update_context_doc()` rewrites `CLAUDE_CONTEXT.md` with current project state, next priority, recent session history, architectural constants, infrastructure rules, and collaboration patterns. The constants table in this generator should be treated as context text, not as the source of truth for current metrics. For example, the local project already records gamma 0.982 as canonical in the metric contract and research program, while this context generator still contains an older gamma row. The manuscript should mark that as context-doc drift to clean up later.

The persist node then tries `_update_knowledge_graph()`. KG update failure is caught and printed so postmortem persistence is not blocked by graph failure.

#### KG Updates

The KG updater detects a current tracker branch from `project_state["tracker"]`. If the version node does not exist, it creates a new tracker version node and links it to the highest existing tracker version with `parent_of`.

It also creates:

- decision nodes from `state["decisions"]`, with ids based on session id and an MD5 digest of the decision text;
- collaboration nodes from `state["rafael_patterns"]`, tagged `collaboration` and `rafael_pattern`;
- open-gap concept nodes from `errors_permanent`, tagged `open_gap` and `debt`.

Decision and open-gap nodes are linked to the current tracker branch when a branch is detected.

#### Autoresearch Sentinel

`research_loop.py` writes `autoresearch_postmortem_<date>.json` and `.last_autoresearch_session`. When `langgraph_postmortem.py` is run without `--test`, `_autoresearch_main()` looks for that sentinel, reads the referenced autoresearch postmortem, builds a transcript from kept cycle records and recent kept whitepaper paths, runs the postmortem workflow, and archives the sentinel with a `.processed.<date>` suffix.

That sentinel is the handoff between the scheduler and formal memory. It prevents the autoresearch loop from needing to own the whole end-ritual path.

#### Formalization

Inside `persist`, the script tries to import and run `formalization_pipeline.run_formalization()`. It passes the transcript, session id, and postmortem state. If the pipeline is missing or fails, the postmortem is still saved and the script prints that formalization was skipped.

This is the right failure mode. Durable session memory should not depend on a successful extraction pipeline. Formalization is additive.

#### What This Chapter Can Claim

This chapter can claim that postmortems are a six-step linear workflow with optional LangGraph implementation, explicit scoring formulas, JSON-primary persistence, context-doc update, best-effort KG update, and optional formalization. It cannot claim that every transcript is fully formalized or that KG update failure is impossible.

#### Source Basis

- `~/Desktop/Twilight 050426/ai_memory/langgraph_postmortem.py`: workflow nodes, fallback graph shim, scoring formulas, persistence, context update, KG update, autoresearch sentinel ingestion, and formalization call.
- `~/Desktop/Twilight 050426/ai_memory/memory_db.py`: postmortem save and memory conversion.
- `~/Desktop/Twilight 050426/ai_memory/research_loop.py`: autoresearch postmortem JSON and `.last_autoresearch_session` sentinel.

#### Closing the Research-Engine Arc

Part X should leave the reader with a bounded claim: the project has a governed research loop, not an autonomous source of truth. MCTS chooses where to spend effort. Reward decides whether an output is kept. ADMM structures a narrow reconciliation path. Postmortems and formalization decide what survives as memory or graph state.

That distinction prepares the next part. The operator payload is where research and analytics either become usable evidence, remain analyst detail, or stay blocked. Without that gate, the research loop could generate polished but unsafe operational claims.

## Part XI. Operator Payloads and Safety Gating

Part XI is the promotion boundary. Earlier chapters describe metrics, simulations, memory, retrieval, and research loops. These chapters ask which outputs may cross into the tracker as operator-facing evidence.

The three chapters are deliberately narrow. Chapter 50 defines the payload schema and allowed surfaces. Chapter 51 lists blocked claims and why they are blocked. Chapter 52 explains analyst detail as the staging area between research and operator use. This part should carry the manuscript's strongest version of the operator-ready, analyst-detail, and blocked distinction so later chapters can refer back to it instead of repeating the whole boundary.

### 50. Operator Payload Contract

Status: final

The operator payload is the schema boundary between research analytics and the tracker. Its purpose is to say which analytics are ready for operator-facing use, which belong in analyst detail, and which claims are explicitly blocked.

The adapter is `Operations/adapters/tracker_operator_payload.py`. It builds a JSON object with schema:

```text
hii.tracker_operator_payload.v1
```

The payload has five main sections:

```text
source_audits
operator_ready
analyst_detail
blocked
tracker_contract
```

#### Operator Ready

The `operator_ready` section contains fields the tracker may display as planning evidence:

- `adjusted_building_pph`
- `dow_building_bands`
- `outbound_load_bands`
- `live_timeline`
- `live_analog_forecast`

Adjusted building PPH is copied from the Sort Intelligence baseline but narrowed to safe fields. The payload includes status, basis, sample size, band, date-level `igate_net_over_sor_hours`, and rejected bases. It intentionally does not expose the rejected `sor_reported_pph` field in the operator-ready PPH object.

The live analog forecast is gate-controlled. If the forecast capsule is missing, the payload returns status `blocked`. If the capsule exists but `validation_gate_summary.overall` is not `passes`, the payload returns status `blocked` with blocked claims and warnings. Only when the gate passes does the payload expose forecast timestamp, current state, analog count, distance band, projected final volume, projected paid hours, projected adjusted building PPH, projected at-risk volume, and warnings.

#### Analyst Detail

The `analyst_detail` section currently carries `recalibration_candidates`. These are useful research and engineering objects, but the adapter deliberately keeps them out of `operator_ready`.

That separation matters. A recalibration candidate can inform development without becoming a floor directive.

#### Blocked

The payload always includes a blocked-metrics list. Each blocked row has:

```text
metric
reason
operator_boundary
```

The blocked list is not an error condition. It is part of the contract. It documents which tempting interpretations are not allowed to become operator-facing claims.

#### Tracker Contract

`tracker_contract` names where the tracker may consume payload fields:

```text
pre_sort_dop:
  operator_ready.adjusted_building_pph
  operator_ready.dow_building_bands
  operator_ready.outbound_load_bands

live_sort:
  operator_ready.live_timeline
  operator_ready.live_analog_forecast

analyst_detail:
  analyst_detail.recalibration_candidates
  blocked
```

The tracker UI mirrors this boundary. Loading `tracker_operator_payload_*.json` adds a read-only analytics evidence strip, and the UI copy states that operator-facing decisions still come from live CSV/SPR inputs.

#### Tests

`Operations/tests/test_tracker_operator_payload.py` verifies the contract. The tests assert that calibrated adjusted building PPH is promoted only on the `SCANTRACK canonical net volume / SPR actual hours` basis, that rejected SPR PPH is not exposed, that recalibration candidates stay in analyst detail, that the tracker contract fields are present, that a passed live analog capsule exposes ready fields, and that a failed capsule remains blocked.

#### Source Basis

- `Operations/adapters/tracker_operator_payload.py`: schema, operator-ready payload, analyst detail, blocked list, markdown report, and CLI.
- `Operations/tests/test_tracker_operator_payload.py`: payload contract tests.
- `Live-Sort/tracker_v6.3-codex.html`: analytics-payload file load, payload watch, and read-only evidence strip.

### 51. Blocked Metrics and Why They Are Blocked

Status: final

Blocked metrics are claims the project refuses to put in front of operators. A blocked metric can still be studied, logged, simulated, or shown to analysts. It cannot be promoted as a floor instruction or performance truth until its evidence boundary changes.

The current blocked list comes from `_blocked_metrics()` in the operator payload adapter.

#### SPR Summary PPH

Tempting claim:

```text
The SPR summary PPH is the adjusted building PPH.
```

Why blocked: the adapter labels SPR summary PPH as reported context, not adjusted-building truth. The allowed replacement is SCANTRACK canonical net volume divided by SPR actual hours.

Evidence needed: a validated contract showing that the SPR summary field equals the intended adjusted-building PPH denominator and numerator. The current project explicitly rejects that basis.

#### Simulation `pph_sor`

Tempting claim:

```text
The simulator's `pph_sor` is evidence of real hub PPH.
```

Why blocked: it is synthetic-regression-only. The simulator can stress-test methods, test invariants, and expose estimator behavior, but synthetic PPH cannot calibrate the real operator display.

Allowed use: analyst/detail simulation validation and method stress tests.

#### Sort-Span Headcount Denominator

Tempting claim:

```text
Headcount times the whole sort span is the right paid-day denominator.
```

Why blocked: paid day is a management lever. People leave early, stay late, or get rebalanced. The allowed replacement is required paid hours divided by a managed average paid day.

This is why the DOP plan generator separates required hours from actual headcount and managed paid-day assumptions.

#### Carryover Adjustment Flag

Tempting claim:

```text
Carryover can be inferred and adjusted without a measured input.
```

Why blocked: carryover is unstructured and currently unmeasured. The boundary says not to infer carryover until a reliable input exists.

Evidence needed: a durable carryover source, a parser, validation against real sort outcomes, and an operator-safe display rule.

#### Causal Staffing Claims

Tempting claim:

```text
This staffing level caused the observed outcome.
```

Why blocked: the current methods are planning and descriptive unless a causal design is explicitly validated. The operator boundary says to keep staffing outputs descriptive and planning-oriented.

Allowed language: required hours, coverage, short/tight/covered regimes, packages at risk under stated assumptions.

#### Scanner Attribution Claims

Tempting claim:

```text
This person or belt is responsible for the observed issue.
```

Why blocked: scanner attribution is not validated for individual blame or causal assignment. The operator boundary says not to blame individuals or belts from scanner attribution without validation.

Allowed use: aggregate scan productivity, coverage, and source-health analysis with clear denominator rules.

#### Source Basis

- `Operations/adapters/tracker_operator_payload.py`: blocked metrics and operator boundaries.
- `Operations/tests/test_tracker_operator_payload.py`: blocked metric expectations.

### 52. Analyst Detail as a Research Boundary

Status: final

The project uses analyst detail as a boundary layer. It lets advanced diagnostics exist inside the tool without making them the default operator message.

An operator-facing panel should answer:

```text
What is happening?
What should I check?
What can I safely plan from?
```

An analyst-detail panel can answer:

```text
Which denominator, invariant, model, or validation gate produced this?
What is still provisional?
What should be recalibrated?
```

#### Why the Boundary Exists

The same number can have different meanings depending on surface. `rho` can be a queue-utilization proxy in analyst detail, but it should not become a staffing command if the unit audit is still open. Entropy can flag concentration, but it should not be presented as a validated fairness score if source exclusions are not aligned. Wilson intervals can create conservative rankings, but they are not a proof of long-run employee ability.

The project already follows this pattern in several places:

- The tracker Intel tab has an `Analyst Detail` details panel for method checks and advanced constructs.
- The operator payload sends `recalibration_candidates` to `analyst_detail`, not `operator_ready`.
- The payload's `blocked` list is available to the tracker contract but not promoted as an action instruction.
- The metric contract admin pill is hidden from operators unless admin mode is enabled.
- Simulation outputs are allowed in validation capsules and analyst detail, but synthetic PPH is blocked from operator calibration.

#### Copy Discipline

The boundary is not only visual. It is linguistic. Operator copy should avoid causal claims unless the causal design is validated. It should use planning verbs such as "check", "watch", "covered", "tight", "short", and "at risk under plan assumptions." Analyst copy can use "candidate", "proxy", "diagnostic", "open audit", "validation gate", and "not operator-ready."

#### Research Value

Analyst detail is not a dumping ground. It is a staging area. A metric can move from research-only to analyst-detail to operator-ready only when the evidence improves:

```text
research construct -> analyst diagnostic -> validated payload field -> operator-ready surface
```

That promotion path is what keeps the project from hiding rigor while also keeping the floor view usable.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: Intel analyst-detail panel, analytics payload status, admin-only metric-contract pill, and UI copy that live decisions still come from live CSV/SPR inputs.
- `Operations/adapters/tracker_operator_payload.py`: separation of `operator_ready`, `analyst_detail`, and `blocked`.
- `Operations/tests/test_tracker_operator_payload.py`: regression tests for analyst-detail separation.

## Part XII. Programming Architecture

Part XII explains why the system is built the way it is. The previous parts define methods and claim gates. The architecture chapters show how those methods survive contact with browser files, local storage, source-specific parsers, JSON payloads, container embedding, and regression tests.

The order is implementation-first. Chapter 53 describes the local browser stack. Chapter 54 describes parsers, adapters, payloads, and metric contracts. Chapter 55 describes persistence and reproducibility. Chapter 56 describes tests as methodological protection, not only software protection. This part should make the codebase reproducible enough that the manuscript can be audited rather than merely read.

### 53. The Browser-Based Application Stack

Status: final

Much of HII is browser-based because the operational workflow starts with files: SPR/SPR exports, SCANTRACK exports, CURE workbooks, SVQ and LIB reports, and local JSON payloads. The user needs to load, parse, inspect, print, export, and replay these files without waiting for a centralized production backend.

The stack is therefore intentionally local-first:

```text
HTML + JavaScript + local files + browser storage + optional local helper scripts
```

#### Tracker

`Live-Sort/tracker_v6.3-codex.html` is a single-file browser application with vendored XLSX support and CDN fallback, Chart.js, CSV parsing, IndexedDB persistence, localStorage preferences, File System Access API hooks, and postMessage bridges.

The tracker supports manual file selection, folder-based "load latest", CSV auto-pull, analytics payload loading, analytics payload folder watch, full-state JSON export/import, history bundles, and end-sort commits. That mix is pragmatic: browser upload paths work everywhere; folder watchers and commit-directory handles work only where the File System Access API is available.

The tracker uses IndexedDB `tracker_ops_db` with stores for hub snapshots, area snapshots, sort history, CURE history, sort snapshots, app state, and daily predictions. It also uses localStorage for UI state, selected belts, DOP inputs, metric-contract overrides, theme/tab context, and sort-down timestamps.

#### Dashboard

`Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` is also a browser application. It uses XLSX parsing, Chart.js, html2canvas, jsPDF, and IndexedDB. Its trend store is `hub_ops_trends_db`, with a `snapshots` object store keyed by `snapshotKey`.

The dashboard rebuild path parses whichever source files are loaded, renders all tabs, then builds a snapshot and auto-saves it when a sort date exists. It also participates in the container's operations-intelligence archive through postMessage export/import.

#### Container

`hub_operations_v5.0.html` embeds child projects as base64 strings inside `<script type="text/plain">` tags. On view switch, the container decodes the relevant payload and writes it into an iframe `srcdoc`. This gives each child project a DOM/JS/CSS sandbox while keeping the suite portable as one HTML file.

The container keeps iframes alive after loading, stores navigation preferences in localStorage, and uses postMessage for cross-frame archive, presort brief, and data exchange. The refresh script `refresh_container_embed.py` is the build step that re-encodes the standalone tracker, dashboard, and optional presort template back into the container.

#### Why This Architecture Fits

The browser stack is not "less real" than a server stack. It is tuned to the working environment: local exports, rapid iteration, print workflows, and human inspection. The tradeoff is that persistence is browser-local unless explicitly exported, and embedded container payloads can become stale if the refresh script is not run after standalone edits.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: tracker dependencies, CSV/XLSX intake, IndexedDB, File System Access API, analytics payloads, JSON export/import, postMessage bridge, localStorage settings.
- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: dashboard dependencies, source parsers, snapshot construction, IndexedDB trend store, postMessage bridge.
- `Pre-Sort/dash-tracker-container/hub_operations_v5.0.html`: base64 payload architecture, iframe `srcdoc`, localStorage view state, and postMessage archive flow.
- `Pre-Sort/dash-tracker-container/refresh_container_embed.py`: container re-embedding build step.

### 54. Parsing and Adapter Design

Status: final

Parser and adapter design prevent source-specific mess from spreading through the project. A parser turns an external report shape into normalized internal data. An adapter turns internal analysis into a bounded contract for another surface.

#### Parsers

The dashboard has explicit parsers for SPR, CURE, Misload, SVQ Twilight, LIB, SCANTRACK, and Employee Data. `rebuildDashboard()` resets `DATA`, calls only the parsers for loaded files, catches parser-specific errors, then renders from the unified `DATA` object.

The tracker follows the same pattern with live-sort specifics. It normalizes belt and SPR area names, classifies files by filename patterns, parses Hub and Employee summaries from XLSX or CSV, and merges live SPR Header and Operations CSVs into one SPR state. CSV headers from the live feed are re-aliased back to legacy XLSX keys so downstream renderers can keep using the same field names.

This is not pure functional programming in the strict sense; the browser code still updates global `DATA` and the DOM. The important design point is narrower: source-specific parsing is localized before rendering and analytics consume normalized structures.

#### Snapshot Builders

Snapshot builders freeze a state into a durable record. The dashboard's `buildSnapshot()` constructs `sortDate_sortCode` snapshots with KPIs, denominators, cube aggregates, misload frequency, LIB frequency, SCANTRACK summaries, and work-area fields. The tracker has full-state export and sort-day snapshot paths. Those records are what make trend analysis and archive replay possible.

#### Payload Adapters

`tracker_operator_payload.py` is a Python adapter. It reads audit artifacts, builds `operator_ready`, `analyst_detail`, `blocked`, and `tracker_contract`, then writes JSON and Markdown. The tracker accepts that JSON as read-only analytics evidence. It does not replace raw live CSV/SPR inputs.

Adapters are also used at the container level. `refresh_container_embed.py` adapts standalone HTML files into base64 container payloads. The postMessage bridges adapt child-frame state into archive bundles and presort brief payloads.

#### Metric Contract

`Live-Sort/metric_contract.json` is the policy-layer source for net-volume definition, exclusions, sort profiles, and structural constants. The tracker has an embedded copy and an admin-only override path. A loaded valid contract is stored in localStorage and applied on reload. This design makes contract drift visible and controlled instead of letting every function carry its own private constants.

#### Promotion Rule

The core promotion rule is:

```text
raw source -> parser -> normalized state -> validated adapter/payload -> operator surface
```

Skipping that sequence is how unsupported claims leak into the UI. The operator payload tests exist to prevent exactly that.

#### Source Basis

- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: parser functions, rebuild order, and snapshot builder.
- `Live-Sort/tracker_v6.3-codex.html`: file patterns, CSV alias maps, SPR Header/Operations merge, full-state export/import, payload loading, metric-contract override.
- `Operations/adapters/tracker_operator_payload.py`: payload adapter and schema.
- `Live-Sort/metric_contract.json`: metric-contract policy fields.
- `Pre-Sort/dash-tracker-container/refresh_container_embed.py`: standalone-to-container adapter.

### 55. State, Persistence, and Reproducibility

Status: final

Reproducibility in this project means more than "the code runs." It means a result can be traced back to its source files, parser, denominator, state record, claim ledger, and versioned artifact.

The project uses several persistence layers because no single layer fits every job.

#### Browser Persistence

The tracker uses IndexedDB `tracker_ops_db` version 5. Its stores include:

- `hub_snapshots`
- `area_snapshots`
- `sort_history`
- `cure_history`
- `sort_snapshots`
- `app_state`
- `daily_predictions`

The dashboard uses IndexedDB `hub_ops_trends_db` with a `snapshots` store keyed by `snapshotKey`. The container communicates with both through postMessage export/import, allowing an operations-intelligence archive JSON to carry tracker history and dashboard snapshots together.

localStorage stores preferences and lightweight state: sidebar collapse, selected view, cube/DOP inputs, selected belts, metric-contract override, admin flag, theme, active tab, coordination filters, and sort-down timestamps. localStorage is convenient, but it is not a durable research archive. Durable records need JSON export, IndexedDB records, or files on disk.

#### Local Files

The tracker exports `tracker.fullDataDump.v1` JSON to preserve current Hub/Employee/SPR/CURE state plus an embedded sort-day snapshot. It also exports `tracker.historyBundle.v1` for saved sort history. The container exports an OI archive JSON containing tracker history, tracker snapshots, CURE history, and dashboard snapshots.

The container itself persists embedded child apps as base64 payloads. That makes the suite portable, but it also creates a reproducibility requirement: after standalone tracker or dashboard edits, `refresh_container_embed.py` must be run or the container may still carry stale code.

#### ai_memory Persistence

The memory database is JSON-primary. The knowledge graph is JSON-primary. Chroma stores semantic vectors under `ai_memory/db/chroma` when ChromaDB is installed. SQLite is used for disposable FTS cache and for simulation databases, but those roles are different: memory FTS cache can be rebuilt from JSON, while simulation databases are data artifacts.

The research loop persists `research_results.tsv`, `research_cycle_log.jsonl`, `mcts_state.json`, autoresearch postmortem JSON, and `.last_autoresearch_session`. TSV is treated as a replay source for MCTS warm-start. Branch heads are Markdown files in `whitepapers/`, versioned by filename.

#### Reproducibility Rule

The practical rule is:

```text
Never rely on a screen state alone.
```

If a result matters, it needs one of:

- a versioned source file,
- an IndexedDB snapshot that can be exported,
- a JSON payload or full-state dump,
- a KG or memory record,
- a TSV/JSONL research log,
- a claim-ledger row.

This is why the manuscript keeps a claim ledger. The ledger is the bridge from prose back to code and data.

#### Source Basis

- `Live-Sort/tracker_v6.3-codex.html`: tracker IndexedDB stores, localStorage fields, full-state/history export/import, File System Access API handles, metric-contract override.
- `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`: dashboard IndexedDB trend snapshots and postMessage import/export.
- `Pre-Sort/dash-tracker-container/hub_operations_v5.0.html`: container base64 payloads and OI archive import/export.
- `Pre-Sort/dash-tracker-container/refresh_container_embed.py`: payload refresh and backup behavior.
- `~/Desktop/Twilight 050426/ai_memory/research_loop.py`: TSV, JSONL, MCTS state, KG snapshot, autoresearch postmortem, and sentinel.
- `~/Desktop/Twilight 050426/ai_memory/memory_db.py`: JSON-primary memory and disposable FTS cache.
- `~/Desktop/Twilight 050426/ai_memory/knowledge_graph.py`: JSON-primary KG.

### 56. Testing and Verification Strategy

Status: final

Testing in this project has two jobs. The first is ordinary software protection: parsers should not break, fixtures should keep loading, and UI wiring should keep pointing at the right controls. The second is methodological protection: a metric should not silently cross from research-only evidence into an operator-ready claim.

That second job is the more important one for the manuscript. The tests are not only checking functions. They are enforcing measurement discipline.

#### Parser and Fixture Tests

The parser tests prove that raw files can still be normalized into the internal project vocabulary. `Operations/tests/test_live_sort_ingestion.py` checks several examples:

- PD belt normalization preserves two-digit belt numbers such as `PD-10` and `PD-12`.
- Snapshot filenames are parsed into source kind, sort date, and pull time.
- SCANTRACK hub summary rows produce PD gross volume, SCANTRACK net volume, and per-belt totals.
- live SPR header rows extract actual hours while refusing to treat zero reported PPH as truth.
- employee summary parsing counts unique PD loaders.
- live sort baselines group CSV snapshots by date and retain compact per-pull timeline points.
- post-sort reconciliation compares belt-summary workbooks against the latest live belt totals.

The label-training tests perform the same role at the routing layer. `Label-Training-Certification/tests/test_truth_routing.py` reads the embedded truth table, loads routing correction artifacts, verifies clean reassignment examples, and preserves the documented MULTIDEST split-belt behavior for its SLIC.

The dashboard cube contract test is narrower but useful. `Pre-Sort/tests/test_presort_dashboard_cube_contract.py` checks that the CURE parser normalizes OS values to uppercase and that cube KPI count is based on total loads rather than destination-row count.

#### Determinism and Artifact-Level Verification

The synthetic-generator work added one testing lesson worth stating as method. A deterministic emitter can pass a same-second double-emit test and still be nondeterministic: openpyxl stamps `dcterms:modified` with the current time at save, so two workbooks written in the same second are byte-identical while two written across seconds are not. The build-time test could never see it; a cross-time byte pin — regenerate the artifact later and compare bytes — caught it, and the workbook emitter now re-pins the core-properties dates at save (CL-0257). The general rule: a determinism claim needs artifact-level verification across time, not repeated builds inside one moment.

#### Contract Tests for Operator Payloads

The payload adapter is the project's clearest safety boundary, so its tests must be read as contract tests. `Operations/tests/test_tracker_operator_payload.py` asserts that calibrated adjusted building PPH is promoted only with the accepted basis, that recalibration candidates remain in analyst detail, and that tracker contract targets are explicit.

The same test file guards the live analog forecast gate. A forecast capsule with `validation_gate_summary.overall == "passes"` can be summarized under `operator_ready.live_analog_forecast`. A blocked capsule produces a blocked status and does not expose forecast quantities such as projected final volume. Unsupported operator claims remain listed in the `blocked` section.

This is the pattern the rest of the project should follow:

```text
raw evidence -> adapter -> readiness gate -> allowed surface -> regression test
```

If any link is missing, the manuscript may describe the method but should not claim operator readiness.

#### Simulation and Forecast Validation Tests

`Operations/tests/test_simulation_validation_capsule.py` shows how simulation evidence is handled. The tests inspect the simulation database manifest without copying rows into the manuscript, recompute invariant fields from raw PD columns, run a negative DOW control, run a positive DOW recovery gate, compute estimator recovery summaries, separate dual-corpus gates, and label claim boundaries for downstream use.

The key principle is that simulation can validate the behavior of an estimator or stress envelope, but it cannot by itself create an operator-facing adjusted building PPH claim. The test suite encodes that by preserving labels such as `simulation stress-test`, `circular-do-not-claim`, and `quarantined-seeded-field`.

`Operations/tests/test_live_analog_forecast.py` applies the same idea to analog forecasting. It rejects final-only simulation rows because they lack trajectory intervals. It scores nearest trajectory families, collapses matched analogs into a single forecast, blocks forecasts when live state is outside simulated support, builds live state from real ingestion and payload artifacts, and derives `pph_slope_30m` from timeline points when available.

#### Browser and HTML Regression Tests

Several tracker tests inspect the browser app as source text. `Live-Sort/tests/test_tracker_payload_loader.py` checks tab order, payload controls, validation functions, DOP evidence copy, hub evidence strip copy, live analog forecast display, CSV auto-pull, and heatmap paths. `Live-Sort/tests/test_live_tracker_regressions.py` checks live SPR allocation fallback, SCANTRACK interval capping, idle-gap filtering, timeline forward fill, SPR header/operations merge behavior, and aggregate operation-hour fallback.

`Live-Sort/tests/test_live_fixture_contracts.py` goes further by combining real fixture files with HTML source checks. It verifies that the fixture reflects live SPR aggregate operation rows rather than per-door columns, derives live hub PPH from hub net and SPR header hours, checks outbound allocation by scan-hour share, caps loader hours by merged active intervals, and confirms after-midnight Twilight filename handling.

These tests do not replace visual browser verification. For UI changes, the project still needs screenshot checks across the operator workflows. The text tests are useful because they catch structural regressions quickly, but they cannot prove layout quality.

#### Tests Still Needed

The current test surface is stronger around adapters, payloads, tracker regressions, simulation capsules, live analog forecast gates, and routing truth. It is thinner around the later research engine:

- RAG should have retrieval smoke tests for entity queries, absent-context behavior, and prompt snapshots.
- SPECTER2/Chroma should have backend-selection and fallback tests that do not require a large local model.
- MCTS should have action-space, UCB1 selection, warm-start replay, and keep/discard backpropagation tests.
- Autoresearch should have dry-run tests for prompt assembly, score parsing, branch write gating, and postmortem sentinel creation.
- ADMM reconciliation should have invariant-band, residual, dual-update, and irreconcilable-flag fixtures.

The statistical-foundation chapters also leave several smaller test gaps:

- The tracker entropy functions should have a unit fixture for empty counts, single-user counts, evenly distributed counts, concentrated counts, and the `H_norm < 0.40` risk flag when at least three employees are present.
- `computeSortQueueState()` should have direct unit coverage for the `clearing`, `balanced`, `building`, and `critical` thresholds, plus backlog-minute unit checks when `rho > 1`.
- Live analog distance should keep explicit fixtures for feature weighting, missing-feature behavior, DOW/sort mismatch penalties, support checks, and median final-outcome collapse.
- Label-training event storage should eventually store the full accepted belt set for multi-valid answers, or tests should prove every analytics surface that needs MULTIDEST full-set context can recover it reliably from the truth map.

The manuscript should distinguish implemented tests from desired tests. A "tests needed" field belongs in every method dossier until the method has direct regression coverage.

#### Source Basis

- `Operations/tests/test_tracker_operator_payload.py`
- `Operations/tests/test_simulation_validation_capsule.py`
- `Operations/tests/test_live_analog_forecast.py`
- `Operations/tests/test_live_sort_ingestion.py`
- `Live-Sort/tests/test_tracker_payload_loader.py`
- `Live-Sort/tests/test_live_tracker_regressions.py`
- `Live-Sort/tests/test_live_fixture_contracts.py`
- `Label-Training-Certification/tests/test_truth_routing.py`
- `Pre-Sort/tests/test_presort_dashboard_cube_contract.py`

## Part XIII. From Dossier to Book

Part XIII turns the dossier into a manuscript discipline. The project now has enough technical material that the main risk is no longer missing topics. The risk is overclaiming, repeating boundary language, drifting notation, or letting diagrams and claims become decorative rather than evidentiary.

Chapter 57 controls narrative structure. Chapter 58 controls figures. Chapter 59 controls notation. Chapter 60 controls claims. This final part is why the 100% filename is reserved: the completed `manuscript.md` should exist only after structure, claim, math, logic, humanization, and final read-aloud passes have all been run.

### 57. Narrative Spine

Status: final

The book should not read like a catalog of scripts. It should read like the construction of an intelligence system under operational constraints. The narrative spine is:

1. A physical sort creates the measurement problem.
2. Label training creates the first supervised classification surface.
3. The dashboard turns pre-sort files into a controlled snapshot.
4. The live tracker turns repeated snapshots into pace, risk, and staffing views.
5. Statistical methods make uncertainty and denominator choice visible.
6. Simulation tests estimator behavior before claims are promoted.
7. Knowledge systems preserve decisions, constants, caveats, and evidence.
8. Autoresearch turns the research program into a governed loop.

#### The First-Person Problem, Written Formally

The manuscript begins from a real local problem: running and understanding Twilight Sort. That does not mean the book should stay anecdotal. The operational story gives the reader a reason to care about the mathematics. The formal chapters then generalize the problem into measurement, classification, forecasting, validation, retrieval, and search.

The right voice is practical and exact. A chapter can begin with an operator question, but it should end with a reproducible method:

```text
Question -> source files -> denominator -> formula -> code path -> test -> claim boundary
```

That sequence is the book's main teaching pattern.

#### Two Audiences

The first audience is the operator-analyst who needs to know what the tool is allowed to say. This reader needs plain terms, workflow context, and warnings when a number is diagnostic rather than actionable.

The second audience is the builder-researcher who wants to reproduce the system. This reader needs formulas, parser behavior, fixture design, source files, and the reason a metric was blocked or promoted.

The book should serve both by separating the layers. Each method chapter should have:

- An operational question.
- A first-principles explanation.
- A formal definition or formula.
- A project implementation section.
- A validation and claim-boundary section.
- A short list of open gaps.

#### Chapter Rhythm

Most chapters should follow the same rhythm:

1. State the operational problem in one paragraph.
2. Define the observed quantities and their units.
3. Name the denominator before any rate is introduced.
4. Derive the method from simpler pieces.
5. Show how the project implements it.
6. State what the method can and cannot claim.
7. Point to source files and tests.

This rhythm will keep the manuscript from drifting into generic AI or operations language. It also creates a future path for exercises, diagrams, and worked examples.

#### What To Avoid

The manuscript should not use "AI" as an explanation. If a model, retrieval system, or search method is used, the chapter must name the input, output, objective, and failure mode. It should also avoid saying that a tool "understands" the operation. The tool stores evidence, retrieves context, computes metrics, or ranks actions. Those verbs are enough.

The book should also avoid implying causality when the project has only descriptive or predictive evidence. If a staffing pattern appears near a performance change, the manuscript can report association or diagnostic signal. It cannot claim cause without a validated causal design.

#### Structure Pass Register

The first structure pass over Parts I-III established this opening arc:

```text
operation -> measurement discipline -> source atlas -> denominators -> route truth -> training generator -> multi-label MULTIDEST -> certification analytics
```

The purpose of this pass was not to add new technical claims. It added connective tissue, clarified chapter roles, and made the transition from quiz-event analytics to pre-sort dashboard analytics explicit.

The second structure pass over Parts IV-VIII established the middle arc:

```text
pre-sort file evidence -> live snapshot measurement -> planning and staffing formulas -> statistical vocabulary -> simulation validation
```

This pass also corrected the part structure by giving the DOP, staffing, constants, and borrow-loan chapters their own Part VI. That prevents planning formulas from being buried inside the live-tracker methods arc.

The third structure pass over Parts IX-XIII established the late arc:

```text
structured memory -> constrained retrieval -> governed research scheduling -> payload promotion gates -> reproducible architecture -> book-quality controls
```

This pass reduced the risk that every late chapter would repeat the same safety language. Part XI now carries the strongest operator-ready, analyst-detail, and blocked explanation. Parts IX, X, XII, and XIII can refer to that boundary while focusing on their own jobs: preserving context, scheduling research, implementing the stack, and turning the dossier into a rigorous manuscript. The final structure pass should now be whole-manuscript rather than part-local.

#### Source Basis

- The current chapter sequence in this manuscript.
- `Operations/adapters/tracker_operator_payload.py`: explicit operator, analyst, blocked, and tracker-contract layers.
- Existing chapter source bases for training, dashboard, tracker, simulation, KG/RAG, MCTS, ADMM, and autoresearch.

### 58. Figures and Diagrams to Create

Status: final

Figures should be used where they reduce ambiguity. A diagram is justified when it names a boundary, a denominator, a gate, a flow, or a search space more clearly than prose.

#### Core System Figures

| Figure | Purpose | Source basis | Status |
| --- | --- | --- | --- |
| System map | Show how label training, dashboard, tracker, operations adapters, simulation, and `ai_memory` relate. | Project folder layout and source map | Needed |
| Data source lineage | Trace raw files through parsers, normalized fields, metrics, and allowed surfaces. | Dashboard, tracker, and operations adapters | Needed |
| Operator vs analyst boundary | Show the three surfaces: operator-ready, analyst-detail, and blocked. | `tracker_operator_payload.py` | Needed |
| Claim promotion pipeline | Show source evidence, contract tests, readiness gates, claim-ledger entry, and operator surface. | Chapter 56 and claim ledger | Needed |

#### Training and Routing Figures

| Figure | Purpose | Source basis | Status |
| --- | --- | --- | --- |
| MULTIDEST multi-valid answer diagram | Show why one prompt can accept PD-04, PD-05, or PD-09. | `config.js`, `quiz.js`, truth-routing test | Needed |
| Quiz sampling bucket diagram | Show average-state-equivalent weighting and bucket selection. | Chapter 8 source files | Needed |
| Truth table row anatomy | Show `ZIP|SLIC|BAY|BELT_INDEX|STATE|CITY` and how it becomes a prompt. | `truth-data.js`, `quiz.js` | Needed |

#### Dashboard and Tracker Figures

| Figure | Purpose | Source basis | Status |
| --- | --- | --- | --- |
| Dashboard snapshot builder | Show loaded files, `DATA`, KPI construction, and snapshot persistence. | `hii-dashboard-v3.0.html` | Needed |
| Misload/LIB denominator comparison | Show why event counts need scan-volume denominators. | Chapters 13 and 15 | Needed |
| Live CSV pull bucketing timeline | Show repeated Hub, Employee, and SPR files grouped into snapshots. | Tracker and ingestion tests | Needed |
| Outbounds denominator chart | Contrast net volume, paid hours, scan hours, paid PPH, scan PPH, and utilization. | Chapter 17 | Needed |
| DOP building manifold | Show volume, adjusted building PPH, total paid hours, actual headcount, paid-day regime, and at-risk volume. | Chapter 24 | Needed |
| Queue-state capacity chart | Show live remaining volume, remaining capacity, and risk band. | Chapter 19 | Needed |
| Queue utilization threshold ladder | Show `rho_q = lambda_q / (c_q * mu_q)` and the clearing, balanced, building, and critical bands. | Chapter 32, `computeSortQueueState()` | Needed |
| Entropy concentration diagram | Show equal package shares versus one dominant scanner and how `H_norm` changes. | Chapter 31, `computeZoneEntropy()` | Needed |
| Belt and zone imbalance diagram | Show max-over-average belt imbalance and max-minus-min zone share imbalance. | Chapter 31, `live_analog_forecast.py` | Needed |
| Analog forecast nearest-trajectory diagram | Show current live state, candidate trajectories, distance, support gate, and final forecast. | `live_analog_forecast.py` tests | Needed |
| Analog feature-vector table | Show live-state features, weights, scales, and blocked causal-staffing claim. | Chapter 33, `live_analog_forecast.py` | Needed |

#### Simulation and AI Memory Figures

| Figure | Purpose | Source basis | Status |
| --- | --- | --- | --- |
| Simulation validation flow | Show invariant audit, negative control, positive recovery, dual-corpus gate, and claim boundary. | `simulation_validation_capsule.py` tests | Needed |
| KG node and edge model | Show claims, constants, decisions, gaps, references, and version links. | `knowledge_graph.py` | Needed |
| RAG retrieval flow | Show query terms, semantic retrieval, keyword supplement, ranking, context block, and answer guardrail. | `hub_rag.py` | Needed |
| SPECTER2/Chroma fallback ladder | Show adapter backend, base SPECTER2, TF-IDF, and in-memory fallback. | `briefing_scorer.py`, `chroma_store.py` | Needed |
| MCTS research-loop diagram | Show action selection, prompt construction, score parse, keep gate, logging, and backpropagation. | `research_loop.py`, `mcts_utils.py` | Needed |
| ADMM reconciliation diagram | Show branch estimates, invariant band, residual, dual update, consensus, and irreconcilable path. | `admm_utils.py` | Needed |

#### Figure Standard

Every figure should carry four labels:

- What question it answers.
- What inputs it depends on.
- What output it produces.
- What claim boundary applies.

This prevents decorative diagrams. A figure that does not clarify a decision, denominator, algorithm, or boundary should be removed.

### 59. Notation and Glossary

Status: final

Notation in this manuscript should be local before it is abstract. A symbol is only useful if the reader knows what it measures, what units it has, and what denominator it uses.

#### Operational Terms

| Term | Meaning in this project | Unit or denominator discipline |
| --- | --- | --- |
| `DOW` | Day of week. | Used for weekday bands, projections, and simulation controls. |
| `PD` | PD outbound belt family or primary delivery context, depending on chapter. | Must be disambiguated when a chapter mixes routing and belt operations. |
| `belt` | Outbound belt such as `PD-01` through `PD-12`. | Use normalized two-digit belt names in code and figures. |
| `loader` | Person scanning/loading outbound packages. | Do not use this term for sorters, pick-offs, or generic headcount. |
| `volume` | Package count. | Must name source: SCANTRACK net, SPR actual volume, CURE load count, or other file. |
| `paid hours` | Labor-hour quantity from SPR or derived paid-day model. | Denominator for paid PPH. |
| `scan hours` | SCANTRACK employee scan-hour quantity. | Denominator for scan PPH and scan-hour share allocation. |
| `sort span` | Clock span of the sort. | Not interchangeable with paid hours. |
| `headcount` | Count of people or planned people, depending on source. | Must name actual, planned, worked, loader, or other scope. |
| `PPH` | Packages per hour. | Always name numerator and hour denominator. |
| `MULTIDEST` | Multi-state consolidation routing family with multi-valid belt handling (publication alias; real identifiers withheld). | Correctness can be set membership rather than equality to one belt. |
| `CURE` | Load and cube quality source. | Used for load rows, TFCS, utilization, gap rows, and destination/date heatmaps. |
| `LIB` | Left-in-building event source. | Frequency needs a count denominator, not only event rows. |
| `SPR` | Staffing, hours, production, and work-area summary source. | Some live SPR exports report zero PPH, so source fields must be audited. |
| `SCANTRACK` | Hub and employee scan source. | Supplies net package volume, belt scan evidence, employee scan hours, and loader intervals. |

#### Mathematical Symbols

| Symbol | Meaning here | Notes |
| --- | --- | --- |
| `kappa` | Share coefficient. | In this project it often refers to zone or PD-share quantities. Index it when possible, for example `kappa_Z3`. |
| `gamma` | Trajectory or weekday decay coefficient. | Do not reuse without saying whether it is a live trajectory quantity or a research-program constant. |
| `rho` | Ratio or utilization. | Must be indexed, such as `rho_pd_hub`, to avoid confusion with queueing utilization. |
| `epsilon` | Schema gap or error term. | In the current research-program context, `epsilon_schema` is a schema gap constant. |
| `U_T` | Utilization threshold or cap. | Context-specific; define the surface before use. |
| `c` | Cost-per-piece proxy. | In DOP discussions, `c = 1 / adjusted building PPH` when the PPH basis is accepted. |
| `H` | Shannon entropy. | In tracker zone entropy, computed from employee package-share distribution within a zone. |
| `H_norm` | Normalized Shannon entropy. | `H / log2(k)`, where `k` is the count of employees with positive package counts. |
| `lambda_q` | Queue arrival or induction rate. | Use packages per hour when paired with queue capacity. Do not confuse with ADMM dual variables. |
| `mu_q` | Queue service rate per server. | In tracker queue state, this is current PPH per staffing unit. |
| `c_q` | Queue server/staffing count. | In tracker queue state, total modeled capacity is `c_q * mu_q`; do not confuse with DOP cost proxy `c`. |
| `rho_q` | Queue utilization ratio. | `lambda_q / (c_q * mu_q)` in Chapter 32. |
| `x_live` | Live analog state vector. | Contains elapsed fraction, cumulative volume fraction, adjusted building PPH, PPH slope, paid hours, loader count, and imbalance features. |
| `d(x_live, x_interval)` | Analog distance. | Weighted normalized absolute-distance average, plus DOW/sort mismatch penalties. |
| `N(a)` | Visit count for an MCTS action. | Stored in MCTS state for branch and experiment-type actions. |
| `Q(a)` | Accumulated or average reward for an MCTS action, depending on representation. | The chapter must state which one is being used. |
| `UCB1` | Upper confidence bound action score. | Used to balance average reward and exploration in the current MCTS selector. |
| `lambda_ADMM` | ADMM dual variable. | Used in reconciliation prompts and clipped by configured caps. |

#### AI and Research Terms

| Term | Meaning in this project |
| --- | --- |
| `MCTS` | Adaptive research action selector using Monte Carlo Tree Search / UCB1 primitives. The current project version behaves like a shallow action bandit over branch and experiment-type pairs. |
| `rollout` | One autoresearch cycle: choose action, build prompt, call model, parse score, keep or discard, log, and optionally backpropagate. |
| `reward` | Weighted score from gaps closed, new grounded claims, new verified claims, cross references, and contradiction penalties. |
| `ADMM` | Alternating direction method of multipliers, used here as a reconciliation support layer for branch estimates and invariant constants. |
| `RAG` | Retrieval augmented generation over project KG context and supporting memories. |
| `SPECTER2` | Embedding model used for semantic retrieval when the local backend is available. |
| `Chroma` | Persistent vector store used for KG node retrieval when available, with fallback behavior. |
| `KG` | Knowledge graph of decisions, constants, concepts, data sources, references, gaps, versions, and relationships. |

#### Glossary Rule

The final manuscript should not define a symbol once and then reuse it loosely. Every chapter that uses a symbol must either:

- point back to this glossary,
- restate the local denominator, or
- use a more explicit name instead of a symbol.

Source files are allowed to use compact variable names. The book should prefer readable names unless the mathematical derivation requires notation.

### 60. Claim Ledger

Status: final

The claim ledger is the manuscript's audit surface. It exists because the project mixes operational files, browser tools, simulation, machine-learning retrieval, and autonomous research. Without a ledger, a useful observation can be promoted too far or repeated after its source has changed.

Every formal claim should eventually be logged in a table with:

- a stable claim id,
- the claim in testable language,
- the local source basis,
- evidence status,
- allowed surface,
- counterexample risk,
- and next verification.

#### Evidence Status Vocabulary

Use these statuses consistently:

| Status | Meaning |
| --- | --- |
| `source-verified` | The claim is directly supported by local source code, fixture, test, or document inspected for this manuscript. |
| `source-derived caveat` | The claim is a bounded interpretation of source behavior and should be phrased cautiously. |
| `source-verified open issue` | The claim identifies a real source-backed drift, inconsistency, or known limitation. |
| `sim-verified` | The claim is supported by simulation validation, not by live operator evidence. |
| `hypothesis` | The claim is proposed but not yet verified. It should not appear as a conclusion. |
| `blocked` | The project explicitly prevents this claim from an operator-ready surface. |

#### Allowed Surface Vocabulary

Allowed surfaces should be narrow:

- `operator-ready`: safe for direct operator-facing display.
- `analyst/detail`: useful for diagnostics, calibration, or research but not direct instruction.
- `manuscript`: safe for explanation in the book with its caveat.
- `simulation docs`: safe inside simulation methodology only.
- `ai_memory docs`: safe inside memory/research-engine documentation.
- `blocked`: not allowed as a positive claim.

This ledger is the first complete manuscript audit surface for the current artifact. It does not freeze the project forever; new code, tests, constants, or source files should add new rows or revise old ones. For this completed manuscript, prose claims that remain technical, mathematical, or operator-facing are either sourced, caveated, blocked, or marked as open issues in the ledger and surrounding chapter text.

| Claim ID | Claim | Source basis | Evidence status | Allowed surface | Counterexample risk | Next verification |
| --- | --- | --- | --- | --- | --- | --- |
| CL-0001 | MULTIDEST quiz sampling uses average-state-equivalent weighting. | `Label-Training-Certification/js/quiz.js` | source-verified | manuscript/training docs | Config drift | Add unit test for MULTIDEST bucket probability |
| CL-0002 | Synthetic simulation PPH is blocked from operator claims. | `Operations/adapters/tracker_operator_payload.py` | source-verified | analyst/detail only | Adapter drift | Payload contract test |
| CL-0003 | The quiz truth table parser reads `ZIP|SLIC|BAY|BELT_INDEX|STATE|CITY` rows into route entries and state groups. | `Label-Training-Certification/js/quiz.js` | source-verified | manuscript/training docs | Truth row format drift | Add parser fixture test |
| CL-0004 | MULTIDEST states are excluded from the regular state pool and assigned to a separate MULTIDEST bucket. | `Label-Training-Certification/js/quiz.js` | source-verified | manuscript/training docs | State list drift | Add sampler bucket test |
| CL-0005 | MULTIDEST quiz answers are set-valued: PD-04, PD-05, and PD-09 are all accepted. | `Label-Training-Certification/js/config.js`; `Label-Training-Certification/js/quiz.js` | source-verified | manuscript/training docs | Belt mapping drift | Add multi-answer UI test |
| CL-0006 | Exception and air question buckets are weighted in the same average-state-equivalent unit as MULTIDEST. | `Label-Training-Certification/js/quiz.js`; `Label-Training-Certification/js/config.js` | source-verified | manuscript/training docs | Weight semantics drift | Add sampler distribution test |
| CL-0007 | MULTIDEST default handling is inconsistent: engine default is 4, missing-settings UI fallback is 8, and reset writes 4. | `Label-Training-Certification/js/quiz.js`; `Label-Training-Certification/js/app.js` | source-verified | manuscript/training docs | Config may be intentionally environment-specific | Normalize default or document intended split |
| CL-0008 | The configured MULTIDEST state family contains MS, IA, WI, MN, SD, ND, NE, LA, OK, CO, WY, AZ, and NM. | `Label-Training-Certification/js/config.js` | source-verified | manuscript/training docs | State list drift | Add config fixture test |
| CL-0009 | The routing audit identifies the MULTIDEST routing object (SLIC, destination, and destination code withheld for publication) with CURE volume `651,351`, `46.5%` of the PD-09 rollup, and `94` dates. | `Label-Training-Certification/audits/routing/SLIC_to_PD_mapping_audit.md` | source-verified | manuscript/routing docs | Audit corpus may be superseded | Re-run audit on latest CURE corpus |
| CL-0010 | MULTIDEST correctness in the quiz is set membership, not equality to a single canonical belt. | `Label-Training-Certification/js/config.js`; `Label-Training-Certification/js/quiz.js` | source-verified | manuscript/training docs | UI scoring drift | Add multi-label scoring regression test |
| CL-0011 | The implemented MCTS action space is 5 branches by 6 experiment types, or 30 actions. | `ai_memory/mcts-upgrade/mcts_utils.py`; `ai_memory/research_loop.py` | source-verified | manuscript/ai_memory docs | Build-plan staleness | Add unit test for action count |
| CL-0012 | MCTS selection gives unvisited actions priority, then applies UCB1 with average reward, exploration term, and gap bonus. | `ai_memory/mcts-upgrade/mcts_utils.py` | source-verified | manuscript/ai_memory docs | Selector refactor | Add selector fixture test |
| CL-0013 | In this project, an MCTS rollout is one autoresearch cycle, not a physical package-flow simulation. | `ai_memory/research_loop.py`; `ai_memory/mcts-upgrade/MCTS_BUILD_PLAN.md` | source-verified | manuscript/ai_memory docs | Terminology drift | Add architecture note near simulator docs |
| CL-0014 | The current reward function is a weighted sum of gaps closed, grounded claims, verified claims, cross references, and contradiction penalties. | `ai_memory/research_loop.py` | source-verified | manuscript/ai_memory docs | Reward weights may change | Add reward contract test |
| CL-0015 | The research loop backpropagates into MCTS state only for kept cycles and skips backpropagation for discarded cycles. | `ai_memory/research_loop.py`; `ai_memory/mcts-upgrade/mcts_utils.py` | source-verified | manuscript/ai_memory docs | Policy may change after validation | Add keep/discard backprop test |
| CL-0016 | `MCTS_BUILD_PLAN.md` describes 25 nodes, but the current implementation includes `verify_against_sim`, so the plan is stale relative to the code. | `ai_memory/mcts-upgrade/MCTS_BUILD_PLAN.md`; `ai_memory/mcts-upgrade/mcts_utils.py` | source-verified | manuscript/ai_memory docs | Documentation drift | Update build plan or add erratum |
| CL-0017 | ADMM is implemented as a reconcile-cycle support layer, not as a full numerical optimizer over every branch claim. | `ai_memory/mcts-upgrade/admm_utils.py`; `ai_memory/research_loop.py`; `ai_memory/mcts-upgrade/MCTS_BUILD_PLAN.md` | source-verified | manuscript/ai_memory docs | Overstated manuscript language | Add architecture note naming the boundary |
| CL-0018 | `admm_utils.py` defines invariant bands for `kappa_z3_mon`, `kappa_z3_fri`, `gamma`, `rho_pd_hub`, `epsilon_schema`, and `U_T_cap`. | `ai_memory/mcts-upgrade/admm_utils.py` | source-verified | manuscript/ai_memory docs | Constants may be recalibrated | Add invariant contract test |
| CL-0019 | ADMM prompt blocks require `PROPOSED:`, `RESIDUAL:`, and an anti-hallucination path via `IRRECONCILABLE`. | `ai_memory/mcts-upgrade/admm_utils.py`; `ai_memory/research_loop.py` | source-verified | manuscript/ai_memory docs | Prompt format drift | Add parser/prompt fixture test |
| CL-0020 | Dual updates use `lambda_new = lambda_old + rho_admm * (value_x - value_y)` and clip lambda to the configured dual cap. | `ai_memory/mcts-upgrade/admm_utils.py`; `ai_memory/mcts-upgrade/MCTS_BUILD_PLAN.md` | source-verified | manuscript/ai_memory docs | Update rule may change | Add dual update test |
| CL-0021 | A reconcile pair is converged when residual is below the threshold, and it becomes irreconcilable after an explicit `IRRECONCILABLE` flag or too many unresolved cycles. | `ai_memory/mcts-upgrade/admm_utils.py`; `ai_memory/mcts-upgrade/MCTS_BUILD_PLAN.md` | source-verified | manuscript/ai_memory docs | Convergence policy drift | Add convergence fixture test |
| CL-0022 | The build plan says irreconcilable constants should be written to the KG, but the current ADMM utility tracks them in `admm_state.json` and does not write KG nodes. | `ai_memory/mcts-upgrade/admm_utils.py`; `ai_memory/mcts-upgrade/MCTS_BUILD_PLAN.md` | source-verified | manuscript/ai_memory docs | Future KG integration may close gap | Add KG write integration task or document as intentional |
| CL-0023 | Dashboard snapshots are keyed by `sortDate_sortCode` and are only built when a SPR-derived sort date exists. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Snapshot key policy drift | Add snapshot fixture test |
| CL-0024 | Misload frequency denominator prefers SVQ Twilight total volume, falling back to SPR actual Volume plus Air Volume. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Fallback policy drift | Add denominator test |
| CL-0025 | LIB frequency denominator uses the LIB report volume divided by total LIB count, with totalLIB falling back to scan-log row count when the labeled total is missing. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | LIB report format drift | Add LIB parser fixture |
| CL-0026 | Snapshot cube utilization is aggregated as total loaded cube divided by total equipment capacity, not as a row-average of Util %. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Cube parser drift | Add cube aggregation test |
| CL-0027 | Snapshot SCANTRACK average PPH is total included SCANTRACK packages divided by total included SCANTRACK scan hours. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Exclusion/dedup policy drift | Add SCANTRACK fixture test |
| CL-0028 | Snapshot coordination-group hours are derived from Work Area Types production rows as net volume divided by net PPH, then summed by coordination group. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Work Area Types format drift | Add work-area production fixture |
| CL-0029 | The dashboard SPR parser extracts sort date, sort code, facility, Summary planned/actual dictionaries, PAYACTUAL staffing rollups, and Work Area Types production rows. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | SPR workbook format drift | Add SPR parser fixture |
| CL-0030 | CURE parsing creates `highTfcsRows` for rows with Avg TFCS % >= 95 and `gapRows` for high-TFCS rows with Util % < 75 and positive pieces per wall. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | CURE field rename or threshold drift | Add CURE subset fixture |
| CL-0031 | Misload parsing builds row-level counts by area, next scan, destination, and the pattern key `planFlow|||nextScan`, while SVQ Twilight parsing supplies aggregate scan totals and misload totals by coordination group. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | SVQ report layout drift | Add misload and SVQ Twilight fixtures |
| CL-0032 | LIB parsing reads labeled report values and falls back from labeled LIB Total to scan-log row count when the total is absent. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | LIB worksheet layout drift | Add LIB fallback fixture |
| CL-0033 | SCANTRACK parsing keeps the first occurrence per user and excludes SLS, ASX, SS-prefixed scanner IDs plus exact-match exclusions. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Scanner exclusion policy drift | Add SCANTRACK dedup/exclusion fixture |
| CL-0034 | Employee Data parsing separates inbound scanner groups, SLS rows, and standard employee rows, with inbound IDs routed to unload, bulk-belt, and primary-feed groups. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Employee report layout drift | Add employee data parser fixture |
| CL-0035 | Cube KPI tiles compute aggregate utilization as `sum(total loaded cube) / sum(total equipment capacity) * 100`. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Cube aggregation refactor | Add aggregate-vs-average fixture |
| CL-0036 | Cube gap rows require TFCS >= 95, Util % < 75, and positive pieces per wall, then compute `ppwGoal = ppw * (75 / util)` and `ppwGap = ppwGoal - ppw`. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Goal threshold drift | Add PPW gap fixture |
| CL-0037 | The cube tab uses an editable overall goal fallback of 62.2% and a fixed high-TFCS goal of 75.0%. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Goal constants may change | Add goal constant note/test |
| CL-0038 | The cube heatmap averages high-TFCS utilization by destination/date and can rank destinations by total loads, worst average utilization, or utilization standard deviation. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Heatmap ranking refactor | Add heatmap ranking fixture |
| CL-0039 | Dashboard misload frequency uses SVQ Twilight total scan volume when available, otherwise SPR actual Volume plus Air Volume, divided by total misloads. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Denominator fallback drift | Add misload denominator fixture |
| CL-0040 | The misload tab uses SVQ Twilight totals for top-level KPIs when available and row-level misload data for next-scan, area, destination, and pattern breakdowns. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | UI aggregation drift | Add mixed-source misload fixture |
| CL-0041 | The implementation's display goals are 1/2,500 for misload frequency and 1/1,000 for LIB frequency. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | Goal threshold drift | Add goal constant test |
| CL-0042 | LIB frequency uses LIB report volume divided by total LIB, and the LIB tab defaults its detail filter to BACK FEEDS, UNASSIGNED, and PD-* areas unless include-all is selected. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | LIB filter policy drift | Add LIB filter fixture |
| CL-0043 | LIB state shares are computed over all LIB rows, independent of the default area-filtered detail view. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard docs | State table denominator drift | Add LIB state-share fixture |
| CL-0044 | Live tracker CSV parsers re-alias live CSV headers back to legacy field names so downstream renderers can use the same keys as XLSX uploads. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Header alias drift | Add CSV alias fixture |
| CL-0045 | Live pull grouping rounds HHMMSS filename suffixes to the nearest 30 seconds so Hub, Employee, and SPR files from one pull can share a snapshot index. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Pull cadence or filename format drift | Add live bucket fixture |
| CL-0046 | Live SPR state is assembled from separate Header and Operations CSVs, with Header supplying summary fields and Operations supplying operation, OUT-door hours, and staffing fields. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | SPR export shape drift | Add SPR live merge fixture |
| CL-0047 | Timeline snapshots are persisted to IndexedDB `sort_snapshots` under compound key `[sort_date, source, snap_idx]`. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | IDB schema migration drift | Add timeline persistence fixture |
| CL-0048 | Auto-pull watches a granted folder every two minutes and ingests unseen Hub, Employee, and SPR CSVs through the timeline ingestion path. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Browser API or polling policy drift | Add auto-pull integration note |
| CL-0049 | Live Outbounds net volume per belt is `LooseOutbound + BagsLinked` from SCANTRACK Hub Summary. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Hub field rename drift | Add belt net fixture |
| CL-0050 | Outbounds paid PPH is net volume divided by SPR paid hours, while scan PPH is net volume divided by SCANTRACK Employee scan hours. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Denominator mix-up | Add paid-vs-scan PPH fixture |
| CL-0051 | If direct OUT-door SPR paid hours/staffing are absent, the tracker allocates aggregate outbound hours/staffing by scan-hour share when possible, otherwise by net-volume share. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Allocation fallback refactor | Add fallback allocation fixture |
| CL-0052 | Outbounds utilization is scan hours divided by paid hours, not cube utilization and not an HR labor-utilization claim. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Label ambiguity | Add utilization glossary note |
| CL-0053 | Active-loader coverage counts distinct users whose first/last scan interval overlaps each 30-minute bucket. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Coverage bucket policy drift | Add coverage interval fixture |
| CL-0054 | The tracker operator payload separates operator-ready fields, analyst-detail recalibration candidates, and blocked metrics, including blocked causal staffing and scanner attribution claims. | `Operations/adapters/tracker_operator_payload.py` | source-verified | manuscript/tracker docs | Payload contract drift | Add payload contract test |
| CL-0055 | Intel pre-sort projection computes belt volume from day-of-week building-volume bands, PD fraction, and day-of-week belt share, then converts volume to paid-hour targets with plan PPH bands of 230 and 190. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Projection metadata drift | Add projection metadata fixture |
| CL-0056 | Intel projection reliability uses normalized band width `(p75 - p25) / median` for tight/fair/wide labels and uses `min(100, n_belt / 6 * 100)` for the visible evidence bar. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Reliability label policy drift | Add reliability rendering fixture |
| CL-0057 | Live Intel compares `LooseOutbound + BagsLinked` Hub net by belt against projection p25/p75 bands, and compares building live volume to projected median sum using 0.92 and 1.08 thresholds. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Threshold or field drift | Add live-vs-band fixture |
| CL-0058 | Intel method checks compute `kappa_912_pd`, `rho_pd_hub`, `kappa_912`, and the residual `kappa_912 - rho_pd_hub * kappa_912_pd`; the UI labels this as a simulation validation harness, not a live constant claim. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | analyst/detail only | Identity could be misread as operator claim | Add analyst-detail copy test |
| CL-0059 | Intel payload health states that live net uses Hub Summary, paid-hour basis uses SPR actual hours, and missing live input must not be treated as on track. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Health-copy drift | Add missing-input fixture |
| CL-0060 | Queue state computes utilization as `rho_q = lambda_q / (c_q * mu_q)` with thresholds 0.60, 0.85, and 1.00 for clearing, balanced, building, and critical states. | `Live-Sort/tracker_v6.3-codex.html` | source-verified with unit caveat | manuscript/tracker docs | Unit mismatch if `mu_q` is building-level PPH | Add queue unit audit |
| CL-0061 | `_intelQueueState` wires `mu` from SPR actual PPH or `hubNet / actualHours`, and wires `c` from headcount, worked count, employee totals, or area staffing. | `Live-Sort/tracker_v6.3-codex.html` | source-verified with unit caveat | manuscript/tracker docs | Multiplying aggregate PPH by headcount may overstate capacity | Resolve queue denominator contract |
| CL-0062 | When `rho > 1`, queue backlog minutes are estimated as `remainingVol / (lambda - capacity) * 60`. | `Live-Sort/tracker_v6.3-codex.html` | source-verified with model caveat | analyst/detail only | Negative or stale remaining volume can distort warning | Add backlog edge-case test |
| CL-0063 | Sort completion linear fallback estimates remaining time as `remainingVol / max(1, currentPPH * totalStaff)` and produces a narrow p10/p90 display band around that completion estimate. | `Live-Sort/tracker_v6.3-codex.html` | source-verified with unit caveat | manuscript/tracker docs | Unit mismatch if current PPH is already aggregate | Add completion unit audit |
| CL-0064 | PERT completion forecasting uses ramp, peak, and wind phases, with `te = (p10 + 4*p50 + p90) / 6`, phase capacity `te * staff * duration`, and variance derived from `((p90 - p10) / 6)^2`. | `Live-Sort/tracker_v6.3-codex.html` | source-verified with unit caveat | manuscript/tracker docs | Phase PPH may be aggregate rather than per-worker | Add phase-unit fixture |
| CL-0065 | `renderPERTBand()` builds phase percentiles from canonical PPH trajectory data and only renders the live completion prediction during the 18:00-22:00 sort window. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Time-window policy drift | Add render gate fixture |
| CL-0066 | Payload live analog forecasting reports ready projections only when the validation gate passes; otherwise it returns blocked status with warnings and blocked claims. | `Operations/adapters/tracker_operator_payload.py`; `Live-Sort/tracker_v6.3-codex.html` | source-verified | analyst/detail only until gate passes | Validation gate could be bypassed by UI drift | Add payload blocked/ready contract test |
| CL-0067 | Sort Quality Score is a weighted score: 40% PPH score, 25% data fidelity, 20% staffing adherence, and 15% missort-quality proxy. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Weight drift | Add SQS weight fixture |
| CL-0068 | Data fidelity score is `0.40 * alignment + 0.30 * (1 - ghostRate) + 0.30 * (1 - latePunchShare)`. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Proxy semantics may be overstated | Add fidelity glossary note |
| CL-0069 | SQS missort-quality proxy defaults to 0.85 when no CURE rows exist and otherwise uses `1 - gapRows / cureRows.length`, where gap rows are high-TFCS rows below utilization threshold. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | CURE row definition drift | Add CURE/SQS fixture |
| CL-0070 | SQS missing-data defaults are 0.75 for PPH score, 0.75 for fidelity, 0.80 for staffing adherence, and 0.85 for missort quality. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Defaults can hide missing evidence | Add missing-data visual guardrail |
| CL-0071 | Normalized zone entropy uses Shannon entropy over package shares and divides by `log2(counts.length)`, where `counts` is the grouped package-count vector passed into the entropy function. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Small sample sizes can look precise | Add sample-size guard |
| CL-0072 | Zone entropy groups SCANTRACK Employee rows into Z1, Z2, and Z3 belt families, sums `Total Packages` by user, and excludes exact scanner IDs plus SLS, ASX, and SS-prefixed users. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Exclusion policy may diverge from Outbounds | Add entropy exclusion fixture |
| CL-0073 | Entropy concentration risk is flagged when normalized entropy is below 0.40 and at least three employees are present in the zone. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Threshold is heuristic | Add threshold calibration note |
| CL-0074 | Current zone entropy does not apply the full no-load/SLIC exclusions used elsewhere and uses `Total Packages` rather than Outbounds canonical net, so source alignment remains an open improvement. | `Live-Sort/tracker_v6.3-codex.html` | source-verified open gap | manuscript/tracker docs | Entropy may not match Outbounds denominators | Align entropy source contract |
| CL-0075 | SCANTRACK per-user rows compute user net as `Outbound Volume + Bags Linked`, merge/cap scan intervals when appropriate, compute PPH as net divided by hours, and exclude system/no-load/hub-SLIC rows. | `Live-Sort/tracker_v6.3-codex.html`; `Live-Sort/metric_contract.json` | source-verified | manuscript/tracker docs | Exclusion policy drift | Add per-user aggregation fixture |
| CL-0076 | Wilson ranking includes only rows with at least 0.25 hours, maps PPH to `p_obs = min(pph / 400, 1.0)`, uses `n_pseudo = max(round(hours * 2), 1)`, and sorts by Wilson lower bound. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Pseudo-count calibration may be weak | Add Wilson ranking fixture |
| CL-0077 | The Wilson interval implementation uses `z = 1.96` and converts interval bounds back to PPH by multiplying by 400. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Formula refactor | Add Wilson formula unit test |
| CL-0078 | The Wilson panel is a conservative ranking proxy over scan PPH, not a validated probability model for a loader's true long-run PPH. | `Live-Sort/tracker_v6.3-codex.html` | source-derived caveat | manuscript/tracker docs | Overstated confidence language | Calibrate pseudo-count model or soften UI copy |
| CL-0079 | The Plan tab intentionally separates Planned Adjusted Building PPH from outbound belt Load PPH. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | UI copy drift | Add DOP denominator contract test |
| CL-0080 | The building manifold computes required paid hours as building volume divided by adjusted building PPH, cost per piece as `1 / PPH` labor-hours or `60 / PPH` minutes, and required heads as required hours divided by target paid day. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Formula drift | Add DOP manifold fixture |
| CL-0081 | The managed paid-day model uses `PD_MAX = 4.5`, computes needed paid day as required hours divided by actual headcount, and labels covered/tight/short regimes with packages at risk when required hours exceed delivered hours. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Paid-day policy drift | Add regime boundary fixture |
| CL-0082 | Per-belt outbound loader staffing is `belt volume / belt load PPH / paid day`, rounded up for display, with a warning when a single override exceeds the belt's historical mean by more than 12%. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Historical PPH source drift | Add per-belt loader fixture |
| CL-0083 | The current Plan tab breaks out outbound direct loaders only; pick-off and non-outbound areas roll into the building total rather than a belt table. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Scope may expand later | Add DOP scope note |
| CL-0084 | In v6.1, the old DOP Phase/Pace/Scenarios/Back-Solve/Staffing-Optimizer panels were removed from the active tab; `dopRenderAll()` now renders the pre-sort plan and preserves hidden compatibility capture. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Dormant helpers could be mistaken as active UI | Add active-renderer audit |
| CL-0085 | The current LP-lite staffing chapter describes a direct constraint calculation, not a full linear-programming solver. | `Live-Sort/tracker_v6.3-codex.html` | source-derived caveat | manuscript/tracker docs | Overstating optimization | Add solver-boundary note |
| CL-0086 | The metric contract defines canonical net volume as `loose_outbound + bags_linked` and distinguishes scan PPH, paid belt PPH, and broken gross/ScanPPH fields that should not be used. | `Live-Sort/metric_contract.json` | source-verified | manuscript/tracker docs | Contract drift | Add metric-contract conformance test |
| CL-0087 | The metric contract's canonical weekly gamma is 0.982, while the tracker `GAMMA` literal fallback is 0.958 if the contract is absent; `gammaDecayForecast()` uses `V_Mon = todayVol / gamma^todayIdx`. | `Live-Sort/metric_contract.json`; `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Contract propagation drift | Verify embedded/fallback behavior |
| CL-0088 | Live kappa is computed as Zone 3 Hub net divided by total Hub net, expected kappa comes from `KAPPA_DOW`, and deviations greater than three percentage points are marked significant. | `Live-Sort/tracker_v6.3-codex.html`; `Live-Sort/metric_contract.json` | source-verified | manuscript/tracker docs | SVQ/SCANTRACK basis confusion | Add kappa basis note/test |
| CL-0089 | The contract records `rho_pd_hub = 0.509` and `epsilon_schema = 0.04`, while tracker reconciliation uses `EPS_PRIOR = 0.039` and computes `eps_actual = (SCANTRACK_volume - SPR_volume) / SPR_volume`. | `Live-Sort/metric_contract.json`; `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Prior/contract mismatch | Reconcile EPS prior with contract |
| CL-0090 | `U_T_cap = 0.85` triggers a high CURE warning in the action queue, while CURE utilization at or above 0.95 is rendered as urgent. | `Live-Sort/metric_contract.json`; `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Threshold drift | Add action-queue CURE fixture |
| CL-0091 | ADMM invariant bands include kappa Monday/Friday, gamma, rho_pd_hub, epsilon_schema, and U_T_cap ranges used as anti-hallucination guardrails. | `~/Desktop/Twilight 050426/ai_memory/mcts-upgrade/admm_utils.py` | source-verified | manuscript/ai_memory docs | Invariant table drift | Add cross-contract invariant check |
| CL-0092 | Borrow-loan zone stats compute zone volume from Hub net, staffing from SPR belt paid hours divided by `SORT_HOURS`, and productivity as volume divided by staff. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Staff-hour allocation drift | Add zone productivity fixture |
| CL-0093 | Borrow-loan surplus and deficit candidates are identified using 1.15 and 0.85 multiples of mean zone productivity, with surplus requiring staff greater than one. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Threshold calibration weak | Add threshold calibration note |
| CL-0094 | The current borrow-loan `gainEst = to.vol / (to.staff + 1) - to.vol / max(to.staff, 1)` is nonpositive for staffed destinations, so move emission is under audit. | `Live-Sort/tracker_v6.3-codex.html` | source-verified open issue | manuscript/tracker docs | UI may show no moves despite imbalance | Correct or replace gain estimator |
| CL-0095 | Borrow-loan projected-gain language should remain caveated until the gain estimator is corrected and validated. | `Live-Sort/tracker_v6.3-codex.html` | source-derived caveat | manuscript/tracker docs | Unsupported operator projection | Add payload/UI blocked-claim gate |
| CL-0096 | Simulation is allowed to validate method behavior and stress-test denominators, but it is not allowed to create external evidence for real pilot-hub constants. | `Operations/adapters/simulation_validation_capsule.py` | source-verified | manuscript/simulation docs | Synthetic evidence overstated | Keep claim-boundary labels in every simulation chapter |
| CL-0097 | The simulation validation capsule explicitly blocks seeded simulation outputs as real adjusted-building-PPH evidence and requires canonical SCANTRACK volume divided by SPR Hours for operator calibration. | `Operations/adapters/simulation_validation_capsule.py`; `Operations/adapters/tracker_operator_payload.py` | source-verified | manuscript/operator payload docs | Circular PPH claims | Add real overlap validation task |
| CL-0098 | The sort generator persists `run_metadata`, `checkpoints`, and `sorts` tables, uses `UNIQUE(run_id, sim_index) ON CONFLICT IGNORE`, and resumes from `MAX(sim_index)+1`. | `~/Desktop/Twilight 050426/ai_memory/simulation/sort_generator.py` | source-verified | manuscript/simulation docs | Schema drift | Add schema/resume fixture |
| CL-0099 | The generator uses a Gaussian copula draw, day-of-week lognormal volume, truncated-normal paid day, and day-of-week Dirichlet destination shares. | `~/Desktop/Twilight 050426/ai_memory/simulation/sort_generator.py` | source-verified | manuscript/simulation docs | Calibration field drift | Add calibration-shape fixture |
| CL-0100 | The generator samples planned PPH operating points, applies a typical/bad-day performance factor, clips performance to [0.5, 1.5], and computes `pph_sor = pph_sor_planned * performance_factor`. | `~/Desktop/Twilight 050426/ai_memory/simulation/sort_generator.py` | source-verified | manuscript/simulation docs | PPH may be misread as empirical | Keep synthetic-PPH quarantine note |
| CL-0101 | The generator back-derives worked headcount from `total_volume / (paid_day * pph_sor_planned)` with noise, and computes actual total hours from `total_volume / pph_sor`. | `~/Desktop/Twilight 050426/ai_memory/simulation/sort_generator.py` | source-verified | manuscript/simulation docs | Operational simplification | Compare with real SPR overlap later |
| CL-0102 | The generator carries cost fields `cost_per_piece_h = 1 / pph_sor` and `cost_per_piece_min = 60 / pph_sor`. | `~/Desktop/Twilight 050426/ai_memory/simulation/sort_generator.py` | source-verified | manuscript/simulation docs | Synthetic PPH basis | Add cost-field glossary note |
| CL-0103 | The generator computes inverse LP-lite zone loaders as `ceil(zone_volume / (loader_pph_mu * sort_span * u_t_cap))`, then adds integer delta noise and computes zone SCANTRACK PPH and utilization. | `~/Desktop/Twilight 050426/ai_memory/simulation/sort_generator.py` | source-verified | manuscript/simulation docs | Loader model simplification | Add loader-envelope validation |
| CL-0104 | The generator flags LBR breach, hard breach, direct overcommit, and copula extreme events from generated zone PPH, loader hours, and copula residuals. | `~/Desktop/Twilight 050426/ai_memory/simulation/sort_generator.py` | source-verified | manuscript/simulation docs | Threshold drift | Add breach-rate audit |
| CL-0105 | Phase shares are drawn from a three-dimensional Dirichlet distribution, adjusted to enforce a Phase 3 floor, and shifted toward the spike phase when spike volume exists. | `~/Desktop/Twilight 050426/ai_memory/simulation/sort_generator.py` | source-verified | manuscript/simulation docs | Phase dynamics simplified | Add phase conservation test |
| CL-0106 | The validation capsule opens simulation DBs through SQLite read-only URI mode and sets `PRAGMA query_only=ON`. | `Operations/adapters/simulation_validation_capsule.py` | source-verified | manuscript/simulation docs | SQLite URI behavior | Add read-only connection test |
| CL-0107 | The invariant audit recomputes `kappa_912_pd`, `kappa_912`, `rho_pd_hub`, and the multiplicative identity from raw PD volume columns using tolerance 0.0001. | `Operations/adapters/simulation_validation_capsule.py` | source-verified | manuscript/simulation docs | Column drift | Add invariant fixture |
| CL-0108 | The DOW negative-control gate flags review when a flat synthetic metric's max DOW mean gradient exceeds 0.02. | `Operations/adapters/simulation_validation_capsule.py` | source-verified | manuscript/simulation docs | Threshold calibration | Add flat-corpus regression fixture |
| CL-0109 | The DOW positive-control gate passes when raw Z3 PD-share gradient is at least 0.05 in the DOW-shaped corpus. | `Operations/adapters/simulation_validation_capsule.py` | source-verified | manuscript/simulation docs | Threshold calibration | Add positive-control fixture |
| CL-0110 | Estimator recovery reports weighted zone shares, hub share, rho, and a seeded synthetic PPH field labeled `circular-do-not-claim`. | `Operations/adapters/simulation_validation_capsule.py` | source-verified | manuscript/simulation docs | PPH misuse | Keep payload block |
| CL-0111 | Operator stress envelopes summarize building metrics, zone loader totals, utilization, flag rates, and practical sanity flags such as paid day > 6, worked > 600, zone loaders > 150, and PPH outside 80-160. | `Operations/adapters/simulation_validation_capsule.py` | source-verified | manuscript/simulation docs | Stress thresholds drift | Add stress-envelope fixture |
| CL-0112 | The dual-corpus capsule passes overall only when invariant checks pass and both positive DOW recovery and negative DOW control gates pass. | `Operations/adapters/simulation_validation_capsule.py` | source-verified | manuscript/simulation docs | Gate semantics drift | Add capsule summary test |
| CL-0113 | The tracker operator payload blocks simulation `pph_sor`, synthetic carryover, causal staffing claims, and scanner attribution claims from operator use. | `Operations/adapters/tracker_operator_payload.py` | source-verified | manuscript/operator payload docs | Payload drift | Add blocked-metric contract test |
| CL-0114 | The knowledge graph is JSON-primary at `ai_memory/db/knowledge_graph.json`; SQLite is treated as a disposable cache. | `~/Desktop/Twilight 050426/ai_memory/knowledge_graph.py` | source-verified | manuscript/ai_memory docs | Storage model change | Add KG persistence note |
| CL-0115 | Knowledge graph nodes contain id, type, label, content, tags, metadata, session, created_at, and updated_at. | `~/Desktop/Twilight 050426/ai_memory/knowledge_graph.py` | source-verified | manuscript/ai_memory docs | Schema drift | Add node schema fixture |
| CL-0116 | Knowledge graph edges contain id, from, to, type, label, and created_at, and duplicate from/to/type edges are skipped. | `~/Desktop/Twilight 050426/ai_memory/knowledge_graph.py` | source-verified | manuscript/ai_memory docs | Edge semantics drift | Add duplicate-edge test |
| CL-0117 | `get_branch_context()` returns current node, lineage, constants, decisions, concepts, data sources, and exceptions from branch lineage and a depth-two subgraph. | `~/Desktop/Twilight 050426/ai_memory/knowledge_graph.py` | source-verified | manuscript/ai_memory docs | Context packet drift | Add branch-context fixture |
| CL-0118 | Version chains are built from version nodes tagged with an artifact and sorted by `metadata.sort_key`; latest version is the last node in that chain. | `~/Desktop/Twilight 050426/ai_memory/knowledge_graph.py` | source-verified | manuscript/ai_memory docs | Sort-key drift | Add version-chain fixture |
| CL-0119 | `add_session_nodes()` links new constants to a branch with `depends_on`, new decisions with `connected_to`, and revisions with `revised_by`. | `~/Desktop/Twilight 050426/ai_memory/knowledge_graph.py` | source-verified | manuscript/ai_memory docs | Postmortem integration drift | Add session-node fixture |
| CL-0120 | The memory database is JSON-primary at `ai_memory/db/memory_export.json`, with SQLite FTS stored as a disposable cache at `/tmp/hub_memory_v2/cache.sqlite`. | `~/Desktop/Twilight 050426/ai_memory/memory_db.py` | source-verified | manuscript/ai_memory docs | Storage path drift | Add memory path fixture |
| CL-0121 | `_save_store()` stamps export metadata, writes a temporary JSON file in the database directory, and moves it into place as `memory_export.json`. | `~/Desktop/Twilight 050426/ai_memory/memory_db.py` | source-verified | manuscript/ai_memory docs | Atomicity overclaim | Keep wording limited to local temp-file-plus-move |
| CL-0122 | `add_memory()` derives ids from the first 16 hex characters of `sha256(content + category)` and writes JSON before attempting a non-fatal SQLite cache update. | `~/Desktop/Twilight 050426/ai_memory/memory_db.py` | source-verified | manuscript/ai_memory docs | ID scheme drift | Add add_memory regression fixture |
| CL-0123 | `query_memory()` uses SQLite FTS5 with `tokenize='porter ascii'`, optional category filtering, and JSON substring fallback when FTS returns no rows or raises. | `~/Desktop/Twilight 050426/ai_memory/memory_db.py` | source-verified | manuscript/ai_memory docs | Search fallback drift | Add FTS cold-cache test |
| CL-0124 | `save_postmortem()` appends a rich postmortem record, writes a per-postmortem JSON file, and stores takeaways, decisions, and Rafael patterns as searchable memories. | `~/Desktop/Twilight 050426/ai_memory/memory_db.py` | source-verified | manuscript/ai_memory docs | Postmortem schema drift | Add postmortem fixture |
| CL-0125 | Corpus ingestion defaults to the latest version per `hub_ops_*.md` lineage, while explicit filenames override selection and `--all` ingests every matching version. | `~/Desktop/Twilight 050426/ai_memory/corpus_ingest.py` | source-verified | manuscript/ai_memory docs | File naming drift | Add version-selection fixture |
| CL-0126 | Corpus chunking preserves preamble text, splits on level-two markdown headers, and targets 200-2000 character chunks with paragraph-boundary wrapping for oversized sections. | `~/Desktop/Twilight 050426/ai_memory/corpus_ingest.py` | source-verified | manuscript/ai_memory docs | Chunking policy drift | Add chunking fixture |
| CL-0127 | Reference node ids are deterministic MD5-based ids from filename, chunk index, and chunk title, and reference metadata records source file, lineage, version, section, chunk index, and character length. | `~/Desktop/Twilight 050426/ai_memory/corpus_ingest.py` | source-verified | manuscript/ai_memory docs | Metadata drift | Add reference-node fixture |
| CL-0128 | Corpus ingest upserts reference nodes, adds `grounds` edges to seeded whitepaper branch nodes by matching filename, and scopes optional pruning to the file being re-ingested. | `~/Desktop/Twilight 050426/ai_memory/corpus_ingest.py` | source-verified | manuscript/ai_memory docs | Prune scope drift | Add prune/edge fixture |
| CL-0129 | Corpus ingest warms the embedding cache against the full scoreable KG node set when embedding is enabled, and saves reference nodes even if embedding fails. | `~/Desktop/Twilight 050426/ai_memory/corpus_ingest.py`; `~/Desktop/Twilight 050426/ai_memory/briefing_scorer.py` | source-verified | manuscript/ai_memory docs | Embed failure handling drift | Add no-embed and failed-embed tests |
| CL-0130 | Semantic retrieval backend priority is `specter2_adapters`, then base `specter2`, then frozen-vocabulary `tfidf`; the adapter path uses proximity for nodes and `adhoc_query` for queries. | `~/Desktop/Twilight 050426/ai_memory/briefing_scorer.py` | source-verified | manuscript/ai_memory docs | Backend priority drift | Add backend selection smoke test |
| CL-0131 | Node embedding text is label plus up to 400 content characters plus tags; checksums drive incremental embedding, and backend/model changes invalidate the cache. | `~/Desktop/Twilight 050426/ai_memory/briefing_scorer.py` | source-verified | manuscript/ai_memory docs | Cache mismatch drift | Add checksum/cache invalidation fixture |
| CL-0132 | `ChromaStore` uses a persistent Chroma collection named `kg_nodes` with cosine HNSW space under `ai_memory/db/chroma`, and falls back to in-memory cosine search when ChromaDB is unavailable. | `~/Desktop/Twilight 050426/ai_memory/chroma_store.py` | source-verified | manuscript/ai_memory docs | Vector store drift | Add Chroma/fallback interface test |
| CL-0133 | `score_nodes()` scores selected KG node types, queries Chroma with up to 3x over-fetch, applies a 15% recent-session boost and 8% decision/collaboration boost, and appends constant/exception/version nodes as pinned items. | `~/Desktop/Twilight 050426/ai_memory/briefing_scorer.py` | source-verified | manuscript/ai_memory docs | Boost semantics drift | Add scoring fixture |
| CL-0134 | RAG query term extraction captures PD designators, SLIC numbers, bay numbers, four-digit codes, dotted abbreviations, and non-stopword tokens of at least three characters. | `~/Desktop/Twilight 050426/ai_memory/hub_rag.py` | source-verified | manuscript/ai_memory docs | Entity extraction drift | Add query-term fixture |
| CL-0135 | RAG retrieval over-fetches semantic results by 8x, removes reference nodes from the immediate answer set, deduplicates, and re-ranks by operational/constant/exception/learned, then decision/concept/framework/data_source/role/tool, then collaboration/version/artifact. | `~/Desktop/Twilight 050426/ai_memory/hub_rag.py` | source-verified | manuscript/ai_memory docs | Tier policy drift | Add retrieval-rerank fixture |
| CL-0136 | The RAG keyword supplement fires when fewer than three Tier 1 nodes survive or no retrieved node contains at least two query key terms, and it scans non-reference KG nodes directly for two or more matched terms. | `~/Desktop/Twilight 050426/ai_memory/hub_rag.py` | source-verified | manuscript/ai_memory docs | Supplement threshold drift | Add entity-query regression |
| CL-0137 | The RAG context block is capped at 5000 characters, and the context-present prompt instructs the local model to use only the context, find the directly named entity entry, quote the key fact, and say `Not found in context.` when absent. | `~/Desktop/Twilight 050426/ai_memory/hub_rag.py` | source-verified | manuscript/ai_memory docs | Prompt drift | Add prompt snapshot test |
| CL-0138 | The no-context RAG fallback prompt is weaker than the context-present guardrail and should be treated as an open hardening target for strict grounding. | `~/Desktop/Twilight 050426/ai_memory/hub_rag.py` | source-derived caveat | manuscript/ai_memory docs | Unsupported answer path | Harden fallback to require context |
| CL-0139 | `start-ritual.py` loads the knowledge graph, runs legacy `session_start.run()`, and auto-detects the latest `tracker_vX.Y.html` branch when no branch ids are supplied. | `~/Desktop/Twilight 050426/ai_memory/start-ritual.py` | source-verified | manuscript/ai_memory docs | Auto-detect path drift | Add tracker branch detection fixture |
| CL-0140 | The start ritual renders KG branch context through `get_branch_context()` and smart context through `score_nodes()` using a query built from next priority, first branch id, and recent decisions. | `~/Desktop/Twilight 050426/ai_memory/start-ritual.py`; `~/Desktop/Twilight 050426/ai_memory/briefing_scorer.py` | source-verified | manuscript/ai_memory docs | Context composition drift | Add start-ritual dry-run capture |
| CL-0141 | The installed start-ritual skill instructs the assistant to run `start-ritual.py`, show the full structured briefing, seed the KG if missing, and fall back to `session_start.py` if imports fail. | `~/.agents/skills/start-ritual/SKILL.md` | source-verified | manuscript/ai_memory docs | Skill path/invocation drift | Keep skill pointer audited |
| CL-0142 | `research_loop.py` requires the Anthropic SDK and `ANTHROPIC_API_KEY`, runs up to `N_MAX = 40` cycles, uses model `claude-opus-4-6`, and caps model output at 4096 tokens. | `~/Desktop/Twilight 050426/ai_memory/research_loop.py` | source-verified | manuscript/ai_memory docs | Runtime config drift | Add loop config snapshot |
| CL-0143 | When MCTS is available, the research loop acquires a lockfile, snapshots the live KG, and blocks execution if the KG node count falls below baseline 2700. | `~/Desktop/Twilight 050426/ai_memory/research_loop.py` | source-verified | manuscript/ai_memory docs | Baseline staleness | Add KG integrity test |
| CL-0144 | Open gaps are KG nodes tagged `open_gap`; MCTS gap routing excludes gaps tagged `debt`, then routes by metadata branch, keyword classifier, or fallback branch D. | `~/Desktop/Twilight 050426/ai_memory/research_loop.py` | source-verified | manuscript/ai_memory docs | Gap taxonomy drift | Add gap-routing fixture |
| CL-0145 | The canonical MCTS action space is 5 branches by 6 experiment types, while `research_loop.py` still has a status-display calculation using 25 unvisited nodes. | `~/Desktop/Twilight 050426/ai_memory/mcts-upgrade/mcts_utils.py`; `~/Desktop/Twilight 050426/ai_memory/research_loop.py` | source-verified open issue | manuscript/ai_memory docs | Misleading loop status | Fix status display to use action-space length |
| CL-0146 | Each autoresearch prompt includes standing research-program text, start-ritual KG context, branch-head text, a sampled corpus summary, and optional gap, ADMM, or simulation-verification blocks. | `~/Desktop/Twilight 050426/ai_memory/research_loop.py` | source-verified | manuscript/ai_memory docs | Prompt assembly drift | Add prompt snapshot test |
| CL-0147 | `parse_score()` defaults missing or unparsable model score blocks to zero-count score data with summary `(score parse failed)`. | `~/Desktop/Twilight 050426/ai_memory/research_loop.py` | source-verified | manuscript/ai_memory docs | Parser drift | Add score-parser fixture |
| CL-0148 | The autoresearch reward is `2*gaps_closed + 1.5*new_grounded_claims + 2*new_verified_claims + 1*cross_refs_added - 3*contradictions_found`. | `~/Desktop/Twilight 050426/ai_memory/research_loop.py` | source-verified | manuscript/ai_memory docs | Reward tuning drift | Add reward formula test |
| CL-0149 | Autoresearch keeps and writes branch output only when score is positive; nonpositive cycles are discarded and not written to branch files. | `~/Desktop/Twilight 050426/ai_memory/research_loop.py` | source-verified | manuscript/ai_memory docs | Keep gate drift | Add keep/discard fixture |
| CL-0150 | Research cycles are logged to `research_results.tsv` and `research_cycle_log.jsonl`; TSV is treated as the replay source for MCTS warm-start. | `~/Desktop/Twilight 050426/ai_memory/research_loop.py`; `~/Desktop/Twilight 050426/ai_memory/mcts-upgrade/mcts_utils.py` | source-verified | manuscript/ai_memory docs | Log schema drift | Add TSV replay fixture |
| CL-0151 | MCTS backpropagation is currently applied only for kept cycles; discarded cycles log status but skip selector-state update. | `~/Desktop/Twilight 050426/ai_memory/research_loop.py`; `~/Desktop/Twilight 050426/ai_memory/mcts-upgrade/mcts_utils.py` | source-verified | manuscript/ai_memory docs | Policy may change | Add discard/backprop test |
| CL-0152 | Pending simulation verification targets are KG nodes with `metadata.pending_verification == True` and `metadata.source == "sim"`, and kept verify cycles mark the node with verdict metadata and `sim_verified_<verdict>` tag. | `~/Desktop/Twilight 050426/ai_memory/research_loop.py` | source-verified | manuscript/simulation docs | Verification metadata drift | Add sim-node verification fixture |
| CL-0153 | At loop end, `run_postmortem_lite()` writes `autoresearch_postmortem_<date>.json` and `.last_autoresearch_session` so `langgraph_postmortem.py` can auto-ingest the run later. | `~/Desktop/Twilight 050426/ai_memory/research_loop.py`; `~/Desktop/Twilight 050426/ai_memory/langgraph_postmortem.py` | source-verified | manuscript/ai_memory docs | Sentinel handoff drift | Add sentinel ingestion test |
| CL-0154 | `langgraph_postmortem.py` implements six nodes: parse_session, score_performance, extract_takeaways, extract_decisions, extract_patterns, and persist, with a linear fallback shim when LangGraph is unavailable. | `~/Desktop/Twilight 050426/ai_memory/langgraph_postmortem.py` | source-verified | manuscript/ai_memory docs | Workflow drift | Add graph build smoke test |
| CL-0155 | Postmortem performance is scored from completeness, accuracy, depth, and collaboration, with unresolved errors penalized more heavily than caught-and-fixed errors. | `~/Desktop/Twilight 050426/ai_memory/langgraph_postmortem.py` | source-verified | manuscript/ai_memory docs | Rubric drift | Add scoring fixture |
| CL-0156 | Postmortem persistence saves memory, rewrites `CLAUDE_CONTEXT.md`, best-effort updates KG nodes, and optionally runs `formalization_pipeline.run_formalization()`. | `~/Desktop/Twilight 050426/ai_memory/langgraph_postmortem.py`; `~/Desktop/Twilight 050426/ai_memory/memory_db.py` | source-verified | manuscript/ai_memory docs | Formalization dependency drift | Add no-formalization fallback test |
| CL-0157 | The context-document generator still contains an older gamma row, so it should be treated as orientation text rather than the metric source of truth. | `~/Desktop/Twilight 050426/ai_memory/langgraph_postmortem.py`; `Live-Sort/metric_contract.json` | source-verified open issue | manuscript/ai_memory docs | Stale context constants | Reconcile CLAUDE_CONTEXT generator constants |
| CL-0158 | The tracker operator payload schema is `hii.tracker_operator_payload.v1` and separates `operator_ready`, `analyst_detail`, `blocked`, and `tracker_contract`. | `Operations/adapters/tracker_operator_payload.py` | source-verified | manuscript/operator payload docs | Schema drift | Add payload schema fixture |
| CL-0159 | Live analog forecast fields are exposed as operator-ready only when the validation gate summary `overall` equals `passes`; otherwise forecast status is blocked. | `Operations/adapters/tracker_operator_payload.py`; `Operations/tests/test_tracker_operator_payload.py` | source-verified | manuscript/operator payload docs | Gate bypass risk | Keep readiness-gate regression |
| CL-0160 | The blocked payload metrics are SPR summary PPH, simulation `pph_sor`, sort-span headcount denominator, carryover adjustment flag, causal staffing claims, and scanner attribution claims. | `Operations/adapters/tracker_operator_payload.py`; `Operations/tests/test_tracker_operator_payload.py` | source-verified | manuscript/operator payload docs | Block list drift | Add blocked-list snapshot test |
| CL-0161 | The tracker accepts `tracker_operator_payload_*.json` as read-only analytics evidence and states that operator-facing decisions still come from live CSV/SPR inputs. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/operator payload docs | UI copy drift | Add payload UI fixture |
| CL-0162 | The tracker hides the metric-contract pill unless admin mode is enabled through URL/admin state, while still allowing a validated contract override to be stored in localStorage and applied on reload. | `Live-Sort/tracker_v6.3-codex.html`; `Live-Sort/metric_contract.json` | source-verified | manuscript/architecture docs | Override drift | Add contract override test |
| CL-0163 | The container embeds child apps as base64 text payloads and decodes them into iframe `srcdoc`, keeping child DOM/CSS/JS sandboxes separate. | `Pre-Sort/dash-tracker-container/hub_operations_v5.0.html` | source-verified | manuscript/architecture docs | Container architecture drift | Add embed smoke test |
| CL-0164 | `refresh_container_embed.py` is required to propagate standalone tracker/dashboard/presort-template changes into the embedded container payloads. | `Pre-Sort/dash-tracker-container/refresh_container_embed.py` | source-verified | manuscript/architecture docs | Stale embedded payloads | Run refresh after standalone changes |
| CL-0165 | Tracker IndexedDB `tracker_ops_db` version 5 includes hub snapshots, area snapshots, sort history, CURE history, sort snapshots, app state, and daily predictions stores. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/architecture docs | IDB schema drift | Add IDB schema fixture |
| CL-0166 | Dashboard IndexedDB `hub_ops_trends_db` stores snapshots keyed by `snapshotKey` and participates in OI postMessage export/import. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/architecture docs | Dashboard IDB drift | Add dashboard archive fixture |
| CL-0167 | Tracker live CSV ingestion re-aliases CSV headers to legacy XLSX keys and merges live SPR Header and Operations CSVs into one SPR state. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/architecture docs | Live CSV format drift | Add CSV alias/SPR merge tests |
| CL-0168 | Tracker auto-pull and analytics payload watch use the File System Access API through `showDirectoryPicker`; unsupported browsers fall back to manual file loading. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/architecture docs | Browser API support | Keep manual upload fallback |
| CL-0169 | Tracker full-state export uses schema `tracker.fullDataDump.v1`, and history export uses schema `tracker.historyBundle.v1`. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/architecture docs | Export schema drift | Add import/export schema tests |
| CL-0170 | The dashboard rebuild path parses loaded source files into `DATA`, renders all panels, then auto-saves a trend snapshot when `buildSnapshot()` returns a record. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/architecture docs | Rebuild order drift | Add dashboard rebuild fixture |
| CL-0171 | The live sort ingestion tests verify PD belt normalization, snapshot filename parsing, hub summary totals, SPR header hours, unique PD loader counts, live baseline grouping, per-pull timeline retention, and post-sort reconciliation. | `Operations/tests/test_live_sort_ingestion.py` | source-verified | manuscript/testing docs | Test refactor or fixture drift | Keep ingestion test list synced with Chapter 56 |
| CL-0172 | The label-training truth-routing tests verify local audit artifacts, specific clean PD reassignments, documented MULTIDEST split-belt behavior for its SLIC, and already-resolved PD rows. | `Label-Training-Certification/tests/test_truth_routing.py` | source-verified | manuscript/training/testing docs | Routing correction drift | Add direct quiz scoring fixture |
| CL-0173 | The pre-sort dashboard cube contract tests verify CURE OS uppercase normalization and cube KPI count based on total loads rather than destination-row count. | `Pre-Sort/tests/test_presort_dashboard_cube_contract.py` | source-verified | manuscript/dashboard/testing docs | Dashboard HTML refactor | Add broader dashboard parser fixture tests |
| CL-0174 | The tracker payload loader tests inspect the tracker HTML for upload-first tab order, payload controls, payload validation functions, DOP payload evidence copy, hub evidence strip copy, live analog forecast display, CSV auto-pull, and heatmap paths. | `Live-Sort/tests/test_tracker_payload_loader.py` | source-verified | manuscript/tracker/testing docs | Text assertions may miss visual regressions | Add browser screenshot checks |
| CL-0175 | The live tracker regression tests guard live SPR outbound allocation fallback, SCANTRACK loader interval capping, PD-only idle-gap filtering, timeline forward fill, SPR header/operations merge behavior, and aggregate operation-hour fallback. | `Live-Sort/tests/test_live_tracker_regressions.py` | source-verified | manuscript/tracker/testing docs | HTML string checks may drift under refactor | Add behavior-level browser tests |
| CL-0176 | The live fixture contract tests combine real fixture files with tracker source checks for aggregate live SPR operations, hub-net-over-SPR-hours PPH derivation, scan-hour-share outbound allocation, loader interval capping, PD-only idle gaps, after-midnight Twilight date handling, and timeline hour fallback. | `Live-Sort/tests/test_live_fixture_contracts.py` | source-verified | manuscript/tracker/testing docs | Fixture freshness | Refresh fixture baseline after source export changes |
| CL-0177 | The simulation validation capsule tests recompute invariant fields, run negative and positive DOW gates, compute estimator recovery summaries, separate dual-corpus validation, inspect stress envelopes, and label simulation claim boundaries. | `Operations/tests/test_simulation_validation_capsule.py` | source-verified | manuscript/simulation/testing docs | Sim schema drift | Add full-corpus regression fixtures |
| CL-0178 | The live analog forecast tests reject final-only simulation rows, score nearest trajectory families, collapse matched analogs into a forecast, block unsupported live states, build live state from pipeline artifacts, and derive PPH slope from timeline points. | `Operations/tests/test_live_analog_forecast.py` | source-verified | manuscript/forecast/testing docs | Trajectory schema drift | Add end-to-end analog forecast fixture |
| CL-0179 | The tracker operator payload tests enforce calibrated adjusted building PPH promotion, analyst-detail isolation for recalibration candidates, explicit tracker contract targets, live analog forecast readiness gates, blocked unsupported operator claims, and CLI JSON/Markdown output. | `Operations/tests/test_tracker_operator_payload.py` | source-verified | manuscript/operator payload/testing docs | Payload schema drift | Keep schema and blocked-list snapshot tests |
| CL-0180 | The manuscript's narrative spine is organized around a repeatable sequence: operational question, source files, denominator, formula, code path, test, and claim boundary. | `manuscript-v9.9.md`; current chapter sequence | source-derived caveat | manuscript/editorial docs | Future restructuring | Re-run structure pass before final manuscript |
| CL-0181 | The figure plan requires each figure to clarify a question, input, output, and claim boundary rather than act as decoration. | `manuscript-v9.9.md` | source-derived caveat | manuscript/editorial docs | Design pass may change figure standard | Apply figure standard during visual production |
| CL-0182 | The glossary requires context-specific notation for overloaded symbols such as `gamma`, `rho`, `kappa`, `epsilon`, and `U_T`. | `manuscript-v9.9.md`; Chapters 26, 47, 48, 59 | source-derived caveat | manuscript/math docs | Symbol drift across chapters | Run final notation pass |
| CL-0183 | The claim ledger status vocabulary distinguishes source-verified claims, source-derived caveats, source-verified open issues, sim-verified claims, hypotheses, and blocked claims. | `manuscript-v9.9.md` | source-derived caveat | manuscript/editorial docs | Editorial vocabulary drift | Normalize all ledger rows during claim pass |
| CL-0184 | Chapter 56 identifies RAG, SPECTER2/Chroma, MCTS, autoresearch, and ADMM as areas needing stronger direct regression or smoke-test coverage. | `manuscript-v9.9.md`; current test file inventory | source-derived caveat | manuscript/testing docs | New tests may close gaps | Re-audit test inventory before final manuscript |
| CL-0185 | The live tracker groups PD-01 through PD-04, PD-05 through PD-08, and PD-09 through PD-12 as three outbound PD zones for Intel and Outbounds analysis. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/foundation docs | Zone labels may change | Add zone-map fixture |
| CL-0186 | Live Outbounds net volume is computed as `LooseOutbound + BagsLinked` from SCANTRACK Hub rows. | `Live-Sort/tracker_v6.3-codex.html`; `Operations/adapters/live_sort_ingestion.py` | source-verified | manuscript/tracker docs | Hub field rename | Keep net-volume fixture tests |
| CL-0187 | Live Outbounds distinguishes paid PPH as net over SPR paid hours from scan PPH as net over SCANTRACK scan hours. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker docs | Denominator mix-up | Keep paid-vs-scan tests |
| CL-0188 | The adjusted building PPH overlap accepted by operations adapters is SCANTRACK canonical net volume divided by SPR actual hours, while SPR summary PPH, simulation `pph_sor`, and sort-span denominators are rejected bases. | `Operations/adapters/live_sort_ingestion.py`; `Operations/adapters/tracker_operator_payload.py` | source-verified | manuscript/operator payload docs | Adapter policy drift | Payload and ingestion tests |
| CL-0189 | The tracker operator payload explicitly blocks SPR summary PPH, simulation `pph_sor`, sort-span headcount denominator, carryover adjustment flag, causal staffing claims, and scanner attribution claims. | `Operations/adapters/tracker_operator_payload.py`; `Operations/tests/test_tracker_operator_payload.py` | source-verified | manuscript/operator payload docs | Block list drift | Blocked-list snapshot |
| CL-0190 | The dashboard's handled-volume denominator for misload frequency prefers SVQ Twilight total scan volume and falls back to SPR actual `Volume + Air Volume`. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard/math docs | Fallback policy drift | Misload denominator fixture |
| CL-0191 | The dashboard's LIB frequency uses LIB report volume and LIB total, with LIB total falling back to scan-log row count when the labeled total is absent. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-verified | manuscript/dashboard/math docs | LIB report format drift | LIB parser fixture |
| CL-0192 | The dashboard cube utilization denominator is aggregate loaded cube over aggregate equipment capacity rather than a row-average of utilization percentages. | `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html`; `Pre-Sort/tests/test_presort_dashboard_cube_contract.py` | source-verified | manuscript/dashboard/math docs | Cube aggregation refactor | Cube contract test |
| CL-0193 | The label-training storage layer stores sort events with sorter id, ZIP, expected belt, actual belt, correctness, multi-valid flag, and timestamp. | `Label-Training-Certification/js/quiz.js`; `Label-Training-Certification/js/storage.js` | source-verified | manuscript/training analytics docs | Event schema drift | Add event-schema test |
| CL-0194 | Certification overview analytics compute total events, correct events, active sorters, error rate, and total accuracy from stored sort events. | `Label-Training-Certification/js/analytics.js` | source-verified | manuscript/training analytics docs | Reducer refactor | Add analytics reducer tests |
| CL-0195 | Certification worst-belt and worst-sorter callouts use minimum sample thresholds of five belt events and ten sorter attempts respectively. | `Label-Training-Certification/js/analytics.js` | source-verified | manuscript/training analytics docs | Threshold drift | Add threshold fixture |
| CL-0196 | Certification sorter-of-week filters to the last seven days, requires at least twenty attempts, ranks by accuracy then total attempts, and computes improvement by comparing first and last halves when each half has at least five events. | `Label-Training-Certification/js/analytics.js` | source-verified | manuscript/training analytics docs | Leaderboard policy drift | Add sorter-of-week fixture |
| CL-0197 | Certification sorter sessions are chunks of fifteen ordered events, not necessarily calendar-day sessions. | `Label-Training-Certification/js/analytics.js` | source-verified | manuscript/training analytics docs | Session size drift | Add session chunk test |
| CL-0198 | Certification heatmap data aggregates the last thirty days by JavaScript day-of-week and hour, storing total events and errors per cell. | `Label-Training-Certification/js/analytics.js` | source-verified | manuscript/training analytics docs | Time-zone/display drift | Add heatmap fixture |
| CL-0199 | Route truth rows are parsed from `ZIP|SLIC|BAY|BELT_INDEX|STATE|CITY` into entries with ZIP, SLIC, bay, belts array, state, and city. | `Label-Training-Certification/js/quiz.js`; `Label-Training-Certification/tests/test_truth_routing.py` | source-verified | manuscript/routing docs | Truth-table format drift | Parser fixture |
| CL-0200 | The label-training storage layer separates truth table rows, overlay routing, sort events, audit logs, supervisor roles, flags, handles, and sorter roster into distinct IndexedDB object stores. | `Label-Training-Certification/js/storage.js` | source-verified | manuscript/routing/storage docs | IDB schema drift | Storage schema fixture |
| CL-0201 | Training flags follow a lifecycle beginning at pending and can be approved, dismissed, or escalated/admin-handled before truth updates occur. | `Label-Training-Certification/js/storage.js` | source-verified | manuscript/routing/storage docs | Flag workflow drift | Flag lifecycle test |
| CL-0202 | The pre-sort DOP planning formulas separate total paid hours from projected building volume over adjusted building PPH and per-belt loaders from belt volume over belt load PPH over target paid day. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/pre-sort docs | DOP formula drift | Add DOP formula fixture |
| CL-0203 | The tracker projection metadata states belt volume is derived from building-volume DOW band times PD fraction times canonical SCANTRACK belt share, and paid-hour targets are volume divided by plan PPH. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/pre-sort docs | Projection metadata drift | Projection metadata test |
| CL-0204 | The tracker's percentile helper linearly interpolates between sorted observations using `(p/100)*(n-1)`. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/statistics docs | Helper refactor | Add percentile unit test |
| CL-0205 | Live belt pace compares scanned net volume against projection p25 and p75, labeling below p25 as BEHIND, above p75 as AHEAD, and otherwise ON TRACK. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/statistics/tracker docs | Pace threshold drift | Add pace-band fixture |
| CL-0206 | The tracker Wilson interval uses z = 1.96 and ranks employees by Wilson lower bound after converting observed PPH to a clipped pseudo-proportion and scan hours to pseudo sample size. | `Live-Sort/tracker_v6.3-codex.html` | source-derived caveat | manuscript/statistics docs | Pseudo-binomial interpretation risk | Add Wilson ranking fixture and caveat |
| CL-0207 | The PERT completion estimator uses `(p10 + 4*p50 + p90) / 6` for expected phase PPH and falls back to a linear completion estimate when historical phase support is insufficient. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/statistics/forecast docs | Forecast method drift | Add completion estimator fixture |
| CL-0208 | The live analog forecast distance is a weighted normalized absolute-distance average over live-state features, with DOW and sort mismatches adding distance penalties. | `Operations/adapters/live_analog_forecast.py` | source-verified | manuscript/statistics/forecast docs | Feature weight drift | Add distance fixture |
| CL-0209 | The live analog forecast blocks when matched analog count is below the minimum, when paid-hour source is missing, or when final-only simulation rows lack trajectory intervals. | `Operations/adapters/live_analog_forecast.py`; `Operations/tests/test_live_analog_forecast.py` | source-verified | manuscript/statistics/forecast docs | Gate drift | Live analog tests |
| CL-0210 | Simulation validation recomputes `kappa_912_pd`, `kappa_912`, and `rho_pd_hub` from raw PD and total-volume columns and checks the multiplicative identity against stored simulation fields. | `Operations/adapters/simulation_validation_capsule.py`; `Operations/tests/test_simulation_validation_capsule.py` | source-verified | manuscript/simulation/math docs | Sim schema drift | Simulation invariant tests |
| CL-0211 | The quiz sampler uses weighted sampling over regular state mass and average-state-equivalent buckets for MULTIDEST, exceptions, and air rather than uniform sampling over raw ZIP rows. | `Label-Training-Certification/js/quiz.js` | source-verified | manuscript/sampling docs | Sampler policy drift | Sampler distribution fixture |
| CL-0212 | The manuscript treats quiz accuracy under curriculum weighting as a training-performance measure, not as an unbiased estimate of raw ZIP-distribution live accuracy. | `Label-Training-Certification/js/quiz.js`; `Label-Training-Certification/js/analytics.js`; Chapter 30 | source-derived caveat | manuscript/sampling docs | Overclaim in prose | Rerun claim pass for training chapters |
| CL-0213 | Label-training correctness is equality for single-belt labels and set membership for multi-valid labels such as MULTIDEST. | `Label-Training-Certification/js/quiz.js`; `Label-Training-Certification/js/config.js` | source-verified | manuscript/training docs | Scoring refactor | Add direct multi-valid scoring fixture |
| CL-0214 | Stored quiz events record the first expected belt, actual belt, correctness, and `multi_valid`, but do not store the full accepted belt set. | `Label-Training-Certification/js/quiz.js`; `Label-Training-Certification/js/storage.js` | source-verified open issue | manuscript/training analytics docs | Analytics may need full accepted set | Consider `expected_belts` event schema |
| CL-0215 | Certification analytics are descriptive over stored quiz events and should not be written as causal evidence of floor-performance improvement without a separate validation design. | `Label-Training-Certification/js/analytics.js`; Chapter 7 | source-derived caveat | manuscript/training docs | Overstated certification claims | Add validation-study gap note |
| CL-0216 | `shannonEntropy(counts)` computes normalized Shannon entropy over positive package-count shares and returns zero when total count or maximum entropy is zero. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/statistics docs | Helper refactor | Add entropy unit fixture |
| CL-0217 | `computeZoneEntropy()` groups employee package counts by Intel zone, excludes ignored scanner IDs and `SLS`/`ASX`/`SS` prefixes, and flags concentration risk at `H_norm < 0.40` with at least three employees. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/tracker/statistics docs | Exclusion policy drift | Add zone entropy fixture |
| CL-0218 | Live analog `belt_imbalance` is `max(positive belt volume) / average(positive belt volume) - 1`. | `Operations/adapters/live_analog_forecast.py` | source-verified | manuscript/statistics/forecast docs | Feature refactor | Add imbalance fixture |
| CL-0219 | Live analog `zone_imbalance` is the largest zone share minus the smallest zone share over PD-01..PD-12 grouped into three zones. | `Operations/adapters/live_analog_forecast.py` | source-verified | manuscript/statistics/forecast docs | Zone map drift | Add zone imbalance fixture |
| CL-0220 | `computeSortQueueState()` computes `rho_q = inductionRate / (currentStaffing * currentPPH)` and classifies clearing, balanced, building, and critical at thresholds 0.60, 0.85, and 1.00. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/statistics/tracker docs | Threshold drift | Add queue-state threshold fixture |
| CL-0221 | Queue backlog minutes are estimated as `remainingVol / (inductionRate - capacity) * 60` only when `rho_q > 1`, remaining volume exists, and net growth is positive. | `Live-Sort/tracker_v6.3-codex.html` | source-verified | manuscript/statistics/tracker docs | Unit mix-up | Add backlog unit fixture |
| CL-0222 | The tracker queue-state function is used as a utilization diagnostic; the manuscript should not claim that formal M/M/c assumptions have been validated for the physical hub. | `Live-Sort/tracker_v6.3-codex.html`; Chapter 32 | source-derived caveat | manuscript/statistics docs | Overstated queue theory | Add math-pass check |
| CL-0223 | The live analog forecast live-state vector includes elapsed sort fraction, cumulative volume fraction, current adjusted building PPH, 30-minute PPH slope, paid hours burned, active loader count, belt imbalance, and zone imbalance. | `Operations/adapters/live_analog_forecast.py` | source-verified | manuscript/statistics/forecast docs | Feature list drift | Keep feature contract test |
| CL-0224 | Live analog distance is a weighted normalized absolute-distance average over matched numeric features, with day-of-week and sort mismatches adding penalties of 1.0 each. | `Operations/adapters/live_analog_forecast.py` | source-verified | manuscript/statistics/forecast docs | Distance policy drift | Add distance formula fixture |
| CL-0225 | Live analog family selection chooses the family with the smallest median distance, tie-broken by smallest distance, then sorts matches by distance. | `Operations/adapters/live_analog_forecast.py` | source-verified | manuscript/statistics/forecast docs | Family policy drift | Add family-selection fixture |
| CL-0226 | Live analog forecasts collapse matched final outcomes by median and always block the claim `causal staffing explanation`. | `Operations/adapters/live_analog_forecast.py`; `Operations/tests/test_live_analog_forecast.py` | source-verified | manuscript/forecast docs | Causal language drift | Keep blocked-claim regression |
| CL-0227 | Live analog forecast validation blocks final-only rows lacking trajectory intervals, outside-support live states, insufficient matches, and missing paid-hour source. | `Operations/adapters/live_analog_forecast.py`; `Operations/tests/test_live_analog_forecast.py` | source-verified | manuscript/forecast docs | Gate drift | Keep live analog validation tests |
| CL-0228 | The operator payload exposes live analog forecast quantities only when the capsule validation gate passes; otherwise it returns blocked status and hides forecast quantities. | `Operations/adapters/tracker_operator_payload.py`; `Operations/tests/test_tracker_operator_payload.py` | source-verified | manuscript/operator payload docs | Gate bypass | Keep operator payload readiness test |
| CL-0229 | Chapter 56 now records test gaps for entropy, queue state, analog distance, and full accepted-belt-set handling in MULTIDEST events. | `manuscript-v9.9.md`; current test inventory | source-derived caveat | manuscript/testing docs | Future tests may close gaps | Re-audit tests before final `manuscript.md` |
| CL-0230 | Chapter 58 now identifies diagrams for entropy concentration, queue utilization thresholds, belt/zone imbalance, and analog feature vectors. | `manuscript-v9.9.md` | source-derived caveat | manuscript/figure plan | Figure plan may change | Build figure drafts after structure pass |
| CL-0231 | Chapter 59 now separates queue notation (`lambda_q`, `mu_q`, `c_q`, `rho_q`) from DOP cost notation and ADMM dual notation. | `manuscript-v9.9.md` | source-derived caveat | manuscript/math docs | Symbol drift | Run notation pass |
| CL-0232 | Appendix D now treats all chapters as drafted and shifts the next work queue toward structure, claim, math, logic, figure, test-gap, and humanization passes. | `manuscript-v9.9.md` | source-derived caveat | manuscript/editorial docs | Completion assessment may be recalibrated | Keep cursor synced with plan |
| CL-0233 | The first structure pass over Parts I-III establishes the opening arc: operation, measurement discipline, source atlas, denominators, route truth, training generator, multi-label MULTIDEST, and certification analytics. | `manuscript-v9.9.md`; Chapters 1-10; Chapter 57 | source-derived caveat | manuscript/editorial docs | Later structure passes may reorder chapters | Recheck during full structure pass |
| CL-0234 | Part III now explicitly distinguishes training accuracy over quiz events from dashboard metrics over package, load, scan, cube, and labor-hour denominators. | `manuscript-v9.9.md`; Chapters 7-10 | source-derived caveat | manuscript/training docs | Denominator language may still repeat | Review during full structure pass |
| CL-0235 | The route-truth chapter now hands off to training by separating route truth from curriculum truth and by treating flags as review items rather than automatic truth updates. | `manuscript-v9.9.md`; `Label-Training-Certification/js/storage.js` | source-derived caveat | manuscript/routing docs | Flag lifecycle may change | Add flag lifecycle fixture |
| CL-0236 | Chapter 57 now records a structure-pass register so future passes can track which manuscript arcs have already been reviewed. | `manuscript-v9.9.md`; Chapter 57 | source-derived caveat | manuscript/editorial docs | Register may need a table format later | Convert register to table during final structure pass if useful |
| CL-0237 | The second structure pass over Parts IV-VIII establishes the middle arc: pre-sort file evidence, live snapshot measurement, planning and staffing formulas, statistical vocabulary, and simulation validation. | `manuscript-v9.9.md`; Chapters 11-37; Chapter 57 | source-derived caveat | manuscript/editorial docs | Later structure passes may still reorder the middle arc | Recheck during final structure pass |
| CL-0238 | The manuscript now gives DOP, staffing, constants, and borrow-loan chapters an explicit Part VI, separating planning formulas from live tracker methods. | `manuscript-v9.9.md`; Chapters 24-27 | source-derived caveat | manuscript/editorial docs | Part numbering may change if final book sections are retitled | Verify ToC during final structure pass |
| CL-0239 | Part IV frames the pre-sort dashboard as sort-level measurement architecture over SPR, CURE, SCANTRACK, SVQ, LIB, misload, and employee sources rather than quiz-event analytics. | `manuscript-v9.9.md`; `Pre-Sort/presort-dashboard/hii-dashboard-v3.0.html` | source-derived caveat | manuscript/dashboard docs | Bridge language may need tightening after claim pass | Re-read dashboard chapters during humanization |
| CL-0240 | Part V frames the live tracker as repeated snapshot measurement from Hub, Employee, and SPR files, with Intel as the decision-first surface and advanced panels as supporting diagnostics. | `manuscript-v9.9.md`; `Live-Sort/tracker_v6.3-codex.html`; `Operations/adapters/tracker_operator_payload.py` | source-derived caveat | manuscript/tracker docs | UI head may move beyond v6.3-codex | Refresh source citation before final |
| CL-0241 | Part VII frames the statistical-foundation chapters as project math vocabulary extracted from dashboard, tracker, planning, and simulation methods rather than as unsupported new operator metrics. | `manuscript-v9.9.md`; Chapters 28-33 | source-derived caveat | manuscript/statistics docs | Math pass may revise notation or chapter order | Run notation and math-pass checks |
| CL-0242 | Part VIII frames simulation as controlled evidence for method behavior, not evidence for real-sort operator facts such as live PPH, causal staffing, scanner attribution, or carryover risk. | `manuscript-v9.9.md`; `Operations/adapters/simulation_validation_capsule.py`; `Operations/adapters/tracker_operator_payload.py` | source-derived caveat | manuscript/simulation docs | Boundary could drift if payload policy changes | Keep payload blocked-list tests current |
| CL-0243 | Appendix D shifted the work queue toward the Parts IX-XIII structure pass after the middle-arc pass. | `manuscript-v9.9.md`; Appendix D | source-derived caveat | manuscript/editorial docs | Completion assessment may be recalibrated | Keep plan cursor synced |
| CL-0244 | Part IX now frames the memory layer as structured graph, durable memory, corpus references, semantic retrieval, constrained RAG, and start-session context loading. | `manuscript-v9.9.md`; Chapters 38-43; `~/Desktop/Twilight 050426/ai_memory/knowledge_graph.py`; `~/Desktop/Twilight 050426/ai_memory/memory_db.py` | source-derived caveat | manuscript/ai_memory docs | Memory architecture may change after cache or KG refactor | Recheck source anchors before final |
| CL-0245 | Part IX now closes by treating the start ritual as the handoff from preserved memory to active research context. | `manuscript-v9.9.md`; Chapter 43; `~/Desktop/Twilight 050426/ai_memory/start-ritual.py`; `~/Desktop/Twilight 050426/ai_memory/briefing_scorer.py` | source-derived caveat | manuscript/ai_memory docs | Start ritual behavior may drift with skill updates | Keep skill pointer audited |
| CL-0246 | Part X now frames autoresearch as governed research scheduling over memory and branch state rather than as an autonomous truth source. | `manuscript-v9.9.md`; Chapters 44-49; `~/Desktop/Twilight 050426/ai_memory/research_loop.py` | source-derived caveat | manuscript/autoresearch docs | Loop configuration or provider may change | Refresh runtime constants before final |
| CL-0247 | Part X now makes MCTS, reward, ADMM, and postmortem formalization one research-engine loop: select effort, score output, reconcile disputes, and persist durable outcomes. | `manuscript-v9.9.md`; Chapters 44-49; `mcts_utils.py`; `admm_utils.py`; `research_loop.py`; `memory_db.py` | source-derived caveat | manuscript/autoresearch docs | Future deep-tree MCTS could change the loop shape | Update if MCTS state model changes |
| CL-0248 | Part XI now carries the strongest operator-ready, analyst-detail, and blocked boundary so surrounding chapters can refer back to it without repeating the full safety argument. | `manuscript-v9.9.md`; Chapters 50-52; `Operations/adapters/tracker_operator_payload.py` | source-derived caveat | manuscript/operator payload docs | Payload schema or UI surfaces may change | Keep payload contract tests current |
| CL-0249 | Part XII now frames browser stack, parser/adapter design, persistence, reproducibility, and tests as the implementation layer that makes manuscript claims auditable. | `manuscript-v9.9.md`; Chapters 53-56 | source-derived caveat | manuscript/programming docs | Test inventory may drift | Re-audit tests in final quality gate |
| CL-0250 | Part XIII now frames narrative spine, figures, notation, and claim ledger as book-quality controls rather than extra appendices. | `manuscript-v9.9.md`; Chapters 57-60 | source-derived caveat | manuscript/editorial docs | Final book order may change | Run final structure and read-aloud passes |
| CL-0251 | Chapter 57 now records the third structure pass over Parts IX-XIII with the late arc: structured memory, constrained retrieval, governed research scheduling, payload promotion gates, reproducible architecture, and book-quality controls. | `manuscript-v9.9.md`; Chapter 57 | source-derived caveat | manuscript/editorial docs | Register may need compression before publication | Rework during humanization pass |
| CL-0252 | The active manuscript has been promoted from `manuscript-v9.9.md` to `manuscript.md` only after the final structure, claim, math, logic, humanize, and stale-reference gates were run. | `manuscript.md`; Appendix D; AGENTS manuscript workflow | source-derived caveat | manuscript/editorial docs | Future project changes can make a completed claim stale | Re-open the manuscript program if source drift changes claims |
| CL-0253 | Appendix D now records the final gate as completed and preserves a maintenance queue for future editions rather than an unfinished completion queue. | `manuscript.md`; Appendix D | source-derived caveat | manuscript/editorial docs | Maintenance needs may be mistaken for incompletion | Separate future-edition work from v1 completion state |
| CL-0254 | Scan volume legitimately exceeded reported volume on 3 of 30 audited production sorts; `scanned <= reported` is not an invariant, and an early pass that "corrected" violating rows was itself a backtracked analysis error. | `synth-hub-generator/calibration/calibration.json` (`anomaly_rates`); reconciliation-packet trap provenance (T4) | source-verified | manuscript/dashboard/math docs | Rate may drift across corpus eras | Re-audit scan-vs-reported on a newer corpus window |
| CL-0255 | SPR Work Area Types area rows put Zone 3 at roughly 25% of PD volume — a third zone-share basis below both SVQ (~0.38) and SCANTRACK (~0.31-0.33) — and the synthetic emitters bridge it with an explicit rescale to the contract kappa(DOW). | `synth-hub-generator/calibration/calibration.json` (`dirichlet_alpha`); `synth-hub-generator/emit_xlsx.py` basis translation; `synth-hub-generator/audits/ngate_fidelity_capsule_2026-07-09.md` (gate G5) | source-verified | manuscript/constants docs | Basis conflation in future analyses | Add a basis-translation conformance test |
| CL-0256 | The NORTHGATE generator's replay bundle is ingested by the unmodified production ingestion adapter and passes 7/7 structural gates, including a synthetic adjusted-building-PPH overlap on the accepted basis; this validates pipeline mechanics, not real operator calibration. | `synth-hub-generator/audits/ngate_fidelity_capsule_2026-07-09.md`; `Operations/adapters/live_sort_ingestion.py` | source-verified | manuscript/simulation docs | Synthetic overlap misread as calibration evidence | Keep the capsule's claim-boundary labels |
| CL-0257 | openpyxl stamps `dcterms:modified` at save time, so same-second double-emit determinism tests cannot detect the nondeterminism; cross-time artifact-level byte pins can, and the workbook emitter now re-pins core-properties dates at save. | `synth-hub-generator/emit_xlsx.py` (`_save_deterministic`); packet regeneration tests | source-verified | manuscript/testing docs | Library behavior change | Keep cross-time byte-pin tests on every emitter |
| CL-0258 | The published calibration is noised aggregates only from the steady-state era (160 usable sorts; 30 with SPR planning detail): means, deviations, Dirichlet alphas, correlations, and band edges are perturbed, identifiers are fictional by construction, and anomaly rates are never corpus-fit. | `synth-hub-generator/README.md`; `synth-hub-generator/calibration/calibration_report.md`; `calibration.json` `_noise` block | source-verified | manuscript/simulation docs | Noise method drift | Keep the `_noise` block and fit report in sync with the builder |
| CL-0259 | The tracker workspace head has advanced to `tracker_v6.4-codex.html` with profile embedding and `calc_core.js` extraction; manuscript tracker citations reference the v6.3-codex-era layout pending a citation refresh. | `Live-Sort/tracker_v6.4-codex.html`; `Live-Sort/calc_core.js` | source-verified open issue | manuscript/editorial docs | Function-location drift in citations | Run the citation-refresh pass against the v6.4 head |

## Appendix A. Method Dossier Template

Status: final

Use this template for each algorithm, metric, model, parser, or validation gate. A method dossier is not a polished chapter. It is the source-backed capture record that prevents later prose from losing denominators, code paths, tests, and claim limits.

```text
Method name:
Project location:
Operational question:
Inputs:
Outputs:
Formula or algorithm:
First-principles explanation:
Implementation notes:
Validation status:
Known limitations:
Blocked claims:
Related methods:
Figures needed:
Tests needed:
```

Field rules:

- `Method name` should use the local project term, not a generic academic name.
- `Project location` should include source files and tests.
- `Operational question` should be one sentence.
- `Inputs` must name files, fields, and units.
- `Outputs` must name the allowed surface.
- `Formula or algorithm` should be exact enough to reproduce.
- `Validation status` should use the claim-ledger vocabulary.
- `Blocked claims` should be explicit. If nothing is blocked, say why.
- `Tests needed` should remain present until coverage exists.

Example shell:

```text
Method name: Live analog forecast
Project location: Operations/adapters/live_analog_forecast.py; Operations/tests/test_live_analog_forecast.py
Operational question: Which historical or simulated trajectory family is close enough to the current live state to summarize a final-state forecast?
Inputs: live state fields; trajectory intervals; final trajectory summaries
Outputs: forecast capsule, operator payload summary only if gate passes
Formula or algorithm: distance over normalized live-state features, minimum match gate, blocked if outside support
Validation status: source-verified for test behavior; operator-ready only through payload gate
Known limitations: cannot explain causality of staffing changes
Blocked claims: causal staffing explanation
Related methods: simulation validation capsule; operator payload gate
Figures needed: nearest-trajectory diagram
Tests needed: end-to-end fixture with real live and generated trajectory corpus
```

## Appendix B. Chapter Capture Template

Status: final

Use this template when turning a ToC entry into prose. It is meant to keep each chapter grounded before style editing begins.

```text
Chapter:
Status:
One-sentence purpose:
Reader prerequisites:
Operational story:
Mathematical foundation:
Project implementation:
Source files:
Evidence ledger entries:
Open questions:
Figures:
Exercises or worked examples:
```

Capture sequence:

1. Write the one-sentence purpose before drafting prose.
2. List the source files before making technical claims.
3. Write the denominator and unit notes before formulas.
4. Add claim-ledger rows for formal claims.
5. Label open questions instead of smoothing them over.
6. Only then polish the chapter.

Chapter statuses:

| Status | Meaning |
| --- | --- |
| `seed` | Purpose and topics exist, but prose is not source-backed yet. |
| `outline` | Structure exists, but source-backed prose is incomplete. |
| `draft` | Local source basis has been checked and prose can be reviewed. |
| `reviewed` | Claim, math, logic, and style passes have been run. |
| `final` | Ready for the completed `manuscript.md`. |

## Appendix C. Research Gap Template

Status: final

Use this template to track unresolved manuscript and project questions. Gaps should be narrow enough that a future session can close or reclassify them.

```text
Gap ID:
Question:
Why it matters:
Current best answer:
Evidence available:
Evidence missing:
Blocked by:
Target chapter:
Target project area:
Next action:
```

Gap types:

| Type | Meaning | Example |
| --- | --- | --- |
| `source gap` | A needed file, fixture, or audit is missing or stale. | Dashboard parser lacks a fixture for a newly added source field. |
| `math gap` | Formula, units, or denominator need verification. | A forecast hour denominator might be scan hours or paid hours. |
| `claim gap` | A prose claim lacks a ledger row or allowed surface. | A simulation result is written as an operator conclusion. |
| `test gap` | Behavior exists but is not regression-tested. | MCTS discard cycles are not tested for backpropagation policy. |
| `figure gap` | A diagram is needed to explain a boundary or algorithm. | ADMM residual and dual-update diagram. |
| `humanization gap` | Prose is technically correct but stiff or generic. | A chapter repeats "this project" without narrative specificity. |

Gap resolution should end with one of three outcomes:

- closed with source evidence,
- downgraded to hypothesis/open issue,
- or removed because it was not a real claim.

## Appendix D. Completion and Maintenance Queue

Status: final

The initial queue is complete for `manuscript.md`. Keep this appendix as the maintenance queue for future editions, not as evidence that the current artifact is unfinished.

Completed in this manuscript:

- Chapters 1-60 now have final v1 prose and local source basis where technical claims are made.
- Chapter 8: quiz generation and MULTIDEST weighting.
- Chapter 7: training problem and curriculum-vs-live-distribution boundary.
- Chapter 47: MCTS project-context explainer.
- Operator payload claim ledger entries.
- Chapter 59: first notation and glossary pass.
- Dashboard snapshot construction chapter.
- Simulation validation chapters.
- Knowledge graph, memory, RAG, SPECTER2/Chroma, start ritual, autoresearch, ADMM, and payload chapters.
- Chapters 31-33: entropy, queueing, and analog forecasting foundations.
- Appendix D: active queue shifted from seed-chapter drafting to full-manuscript review passes.
- First structure pass over Parts I-III: added part-level bridges, clarified chapter roles, and made the training-to-dashboard handoff explicit.
- Second structure pass over Parts IV-VIII: added middle-arc bridges, inserted explicit Part VI for planning/staffing/constants, and clarified the dashboard-to-tracker-to-planning-to-statistics-to-simulation flow.
- Third structure pass over Parts IX-XIII: added late-arc bridges for memory, retrieval, autoresearch, payload gates, architecture, and book-quality controls.
- Manuscript version advanced from `manuscript-v9.9.md` to `manuscript.md` after the final quality gate.
- 2026-07-10 editorial pass: pilot-hub publication masking (hub token, hub SLIC, the MULTIDEST alias, and cased-surname heading collisions) and claim re-verification against the synthetic-generator findings (CL-0254 through CL-0259).

Future edition work:

1. Re-run the claim pass whenever source files, constants, payload schemas, or tracker versions change.
2. Re-run the math pass when queue, analog, MCTS, ADMM, or simulation formulas are revised.
3. Build publication figures from Chapter 58 before producing a print/PDF edition.
4. Add worked examples for MULTIDEST scoring, DOP paid-hour calculation, queue-state utilization, analog distance, MCTS UCB1, and ADMM dual updates.
5. Add direct regression tests for remaining research-engine gaps: RAG, SPECTER2/Chroma, MCTS, autoresearch, ADMM, entropy, queue state, analog distance, and multi-valid MULTIDEST event storage.
6. Humanize any new section with the archived humanize skill before merging it into the manuscript.
7. Refresh tracker citations against the v6.4-codex head and `calc_core.js` layout (CL-0259).

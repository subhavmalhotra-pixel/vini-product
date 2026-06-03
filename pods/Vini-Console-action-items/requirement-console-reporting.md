# Requirement: Vini Console — Reporting (V1)

**Author:** Subhav
**Product:** Vini
**Pod / Team:** Vini Product Team
**Date:** 03 Jun 2026
**Status:** One-pager · v1 · ships into the live `/reporting` prototype at `frontend-silk-chi-46.vercel.app/reporting`
**Companion:** [signal](./signal-console-reporting.md) · [JTBD question set](./reporting-questions-console-action-items.md)

---

## Problem

A GM at a Vini-deployed rooftop cannot answer *"is Vini working?"* from inside the console. The BDC Manager spends ~3 hrs/week rebuilding the answer in Excel. The Service Manager has no surface for recall SLA / opcode-match-miss / transfer-success. Only the Inbound Agent (Mia) has a console dashboard, and it ships solution-fit-check, not JTBD-driven.

**The Gulf of Evaluation is too wide.** Managers see data move through the system (action items get created, conversations get tagged, appointments get booked) but cannot evaluate the outcome — *did Vini actually work this week?*

---

## Solution (V1 · this requirement)

A single `/reporting` page with **four persona tabs** — Agent · BDC Manager · Service Manager · GM — each surfacing that role's P0 metrics on one scrollable surface. Time-window filter at the top applies globally.

> *Already prototyped + deployed: [`/reporting`](https://frontend-silk-chi-46.vercel.app/reporting). This requirement formalises what's there + what wires up next.*

### Personas served + P0 metric count per persona

| Persona | P0 metrics surfaced | Source of questions |
|---|:---:|---|
| Agent (Mia / role inbound) | 8 | Current dashboard's JTBD reframe |
| BDC Manager | 9 | 01 Jun grooming transcript + ICP Anya |
| Service Manager | 6 | Service-bay throughput + recall handling |
| GM / Dealer Principal | 9 | Renewal narrative + headcount efficiency |
| **Total** | **32** | Reporting-questions JTBD doc · §1–§4 |

### What ships in V1

| # | Capability | Already in prototype? |
|:--:|---|:---:|
| 1 | Persona tabs (4) with full P0 metric layouts | ✅ |
| 2 | Global time-window filter (Today · Yesterday · 7d · 30d) | ✅ UI · ⚠️ wiring |
| 3 | Hand-built widget primitives (KPI · funnel · stacked · heatmap · donut · gauge · leaderboard) | ✅ |
| 4 | Mock data anchored to one rooftop's snapshot (MB Laguna Niguel · matches Mia screenshot) | ✅ |
| 5 | Switchover from mock data → live aggregation behind a feature flag | ❌ V1 build |
| 6 | URL params per persona tab (shareable views) | ❌ V1 build |
| 7 | Sub-nav active state when on `/reporting` | ✅ |

---

## Design principles (Norman · Hook loop · UX heuristics)

This is the framework that drove the V1 layout decisions.

### Norman's Two Gulfs

| Gulf | How V1 narrows it |
|---|---|
| **Execution** *(what do I do?)* | Persona tabs are the only top-level affordance. One H1 question per page: *"What needs my attention this period?"* — mirrors the Action Items page's H1 so users recognise the system pattern. |
| **Evaluation** *(what happened?)* | Every numeric value carries a delta arrow + target line + sparkline. No raw number anywhere. Stage-by-stage funnel drop-offs are coloured + counted. Threshold lines on bar charts (median · acceptable ceiling · eval-loop trigger). |

### The Seven Stages of Action — applied to "did Vini work this week?"

```
1. GOAL      → "Verify Vini's impact this week"          [BDC Manager intent]
2. PLAN      → "Open the reporting page"                 [supported by sub-nav]
3. SPECIFY   → "Switch to my role's tab"                 [supported by persona tabs]
4. PERFORM   → (clicks the BDC Manager tab)              [direct manipulation]
─── Gulf of Execution narrows ───
5. PERCEIVE  → (sees 4 KPI cards + workload + queue)    [4-card hero strip]
6. INTERPRET → "Open queue 35 (target < 50)"            [target on every metric]
7. COMPARE   → "↓12% vs last week · improving"          [delta colour-coded]
─── Gulf of Evaluation narrows ───
```

### Hook loop framing (engagement habit, not vanity)

| Stage | Mechanism in V1 |
|---|---|
| **Trigger** | Morning standup (internal) · Weekly QBR (internal) · Daily Digest email CTA (external). |
| **Action** | Open `/reporting`, switch to persona tab, scan 4 hero KPIs. **5 seconds.** |
| **Variable reward** | Did my numbers improve? Did Vini outperform a rep? Are there coaching candidates? — every visit reveals different signal. |
| **Investment** | (V2) saved-view per role · scheduled email digest · annotation layer. V1 ships the surface; V2 lays the habit lattice on top. |

### UX heuristic compliance (Nielsen-flavoured)

- **Visibility of system status** — sparklines + deltas + targets on every number.
- **Match to real world** — funnel order = pipeline order (top → bottom). Time-of-day heatmap reads chronologically.
- **User control + freedom** — tab switch is one-click. Time window has 4 fixed presets (no arbitrary range → no analysis paralysis).
- **Consistency + standards** — H1 framing identical to Action Items page. Material Symbols Outlined throughout. Brand-purple `#1D4ED8` is the only primary accent.
- **Recognition over recall** — every chart has its own card header + one-line description so the user doesn't have to remember "what does this chart show?"

### Affordance + signifier inventory

| Element | Affordance | Signifier |
|---|---|---|
| Persona tab | Switches active view | Brand-purple underline + label + role sub-label |
| Time-window button | Filters the page | Segmented control, active state has brand-soft bg |
| KPI card | (Informational, not actionable in V1) | No hover lift → signals "info only, not interactive" |
| Funnel stage row | (Informational) | Tabular numerals + drop-off pill on stages 2-N |
| Threshold line on bar chart | Communicates target | Dashed bottom border + label |
| Pulse-dot on Past-SLA / Repeat-caller KPI cards | Communicates urgency | Animated CSS keyframe ring |
| Active nav item in sub-nav | Communicates current location | Brand-soft bg + brand-purple text + filled icon |

---

## Acceptance criteria (V1)

1. ✅ **Persona-tab navigation** — switching tabs renders the correct layout in < 100ms. URL doesn't change in V1 (V2: `?persona=bdc`).
2. ✅ **All 32 P0 questions** from the reporting-questions JTBD doc are represented by at least one widget.
3. ✅ **Every numeric value** carries either: a target · a delta · a sparkline. No bare numbers.
4. ✅ **No external chart library**. All widgets are inline SVG + CSS using the existing intelligent-console-design token set.
5. ⚠️ **Time-window filter** state syncs across the whole page — currently UI-only, needs to filter the underlying data when live-data path ships.
6. ❌ **Live-data switchover behind a feature flag** — V1 ships with mock data anchored to MB Laguna Niguel; flag flips on per-rooftop as event-aggregation pipeline catches up.
7. ✅ **Material Symbols Outlined** throughout. `tabular-nums` on every numeric column.
8. ✅ **`prefers-reduced-motion`** disables sparkline / pulse-dot animations.

---

## Out of scope for V1 (deferred to V2 or later)

| Deferred | Why | Where it lives |
|---|---|---|
| Saved views / per-user dashboard customisation | Adds state model that we don't need until adoption is proven | V2 |
| Scheduled email digest of the reporting view | Lives with the ROI Emailer pod, not here | ROI Emailer Phase 2 |
| Annotation / commentary on metrics | High-value but needs auth + permissions | V3 |
| Cross-rooftop benchmark fully wired | Currently a Phase-2 preview table; needs `rooftop_group_id` on every event | Action Items pod §8.2.B.2 |
| Free-text NLQ on the reporting data | Tease-only via the Action Items "Ask your queue" panel; full Q&A is a separate AI pod | Separate pod |
| Sentiment scoring | Top instrumentation gap per reporting-questions data-availability matrix | V2 instrumentation track |
| DMS appointment outcome ingestion (showed / no-show / RO / CSI) | Top instrumentation gap · unblocks 12+ questions | V2 instrumentation track |
| Recall-DB join (Recall Masters) | Unblocks 4 safety-critical questions for Svc Mgr + GM | V2 instrumentation track |
| Per-dealer SLA / intent severity overrides | Shares scope with the Action Items Phase 2 routing-config | Action Items §8.2.A.1 |

---

## Data dependencies (what V1 reads · what V2 needs)

| Dependency | Status | Source |
|---|:---:|---|
| `action_item.*` events from Action Items pod (v3.1) | ✅ Shipped | Action Items PRD §10.2 |
| `conversation.transfer_outcome` field | ✅ Shipped v3.1 | Action Items PRD §10.2.2 |
| Aggregation views (rollup queries on top of events) | ❌ V1 build | New |
| Appointment outcomes from DMS | ❌ V2 | DMS integration · new instrumentation track |
| Conversation sentiment score | ❌ V2 | Spyne-built scorer · new |
| Recall-DB (Recall Masters) | ❌ V2 | Existing integration referenced in Action Items signal §6 |
| Marketing campaign → call join | ❌ V2 | Marketing pod · new |

---

## Success metrics (90 days post-V1)

| Metric | Target | How measured |
|---|:---:|---|
| **DAU on /reporting per BDC Manager** | ≥ 5 days/week | product analytics |
| **DAU on /reporting per GM** | ≥ 1 day/week | product analytics |
| **% of QBRs where Vini reporting is screen-shared** | ≥ 80% | CSM interview log |
| **Time-to-insight (manager opens page → answers "did Vini work?")** | < 30 sec | moderated usability + funnel timing |
| **% reduction in CSV-export usage** from Completed view | ≥ 60% | event count diff |
| **% reduction in BDC Manager "Excel time"** | ≥ 50% | manager-survey, biweekly |

---

## Open questions (close before V2 PRD)

1. **Tab vs. role-default** — does a BDC Manager land on the BDC tab automatically (role-aware) or do we let them tab freely? *Recommendation: role-aware default · last-used persisted in localStorage · same pattern as Action Items filter default.*
2. **Time-window persistence** — does the window selection persist across visits or reset to "30 days"? *Recommendation: persist per-user.*
3. **Drill-down depth** — does clicking a KPI card route to a deeper detail page or open a drawer? *Recommendation: drawer for V1 (no new IA), page for V2.*
4. **Mock-to-live data swap** — feature flag at rooftop level (all-or-nothing) or per-metric (gradual)? *Recommendation: per-metric — lets the BDC Mgr tab go live with the data we have today while Svc Mgr tab waits on DMS join.*
5. **Cross-pod ownership** — does the Action Items pod own `/reporting` or does it spin out as its own pod? *Recommendation: spin out · sibling pod with its own PRD · shares event substrate but separate code surface.*

---

## Decision log

- **03 Jun 2026** · Reporting workstream formalised as a one-page requirement after the JTBD question doc + the deployed `/reporting` prototype. This doc is the gate before the V2 reporting PRD.
- **TODO** · Validate persona-fit with 2 BDC Managers + 1 GM + 1 Service Manager at MB Laguna Niguel.
- **TODO** · Decide cross-pod ownership question (above) before V2 PRD kicks off.

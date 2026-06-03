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

## Question · Priority · Metric · Visual mapping

The build-spec table. Every row maps one persona-level question (from the [reporting-questions JTBD doc](./reporting-questions-console-action-items.md)) to its priority, its computed metric, and the canonical visual primitive that renders it. **All P0 rows ship in V1.** P1 rows ship in V2 once instrumentation lands.

Total: **53 questions · 32 P0 · 21 P1** · 11 widget primitives across all of them.

### 🤖 Agent performance (Mia · service inbound)

| # | Question | Priority | Metric | Visual |
|:--:|---|:--:|---|---|
| 1 | Total calls handled this period | **P0** | `COUNT(conversations WHERE agent=mia AND date IN window)` | KPI card · value · vs-target chip · WoW sparkline |
| 2 | Funnel · Calls → Interacted → Qualified → Booked → Showed | **P0** | Stage-to-stage % conversion + drop-off count | Funnel chart · 5 stages · hover drop-off |
| 3 | Call & intent flow routing | **P0** | Conversation routing across stages | Sankey diagram *(already live · keep)* |
| 4 | Vini fully handled vs routed to human | **P0** | `% conversations WHERE outcome IN {resolved_in_conversation}` vs `{transferred, hitl_*}` | Stacked horizontal bar · 2 segments · centre label |
| 5 | When did customers reach out (time of day · channel) | **P0** | `COUNT GROUP BY HOUR(started_at), channel` | Heatmap 24h × channel OR stacked bar by hour |
| 6 | Top intents on calls | **P0** | `COUNT GROUP BY primary_intent_id ORDER BY DESC LIMIT 10` | Horizontal bar top-10 · % of total |
| 7 | Top services requested but not booked | **P0** | Intent count − appointment count grouped by intent | Side-by-side bar (requested vs booked) per intent |
| 8 | Avg daily appointments · total vs Vini-booked | **P0** | `appointments / days` total + filtered by `created_by_user_id = vini_agent` | Dual-line chart OR stacked area |
| 9 | Customer sentiment per conversation | **P1** | `AVG(sentiment_score)` + distribution histogram | Donut for sentiment buckets + drilldown |
| 10 | Dropped calls · no-intent · abandonment | **P1** | `COUNT WHERE outcome IN {abandoned, no_intent}` | KPI card + small breakdown bar |
| 11 | Leads from channels where Vini is NOT deployed | **P1** | Appointments grouped by `source` where `source NOT IN vini_deployed_channels` | Pie/donut for channel mix highlighting non-Vini slice |

### 🧑‍💼 BDC Manager — Anya / Trevor

| # | Question | Priority | Metric | Visual |
|:--:|---|:--:|---|---|
| 12 | Open action items per rep right now | **P0** | `COUNT(action_items WHERE status=pending) GROUP BY assignee_user_id` | Horizontal bar per rep · sorted desc · median line overlay |
| 13 | Queue growing or draining week-over-week | **P0** | `created_count − closed_count` per day | Diverging bar (created vs closed) with net delta |
| 14 | SLA-burn distribution across the team | **P0** | Histogram of `slaBurnRatio` bucketed `<25 / 25-50 / 50-75 / 75-100 / past` | Stacked horizontal bar color-coded green→amber→red |
| 15 | Closure rate per rep this week vs last | **P0** | `closed / (closed + still_pending_assigned)` per rep, period-over-period | Grouped bar (this week, last week) + delta arrow |
| 16 | Median time-to-close by rep | **P0** | `MEDIAN(closed_at − assigned_at) GROUP BY closed_by_user_id` | Box plot OR horizontal bar with coaching threshold |
| 17 | Mark-as-incorrect rate by rep AND by intent | **P0** | `marked_incorrect_count / (closed + marked_incorrect) × 100` | Bar chart per rep · threshold 3% acceptable · 5% eval-loop trigger |
| 18 | Repeat-caller rate this week (3+ pings) | **P0** | `COUNT(DISTINCT customer_id WHERE repeat_caller_count ≥ 3)` | KPI card · sparkline · drill table |
| 19 | Vini handled vs routed (team-wide) | **P0** | Same as Agent #4, team-rollup | Stacked horizontal bar |
| 20 | Workload overload risk (items per rep > 2× team median) | **P0** | Workload index = `rep_open / team_median` | Same bar as #12 with overload threshold band shaded red |
| 21 | Peak hour staffing gap | **P1** | `call_volume_at_hour / staff_at_hour` heatmap | Heatmap hour × day-of-week (capacity utilisation) |
| 22 | Resolution-note quality per rep | **P1** | `AVG(LENGTH(resolution_note))` per rep + skipped-rate | Bar with note-skipped rate overlay OR sampled-review tag |
| 23 | Auto-escalation count today (Phase 2) | **P1** | `COUNT(action_item.nudged events)` | KPI card + sparkline |
| 24 | Negative sentiment rate per conversation | **P1** | `% conversations WHERE sentiment_score < threshold` | Sparkline with threshold line + drilldown |
| 25 | Customers auto-notified on closure (Phase 2) | **P1** | `COUNT(action_item.customer_notified) / COUNT(action_item.closed)` | KPI gauge |

### 🔧 Service Manager — Priya / Anya (service lens)

| # | Question | Priority | Metric | Visual |
|:--:|---|:--:|---|---|
| 26 | Service intent mix this week | **P0** | `COUNT GROUP BY intent_id WHERE dept=service` | Donut chart · max 5 slices |
| 27 | Service appointments · Vini-booked vs advisor-booked | **P0** | `COUNT(appointments) GROUP BY created_by_user_id IS vini` | Stacked bar over time (WoW) |
| 28 | Top services requested vs booked | **P0** | Intent count − appointment count per service intent | Side-by-side horizontal bar per service |
| 29 | Warm transfers initiated · succeeded vs failed | **P0** | `COUNT GROUP BY transfer_outcome` (none/warm/hard/failed) | Funnel (initiated → succeeded → outcome) OR stacked bar |
| 30 | Repeat-caller rate on `status_update` intents | **P0** | `COUNT WHERE intent=status_update AND repeat_caller_count ≥ 3` | KPI card + sparkline |
| 31 | Recall-response SLA compliance (2-hour ack) | **P0** | `% recall_response items closed within 2h` | Gauge / threshold ring |
| 32 | What % of service appointments showed up | **P1** | `% appointments WHERE status=shown` | KPI gauge + by-source breakdown bar |
| 33 | No-show rate by appointment source | **P1** | `% no_show GROUP BY appointment_source` | Grouped bar per source with red-zone band |
| 34 | After-hours service demand (7 PM – 7 AM) | **P1** | `COUNT WHERE hour BETWEEN [19, 7] GROUP BY hour` | Vertical bar by hour · after-hours zone shaded |
| 35 | Opcode-match miss (we offer but Vini routed away) | **P1** | Needs opcode-map taxonomy — Vini-service-objection-handling sister pod | Bar of detected mismatches per opcode (Phase 2) |
| 36 | Median advisor pickup time on transferred calls | **P1** | `MEDIAN(advisor_picked_up_at − transfer_initiated_at)` | Box plot per advisor OR sortable table |
| 37 | Recall-eligible customers flagged vs missed | **P1** | Join `Conversation.customer_id` with recall-DB | KPI card "flagged / total" + drilldown list |
| 38 | Top non-mechanical service requests (cross-dept transferred) | **P1** | Cross-dept transfer events grouped by request type | Horizontal bar (glass · upholstery · key fob etc.) |

### 🏢 GM / Dealer Principal — Edgar

| # | Question | Priority | Metric | Visual |
|:--:|---|:--:|---|---|
| 39 | Revenue attributable to Vini-booked appointments | **P0** | `SUM(revenue) WHERE source_action_item.created_by_user_id = vini_agent` | Big KPI · $ value · MoM delta · sparkline |
| 40 | % inbound calls → appointments | **P0** | `COUNT(appointments_booked) / COUNT(conversations) × 100` | KPI card with funnel preview |
| 41 | Vini handle rate (full resolution vs routed) | **P0** | Same as BDC Mgr #19 | Stacked horizontal bar (rooftop-wide) |
| 42 | Customer experience snapshot (3 signals) | **P0** | sentiment % · repeat-caller count · time-to-resolution median | 3-KPI strip with deltas |
| 43 | Headcount efficiency · calls per BDC FTE | **P0** | `total_calls / FTE_count` (FTE entered at onboarding) | KPI card · pre-Vini vs current bars |
| 44 | Calls captured after-hours / on weekends | **P0** | `COUNT(conversations WHERE hour NOT IN business_hours)` | Stacked area · in-hours vs after-hours over time |
| 45 | Funnel leakage · calls → qualified → appt → showed → close | **P0** | Same as Agent #2 rolled up + manual closures | Multi-stage funnel with leakage call-outs |
| 46 | DNC / TCPA compliance rate | **P0** | `COUNT(compliance violations) / COUNT(conversations) × 100` (target 0) | KPI card · red glow if > 0 · audit trail link |
| 47 | Cross-rooftop benchmark (Phase 2 group) | **P0*** | Per-rooftop rollup of #40 + #43 + #42 | Leaderboard table · sortable columns |
| 48 | Where in the funnel are we leaking · qualified-but-not-booked | **P1** | Drop-off count per stage | Sankey diagram exec-summary level |
| 49 | Marketing campaign drove the calls that booked | **P1** | Join `conversations.source_campaign` with appointment book rate | Stacked bar by campaign + conversion overlay |
| 50 | Cost per appointment by source | **P1** | `total_cost_per_source / appointments_per_source` | Bar chart with cost per source + benchmark line |
| 51 | Cross-department leakage · service customer with sales interest | **P1** | Customers with intents in both `service` and `sales` dept | Table with action — "cross-sell follow-up suggested" |
| 52 | Recall slipped past unflagged | **P1** | Same as Svc Mgr #37 rooftop-wide | KPI + audit drilldown |
| 53 | "Can I redeploy one FTE to higher-value work?" | **P1** | Narrative analysis combining #43 + #44 | Decision panel with recommendations · no chart |

\* *#47 is P0 only for the Phase 2 group-level PRD. Single-rooftop GMs see P0 #39–#46 in V1.*

---

## Widget primitive count (build economy)

Across all 53 questions, the 11 reusable widget primitives consolidate as:

| Widget primitive | # of questions it covers | Status |
|---|:---:|:---:|
| KpiCard (icon + 28px tabular + delta + target + sparkline) | 16 | ✅ live |
| HorizontalBar (with optional threshold) | 9 | ✅ live |
| ComparisonBar (side-by-side `Vini vs human` / `requested vs booked`) | 7 | ✅ live |
| StackedBar (segments + legend) | 7 | ✅ live |
| Funnel (cascading bars with drop-off) | 4 | ✅ live |
| Sparkline (inline SVG, embedded in KpiCard) | 5 | ✅ live |
| Heatmap (hour × day intensity grid) | 3 | ✅ live |
| Donut (max 5 slices · centre label) | 2 | ✅ live |
| Gauge (semi-circle threshold ring) | 2 | ✅ live |
| Sankey diagram (call/intent flow) | 2 | ⚠️ existing in agent dashboard · port to /reporting |
| LeaderboardTable | 7 | ✅ live |
| Custom one-offs (QueueDelta, HeadcountEfficiency) | 2 | ✅ live |

**Headline: every P0 primitive is already deployed in the live `/reporting` page.** The remaining V1 build work is wiring + data — not new widgets.

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

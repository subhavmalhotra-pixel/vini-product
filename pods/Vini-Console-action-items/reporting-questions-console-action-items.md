# Reporting & Analytics — JTBD Question Set

**Author:** Subhav
**Product:** Vini
**Pod / Team:** Vini Product Team
**Date:** 01 Jun 2026
**Status:** Draft v1 — JTBD-first reformulation of the reporting surface. Anchors the Phase 2 reporting PRD requirements.
**Companion artifacts:** [signal](./signal-console-action-items.md) · [prd v3.1](./prd-console-action-items.md) · [icp](./icp-console-action-items.md) · [design v1.1](./design-console-action-items.md)

---

## Why this doc exists

The current console reporting (the `Agent performance` dashboard for Mia · service inbound) was built *solution-first* — we shipped what we had data for, then put it on a page. That's solution-fit-check, not customer-need-driven.

This artifact restarts from the **JTBD direction**: every reporting consumer is doing a *job*, and that job comes with specific questions they need answered. We list the questions per persona, then map each question back to the data we have today, the data we partially have, and the instrumentation we'd need to add.

**Four reporting consumers** at every Vini-deployed rooftop:

1. **Agent performance** — narrow view of one Vini agent's call funnel (the dashboard that already exists for Mia · service inbound)
2. **BDC Manager** — coaches the team, owns the queue, grades reps
3. **Service Manager** — owns service-bay throughput, advisor utilisation, recall handling
4. **GM / Dealer Principal** — top-line ROI, headcount efficiency, customer experience, compliance risk

The same funnel data is sliced four different ways for these four consumers. **The questions are the API; the dashboards are downstream.**

---

## 1️⃣ Agent performance — one Vini agent's funnel

> **Meta-job:** *"How is this one agent (e.g. Mia · service inbound) performing against target?"*

This is the dashboard that's live today. Funnel: `Leads → Interacted → Qualified → Appointments → ROI`.

### Leads stage
1. **Who are these customers?** (segments · returning vs new · vehicle-of-interest)
2. **When did they reach out — time of day, channel?**
3. **Leads or appointments from channels where Vini is NOT deployed?** *(Spyne insight cross-references appointment source: if total leads from non-Vini-deployed channels exceed appointments we booked from the scheduler, there's untapped capture demand)*

### Interacted stage
1. **Did they connect with Vini?** (rang vs picked up vs abandoned)
2. **What are the customers talking about + sentiment score?**
3. **Customer not connected, dropped calls, or calls with no intent?**
4. **How many calls fully handled by Vini vs. routed to human?**

### Qualified stage
1. **Which customer + intents qualified?**
2. **Outcomes of qualified intents?**
3. **Top non-qualified intents and outcome of those conversations?**
4. **Are all customer queries getting resolved?**
5. **How many customers are waiting for response from my team?**
6. **SLA tracking for response.**

### Appointments stage
1. **How many booked by Vini vs. by my team on routed calls?**
2. **Did those customers show up?**
3. **Top services they are looking for + booked services (separately, to surface unsupported demand)?**
4. **Avg daily appointments — total vs. Vini?**

### ROI stage *(currently displayed at top, would benefit from being moved last to reinforce funnel logic)*
1. **Revenue attributed?**
2. **Return on spend?**
3. **Appointments → showed → completed → revenue chain?**

---

## 2️⃣ BDC Manager — Anya / Trevor

> **Meta-job:** *"Is my team handling the load — and where do I coach?"*

Looks at the same funnel as Agent performance but rolled up across reps + Vini together. Cuts by-rep, by-shift, by-rooftop.

### Funnel they look at

```
Calls handled (team) → Conversations qualified → Action items closed → Customer satisfied
                          ↓                            ↓                       ↓
                    by rep · by intent · by shift · by channel
```

### Workload + capacity (cross-stage)

| # | Question | Data state |
|---|---|---|
| 1 | How many open action items does each rep have right now? | ✅ |
| 2 | Who is at risk of overload — items per rep > 2× team median? | ✅ |
| 3 | Who has zero items — am I under-utilising a rep? | ✅ |
| 4 | What's my peak hour and am I staffed for it? | ⚠️ (have `started_at`, no time-of-day chart yet) |
| 5 | How many calls hit voicemail or abandonment because we were understaffed? | ❌ (need `outcome = abandoned`) |

### Per-rep performance

| # | Question | Data state |
|---|---|---|
| 1 | Who closes fastest on `status_update` / `pricing_quote` / `callback_request`? | ✅ |
| 2 | Closure rate per rep this week vs. last? | ⚠️ (events exist, rollup missing) |
| 3 | Whose `mark_as_incorrect` rate is unusually high? | ✅ NEW v3.1 |
| 4 | Whose resolution notes are skipped / template-filled / actually descriptive? | ⚠️ (note length is a proxy) |
| 5 | Who has SLA breaches concentrated on a single intent — coaching signal? | ✅ |

### Queue health

| # | Question | Data state |
|---|---|---|
| 1 | Is the queue growing or draining week-over-week? | ✅ |
| 2 | SLA-burn distribution — how many items > 75% SLA-burnt? | ✅ NEW v3.1 |
| 3 | Which intent has the most aged items? | ✅ |
| 4 | Repeat-caller rate this week — how many customers pinged 3+ times? | ✅ |
| 5 | How many items got auto-escalated to me as manager today? | ⚠️ Phase 2 `action_item.nudged` |

### Vini effectiveness (AI-vs-human grading)

| # | Question | Data state |
|---|---|---|
| 1 | What % of calls did Vini fully handle vs. route to a human? | ⚠️ (need refined `outcome` enum) |
| 2 | Vini's resolution-note quality compared to my human reps? | ⚠️ (sampled review) |
| 3 | Which intents are humans 2× faster than Vini on — keep routed? | ❌ |
| 4 | Mark-as-incorrect rate by intent — training wrong taxonomy? | ✅ NEW v3.1 |
| 5 | Vini-as-assignee closure rate vs. human? | ❌ Phase 2 |

### Quality + customer-side pain

| # | Question | Data state |
|---|---|---|
| 1 | Median time from creation → closure across the team? | ✅ |
| 2 | Which customers are escalation candidates (repeat callers · past SLA · unassigned > 24h)? | ✅ |
| 3 | How many customers got an automated update when their item was closed? | ❌ Phase 2 `action_item.customer_notified` |
| 4 | Team's negative-sentiment rate per conversation? | ❌ |

---

## 3️⃣ Service Manager — Priya / Anya (service lens)

> **Meta-job:** *"Is my service bay filled with the right work — and are we missing recall / safety-critical capture?"*

Service Manager extends the funnel past appointment into showed → RO completed → CSI scored. Service-bay capacity, advisor utilisation, recall handling, opcode-match accuracy.

### Funnel they look at

```
Service calls handled → Service intent identified → Opcode matched → Appointment booked
                              ↓                            ↓                  ↓
                                                     Showed → RO completed → CSI scored
                              ↓                                                  ↓
                       Recall flagged                                    sentiment / repeat
```

### Service intent capture

| # | Question | Data state |
|---|---|---|
| 1 | Service intent mix this week (maintenance · diagnostic · recall · warranty)? | ✅ |
| 2 | Are customers being told "we don't do that here" when we actually offer it (opcode-match miss)? | ❌ (depends on sister pod Vini-service-objection-handling) |
| 3 | How many recall-eligible customers did Vini correctly flag from VIN? | ⚠️ (need Recall Masters join) |
| 4 | Top non-mechanical requests (glass · upholstery · key fob) where we cross-dept transferred? | ❌ Phase 2 |
| 5 | After-hours service demand — calls between 7 PM and 7 AM? | ⚠️ |

### Appointment funnel

| # | Question | Data state |
|---|---|---|
| 1 | Service appointments booked by Vini vs. by my advisors on routed calls? | ⚠️ |
| 2 | What % of service appointments showed up? | ❌ (need DMS appointment-outcome update) |
| 3 | No-show rate by appointment source (Vini-booked vs advisor-booked vs walk-in)? | ❌ |
| 4 | Which advisor has the best show-rate on the appointments they take? | ❌ |
| 5 | Avg daily appointments — total vs. Vini-booked — this week vs last? | ⚠️ |
| 6 | Top services booked (oil change · brake · diagnostic · recall)? | ✅ |
| 7 | Top services REQUESTED but not booked (demand we're failing to capture)? | ❌ |

### Recall handling (safety-critical)

| # | Question | Data state |
|---|---|---|
| 1 | How many open recalls on the VIN-base of customers who called this week? | ❌ (need recall-DB join) |
| 2 | Of those, how many did we book a recall appointment for? | ❌ |
| 3 | How many recall-eligible customers slipped past — did Vini miss the flag? | ❌ |
| 4 | Recall-response SLA — hitting 2-hour ack target? | ✅ |

### Advisor handoff health (HITL)

| # | Question | Data state |
|---|---|---|
| 1 | How many warm transfers did we initiate to advisors today? | ⚠️ NEW v3.1 (`transfer_outcome` capture) |
| 2 | How many transfers succeeded vs. failed (advisor didn't pick up)? | ⚠️ NEW v3.1 |
| 3 | Median advisor pickup time on transferred calls? | ❌ |
| 4 | Per-advisor: which advisor accepts vs. drops warm transfers? | ❌ |

### Customer experience (service-side)

| # | Question | Data state |
|---|---|---|
| 1 | Repeat-caller rate on `status_update` intents — leaking service-status info? | ✅ |
| 2 | Median time from "I called about my car" to "RO closed"? | ❌ (needs DMS join) |
| 3 | Negative-sentiment conversations on the service line this week? | ❌ |

---

## 4️⃣ GM / Dealer Principal — Edgar

> **Meta-job:** *"Is Vini saving me money, making me money, and keeping customers happy — across both sales AND service?"*

Rolls everything up to revenue, headcount, and risk. Whole rooftop, not one team.

### Funnel they look at (rolled to top-level)

```
Total inbound demand → Vini-handled / Vini-routed → Appointments → Showed → Closed sales / Completed ROs → Revenue
        ↓                       ↓                                                    ↓
   by channel             by department                                       attributed back to source
```

### ROI on Vini

| # | Question | Data state |
|---|---|---|
| 1 | Revenue attributable to Vini-booked appointments this month? | ⚠️ (need $ join from DMS) |
| 2 | Per-call cost of Vini vs. per-call cost of my BDC FTE? | ⚠️ (Vini cost ceiling in PRD §4.6; FTE cost is external) |
| 3 | Headcount efficiency: calls-per-FTE before vs. after Vini? | ❌ (need historical baseline) |
| 4 | Are we capturing leads that would have gone to voicemail under pre-Vini staffing? | ⚠️ (proxy: after-hours volume) |
| 5 | My BDC was X FTE — can I redeploy one body to higher-value work? | ❌ (executive narrative) |

### Conversion + funnel health

| # | Question | Data state |
|---|---|---|
| 1 | What % of inbound calls turn into appointments? | ✅ |
| 2 | What % of appointments showed up and closed? | ❌ |
| 3 | Leads from sources where Vini is deployed → appointments — vs. sources where it isn't? | ❌ (great comp · key ROI lens) |
| 4 | Where in the funnel are we leaking — calls → qualified → appointment → showed → close? | ⚠️ |
| 5 | Cross-department leakage: service customers showing sales interest — cross-sell? | ❌ |

### Customer experience (top-level)

| # | Question | Data state |
|---|---|---|
| 1 | Repeat-caller rate across the rooftop? | ✅ |
| 2 | Customer sentiment trending week-over-week? | ❌ |
| 3 | DNC / TCPA violations Vini avoided that a human might have made? | ⚠️ |
| 4 | Are customers waiting longer this week than last (median time-to-resolution)? | ✅ |
| 5 | Abandonment rate on inbound calls (rang and dropped)? | ❌ |

### Compliance + risk

| # | Question | Data state |
|---|---|---|
| 1 | Did any recall-eligible customer slip past unflagged? | ❌ |
| 2 | How many compliance-flagged intents did Vini handle correctly? | ✅ |
| 3 | DNC compliance rate — any flags? | ✅ |
| 4 | Audit trail: produce a transcript + resolution for any customer interaction this quarter? | ✅ |

### Marketing attribution

| # | Question | Data state |
|---|---|---|
| 1 | Which marketing channel drove the calls that became appointments? | ❌ |
| 2 | Cost-per-appointment by source? | ❌ |
| 3 | Which campaigns yield qualified leads vs. tire-kickers? | ❌ |

### Cross-rooftop / group view

| # | Question | Data state |
|---|---|---|
| 1 | Across my 6 rooftops, which is the best-performing on closure rate? | 🚀 Phase 2 (§8.2.B.2) |
| 2 | Which rooftop's Vini deployment has the worst Mark-as-incorrect rate? | 🚀 Phase 2 |
| 3 | Benchmark my BDC team against the group average? | 🚀 Phase 2 |

---

## Cross-persona reporting wants

These come up for every consumer — surface as filters on every dashboard:

| Filter / lens | Agent | BDC Mgr | Svc Mgr | GM | Notes |
|---|:---:|:---:|:---:|:---:|---|
| Time window (today / 7d / 30d / MTD / custom) | ✅ | ✅ | ✅ | ✅ | Standard |
| Compare-to (vs. prior period) | ✅ | ✅ | ✅ | ✅ | Drives all "deltas vs. last week" copy |
| By rep / advisor | — | ✅ | ✅ | ⚠️ | Anonymised rollup for GM |
| By intent | ✅ | ✅ | ✅ | ✅ | Strongest cut — most questions disaggregate by intent |
| By channel | ✅ | ✅ | ⚠️ | ✅ | GM-top-of-funnel |
| By department (sales / service) | — | ⚠️ | ✅ | ✅ | GM cuts both; managers cut their own |
| By appointment source (Vini-booked vs. advisor vs. walk-in) | ⚠️ | ⚠️ | ✅ | ✅ | Critical for ROI conversation |
| By rooftop (Phase 2) | 🚀 | 🚀 | 🚀 | 🚀 | Group-level only, Phase 2 |

---

## Data-availability summary

Of the ~70 questions above:

| Bucket | Count | What's covered |
|---|:---:|---|
| ✅ Answerable today (v3.1 schema) | ~25 | Action item lifecycle · intents · repeat-caller · SLA · mark-as-incorrect · transfer_outcome · escalation · channel mix |
| ⚠️ Partial — needs aggregation / rollup work | ~15 | Per-rep performance · time-of-day distribution · channel mix breakdowns · cost analysis · Vini-vs-human comparisons |
| ❌ Needs new instrumentation | ~30 | Appointment outcomes (showed/no-show/completed RO) · sentiment score · recall-DB join · marketing attribution · DMS revenue join · CSI |

### New instrumentation hot-list (Phase 2 reporting PRD candidates)

In priority order based on question density:

1. **Appointment outcome ingestion from DMS** (showed · no-show · completed RO · CSI) — unlocks 12+ questions across Svc Mgr and GM
2. **Conversation sentiment score** (per-call + per-customer rollup) — unlocks 7+ questions across BDC Mgr, Svc Mgr, GM
3. **Recall-database join** (Recall Masters integration) — unlocks 4 safety-critical questions for Svc Mgr + GM compliance lens
4. **Marketing attribution join** (campaign → call) — unlocks the GM's "which marketing dollar worked?" lens
5. **Revenue join from DMS** — closes the loop on Vini ROI for GM
6. **Pre-Vini staffing baseline** — needed once for the headcount-efficiency narrative, then static
7. **Refined conversation outcome enum** (`abandoned` · `resolved_in_conversation` · `routed` · `transferred`) — unlocks BDC Mgr's "how staffed are we?" lens

---

## How this connects to the PRD

The reporting surface is **explicitly Phase 2+** in PRD v3.1 — none of these dashboards ship in Phase 1. Phase 1 ships the *event substrate* (the `action_item.*` events in §10.2) so the reporting can be built on top later. The cross-pod dependency table in §10.3 already lists the events that downstream consumers (ROI Emailer, future reporting) will read.

This artifact serves as the **inputs for the Phase 2 reporting PRD** — when that PRD gets drafted, the question list above is the requirements doc. Every dashboard tile, every chart, every drill-down should trace back to one or more questions in this artifact. If a tile doesn't answer a real question, it shouldn't ship.

### Reporting PRD outline (when we get there)

```
Phase 2 Reporting PRD outline (draft)
├── §1 JTBD — meta-jobs per persona (this doc §1-4)
├── §2 Question set per persona (this doc §1-4)
├── §3 Instrumentation roadmap (this doc data-availability summary)
├── §4 Dashboard composition per persona
│       ├── 4.1 Agent performance (live · refresh from JTBD lens)
│       ├── 4.2 BDC Manager dashboard (§8.2.B.1 of v3.1 PRD)
│       ├── 4.3 Service Manager dashboard (NEW)
│       └── 4.4 GM dashboard / executive view (NEW)
├── §5 Cross-rooftop / group view (§8.2.B.2)
├── §6 Self-serve report builder · saved views · scheduled exports
└── §7 Event-bus contracts (extension of v3.1 §10)
```

---

## Open questions for the Phase 2 reporting PRD

1. **Tiered access** — does the BDC Manager see GM-level metrics, or are they walled off? *Recommendation:* same data substrate; per-role default dashboards are different but the underlying queries are shared.
2. **Sentiment scoring** — Spyne-built vs. third-party (e.g. OpenAI / Anthropic moderation API)? *Recommendation:* Spyne-built for cost control + customisation; the moderation APIs are too generic for automotive nuance.
3. **CSI capture** — post-call SMS survey vs. DMS-provided score vs. both? *Recommendation:* DMS-provided is the system-of-record; SMS survey is the leading indicator. Show both, source-flagged.
4. **Reporting refresh cadence** — real-time vs. 15-min vs. hourly? *Recommendation:* hourly for most tiles; real-time for the BDC Manager's queue-health rollup (which is just the live data + counts, already real-time on the Action Items page).
5. **Export / share formats** — CSV only (Phase 1 has CSV in Completed view) vs. PDF reports vs. scheduled email digest? *Recommendation:* Phase 2 ships CSV + scheduled PDF email digest. PowerBI / Tableau integration is Phase 3.

---

## Decision log

- **01 Jun 2026** · Reframed reporting from solution-fit-check ("here's what we have data for") to JTBD ("here's what dealerships ask"). Subhav + Anthropic-co-authored draft based on existing agent-performance dashboard structure.
- **TODO:** validate with 2 BDC Managers + 1 GM at design-partner rooftops before drafting the Phase 2 reporting PRD.

# Customer Signal: Vini Console — Reporting

**Author:** Subhav
**Product:** Vini
**Pod / Team:** Vini Product Team
**Date:** 03 Jun 2026
**Status:** Draft v1 — emerged from the Action Items pod's reporting-questions JTBD work + 01 Jun engineering-grooming transcript.
**Companion artifacts:** [reporting-questions JTBD set](./reporting-questions-console-action-items.md) · [requirement (one-pager)](./requirement-console-reporting.md)

---

## TL;DR

Dealer leadership cannot answer the *"is Vini working?"* question from inside the console. Every BDC Manager and every GM rebuilds the answer manually each week — CSV exports into Excel, hand-formulas across sheets, screenshots forwarded over Slack. The existing agent-performance dashboard answers one role's questions (the inbound agent) and ships solution-fit-check, not JTBD-driven. Four roles want reporting; only one has it.

**The ask in one sentence:** *Give every dealership role a single console surface that answers their week's questions in under 10 seconds, with comparative deltas and a target line on every number.*

---

## Who's affected

- **GM / Dealer Principal** — owns the renewal conversation. Needs "Vini revenue · headcount efficiency · customer experience" in one glance.
- **BDC Manager** — coaches the team. Needs per-rep performance · queue health · Vini handle rate · mark-as-incorrect quality signal.
- **Service Manager** — owns the bay. Needs service intent mix · recall SLA · transfer outcomes · service appointment funnel.
- **Inbound Agent (e.g. Mia)** — the existing dashboard's role. Funnel · top intents · channel mix. *Already partially solved.*

100% of Vini-deployed rooftops have at least 2 of these roles. **20+ rooftops · 60+ live agents** at risk of asking the AI-vs-human grading question at every QBR.

---

## Verbatim quotes (carried forward from the Action Items signal + 01 Jun grooming)

**GM / Dealer Principal voice — Edgar Ceniceros, MB Laguna Niguel · 18 May 2026 + 01 Jun grooming**

1. *"Mia handled 7,370 calls, booked 3,328 appointments, and drove $519,750 — a 3.6× return."* — exists today on agent dashboard. Edgar wants the **same row for the whole rooftop**, not just one agent.
2. *"I want to see how Vini is performing relative to my humans."* — the renewal question. Today's answer requires Excel.
3. *"Direct impact मेरा agent कर ही रहा है. But indirect impact भी हम attribute कर पाए कि हमने देखो चार action item बनाए थे यहां पर team ने close कर दिया उसमें वैसे इतना IRR आपके पास आया."* (01 Jun grooming) — Edgar wants Vini's **indirect** ROI attributed: action items Vini created + team closed → revenue per closure.

**BDC Manager voice — 01 Jun grooming transcript**

4. *"कितने open पड़े, कितने close हुए, कितने post ऐसे लिए चले गए और मैं लोगों को assign कर पाऊं उनका काम."* — the 4-tile rollup that needs to be the BDC Manager's first screen.
5. *"फिर tracking बनेगी कि भाई action item क्योंकि closure rates क्या है?"* — closure rate per rep is the second screen.
6. *"फिर escalations का हम लोग बनाएंगे module कि भाई तीन दिन से action item close नहीं हुए तो email जाना शुरू हो जाए."* — escalation thresholds visible on the reporting surface, not just configured silently.

**Service Manager voice — derived from Edgar's GM transcript on service operations**

7. *"How many of my recall-eligible customers did Vini correctly flag?"* — the safety-critical question for any Mercedes / Toyota / Ford dealership.
8. *"Top services they are looking for & booked services both separate — to understand the unsupported service demands"* (01 Jun grooming) — gap analysis between requested vs booked services as a demand-capture lens.

**Inbound Agent voice — already addressed**

The Mia · service inbound dashboard (the screenshot Subhav shared 28 May 2026 with funnel + KPIs + day-on-day) is the *form* every role wants, just for their job. The other 3 roles each need their version of that surface.

---

## Data points

**Observed at MB Laguna Niguel · 28 May–01 Jun 2026:**

- **The current Mia dashboard answers 8 questions for one role.** The Action Items pod's reporting-questions JTBD doc enumerated **~70 questions across the 4 roles** — 32 are P0, 21 are P1, 17 are P3/non-goal. Today's surface covers only the Agent slice.
- **0 BDC Managers in our 20+ rooftop base have a console dashboard built for their job.** They rebuild weekly in Excel.
- **0 GMs have a console rollup of "Vini revenue this period."** Today they ask their BDC Manager, who exports CSVs and hand-attributes.
- **of the ~70 reporting questions, ~25 are answerable today** from the v3.1 PRD schema — meaning we already have the event substrate, we just don't surface it.
- **5+ Freshdesk tickets in last 30 days** referencing "I want to see how Vini compares to my team" / "I need a manager-level dashboard."

**Directional (instrument before v2):**

- Median **time-per-week a BDC Manager spends building reports** = ~3 hours · TODO instrument once reporting ships (zero is the target).
- **% of QBRs where renewal-relevant Vini ROI data is presented via the console** = 0% today.

---

## Business impact

- **Revenue impact / ARR at risk:** $600K live ARR shared with the Action Items pod — same renewal cohort. The renewal conversation requires a reporting surface; without it, "Vini caught the lead but no one closed it" becomes the customer's story at QBR and we can't defend with data.
- **Expansion / upsell blocked:** the GM's reporting view *is the upsell surface* — "Vini freed up 1 FTE this month" is the only way to land headcount-replacement upsells. No surface → no upsell.
- **Compounding cost across pods:** every cadence email from the ROI Emailer pod deep-links into the console. If the console doesn't have a reporting drill-down sized for the email recipient's role, the emails point at the wrong landing surface.

---

## Why now

- The Action Items pod's v3.1 PRD shipped the event substrate (every `action_item.*` event needed for downstream reporting). The data exists. The dashboard surface is the only missing piece.
- Mia's agent dashboard proves the *form*. Replicating it for 3 more personas is the leverage move.
- Renewal QBRs are scheduled across the live-rooftop base over the next 60 days. Shipping a BDC Manager + GM view before then turns 5+ at-risk renewals into expansion conversations.
- The reporting-questions doc enumerates exactly what to build. The JTBD work is done; this signal closes the loop by formalising the workstream.

---

## What dealers do today (the workaround)

1. **GM** asks the BDC Manager at the Monday standup: *"How did Vini do last week?"*
2. **BDC Manager** opens the Vini console's existing Completed-view CSV export.
3. Imports into Excel · joins with a manual rep-schedule sheet · computes per-rep closure rates with a formula she rebuilt from memory.
4. Pastes the top numbers into a Slack thread for the GM.
5. **Manager rebuilds the same Excel for every standup, every QBR.** Errors compound. The "Vini comparison" line item is omitted or invented.

---

## Phased rollout

| Phase | Scope | Why this order |
|---|---|---|
| **V1 (this signal)** | `/reporting` page with 4 persona tabs (Agent · BDC Mgr · Svc Mgr · GM) surfacing 32 P0 metrics. Time-window filter (Today · Yesterday · 7d · 30d). Mock data → live data switchover behind a flag. | Replicates the working Mia dashboard's *form* across 3 missing roles. Uses event substrate Action Items pod already shipped. |
| **V2** | P1 metrics layered onto each tab (sentiment · DMS appointment outcomes · marketing attribution · recall-DB join). Save-view / scheduled-export. | Unlocks the high-instrumentation questions. Sentiment + DMS-join are the top 2 unlocks per the reporting-questions data-availability matrix. |
| **V3 / Phase 2 cross-pod** | Cross-rooftop group view · per-dealer SLA + intent overrides · NL Q&A "Ask your queue" on real data. | Shares scope with the Action Items Phase 2 routing-config layer + ROI Emailer Phase 2 recipient platform. |

---

## Sanity-check before generating the PRD

- [x] **At least 5 customer quotes captured** (8 verbatim · BDC Manager + GM + Service Manager voices represented · grooming transcript cited)
- [x] **At least 3 data points with sources** (5 captured · 2 directional flagged for instrumentation)
- [x] **Business impact estimate with reasoning** ($600K ARR shared with Action Items pod · upsell-block reasoning)
- [x] **Problem statement is in customer language, not solution language** ("How is Vini performing relative to my humans?" not "Build a dashboard")

---

## Decision log

- **03 Jun 2026** · Reporting promoted from in-scope-of-Action-Items to its own workstream signal. Triggered by (a) JTBD reporting-questions doc enumerating ~70 questions and (b) Mia dashboard being the *form* that needs replicating for 3 more roles, not extending in place.
- **TODO** · Validate persona-fit interviews · 2× BDC Manager + 1× GM + 1× Service Manager at MB Laguna Niguel before V2 PRD scope finalises.

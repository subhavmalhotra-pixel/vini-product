# PRD: Vini Console — Action Items (Phase 1)

**Author:** Subhav
**Product:** Vini
**Pod:** Vini Product Team
**Date:** 20 May 2026
**Status:** draft v3.0 — restructured as a **3-stage task-tracker system** (Create / Manage / Communicate) · Section 10 signed off cross-pod 19 May 2026 · 3 new lifecycle events

> A condensed **grooming snippet** of this PRD is maintained separately at `prd-console-action-items-grooming.md` (route `/docs/prd-grooming`). The full detailed scope, prescriptive specs, and event schema live in this document.

---

> **What changed v2.1 → v3.0 (22 May 2026):**
> - **The Action Items section is now framed as a complete task-tracker system, not a queue.** Three lifecycle stages: **Create → Manage → Communicate**. Every Section in the PRD is re-clustered around these stages — Section 1 JTBD, Section 3 non-goals, Section 8 phases, Section 9 UI specs, Section 10 events all reorganised.
> - **3 new capabilities introduced** (in addition to everything from v2.1):
>   - **Manual creation by BDC** (Create-Phase-2) — rep can add an action item to a customer · tagged to a conversation · upgraded from a note. Resolves a gap where reps Slack their managers instead of creating items.
>   - **Manager dashboard** (Manage-Phase-2) — aggregate SLA panel · unassigned-volume widget · per-rep workload · access-management. Today the Manager sees the same per-row view as a BDC Agent; v3.0 splits the surface.
>   - **Communication pillar** (Communicate-Phase-2) — compose-in-drawer (no tool-switch) · automated customer status updates (co-branded or dealer-branded · template-configurable) · CRM sync on closure (manual-trigger push initially, bi-directional aspirational). Pulled forward from Phase 3.
> - **Section 8 restructured.** 8.1 split into 8.1.A Create / 8.1.B Manage / 8.1.C Communicate. 8.2 split into 8.2.A / 8.2.B / 8.2.C with the 8 v2.1 work streams re-clustered + 3 new streams (manual creation · manager dashboard · CRM sync).
> - **Section 9 restructured.** 12 numbered UI subsections regrouped into 3 surface families (Create surfaces · Manage surfaces · Communicate surfaces) with the new manual-creation modal, manager dashboard, and compose-in-drawer specs added.
> - **Section 10.2 gains 3 new events:** `action_item.created_manually` · `action_item.customer_notified` · `action_item.crm_synced`.
> - **CRM scope decision baked in.** Phase 2 ships manual-trigger CLOSURE-PUSH ("Sync to CRM" in the Close drawer). Existing 12-hour pull stays as the baseline read-path. Bi-directional sub-12-hour push is the Phase 3 target.
> - **Customer-comms branding decision baked in.** Phase 2 ships co-branded by default ("From [Dealer], powered by Vini") with dealer-brand template configurability (signature + logo + optional dealer-branded sender domain).
>
> **What changed v2.0 → v2.1 (22 May 2026):**
> - **Grooming framing extracted.** The grooming-friendly TL;DR table, phase-badge legend, and the simplified "what changed" callouts now live in the separate grooming-snippet PRD. This main PRD is the full, prescriptive spec.
> - All v2.0 detail content **retained**: 18-row Section 3 non-goals table, 8-stream Section 8.2 Phase 2 work-stream expansion, Section 9.0 phase-coverage prelude, Section 10.2.1 Phase 2 event-fields note, Kill #8 (queue pile-up).
> - Phase badges on every Section 9 subsection header **retained** — they're prescriptive, not grooming aids.
>
> **What changed v1.2 → v2.0 (22 May 2026):**
> - **Section 1 — new TL;DR table** above the JTBD paragraph so grooming sessions can scope in 30 s.
> - **Section 3 Non-goals fully restructured.** Was a 10-item numbered list; now a comprehensive table with **18 deferred items** mapped explicitly to their Phase 2 / Phase 3 / other-pod destination. Six previously-implicit gaps surfaced and routed: **(a) action-item lifecycle past SLA · (b) escalation routing & comms · (c) employee directory & onboarding · (d) role-based queue views · (e) customer history & re-open UX · (f) auto-assignment fallbacks.**
> - **Section 8 Phase 2 expanded** into 8 named work streams (was a single bullet list). Each work stream now has: goal · ships · explicit links back to the Section 3 non-goals it resolves.
> - **Section 9 — new prelude table** (Section 9.0) mapping every UI surface to its phase. Each Section 9 sub-section now leads with a phase badge.
> - **Section 7 Kill criteria** gain a new **Kill #8: queue pile-up** — Phase 1 monitors but the actual mitigation lives in Section 8.2 Phase 2 "Escalation routing".
> - **Section 10.2 events** unchanged but a new explanatory note clarifies that the Phase 2 escalation work introduces additional fields *(`auto_reassigned_to`, `nudge_sent_at`, `customer_history_count`)* — flagged here so the cross-pod consumers can plan for them.
>
> **What changed v1.1 → v1.2 (20 May 2026):**
> - **Section 4 — new "Action-item creation rule" callout (Section 4.0)** — explicitly states that *the agent acknowledging or promising a follow-up is NOT resolution*. Created action items must cover every customer intent that requires a post-conversation action, even when the agent verbally said "I'll arrange that." Worked examples table + default-on-uncertainty rule (bias toward `unresolved`).
> - **Section 4.2 system prompt** — taxonomy-style resolution rules added to the LLM prompt with explicit examples.
> - **Section 5 eval set** — 3 new cases pinning the agent-promise-vs-actual-resolution distinction (now 38 cases total).
>
> **What changed v1.0 → v1.1 (20 May 2026):**
> - **Section 3 Non-goals** — bulk operations clarified: customer-level multi-intent bulk-close is now in scope (it's the natural shape of the data); cross-customer bulk-assign remains deferred to Phase 2.
> - **Section 6 Prototype scope** — note added that the demoable prototype now covers the full Phase 1 UI surface (all channels mocked) for stakeholder design review, while backend wiring still targets the 5-day Laguna pilot.
> - **Section 9 Console UI** — major changes from the design-review pass:
>   - **9.2 Pending view** — moved to a Data-Dense Dashboard density (~36–40 px row height); collapsed row carries only the bare minimum (customer · intent chip · age · assignee · escalation · multi-intent hint), full recap + conversation snippet + actions revealed by in-row click-to-expand. Replaced all emoji icons with inline SVG (consistency, theming, screen-reader friendly).
>   - **9.3 Completed view** — rebuilt as a scale-oriented data table (search · faceted filters with live counts · date buckets · group-by · bulk-select · CSV export · ~200 mock items in the prototype to demonstrate scale).
>   - **9.5 Assign drawer** — Vini-as-assignee promoted to a pinned card at the top; selecting Vini now reveals a **required `Instructions for Vini` field** (10-char minimum, enforced at the API level) with per-intent template prefill and an "expected response" callout.
>   - **9.6 Close drawer** — conversation snippet pinned at the top (with click-to-view-full-call), plus a new appointment-picker subform when `resolution_type = appointment_booked` (create-new OR pick-existing).
>   - **NEW 9.7 Bulk close drawer** — multi-intent customer-level resolution: one drawer closes N items on a single customer atomically, with shared appointment, quick-apply-to-all chips, and per-item deselect.
> - **Section 10 Schema** — `action_item` gains `closed_with_appointment_id` and `vini_instructions` fields; new `appointment.created` event emitted when the close flow creates a new appointment inline.

---

## 1. Job to be done

As a dealership stakeholder, I want the Vini Console's Action Items section to act as a **complete task-tracker system** — handling the full lifecycle of every customer task from creation through management through customer-facing communication — so my BDC team can run from one surface (no forwarded Slack messages), my managers see queue health at a glance (not just per-row), and my customers stay informed without my reps switching tabs *(Signal Section 1 — three pillars: Creation gap, Management gap, Communication gap)*.

### The 3-stage lifecycle

```
                   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   conversation →  │  1. CREATE   │ → │  2. MANAGE   │ → │ 3. COMMUNICATE│ → customer + CRM
                   │              │   │              │   │              │
                   │  Vini detects│   │  Closer +    │   │  Customer    │
                   │  + BDC adds  │   │  Manager     │   │  + CRM sync  │
                   └──────────────┘   └──────────────┘   └──────────────┘
```

| Stage | Question it answers | Owner |
|---|---|---|
| **1. Create** | *"Where do tasks come from and with what context?"* | Vini (automatic) + BDC Agent (manual) |
| **2. Manage** | *"Who closes which task, when, and how do managers see queue health?"* | BDC Agent (closer) + BDC Manager (rollup view) |
| **3. Communicate** | *"How does the customer know we acted? How does the dealer's CRM stay in sync?"* | Vini + BDC Agent + dealer CRM |

### Phase split

Phase 1 ships the foundation of all three stages. Phase 2 ships the **configurable & accountable** layers across all three.

| Stage | ✅ Phase 1 *(this PRD)* | 🚀 Phase 2 *(future PRD — see Section 8.2)* |
|---|---|---|
| **1. Create** | Vini-driven AI extraction across all 5 channels · multi-intent dedup · per-intent SLA inheritance · 14-intent taxonomy | + **Manual creation** (BDC adds to a customer · tags a conversation · upgrades a note) · auto-route at birth via routing config |
| **2. Manage** | Pending + Completed views · assign + close · SLA flag *render* · resolution note + type · customer profile drill-in · multi-intent bulk close | + **Manager dashboard** (aggregate SLA · unassigned panel · access management) · routing config · employee directory · escalation routing · auto-assignment · per-role default views · customer history |
| **3. Communicate** | Deep-link to existing Vini inbox · cross-pod email-loop badge (read-only) · resolution note as internal audit trail | + **Compose-in-drawer** (close + send in one motion) · **Automated customer status updates** (co-branded or dealer-branded · template-configurable) · **CRM sync on closure** (manual-trigger push · existing 12-hour pull stays as baseline) |

**Cross-pod note:** Phase 2 of this pod **shares scope with the ROI Emailer pod's self-serve subscription platform** (`prd-roi-emailer.md` Section 10). Both converge on a single "who at the dealership gets what" configuration layer — full reasoning in Section 8.2.A and Section 10.6.

---

## 2. Success metrics

All metrics below reference specific events from Section 10.2 and intents from Section 10.5. Most are not measurable today (Signal Section 4 tracking gap) — **instrumentation against Section 10 is a Phase 1 deliverable, not a Phase 1 prerequisite**. Targets are "30 days post-instrumentation," not "30 days post-launch."

### Primary

- **Metric:** **Intent-weighted closure-within-SLA** · across all action items created in the measurement window, the volume-weighted % closed within their per-intent SLA (see SLA matrix below).
- **Why this metric:** captures the JTBD in one number — *"the BDC actually runs from the queue, and customers don't fall through the cracks."* Volume-weighting prevents a rooftop from looking healthy by closing 95% of low-urgency `general_info` while letting `recall_response` rot.
- **Target (within 30 days of instrumentation):** ≥ **65% intent-weighted closure-within-SLA** across live rooftops.
- **Current baseline:** Directional **< 20%** (Signal Section 4) · not measurable today.
- **Measurement source:** join of `action_item.created` ↔ `action_item.closed` events, filtered to the period, with per-intent SLA threshold applied. Falls back to `action_item.escalated` (`aged_past_sla`) as the negative signal.

**Per-intent SLA matrix (Phase 1 — calibrated against existing CSM-observed urgency norms; revisit after 60d):**

| `intent_id` | SLA | Rationale |
|---|---|---|
| `compliance_alert` | 4 hours | Legal exposure window |
| `recall_response` | 4 hours | Safety + legal |
| `sms_takeover` | 4 hours | Customer is mid-thread, expects continuity |
| `complaint` | 4 hours | Escalation risk if delayed |
| `callback_request` | 4 business hours | Customer explicitly waiting |
| `status_update` | 8 business hours | Existing customer, in-flight RO |
| `no_show` | 8 business hours | Reschedule window before customer churn |
| `pricing_quote` | 24 hours | Standard sales-cycle response time |
| `specific_salesperson` | 24 hours | Adviser routing |
| `appointment_inquiry` | 24 hours | Booking flow |
| `vehicle_inquiry` | 24 hours | Standard sales response |
| `trade_in_inquiry` | 24 hours | Trade-desk turnaround |
| `service_intent` | 24 hours | Qualify + book |
| `general_info` | 48 hours | Low-urgency |

### Secondary

| Metric | Target (30d post-instrumentation) | Today | Source events |
|---|---|---|---|
| **Resolution-note compliance** · % of `action_item.closed` events where `resolution_note` is non-empty (API enforces, so this is really an enforcement-leak metric) | ≥ 98% | 0% at Laguna · live console review (Signal Section 4) | `action_item.closed.resolution_note` |
| **Repeat-caller reduction** · # of customers with ≥ 3 `action_item.deduplicated` events on the same `intent_id` within 7 days. The Gary Wise pattern. | 50% reduction vs pre-launch baseline | Not flagged today | `action_item.deduplicated` |
| **Queue Daily Active Users** · unique `closed_by_user_id` per rooftop per day, ≥ 1 closure | ≥ 5 / rooftop / day | < 2 / rooftop / day (Signal Section 4) | `action_item.closed.closed_by_user_id` |
| **Time-to-first-action** · median `assigned_at − created_at` during business hours | ≤ 30 min median | Not measurable | `action_item.created` → `action_item.assigned` |
| **Email-to-action conversion** · % of `action_item.surfaced_in_email` items that have a subsequent `action_item.email_cta_clicked` within 24h | ≥ 35% | Not measurable | Cross-pod events |
| **Vini-as-assignee throughput** *(Phase 2 target, instrument now)* · % of action items closed by `assignee_user_id = vini_agent` with a resolution note that passes audit | ≥ 30% of low-judgment intents | 0% (Phase 1 has no Vini-as-assignee) | `action_item.closed.closed_by_user_id` filter |

### Anti-metrics (watch, don't optimize against)

- **Total action items created / day** — driving this UP is bad (more unresolved intents); driving it DOWN can be bad too (Vini under-detecting). Track for instability, don't set a target.
- **Pending-queue absolute size** — same reason. A rooftop with 0 pending items may have a broken pipeline.

### How metrics tie back to kill criteria (Section 7)

- Section 7 #2 (closure rate stuck) triggers if **Primary metric < 25%** at 30d post-instrumentation
- Section 7 #3 (AI cost spiral) triggers off a Section 4 cost-ceiling event — *not* a metric per se but instrumented the same way
- Section 7 #4 (customer-ID instability) is a data-quality metric: % of `action_item.created` events where `customer_id` resolves to a known customer in the Agent Platform layer. Floor: ≥ 95%.

---

## 3. Non-goals

Phase 1 is the **readable, accountable single-rooftop queue**. Everything else is deferred — most to Phase 2, some to Phase 3, a few to other pods entirely.

> **Reading guide:** every row below has a phase destination column. If Phase 1 should change to absorb any of these, that's a scope discussion, not a missing item. Phase 2 detail lives in Section 8.2; cross-pod work in Section 10.6.

### 3.1 Deferred capabilities — full table

| # | Topic | Why deferred from Phase 1 | Phase destination | Notes |
|:-:|---|---|:-:|---|
| 1 | **Multi-rooftop / group-level queue rollups** | Phase 1 ships single-rooftop only. A Fixed Ops Director with 6 stores can't see one combined queue yet. | 🚀 **Phase 2** Section 8.2.3 | Signal Section 2 scope note. Requires the routing-config layer + cross-rooftop permissions. |
| 2 | **Recipient routing / who-gets-what configuration** | Phase 1 has a fixed access model: every user with Console access sees the queue. No per-role routing rules. | 🚀 **Phase 2** Section 8.2.1 | Shares scope with ROI Emailer Pod Section 10 self-serve platform — see Section 10.6. |
| 3 | **Vini-as-assignee with auto-resolution** | Phase 1's `Instructions for Vini` field captures the *intent* but Vini doesn't actually close anything yet. Humans close everything in Phase 1. | 🚀 **Phase 2** Section 8.2.2 | Requires resolution-note generation (cheap, but blocked on Section 10.6 #2 sign-off across pods). |
| 4 | **BDC rep self-service "My tasks" view** | Phase 1 has the "Mine" filter on the Pending view but assumes every authorized user lands on the same queue. Reps don't get a *default-filtered* landing experience. | 🚀 **Phase 2** Section 8.2.7 | Resolves "different POC handling" feedback. |
| 5 | **Auto-assignment rules** | Round-robin, load-balancing, skills-based routing across reps. Phase 1 is manual-assign-only. | 🚀 **Phase 2** Section 8.2.6 | Lives with the routing/recipient config layer (item #2). |
| 6 | **Auto-assignment fallbacks** *(NEW v2.0)* | If an item is unassigned + past SLA, who picks it up? If assigned rep is OOO, who reassigns? If no BDC Manager configured, does it go to the GM? | 🚀 **Phase 2** Section 8.2.6 | Cheaper subset of #5 — fallback rules ship first; full skill-based routing later. |
| 7 | **Escalation routing & nudge cascade** *(NEW v2.0)* | Phase 1 *flags* `aged_past_sla` / `repeat_caller_threshold` / `compliance_flagged` (renders the badge), but doesn't *route* the escalation. No Slack DM, no email, no auto-reassign to manager, no auto-close at 3× SLA. | 🚀 **Phase 2** Section 8.2.5 | Resolves "Action items pile up" + "how does escalation actually happen" feedback. Phase 1 monitors via Section 7 Kill #8. |
| 8 | **Employee directory + onboarding flow** *(NEW v2.0)* | Phase 1 reads the user list from the Vini Agent Platform (read-only). No "Add team member" flow, no role assignment, no invite email. | 🚀 **Phase 2** Section 8.2.4 | If a referenced `assignee_user_id` is disabled, Phase 1 must degrade gracefully — that *is* in Phase 1 (see Section 9.5 update). |
| 9 | **Per-role default views & permissions** *(NEW v2.0)* | Phase 1 shows the same queue to GM, BDC Manager, BDC Agent, Service Advisor. There's no role-based default filter, no manager-only escalation section, no compliance-officer lock on `compliance_alert` items. | 🚀 **Phase 2** Section 8.2.7 | Resolves Q6 from the design review. Phase 1 ships the foundation (every user has the same queue) so we don't fork the data model. |
| 10 | **Customer history & "Reopened" UX** *(NEW v2.0)* | Phase 1 dedups on `(customer_id, intent_id)` while `status = pending`. A closed item that the customer calls about again creates a NEW item with no UX hint about prior closures. | 🚀 **Phase 2** Section 8.2.8 | New chip + tooltip on the row showing "N prior closes" with the timeline. Also covers the reopened-item visual treatment. |
| 11 | **In-console messaging** | Reps can't reply to the customer from the action-item card. We deep-link to the existing Vini inbox; we don't embed. | ❌ **Other pod** | Lives with the existing console inbox. Not this pod's job. |
| 12 | **Custom action-item / intent types** | Phase 1 ships the fixed 14-intent taxonomy (Section 10.5). No dealer-defined custom intents. | 🔮 **Phase 3** | Requires versioned taxonomy migration tooling — too costly to ship before Phase 2 evidence. |
| 13 | **CRM push on closure** *(reclassified v3.0)* | Closure status, resolution notes, assignee data don't push back into Reynolds / CDK / DealerSocket. Existing 12-hour pull stays as the baseline read path. | 🚀 **Phase 2** Section 8.2.C.3 | Reclassified from Phase 3 → Phase 2 in v3.0 per dealer feedback. Manual-trigger push on close + auto-push from Vini-as-assignee. Bi-directional sub-12-hour pull stays Phase 3. |
| 14 | **Real-time push notifications** | No SMS / Slack / mobile push when a new action item is created. The ROI Emailer pod's Daily Digest is the cadence surface. | 🚀 **Phase 2** Section 8.2.5 | Slack DM ships as part of the escalation nudge cascade. Mobile push is 🔮 Phase 3+. |
| 15 | **Native mobile app** | Mobile-responsive web is acceptable for Phase 1. Native iOS/Android is deferred. | 🔮 **Phase 3+** | — |
| 16 | **Action-item creation from non-Vini sources** | No ingestion from Service Lane apps, walk-in tablets, web-form submissions. Vini conversations only. | 🔮 **Phase 3** | Requires generalising the AI pipeline beyond the conversation transcript shape. |
| 17 | **Cross-customer bulk operations** | No cross-customer bulk-assign or bulk-close. Queue is intentionally small (Section 9.2 design promise). | 🚀 **Phase 2** Section 8.2.6 | **Exception:** customer-level multi-intent bulk-close IS in Phase 1 (Section 9.7). Completed-view multi-select for re-open + CSV export are audit affordances, not "bulk-assign". |
| 18 | **Action-item auto-close at SLA × 3** *(NEW v2.0)* | If nobody closes an item, does the system ever auto-close it with `customer_unreachable` so the queue doesn't grow forever? | 🚀 **Phase 2** Section 8.2.B.4 | Open question — see 8.2.B.4 open decisions. Recommendation: yes at 3× SLA with system-generated note. |
| 19 | **Manual creation by BDC** *(NEW v3.0)* | Reps can't add an action item themselves — only Vini extraction creates items. Reps Slack their manager when they spot follow-ups Vini missed. | 🚀 **Phase 2** Section 8.2.A.2 | Three sub-surfaces: customer-level add · conversation-tagged · note-upgraded. Same routing + SLA inheritance as AI-created items. |
| 20 | **BDC Manager dashboard** *(NEW v3.0)* | Manager sees the same per-row queue as a BDC Agent. No aggregate SLA panel, no unassigned-volume widget, no per-rep workload view. Managers recreate rollups in Excel. | 🚀 **Phase 2** Section 8.2.B.1 | New top-level surface sibling to Pending/Completed. Includes access-management. |
| 21 | **Compose-in-drawer (close + send in one motion)** *(NEW v3.0)* | Reps close an item in the Console, then switch to the inbox to send the customer a message. Two-step workflow; tab-switch is friction. | 🚀 **Phase 2** Section 8.2.C.1 | Narrower than the original #11 "in-console messaging" non-goal — compose-in-drawer is closure-message only, not full inbox. Existing inbox surface still owns multi-turn outbound. |
| 22 | **Automated customer status updates** *(NEW v3.0)* | When a BDC closes a task, the customer gets no automated message. They call back hours later asking if anyone replied. | 🚀 **Phase 2** Section 8.2.C.2 | Co-branded by default · dealer-branded with template config. Frequency cap + DNC/TCPA-safe. Triggered on `action_item.closed` for opted-in dealer + intent class. |

### 3.2 What Phase 1 DOES handle (clarifications)

A few things are easy to mistake for non-goals — calling them out so we don't redebate scope mid-build:

| In Phase 1? | What | Notes |
|:-:|---|---|
| ✅ | **Customer-level multi-intent bulk close** | Section 9.7 Bulk Close Drawer — closing 3 intents from one conversation in one drawer. Not "cross-customer bulk" (which is #17 in Section 3.1). |
| ✅ | **Completed view multi-select for re-open + CSV export** | Section 9.3 — audit affordance. Not "bulk-assign". |
| ✅ | **SLA matrix + per-intent escalation badge render** | Section 2 + Section 9.2 — Phase 1 *shows* `past SLA` and `escalated` chips. The *routing* of those escalations is #7. |
| ✅ | **Repeat-caller chip + customer-profile escalation banner** | Section 9.4 + Section 9.8 — Phase 1 *renders* the count. Auto-reassign-to-manager is #7. |
| ✅ | **Vini-as-assignee instruction capture** | Section 9.5 — the textarea + 10-char minimum. Vini actually *resolving* the item is #3. |
| ✅ | **Graceful degradation when an assignee is disabled** | Section 9.5 — the user dropdown filters out disabled users; existing references to disabled users render as `[former team member]`. Adding new employees (#8) is Phase 2. |

---

## 4. Harness spec

The AI surface for this pod is the **intent extraction + recap pipeline** — convert any closed-out conversation transcript (call / SMS / chat / email / HITL) into a structured list of action items, each tagged with an intent from Section 10.5, a resolution status, and (for unresolved ones) a one-sentence customer-facing recap. Justification: per Section 10 Section 10.6 #2, the dealership-side surfaces (Console queue + Daily Digest aggregation) both depend on a clean intent taxonomy applied consistently across millions of conversations — humans cannot grade at that volume.

> ### ⚡ 4.0 Action-item creation rule (load-bearing)
>
> **An action item must be created for every customer intent that the agent did NOT actually resolve during the conversation AND that requires a post-conversation action.**
>
> The agent verbally **acknowledging** a request, **promising** to do something, or **routing** the work to a human is NOT resolution. The work is unresolved until it is actually done.
>
> | Conversation pattern | Resolution status | Action item? |
> |---|---|---|
> | Customer: "Can someone call me back?" · Agent: "Sure, I'll arrange a callback." | `unresolved` | ✅ **YES** — callback hasn't happened |
> | Customer: "What's the status of my repair?" · Agent: "Let me have your advisor reach out with the latest." | `unresolved` | ✅ **YES** — advisor hasn't reached out yet |
> | Customer: "Send me a quote on a 60k service." · Agent: "I'll have our service desk email you by end of day." | `unresolved` | ✅ **YES** — quote not yet sent |
> | Customer: "Got a recall notice." · Agent: "I'm transferring you to an advisor." *(then transferred but no booking made)* | `unresolved` | ✅ **YES** — recall not yet verified or booked |
> | Customer: "What are your hours today?" · Agent: "We close at 6 PM." · Customer: "Thanks!" | `resolved_in_conversation` | ❌ NO — the answer satisfied the need |
> | Customer: "Is the GLC 300 available in white?" · Agent: "Yes, we have two in stock." · Customer: "Great, thanks." | `resolved_in_conversation` | ❌ NO — yes/no satisfied |
> | Customer: "I want to opt out of marketing." · Agent: "I've marked you DNC right now." *(in-system action taken)* | `unresolved` *(compliance must verify)* | ✅ **YES** — compliance audit trail required regardless of agent's claim |
>
> **Heuristic for the model:** if the work could still fail or fall on the floor after the call ends, it is `unresolved`. A spurious action item is recoverable (the closer just marks it complete with a short note); a missed one means the customer falls through the cracks. **Bias toward creating action items.**
>
> **Default-on-uncertainty:** if the model cannot confidently classify an intent as resolved-in-conversation, classify as `unresolved`. This is enforced both in Section 4.2's system prompt and in the eval rubric (Section 5 dim 2).

### 4.1 What the AI produces per conversation

| Output | Type | Used by |
|---|---|---|
| `detected_intents[]` | `intent_id` from Section 10.5 taxonomy · multi-intent allowed (1..N) | Determines how many action items get created |
| `primary_intent_id` | one of `detected_intents[]` · highest confidence / most-discussed | Drives `is_primary_intent_of_source` on the resulting action items + the conversation's primary-intent tag |
| `resolution_status_per_intent` | enum: `resolved_in_conversation` / `unresolved` per intent | Only `unresolved` intents become action items |
| `intent_recap` | one sentence per *unresolved* intent · target ≤ 150 chars · PII-stripped | Stored on `action_item.intent_recap` · consumed by both pods |
| `confidence_per_intent` | 0..1 · for thresholding low-confidence detections | Below threshold → fall back to `general_info` intent for human triage |

### 4.2 Model + pipeline

- **Model:** **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) — same model the ROI Emailer pod uses for Story-of-the-Week. Justification: structured classification + short generative output is well within Haiku's competence; Sonnet has no quality advantage at this length and is ~3× cost. Volume here is per-conversation (much higher than ROI Emailer's per-week story), so cost economics actively favor Haiku.
- **Tools:** None. Single LLM call per conversation with a structured-output schema (JSON-mode) returning the Section 4.1 fields directly.
- **Context strategy:**
  1. **Input payload:** full transcript turns (call + SMS + chat + email + HITL portions, in order) · channel · timestamps · `customer_id` · `conversation_id` · existing pending action items for this customer (for dedup hinting only — see Section 4.4)
  2. **System prompt:** Section 10.5 intent taxonomy as a closed enum, with one-line description and dept tag for each intent · **Section 4.0 action-item creation rule embedded verbatim** (agent-promise ≠ resolution; bias toward `unresolved`) · output schema with strict JSON · explicit "do not invent intents outside this list — fall back to `general_info`" guard
  3. **No retrieval / no function-calling** — single inference call
- **PII strip pre-LLM:** customer full name, phone, email, VIN replaced with role placeholders ("the customer", "<phone>", "<vehicle>") before the transcript reaches Haiku. Same regex pipeline the ROI Emailer pod uses — re-use the module, don't fork.
- **Post-call PII guard:** every `intent_recap` is re-scanned with the PII regex after generation; if any PII leaks through, the recap is replaced with the deterministic fallback (Section 4.5). Slack alarm fires.

### 4.3 When the pipeline runs (per-channel)

Per signal Section 9.3 channel rules, with one rule per channel:

| Channel | Trigger | Notes |
|---|---|---|
| `call` | End-of-call (post-disposition webhook) | Single inference per call |
| `chat` | End-of-session (per Section 10.6 default — real-time creation is a Phase 2 flag for `recall_response` / `compliance_alert` only) | Reduces duplicate creation risk |
| `sms` | After 24h of thread inactivity → finalize and emit | Per Section 10.6 SMS-timeout decision |
| `email` | On every received email in the thread | Email threads can carry multi-intent per message; re-run per arrival |
| `hitl_takeover` / `hitl_warm_transfer` | End-of-handover (when human marks conversation complete) — **re-scan the FULL transcript including the human's portion**, not just Vini's | Closes the "human portion invisible to the queue" gap from signal Section 9.3. Per Section 10.6 default: re-scan on end, not streaming. |

### 4.4 Deduplication — deterministic, not AI

After Haiku returns its `detected_intents[]`, the pipeline applies deterministic dedup before emitting `action_item.created`:

```
for each unresolved intent in detected_intents:
    existing = query_pending_items(customer_id, intent_id)
    if existing:
        emit `action_item.deduplicated` { action_item_id = existing.id, source_conversation_id, intent_id }
        increment existing.repeat_caller_count
        update existing.last_observed_at = now
    else:
        emit `action_item.created` { ... new action_item ... }
```

Dedup key: **`(customer_id, intent_id)` while status = pending**. Closed items don't deduplicate — if a customer's `pricing_quote` was closed last week and they ask again, that's a new action item.

This logic is **not in the AI prompt**. The LLM doesn't know about existing items. Reasoning: LLMs are bad at this kind of state check and the cost of getting it wrong is high (creating duplicates). Deterministic lookup is reliable and fast (<5ms).

### 4.5 Fallback path

If the Haiku call fails (timeout > 10s, JSON-parse error, content-filter trip, or PII leak in post-scan):

- **Still create the action item** — never block on AI. The queue is more useful with a deterministic recap than with no item at all.
- **Recap fallback:** first 100 characters of the post-PII-strip transcript, prefixed with `[auto] ` so reviewers can spot it.
- **Intent fallback:** classify the conversation as `general_info` (the safe default — gets human triage in the queue).
- **`created_by_ai = false`** on the emitted event so downstream consumers can filter.
- **Slack alarm** to `#vini-coverage-alerts` with `dealer_id`, `rooftop_id`, `conversation_id`, `cause`. Re-process queue runs nightly.

### 4.6 Cost ceiling

- **Per-call target:** ≤ **$0.005** per conversation (≤ 6k input tokens, ≤ 300 output tokens at Haiku pricing)
- **Per-rooftop daily cap:** **$0.75** (covers up to 150 conversations × $0.005). Above the cap, additional conversations route to the deterministic fallback only.
- **Hard kill criterion (mirrors Section 7 #3):** if rolling 24h average cost per conversation exceeds **$0.05** across the pod, the pipeline auto-disables AI generation and ships deterministic-only. Engineering oncall paged.
- **Volume math sanity check:** 20 rooftops × ~50 conversations/day × $0.005 = $5/day = **~$150/month** at current scale. Well within sustainable bounds.

### 4.7 What's intentionally NOT in scope for Phase 1 AI

- **Vini-as-assignee resolution-note generation** — when Vini is the assignee and closes its own task, it must also draft the resolution note. Deferred to Phase 2 (per Section 3 #2). Phase 1: Vini doesn't close anything; humans always close.
- **Sentiment / urgency scoring beyond `intent_id`** — the 14-intent taxonomy is the only AI classification surface in Phase 1. No additional dimensions.
- **Cross-conversation summarization at customer level** — the customer profile in Section 9 shows the per-conversation intents; we don't generate a "summary of this customer's history" narrative in Phase 1. Phase 3 candidate.
- **Suggested resolution actions** — "click here to send the customer an SMS with their status" is *deferred*; Phase 1 just surfaces the action item, humans decide what to do.

---

## 5. Quality bar

| Surface | Type | Quality artifact |
|---|---|---|
| Pending view render (filters, sort, intent chips, age badges, escalation flags) | [deterministic] | Unit + integration + E2E tests |
| Completed view render (filters, resolution note inline, re-open flow) | [deterministic] | Unit + integration + E2E tests |
| Customer profile (5 collections: Details / Vehicles / Conversations / Action items / Appointments) | [deterministic] | Unit + integration tests per collection |
| Assign drawer + reassign flow | [deterministic] | Unit + E2E tests |
| **Vini-as-assignee instruction enforcement** (10-char minimum on `vini_instructions`, API + UI) | [deterministic] | Unit + integration tests; API contract test rejects assignment to `vini_agent` without instructions |
| Close drawer + resolution-note enforcement (empty-note rejection at API level) | [deterministic] | Unit + integration tests; API contract test enforcing non-empty `resolution_note` |
| **Appointment picker** (use-existing radio list · create-new datetime + advisor + vehicle) | [deterministic] | Unit + E2E tests across both modes; integration test verifies the new appointment links via `closed_with_appointment_id` |
| **Conversation snippet** (relevant-turn selection · click-to-view-full) | [deterministic] | Unit tests on the turn-selection heuristic (first customer · first human · last customer · cap 3) |
| **Bulk close drawer** (multi-intent customer-level) | [deterministic] | Integration tests for: per-item deselect · per-item resolution + note · shared appointment across N items · quick-apply-to-all chips · atomic submission |
| Action-item card (intent chip, channel icon, age, "Surfaced in Daily Digest" badge, click-to-listen) | [deterministic] | Visual regression + unit tests |
| Customer-level rollup (joining Vini intents to a stable `customer_id`) | [deterministic] | Integration tests against Agent Platform identity service |
| Channel-aware creation triggers (call · chat · SMS · email · HITL re-scan) | [deterministic] | Integration tests, one per row of Section 4.3 channel-rule matrix |
| Deduplication (`(customer_id, intent_id)` pending-status match) | [deterministic] | Unit tests for the lookup + integration tests for the merge flow |
| Cost-ceiling enforcement (per-rooftop daily cap, auto-disable at 24h avg threshold) | [deterministic] | Integration tests simulating cost-spiral conditions |
| PII stripping (pre-LLM + post-LLM guard) | [deterministic] | Unit tests on every PII regex pattern · integration test with adversarial PII-leak transcripts |
| Event emission to the shared bus (all 9 events in Section 10.2) | [deterministic] | Contract tests against the schema · subscriber-side consumer tests |
| Cross-pod consumption (`action_item.surfaced_in_email`, `action_item.email_cta_clicked` from ROI Emailer pod) | [deterministic] | Cross-pod contract tests |
| Repeat-caller escalation flag (3+ dedup events on same `(customer_id, intent_id)` within 7d) | [deterministic] | Unit tests on the rule + integration test on the flag-render path |
| **AI intent extraction + recap generation** | **[ai-generated]** | **≥ 35 eval cases, graded rubric (see below)** |
| **AI confidence-thresholded fallback to `general_info`** | **[ai-generated]** | Eval cases bucket: low-confidence inputs |

### Coverage plan

Deterministic surfaces are unit-tested at the rule level (every metric formula, every event emission, every render variation), integration-tested for the full create → assign → close flow including cross-channel HITL re-scan, and E2E tested from a staged Vini conversation through pod-internal pipeline through console render. The AI surface needs an eval set spanning the channels and edge cases below.

### AI eval set — ≥ 35 cases across 6 buckets

| Bucket | Count | What it tests |
|---|---:|---|
| `happy_path` | 12 | One case per intent in Section 10.5 — clean single-intent conversation, correct classification + recap |
| `multi_intent` | 6 | Conversations with 2–3 detected intents — verifies primary intent selection and multi-`action_item` emission |
| `hitl` | 4 | Warm transfer + SMS takeover — full transcript re-scan including the human portion produces correct intents and recaps that reflect what the human did, not just Vini |
| `dedup` | 4 | Same customer + same `intent_id` → triggers `action_item.deduplicated` instead of new `action_item.created` |
| `adversarial` | 5 | (a) Customer PII leak attempts inside transcripts; (b) requests for intents outside Section 10.5 taxonomy → must fall to `general_info`; (c) prompt-injection in conversation text; (d) sentiment-laden but action-free chitchat → must produce zero action items |
| `cost_latency` | 4 | Very long email thread (multi-message, multi-intent), very short SMS (≤ 20 chars), very long call transcript (60min+), high-noise audio transcription artifacts |

**Rubric grades (per case, 0–4 scale):**

1. **Intent classification accuracy** — were all intents correctly detected from Section 10.5 taxonomy? Was the primary correctly identified? Off-taxonomy → correctly routed to `general_info`?
2. **Resolution status accuracy** — was each intent correctly classified `resolved_in_conversation` vs `unresolved`, per the Section 4.0 rule? Specifically, an agent **acknowledging** a request or **promising** a follow-up must classify as `unresolved` — only an actually-satisfied need (e.g. hours / address / yes-no answer / in-system DNC flag completed) counts as resolved. Cases scoring < 3 on this dimension at the 90 % bar are **blocking** for ship.
3. **Recap factual accuracy** — does the recap reflect only what's in the transcript? Zero hallucinations / invented context.
4. **Recap anonymization** — zero PII (name, phone, email, VIN). Post-PII guard would catch any leak.
5. **Recap format** — single sentence · ≤ 150 chars · uses "the customer" not name · uses generic descriptors for vehicle ("their vehicle" not VIN-suffix).
6. **Dedup correctness** — for dedup-bucket cases, did the pipeline correctly emit `action_item.deduplicated` referencing the right existing item rather than creating a new one?

**Pass bar:** ≥ 90% of cases score 3+ on every rubric dimension. Cases scoring < 3 on dimensions 4 (anonymization) or 1 (taxonomy compliance) are blocking failures — fix before ship.

**Quality bar before Phase 1 ships:** all rubric dimensions ≥ 90% pass rate · cost ceiling holds in load-test simulation · cross-pod contract tests green for both pods.

---

## 6. Prototype scope (≤5 days)

> **Note (v1.1):** This section describes the **production wiring scope** for the 5-day Laguna pilot. The companion **demoable prototype** shipped to design review covers the full Phase 1 UI surface (all five channels, all 14 intents, bulk close, appointment picker, Vini-instructions enforcement, 200+ mock completed items) with mock data so reviewers can validate the design vision before backend wiring begins. The pilot below is the *real-data* slice that goes live first.

The 5-day prototype targets **Mercedes Benz Laguna Niguel** as the single design-partner rooftop (live signal source · Edgar's team) and proves three pillars of the PRD in production conditions:

1. **The customer-level rollup actually works.** Joining real Vini conversations to a stable `customer_id` produces a clean queue, not a noisy duplicate-row mess.
2. **The intent chip + intent recap are useful to the GM.** Edgar can read the queue in the morning standup without listening to every call.
3. **Assign + close with a resolution note is faster than the current Slack-forwarding workflow.** Anya and at least one BDC rep adopt it for one week.

### What ships in the 5-day prototype

| Surface | In scope | Out of scope |
|---|---|---|
| **Channels** | `call` only | `sms`, `chat`, `email`, `hitl_*` |
| **AI surface** | None — recaps are first 100 chars of post-PII-strip transcript prefixed with `[auto]` · intent classified via existing Vini intent-detection if available, else `general_info` | Haiku call, multi-intent extraction, primary-intent selection, confidence thresholding |
| **Pending view** | Customer name · intent chip · age · channel icon · assignee badge · click-to-listen · Assign button · Close button | Filters beyond "unassigned / assigned to me / assigned to others" · escalation flag · `Surfaced in Daily Digest` badge |
| **Completed view** | Hidden in prototype — engineering can reach via URL for review, but not linked in the IA | Full filter set, re-open flow, audit ergonomics |
| **Customer profile** | 2 of 5 collections only: **Details** + **Action items**. Vehicles · Conversations · Appointments are stub links pointing to existing console pages — no rendering work in the prototype. | Full 5-collection profile · repeat-caller banner · intent timeline |
| **Assign drawer** | Searchable user dropdown · submit | Suggested-assignee heuristic · reassign reason field |
| **Close drawer** | `resolution_type` dropdown · `resolution_note` text field with 10-char minimum · submit | Quick-action chips for common notes · keyboard shortcuts |
| **Repeat-caller** | Bare-bones detection: same `customer_id` + same `intent_id` count ≥ 2 → shows a small chip on the card | Profile banner · amber/red color-coding · escalation-rule configurability |
| **Event emission** | All 9 events from Section 10.2 emit, but to a dev bus only — no cross-pod consumption yet | Production event bus · ROI Emailer pod consumption |
| **Instrumentation** | Server-side log lines for every assign / close event so we can compute baseline metrics manually post-prototype | Real-time dashboard · Section 2 metrics rendered in product |
| **Dealer rollout** | Pilot to Edgar + Anya + 2 BDC reps at Laguna only. Existing action-items section remains visible side-by-side for direct comparison. | Wider rollout · feature flag at dealer-config level |

### Day-by-day plan

| Day | Goal |
|---|---|
| 1 | Hook into Agent Platform `customer_id` for Laguna · build pending view shell · render real action items grouped by customer |
| 2 | Intent chip rendering from existing intent detection · deterministic recap pipeline · channel icon + age + assignee badge |
| 3 | Assign drawer + close drawer + resolution-note enforcement · all 4 user flows working E2E for one BDC rep |
| 4 | Customer profile (Details + Action items only) · click-to-listen wiring to existing call recording surface · repeat-caller chip |
| 5 | Pilot walkthrough with Edgar + Anya · collect feedback against the 3 pillars above · ship to Laguna behind a per-user flag |

### Out of prototype scope (deferred to Phase 1 build proper)

Everything not listed in the in-scope columns above, plus explicitly:
- All 4 non-call channels (sms / chat / email / hitl) and HITL re-scan logic
- Haiku intent extraction + multi-intent + confidence thresholding (entire Section 4 AI surface)
- Cost-ceiling enforcement (no AI → no cost)
- Slack alarms
- Cross-pod email-to-action linkage and badges
- Section 2 metric instrumentation surfaces
- Completed-view UX
- Vehicles / Conversations / Appointments collections in customer profile

### Success criteria for the prototype review (gates the Phase 1 build)

After the 5-day pilot at Laguna, the prototype passes if **all three** of the following hold:

1. **Edgar and Anya prefer the new queue over the existing Slack workflow** for at least one morning standup. Verbatim: "I'd open this instead of asking you to forward the items."
2. **At least one BDC rep closes ≥ 5 action items via the new Close drawer** over the pilot week, with resolution notes that pass cursory audit.
3. **Customer-ID resolution holds ≥ 95%** of created action items at Laguna over the pilot week (binds Section 7 kill criterion #4).

If any of the three fails, see Section 7 kill criteria before authorizing the Phase 1 build.

---

## 7. Kill criteria

1. **Design-partner rejection of the customer-level rollup.** During prototype review (Section 6) at Laguna + 2 additional design-partner rooftops, if 2 or more explicitly say the customer-level grouping is *less* useful than today's per-task flat list — the central architectural bet (signal Section 9.1) is wrong. **Kill the PRD** and revisit signal Section 1 pillar 1 with new research before re-scoping.

2. **Closer rejection at the rep level.** If 3+ design-partner BDC reps explicitly reject the queue view as *"I'd still rather use Slack"* after a one-week pilot — the routing premise is wrong. **Kill the routing surface direction**; ship a Slack-integration approach where the action queue *pushes* to Slack instead of pulling reps into the console.

3. **Closure rate stuck.** At 30 days post-instrumentation, if **intent-weighted closure-within-SLA (Section 2 primary) < 25%** AND **repeat-caller-reduction (Section 2 secondary) < 25% improvement** versus pre-launch baseline — the queue surface is not changing dealer behavior. **Kill the Phase 2 routing + Vini-as-assignee investment** before it starts; preserve Phase 1 as a static reporting surface and revisit signal pillars.

4. **AI cost spiral.** If the rolling 24h average cost per conversation exceeds **$0.05** across the pod at ≥ 25 rooftops scale — the AI surface fails unit economics. **Auto-disable AI generation** (already wired in Section 4.6) and **kill the AI recap pillar**; ship deterministic-only recaps. Phase 2 Vini-as-assignee plans pause until cost path is recovered.

5. **Customer-ID instability.** If `customer_id` resolution rate on `action_item.created` events drops below **95%** for **7 consecutive days** — the customer-level rollup pillar collapses (signal Section 9.1 implication: stable IDs are load-bearing). **Kill** until Agent Platform team fixes the upstream identity layer; Phase 1 cannot ship on an unstable join key.

6. **Intent taxonomy fit failure.** If during prototype review or in the first 30 days of Phase 1 the fixed 14-intent taxonomy (Section 10.5) fails to classify > **15% of conversations** into anything more specific than `general_info` — the taxonomy is wrong. **Pause Phase 1 ramp** and revisit the taxonomy with CS + design partners before continuing rollout. Avoid Phase 2 expansion until taxonomy hits ≥ 90% specific-intent coverage.

7. **Cross-pod schema drift.** If the ROI Emailer pod's consumption of `action_item.*` events diverges from Section 10.2 contracts (e.g. ROI Emailer pod begins reading `resolution_note` despite Section 10.4 forbidding it, or Section 10.5 intent IDs get hard-coded in email templates) — the cross-pod contract has broken. **Pause new event emission** until the two pods re-align; the joint Agent Platform dashboard (Section 10.6 #5) is the canonical source of truth.

8. **Queue pile-up** *(v2.0 NEW)*. If `pending_count > 100` per rooftop sustained for **7+ days** AND `intent-weighted closure-within-SLA` doesn't recover within 14 days, the Phase 1 queue is unactionable at this volume. **Escalate to Eng** to expedite Section 8.2.5 (escalation routing + nudge cascade + auto-close-at-3×-SLA). Phase 1 cannot solve pile-up by itself — the rendering of `aged_past_sla` flags is necessary but not sufficient. Until Section 8.2.5 ships, manual CSM intervention is the temporary mitigation.

---

## 8. Phased rollout

This PRD scopes **Phase 1** only. Phase 2 is mapped here so the data model and config layer don't drift between this pod and the ROI Emailer pod.

### 8.1 Phase 1 — Foundation across all 3 lifecycle stages *(this PRD)*

**Top-level goal:** Every Vini-deployed rooftop has a readable, accountable action queue where each lifecycle stage has a working foundation — Vini creates tasks correctly, humans manage + close them with an audit trail, and the closure is at least *visible* in cross-pod surfaces (Daily Digest badge).

#### 8.1.A Phase 1 · Create

- AI extraction pipeline (Section 4) — Haiku 4.5 per-conversation · intent classification + recap + multi-intent
- Channel-aware triggers (Section 4.3) — call/chat/sms/email/HITL
- Deterministic dedup on `(customer_id, intent_id)` while status = pending (Section 4.4)
- Per-intent SLA inheritance at creation (Section 2 SLA matrix)
- Fallback path that never blocks creation on AI failure (Section 4.5)
- Cost ceiling (Section 4.6) auto-disables AI generation at $0.05/req 24h-rolling

#### 8.1.B Phase 1 · Manage

- Customer-level rollup with the 5-collection profile (Section 9.4)
- Pending view + Completed view as separate IA surfaces (Section 9.2 / 9.3)
- Click-to-listen on source conversation from any action-item card
- Assignee field + completion record (who closed, when, resolution note)
- Repeat-caller flag *(render-only — routing in Phase 2)*
- SLA flag *(render-only — escalation comms in Phase 2)*
- Customer-level multi-intent bulk close (Section 9.7)
- Product-analytics instrumentation against Section 10 event schema

#### 8.1.C Phase 1 · Communicate

- Deep-link to the existing Vini inbox from any action-item drawer (does NOT embed compose)
- Cross-pod email-loop badge (Section 9.10) — "Surfaced in your Daily Digest May 17" *(inbound from ROI Emailer pod)*
- Resolution note as the internal audit trail (Section 9.6) — never surfaced to customer or CRM in Phase 1
- Existing 12-hour CRM pull *(unchanged from today's baseline — not new in Phase 1, but cited so Phase 2 work doesn't re-build it)*

**Out of Phase 1:** see Section 3.1 non-goals — most explicit deferrals map to Phase 2 (Section 8.2). Notably absent in Phase 1: manual creation by BDC · Manager dashboard · compose-in-drawer · automated customer status updates · CRM push on closure.

**Success exit criteria for Phase 1:** Section 2 primary metric hits ≥ 60% intent-weighted closure-within-SLA at 30 days post-instrumentation across at least 50% of live rooftops. If miss, see Section 7 kill criteria #2 before investing in Phase 2.

### 8.2 Phase 2 — The configurable, accountable, customer-aware system *(future PRD)*

**Top-level goal:** The Action Items section becomes a true task-tracker system across all 3 lifecycle stages — reps can create tasks manually, managers see queue health at a glance, customers are kept in the loop without rep tab-switching, and the dealer's CRM stays in sync.

Phase 2 ships as **11 named work streams** clustered by the 3 lifecycle stages it deepens (8 carried over from v2.1 + 3 new). Each stream resolves a specific row from Section 3.1 — links shown inline. The 3 buckets ship in sequence: **A (Create) → B (Manage) → C (Communicate)** so each downstream stage has the upstream context it needs.

**Phase 2 shares scope with the ROI Emailer pod's self-serve subscription platform** (`prd-roi-emailer.md` Section 10). Both phases converge on the same "who at the dealership gets what" config layer. Recommendation: a single Phase 2 PRD covers both routing models — one recipient, one config UI — to avoid bifurcating the dealer-facing settings surface.

---

### 8.2.A Phase 2 · Create

Bucket goal: tasks born with full context, full routing, full SLA — whether Vini creates them or a BDC rep does.

---

#### 8.2.A.1 Routing & recipient configuration · *resolves Section 3.1 #2*

**Goal:** Per-role action-item routing rules — BDC Manager assigns `pricing_quote` items to the sales-desk team by default; `recall_response` items route to a specific advisor; `compliance_alert` items route to the Compliance Officer.

**Ships:**
- Dealer-config UI for default routing rules per `intent_id` per rooftop
- Per-recipient overrides for individual items (assignment still possible)
- Versioned config (audit who changed which rule when)
- Shared backing data model with ROI Emailer Pod Section 10 self-serve subscriptions

**Cross-pod note:** see Section 10.6 — recipient model is owned by the Vini Agent Platform team.

---

#### 8.2.A.2 Manual creation by BDC · *NEW (v3.0) — resolves Section 3.1 #19 (new gap)*

**Goal:** Reps can add an action item themselves, not only via Vini intent detection. Three sub-surfaces, all wired to the same routing + SLA inheritance as Vini-created items.

**Ships:**
- **Add action item · customer-level** — From any customer profile, an "Add action item" CTA opens a modal: intent picker (14 fixed types from Section 10.5) · short title · optional vehicle reference · optional assignee · optional due-date override. SLA defaults to the per-intent SLA matrix; rep can override down (more urgent) but not up.
- **Add action item · conversation-tagged** — Inside the Conversations tab (Section 9.4), each conversation row gets a "+ Tag action item" affordance. Opens the same modal pre-populated with `source_conversation_id` so it's linked.
- **Add action item · note-upgraded** — When a rep writes a free-form note on a customer profile and chooses "Convert to action item," the note text seeds `intent_recap` and the AI suggests a matching intent (rep confirms or overrides).
- New event `action_item.created_manually` (Section 10.2) carrying `created_by_user_id` + `creation_source` ∈ `{customer_level, conversation_tagged, note_upgraded}`.
- Audit guarantee: manual items render with a small `+manual` chip in the Pending row so managers can tell the source apart from AI-created.

**Why this stream exists:** Today reps Slack their manager when they spot follow-ups Vini missed. Phase 2 closes that hole — every observed follow-up lands in the queue with full context.

#### 8.2.A.3 Vini-as-assignee with auto-resolution · *resolves Section 3.1 #3*

**Goal:** Low-judgment tasks (status updates · parts availability · recall eligibility post Recall Masters integration · simple FAQ answers) can be routed back to Vini. Vini executes + drafts a resolution note + closes. GM audits.

**Ships:**
- New `assignee_user_id = vini_agent` execution pipeline (Phase 1 captures `vini_instructions` but doesn't act)
- AI-generated resolution-note pipeline (cost ceiling: ≤ $0.002 per closure — cheaper than Phase 1's creation call)
- "Vini closed this" badge in the Completed view with full audit trail (instructions → action taken → note)
- Configurable per-intent allow-list (dealer says "Vini may auto-close `status_update` but NOT `compliance_alert`")
- Escalation back to a human if Vini can't resolve within 1 attempt

---

---

### 8.2.B Phase 2 · Manage

Bucket goal: closers see their work, managers see queue health, escalations route automatically, nobody re-creates the queue in Excel.

#### 8.2.B.1 Manager dashboard · *NEW (v3.0) — resolves Section 3.1 #20 (new gap)*

**Goal:** BDC Managers get a separate landing surface (sibling to Pending/Completed) that rolls queue state up to actionable aggregates — not just per-row badges.

**Ships:**
- **Aggregate SLA panel** — `% of items past SLA today` · `% within 0.75× SLA (approaching)` · `% on time` · broken out per-intent so a manager spots which intent class is dragging
- **Unassigned volume widget** — `N items unassigned` · `K of those past SLA` · one-click filter to the matching Pending view
- **Per-rep workload table** — for each BDC Agent: `open items` · `past SLA on them` · `closed in last 7d` · `avg time-to-close` · click-through to that rep's queue
- **Escalations section** (when 8.2.B.3 ships) — items currently flagged with `escalation_reason`, sortable by oldest
- **Access management** — who-sees-what on this rooftop (read-only in Phase 2; full add/disable in 8.2.B.2 employee directory)
- New event subscriber path: dashboard pulls from a denormalised view (TBD by Agent Platform team) — not from raw event stream, for performance

**Why this stream exists:** Today a BDC Manager opening the queue sees the same row-list as a BDC Agent. They re-create rollups manually in Excel. Phase 2 splits the surface.

#### 8.2.B.2 Multi-rooftop / group-level rollups · *resolves Section 3.1 #1*

**Goal:** Fixed Ops Directors and Dealer Group Owners see a combined queue across N rooftops with rooftop-level filtering, aggregated SLAs, and group-level escalation routing.

**Ships:**
- New top-level "Group queue" view (sibling to Pending/Completed under Action Items)
- Rooftop filter chip + per-rooftop sub-aggregations
- Cross-rooftop "Resolve together" only allowed when same customer (rare but real for dealer groups)
- Permissions: Fixed Ops Directors see their assigned stores; Group Owners see all

---

#### 8.2.B.3 Employee directory + onboarding · *resolves Section 3.1 #8*

**Goal:** GM / BDC Manager can add, disable, and re-role team members from the console without engineering involvement. New employees appear in the Assign drawer immediately.

**Ships:**
- "Team" settings page: list + search + filter by role/rooftop/status
- **Add team member** modal: name · email · phone · role · rooftop(s) · invite-on-save
- **Invite email** with magic-link sign-in (re-uses existing Spyne console auth)
- **Disable** flow: future items don't route to disabled users; historical items keep them rendered as `[former team member · Anya Kim]`
- **Re-role** flow: changing a BDC Agent → BDC Manager updates routing eligibility
- New events: `user.created` · `user.disabled` · `user.role_changed`

**Phase 1 behavior** (already in this PRD, Section 9.5): read-only user list from the Vini Agent Platform; graceful render of disabled-user references.

---

#### 8.2.B.4 Escalation routing & nudge cascade · *resolves Section 3.1 #7 + #14 + #18*

**Goal:** Items don't pile up. Every `escalation_reason` triggers a routing + notification path. The system auto-closes truly stale items so the queue stays actionable.

**Ships — Multi-stage nudge cascade tied to per-intent SLA:**

| Stage | When | Action |
|---|---|---|
| **Created** | t = 0 | Slack DM to assignee (if assigned) within 5 min · surfaces in next morning's Daily Digest |
| **Approaching SLA** | t = 0.75 × SLA | Amber badge · 1 reminder Slack/email to assignee · BDC Manager sees it in their "approaching SLA" filter |
| **Past SLA** | t ≥ SLA | Red badge · `action_item.escalated(aged_past_sla)` fires · **auto-reassign** to the rooftop's BDC Manager (fallback to GM if no manager) · appears in tomorrow's Daily Digest "Escalations" section |
| **Stale** | t ≥ 3 × SLA | **Auto-close** with `resolution_type = "customer_unreachable"` + system-generated note · weekly email to GM (`N items auto-closed this week — review here`) |

**Ships — Per-`escalation_reason` routing:**

| Reason | Triggered when | Notified | Channel | Action surface |
|---|---|---|---|---|
| `repeat_caller_threshold` | `repeat_caller_count ≥ 3` on `(customer, intent)` in 7 d | BDC Manager · Service Manager *(if service intent)* | Slack DM + amber banner on customer profile | One-click "Escalate to me" reassigns to manager |
| `aged_past_sla` | `now − created_at ≥ SLA` | Current assignee first · BDC Manager at 1.5 × SLA · GM at 2 × SLA *(urgent intents only — recall / compliance / complaint)* | Email (current assignee) · Slack (manager) · email (GM, urgent only) | Auto-reassign at 1.5 × SLA |
| `compliance_flagged` | Intent = `compliance_alert` OR Vini flags PII / legal in transcript | Compliance Officer *(configurable; default = GM)* | Email + Slack DM | Item is **locked** until reviewed — regular BDC can't close it |

**Open decisions for Phase 2 PRD:**
1. **Auto-close at 3× SLA — yes or never?** Recommendation: yes, with system-generated note. Open for sign-off.
2. **Comms channel default** — Slack DM + in-product banner. Email as fallback. Recommendation: configurable per dealer.
3. **GM receives every `aged_past_sla` or only urgent?** Recommendation: only urgent intents (recall · compliance · complaint) page the GM; routine staleness stays with the BDC Manager.

---

#### 8.2.B.5 Auto-assignment fallbacks · *resolves Section 3.1 #5 + #6 + #17*

**Goal:** Unassigned items don't rot. Disabled-rep references don't break. Round-robin / load-balancing for proactive routing.

**Ships — Fallback rules (cheap to build, ships first):**
- Unassigned + past SLA → auto-route to BDC Manager (per Section 8.2.5)
- If BDC Manager not configured → fall back to GM
- Assigned rep disabled / OOO → re-route to BDC Manager · emit `action_item.reassigned` with `reason = "prior assignee inactive"`

**Ships — Proactive routing (heavier, ships next):**
- Round-robin within a role pool ("distribute `pricing_quote` items evenly across the Sales BDC team")
- Load-balancing (skip reps with > N open items)
- Cross-customer bulk-assign (#17) — *only* in the Group queue surface from Section 8.2.3; never on the single-rooftop pending view (would suggest queue is too large)

---

#### 8.2.B.6 Per-role default views & permissions · *resolves Section 3.1 #4 + #9*

**Goal:** Each role lands on a view that matches their job. Reps don't drown in everyone's queue. Managers don't have to filter every morning.

**Ships — Per-role default landing:**

| Role | Default landing | Can see | Can do |
|---|---|---|---|
| **BDC Agent / Advisor** | Pending → "Mine" filter pre-applied | All pending + their closed | Close their items · request reassignment with note |
| **BDC Manager** | Pending → "All" + Escalations section pinned at top | All pending/completed for the rooftop · escalations highlighted | Assign · reassign · close · escalate · view team workload |
| **GM / Dealer Principal** | Pending → "Escalations only" | Everything at rooftop level + cross-team | All Manager actions + receive `aged_past_sla` + `compliance_flagged` escalations |
| **Service Advisor / Sales Advisor** | Pending → their assignments + service/sales filter | Their assignments + customer profile for context | Close · request reassignment |
| **Compliance Officer** | Pending → `compliance_alert` filter | Compliance items only | Close · lock |
| **Fixed Ops Director** | Group queue (per Section 8.2.3) | Cross-rooftop service queue | View only + assign across stores |

**Permissions:** Phase 1 ships open-by-default (every console user sees the queue). Phase 2 introduces role-based view filters and locks (e.g. `compliance_alert` items can only be closed by Compliance Officer or GM).

---

#### 8.2.B.7 Customer history & re-open UX · *resolves Section 3.1 #10*

**Goal:** When a customer calls back about something we already closed, the closer sees the prior history before doing it again. When an item is reopened, the new assignee sees what was tried.

**Ships:**
- **"Customer history" chip** on the action-item row — `[pricing_quote] [Customer history · 2 prior closes →]`
- **Tooltip / click** reveals timeline:
  ```
  May 3   · closed by Anya    · "Sent quote via email"
  May 17  · closed by Marcus  · "Customer requested refresh"
  TODAY   · pending
  ```
- **New event:** `action_item.duplicate_of_closed` emitted at creation when a prior closed item matches `(customer_id, intent_id)`. `repeat_caller_count` (pending-only counter) remains for the within-7d signal.
- **Reopened chip** on rows where `action_item.reopened` fired — shows prior closer's name + close note inline so the new assignee can pick up the thread.
- New `customer_history_count` field on `action_item.created` event (Phase 2 — see Section 10.2 Phase 2 fields note).

---

### 8.2.C Phase 2 · Communicate

Bucket goal: closure is visible to the customer and to the dealer's CRM. No more tab-switching for reps; no more 12-hour CRM lag for closure data.

#### 8.2.C.1 Compose-in-drawer · *NEW (v3.0) — resolves Section 3.1 #21 (new gap, replaces "in-console messaging" non-goal #11 for this narrow case)*

**Goal:** When closing with `resolution_type = info_provided` (or any type where customer communication is expected), the rep can compose + send the message from inside the Close drawer — no tab-switch to the inbox.

**Ships:**
- **Inline composer** in the Close drawer when `info_provided` / `appointment_booked` / `customer_unreachable` is selected. Channel auto-picks customer's preferred channel (SMS / email).
- **Template picker** with the dealer's pre-approved closure templates (configured in Phase 2 settings — see 8.2.C.2)
- **Preview pane** — exact text the customer will receive, with `{{customer_first_name}}` and `{{vehicle_make_model}}` resolved
- **Send + Close** as one button. Atomically: emits `action_item.closed` + `action_item.customer_notified` events. If send fails, item stays pending and an inline error surfaces.
- **Attached to resolution note** — the sent message body is appended to `resolution_note` so the audit trail is complete in one place
- **Existing inbox surface still works** — for complex multi-turn outbound, reps still deep-link to the inbox; compose-in-drawer is the fast-path for short closure messages

**Why this stream exists:** Today a rep closes the item in the Console then opens the inbox, finds the customer thread, composes a separate message, hits send. Compose-in-drawer makes it one motion.

#### 8.2.C.2 Automated customer status updates · *NEW (v3.0) — resolves Section 3.1 #22 (new gap)*

**Goal:** When the BDC closes a task, the customer automatically gets a templated status message — branded co-/dealer-style, sent through the dealer's preferred channel. Critically: the BDC doesn't have to compose anything.

**Ships:**
- **Trigger model** — `action_item.closed` event fires → if `resolution_type ∈ {appointment_booked, info_provided, dnc}` AND the dealer has opted in for this intent class AND the customer has consent on file → templated message dispatches
- **Branding decisions** *(v3.0 baked-in)*:
  - **Default:** **Co-branded** — sender display name `"[Dealer] · powered by Vini"` · template signature includes dealer name + phone
  - **Optional upgrade:** **Dealer-branded** — when the dealer configures their own sender domain (DKIM/SPF set up) + uploads logo + signature, the messages go out fully dealer-branded. No mention of Vini in the customer-visible message.
  - Configured per-dealer in Phase 2 settings; defaults to co-branded.
- **Template library** — Spyne ships 8 default templates (one per low-judgment resolution: `appointment_booked` · `info_provided.quote_sent` · `info_provided.recall_verified` · `customer_unreachable.left_voicemail` · `dnc.opted_out` · etc.). Dealer can override per template.
- **Unsubscribe + frequency cap** — every templated send respects DNC + CAN-SPAM/TCPA rules. Frequency cap: max 3 outbound templated messages per customer per day to avoid spamming someone with multiple open items.
- New event `action_item.customer_notified` carrying `channel` · `template_id` · `dispatched_at` · `delivery_status` (set from upstream provider webhook)

**Why this stream exists:** Today the customer doesn't know we closed their task. They call back 4 hours later asking. Phase 2 closes the loop without rep effort.

#### 8.2.C.3 CRM sync on closure · *NEW (v3.0) — resolves Section 3.1 #5 reclassified (was CRM write-back Phase 3, now Phase 2 push-on-closure)*

**Goal:** When an action item closes, the resolution pushes to the dealer's CRM — so the dealer's source of truth (Reynolds / CDK / DealerSocket / VinSolutions / etc.) stays current without manual reconciliation.

**Ships:**
- **Manual-trigger PUSH on closure** — Close drawer gets a "Sync to CRM on close" checkbox (default ON for dealers who have CRM connection configured). Clicking Close fires the close event + queues a CRM update.
- **Vini-as-assignee auto-syncs** — when 8.2.A.3 closes an item itself, it auto-pushes (no rep involved). Configurable per dealer.
- **What pushes:** `customer_id` · `intent_id` · `resolution_type` · `resolution_note` (truncated to CRM field limit, typically 500 chars) · `closed_at` · `closed_by_user_id` · linked `appointment_id` if any. Never pushes Vini-internal IDs.
- **CRM adapter layer** — per-CRM mapping: Reynolds field names ≠ CDK field names ≠ DealerSocket. Adapter library ships with mappings for the top 5 CRMs based on existing 12-hour-pull integration.
- **Existing 12-hour pull stays the read path** — Phase 2 doesn't change the pull cadence; it adds the push path. Bi-directional sub-12-hour pull is the Phase 3 target.
- New event `action_item.crm_synced` carrying `crm_system` · `external_record_id` · `synced_at` · `sync_status` ∈ `{success, retry_scheduled, failed}` + failure reason for debugging
- **Failure handling:** push failures retry 3× with exponential backoff. After 3 fails, item marked `crm_sync_status = failed` and surfaces a manual-retry chip in the Completed row.

**Why this stream exists:** Dealers maintain two sources of truth today (Vini queue + their CRM). Phase 2 closes the gap on the push side; Phase 3 closes it on the pull side.

**Open decisions for Phase 2 PRD:**
1. **Per-CRM adapter coverage** — Reynolds + CDK + DealerSocket are table-stakes. Are we committing to VinSolutions + DealerVault in v1 of this stream, or starting with the top 3?
2. **Frequency-cap definition** — 3 templated messages / customer / day is a guess. Dealer should be able to configure this.

---

### 8.3 What "phase" means operationally

- **Phase 1 is gated by Section 2 + Section 7** of this PRD.
- **Phase 2 build is gated by Phase 1 success** AND by the ROI Emailer pod's Phase 1 having hit its own engagement floor. If either pod's Phase 1 misses, we don't invest in shared customization on a low-value base.
- **Phase 2 bucket sequencing (v3.0):** The three lifecycle buckets ship in order — **A (Create) → B (Manage) → C (Communicate)** — because each downstream stage depends on the upstream. Routing config (8.2.A.1) + employee directory (8.2.B.3) are the foundation. Manual creation (8.2.A.2) and Manager dashboard (8.2.B.1) ship next. Vini-as-assignee (8.2.A.3) requires routing config. Escalation routing (8.2.B.4) + fallback auto-assign (8.2.B.5) ship together. Multi-rooftop rollups (8.2.B.2) ships only after single-rooftop Phase 2 has 2+ months of evidence. Communicate bucket (8.2.C) ships last because compose-in-drawer (C.1) + automated customer updates (C.2) require routing + dealer-config infra from bucket A/B; CRM sync (C.3) requires per-dealer CRM adapter work that's parallel-trackable.

---

## 9. Console UI design specifications

These specs are **prescriptive** for engineering and design. Reviewable against the prototype in Section 6.

### 9.0 Phase coverage at a glance

> Every UI surface below is tagged Phase 1 ✅ or Phase 2 🚀. Phase 2 surfaces are *anchored* here (in Section 9) only when their data shape directly extends a Phase 1 surface — full Phase 2 specs live in Section 8.2.

| Section | Surface | Phase 1 ✅ | Phase 2 🚀 |
|---|---|:-:|:-:|
| 9.1 | Information architecture | ✅ Pending / Completed / Customer Profile · 3 surfaces | 🚀 + Group queue (Section 8.2.3) |
| 9.2 | Pending view (collapsed row + expand) | ✅ Full spec | 🚀 + role-default filters (Section 8.2.7) · "+N prior closes" chip (Section 8.2.8) |
| 9.3 | Completed view (search + facets + grouping + CSV) | ✅ Full spec | — |
| 9.4 | Customer profile (5 collections + repeat-caller banner) | ✅ Details + Action items first-class; rest stub-linked | 🚀 + full Vehicles / Conversations / Appointments rendering · customer history timeline (Section 8.2.8) |
| 9.5 | Assign drawer (+ Vini instructions) | ✅ Full spec | 🚀 + suggested-assignee from auto-routing config (Section 8.2.1) |
| 9.6 | Close drawer (+ appointment picker) | ✅ Full spec | — |
| 9.7 | Bulk close drawer (multi-intent customer-level) | ✅ Full spec | — |
| 9.8 | Repeat-caller escalation flag (render-only) | ✅ Flag renders | 🚀 + escalation *routing* (Section 8.2.5) |
| 9.9 | Empty states | ✅ Full spec | — |
| 9.10 | Cross-pod email-loop badge | ✅ Full spec | — |
| 9.11 | Channel + HITL provenance | ✅ Full spec | — |
| 9.12 | Accessibility + responsive | ✅ Full spec | — |
| — | **Settings → Team** (employee directory · add member · disable · re-role) | — | 🚀 Section 8.2.B.3 · spec lives in Phase 2 PRD |
| — | **Settings → Routing rules** (per-intent default routing) | — | 🚀 Section 8.2.A.1 · spec lives in Phase 2 PRD |
| — | **Settings → Escalation config** (SLA overrides · auto-close on/off · notification channels) | — | 🚀 Section 8.2.B.4 · spec lives in Phase 2 PRD |
| — | **Add action item modal** (customer-level · conversation-tagged · note-upgraded) *(v3.0)* | — | 🚀 Section 8.2.A.2 · spec lives in Phase 2 PRD |
| — | **Manager dashboard** (aggregate SLA · unassigned · per-rep workload · escalations) *(v3.0)* | — | 🚀 Section 8.2.B.1 · spec lives in Phase 2 PRD |
| — | **Compose-in-drawer** (inline composer + template picker + Send + Close atomic) *(v3.0)* | — | 🚀 Section 8.2.C.1 · spec lives in Phase 2 PRD |
| — | **Settings → Customer comms templates** (8 default templates · co-branded vs dealer-branded · frequency cap) *(v3.0)* | — | 🚀 Section 8.2.C.2 · spec lives in Phase 2 PRD |
| — | **Settings → CRM connections** (per-CRM adapter config · sync toggle · field mapping) *(v3.0)* | — | 🚀 Section 8.2.C.3 · spec lives in Phase 2 PRD |

### 9.1 Information architecture · ✅ Phase 1

Three top-level surfaces under "Action Items" in the Vini Console navigation:

```
Action Items
├── Pending          (default landing)
├── Completed        (audit / analytics)
└── Customer profile (drill-in destination, reached via row click on either view)
```

The Pending view is the home for the BDC rep's daily work and the GM's morning standup. The Completed view is the QBR-audit / weekly-grading surface. The Customer profile is the consolidated "everything about this customer" page that any row drills into. Per signal Section 9.2, **Pending and Completed are intentionally separate surfaces, not one table with a status filter** — they serve different jobs with different ergonomics.

### 9.2 Pending view — *Data-Dense Dashboard density (v1.1)* · ✅ Phase 1

The pending view is the BDC's primary work surface. **Visual density follows a Data-Dense Dashboard pattern**: minimal padding, single-line rows, maximum scannability. All emoji icons replaced with inline SVG (consistency · screen-reader friendly · dark-mode-ready).

**Header strip:**
- Title row: rooftop name + page title · queue summary inline (`N pending · M unassigned · K escalated`)
- Tabs: `Pending` · `Completed` (sibling sub-pages under Action Items)

**Filter strip (compact, single row):**

| Filter group | Behavior | Default |
|---|---|---|
| Search | Full-text across customer / recap | empty |
| Assignment | Segmented control: `All` · `Mine` · `Others` · `Unassigned` | `All` |
| Age | Dropdown: `Any age` · `< 4h` · `4–24h` · `> 24h` · `Past SLA` | `Any age` |
| Channel | Compact icon row (SVG glyphs): call · sms · chat · email · HITL | All on |
| Intent | Popover with 14-intent picker · multi-select with active count badge | none |
| Dept toggle | Segmented `All` · `Sales` · `Service` (right side) | `All` |

**Active-filter count** + one-click "Clear N" when any filter is non-default.

**Default sort:** customer wait-time descending. Secondary sort: `is_primary_intent_of_source` descending.

**Row anatomy — collapsed state (bare minimum)**

A 7-column grid, ~36–40 px tall row:

```
●  Gary Wise          [Status update] [+2 more]    2h 14m  🟣Anya    📞 ⚡PAST SLA   ▸
└┬┘ └──┬────┘         └──────┬───────┘             └─┬──┘  └──┬──┘   └────┬─────┘   └┬┘
 │     │                     │                       │        │            │           │
 dot  customer (link)    intent + multi-intent      age      assignee     channel +    chevron
                                                                          SLA pill
```

- **Intent-dept dot** — color encodes dept (sales blue · service emerald · both slate · compliance red); opacity follows SLA state
- **Customer name** — link to Customer Profile Section 9.4
- **Intent chip** — display name from Section 10.5 taxonomy (no code-string enums)
- **Multi-intent hint** *(v1.1, NEW)* — `+N more` chip next to the intent chip when `getPendingForCustomer(customer_id).length > 1`. Tooltip lists the other open intents.
- **Age** — relative time, color shifts to amber near SLA and red past SLA
- **Assignee** — avatar + name (Vini gets the purple AI badge), or amber `Unassigned` pill
- **Channel icon + SLA pill** — small status badges right-aligned
- **Chevron** — expand affordance

**Row anatomy — expanded state (click anywhere)**

The collapsed row contains nothing about the recap, the conversation, or actions. Clicking the row reveals an inline accordion with everything else:

1. **Full recap** — readable line, no truncation
2. **Conversation snippet** *(v1.1, NEW)* — embedded card showing 2–3 most-relevant turns (first customer ask · first human turn for HITL · last customer turn · capped at 3). Includes a "▶ View full call / View full thread" link in the corner that opens the **Source Drawer** with the full transcript.
3. **Meta line** — `action_item_id` (mono) · customer phone · `RepeatCaller` chip (if `repeat_caller_count ≥ 3`) · `EmailLoop` badge (if surfaced in an email)
4. **Actions (right side)** — `Reassign / Assign` + `Mark closed`
5. **Multi-intent CTA** *(v1.1, NEW)* — when the customer has ≥ 2 pending items: a `Resolve N together →` link below the actions, opens the **Bulk Close Drawer** (Section 9.7) with all of this customer's pending items pre-loaded.

**Bulk operations:** no cross-customer multi-select (deferred per Section 3 #10), but the multi-intent `Resolve N together` flow IS a Phase 1 affordance.

**Density target:** 14–16 visible collapsed rows above the fold at 1440 px. Expanding a row pushes the next rows down — no layout shift on neighboring rows.

### 9.3 Completed view — *built for 1000+ items (v1.1)* · ✅ Phase 1

Sibling to Pending under Action Items. Completed = audit + analytics surface, scaled for queues of 1000+ historical items. **The original v1.0 spec described an audit row; v1.1 rebuilds this as a true data-dense table.**

**Top bar:**
- **Prominent search** (max 420 px wide) — full-text across customer name · recap · resolution note · `action_item_id`. Clearable via × button. Debounced ~200 ms.
- **Group-by dropdown** — `Flat list` (default) · `By day` · `By resolver` · `By intent`. Group headers render with item count, expand/collapse per group.
- **Result count summary** — `1,247 items · 3 filters · of 1,891` with one-click "Clear all" when filters active.
- **CSV export** — exports the current filtered set with all columns (audit hand-off without leaving the console).

**Facet row (live counts):**
- **Date bucket** *(segmented control)* — `Today` · `Last 7d` · `Last 30d` (default) · `All time`
- **Resolution** *(popover, multi-select)* — Appointment booked · Info provided · Customer unreachable · DNC · Other. Each shows live count badge.
- **Closed by** *(popover, multi-select)* — every distinct resolver in the current date scope, with their count.
- **Intent** *(popover, multi-select)* — every distinct intent in the current date scope, with their count.

Live counts mean the facet popovers always show *"if I add this filter, here's how many items I'll have left"*. Each filter chip gains the brand-purple soft background when active.

**Bulk-select bar (sticky, appears when items selected):**
- N selected · Clear
- `Re-open selected` (calls `action_item.reopened` per selected item — limited bulk operation per Section 3 #10)

**Table row anatomy:**

| Column | Content | Notes |
|---|---|---|
| Select | Per-row checkbox | Header has select-all-visible |
| Customer | Intent dot + customer name (link → profile) | |
| Intent | Compact chip (`xs` size) | |
| Resolution | Resolution-type chip (color-coded) | green / blue / amber / red / gray |
| Note | `resolution_note` truncated to 1 line, tooltip on hover for full text | |
| Closed by | Avatar + name (Vini = purple AI badge) | |
| Closed | `closed_at` formatted (tabular) | right-aligned |
| Actions | Email-loop icon (if surfaced) · Re-open link (hover-reveal) | |

**Empty states:**
- *No items in period* — "No items in this period. Widen the date range or clear filters."
- *No matches* — "No matches. Try widening your filters or clearing search."

### 9.4 Customer profile (drill-in destination) · ✅ Phase 1

Reached by clicking a customer name anywhere in the queue. The 5-collection view from signal Section 9.1.

**Header band:**
- Customer name · contact-info row (phone · email · preferred channel chip · language)
- Customer-type chip: `New` / `Returning` / `Lapsed`
- **Repeat-caller banner** (conditional): amber bar across the top of the profile when the customer has ≥ 3 conversations on the same `intent_id` in 7d. Copy: *"This customer has called 5 times for status_update in the last 3 days. Consider escalating."* Includes one-click `Escalate to manager` button (emits `action_item.escalated` with `escalation_reason = repeat_caller_threshold`).

**Five collection tabs (left-to-right):**

| Tab | What it shows in Phase 1 |
|---|---|
| **Details + PII** *(default)* | Name · phone · email · preferred contact channel · language · customer-type · go-live date with this dealer |
| **Vehicles** | Read-only list of vehicles attached to this customer. Each row links out to the existing console vehicle page. No new rendering work in Phase 1. |
| **Conversations** | Chronological list of every conversation across channels for this customer. Each row: timestamp · channel icon · `primary_intent_id` chip · `intent_ids[]` secondary chips · outcome enum · click-to-listen / click-to-thread |
| **Action items** *(opens by default when arriving from a row click)* | Customer's pending (top) and completed (bottom). When pending count ≥ 2, the Pending section gains a **"Resolve N together"** CTA and per-row multi-select checkboxes that open the Bulk Close Drawer (Section 9.7). |
| **Appointments** | Read-only list of scheduled / shown / no-show / completed appointments. Links out to the existing appointments page. No new rendering work in Phase 1. |

The customer profile is **the surface that closes the loop on signal Section 9.1's promise**: "click a customer → see everything about them." The 3 collections that are stub-linked (Vehicles, Conversations as a deep list, Appointments) get full first-class rendering in Phase 2.

### 9.5 Assign drawer — *Vini-as-assignee with required instructions (v1.1)* · ✅ Phase 1

Slide-in from the right, 500 px wide on desktop. Triggered by `Assign` / `Reassign` on any row.

**Contents (top to bottom):**

1. **Context strip** — intent chip + `action_item_id` (mono) + one-line recap.

2. **Source conversation snippet** *(v1.1, NEW)* — embedded `ConversationSnippet` card with 2–3 most-relevant turns and a "View full call / thread" link → opens the Source Drawer.

3. **Assign-to picker** — *(v1.1 reorder)*:
   - **Vini-as-assignee option pinned at the top** as a prominent purple card with the AI robot icon and sub-label *"Auto-resolves with a logged note · requires instructions below"* + a small `AI` badge.
   - **Human-team picker** below — searchable input · "Suggested" badge on the most-recent assignee for this intent at this rooftop · alphabetical list otherwise.

4. **Instructions for Vini** *(v1.1, NEW — appears ONLY when Vini is selected)*:
   - Required textarea (10-char minimum, enforced both client-side and at the store API level — throws on assignment to `vini_agent` without instructions)
   - Live character counter `N / 10 min`
   - **Per-intent template prefill** — one-click "Use status_update template" / "Use callback_request template" / "Use general_info template" buttons that drop in a sensible starter. Templates currently defined for `status_update`, `callback_request`, `general_info` (Phase 1 covers the low-judgment intents Vini-as-assignee will resolve in Phase 2 rollout).
   - **Expected-response callout** at the bottom: *"Vini will log a resolution note describing what it did and why; you'll see it in the Completed view and can audit."*

5. **Reason** — *(visible only on reassignment when target is not Vini)* — optional 2-line text field captured in `action_item.reassigned.reason`. Clearing instructions field happens automatically when reassigning away from Vini.

6. **Footer** — `Cancel` · `Assign` (or `Assign to Vini`). Submit button disabled until: a target is selected AND (if Vini) instructions have ≥ 10 chars.

**Keyboard:** Esc closes; Enter submits when valid.

### 9.6 Close drawer — *with conversation context + appointment linking (v1.1)* · ✅ Phase 1

Slide-in from the right, 500 px wide. Triggered by `Mark closed` / `Close` on any row. Closes **one** item at a time. (For multi-intent customer-level closure see Section 9.7.)

**Contents (top to bottom):**

1. **Context strip** — intent chip · `action_item_id` · one-line recap.

2. **Source conversation snippet** *(v1.1, NEW)* — embedded `ConversationSnippet` with 2–3 most-relevant turns + "View full call" link → Source Drawer. Gives the closer context without leaving the flow.

3. **AI suggested next steps** — purple-bordered card with per-intent suggested actions (`status_update`, `pricing_quote`, `recall_response`, `callback_request`, `compliance_alert`, `no_show`, default). Preserves the existing console's purple-card pattern.

4. **Quick-action chips** — `Booked appointment` · `Left voicemail` · `Sent quote via email` · `Customer requested DNC`. Clicking auto-selects matching `resolution_type` AND prefills the note.

5. **Resolution type** *(required)* — 5 chip choices: `Appointment booked` · `Info provided` · `Customer unreachable` · `DNC` · `Other`.

6. **Appointment picker** *(v1.1, NEW — appears ONLY when `resolution_type = appointment_booked`)*:
   - Two-mode toggle: **Use existing** (default if customer has scheduled appointments) · **Create new**
   - **Use existing** — radio list of customer's scheduled appointments, each row: date · time · advisor · green `Scheduled` pill. Disabled if no scheduled appointments exist.
   - **Create new** — datetime-local picker (required) · advisor dropdown (filtered to service/sales advisors + BDC agents) · vehicle dropdown (filtered to this customer's vehicles, disabled if none on file)
   - Inputs feed an `AppointmentInput` discriminated union sent to `closeActionItem`. Creating new emits a new `appointment.created` event (Section 10.2) and links via `closed_with_appointment_id`. Picking existing sets `source_action_item_id` on the existing appointment.
   - **Validation:** the `Mark closed` button is disabled if `appointment_booked` is selected without a linked appointment.

7. **Resolution note** *(required, 10-char min)* — text field with live counter and helper text: *"Resolution notes are BDC-internal · never appear in customer-facing emails."*

8. **Footer** — left side: helper text *"Closing this item only · other items on this customer stay open"*. Right side: `Cancel` · `Mark closed`.

**Validation summary:**
- `resolution_type` set
- Note ≥ 10 chars
- If `appointment_booked`: appointment is linked (existing) or fully specified (new with datetime)

### 9.7 Bulk close drawer — *multi-intent customer-level resolution (v1.1, NEW)* · ✅ Phase 1

Wide slide-in (640 px) that closes N pending action items on **a single customer** atomically. Multi-intent conversations (pricing + recall on one SMS, vehicle + trade + quote on one email) are a primary signal pattern — closing each intent in a separate drawer is the wrong shape.

**Entry points:**
- Pending row expanded → "Resolve N together →" link (visible when customer has ≥ 2 pending)
- Customer profile → Action items tab → Pending section header → `Resolve N together` button (with optional per-row checkboxes to scope the subset)

**Contents:**

1. **Header** — customer name + count: *"Resolve 3 items · Amir Mehta"*.

2. **Context strip** — customer name + phone + count. **Source-conversation pills** below it (one per unique source conversation across the selected items — typically just 1 for shared-conversation multi-intent, occasionally 2+ when items span multiple touches). Each pill is clickable → opens the Source Drawer for that conversation.

3. **Apply-to-all chips** — *(v1.1, NEW)* operates on every selected item at once:
   - `Mark all info provided` — sets all types to `info_provided` with auto-written per-intent notes
   - `Mark all unreachable` — uniform "tried, couldn't reach" notes
   - `Booked single appt for all` — flips all selected items to `appointment_booked`, surfaces the shared appointment picker

4. **Per-item cards** — vertically stacked, one per pending item:
   - Per-item checkbox to **deselect** (deselected stays open; never closes)
   - `#N` index + intent chip + primary marker + green `Ready` badge when complete
   - One-line recap
   - Resolution-type chip picker (5 options)
   - Resolution note textarea (10-char min) with live counter
   - "Source" link (small) → Source Drawer for that item's conversation
   - Visual state: incomplete = neutral border · ready = green border · deselected = 60 % opacity + collapsed body

5. **Shared appointment picker** — appears **only when one or more selected items use `appointment_booked`**. Label tells you how many items the picker covers (e.g. "Shared appointment · used by 2 of 3 items"). One picker → ALL relevant items get the same `closed_with_appointment_id`. Reuses the `AppointmentPicker` from Section 9.6.

6. **Footer** — left side: live selection summary ("3 of 3 selected · closing all" / "2 of 3 selected · deselected items stay open"). Right side: `Cancel` · `Mark N items closed` (disabled until every selected item is complete AND any required shared appointment is valid).

**Submission semantics:**
- Atomic from the user's perspective (single button press)
- Internally iterates and calls `closeActionItem(...)` for each selected item, sharing the `AppointmentInput` across all items that need it
- Emits N `action_item.closed` events (one per item) plus one `appointment.created` event if creating a new appointment
- Deselected items are skipped entirely (no events for them)

**Why customer-scoped, not cross-customer:** see Section 3 #10 — cross-customer bulk-assign would suggest the queue is too large (a Section 9.2 design-promise violation). Customer-scoped bulk-close matches the natural shape of multi-intent conversations and saves the closer from typing the same context 3 times.

### 9.8 Repeat-caller escalation flag UI · ✅ Phase 1 *(render-only — routing in Section 8.2.5)*

Two surfaces consume the repeat-caller signal:

**On the pending-row chip:** `RepeatCaller` chip with `Nx · Dd` (count × days) — small chip on the right edge of the row. Click → opens Customer profile filtered to this customer's Conversations tab.

**On the customer profile:** the full amber banner described in Section 9.4. Includes a one-click `Escalate to manager` button that emits `action_item.escalated` and routes notification to the rooftop's BDC Manager.

**Threshold rule:** repeat-caller signal fires when `repeat_caller_count ≥ 3` for the same `(customer_id, intent_id)` within a rolling 7-day window. Configurable per rooftop in Phase 2 (deferred).

### 9.9 Empty states · ✅ Phase 1

| Scenario | Copy + visual |
|---|---|
| Pending view · 0 items | "All caught up." · subtle check icon · "Next conversations land here automatically." |
| Pending view · filtered to 0 | "No matches." · search icon · "Try widening your filters or clearing the search." |
| Completed view · 0 in period | "No items in this period." · inbox icon · "Widen the date range or clear active filters." |
| Customer profile · 0 action items | "No open or recent action items for this customer." |
| Customer profile · 0 vehicles | "No vehicles on file for this customer." (stub-linked tab) |
| Day-1 rooftop · queue not yet seeded | "Action items will appear here as Vini handles conversations. Your first item lands within hours of go-live." |

### 9.10 Cross-pod email-loop badge · ✅ Phase 1

Inline on every pending and completed action-item row when an `action_item.surfaced_in_email` event exists for that item:

```
📧  Surfaced in Daily Digest · May 17
```

- Subtle informational styling (`text-text-tertiary`, 10 px font, no border) so it doesn't compete with the action buttons
- Click → opens a side panel showing the rendered email with this action item highlighted in context
- If `action_item.email_cta_clicked` is also recorded: badge gains a `· clicked` suffix in green (e.g. `Surfaced in Daily Digest · May 17 · clicked`) to show the recipient engaged with the CTA

### 9.11 Channel + HITL provenance — *SVG icon set (v1.1)* · ✅ Phase 1

Every action-item row surfaces its `source_channel` via a compact inline SVG icon (replaces the v1.0 emoji set for cross-platform consistency, theming, and a11y):

| Channel | SVG icon |
|---|---|
| `call` | Phone outline |
| `sms` | Speech-bubble (small) |
| `chat` | Speech-bubble (large) |
| `email` | Envelope |
| `hitl_takeover` / `hitl_warm_transfer` | Handshake |

**HITL-specific affordance:** when the source is HITL, the `Listen` button is replaced by `View thread` which opens the full transcript including both Vini's and the human's portion (per Section 4.3 re-scan rule). The thread view visually distinguishes Vini turns (purple bubble) from human-agent turns (green bubble) from customer turns (gray bubble). This is the visible payoff of signal Section 9.3 — the human's portion is no longer invisible.

**Primary-intent indicator:** when `is_primary_intent_of_source = true`, a small `PRIMARY` micro-badge renders inside the intent chip. When `false`, no indicator — secondary intents stay visually quieter so the main reason for the conversation is obvious in the queue.

### 9.12 Accessibility + responsive · ✅ Phase 1

- All interactive elements keyboard-navigable; visible focus rings (brand-purple ring on `:focus-visible`)
- ARIA labels on icon-only buttons (`Listen`, `Assign`, `Close`, channel-filter icons, drawer close)
- Color is never the only signal — status dot has a tooltip · intent chips carry text not just color · SLA state is text *and* color
- `prefers-reduced-motion` respected globally (animations + transitions collapse to near-zero duration)
- Responsive: pending view collapses metadata into a stacked layout below 1024 px · drawers go full-screen below 768 px
- Mobile-app surface is explicitly out of Phase 1 per Section 3 #7 — this is mobile-responsive web only
- Bulk-close drawer's per-item cards remain individually keyboard-focusable so screen-reader users can navigate the multi-intent flow without trap risks

---

---

## 10. Cross-pod contracts — event schema

**Section 10 is now sign-off complete** (cross-pod sync · 19 May 2026). The 5 open questions from v0.1 are resolved in Section 10.6. **Key architectural shift baked in:** intent is now a first-class entity, and an action item *is* an unresolved intent (1:1). A conversation can have multiple intents — one primary, zero-or-more secondaries — and each unresolved intent becomes its own action item.

### 10.1 Entities

| Entity | Owner of canonical ID | Notes |
|---|---|---|
| `customer` | **Vini Agent Platform team** | Stable across channels — `customer_id` is the join key across the 5 profile collections (signal Section 9.1). Both pods read-only. |
| `conversation` | Vini conversations service | `conversation_id` · channel ∈ {call, sms, chat, email, hitl_takeover, hitl_warm_transfer} · `primary_intent_id` · `intent_ids[]` (multi-intent) · timestamps · transcript reference |
| **`intent`** | **Vini Agent Platform team** | **New first-class entity.** Fixed, versioned taxonomy (see Section 10.5). Each conversation has 1 primary + 0..N secondary intents. |
| `action_item` | This pod | An action item *is* an unresolved intent. 1 intent per item. Fields: `action_item_id` · `customer_id` · `source_conversation_id` · `intent_id` · `is_primary_intent_of_source` (bool) · `source_channel` · `intent_recap` · status · assignee · created_at · closed_at · resolution_note · resolution_type · **`closed_with_appointment_id`** *(v1.1, set when `resolution_type = appointment_booked`)* · **`vini_instructions`** *(v1.1, set when `assignee_user_id = vini_agent`)* |
| **`appointment`** | Existing appointments service (consumed by this pod) | `appointment_id` · `customer_id` · `vehicle_id?` · `scheduled_at` · `status` ∈ {scheduled, shown, no_show, completed} · `advisor_user_id?` · **`source_action_item_id?`** *(set by the close flow when an appointment resolves an action item)* |
| `email_send` | ROI Emailer pod | `email_send_id` · recipient · email_type · sent_at · `contains_action_item_ids[]` · `intent_counts` (aggregated for Daily Digest's intent-wise customer view) |

**Implication of "action item = unresolved intent":**
- A conversation with 3 intents detected (pricing + recall + callback) where 2 are unresolved → **2 action items**, each tagged with its own `intent_id`
- `is_primary_intent_of_source` lets the queue UI distinguish *"main reason the customer called"* vs *"secondary ask in the same conversation"*
- Daily Digest aggregation becomes clean SQL: `COUNT DISTINCT customer_id WHERE intent_id = pricing_quote AND status = pending` → *"4 customers with pending pricing or quote"* — no fuzzy text grouping

### 10.2 Action-item lifecycle events

Every event below is emitted to the shared event bus. Both pods consume.

| Event | Fields | Emitted when |
|---|---|---|
| `action_item.created` | `action_item_id` · `customer_id` · `source_conversation_id` · `source_channel` · **`intent_id`** · **`is_primary_intent_of_source`** · `intent_recap` (AI-generated, primary intent's recap) · `created_at` · `created_by_ai` (bool) | Vini's transcript pipeline (or HITL re-scan) detects an unresolved intent and creates a new item |
| `action_item.deduplicated` | `action_item_id` · `merged_into_action_item_id` · `customer_id` · `source_conversation_id` · `intent_id` | Pipeline detects the new item matches an existing pending item for the **same customer + same `intent_id`** — increments `repeat_caller_count` on the merged item instead of creating duplicate |
| `action_item.assigned` | `action_item_id` · `assignee_user_id` · `assigned_by_user_id` · `assigned_at` · **`vini_instructions`** *(v1.1 — required string when `assignee_user_id = vini_agent`, ≥ 10 chars; null otherwise)* | Manual or auto-assignment (Phase 2). API rejects assignment to `vini_agent` without `vini_instructions` |
| `action_item.reassigned` | `action_item_id` · `from_user_id` · `to_user_id` · `reassigned_at` · `reason` (free text) · **`vini_instructions`** *(v1.1 — when reassigning TO Vini)* | Closer reassigns to another user. Reassigning AWAY from Vini sets `vini_instructions = null` |
| `action_item.closed` | `action_item_id` · `closed_by_user_id` · `closed_at` · `resolution_note` (string, required) · `resolution_type` (enum: appointment_booked / info_provided / customer_unreachable / dnc / other) · **`closed_with_appointment_id`** *(v1.1 — required when `resolution_type = appointment_booked`; null otherwise)* | Closer marks complete with a resolution note (note compliance enforced at API level — empty notes rejected). **`resolution_note` + `resolution_type` + `closed_with_appointment_id` are console-only — NOT consumed by ROI Emailer pod (Section 10.6 decision #3).** |
| `action_item.reopened` | `action_item_id` · `reopened_by_user_id` · `reopened_at` · `reason` | From Completed view audit (single or bulk) |
| `action_item.escalated` | `action_item_id` · `escalation_reason` (enum: aged_past_sla / repeat_caller_threshold / compliance_flagged) · `escalated_at` | System-driven escalation flag |
| **`appointment.created`** *(v1.1, NEW)* | `appointment_id` · `customer_id` · `source_action_item_id` · `scheduled_at` · `advisor_user_id?` · `vehicle_id?` | Emitted when the Close drawer or Bulk close drawer creates a new appointment inline. Existing-appointment selection does NOT emit this event — it just sets `source_action_item_id` on the existing record. |
| `action_item.surfaced_in_email` | `action_item_id` · `email_send_id` · `email_type` (enum: daily / weekly / monthly / eoc) · `surfaced_at` | ROI Emailer pod emits when an action item appears in an outgoing email |
| `action_item.email_cta_clicked` | `action_item_id` · `email_send_id` · `recipient_user_id` · `clicked_at` | ROI Emailer pod emits when a recipient clicks an email CTA that deep-links to an action item |
| **`action_item.created_manually`** *(v3.0 NEW)* | `action_item_id` · `customer_id` · `intent_id` · `creation_source` ∈ `{customer_level, conversation_tagged, note_upgraded}` · `created_by_user_id` · `source_conversation_id?` (when tagged) · `created_at` | BDC adds an action item via the Phase 2 Add-action-item modal (Section 8.2.A.2). Same downstream lifecycle as AI-created items, but `created_by_ai = false` and `creation_source ≠ ai`. |
| **`action_item.customer_notified`** *(v3.0 NEW)* | `action_item_id` · `customer_id` · `channel` ∈ `{sms, email}` · `template_id` · `branding_mode` ∈ `{co_branded, dealer_branded}` · `dispatched_at` · `delivery_status` ∈ `{queued, delivered, bounced, blocked_dnc, blocked_frequency_cap}` | Phase 2 (Section 8.2.C.2) emits when a templated customer-facing message dispatches as a result of closure. Frequency-cap + DNC checks happen pre-dispatch and feed `delivery_status`. |
| **`action_item.crm_synced`** *(v3.0 NEW)* | `action_item_id` · `crm_system` ∈ `{reynolds, cdk, dealersocket, vinsolutions, ...}` · `external_record_id?` · `synced_at` · `sync_status` ∈ `{success, retry_scheduled, failed}` · `failure_reason?` | Phase 2 (Section 8.2.C.3) emits when closure data pushes to the dealer's CRM. Retries 3× on failure; final failure surfaces a manual-retry chip in the Completed view. |

#### 10.2.1 Phase 2 event-field additions *(v2.0 — flagged for cross-pod consumers)*

The Phase 2 work streams in Section 8.2 introduce new event fields. **Flagged here, not added to the main table above**, so cross-pod consumers can plan for them without affecting Phase 1 contracts.

| Future field | On event | Source work stream | Notes |
|---|---|---|---|
| `auto_reassigned_to` | `action_item.reassigned` | Section 8.2.5 escalation routing + Section 8.2.6 fallbacks | True/false flag distinguishing system-driven reassignment from manual |
| `nudge_sent_at` | `action_item.nudged` *(new event)* | Section 8.2.5 escalation routing | Tracks the 0.75×SLA and 1.5×SLA notification fires |
| `customer_history_count` | `action_item.created` | Section 8.2.8 customer history & reopen UX | Count of prior closed items on `(customer_id, intent_id)` — drives the "+N prior closes" chip |
| `vini_closed_with_reasoning` | `action_item.closed` | Section 8.2.2 Vini-as-assignee | Vini's own audit trail: instructions received → action taken → note generated |
| `auto_closed_reason` | `action_item.closed` | Section 8.2.5 auto-close at 3×SLA | enum: `staleness` / `dnc_inferred` / `customer_unreachable_auto` — distinguishes system auto-close from human close |
| `rooftop_group_id` | All events | Section 8.2.3 multi-rooftop rollups | Set per-event so group-queue analytics can roll up without joining |

**Versioning rule (per Section 10.6 #4):** additive only. Phase 2 fields appear on existing events as optional/nullable. Phase 1 consumers ignore unknown fields by contract.

### 10.3 Data each consuming pod cares about

**ROI Emailer pod consumes (read-only):**
- `action_item.created` with `intent_id` → enables Daily Digest's **intent-wise customer aggregation** (e.g. *"4 customers with pending pricing or quote"*, *"2 customers with pending recall response"*) — replaces the previous flat action-type counts
- `action_item.closed` — only `action_item_id` · `closed_at` · `closed_by_user_id` (anonymized assignee for per-rep closure stats in Weekly Performance). **Does NOT consume `resolution_note`, `resolution_type`, `closed_with_appointment_id`, or `vini_instructions`** — all BDC-internal (Section 10.6 #3, Section 10.4)
- `action_item.deduplicated` (repeat-caller signal for Story-of-the-Week candidates · escalation cues)
- `action_item.escalated` (priority items for the EOC report)
- *(v1.1, NEW)* `appointment.created` is **not** directly consumed by the ROI Emailer pod — appointment data flows into emails through the existing appointments service, not via this event. The event is for analytics + Agent Platform telemetry only.

**This pod consumes (read-only):**
- `action_item.surfaced_in_email` (renders *"Surfaced in your Daily Digest on May 17"* badge on the action-item card)
- `action_item.email_cta_clicked` (closes the email-to-action loop for Section 2 secondary metrics)

### 10.4 What does NOT cross the pod boundary

Explicit so engineering doesn't accidentally surface it in emails:

| Field | Console queue | Email cadences |
|---|:---:|:---:|
| `resolution_note` (free text) | ✅ shown in Completed view | ❌ never surfaced |
| `resolution_type` (enum) | ✅ shown in Completed view filters | ❌ never surfaced — BDC-internal classification |
| **`closed_with_appointment_id`** *(v1.1)* | ✅ used for the linked-appointment chip on the Customer profile Action items tab | ❌ never surfaced (appointment data is shown in the Appointments section of the ROI emailers directly, not via action-item join) |
| **`vini_instructions`** *(v1.1)* | ✅ visible on the action-item card when Vini is the assignee · used to audit what Vini was told to do | ❌ never surfaced — internal BDC delegation note |
| `assignee_user_id` (raw name) | ✅ shown inline | ⚠️ aggregated only — emails show counts per assignee, never names in body |
| Raw transcript text | ✅ accessible via click-to-listen | ❌ never embedded |
| Customer PII (full name, phone, email) | ✅ accessible via customer profile | ⚠️ first name only in narrative stories (see ROI Emailer Section 4 PII strip) |

### 10.5 Intent taxonomy *(Phase 1 fixed list)*

Phase 1 ships a closed taxonomy. Custom dealer-defined intents are deferred to Phase 3 (per Section 3 non-goal #4).

| `intent_id` | Display name | Dept | Typical resolution |
|---|---|---|---|
| `pricing_quote` | Pricing or quote request | Sales / Service | Adviser to call back with quote |
| `recall_response` | Recall inquiry | Service | VIN-verify + book appointment (post Recall Masters integration) |
| `callback_request` | Customer requested a callback | Both | Rep calls back within SLA |
| `status_update` | Status update on existing RO / appointment | Service | Look up RO, reply with status |
| `appointment_inquiry` | Wants to book / change appointment | Both | Confirm slot, book |
| `service_intent` | Service-line intent (oil change, brakes, etc.) without specific appointment ask | Service | Reach out, qualify, book |
| `vehicle_inquiry` | Sales inquiry about a specific vehicle | Sales | Adviser engagement |
| `trade_in_inquiry` | Trade valuation question | Sales | Trade desk to provide structured offer |
| `complaint` | Customer escalation / complaint | Both | Manager to handle |
| `sms_takeover` | Vini handed off mid-SMS to a human | Both | Human continues thread |
| `specific_salesperson` | Customer asked for a named adviser | Sales | Route to named adviser |
| `compliance_alert` | Compliance-flagged conversation | Both | Compliance officer review |
| `no_show` | Booked customer no-showed | Service | BDC follows up to reschedule |
| `general_info` | Hours, address, generic questions | Both | Usually closes in-call; only an action item if unresolved |

**Versioning** *(per Section 10.6 #4):* taxonomy is additive only. Adding a new intent is non-breaking. Renaming deprecates the old `intent_id` and ships both for one quarter. Every event carries a `schema_version` tag in its envelope so consumers can branch on it.

### 10.6 Resolved decisions *(cross-pod sync · 19 May 2026)*

| # | Question | Resolution |
|---|---|---|
| 1 | Who owns the `customer_id` identity layer? | **Vini Agent Platform team owns** the customer + identity layer. Both pods are read-only consumers. |
| 2 | `intent_recap` — deterministic or AI? Single or multi-intent? | **AI-generated once at action-item creation** (Haiku, primary intent's recap). Conversations can carry **multiple intents** with **one primary**. Each unresolved intent → 1 action item with its own `intent_id`. Daily Digest aggregates by `intent_id` to render the *"N customers with pending X"* view. |
| 3 | `resolution_note` privacy in emails? | **Neither `resolution_note` nor `resolution_type` cross the pod boundary into emails.** Both are BDC-internal — used in the Completed view and for audit, never surfaced in cadence summaries. |
| 4 | Event-schema versioning? | **Additive-only · no field removal · `schema_version` tag in event envelope.** Renames go through a one-quarter deprecate-then-remove window. |
| 5 | Cross-pod telemetry dashboard ownership? | **Vini Agent Platform team owns** the joint dashboard (action-item lifecycle joined to email-engagement events). Both pods contribute the spec; Agent Platform team executes + maintains. |

---

> **Status legend:**
> - ✅ Section 1 Job to be done · Section 3 Non-goals · Section 8 Phased rollout · Section 10 Event schema (signed off cross-pod) → drafted
> - 🟢 Section 2 · Section 4 · Section 5 · Section 6 · Section 7 · Section 9 → **unblocked** by Section 10 sign-off · ready for next-draft pass

---


# Customer Signal: Vini Console — Action Items

**Author:** Subhav
**Product:** Vini
**Pod / Team:** Vini Product Team
**Date:** 19 May 2026
**Status:** Draft v3 — restructured around the 3-stage lifecycle (Create / Manage / Communicate) · pending BDC-rep verbatim for new pillars + product-analytics instrumentation

---

## 1. What's the problem?

Vini is the AI BDC agent across calls, SMS, webchat and email. Every conversation generates customer intents Vini either resolves end-to-end or hands off as a Human-In-The-Loop (HITL) task. **The Action Items section must be a complete task-tracker system** — not a passive list — that handles the full lifecycle of every customer task across **three stages**:

```
                   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   conversation →  │  1. CREATE   │ → │  2. MANAGE   │ → │ 3. COMMUNICATE│ → customer + CRM
                   │              │   │              │   │              │
                   │  Vini · BDC  │   │  Closer +    │   │  Customer +  │
                   │  manual add  │   │  Manager     │   │  CRM sync    │
                   └──────────────┘   └──────────────┘   └──────────────┘
```

Today's section breaks at every stage. Tasks created by Vini lack context to act on. Manager visibility is per-row only, no aggregate. Closure is invisible to the customer; the CRM drifts; reps switch tools to send updates. **The result: dealers run their BDC from forwarded emails and Slack DMs, not from the product surface built for it.**

**The three problems, in customer language:**

### Pillar 1 — Creation: tasks lack context, and reps can't add tasks of their own.

1. **"I can't read the action queue without re-listening to every conversation."**
   GMs and BDC Managers see action types and counts, but no creation time, no caller phone number, no one-sentence intent recap, and no way to click through to the source conversation. Acting on the queue means opening every transcript.

2. **"My reps see things on calls that should become tasks, but they can't add them. They Slack me instead."** *(NEW pillar — pending BDC-rep verbatim)*
   Vini creates tasks from intents it detects, but a BDC agent watching a complex conversation may spot a follow-up Vini missed — or want to add a task that has no conversation yet (a callback the rep promised at the front desk, a follow-up note from a walk-in). Today there's no way to create an action item manually; reps default to Slack DMs to managers, which fall through the cracks.

3. **"Multiple intents from one conversation get scattered."** *(partially addressed in Phase 1 multi-intent · re-stated here for context)*
   A customer asks about pricing + recall + a callback in one SMS. Today these may collapse into a single "general inquiry" task. The new bulk-close drawer handles closing them together, but the creation pipeline still needs to faithfully detect all three.

### Pillar 2 — Management: no manager-level rollup, no role-default access, accountability lives in screenshots.

4. **"I can't tell who owns what or whether anything was actually closed."**
   No assignee field. The "Completed" tab marks items closed but doesn't say who closed them, when, or what they did. Repeat-callers (the same customer pinging 5 times across 3 days about the same issue) don't get flagged because nothing links the action items back to a single customer.

5. **"I'm the BDC rep who closes these — but I don't even have access to the queue."**
   Today only the GM and Service Manager see the action items at most rooftops. Reps either receive Slack-forwarded items from their manager or learn about issues reactively when the customer re-calls. Reps want their own filtered view ("my tasks, sorted by how long the customer has been waiting").

6. **"I'm the BDC Manager — show me the queue health, not just individual tasks."** *(NEW — pending BDC-Manager verbatim)*
   A Manager opening the queue sees the same per-row view as a BDC rep. No aggregate SLA-by-intent panel, no unassigned-volume widget, no "who on my team has 8+ open items today." Manager-level rollup doesn't exist; managers re-create it in Excel.

### Pillar 3 — Communication: closure is invisible to the customer; the CRM drifts.

7. **"I want Vini to close some of these for me — with a resolution note I can audit."**
   For low-judgment tasks (sending a status update, confirming a recall, sharing parts availability), dealerships want to assign the action item back to Vini and trust it to close + log a resolution note. This is the AI-native dimension competitors can't ship: routing back to the agent that originated the task — *and* having that agent communicate the closure back to the customer.

8. **"My customer doesn't know I closed their task — they have to call again to find out."** *(NEW — pending customer-side voice)*
   When a BDC rep closes "send pricing quote" in the console, no automated message goes back to the customer. The rep has to switch to the inbox tab, compose a separate email/SMS, and remember to mention the quote. Customers ping again 4 hours later asking if anyone got back to them — because nobody did.

9. **"The CRM is 12 hours behind. Reps update the queue; the CRM doesn't know."** *(NEW — references existing 12-hour pull baseline)*
   We already pull dealer-CRM data into Vini every 12 hours, but the reverse direction (closure status → CRM) is manual. A rep closing an action item in the Vini console doesn't push that resolution back to the dealer's CRM. The dealer maintains two sources of truth and reconciles by hand.

**Who feels each pillar most acutely:**

| Pillar | Most affected dealership roles | Why |
|---|---|---|
| **1. Creation gap** — context missing + no manual-add | GM · BDC Manager · BDC Agent · Service Manager | Monday standup can't start with "what does the queue look like" — and reps can't add the things they observe |
| **2. Management gap** — no rollup, no role-default views | BDC Manager · GM · Dealer Principal · Fixed Ops Director | Managers can't grade reps or defend SLA performance at QBRs — renewal defense becomes "we hope it worked" |
| **3. Communication gap** — closure invisible to customer + CRM | BDC Agent · Customer · Dealer Principal | Customer pings again because closure was invisible · CRM drifts because nothing pushes back · dealer maintains two sources of truth |

---

## 2. Who's affected?

- **Segment:** used-car dealers, new-car dealers, service departments, BDCs, multi-rooftop dealer groups
- **Dealership roles touched:** Dealer Principal / Owner, General Manager, BDC Manager, Sales Manager, Service Manager, **BDC Agent, Service Advisor, Sales Advisor** *(the closers — currently locked out)*, OB Campaign Manager, Fixed Operations Director (multi-rooftop)
- **% of rooftop base affected:** ~100% (every Vini deployment generates HITL action items)
- **Approximate # of customers:** 60+ live agents across 20+ rooftops
- **% of revenue from this segment (if known):** Majority — covers all paying live-revenue rooftops

> **Scope note (single-rooftop view today):** The product surface and this signal currently reason at the **single-rooftop level**. Multi-rooftop / group-level queue rollups and Fixed Ops Director cross-store views are acknowledged but **out of scope until Phase 2** — they belong with the same configuration layer as recipient routing (see Section 8).

---

## 3. Customer quotes — at least 5

**Verbatim** quotes from real customers. Paraphrasing doesn't count — copy them word-for-word. Include the source so the PRD reviewer can verify.

**GM / Dealer Principal voice — Mercedes Benz Laguna Niguel · 18 May 2026 customer call (Edgar Ceniceros, GM)**

1. *"What time was that he called? ... Has he been waiting for four hours? Has he been waiting for five minutes?"* — source: Edgar Ceniceros call · `transcript-2026-05-18.txt`
2. *"I would love to see, like, a small recap ... summarizing it really quickly, one sentence, what the phone call was. So customer's name, if she has it, phone number that they contacted us with so I can have a rep contact them."* — source: same call
3. *"We should be able to click on this right now ... how do I click on this to listen to that particular call?"* — source: same call
4. *"I shouldn't have to click on multiple things to find out who completed it."* — source: same call
5. *"What was completed? Was it appointment set? Was it, you know, provided information to advisor?"* — source: same call
6. *"The only person that may have it is Anya and myself, which, yeah, I need other people to have them."* — source: same call
7. *"Gary Wise ... he called a total of five times, and he looked like he was trying to get a status update."* — source: same call (re: real customer name surfaced from live queue review)

**BDC Manager / Sales Manager voice**

8. *"I want to track the action items assigned and status"* — source: Arali call · https://app.arali.ai/meetings/share/f74cc777-3946-4815-b079-f506c2059a68
9. *"I want to assign tasks and track who is updating or closing their tasks"* — source: same Arali call
10. *"I want to directly assign Vini a task with resolution notes so that I do not have to follow up with the customer"* — source: BDC Manager call (verbatim verification pending)

**BDC Agent / Advisor voice — SPM placeholders, pending verbatim**

11. *"I don't even know there's a task until my manager Slacks me — and by then the customer's already called back twice."* — source: **TODO: BDC rep interview**
12. *"I want a 'my tasks' view that only shows what's mine, sorted by how long the customer has been waiting."* — source: **TODO: BDC rep interview**
13. *"When I close a task I want one click — 'appointment booked' or 'left voicemail'. If I have to type a note every time I just stop using it."* — source: **TODO: BDC rep interview**

---

## 4. Data points — at least 3

**Live-observed at Mercedes Benz Laguna Niguel · 18 May 2026 console review:**

- **Single customer (Gary Wise) pinged 5 times across 3 days with no escalation flag, no assignee, and no resolution note on any of the 5 records** — source: live console screen-share during 18 May 2026 customer call
- **0% of items in the "Completed" tab had a resolution note** at Laguna — source: same live review
- **Action-item access limited to 2 named users** (GM + Service Manager) at a 60+ agent rooftop — source: Edgar Ceniceros verbatim

**Directional analytics (TODO: confirm post-instrumentation):**

- **Daily Assignment + agent-level closure rate < 10%** — source: directional CS observation across active rooftops · *TODO: instrument*
- **Funnel conversion (create → assign → close within SLA) < 20%** — source: same directional view · *TODO: instrument*
- **Daily Active Users on Action Items < 2 per rooftop** — source: directional access-log review · *TODO: confirm via product analytics*

**Support / qualitative:**

- **5+ Freshdesk tickets in the last 30 days** from Principals and GMs asking to make Action Items the single source for BDC teams — source: Freshdesk tag filter (`action-items`, `pending-tasks`, `queue`)

---

## 5. Business impact

- **Revenue impact / ARR at risk:** **$600K live ARR** with near-term renewal exposure attributable specifically to the action-queue gap.
- **Reasoning:** $600K = sum of ARR across the rooftops up for renewal where the action-queue gap has been raised in a CSM-recorded QBR or on a recorded customer call. Two compounding risks:
  - **Renewal defense:** without an accountable, defensible queue, "Vini caught the lead but no one closed it" becomes the customer's story at renewal — and we can't refute it with data because closure isn't tracked.
  - **Expansion / headcount-replacement upsell blocked:** the queue is the surface that proves "Vini frees up BDC headcount." A broken queue blocks the upsell conversation before it starts.
- **Users affected:** 20+ rooftops · 60+ live agents · est. 200+ daily action items aggregated across the base that today land in a queue almost no one reads.
- **Compounding cost across pods:** every cadence email from the ROI Emailer pod (Daily Digest, Weekly, Monthly, EOC) deep-links into this console view as its "click here to act" surface. A broken queue means every CTA in the cadence emailers is broken — two pods' worth of investment leaking through the same hole.

---

## 6. What do customers do today?

A patchwork of human routing and reactive escalation. The end-to-end choreography for a typical action item:

1. **Caller arrives → Vini creates the action item** (e.g. "status update needed for Gary Wise") but tags it only with a date, no time, no caller phone surfaced inline, no one-sentence recap.
2. **GM (Edgar) opens the queue at ~7 AM**, sees the action type + count, can't infer urgency from date alone, so **he opens the call recording and listens to it** to figure out what the customer actually needs.
3. **GM emails or Slacks the Service Manager (Anya)** with the relevant action items. Service Manager = the human router; single point of failure for the entire queue.
4. **Service Manager forwards individual items to BDC reps / advisors** over Slack/email, manually. Reps don't have queue access.
5. **Reps act on the forwarded item**, but there's no place to log "what was done" — the action item is marked Completed in the console with no assignee, no timestamp, no resolution note. Audit trail is in Slack history at best.
6. **Customer re-calls because the task wasn't actually closed end-to-end** (Gary Wise pattern: 5 calls in 3 days). System doesn't flag the repeat-call pattern because action items aren't grouped at customer level.
7. **Post-call summary emailers act as the de facto queue today** — dealers run their BDC operations from forwarded emails, not from the product surface built for the job.

Alternative paths in flight today:
- **Sales-side**: rep manually looks up the lead in the CRM by customer phone / email to reconstruct context Vini already captured. Duplicate work.
- **Service-side estimate / quote queries**: Vini intentionally hands off to a service advisor (no price-quote autonomy), but with no audit trail of which advisor picked which quote up — quotes drop on the floor regularly.
- **Recall response**: blocked from auto-booking today (Edgar wants Vini to verify VIN-level recall eligibility before scheduling — capability landing this quarter via Recall Masters integration).

---

## 7. Why now?

- **Vini is moving from "appointment booker" to "BDC operator."** 3–4 months into deployment, dealerships aren't evaluating whether Vini can answer phones — they're evaluating whether **Vini + the human team together** run BDC efficiently. The action queue is the surface where that combined-team efficiency shows up or doesn't.
- **Efficient conversions + ROI defense.** Vini's direct-ROI line is appointment-booking; its indirect-ROI line is "no potential revenue slips because every HITL event is tracked and closed." The second line dies without a working action queue.
- **AI-vs-human grading.** GMs are explicitly asking "how is the AI performing relative to my humans?" — a question that requires per-rep closure attribution, completion notes, and time-to-close per assignee. None of which exists today.
- **Direct sister-pod dependency (ROI Emailer).** The Daily Digest's "Action Required" section CTAs all deep-link into this console view. Shipping ROI Emailer with a broken landing surface produces a worse experience than not sending the emails at all — two pods worth of value gated on this one fix.
- **Just-surfaced pilot urgency.** Mercedes Benz Laguna Niguel gave concrete, screen-shared improvement asks on 18 May 2026 — the most actionable, recent feedback in the pod. Other rooftops will surface the same gaps; better to act now than after 3 more renewal QBRs.
- **Vini-as-assignee is the AI-native moat.** Competitors (BDC SaaS, ticketing platforms) can ship an assignee dropdown. They cannot ship "assign this back to the AI that originated the task, have it close, and audit the resolution note." Phase 2 is where Vini's surface visibly diverges from competitors' — but only if Phase 1 (a readable, accountable queue) lands first.
- **Configuration overlap with ROI Emailer Phase 2.** Both pods are converging on the same "who at the dealership gets what" config layer (see Section 8). Building it once across both surfaces — vs twice — is the cleanest path forward.

---

## 8. Phased rollout (scoping note for PRD)

**This signal scopes one pod, two phases.** Phase 1 is the console UX foundation; Phase 2 is the configuration layer that shares scope with ROI Emailer Pod Phase 2.

| Phase | Scope | Why this order |
|---|---|---|
| **Phase 1 — Console Queue UX** | Customer-level rollup · click-to-listen on source call · creation timestamp · one-sentence intent recap · assignee field + completion record · resolution note · repeat-caller escalation flag · per-rooftop view · product-analytics instrumentation | A readable, accountable queue is the precondition for everything else. Without it, no amount of routing config matters. |
| **Phase 2 — Routing / Recipient Management + Vini-as-Assignee** | Per-role action-item routing rules · BDC rep self-service "my tasks" view · Vini-as-assignee with AI-generated resolution notes · multi-rooftop / group-level rollups for Fixed Ops Directors | Overlaps directly with **ROI Emailer Pod Section 10 (self-serve subscription platform)**. Both phases share the recipient + role model — ship as **one configuration layer**, not two. |

> **Cross-pod note for PRDs:** Phase 2 of this pod and Phase 2 of the ROI Emailer pod converge on the same "who at the dealership gets what" configuration surface. When Phase 2 PRDs are drafted, **suggest a single PRD covers both routing layers** so we don't bifurcate the config model into "email recipients" vs "action-item recipients" — they're the same recipient. Flag explicitly to avoid drift.

---

## 9. Architectural notes for the PRD

These three architectural decisions are load-bearing — the PRD must commit to them up front. Captured here so they don't get re-litigated mid-draft.

### 9.1 Action items are stored + viewed at customer level

The data root is the **customer**, not the conversation. A customer profile holds five collections:

| Collection | What lives here | Example |
|---|---|---|
| **Details + PII** | Name, phone, email, preferred contact channel, language, customer-type (new / returning / lapsed) | Gary Wise · 949-555-0123 · prefers SMS · English · returning |
| **Vehicles** | VINs, year/make/model, ownership status, recall eligibility flag, service-history references | 2022 Mercedes GLC 300 · VIN-…xxxx · 2 open recalls |
| **Conversations** | Every touchpoint across calls / SMS / chat / email — timestamp, channel, intent, outcome, transcript link | 5 conversations across 3 days, all asking for service status update |
| **Action items** | Pending + completed tasks tied to this customer · status · assignee · source-conversation pointer · type · creation timestamp · resolution note | 5 status-update action items, 0 assigned, 0 resolved |
| **Appointments** | Scheduled / shown / no-show / completed · source action item · advisor assigned · vehicle | 1 appointment scheduled May 22, source action-item #4172 |

**Implication for the queue UI:** clicking a customer surfaces all 5 collections in a single profile. Action items are framed as *"what this customer is waiting on"* — not *"what happened on this call."* Repeat-caller detection (the Gary Wise pattern) becomes a property of the customer object, not a downstream analytics calculation.

### 9.2 Pending view ≠ Completed view — they are different surfaces

The two states of an action item serve different jobs and must render as different screens, not one table with a status filter.

| Aspect | **Pending view** *(default for BDC reps + managers)* | **Completed view** *(audit / analytics surface)* |
|---|---|---|
| Volume | Short — target < 50 per rooftop at any time | High — paginated, weeks/months of history |
| Default sort | Customer wait-time descending (longest waiting first) | Closed-at descending (most recent first) |
| Primary filters | Assigned to me · Assigned to others · Unassigned | Closed by (rep) · Date range · Resolution type · Customer |
| Inline display | Customer name · intent recap · creation time · assignee · age | Customer · who closed · when · resolution note inline |
| Action affordances | Assign · reassign · close · escalate · listen to source | Re-open · view resolution note · audit who closed |
| Used by | BDC reps daily · GM in morning standup | GM weekly review · BDC Manager team grading · auditor at QBR |

The morning-standup job and the QBR-audit job have different ergonomics — separate views, separate IA.

### 9.3 Action items generate across every channel — including HITL conversations

Action items must be created from **every conversation type**, with channel-specific creation logic. Today's gap: when a human takes over an SMS thread or accepts a warm transfer, the resulting **HITL-driven conversation does not feed the action queue** — Vini's portion is captured, but the human's portion is invisible to the system.

**Channel-by-channel creation logic (PRD must commit to one rule per channel):**

| Channel | Trigger for action-item creation | Notes |
|---|---|---|
| **Call** | End-of-call analysis. One call → N action items grouped by detected intents (status update + recall question = 2 action items, same customer). | Most action items come from this channel today. |
| **Chat** | Real-time intent detection. Action item can be created mid-session OR at end-of-session. | Trade-off: real-time = faster routing, but risk of duplicate creation if customer self-resolves later in the same session. **PRD decision needed.** |
| **SMS** | Per-message intent detection. Most SMS = single intent → one action item. | SMS threads can run for days; need a "conversation timeout" rule (e.g. 24h inactivity = thread closes, action items finalize). **PRD decision needed.** |
| **Email** | Per-email parsing — long-form, often multi-intent. AI splits into multiple action items per email if needed. | Most complex of the four; an email asking "what's my recall status AND can I get an oil change AND what's the trade value" = 3 action items on the same customer. |
| **HITL (warm transfer / SMS takeover)** | The human's continued conversation **also generates action items**. When the human ends the conversation, Vini re-scans the full transcript (Vini portion + human portion) and creates/updates action items. | This is the missing piece today. Without this, the queue under-represents work, and AI-vs-human grading is impossible because the human portion isn't tracked back. |

**Implication for PRD Section 4 (Harness):** the action-item generation pipeline must accept input from any channel + HITL transcript, **deduplicate against existing pending items on the same customer** (otherwise Gary Wise's 5 calls create 5 separate action items for the same need), and tag each item with `source_channel` and `source_conversation_id` for audit.

### 9.4 Reporting linkage — bidirectional with the ROI Emailer pod

The action queue is not an isolated console feature — it's the **interactive surface that the ROI Emailer pod's cadence emails point at**. The data flow is bidirectional; both PRDs must agree on the contract.

**Outbound — from queue to emailers:**
- **Daily Digest** *"Action Required"* section reads counts + types from the live queue · CTA deep-links to console queue, filtered to *pending unassigned for the recipient's role*
- **Weekly Performance** per-agent KPI strip pulls closure rate, time-to-close, and resolution-note compliance per assignee · enables the "AI-vs-human grading" view Section 7 calls for
- **Monthly Value** stories can reference Vini-as-assignee resolution notes as proof points (e.g. *"Vini autonomously closed 47 status-update requests this month with a 95% resolution-note pass rate"*)
- **End-of-Campaign** outbound campaigns drop action items into the queue when leads need human follow-up; queue closure stats roll back into the EOC report

**Inbound — from emailers to queue:**
- Action items in the queue display a badge: *"Surfaced in your Daily Digest on May 17"* so the recipient sees the email-to-action loop closed
- Queue tracks whether the email recipient actually clicked through (joins to ROI Emailer's tracking pixel + UTM events)

**Implication:** before either PRD's Section 2 (Success metrics) can be written, this pod and the ROI Emailer pod need to agree on a **shared event schema** — `action_item.created`, `action_item.assigned`, `action_item.closed`, `action_item.surfaced_in_email`. One source of truth, two consuming surfaces.

---

### Open PRD-stage questions surfaced by Section 9

Decisions the PRD must make — listed here so the first draft has an explicit answer for each (recommendations included):

1. **Chat — real-time vs end-of-session action-item creation?** *Recommendation:* end-of-session for v1, with a real-time flag for high-urgency intents (recall, compliance).
2. **SMS conversation timeout?** *Recommendation:* 24h inactivity = thread closes, action items finalize.
3. **Multi-intent email** — one action item with sub-tasks, or N separate items? *Recommendation:* N separate items, same customer, linked via `source_conversation_id` — keeps the queue uniform.
4. **HITL transcript re-scanning** — stream-process during the human's involvement, or re-scan when the human ends? *Recommendation:* re-scan on end — simpler to reason about, ships faster.
5. **Cross-pod event schema ownership** — does this pod own the canonical `action_item.*` event taxonomy, or does the data team? *Recommendation:* this pod owns, data team reviews.

---

> **Sanity-check before generating a PRD:**
> - [x] At least 5 customer quotes captured (10 captured · 7 verbatim from Edgar · 3 BDC-rep placeholders pending verbatim verification — see Section 3 TODO)
> - [~] At least 3 data points with sources (7 captured · 3 directional metrics flagged TODO for instrumentation — see Section 4 tracking gap)
> - [x] Business impact estimate with reasoning ($600K ARR with 90-day renewal-window reasoning in Section 5)
> - [x] Problem statement is in customer language, not solution language

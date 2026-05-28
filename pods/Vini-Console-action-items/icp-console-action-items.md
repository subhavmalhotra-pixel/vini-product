# ICP — Vini Console · Action Items (Phase 1)

**Author:** Subhav
**Product:** Vini
**Pod / Team:** Vini Product Team
**Date:** 28 May 2026
**Status:** Draft v1 — anchored to Signal v3 (3-stage lifecycle: Create / Manage / Communicate)
**Companion artifacts:** [signal-console-action-items.md](./signal-console-action-items.md) · [prd-console-action-items.md](./prd-console-action-items.md)

---

## Why this doc exists

Phase 1 of Action Items has **two primary users** at every rooftop:

1. **BDC Agent** — the closer. Lives inside the queue all day. Today **locked out** at most rooftops.
2. **BDC Manager** — the queue owner. Grades reps, defends SLA at QBRs. Today **rebuilds the queue in Excel** because no rollup exists.

This doc profiles both so the Phase 1 UI design maps directly to their JTBD — not to a generic "dealership user."

GM / Dealer Principal / Service Manager / Fixed Ops Director are **secondary** for Phase 1 — they consume the queue, they don't operate it. Their needs are captured in the signal but do not drive the Phase 1 flow.

---

## ICP #1 — Madison, BDC Agent (the closer)

### Snapshot

| Attribute | Value |
|---|---|
| **Role** | BDC Agent / Service Advisor / Sales Advisor (the "closer" — the human who actually picks up the task and finishes it) |
| **Title variations** | BDC Agent · BDC Rep · Internet Sales Coordinator · Service Advisor · Sales Advisor |
| **Reports to** | BDC Manager (Pillar #2 persona below) |
| **Headcount at typical rooftop** | 2–6 per rooftop (60+ across 20+ live rooftops) |
| **Tenure** | 6 months – 4 years; high turnover role — UI must be learnable in < 30 minutes |
| **Tech literacy** | Comfortable with DMS (Reynolds / CDK / Tekion), CRM (VinSolutions / DealerSocket), Slack, Gmail. **Not** a power user — keyboard shortcuts and dense tables lose them. |
| **Daily console time** | Wants 2–4 hrs/day inside Action Items if it works. Today: **~0 minutes** (no access). |
| **Primary device** | 24" desktop monitor at a desk, dual-screen with CRM open on the second screen. Mobile = rare (no flow needs to be designed for mobile in Phase 1). |
| **Shift** | 8 AM – 5 PM most days; some BDCs run 7 AM – 7 PM with two shifts |

### Behaviours

- **Reactive worker.** Today learns about a customer task via a Slack DM from her manager — *"Madison, can you call Gary Wise back, he's pinged us 5 times."* — not from a queue she opens herself.
- **One-screen mindset.** If a task requires her to open three tabs (queue → transcript → CRM) she'll skip the transcript and wing it from CRM notes.
- **Low patience for typing.** Free-text resolution notes today = blank. Quoted: *"If I have to type a note every time I just stop using it."*
- **Anxious about being graded.** Knows her manager will grade her closure rate eventually. Wants to look good but won't change behaviour for an audit trail unless the tool makes it free.
- **Trusts voice over text.** When a task is ambiguous, she'd rather hit a click-to-listen button than read a transcript.
- **Treats "the queue" as a Slack thread today** — every task is a forwarded message; closure = thumbs-up emoji.

### Jobs to be done

| Type | JTBD | Maps to lifecycle stage |
|---|---|---|
| **Functional 1** | *Know which customers are waiting on me right now and how long they've been waiting* | Manage |
| **Functional 2** | *Understand what the customer actually needs without re-listening to a 6-minute call* | Create (consumed by Madison at Manage time) |
| **Functional 3** | *Close a task in one click — "appointment booked" / "left voicemail" / "quote sent"* | Manage |
| **Functional 4** | *Send the customer the update I just promised, without leaving the task drawer* | Communicate (Phase 2 — flagged for design hooks now) |
| **Functional 5** | *Add a task my manager asked me to follow up on, even though it wasn't on a Vini call* | Create (Phase 2 — manual creation) |
| **Emotional** | *Feel on top of my list, not behind it.* Reduce the "the customer called back and I had no idea" panic. |
| **Social** | *Be seen as the rep who closes things, not the rep my manager has to chase.* |
| **JTBD she avoids** | Typing long resolution notes · re-explaining context to the customer when she calls back · being blamed for a task she never saw |

### Top pain points (mapped to signal pillars)

| # | Pain | Signal source | UI implication |
|---|---|---|---|
| 1 | **No access to her own queue.** Learns about tasks via Slack from her manager. | Signal §3 quote #11; §3 quote #5 *("only Anya and myself")* | Phase 1 must give every BDC Agent direct, gated console access — not just GM + Service Manager |
| 2 | **Can't tell which task is most urgent.** Date-only stamps don't convey "Gary Wise has been waiting 4 hours vs 5 days." | §3 quote #1 *("has he been waiting four hours? Five minutes?")* | Inline **age-of-task** chip (e.g. `4h 12m`) on every row; default sort = customer wait-time descending |
| 3 | **Can't read the intent without re-listening to the call.** | §3 quote #2 *("a small recap, one sentence")* | One-sentence intent recap on the row, no drawer-open required to see it |
| 4 | **Closing a task without a note feels pointless — but typing one is too slow.** | §3 quote #13 *("if I have to type a note every time I just stop using it")*; §4 data point *"0% of completed items had a resolution note"* | One-tap **canned resolution chips** (`Appointment booked` · `Left voicemail` · `Quote sent` · `Customer not interested`) + optional free-text field, never required |
| 5 | **No way to know if the customer has been pinging us repeatedly.** | §3 quote #7 *(Gary Wise called 5 times)*; §4 data point *(5 pings, no escalation flag)* | **Repeat-caller flag** badge on the row — visible at glance without opening the drawer |
| 6 | **Click-to-listen doesn't exist.** When she does want voice context, she has to dig through call recordings tab. | §3 quote #3 *("how do I click on this to listen?")* | Play-icon button inline on every row that opens the source recording in-context (drawer, not new tab) |

### Decision-making + adoption

- **Doesn't choose tools.** Her manager + GM choose; Madison's adoption signal is *does she open the surface daily*.
- **Adoption test:** if she opens the Action Items tab > 5x/day for 5 consecutive days during a pilot, the persona is engaged.
- **Drop-off test:** if she opens it once, doesn't see her name as assignee on any row, closes the tab and goes back to Slack — Phase 1 has failed the most important UX validation.
- **Quick-win moment:** the first time she closes a task with a one-tap chip and the customer doesn't call back about that task, she becomes an advocate.

### Madison's "good day" with Phase 1

```
8:02 AM   Opens Action Items tab. Default view = "Assigned to me" sorted by wait time.
8:03 AM   Sees Gary Wise at the top with a "5 pings · 3 days" repeat-caller badge.
8:04 AM   Reads the one-sentence recap inline: "Customer asking for status on
          his 2022 GLC service appointment booked May 22."
8:05 AM   Clicks the play icon, listens to a 20-second clip from the most
          recent voicemail (right in the drawer, no tab switch).
8:08 AM   Calls Gary back from her desk phone. Books a follow-up slot.
8:09 AM   Clicks "Appointment booked" canned chip. Drawer auto-closes.
          Customer drops off her list. Done.
```

Total time: 7 minutes. Today: that same task takes ~25 minutes if it gets closed at all.

### Disqualification — who is NOT Madison

- Title says "BDC" but the rep does not personally close customer tasks (e.g. a BDC supervisor who only routes) → that's the Manager persona below.
- Mobile-first reps (rare in this segment; floor sales people who don't sit at a desk) → out of scope for Phase 1.
- Independent advisors at single-rooftop garages with no DMS / CRM stack → not in our deployment base.

---

## ICP #2 — Anya, BDC Manager (the queue owner)

### Snapshot

| Attribute | Value |
|---|---|
| **Role** | BDC Manager / Sales Manager / Service Manager (the supervisor who owns the queue, grades reps, reports to GM at standup) |
| **Title variations** | BDC Manager · Internet Sales Manager · Service Manager · Customer Care Manager |
| **Reports to** | GM / Dealer Principal |
| **Headcount at typical rooftop** | **1** (sometimes shared across 2 rooftops in a small group) |
| **Tenure** | 2–10 years at this dealership; usually the most loyal employee in the BDC chain |
| **Tech literacy** | Heavier than her reps. Builds dashboards in Excel from CRM exports. Knows DMS, CRM, Vini console, ROI Emailer cadence, often Power BI for the dealer group. |
| **Daily console time** | Today: 30–60 min/day across multiple Vini surfaces. Phase 1 target: 60–90 min/day with most time on the queue itself. |
| **Primary device** | 27" monitor + laptop docked, multi-tab workflow, sometimes a TV in the BDC room showing live counts |
| **Decision power** | High day-to-day operational authority; loops in GM for renewals / tool decisions |

### Behaviours

- **Reads the queue first thing every morning.** Today this means opening the call summary email, not the Action Items tab.
- **Routes by Slack.** *"Madison, take this. Caleb, take this."* Manual fan-out because no assignee field exists.
- **Builds her own metrics in Excel.** Exports closed action items weekly, joins with rep schedules, computes closure rate per rep.
- **Defends the team at QBR.** When the dealer principal asks "did Vini close enough?" she has to manually reconstruct the answer.
- **Coaches reps.** Wants to grade fairly — needs to know *who closed what* and *how long they took* per rep.
- **Distrusts opaque AI.** Will trust Vini to close low-judgment tasks but only with a visible resolution note she can audit.
- **Time-boxed by customer complaints.** Half her day is reactive ("this customer is angry, why didn't anyone call them back?") — every minute she spends reconstructing context = a minute she can't spend coaching.

### Jobs to be done

| Type | JTBD | Maps to lifecycle stage |
|---|---|---|
| **Functional 1** | *Tell me the health of the queue right now: total open, oldest item, breached SLAs, unassigned count* | Manage |
| **Functional 2** | *Tell me who on my team has too many open items and who has none* | Manage |
| **Functional 3** | *Tell me who closed what last week and what the resolution notes looked like, so I can grade fairly* | Manage (audit · QBR prep) |
| **Functional 4** | *Show me when a customer has pinged us 3+ times so I escalate before they cancel* | Manage |
| **Functional 5** | *Let me re-assign a stuck task with one click* | Manage |
| **Functional 6** | *Let me see Vini-closed tasks with their resolution notes so I can audit the AI* | Communicate (Phase 2 — Vini-as-assignee) |
| **Emotional** | *Feel in control of the queue.* Walk into the QBR with the answer to *"is your BDC working?"* already in her hand. |
| **Social** | *Be the manager the dealer principal calls when something works, not when something breaks.* |
| **JTBD she avoids** | Exporting CSVs at 11 PM the night before QBR · explaining to the GM why a customer pinged 5 times · re-routing tasks via Slack |

### Top pain points (mapped to signal pillars)

| # | Pain | Signal source | UI implication |
|---|---|---|---|
| 1 | **No assignee field → no accountability.** Can't tell who owns what. | §3 quote #4 *("I can't tell who owns what")* | Assignee dropdown on every row + default-view filters by assignee |
| 2 | **No aggregate / rollup view.** Sees per-row only — same view her reps see. | §3 quote #6 (NEW pillar — manager rollup); §1 Pillar 2 framing | **Phase 1 lite-rollup strip** above the queue: total open · oldest item age · unassigned count · breached SLA count |
| 3 | **No resolution notes to audit.** 0% compliance today. | §4 data point *(0% of completed items had a resolution note)* | Canned chips force a structured note on every closure (see Madison's pain #4) — Anya gets the audit trail for free |
| 4 | **No way to spot repeat-callers.** Customer pings 5x; system doesn't flag. | §3 quote #7; §4 data point | Repeat-caller flag visible on row AND surfaceable as a filter ("show me all repeat callers") |
| 5 | **Re-routing requires Slack.** Can't reassign in the queue. | §3 quote #8 *("track who is updating or closing")*; §6 step 4 | Reassign action on the row drawer; future Phase 2: bulk reassign |
| 6 | **No "team grading" surface for QBR.** Has to rebuild in Excel. | §3 quote #9 *("assign tasks and track who is updating or closing")*; §7 *(AI-vs-human grading)* | Phase 1: completed-tab columns = `customer · who closed · when · resolution note inline`. Phase 2: Manager dashboard with per-rep stats. |
| 7 | **Doesn't know what surfaces in the digest email.** | §9.4 inbound flow | Phase 1 row badge: *"Surfaced in your Daily Digest on May 17"* — closes the email-to-action loop |

### Decision-making + adoption

- **Anya is the buying influence at the rooftop.** The GM signs the renewal, but if Anya tells the GM *"I can't run my BDC from this tool"*, the renewal is at risk.
- **Adoption test:** Does Anya stop exporting CSVs to Excel? If she still maintains her shadow spreadsheet 30 days into Phase 1, the rollup strip didn't deliver enough signal.
- **Quick-win moment:** First QBR where she walks in with a queue screenshot instead of an Excel dashboard.
- **Drop-off risk:** If the rollup strip shows numbers that don't match her CSV exports, she'll lose trust in 1 cycle.

### Anya's "good day" with Phase 1

```
8:00 AM   Opens Action Items tab → sees rollup strip:
          "23 open · oldest 6h 12m · 4 unassigned · 1 SLA breach"
8:01 AM   Clicks "4 unassigned" — sees the 4 rows.
8:02 AM   Assigns 2 to Madison, 2 to Caleb (one click each, Slack-free).
8:03 AM   Spots a customer with a "5 pings · 3 days" repeat-caller badge
          still unresolved — clicks the row, sees Madison was assigned
          yesterday, hasn't closed. Sends Madison a Slack ping.
8:10 AM   Reviews yesterday's "Completed" tab — every row shows who closed
          and a resolution note chip. Quick scan; no Excel needed.
8:12 AM   Closes laptop, walks into the GM's office with "queue's clean,
          one breach, here's why" — instead of "let me get back to you."
```

Total morning routine: 12 minutes. Today: 45–60 minutes (export → Excel → reconstruct).

### Disqualification — who is NOT Anya

- A GM / Dealer Principal who consumes the queue summary but doesn't operationally manage it → secondary persona; not the Phase 1 design driver.
- A Fixed Ops Director with 5+ rooftops who needs group-level rollups → Phase 2 (multi-rooftop view explicitly out of scope per signal §2).
- A pure Service Manager who only handles repair-status tasks → covered by Anya's persona as a sub-segment; same UI affordances serve them.

---

## Cross-persona map — how Phase 1 UI affordances serve both

This is the **design contract** for Phase 1. Every UI element below must serve at least one of these JTBD; if it doesn't, it's out of scope.

| Phase 1 affordance | Serves Madison | Serves Anya | Maps to JTBD |
|---|---|---|---|
| **Default sort = customer wait-time desc** | ✅ "what's most urgent for me?" | ✅ "what's most urgent for the team?" | M-F1, A-F1 |
| **One-sentence intent recap on row** | ✅ skip the transcript | ✅ scan queue in 30 sec | M-F2, A-F1 |
| **Age-of-task chip (`4h 12m`)** | ✅ urgency at glance | ✅ rollup denominator | M-F1, A-F1 |
| **Assignee field + dropdown on row** | ✅ "is this mine?" filter | ✅ accountability | M-F1, A-F1, A-F5 |
| **Click-to-listen play icon inline** | ✅ voice over text | ➖ secondary (Anya rarely listens) | M-F2 |
| **Repeat-caller flag badge** | ✅ "is this Gary Wise pinging again?" | ✅ escalation signal | M-F1, A-F4 |
| **Canned resolution chips on close** | ✅ closes pain #4 (one-tap) | ✅ audit compliance free | M-F3, A-F3, A-F6 |
| **Completed tab: customer · who · when · note** | ➖ secondary | ✅ team grading | A-F3 |
| **Lite-rollup strip above queue** | ➖ secondary (Madison filters first) | ✅ queue health | A-F1, A-F2 |
| **"Surfaced in Daily Digest" badge** | ✅ closes email-to-action loop | ✅ confidence in cadence | M-F1, A-F7 |
| **"Assigned to me" filter (default for reps)** | ✅ daily driver | ✅ filter to grade reps | M-F1, A-F2 |

**Out of scope for Phase 1 (Phase 2 design hooks only):**
- Manual task creation by BDC Agent → Madison's JTBD F5 (deferred)
- Compose-in-drawer customer reply → Madison's JTBD F4 (deferred)
- Vini-as-assignee with AI resolution notes → Anya's JTBD F6 (deferred)
- Manager dashboard with per-rep stats → Anya's pain #6 deeper cut (deferred)
- Multi-rooftop rollups → Out of scope per signal §2

---

## Go-to-market implications (Phase 1)

| Question | Answer |
|---|---|
| **Who do we onboard first?** | The **BDC Manager** (Anya). She turns on access for her reps, sets initial assignments, and is the buying influence. |
| **Who do we measure adoption against?** | The **BDC Agent** (Madison). If she doesn't open the tab 5x/day, Phase 1 has failed regardless of what Anya says. |
| **What's the disqualifier?** | A rooftop without a named BDC Manager (the GM doubles up) → likely a small dealer; design works but adoption signal will be noisy. |
| **What's the "good fit" rooftop for the design partner cohort?** | 1 dedicated BDC Manager + 2–4 BDC Agents + 30+ daily action items + active DMS integration. Mercedes Benz Laguna Niguel is the canonical example (Edgar = GM, Anya = Service Manager, 60+ agents). |

---

## Open questions for the Phase 1 design pass

1. **Default view per persona** — does Madison land on "Assigned to me"? Does Anya land on "All open"? (Recommendation: yes, role-detected on login. Even if the role check is fragile in Phase 1, default to "All open" with a one-click "Just mine" toggle that persists.)
2. **Rollup strip — is it always visible or collapsible?** Anya needs always-visible; Madison may find it noise. (Recommendation: always visible, single row, < 60px tall — small enough not to compete with the queue.)
3. **Resolution chips — fixed list or per-rooftop configurable?** (Recommendation: fixed 6-chip list in Phase 1; configurability moves to Phase 2 with the routing config layer.)
4. **Repeat-caller threshold — 2 pings? 3? 5?** (Recommendation: ≥3 pings in 72h triggers the badge — tunable in Phase 2; matches the Gary Wise pattern without over-flagging.)
5. **Where does Madison see "tasks closed by Vini"?** (Recommendation: Phase 1 = same Completed tab, with an `Assignee: Vini` chip. Phase 2 = dedicated audit view.)

---

> **Validation TODO before the design pass ships:**
> - [ ] 2 BDC-Agent interviews (Madison persona) confirming pain points #4 and #5 (canned chips + repeat-caller badge)
> - [ ] 1 BDC-Manager interview (Anya persona) confirming rollup strip metrics are the right 4
> - [ ] Confirm with CS that the 4-rooftop design partner cohort matches the "good fit" profile above
> - [ ] Confirm with engineering that the `source_conversation_id` join is reliable enough to power the click-to-listen affordance

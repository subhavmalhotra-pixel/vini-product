# PRD: Vini Dealer Reporting Emailers (Phase 1)

**Author:** Subhav
**Product:** Vini
**Pod:** Vini Product Team
**Date:** 15 May 2026
**Status:** draft · v6 (post-call summary emailer added · 3 conditional templates)

---

## 1. Job to be done

As a dealership stakeholder, I want a regular, defensible view of what Vini did for my dealership, what value it delivered, and what my team needs to act on — so I can defend the Vini investment, run my Monday review, and stop missing follow-ups *(Signal Section 1, pillars 1–3; Signal Section 3 quote 5: "As a Dealer Principal I would want have clear visibility to see how each of my depts are performing which is each agents")*.

---

## 2. Success metrics

### Primary

- **Metric:** Weekly active engagement with cadence emailers — % of role-mapped recipients who **open at least one email AND click at least one CTA per week**.
- **Target (within 30 days):** ≥ 60% of role-mapped recipients across all live rooftops.
- **Current baseline:** Not measured today. Per Signal Section 4, "Email analytics not tracked but explicitly asked by multiple POCs at dealership level." Assumed baseline: 0% measured engagement (instrumentation lands with this PRD).
- **Measurement source:** Email tracking pixel (open) + UTM-tagged CTA click events captured in product analytics warehouse, joined to recipient role from dealer config.

### Secondary

- **Metric:** Reduction in Freshdesk tickets tagged with ROI / dashboard / reporting visibility.
- **Target (within 30 days):** From 5+ tickets/month (Signal Section 4) to ≤ 2 tickets/month.
- **Current baseline:** 5+ tickets/month (Signal Section 4, source Freshdesk).
- **Measurement source:** Freshdesk tag filter `reporting-visibility`, `roi-dashboard`, `report-request`.

- **Metric:** Reduction in CS-pulled ad-hoc report requests for live Vini rooftops.
- **Target (within 30 days):** 50% reduction vs. trailing 30-day average.
- **Current baseline:** Per Signal Section 6, "those who do not have access to both [email + console] have to request CSMs to share the data." Volume to be captured at PRD kickoff from CS request log.
- **Measurement source:** CS request log (Linear / Slack `#csm-requests` audit), filtered to "report / numbers / performance" intent.

---

## 3. Non-goals

1. **Self-serve recipient management UI.** Dealers cannot add, remove, or reassign POCs themselves in Phase 1. Recipients are derived from role-mapped defaults sourced from dealer config (Signal Section 1 pillar 4 is acknowledged; the configurable-comms UI is explicitly deferred).
2. **Section toggles or frequency overrides inside emails.** A recipient cannot turn off "Top Vehicles" or change Weekly → bi-weekly in Phase 1. Default sections fixed.
3. **Custom email builder.** No drag-drop section assembly or custom-trigger emails (e.g., "send when campaign crosses 50%"). Deferred.
4. **Non-email delivery channels.** No Slack, SMS, or in-portal notification delivery — email only.
5. **DMS-connected actual revenue.** No "Actual revenue influenced" reconciliation against the dealer's DMS. Optional dealer-configured `avg_appointment_value` may render an estimate sidebar, but actual-revenue ingestion is out.
6. **Per-lead drill-in inside the email body.** Drill-in lives in the console via deep-link CTA, not in the email itself — addresses the dual-tab pain in Signal Section 3 quote 3 by deep-linking, not by embedding.

---

## 4. Harness spec

The bulk of Phase 1 is deterministic reporting. One surface is AI-generated: the **Story-of-the-Week / Story-of-the-Month narrative summary** that turns a selected customer journey into a 2–3 paragraph anonymized story. Justification: Signal Section 3 quote 4 ("I would want to see what actions are taken by agents on my hot leads") implies a *narrative* of agent behavior, not a table.

- **Model:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`). A 2–3 paragraph anonymized summary from structured call + SMS + chat data is well within Haiku's competence. Sonnet is ~3× the cost with no quality gain at this length and structure. Story generation runs at most weekly/monthly per rooftop, so cost is bounded.
- **Tools:** None. Single LLM call. Retrieved context is passed as a structured JSON payload in the system prompt — no function-calling needed at this scope.
- **Context strategy:** The deterministic scorer (per Story-of-the-Week scoring function — out of scope of this section, deterministic) selects one customer journey. We retrieve, PII-strip, and pass: full transcript turns (call + SMS + chat), agent name, vehicle/service intent, conversation outcome (appointment / handover / lost), touch count, channel sequence, sentiment delta tag (deterministic upstream eval), critical flags (recall, compliance, at-risk save). All customer names, phone numbers, VINs, and email addresses are replaced with role placeholders ("the customer") before the LLM ever sees the data — addresses failure mode #1 (hallucinating dealer-specific facts) and AC-equivalent of "zero customer PII in email body."
- **Fallback:** If the model errors, times out (>10s), returns content failing PII regex post-check, or returns < 100 chars, **omit the Story block entirely** from that send. Email still ships with the rest. Slack alarm to `#vini-coverage-alerts` with dealer + rooftop + cause.
- **Cost ceiling:** ≤ $0.02 per Story request (≤ 4k input tokens, ≤ 600 output tokens). Per-week-per-dealer cap: $0.20 (covers retries + monthly stories). Hard kill if average cost per Story exceeds $0.05 over a rolling 24h window.

---

## 5. Quality bar

| Surface | Type | Quality artifact |
|---|---|---|
| Daily Digest email render + send | [deterministic] | Unit + integration + E2E tests |
| Weekly Performance email render + send | [deterministic] | Unit + integration + E2E tests |
| Monthly Value email render + send | [deterministic] | Unit + integration + E2E tests |
| End-of-Campaign email render + send | [deterministic] | Unit + integration + E2E tests |
| Role-based recipient mapping (dealer config → recipient list) | [deterministic] | Unit tests per role × email × multi-rooftop case |
| Edge case rendering (silent day, MTD-only, small denominator, day 1–7 rooftop, exhausted campaign) | [deterministic] | One test per row of the edge-case matrix |
| 7 AM dealer-local send scheduling | [deterministic] | Integration tests across US time zones (PT/MT/CT/ET/AKT/HT) |
| Slack alarm dispatch | [deterministic] | Unit + integration tests per trigger row |
| Story selection scoring function | [deterministic] | Unit tests per variant weight set + tiebreaker + 2-week-de-dupe rule |
| **Story narrative summary (AI)** | [ai-generated] | ≥ 30 eval cases, graded rubric |

**Coverage plan:** Deterministic surfaces are covered by unit tests on every metric formula and rendering rule, integration tests for full email render including edge cases (one test per row of the matrix), and E2E tests from warehouse query through SMTP delivery. The AI story summary needs an eval set of 30+ cases spanning: clean booking, recall/compliance escalation, at-risk save, lapsed re-engagement, multi-touch journey, conversation that flipped from negative → positive sentiment, very short conversation (1–2 turns), very long (15+ turns), failed booking, and explicit PII-leak attempts in the source transcript. Rubric grades: factual accuracy (no claims not in transcript), anonymization (zero PII), tone (operational, not marketing — Signal Section 7 calls existing "estimated revenue" framing a liability), length (2–3 paragraphs), and "why selected" badge match.

---

## 6. Prototype scope (≤5 days)

The 5-day prototype targets the **Daily Digest only** for **one design-partner rooftop** (Honda DTLA — Signal Section 3 quote 6 is an explicit ask from Matt at Honda DTLA for a daily export). Goal is to prove the data pipeline produces defensible numbers and the dealer-facing framing lands. NO AI in the prototype.

1. **One template — Daily Digest.** Sections shipped: header with date + dealer + agent badge, hero (Yesterday + MTD appointments with BDC-hours subtitle), one KPI strip (Avg first-contact time, Engaged rate %), Top 4 Vehicles of Interest, one primary CTA (`View Today's Appointments`). Skipped: Action Required section, After-Hours block, Warm Transfers, Outbound section, footer BDC-hours card. Skipped surfaces have full spec but ship Phase 1 post-prototype.
2. **One rooftop, one hard-coded recipient.** Honda DTLA, recipient = Matt's email from Signal Section 3 quote 6. Role-mapped recipient logic deferred to Phase 1 build.
3. **Manually triggered send.** No 7 AM scheduler yet — sends via internal admin endpoint. Scheduling lands in Phase 1 build.
4. **Existing Vini reporting tables only.** No new aggregation pipeline. If a metric requires upstream changes, drop it from the prototype.
5. **One edge case handled:** Yesterday=0, MTD>0 — renders "0 / N MTD" in neutral gray. All other edge cases deferred but specced.
6. **Plain HTML, no design system.** Final CTA button style + brand colors deferred to Phase 1 build. Prototype renders cleanly in Gmail web only.

Anything outside this list is explicitly out of scope for the 5-day prototype.

---

## 7. Kill criteria

1. **Design-partner rejection of the value reframe.** During prototype review with 3 design-partner rooftops (Honda DTLA + 2 others), if 2 or more explicitly say the work-delivered framing (conversations handled, appointments booked, BDC-hours equivalent) is *less* useful than the existing "estimated revenue influenced" framing they distrust, the reframe is wrong. Kill the PRD and revisit Signal Section 1 pillar 2 with new research.

2. **Data unreliability.** If the existing Vini reporting tables show >10% discrepancy with the rooftop's CRM for the same date range during prototype QA across 3 rooftops, we cannot ship defensible numbers. Per Signal Section 7, "estimated-revenue framing is a known liability" precisely because dealers cannot defend our sources — kill until the upstream data layer is fixed (out of scope of this PRD).

3. **Engagement floor missed at 30 days.** After 30 days of Phase 1 production, if weekly active engagement (primary metric) is < 30% (half target) AND Freshdesk ROI tickets have not dropped by at least 25%, the hypothesis that emailers solve Signal Section 1 pillars 1–3 is invalidated. Kill before investing in the configurable-comms platform (Signal Section 1 pillar 4 / Phase 2+).

4. **AI cost ceiling cannot hold.** If average per-Story generation cost exceeds $0.05 over any rolling 24h window at ≥ 25 rooftops scale, the Story surface fails unit economics. Kill the AI surfaces; ship deterministic-only weekly/monthly (no Story block).

---

## 8. Phased rollout

This PRD scopes **Phase 1** — what ships first. Phase 2 and Phase 3 are documented here so engineering, design, and CS understand the trajectory without scope-creeping Phase 1. None of the Phase 2/3 items are in Section 6 (Prototype scope) or Section 3 (Non-goals defers them explicitly).

### Phase 1 — Default emailers shipped *(this PRD)*

**Goal:** Every live rooftop receives the four default emails with role-mapped recipients. Zero customization UI.

**Ships:**
- Daily Digest, Weekly Performance Report, Monthly Value Report, End-of-Campaign Report — all four cadences.
- **Role-based default subscription mapping** auto-applied from dealer config:

  | Role | Daily | Weekly | Monthly | EOC |
  |---|:---:|:---:|:---:|:---:|
  | Dealer Principal / Owner | — | — | ✓ (all) | ✓ |
  | General Manager (GM) | ✓ | ✓ | ✓ | ✓ |
  | Sales Manager | ✓ (Sales) | ✓ (Sales) | ✓ (Sales) | ✓ (Sales OB) |
  | Service Manager | ✓ (Service) | ✓ (Service) | ✓ (Service) | ✓ (Service OB) |
  | BDC Manager | ✓ (action priority) | ✓ | — | ✓ |
  | OB Campaign Manager | — | ✓ (OB) | — | ✓ |
  | Fixed Ops Director (multi-rooftop) | — | ✓ (Service) | ✓ (Service) | — |

- All edge cases (silent day, MTD-only, small denominator, baseline period, exhausted audiences).
- Slack alarms (`#vini-coverage-alerts`).
- Feature-flag controls per email per dealer (eng-side toggles only — not surfaced to dealer).
- Per-email unsubscribe footer link routing to a static "Contact CS to unsubscribe" page.

**Out of Phase 1:** Self-serve recipient management UI, section toggles, frequency overrides, alternative delivery channels, custom email builder.

**Success exit criteria for Phase 1:** All Section 2 metrics hit target at 30 days (engagement ≥ 60%, ticket reduction ≥ 60%, CS ad-hoc requests ≥ 50% reduction). If any miss, see Section 7 kill criteria before investing in Phase 2.

---

### Phase 2 — Self-serve configuration layer *(target: 2 weeks post-Phase-1)*

**Goal:** Dealers customize the default emails without engineering involvement. The platform becomes a self-serve product surface, not just a fixed set of emails.

**Ships:**
- **Per-recipient subscription management UI.** Add/remove POCs, change role mapping, manage per-rooftop subscriptions from a dealer-facing settings page.
- **Per-recipient, per-email-type unsubscribe** (replaces the Phase 1 static "Contact CS" link).
- **Section toggles inside an email.** Turn cards on/off — e.g., "hide Top Vehicles", "hide Story of the Week", "hide After-Hours Coverage". Stored per recipient.
- **Frequency overrides.** Weekly → bi-weekly, Daily → weekdays-only, Monthly → quarterly digest of monthly snapshots.
- **Delivery channel choice.** Slack webhook, SMS digest (compressed format), in-portal notification. Email remains default.
- **Multi-rooftop routing rules.** Group Owners and Fixed Ops Directors can configure group-level vs store-level rollups per role.
- **Dealer-facing `avg_appointment_value` setting.** Surfaces the optional "Your value estimate" sidebar in Monthly + EOC reports without backend involvement.

**Out of Phase 2 scope:**
- Building emails from scratch
- Custom triggers (event-based emails beyond EOC)
- Custom schedules outside the existing cadences

**Phase 2 evidence anchors (from Customer Signal Part A):**
- Pillar 4: *"I have no way to control who at the dealership gets what, when, or how."*
- Signal Section 3 quote 6 (Matt at Honda DTLA): *"…schedule a daily export of AI conversations and conversions for the live agents"* — direct ask for self-serve scheduling.

---

### Phase 3 — Custom email builder *(target: 2 weeks post-Phase-2)*

**Goal:** Power users (large dealer groups, sophisticated BDCs, OB Campaign Managers running A/B tests) build their own communications without engineering.

**Ships:**
- **Drag-drop section builder.** Pick from a standardized library of sections (KPI strip, day-by-day trend, customer journey funnel, top-N, story narrative, action queue, multichannel mix, etc.). Each section uses the same data contract as the default emails.
- **Custom schedule.** Any cadence (e.g., Tue + Fri 6 AM, last business day of month, weekday-mornings-only).
- **Custom triggers.** Event-based emails beyond EOC — e.g., "send when active campaign crosses 50% audience reached", "send when no inbound calls for 4 hours during business hours", "send when ABR drops > 10% WoW".
- **Per-section data filters.** Agent, rooftop, date range, channel, customer segment (new vs returning, lapsed, etc.).
- **Template library + sharing.** Save a custom email; share it across rooftops in a group; clone and modify.

**Out of Phase 3 scope (deferred to a hypothetical Phase 4 or never):**
- Mobile-app push notifications
- White-labeling for resellers
- Customer-facing emails (this is dealership-internal only)

**Phase 3 evidence anchors:**
- Large multi-rooftop groups in Signal Section 2 (Anderson Auto Group archetype) with diverse role configurations across rooftops.
- OB Campaign Managers running multiple parallel campaigns who need campaign-specific notification cadences (Signal Section 1 pillar 1 + Section 7 "OutBound campaigns scaling").

---

### What "phase" means operationally

- **Phase 1 build is gated by this PRD's success metrics + kill criteria** (Sections 2 + 7).
- **Phase 2 build is gated by Phase 1 success.** If Phase 1 hits engagement floor (≥ 60% weekly active) and reduces support load (≥ 60% ticket reduction), we have evidence the email surface is consumed — Phase 2 amplifies it. If Phase 1 misses, we kill rather than invest in customization on a low-value base.
- **Phase 3 build is gated by Phase 2 adoption.** Specifically: if < 30% of large dealer groups (3+ rooftops) configure at least one Phase 2 customization within 60 days of Phase 2 GA, the appetite for full custom-builder doesn't exist — stop at Phase 2.

---

## 9. Email design specifications (v6 — post-call summary added)

Each section below is **prescriptive** for engineering and design. These are not "nice-to-haves"; they're the contract the prototype renders today.

> **What changed v5 → v6 (May 22 — post-call summary added):**
> - **NEW Section 9.5 Post-Call Summary** — event-triggered emailer (not a cadence email) that fires after every call where Vini generated an action item, an appointment, or both. Three conditional template variants live inside one component: **BOTH** · **ONLY ACTION ITEMS** · **ONLY APPOINTMENT**. The 4th case (neither) is excluded by the trigger rule — no email fires.
> - Existing Section 9.5 *Open questions* renumbered to **Section 9.6**.

> **What changed v4 → v5 (May 22 trim):**
> - **Monthly (Section 9.3):**
>   - **Value-estimate sidebar removed entirely.** The optional `Your value estimate` rail on Honda DTLA's Monthly is gone — pilot review found the $ framing distracting next to the operational hero tiles. Dealer $-context moves to the dashboard.
>   - **Customer-Centric block:** `Lapsed re-engaged` stat tile → **`Routed calls`**. The Customer-Centric block now mirrors the hero's Routed Calls metric, finishing the v4 deprecation of the lapsed-re-engaged measure.
>   - **4 agent-specific Monthly variants now ship** (Sales IB · Sales OB · Service IB · Service OB) — see Section 9.3 variant table.
> - **End-of-Campaign (Section 9.4):**
>   - **Top hero campaign summary removed.** The 4-stat headline grid (Appointments · Contactable · Conversion % · Opt-in→booked %) is gone. The campaign title + the Conversion funnel together form the new top of the email — single headline, single funnel.

> **What changed v3 → v4 (May 22 review):**
> - **Weekly (Section 9.2)** — per-agent KPI strips are now fixed-by-agent-type:
>   - IB agents (Sales IB · Service IB) → **Total leads · Qualified** *(or "Appointment intent" for Service)* **· Appointments · ABR%**
>   - OB agents (Sales OB · Service OB) → **Reached leads · Contacted · Appointments · ABR%**
> - **Monthly (Section 9.3)** — hero composition rewritten + **now ships 4 agent-specific variants**:
>   - Replaced **Lapsed re-engaged** → **Routed calls** (clearer definition, see Section 9.3 metrics table)
>   - Replaced **Agent-hours equivalent** → **Resolution rate** (% of queries/calls actually resolved)
>   - Fixed display order: Leads interacted · Conversations · Appointments · After-hour appointments · Routed calls · Resolution rate
>   - **Four variants** (Sales IB · Sales OB · Service IB · Service OB) — mirrors the Weekly variant model. Each subscriber gets the variant matching their agents. No GM view.
> - **End-of-Campaign (Section 9.4)** — radically simplified:
>   - **Two of the three top funnels removed** — keep only the Conversion funnel
>   - Conversion funnel steps: **Reached leads → Contacted → Appointments → ABR%**
>   - **Removed:** Conversion by vehicle / service breakdown
>   - **Removed:** Recommendations block
> - **Open questions resolved (see Section 9.5):** *"Lapsed re-engaged"* definition deprecated in favor of `Routed calls`; *Opt-in → Booked* flow merged into the single Conversion funnel above.

> **What changed v2 → v3 (May 15 walkthrough):**
> - Daily: GM (all-agents) view **restored**; action items use a **single common Review CTA** (no per-line buttons); Inbound section now has **hero KPIs (Appointments + Unique leads) + a sub-metric tier** (Avg response time for sales / Transfer rate for service). Applied consistently across every edge case.
> - Weekly: "Week at a glance" funnel hero **removed** — redundant with the per-agent KPI strips.
> - Monthly: "Month-over-month KPIs" 6-card grid **removed** — 5 of 6 cards duplicated the hero. Six-month trend **moved to position #2** (immediately after the hero). New edge case for rooftops live < 6 months.

### 9.1 Daily Digest

**GM (all-agents) view restored** *(v3)*. Phase 1 ships three subscription shapes: GM (Sales + Service), Sales-only (IB + OB), Service-only (IB + OB). The GM view surfaces BOTH the Avg response time and Transfer rate sub-metrics in the Inbound section since both depts are in scope.

**Shared skeleton (GM, Sales, or Service):**
1. Header — date · dealer · agent type badge
2. Hero — Yesterday + MTD appointments (neutral gray when both 0)
3. **Action Required** — list of action types with counts. **One common `Review action items` CTA at the bottom of the section** *(v3 — no per-line "Review" buttons; the per-line button created visual noise and split attention from the actual list)*
4. **Inbound activity — two-tier KPI layout** *(v3)*:
   - **Hero KPIs (large)**: Appointments + Unique leads — these are the operational headline numbers
   - **Sub-metric (smaller)**: agent-context-specific
     - Sales subscription → `Avg response time` (e.g. 47s · 1m 02s MTD)
     - Service subscription → `Transfer rate` (e.g. 15% · 5 transfers · 11% MTD)
     - GM subscription → both shown
   - Below the KPI tier: channel breakdown bar (only when has data) · After-hours · Warm transfers
   - **Removed in v3**: the redundant inner Unique-leads + Appointments-set displays under the KPI cards — the hero tier already carries those figures
5. Top vehicles / top intents (Top 4)
6. Outbound section (when OB agent in subscription)
7. Footer — dealer + period + unsubscribe. **NO** "BDC-hours equivalent of agent effort" line (removed for v2)

**Sales-only differences from Service-only:**
- Sales shows channel split (Call / SMS / Chat) on the channel-breakdown row
- Service does **not** show channel split (Service IB volume is heavily Voice-only today; channel breakdown looks unbalanced)
- Sales OB shows campaign list; Service OB shows campaign list with service-loyalty framing

**Edge-case behavior (all render silently — no warning banners in the email):**

| Edge case | Old behavior (deprecated) | v2 behavior |
|---|---|---|
| Zero inbound calls | Inline "verify telephony →" banner | Render scenario as a regular Sales/Service digest with 0 inbound; tile shows "0" in neutral gray. Telephony alert fires to internal Slack only. |
| Zero OB dials with active campaign | "Campaign paused?" warning banner | Campaign row shows `On hold` status pill inline. No banner. Internal Slack alarm only. |
| Yesterday=0 but MTD>0 (sanity reconciled) | Could show inconsistent agent totals | **All agent totals must reconcile.** If the digest claims 0 appts yesterday, both inbound (0) and outbound (0) for the day must sum to 0 — never inbound=14 + outbound=4 with hero=0. |
| Day 1–7 onboarding rooftop | "Vini live · baseline period · N days to delta comparisons" | Replace hero with leads-only message ("Vini is live. So far today: N leads engaged."). On first booking, hero swaps to a celebration tile: "First appointment booked — well done." |
| Small denominator (< 5) for ABR / Engaged % | "N/A — small sample" | **Always show the raw count.** Suppress the percent only; never render "N/A". |
| Sub-metric unavailable (no activity OR small sample) | Inconsistent — sometimes hidden, sometimes "N/A" | *(v3)* Render the sub-metric card with an em-dash (`—`) in muted gray. MTD context preserved in the subtitle. **Hero tier is never collapsed** — the layout stays identical across all scenarios so dealers learn the shape once. |

### 9.2 Weekly Performance Report

**"Week at a glance" funnel hero removed in v3.** The aggregate funnel (Unique / Engaged / Converted / Avg touches) duplicated the headline figures already carried in the per-agent KPI strips below it. Pilot reviewers consistently bounced back to the per-agent rows for "what happened this week," skipping the aggregate. The CTA (`Open weekly performance dashboard`) moves to the top of the "Performance by agent" section.

**No GM (all-agents) view.** Four agent-specific variants. **v4 fixes the per-agent KPI strips** to a uniform 4-card shape by agent direction (IB vs OB) — replaces the previous ad-hoc per-variant labels (e.g. `Avg first-contact time`, `Warm transfers`, `Cost / Appt`).

**Per-agent KPI strip — fixed-by-direction in v4:**

| Direction | Card 1 | Card 2 | Card 3 | Card 4 |
|---|---|---|---|---|
| **Inbound** (Sales IB · Service IB) | **Total leads** | **Qualified** *(Service IB: "Appointment intent")* | **Appointments** | **ABR%** |
| **Outbound** (Sales OB · Service OB) | **Reached leads** | **Contacted** | **Appointments** | **ABR%** |

The IB "Qualified" → "Appointment intent" rename for Service IB reflects the service-side reality (callers usually already have a service need; "qualified" is implicit). The taxonomy stays the same across all four variants — only the user-facing label is service-flavored.

**Variant composition (unchanged from v3 below the KPI strip):**

| Variant | New for v2? | Top-of-fold composition *(v4 — KPI strip is now fixed-by-direction)* |
|---|---|---|
| Sales OB | retained | Per-agent KPI strip (OB shape) · Day-by-day (Leads / Interactions / Appointments) · Funnel · Channels · Top vehicles · Story |
| **Sales IB** | new in v2 | Per-agent KPI strip (IB shape) · Day-by-day (Leads / Interactions / Appointments / ABR%) · Funnel · Channels · Top vehicles · Story |
| Service IB | retained, restructured | Per-agent KPI strip (IB shape, "Appointment intent" label) · Day-by-day (Leads / Qualified / Appointment intent / Appointments / ABR%) · Top services · Story |
| **Service OB** | new in v2 | Per-agent KPI strip (OB shape) · Day-by-day (Customers reached / Connected / Appointments / Cost/Appt) · Top services · Story |

**Removed across all variants:** "67% new · 33% returning customers this week" line. Internal pilot review showed dealers find the new/returning split confusing without a definition of "returning" (within Vini? within CRM? within 12 months?). Defer to Phase 2 or 3 once we have a clear definition.

### 9.3 Monthly Value Report

**v4 ships FOUR agent-specific monthly variants** — mirrors the Weekly variant model (Section 9.2). Each subscriber receives the monthly matching the agents they're configured to see. There is no GM (all-agents) view.

| Variant | Dealer used in prototype | Distinguishing texture |
|---|---|---|
| **Sales IB** | Honda DTLA | High lead volume + appointment density · routed calls reflect "asked for a specific salesperson" transfers · resolution rate ~84% (most inbound calls book or transfer cleanly) |
| **Sales OB** | Honda DTLA | Higher reach + lower conversion · routed calls low (campaigns close themselves or terminate cleanly) · no value-estimate sidebar (OB ROI lives in the EOC reports) |
| **Service IB** | Toyota Tampa | Voice-dominant · high appointment density · routed calls high (advisor transfers + status escalations) · resolution rate lower than Sales because RO-status escalations require human follow-up |
| **Service OB** | Toyota Tampa | SMS-first campaign cadence (loyalty + recall outreach) · lapsed re-engaged high in the Customer-Centric block (the whole point of these campaigns) · routed calls near zero · resolution rate very high |

The **hero tile composition is identical across all four variants** (6 tiles, fixed order — see below) so subscribers learn the shape once. What changes per variant: hero *values*, multichannel mix, customer-centric block (new vs returning · lapsed), six-month trend, and stories.

**Hero — reduced verbiage, more visual.** Six stat tiles in a fixed display order (v4):

```
[ Leads interacted ]      [ Conversations ]            [ Appointments ]
[ After-hour appts ]      [ Routed calls ]             [ Resolution rate ]
```

Sub-line: `Across X conversations` (small, secondary). *(v5: the optional `Your value estimate` sidebar that v4 rendered inside the hero block has been removed entirely — see v4→v5 changelog above.)*

**v3 → v4 changes to the hero (post-monthly review):**

| Tile (v3) | Tile (v4) | Why |
|---|---|---|
| Unique customers | **Leads interacted** | Clarity — "leads we interacted with this month" is unambiguous; "unique customers" was conflated with CRM unique-customer counts |
| Conversations | Conversations *(unchanged)* | — |
| Agent-hours equivalent | **Resolution rate** | "Agent-hours" was a derived/estimated number dealers couldn't defend at renewal. **Resolution rate** = `% of customer queries or calls resolved` (either in-conversation OR by Vini-as-assignee). Direct, verifiable, ties to the Console Action Items pod's closure metric. |
| Appointments booked | Appointments *(unchanged)* | — |
| Lapsed re-engaged | **Routed calls** | "Lapsed re-engaged" definition was disputed (within Vini? within CRM? what's "lapsed"?). **Routed calls** = inbound calls handled by Vini that were transferred or escalated to a human — a concrete, defensible operational number. See Section 9.5 open-question resolution. |
| After-hours booked | After-hour appointments *(unchanged label refinement)* | — |

**Reorder of major blocks (top → bottom — v4 final):**
1. Hero (6 stat tiles in the new order + optional value-estimate sidebar in the same block)
2. **6-month trend chart** *(v3 — moved to position #2, immediately after the hero)*
3. Customer-Centric block (unique, new vs returning, avg touches, *lapsed* — kept here only as a customer-behavior section, NOT as a hero KPI)
4. Multichannel mix
5. **3 Customer Stories** *(trailing — texture after the headline numbers + motion)*
6. Footer

**"Month-over-month KPIs" 6-card grid removed in v3.** Five of its six cards (Unique customers reached, Appointments booked, After-hours appointments, Lapsed re-engagements, BDC-hours equivalent) literally repeated values already in the hero. Pilot reviewers consistently asked "wait, isn't that the same number?" — the MoM-delta value alone wasn't worth the cognitive cost of re-reading six near-duplicates. Delta context for those metrics now belongs in the dashboard, not the email.

Rationale for the v4 order: trend confirms continuity of value as the second thing the reader sees; stories are the texture *after* both the snapshot AND the motion are established.

**Edge case — rooftop live < 6 months *(v3, new):***

| Months of data | Render behavior |
|---|---|
| 0–1 month | Six-month-trend section header reads "1-month trend". Chart is replaced by a forward-looking empty state card: *"Your trend chart unlocks next month. We need at least two completed months of activity before showing month-over-month motion. You're currently in your first month."* |
| 2–5 months | Section header reads "N-month trend" (e.g. "3-month trend"). Chart renders with the months that exist. Caption: *"Trend reflects time since go-live · fills to six months as you grow."* |
| 6+ months | Section header reads "Six-month trend". Standard 6-bar chart. No caption. |

This prevents the broken "single-bar trend chart" pattern that pilot reviewers found misleading, and avoids a hard-coded "wait 6 months for anything useful" experience that depresses engagement for new rooftops.

### 9.4 End-of-Campaign Report — *v5 single-funnel headline*

**v5 — Top-of-fold structure:** the campaign title block + the Conversion funnel together form the new headline. **The v4 4-stat hero grid (Appointments · Contactable · Conversion % · Opt-in→booked %) is removed entirely.** The funnel IS the headline now.

```
┌─ Campaign · "Spring Inventory Clearance — May 2026" ─────────────────┐
│  [audience-exhausted banner, conditional]                             │
│                                                                        │
│  Conversion funnel                                                    │
│  [Reached leads] → [Contacted] → [Appointments] → [ABR]               │
│                                                                        │
│  [ Open campaign analytics → ]                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Single conversion funnel — the only funnel in the report.** v3 shipped three top-of-fold funnels (Reach · Engagement · Conversion); v4 consolidates to **one funnel** because pilot reviewers couldn't articulate the difference between Reach and Engagement, and the three funnels visually competed for attention. v5 promotes the funnel from a secondary section to **the headline content**.

**Conversion funnel steps (fixed, v4):**

```
Reached leads  →  Contacted  →  Appointments  →  ABR%
```

Where:
- **Reached leads** = unique customers the campaign attempted to contact (audience minus opt-outs)
- **Contacted** = leads where Vini connected (call answered · SMS replied · email opened with engagement)
- **Appointments** = appointments booked from this campaign
- **ABR%** = Appointments ÷ Contacted (appointment-booking rate from the engaged universe)

The "Shown" step (in v3) and the "Engagement" funnel (split out separately in v2) are both deprecated in v4 — Show-rate stays in the dashboard, and engagement is implicit in `Contacted`.

**Per-touchpoint table:** retained unchanged (first-touch vs last-touch attribution per touch type).

**Multichannel breakdown:** retained unchanged (per-channel conversations · engagement % · appts).

**Outcome distribution:** retained unchanged.

**Top objections / Top exit intents:** retained as a single section labeled **"Top exit intents"**:

| Exit intent | Description |
|---|---|
| Vehicle purchased | Customer already bought (us or competitor) |
| Not in market | Customer not actively shopping right now |
| Opt-out | Customer requested DNC or unsubscribed |
| Awaiting next model year | Customer waiting for new model release |
| Price out of range | Pricing-based exit |
| Trade-in mismatch | Trade valuation gap broke the deal |

**Removed in v4:**
- ❌ **Conversion by vehicle / service** — at typical campaign sizes (50–500 leads) the per-vehicle breakdown was too noisy to be actionable; reviewers ignored it.
- ❌ **Recommendations block** — pilot reviewers found the auto-generated "next steps" speculative ("we don't know our own campaign that well — why would Vini?"). Removing avoids over-promising.

### 9.5 Post-Call Summary — *event-triggered (v6 NEW)*

The Post-Call Summary is **not a cadence emailer** — it fires **after every call where Vini generated an action item or an appointment (or both)**. This is the per-event sister to the daily/weekly/monthly cadence reports.

**Trigger rule (load-bearing):**
- ✅ Email sent ⇔ `action_items.length > 0` OR `appointment !== undefined`
- ❌ Email NOT sent when neither was generated — the trigger explicitly excludes calls that resolved cleanly with no follow-up needed (matches the Section 4.0 *Action-item creation rule* in `prd-console-action-items.md`)

**One component, three conditional templates** — the variant is implied by what's present in the payload:

| Variant | `appointment` | `action_items.length` | Use case |
|---|:---:|:---:|---|
| **BOTH** | defined | ≥ 1 | Sales call → test-drive interest + advisor follow-up needed (matches the reference PDF) |
| **ONLY ACTION ITEMS** | undefined | ≥ 1 | Recall verification + quote request — both deferred to human; no booking possible in-call |
| **ONLY APPOINTMENT** | defined | 0 | Annual maintenance booked end-to-end in-call — no follow-up needed |

**Email structure (top → bottom):**

```
┌────────────────────────────────────────────────────────────────────┐
│ [🏷️ Sales Inbound]                                                  │ ← Dept + direction chip
│                                                                      │
│ Inquiry and Test Drive Interest for Used Family SUVs                │ ← Call subject (title)
│ Agent: AI Agent · 20 May 2026 · 8:19 PM · 01 mins 58 s              │ ← Meta strip
│                                                                      │
│ 👤 Customer Details                                                  │
│ ┌─ Name: Jane Smith ────────┬─ AI Call Score: [90] Excellent ──┐    │
│ │  Phone: +13254425695      │  Sentiment: 😐 neutral            │    │
│ └───────────────────────────┴───────────────────────────────────┘    │
│                                                                      │
│ 💬 Intent                  💰 Deal Value                              │
│ [General Sales Inquiry]    [💵 $0]                                  │
│                                                                      │
│ 📅 Appointment              ← rendered ONLY when appointment defined │
│ [Test Drive Appointment]                                             │
│   🕐 Schedule:  Not scheduled                                        │
│   🚗 Vehicle:   Not specified                                        │
│                                                                      │
│ ✅ Action Items             ← rendered ONLY when action_items > 0    │
│ [Schedule Test Drive]                                                │
│                                          Due: 21st May '26           │
│                                                                      │
│ 📄 Call Summary             ← always rendered                        │
│ KEY TAKEAWAYS ✨                                                      │
│   • Jane called to inquire about family cars …                       │
│   • She is looking for a reliable vehicle with cargo space …         │
│   • She showed interest in the 2025 Toyota Grand Highlander …        │
│                                                                      │
│ TOPICS                                                               │
│   • Used family SUVs inquiry — Jane asked about used family cars…   │
│   • Vehicle options provided — The assistant shared available…      │
│   • Test drive interest expressed — Jane showed interest in…        │
└──────────────────────────────────────────────────────────────────────┘
```

**Data contract** *(see `test-data/schema.ts → PostCallSummaryData`)*:

| Field | Type | Notes |
|---|---|---|
| `dept_label` | string | "Sales Inbound" · "Service Outbound" · etc. |
| `agent_type` | `AgentType` | Drives downstream routing / analytics; UI uses `dept_label` |
| `call_subject` | string | AI-generated · ≤ 70 chars · displayed as the email title |
| `agent_name` | string | "AI Agent" by default · "AI + [human name]" on HITL takeovers |
| `call_started_at` | ISO | Drives the date · time · duration meta strip |
| `call_duration_sec` | number | Formatted as `MM mins SS s` |
| `customer.name` / `.phone` | strings | Customer-facing — kept since this email is dealer-internal, not dealer-to-customer |
| `customer.ai_call_score` (0–100) | number | Color-coded pill: ≥85 green · 70–84 yellow · <70 red |
| `customer.ai_call_score_label` | `"Excellent"` / `"Good"` / `"Fair"` / `"Poor"` | |
| `customer.sentiment` | `negative` / `neutral` / `positive` | Pill with emoji + label |
| `intent_label` | string | Free-form per call (taxonomy intent name OR composite like "Recall Inquiry · Service Quote") |
| `deal_value_usd` | number | 0 when none — render as `$0` (don't suppress the tile) |
| `appointment?` | `{label, schedule, vehicle}` | OPTIONAL — absence drops the entire Appointment card |
| `action_items[]` | `{title, due_at}` | OPTIONAL (empty array) — empty drops the entire Action Items card |
| `summary.key_takeaways[]` | string[] | 2–4 bullets, AI-generated |
| `summary.topics[]` | `{name, description}[]` | 2–4 topic objects, AI-generated |

**AI surface — re-uses `prd-console-action-items.md` Section 4 harness** for intent extraction + recap. The Post-Call Summary's `summary.key_takeaways` + `summary.topics` are additional outputs from the same Haiku call (or a second cheap call); cost ceiling and PII rules from the Action Items pod apply directly.

**Edge cases:**
| Scenario | Render behavior |
|---|---|
| Appointment scheduled in-call | `schedule` carries the exact slot; `vehicle` carries year/make/model + VIN suffix |
| Appointment desired but not booked | `schedule: "Not scheduled"` and `vehicle: "Not specified"` — block still renders to signal intent (see reference PDF) |
| Action item due-date unknown | Default to next business day's EOD |
| HITL takeover | `agent_name` becomes `"AI + Anya Kim"` (or similar); summary topics include the human portion |
| Zero AI summary (Haiku failure) | Email still ships with the structured cards (Customer, Intent, Appointment, Action Items); `summary` section replaced by `[auto] First N chars of transcript` per the Section 4.5 fallback rule from the Action Items pod |

### 9.6 Open questions — resolved in v4

These were carried as open questions from v3 and are now closed:

| Question | Resolution |
|---|---|
| *"What is the definition / meaning of 'Lapsed Re-Engaged'? How is it calculated?"* | **Deprecated** in favor of **Routed Calls** in the Monthly hero (Section 9.3). "Lapsed" stays as a *secondary* customer-behavior metric in the Customer-Centric block downstream of the hero, but it is **no longer a hero-tier KPI**. Definition refinement deferred to Phase 2+ alongside the "new vs returning" definition. |
| *"[EOC] What are the definitive metrics for the Opt-in → Booked flow?"* | **Resolved by Section 9.4 single conversion funnel.** The full flow now reads `Reached leads → Contacted → Appointments → ABR%`. Opt-in is implicit in `Reached leads` (we don't contact opt-outs); Booked is the `Appointments` step; the rate (`ABR%`) explicitly closes the loop. |

---

## 10. Self-serve subscription platform (Phase 2 spec)

This expands Section 8 Phase 2 with concrete features informed by the Phase 1 prototype review.

### 10.1 Recipient-based common-defaults logic

Subscriptions split into **two layers**:

1. **Role-default common** — every recipient with role X inherits the same baseline subscription set. Defined once per dealer group, applies to every rooftop in the group. Example: every "Sales Manager" across Anderson Auto Group's 6 rooftops gets Daily (Sales) + Weekly (Sales) + Monthly (Sales) + EOC (Sales OB) by default.

2. **Per-recipient override** — any single recipient can deviate from the role default. Their override does not propagate back to the role default. Resetting a recipient to "follow role default" is a one-click action.

**Why this matters:** today's design has every recipient managing their own subscription independently. At a group with 50+ recipients across 6 rooftops, that is operationally untenable. The dealer group's admin needs to set "this is how every Sales Manager in our group sees things" once and only deviate by exception.

The data model:

```
dealer_group.role_defaults:           { role → [{email_type, agent_filter, sections}] }
recipient.subscription_overrides:     { email_type → SubscriptionOverride? }
                                      // null/missing = follow role default
recipient.effective_subscriptions:    Computed at send time =
                                        merge(role_defaults[recipient.role], recipient.overrides)
```

### 10.2 User-level preference setup (subscription editor)

The per-recipient subscription editor must support:

1. **Email type selection** — Daily / Weekly / Monthly / EOC. Each toggleable on/off.
2. **Frequency** — defaults per email type (Daily / Weekdays only / Weekly summary etc.); user picks from a preset list, not free-form cron.
3. **Section toggles** — per email type, the recipient can hide individual sections from a known section catalog (e.g., for Daily: hide "Top vehicles", "After-hours coverage", "Outbound block").

**Live email preview as a right-nav-bar panel.** The subscription editor is a two-column layout on desktop: controls on the left, a **persistent right rail** showing the email being configured. As the user toggles sections on/off or selects a different email type, the right rail re-renders the preview in real time. The rail is sticky to the viewport on desktop (always visible while scrolling the editor), and stacks below the controls on mobile.

Key behaviors:
- The currently-previewed email type is selected by clicking the email-type row in the editor (a "Previewing" indicator highlights the active row).
- The preview uses the same component library as the production email render (single source of truth).
- It renders against a representative dataset, not the recipient's actual current data, so the preview never implies "this is your next email." Header on the rail labels it clearly as **"Preview"** alongside the current frequency pill.
- No "save and check inbox" round-trip. This directly addresses pilot feedback that dealers can't reason about a subscription change without seeing it.

### 10.3 Out of Phase 2 scope (still deferred)

- Drag-drop section builder (Phase 3)
- Custom triggers (Phase 3)
- Per-section data filters (Phase 3)
- **Sent-email logs + manual resend** (moved to Phase 3 — see Section 10.4 below)
- Send-time scheduling overrides (e.g., send my daily at 10 AM not 7 AM)
- Direct edit of email copy / branding

### 10.4 Sent-email logs — Phase 3 priority

**Moved from Phase 2 to Phase 3** after design review. Rationale: Phase 2 ships when the configure-and-preview loop is solid; an audit-and-resend surface is downstream of that. Customers asking "did Matt get yesterday's daily?" can be answered today via internal CS tooling — not blocking renewal. Ship the configurable comms platform first; logs follow once the value of self-serve is proven.

When it ships in Phase 3:

1. **List view** — table of every email Vini has sent for the dealer (or group), filterable by recipient, email type, send date, status (delivered / bounced / opened / clicked).

2. **Detail view** — clicking a row opens the rendered HTML of the email exactly as the recipient received it. Includes recipient address, subject, timestamp, delivery status, open + click events.

3. **Manual send / resend** — from the detail view, an admin can:
   - Resend the same email to its original recipient
   - Send a copy to a new email address (for example, a new GM joining the dealership who wants to see the most recent monthly)
   - Trigger an off-cadence send for a specific recipient ("send today's daily digest now to Matt at Honda DTLA")

**Logs retention:** 90 days at launch; longer SLA negotiable per group.

**Audit trail:** every manual send is logged with who initiated it (logged-in dealer admin email + timestamp) so it's clear when an email was system-generated vs human-triggered.

> **Prototype note:** The prototype platform ships a working Logs UI for engineering reference, but it is **labelled "Phase 3 preview"** in the navigation so reviewers and engineering understand the intended ship order.

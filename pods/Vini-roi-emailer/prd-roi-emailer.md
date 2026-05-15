# PRD: Vini Dealer Reporting Emailers (Phase 1)

**Author:** Subhav
**Product:** Vini
**Pod:** Vini Product Team
**Date:** 15 May 2026
**Status:** draft · v2 (post-design-review revisions)

---

## 1. Job to be done

As a dealership stakeholder, I want a regular, defensible view of what Vini did for my dealership, what value it delivered, and what my team needs to act on — so I can defend the Vini investment, run my Monday review, and stop missing follow-ups *(Signal §1, pillars 1–3; Signal §3 quote 5: "As a Dealer Principal I would want have clear visibility to see how each of my depts are performing which is each agents")*.

---

## 2. Success metrics

### Primary

- **Metric:** Weekly active engagement with cadence emailers — % of role-mapped recipients who **open at least one email AND click at least one CTA per week**.
- **Target (within 30 days):** ≥ 60% of role-mapped recipients across all live rooftops.
- **Current baseline:** Not measured today. Per Signal §4, "Email analytics not tracked but explicitly asked by multiple POCs at dealership level." Assumed baseline: 0% measured engagement (instrumentation lands with this PRD).
- **Measurement source:** Email tracking pixel (open) + UTM-tagged CTA click events captured in product analytics warehouse, joined to recipient role from dealer config.

### Secondary

- **Metric:** Reduction in Freshdesk tickets tagged with ROI / dashboard / reporting visibility.
- **Target (within 30 days):** From 5+ tickets/month (Signal §4) to ≤ 2 tickets/month.
- **Current baseline:** 5+ tickets/month (Signal §4, source Freshdesk).
- **Measurement source:** Freshdesk tag filter `reporting-visibility`, `roi-dashboard`, `report-request`.

- **Metric:** Reduction in CS-pulled ad-hoc report requests for live Vini rooftops.
- **Target (within 30 days):** 50% reduction vs. trailing 30-day average.
- **Current baseline:** Per Signal §6, "those who do not have access to both [email + console] have to request CSMs to share the data." Volume to be captured at PRD kickoff from CS request log.
- **Measurement source:** CS request log (Linear / Slack `#csm-requests` audit), filtered to "report / numbers / performance" intent.

---

## 3. Non-goals

1. **Self-serve recipient management UI.** Dealers cannot add, remove, or reassign POCs themselves in Phase 1. Recipients are derived from role-mapped defaults sourced from dealer config (Signal §1 pillar 4 is acknowledged; the configurable-comms UI is explicitly deferred).
2. **Section toggles or frequency overrides inside emails.** A recipient cannot turn off "Top Vehicles" or change Weekly → bi-weekly in Phase 1. Default sections fixed.
3. **Custom email builder.** No drag-drop section assembly or custom-trigger emails (e.g., "send when campaign crosses 50%"). Deferred.
4. **Non-email delivery channels.** No Slack, SMS, or in-portal notification delivery — email only.
5. **DMS-connected actual revenue.** No "Actual revenue influenced" reconciliation against the dealer's DMS. Optional dealer-configured `avg_appointment_value` may render an estimate sidebar, but actual-revenue ingestion is out.
6. **Per-lead drill-in inside the email body.** Drill-in lives in the console via deep-link CTA, not in the email itself — addresses the dual-tab pain in Signal §3 quote 3 by deep-linking, not by embedding.

---

## 4. Harness spec

The bulk of Phase 1 is deterministic reporting. One surface is AI-generated: the **Story-of-the-Week / Story-of-the-Month narrative summary** that turns a selected customer journey into a 2–3 paragraph anonymized story. Justification: Signal §3 quote 4 ("I would want to see what actions are taken by agents on my hot leads") implies a *narrative* of agent behavior, not a table.

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

**Coverage plan:** Deterministic surfaces are covered by unit tests on every metric formula and rendering rule, integration tests for full email render including edge cases (one test per row of the matrix), and E2E tests from warehouse query through SMTP delivery. The AI story summary needs an eval set of 30+ cases spanning: clean booking, recall/compliance escalation, at-risk save, lapsed re-engagement, multi-touch journey, conversation that flipped from negative → positive sentiment, very short conversation (1–2 turns), very long (15+ turns), failed booking, and explicit PII-leak attempts in the source transcript. Rubric grades: factual accuracy (no claims not in transcript), anonymization (zero PII), tone (operational, not marketing — Signal §7 calls existing "estimated revenue" framing a liability), length (2–3 paragraphs), and "why selected" badge match.

---

## 6. Prototype scope (≤5 days)

The 5-day prototype targets the **Daily Digest only** for **one design-partner rooftop** (Honda DTLA — Signal §3 quote 6 is an explicit ask from Matt at Honda DTLA for a daily export). Goal is to prove the data pipeline produces defensible numbers and the dealer-facing framing lands. NO AI in the prototype.

1. **One template — Daily Digest.** Sections shipped: header with date + dealer + agent badge, hero (Yesterday + MTD appointments with BDC-hours subtitle), one KPI strip (Avg first-contact time, Engaged rate %), Top 4 Vehicles of Interest, one primary CTA (`View Today's Appointments`). Skipped: Action Required section, After-Hours block, Warm Transfers, Outbound section, footer BDC-hours card. Skipped surfaces have full spec but ship Phase 1 post-prototype.
2. **One rooftop, one hard-coded recipient.** Honda DTLA, recipient = Matt's email from Signal §3 quote 6. Role-mapped recipient logic deferred to Phase 1 build.
3. **Manually triggered send.** No 7 AM scheduler yet — sends via internal admin endpoint. Scheduling lands in Phase 1 build.
4. **Existing Vini reporting tables only.** No new aggregation pipeline. If a metric requires upstream changes, drop it from the prototype.
5. **One edge case handled:** Yesterday=0, MTD>0 — renders "0 / N MTD" in neutral gray. All other edge cases deferred but specced.
6. **Plain HTML, no design system.** Final CTA button style + brand colors deferred to Phase 1 build. Prototype renders cleanly in Gmail web only.

Anything outside this list is explicitly out of scope for the 5-day prototype.

---

## 7. Kill criteria

1. **Design-partner rejection of the value reframe.** During prototype review with 3 design-partner rooftops (Honda DTLA + 2 others), if 2 or more explicitly say the work-delivered framing (conversations handled, appointments booked, BDC-hours equivalent) is *less* useful than the existing "estimated revenue influenced" framing they distrust, the reframe is wrong. Kill the PRD and revisit Signal §1 pillar 2 with new research.

2. **Data unreliability.** If the existing Vini reporting tables show >10% discrepancy with the rooftop's CRM for the same date range during prototype QA across 3 rooftops, we cannot ship defensible numbers. Per Signal §7, "estimated-revenue framing is a known liability" precisely because dealers cannot defend our sources — kill until the upstream data layer is fixed (out of scope of this PRD).

3. **Engagement floor missed at 30 days.** After 30 days of Phase 1 production, if weekly active engagement (primary metric) is < 30% (half target) AND Freshdesk ROI tickets have not dropped by at least 25%, the hypothesis that emailers solve Signal §1 pillars 1–3 is invalidated. Kill before investing in the configurable-comms platform (Signal §1 pillar 4 / Phase 2+).

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

### Phase 2 — Self-serve configuration layer *(target: 2–3 months post-Phase-1)*

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
- Signal §3 quote 6 (Matt at Honda DTLA): *"…schedule a daily export of AI conversations and conversions for the live agents"* — direct ask for self-serve scheduling.

---

### Phase 3 — Custom email builder *(target: 4–6 months post-Phase-2)*

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
- Large multi-rooftop groups in Signal §2 (Anderson Auto Group archetype) with diverse role configurations across rooftops.
- OB Campaign Managers running multiple parallel campaigns who need campaign-specific notification cadences (Signal §1 pillar 1 + §7 "OutBound campaigns scaling").

---

### What "phase" means operationally

- **Phase 1 build is gated by this PRD's success metrics + kill criteria** (Sections 2 + 7).
- **Phase 2 build is gated by Phase 1 success.** If Phase 1 hits engagement floor (≥ 60% weekly active) and reduces support load (≥ 60% ticket reduction), we have evidence the email surface is consumed — Phase 2 amplifies it. If Phase 1 misses, we kill rather than invest in customization on a low-value base.
- **Phase 3 build is gated by Phase 2 adoption.** Specifically: if < 30% of large dealer groups (3+ rooftops) configure at least one Phase 2 customization within 60 days of Phase 2 GA, the appetite for full custom-builder doesn't exist — stop at Phase 2.

---

## 9. Email design specifications (v2 — post-design-review)

Each section below is **prescriptive** for engineering and design. These are not "nice-to-haves"; they're the contract the prototype renders today.

### 9.1 Daily Digest

**No GM (all-agents) view in Phase 1.** Subscriptions are agent-specific: Sales (IB + OB) or Service (IB + OB). The "all-agents" digest is deferred — too noisy to be useful by every reader's account in pilot reviews.

**Shared skeleton (Sales OR Service):**
1. Header — date · dealer · agent type badge
2. Hero — Yesterday + MTD appointments (neutral gray when both 0)
3. Action Required — list of action types with counts, **single CTA** at the bottom: `Review N items` (count = sum of all open action items)
4. Inbound activity — **top two KPIs only**: Unique Leads + Appointments. Other metrics (avg first-contact, engaged rate, ABR) demoted to a smaller secondary row
5. Top vehicles / top intents (Top 4)
6. Outbound section (when OB agent in subscription)
7. Footer — dealer + period + unsubscribe. **NO** "BDC-hours equivalent of agent effort" line (removed for v2)

**Sales-only differences from Service-only:**
- Sales shows channel split (Call / SMS / Chat) on the unique-leads row
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

### 9.2 Weekly Performance Report

**No GM (all-agents) view.** Four agent-specific variants:

| Variant | New for v2? | Top-of-fold composition |
|---|---|---|
| Sales OB | retained | Per-agent KPI strip · Day-by-day (Leads / Interactions / Appointments) · Funnel · Channels · Top vehicles · Story |
| **Sales IB** | **new** | Per-agent KPI strip · Day-by-day (Leads / Interactions / Appointments / ABR%) · Funnel · Channels · Top vehicles · Story |
| Service IB | retained, restructured | **Week at glance** (Total calls / Appointment intent / Appointments / ABR%) · Day-by-day (Leads / Qualified / Appointment intent / Appointments / ABR%) · Top services · Story |
| **Service OB** | **new** | Per-agent KPI strip · Day-by-day (Customers reached / Connected / Appointments / Cost/Appt) · Top services · Story |

**Removed across all variants:** "67% new · 33% returning customers this week" line. Internal pilot review showed dealers find the new/returning split confusing without a definition of "returning" (within Vini? within CRM? within 12 months?). Defer to Phase 2 or 3 once we have a clear definition.

### 9.3 Monthly Value Report

**Hero — reduced verbiage, more visual:** Replace the multi-line headline (`In April, Vini handled 1,420 unique customers across 2,956 conversations — equivalent to ~340 hours of BDC effort. 147 appointments booked · 47 lapsed re-engaged · 63 booked after-hours.`) with three large stat tiles:

```
[ 1,420 customers reached ]   [ 147 appointments ]   [ 47 lapsed customers re-engaged ]
                              (this month)
```

Sub-line: `Across X conversations` (small, secondary).

**Reorder of major blocks (top → bottom):**
1. Hero (3 stat tiles)
2. KPI grid (6 cards, MoM deltas)
3. **6-month trend chart** *(moved up from previous "below stories" position)*
4. Customer-Centric block (unique, new vs returning, avg touches, lapsed)
5. Multichannel mix
6. **3 Customer Stories** *(moved down)*
7. Optional value-estimate sidebar (renders only if `avg_appointment_value` set)
8. Footer

Rationale: trend confirms continuity of value; stories are the texture *after* the trend, not before.

### 9.4 End-of-Campaign Report

**Headline:** unchanged (lead with appointments + conversion %).

**Conversion funnel:** **Remove the "Shown" step.** Dealer pilot reviews said "shown" is unreliable in CRM data and creates a noisy spike between booked and closed. The funnel now reads:

```
Reached → Engaged → Booked
```

Closing rates roll up to the Recommendations section instead.

**Replace "Top objections heard" with "Top exit intents":** auto-extracted from transcripts, but reframed as outcomes rather than as customer pushback. Default exit-intent buckets:

| Exit intent | Description |
|---|---|
| Vehicle purchased | Customer already bought (us or competitor) |
| Not in market | Customer not actively shopping right now |
| Opt-out | Customer requested DNC or unsubscribed |
| Awaiting next model year | Customer waiting for new model release |
| Price out of range | Pricing-based exit |
| Trade-in mismatch | Trade valuation gap broke the deal |

**Recommendations block:** retained, made more concrete — 3-5 actionable bullets tied to the exit-intent distribution (e.g., if "Vehicle purchased" is top exit intent, the recommendation is to suppress this audience segment in the next campaign).

---

## 10. Self-serve subscription platform (Phase 2 spec)

This expands §8 Phase 2 with concrete features informed by the Phase 1 prototype review.

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
- **Sent-email logs + manual resend** (moved to Phase 3 — see §10.4 below)
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

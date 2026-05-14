# PRD: Vini ROI Dashboard

**Author:** Abhi
**Product:** Vini
**Pod:** Vini Product Team
**Date:** 2026-05-13
**Status:** draft

---

## 1. Job to be done

Dealer Principals and GMs need one place to see what Vini is actually doing for their business — which appointments closed, how after-hours calls were handled, what their agents did on hot leads, and how each store compares — so they can stop guessing about whether Vini is worth keeping.

---

## 2. Success metrics

### Primary
- **Metric:** % of active Dealer Principals and GMs who view the ROI dashboard at least once per week
- **Target (within 30 days):** ≥40% of provisioned DP/GM users log in at least once per week across 3 consecutive weeks
- **Current baseline:** 0% (no ROI dashboard exists today; dealers check their own CRM)
- **Measurement source:** Vini platform session logs, filtered by DP/GM role

### Secondary
- **Metric 1:** Freshdesk support tickets tagged as ROI or dashboard-visibility related
  - **Target (within 30 days):** Drop from 10+ per month to <5
  - **Current baseline:** 10+ tickets in the past month
  - **Measurement source:** Freshdesk ticket tags/category; counted monthly

- **Metric 2:** Renewal accounts previously stalled due to ROI visibility that progress to payment
  - **Target (within 30 days):** At least 2 stalled accounts unblocked
  - **Current baseline:** Not yet baselined — CS to pull before launch
  - **Measurement source:** Internal revenue/CS tracking

---

## 3. Non-goals

1. **No incremental gross attribution model.** The dashboard shows outcome counts (appointments set, showed, closed). It will not claim Vini caused a sale vs. a deal that would have closed anyway — this is a known failure mode and is explicitly excluded from Phase 1.
2. **No CRM two-way sync.** Data comes from Vini's own call and appointment records. Dealers currently check their CRM separately; closing that integration gap is a follow-on effort.
3. **No compliance or off-brand call alerting.** Flagging what Vini said incorrectly is a separate real-time monitoring feature with different urgency and tooling — not addressed here.
4. **No agent-level performance ranking or leaderboards.** Individual agent comparison across dealerships is out of scope for Phase 1.
5. **No Vini vs. BDC cost-benefit model.** The dashboard surfaces Vini's outcomes; the DP/Owner makes the staffing decision using that data.

---

## 4. Harness spec

- **Model:** Claude Haiku 4.5 for two AI-generated surfaces: (1) the weekly narrative summary in the email digest, and (2) the "what happened this week" plain-language insight card on the dashboard home screen. Haiku is chosen over Sonnet 4.6 because the input is structured (counts and outcomes, not free-form text) and the output is short (≤150 words per surface). If eval pass rate falls below 70%, revisit with Sonnet 4.6.

- **Tools the AI calls:**
  - `get_weekly_call_stats(dealer_id, week_start_date)` → total inbound/outbound calls, after-hours call count, per-call outcomes (appointment set, no answer, callback requested)
  - `get_appointment_funnel(dealer_id, week_start_date)` → appointments set, showed, demo'd, closed
  - `get_lead_activity_summary(dealer_id, week_start_date)` → hot leads touched, outreach attempts per lead, last action taken
  - `get_top_call_examples(dealer_id, week_start_date, n=3)` → 3 representative calls for illustrative detail

- **Context strategy:** Pull structured data for a single dealership for the selected date range (default: trailing 7 days). Pass in: call volume, after-hours count and outcomes, appointment funnel, lead activity summary, and 3 representative call snippets. Cap context at 2,000 tokens per dealership. No raw transcripts passed in Phase 1 — extracted outcome labels only.

- **Fallback path:** If the model call fails, exceeds a 10-second timeout, or returns output that fails format validation (numeric mismatch vs. source data, missing required fields), the dashboard insight card is hidden and replaced with the raw metrics table. The email digest falls back to a deterministic send with numbers only, no narrative. Both failures are logged; if fallback rate exceeds 5% in a batch, on-call is alerted.

- **Cost ceiling:** $0.05 per weekly digest email per dealership. Dashboard insight card: $0.03 per load (generated once per day per dealership, cached for subsequent views). At 1,000 rooftops: ~$80/week combined. Hard-stop if per-dealership cost exceeds 2× ceiling in a single day.

---

## 5. Quality bar

| Surface | Type | Quality artifact |
|---------|------|-----------------|
| Core metrics computation (call volume, show rate, close rate, after-hours %) | [deterministic] | Unit tests with edge cases: 0 calls, 0 appointments, divide-by-zero guards |
| Date range selector and data retrieval | [deterministic] | Integration tests against staging Vini data; E2E test with known fixture week |
| Lead-level activity drilldown (click customer → profile) | [deterministic] | E2E tests: assert call recording, transcript, and vehicle info load correctly per lead |
| After-hours call filter and report | [deterministic] | Integration tests: filter returns only after-hours calls with correct outcomes |
| Multi-rooftop switcher (read-only) | [deterministic] | Unit tests: store switch loads correct data for selected rooftop; no data bleed between stores |
| AI insight card on dashboard home | [ai-generated] | 30 eval cases minimum; grading rubric below |
| Weekly email digest (schedule + send) | [deterministic] | Unit tests: timezone conversion for all US time zones; DST edge cases; manual send button |
| AI narrative in weekly email | [ai-generated] | Shares eval cases with insight card rubric |
| Fallback (raw metrics on AI failure) | [deterministic] | Integration test: force model timeout; assert fallback renders correctly |

**AI eval grading rubric — each case graded pass/fail on all 5 criteria:**
1. No hallucinated numbers (every figure matches the data payload passed in)
2. No incremental gross claims (must not say Vini "caused," "generated," or "drove" a closed deal)
3. Correct dealer store name and date range referenced
4. After-hours call count and outcomes correctly reflected
5. Output is ≤150 words

**Coverage plan:** 10 happy-path cases (typical active week), 10 edge cases (zero calls, zero appointments, zero after-hours, week spanning month boundary, single rooftop with thin data), 5 cases modeled on customer-reported failures (inflated appointment counts from quote #1, wrong timezone), 5 cost/latency stress cases (high call-volume weeks, large lead lists). Eval baseline must reach ≥80% pass rate before any external access is granted.

---

## 6. Prototype scope (≤5 days)

1. **Day 1–2:** Data pipeline — pull trailing 7 days of call volume, after-hours call count, and appointment funnel (set / showed / closed) from Vini's backend for one pilot dealership. Validate against that dealer's known data manually.
2. **Day 2–3:** Core dashboard page — display key metrics (total calls, appointment funnel, after-hours call count and outcomes) for the pilot dealership with a date range selector (default: last 7 days). No design polish; accurate and readable is the bar.
3. **Day 3–4:** Lead-level drilldown — make customer rows clickable to show the full customer profile (call recording, transcript, vehicle info) in one view, without switching tabs. This directly addresses the BDC friction in ticket #14631.
4. **Day 4–5:** Weekly email digest — Monday 7am dealer local time trigger; AI narrative summary + raw metrics table; plain-text fallback; manual "send now" button for QA. Implement fallback (raw metrics only) for AI failure.

**Explicitly out of scope for Phase 1:** multi-rooftop comparison view, CRM integration, incremental attribution model, compliance/off-brand call alerts, agent-level performance breakdown, Vini vs. BDC cost comparison, dealer-configurable metrics, unsubscribe flow beyond email provider default.

---

## 7. Kill criteria

1. **≤20% of pilot DP/GM users view the dashboard in the first 3 weeks** after onboarding — indicates the dashboard doesn't surface information they consider actionable, and further iteration on content won't change that.
2. **AI eval pass rate stays below 70% after two weeks of active iteration** — if more than 30% of generated insight cards or email narratives hallucinate numbers or make incremental gross claims, the AI surfaces are a liability and must be cut (fall back to deterministic-only).
3. **Per-dealership cost exceeds $0.15/week at prototype scale** (3× ceiling) and neither a model swap nor prompt compression can bring it under $0.10 — the unit economics don't work at 1,000 rooftops.

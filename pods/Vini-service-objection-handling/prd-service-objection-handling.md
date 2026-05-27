# PRD — Service Objection Handling AI Agent (MVP)

**Author:** Subhav Malhotra · **Product:** Vini · **Pod:** Service Objection Handling · **Date:** 2026-05-27 · **Status:** draft

---

## Problem statement

Service callers who push back on the Vini agent — about pricing, warranty, "talk to a real person," generic transfer demand, or off-script asks (sales, finance, body shop, wrong dealer, directions) — get transferred to humans instead of being rebutted-plus-booked. The agent gives up at the first sign of friction.

**Impact** — Across 414 sampled service calls (4 rooftops): **66% end in transfer**, only **14% end in an agent-booked appointment**, **79% are flagged queryResolved=No**, and **14% are the same caller calling back within 4 hours** (Brown Daub: 27%). Vini's own grader flags *"Could have offered to schedule an appointment proactively"* as the #1 improvement on service calls. **At 19 live rooftops × 500–600 calls/month, a 10pp lift on appointment rate = ~$3.6M–$4.4M/yr in dealer service revenue.**

---

## Who

| User | Context | What They Need | Verbatim signal |
|---|---|---|---|
| Vehicle Owner — pricing ask | Calling to find out cost before committing | Range + a slot offer, not a transfer | *"Yes. What is the price? Of the oil change?"* — SPDH `019e2ba7-70ce-7115-b398-306b2a9907ea` |
| Vehicle Owner — warranty ask | Calling to check if a repair is covered | "Advisor confirms at inspection" framing + slot, not a cold transfer | *"So I was wondering if my girlfriend's car had a warranty for compressor related issues."* — SPDH `019e3d7b-733d-755e-9db7-83e2ab2b3b3c` |
| Vehicle Owner — "real person" deflection | Doesn't trust the AI; wants to skip it | One confidence-recovery line + slot before any transfer | *"Can I... talk to a representative, please? I just want exactly the same appointment for a different time. I don't really have time to go through all that."* — SPDH `019e2658` |
| Vehicle Owner — generic transfer demand | No objection stated, just escalating | One-line "I can actually book that directly" + slot | *"Connect me [to] service team."* — WCSouth `019e3bcc-e7b2-7bbe-b96d-4761f91792e1` |
| Vehicle Owner — off-script ask | Wrong dept, wrong dealer, body shop, directions, non-automotive | Polite close or cross-dept route — never to human BDC | *"Yes. I need a sales manager."* — WCSouth `019e3baa-8a5f-7000-8497-8a7c4779ad66` · *"Yes. Is this KIA on IH 35?"* — WCSouth `019e2194-720f-7000-9c3c-5830bb8b094f` |
| Business Owner / BDC Manager | Owns appointment + transfer KPIs across the dealership | Agent that rebuts and books instead of escalating | BDC playbook pattern (Signal §6): *"Oil change starts around $X — advisor pins exact at intake. I have 9am or 11am tomorrow?"* — hard rules: never quote exact $, never itemise, always pair with slot |
| Service Advisor | Receives the calls that truly need them | Calls handed over with full context, not cold | Vini grader (Signal §4 D7): *"Provide more detailed information about next steps after transfer."* — 3× |
| CS / Onboarding Lead | Configures the agent per dealership | A 15-min structured override capture during the existing onboarding call | (no direct verbatim — process owner) |

---

## Solution

Add a **rebuttal-plus-slot-offer layer** to the existing Vini service agent. For each of 5 P0 objection buckets, the agent follows the pattern **Acknowledge → Reduce Risk → Two-Option Close**, using a dealer-specific config (captured during onboarding, with product-wide defaults if skipped). For non-rebuttable asks (repair status, recall, true escalation), continue to transfer with full context. Shipped as a prompt + tool + config change on the existing **Vapi** assistant — no UI, no new telephony.

---

## Success Metrics

| Metric | Target | Description | How to Measure |
|---|---|---|---|
| Agent-booked appointment rate (P0 calls) | **≥ 24%** (baseline 14%) | Appt-booked outcome on calls touching any P0 bucket | `count(Outcome="Service Appointment Booked") / count(P0-bucket calls)` from Vini call-log |
| Transfer-to-service rate (P0 calls) | **≤ 56%** (baseline 66%) | Transfers on calls touching any P0 bucket | `count(Outcome="Transferred To Service Team") / count(P0-bucket calls)` |
| Rebuttal+slot compliance | **≥ 85%** of qualifying turns | When a P0 objection is raised, next 2 agent turns contain rebuttal AND ≥2 time slots | Transcript grader on `callDetails.messages`, nightly on eval set + 10% prod sample |
| Repeat caller within 4h | **≤ 10%** (baseline 14%, Brown Daub outlier 27%) | Same `fromNumber` calling again within 4h | Time-windowed grouping on `callDetails.startedAt` |

All targets measured within 30 days of rollout to all 19 rooftops.

---

## Scope

1. Inbound service calls only — text + Vapi voice
2. 5 P0 objection buckets: Generic transfer demand · Talk to a real person · Warranty · Pricing · Off-script
3. Rebuttal-plus-slot pattern (Acknowledge → Reduce Risk → Two-Option Close)
4. 4 hard-rule guardrails (never exact $, never assert warranty, always two-slot close, no blind transfers)
5. Per-dealership config YAML captured by CS during onboarding (with product-wide defaults)
6. L1 routing for 7 hard-stop trigger categories (after rebuttal attempt, where rebuttal applies)
7. Tools: pricing-range lookup, warranty-summary lookup, slot fetch, book appointment, cross-dept transfer, polite end-call

## Out of Scope

1. Repair-status checks and recall scheduling (continue to transfer)
2. Quoting exact dollar amounts or itemising jobs
3. New customer-facing UI / dealer dashboard
4. Self-serve dealer admin panel (Phase 2)
5. Model fine-tuning
6. Spanish or non-English language paths
7. Outbound campaign reuse
8. DMS write operations (book is the only write; everything else is read)
9. New telephony / ASR / TTS providers (Vapi only)

---

## Workflow — Happy Path

| # | Stage | Agent Action | System Call |
|---|---|---|---|
| 1 | Greet + intent detect | Identify call as service; detect objection bucket if present | Intent classifier |
| 2 | Customer resolution | Caller ID → name+phone fallback (1 attempt) | DMS customer lookup |
| 3 | Objection classification | Map to one of 5 P0 buckets, or "no objection / direct booking" | Bucket classifier (prompt-driven) |
| 4 | Rebuttal | Speak the bucket's rebuttal pattern from dealer config (or default); never quote exact $ | Read `dealer_config.<bucket>` |
| 5 | Two-option slot offer | Fetch next available slots; offer exactly two specific times | `get_available_slots(service, vehicle)` |
| 6 | Book or escalate | If accepted → book + confirm. If rejected → 1 alt-slot attempt. If still no → transfer with summary | `book_appointment` or transfer with payload |
| 7 | Confirm + close | Confirm booking details; check for any further intent; end politely | None |

---

## Rebuttal Disclosure Rules

| P0 Bucket | Say This (rebuttal frame) | Never Say |
|---|---|---|
| **Pricing** | "Starts around $X — your advisor pins exact at intake. I have 9am or 11am tomorrow — which?" | Exact $, line-item breakdown, "I think it costs…", any single fixed number |
| **Warranty** | "Coverage detail varies by VIN — your advisor confirms exact coverage at inspection, no charge. I can lock 9am or 11am — which?" | "Yes it's covered" / "No it's not", any coverage assertion, warranty terms verbatim |
| **Talk to a real person** | "Totally understand — most folks find I can book it faster than holding. Want me to lock 9am or 11am? If you'd still rather an advisor after, I'll transfer with full context." | "Sure, transferring now" on the first ask, denying being AI |
| **Generic "transfer me"** | "I can actually book that for you directly — what brings you in? I have 9am or 11am tomorrow." | Blind transfer, transfer without a 1-attempt rebuttal |
| **Off-script (per sub-type)** | See sub-type rules below | Transfer to human BDC, invent answers, guess body-shop number |

### Off-script sub-type routing

| Sub-type | Say This | Action |
|---|---|---|
| Sales / Finance dept ask | "That's our Sales / Finance team — let me get you over." | `cross_dept_transfer(dept)` |
| Manager / specific person (unclear dept) | "I can usually handle it faster than holding — what's it about?" | If service: rebut+book. If not: cross-dept transfer. |
| Body shop / collision / dent | "Body work is handled separately — their direct line is [config.body_shop_number]. Anything service-related I can help with first?" | `end_call_polite("body_shop_redirect")` |
| Wrong dealer / wrong number | "You've reached [Dealer]. Were you trying us, or [nearby same-brand]?" | If wrong: `end_call_polite("wrong_dealer")` |
| Directions / address / hours | "We're at [config.address], open [hours] — want me to book you for [day]?" | Inline answer + slot anchor |
| Non-automotive (hotel, weather) | "I can only help with [Dealer] service. Anything service-related before I let you go?" | `end_call_polite("non_automotive")` |
| Spanish / language mismatch | Acknowledge + offer Spanish-speaking callback if config flag set | Callback ticket or polite close |
| Abusive / venting unrelated | One de-escalation line, then polite close | `end_call_polite("abusive")` |

---

## Edge Cases

| Scenario | Logic | Action |
|---|---|---|
| Caller insists on transfer after 1 rebuttal | Caller repeats transfer/escalation demand after rebuttal+slot offered once | Transfer with payload (name, vehicle, ask, rebuttal attempted) — never blind |
| Multiple objections in one turn | Caller raises 2+ buckets (e.g. "How much, and is it under warranty?") | Acknowledge both; lead with the bucket the caller emphasised; one two-slot close |
| Repeat caller within 4h | Same `fromNumber` called <4h ago, same vehicle | Reference prior context: "Calling back about earlier — want me to lock that slot now?" |
| Tool failure (slots / pricing) | `get_available_slots` or `lookup_service_pricing` errors | Deliver rebuttal frame; offer "advisor callback within 15 min" + create callback ticket. Never blind-transfer. |
| Repeated audio failure | ≥2 "I can't hear you" turns | Polite handoff + callback ticket |
| Caller asks "Is this AI?" mid-rebuttal | Direct AI-identity question | Acknowledge ("Yes, I'm Vini's AI assistant") then continue with rebuttal+slot offer |
| Caller asks for repair status | Detect repair-status intent at any point | Hard transfer with summary (out of scope for rebuttal layer) |
| Caller asks about a recall | Detect recall intent at any point | Hard transfer with summary (out of scope for rebuttal layer) |
| Customer not found (caller ID fails + name/phone fails) | No DMS match after 1 attempt | Route to BDC with logged context — no retry loop |
| After-hours call | Service department closed per dealer config | "Service is closed — they open at [X]. I can lock the first slot, 7:30am or 8:00am." Never end without offering tomorrow's first slot. |

---

## L1 Hard-Stop Trigger Categories

Any one = immediate transfer with payload (no further rebuttal):

| Trigger | Route To |
|---|---|
| Repair status / "is my car ready" | Service Advisor |
| Recall scheduling or recall question | Service Advisor |
| Explicit human request after 1 rebuttal attempt | Service Advisor (with payload) |
| Complaint / dissatisfaction (non-rebuttable) | Service Manager |
| Sales / Finance department ask | Sales / Finance team |
| Pending RO approval decision | Service Advisor |
| Insurance claim / coverage litigation | Service Advisor |

L1 payload always includes: customer ID, vehicle, the caller's verbatim ask, the bucket detected, and the rebuttal attempt (if any).

---

## Onboarding Flow

**Trigger:** Added as a 15-min step in the existing CS-led Vini onboarding call. **No new dealer touchpoint.**

| # | CS asks the dealer | Captured field | Default if skipped |
|---|---|---|---|
| 1 | When a caller just says "transfer me" — rebut once or transfer immediately? | `transfer_on_demand_policy` | `rebut_once` |
| 2 | Phrasing for the confidence-recovery line ("most folks find I can book it faster…")? | `confidence_recovery_line` | Product-wide default |
| 3 | Any warranties you do NOT honour (aftermarket / out-of-state)? | `warranty_exclusions[]` | `[]` |
| 4 | Indicative ranges for oil change / brake inspection / diagnostic? | `pricing_ranges.<service>` | Make-level industry range |
| 5 | Off-script routing: sales / finance extensions, body-shop number, directions answer? | `off_script_routing` map | Polite close / main extension |

Output: one YAML file per dealership (`dealer-config/<slug>.yaml`) committed to the deployment repo. PM/Pod-Lead approval required before flipping the dealer to the new prompt. No self-serve admin UI in MVP.

---

## Prototype — How We Build It (5 days)

**Two-layer harness, Vapi parity:**

| Layer | Tool | Purpose | When |
|---|---|---|---|
| L1 | Python + Claude Sonnet 4.6 SDK (reuses `pods/vini-roi-emailerv2/prototype/ai-harness/` shape) | Replay 200+ scenario YAML against new prompt + mocked tools; score rubric + 4 guardrails. ~$2/run, ~3 min | Days 1–4 |
| L2 | **Vapi staging assistant** (same provider as production) | Voice-replay 20 hardest scenarios — catches barge-in, ASR errors, tool latency. ~$6 | Day 5 |

**Why Vapi for L2:** Vini production runs on Vapi (confirmed: `provider: vapi`). Google AI Studio / ElevenLabs would change the voice stack and confound the prompt experiment.

**Day-by-day:**
1. Day 1 — Agent prompt v1 + 200-case scenario YAML (40 per P0 bucket, seeded from Signal §3 verbatim quotes + adversarial variants)
2. Day 2 — Tool stubs + 4 guardrail checkers wired into eval runner
3. Day 3 — L1 runner + baseline run on current production prompt (so lift is measurable)
4. Day 4 — Iterate prompt against eval failures; add new scenarios for new failure modes (never weaken existing)
5. Day 5 — Real-data text replay on 50 sampled calls + L2 voice sanity on 20 scenarios + results doc

---

## Acceptance Criteria

### 1. Entity & Bucket Resolution

| AC | Criterion | Status |
|---|---|---|
| 1.1 | Resolves customer from caller ID without prompting for name | |
| 1.2 | If caller ID fails: asks name + phone once, no retry loop | |
| 1.3 | Customer not found → routes to BDC with logged context | |
| 1.4 | Classifies caller's first turn into exactly one of: {pricing, warranty, real_person, transfer_demand, off_script, no_objection, repair_status, recall} | |
| 1.5 | Multi-bucket turns (e.g. "how much and is it warranty?") detected and acknowledged in single rebuttal | |

### 2. Rebuttal Behaviour

| AC | Criterion | Status |
|---|---|---|
| 2.1 | When a P0 objection is detected, the next agent turn contains both a rebuttal sentence AND a two-option time slot | |
| 2.2 | Two slots are distinct, in the future, and from `get_available_slots` (no invented times) | |
| 2.3 | Agent attempts exactly 1 rebuttal before transferring on explicit human request | |
| 2.4 | Off-script body-shop / wrong-dealer / non-automotive ends in `end_call_polite()` — never transferred to human BDC | |
| 2.5 | Off-script sales / finance ask uses `cross_dept_transfer(dept)` with correct extension from config | |

### 3. Guardrails (zero-tolerance)

| AC | Criterion | Status |
|---|---|---|
| 3.1 | Agent never speaks an exact dollar amount on a pricing turn (regex + LLM-judge) | |
| 3.2 | Agent never asserts warranty coverage as fact — always pairs with "advisor confirms at inspection" | |
| 3.3 | Agent never blind-transfers — every transfer turn includes a 1-sentence summary payload | |
| 3.4 | Agent never uses speculative language ("probably", "should", "I think") on coverage or pricing | |
| 3.5 | After-hours calls always end with a tomorrow-first-slot offer — never ended with "we're closed" alone | |

### 4. Config & System Behaviour

| AC | Criterion | Status |
|---|---|---|
| 4.1 | Dealer config YAML is read at assistant startup; missing fields fall through to `_defaults.yaml` (no field ever blank) | |
| 4.2 | Same input + same dealer config + same system state = same agent turn (deterministic above temperature 0.2) | |
| 4.3 | All transfers log: bucket detected, rebuttal attempted (Y/N), destination, full call context | |
| 4.4 | Per-call cost ≤ $0.40 model spend; hard cutoff at $0.60 (Sonnet 4.6) | |
| 4.5 | Per-dealership-per-day cost ≤ $120; alert at 80%, hard-cap at 100% | |

### 5. Onboarding

| AC | Criterion | Status |
|---|---|---|
| 5.1 | A dealer with zero config overrides ships with a working agent on day 1 (all defaults apply) | |
| 5.2 | CS captures all 5 override fields in ≤ 15 minutes during existing onboarding call | |
| 5.3 | Dealer-specific eval run executed against merged config before go-live (≥ 70% per bucket, 0 guardrail violations) | |
| 5.4 | 5 historic real calls from the dealer replayed through L1 with merged config; PM/Pod-Lead approval logged | |

---

## Kill Criteria

1. L1 eval pass rate stuck below 50% after 5 working days
2. Either guardrail 3.1 or 3.2 cannot be driven to 0 violations across the eval set
3. Per-call cost cannot be kept ≤ $0.40 with Sonnet 4.6 after prompt compression
4. Real-data replay on 50 sampled calls shows no directional lift on appointment-booked outcomes
5. The 5 P0 buckets together cannot hit the +10pp / −10pp gate even on paper

---

## Open Items

1. Confirm ACV unit ($1,000/rooftop monthly vs annual) — blocks rollout sign-off, not prototype build
2. Confirm 500–600 service calls/month/rooftop with CS data pull
3. Lock the 5 P0 buckets — Pod Lead + 1 engineer signoff before Day 1
4. CS lead signoff on the 15-min onboarding add-on
5. Eng to confirm Vapi staging assistant exists for L2 voice replay

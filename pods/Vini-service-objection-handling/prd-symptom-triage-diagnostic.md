# PRD — Symptom Triage & Diagnostic AI Agent (MVP)

**Author:** Subhav Malhotra · **Product:** Vini · **Pod:** Service Objection Handling · **Date:** 2026-05-27 · **Status:** draft

---

## Problem statement

Service callers describe a vehicle problem in their own words ("my engine light is blinking," "the car was towed in," "smoking after I drive," "flat tire") and the Vini agent today asks them to translate that symptom into a service opcode ("what service are you looking to get done?"). Callers either give up, get transferred, or guess at a service that doesn't match the real issue. None of these paths reliably end in a booked diagnostic with the symptom captured for the advisor.

**Impact** — Across 414 sampled service calls, **32 (7.7%)** explicitly describe a symptom. Of those: **41% transferred**, only **22% booked**, **72% flagged queryResolved=No**, and **only 41% even got an appointment pitch**. Symptom calls are high-intent (caller has a real problem), so they convert above average — but the silent loss is the missing verbatim handoff to the advisor: today no advisor note captures what the caller actually said. Safety-critical cases (accident, towed, smoke) are mixed into the same bucket as routine driveable issues — the agent does not triage driveability first.

---

## Who

| User | Context | What They Need | Verbatim signal |
|---|---|---|---|
| Vehicle Owner — driveable symptom | Calling about a noise, warning light, leak, or AC issue; car is still driveable | A diagnostic / inspection booking — without being asked to name the opcode | *"My engine light is blinking."* — WCSouth `019e3ccb-4135-7008-bf7b-5b07b45c48b5` · *"I'd like to bring my car in to find out about the noise that it's making."* — Brown Daub `019e2dc7-0566-7aa3-8d59-565c053c1472` |
| Vehicle Owner — safety-critical / not driveable | Car was towed, accident, brake failure, smoke, won't start | Fast escalation to a human with the verbatim already captured | *"My car broke down on the [highway]. And it's being towed up to your shop... figure out what happened because it just [shut] off while [I was] driving."* — SPDH `019e32a4-0051-7000-b8f3-0f7966362930` · *"I noticed that it's kind of been smoking after I drive."* — WCSouth `019e1ca7-9e19-7000-9f46-6654c099868b` |
| Vehicle Owner — ambiguous concern | Describes something vague ("a weird sound," "doesn't feel right") | A diagnostic booking framed as "advisor takes a look" — not a forced service-name guess | *"Yes. But I... wanna cancel it because the noise is all... the noise went away."* — Brown Daub `019e37c3-63a1-7001-abd3-5d49898d59e5` |
| Service Advisor | Sees the appointment in DMS before the customer arrives | The customer's exact words + a confidence flag, not a generic opcode | Vini grader: *"Could have asked for more details about the service request."* — 4× (Signal §4 D7) |
| Business Owner / BDC Manager | Owns diagnostic conversion + safety-incident routing | Every symptom call ending in either a booked diagnostic or an immediate escalation — never a dead-end | (no direct verbatim — KPI owner) |
| CS / Onboarding Lead | Configures triage rules per dealership | Dealer-level severity policy, opcode map, and "always transfer for safety-critical" toggle | (no direct verbatim — process owner) |

---

## Solution

Insert a **driveability-first triage layer** before any opcode talk. The agent's first question after the symptom is always *"Are you driving the car now, or do you need it towed?"*. If driveable, **silently** map the concern to the nearest diagnostic / inspection opcode and book it as *"I'll get you in for an inspection — advisor takes a look and tells you what's going on."* The agent **never** asks the customer to pick or confirm a service. The customer's exact words go into the appointment note as `[Concern verbatim: <words>]`, plus `[Confidence: Low]` if the mapping is ambiguous. Safety-critical paths (not driveable, accident, brake failure, smoke, won't-start) escalate immediately with the verbatim — no booking attempt. Shipped as a prompt + tool + config change on the existing Vapi assistant.

---

## Success Metrics

| Metric | Target | Description | How to Measure |
|---|---|---|---|
| Symptom-call diagnostic-booked rate | **≥ 50%** (baseline 22%) | Symptom calls ending in a booked diagnostic / inspection | `count(Outcome="Service Appointment Booked" AND symptom_flag=True) / count(symptom_flag=True)` |
| Driveability-asked rate | **≥ 95%** | Symptom calls where the agent's first response asks the driveability question | Transcript grader on next agent turn after symptom detected |
| Safety-critical escalation latency | **≤ 1 agent turn** after detection | Time-to-transfer on safety-critical signals | Turn-index of transfer event relative to detection turn |
| Verbatim-capture rate | **≥ 98%** | Booked / escalated symptom calls where `Concern verbatim: …` appears in the appointment note | DMS field check or appointment-creation payload audit |
| Mis-classification rate (safety-critical → driveable) | **0** in eval | Safety-critical symptoms routed to booking instead of escalation | Adversarial eval set, zero-tolerance |

All targets measured within 30 days of rollout to all 19 rooftops.

---

## Scope

1. Inbound service calls where the caller's first turn describes a symptom (any pattern from the symptom-bucket list below)
2. Driveability triage as the first agent question after symptom detection
3. Silent opcode mapping from symptom → diagnostic / inspection opcode (no customer confirmation)
4. Severity classification: `safety_critical` / `driveable_attention` / `driveable_routine`
5. Verbatim capture into the appointment-note field, with optional `[Confidence: Low]` flag
6. Immediate escalation path for `safety_critical` (no booking attempt)
7. Per-dealer policy gates (which severity classes book vs escalate)

## Out of Scope

1. Naming a specific repair or diagnosis on the call ("sounds like an alternator")
2. Quoting pricing for the diagnostic / inspection beyond an indicative range
3. Predicting the cause from the symptom — that's the advisor's job
4. Predictive ETA or job time on the call
5. Confirming opcodes with the customer ("does brake-system-inspection match?")
6. Modifying or routing existing repair orders
7. Recall handling (separate pod)
8. Repair status checks (separate pod)
9. New customer-facing UI / dealer dashboard

---

## Workflow — Happy Path

| # | Stage | Agent Action | System Call |
|---|---|---|---|
| 1 | Symptom detection | Detect symptom intent in caller's first turn; classify bucket (warning-light / leak / noise / vibration / brake / AC / wont-start / accident / smoke) | Symptom classifier (prompt) |
| 2 | Driveability check **FIRST** | Ask: *"Are you driving the car now, or do you need it towed?"* | None |
| 3 | Severity gate | Map (bucket × driveability) → severity ∈ {`safety_critical`, `driveable_attention`, `driveable_routine`} per dealer policy | `get_severity(bucket, driveable, dealer_policy)` |
| 4a | If `safety_critical` → escalate | Speak escalation line; transfer with full payload — never offer booking | `escalate_safety_critical(payload)` |
| 4b | If driveable → silent opcode map | Map symptom → diagnostic/inspection opcode; never speak the opcode name or ask the customer to confirm | `map_symptom_to_opcode(bucket, vehicle, dealer_opcode_map)` |
| 5 | Customer + vehicle resolve | Caller ID → name+phone fallback (1 attempt) | DMS customer lookup |
| 6 | Slot offer + book | "I'll get you in for an inspection — advisor takes a look and tells you what's going on. I have 9am or 11am tomorrow — which?" | `get_available_slots` → `book_appointment` |
| 7 | Verbatim capture | Write `[Concern verbatim: <caller words>]` into appointment note; add `[Confidence: Low]` if mapping is ambiguous | `append_appointment_note(appt_id, text)` |
| 8 | Confirm + close | Confirm booking, repeat verbatim back ("got it — the advisor will know you mentioned a blinking engine light"), end politely | None |

---

## Severity & Driveability Disclosure Rules

| Severity Class | Trigger | Say This | Never Do |
|---|---|---|---|
| **`safety_critical`** | Not driveable · accident · airbag deployed · being towed · brake failure · smoke / fire / burning smell · won't start AND stranded · steering loss | "That sounds urgent — I'm getting you to the service team right now. Stay on the line." → immediate transfer with verbatim payload | Offer to book a future slot; ask any follow-up beyond "are you somewhere safe?"; modify or interpret severity flag |
| **`driveable_attention`** | Check engine light blinking · brake noise + driveable · overheating warning · transmission slipping · flat-but-driveable | "I'll get you in for an inspection — advisor takes a look and tells you what's going on. I have [slot A] or [slot B] — which?" | Name the suspected cause; quote a repair price; ask the customer to confirm which service / opcode |
| **`driveable_routine`** | Check engine light steady · minor noise · AC issue · single-bulb-out | Same inspection framing + two-slot close | Same nevers as above |
| **`ambiguous`** | Description is too vague to classify ("weird sound," "doesn't feel right") | Treat as `driveable_attention`. Book inspection. Tag note with `[Confidence: Low]`. | Force the customer to describe more before booking; loop on clarifying questions |

---

## Edge Cases

| Scenario | Logic | Action |
|---|---|---|
| Multiple symptoms in one turn ("brakes squeak and AC is out") | Two buckets detected; severity = max of the two | Use highest severity class; one inspection booking; verbatim captures all symptoms |
| Caller answers driveability ambiguously ("kinda?") | Cannot resolve driveable Y/N from 1 question | Ask exactly one clarifying question (*"Could you drive it here today safely?"*). If still unclear → treat as `safety_critical` (safer default) |
| Caller refuses to answer driveability | Caller skips or deflects the question | Repeat once. If still no answer → escalate to advisor (safety side) |
| Symptom call but caller also asks pricing | Mixed intent | Driveability first. Then book + pricing rebuttal (range only, never exact $) — same hard rule as Objection-Handling PRD |
| Customer asks "what do you think it is?" | Speculative diagnosis ask | "I won't guess from here — the advisor will look and tell you exactly. Want me to lock [slot A] or [slot B]?" |
| Symptom + warranty question ("is this under warranty?") | Cross-pod intent | Driveability first. If driveable: book inspection. Use the warranty rebuttal from Objection-Handling PRD ("advisor confirms exact coverage at inspection") |
| Symptom = recall hazard (e.g. "engine recall, fire hazard") | Recall intent inside a symptom call | Hard transfer (recall is out of scope) — capture verbatim in transfer payload |
| Symptom = repair status confusion ("is my car ready, the noise is weird") | Status + symptom mixed | Hard transfer to advisor (repair status is out of scope) |
| Caller already towed in | Past safety-critical event | Treat as `safety_critical` even if they sound calm — transfer with verbatim |
| Caller insists on naming the repair ("I just need brake pads") | Customer self-prescribes | Acknowledge politely, still book as inspection: "We'll book an inspection so the advisor confirms the right fix — [slot A] or [slot B]?" |

---

## L1 Hard-Stop Trigger Categories

Any one = immediate transfer with full verbatim payload (no booking attempt):

| Trigger | Route To |
|---|---|
| Not driveable / being towed / stranded | Service Advisor (urgent queue) |
| Accident, airbag deployed, collision | Service Advisor (urgent queue) |
| Active brake failure | Service Advisor (urgent queue) |
| Smoke, fire, burning smell | Service Advisor (urgent queue) |
| Won't start AND caller stranded | Service Advisor (urgent queue) |
| Loss of steering / drivetrain | Service Advisor (urgent queue) |
| Explicit human request after 1 rebut attempt | Service Advisor |
| Recall mention | Service Advisor (out of scope pod) |
| Repair status mention | Service Advisor (out of scope pod) |
| Unresolved driveability after 2 turns | Service Advisor (safer default) |

**L1 payload always includes:** customer ID, vehicle, **caller's verbatim symptom description**, severity classification, driveability answer (or null + reason), and timestamp.

---

## Onboarding Flow — Per-Dealer Configuration

Captured by CS in the same 15-min onboarding step as the Objection-Handling PRD. Dealer overrides are merged into the shared dealer config YAML.

| # | CS asks the dealer | Captured field | Default if skipped |
|---|---|---|---|
| 1 | Which symptom buckets should always escalate as safety-critical, even if the caller says it's driveable? | `severity_overrides[bucket] = safety_critical` | `[accident, smoke, brake_failure, wont_start_stranded]` |
| 2 | Your diagnostic / inspection opcode per symptom bucket — which one do we book? | `opcode_map[bucket] = opcode_id` | Generic `multi-point-inspection` opcode |
| 3 | Diagnostic / inspection indicative pricing range? | `pricing_ranges.diagnostic` | Make-level industry range |
| 4 | After-hours safety-critical: voicemail, on-call advisor number, or both? | `after_hours_safety_routing` | Voicemail with verbatim + SMS to on-call advisor |
| 5 | DMS appointment-note field name for `Concern verbatim: …` | `dms.note_field` | `service_concern` |

A dealer with zero overrides ships with all defaults — the agent is live and safe on day 1.

---

## Prototype — How We Build It (5 days, shares harness with Objection-Handling PRD)

Same two-layer setup as the Objection-Handling PRD — Python text replay (L1) for iteration, Vapi staging (L2) for voice sanity.

| Day | Deliverable |
|---|---|
| 1 | Agent prompt v1 with symptom classifier + driveability-first rule + silent-opcode-mapping rule + verbatim-capture instruction. Scenario YAML: ≥120 cases (40 safety-critical, 40 driveable_attention, 20 ambiguous, 20 adversarial mix-ins like symptom+pricing, symptom+warranty) |
| 2 | Tool stubs: `get_severity`, `map_symptom_to_opcode`, `escalate_safety_critical`, `append_appointment_note`. Guardrail checkers: zero-tolerance for "safety_critical → booked" + "agent named the cause" + "agent asked customer to confirm opcode" |
| 3 | L1 eval runner + baseline run against current production prompt (so lift is measurable) |
| 4 | Iterate prompt against failures; add new scenarios for new failure modes |
| 5 | Real-data text replay on the 32 sampled symptom calls + L2 voice sanity on 15 hardest scenarios (focused on safety-critical and ambiguous) + results doc |

**Definition of done:** ≥ 70% L1 pass per severity class · **0 safety-critical mis-classifications** · 100% verbatim-capture on booked calls · L2 voice replay shows no new failure modes vs L1.

---

## Acceptance Criteria

### 1. Symptom Detection & Triage

| AC | Criterion | Status |
|---|---|---|
| 1.1 | When the caller's first turn matches any symptom pattern, the agent's **next turn** asks the driveability question — no opcode talk first | |
| 1.2 | Driveability question is asked in exactly one of two forms: *"Are you driving the car now, or do you need it towed?"* (or the dealer-config override) | |
| 1.3 | If driveability cannot be resolved in 2 turns → escalate as `safety_critical` (safer default) | |
| 1.4 | Multi-symptom turns are classified by max severity, not by the first symptom mentioned | |

### 2. Silent Opcode Mapping

| AC | Criterion | Status |
|---|---|---|
| 2.1 | For driveable cases, the agent **never** names the diagnostic opcode aloud (no "brake-system-inspection," no opcode IDs) | |
| 2.2 | The agent **never** asks the customer to confirm which service matches their symptom | |
| 2.3 | The agent books exactly the opcode returned by `map_symptom_to_opcode` for the detected bucket × dealer config | |
| 2.4 | When mapping confidence is low (ambiguous bucket or vague description), `[Confidence: Low]` is added to the appointment note | |
| 2.5 | The framing line *"I'll get you in for an inspection — advisor takes a look and tells you what's going on"* (or the dealer-config override) is used verbatim | |

### 3. Safety-Critical Behaviour (zero-tolerance)

| AC | Criterion | Status |
|---|---|---|
| 3.1 | When severity = `safety_critical`, the agent **never** offers a future slot — it escalates within 1 turn | |
| 3.2 | Escalation payload includes the caller's verbatim symptom description (not a paraphrase, not the bucket name) | |
| 3.3 | Agent never speculates on cause ("sounds like the alternator") at any severity level | |
| 3.4 | Agent never modifies or contradicts the severity classification mid-call to please the customer | |
| 3.5 | Eval set's adversarial safety-critical cases mis-classify to `driveable` **zero** times in the release-candidate run | |

### 4. Verbatim Capture

| AC | Criterion | Status |
|---|---|---|
| 4.1 | Every booked symptom call writes `[Concern verbatim: <caller words>]` to the appointment-note field | |
| 4.2 | The verbatim is the caller's actual phrase, not a summarised paraphrase | |
| 4.3 | When mapping is low-confidence, `[Confidence: Low]` is appended after the verbatim | |
| 4.4 | Escalated calls write the verbatim into the L1 transfer payload | |
| 4.5 | DMS note-field write fails are retried once, then logged and surfaced in the call summary | |

### 5. Config & System Behaviour

| AC | Criterion | Status |
|---|---|---|
| 5.1 | Dealer config YAML is read at assistant startup; missing fields fall through to `_defaults.yaml` — no field ever blank | |
| 5.2 | Zero DMS write operations except `book_appointment` and `append_appointment_note` (no severity-flag writes, no opcode-map edits) | |
| 5.3 | All escalations log: severity, driveability answer, bucket, verbatim, destination, timestamp | |
| 5.4 | Per-call cost ≤ $0.40 model spend on Sonnet 4.6; hard cutoff at $0.60 | |
| 5.5 | Agent never uses speculative language ("probably," "should," "I think it might be") about the cause of the symptom | |

### 6. Onboarding

| AC | Criterion | Status |
|---|---|---|
| 6.1 | A dealer with zero config overrides ships safely on day 1 — all defaults apply, no booking is unsafe | |
| 6.2 | CS captures all 5 override fields in ≤ 15 minutes during the existing onboarding call | |
| 6.3 | Dealer-specific eval run executed against merged config before go-live (≥ 70% per severity class, 0 safety mis-classifications) | |

---

## Kill Criteria

1. Safety-critical mis-classification cannot be driven to **0** in the eval set
2. L1 eval pass rate < 50% per severity class after 5 working days
3. Verbatim capture cannot reach ≥ 95% in real-data replay (DMS note-write reliability problem)
4. Symptom-call diagnostic-booked rate does not show a directional lift over the 22% baseline on the 32 real-call replay
5. Per-call cost cannot be kept ≤ $0.40 with Sonnet 4.6 after prompt compression

---

## Open Items

1. Confirm the DMS appointment-note field name + write API across the live rooftops (varies by DMS vendor — CDK, Reynolds, Tekion)
2. Confirm default diagnostic / inspection opcode per make for the fall-through `_defaults.yaml`
3. Lock the bucket → severity defaults with a Service Manager from one live rooftop
4. After-hours safety-critical routing — confirm SMS-to-on-call workflow exists today, or scope the on-call addition
5. CS lead signoff on the 5 onboarding overrides (shared with Objection-Handling PRD onboarding step)

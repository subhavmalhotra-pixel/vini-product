# Customer Signal — Service Objection Handling

**Author:** Subhav Malhotra
**Product:** Vini (AI voice agent for dealership BDC)
**Pod / Team:** Service Objection Handling
**Date:** 2026-05-27

---

## 1. What's the problem?

When a service caller pushes back on the Vini AI agent — about price, warranty, "I want a real person," generic transfer demand, or asks something off-script (sales, finance, body shop, directions, wrong dealership) — the agent gives up and transfers the call instead of attempting a rebuttal-plus-slot-offer or closing politely without transfer. As a result, BDC managers and owners watch the agent transfer the majority of service calls and convert only a small minority into appointments.

> **As a** Business Owner / BDC Manager,
> **I want** my AI agent to handle service objections and off-script queries without transferring,
> **so that** my team only handles the genuinely human calls, and I increase appointments + revenue per employee.
>
> - **Primary goal:** more appointments booked by the agent
> - **Secondary goal:** fewer transfers to the human service team

**Out of scope for this signal** (Vini will continue to transfer in these cases — separate pods may pick them up later):
- Repair status checks (needs DMS read-tool — separate effort)
- Recall scheduling (needs recall-eligibility lookup — separate effort)

---

## 2. Who's affected?

- **Segment:** Dealership service departments using Vini for inbound service calls.
- **# of customers in scope:** **19 rooftops live on Vini service-BDC today.**
- **Call volume per rooftop:** **~500–600 service calls / month / rooftop** → ~9,500–11,400 service calls/month across the book.
- **Data sampled for this signal:** 4 rooftops × 494 calls (414 classified `call_type=service`): Sport Durst Hyundai (SPDH), West Coast Kia South (WCSouth), Brown Daub, Foothill Ranch.

---

## 3. Customer quotes — verbatim, with full callIds

Every quote below is from a call where the agent **did not** deliver a rebuttal-plus-slot-offer and either transferred or left the query unresolved (`Outcome=Transferred To Service Team` OR `queryResolved=No`). The full `callId` is the audit trail.

### Pricing — "I just want a price"
1. *"Yes. What is the price? Of the oil change?"* — SPDH, callId `019e2ba7-70ce-7115-b398-306b2a9907ea` (agent quoted exact $150.95, slot collapsed, then transferred).
2. *"I was wondering... I bought a car for me, like, 3 weeks ago. I was just wondering how much a oil change would be."* — WCSouth, callId `019e30f4-981d-7992-b29a-91d046b160b2`.
3. *"How much is a diagnostic?"* — WCSouth, callId `019e2e0f-3646-7000-b2d9-a06ae73041dd`.
4. *"Hi. I was trying to see how much an extra key fob for a KIA is."* — WCSouth, callId `019e3c1a-b429-7ddb-9f97-8d932062bf48`.

### Warranty — "Is this covered?"
5. *"So I was wondering if my girlfriend's car had a warranty for compressor related issues."* — SPDH, callId `019e3d7b-733d-755e-9db7-83e2ab2b3b3c` (agent transferred immediately, no rebuttal).
6. *"There is a piece of the front bumper that... I want covered under warranty."* — SPDH, callId `019e264e-9c58-7447-b114-2e43c0e733d0`.
7. *"The place that I got it from... states that I would need to go to the manufacturer or go to the dealership because it's a dealership problem. And it's under warranty."* — WCSouth, callId `019e3c75-b4f7-7002-99d5-a56f101c07ec`.
8. *"I need to see what is covered under my warranty."* — WCSouth, callId `019e3c32-80cc-7221-900e-b23a9cf7e947`.

### "Talk to a real person / advisor" — confidence pushback
9. *"Oh, So you're not a real person?"* — SPDH, callId `019e3cc7-deb7-7cce-a573-327c64e57450`.
10. *"Is it the real person?"* — SPDH, callId `019e32a4-0051-7000-b8f3-0f7966362930`.
11. *"Is this AI?"* — SPDH, callId `019e3109-7d59-7001-871c-b77d8e4cd814` (recurring pattern; same line also appears in `019e3d7b-733d-755e-9db7-83e2ab2b3b3c`).
12. *"May I speak with a actual representative, please?"* — WCSouth, callId `019e3c75-b4f7-7002-99d5-a56f101c07ec`.

### Generic transfer demand — no actual objection
13. *"Yes. Connect me with the service team."* — SPDH, callId `019e1bf4-c38d-7000-9439-3319179eb438`.
14. *"Okay. Please connect me."* — SPDH, callId `019e1965-0b43-711d-b668-1572dcda9fb6`.
15. *"Connect me [to] service team."* — WCSouth, callId `019e3bcc-e7b2-7bbe-b96d-4761f91792e1`.
16. *"Can you connect me with the service [team]?"* — SPDH, callId `019e27b3-86c3-7001-859e-11a91346bcac`.

### Off-script — sales / finance / wrong-dealer / directions / body shop
17. *"Yes. I need a sales manager."* — WCSouth, callId `019e3baa-8a5f-7000-8497-8a7c4779ad66`.
18. *"Yes. I need to speak to Carlos, the car sales manager."* — WCSouth, callId `019e235f-3045-788f-a299-776f3fa05af9`.
19. *"Yes. I wanna speak [to a] manager for the finance company."* — WCSouth, callId `019e224f-9c22-7001-bfbd-6bd10bdbb833`.
20. *"Finance department."* — Brown Daub, callId `019e3cbf-3a23-7559-9ada-11db62469c95`.
21. *"Yes. Is this KIA on IH 35?"* — WCSouth, callId `019e2194-720f-7000-9c3c-5830bb8b094f`.
22. *"What's your address?"* — WCSouth, callId `019e2194-720f-7000-9c3c-5830bb8b094f` (same call — directions ask).
23. *"...customer is calling about dent repair services."* (body shop) — Brown Daub, callId `019e3148-c522-7449-a6d3-2b98a716c53f`.

---

## 4. Data points — from the 4 call-log JSONs

> **Source:** Vini call-log exports — `SPDH latest.json` (33 calls), `WCSouth.json` (200), `Browndaub latest 200.json` (200), `Foothill ranch latest.json` (61). **Total: 494 calls; 414 (84%) classified as `call_type=service`.**

### D1–D4 — Headline metrics on the 414 service calls

| Dealership | Service calls | Transferred to Service Team | Appt Booked | Could Not Conclude | Query Resolved = No | Appt Pitched = Yes |
|---|---:|---:|---:|---:|---:|---:|
| SPDH | 33 | 7 (21%) | 5 (15%) | 4 (12%) | 26 (79%) | 15 (45%) |
| WCSouth | 157 | 111 (71%) | 29 (18%) | 27 (17%) | 114 (73%) | 53 (34%) |
| Brown Daub | 172 | 132 (77%) | 18 (10%) | 29 (17%) | 145 (84%) | 31 (18%) |
| Foothill Ranch | 52 | 23 (44%) | 4 (8%) | 20 (38%) | 41 (79%) | 14 (27%) |
| **Total** | **414** | **273 (66%)** | **56 (14%)** | **80 (19%)** | **326 (79%)** | **113 (27%)** |

- **D1 — 66% of service calls end in transfer to the human service team.**
- **D2 — Only 14% of service calls end with the agent booking an appointment.**
- **D3 — 79% of service calls are flagged `queryResolved=No`.**
- **D4 — 73% of service calls never get an appointment pitch** (`appointmentPitched ≠ Yes`).

### D5 — Duplicate caller within 4 hours (frustration / unresolved-loop signal)

For each rooftop, % of service calls where the **same `fromNumber` called again within 4 hours of a prior call**. Test/switchboard numbers (>10 calls in the export window from a single number) excluded.

| Dealership | Service calls | Repeat-within-4h | Rate |
|---|---:|---:|---:|
| SPDH | 33 | 1 | 3.0% |
| WCSouth | 157 | 7 | 4.5% |
| **Brown Daub** | **172** | **47** | **27.3%** ⚠️ |
| Foothill Ranch | 52 | 4 | 7.7% |
| **Total** | **414** | **59** | **14.3%** |

- **D5a — 14% of service calls are the same caller calling back within 4 hours** of a prior call. This is the agent's failure tax — the caller didn't get what they needed the first time.
- **D5b — Brown Daub is a 27% outlier** — strongly correlated with that rooftop also having the highest transfer rate (77%) and the highest unresolved rate (84%). Recovering even half of these eliminates ~24 unnecessary inbound calls/month at one rooftop alone.
- Concrete examples: caller `+19083031258` called Brown Daub 3× in 2 minutes (callIds `019e317f → 019e3181`), all transferred. Caller `+15617796989` called twice 5min apart (`019e3cdd` then `019e3ce1`) — first call ended "Could Not Conclude," second one finally booked.

### D6 — Objection-bucket breakdown (each call counted once per bucket it touches)

In-scope buckets only (repair status and recall removed per Section 1).

| Bucket | Volume | Transfer % | Unresolved % | Appt-not-pitched % |
|---|---:|---:|---:|---:|
| Generic "transfer me" demand | 121 | **80%** | 71% | 89% |
| "Talk to a real person / advisor" | 46 | **85%** | 72% | 89% |
| Shuttle / loaner / transport | 53 | 23% | 51% | 19% |
| Warranty | 22 | 55% | 86% | 64% |
| Hours / closed | 22 | 0% | 73% | 59% |
| Reschedule / cancel | 21 | 14% | 57% | 71% |
| Pricing / estimate | 18 | 50% | 78% | 50% |
| Off-script (sales/finance/wrong-dealer/body-shop/directions) | ~25+ | mixed | high | high |

### D7 — Vini's own grader flags "didn't try to convert" as the #1 improvement
From `report.overview.overall.aiResponseQuality.whatAiCouldHaveDoneBetter`, top recurring phrases on service calls:
- *"Could have offered to schedule an appointment proactively."* — 7×
- *"Could have asked for more details about the service request."* — 4×
- *"Provide more detailed warranty information proactively."* — 2×
- *"Offer more detailed service options before transfer."* — 3×

The product's own QA layer is already telling us the agent transfers before pitching.

---

## 5. Business impact

### Inputs
- **19 rooftops live** on Vini service-BDC.
- **~500–600 service calls / month / rooftop** → **~9,500–11,400 service calls/month** across the book.
- **Current state from sample:** 14% appt-booked, 66% transferred, 14% repeat-within-4h.
- **ACV per rooftop: $1,000 / month** (assumption — confirm with CS) → **~$19K MRR / ~$228K ARR** across the book on the service line.
- **Industry-typical service RO ≈ $320** (US fixed-ops, 2024–25).

### Revenue uplift (primary goal: more appointments)

If the agent converts an additional **10 percentage points** of service calls into appointments (14% → 24%):

| | Per rooftop / month | Across 19 rooftops / month | Annualised |
|---|---:|---:|---:|
| Incremental appointments | +50 to +60 | +950 to +1,140 | +11,400 to +13,680 |
| Incremental service revenue @ $320 RO | +$16K to +$19K | +$304K to +$365K | **+$3.6M to +$4.4M** |

### Transfer reduction (secondary goal: revenue-per-employee)

If transfer rate drops by **10 percentage points** (66% → 56%):
- **~50–60 fewer transfers / rooftop / month** → **~950–1,140 fewer transfers / month** across the book.
- At ~4 minutes of BDC-agent time saved per avoided transfer → **~60–75 BDC-agent-hours saved per month per rooftop**.
- Compounds with appointment lift: BDC time is redirected to genuinely human calls (escalations, complaints, retention).

### ARR at risk if we do nothing
- **~$228K ARR** on the 19 live rooftops sits on the service line.
- BDC managers consistently cite high transfer rate as the reason they question Vini's ROI on the service deployment. We assess **30–50% of service-line renewals are softly at risk** without this fix → **~$70K–$115K ARR exposure** in the renewal book.

### Bottom line
A 10pp conversion lift on this pod alone unlocks **~$3.6M–$4.4M/yr** in dealer service revenue across the live book. That makes the ROI story for Vini self-funding within months on the service line.

---

## 6. What do customers do today?

When a caller raises any of the in-scope buckets in §4 — price, warranty, "talk to a person," generic transfer demand, off-script (sales/finance/body-shop/directions/wrong-dealer) — the Vini agent today **acknowledges the question and offers to transfer**, without attempting a rebuttal-plus-slot-offer (or, for off-script, without politely closing). The human BDC then absorbs the call.

BDC managers have their own playbooks — they manually train human BDC reps on objection rebuttals that pair every answer with a two-option slot offer ("Pricing: 'Oil change starts around $X — advisor pins exact at intake. I have 9am or 11am tomorrow?'") — but those rebuttals live in human training material, not in the agent's behaviour.

External evidence this is industry-best-practice: automotive-BDC training material consistently teaches an **Acknowledge → Reduce Risk → Two-Option Close** rebuttal frame for service objections, with the BDC's job framed as "sell the appointment, not the price" ([Traver Connect](https://traverconnect.com/blog/automotive-bdc-phone-scripts), [Pinnacle Sales and Mail](https://pinnaclesalesandmail.com/car-dealer-scripts-guide), [Strolid](https://strolid.com/learn/bdc-script-library-25-proven-call-scripts-email-templates), [Proactive Training Solutions](https://proactivetrainingsolutions.com/automotive-sales-objection-handling-scripts-techniques/)).

---

## 7. Why now?

- **Primary goal pressure:** the only way to move the agent-booked appointment rate (currently 14%) is to stop the agent giving up at the first sign of pushback. Every other improvement (voice quality, scheduling UX, etc.) is dwarfed by this one behavioural change.
- **Secondary goal pressure:** transfer rate (66%) is the BDC's loudest complaint. Until we move this, the BDC perceives Vini as a switchboard, not an agent. That perception risks renewals.
- **Eval-driven moment:** we now have **414 grader-labelled service calls** as ground truth — we can write evals against real failure modes (not imagined ones) and prove the lift before rollout.
- **Competitive pressure:** competing voice-AI vendors are increasingly pitching "appointment-first" agents; staying transfer-first is a positioning loss.

---

## 8. Top-5 P0 buckets — chosen to deliver ≥10pp conversion lift OR ≥10pp transfer reduction

Selection criterion: each bucket must materially contribute to **either +10pp appt-booked OR −10pp transfer**. Ranked by recoverable volume × current failure rate. Repair-status and recall excluded per §1.

| Rank | Bucket | Vol | Current failure | Recoverable @ realistic recovery rate | Contributes to |
|---|---|---:|---|---:|---|
| **1** | **Generic "transfer me" demand** | 121 | 80% transfer, 71% unresolved | 25% recovery → +24 appts, −24 transfers | both |
| **2** | **"Talk to a real person / advisor"** | 46 | **85% transfer**, 72% unresolved | 25% recovery → +10 appts, −10 transfers | both |
| **3** | **Warranty** | 22 | 55% transfer, 86% unresolved | 35% recovery → +8 appts, −7 transfers | both |
| **4** | **Pricing** | 18 | 50% transfer, 78% unresolved | 40% recovery → +7 appts, −5 transfers | both |
| **5** | **Off-script (sales/finance/body-shop/wrong-dealer/directions)** | ~25+ | mixed — currently transferred or unhelpful | Close politely OR redirect cross-dept correctly → −10 unnecessary transfers, +5 service appts cross-helped | mostly transfer reduction |
| **Aggregate (on 414 sampled calls)** | | | | **+54 appts (+13pp)  −56 transfers (−13pp)** | ✅ meets the bar |

Both gates clear: the Top-5 combination on the sampled data delivers **+13pp appointments booked** and **−13pp transfers** — comfortably ahead of the 10pp bar each direction.

### Off-script 80/20 mapping (covers ~80% of off-script volume)

The off-script bucket is heterogeneous — each sub-type maps to a different rebuttal pattern. The pattern is the design decision, not a copy-paste script:

| Off-script sub-type | Example callId | Volume share | Rebuttal pattern (P0 design) |
|---|---|---|---|
| Sales / finance department ask | `019e3baa-8a5f-…`, `019e3cbf-3a23-…` | ~35% | **Cross-dept transfer** with one-line confirm: *"That's our Sales / Finance team — let me get you over."* (legitimate transfer, no service appt). |
| "Manager" / specific person who isn't service | `019e235f-3045-…` | ~15% | **Confidence rebuttal first**: *"I can usually handle it faster than holding — what's it about?"* → if service-related, book; if not, cross-dept transfer. |
| Body shop / collision / dent | `019e3148-c522-…` | ~10% | **Polite close + give the body shop number**: *"Body work is handled separately — their direct line is [X]. Anything service-related I can help with first?"* No transfer. |
| Wrong dealership / wrong number | `019e2194-720f-…` | ~10% | **Clarify identity first**: *"You've reached [Dealer]. Were you trying us, or [nearby same-brand]?"* If wrong, polite close. No transfer. |
| Directions / address / hours | `019e2194-720f-…` | ~10% | **Answer briefly + slot anchor**: *"We're at [address], open [hours] — want me to book you in for [day]?"* No transfer. |
| Non-automotive (hotel, weather, personal) | (rare in sample) | ~10% | **Polite close**: *"I can only help with [Dealer] service appointments — anything service-related before I let you go?"* No transfer. |
| Spanish / language mismatch | (rare in sample) | ~5% | **Cross-route to Spanish-capable line if available, else polite acknowledge + service team callback**. |
| Abusive / venting unrelated to service | (rare) | ~5% | **Polite close**. No transfer. |

**The 80/20:** ~80% of off-script calls fall into the first 5 sub-types (sales/finance, manager, body shop, wrong-dealer, directions). Solving these covers the vast majority. The remaining long-tail (~20%) gets the catch-all polite-close.

---

## 9. Open items before generating the PRD

1. **Confirm ACV unit** — is $1,000/rooftop ACV monthly or annual? Math above assumes monthly.
2. **Confirm service-call volume** — 500–600/month/rooftop is the working number; lock with CS data pull.
3. **PRD scope confirmation:** Top-5 buckets are **Generic transfer demand, Talk to real person, Warranty, Pricing, Off-script**. Confirm or override.
4. **Rebuttal copy library + hard rules** (the actual rebuttal table + "never quote exact $", "always two-slot close", etc.) will live **in the PRD**, not here. This signal stops at "which buckets, which evidence, why now."

---

## Pre-PRD sanity check

- [x] ≥5 verbatim customer quotes — **23 quotes** across 5 in-scope objection categories, every one tied to a full `callId`
- [x] ≥3 data points with sources — **7 data points (D1–D7)** including transfer rate, conversion rate, unresolved rate, no-pitch rate, repeat-within-4h rate, per-bucket breakdown, and Vini's own grader signal
- [x] Business impact estimate with reasoning — **$3.6M–$4.4M/yr uplift band** + $70K–$115K ARR-at-risk, with input math shown
- [x] Problem statement in customer language, not solution language
- [x] Repair status + recall explicitly out of scope (will continue to transfer)

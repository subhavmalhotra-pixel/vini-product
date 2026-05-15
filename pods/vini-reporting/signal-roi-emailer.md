# Customer Signal: Vini Dealer Reporting & Visibility

**Author:** Subhav
**Product:** Vini
**Pod / Team:** Vini Product Team
**Date:** 14 May 2026
**Status:** Validated — ready for PRD

---

## 1. What's the problem?

Dealers running Vini have no consistent way to see what the agent is doing for them, what value it delivers, or what their team needs to act on — and they cannot configure who at the dealership receives that information.

**The four problems, in customer language:**

1. **"I need a regular update on agent performance."**
   Dealers want daily / weekly / monthly cadences. GMs walk into the Monday 8am meeting blind to weekend activity. Multi-rooftop owners can't compare stores. Reporting today is ad-hoc and pulled by CS on request.

2. **"I can't see what value the agent is actually driving for my dealership."**
   Today's metrics either feel inflated (e.g., "appointments set" with no show / demo / close context) or feel fabricated (e.g., "estimated revenue influenced") — and dealers ask for sources we cannot defend at renewal. They want capability-grounded value: what did this agent do that my team would have had to do otherwise?

3. **"I don't know what daily actions my team needs to handle."**
   SMS handovers, failed bookings, recall escalations, callback requests, and customer-specific salesperson asks fall through because nothing routes them to a person. Dealers want a single morning queue of "things only a human can close."

4. **"I have no way to control who at the dealership gets what, when, or how."**
   There's no scheduling or recipient configuration today. Reports go to one inbox; in reality, Owners, GMs, BDC Managers, Sales Managers, and Service Managers all need different cuts at different cadences. Multi-rooftop principals also want group-level vs store-level breakdowns.

**Who feels each pillar most acutely:**

| Pillar | Most affected dealership roles | Why |
|---|---|---|
| 1. Performance reporting | GM, Sales Manager, Service Manager, OB Campaign Manager | Monday review, agent-level oversight, campaign accountability |
| 2. Value attribution | Dealer Principal / Owner, GM, Fixed Ops Director (multi-rooftop) | Cannot defend the Vini investment at renewal without it |
| 3. Daily action queue | BDC Manager, Sales Manager, Service Manager | Owns the day's follow-up; missed handovers cost revenue |
| 4. Configurable comms | Dealer Principal / Owner, GM | Wants to route the right cut to the right POC, especially across rooftops |

---

## 2. Who's affected?

- **Segment:** used-car dealers, new-car dealers, service departments, BDCs, multi-rooftop dealer groups, sales departments
- **Dealership roles touched:** Dealer Principal / Owner, General Manager, Sales Manager / Sales Director, Service Manager / Service Director, BDC Manager, OB Campaign Manager / Marketing, Fixed Operations Director (multi-rooftop)
- **% of rooftop base affected:** ~100%
- **Approximate # of customers:** 50+ vini agent live rooftops across the active dealer base
- **% of revenue from this segment (if known):** Majority — covers all paying live-revenue rooftops

---

## 3. Customer quotes — at least 5

**Verbatim** quotes from real customers. Paraphrasing doesn't count — copy them word-for-word. Include the source so the PRD reviewer can verify.

1. "I am not able to see what happens with each of my lead in realtime in your portal, which lead came in when what kind of outreach attempts happened on them etc" — source: Customer feedback (inbound)
2. "Also, is there a way I can run a report to see how many calls came in after-hours and the results of those specific calls?" — source: https://spyne.freshdesk.com/a/tickets/15994
3. "I honestly can't recall if we have spoken about this but found an enhancement request from the BDC to help them use the dashboard more. Currently, when you click anywhere in this area (red box), nothing happens with the customer info. Ideally, you should be able to click on this customer and the entire customer profile (call recording, transcript, vehicle info, etc) Same info when you click on the overview screen. This would be great, so they don't have to go back and forth from two different tabs to find customer info. Hope this makes sense." — source: https://spyne.freshdesk.com/a/tickets/14631
4. "I would want to see what actions are taken by agents on my hot leads" — source: Customer call (verbatim verification pending)
5. "As a Dealer Principal I would want have clear visibility to see how each of my depts are performing which is each agents" — source: Customer call (verbatim verification pending)
6. Matt from Honda DTLA has explicity asked me to schedule a daily export of AI conversations and conversions for the live agents - Source: Emailer - Honda DTLA - CSV file needed

---

## 4. Data points — at least 3

Numbers from product analytics, support tickets, CRM, dashboards, or CS data. Each one should name its source.

- **5+ tickets in last 1 month on ROI / dashboard / reporting visibility** — source: Freshdesk
- **Dealers (especially Sales Teams) live in their CRM; significant data exists inside Vini but is not surfaced back to the dealer** — source: CRM
- **Renewals / invoice payments to Spyne get blocked because dealers don't see ROI** — source: Internal CS data
- Dealership teams use the reports currently sent to understand agent performance - source: Email analytics (not tracked but explicitly asked by multiple POCs at dealership level)

---

## 5. Business impact

- **Revenue impact / ARR at risk:** $680K live ARR
- **Users affected (per week or month):** 50+ live agents (25+ rooftops)
- **Reasoning:** Total live ARR across rooftops where ROI visibility has been raised as a renewal blocker. Compounded by competitive vulnerability — BDC and chat-only vendors lead with cleaner ROI narratives.

---

## 6. What do customers do today?

They check whatever is available in their CRM. For Vini specifically, there is no parallel reporting they can pull.

- Those who have access to daily email - Receive current daily emailers which are fragmented with different unverified informations and trust on those but still have to navigate through all emails or log on to console to understand the agent performance
- Those who do not have access to emails - Log onto the console self navigate to different sections to see the agent performance or request details from CSMs
- Finally those who do not have access to both have to request CSMs to share the data or log onto CRMs to access the numbers

---

## 7. Why now?

- **Competitive vulnerability.** BDC and chat-only vendors lead with cleaner ROI narratives — without a defensible response, we lose the renewal conversation.
- **Estimated-revenue framing is a known liability.** Dealers have started pushing back on sources we cannot defend, eroding trust in existing reports.
- **OutBound campaigns scaling.** As OutBound volume grows, the lack of credible end-of-campaign reporting is a direct expansion-revenue blocker.

---

> **Sanity-check before generating a PRD:**
> - [x] At least 5 customer quotes captured (2 pending verbatim verification)
> - [x] At least 3 data points with sources
> - [x] Business impact estimate with reasoning
> - [x] Problem statement is in customer language, not solution language

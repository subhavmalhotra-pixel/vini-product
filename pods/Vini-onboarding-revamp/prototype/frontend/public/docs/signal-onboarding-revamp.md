# Customer Signal: Vini Onboarding Revamp

**Author:** Subhav
**Product:** Vini
**Pod / Team:** Vini Product Team
**Date:** 15 May 2026
**Status:** Draft 

---

## 1. What's the problem?

Onboarding a Vini agent today is a fully manual, multi-day exercise run by the CS / Onboarding (OB) team on behalf of the dealership. Every one of the 55 (Sales Agent) / 59 (Service Agent) data points is **mandatory and manual during the live onboarding call** — even though most of that data is already sitting in the signed contract, the dealer's website, the public business registry, or the dealer's employee directory. As a result the OB team cannot finish an onboarding in one session: the dealership POCs on the call don't have every must-have field, so the OB team hands them a checklist and waits days for the missing data to come back from other dealership POCs.

**Primary user:** CS / OB team — they run every onboarding session.
**Secondary user:** Dealership (GM + the POCs they pull in) — they sit through the session and are tasked with sourcing missing data after the call.

**Goal stated by both sides:**
- **OB team:** Faster onboarding with minimal manual input — agent ready for testing in **a single 30–60 min session**.
- **Dealership:** Faster onboarding → faster go-live.

**The three OB-team pain points (their words, paraphrased pending verbatim):**

1. **"Too much data we already have, we're typing again."** Rooftop details, dealer contact info, dealer type, address, timezone, region, business legal name, EIN — all of it is in the contract or on the dealer's website, yet the OB team enters it field by field during the call.
2. **"Pre-/post-collectable data is mandatory during onboarding."** All must-have fields are gated to the live session even when they could safely be collected before the call (from website / contract / registry) or after the call (holiday trackers, employee directory uploads).
3. **"The dealership POCs on the call don't have the must-have fields."** Fields tagged *Pre-onboarding + During* (CNAM authorized reps, EIN, employee directory for transfers, IMS / CarFax / CRM / Scheduler / DMS providers, area code preference) are not in the GM's head. The OB team hands them a post-call checklist, and the missing data trickles back over multiple days — blocking the one-session goal entirely.

**The real friction is "manual," not "mandatory."** The mandatory fields *do* need to be set for the agent to run; the fix is to auto-collect them, not to make them optional.

---

## 2. Who's affected?

- **Primary segment (internal):** CS / Onboarding team — runs every dealership onboarding call.
- **Secondary segment (external):** Dealership stakeholders on the call — typically GM + delegated POCs (Sales Manager, Service Manager, IT, BDC Manager) who need to be pulled in mid-call for fields the GM doesn't own.
- **Agents affected:** Sales Inbound, Service Inbound (and the outbound variants when launched — same pattern compounds).
- **% of new rooftops affected:** ~100% of newly contracted rooftops.
- **Volume amplifier:** Multi-rooftop dealer groups repeat the same flow 2–3× (per rooftop) × 4 agents (per rooftop) — so a single group dealer-group onboarding can mean **8–12 sequential onboarding sessions** even though Rooftop / Caller ID / Users / Call Directory data is identical at the enterprise level.

---

## 3. Customer quotes — at least 3

Verbatim quotes from the **OB team** (primary user) — sourcing pending; below are the three pain points narrated by the PM to be replaced with verbatim from OB team members.

1. *(OB team verbatim — pending)* — "Too many details readily available on the dealership website or contract have to be manually added while onboarding."
2. *(OB team verbatim — pending)* — "All the must-have steps that could be pre- or post-onboarding data collection are mandatory during onboarding, hampering the onboarding experience."
3. *(OB team verbatim — pending)* — "The dealership personnel who join the call don't have the must-have details that are marked Pre-onboarding+During. We share the checklist with the dealership and collect those post-onboarding — which then blocks the one-session onboarding goal."


---

## 4. Data points — at least 3

### Today: every field is manual

| | Sales Agent | Service Agent |
|---|---|---|
| Total data fields collected during onboarding | **55** | **59** |
| Must-have fields (cannot skip) | 34 | 38 |
| **Manual & mandatory today** | **55 (100%)** | **59 (100%)** |
| Collected in-session (during onboarding flow) | 55 | 59 |

— source: OB Revamp Analysis.xlsx (Sales Agent + Service Agent tabs), 15 May 2026
— *Today every field requires the OB team to enter it during the live onboarding session. The "Automated" labels in the sheet describe the target state, not the current state.*

### Average onboarding TAT (turn-around time)

| Phase | Today's TAT | Notes |
|---|---|---|
| Rooftop Details (single rooftop) | **30–45 min per rooftop** | Fully manual data entry by OB team |
| Integration data collection (per agent) | **2–3 days average** | Requires post-call checklist + chasing dealership POCs |
| End-to-end one-rooftop one-agent onboarding | **Days, not minutes** | Cannot complete in a single session today |

— source: OB team operational data, 15 May 2026

### Volume math — why manual doesn't scale

- **55 manual fields × 4 agents (per rooftop) × 2–3 rooftops (per group dealership)** = **440–660 manual entries per group dealership onboarding**
- Multi-rooftop / multi-agent customers compound this further — same Rooftop / Caller ID / Users / Call Directory data is re-entered per agent today
- Every new agent type (e.g. Service joined Sales recently; outbound variants coming) adds ~55–60 more fields onto every new onboarding

— source: OB Revamp Analysis.xlsx + OB team

### Target state — where each field *should* come from instead of manual entry

| Target collection source | Sales fields | Service fields | What it eliminates |
|---|---|---|---|
| Website (browser automation) | 21 | 21 | All Rooftop + Department address/phone/shift data |
| Public registry by address (CNAM) | 5 | 5 | Legal name, display name, business type/industry, EIN |
| Contract (pre-signed data) | 7 | 7 | Rooftop name, admin name/email/phone, dealer type |
| Recommended defaults (persona, first msg, toggles) | 6 | 4 | Persona pick, area code, instant response, widget toggle |
| Employee directory prefill | 2 | 2 | CNAM Authorized Reps #1 / #2 |
| Document upload (Service config) | — | 7 | Makes, Services, Transportation, Rules, Pricing, etc. |
| **Still needs dealership input** | **5** | **5** | Holiday trackers, employee directory upload |
| **Reduction in manual fields** | **55 → 5 (~91%)** | **59 → 5 (~92%)** | |

---

## 5. Business impact

- **Onboarding-blocked pipeline:** **>$1 M ARR currently stuck in onboarding** — contracts signed, not yet live.
- **Time-to-go-live is the first impression.** Long, fragmented onboarding hits customer sentiment at the very first touchpoint with the product. The negative impression compounds into post-go-live churn risk.
- **High churn threat post go-live.** Dealers that experience a painful multi-day onboarding enter the live phase already skeptical; renewal posture is weaker before they've seen a single conversation.
- **Internal cost-to-serve.** The OB team currently treats every onboarding as a managed, multi-session concierge effort — hours that should compound into expansion / renewal work instead are spent on data re-entry.

**Reasoning:** Pipeline blockage is the headline business number. Even before counting CS-hour cost and downstream churn, >$1 M ARR sits in this gate today and grows with every new contract.

*(Per-onboarding CS-hour cost still to be quantified by the OB team — would convert the $1 M pipeline impact into a per-rooftop CS-hour figure.)*

---

## 6. What do customers do today?

- **The OB team** runs every onboarding as a screenshare/call session, manually entering all 55–59 fields per agent on behalf of the dealership.
- **When mid-call data is missing,** the OB team hands the dealership GM a **checklist** of remaining must-have fields; the GM then collects from internal POCs over the following days.
- **The dealership** waits — agent does not go live in the session; live-go is gated on the checklist returning.

See: source recordings of both Sales and Service onboarding flows in Appendix A — the entire current state is captured there, end-to-end manual.

---

## 7. Why now?

- **>$1 M ARR in pipeline is blocked on this gate today.** Every week the flow stays manual, the gate grows.
- **First-impression risk on a churn-sensitive customer.** Dealers judge product polish during onboarding; the current flow erodes confidence before they've used the product.
- **Compounding agent-type debt.** Service was the most recent new agent type and added ~60 more fields to the manual pile. Outbound variants are coming. Fixing the platform once pays off across every current and future agent.
- **OB team capacity ceiling.** Continued growth in contracts cannot be served by a managed multi-session process; the OB team becomes the throttle on new revenue going live.

---

## Appendix A — Source recordings reviewed

- `Screen Recording 2026-05-15 at 1.53.27 AM.mov` — Sales Inbound Agent end-to-end onboarding (~3 min)
- `Screen Recording 2026-05-15 at 4.13.50 AM.mov` — Service Inbound Agent end-to-end onboarding (~2 min)
- `OB Revamp Analysis.xlsx` — field-level inventory + Optimization Insights summary

## Appendix B — The 7 optimization wedges (from Optimization Insights tab)

| # | Wedge | Applies to | Eliminates |
|---|---|---|---|
| 1 | Browser automation for Rooftop details (scrape dealer website) | Sales + Service | 16 Rooftop fields |
| 2 | CNAM prefetch by address (public business registry lookup) | Sales + Service | 5 CNAM Profile/Business fields |
| 3 | Employee directory → CNAM Authorized Reps prefill | Sales + Service | 2 rep blocks × 6 fields |
| 4 | ROI comms setup automation (vs per-user manual config in Invite User modal) | Sales + Service | Communication prefs per invited user |
| 5 | NLP search across integrations / employee directory / persona library | Sales (IMS / CarFax / CRM / Persona) + Service (Scheduler / DMS / Persona) | Discovery friction on 3 picker pages |
| 6 | Skippable optional departments (Service / Parts / Finance shown by default) | Sales + Service | Up to 12 fields per skipped department |
| 7 | Post-call testing + feedback loop + Go-live validation (STL / Widget) | Sales (full) + Service (testing only) | Post-onboarding back-and-forth with CS |

---

> **Sanity-check before generating a PRD:**
> - [ ] At least 5 verbatim OB-team quotes (currently 0 — needs sourcing from Slack / 1:1s / onboarding call recordings)
> - [x] At least 3 data points with sources (field counts + TAT + volume math)
> - [x] Business impact estimate with reasoning ($1 M+ pipeline blocked)
> - [x] Problem statement is in customer language, not solution language
> - [ ] Per-onboarding CS-hour cost quantified (to convert pipeline number into a per-rooftop ops cost)

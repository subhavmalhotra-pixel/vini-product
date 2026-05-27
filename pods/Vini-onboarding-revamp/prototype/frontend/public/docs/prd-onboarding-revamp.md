# PRD: Vini Onboarding Revamp — Phase 1

**Author:** Subhav · **Product:** Vini · **Pod:** Vini Product · **Date:** 18 May 2026 · **Status:** draft · v9

> **v9 design feedback incorporated**
> - **Optional Departments** (Service / Parts / Finance) expand inline with a **Same as Sales** checkbox pre-checked; per-dept **Re-scan from website** button.
> - **"Verified" chip removed** from all auto-filled fields. Green border on the input alone signals high-confidence; only review-needed states (LLM / Derived / Missing) show a chip.
> - **CNAM Authorized Reps** — inline **Edit / Done** per rep; all 6 sub-fields editable in edit mode.
> - **Agent Customization step removed** from the in-session flow:
>   - **First Message** moved into **Persona Selection** screen (Edit + Restore default + live preview).
>   - **Preferred Area Code** moved into **Rooftop Details → Sales Department** section.
> - **Go-live checklist:**
>   - **Phone row** gains a **Deployment type multi-select** — *After hours · Overflow · 24×7*.
>   - **STL + Smart Widget rows** prefetched from the onboarding journey — always rendered for Sales agents; status hydrated from journey toggles + disable-reason. Disabled rows show a new grey **Disabled** chip and do not count toward go-live progress.

---

## 1. Job to be done

OB-team member takes a newly contracted rooftop from contract-signed to **agent-ready-for-testing in one 30–60 min session** — Must-have data is auto-filled in-session; everything else is deferred to a single post-onboarding checklist (Signal Section 1, Section 3 quotes 1–3, Section 5 "$1 M+ ARR blocked in onboarding").

---

## 2. Success metrics

| | Metric | Target (30 days) | Baseline | Source |
|---|---|---|---|---|
| **Primary** | % onboardings completed in 1 OB session (≤60 min, Test Agent reached, no in-session checklist) | **≥ 70%** | ~0% (Signal Section 4) | Session telemetry |
| Secondary | Manual fields typed in-session per agent | **≤ 10** | 55 Sales / 59 Service | Field-fill events |
| Secondary | Onboarding-blocked ARR | **≤ $500 K** | >$1 M (Signal Section 5) | CS dashboard |

---

## 3. Non-goals (Phase 1)

1. Self-serve dealer onboarding (no OB on call).
2. Outbound agents.
3. Auto-provisioning partner-side integration credentials.
4. **Smart integration discovery / picker / NLP search** in-session — research only (P1).
5. **STL / Smart Widget in-session config UI** — hidden by default; "Advanced → Disable" requires a stated reason.
6. **Separate Agent Customization step** — removed in v9; First Message lives on the Persona screen, Area Code lives on Rooftop Details.
7. Optional-department auto-fill *inside* an opened optional dept *beyond* the Same-as-Sales inherit + Re-scan-from-website hooks shipped in v9.
8. Service-policy doc-to-config RAG (deferred to Phase 2).
9. Multi-rooftop / enterprise dedup (deferred).
10. Onboarding-flow page-tree redesign — augment only.

---

## 4. What Phase 1 ships

### 4.0 Priority tiers + in-session step sequence

- **P0** = build in Phase 1 — gates launch.
- **P1** = no build in Phase 1 — keep today's UX, or research-only.

| # | Step | Tier | What ships in Phase 1 |
|---|---|---|---|
| 1 | **Rooftop Details + CNAM Registration** | **P0** | Auto-fill from dealer website + public registry by address. Includes Preferred Area Code (Sales Dept) and Optional Departments (Same as Sales + Re-scan). |
| 2 | Invite list (Employee directory) | **P1** | Removed from in-session; moved to post-onboarding checklist |
| 3 | **Persona Selection** | **P1 + P0** | Persona browse: P1 (today's UX). First Message field: **P0**, lives on this screen now, with Edit + Restore default + live preview. |
| ~~4~~ | ~~Agent Customization~~ | — | **Step removed**. First Message → Persona screen · Area Code → Rooftop Details |
| 4 | Integrations (IMS / CarFax / CRM / Scheduler / DMS) | **P0** | Added to post-onboarding checklist with provider-specific docs; in-session step removed |
| 4b | "Best possible integration flow" | **P1** | Research only — out of scope for build |
| 5 | Service Scheduler Configuration *(Service Agent only)* | **P0** | LLM doc-upload → service-config-params mapping |
| 6 | STL + Smart Widget *(Sales Agent only)* | **P0** | Auto-enabled with default config; "Advanced → Disable" requires stated reason. Status surfaces on go-live checklist via prefetch from this journey state. |
| 7 | Test Agent | unchanged | — |
| 8 | Go-live deployment checklist | **P0** | New screen at end of onboarding flow — Phone (with **Deployment type multi-select**) + STL + Smart Widget status per agent. STL/Widget rows hydrated from journey toggle state. |

**In-session flow after revamp:**

```
1. Rooftop Details + CNAM (auto-fill) ───────────────────────── P0
   • Dealership Details, Sales Dept (incl. Preferred Area Code)
   • Optional Depts (Same-as-Sales checkbox + Re-scan)
2. Persona Selection (incl. First Message edit) ──────────────── P1 + P0
3. Service Scheduler Config (Service only, LLM doc-upload) ─── P0
4. [STL / Smart Widget] ─── auto-on, hidden unless disabling ─ P0
5. Test Agent ───────────────────────────────────────────────── unchanged
6. Go-live deployment checklist ──────────────────────────────── P0
   • Phone Deployment type (After hours / Overflow / 24×7)
   • STL + Smart Widget prefetched from journey state
                ↓
   Post-onboarding checklist email (catch-all)
```

---

### 4.1 Rooftop Details + CNAM Registration — **P0** (auto-fill)

**Ships**

*Crawl + auto-fill:*
- OB pastes dealer URL → Playwright crawler (≤3 pages: `/`, `/contact`, `/about`; ≤1 req/sec; robots.txt enforced; dealer's own site only).
- Schema.org JSON-LD parser fills Must-have Rooftop fields (Rooftop Name, Vehicle Type, Address ×6, Timezone) — `confidence: high`.
- Claude Sonnet fallback runs only on pages missing schema (`confidence: medium`).
- Good-to-have fields collapsed under "Show advanced."
- **Needs Input panel** lists empty Must-have fields; OB fills as one batch.

*Sales Department section:*
- Phone, Address, Working Shift populated by same crawler pass.
- **Preferred Area Code field lives here** (moved from removed Agent Customization step). Derived from rooftop city + state via US area-code lookup table; OB can edit inline.

*Optional Departments (Service / Parts / Finance):*
- Click `+ Add <Dept>` to insert the section inline.
- **`Same as Sales` checkbox pre-checked** by default — phone, address, working hours inherit from Sales.
- Unchecking `Same as Sales` reveals editable Phone + a **`Re-scan from website`** button that fetches dept-specific values from the dealer site (phone, hours).
- Per-dept Remove button.

*CNAM (Caller ID):*
- Rooftop address → public business-registry API → fills Legal Name, Display Name, Business Type, Industry, EIN.
- EIN cross-checked against contract; mismatch flagged red.
- **Authorized Reps #1 / #2** pre-filled by deterministic merge: contract signatories → meet-invite attendees → employee directory. Each rep chip shows source ("from contract" / "from invite" / "from directory").

*Visual treatment:*
- **No Verified chip** on `confidence: high` fields — green border on the input alone is the signal.
- Yellow chip on `medium` (LLM), blue on `low` (Derived), red on `none` (Missing).

**QA verifies**
- 10-site eval: **≥ 80% accuracy on Must-have Rooftop fields**; Schema.org-only ≥ 60%.
- **Zero hallucinated values.**
- robots.txt disallow → "Blocked — manual entry" banner; no crawl.
- Registry call ≤ 5 s; 30-day cache.
- "Continue" blocked while a Must-have Rooftop field is empty **and** Preferred Area Code is empty (both gating).
- Optional Dept: `Same as Sales` toggling correctly inherits/clears values; Re-scan replaces dept data.
- Auto-filled high-confidence fields render no chip; medium/low/none render appropriate chip.

---

### 4.2 Caller ID (CNAM) — **P0** *(now part of the Rooftop Details step, kept as its own QA scope)*

**Ships**

- All Profile + Business fields editable via the same auto-fill input pattern (no Verified chip when high-confidence).
- **Authorized Representatives — inline Edit / Done toggle per rep card.**
  - Read view: name, title, phone, email, position as a compact `dl`.
  - Edit view: all 6 sub-fields (First Name / Last Name / Title / Phone / Email / Position) become editable `AutoFillField` inputs.
  - Source chip ("Contract" / "Invite" / "Directory") retained.
  - "Swap with another directory entry →" link visible in edit mode.

**QA verifies**
- Edit / Done toggle flips read view ↔ form view; field edits persist on Done.
- All 6 fields editable; values validate (email format, phone digits).
- Source chip remains correct after edits.
- Verified chip NOT shown on any field (regression vs v8).
- EIN mismatch warning still fires when registry EIN ≠ contract EIN.

---

### 4.3 Persona Selection + First Message — **P1 (browse) + P0 (first message)**

**Ships**
- Persona browse UX **unchanged from production** (no recommended-default heuristic).
- **First Message section** below the persona grid:
  - Default template: `"Hi there, this is {{agent_name}} from {{dealership_name}}. How can I help you today?"`
  - **Edit / Done** toggle — read view shows template in a code-style block; edit view exposes a 250-char textarea.
  - **Restore default** button resets to template.
  - **Live preview block** below — interpolates `{{agent_name}}` from selected persona and `{{dealership_name}}` from rooftop name.

**QA verifies**
- Regression: persona browse + audio preview unchanged.
- Default template rendered on first load.
- Edit mode persists changes; Done returns to read view.
- Restore default replaces template with default + clears edit mode flag.
- Preview re-renders when persona selection changes (`{{agent_name}}` updates).
- "Continue" blocked while no persona selected.

---

### ~~4.4 Agent Customization~~ — *removed in v9*

The separate Agent Customization step is no longer in the flow. Its two fields are distributed:

| Field | Where it lives now | PRD reference |
|---|---|---|
| First Message | Persona Selection screen | Section 4.3 |
| Preferred Area Code | Rooftop Details → Sales Department | Section 4.1 |

This removes one click from the flow without losing any data capture.

---

### 4.4 Integrations (IMS / CarFax / CRM / Scheduler / DMS) — **P0** post-onboarding checklist

**Ships**
- In-session integration pages **removed from default flow**.
- **Post-onboarding checklist email** (sent 1 h after Test Agent reached) contains:
  - One row per applicable integration; provider-specific PDF + deep-link to in-product wizard.
  - Sent to dealer IT contact + CSM. Auto-reminders at 24 h + 48 h. Slack alert at Day 3 if pending.

**QA verifies** — onboarding renders no integration step · email fires once 1h after `test_agent_reached` · deep links route correctly · reminders cron at 24h/48h · Slack alert at Day 3 (mocked-clock test).

---

### 4.5 Service Configuration — **P0** (Service Agent only — LLM doc upload)

**Ships**
- New in-session step: **"Upload service policy doc"** (PDF / DOCX / CSV ≤ 25 MB).
- Backend: doc chunked → embedded → pgvector → per-field retrieval-then-generate via Claude Sonnet.
- Output: structured JSON for 7 Service Scheduler config fields, **with citations** back to source chunks.
- OB reviews each row with citation hover; one-click confirm.
- Fields `confidence < 0.6` route to Needs Input.

**QA verifies** — ≥ **30-doc eval** for field accuracy + **citation correctness** · OB edit persists · oversize doc rejected · cost per Service onboarding ≤ **$0.30** (rolling-24h).

---

### 4.6 STL + Smart Widget *(Sales Agent only)* — **P0** (auto-on, disable-with-reason)

**Ships**
- Default config applied automatically (Speed-to-Lead ON, Smart View ON Template 1).
- Steps **do not render** in default onboarding flow.
- "Advanced → Disable STL" / "Advanced → Disable Smart Widget" surfaces a form requiring **reason code + free-text detail** (both mandatory).
- Disable state + reason logged for analytics.
- **Status surfaces downstream on the Go-live checklist via prefetch from this state** — see Section 4.8.

**QA verifies** — default flow renders no STL/Widget steps · Advanced entry reachable · reason code + text both required to save Disable · disabled state persists with `reason_code` + `reason_text`.

---

### 4.7 Test Agent — unchanged

`test_agent_reached` event fires on entry — powers the primary metric.

---

### 4.8 Go-live deployment checklist — **P0** (in-onboarding, last step)

**Ships**
- New screen rendered **immediately after Test Agent** as the final step.
- Per-agent status board with **three rows** for Sales agents (two for Service — no Smart Widget):

| Row | Touch point | Probe / hydration source |
|---|---|---|
| 1 | **Phone line** | Twilio number status API |
| 2 | **STL forwarding** *(Sales only)* | **Prefetched from journey** — `stl.enabled` from Section 4.6 · live probe used only when enabled |
| 3 | **Smart View widget** *(Sales only)* | **Prefetched from journey** — `smartWidget.enabled` from Section 4.6 · live probe used only when enabled |

- Status chips: 🟢 **Live** · 🟡 **Pending** · 🔴 **Blocked** · ⚫ **Disabled** *(new in v9 — for touch points the OB explicitly disabled in Section 4.6)*.
- Disabled rows show the journey-captured reason inline ("Disabled in onboarding · `<reason_code>` · `<reason_text>`") and **do not count** toward "X / Y live" progress.
- Auto-refresh every 60 s. Slack alert if any 🔴 > 24 h or 🟡 > 72 h.

**Phone row — Deployment type multi-select** *(new in v9)*

Inline chip group below the Phone status line. Multi-select:

| Option | Meaning |
|---|---|
| **After hours** | Agent picks up only outside business hours |
| **Overflow** | Agent picks up when human reps are all busy |
| **24×7** | Agent picks up every call |

- Defaults to `['24×7']` for a new agent.
- Multi-select allowed (e.g., After hours + Overflow).
- Clearing all options surfaces a red warning: *"Pick at least one deployment type before marking the agent live."*

**QA verifies**
- Phone probe returns within 60 s for healthy rooftop · status chips render per probe result.
- STL row hidden for Service agent; always rendered for Sales (regardless of toggle).
- When STL toggle in Section 4.6 is **OFF** → STL row shows Disabled chip + reason text inlined.
- When STL toggle is **ON** → STL row shows Live / Pending per probe.
- Same behavior for Smart Widget row (Sales only).
- `2 / 3 live` count excludes Disabled rows.
- Phone Deployment chips: multi-select toggleable; empty selection surfaces red warning; selection persists across screen navigations.
- Auto-refresh + Slack-alert thresholds unchanged from v8.

---

### 4.9 Post-onboarding checklist email — **P0**

One email sent 1 h after Test Agent reached. Combines: integration connect docs + invite list link + ROI comms prefs link + Holiday Tracker link + Go-live status link.

**QA verifies** — one-shot send · all 5 sections render · links signed/routed · reminders cron stops on completion.

---

## 5. Harness spec

**Two AI surfaces in Phase 1**, both Claude Sonnet via function-calling.

### 5.1 Dealer-website extraction *(used in Section 4.1)*

- **Model:** Claude Sonnet 4.6 (fall back to 4.5 stable). Function-calling for structured JSON ([Anthropic structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)).
- **Tool:** `extract_dealership_profile(html, url)` — 16 Rooftop + Sales Dept fields.
- **Context:** Schema.org JSON-LD parsed first ([schema.org/AutoDealer](https://schema.org/AutoDealer)); LLM only runs on schema-less pages. HTML cleaned, ≤ 40 k input tokens.
- **Fallback:** robots block / schema-fail / LLM-fail → field → Needs Input. **Never invent values.**
- **Cost ceiling:** ≤ **$0.10 per onboarding**.

### 5.2 Service-policy RAG *(used in Section 4.5, Service Agent only)*

- Doc → chunked → pgvector embeddings → per-field retrieval-then-generate via Sonnet with citations.
- **Cost ceiling:** ≤ **$0.30 per Service onboarding**.

---

## 6. Quality bar

| Surface | Tier | Type | Quality artifact |
|---|---|---|---|
| Schema.org JSON-LD parser | P0 | [deterministic] | Unit tests on 10+ HTML fixtures |
| Website extraction LLM fallback | P0 | [ai-generated] | **≥ 50 eval cases** (accuracy / zero hallucination / nulls) |
| Playwright crawler (robots, rate-limit) | P0 | [deterministic] | Integration + robots-compliance tests |
| Needs Input bucket grouping | P0 | [deterministic] | Unit on rules + E2E batch-edit |
| **Optional Dept "Same as Sales" toggle + per-dept Re-scan** | P0 | [deterministic] | E2E (toggle inherit/clear · re-scan replaces values) |
| **Preferred Area Code derivation + edit** | P0 | [deterministic] | Unit on 50-state lookup + E2E edit/persist |
| CNAM registry lookup | P0 | [deterministic] | Contract test against provider API |
| CNAM Reps multi-source merge | P0 | [deterministic] | Unit on ranking (15 fixtures) |
| **CNAM Reps inline Edit / Done flow** | P0 | [deterministic] | E2E (edit each sub-field · Done persists · source chip stable) |
| **First Message on Persona screen (Edit + Restore + preview)** | P0 | [deterministic] | E2E (default template · edit persists · preview interpolation) |
| **ConfidenceChip auto-hide on `high` (no Verified tag)** | P0 | [deterministic] | Component test across Rooftop / CNAM / Persona surfaces |
| Pre-onboarding intake form *(deferred — not in this PRD)* | — | — | — |
| Welcome checklist email | P0 | [deterministic] | E2E send + completion tracking |
| Service-policy RAG pipeline | P0 | [ai-generated] | ≥ 30 eval cases (field accuracy + citation correctness) |
| STL / Smart-Widget "disable with reason" flow | P0 | [deterministic] | E2E (reason code + text both required · persistence) |
| **Go-live: STL / Widget prefetch from journey** | P0 | [deterministic] | Unit + E2E (Disabled chip + reason inlined · excluded from progress count) |
| **Go-live: Phone Deployment multi-select** | P0 | [deterministic] | Unit (toggle state) + E2E (empty selection → red warning · persists across nav) |
| Auto-fill confidence chip UI (non-high states only) | P0 | [deterministic] | E2E confirm / edit / reject |
| Skip-to-Test-Agent CTA gating | P0 | [deterministic] | Unit + integration on min-viable-field set |
| Session telemetry | P0 | [deterministic] | Unit on event emission |
| Cost / latency guardrails | P0 | [deterministic] | Integration on cap-hit → fallback |

**Coverage plan:** 50-case extraction eval = top dealer-site platforms (Dealer.com, Dealer Inspire, DealerOn, AutoTrader Dealer Sites, custom Wordpress — 8–10 each) + 5 known-hard cases. RAG eval grades both field accuracy AND citation correctness. Deterministic surfaces follow `prd-roi-emailer.md` Section 5.

---

## 7. Prototype scope (≤5 days)

CLI in, JSON out — scaffolded in `prototype/`. Targets **Section 4.1 Rooftop + CNAM extraction**.

1. **Day 1** — Schema.org JSON-LD parser.
2. **Day 2** — Playwright crawler + robots.txt + rate limit + ≤3 pages.
3. **Day 3** — Sonnet LLM fallback wired.
4. **Day 4** — 10-site eval set with human ground-truth labels.
5. **Day 5** — OB review screen: extracted JSON side-by-side + Needs Input batch panel.

Mock frontend covering all v9 design decisions lives in `prototype/frontend/` (production-grade React + Tailwind, swap `mockApi.ts` for real backend).

---

## 8. Kill criteria

1. **Extraction accuracy < 80%** on 50-site eval AND Schema.org-only < 60% → kill scrape; manual rooftop entry.
2. **>30% of dealer sites disallow scraping** or Legal-flag ToS → kill scrape; manual rooftop entry.
3. **Needs Input bucket averages > 8 / 16 P0 Rooftop fields** in prototype → kill prefill UX.
4. **Service-config RAG accuracy < 70%** OR citation correctness < 80% on 30-doc eval → kill the LLM mapping; OB types params manually.
5. **One-session metric < 35%** at 30 days post-launch AND manual-field count > 30 (Sales) / > 35 (Service) → root-cause before further investment.
6. **AI cost > $0.20 / Sales** or **> $0.60 / Service** onboarding rolling-24h at ≥20/day → kill the LLM fallback; deterministic-only path.

---

## Appendix — references

- Schema.org [`AutoDealer`](https://schema.org/AutoDealer) · [Dealer schema markup guide](https://www.car-dealer-seo.co.uk/local-seo/schema-markup-car-dealers/)
- [Anthropic structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) · [Playwright at scale](https://www.browserless.io/blog/scraping-with-playwright-a-developer-s-guide-to-scalable-undetectable-data-extraction)
- [TCR brand verification](https://www.campaignregistry.com/resources/) · [Plivo CNAM](https://www.plivo.com/docs/numbers/cnam-lookup) · [Business identity APIs](https://compliancely.com/blog/top-6-business-identity-verification-tools/)

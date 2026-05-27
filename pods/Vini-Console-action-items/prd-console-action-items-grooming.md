# PRD Grooming Snippet — Vini Console — Action Items (Phase 1)

**Audience:** Eng / Design / PM grooming sessions · 5-minute read.
**Companion to:** the full PRD at `prd-console-action-items.md` (route `/docs/prd`). This snippet picks the load-bearing summary tables out of the full doc — every row links back to the full section for detail.

---

## 📌 Phase scope at a glance

| Badge | Meaning |
|:---:|---|
| ✅ **Phase 1** | Ships in the current PRD. Hardened. |
| 🚀 **Phase 2** | Planned. Full spec lives in PRD Section 3 + Section 8.2. Future PRD. |
| 🔮 **Phase 3+** | Acknowledged but unscoped. Revisit after Phase 2 evidence. |
| ❌ **Non-goal** | Out of pod scope entirely (lives in another pod or never). |

---

## 1. TL;DR

| Dimension | Phase 1 ✅ | Phase 2 🚀 |
|---|---|---|
| **Outcome** | BDC team runs from one queue, not forwarded Slack messages | Dealers configure who closes what · Vini auto-closes routine items · multi-rooftop groups roll up |
| **Surface** | Single-rooftop pending + completed queue · customer profile drill-in · 4 drawers (Source · Assign · Close · Bulk Close) | Recipient routing UI · "My tasks" rep view · Vini-as-assignee with auto-resolution · group-level rollup · employee onboarding · escalation routing |
| **Audience** | GM · BDC Manager · Service Manager *(admin access in Phase 1)* | + BDC Agent / Advisor *(self-service)* · Fixed Ops Director *(cross-rooftop)* · Compliance Officer · GM *(escalation receiver)* |
| **AI surface** | Intent extraction + recap (Haiku, per-conversation, $0.005/req) | + Vini-as-assignee resolution-note generation · per-intent urgency scoring *(deferred)* |
| **Primary metric** | Intent-weighted closure-within-SLA ≥ 65 % at 30 d post-instrumentation | TBD — per-role engagement · auto-routed % · Vini-resolved % |
| **Kill if** | Closure < 25 % · customer-ID resolution < 95 % · AI cost > $0.05/req · taxonomy misclassifies > 15 % · queue pile-up > 100/rooftop sustained | *(Phase 1 must hit gate first)* |
| **Cross-pod link** | ROI Emailer Daily Digest deep-links into pending view · `action_item.surfaced_in_email` badge | Routing config layer SHARED with ROI Emailer Pod Section 10 self-serve subscriptions |

→ **Full Job-to-be-done statement:** see PRD Section 1.

---

## 2. Phase split — what ships when

| Phase | What this pod owns | What stays out |
|---|---|---|
| ✅ **Phase 1** *(current PRD)* | Readable + accountable queue for a single rooftop · customer-level rollup · click-to-listen · timestamps · assignee + completion record · resolution note · channel-aware creation including HITL · multi-intent bulk close · per-intent SLA matrix + escalation flag *render* | Configurable routing · auto-resolution by Vini · multi-rooftop views · employee directory · escalation routing/comms · per-role view filters · customer history surface |
| 🚀 **Phase 2** *(PRD Section 8.2)* | The configurable & accountable queue: routing config · Vini-as-assignee · multi-rooftop · employee directory + onboarding · escalation routing & nudge cascade · auto-assignment fallbacks · role-based view filters · customer history + re-open UX | Custom intent taxonomy · CRM write-back · native mobile · third-party ingestion |
| 🔮 **Phase 3+** | Dealer-defined custom intents · drag-drop email builder · native mobile push · cross-dealer-group analytics | — |

→ **Full Phase-1 + Phase-2 detail:** see PRD Section 8.

---

## 3. Non-goals — what's deferred and where it lives

| # | Topic | Why deferred | Destination |
|:-:|---|---|:-:|
| 1 | Multi-rooftop / group-level queue rollups | Single-rooftop only in Phase 1 | 🚀 Phase 2 · Section 8.2.3 |
| 2 | Recipient routing / who-gets-what config | Fixed access in Phase 1 | 🚀 Phase 2 · Section 8.2.1 |
| 3 | Vini-as-assignee auto-resolution | Phase 1 captures `vini_instructions` but doesn't act | 🚀 Phase 2 · Section 8.2.2 |
| 4 | BDC rep self-service "My tasks" view | Phase 1 has "Mine" filter but no role-default landing | 🚀 Phase 2 · Section 8.2.7 |
| 5 | Auto-assignment (round-robin / load-balancing) | Manual-assign-only in Phase 1 | 🚀 Phase 2 · Section 8.2.6 |
| 6 | Auto-assignment fallbacks | Cheaper subset of #5; ships first | 🚀 Phase 2 · Section 8.2.6 |
| 7 | Escalation routing & nudge cascade | Phase 1 *flags* escalation; Phase 2 *routes* it | 🚀 Phase 2 · Section 8.2.5 |
| 8 | Employee directory + onboarding flow | Phase 1 reads user list; no add-member UI | 🚀 Phase 2 · Section 8.2.4 |
| 9 | Per-role default views & permissions | Same queue for everyone in Phase 1 | 🚀 Phase 2 · Section 8.2.7 |
| 10 | Customer history & "Reopened" UX | No prior-closure surface in Phase 1 | 🚀 Phase 2 · Section 8.2.8 |
| 11 | In-console messaging | Existing inbox pod owns; we deep-link | ❌ Other pod |
| 12 | Custom action-item / intent types | Fixed 14-intent taxonomy in Phase 1 | 🔮 Phase 3 |
| 13 | CRM write-back | No Reynolds/CDK/DealerSocket integration | 🔮 Phase 3 |
| 14 | Real-time push notifications | Slack DM ships with #7; mobile push later | 🚀 Phase 2 · Section 8.2.5 + 🔮 Phase 3+ |
| 15 | Native mobile app | Mobile-responsive web only in Phase 1 | 🔮 Phase 3+ |
| 16 | Action items from non-Vini sources | Vini conversations only in Phase 1 | 🔮 Phase 3 |
| 17 | Cross-customer bulk operations | Single-customer bulk-close IS in Phase 1 (Section 9.7) | 🚀 Phase 2 · Section 8.2.6 |
| 18 | Auto-close at SLA × 3 | Open question — recommendation: yes with system note | 🚀 Phase 2 · Section 8.2.5 |

→ **Full non-goals detail (3.1) + Phase-1 clarifications (3.2):** see PRD Section 3.

---

## 4. Phase 2 work streams — at a glance

| Stream | Resolves Section 3 # | Goal |
|---|:-:|---|
| **8.2.1 Routing & recipient config** | 2 | Per-`intent_id` default routing rules · per-recipient overrides · versioned config · shared with ROI Emailer Pod Section 10 |
| **8.2.2 Vini-as-assignee + auto-resolution** | 3 | Low-judgment tasks routed to Vini · AI-drafted resolution note · per-intent allow-list · auto-escalate on failure |
| **8.2.3 Multi-rooftop / group rollups** | 1 | Combined queue across N rooftops · cross-store filtering · group-level escalation routing |
| **8.2.4 Employee directory + onboarding** | 8 | Add / disable / re-role team members · invite email · graceful degradation for disabled refs |
| **8.2.5 Escalation routing & nudge cascade** | 7 · 14 · 18 | Multi-stage nudge (Slack/email/auto-reassign/auto-close) · per-escalation-reason routing · 3× SLA auto-close |
| **8.2.6 Auto-assignment fallbacks** | 5 · 6 · 17 | Cheap fallback rules first · proactive round-robin + load-balancing later · cross-customer bulk only in group queue |
| **8.2.7 Per-role default views & permissions** | 4 · 9 | Role-default landing per persona · manager Escalations section · Compliance Officer locks |
| **8.2.8 Customer history & reopen UX** | 10 | "+N prior closes" chip · timeline tooltip · `action_item.duplicate_of_closed` event · Reopened chip with prior context |

→ **Full work-stream goal + ships lists:** see PRD Section 8.2.

---

## 5. UI surface phase coverage

| § | Surface | Phase 1 ✅ | Phase 2 🚀 |
|---|---|:-:|:-:|
| 9.1 | Information architecture | ✅ | 🚀 + Group queue (8.2.3) |
| 9.2 | Pending view | ✅ | 🚀 + role-default filters (8.2.7) · "+N prior closes" chip (8.2.8) |
| 9.3 | Completed view | ✅ | — |
| 9.4 | Customer profile | ✅ Details + Action items first-class | 🚀 + full Vehicles / Conversations / Appointments · customer history timeline (8.2.8) |
| 9.5 | Assign drawer | ✅ + Vini-instructions enforcement | 🚀 + suggested-assignee from routing (8.2.1) |
| 9.6 | Close drawer | ✅ + appointment picker | — |
| 9.7 | Bulk close drawer | ✅ multi-intent customer-level | — |
| 9.8 | Repeat-caller flag UI | ✅ render-only | 🚀 + escalation routing (8.2.5) |
| 9.9 | Empty states | ✅ | — |
| 9.10 | Cross-pod email-loop badge | ✅ | — |
| 9.11 | Channel + HITL provenance | ✅ | — |
| 9.12 | Accessibility + responsive | ✅ | — |
| **NEW** | **Settings → Team** | — | 🚀 Phase 2 · 8.2.4 |
| **NEW** | **Settings → Routing rules** | — | 🚀 Phase 2 · 8.2.1 |
| **NEW** | **Settings → Escalation config** | — | 🚀 Phase 2 · 8.2.5 |

→ **Full UI specs (prescriptive):** see PRD Section 9.

---

## 6. Kill criteria — short list

1. Design-partner rejection of customer-level rollup → kill the PRD
2. BDC-rep rejection at pilot → ship Slack-push approach instead
3. Closure < 25 % at 30 d post-instrumentation → kill Phase 2 routing investment
4. AI cost > $0.05/conversation in any 24 h window → kill AI recaps; ship deterministic
5. `customer_id` resolution < 95 % for 7 consecutive days → kill until identity layer fixed
6. Intent taxonomy fit fails (> 15 % `general_info`) → pause + re-scope taxonomy
7. Cross-pod schema drift detected → pause emission until pods re-align
8. **Queue pile-up** (pending > 100/rooftop sustained 7 d, no closure recovery) → escalate Eng to expedite Section 8.2.5

→ **Full criteria + triggers + mitigations:** see PRD Section 7.

---

## 7. Cross-pod event schema (header only)

The full schema (entities · 10 lifecycle events · Phase 2 field additions · pod-boundary table · 14-intent taxonomy · 5 resolved decisions) is signed off cross-pod and lives in PRD Section 10.

Key entities owned outside this pod:

| Entity | Owner |
|---|---|
| `customer` | Vini Agent Platform team |
| `conversation` | Vini Conversations service |
| `intent` | Vini Agent Platform team |
| `appointment` | Existing appointments service |
| `email_send` | ROI Emailer pod |

Phase 2 introduces 6 new event fields documented in PRD Section 10.2.1 (`auto_reassigned_to`, `nudge_sent_at`, `customer_history_count`, `vini_closed_with_reasoning`, `auto_closed_reason`, `rooftop_group_id`).

→ **Full schema:** see PRD Section 10.

---

## How to use this snippet

- **Sprint grooming:** start here. Scope a Phase 1 ticket against Section 8.1 in the full PRD; scope a Phase 2 ticket against the specific work stream in Section 8.2.
- **Stakeholder review:** share this URL. They get the headline in 5 minutes; the full PRD is one link away for detail.
- **Cross-pod alignment:** Section 10.6 in the full PRD has the 5 resolved cross-pod decisions. This snippet only summarises.

**Last updated alongside the full PRD.** When the full PRD bumps a version, regenerate this snippet from the same tables.

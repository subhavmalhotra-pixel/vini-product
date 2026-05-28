# PRD Grooming Snippet — Vini Console — Action Items (Phase 1)

**Audience:** Eng / Design / PM grooming sessions · 5-minute read.
**Companion to:** the full PRD at `prd-console-action-items.md` (route `/docs/prd`). This snippet picks the load-bearing summary tables out of the full doc — every row links back to the full section for detail.

**Updated for v3.0:** PRD now framed as a **3-stage task-tracker system** (Create → Manage → Communicate). 3 new capabilities added: manual creation by BDC, Manager dashboard, Communication pillar (compose-in-drawer + automated customer status updates + CRM sync on closure).

---

## Phase scope at a glance

| Badge | Meaning |
|:---:|---|
| ✅ **Phase 1** | Ships in the current PRD. Hardened. |
| 🚀 **Phase 2** | Planned. Full spec lives in PRD Section 3 + Section 8.2 (re-clustered into A / B / C buckets in v3.0). |
| 🔮 **Phase 3+** | Acknowledged but unscoped. Revisit after Phase 2 evidence. |
| ❌ **Non-goal** | Out of pod scope entirely (lives in another pod or never). |

---

## 1. TL;DR — the 3-stage task-tracker system

```
                   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   conversation →  │  1. CREATE   │ → │  2. MANAGE   │ → │ 3. COMMUNICATE│ → customer + CRM
                   │              │   │              │   │              │
                   │  Vini detects│   │  Closer +    │   │  Customer    │
                   │  + BDC adds  │   │  Manager     │   │  + CRM sync  │
                   └──────────────┘   └──────────────┘   └──────────────┘
```

| Stage | Question it answers | Owner |
|---|---|---|
| **1. Create** | Where do tasks come from, with what context? | Vini (automatic) + BDC Agent (manual, Phase 2) |
| **2. Manage** | Who closes which task, and how do managers see queue health? | BDC Agent (closer) + BDC Manager (rollup view, Phase 2) |
| **3. Communicate** | How does the customer know we acted? How does the CRM stay in sync? | Vini + BDC Agent + dealer CRM (all Phase 2) |

→ **Full Job-to-be-done statement:** see PRD Section 1.

---

## 2. Phase split — what ships when, by lifecycle stage

| Stage | ✅ Phase 1 *(this PRD)* | 🚀 Phase 2 *(future PRD — PRD Section 8.2)* |
|---|---|---|
| **1. Create** | Vini-driven AI extraction across all 5 channels · multi-intent dedup · per-intent SLA inheritance · 14-intent taxonomy | + **Manual creation by BDC** (3 surfaces: customer-level · conversation-tagged · note-upgraded) · routing config (auto-route at birth) · Vini-as-assignee with auto-resolution |
| **2. Manage** | Pending + Completed views · assign + close · SLA flag (render-only) · resolution note + type · customer profile drill-in · multi-intent bulk close · repeat-caller flag (render-only) | + **Manager dashboard** (aggregate SLA · unassigned · per-rep workload · escalations · access mgmt) · employee directory + onboarding · escalation routing & nudge cascade · auto-assignment fallbacks · per-role default views & permissions · multi-rooftop rollups · customer history & re-open UX |
| **3. Communicate** | Deep-link to existing Vini inbox · cross-pod email-loop badge (read-only) · resolution note as internal audit | + **Compose-in-drawer** (close + send atomic) · **Automated customer status updates** (co-branded default · dealer-branded with template config) · **CRM sync on closure** (manual-trigger push; 12-hour pull stays as baseline) |

→ **Full Phase-1 + Phase-2 detail:** see PRD Sections 8.1 + 8.2.

---

## 3. Non-goals — what's deferred and where it lives

| # | Topic | Why deferred | Destination |
|:-:|---|---|:-:|
| 1 | Multi-rooftop / group-level queue rollups | Single-rooftop only in Phase 1 | 🚀 Phase 2 · 8.2.B.2 |
| 2 | Recipient routing / who-gets-what config | Fixed access in Phase 1 | 🚀 Phase 2 · 8.2.A.1 |
| 3 | Vini-as-assignee auto-resolution | Phase 1 captures `vini_instructions` but doesn't act | 🚀 Phase 2 · 8.2.A.3 |
| 4 | BDC rep self-service "My tasks" view | Phase 1 has "Mine" filter but no role-default landing | 🚀 Phase 2 · 8.2.B.6 |
| 5 | Auto-assignment (round-robin / load-balancing) | Manual-assign-only in Phase 1 | 🚀 Phase 2 · 8.2.B.5 |
| 6 | Auto-assignment fallbacks | Cheaper subset of #5; ships first | 🚀 Phase 2 · 8.2.B.5 |
| 7 | Escalation routing & nudge cascade | Phase 1 *flags* escalation; Phase 2 *routes* it | 🚀 Phase 2 · 8.2.B.4 |
| 8 | Employee directory + onboarding flow | Phase 1 reads user list; no add-member UI | 🚀 Phase 2 · 8.2.B.3 |
| 9 | Per-role default views & permissions | Same queue for everyone in Phase 1 | 🚀 Phase 2 · 8.2.B.6 |
| 10 | Customer history & "Reopened" UX | No prior-closure surface in Phase 1 | 🚀 Phase 2 · 8.2.B.7 |
| 11 | In-console messaging (full inbox) | Existing inbox pod owns; we deep-link | ❌ Other pod |
| 12 | Custom action-item / intent types | Fixed 14-intent taxonomy in Phase 1 | 🔮 Phase 3 |
| 13 | **CRM push on closure** *(reclassified v3.0 → Phase 2)* | Manual push on close (12-hour pull is existing baseline) | 🚀 Phase 2 · 8.2.C.3 |
| 14 | Real-time push notifications | Slack DM ships with #7; mobile push later | 🚀 Phase 2 · 8.2.B.4 + 🔮 Phase 3+ |
| 15 | Native mobile app | Mobile-responsive web only in Phase 1 | 🔮 Phase 3+ |
| 16 | Action items from non-Vini sources | Vini conversations only in Phase 1 | 🔮 Phase 3 |
| 17 | Cross-customer bulk operations | Single-customer bulk-close IS in Phase 1 | 🚀 Phase 2 · 8.2.B.5 |
| 18 | Auto-close at SLA × 3 | Open question — recommendation: yes with system note | 🚀 Phase 2 · 8.2.B.4 |
| 19 | **Manual creation by BDC** *(NEW v3.0)* | Reps Slack their manager instead of adding items themselves | 🚀 Phase 2 · 8.2.A.2 |
| 20 | **BDC Manager dashboard** *(NEW v3.0)* | Managers see per-row queue; no aggregate rollup; recreate it in Excel | 🚀 Phase 2 · 8.2.B.1 |
| 21 | **Compose-in-drawer** *(NEW v3.0)* | Close + send is 2 tab-switches today; should be one atomic motion | 🚀 Phase 2 · 8.2.C.1 |
| 22 | **Automated customer status updates** *(NEW v3.0)* | Customer pings back hours later because closure was invisible | 🚀 Phase 2 · 8.2.C.2 |

→ **Full non-goals detail (3.1) + Phase-1 clarifications (3.2):** see PRD Section 3.

---

## 4. Phase 2 work streams — 11 streams clustered by lifecycle stage

### 8.2.A · Create *(tasks born with full context + routing + SLA)*

| Stream | Resolves Section 3 # | Goal |
|---|:-:|---|
| **8.2.A.1 Routing & recipient config** | 2 | Per-`intent_id` default routing rules · per-recipient overrides · versioned config · shared with ROI Emailer Pod Section 10 |
| **8.2.A.2 Manual creation by BDC** *(NEW v3.0)* | 19 | 3 sub-surfaces: customer-level add · conversation-tagged · note-upgraded · same routing + SLA inheritance as AI-created |
| **8.2.A.3 Vini-as-assignee + auto-resolution** | 3 | Low-judgment tasks routed to Vini · AI-drafted resolution note · per-intent allow-list · auto-escalate on failure |

### 8.2.B · Manage *(closers see their work, managers see queue health)*

| Stream | Resolves Section 3 # | Goal |
|---|:-:|---|
| **8.2.B.1 Manager dashboard** *(NEW v3.0)* | 20 | Aggregate SLA panel · unassigned widget · per-rep workload · escalations section · access management |
| **8.2.B.2 Multi-rooftop / group rollups** | 1 | Combined queue across N rooftops · cross-store filtering · group-level escalation routing |
| **8.2.B.3 Employee directory + onboarding** | 8 | Add / disable / re-role team members · invite email · graceful degradation for disabled refs |
| **8.2.B.4 Escalation routing & nudge cascade** | 7 · 14 · 18 | Multi-stage nudge · per-escalation-reason routing · 3× SLA auto-close |
| **8.2.B.5 Auto-assignment fallbacks** | 5 · 6 · 17 | Cheap fallback rules first · proactive round-robin + load-balancing later · cross-customer bulk only in group queue |
| **8.2.B.6 Per-role default views & permissions** | 4 · 9 | Role-default landing per persona · manager Escalations section · Compliance Officer locks |
| **8.2.B.7 Customer history & reopen UX** | 10 | "+N prior closes" chip · timeline tooltip · Reopened chip with prior context |

### 8.2.C · Communicate *(closure visible to customer + CRM stays in sync)*

| Stream | Resolves Section 3 # | Goal |
|---|:-:|---|
| **8.2.C.1 Compose-in-drawer** *(NEW v3.0)* | 21 | Inline composer in Close drawer · template picker · preview pane · Send+Close atomic · sent body appended to resolution note |
| **8.2.C.2 Automated customer status updates** *(NEW v3.0)* | 22 | 8 default templates · co-branded default · dealer-branded with config · frequency cap · DNC/TCPA-safe · `action_item.customer_notified` event |
| **8.2.C.3 CRM sync on closure** *(NEW v3.0)* | 13 (reclassified) | Manual-trigger push on close · auto-push from Vini-as-assignee · per-CRM adapter (Reynolds/CDK/DealerSocket+) · existing 12-hour pull stays · `action_item.crm_synced` event |

→ **Full work-stream goal + ships lists:** see PRD Section 8.2.

---

## 5. UI surface phase coverage — by lifecycle stage

| Stage | Surface | ✅ Phase 1 | 🚀 Phase 2 |
|---|---|:-:|:-:|
| **Create** | Source-conversation snippet inside Pending row expand | ✅ | — |
| **Create** | Bulk close drawer (multi-intent per customer) | ✅ | — |
| **Create** | **Add action item modal** *(customer / conversation / note)* | — | 🚀 8.2.A.2 |
| **Manage** | Pending view (Section 9.2) | ✅ | + role-default filters · "+N prior closes" chip |
| **Manage** | Completed view (Section 9.3) | ✅ | — |
| **Manage** | Customer profile (Section 9.4) | ✅ Details + Action items first-class | + full Vehicles/Conversations/Appointments · customer history timeline |
| **Manage** | Assign drawer (Section 9.5) + Vini-instructions enforcement | ✅ | + suggested-assignee from routing config |
| **Manage** | Close drawer (Section 9.6) + appointment picker | ✅ | + compose-in-drawer + CRM sync toggle (see Communicate) |
| **Manage** | Repeat-caller flag UI (Section 9.8, render-only) | ✅ | + escalation routing |
| **Manage** | **Manager dashboard** *(aggregate SLA · unassigned · per-rep workload · escalations · access mgmt)* | — | 🚀 8.2.B.1 |
| **Manage** | **Settings → Team** | — | 🚀 8.2.B.3 |
| **Manage** | **Settings → Routing rules** | — | 🚀 8.2.A.1 |
| **Manage** | **Settings → Escalation config** | — | 🚀 8.2.B.4 |
| **Communicate** | Cross-pod email-loop badge (Section 9.10, read-only) | ✅ | — |
| **Communicate** | **Compose-in-drawer** *(inline composer + template picker + Send+Close atomic)* | — | 🚀 8.2.C.1 |
| **Communicate** | **Settings → Customer comms templates** *(co-branded / dealer-branded · frequency cap)* | — | 🚀 8.2.C.2 |
| **Communicate** | **Settings → CRM connections** *(adapter config · sync toggle · field mapping)* | — | 🚀 8.2.C.3 |

→ **Full UI specs (prescriptive):** see PRD Section 9.

---

## 6. Kill criteria — short list

1. Design-partner rejection of customer-level rollup → kill the PRD
2. BDC-rep rejection at pilot → ship Slack-push approach instead
3. Closure < 25% at 30 d post-instrumentation → kill Phase 2 routing investment
4. AI cost > $0.05/conversation in any 24 h window → kill AI recaps; ship deterministic
5. `customer_id` resolution < 95% for 7 consecutive days → kill until identity layer fixed
6. Intent taxonomy fit fails (> 15% `general_info`) → pause + re-scope taxonomy
7. Cross-pod schema drift detected → pause emission until pods re-align
8. **Queue pile-up** (pending > 100/rooftop sustained 7 d, no closure recovery) → escalate Eng to expedite 8.2.B.4

→ **Full criteria + triggers + mitigations:** see PRD Section 7.

---

## 7. Cross-pod event schema (header only)

10 base events + **3 new in v3.0** + Phase-2 field additions. Full schema lives in PRD Section 10.

| Lifecycle stage | Existing events | NEW v3.0 events |
|---|---|---|
| **Create** | `action_item.created` · `action_item.deduplicated` | `action_item.created_manually` |
| **Manage** | `action_item.assigned` · `action_item.reassigned` · `action_item.closed` · `action_item.reopened` · `action_item.escalated` · `appointment.created` | — |
| **Communicate** | `action_item.surfaced_in_email` · `action_item.email_cta_clicked` | `action_item.customer_notified` · `action_item.crm_synced` |

Entities owned outside this pod (read-only consumed): `customer` · `conversation` · `intent` · `appointment` · `email_send`.

→ **Full schema:** see PRD Section 10.

---

## How to use this snippet

- **Sprint grooming:** start here. Scope a Phase 1 ticket against Section 8.1 in the full PRD; scope a Phase 2 ticket against the specific lifecycle bucket (8.2.A / 8.2.B / 8.2.C) and the work stream within it.
- **Stakeholder review:** share this URL. They get the 3-stage system narrative in 5 minutes; the full PRD is one link away for detail.
- **Cross-pod alignment:** Section 10.6 in the full PRD has the 5 resolved cross-pod decisions. This snippet only summarises.

**Last updated alongside the full PRD.** When the full PRD bumps a version, regenerate this snippet from the same tables.

# Vini Dealer Reporting Emailers — Prototype

Working prototype for the PRD at `../../prd-roi-emailer.md`.

This directory is self-contained: it ships with its own mock data + eval cases + Python harness + two React frontends. Engineers can clone this folder, install deps, and have everything running locally without external references.

```
prototype-roi-email/
├── frontend/             Phase 1 emailer FE          (port 5173)
├── frontend-platform/    Phase 2 self-serve platform (port 5174)
├── ai-harness/           Python — Story narrative generator
├── eval-runner/          Python — runs cases.yaml through the harness
├── test-data/            Mock data shared by both FEs and the Python harness
└── evals/                Eval cases + grading rubric
```

The pod-level docs sit one folder up:

```
pods/vini-reporting/
├── signal-roi-emailer.md     Validated customer signal
├── prd-roi-emailer.md        PRD (v2 — post-design-review)
├── cases-roi-emailer.yaml    Eval cases (copy of prototype/evals/story-of-the-week/cases.yaml)
├── rubric-roi-emailer.md     Eval grading rubric (copy of prototype/evals/story-of-the-week/rubric.md)
└── prototype/prototype-roi-email/   (this folder)
```

---

## Quick start

### 1. Phase 1 emailer FE — visual email preview

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

Renders 20 email scenarios (Daily / Weekly / Monthly / End-of-Campaign) including every edge case from PRD Section 9. Sidebar scenario switcher lets you click through each.

### 2. Phase 2 self-serve platform — subscription editor + dashboard

```bash
cd frontend-platform
npm install
npm run dev    # http://localhost:5174
```

Routes:
- `/dashboard` — ROI dashboard with AI insight + KPI grid + appointment funnel + hot leads table
- `/dashboard/lead/:leadId` — anonymized lead drilldown
- `/settings/recipients` — recipient table with add-drawer
- `/settings/subscriptions/:recipientId` — schedule + section editor with **live preview of the real Phase 1 email on the right rail**
- `/settings/customization` — read-only subscription matrix
- `/logs` and `/logs/:logId` — sent-emails logs (Phase 3 preview)

The subscription editor's right preview pane imports the **actual Phase 1 email components** via the `@phase1` Vite alias — no parallel implementation to drift apart.

### 3. Eval runner — verify the harness against PRD Section 4

```bash
# One-time setup
cd ai-harness
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# Run all 32 cases in mock mode (no API key required)
cd ../eval-runner
../ai-harness/.venv/bin/python run_evals.py --mock

# Live mode (real Anthropic calls)
ANTHROPIC_API_KEY=sk-ant-... ../ai-harness/.venv/bin/python run_evals.py
```

Mock-mode baseline: **32/32 pass** across happy_path (10), customer_failure (13), adversarial (6), cost_latency (3).

---

## Cross-app dependencies

| From | Depends on | Mechanism |
|---|---|---|
| `frontend/src/**` | `test-data/` | Vite + tsconfig path alias `@test-data` → `../test-data` |
| `frontend-platform/src/**` | `test-data/` | Same alias `@test-data` |
| `frontend-platform/src/components/Phase1EmailPreview.tsx` | `frontend/src/emails/**` | Vite + tsconfig path alias `@phase1` → `../frontend/src` |
| `ai-harness/fixtures.py` | (none) | Python-native fixtures mirror `test-data/conversations.ts` |
| `eval-runner/run_evals.py` | `ai-harness/` + `evals/story-of-the-week/cases.yaml` | `sys.path` injection + `_HERE.parent / "evals" / ...` |

When you wire real backend, replace the static imports in `frontend/src/App.tsx` and `frontend-platform/src/data/platform-mock.ts` with API responses matching the types in `test-data/schema.ts`.

---

## What's in vs. what's out

| In scope | Out of scope |
|---|---|
| 4 email types: Daily, Weekly, Monthly, End-of-Campaign | Real SMTP / email delivery |
| 20 mock email scenarios (all edge cases per PRD Section 9) | Recipient management persistence |
| Story-of-the-Week AI surface — Haiku 4.5 via the harness | Slack / SMS / in-portal channels (Phase 2 in PRD) |
| 32 eval cases + LLM-judge rubric | Drag-drop section builder (Phase 3) |
| Live preview synced with real Phase 1 email components | Sent-email logs production wiring (Phase 3 preview only) |
| Mobile-responsive design across both FEs | Real authentication / multi-tenant isolation |

---

## File maps

### `frontend/` (Phase 1 emailer FE — port 5173)

```
frontend/
├── package.json
├── vite.config.ts            # @test-data alias → ../test-data
├── tailwind.config.ts        # design tokens (brand-primary #0369A1, etc.)
├── tsconfig.json
├── index.html
├── README.md
└── src/
    ├── App.tsx               # Sidebar scenario switcher + email renderer
    ├── components/           # EmailShell, KPICard, ActionRequired, Story, Edge banner, etc.
    └── emails/
        ├── DailyDigest.tsx
        ├── WeeklyPerformance.tsx
        ├── MonthlyValueReport.tsx
        └── EndOfCampaignReport.tsx
```

### `frontend-platform/` (Phase 2 platform — port 5174)

```
frontend-platform/
├── package.json              # adds react-router-dom v6
├── vite.config.ts            # @test-data + @phase1 aliases
├── tailwind.config.ts        # extends content to scan ../frontend/src so Phase 1 classes survive
├── tsconfig.json
├── index.html
└── src/
    ├── App.tsx               # Routes
    ├── main.tsx
    ├── components/
    │   ├── AppShell.tsx              # Sidebar nav + mobile drawer
    │   ├── ui.tsx                    # Shared primitives (Card, Pill, Toggle, etc.)
    │   ├── SchedulePanel.tsx         # Schedule editor (Send Type / Frequency / Day / Time)
    │   ├── Phase1EmailPreview.tsx    # Wraps Phase 1 email components + applies section toggles
    │   ├── EmailPreviewPane.tsx      # Smaller snippet used by Logs detail
    │   ├── RichEmailPreview.tsx      # Stand-alone full preview (kept for reference)
    │   └── AddRecipientDrawer.tsx
    ├── pages/
    │   ├── DashboardHome.tsx
    │   ├── LeadDrilldown.tsx
    │   ├── RecipientsList.tsx
    │   ├── SubscriptionsEdit.tsx     # The main editor + preview surface
    │   ├── CustomizationOverview.tsx
    │   └── LogsPage.tsx              # Phase 3 preview
    └── data/
        ├── platform-mock.ts          # Dashboard KPIs, hot leads, section toggles catalog
        ├── journey-lookup.ts         # Lead-drilldown journey index
        └── email-logs.ts             # Mock log entries
```

### `ai-harness/` (Python — implements PRD Section 4 exactly)

```
ai-harness/
├── config.py                  # Single source of truth for ceilings (model, tokens, $)
├── pii_stripper.py            # Pre-call PII strip + post-call PII check
├── cost_tracker.py            # Per-request / per-day / per-week / rolling 24h
├── story_generator.py         # Main entry: generate_story(journey, dealer_id)
├── fixtures.py                # Python mirror of test-data/conversations.ts
├── requirements.txt           # anthropic + pyyaml
└── README.md
```

### `eval-runner/`

```
eval-runner/
├── run_evals.py               # CLI: --mock, --case, --bucket, --json
└── README.md
```

### `test-data/`

```
test-data/
├── schema.ts                  # Single TypeScript contract for all email payloads
├── dealers.ts                 # 5 dealer fixtures + role-based recipients
├── conversations.ts           # 6 conversation journeys (drive Story-of-the-Week)
├── dashboard.ts               # KPI snapshot + appointment funnel
├── index.ts                   # Barrel exports
└── scenarios/
    ├── daily.ts               # 10 daily scenarios (incl. v2 edge cases)
    ├── weekly.ts              # 4 agent variants + fallback
    ├── monthly.ts             # 3 monthly scenarios
    └── eoc.ts                 # 3 EOC scenarios
```

### `evals/story-of-the-week/`

```
evals/story-of-the-week/
├── cases.yaml                 # 32 eval cases — 4 buckets, traced to Signal evidence
└── rubric.md                  # 5-dimension LLM-judge rubric with weights
```

---

## Notes for engineering wiring

1. **Replace static imports.** The frontend pages currently import scenarios from `@test-data`. Replace with API calls returning JSON matching `test-data/schema.ts`.

2. **AI harness drop-in.** `ai-harness/story_generator.py:generate_story()` is the only entry point. Call it from your weekly/monthly email build pipeline with a journey dict; honor `result.source == "fallback_omit"` by leaving out the Story block.

3. **Cost ceilings live in `config.py`.** Adjust there if PRD Section 4 changes — never inline.

4. **Eval set is locked.** Per `EVAL_GENERATION_PROMPT.md`: do not edit existing cases to make a prototype pass. Append new cases at the end of `cases.yaml` when new failure modes surface in production.

5. **Phase 2 alias depth.** `frontend-platform/vite.config.ts` and `tsconfig.json` both reference `../frontend/src` (Phase 1 sibling) — moving this folder breaks the cross-app import unless both move together.

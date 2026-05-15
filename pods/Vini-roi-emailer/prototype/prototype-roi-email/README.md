# Vini Dealer Reporting Emailer — Prototype

Working prototype for the PRD at `pods/vini-reporting/prd-roi-emailer.md`.

This directory contains three independent components that engineers can wire to a real backend:

```
prototype/
├── ai-harness/       Python — generates Story-of-the-Week summaries (Claude Haiku 4.5)
├── eval-runner/      Python — runs evals/story-of-the-week/cases.yaml through the harness
└── frontend/         React + TypeScript + Tailwind — renders all 4 email scenarios with mock data
```

Mock data lives at the repo root in `/test-data/` (TypeScript source-of-truth, also mirrored in Python at `ai-harness/fixtures.py`).
Eval cases (32) live at `/evals/story-of-the-week/`.

---

## TL;DR — run everything

```bash
# 1. Frontend (visual preview of every email scenario)
cd prototype/frontend
npm install
npm run dev                 # http://localhost:5173

# 2. Evals (mock mode — no API key needed)
cd prototype/eval-runner
../ai-harness/.venv/bin/python run_evals.py --mock

# 3. Evals (live mode — requires ANTHROPIC_API_KEY)
ANTHROPIC_API_KEY=sk-ant-... ../ai-harness/.venv/bin/python run_evals.py
```

Mock-mode eval baseline: **32/32 pass** (happy_path 10/10, customer_failure 13/13, adversarial 6/6, cost_latency 3/3).

---

## What this prototype proves

The PRD has one job-to-be-done (§1), two AI surfaces (§4–§5), and one tight prototype scope (§6). This prototype answers:

1. **Does the harness spec hold under the eval set?** The AI harness implements PRD §4 *exactly*: Haiku 4.5, no tools, PII-stripped JSON in the prompt, fallback-omit on any error/timeout/PII-fail/short-output/cost-ceiling. The runner reports pass-rate per case and per bucket, plus aggregate cost.

2. **Do the dealer-facing renderings work for the messy real scenarios?** The frontend renders 20 mock scenarios spanning all four emails (Daily Digest, Weekly Performance, Monthly Value, End-of-Campaign) including silent-day suppression, baseline-period onboarding, small-denominator suppression, zero-MTD neutral gray, paused-campaign warning, AI fallback, and audiences-exhausted edge cases.

3. **Is the contract between FE and backend pinned down?** `/test-data/schema.ts` is the single TypeScript contract every email payload must match. Engineers wire real APIs to that shape; no UI changes needed.

---

## What is intentionally NOT in the prototype

These are out of scope per PRD §6 or per the layered build plan:

- Real email send (SMTP, scheduling, time-zone-aware delivery)
- Recipient management UI (Phase 2 of PRD §19)
- Self-serve section toggles, frequency overrides, channel choice
- DMS-connected actual revenue
- Per-lead drill-in inside the email body (deep-links into console handle this)
- Authentication, multi-tenant isolation, audit logs
- Story-selection scoring function (deterministic surface — speced in PRD, not implemented here)
- Slack alarm dispatch (deterministic surface)
- 7 AM dealer-local send scheduler

The eval-runner can be extended to cover the deterministic surfaces; this prototype focuses on the **AI-touched surface** (Story narrative summary) per the harness spec.

---

## Backend wiring guide for engineering

Each frontend scenario corresponds to an API response shape. To move from prototype to production:

1. **Data layer.** Replace the static imports in `prototype/frontend/src/App.tsx` (and the data flowing into each email component) with API calls. The endpoints should return JSON matching `test-data/schema.ts`:
   - `GET /api/emails/daily?dealer={id}&recipient={id}&date={iso}` → `DailyDigestData`
   - `GET /api/emails/weekly?...` → `WeeklyData`
   - `GET /api/emails/monthly?...` → `MonthlyData`
   - `GET /api/emails/eoc?campaign={id}` → `EOCData`

2. **Story generation.** Call `ai-harness/story_generator.generate_story(journey, dealer_id)` from your weekly/monthly email-build pipeline. Pass the deterministically-selected journey (your story-selection scorer picks; harness summarizes). The function returns a `StoryResult` with `source: "ai_haiku" | "fallback_omit"` — when `fallback_omit`, render the email without the Story block (the frontend handles this case already; see `WEEKLY_NO_STORY_FALLBACK`).

3. **Cost tracking.** The harness uses an in-memory `CostTracker`. In production, swap the singleton in `story_generator.py` for one backed by your metrics store. The ceilings (per-request, per-day, per-week, kill-threshold) live in `ai-harness/config.py` — adjust there.

4. **Eval set is locked.** Per `EVAL_GENERATION_PROMPT.md`: do not edit existing cases to make a prototype pass. Add new cases at the end of `evals/story-of-the-week/cases.yaml` if you discover failure modes the set misses.

---

## Why these specific tech choices

- **Python harness** rather than TS/Node: Anthropic SDK is well-supported in both, but the eval ecosystem (PyYAML, pytest-style runners, future integration with rubric LLM-judge calls) is more mature in Python. Keeps the harness independent of the FE.
- **Vite + React + Tailwind**: fastest path to a production-grade preview with zero design-system debt. No router (single-page scenario switcher), no state library (just `useState`), no React Query (data is static).
- **Mock-mode default for eval runner**: lets reviewers run the full pipeline without burning Anthropic credits. Real API mode flips a flag (`omit --mock`).

---

## File map (full)

```
test-data/
├── schema.ts                         # TypeScript contract — single source of truth
├── dealers.ts                        # Dealer + recipient fixtures
├── conversations.ts                  # Story journey fixtures
├── index.ts                          # Barrel exports for FE
└── scenarios/
    ├── daily.ts                      # 10 Daily Digest scenarios (incl. edge cases)
    ├── weekly.ts                     # 4 Weekly Performance scenarios
    ├── monthly.ts                    # 3 Monthly Value scenarios
    └── eoc.ts                        # 3 End-of-Campaign scenarios

evals/story-of-the-week/
├── cases.yaml                        # 32 eval cases (10/13/6/3 bucket distribution)
└── rubric.md                         # 5-dimension grading rubric for LLM judge

prototype/ai-harness/
├── config.py                         # PRD §4 ceilings — single source of truth
├── pii_stripper.py                   # Pre-call PII strip + post-call PII check
├── cost_tracker.py                   # Per-request / per-day / per-week / rolling-24h
├── story_generator.py                # Main entry: generate_story(journey, dealer_id)
├── fixtures.py                       # Python mirror of test-data/conversations.ts
└── requirements.txt                  # anthropic, pyyaml

prototype/eval-runner/
└── run_evals.py                      # CLI: --mock, --case, --bucket, --json

prototype/frontend/
├── package.json
├── vite.config.ts                    # @test-data alias, fs.allow for ../../test-data
├── tailwind.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── App.tsx                       # Sidebar + scenario switcher
    ├── main.tsx
    ├── index.css                     # Tailwind directives
    ├── components/                   # Shared UI (CTAButton, KPICard, etc.)
    └── emails/                       # DailyDigest, WeeklyPerformance, MonthlyValueReport, EndOfCampaignReport
```

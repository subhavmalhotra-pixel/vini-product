# Vini Onboarding Revamp — Prototype

Working prototype for Phase 1 of [`prd-onboarding-revamp.md`](../prd-onboarding-revamp.md) (v8).

What's inside:

```
prototype/
├── Backend (Python CLI + evals)
│   ├── scrape_dealership.py        CLI: URL → JSON for one dealer
│   ├── crawler.py                  Playwright + robots.txt + rate-limit
│   ├── schema_parser.py            Schema.org JSON-LD parser
│   ├── llm_extractor.py            Claude Sonnet function-calling fallback
│   ├── merger.py                   merges schema + LLM + derived
│   ├── schemas.py                  Pydantic + LLM tool schema
│   ├── eval_runner.py              runs evals offline, prints pass rate
│   ├── grader.py                   per-case grading against pass_criteria
│   └── requirements.txt, .env.example
│
└── Frontend (React + TS + Tailwind, production-grade mock)
    └── frontend/
        ├── src/
        │   ├── App.tsx             top-level state machine
        │   ├── api/mockApi.ts      ← single seam — replace with real backend
        │   ├── data/mockData.ts    6 scenarios incl. edge cases
        │   ├── types/              mirrors backend schemas
        │   ├── components/         Layout, Stepper, ConfidenceChip, NeedsInputPanel, …
        │   └── screens/            8 onboarding screens (PRD Section 4.1–4.11 + post-email)
        ├── tailwind.config.js · vite.config.ts · tsconfig.json
        └── package.json
```

The eval cases (`../evals/cases.json`) and fixture HTML (`../test-data/fixtures/`)
live one directory up so future pods can share the same dataset.

---

## 1 — Backend pipeline (PRD Section 6)

### Setup

```bash
cd prototype
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium      # only required for live runs
cp .env.example .env              # fill ANTHROPIC_API_KEY if running with LLM
```

### CLI — live single-URL scrape

```bash
python scrape_dealership.py --url https://parkavenuehonda.com --out result.json
python scrape_dealership.py --url https://parkavenuehonda.com --no-llm   # schema.org only
```

Pipeline:

```
URL ──► Playwright crawl (≤3 pages, robots.txt enforced, 1 req/s, dealer's own site only)
        │
        ├──► Schema.org JSON-LD parser            → confidence: high
        │
        ├──► Sonnet fallback (only if yield < 5)  → confidence: medium
        │
        └──► merge + derive timezone from state   → confidence: low
                                                    │
                                                    ▼
                                              DealershipProfile JSON
```

### Offline eval runner

```bash
python eval_runner.py             # all cases, pretty table
python eval_runner.py --no-llm    # skip Claude
python eval_runner.py --case park_avenue_honda
python eval_runner.py --out report.json
```

Sample output (current `--no-llm` run):

```
Eval Report
============================================================
Aggregate: 4/6 cases passed  (pass rate 66.7%)

Case                             Tier            Score   Result
------------------------------------------------------------
park_avenue_honda                happy_path       100%   ✓ PASS
sunset_ford                      happy_path       100%   ✓ PASS
heritage_toyota_no_schema        llm_fallback      20%   ✗ FAIL   (needs LLM)
desert_chevy_partial             low_yield        100%   ✓ PASS
empty_site                       low_yield         83%   ✗ FAIL   (needs LLM)
robots_blocked                   edge_case        100%   ✓ PASS
```

Pass rate ≥ 80% → exit 0. Below → exit 1 (CI-friendly).

Edge cases the suite verifies:
- ✅ Full Schema.org markup
- ✅ Multi-page crawl with contact-page enrichment
- ✅ Partial Schema.org (Needs Input panel populated)
- ✅ LLM-only fallback (no JSON-LD)
- ✅ Coming-soon / empty site
- ✅ robots.txt disallow → extraction_path: blocked

---

## 2 — Frontend mock app (PRD Section 4)

A production-grade React app that mirrors the existing Spyne Retail Suite
onboarding UI, driven entirely by `mockApi.ts`. Engineers swap that single
file for a real backend.

### 🚀 Live deployment

| What | URL |
|---|---|
| App | https://vini-onboarding-revamp.vercel.app |
| Customer Signal | https://vini-onboarding-revamp.vercel.app/docs/signal-onboarding-revamp.md |
| PRD (Phase 1, v9) | https://vini-onboarding-revamp.vercel.app/docs/prd-onboarding-revamp.md |
| Docs manifest | https://vini-onboarding-revamp.vercel.app/docs/manifest.json |
| Vercel project | https://vercel.com/subhavmalhotra-2385s-projects/vini-onboarding-revamp |

Click the **Docs** button in the app header to open the rendered Signal + PRD inside the SPA.

### Run it

```bash
cd prototype/frontend
npm install
npm run dev          # http://localhost:5174
# OR
npm run build && npm run preview
```

### Customer Signal + PRD shipped alongside the app

The deployed Vercel app includes the two markdown docs:
- `signal-onboarding-revamp.md` — Customer signal
- `prd-onboarding-revamp.md`   — Phase 1 PRD (v9)

They're synced from the pod root into `frontend/public/docs/` by `scripts/sync-docs.mjs`, which runs automatically on every `npm run dev`, `npm run build`, and both `deploy` scripts. Live URLs after deploy:

| URL | What it returns |
|---|---|
| `/docs/manifest.json` | List of docs (used by the in-app viewer) |
| `/docs/signal-onboarding-revamp.md` | Raw signal markdown |
| `/docs/prd-onboarding-revamp.md` | Raw PRD markdown |
| `/` | The full SPA — click **Docs** in the header to open a slide-in panel that renders both docs with rendered markdown (tables, checkboxes, code blocks). Press Esc or click the X to close. |

To re-sync manually after editing either source `.md` file:

```bash
cd prototype/frontend
npm run sync-docs
```

### Deploy to Vercel

The frontend is configured for Vercel out of the box (`vercel.json` + the `vercel` CLI in devDeps + `vercel deploy --prod`-aliased npm script).

```bash
cd prototype/frontend

# First-time setup (interactive, opens your browser)
npx vercel login

# First deploy — links the local folder to a Vercel project.
# Vercel will prompt: "Set up and deploy?" → Y;
# "Which scope?" → pick your team;
# "Link to existing project?" → N (first time);
# "Project name?" → vini-onboarding-revamp (or your choice);
# "Directory?" → ./ (you're already inside frontend/);
# Framework, build command, output dir → leave defaults (read from vercel.json).
npx vercel              # preview URL

# Subsequent deploys
npm run deploy:preview  # alias for `vercel`         → preview URL
npm run deploy          # alias for `vercel --prod`  → production URL
```

What ships:
- Framework: Vite (auto-detected from `vercel.json`).
- Build: `npm run build` → `dist/` (static SPA, no server).
- SPA fallback rewrite: every route → `/index.html` so any future client-side routing keeps working.
- Long-cache headers on `/assets/*` (immutable hashed filenames).
- No environment variables required — everything is mock data. When the engineering team wires the real backend, add `VITE_API_BASE_URL` (or similar) under Vercel project settings → Environment Variables and read it from `mockApi.ts` swap-in.

Local state is in `.vercel/` (created by the CLI on first link). That folder is gitignored via `.vercelignore`.

### Screens shipped (one per PRD Section 4 row)

| # | Screen | Renders | Tier |
|---|---|---|---|
| 1 | `RooftopDetails` | URL paste → crawl progress → confidence chips → **Needs Input panel** → Good-to-have collapsed → optional dept hidden | **P0** |
| 2 | `CallerId` | Registry-fetched Profile + Business fields · multi-source Reps with `contract / invite / directory` chips · EIN-mismatch warning | **P0** |
| 3 | `PersonaSelection` | Plain library browse (today's UX) with audio preview | **P1 (unchanged)** |
| 4 | `AgentCustomization` | Templated First Message + derived Area Code · **Skip — configure later** CTA | **P1 (skippable)** |
| 5 | `ServiceConfig` *(Service Agent only)* | Doc upload → RAG progress → 7 fields with confidence chips + citations | **P0** |
| 6 | `TestAgent` | "Talk to me" button mirroring the recording's final screen | unchanged |
| 7 | `GoLive` | Status board: Phone / STL / Smart Widget per agent with health-probe rows · "Mark live & send checklist" CTA | **P0** |
| 8 | `PostOnboardingEmail` | Email preview with deep-linked integration wizards, comms-prefs link, go-live link | **P0** |

### Scenario picker (top right)

Switch among 6 scenarios that exercise every edge case:

| Scenario | What it shows |
|---|---|
| Park Avenue Honda — happy path | Full Schema.org; high-confidence chips everywhere |
| Heritage Toyota — LLM fallback | All fields medium-confidence (yellow chips) |
| Desert Chevy — low yield | Most address fields missing → Needs Input panel populated |
| Locked Dealer — robots.txt block | Crawler blocked banner; full manual entry |
| Acme Auto — EIN mismatch | CNAM screen surfaces red mismatch warning |
| Heritage Service — Service Agent (RAG) | Service Agent flow with policy-doc upload + citations |

### Mock API contract (replace this with real backend)

Every screen imports only from `src/api/mockApi.ts`. The functions there are
the contract engineers should implement on the server. Each returns the
shape declared in `src/types/index.ts`, which mirrors the Pydantic schemas
in `prototype/schemas.py`.

```ts
extractRooftopProfile(scenarioId, onProgress)  →  DealershipProfile
fetchCnam(scenarioId)                          →  { profile, reps }
listPersonas(agentType)                        →  Persona[]
fetchIntegrations(scenarioId)                  →  IntegrationEntry[]
uploadServiceDoc(file, onProgress)             →  ServiceConfig
runTestAgent()                                 →  { passed, duration_s }
fetchGoLiveProbes(scenarioId)                  →  GoLiveProbe[]
sendPostOnboardingChecklist(scenarioId)        →  ChecklistEmail
```

### UI patterns that map to QA verifications in the PRD

| PRD Section 4.x QA check | UI pattern |
|---|---|
| 🟢 high / 🟡 medium / 🔴 missing chips | `<ConfidenceChip>` + `<AutoFillField>` |
| Needs Input fills as one batch | `<NeedsInputPanel>` aside (Rooftop screen) |
| Good-to-have collapsed | "Show advanced" expander |
| Optional dept hidden | "+ Add Department" button |
| Continue blocked only on Must-have empties | `rooftopMustHaveComplete()` in `App.tsx` |
| robots.txt disallow → banner | `RooftopDetails` amber alert block |
| EIN mismatch warning | `CallerId` red banner |
| Skip CTA on Agent Customization | `AgentCustomization.onSkip` |
| STL + Smart Widget hidden, advanced opens reason form | `<StlWidgetAdvanced>` modal, reason required |
| Doc upload → RAG progress + citation table | `ServiceConfig` screen |
| Go-live probes auto-refresh | `GoLive.refresh()` |
| Welcome email 1h after Test Agent | `PostOnboardingEmail` preview |

---

## 3 — Confidence semantics (shared by backend + frontend)

| Confidence | Source                | UI chip       | OB action |
|------------|-----------------------|---------------|-----------|
| `high`     | `schema_org` / `registry` / `contract` | 🟢 green  | one-click confirm |
| `medium`   | `llm` / `invite` / `directory`         | 🟡 amber  | review then confirm |
| `low`      | `derived`             | 🔵 blue       | review then confirm |
| `none`     | —                     | 🔴 red        | OB types manually (routes into Needs Input) |

---

## 4 — Adding new eval cases

1. Drop fixture HTML files into `test-data/fixtures/<id>/`.
2. Append a `cases[]` entry in `evals/cases.json` with `expected` + `pass_criteria`.
3. Re-run `python eval_runner.py`.

`pass_criteria` keys the grader supports:
- `min_high_confidence_fields`
- `min_filled_fields`
- `must_have_fields_present[]`
- `max_hallucinated_fields`
- `extraction_path_in[]`
- `robots_txt_allowed`
- `needs_input_should_contain[]`

---

## 5 — Out-of-scope (deferred per PRD)

- Live production write to the onboarding form.
- Pre-onboarding contract addendum + directory pre-upload (dropped in v8 — replaced by post-onboarding checklist).
- Smart integration discovery / NLP picker (P1 research only, deferred).
- Holiday Tracker, Comms prefs UI in-session (post-onboarding self-serve).
- Multi-rooftop bulk import + enterprise dedup (Phase 2).

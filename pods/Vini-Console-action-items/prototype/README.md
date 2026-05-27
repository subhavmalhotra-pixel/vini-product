# Vini Console — Action Items · Prototype

Working prototype for **Phase 1** of the Vini Console Action Items pod
(see `../prd-console-action-items.md`).

## Layout

```
prototype/
├── frontend/           React + Vite + TS + Tailwind · Spyne Retail Suite shell · all Section 9 UI surfaces
├── ai-harness/         Python · Haiku 4.5 intent extractor · PII strip · dedup · fallback · cost ceiling
├── eval-runner/        Runs the 35 cases · reports pass rate per case + per dimension
├── evals/
│   └── intent-extraction/
│       ├── cases.yaml  35 cases across 6 buckets
│       └── rubric.md   6-dimension grading rubric (PRD Section 5)
└── test-data/          TS mock data — engineers replace with API calls (1:1 with Section 10 entities)
```

## Run the frontend

```bash
cd frontend
npm install
npm run dev          # → http://localhost:5180
```

Mock data covers every scenario from PRD Section 9:

- Repeat-caller pattern (Gary Wise · 5 status_update conversations)
- Multi-intent extraction (Daniela: pricing + recall · Amir: vehicle + trade + quote)
- HITL warm transfer + SMS takeover (Jenna · Sara)
- Past-SLA escalation (Rob — no-show aged > 24h)
- Compliance flag (Tom — DNC request)
- Cross-pod email-loop badge ("Surfaced in your Daily Digest")
- Vini-as-assignee completed item (Marco · status_update auto-resolved)
- Completed view with resolution notes + closure attribution

## Run the AI harness + evals

```bash
cd ai-harness
pip install -r requirements.txt

# Smoke test the pipeline against a single conversation:
cd ../eval-runner
python3 run_evals.py --mock --case hp-001

# Full eval set (35 cases, mock harness):
python3 run_evals.py --mock

# Single bucket:
python3 run_evals.py --mock --bucket dedup

# JSON output for CI:
python3 run_evals.py --mock --json > eval-report.json

# Live mode (Haiku 4.5):
export ANTHROPIC_API_KEY=sk-...
python3 run_evals.py
```

## What's in scope

This is the **full Phase 1 UI vision** with mock data — engineers wire backend by swapping
`test-data/` imports for API responses. The 5-day pilot scope in PRD Section 6 is the
**subset** that goes live first at Mercedes Benz Laguna Niguel.

| Surface | Source of truth |
|---|---|
| FE component design | PRD Section 9 (pending view · completed view · customer profile · drawers) |
| Mock data shape | PRD Section 10 (entities + events) |
| Intent taxonomy | PRD Section 10.5 (14 fixed intents) |
| AI pipeline behavior | PRD Section 4 (Haiku · PII · dedup · cost · fallback) |
| Eval coverage | PRD Section 5 (≥ 35 cases · 6 buckets · 6 rubric dimensions) |

## Smoke-test status (last run · mock mode)

| Bucket | Pass |
|---|---|
| happy_path | 12/12 |
| multi_intent | 6/6 |
| hitl | 4/4 |
| dedup | 4/4 |
| adversarial | 5/5 |
| cost_latency | 4/4 |
| **Total** | **35/35 (100%)** |

All 6 rubric dimensions at 100% in mock mode. Live-mode pass rate will be measured
against Haiku 4.5 once the API key is provisioned.

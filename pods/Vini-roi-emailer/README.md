# Vini ROI Emailer — Pod

AI-generated performance email reports for Spyne's Vini voice agent, delivered to US auto dealership managers.

## Structure

```
signal-roi-emailer.md         Customer signal & validated problem
prd-roi-emailer.md            Full PRD (§1–10 incl. phased rollout + self-serve)
cases-roi-emailer.yaml        32 eval cases (happy_path / failure / adversarial)
rubric-roi-emailer.md         5-dimension LLM-judge rubric

evals/
  story-of-the-week/          Eval cases + rubric (YAML)

test-data/                    TypeScript mock data (daily / weekly / monthly / EOC)

prototype/
  prototype-roi-email/
    frontend/                 Phase 1 — Email preview app  (port 5173)
    frontend-platform/        Phase 2 — Self-serve config platform (port 5174)
    ai-harness/               Python AI pipeline (Claude Haiku, $0.02/req ceiling)
    eval-runner/              Automated eval runner
    evals/                    Eval cases used by runner
    test-data/                Shared mock data for both FE apps
```

## Running locally

```bash
# Phase 1 — email previews
cd prototype/prototype-roi-email/frontend
npm install && npm run dev          # → http://localhost:5173

# Phase 2 — self-serve platform (imports Phase 1 components live)
cd prototype/prototype-roi-email/frontend-platform
npm install && npm run dev          # → http://localhost:5174

# AI harness
cd prototype/prototype-roi-email/ai-harness
pip install -r requirements.txt
ANTHROPIC_API_KEY=sk-... python story_generator.py

# Evals
cd prototype/prototype-roi-email/eval-runner
python run_evals.py
```

## Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Default emailers (daily / weekly / monthly / EOC) | Prototype ready |
| 2 | Self-serve config platform | Prototype ready |
| 3 | Custom email builder + Logs | Planned |

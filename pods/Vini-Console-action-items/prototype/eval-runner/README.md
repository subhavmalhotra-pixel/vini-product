# Eval Runner — Vini Console Action Items

Runs the 35 eval cases in `evals/intent-extraction/cases.yaml` through the AI harness
and reports pass rate per case, per bucket, and per rubric dimension.

## Setup

```bash
cd ../ai-harness
pip install -r requirements.txt
```

## Run

```bash
# Mock mode (no API key — exercises the full pipeline against fixtures):
python run_evals.py --mock

# Single case:
python run_evals.py --case dedup-001 --mock

# Single bucket:
python run_evals.py --bucket multi_intent --mock

# JSON for CI:
python run_evals.py --mock --json > eval-report.json

# Live mode (requires ANTHROPIC_API_KEY):
export ANTHROPIC_API_KEY=sk-...
python run_evals.py
```

## Output

- **Per-bucket pass rate** (happy_path, multi_intent, hitl, dedup, adversarial, cost_latency)
- **Per-rubric-dimension pass rate** (intent_classification, resolution_status, recap_factual, recap_anonymization, recap_format, dedup_correctness)
- **Per-case status** with failure reasons
- **Exit code**: non-zero if any blocking failure (dim 1 < 3 OR dim 4 < 3)

## Ship bar

Per PRD Section 5: ≥ 90% pass rate on every rubric dimension. Cases scoring < 3 on
intent_classification OR recap_anonymization are blocking failures.

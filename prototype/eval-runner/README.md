# Eval Runner

Runs `evals/story-of-the-week/cases.yaml` through the AI harness and reports pass rate per case + per bucket.

## Setup (one-time)

```bash
cd ../ai-harness
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## Run

```bash
# From prototype/eval-runner/
../ai-harness/.venv/bin/python run_evals.py --mock          # 32 cases, no API key needed
../ai-harness/.venv/bin/python run_evals.py --mock --case story-001   # single case
../ai-harness/.venv/bin/python run_evals.py --mock --bucket adversarial
../ai-harness/.venv/bin/python run_evals.py --mock --json > report.json

# Live mode — requires ANTHROPIC_API_KEY
ANTHROPIC_API_KEY=sk-ant-... ../ai-harness/.venv/bin/python run_evals.py
```

Exit code is non-zero if any case fails.

## What the runner does per case

1. Loads the case from `cases.yaml`.
2. Resolves the journey via:
   - `fixtures.ALL_JOURNEYS[journey_id]`, OR
   - synthesizes a minimal journey from `input.transcript_summary` if provided.
3. Calls `generate_story(journey, dealer_id, mock_response=...)`.
4. Checks gates in order — first failure stops:
   - **must_not_contain** present → HARD FAIL
   - **must_contain** missing → fail
   - **cost over ceiling** → fail
   - **fallback_omit** when summary is required → fail
5. Records pass/fail + reasons + cost + latency.

## What gets reported

```
========================================================================
STORY-OF-THE-WEEK EVAL REPORT
========================================================================
Total cases:     32
Passed:          32
Failed:          0
Overall rate:    100.0%

Per-bucket:
  adversarial            6/6  (100%)
  cost_latency           3/3  (100%)
  customer_failure       13/13  (100%)
  happy_path             10/10  (100%)

Cost summary:
  Total requests:           32
  Total cost (USD):         $0.037062
  Avg cost/request (USD):   $0.001158
  Rolling 24h avg:          $0.001158
  Ceiling violations:       0
```

## Mock vs Live mode

`--mock` uses canned responses in `MOCK_RESPONSES` (one per case) to exercise the gate logic without API spend. The pipeline (PII strip, cost track, post-check, short-output check) still runs.

Live mode hits the real Anthropic API. Cost figures become real. The LLM-judge grading (rubric.md) is NOT yet wired in the prototype — the runner currently relies on `must_contain` / `must_not_contain` gates. To extend to LLM-judge:
1. Add an Anthropic Sonnet 4.6 call in `run_case()` after `generate_story()` returns
2. Pass the rubric prompt template from `rubric.md`
3. Score each of the 5 dimensions, combine per the rubric weights
4. Fail the case if `pii_compliance < 1.0` or `composite < case.threshold`

## When to add cases vs edit cases

- **Add** when you discover a new failure mode in production traffic — paste a real example into the `customer_failure` bucket with `must_not_contain` set.
- **Do not edit** an existing case to make a failing prototype pass. The eval set is locked once committed (per `EVAL_GENERATION_PROMPT.md`).

## Tuning ceilings

If the harness hits the cost ceiling routinely in live mode, either:
- Reduce `max_output_tokens` in `ai-harness/config.py` (story can be tighter)
- Or accept it and ship fewer stories per month per dealer

PRD §7 kill criterion #4 triggers if avg cost over rolling 24h exceeds $0.05 at production scale — kill Story surface, ship deterministic-only emails.

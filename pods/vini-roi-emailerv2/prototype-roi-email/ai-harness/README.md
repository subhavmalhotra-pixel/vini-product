# AI Harness — Story-of-the-Week Generator

Implements PRD Section 4 of `pods/vini-reporting/prd-roi-emailer.md`.

## What it does

`generate_story(journey, dealer_id)` takes a single customer journey and returns a 2–3 paragraph anonymized narrative summary, or omits the Story block via the fallback path.

## Setup

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## Use

```python
from story_generator import generate_story
from fixtures import STORY_AT_RISK_SAVE

result = generate_story(STORY_AT_RISK_SAVE, dealer_id="rt_honda_dtla")

if result.source == "ai_haiku":
    print(result.summary)
else:
    # Fallback engaged — omit Story block from the email entirely.
    print(f"Fallback: {result.fallback_reason}")
```

## Pipeline (in order, per PRD Section 4)

1. **PII strip** — `pii_stripper.strip_journey()` redacts names, phones, emails, VINs, and VIN suffix references.
2. **Cost projection** — `cost_tracker.estimate_cost()` projects per-request cost from approximate token counts.
3. **Ceiling enforcement** — three checks (per-request, per-day-per-dealer, per-week-per-dealer); any breach triggers fallback before the LLM is called.
4. **Model invocation** — Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) via the Anthropic SDK. Single call, no tools.
5. **Cost record** — actual token counts logged for ceiling tracking and reporting.
6. **Post-call PII check** — `pii_stripper.post_check_output()` scans the model's output for any PII fragments that survived. If anything is found, fallback engages.
7. **Short-output check** — if output < 100 chars, fallback engages (per PRD Section 4).

Any failure on any step → `StoryResult.source == "fallback_omit"`, `summary == None`, and the email pipeline must omit the Story block. The frontend already handles this case — see `WEEKLY_NO_STORY_FALLBACK` in test-data.

## Configuration

All ceilings are in `config.py`. They come directly from PRD Section 4 and the kill criteria in PRD Section 7:

| Setting | Value | Source |
|---|---|---|
| Model | claude-haiku-4-5-20251001 | PRD Section 4 |
| Max output tokens | 600 | PRD Section 4 |
| Max input tokens | 4000 | PRD Section 4 |
| Request timeout | 10s | PRD Section 4 |
| Per-request cost ceiling | $0.02 | PRD Section 4 |
| Per-week-per-dealer | $0.20 | PRD Section 4 |
| Per-day-per-dealer | $1.00 | PRD Section 4 |
| Rolling-24h kill threshold | $0.05 avg | PRD Section 7 KC4 |

Do not modify without an updated PRD.

## Testing the harness without spending API credits

Pass `mock_response="..."` to `generate_story()`. The full pipeline runs (strip, cost track, post-check, short-output check) but the LLM is skipped. Used by the eval runner's `--mock` mode.

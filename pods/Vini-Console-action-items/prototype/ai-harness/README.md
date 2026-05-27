# Vini Console — Action Items · AI Harness

Implements PRD Section 4 — the intent-extraction + recap pipeline.

## Pipeline

```
transcript → PII strip → cost ceiling → Haiku 4.5 → JSON parse →
post-PII guard → confidence threshold → dedup (deterministic) → events
                                                       ↓ on failure
                                            deterministic fallback path
```

## Layout

| File | Responsibility |
|---|---|
| `intent_extractor.py` | Main public entry point — `extract_action_items(conv, existing) -> ExtractionResult` |
| `taxonomy.py` | The 14 intents from PRD Section 10.5 — closed enum for the prompt |
| `pii_stripper.py` | Pre-LLM strip + post-LLM PII guard (regex) |
| `cost_tracker.py` | Per-call cost + per-rooftop daily cap + 24h kill criterion |
| `config.py` | Model ID, cost ceilings, thresholds |
| `requirements.txt` | `anthropic`, `pyyaml` |

## Run

```bash
pip install -r requirements.txt

# Mock mode (no API key needed — exercises full pipeline against fixtures)
python -c "import json, sys; sys.path.insert(0, '.'); \
  from intent_extractor import extract_action_items, Conversation, Turn; \
  conv = Conversation('c-001','c-gary','Gary Wise','call','mb-laguna',[Turn('customer','Where is my GLC?','2026-05-19T10:00:00Z')]); \
  r = extract_action_items(conv, mock=True); print(json.dumps(r.to_dict(), indent=2))"

# Live mode (requires ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY=sk-...
# same call without mock=True
```

## Contract guarantees

- **Never blocks creation on AI failure** — fallback path always emits an action item with `created_by_ai=False`
- **Cost discipline** — pre-flight check enforces per-rooftop daily cap + 24h kill criterion before issuing the LLM call
- **PII guarantees** — strip customer name/phone/email/VIN both pre + post LLM; any leak triggers the fallback recap
- **Deterministic dedup** — `(customer_id, intent_id)` lookup happens after the LLM, never inside the prompt
- **Schema compliance** — events emit shapes matching PRD Section 10.2 exactly

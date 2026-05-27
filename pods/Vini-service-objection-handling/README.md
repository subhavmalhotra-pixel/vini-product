# Vini — Service Objection Handling

Pod folder for the Service Objection Handling initiative.

## Status
Phase 1 — Step 1: filling Customer Signal

## Artifacts
- `signal-service-objection-handling.md` — customer evidence (in progress)
- `prd-service-objection-handling.md` — to be generated from signal (Step 2)
- `prd-service-objection-handling-eval-cases.yaml` — to be generated from PRD (Step 3)
- `prd-service-objection-handling-test-stubs.md` — deterministic surface tests (Step 3)
- `prototype/` — agent harness, scenario battery, guardrail evals (Step 4)
- `evals/` — locked eval sets

## Prototype focus (Path B — Engineer-led)
This pod's prototype is **not UI-heavy**. It centers on:
- **Agent behaviour** — how the agent handles real service objections (price, trust, timing, scope, competitor)
- **Scenario handling** — coverage across objection types, customer tones, edge cases
- **Guardrail metrics + evals** — hallucination, scope creep, policy violations, tone safety, escalation correctness

See `../../HOW_TO_USE.md` for the full framework.

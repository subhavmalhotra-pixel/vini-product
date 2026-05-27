# Eval Rubric: Intent Extraction + Recap Generation

Mirrors PRD Section 5. Each case is graded on six dimensions; per-dimension scores
are 0–4. **Blocking failures**: any case scoring < 3 on dimensions **(1) taxonomy compliance**
or **(4) anonymization** must be fixed before ship.

## Dimensions

| # | Dimension | What it grades | How a `pass` (≥ 3) looks |
|---|---|---|---|
| 1 | **Intent classification accuracy** | Did the pipeline detect every intent in `expected.intent_ids`? Was the primary correctly identified? Was off-taxonomy correctly routed to `general_info` rather than invented? | Detected intents are a superset of expected (subset OK if `intent_ids_subset`); primary matches; no off-taxonomy IDs |
| 2 | **Resolution status accuracy** | For each intent, was `resolved_in_conversation` vs `unresolved` correctly classified? | Resolved intents do NOT emit action items; unresolved ones DO |
| 3 | **Recap factual accuracy** | Does each recap reflect only what's in the transcript? Zero hallucinations / invented context. | Reviewer can verify every claim against the transcript |
| 4 | **Recap anonymization** | Zero PII in recaps — no customer names, phone numbers, emails, VINs. | Regex post-scan returns no PII; explicit forbidden strings (per case `recap_must_not_contain`) absent |
| 5 | **Recap format** | Single sentence · ≤ 150 chars · uses "the customer" not name · vehicle by generic ref ("their vehicle") | One sentence; ≤ 150 chars; matches generic-reference patterns |
| 6 | **Dedup correctness** | For dedup-bucket cases — did the pipeline correctly emit `action_item.deduplicated` against the existing pending item rather than `action_item.created`? | `deduplicated_events == expected.deduplicated_events` AND `created_events == expected.created_events` |

## Ship bar (PRD Section 5 final paragraph)

- ≥ **90% pass rate** on every dimension (not the overall mean — each dimension must clear 90%)
- 0 cases scoring < 3 on dimensions **(1)** or **(4)** — those are blocking
- Cost ceiling holds in load-test simulation
- Cross-pod contract tests green for both pods

## How the runner grades

The runner (`eval-runner/run_evals.py`) auto-grades cases that have explicit YAML
expectations (e.g. `intent_ids`, `created_events`, `recap_must_not_contain`).
Cases tagged for human review (e.g. recap factual accuracy on multi-paragraph emails)
are flagged in the report with `manual_review: true`.

For Phase 1 ship, the auto-graded slice must reach 90% pass on dimensions 1, 4, 6.
Dimensions 3 + 5 require sampling 20% of `happy_path` + `multi_intent` cases for
human review against the rubric.

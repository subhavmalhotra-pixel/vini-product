# Grading Rubric: Story-of-the-Week / Month Narrative Summary

Used by the LLM-judge scoring method (Claude Sonnet 4.6 as judge — never the same model as the model under test).

For each eval case, the judge scores **0.0–1.0** on each dimension below, then the harness combines them into a single pass/fail decision using the case's `threshold` and `primary_metric`.

---

## Dimensions

### 1. Grounding (weight: 0.40)
Every factual claim in the summary must trace to the input transcript or structured journey data.

| Score | Meaning |
|---|---|
| 1.0 | All claims grounded. No invented facts. |
| 0.7 | Minor unsupported flourishes (e.g., "across an afternoon" when timestamps span morning); claims are otherwise grounded. |
| 0.4 | One material fabricated claim (e.g., invented APR, invented partner bank). |
| 0.0 | Multiple fabricated facts or a fabricated outcome. |

### 2. PII Compliance (weight: 0.25, **HARD GATE**)
Customer names, phone numbers, emails, VINs MUST NOT appear in output.

| Score | Meaning |
|---|---|
| 1.0 | Zero PII fragments present. |
| 0.0 | Any PII fragment present → case fails regardless of other dimensions. |

### 3. Dealer-Context Specificity (weight: 0.15)
Vehicle make/year/trim, recall types, service intents must be preserved exactly. No generalization to "a sedan", "a recall", etc.

| Score | Meaning |
|---|---|
| 1.0 | All dealer-specific tokens preserved verbatim. |
| 0.7 | Some specificity lost (e.g., trim dropped) but make/year retained. |
| 0.3 | Generalized to category (e.g., "a Toyota truck" instead of "2017 Tacoma"). |
| 0.0 | Vehicle context omitted entirely. |

### 4. Tone (weight: 0.10)
No marketing language. No superlatives. No "delight"-class words. Operational and plain.

| Score | Meaning |
|---|---|
| 1.0 | Pure operational tone. No flagged words from must_not_contain. |
| 0.5 | One borderline phrase (e.g., "smooth handoff"). |
| 0.0 | Brochure-style language detected (any word from must_not_contain). |

### 5. Outcome Accuracy (weight: 0.10)
Outcome stated in summary must match the structured `outcome` field exactly:
- `appointment_booked` → "booked", "scheduled", "confirmed for [date]"
- `warm_transfer` → "warm transfer", "handed off"
- `opted_out` / `dnc` → "do-not-call", "opted out"
- `no_response` → "no response", "hangup"

| Score | Meaning |
|---|---|
| 1.0 | Outcome reflected accurately. |
| 0.5 | Outcome implied but ambiguous. |
| 0.0 | Outcome misstated (e.g., describing warm transfer as a booking). |

---

## Composite scoring

```
composite = 0.40 * grounding
          + 0.25 * pii_compliance
          + 0.15 * dealer_context
          + 0.10 * tone
          + 0.10 * outcome_accuracy
```

A case **passes** if:
- `pii_compliance == 1.0` (HARD GATE)
- `composite >= case.threshold`
- All `must_contain` substrings appear in output (case-insensitive)
- No `must_not_contain` substrings appear in output (case-insensitive)
- `cost_per_call <= case.performance.cost_per_call_ceiling_usd`
- `latency_p95 <= case.performance.p95_latency_ceiling_ms`

A failure on any gate fails the case entirely.

---

## Judge prompt (used by eval runner)

```
You are grading the output of a Story-of-the-Week summarization model for a US auto dealership reporting system.

Source transcript / journey data (ground truth):
{transcript}

Model output to grade:
{model_output}

Score the model output on each dimension below (0.0–1.0):
1. Grounding
2. PII Compliance
3. Dealer-Context Specificity
4. Tone
5. Outcome Accuracy

Return JSON only:
{
  "grounding": <0..1>,
  "pii_compliance": <0..1>,
  "dealer_context": <0..1>,
  "tone": <0..1>,
  "outcome_accuracy": <0..1>,
  "notes": "<one-line rationale>"
}
```

---

## What this rubric does NOT grade

- Style or fluency beyond the tone gate
- Length (enforced by hard token cap in harness, not by judge)
- Creativity / variety across runs (not a goal — operational tone wins)
- Whether the human reading the email would find it useful (handled by AC-1 engagement metric, not eval)

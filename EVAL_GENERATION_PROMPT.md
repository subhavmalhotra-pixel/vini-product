# Eval Generation Prompt

> **How to use this**
> 1. Have your approved PRD ready (the output from `PRD_GENERATION_PROMPT.md`).
> 2. Open Claude (Claude.ai, Claude Desktop, or Claude Code).
> 3. Copy everything below this line and paste it as your message.
> 4. At the very bottom, paste your approved PRD where indicated.
> 5. Claude will generate eval cases as YAML, plus a list of test case stubs for any deterministic surfaces.
> 6. Save the output. Review with your engineer. Refine. Commit it. **Lock it before building the prototype.**

---

You are a senior AI product engineer for **Spyne** — an AI-native company building voice agents (Vini) and image AI tools for **US automotive dealerships**.

Your job is to read the PRD at the bottom of this message and produce the **Quality Bar Set** (Step 2 of Spyne's AI-Native Product Framework). This is the set of test cases and eval cases that define "what good looks like" before the prototype is built.

---

## Spyne context — always apply

**Products:**
- **Vini** — Voice AI agent for sales and service calls (inbound + outbound) for US auto dealers
- **ImageStudio** — Vehicle imagery automation
- Other products as referenced in the PRD

**Primary customers:** US automotive dealerships — used-car dealers, new-car dealers, service departments, BDCs, and multi-rooftop dealer groups.

**Known failure modes — every eval set must explicitly test for these where the surface is relevant:**

1. **Hallucinated dealer-specific facts** — model invents data it doesn't have
2. **Action items not mentioned** — extracting things the customer never said
3. **Generic summaries missing dealer context** — vehicle make/year, financing, trade-in, customer history
4. **ROI numbers that don't reconcile** — outputs that don't tie back to the dealer's actual CRM
5. **Wrong local-time delivery** — emails or notifications fired at the dealer's wrong time zone
6. **Causation invented from correlation** — narratives that explain "why" using fabricated logic
7. **Cost or latency blowups** — same task, but suddenly 3× more tokens or seconds

---

## Your task

1. **Read the PRD's Section 5 (Quality bar).** This lists every surface in the feature, each labeled `[deterministic]` or `[ai-generated]`.

2. **For every `[ai-generated]` surface**, produce an **eval set** of at least **30 cases** as YAML, following the case schema below.

3. **For every `[deterministic]` surface**, produce a short **list of test case stubs** (at least 10 per surface) describing what to test. These are not eval cases — they're for engineering to turn into unit/integration/E2E tests. Output them as a bullet list per surface.

4. **If the PRD's Section 5 is incomplete or unclear** (e.g., a surface isn't labeled), STOP and list what's missing. Do not generate a partial Quality Bar Set.

---

## Coverage requirements (per `[ai-generated]` surface)

For each eval set, distribute the 30+ cases across these four buckets:

| Bucket | % of cases | What it tests |
|---|---|---|
| Happy path | 30% | The common, expected scenario works correctly |
| Customer-reported failures | 40% | Failure modes pulled from the original Signal's quotes + the Spyne known failure modes above |
| Adversarial / edge cases | 20% | Unusual inputs: very short, very long, multilingual, hostile, ambiguous |
| Cost / latency stress | 10% | Long context, high token counts, slow-response conditions |

If the Signal quoted real customer pain (e.g. "the model invented a brochure I never asked for"), **convert each such quote into at least one eval case** in the customer-reported failures bucket.

---

## Eval case schema (YAML)

Every case must follow this exact structure:

```yaml
- id: <surface-slug>-001
  surface: <which surface from PRD Section 5>
  bucket: happy_path | customer_failure | adversarial | cost_latency
  description: <one line describing what this case tests>

  input:
    # The trigger — e.g., transcript snippet, dealer data, time window, image, query
    # Be specific. Use realistic Spyne data shapes.
    <input fields appropriate to the surface>

  expected_output:
    # Either an exact expected output, or a rubric for the grader
    <expected fields>

  must_contain:        # things the output MUST include (precision)
    - <item>
  must_not_contain:    # things the output MUST NOT include (anti-hallucination)
    - <item>

  scoring:
    method: exact_match | llm_judge | hybrid
    primary_metric: accuracy | grounding | f1 | precision | recall
    threshold: 0.85       # case fails below this
    grounding_required: true       # must cite source from input

  performance:
    p95_latency_ceiling_ms: 3000
    cost_per_call_ceiling_usd: 0.04

  metadata:
    priority: P0 | P1 | P2
    source_quote_or_ticket: <if pulled from Signal quote, paste the source>
    added_date: <YYYY-MM-DD>
```

---

## Hard rules

1. **Every customer-failure case must trace back to a quote, data point, or known failure mode.** No invented failure scenarios — they all anchor to real evidence.
2. **No invented Spyne data.** Use realistic placeholder shapes (e.g., `dealership_id: SPYNE_DEALER_XXX`, `transcript_id: TR-XXXXX`) but do not fabricate specific customer names or real ARR numbers.
3. **Adversarial cases must be plausible.** "Hostile customer," "Spanglish call," "30-second hangup," "agent talking over customer" — all plausible. Not "what if Mars launches a dealership."
4. **Every `[ai-generated]` surface needs ≥30 cases.** If the surface is too narrow for 30 cases, the surface itself is probably too narrow — flag it.
5. **`must_not_contain` is required on every customer-failure case.** This is the anti-hallucination guarantee.
6. **Performance ceilings come from the PRD's harness spec.** Use those numbers. If the PRD didn't specify, default to `p95_latency_ceiling_ms: 3000` and `cost_per_call_ceiling_usd: 0.05`.
7. **The eval set is locked once committed.** New cases can be added later; existing cases must not be edited just to make a prototype pass. Treat your output as a v1 the engineer will refine and lock — not a final answer they merge as-is.

---

## Output format

Produce a single response with this structure:

```markdown
# Quality Bar Set: <feature name from PRD>

## Summary
- AI-generated surfaces: <count>
- Deterministic surfaces: <count>
- Total eval cases generated: <count>
- Total test case stubs: <count>

## Surface 1: <surface name>  [ai-generated]

### Eval cases (YAML)

\`\`\`yaml
- id: surface-1-001
  surface: <surface name>
  bucket: happy_path
  ...
- id: surface-1-002
  ...
\`\`\`

## Surface 2: <surface name>  [deterministic]

### Test case stubs

1. <Test the happy path: ...>
2. <Test the empty state: ...>
3. <Test the timezone edge case: ...>
...

## (Repeat for each surface)

## Reviewer checklist (for the engineer)
- [ ] Every eval case is runnable with realistic input data
- [ ] Customer-failure bucket has cases pulled from the original Signal's quotes
- [ ] `must_not_contain` is set on every customer-failure case
- [ ] Performance ceilings match the PRD's harness spec
- [ ] No case requires a model the harness doesn't have access to
```

---

## APPROVED PRD — paste below

*(Paste the full PRD content here, including the frontmatter / header. The PRD must be in `status: approved` — do not run eval generation on a draft PRD.)*

# PRD Generation Prompt

> **How to use this**
> 1. Fill in your Customer Signal using `CUSTOMER_SIGNAL_TEMPLATE.md`.
> 2. Open Claude (Claude.ai, Claude Desktop, or Claude Code).
> 3. Copy everything below this line and paste it as your message.
> 4. At the very bottom, paste your filled-in Customer Signal where indicated.
> 5. Claude will produce a detailed PRD.
> 6. Save Claude's output as a markdown file. Review with your Pod Lead + 1 engineer.

---

You are a senior product manager writing a PRD for **Spyne** — an AI-native company building voice agents (Vini) and image AI tools for **US automotive dealerships**.

Your job is to convert the Customer Signal at the bottom of this message into a detailed PRD.

---

## Spyne context — always apply

**Products:**
- **Vini** — Voice AI agent for sales and service calls (inbound + outbound) for US auto dealers
- **ImageStudio** — Vehicle imagery automation (background swap, retouching)
- Other products as referenced in the Signal

**Primary customers:** US automotive dealerships — used-car dealers, new-car dealers, service departments, BDCs (Business Development Centers), and multi-rooftop dealer groups.

**Style:**
- Direct and evidence-backed
- Concrete numbers everywhere possible
- Plain language — no "delight users," "best-in-class," "seamless experience," or "leverage"

**Known failure modes to avoid in any Spyne AI feature:**
1. Hallucinating facts about a specific dealer's data
2. Extracting action items from calls that the customer never mentioned
3. Generic summaries that miss dealer-specific context (vehicle make/year, financing, trade-in)
4. ROI numbers that don't reconcile with the dealer's actual CRM data
5. Notifications or emails sent at the wrong local time per dealership

---

## What to produce

A PRD with **exactly these 7 sections**, in this order:

### 1. Job to be done
One sentence in customer language. No solutions yet — describe the customer's job, not the feature.

### 2. Success metrics
- **Primary metric:** 1 metric, measurable in 30 days. Specify what we measure and where the data comes from.
- **Secondary metrics:** Up to 2 more, same rules.
- For each metric: target value, current baseline, measurement source.

### 3. Non-goals
At least 3 things we are explicitly NOT doing in this phase. This is where scope discipline lives.

### 4. Harness spec (for AI-touched parts of the feature)
- **Model:** Which LLM and version (e.g. Claude Sonnet 4.6, GPT-4.x). Why this one vs. a cheaper option?
- **Tools the AI calls:** Every function or API the model has access to.
- **Context strategy:** What data is retrieved and passed in?
- **Fallback path:** What happens if the model fails, times out, or returns junk?
- **Cost ceiling:** Per-request and per-day-per-dealership caps.

*If the feature has no AI-generated surfaces, write "N/A — deterministic feature" and explain in one line why.*

### 5. Quality bar
List every surface in this PRD. For each one, label it:
- `[deterministic]` → needs test cases (unit, integration, E2E)
- `[ai-generated]` → needs eval cases (at least 30 to start, with a grading rubric)

Then describe the coverage plan briefly (mix of happy path, customer-reported failures, edge cases, cost/latency stress).

### 6. Prototype scope
What gets built in the first prototype. It must be buildable in **≤5 days**. Anything outside this list is explicitly out of scope for Phase 1.

### 7. Kill criteria
At least 3 conditions that would cause us to **kill** this PRD (not pause — abandon). Examples: eval pass rate stuck below 50% after a week, cost ceiling can't be met, no customer in the affected segment will accept the prototype.

---

## Hard rules

1. **Every claim must trace back to a customer quote or data point in the Signal.** If a claim has no evidence, remove it.
2. **No marketing language.** Plain words only.
3. **Every metric must specify HOW it's measured and WHERE the data comes from.**
4. **If the Signal is missing required info, STOP** and list what's missing. Do not generate a partial PRD.
5. **Prototype scope must be buildable in ≤5 days.** If it isn't, cut.
6. **Kill criteria are not optional.** If you can't think of three, the PRD isn't well-defined.
7. **Do not invent customer quotes or data points.** Use only what's in the Signal.

---

## Output format

Produce the PRD as a single clean markdown document:

```markdown
# PRD: <feature name>

**Author:** <from Signal>
**Product:** <from Signal>
**Pod:** <from Signal>
**Date:** <today>
**Status:** draft

## 1. Job to be done
<one sentence>

## 2. Success metrics

### Primary
- **Metric:**
- **Target (within 30 days):**
- **Current baseline:**
- **Measurement source:**

### Secondary
- (up to 2, same format)

## 3. Non-goals
1. ...
2. ...
3. ...

## 4. Harness spec
- **Model:**
- **Tools:**
- **Context strategy:**
- **Fallback:**
- **Cost ceiling:**

## 5. Quality bar

| Surface | Type | Quality artifact |
|---------|------|------------------|
| ...     | [deterministic] / [ai-generated] | test cases / eval cases |

**Coverage plan:** <2–3 sentences>

## 6. Prototype scope (≤5 days)
1. ...
2. ...

## 7. Kill criteria
1. ...
2. ...
3. ...
```

---

## CUSTOMER SIGNAL — paste below

*(Paste your filled-in `CUSTOMER_SIGNAL_TEMPLATE.md` content here, including the Author / Product / Date headers.)*

# How to use the Spyne AI-Native Product Framework — Phase 1

This is the single reference for PMs and engineers using the three template files in this folder. Phase 1 takes a customer signal all the way to a working prototype with eval coverage. Phase 2 (antfooding, hardening, rollout, loop) is covered in a separate document.

---

## The three files

| File | What it is | Who fills it / uses it |
|---|---|---|
| `CUSTOMER_SIGNAL_TEMPLATE.md` | Blank form for capturing a customer problem with evidence | PM fills in by hand |
| `PRD_GENERATION_PROMPT.md` | Instructions you give to Claude to turn a Signal into a PRD | PM pastes into Claude |
| `EVAL_GENERATION_PROMPT.md` | Instructions you give to Claude to turn a PRD into eval cases | PM + Engineer paste into Claude |

These are the only three files. Templates get filled. Prompts get referenced.

---

## The flow at a glance

```
   ┌──────────────────────────┐
   │  CUSTOMER_SIGNAL_        │   ← PM fills this in
   │  TEMPLATE.md             │
   └────────────┬─────────────┘
                │  save as: signal-<slug>.md
                ▼
   ┌──────────────────────────┐
   │  Claude + PRD_GENERATION │   ← PM pastes prompt + filled signal
   │  _PROMPT.md              │
   └────────────┬─────────────┘
                │  save Claude's output as: prd-<slug>.md
                ▼
   ┌──────────────────────────┐
   │  Pod Lead + 1 Eng review │   ← <24h turnaround target
   │  → status: approved      │
   └────────────┬─────────────┘
                ▼
   ┌──────────────────────────┐
   │  Claude + EVAL_GENERATION│   ← PM+Eng paste prompt + approved PRD
   │  _PROMPT.md              │
   └────────────┬─────────────┘
                │  save Claude's output as: prd-<slug>-eval-cases.yaml
                │  + test stubs for deterministic surfaces
                ▼
   ┌──────────────────────────┐
   │  Build the prototype     │   ← Lovable/Bolt (PM-led) OR
   │  against the eval set    │      Cursor/Claude Code (Eng-led)
   │  ≤5 days, real data,     │
   │  ≥70% eval pass rate     │
   └──────────────────────────┘
            END OF PHASE 1
```

---

## Step-by-step

### Step 1 — PM fills the Customer Signal *(~1–3 hours)*

**What you do:**

1. Open `CUSTOMER_SIGNAL_TEMPLATE.md`.
2. Save a copy as `signal-<slug>.md` (e.g. `signal-roi-email.md`) in your pod's folder.
3. Fill in all 7 sections.

**The bar before you proceed:**

- At least **5 verbatim** customer quotes with sources (tickets, calls, Slack)
- At least **3 data points** with sources (Amplitude, Pendo, support, CRM)
- A business impact estimate (≥$50K ARR or ≥500 users affected)
- Problem statement is in customer language, not solution language

**Common pitfalls:**

- Paraphrased quotes instead of verbatim ones (kill them — go re-pull the real text)
- Data points without a source ("we have a lot of complaints" is not a data point)
- Stating the solution in Section 1 instead of the problem

---

### Step 2 — Generate the PRD with Claude *(~30 minutes)*

**What you do:**

1. Open Claude (Claude.ai, Claude Desktop, or Claude Code).
2. Copy the entire contents of `PRD_GENERATION_PROMPT.md`.
3. Paste it into Claude as your message.
4. Scroll to the bottom of the prompt and paste your filled signal where it says `CUSTOMER SIGNAL — paste below`.
5. Send.

Claude will respond with a complete PRD covering:
- Job to be done
- Success metrics (primary + secondary)
- Non-goals (≥3)
- Harness spec (model, tools, retrieval, fallback, cost ceiling)
- Quality bar (every surface labeled `[deterministic]` or `[ai-generated]`)
- Prototype scope (≤5 days)
- Kill criteria (≥3)

**What you do with the output:**

1. Save Claude's response as `prd-<slug>.md` in your pod's folder.
2. Send it to your Pod Lead + 1 engineer for review.
3. Target turnaround: under 24 hours.
4. Once approved, change `Status: draft` to `Status: approved` in the PRD frontmatter.

**Common pitfalls:**

- Skipping review and going straight to evals — don't. Bad PRDs become bad eval sets become bad prototypes.
- "Approving" your own PRD as the PM — needs a second pair of eyes, always.

---

### Step 3 — Generate the Eval Set with Claude *(~1 hour)*

**Who runs this:** PM + Engineer together. Engineer brings technical judgment on what makes a case "runnable." PM brings the customer evidence.

**What you do:**

1. Open Claude (a fresh session is fine).
2. Copy the entire contents of `EVAL_GENERATION_PROMPT.md`.
3. Paste it into Claude as your message.
4. Scroll to the bottom and paste your **approved** PRD where it says `APPROVED PRD — paste below`.
5. Send.

Claude will respond with:
- **For every `[ai-generated]` surface in the PRD:** at least 30 YAML eval cases, distributed across happy path / customer failures / adversarial / cost-latency stress
- **For every `[deterministic]` surface:** at least 10 test case stubs for engineering to turn into unit/integration/E2E tests
- A reviewer checklist

**What you do with the output:**

1. Save the eval cases as `prd-<slug>-eval-cases.yaml` in your pod's folder.
2. Save the test case stubs as `prd-<slug>-test-stubs.md`.
3. Review with your engineer:
   - Are all the customer-failure cases plausible?
   - Are `must_not_contain` lists strong enough on the anti-hallucination cases?
   - Are performance ceilings realistic?
4. Once both of you are happy, **lock the eval set**. No more edits to existing cases — only additions.

**The eval set is now your source of truth.** The prototype is not done until it passes ≥70% of these cases on real data.

**Common pitfalls:**

- Treating Claude's first output as final — it's a v1. Spend 30 minutes refining before you lock.
- Forgetting to pull cases from the actual Signal quotes — if a customer said "Vini invented a brochure," there should be a case for that.
- Letting eval cases be edited later to make a struggling prototype pass — that defeats the entire point. Add new cases instead; never weaken existing ones.

---

### Step 4 — Build the prototype *(~3–5 days)*

**Two paths — choose based on what's being built:**

**Path A — PM-led (UI-heavy, well-defined logic):**
- Tool: Lovable, Bolt, or v0
- PM prompts the tool with the PRD's prototype scope
- Output: clickable prototype + schema doc

**Path B — Engineer-led (novel AI behavior, custom harness, complex retrieval):**
- Tool: Cursor or Claude Code, running in the pod's folder
- Engineer references the PRD and eval YAML
- If using Claude Code in the repo: `claude` → tell it which files to read and what to build

**The non-negotiable gate before declaring "prototype done":**

1. Run the entire eval set against the prototype on **real data**, not mock data
2. Report the pass rate per case (must be ≥70% overall)
3. Report P95 latency and average cost per call
4. Document failure modes you discovered — these become new eval cases

If the eval pass rate is <50% after 5 days, **invoke a kill-criterion review.** Either the PRD's harness spec is wrong, the eval set is too strict, or the prototype scope was too ambitious. Decide which — don't just keep grinding.

**Common pitfalls:**

- Building against mock data — hides latency, cost, and retrieval bugs. Use real data.
- Adding scope that wasn't in the PRD — anything outside Section 6 of the PRD is out of scope. Ask the Pod Lead before adding.
- Skipping the eval run — a prototype that hasn't run the evals isn't a prototype, it's a demo.

---

## What you end up with at the end of Phase 1

For each PRD:

```
pods/<your-pod>/
├── signal-<slug>.md              ← Step 1 output
├── prd-<slug>.md                 ← Step 2 output (status: approved)
├── prd-<slug>-eval-cases.yaml    ← Step 3 output (locked)
├── prd-<slug>-test-stubs.md      ← Step 3 output
└── prototype/                    ← Step 4 output
    ├── (working prototype code)
    └── eval-run-results.md       ← pass rate, latency, cost, failure modes
```

This is the artifact set that goes into Phase 2 (antfooding → hardening → flagged rollout → loop).

---

## A note on review cadence

- **Signal review:** PM self-reviews against the checklist at the bottom of `CUSTOMER_SIGNAL_TEMPLATE.md`. Pod Lead skims.
- **PRD review:** Pod Lead + 1 engineer, target <24 hours.
- **Eval review:** PM + Engineer together — actually together, not async.
- **Prototype review:** Pod Lead + the original Engineer who reviewed the PRD. Anyone else in the pod welcome.

---

## A note on killing things

Killing a PRD before the prototype is built **is a success of the framework, not a failure**. Healthy kill rate: 20–40% of PRDs. If less than 10% of your PRDs get killed, the gates aren't doing their job — weak ideas are sliding through.

Triggers to kill:
- Signal can't be filled with real evidence in 2 days
- PRD reviewers can't agree on what "good" looks like
- Eval cases can't be defined in 3 days (PRD is too vague)
- Prototype can't reach 50% eval pass in 5 days (something fundamental is wrong)

Log every kill with a 1-line reason. This becomes institutional memory and prevents the same dead idea from being re-pitched in 6 months.

---

## Questions PMs ask in week 1

**"What if my feature has no AI in it at all?"**
Then Section 4 (Harness spec) in the PRD will say "N/A — deterministic feature" and the eval generation will produce only test case stubs. The rest of the framework still applies.

**"Can I skip the Signal step if I already know the problem?"**
No. The Signal is the evidence trail. Even if you've heard the problem 100 times, the act of writing down 5 verbatim quotes + 3 data points usually reveals that the problem is narrower (or wider) than you assumed.

**"What if Claude generates a bad PRD?"**
Then your Signal was weak. Don't fight the PRD — fix the Signal and re-run. Garbage in, garbage out applies here harder than in normal product work.

**"How strict is the 5-day prototype scope?"**
Strict. If you can't build it in 5 days, you don't understand the problem yet. Cut scope until you can.

**"When do we move to Phase 2?"**
When the prototype passes ≥70% of evals on real data, *and* the Pod Lead has signed off on shipping it to antfooding. Phase 2 has its own document.

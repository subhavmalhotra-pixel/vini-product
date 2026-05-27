# Vini Console — Action Items (pod, local-only)

**Status:** drafting · signal-stage
**Location:** `_local/` — gitignored, not committed

In-product surface for the morning action queue inside the Vini Console — the human-only items that need a person to close (SMS takeovers, callback requests, failed bookings, customer-specific salesperson asks, recall responses, no-shows, etc.).

## Structure

```
signal-console-action-items.md     Customer signal (← starting here)
prd-console-action-items.md        PRD — drafted post-signal
rubric-console-action-items.md     Eval rubric — defined post-PRD
cases-console-action-items.yaml    Eval cases — generated post-rubric

evals/                              Eval runner outputs
prototype/                          Working prototype (FE / harness / runner)
test-data/                          Mock data for the prototype
```

## Next step

Fill in `signal-console-action-items.md` — the 7-section template is ready to write into.

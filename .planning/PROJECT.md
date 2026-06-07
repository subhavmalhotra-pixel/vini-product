# ROI Daily Emailer (Supabase-only rewrite)

## What This Is

An automated **daily ROI digest emailer** for car-dealership rooftops, rebuilt to run
entirely on Supabase. An hourly Supabase **Edge Function** (`run-digests`) reads
config / recipients / live-status from Supabase tables, pulls metrics from ClickHouse
(read-only HTTP), renders the legacy digest HTML, sends via **Resend**, and records
**every** outcome — sent, not-sent (with reason), or suppressed — to `roi_digest_runs`.
A live **React tracker** reads Supabase so CSM ops can see exactly what went out, what
didn't, and why. It replaces the old Sails notification-service + MongoDB stack, which
we no longer have access to.

Lives in `pods/vini-roi-daily-report/`. (GSD `.planning/` sits at the repo root because
gsd-tools resolves the project root to the git worktree root.)

## Core Value

Every **live** rooftop reliably receives its **accurate** daily ROI digest at its local
send hour — and every send-or-skip is recorded with a concrete reason — with **zero**
dependency on Mongo or the Sails service.

## Requirements

### Validated

<!-- Existing, relied-upon, brownfield baseline. Confirmed live. -->

- ✓ **Five `roi_*` Supabase tables live** (`roi_live_departments`, `roi_rooftop_config`, `roi_recipients`, `roi_digest_runs`, `roi_engagement_events`) with RLS + anon-read — existing (see `notification-service/db/SCHEMA.md`)
- ✓ **Schema decisions confirmed** — idempotency key `(team_id, department, cadence, local_date)`; status/reason enums match the tracker; `metrics` + `rendered_html` stored inline — existing
- ✓ **React tracker live** — reads Supabase directly; agents → departments → send UX; per-rooftop grid with clickable cells — existing
- ✓ **`run-digests` Edge Function scaffolded** — Deno/TS skeleton with ClickHouse HTTP client, dealer-local "yesterday" windowing, and metric-fetch function in progress (~197 lines) — existing
- ✓ **73 live rooftops seeded** in `roi_live_departments` (`is_live=true`); `roi_rooftop_config` + `roi_live_departments` dry-run flags seeded — existing
- ✓ **Old Sails code available as porting input** — `html-render` template (197 lines) and `guardrails` (99 lines) are the only pure-logic carry-overs; queries (~1,200 lines), `digest-store`, `mail-send` available as reference — existing

### Active

<!-- The gaps. Full engine → pilot send (master plan §7, phases A–F). -->

- [ ] **Finish `run-digests` engine** — Supabase work-list join (live ⋈ config ⋈ recipients), the 5-check eligibility gate, ClickHouse metric fetch over HTTP, guardrails port, legacy HTML render port, and `roi_digest_runs` upsert per outcome
- [ ] **Resend send integration** — send raw HTML when `dry_run=false`, capture `message_id`; render-and-store-only when `dry_run=true`
- [ ] **`pg_cron` hourly trigger** — schedule `0 * * * *` → `net.http_post` to `run-digests` (deploy `0002_pg_cron_run_digests.sql` via `pg_net`)
- [ ] **`mail-webhook` Edge Function** — Resend delivered/open/bounce events → `roi_engagement_events`; reflect delivered/bounced back onto the run's `recipients`
- [ ] **`trigger-digest` Edge Function** — manual single-rooftop/dept send (`bypass=true`) powering the tracker's "Send now"
- [ ] **Tracker wiring for outcomes** — sent → stored `rendered_html` + recipient delivery state; not-sent → reason + full-page preview + "Send now"; suppressed → "held by dry-run" + "Send now"; per-dept dry-run toggle writes `roi_live_departments.dry_run`
- [ ] **Pilot send + ramp** — flip `dry_run=false` for a few rooftops, verify real Resend delivery end-to-end, then ramp; retire the Sails service + Mongo deps

### Out of Scope

<!-- Explicit boundaries with reasoning. -->

- **MongoDB + Sails notification-service** — dropped; we have no Mongo access. All Mongo inputs (digest on/off, recipients, dedup log) move to `roi_*` Supabase tables we own.
- **Sails `config/cron.js`** — replaced by `pg_cron`.
- **Rewriting ClickHouse metric queries** — kept as-is, run over HTTP from Deno. The metrics source is unchanged.
- **Rewriting the schema or React tracker** — already live; only small tracker tweaks in scope.
- **Mail providers other than Resend** — locked to Resend for this milestone.
- **Weekly / monthly cadence** — schema supports `cadence`, but this milestone delivers **daily** only.
- **user-management API integration** (timezone + recipient resolution) — not reachable; timezone defaults to `America/New_York` and recipients sourced from Supabase / provided list/CSV until an API source exists.

## Context

- **Monorepo:** `vini-product` contains many independent "pods." This project is
  `pods/vini-roi-daily-report/`. The GSD `.planning/` is at the repo root (tooling
  resolves to the git root) but governs *only* this project.
- **No Mongo access** is the forcing function for the whole rewrite. Every input the old
  service pulled from Mongo now comes from Supabase tables.
- **ClickHouse stays** — read-only HTTP access for metrics (`dealer_leads.*`,
  `eventila.*`). It is the metrics source, never the config source.
- **Prior planning exists** — `pods/vini-roi-daily-report/MASTER_PLAN.md` (the idea doc)
  and a hand-authored `.planning/PHASE-1-PLAN.md` (a dry-run data-backfill track). The
  new GSD roadmap supersedes the latter; the backfill happens naturally once the engine
  runs in dry-run.
- **Safety:** emails are HARD-OFF (`dry_run`) until an explicit pilot cutover. Nothing
  sends until `dry_run=false` is set per rooftop.
- **MCP available** in this environment for both Supabase and ClickHouse — useful for
  verifying schema, seed data, and metric queries during planning/execution.

## Constraints

- **Tech stack**: Supabase (Postgres + `pg_cron` + `pg_net` + Edge Functions, Deno/TS), ClickHouse (read-only HTTP), Resend — three runtimes only, no Mongo/Sails.
- **Schema fixed**: build against `notification-service/db/SCHEMA.md`, not the old Mongo collections.
- **Idempotency**: exactly one `roi_digest_runs` row per `(team_id, department, cadence, local_date)`.
- **Dry-run safety**: no real send until pilot cutover with explicit `dry_run=false`.
- **Egress (unverified)**: ClickHouse HTTP must be reachable from Supabase Edge egress — confirm during Phase B (master plan §9.3).
- **Tracker writes**: anon + RLS acceptable for the prototype; route writes through an Edge Function before production (master plan §9.4).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Runtime = Supabase Edge Function (`run-digests`, Deno/TS) + `pg_cron` hourly via `pg_net` | Fully Supabase, no extra infra; we don't have Mongo/Sails | — Pending |
| Mail provider = Resend | Raw-HTML send + delivered/open/bounce webhook | — Pending |
| Drop Mongo + Sails entirely | No Mongo access; Supabase tables own all config/recipients/dedup | — Pending |
| Brownfield baseline: live schema + tracker + started engine are Validated | Matches reality; roadmap only the gaps | — Pending |
| Port only `html-render` + `guardrails` (pure logic) from old code; rewrite everything DB-coupled | Old code is Mongo-coupled; clean rewrite against `SCHEMA.md` | — Pending |
| Daily cadence only for this milestone | Ship the core path; weekly/monthly deferred | — Pending |
| Emails dry-run until explicit pilot | Avoid sending wrong data to real dealers | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-08 after initialization*

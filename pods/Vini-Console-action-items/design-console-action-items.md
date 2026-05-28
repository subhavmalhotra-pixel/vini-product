# Design — Vini Console · Action Items (Phase 1)

**Author:** Subhav
**Product:** Vini
**Pod / Team:** Vini Product Team
**Date:** 28 May 2026
**Status:** Draft v1 — Phase 1 only; Phase 2 surfaces are explicit non-goals, but design contains the **seams** (assignee = Vini chip, manager-rollup placeholder, "Add action" affordance) so Phase 2 can land without re-IA
**Companion artifacts:** [signal-console-action-items.md](./signal-console-action-items.md) · [prd-console-action-items.md](./prd-console-action-items.md) · [icp-console-action-items.md](./icp-console-action-items.md)

---

## 0. Design principles (the constitution for Phase 1)

1. **Non-complex UI.** Madison learns the flow in < 30 minutes; Anya in < 10 minutes. If a feature can't be explained in one sentence, it doesn't ship in Phase 1.
2. **One primary surface.** `/action-items/pending`. Everything else is a side drawer or a tab on the same page. No nested modals; no settings dives in Phase 1.
3. **Single screen, dense + readable.** ~36–40 px row height. Tabular numerals for ages/counts. ≤ 4 chips/badges per collapsed row — anything more goes into the expanded accordion.
4. **Role-default behaviour, not role-based access (Phase 1).** Same page, same routes for Madison and Anya — but the *defaults* (initial filter, rollup visibility, sort) detect role and adjust. No locked permissions yet; that's Phase 2.
5. **Every affordance must trace back to the 12-row design contract in the ICP.** Anything else is a Phase 2 hook only, not a built feature.
6. **Inline > drawer > modal > page.** Inline reveal in the row first; drawer if it needs an action chain; never a modal; never a separate page (except customer profile, which already exists).
7. **Tokens, not hex.** Use the existing Tailwind tokens (`brand-*`, `dept-*`, `status-*`, `surface-*`, `text-*`, `border-*`). No raw hex inside components.
8. **Anti-patterns explicitly forbidden:** emoji-as-icon, hover-only affordances, focus-ring removal, layout-shifting press states, disabling browser zoom, blocking animations.

---

## 1. Surface map (Phase 1 IA)

```
┌────────────────────────────────────────────────────────────────────────┐
│  AppShell:   [SideRail 72px] [SubNav 200px] [Main]                      │
│  Active rail item: Vini AI · Active sub-nav: Action Items               │
│                                                                          │
│  Main:                                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Page header (sticky)                                             │  │
│  │   Title  ·  Tabs: [Pending] [Completed]                          │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ ROLLUP STRIP (sticky · 56px · always visible · Phase 1 NEW)      │  │ ← Anya
│  │   23 open  ·  oldest 6h 12m  ·  4 unassigned  ·  1 past SLA      │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ FILTER STRIP (sticky)                                            │  │
│  │   [Search]  [Mine|Others|Unassigned|All]  [Age▾]  [📞💬✉️🌐👤] [Intent▾] │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ ROW LIST  (vertical · default sort: customer wait-time desc)     │  │
│  │   ● Gary Wise · Status update · 6h 12m · 5× · Anya · 📞 · ›      │  │
│  │   ● Maria L.  · Pricing quote · 2h 04m ·        · Madison · ✉️ ›  │  │
│  │   ● ... (expand inline on click)                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Side drawers (right-anchored · 440–500px · z-50):                      │
│    AssignDrawer · CloseDrawer · BulkCloseDrawer · SourceDrawer          │
│                                                                          │
│  Secondary route (already exists, no change Phase 1):                   │
│    /customers/:customerId  →  full customer profile w/ all collections  │
└────────────────────────────────────────────────────────────────────────┘
```

**No new routes in Phase 1.** Everything is /action-items/pending + /action-items/completed + /customers/:id (which already exists).

---

## 2. Design tokens — already in place, no change

| Token group | Existing values (keep) | Phase 1 note |
|---|---|---|
| **Font** | Inter (sans), JetBrains Mono (mono), tabular-nums | ✅ keep — meets `text-styles-system` |
| **Brand** | `brand-purple` `#6E2DFF` · soft `#F1ECFF` · border `#E4D8FF` | ✅ keep |
| **Dept** | sales (blue) · service (green) · both (slate) · compliance (red) — paired with soft variants | ✅ keep — `color-semantic` clean |
| **Status** | past (red) · warning (amber) · ok (green) · neutral (slate) | ✅ keep |
| **Surface** | background `#F9FAFB` · card `#FFFFFF` · subtle `#F8FAFC` | ✅ keep |
| **Text** | primary `#0F172A` · secondary `#475569` · tertiary `#94A3B8` · muted `#CBD5E1` | ✅ keep — contrast ≥ 4.5:1 on white |
| **Border** | subtle `#E2E8F0` · strong `#CBD5E1` | ✅ keep |
| **Sizes** | 10/11/12/13/14/15/18 px scale; row height 36–40 px; drawer 440–500 px | ✅ keep |
| **Radius** | `rounded-md` (6 px) for controls · `rounded-full` for chips/badges · `rounded-lg` (8 px) for callouts | ✅ keep |
| **Motion** | 150 ms transitions, `prefers-reduced-motion` honoured globally | ✅ keep — meets `duration-timing` + `reduced-motion` |
| **Focus** | `*:focus-visible { ring-2 ring-brand-purple ring-offset-1 }` | ✅ keep — meets `focus-states` |

> **Skill recommendation pulled but rejected.** The ui-ux-pro-max design-system search returned "Plus Jakarta Sans + blue/orange + flat-mobile" — that's tuned for landing pages and mobile-first SaaS marketing, not an operator console. The existing Inter + Spyne purple + dense-row vocabulary is correct for this surface and stays.

---

## 3. The 12-affordance design contract — Phase 1 spec

Each affordance has: **(a)** the intent, **(b)** the visual/interaction spec, **(c)** the current prototype state, **(d)** the edit needed to ship Phase 1.

### Affordance 1 — Default sort = customer wait-time desc

| | |
|---|---|
| **Intent** | The oldest-waiting customer is the first thing both personas see. No clicking, no sorting. |
| **Spec** | Sort key = `now() - created_at` (minutes) descending. Tie-breaker = `is_primary_intent_of_source` desc, then `customer_id` asc for stability. |
| **Current state** | ✅ Implemented (see `filterAndSortPending` in `ActionItemsPage.tsx`). |
| **Edit** | None. |

### Affordance 2 — One-sentence intent recap on the row

| | |
|---|---|
| **Intent** | Madison reads what the customer needs without re-listening. Anya scans 20 rows in 30 sec. |
| **Spec** | The recap is the only "long" text on the expanded view, ≤ 150 chars, generic-reference language (`the customer`, `their vehicle`) — never PII. Collapsed row shows the **intent chip** only (e.g. "Status update"); expanded row shows the full sentence. |
| **Current state** | ✅ Recap exists on the model (`intent_recap`) and renders in expanded `PendingRow` (line 134–136). |
| **Edit** | None for layout. Cross-check at QA: every recap meets PRD §5 anonymization rubric (no customer names, phone, VIN, email). |

### Affordance 3 — Age-of-task chip (`6h 12m` / `2d`)

| | |
|---|---|
| **Intent** | Urgency at a glance — replaces "date only" today. |
| **Spec** | Tabular-num text. State colors via `AgeBadge`: fresh = `text-tertiary`, ok = `text-secondary`, warning = amber, past = red (semibold). Adjacent `SLAPill` only appears when `warning` or `past` (uppercase 9 px). |
| **Current state** | ✅ `AgeBadge` + `SLAPill` shipped. |
| **Edit** | None — but add `aria-label="Age 6 hours 12 minutes, past SLA"` so screen readers don't read `6h 12m` as abbreviated. |

### Affordance 4 — Assignee field + dropdown on row

| | |
|---|---|
| **Intent** | Anya: accountability. Madison: filter "is this mine?". |
| **Spec** | Collapsed row shows `AssigneeBadge variant="full"` — avatar initials + display name (120 px column). Unassigned = `Unassigned` text in tertiary color. Clicking the row → expand → `Assign` / `Reassign` button → `AssignDrawer`. |
| **Current state** | ✅ Shipped. |
| **Edit** | Add a **Vini chip variant** to `AssigneeBadge` (`bg-brand-purple` avatar, name "Vini") — Phase 2 hook only; visually pre-existing so it doesn't shock when Phase 2 turns on Vini-as-assignee. Phase 1 just renders correctly if the seed data includes it. |

### Affordance 5 — Click-to-listen on source conversation

| | |
|---|---|
| **Intent** | Voice over text. Madison's fastest path to context when a recap isn't enough. |
| **Spec** | Inside the expanded accordion: a `ConversationSnippet` block (already exists) → "View full" → opens `SourceDrawer` (right-anchored, 440 px) with: 1) transcript or audio waveform, 2) timestamp, 3) channel icon, 4) intent + recap header. **Keyboard:** `L` while focused on a row opens SourceDrawer directly. |
| **Current state** | ✅ ConversationSnippet + SourceDrawer shipped. |
| **Edit** | (a) Add an inline **play-icon button** in the expanded accordion next to the snippet (today click-target = the whole snippet) — improves discoverability; (b) wire keyboard shortcut `L` (listen) in `ActionItemsPage`. |

### Affordance 6 — Repeat-caller flag badge

| | |
|---|---|
| **Intent** | Madison knows Gary Wise has pinged 5× before she calls. Anya can filter the queue to "all repeat callers." |
| **Spec** | Visible on the **collapsed row** (today only expanded). Threshold = `repeat_caller_count ≥ 3`. Pill = `bg-status-warning-soft text-status-warning` rounded-full, 10 px, format `5× · 3d`. Tooltip = `"Contacted 5 times over 3 days"`. |
| **Current state** | ⚠️ `RepeatCallerChip` exists but renders only inside the expanded accordion. |
| **Edit** | Surface the chip on the collapsed `PendingRow` — slot it between the intent-chip cluster and the age column (small enough not to disrupt the grid). Add `repeat_caller=true` to the `PendingFilters` model + a single filter toggle in the FilterStrip. |

### Affordance 7 — Canned resolution chips on close

| | |
|---|---|
| **Intent** | Madison closes a task in one tap. Anya gets a structured note for free → audit compliance jumps from today's **0%** to ≥ 90%. |
| **Spec** | 5 fixed quick-action chips in the CloseDrawer (no per-rooftop config in Phase 1). Each chip pre-fills the note + sets the resolution type. Free-text note remains editable below the chips. Resolution-note minimum length stays at 10 chars (already enforced) but is trivially satisfied by any chip click. |
| **Current state** | ✅ 4 chips shipped in `CloseDrawer` (Booked appointment · Left voicemail · Sent quote · DNC). |
| **Edit** | Add 1 chip: **"Info provided"** (`note: "Provided the requested information; no further action needed."` · `type: info_provided`). Now Madison's 5 most common closures all fit on one tap. |

### Affordance 8 — Completed tab: `customer · who · when · note`

| | |
|---|---|
| **Intent** | Anya's QBR prep + day-after grading. |
| **Spec** | Dense table (not row+drawer like Pending). Sticky header. Columns: select · customer (clickable to profile) · intent chip · resolution chip · note (truncated · 280 px · tooltip on hover for full) · closed-by (avatar+name) · closed-at (tabular, right-aligned) · re-open (hover-revealed). Filters: date bucket · resolution · closed-by · intent. Group-by: flat / day / resolver / intent. CSV export. Bulk re-open. |
| **Current state** | ✅ Fully shipped in `CompletedView`. |
| **Edit** | None. (Anya gets her grading view today.) |

### Affordance 9 — Lite-rollup strip above the queue

| | |
|---|---|
| **Intent** | Anya's morning "how is the queue?" — replaces the Excel export. |
| **Spec** | Sticky strip below the page header, above the FilterStrip. 4 metrics, equal width, separated by hairline dividers. Each metric clickable → applies the corresponding filter. ~56 px tall. Always visible. Compact on small screens; never collapsed in Phase 1. |
| | |
| **The four metrics:** | |
| | 1. **Total open** — `pending.length` · `bg-surface-subtle` · neutral · click → "All" assignment filter |
| | 2. **Oldest age** — `max(ageMinutes)` formatted as `6h 12m` · amber if any > 4 h, red if any past SLA · click → sort to that row |
| | 3. **Unassigned** — count of `!assignee_user_id` · amber soft pill · click → "Unassigned" filter |
| | 4. **Past SLA** — count where `slaState === "past"` · red soft pill · click → "Past SLA" age filter |
| **Current state** | ⚠️ The page header (`ActionItemsPage.tsx` lines 56–75) shows 3 of these 4 metrics inline next to the title, cramped, not clickable. |
| **Edit** | New component `RollupStrip.tsx`. Replace the inline header counts with the dedicated strip. Each metric is a button: 44 × ≥56 px tap target (meets `touch-target-size`), `cursor-pointer`, hover state, focus-visible ring, click dispatches a `setFilters` call. |
| **Layout sketch** | ```\n┌──────────────────────────────────────────────────────────────┐\n│ 23           6h 12m         4              1                │\n│ open         oldest         unassigned     past SLA          │\n└──────────────────────────────────────────────────────────────┘\n``` Each cell: top-line = tabular numeric (15 px semibold), bottom-line = label (10 px uppercase tracking-wide tertiary). |
| **Anti-patterns avoided** | No charts in Phase 1 (rule §10 `no-pie-overuse`, and density is wrong for a 4-metric kpi strip). No icons in cells (numeric clarity wins). No color-only state — every alert state pairs a soft-bg with a text-color (rule §1 `color-not-only`). |

### Affordance 10 — "Surfaced in Daily Digest" badge

| | |
|---|---|
| **Intent** | Closes the email-to-action loop. Recipient sees: "the email I clicked from yesterday landed me on this task." |
| **Spec** | Small badge in the **expanded** row meta-line. Format: `📧 Surfaced in Daily Digest · May 17`. Tertiary text color. Tooltip = full source email subject. |
| **Current state** | ✅ `EmailLoopBadge` shipped. |
| **Edit** | None. Verify it renders in the expanded accordion only (not the collapsed row — too noisy). |

### Affordance 11 — "Assigned to me" filter (default for BDC Agent role)

| | |
|---|---|
| **Intent** | Madison lands on a queue that is *just hers*, no cognitive overhead. Anya lands on "All". |
| **Spec** | The `INITIAL_FILTERS` constant becomes role-aware. If `currentUser.role === "bdc_agent"` → `assignment: "mine"`. Else → `assignment: "all"`. Madison sees a one-click `[Mine | Others | Unassigned | All]` segmented control already in the FilterStrip — she can override anytime. Selection persists in `localStorage` per user, but the *first ever* visit defaults by role. |
| **Current state** | ⚠️ FilterStrip + assignment filter shipped, but default is hard-coded `"all"`. |
| **Edit** | (a) Add `role` to the user model in `store.ts` (Phase 1 = enum `bdc_agent` / `bdc_manager` / `gm`). (b) Read `currentUser.role` in `ActionItemsPage` to seed `INITIAL_FILTERS.assignment`. (c) Persist last-used assignment in `localStorage` under `vini.actionItems.assignmentFilter`. (d) For the demo, switch the seed `CURRENT_USER_ID` between Madison (`bdc_agent`) and Anya (`bdc_manager`) via a tiny dev-only role-toggle in the TopHeader (already a SPM affordance, not a Phase 1 ship surface). |

### Affordance 12 — Multi-intent + N badge / bulk-close together

| | |
|---|---|
| **Intent** | One customer with 3 open intents (Gary Wise) → close all 3 from one drawer. |
| **Spec** | Collapsed row shows `+2 more` purple badge when the customer has > 1 pending. Expanded row exposes `Resolve 3 together →` link → opens `BulkCloseDrawer` (shipped). Bulk drawer lets the rep pick a single resolution chip for all selected, or per-item type. |
| **Current state** | ✅ Multi-intent badge + BulkCloseDrawer shipped. |
| **Edit** | None. |

---

## 4. Interaction patterns — codified

These are the patterns every drawer/row/control in Phase 1 must follow. They exist already in the prototype; documenting them so deviations are caught in review.

| Pattern | Spec | Source rule |
|---|---|---|
| **Drawer dismissal** | Click backdrop · `Esc` key · explicit X button (top-right). Width 440–500 px. Right-anchored. z-50 with z-40 backdrop. Backdrop = `bg-black/30` — meets `scrim-and-modal-legibility`. | §9 `modal-escape` |
| **Row expand/collapse** | Click anywhere on the row except the customer-name link. `Enter` / `Space` on focused row also toggles. Chevron rotates 90°. No layout shift outside the row. | §2 `tap-feedback-speed` |
| **Filter changes** | Apply immediately (no apply button). Active filter count surfaced as a `Clear N` link. Search debounced 150 ms. | §8 `inline-validation` |
| **Sort** | Single sort key in Phase 1 (wait-time desc, fixed). No column-header sort UI in Pending. Completed view → `closed_at desc` fixed. | KISS for Phase 1 |
| **Loading** | Skeleton rows (4 row shapes, shimmer) when fetching > 300 ms. Never a blocking spinner mid-page. | §3 `progressive-loading` |
| **Error** | Inline at the top of the affected section (rollup strip OR row list OR drawer). Red-on-pink soft pill with retry. Never a toast for data errors. | §8 `error-clarity`, `error-recovery` |
| **Toast** | Used only for **post-action success** (e.g. "Action item closed · 12 remaining"). 3–5 sec auto-dismiss. `aria-live="polite"`. Bottom-center of main pane. | §8 `toast-dismiss`, `toast-accessibility` |
| **Tooltip** | On hover (web). 200 ms delay. Plain text only. Used for truncated notes + chip context. Keyboard-accessible (focusable cell). | §10 `tooltip-keyboard` |
| **Keyboard shortcuts (Phase 1 set)** | `J/K` next/prev row · `Enter` expand · `A` assign · `C` close · `L` listen (open SourceDrawer) · `Esc` close drawer/dismiss. Single-key, no modifiers, displayed in a `?` help drawer. | §1 `keyboard-shortcuts` |
| **Press feedback** | Buttons + chips: 150 ms transition on bg-color/border. No `transform: scale()` press because rows are too dense and would jitter. | §1 `press-feedback`, `stable-interaction-states` |

---

## 5. Empty / loading / error states — exhaustive

| Surface | Empty | Loading (> 300 ms) | Error |
|---|---|---|---|
| **Rollup strip** | All zeros: `0 open · — oldest · 0 unassigned · 0 past SLA` (no error tone — empty queue is a positive state) | 4 skeleton blocks, shimmer | Red-on-pink retry pill spanning the strip |
| **Pending row list** | `EmptyState variant="all_clear"` — green check, *"All caught up. Next conversations land here automatically."* | 4 skeleton rows | Red-on-pink retry banner above list |
| **Filtered to zero** | `EmptyState variant="no_matches"` — search glyph, *"No matches. Try widening your filters or clearing the search."* + active `Clear N filters` link | n/a | n/a |
| **Completed tab — no history in range** | `EmptyState variant="no_history"` — inbox glyph, *"No items in this period. Widen the date range or clear active filters."* | Table skeleton (header sticky + 6 row skeletons) | Red-on-pink retry above the table |
| **AssignDrawer search returns 0 users** | *"No users match. Reps without role assigned won't appear."* | n/a (client-side filter) | n/a |
| **CloseDrawer submit fails** | n/a | Submit button → `disabled` + spinner | Inline error block above the footer (already implemented) |
| **SourceDrawer transcript fails to load** | *"Source transcript unavailable. Try the call recording in the Calls tab."* | Skeleton transcript lines | Same banner |

> All EmptyState variants use the existing `EmptyState.tsx` component — no new variants needed in Phase 1.

---

## 6. Accessibility checklist — Phase 1 must-pass

Mapped to the skill's Quick Reference §1.

- [ ] **Color contrast** — every text/bg pair on the row, filter strip, drawer, completed table ≥ 4.5:1. Verify amber-on-soft-amber and red-on-soft-red labels meet AA (currently `#D97706 on #FFFBEB` ≈ 4.97:1 ✅, `#DC2626 on #FEF2F2` ≈ 5.51:1 ✅).
- [ ] **Focus ring** — already global via `*:focus-visible`. Verify rollup strip cells and the new repeat-caller chip on the row receive it.
- [ ] **Keyboard nav** — Tab order = rollup → filter strip → row list (top-down) → drawer (when open). `Esc` closes drawer. `J/K/A/C/L/Enter` shortcuts work on the focused row.
- [ ] **Heading hierarchy** — `h1 = "Action Items"` on the page header. `h2` in each drawer title. No skipped levels.
- [ ] **Aria labels** — every icon-only button (chevrons, channel toggles, X to close, listen play icon) has `aria-label`. Rollup strip cells: `aria-label="23 open action items, click to view all"`.
- [ ] **Color-not-only** — Past SLA = red + `Past SLA` text pill (not red row tint alone). Unassigned = amber + "Unassigned" text. Resolution chips = color + label.
- [ ] **Reduced motion** — `prefers-reduced-motion` global rule already disables transitions; verify rollup-strip numeric ticks don't animate.
- [ ] **Tabular numerals** — all ages, counts, IDs use `.tabular` class — already global.
- [ ] **Screen-reader landmarks** — `<aside>` for SideRail + SubNav, `<main>` for content, `<aside role="dialog" aria-label="...">` for drawers, `<nav>` for tabs.
- [ ] **Toast aria-live** — implement when adding the post-close toast (rule §8 `toast-accessibility`).

---

## 7. Cross-persona behaviour map — what each persona sees on first load

### Madison (BDC Agent) opens `/action-items/pending`

```
Rollup strip:  visible but small (Madison glances, doesn't operate from it)
Filter strip:  Assignment defaults to MINE  ← Phase 1 NEW
Sort:          wait-time desc (so her oldest task is row #1)
Row list:      shows only her tasks
First action:  Enter / click → expand → read recap → close with one chip
```

### Anya (BDC Manager) opens `/action-items/pending`

```
Rollup strip:  visible · 4 metrics · she scans + clicks to filter
Filter strip:  Assignment defaults to ALL  ← role-aware
Sort:          wait-time desc (oldest blocker first)
Row list:      shows whole team's queue
First action:  click "4 unassigned" → assign 4 rows in 30 sec → done
```

Both see the **same UI** — only the seed filter + the value of `currentUser` differ. No fork in the codebase, no role-gated screens, no permissions in Phase 1.

---

## 8. What's intentionally NOT in Phase 1 (design hooks only)

These are mentioned for the design partner cohort so they don't expect them — *and* so the IA below has the right shape for Phase 2 to slot in without re-IA.

| Phase 2 feature | Where it will land in this IA | Phase 1 design hook (must build) |
|---|---|---|
| **Manual action creation by BDC Agent** | A `+ Add action` button in the page header (next to the Pending/Completed tabs) → opens a `CreateDrawer`. | Reserve the header space; render a disabled `+ Add action` button with a `Phase 2` tooltip in Phase 1. |
| **Manager dashboard** | A new tab `Team` next to `Pending` / `Completed`. | Tabs component is already extensible; reserve the third slot. No dashboard rendered yet. |
| **Compose-in-drawer customer reply** | A new section inside `CloseDrawer` between "Resolution note" and footer: `[ ] Notify customer with: <auto-generated message>`. | Reserve the layout slot; render placeholder copy in Phase 1 dev builds (hidden behind a flag). |
| **Automated customer status updates** | A new badge on the row: `📤 Customer notified ✓`. | Reserve the badge slot adjacent to `EmailLoopBadge`. |
| **CRM sync on closure** | A new section in `CloseDrawer` footer: `Pushed to CRM: VinSolutions ✓` (read-only confirmation). | Reserve the footer slot; render `—` in Phase 1. |
| **Vini-as-assignee** | Reuses `AssigneeBadge` — adds a Vini avatar variant. | **Build the badge variant in Phase 1** so Phase 2 just changes data, not UI. |

---

## 9. Prototype edits — punch list (the only code work for Phase 1)

Ordered by ship priority. Each edit is bounded — no big rewrites.

| # | File | Edit | Affordance | Effort |
|---|---|---|---|---|
| 1 | `src/components/RollupStrip.tsx` (NEW) | Create a 4-metric sticky strip per §3 Affordance 9 spec. Pure component, takes `pending: ActionItem[]` + `onFilterChange: (next: PendingFilters) => void`. | 9 | M |
| 2 | `src/pages/ActionItemsPage.tsx` | (a) Mount `<RollupStrip pending={pending} onFilterChange={setFilters} />` between page header and `<FilterStrip />`. (b) Strip the existing inline counts (`{pending.length} pending · {unassigned} unassigned · {escalated} escalated`) from the header — the strip replaces them. (c) Add a disabled `+ Add action` button in the header (Phase 2 hook). | 9 + hook | S |
| 3 | `src/components/PendingRow.tsx` | (a) Surface `<RepeatCallerChip>` on the **collapsed** row (currently expanded-only). Slot between the intent-chip cluster and the age column. (b) Add inline play-icon button in the expanded `ConversationSnippet` area for discoverability. (c) Add `aria-label` to the age cell that expands the abbreviation. | 6 + 5 + a11y | M |
| 4 | `src/components/FilterStrip.tsx` | Add a `repeat_caller` toggle to `PendingFilters` and a small Repeat-caller filter button at the end of the strip (icon = RepeatIcon, toggles `f.repeatCaller`). | 6 (Anya's filter path) | S |
| 5 | `src/data/store.ts` | (a) Add `role: "bdc_agent" \| "bdc_manager" \| "gm"` to the user model. (b) Seed Madison + Anya + Edgar with roles in test-data. | 11 | S |
| 6 | `src/pages/ActionItemsPage.tsx` (continued) | Make `INITIAL_FILTERS.assignment` role-aware. Persist last-used filter in `localStorage["vini.actionItems.assignmentFilter"]`. | 11 | S |
| 7 | `src/components/CloseDrawer.tsx` | Add a 5th quick-action chip: **Info provided** (`note: "Provided the requested information; no further action needed." · type: info_provided`). | 7 | XS |
| 8 | `src/components/AssigneeBadge.tsx` | Add a `vini` variant: brand-purple avatar, display name "Vini", same sizing. Render correctly if `assignee_user_id === "vini_agent"` (currently the closer uses this id for Vini-resolved completed items). | 4 + Phase 2 hook | S |
| 9 | `src/data/keyboard.ts` (NEW) | Implement the Phase 1 shortcut set (`J/K/A/C/L/Enter/Esc`) as a single hook `useActionItemsKeyboard()` mounted in `ActionItemsPage`. Help drawer trigger = `?`. | Interaction §4 | M |
| 10 | `src/components/HelpDrawer.tsx` (NEW) | A simple right-side drawer listing the keyboard shortcuts. Opened by `?` or a question-mark icon in the page header. | §1 `keyboard-shortcuts` | S |
| 11 | `src/components/AgeBadge.tsx` | Add `aria-label` that expands `6h 12m` to `"Age 6 hours 12 minutes"`. | A11y | XS |
| 12 | Various drawers | Quick a11y pass: ensure each `<aside role="dialog">` has `aria-label`, the close button has `aria-label="Close"`, and focus traps inside the drawer when open. Also verify `Tab` exits to the trigger on close (focus restoration). | A11y | M |

**Total ship effort estimate:** ~3 dev-days end-to-end (S = ~0.5 day, M = ~1 day, XS = ~0.25 day). All edits are local; no schema migration; no routing changes.

---

## 10. Validation plan — how we'll know it works

| Test | Method | Pass criterion |
|---|---|---|
| **Madison can close a task in < 1 minute** | Moderated usability — 3 BDC agents, fresh seed data, "close the oldest task assigned to you" | ≥ 2/3 complete in under 60 sec on first try, no help needed |
| **Anya gets queue health in < 10 sec** | Moderated usability — 2 BDC managers, fresh queue, "tell me how the queue is right now" | ≥ 2/2 answer with the 4 rollup numbers, no Excel asked for |
| **Repeat-caller flag is noticed at glance** | Eye-tracking heat-map on first frame after load | Madison's first fixation in the row list lands on the highest-`repeat_count` row ≥ 75% of trials |
| **Resolution-note compliance** | Production analytics 30 days post-pilot | ≥ 90% of closed items have a non-empty `resolution_note` (from 0% baseline) |
| **Madison-only access** | Session log on a pilot rooftop | At least 3 BDC agents open the tab ≥ 5×/day for 5 consecutive days |
| **Anya stops exporting to Excel** | CSM check-in 30 days post-pilot | ≥ 1/2 pilot Anyas confirm they no longer maintain a shadow spreadsheet |
| **No regression in accessibility** | axe-core scan on `/action-items/pending` + `/action-items/completed` | Zero serious or critical violations |
| **Reduced-motion respected** | OS toggle + repro | All transitions disabled; rollup metrics render statically |

---

## 11. Open design questions (decide before build)

These are the calls a designer + PM should close together before edit #1 ships:

1. **Rollup strip — Madison sees it too?** Recommendation: **yes, always visible** (single row, ~56 px). It costs 56 px of vertical space; Madison ignores it but won't complain. Hiding it for one role adds branch complexity for no UX gain.
2. **Repeat-caller chip — `5× · 3d` or `5 calls · 3d`?** Recommendation: `5× · 3d` (denser, tabular). Tooltip carries the long form for clarity.
3. **Where does `+ Add action` (Phase 2) sit visually in Phase 1?** Recommendation: **rendered, disabled, tooltip "Phase 2"** — proves the IA is correct and prevents users from asking for it ad-hoc.
4. **Keyboard shortcut for "open SourceDrawer" — `L` or `Space`?** Recommendation: `L` (listen). `Space` is reserved for "toggle expand."
5. **Toast position — bottom-center or top-right?** Recommendation: **bottom-center of main pane** (within the AppShell main, not viewport-fixed). Avoids overlapping the right-edge drawers.
6. **localStorage default for assignment filter — by-user or by-device?** Recommendation: **by-user** (`localStorage["vini.actionItems.${userId}.assignmentFilter"]`). A shared device shouldn't leak Anya's filter to Madison.
7. **Should the Rollup strip cells animate the number when it changes (e.g. `5 → 6`)?** Recommendation: **no animation in Phase 1**. Tabular nums already minimize layout shift; animation would violate the "Madison ignores it" principle.

---

## 12. Phase 2 design seams (do not build — list for awareness)

This is the receipt that the IA above can support Phase 2 without rework:

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header:  Action Items   [+ Add action]  ?                            │  ← + Add action becomes live (Phase 2.A.2)
│ Tabs:    [Pending] [Completed] [Team]                                │  ← Team tab activates (Phase 2.B.1 Manager dashboard)
├──────────────────────────────────────────────────────────────────────┤
│ Rollup:  23 open · 6h 12m oldest · 4 unassigned · 1 past SLA          │  ← unchanged
├──────────────────────────────────────────────────────────────────────┤
│ Row:    ● Gary Wise · Status update · 6h 12m · 5× · 🤖 Vini · 📤 ✓ ›  │
│                                              ^^^^^^   ^^^             │
│                                              Vini-as-assignee   Customer notified  ← Phase 2.C.2
├──────────────────────────────────────────────────────────────────────┤
│ Drawer footer:  Pushed to CRM: VinSolutions ✓                         │  ← Phase 2.C.3
└──────────────────────────────────────────────────────────────────────┘
```

Each seam is a one-line addition to an existing slot — no IA shift, no new routes, no settings page (settings live in Phase 2 alongside the routing config layer shared with the ROI Emailer pod, per signal §8).

---

> **Design partner cohort sign-off TODO before this design ships:**
> - [ ] Anya (BDC Manager at Mercedes Benz Laguna Niguel) confirms the 4 rollup metrics are the right 4
> - [ ] One BDC Agent confirms the canned-chip set (5 chips) covers ≥ 80% of their daily closures
> - [ ] Engineering confirms the role field on the user model is deliverable in Phase 1 (no auth/permissions change required)
> - [ ] CSM confirms the keyboard-shortcut help drawer is acceptable as a "discoverable but not pushed" affordance (vs an onboarding tour, which is explicitly Phase 2)

import type { ActionItem } from "@test-data";
import { ageMinutes, ageLabel, slaState } from "../data/helpers";
import type { PendingFilters } from "./FilterStrip";

/**
 * Lite-rollup strip — Phase 1 design contract affordance #9.
 *
 * Anya's morning "how is the queue?" — replaces the Excel export.
 * 4 metrics, equal width, each clickable → applies the matching filter.
 *
 * Always visible (single row, ~56 px). Sticky below the page header,
 * above the FilterStrip. Madison sees it too but ignores it.
 *
 * Affordance map (see design-console-action-items.md §3 #9):
 *   1. Total open     · neutral · click → assignment=all
 *   2. Oldest age     · amber/red if > SLA thresholds · click → sort to row
 *   3. Unassigned     · amber soft pill · click → assignment=unassigned
 *   4. Past SLA       · red soft pill · click → age=past_sla
 */
export function RollupStrip({
  pending,
  filters,
  onFilterChange,
}: {
  pending: ActionItem[];
  filters: PendingFilters;
  onFilterChange: (next: PendingFilters) => void;
}) {
  const total = pending.length;

  const oldestMins = pending.reduce(
    (max, item) => Math.max(max, ageMinutes(item)),
    0
  );
  const oldestLabel =
    total === 0 ? "—" : ageLabel(oldestMins).replace(/\s*ago$/, "");
  const hasPastSlaOldest = pending.some(
    (i) => slaState(i) === "past" && ageMinutes(i) === oldestMins
  );
  const oldestTone: Tone = total === 0
    ? "neutral"
    : hasPastSlaOldest
    ? "danger"
    : oldestMins >= 240 // 4h+
    ? "warning"
    : "neutral";

  const unassigned = pending.filter((i) => !i.assignee_user_id).length;
  const unassignedTone: Tone = unassigned === 0 ? "neutral" : "warning";

  const pastSla = pending.filter((i) => slaState(i) === "past").length;
  const pastSlaTone: Tone = pastSla === 0 ? "neutral" : "danger";

  return (
    <div
      className="flex flex-shrink-0 items-stretch border-b border-border-subtle bg-white"
      role="group"
      aria-label="Queue health summary"
    >
      <Cell
        label="open"
        value={total.toLocaleString()}
        tone="neutral"
        ariaLabel={`${total} open action items, click to view all`}
        active={filters.assignment === "all" && !hasOtherFilters(filters)}
        onClick={() =>
          onFilterChange({
            ...filters,
            assignment: "all",
            age: "all",
          })
        }
      />
      <Divider />
      <Cell
        label="oldest"
        value={oldestLabel}
        tone={oldestTone}
        ariaLabel={
          total === 0
            ? "No items in queue"
            : `Oldest item ${oldestLabel}, click to focus`
        }
        disabled={total === 0}
        onClick={() => {
          // Oldest is the first row by default sort — no filter change needed,
          // but if a stale filter is active, clear it so the oldest is visible.
          onFilterChange({
            ...filters,
            search: "",
          });
          // Scroll the first row into view
          window.requestAnimationFrame(() => {
            const firstRow = document.querySelector("[data-pending-row]");
            firstRow?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }}
      />
      <Divider />
      <Cell
        label="unassigned"
        value={unassigned.toLocaleString()}
        tone={unassignedTone}
        ariaLabel={`${unassigned} unassigned, click to filter`}
        active={filters.assignment === "unassigned"}
        disabled={unassigned === 0}
        onClick={() =>
          onFilterChange({
            ...filters,
            assignment: "unassigned",
          })
        }
      />
      <Divider />
      <Cell
        label="past SLA"
        value={pastSla.toLocaleString()}
        tone={pastSlaTone}
        ariaLabel={`${pastSla} past SLA, click to filter`}
        active={filters.age === "past_sla"}
        disabled={pastSla === 0}
        onClick={() =>
          onFilterChange({
            ...filters,
            age: "past_sla",
          })
        }
      />
    </div>
  );
}

type Tone = "neutral" | "warning" | "danger";

const TONE_VALUE_CLASS: Record<Tone, string> = {
  neutral: "text-text-primary",
  warning: "text-status-warning",
  danger: "text-status-past",
};

function Cell({
  label,
  value,
  tone,
  ariaLabel,
  active,
  disabled,
  onClick,
}: {
  label: string;
  value: string;
  tone: Tone;
  ariaLabel: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active ? true : undefined}
      className={`group flex flex-1 flex-col items-start justify-center gap-0.5 px-4 py-2 text-left transition-colors ${
        disabled
          ? "cursor-default opacity-60"
          : active
          ? "bg-brand-purple-soft/60"
          : "hover:bg-surface-subtle"
      }`}
    >
      <span
        className={`tabular text-[15px] font-semibold leading-tight ${TONE_VALUE_CLASS[tone]}`}
      >
        {value}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </span>
    </button>
  );
}

function Divider() {
  return (
    <span
      className="my-2 w-px self-stretch bg-border-subtle"
      aria-hidden="true"
    />
  );
}

function hasOtherFilters(f: PendingFilters): boolean {
  return (
    f.intentIds.length > 0 ||
    f.channels.length > 0 ||
    f.age !== "all" ||
    f.dept !== "all" ||
    f.search.trim().length > 0 ||
    Boolean(f.repeatCaller)
  );
}

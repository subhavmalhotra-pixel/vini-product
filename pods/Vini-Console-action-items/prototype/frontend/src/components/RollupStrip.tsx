import type { ActionItem } from "@test-data";
import type { ComponentType } from "react";
import { ageMinutes, ageLabel, slaState } from "../data/helpers";
import type { PendingFilters } from "./FilterStrip";
import { InboxIcon, ClockIcon, BoltIcon, AlertIcon } from "./Icon";

/**
 * Stat-board treatment of the rollup — Phase 1 polish pass.
 *
 * 4 elevated tiles · subtle shadow-xs · large tabular numbers (22px) ·
 * iconified header · semantic accent on alarming states.
 *
 * Anya's "how is the queue?" surface — she should see queue health
 * at a glance without scanning rows.
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
    : oldestMins >= 240
    ? "warning"
    : "neutral";

  const unassigned = pending.filter((i) => !i.assignee_user_id).length;
  const unassignedTone: Tone = unassigned === 0 ? "neutral" : "warning";

  const pastSla = pending.filter((i) => slaState(i) === "past").length;
  const pastSlaTone: Tone = pastSla === 0 ? "neutral" : "danger";

  const allActive =
    filters.assignment === "all" &&
    filters.age === "all" &&
    !filters.repeatCaller &&
    filters.search.trim().length === 0;

  return (
    <div
      className="grid flex-shrink-0 grid-cols-4 gap-3 border-b border-border-subtle bg-surface-background px-5 py-4"
      role="group"
      aria-label="Queue health summary"
    >
      <Tile
        icon={InboxIcon}
        label="open"
        value={total.toLocaleString()}
        tone="neutral"
        ariaLabel={`${total} open action items, click to view all`}
        active={allActive}
        onClick={() =>
          onFilterChange({
            ...filters,
            assignment: "all",
            age: "all",
            repeatCaller: false,
          })
        }
      />
      <Tile
        icon={ClockIcon}
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
          onFilterChange({ ...filters, search: "" });
          window.requestAnimationFrame(() => {
            const firstRow = document.querySelector("[data-pending-row]");
            firstRow?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }}
      />
      <Tile
        icon={BoltIcon}
        label="unassigned"
        value={unassigned.toLocaleString()}
        tone={unassignedTone}
        ariaLabel={`${unassigned} unassigned, click to filter`}
        active={filters.assignment === "unassigned"}
        disabled={unassigned === 0}
        onClick={() =>
          onFilterChange({ ...filters, assignment: "unassigned" })
        }
      />
      <Tile
        icon={AlertIcon}
        label="past SLA"
        value={pastSla.toLocaleString()}
        tone={pastSlaTone}
        ariaLabel={`${pastSla} past SLA, click to filter`}
        active={filters.age === "past_sla"}
        disabled={pastSla === 0}
        onClick={() => onFilterChange({ ...filters, age: "past_sla" })}
      />
    </div>
  );
}

type Tone = "neutral" | "warning" | "danger";

const TONE: Record<
  Tone,
  { value: string; icon: string; chip: string; ring: string }
> = {
  neutral: {
    value: "text-text-primary",
    icon: "text-text-tertiary bg-surface-subtle",
    chip: "",
    ring: "",
  },
  warning: {
    value: "text-status-warning",
    icon: "text-status-warning bg-status-warning-soft",
    chip: "bg-status-warning-soft",
    ring: "",
  },
  danger: {
    value: "text-status-past",
    icon: "text-status-past bg-status-past-soft",
    chip: "bg-status-past-soft",
    ring: "ring-1 ring-status-past/30",
  },
};

function Tile({
  icon: Icon,
  label,
  value,
  tone,
  ariaLabel,
  active,
  disabled,
  onClick,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  value: string;
  tone: Tone;
  ariaLabel: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const t = TONE[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active ? true : undefined}
      className={`group relative flex h-[88px] flex-col items-start justify-between rounded-xl border bg-surface-card px-4 py-3 text-left shadow-xs transition-all duration-150 ease-smooth ${
        disabled
          ? "cursor-default border-border-subtle opacity-60"
          : active
          ? "border-brand-purple shadow-md ring-1 ring-brand-purple/20"
          : `border-border-subtle ${t.ring} hover:-translate-y-px hover:border-border-strong hover:shadow-sm`
      }`}
    >
      {/* Header row — icon + label */}
      <div className="flex w-full items-center justify-between">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${t.icon}`}
        >
          <Icon size={13} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {label}
        </span>
      </div>
      {/* Value — the hero number */}
      <span
        className={`tabular text-[22px] font-semibold leading-none tracking-tight ${t.value}`}
      >
        {value}
      </span>
    </button>
  );
}

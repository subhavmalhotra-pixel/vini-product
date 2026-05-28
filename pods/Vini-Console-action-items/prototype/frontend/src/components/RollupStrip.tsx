import type { ActionItem } from "@test-data";
import type { ComponentType } from "react";
import { ageMinutes, ageLabel, slaState } from "../data/helpers";
import type { PendingFilters } from "./FilterStrip";
import { InboxIcon, ClockIcon, BoltIcon, AlertIcon } from "./Icon";

/**
 * Stat-board treatment of the rollup · enhanced per the
 * intelligent-console-design skill.
 *
 * Each tile now carries Principle #2 in full:
 *   - The raw value (text-display)
 *   - A target line (`Target: <X>`)
 *   - A delta vs. the prior period (color-coded by polarity — read the
 *     skill's voice doc; a falling Open count is GOOD, a rising
 *     Past-SLA count is BAD)
 *
 * Past-SLA tile keeps the pulse-dot indicator when count > 0.
 *
 * Mock comparative baselines (`compareTo` numbers) are baked in here
 * because the skill explicitly says "Mock data is fine and expected.
 * The console's whole point is the *shape* of operational data."
 */

/** Yesterday's baseline values (mocked — wire to real analytics later). */
const COMPARE_TO = {
  total: 28,
  oldestMins: 9 * 60 + 30, // 9h 30m
  unassigned: 6,
  pastSla: 0,
};

const TARGETS = {
  total: 50, // queue cap before manager rebalance is required
  oldestMins: 4 * 60, // 4h SLA bar
  unassigned: 0,
  pastSla: 0,
};

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

  // For Open: a falling count is GOOD (queue is draining)
  // For Oldest: a falling number is GOOD (no aging blockers)
  // For Unassigned: a falling number is GOOD
  // For Past SLA: a falling number is GOOD (zero is the target)
  // All four metrics share the "lower is better" polarity for this product.

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
        target={`Target: < ${TARGETS.total}`}
        deltaPct={pctChange(total, COMPARE_TO.total)}
        lowerIsBetter
        tone="neutral"
        ariaLabel={`${total} open action items. ${comparativeText(total, COMPARE_TO.total, "yesterday")}.`}
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
        target={`Target: < 4h`}
        deltaPct={pctChange(oldestMins, COMPARE_TO.oldestMins)}
        lowerIsBetter
        tone={oldestTone}
        ariaLabel={
          total === 0
            ? "No items in queue."
            : `Oldest item ${oldestLabel}. Target: under 4 hours.`
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
        target={`Target: 0`}
        deltaPct={pctChange(unassigned, COMPARE_TO.unassigned)}
        lowerIsBetter
        tone={unassignedTone}
        ariaLabel={`${unassigned} unassigned. Target: zero.`}
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
        target={`Target: 0`}
        deltaPct={pctChange(pastSla, COMPARE_TO.pastSla)}
        lowerIsBetter
        tone={pastSlaTone}
        ariaLabel={`${pastSla} past SLA. Target: zero.`}
        active={filters.age === "past_sla"}
        disabled={pastSla === 0}
        pulse={pastSla > 0}
        onClick={() => onFilterChange({ ...filters, age: "past_sla" })}
      />
    </div>
  );
}

type Tone = "neutral" | "warning" | "danger";

const TONE: Record<Tone, { value: string; icon: string }> = {
  neutral: {
    value: "text-text-primary",
    icon: "text-text-tertiary bg-surface-subtle",
  },
  warning: {
    value: "text-status-warning-ink",
    icon: "text-status-warning-ink bg-status-warning-soft",
  },
  danger: {
    value: "text-status-past",
    icon: "text-status-past bg-status-past-soft",
  },
};

function Tile({
  icon: Icon,
  label,
  value,
  target,
  deltaPct,
  lowerIsBetter,
  tone,
  ariaLabel,
  active,
  disabled,
  pulse,
  onClick,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  value: string;
  target: string;
  deltaPct: number | null;
  lowerIsBetter?: boolean;
  tone: Tone;
  ariaLabel: string;
  active?: boolean;
  disabled?: boolean;
  pulse?: boolean;
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
      className={`group relative flex h-[112px] flex-col items-start gap-2 rounded-lg border bg-surface-card px-4 py-3 text-left transition-all duration-150 ${
        disabled
          ? "cursor-default border-border-subtle opacity-60"
          : active
          ? "border-brand-purple bg-brand-purple-soft/40 ring-1 ring-brand-purple/30"
          : "border-border-subtle hover:-translate-y-px hover:border-border-strong hover:shadow-sm"
      }`}
    >
      {/* Header · icon + label · pulse indicator slot */}
      <div className="flex w-full items-center justify-between">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${t.icon}`}
        >
          <Icon size={16} />
        </span>
        <span className="flex items-center gap-1.5">
          {pulse ? <span className="pulse-dot" aria-hidden /> : null}
          <span className="text-meta-label text-text-secondary">{label}</span>
        </span>
      </div>

      {/* Hero number */}
      <span className={`text-display leading-none ${t.value}`}>
        {value}
      </span>

      {/* Footer · target on the left, delta on the right */}
      <div className="mt-auto flex w-full items-end justify-between text-[11px] leading-none">
        <span className="text-text-tertiary">{target}</span>
        <DeltaPill pct={deltaPct} lowerIsBetter={lowerIsBetter} />
      </div>
    </button>
  );
}

function DeltaPill({
  pct,
  lowerIsBetter,
}: {
  pct: number | null;
  lowerIsBetter?: boolean;
}) {
  if (pct === null) {
    return <span className="text-text-tertiary">—</span>;
  }
  // For metrics where lower-is-better:
  //   negative delta = improvement = green
  //   positive delta = regression  = red
  // Neutral when |pct| < 1.
  const isNeutral = Math.abs(pct) < 1;
  const isImprovement = lowerIsBetter ? pct < 0 : pct > 0;
  const color = isNeutral
    ? "text-text-tertiary"
    : isImprovement
    ? "text-status-ok"
    : "text-status-past";
  const arrow = isNeutral ? "·" : pct > 0 ? "↑" : "↓";
  return (
    <span className={`tabular font-semibold ${color}`}>
      {arrow} {Math.abs(Math.round(pct))}%
    </span>
  );
}

function pctChange(current: number, prior: number): number | null {
  if (prior === 0 && current === 0) return 0;
  if (prior === 0) return 100; // "from nothing to something" — treat as a 100% rise
  return ((current - prior) / prior) * 100;
}

function comparativeText(
  current: number,
  prior: number,
  windowLabel: string
): string {
  if (current === prior) return `Unchanged vs ${windowLabel}`;
  if (current > prior) return `Up from ${prior} ${windowLabel}`;
  return `Down from ${prior} ${windowLabel}`;
}

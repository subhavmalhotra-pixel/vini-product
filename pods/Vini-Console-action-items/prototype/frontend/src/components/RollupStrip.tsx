import type { ActionItem } from "@test-data";
import { slaState } from "../data/helpers";
import type { PendingFilters } from "./FilterStrip";
import { MaterialSymbol } from "./MaterialSymbol";

/**
 * Core metrics grid · console-revamp/components.md MetricCard pattern.
 *
 * v3.1 (01 Jun grooming): tiles are now the four metrics the Manager
 * actually grades on — `Open · Unassigned · Past SLA · Repeat callers`.
 * "Oldest age" demoted to a per-row signal (redundant once the SLA-burn
 * sort already floats the worst-burnt row to position #1).
 *
 * Polarity rule per console voice.md: every metric here is
 * lower-is-better, so falling = green improvement, rising = red regression.
 */

/** Yesterday's snapshot · mocked. Wire to analytics in Phase 2. */
const COMPARE_TO = {
  total: 28,
  unassigned: 6,
  pastSla: 0,
  repeatCallers: 1,
};

const TARGETS = {
  total: "< 50",
  unassigned: "0",
  pastSla: "0",
  repeatCallers: "0",
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
  const unassigned = pending.filter((i) => !i.assignee_user_id).length;
  const pastSla = pending.filter((i) => slaState(i) === "past").length;
  const repeatCallers = pending.filter((i) => i.repeat_caller_count >= 3).length;

  const allActive =
    filters.assignment === "all" &&
    filters.age === "all" &&
    !filters.repeatCaller &&
    filters.search.trim().length === 0;

  return (
    <div className="border-b border-border-subtle bg-surface-background px-5 py-5">
      {/* Section header per console pattern: H2 + one-sentence description */}
      <div className="mb-4">
        <h2 className="text-section-h2 text-text-primary">Core metrics</h2>
        <p className="mt-0.5 text-section-desc text-text-secondary">
          Targets and trend at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon="inbox"
          label="Open"
          value={total.toLocaleString()}
          target={`Target: ${TARGETS.total}`}
          deltaPct={pctChange(total, COMPARE_TO.total)}
          lowerIsBetter
          active={allActive}
          onClick={() =>
            onFilterChange({
              ...filters,
              assignment: "all",
              age: "all",
              repeatCaller: false,
            })
          }
          ariaLabel={`${total} open. ${comparativeText(total, COMPARE_TO.total)} yesterday.`}
        />
        <MetricCard
          icon="person_off"
          label="Unassigned"
          value={unassigned.toLocaleString()}
          target={`Target: ${TARGETS.unassigned}`}
          deltaPct={pctChange(unassigned, COMPARE_TO.unassigned)}
          lowerIsBetter
          warning={unassigned > 0}
          active={filters.assignment === "unassigned"}
          disabled={unassigned === 0}
          onClick={() => onFilterChange({ ...filters, assignment: "unassigned" })}
          ariaLabel={`${unassigned} unassigned.`}
        />
        <MetricCard
          icon="warning"
          label="Past SLA"
          value={pastSla.toLocaleString()}
          target={`Target: ${TARGETS.pastSla}`}
          deltaPct={pctChange(pastSla, COMPARE_TO.pastSla)}
          lowerIsBetter
          threat={pastSla > 0}
          pulse={pastSla > 0}
          active={filters.age === "past_sla"}
          disabled={pastSla === 0}
          onClick={() => onFilterChange({ ...filters, age: "past_sla" })}
          ariaLabel={`${pastSla} past SLA.`}
        />
        <MetricCard
          icon="autorenew"
          label="Repeat callers"
          value={repeatCallers.toLocaleString()}
          target={`Target: ${TARGETS.repeatCallers}`}
          deltaPct={pctChange(repeatCallers, COMPARE_TO.repeatCallers)}
          lowerIsBetter
          threat={repeatCallers > 0}
          active={filters.repeatCaller}
          disabled={repeatCallers === 0}
          onClick={() => onFilterChange({ ...filters, repeatCaller: !filters.repeatCaller })}
          ariaLabel={`${repeatCallers} repeat callers.`}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  target,
  deltaPct,
  lowerIsBetter,
  warning,
  threat,
  pulse,
  active,
  disabled,
  ariaLabel,
  onClick,
}: {
  icon: string;
  label: string;
  value: string;
  target: string;
  deltaPct: number | null;
  lowerIsBetter?: boolean;
  warning?: boolean;
  threat?: boolean;
  pulse?: boolean;
  active?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  onClick: () => void;
}) {
  const valueClass = threat
    ? "text-status-past"
    : warning
    ? "text-status-warning"
    : "text-text-primary";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active ? true : undefined}
      className={`group relative flex flex-col items-start rounded-lg border bg-surface-card px-5 py-4 text-left transition-all duration-150 ${
        disabled
          ? "cursor-default border-border-subtle opacity-60"
          : active
          ? "border-brand-purple ring-1 ring-brand-purple/30"
          : "border-border-subtle hover:border-border-strong hover:shadow-e1"
      }`}
    >
      {/* Header · bar_chart-style icon + label */}
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2 text-text-secondary">
          <MaterialSymbol name={icon} size={20} />
          <span className="text-card-title">{label}</span>
        </div>
        {pulse ? <span className="pulse-dot" aria-hidden /> : null}
      </div>

      {/* Hero number */}
      <div className={`mt-3 text-display ${valueClass}`}>{value}</div>

      {/* Delta line + "From yesterday" — per voice.md */}
      <div className="mt-2 flex items-baseline gap-2">
        <DeltaText pct={deltaPct} lowerIsBetter={lowerIsBetter} />
        <span className="text-meta text-text-tertiary">From yesterday</span>
      </div>

      {/* Target line */}
      <div className="mt-1 text-meta text-text-tertiary">{target}</div>
    </button>
  );
}

function DeltaText({
  pct,
  lowerIsBetter,
}: {
  pct: number | null;
  lowerIsBetter?: boolean;
}) {
  if (pct === null) {
    return <span className="text-delta text-text-tertiary">—</span>;
  }
  const isNeutral = Math.abs(pct) < 1;
  const isImprovement = lowerIsBetter ? pct < 0 : pct > 0;
  const colour = isNeutral
    ? "text-text-tertiary"
    : isImprovement
    ? "text-status-ok"
    : "text-status-past";
  const arrow = isNeutral ? "·" : pct > 0 ? "↑" : "↓";
  const sign = pct > 0 ? "+" : pct < 0 ? "-" : "";
  return (
    <span className={`text-delta ${colour}`}>
      {arrow} {sign}{Math.abs(Math.round(pct))}%
    </span>
  );
}

function pctChange(current: number, prior: number): number | null {
  if (prior === 0 && current === 0) return 0;
  if (prior === 0) return 100;
  return ((current - prior) / prior) * 100;
}

function comparativeText(current: number, prior: number): string {
  if (current === prior) return "Unchanged from";
  if (current > prior) return `Up from ${prior}`;
  return `Down from ${prior}`;
}

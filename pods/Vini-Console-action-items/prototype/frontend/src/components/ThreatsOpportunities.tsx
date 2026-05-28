import { useMemo } from "react";
import type { ActionItem } from "@test-data";
import { ageMinutes, slaState } from "../data/helpers";
import { getCurrentUserId } from "../data/store";
import type { PendingFilters } from "./FilterStrip";
import { MaterialSymbol } from "./MaterialSymbol";

/**
 * Threats and Opportunities · console-revamp/components.md anatomy.
 *
 * Two columns, threats on the LEFT (shield, red), opportunities on the
 * RIGHT (trending_up, green) — "defense before offense" per layout.md.
 * Each row uses the voice.md "N units — consequence" formula.
 *
 * Clicking a row applies the matching filter on the queue above so the
 * user can pivot from the qualitative summary into the queue list.
 */
export function ThreatsOpportunities({
  pending,
  filters,
  onFilterChange,
}: {
  pending: ActionItem[];
  filters: PendingFilters;
  onFilterChange: (next: PendingFilters) => void;
}) {
  const userId = getCurrentUserId();

  const groups = useMemo(() => derive(pending, userId), [pending, userId]);

  const applyPartial = (partial: Partial<PendingFilters>) => {
    onFilterChange({ ...filters, ...partial });
    window.requestAnimationFrame(() => {
      const firstRow = document.querySelector("[data-pending-row]");
      firstRow?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section className="border-t border-border-subtle bg-surface-background px-5 py-6">
      <div className="mb-4">
        <h2 className="text-section-h2 text-text-primary">
          Threats and opportunities
        </h2>
        <p className="mt-0.5 text-section-desc text-text-secondary">
          Immediate downside on the left; growth and acceleration on the right.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ListPanel
          kind="threat"
          title="Threats"
          subtitle="Immediate downside: loss prevention"
          items={groups.threats}
          onSelectItem={applyPartial}
        />
        <ListPanel
          kind="opportunity"
          title="Opportunities"
          subtitle="Upside: growth and acceleration"
          items={groups.opportunities}
          onSelectItem={applyPartial}
        />
      </div>
    </section>
  );
}

type Row = {
  title: string;
  rationale: string;
  count: number;
  severity?: "Critical" | "High Impact";
  filter: Partial<PendingFilters>;
};

function ListPanel({
  kind,
  title,
  subtitle,
  items,
  onSelectItem,
}: {
  kind: "threat" | "opportunity";
  title: string;
  subtitle: string;
  items: Row[];
  onSelectItem: (partial: Partial<PendingFilters>) => void;
}) {
  const icon = kind === "threat" ? "shield" : "trending_up";
  const tone = kind === "threat" ? "text-status-past" : "text-status-ok";

  const empty = items.length === 0;

  return (
    <section className="rounded-lg border border-border-subtle bg-surface-card">
      <header className="border-b border-border-muted px-5 py-4">
        <div className={`flex items-center gap-2 ${tone}`}>
          <MaterialSymbol name={icon} size={24} />
          <h3 className="text-[15px] font-semibold text-text-primary">
            {title}
          </h3>
        </div>
        <p className="mt-1 text-[13px] text-text-tertiary">{subtitle}</p>
      </header>

      {empty ? (
        <div className="px-5 py-10 text-center">
          <MaterialSymbol
            name={kind === "threat" ? "check_circle" : "bedtime"}
            size={24}
            className={kind === "threat" ? "text-status-ok" : "text-text-tertiary"}
          />
          <p className="mt-2 text-list-item-title text-text-primary">
            {kind === "threat"
              ? "No active threats"
              : "No clear opportunities right now"}
          </p>
          <p className="mt-1 text-list-item-rationale text-text-secondary">
            {kind === "threat"
              ? "All operational lanes are within SLA."
              : "Recheck once new conversations land in the queue."}
          </p>
        </div>
      ) : (
        <ul>
          {items.map((row, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSelectItem(row.filter)}
                className="flex w-full items-start gap-3 border-b border-border-muted px-5 py-3 text-left transition-colors duration-150 last:border-0 hover:bg-surface-subtle"
              >
                <MaterialSymbol
                  name={icon}
                  size={20}
                  className={`mt-0.5 ${tone}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-list-item-title text-text-primary">
                      {row.title}
                    </span>
                    {row.severity ? (
                      <SeverityBadge kind={kind} label={row.severity} />
                    ) : null}
                    <span className="ml-auto tabular text-[14px] font-semibold text-text-primary">
                      {row.count}
                    </span>
                  </div>
                  <p className="mt-1 text-list-item-rationale text-text-secondary">
                    {row.rationale}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SeverityBadge({
  kind,
  label,
}: {
  kind: "threat" | "opportunity";
  label: "Critical" | "High Impact";
}) {
  const styles =
    kind === "threat"
      ? "bg-status-past-soft text-status-past"
      : "bg-status-ok-soft text-status-ok";
  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-badge ${styles}`}
    >
      {label}
    </span>
  );
}

/* ============================================================
   Pure logic — derive threats + opportunities from the queue
   ============================================================ */

function derive(items: ActionItem[], _userId: string) {
  const pastSla = items.filter((i) => slaState(i) === "past");
  const unassignedAged = items.filter(
    (i) => !i.assignee_user_id && ageMinutes(i) >= 24 * 60
  );
  const escalated = items.filter((i) => i.escalation_reason);
  const repeatCallers = items.filter((i) => i.repeat_caller_count >= 3);

  // Eligible for one-tap close: short-SLA intents that have an assignee,
  // ready to be wrapped up. Mocked heuristic since this is a prototype.
  const easyWins = items.filter(
    (i) =>
      i.assignee_user_id &&
      slaState(i) !== "past" &&
      ageMinutes(i) < 4 * 60 &&
      (i.intent_id === "status_update" ||
        i.intent_id === "callback_request" ||
        i.intent_id === "general_info")
  );

  const freshlyCreated = items.filter(
    (i) => ageMinutes(i) < 30 && slaState(i) !== "past"
  );

  // Vini-as-assignee candidates — Phase 2 hook (will route low-judgment
  // items back to Vini). For now: count of "info-provided"-eligible items.
  const viniRoutable = items.filter(
    (i) =>
      i.intent_id === "status_update" ||
      i.intent_id === "general_info"
  );

  const threats: Row[] = [];
  if (pastSla.length > 0) {
    threats.push({
      title: `${pastSla.length} ${plural(pastSla.length, "task")} past SLA`,
      rationale:
        "Customer waiting longer than the intent-level service-level agreement allows — escalate or close now.",
      count: pastSla.length,
      severity: "Critical",
      filter: { age: "past_sla" },
    });
  }
  if (unassignedAged.length > 0) {
    threats.push({
      title: `${unassignedAged.length} ${plural(unassignedAged.length, "task")} unassigned for 24h+`,
      rationale:
        "No one owns the follow-up — assign to a BDC rep before the customer pings again.",
      count: unassignedAged.length,
      severity: unassignedAged.length >= 3 ? "Critical" : undefined,
      filter: { assignment: "unassigned", age: "gt24h" },
    });
  }
  if (repeatCallers.length > 0) {
    threats.push({
      title: `${repeatCallers.length} repeat ${plural(repeatCallers.length, "caller")}`,
      rationale:
        "Customers have contacted the BDC 3+ times — closure-loop is broken, prioritise these.",
      count: repeatCallers.length,
      filter: { repeatCaller: true },
    });
  }
  if (escalated.length > 0) {
    threats.push({
      title: `${escalated.length} escalated ${plural(escalated.length, "item")}`,
      rationale:
        "Flagged for manager review — confirm escalation reason and reassign.",
      count: escalated.length,
      filter: {},
    });
  }

  const opportunities: Row[] = [];
  if (easyWins.length > 0) {
    opportunities.push({
      title: `${easyWins.length} one-tap ${plural(easyWins.length, "closure")} ready`,
      rationale:
        "Status updates and callbacks with a clear next action — close with the canned chip.",
      count: easyWins.length,
      severity: "High Impact",
      filter: { assignment: "mine" },
    });
  }
  if (freshlyCreated.length > 0) {
    opportunities.push({
      title: `${freshlyCreated.length} ${plural(freshlyCreated.length, "task")} freshly created`,
      rationale:
        "Less than 30 minutes old — close before the customer pings a second time.",
      count: freshlyCreated.length,
      filter: { age: "lt4h" },
    });
  }
  if (viniRoutable.length > 0) {
    opportunities.push({
      title: `${viniRoutable.length} ${plural(viniRoutable.length, "candidate")} for Vini`,
      rationale:
        "Low-judgment status or info requests Vini can close autonomously once Phase 2 routing ships.",
      count: viniRoutable.length,
      filter: {},
    });
  }

  return { threats, opportunities };
}

function plural(n: number, noun: string): string {
  return n === 1 ? noun : noun + "s";
}

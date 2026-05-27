import type { ActionItem } from "@test-data";
import { ageLabel, ageMinutes, slaState } from "../data/helpers";

const STATE_CLASSES: Record<string, string> = {
  fresh: "text-text-tertiary",
  ok: "text-text-secondary",
  warning: "text-status-warning font-medium",
  past: "text-status-past font-semibold",
};

export function AgeBadge({ item }: { item: ActionItem }) {
  const state = slaState(item);
  return (
    <span className={`tabular text-[11px] ${STATE_CLASSES[state]}`}>
      {ageLabel(ageMinutes(item))}
    </span>
  );
}

/** Standalone SLA pill (only renders when warning/past). */
export function SLAPill({ item }: { item: ActionItem }) {
  const state = slaState(item);
  if (state !== "warning" && state !== "past") return null;
  const isPast = state === "past";
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
        isPast
          ? "bg-status-past-soft text-status-past"
          : "bg-status-warning-soft text-status-warning"
      }`}
    >
      {isPast ? "Past SLA" : "Near SLA"}
    </span>
  );
}

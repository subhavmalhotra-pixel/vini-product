import type { ActionItem } from "@test-data";
import { ageLabel, ageMinutes, slaState } from "../data/helpers";

const STATE_CLASSES: Record<string, string> = {
  fresh: "text-text-tertiary",
  ok: "text-text-secondary",
  warning: "text-status-warning font-medium",
  past: "text-status-past font-semibold",
};

const STATE_LABEL: Record<string, string> = {
  fresh: "Just created",
  ok: "Within SLA",
  warning: "Near SLA",
  past: "Past SLA",
};

/** Expand "6h 12m ago" / "2d ago" into a full screen-reader phrase. */
function expandAriaLabel(mins: number): string {
  if (mins < 1) return "just now";
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const minutes = mins % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes && days === 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  return `Age ${parts.join(" ")} ago`;
}

export function AgeBadge({ item }: { item: ActionItem }) {
  const state = slaState(item);
  const mins = ageMinutes(item);
  return (
    <span
      className={`tabular text-[11px] ${STATE_CLASSES[state]}`}
      aria-label={`${expandAriaLabel(mins)}, ${STATE_LABEL[state]}`}
    >
      {ageLabel(mins)}
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

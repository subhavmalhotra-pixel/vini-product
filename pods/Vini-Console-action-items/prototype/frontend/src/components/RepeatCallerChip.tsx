import type { ActionItem } from "@test-data";
import { RepeatIcon } from "./Icon";

/**
 * Repeat-caller chip · Phase 1 design contract #6.
 *
 * Readable label: "5 calls in 3d" reads as a sentence at a glance,
 * unlike the cryptic "5× · 3d" used previously. Tooltip carries the
 * fully spelled-out phrasing for ambiguity-free understanding.
 */
export function RepeatCallerChip({ item }: { item: ActionItem }) {
  if (item.repeat_caller_count < 3) return null;
  const created = new Date(item.created_at).getTime();
  const last = new Date(item.last_observed_at).getTime();
  const days = Math.max(1, Math.ceil((last - created) / 86_400_000));
  const noun = item.repeat_caller_count === 1 ? "contact" : "contacts";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-status-past/30 bg-status-past-soft px-2 py-0.5 text-[10px] font-semibold text-status-past"
      title={`Customer contacted ${item.repeat_caller_count} times across ${days} day${days === 1 ? "" : "s"}. Escalation candidate.`}
      aria-label={`Repeat caller. ${item.repeat_caller_count} ${noun} in ${days} days.`}
    >
      <RepeatIcon size={11} />
      {item.repeat_caller_count} in {days}d
    </span>
  );
}

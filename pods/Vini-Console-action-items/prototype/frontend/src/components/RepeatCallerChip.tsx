import type { ActionItem } from "@test-data";
import { RepeatIcon } from "./Icon";

export function RepeatCallerChip({ item }: { item: ActionItem }) {
  if (item.repeat_caller_count < 3) return null;
  const created = new Date(item.created_at).getTime();
  const last = new Date(item.last_observed_at).getTime();
  const days = Math.max(1, Math.ceil((last - created) / 86_400_000));
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-status-warning-soft px-1.5 py-0.5 text-[10px] font-semibold text-status-warning"
      title={`Contacted ${item.repeat_caller_count} times over ${days} days`}
    >
      <RepeatIcon size={11} />
      {item.repeat_caller_count}× · {days}d
    </span>
  );
}

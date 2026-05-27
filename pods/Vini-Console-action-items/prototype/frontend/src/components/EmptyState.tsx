import type { ComponentType } from "react";
import { CheckIcon, SearchIcon, InboxIcon } from "./Icon";

type Variant = "all_clear" | "no_matches" | "no_history";

const VARIANTS: Record<
  Variant,
  { icon: ComponentType<{ size?: number }>; title: string; sub: string; tone: "ok" | "neutral" }
> = {
  all_clear: {
    icon: CheckIcon,
    title: "All caught up.",
    sub: "Next conversations land here automatically.",
    tone: "ok",
  },
  no_matches: {
    icon: SearchIcon,
    title: "No matches.",
    sub: "Try widening your filters or clearing the search.",
    tone: "neutral",
  },
  no_history: {
    icon: InboxIcon,
    title: "No items in this period.",
    sub: "Widen the date range or clear active filters.",
    tone: "neutral",
  },
};

export function EmptyState({ variant }: { variant: Variant }) {
  const { icon: Icon, title, sub, tone } = VARIANTS[variant];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          tone === "ok" ? "bg-status-ok-soft text-status-ok" : "bg-surface-subtle text-text-tertiary"
        }`}
      >
        <Icon size={18} />
      </div>
      <div className="mt-1 text-[13px] font-semibold text-text-primary">{title}</div>
      <div className="max-w-xs text-[12px] text-text-tertiary">{sub}</div>
    </div>
  );
}

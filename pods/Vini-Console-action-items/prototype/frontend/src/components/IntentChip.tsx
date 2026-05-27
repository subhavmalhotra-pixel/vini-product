import type { IntentId } from "@test-data";
import { getIntent } from "../data/store";

const DEPT_CLASSES: Record<string, string> = {
  sales: "bg-dept-sales-soft text-dept-sales",
  service: "bg-dept-service-soft text-dept-service",
  both: "bg-surface-subtle text-text-secondary",
  compliance: "bg-dept-compliance-soft text-dept-compliance",
};

type Size = "xs" | "sm" | "md";

const SIZE_CLASSES: Record<Size, string> = {
  xs: "px-1.5 py-0.5 text-[10px] font-semibold",
  sm: "px-2 py-0.5 text-[11px] font-semibold",
  md: "px-2.5 py-1 text-xs font-semibold",
};

export function IntentChip({
  intentId,
  size = "sm",
  primary,
}: {
  intentId: IntentId;
  size?: Size;
  primary?: boolean;
}) {
  const intent = getIntent(intentId);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${DEPT_CLASSES[intent.dept]} ${SIZE_CLASSES[size]}`}
    >
      {intent.display_name}
      {primary ? (
        <span className="rounded-sm bg-white/70 px-1 text-[8px] font-bold tracking-wide">
          PRIMARY
        </span>
      ) : null}
    </span>
  );
}

export function IntentDot({ intentId }: { intentId: IntentId }) {
  const intent = getIntent(intentId);
  const colorMap: Record<string, string> = {
    sales: "bg-dept-sales",
    service: "bg-dept-service",
    both: "bg-text-tertiary",
    compliance: "bg-dept-compliance",
  };
  return (
    <span
      className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${colorMap[intent.dept]}`}
      aria-hidden
    />
  );
}

type MetricValueDisplayProps = {
  value: number | string;
  unit?: string;
  size?: "hero" | "lg" | "md" | "sm";
  tone?: "default" | "muted" | "neutral-zero";
  className?: string;
};

const sizeClasses: Record<NonNullable<MetricValueDisplayProps["size"]>, string> = {
  hero: "text-3xl sm:text-4xl font-bold leading-tight tracking-tight tabular",
  lg: "text-2xl sm:text-3xl font-bold leading-tight tracking-tight tabular",
  md: "text-lg font-semibold leading-tight tabular",
  sm: "text-sm font-semibold tabular",
};

const toneClasses: Record<NonNullable<MetricValueDisplayProps["tone"]>, string> = {
  default: "text-text-primary",
  muted: "text-text-muted",
  "neutral-zero": "text-text-muted",
};

export function MetricValueDisplay({
  value,
  unit,
  size = "lg",
  tone = "default",
  className = "",
}: MetricValueDisplayProps) {
  return (
    <span className={`${sizeClasses[size]} ${toneClasses[tone]} ${className}`}>
      {value}
      {unit ? (
        <span className="ml-1 text-base font-medium text-text-secondary">{unit}</span>
      ) : null}
    </span>
  );
}

type DeltaProps = {
  delta?: number;
  label?: string;
};

/**
 * Delta coloring rules per design system:
 * - Material gains (>= +3%): positive emerald
 * - Material declines (<= -3%): negative red
 * - Smaller deltas: neutral muted text
 * - Always inline text (no background fills)
 */
export function DeltaBadge({ delta, label }: DeltaProps) {
  if (delta === undefined || delta === null) return null;

  const material = Math.abs(delta) >= 3;
  const color = !material
    ? "text-text-muted"
    : delta > 0
    ? "text-positive"
    : "text-negative";
  const sign = delta > 0 ? "+" : "";

  return (
    <span className={`inline-flex items-baseline gap-1 text-[11px] font-semibold tabular ${color}`}>
      <span>
        {sign}
        {delta.toFixed(1)}%
      </span>
      {label ? <span className="text-[10px] font-medium opacity-70">{label}</span> : null}
    </span>
  );
}

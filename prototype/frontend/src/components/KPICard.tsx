import type { KPICard as KPICardType } from "@test-data";
import { DeltaBadge, MetricValueDisplay } from "./MetricValueDisplay";

type KPICardProps = {
  card: KPICardType;
};

/**
 * Client-facing subtitle mapping for unavailable KPIs.
 * The raw mock-data subtitle (e.g. "N/A — fewer than 5 inbound (3 yesterday)")
 * is engineer-facing and must NEVER reach the email. We swap it for a
 * neutral, forward-looking line based on `unavailable_reason`.
 */
function clientSubtitleForUnavailable(reason: string | undefined): string | undefined {
  switch (reason) {
    case "small_sample":
      return "Trend builds with volume";
    case "baseline_period":
      return "Available soon";
    case "no_activity":
      return undefined;
    default:
      return undefined;
  }
}

export function KPICardView({ card }: KPICardProps) {
  const isUnavailable = card.unavailable;
  const subtitle = isUnavailable
    ? clientSubtitleForUnavailable(card.unavailable_reason)
    : card.subtitle;

  return (
    <div className="rounded-lg border border-border-subtle bg-surface-card p-4 sm:p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
        {card.label}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {isUnavailable ? (
          <MetricValueDisplay value="—" size="lg" tone="muted" />
        ) : (
          <MetricValueDisplay
            value={card.primary_value}
            unit={card.primary_unit}
            size="lg"
          />
        )}
        {!isUnavailable && card.delta !== undefined ? (
          <DeltaBadge delta={card.delta} label={card.delta_label} />
        ) : null}
      </div>
      {subtitle ? (
        <div className="mt-1.5 text-xs leading-relaxed text-text-secondary">
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

type EdgeCaseBannerProps = {
  severity: "info" | "warning";
  message: string;
  deepLink?: string;
};

/**
 * Client-facing filter: the mock data contains banners with operational copy
 * that drives internal Slack alarms but must NEVER reach the email surface.
 *
 * This component is the single chokepoint that decides whether a banner
 * (a) renders, (b) is suppressed entirely, or (c) is replaced with neutral
 * client-facing copy.
 *
 * Returning `null` here means the banner is silently dropped from the email.
 */
export function EdgeCaseBanner({ severity, message, deepLink }: EdgeCaseBannerProps) {
  const lower = message.toLowerCase();

  // SUPPRESS: internal telephony-check warnings
  if (severity === "warning" && lower.includes("verify telephony")) {
    return null;
  }

  // SUPPRESS: paused-campaign warnings — represented inline as a status pill instead
  if (severity === "warning" && lower.includes("campaign paused")) {
    return null;
  }

  // SUPPRESS: full silent-day warning — handled by the SuppressedSendOverlay
  if (severity === "warning" && lower.includes("no conversations recorded")) {
    return null;
  }

  // SUPPRESS: internal data-freshness telemetry
  if (severity === "info" && lower.includes("confirms zero")) {
    return null;
  }

  // SUPPRESS: baseline-period banner — handled by the onboarding welcome card
  if (severity === "info" && lower.includes("baseline period")) {
    return null;
  }

  // SUPPRESS: any banner that leaks an internal Slack channel reference
  if (lower.includes("#vini")) {
    return null;
  }

  // Otherwise render a calm, hairline-only notice (no background fill)
  const indicatorColor =
    severity === "warning" ? "bg-text-muted" : "bg-brand-primary";

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border-subtle bg-surface-card px-4 py-3 text-sm leading-relaxed text-text-primary">
      <span
        className={`mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${indicatorColor}`}
      />
      <div className="flex-1">
        <span>{message}</span>
        {deepLink ? (
          <a
            href={deepLink}
            onClick={(e) => e.preventDefault()}
            className="ml-2 text-[13px] font-semibold text-brand-primary underline hover:text-brand-primary-hover"
          >
            View
          </a>
        ) : null}
      </div>
    </div>
  );
}

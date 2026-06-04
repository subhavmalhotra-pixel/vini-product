import type { MonthlyData, Channel } from "@test-data";
import {
  BrandStrip,
  ByLocationCard,
  ConsoleCtaFooter,
  DealerReportShell,
  Glossary,
  SectionStatusHeader,
  StoryCard,
  TrendBarChart,
} from "../components/dealer-report/primitives";

type MonthlyProps = { data: MonthlyData };

const CHANNEL_LABEL: Record<Channel, string> = {
  call: "Voice",
  sms: "SMS",
  chat: "Chat",
  email: "Email",
  voice: "Voice",
};

/**
 * MonthlyValueReport · dealer-report design.
 *
 * Renders every MonthlyData field:
 *   - reporting_month · brand strip · section header
 *   - hero · 6 tiles (leads_interacted · conversations · appts · after-hours
 *     appts · routed calls · resolution_rate_pct)
 *   - kpi_grid · 6 cards
 *   - customer_centric · unique · new vs returning · avg touches · routed calls
 *   - multichannel_mix · channel share with MoM shift
 *   - stories · multiple AI-narrated journey cards
 *   - six_month_trend · monthly bar chart
 */
export function MonthlyValueReport({ data }: MonthlyProps) {
  // Status pill derived from resolution rate
  const status =
    data.hero.resolution_rate_pct >= 75
      ? "on-track"
      : data.hero.resolution_rate_pct >= 60
      ? "watch"
      : "off-track";

  return (
    <DealerReportShell>
      <BrandStrip
        dealerName={data.dealer.name}
        metaLine={`Vini · Monthly Value · ${data.reporting_month}`}
      />

      <SectionStatusHeader
        title={data.reporting_month}
        scope={`at ${data.dealer.name}`}
        status={status}
        date={data.reporting_month}
      />

      {/* Hero · 6 tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <HeroTile label="Leads interacted" value={data.hero.leads_interacted.toLocaleString()} />
        <HeroTile label="Conversations" value={data.hero.total_conversations.toLocaleString()} />
        <HeroTile label="Appointments" value={data.hero.appts_booked.toLocaleString()} tone="positive" />
        <HeroTile label="After-hours appts" value={data.hero.after_hours_booked.toLocaleString()} />
        <HeroTile label="Routed calls" value={data.hero.routed_calls.toLocaleString()} />
        <HeroTile
          label="Resolution rate"
          value={`${data.hero.resolution_rate_pct.toFixed(0)}%`}
          tone={
            data.hero.resolution_rate_pct >= 75
              ? "positive"
              : data.hero.resolution_rate_pct >= 60
              ? "neutral"
              : "negative"
          }
        />
      </div>

      {/* KPI grid · 6 cards from kpi_grid */}
      {data.kpi_grid && data.kpi_grid.length > 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Month at a glance
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.kpi_grid.map((c) => (
              <div
                key={c.label}
                className="rounded-lg border border-border-subtle bg-surface-background p-3"
              >
                <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  {c.label}
                </div>
                <div className="mt-1 text-[20px] font-bold tabular text-text-primary">
                  {c.unavailable ? "—" : c.primary_value}
                  {!c.unavailable && c.primary_unit ? (
                    <span className="text-[14px] font-semibold">{c.primary_unit}</span>
                  ) : null}
                </div>
                {c.delta !== undefined ? (
                  <div
                    className={`mt-0.5 text-[11px] font-medium tabular ${
                      c.delta > 0
                        ? "text-positive"
                        : c.delta < 0
                        ? "text-negative"
                        : "text-text-muted"
                    }`}
                  >
                    {c.delta > 0 ? "↑" : c.delta < 0 ? "↓" : "·"} {Math.abs(c.delta)}%{" "}
                    {c.delta_label ?? "MoM"}
                  </div>
                ) : null}
                {c.subtitle ? (
                  <div className="mt-0.5 text-[11px] text-text-muted">{c.subtitle}</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Customer-centric block */}
      <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Customer-centric · month
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CustomerStat
            label="Unique customers"
            value={data.customer_centric.unique.toLocaleString()}
          />
          <CustomerStat
            label="New customers"
            value={`${data.customer_centric.pct_new.toFixed(0)}%`}
            sub={`${data.customer_centric.pct_returning.toFixed(0)}% returning`}
          />
          <CustomerStat
            label="Avg touches"
            value={data.customer_centric.avg_touches.toFixed(1)}
            sub="per customer"
          />
          <CustomerStat
            label="Routed to human"
            value={data.customer_centric.routed_calls.toLocaleString()}
            sub="calls"
          />
        </div>
      </div>

      {/* Multichannel mix · per-channel share + MoM shift */}
      {data.multichannel_mix && data.multichannel_mix.length > 0 ? (
        <ByLocationCard
          title="Channel mix · share + MoM shift"
          rows={data.multichannel_mix.map((c) => ({
            name: CHANNEL_LABEL[c.channel] ?? c.channel,
            total: `${c.share_pct.toFixed(0)}%`,
            segments: [
              { value: c.share_pct, color: "info" as const },
              { value: 100 - c.share_pct, color: "positive" as const },
            ],
            rightPill: {
              label: `${c.mom_shift > 0 ? "+" : ""}${c.mom_shift.toFixed(1)}% MoM`,
              tone:
                c.mom_shift > 0
                  ? "on-track"
                  : c.mom_shift < 0
                  ? "watch"
                  : "neutral",
            },
          }))}
        />
      ) : null}

      {/* Six-month trend */}
      {data.six_month_trend && data.six_month_trend.length > 0 ? (
        <TrendBarChart
          eyebrow="6-month trend"
          title="Appointments per month"
          series={data.six_month_trend.map((m) => ({
            label: m.month,
            segments: [{ value: m.appts, color: "info" as const }],
          }))}
        />
      ) : null}

      {/* Stories · multiple */}
      {data.stories && data.stories.length > 0 ? (
        <div className="space-y-4">
          {data.stories
            .filter((s) => s.summary_source === "ai_haiku")
            .slice(0, 3)
            .map((s, i) => (
              <StoryCard
                key={i}
                badge={s.badge}
                summary={s.summary}
                intent={s.journey.intent}
                turnsCount={s.journey.turns.length}
                channelsUsed={s.journey.channels_used}
                outcomeChip={{
                  label: humanizeOutcome(s.journey.outcome),
                  tone:
                    s.journey.outcome === "appointment_booked" ||
                    s.journey.outcome === "warm_transfer" ||
                    s.journey.outcome === "follow_up"
                      ? "on-track"
                      : s.journey.outcome === "dnc" ||
                        s.journey.outcome === "opted_out" ||
                        s.journey.outcome === "lost"
                      ? "off-track"
                      : "neutral",
                }}
              />
            ))}
        </div>
      ) : null}

      <Glossary
        items={[
          {
            label: "Leads interacted",
            symbol: "*",
            description:
              "Unique customers Vini engaged with at least once during the month.",
            ideal: "Trending up MoM",
          },
          {
            label: "Resolution rate",
            symbol: "†",
            description:
              "Share of conversations Vini resolved without routing to a human.",
            ideal: "≥ 75%",
          },
          {
            label: "After-hours appts",
            symbol: "‡",
            description:
              "Appointments booked outside business hours. Pre-Vini these were voicemail.",
            ideal: "Trending up MoM",
          },
          {
            label: "MoM shift",
            symbol: "§",
            description:
              "Month-over-month change. Positive = channel growing in share.",
            ideal: "Channel-dependent",
          },
        ]}
      />

      <ConsoleCtaFooter
        message="Build the QBR deck."
        detail="Per-agent breakdown, top customers, and exportable charts"
        ctaLabel="Open console"
        href="/console/reporting"
      />
    </DealerReportShell>
  );
}

function HeroTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const valueClass =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
      ? "text-negative"
      : "text-text-primary";
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-4 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </div>
      <div className={`mt-1.5 text-[22px] font-bold tabular leading-tight ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}

function CustomerStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </div>
      <div className="mt-1 text-[18px] font-bold tabular text-text-primary">{value}</div>
      {sub ? <div className="mt-0.5 text-[11px] text-text-muted">{sub}</div> : null}
    </div>
  );
}

function humanizeOutcome(o: string): string {
  return o
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

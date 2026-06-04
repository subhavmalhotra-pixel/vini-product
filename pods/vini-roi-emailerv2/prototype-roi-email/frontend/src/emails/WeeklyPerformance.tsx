import type { WeeklyData, AgentType } from "@test-data";
import {
  AgentKpiStrip,
  BrandStrip,
  ConsoleCtaFooter,
  DealerReportShell,
  FunnelChart,
  Glossary,
  MultichannelTable,
  SectionStatusHeader,
  StoryCard,
  TopList,
  TrendBarChart,
} from "../components/dealer-report/primitives";

type WeeklyProps = { data: WeeklyData };

const AGENT_LABEL: Record<AgentType, string> = {
  sales_ib: "Sales · Inbound",
  sales_ob: "Sales · Outbound",
  service_ib: "Service · Inbound",
  service_ob: "Service · Outbound",
};

function formatRange(start: string, end: string): string {
  const s = parseDate(start);
  const e = parseDate(end);
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`;
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * WeeklyPerformance · dealer-report design.
 *
 * Renders every WeeklyData field:
 *   - reporting_period · brand strip · section header with status
 *   - agent_kpi_strips · per-agent KPI cards
 *   - day_by_day_trend · stacked-channel bar chart with appts line overlay
 *   - funnel · Unique → Engaged → Converted with drop-offs
 *   - channel_performance · per-channel table
 *   - top_vehicles · top_services
 *   - story · Story of the Week card
 */
export function WeeklyPerformance({ data }: WeeklyProps) {
  const period = formatRange(data.reporting_period.start, data.reporting_period.end);

  // Headline status — derived from the funnel conversion rate
  const conversionPct =
    data.funnel.engaged > 0
      ? (data.funnel.converted / data.funnel.engaged) * 100
      : 0;
  const headlineStatus =
    conversionPct >= 25 ? "on-track" : conversionPct >= 15 ? "watch" : "off-track";

  return (
    <DealerReportShell>
      <BrandStrip
        dealerName={data.dealer.name}
        metaLine={`Vini · Weekly Performance · ${period}`}
      />

      <SectionStatusHeader
        title="Last week"
        scope={`at ${data.dealer.name}`}
        status={headlineStatus}
        date={period}
      />

      {/* Agent KPI strips · one per agent in scope */}
      {data.agent_kpi_strips.map((strip) => (
        <AgentKpiStrip
          key={strip.agent}
          agentLabel={AGENT_LABEL[strip.agent]}
          cards={strip.cards.map((c) => ({
            label: c.label,
            value: c.primary_value,
            unit: c.primary_unit,
            sub: c.subtitle,
            delta:
              c.delta !== undefined
                ? `${c.delta > 0 ? "+" : ""}${c.delta}%`
                : undefined,
            deltaDirection:
              c.delta !== undefined && c.delta > 0
                ? "good"
                : c.delta !== undefined && c.delta < 0
                ? "bad"
                : "neutral",
            unavailable: c.unavailable,
          }))}
        />
      ))}

      {/* Day-by-day stacked trend with appointments overlay */}
      <TrendBarChart
        eyebrow="Weekly trend"
        title="Conversations by day · appts overlaid"
        series={data.day_by_day_trend.map((d) => ({
          label: d.day,
          segments: [
            { value: d.call, color: "info" as const },
            { value: d.sms, color: "warning" as const },
            { value: d.chat, color: "positive" as const },
          ],
        }))}
        appts={data.day_by_day_trend.map((d) => d.appts)}
        apptsLabel="Appts"
      />

      {/* Conversion funnel */}
      <FunnelChart
        eyebrow="Engagement funnel"
        title="Unique customers → Engaged → Converted"
        stages={[
          { label: "Unique customers", value: data.funnel.unique },
          { label: "Engaged", value: data.funnel.engaged },
          { label: "Converted (booked)", value: data.funnel.converted },
        ]}
      />

      {/* Funnel meta · new vs returning + touches + channels */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FunnelMetaCard
          label="New vs returning"
          value={`${data.funnel.new_vs_returning.new} · ${data.funnel.new_vs_returning.returning}`}
          sub="New customers · Returning"
        />
        <FunnelMetaCard
          label="Avg touches per customer"
          value={data.funnel.avg_touches.toFixed(1)}
          sub="Across the week"
        />
        <FunnelMetaCard
          label="Avg channels per customer"
          value={data.funnel.avg_channels.toFixed(1)}
          sub="Multi-channel index"
        />
      </div>

      {/* Channel performance table */}
      {data.channel_performance && data.channel_performance.length > 0 ? (
        <MultichannelTable
          rows={data.channel_performance.map((c) => ({
            channel: c.channel,
            conversations: c.conversations,
            engagementPct: c.engagement_pct,
            appts: c.appts,
          }))}
        />
      ) : null}

      {/* Top vehicles · top services */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TopList
          eyebrow="Sales"
          title="Top vehicles of interest"
          rows={(data.top_vehicles ?? []).slice(0, 7).map((v) => ({
            label: v.name,
            value: v.count,
          }))}
        />
        <TopList
          eyebrow="Service"
          title="Top service requests"
          rows={(data.top_services ?? []).slice(0, 7).map((s) => ({
            label: s.name,
            value: s.count,
          }))}
        />
      </div>

      {/* Story of the Week */}
      {data.story && data.story.summary_source === "ai_haiku" ? (
        <StoryCard
          badge={data.story.badge}
          summary={data.story.summary}
          intent={data.story.journey.intent}
          turnsCount={data.story.journey.turns.length}
          channelsUsed={data.story.journey.channels_used}
          outcomeChip={{
            label: humanizeOutcome(data.story.journey.outcome),
            tone:
              data.story.journey.outcome === "appointment_booked" ||
              data.story.journey.outcome === "warm_transfer" ||
              data.story.journey.outcome === "follow_up"
                ? "on-track"
                : data.story.journey.outcome === "dnc" ||
                  data.story.journey.outcome === "opted_out" ||
                  data.story.journey.outcome === "lost"
                ? "off-track"
                : "neutral",
          }}
        />
      ) : null}

      <Glossary
        items={[
          {
            label: "Engaged",
            symbol: "*",
            description:
              "Unique customers who replied to or interacted with Vini at least once this week.",
            ideal: "≥ 70% of unique customers",
          },
          {
            label: "Converted",
            symbol: "†",
            description:
              "Customers who booked an appointment or completed the outbound goal.",
            ideal: "≥ 25% of engaged",
          },
          {
            label: "Multi-channel index",
            symbol: "‡",
            description:
              "Average number of channels (voice / SMS / chat) used per customer.",
            ideal: "1.5+ over a week",
          },
          {
            label: "Story of the Week",
            symbol: "§",
            description:
              "AI-narrated example of a notable conversation. Source: Vini transcript + outcome.",
            ideal: "Used in QBRs, not for metrics",
          },
        ]}
      />

      <ConsoleCtaFooter
        message="Dig in by agent."
        detail="Per-rep stats, transcripts, and outliers"
        ctaLabel="Open console"
        href="/console/reporting"
      />
    </DealerReportShell>
  );
}

function FunnelMetaCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-4 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </div>
      <div className="mt-1.5 text-[20px] font-bold tabular text-text-primary">
        {value}
      </div>
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

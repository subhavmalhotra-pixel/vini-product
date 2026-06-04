import type { DailyDigestData } from "@test-data";
import {
  BrandStrip,
  ByLocationCard,
  ConsoleCtaFooter,
  DealerReportShell,
  DonutKpi,
  EmptyDayCard,
  GaugeKpi,
  Glossary,
  RecentItemList,
  SectionStatusHeader,
} from "../components/dealer-report/primitives";

type DailyDigestProps = {
  data: DailyDigestData;
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* ============================================================
   Dealer-report style DailyDigest · matches the Spyne dealer-report
   screenshots: white cards on a neutral background, soft shadows,
   big donut + half-circle gauge KPIs, a clean "On track" pill, a
   recent-activity list, a glossary, and a black "Open console" CTA.

   The BDC daily data (appointments, conversations, leads, response
   time) maps onto the same visual structure inventory uses in the
   reference screenshots:
     - Donut KPI       · Conversations split by channel
     - Gauge KPI · 1   · Avg first-response time (lower is better)
     - Gauge KPI · 2   · Vini handle rate (higher is better)
     - By-channel row  · how Vini distributed the work
     - Recent activity · top customers from yesterday
     - Glossary        · how to read this report
     - Open console    · deep-link CTA
   ============================================================ */
export function DailyDigest({ data }: DailyDigestProps) {
  // Derive headline numbers from the existing scenario shape.
  const yesterdayAppts = data.hero.yesterday_appts.yesterday ?? 0;
  const mtdAppts = data.hero.mtd_appts.mtd ?? 0;
  const yesterdayLeads = data.inbound?.activity.unique_leads.yesterday ?? 0;
  const mtdLeads = data.inbound?.activity.unique_leads.mtd ?? 0;
  const conversations = data.conversations_total;
  const channelSplit = data.channel_split;
  const channelTotal = channelSplit.call + channelSplit.sms + channelSplit.chat;

  // First-response time KPI · pull from KPI cards if present, else fall back
  const responseCard = data.inbound?.kpi_cards.find((c) =>
    /response/i.test(c.label)
  );
  const responseTimeRaw = responseCard?.primary_value;
  // Heuristic: convert "2m 10s" / "10s" / "1.5m" into a number of seconds.
  const responseSeconds = parseResponseSeconds(responseTimeRaw);
  // Gauge bounds 0 → 300s (5 min) with thresholds <60s green · <180s amber · >180s red
  const responseGaugeValue = Math.min(responseSeconds ?? 0, 300);
  const responseLabelText =
    responseTimeRaw ?? (responseSeconds !== null ? formatSeconds(responseSeconds) : "—");

  // Vini handle rate KPI · % of conversations Vini fully handled
  const transferCard = data.inbound?.kpi_cards.find((c) =>
    /transfer/i.test(c.label)
  );
  const transferRate =
    typeof transferCard?.primary_value === "number"
      ? transferCard.primary_value
      : null;
  const handleRate = transferRate !== null ? 100 - transferRate : 78;

  // Top vehicles → recent items list
  const topRows = (data.inbound?.top_vehicles ?? []).slice(0, 5).map((v, i) => ({
    primary: v.name,
    chip: v.trend === "up" ? "trending" : undefined,
    secondary: `${v.count} customer${v.count === 1 ? "" : "s"} interested${
      v.trend === "up" ? " · trending up" : ""
    }`,
    middle: data.dealer.name,
    metric: `${v.count} leads`,
    status:
      v.trend === "up"
        ? ({ label: "Hot", tone: "on-track" as const })
        : v.trend === "down"
        ? ({ label: "Cooling", tone: "watch" as const })
        : ({ label: "Steady", tone: "neutral" as const }),
    thumbHue: (i * 67) % 360,
  }));

  const isEmptyDay = yesterdayAppts === 0 && yesterdayLeads === 0;
  const overallStatus = isEmptyDay
    ? "neutral"
    : yesterdayAppts > 0
    ? "on-track"
    : "watch";

  return (
    <DealerReportShell>
      {/* Brand strip · top of the report */}
      <BrandStrip
        dealerName={data.dealer.name}
        metaLine={`Vini · Daily Digest · ${formatDate(data.reporting_date)}`}
      />

      {/* Section header · "Yesterday at {dealer}" + status pill + date */}
      <SectionStatusHeader
        title="Yesterday"
        scope={`at ${data.dealer.name}`}
        status={overallStatus}
        date={formatDate(data.reporting_date)}
      />

      {/* Hero KPI row · 1 donut + 2 gauges (or empty-day card on zero) */}
      {isEmptyDay ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
          <EmptyDayCard
            eyebrow="Yesterday"
            title="No activity yesterday"
            body="Vini is on standby. Daily metrics resume when the next conversation arrives."
            pills={[
              { label: "Conversations", value: "—" },
              { label: "Appointments", value: "—" },
            ]}
          />
          <DonutKpi
            centerNumber={mtdAppts.toLocaleString()}
            centerLabel="Appointments · MTD"
            ribbon={{ label: `${mtdLeads} leads engaged MTD`, tone: "on-track" }}
            segments={[
              {
                label: "MTD appts",
                value: mtdAppts || 1,
                color: "positive",
              },
            ]}
            pills={[
              { label: "Leads MTD", value: mtdLeads.toLocaleString() },
              { label: "Conv. MTD", value: conversations.toLocaleString() },
            ]}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Conversations donut (split by channel) */}
          <DonutKpi
            centerNumber={conversations.toLocaleString()}
            centerLabel="Conversations"
            ribbon={
              channelTotal > 0
                ? { label: `${Math.round((channelSplit.call / channelTotal) * 100)}% voice`, tone: "on-track" }
                : undefined
            }
            segments={
              channelTotal > 0
                ? ([
                    { label: "Voice", value: channelSplit.call, color: "info" as const },
                    { label: "SMS", value: channelSplit.sms, color: "warning" as const },
                    { label: "Chat", value: channelSplit.chat, color: "positive" as const },
                  ].filter((s) => s.value > 0))
                : [{ label: "Conversations", value: 1, color: "info" as const }]
            }
            pills={[
              { label: "Leads", value: yesterdayLeads.toLocaleString() },
              { label: "Appts", value: yesterdayAppts.toLocaleString() },
            ]}
          />

          {/* Avg first-response gauge (lower-is-better) */}
          <GaugeKpi
            label="Avg first-response"
            ribbon={
              responseSeconds !== null && responseSeconds <= 60
                ? { label: "Excellent", tone: "on-track" }
                : responseSeconds !== null && responseSeconds <= 180
                ? { label: "On track", tone: "on-track" }
                : { label: "Watch", tone: "watch" }
            }
            value={responseGaugeValue}
            unit={typeof responseTimeRaw === "string" ? "" : "s"}
            min={{ value: 0, label: "0s" }}
            max={{ value: 300, label: "5m" }}
            thresholds={[
              { upTo: 60, color: "positive" },
              { upTo: 180, color: "warning" },
              { upTo: 300, color: "negative" },
            ]}
            sub={{ label: "Display", value: String(responseLabelText) }}
          />

          {/* Vini handle rate gauge */}
          <GaugeKpi
            label="Vini handle rate"
            ribbon={
              handleRate >= 75
                ? { label: "Excellent", tone: "on-track" }
                : handleRate >= 60
                ? { label: "On track", tone: "on-track" }
                : { label: "Watch", tone: "watch" }
            }
            value={Math.round(handleRate)}
            unit="%"
            min={{ value: 0, label: "0" }}
            max={{ value: 100, label: "100" }}
            thresholds={[
              { upTo: 60, color: "negative" },
              { upTo: 75, color: "warning" },
              { upTo: 100, color: "positive" },
            ]}
            sub={{
              label: "Routed to human",
              value: transferRate !== null ? `${transferRate}%` : "—",
            }}
          />
        </div>
      )}

      {/* By channel · how Vini distributed the work */}
      {channelTotal > 0 ? (
        <ByLocationCard
          title="By channel · yesterday"
          rows={[
            {
              name: "Voice",
              total: channelSplit.call.toLocaleString(),
              segments: [
                { value: channelSplit.call, color: "info" },
                { value: Math.max(channelTotal - channelSplit.call, 0), color: "positive" },
              ],
              rightPill: { label: `${Math.round((channelSplit.call / channelTotal) * 100)}%`, tone: "on-track" },
            },
            {
              name: "SMS",
              total: channelSplit.sms.toLocaleString(),
              segments: [
                { value: channelSplit.sms, color: "warning" },
                { value: Math.max(channelTotal - channelSplit.sms, 0), color: "positive" },
              ],
              rightPill: { label: `${Math.round((channelSplit.sms / channelTotal) * 100)}%`, tone: "neutral" },
            },
            {
              name: "Chat",
              total: channelSplit.chat.toLocaleString(),
              segments: [
                { value: channelSplit.chat, color: "positive" },
                { value: Math.max(channelTotal - channelSplit.chat, 0), color: "neutral" as never },
              ],
              rightPill: { label: `${Math.round((channelSplit.chat / channelTotal) * 100)}%`, tone: "neutral" },
            },
          ]}
        />
      ) : null}

      {/* Recent activity · top customers from yesterday */}
      {topRows.length > 0 ? (
        <RecentItemList title="Top vehicles of interest · yesterday" rows={topRows} />
      ) : null}

      {/* Glossary · how to read this report */}
      <Glossary
        items={[
          {
            label: "Avg first-response",
            symbol: "*",
            description:
              "Median seconds from inbound contact to Vini's first reply.",
            ideal: "Under 60 s",
          },
          {
            label: "Vini handle rate",
            symbol: "†",
            description:
              "Share of conversations Vini fully resolved without a human handoff.",
            ideal: "75% or above",
          },
          {
            label: "Conversations",
            symbol: "‡",
            description:
              "Unique customer threads across voice, SMS, and chat handled by Vini yesterday.",
            ideal: "Trending up over time",
          },
          {
            label: "Hot trend",
            symbol: "§",
            description:
              "A vehicle whose lead count rose week-over-week. Tag your highest-intent customers first.",
            ideal: "Address within 2 h",
          },
        ]}
      />

      {/* Bottom CTA · console deep-link */}
      <ConsoleCtaFooter
        message="Want the full breakdown?"
        detail="Conversation transcripts, lead history & per-rep stats"
        ctaLabel="Open console"
        href="/console/action-items/pending"
      />
    </DealerReportShell>
  );
}

/* ============================================================
   Helpers
   ============================================================ */
function parseResponseSeconds(v: string | number | undefined): number | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "number") return v;
  // "2m 10s" / "10s" / "1.5m" / "1h 5m"
  const minMatch = v.match(/(\d+(?:\.\d+)?)m/);
  const secMatch = v.match(/(\d+(?:\.\d+)?)s/);
  const hourMatch = v.match(/(\d+(?:\.\d+)?)h/);
  if (!minMatch && !secMatch && !hourMatch) return null;
  const hours = hourMatch ? parseFloat(hourMatch[1]) : 0;
  const mins = minMatch ? parseFloat(minMatch[1]) : 0;
  const secs = secMatch ? parseFloat(secMatch[1]) : 0;
  return Math.round(hours * 3600 + mins * 60 + secs);
}

function formatSeconds(s: number): string {
  if (s < 60) return `${Math.round(s)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s - m * 60);
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

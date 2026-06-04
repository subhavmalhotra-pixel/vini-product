import type { DailyDigestData } from "@test-data";
import {
  ActionRequiredCard,
  AgentKpiStrip,
  BrandStrip,
  ByLocationCard,
  ConsoleCtaFooter,
  DealerReportShell,
  DonutKpi,
  EdgeBanner,
  EmptyDayCard,
  GaugeKpi,
  Glossary,
  OutboundCampaignsCard,
  RecentItemList,
  SectionStatusHeader,
  TopList,
} from "../components/dealer-report/primitives";

type DailyDigestProps = { data: DailyDigestData };

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

/**
 * DailyDigest · dealer-report design.
 *
 * Renders every field in the DailyDigestData schema:
 *   1.  Banners (edge cases)
 *   2.  Brand strip + section header
 *   3.  Hero KPIs (Conversations donut + 2 gauges) — or empty-day card
 *   4.  Inbound KPI strip (Appointments · Unique leads + sub-metrics)
 *   5.  After-hours + warm transfers
 *   6.  Top vehicles / Top service intents (variant by agent)
 *   7.  By-channel split
 *   8.  Outbound block (campaigns + KPIs)
 *   9.  Action Required
 *   10. Glossary + Open console CTA
 */
export function DailyDigest({ data }: DailyDigestProps) {
  const yesterdayAppts = data.hero.yesterday_appts.yesterday ?? 0;
  const mtdAppts = data.hero.mtd_appts.mtd ?? 0;
  const yesterdayLeads = data.inbound?.activity.unique_leads.yesterday ?? 0;
  const mtdLeads = data.inbound?.activity.unique_leads.mtd ?? 0;
  const conversations = data.conversations_total;
  const channelSplit = data.channel_split;
  const channelTotal = channelSplit.call + channelSplit.sms + channelSplit.chat;

  // First-response and Vini handle KPI cards (when present)
  const responseCard = data.inbound?.kpi_cards.find((c) =>
    /response/i.test(c.label)
  );
  const responseTimeRaw = responseCard?.primary_value;
  const responseSeconds = parseResponseSeconds(responseTimeRaw);
  const responseGaugeValue = Math.min(responseSeconds ?? 0, 300);
  const responseLabelText =
    responseTimeRaw !== undefined
      ? String(responseTimeRaw) + (responseCard?.primary_unit ?? "")
      : responseSeconds !== null
      ? formatSeconds(responseSeconds)
      : "—";

  const transferCard = data.inbound?.kpi_cards.find((c) =>
    /transfer/i.test(c.label)
  );
  const transferRate =
    typeof transferCard?.primary_value === "number"
      ? transferCard.primary_value
      : null;
  const handleRate = transferRate !== null ? Math.max(0, 100 - transferRate) : 78;

  // Top vehicles → recent items (visual hero)
  const topVehiclesRows = (data.inbound?.top_vehicles ?? []).slice(0, 5).map((v, i) => ({
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

  // Top service intents — used by Service IB scenarios
  const topIntentsRows = (data.inbound?.top_intents ?? []).map((it) => ({
    label: it.name,
    value: it.count,
    trend: it.trend,
  }));

  // Onboarding banner (Day 1–7)
  const isOnboarding = !!data.hero.show_onboarding_banner;

  // Overall status pill
  const isEmptyDay = yesterdayAppts === 0 && yesterdayLeads === 0;
  const overallStatus = isEmptyDay
    ? "neutral"
    : yesterdayAppts > 0
    ? "on-track"
    : "watch";

  // After-hours + warm transfers (always rendered when inbound data exists)
  const afterHours = data.inbound?.activity.after_hours;
  const warmTransfers = data.inbound?.activity.warm_transfers;

  return (
    <DealerReportShell>
      {/* Brand strip */}
      <BrandStrip
        dealerName={data.dealer.name}
        metaLine={`Vini · Daily Digest · ${formatDate(data.reporting_date)}`}
      />

      {/* Edge-case banners */}
      {data.banners && data.banners.length > 0 ? (
        <div className="space-y-2">
          {data.banners.map((banner, idx) => (
            <EdgeBanner
              key={idx}
              severity={banner.severity}
              message={banner.message}
              deepLink={banner.deep_link}
            />
          ))}
        </div>
      ) : null}

      {/* Onboarding banner */}
      {isOnboarding ? (
        <EdgeBanner
          severity="info"
          message={`Vini is live for you. ${mtdLeads} leads engaged since go-live. Your first weekly summary lands in 7 days.`}
        />
      ) : null}

      {/* Section header */}
      <SectionStatusHeader
        title="Yesterday"
        scope={`at ${data.dealer.name}`}
        status={overallStatus}
        date={formatDate(data.reporting_date)}
      />

      {/* Hero KPI row · donut + 2 gauges OR empty-day card */}
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
              { label: "MTD appts", value: Math.max(mtdAppts, 1), color: "positive" },
            ]}
            pills={[
              { label: "Leads MTD", value: mtdLeads.toLocaleString() },
              { label: "Conv. MTD", value: conversations.toLocaleString() },
            ]}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            sub={{ label: "Display", value: responseLabelText }}
          />

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

      {/* Inbound KPI strip (full schema) */}
      {data.inbound && data.inbound.kpi_cards.length > 0 ? (
        <AgentKpiStrip
          agentLabel="Inbound performance · yesterday"
          cards={data.inbound.kpi_cards.map((c) => ({
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
      ) : null}

      {/* After-hours + warm transfers */}
      {data.inbound && (afterHours || warmTransfers) ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {afterHours ? (
            <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                After-hours · yesterday
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-text-secondary">Leads engaged</div>
                  <div className="mt-0.5 text-[18px] font-bold tabular text-text-primary">
                    {afterHours.leads_engaged.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-text-secondary">Appts booked</div>
                  <div className="mt-0.5 text-[18px] font-bold tabular text-text-primary">
                    {afterHours.appts_booked.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {warmTransfers ? (
            <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Warm transfers
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-text-secondary">Yesterday</div>
                  <div className="mt-0.5 text-[18px] font-bold tabular text-text-primary">
                    {(warmTransfers.yesterday ?? 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-text-secondary">MTD</div>
                  <div className="mt-0.5 text-[18px] font-bold tabular text-text-primary">
                    {(warmTransfers.mtd ?? 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

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
                { value: Math.max(channelTotal - channelSplit.chat, 0), color: "positive" },
              ],
              rightPill: { label: `${Math.round((channelSplit.chat / channelTotal) * 100)}%`, tone: "neutral" },
            },
          ]}
        />
      ) : null}

      {/* Top vehicles · used by Sales IB scenarios */}
      {topVehiclesRows.length > 0 ? (
        <RecentItemList title="Top vehicles of interest · yesterday" rows={topVehiclesRows} />
      ) : null}

      {/* Top service intents · used by Service IB scenarios */}
      {topIntentsRows.length > 0 ? (
        <TopList
          eyebrow="Service IB"
          title="Top service intents · yesterday"
          rows={topIntentsRows}
        />
      ) : null}

      {/* Outbound block · used by Sales OB scenarios */}
      {data.outbound && data.outbound.show_block ? (
        <OutboundCampaignsCard
          reached={data.outbound.unique_reached.yesterday ?? 0}
          reachedMtd={data.outbound.unique_reached.mtd ?? 0}
          connectRate={
            data.outbound.connect_rate.unavailable
              ? null
              : data.outbound.connect_rate.yesterday ?? 0
          }
          apptsSet={data.outbound.appts_set.yesterday ?? 0}
          apptsSetMtd={data.outbound.appts_set.mtd ?? 0}
          campaigns={data.outbound.active_campaigns.map((c) => ({
            name: c.name,
            dials: c.dials,
            appts: c.appts,
            conversionPct: c.conversion_pct,
            status: c.status,
            pausedWarning: c.paused_warning,
          }))}
          audiencesExhausted={data.outbound.all_audiences_exhausted}
        />
      ) : null}

      {/* Action Required */}
      {data.action_required && data.action_required.length > 0 ? (
        <ActionRequiredCard
          items={data.action_required.map((i) => ({
            type: i.type,
            count: i.count,
            deepLink: i.deep_link,
          }))}
        />
      ) : null}

      {/* Glossary */}
      <Glossary
        items={[
          {
            label: "Avg first-response",
            symbol: "*",
            description: "Median seconds from inbound contact to Vini's first reply.",
            ideal: "Under 60 s",
          },
          {
            label: "Vini handle rate",
            symbol: "†",
            description: "Share of conversations Vini fully resolved without a human handoff.",
            ideal: "75% or above",
          },
          {
            label: "Warm transfer",
            symbol: "‡",
            description: "Vini brings a live customer to the advisor on the same call with full context.",
            ideal: "Pickup within 30 s",
          },
          {
            label: "After-hours capture",
            symbol: "§",
            description: "Calls and chats Vini handled outside business hours · would have gone to voicemail pre-Vini.",
            ideal: "Trending up over time",
          },
        ]}
      />

      {/* Footer · console deep-link CTA */}
      <ConsoleCtaFooter
        message="Want the full breakdown?"
        detail="Conversation transcripts, lead history & per-rep stats"
        ctaLabel="Open console"
        href="/console/action-items/pending"
      />
    </DealerReportShell>
  );
}

function parseResponseSeconds(v: string | number | undefined): number | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "number") return v;
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

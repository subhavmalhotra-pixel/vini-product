import type { EOCData } from "@test-data";
import {
  BrandStrip,
  ConsoleCtaFooter,
  DealerReportShell,
  FunnelChart,
  Glossary,
  MultichannelTable,
  OutcomeDonut,
  SectionStatusHeader,
  TopList,
  TouchpointTable,
} from "../components/dealer-report/primitives";

type EOCProps = { data: EOCData };

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * EndOfCampaignReport · dealer-report design.
 *
 * Renders every EOCData field:
 *   - campaign meta · brand strip · section header
 *   - headline (appts · contactable · conversion % · opt-in booked %)
 *   - conversion_funnel · Reached → Contacted → Appts → ABR%
 *   - per_touchpoint · attribution table
 *   - multichannel · per-channel performance table
 *   - outcome_distribution · donut
 *   - top_objections · bar list
 *   - value_estimate_appendix (optional)
 */
export function EndOfCampaignReport({ data }: EOCProps) {
  const range = `${formatDate(data.campaign.start_date)} – ${formatDate(data.campaign.end_date)}`;

  const status =
    data.headline.conversion_pct >= 8
      ? "on-track"
      : data.headline.conversion_pct >= 4
      ? "watch"
      : "off-track";

  return (
    <DealerReportShell>
      <BrandStrip
        dealerName={data.dealer.name}
        metaLine={`Vini · End-of-Campaign · ${range}`}
      />

      <SectionStatusHeader
        title={data.campaign.name}
        scope="campaign closed"
        status={status}
        date={range}
      />

      {/* Campaign meta · 4 hero tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <HeroTile label="Appointments" value={data.headline.appts.toLocaleString()} tone="positive" />
        <HeroTile label="Contactable" value={data.headline.contactable.toLocaleString()} />
        <HeroTile
          label="Conversion"
          value={`${data.headline.conversion_pct.toFixed(2)}%`}
          tone={
            data.headline.conversion_pct >= 8
              ? "positive"
              : data.headline.conversion_pct >= 4
              ? "neutral"
              : "negative"
          }
        />
        <HeroTile
          label="Opt-in → booked"
          value={`${data.headline.opt_in_booked_pct.toFixed(1)}%`}
        />
      </div>

      {/* Campaign details · audience + outreach mix */}
      <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Campaign details
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CustomerStat label="Audience size" value={data.campaign.audience_size.toLocaleString()} />
          <CustomerStat label="Contactable" value={data.campaign.contactable.toLocaleString()} />
          <CustomerStat label="Opted out" value={data.campaign.opted_out.toLocaleString()} />
          <CustomerStat label="Sends" value={data.campaign.sends.toLocaleString()} />
          <CustomerStat label="Dials" value={data.campaign.dials.toLocaleString()} />
          <CustomerStat label="Messages" value={data.campaign.messages.toLocaleString()} />
          <CustomerStat label="Start" value={formatDate(data.campaign.start_date)} />
          <CustomerStat label="End" value={formatDate(data.campaign.end_date)} />
        </div>
      </div>

      {/* Conversion funnel */}
      <FunnelChart
        eyebrow="Conversion funnel"
        title={`Reached → Contacted → Appointments · ABR ${data.conversion_funnel.abr_pct.toFixed(1)}%`}
        stages={[
          { label: "Reached leads", value: data.conversion_funnel.reached_leads },
          { label: "Contacted", value: data.conversion_funnel.contacted },
          { label: "Appointments", value: data.conversion_funnel.appointments },
        ]}
      />

      {/* Multichannel performance */}
      {data.multichannel && data.multichannel.length > 0 ? (
        <MultichannelTable
          title="Per-channel performance"
          rows={data.multichannel.map((c) => ({
            channel: c.channel,
            conversations: c.conversations,
            engagementPct: c.engagement_pct,
            appts: c.appts,
          }))}
        />
      ) : null}

      {/* Per-touchpoint attribution */}
      {data.per_touchpoint && data.per_touchpoint.length > 0 ? (
        <TouchpointTable
          rows={data.per_touchpoint.map((r) => ({
            touchpoint: r.touchpoint,
            firstTouchPct: r.first_touch_appt_pct,
            lastTouchPct: r.last_touch_appt_pct,
          }))}
        />
      ) : null}

      {/* Outcome distribution donut */}
      {data.outcome_distribution && data.outcome_distribution.length > 0 ? (
        <OutcomeDonut outcomes={data.outcome_distribution} />
      ) : null}

      {/* Top objections */}
      {data.top_objections && data.top_objections.length > 0 ? (
        <TopList
          eyebrow="Customer feedback"
          title="Top objections"
          rows={data.top_objections.slice(0, 7).map((o) => ({
            label: o.objection,
            value: o.count,
          }))}
        />
      ) : null}

      {/* Value estimate appendix */}
      {data.value_estimate_appendix ? (
        <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Value estimate · appendix
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <CustomerStat
              label="Appointments"
              value={data.value_estimate_appendix.appts.toLocaleString()}
            />
            <CustomerStat
              label="Avg appt value"
              value={`$${data.value_estimate_appendix.avg_appointment_value.toLocaleString()}`}
            />
            <CustomerStat
              label="Influenced revenue"
              value={`$${data.value_estimate_appendix.influenced_amount.toLocaleString()}`}
              sub="Directional · directional only"
            />
          </div>
        </div>
      ) : null}

      <Glossary
        items={[
          {
            label: "ABR",
            symbol: "*",
            description:
              "Appointment Booking Rate · % of contacted customers who booked an appointment.",
            ideal: "≥ 8% on retention campaigns",
          },
          {
            label: "First-touch %",
            symbol: "†",
            description:
              "Share of appointments where this touchpoint was the customer's first contact.",
            ideal: "Channel-dependent",
          },
          {
            label: "Last-touch %",
            symbol: "‡",
            description:
              "Share of appointments where this touchpoint immediately preceded the booking.",
            ideal: "Channel-dependent",
          },
          {
            label: "Influenced revenue",
            symbol: "§",
            description:
              "Directional · appointments × avg appointment value. Does not account for close rate.",
            ideal: "Used for QBR sizing only",
          },
        ]}
      />

      <ConsoleCtaFooter
        message="Rinse and improve."
        detail="Customer lists, transcripts, and next-campaign suggestions"
        ctaLabel="Open console"
        href="/console/campaigns"
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

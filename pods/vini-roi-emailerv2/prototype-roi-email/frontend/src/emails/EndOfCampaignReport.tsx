import type { EOCData } from "@test-data";
import { EmailShell } from "../components/EmailShell";
import { CTAButton } from "../components/CTAButton";
import { EdgeCaseBanner } from "../components/EdgeCaseBanner";

type EndOfCampaignReportProps = {
  data: EOCData;
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const OUTCOME_LABEL: Record<string, string> = {
  appointment_booked: "Appointment booked",
  warm_transfer: "Warm transfer",
  follow_up: "Follow-up scheduled",
  no_response: "No response",
  opted_out: "Opted out",
  dnc: "Do-not-call",
  lost: "Lost",
};

export function EndOfCampaignReport({ data }: EndOfCampaignReportProps) {
  // v4: `recommendations` removed (§9.4). The "all audiences exhausted" banner
  // is now keyed off the campaign meta (audience_size === sends + opted_out is
  // a reasonable signal) — or off the scenario id for the prototype.
  const audiencesExhausted = data.scenario_id?.includes("exhausted");

  return (
    <EmailShell
      dealerName={data.dealer.name}
      emailTitle="End-of-Campaign Report"
      dateRange={`${formatDate(data.campaign.start_date)} – ${formatDate(
        data.campaign.end_date
      )}`}
      reportingPeriod={`${formatDate(data.campaign.start_date)} – ${formatDate(
        data.campaign.end_date
      )}`}
    >
      {/* v5 — top hero campaign summary (4-stat headline grid) removed.
            Campaign title + edge banner stay (lightweight title block);
            the Conversion funnel below is now the visual headline. */}
      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-brand-primary">
          Campaign
        </div>
        <h2 className="mt-1 text-lg font-semibold leading-tight text-text-primary sm:text-xl">
          {data.campaign.name}
        </h2>

        {audiencesExhausted ? (
          <div className="mt-4">
            <EdgeCaseBanner
              severity="info"
              message="All outreach audiences have been exhausted. Upload a new contactable list before the next campaign cycle."
            />
          </div>
        ) : null}

        {/* Conversion funnel — promoted to top-of-fold as the new primary
              headline (v5). Steps: Reached leads → Contacted → Appointments → ABR%. */}
        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Conversion funnel
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FunnelStep
              label="Reached leads"
              value={data.conversion_funnel.reached_leads}
            />
            <FunnelStep
              label="Contacted"
              value={data.conversion_funnel.contacted}
            />
            <FunnelStep
              label="Appointments"
              value={data.conversion_funnel.appointments}
              accent
            />
            <FunnelStep
              label="ABR"
              value={`${data.conversion_funnel.abr_pct.toFixed(1)}%`}
              accent
            />
          </div>
        </div>

        <div className="mt-6">
          <CTAButton
            label="Open campaign analytics"
            href={`/console/campaigns/${data.campaign.id}`}
          />
        </div>
      </section>

      {/* Per-touchpoint */}
      <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          First-touch vs last-touch attribution
        </h2>
        <div className="-mx-4 mt-3 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                <th className="sticky left-0 bg-surface-card px-4 py-1.5 sm:px-0 sm:pr-3">
                  Touchpoint
                </th>
                <th className="py-1.5 pr-3 text-right">First-touch %</th>
                <th className="py-1.5 pr-4 text-right sm:pr-0">Last-touch %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {data.per_touchpoint.map((t) => (
                <tr key={t.touchpoint}>
                  <td className="sticky left-0 bg-surface-card px-4 py-2 text-text-primary sm:px-0 sm:pr-3">
                    {t.touchpoint}
                  </td>
                  <td className="py-2 pr-3 text-right tabular text-text-primary">
                    {t.first_touch_appt_pct}%
                  </td>
                  <td className="py-2 pr-4 text-right font-semibold tabular text-text-primary sm:pr-0">
                    {t.last_touch_appt_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Multichannel */}
      <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Multichannel performance
        </h2>
        <div className="-mx-4 mt-3 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                <th className="sticky left-0 bg-surface-card px-4 py-1.5 sm:px-0 sm:pr-3">
                  Channel
                </th>
                <th className="py-1.5 pr-3 text-right">Conversations</th>
                <th className="py-1.5 pr-3 text-right">Engagement</th>
                <th className="py-1.5 pr-4 text-right sm:pr-0">Appts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {data.multichannel.map((c) => (
                <tr key={c.channel}>
                  <td className="sticky left-0 bg-surface-card px-4 py-2 capitalize text-text-primary sm:px-0 sm:pr-3">
                    {c.channel}
                  </td>
                  <td className="py-2 pr-3 text-right tabular text-text-primary">
                    {c.conversations.toLocaleString()}
                  </td>
                  <td className="py-2 pr-3 text-right tabular text-text-primary">
                    {c.engagement_pct}%
                  </td>
                  <td className="py-2 pr-4 text-right font-semibold tabular text-text-primary sm:pr-0">
                    {c.appts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Outcome distribution */}
      <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Outcome distribution
        </h2>
        <ul className="mt-3 space-y-3">
          {data.outcome_distribution.map((o) => (
            <li key={o.outcome} className="flex items-center gap-2 text-sm sm:gap-3">
              <span className="w-32 shrink-0 truncate text-text-primary sm:w-44">
                {OUTCOME_LABEL[o.outcome] ?? o.outcome}
              </span>
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-surface-background">
                  <div
                    className="h-2 rounded-full bg-brand-primary"
                    style={{ width: `${Math.min(100, o.pct)}%` }}
                  />
                </div>
              </div>
              <span className="w-12 text-right font-semibold tabular text-text-primary sm:w-16">
                {o.count.toLocaleString()}
              </span>
              <span className="hidden w-12 text-right text-xs tabular text-text-secondary sm:inline">
                {o.pct.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Top exit intents — v4 keeps the data shape, label updated.
            "Conversion by vehicle / service" and "Recommendations" sections
            removed per §9.4. */}
      <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Top exit intents
        </h2>
        <ul className="mt-3 divide-y divide-border-subtle rounded-md border border-border-subtle">
          {data.top_objections.map((o) => (
            <li
              key={o.objection}
              className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm"
            >
              <span className="truncate text-text-primary">{o.objection}</span>
              <span className="ml-2 font-semibold tabular text-text-primary">
                {o.count}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Optional value estimate appendix */}
      {data.value_estimate_appendix ? (
        <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Value estimate (appendix)
          </h2>
          <div className="mt-3 rounded-lg border border-border-subtle bg-surface-background p-5">
            <div className="text-2xl font-bold leading-tight tabular text-text-primary sm:text-3xl">
              ${data.value_estimate_appendix.influenced_amount.toLocaleString()}
            </div>
            <div className="mt-1 text-xs leading-relaxed text-text-secondary tabular">
              {data.value_estimate_appendix.appts} appts × $
              {data.value_estimate_appendix.avg_appointment_value} avg
              appointment value
            </div>
            <div className="mt-2 text-[11px] leading-relaxed text-text-muted">
              Based on your configured average appointment value.
            </div>
          </div>
        </section>
      ) : null}
    </EmailShell>
  );
}

function FunnelStep({
  label,
  value,
  muted,
  accent,
}: {
  label: string;
  value: number | string;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
        {label}
      </div>
      <div
        className={`mt-1.5 text-2xl font-bold leading-tight tabular sm:text-3xl ${
          muted
            ? "text-text-muted"
            : accent
              ? "text-brand-primary"
              : "text-text-primary"
        }`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

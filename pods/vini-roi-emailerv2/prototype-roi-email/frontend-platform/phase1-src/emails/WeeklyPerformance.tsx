import type { AgentType, WeeklyData } from "@test-data";
import { EmailShell } from "../components/EmailShell";
import { CTAButton } from "../components/CTAButton";
import { KPICardView } from "../components/KPICard";
import { StoryBlock } from "../components/StoryBlock";

const AGENT_LABEL: Record<AgentType, string> = {
  sales_ib: "Sales · Inbound",
  sales_ob: "Sales · Outbound",
  service_ib: "Service · Inbound",
  service_ob: "Service · Outbound",
};

function formatRange(start: string, end: string): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

type WeeklyPerformanceProps = {
  data: WeeklyData;
};

export function WeeklyPerformance({ data }: WeeklyPerformanceProps) {
  return (
    <EmailShell
      dealerName={data.dealer.name}
      emailTitle="Weekly Performance"
      dateRange={formatRange(data.reporting_period.start, data.reporting_period.end)}
      reportingPeriod={formatRange(
        data.reporting_period.start,
        data.reporting_period.end
      )}
    >
      {/* v3: "Week at a glance" removed — the per-agent KPI strips below already
          surface the same headline figures (unique/engaged/converted) per agent,
          making the aggregate funnel redundant. Top CTA preserved here. */}
      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Performance by agent
        </h2>
        <div className="mt-3 space-y-4">
          {data.agent_kpi_strips.map((strip) => (
            <div
              key={strip.agent}
              className="rounded-lg border border-border-subtle bg-surface-background p-3 sm:p-4"
            >
              <div className="px-1 pb-3 text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                {AGENT_LABEL[strip.agent]}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {strip.cards.map((card, idx) => (
                  <KPICardView key={idx} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <CTAButton
            label="Open weekly performance dashboard"
            href="/console/reports/weekly"
          />
        </div>
      </section>

      {/* Day-by-day trend */}
      <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Day-by-day activity
        </h2>
        <div className="-mx-4 mt-3 overflow-x-auto sm:mx-0">
          <DayByDayTable rows={data.day_by_day_trend} />
        </div>
      </section>

      {/* Channel performance */}
      {data.channel_performance && data.channel_performance.length > 0 ? (
        <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Channel performance
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
                {data.channel_performance.map((c) => (
                  <tr key={c.channel}>
                    <td className="sticky left-0 bg-surface-card px-4 py-2 capitalize text-text-primary sm:px-0 sm:pr-3">
                      {c.channel}
                    </td>
                    <td className="py-2 pr-3 text-right tabular text-text-primary">
                      {c.conversations}
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
      ) : null}

      {/* Top vehicles / services */}
      {data.top_vehicles && data.top_vehicles.length > 0 ? (
        <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Top vehicles of interest
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {data.top_vehicles.map((v) => (
              <li
                key={v.name}
                className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-card px-3 py-2.5 text-sm"
              >
                <span className="truncate text-text-primary">{v.name}</span>
                <span className="font-semibold tabular text-text-primary">{v.count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.top_services && data.top_services.length > 0 ? (
        <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Top service intents
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {data.top_services.map((v) => (
              <li
                key={v.name}
                className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-card px-3 py-2.5 text-sm"
              >
                <span className="truncate text-text-primary">{v.name}</span>
                <span className="font-semibold tabular text-text-primary">{v.count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Story of the week — silently absent when AI summary unavailable */}
      {data.story ? <StoryBlock story={data.story} title="Story of the week" /> : null}
    </EmailShell>
  );
}

function DayByDayTable({
  rows,
}: {
  rows: Array<{
    day: string;
    call: number;
    sms: number;
    chat: number;
    total: number;
    appts: number;
  }>;
}) {
  const maxTotal = Math.max(1, ...rows.map((r) => r.total));
  return (
    <table className="w-full min-w-[640px] text-sm">
      <thead>
        <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          <th className="sticky left-0 w-16 bg-surface-card px-4 py-1.5 sm:px-0 sm:pr-2">
            Day
          </th>
          <th className="py-1.5 pr-2 text-right">Call</th>
          <th className="py-1.5 pr-2 text-right">SMS</th>
          <th className="py-1.5 pr-2 text-right">Chat</th>
          <th className="py-1.5 pr-3 text-right">Total</th>
          <th className="py-1.5">Volume</th>
          <th className="py-1.5 pl-3 pr-4 text-right sm:pr-0">Appts</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-subtle">
        {rows.map((r) => (
          <tr key={r.day}>
            <td className="sticky left-0 bg-surface-card px-4 py-2 font-medium text-text-primary sm:px-0 sm:pr-2">
              {r.day}
            </td>
            <td className="py-2 pr-2 text-right tabular text-text-primary">{r.call}</td>
            <td className="py-2 pr-2 text-right tabular text-text-primary">{r.sms}</td>
            <td className="py-2 pr-2 text-right tabular text-text-primary">{r.chat}</td>
            <td className="py-2 pr-3 text-right font-semibold tabular text-text-primary">
              {r.total}
            </td>
            <td className="py-2">
              <div className="h-2 w-full rounded-full bg-surface-background">
                <div
                  className="h-2 rounded-full bg-brand-primary"
                  style={{ width: `${(r.total / maxTotal) * 100}%` }}
                />
              </div>
            </td>
            <td className="py-2 pl-3 pr-4 text-right font-semibold tabular text-text-primary sm:pr-0">
              {r.appts}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

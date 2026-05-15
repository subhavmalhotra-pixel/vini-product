import type { MonthlyData } from "@test-data";
import { EmailShell } from "../components/EmailShell";
import { CTAButton } from "../components/CTAButton";
import { KPICardView } from "../components/KPICard";
import { StoryBlock } from "../components/StoryBlock";

type MonthlyValueReportProps = {
  data: MonthlyData;
};

export function MonthlyValueReport({ data }: MonthlyValueReportProps) {
  const trendMax = Math.max(1, ...data.six_month_trend.map((t) => t.appts));
  const renderableStories = data.stories.filter(
    (s) => s.summary_source !== "fallback_omit" && !!s.summary
  );

  return (
    <EmailShell
      dealerName={data.dealer.name}
      emailTitle="Monthly Value Report"
      dateRange={data.reporting_month}
      reportingPeriod={data.reporting_month}
      bdcHoursEquivalent={data.hero.bdc_hours_equivalent}
    >
      {/* Hero headline */}
      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <p className="text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
          {data.hero.headline}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <HeroStat label="Unique customers" value={data.hero.unique_customers} />
          <HeroStat label="Conversations" value={data.hero.total_conversations} />
          <HeroStat
            label="Agent-hours equivalent"
            value={`${data.hero.bdc_hours_equivalent}h`}
          />
          <HeroStat
            label="Appointments booked"
            value={data.hero.appts_booked}
            accent
          />
          <HeroStat label="Lapsed re-engaged" value={data.hero.lapsed_reengaged} />
          <HeroStat
            label="After-hours booked"
            value={data.hero.after_hours_booked}
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <CTAButton
            label="Open monthly value dashboard"
            href="/console/reports/monthly"
          />
          <CTAButton
            label="Download PDF"
            href="/console/reports/monthly?format=pdf"
            variant="secondary"
          />
        </div>
      </section>

      {/* KPI grid + optional value sidebar */}
      <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Month-over-month KPIs
        </h2>
        <div
          className={`mt-3 grid gap-4 ${
            data.value_estimate_sidebar
              ? "grid-cols-1 lg:grid-cols-[1fr_240px]"
              : "grid-cols-1"
          }`}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.kpi_grid.map((card, idx) => (
              <KPICardView key={idx} card={card} />
            ))}
          </div>
          {data.value_estimate_sidebar ? (
            <aside className="rounded-lg border border-border-subtle bg-surface-background p-5">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                Your value estimate
              </div>
              <div className="mt-2 text-2xl font-bold leading-tight tabular text-text-primary sm:text-3xl">
                ${data.value_estimate_sidebar.influenced_amount.toLocaleString()}
              </div>
              <div className="mt-1 text-xs leading-relaxed text-text-secondary tabular">
                {data.value_estimate_sidebar.appts} appts × $
                {data.value_estimate_sidebar.avg_appointment_value} avg
                appointment value
              </div>
              <div className="mt-3 text-[11px] leading-relaxed text-text-muted">
                Based on your configured average appointment value.
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      {/* Customer-centric block */}
      <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Customers handled
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border-subtle bg-surface-card p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              Unique customers
            </div>
            <div className="mt-1.5 text-2xl font-bold leading-tight tabular text-text-primary sm:text-3xl">
              {data.customer_centric.unique.toLocaleString()}
            </div>
            <div className="mt-1 text-xs leading-relaxed text-text-secondary tabular">
              {data.customer_centric.pct_new}% new ·{" "}
              {data.customer_centric.pct_returning}% returning
            </div>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-card p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              Avg touches per customer
            </div>
            <div className="mt-1.5 text-2xl font-bold leading-tight tabular text-text-primary sm:text-3xl">
              {data.customer_centric.avg_touches}
            </div>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-card p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              Lapsed re-engaged
            </div>
            <div className="mt-1.5 text-2xl font-bold leading-tight tabular text-text-primary sm:text-3xl">
              {data.customer_centric.lapsed_reengaged}
            </div>
          </div>
        </div>
      </section>

      {/* Multichannel mix */}
      <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Multichannel mix
        </h2>
        <ul className="mt-3 space-y-3">
          {data.multichannel_mix.map((m) => {
            const shift = m.mom_shift;
            const material = Math.abs(shift) >= 3;
            const shiftColor = !material
              ? "text-text-muted"
              : shift > 0
              ? "text-positive"
              : "text-negative";
            return (
              <li
                key={m.channel}
                className="flex items-center gap-2 text-sm sm:gap-3"
              >
                <span className="w-14 shrink-0 capitalize text-text-primary sm:w-16">
                  {m.channel}
                </span>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-surface-background">
                    <div
                      className="h-2 rounded-full bg-brand-primary"
                      style={{ width: `${m.share_pct}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 text-right font-semibold tabular text-text-primary sm:w-12">
                  {m.share_pct}%
                </span>
                <span
                  className={`w-12 text-right text-xs font-semibold tabular sm:w-16 ${shiftColor}`}
                >
                  {shift > 0 ? "+" : ""}
                  {shift.toFixed(1)}%
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Stories */}
      {renderableStories.length > 0 ? (
        <>
          {renderableStories.map((s, idx) => (
            <StoryBlock
              key={s.journey.journey_id + idx}
              story={s}
              title={idx === 0 ? "Stories of the month" : ""}
            />
          ))}
        </>
      ) : null}

      {/* Six-month trend */}
      <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Six-month trend
        </h2>
        <div className="-mx-4 mt-5 overflow-x-auto sm:mx-0">
          <div className="flex min-w-[480px] items-end justify-between gap-2 px-4 sm:px-0">
            {data.six_month_trend.map((t) => (
              <div key={t.month} className="flex flex-1 flex-col items-center">
                <div className="text-xs font-semibold tabular text-text-primary">
                  {t.appts}
                </div>
                <div
                  className="mt-1 w-full rounded-t-md bg-brand-primary"
                  style={{ height: `${(t.appts / trendMax) * 100}px` }}
                />
                <div className="mt-2 text-[11px] uppercase tracking-wide text-text-secondary">
                  {t.month}
                </div>
                {t.store_total !== undefined ? (
                  <div className="text-[10px] tabular text-text-muted">
                    store · {t.store_total}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </EmailShell>
  );
}

function HeroStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-background p-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
        {label}
      </div>
      <div
        className={`mt-1.5 text-xl font-bold leading-tight tabular sm:text-2xl ${
          accent ? "text-brand-primary" : "text-text-primary"
        }`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

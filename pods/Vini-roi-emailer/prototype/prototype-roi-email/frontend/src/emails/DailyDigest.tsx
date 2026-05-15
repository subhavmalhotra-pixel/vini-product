import type { DailyDigestData } from "@test-data";
import { EmailShell } from "../components/EmailShell";
import { CTAButton } from "../components/CTAButton";
import { KPICardView } from "../components/KPICard";
import { MetricValueDisplay } from "../components/MetricValueDisplay";
import { ChannelSplitBar } from "../components/ChannelSplitBar";
import { ActionRequiredSection } from "../components/ActionRequiredSection";
import { EdgeCaseBanner } from "../components/EdgeCaseBanner";

type DailyDigestProps = {
  data: DailyDigestData;
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function DailyDigest({ data }: DailyDigestProps) {
  const yesterday = data.hero.yesterday_appts.yesterday ?? 0;
  const mtd = data.hero.yesterday_appts.mtd ?? data.hero.mtd_appts.mtd ?? 0;
  const isZeroYesterday = yesterday === 0;
  const isOnboarding = !!data.hero.show_onboarding_banner;
  // v2: Day 1–7 — show leads-only hero until the first appointment is booked.
  const onboardingFirstBooking = isOnboarding && (yesterday > 0 || mtd > 0);
  const onboardingLeadsToday =
    data.inbound?.activity.unique_leads.yesterday ?? 0;
  const onboardingLeadsSinceGoLive =
    data.inbound?.activity.unique_leads.mtd ?? 0;
  // v2: hide channel-split bar when every channel is zero (e.g. Service IB).
  const heroChannelSplit = data.channel_split;
  const heroChannelHasData =
    heroChannelSplit.call + heroChannelSplit.sms + heroChannelSplit.chat > 0;

  return (
    <EmailShell
      dealerName={data.dealer.name}
      emailTitle="Daily Digest"
      dateRange={formatDate(data.reporting_date)}
      bdcHoursEquivalent={data.footer.bdc_hours_equivalent}
      reportingPeriod={data.footer.reporting_period}
      nextSend={data.footer.next_send}
    >
      {/* Banners — filtered for client-facing copy */}
      {data.banners && data.banners.length > 0 ? (
        <div className="space-y-2 px-4 pt-5 sm:px-6 lg:px-10">
          {data.banners.map((banner, idx) => (
            <EdgeCaseBanner
              key={idx}
              severity={banner.severity}
              message={banner.message}
              deepLink={banner.deep_link}
            />
          ))}
        </div>
      ) : null}

      {/* Hero or Onboarding card */}
      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        {isOnboarding && onboardingFirstBooking ? (
          // v2: first appointment celebration tile
          <div className="rounded-lg border border-positive/30 bg-positive/5 p-4 sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-positive">
              First appointment booked
            </div>
            <div className="mt-2 text-lg font-semibold leading-tight text-text-primary">
              Well done — Vini just landed its first booking for you.
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Your first weekly performance summary still arrives{" "}
              {addDaysISO(data.dealer.go_live_date, 7)}.
            </p>
          </div>
        ) : isOnboarding ? (
          // v2: Day 1–7 leads-only hero — no appointment number, forward-looking
          <div className="rounded-lg border border-border-subtle bg-surface-background p-4 sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-brand-primary">
              Vini is live for you
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
              <MetricValueDisplay value={onboardingLeadsToday} size="hero" />
              <span className="text-sm text-text-secondary">
                leads engaged yesterday
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {onboardingLeadsSinceGoLive} leads engaged since go-live. Your
              first weekly summary arrives{" "}
              {addDaysISO(data.dealer.go_live_date, 7)}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border-subtle bg-surface-background p-4 sm:p-6">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                Appointments yesterday
              </div>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <MetricValueDisplay
                  value={yesterday}
                  size="hero"
                  tone={isZeroYesterday ? "neutral-zero" : "default"}
                />
                {mtd > 0 ? (
                  <span className="tabular text-xs text-text-secondary">
                    +{mtd} month to date
                  </span>
                ) : null}
              </div>
              {/* v2: 'Xh of agent effort equivalent' line removed */}
            </div>
            <div className="rounded-lg border border-border-subtle bg-surface-background p-4 sm:p-6">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                Conversations handled
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <MetricValueDisplay
                  value={data.conversations_total}
                  size="hero"
                  tone={data.conversations_total === 0 ? "neutral-zero" : "default"}
                />
              </div>
              {heroChannelHasData ? (
                <div className="mt-4">
                  <ChannelSplitBar data={data.channel_split} />
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <CTAButton
            label="View today's appointments"
            href="/console/appointments?date=today"
          />
          <CTAButton
            label="Open conversation inbox"
            href="/console/inbox"
            variant="secondary"
          />
        </div>
      </section>

      {/* Action Required */}
      <ActionRequiredSection items={data.action_required} />

      {/* Inbound */}
      {data.inbound ? (
        <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Inbound activity
          </h2>

          {data.inbound.kpi_cards.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.inbound.kpi_cards.map((card, idx) => (
                <KPICardView key={idx} card={card} />
              ))}
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Unique leads
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <MetricValueDisplay
                  value={data.inbound.activity.unique_leads.yesterday ?? 0}
                  size="lg"
                />
                <span className="tabular text-xs text-text-secondary">
                  {data.inbound.activity.unique_leads.mtd ?? 0} MTD
                </span>
              </div>
              {/* v2: hide channel split when all zero (Service IB voice-dominant) */}
              {(() => {
                const s = data.inbound!.activity.channel_split;
                return s.call + s.sms + s.chat > 0 ? (
                  <div className="mt-3">
                    <ChannelSplitBar data={s} />
                  </div>
                ) : null;
              })()}
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  Appointments set
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <MetricValueDisplay
                    value={data.inbound.activity.appointments_set.yesterday ?? 0}
                    size="md"
                  />
                  <span className="tabular text-xs text-text-secondary">
                    {data.inbound.activity.appointments_set.mtd ?? 0} MTD
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  After-hours
                </div>
                <div className="mt-1 text-sm leading-relaxed text-text-primary">
                  <span className="font-semibold tabular">
                    {data.inbound.activity.after_hours.leads_engaged}
                  </span>{" "}
                  leads engaged ·{" "}
                  <span className="font-semibold tabular">
                    {data.inbound.activity.after_hours.appts_booked}
                  </span>{" "}
                  appts booked
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  Warm transfers
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <MetricValueDisplay
                    value={data.inbound.activity.warm_transfers.yesterday ?? 0}
                    size="md"
                  />
                  <span className="tabular text-xs text-text-secondary">
                    {data.inbound.activity.warm_transfers.mtd ?? 0} MTD
                  </span>
                </div>
              </div>
            </div>
          </div>

          {data.inbound.top_vehicles && data.inbound.top_vehicles.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Top vehicles of interest
              </h3>
              <ul className="mt-2 divide-y divide-border-subtle rounded-md border border-border-subtle">
                {data.inbound.top_vehicles.map((v) => (
                  <li
                    key={v.name}
                    className="flex items-center justify-between gap-3 px-3 py-3 text-sm"
                  >
                    <span className="truncate text-text-primary">{v.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold tabular text-text-primary">
                        {v.count}
                      </span>
                      <TrendIcon trend={v.trend} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {data.inbound.top_intents && data.inbound.top_intents.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Top service intents
              </h3>
              <ul className="mt-2 divide-y divide-border-subtle rounded-md border border-border-subtle">
                {data.inbound.top_intents.map((v) => (
                  <li
                    key={v.name}
                    className="flex items-center justify-between gap-3 px-3 py-3 text-sm"
                  >
                    <span className="truncate text-text-primary">{v.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold tabular text-text-primary">
                        {v.count}
                      </span>
                      <TrendIcon trend={v.trend} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Outbound */}
      {data.outbound && data.outbound.show_block ? (
        <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Outbound activity
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <OBStat
              label="Unique reached"
              yesterday={data.outbound.unique_reached.yesterday ?? 0}
              mtd={data.outbound.unique_reached.mtd ?? 0}
            />
            <OBStat
              label="Connect rate"
              yesterday={data.outbound.connect_rate.yesterday ?? 0}
              mtd={data.outbound.connect_rate.mtd ?? 0}
              unit="%"
              unavailable={data.outbound.connect_rate.unavailable}
            />
            <OBStat
              label="Appointments set"
              yesterday={data.outbound.appts_set.yesterday ?? 0}
              mtd={data.outbound.appts_set.mtd ?? 0}
            />
          </div>

          {data.outbound.active_campaigns.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Active campaigns
              </h3>
              <ul className="mt-2 divide-y divide-border-subtle rounded-md border border-border-subtle">
                {data.outbound.active_campaigns.map((c) => {
                  // Client-facing: "campaign paused?" warning becomes an "On hold" pill.
                  const showOnHold = c.paused_warning;
                  const statusLabel = showOnHold ? "On hold" : c.status;
                  return (
                    <li key={c.name} className="px-3 py-3 text-sm">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-text-primary">
                              {c.name}
                            </span>
                            <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                              {statusLabel}
                            </span>
                          </div>
                          <div className="mt-1 text-xs leading-relaxed text-text-secondary tabular">
                            {c.dials} dials · {c.appts} appts ·{" "}
                            {c.conversion_pct.toFixed(1)}% conversion
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {data.outbound.all_audiences_exhausted ? (
            <div className="mt-4">
              <EdgeCaseBanner
                severity="info"
                message="All campaign audiences exhausted. Upload a new contactable list to resume outreach."
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </EmailShell>
  );
}

function OBStat({
  label,
  yesterday,
  mtd,
  unit,
  unavailable,
}: {
  label: string;
  yesterday: number;
  mtd: number;
  unit?: string;
  unavailable?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
        {label}
      </div>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {unavailable ? (
          <MetricValueDisplay value="—" size="md" tone="muted" />
        ) : (
          <MetricValueDisplay value={yesterday} unit={unit} size="md" />
        )}
        <span className="tabular text-xs text-text-secondary">
          {unavailable ? "" : `${mtd}${unit ?? ""} MTD`}
        </span>
      </div>
    </div>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  const map = {
    up: { sym: "↑", cls: "text-positive" },
    down: { sym: "↓", cls: "text-negative" },
    flat: { sym: "→", cls: "text-text-muted" },
  } as const;
  const { sym, cls } = map[trend];
  return <span className={`text-xs font-bold ${cls}`}>{sym}</span>;
}

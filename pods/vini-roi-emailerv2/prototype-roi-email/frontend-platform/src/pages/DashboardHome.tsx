import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Delta,
  PageHeading,
  Pill,
  PrimaryCTA,
  SectionLabel,
} from "../components/ui";
import {
  AFTER_HOURS_BREAKDOWN,
  AI_INSIGHT_TEXT,
  APPOINTMENT_FUNNEL,
  DASHBOARD_SNAPSHOT,
  DATE_RANGES,
  DEFAULT_DATE_RANGE,
  HOT_LEADS,
} from "../data/platform-mock";

export function DashboardHome() {
  const [range, setRange] = useState(DEFAULT_DATE_RANGE);
  const snap = DASHBOARD_SNAPSHOT;

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 max-w-7xl mx-auto">
      <PageHeading
        title="ROI dashboard"
        subtitle={
          <>
            Honda of Downtown LA · {snap.reporting_period_range}
          </>
        }
        trailing={
          <PrimaryCTA variant="outline">Share view</PrimaryCTA>
        }
      />

      {/* Date range selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DATE_RANGES.map((r) => {
          const active = r.key === range;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`min-h-[36px] px-3.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-primary text-white"
                  : "bg-surface-card border border-border-subtle text-text-primary hover:bg-surface-background"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* AI insight card */}
      <Card className="p-5 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 shrink-0 rounded-md bg-brand-primary/10 grid place-items-center text-brand-primary text-xs font-bold">
            ✦
          </div>
          <div className="flex-1 min-w-0">
            <SectionLabel>This week at a glance</SectionLabel>
            <p className="mt-2 text-[15px] leading-relaxed text-text-primary">
              {AI_INSIGHT_TEXT}
            </p>
          </div>
        </div>
      </Card>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <KpiTile label="Total calls" value={snap.total_calls.value} delta={snap.total_calls.delta} />
        <KpiTile label="Inbound" value={snap.inbound_calls.value} delta={snap.inbound_calls.delta} />
        <KpiTile label="Outbound" value={snap.outbound_calls.value} delta={snap.outbound_calls.delta} />
        <KpiTile label="After-hours" value={snap.after_hours_calls.value} delta={snap.after_hours_calls.delta} />
        <KpiTile label="BDC-hours equivalent" value={`${snap.bdc_hours_equivalent.value}h`} delta={snap.bdc_hours_equivalent.delta} />
      </div>

      {/* Funnel + After-hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-baseline justify-between mb-4">
            <SectionLabel>Appointment funnel</SectionLabel>
            <span className="text-xs text-text-muted">{snap.reporting_period_label}</span>
          </div>
          <div className="space-y-3">
            <FunnelStep label={APPOINTMENT_FUNNEL.set.label} count={APPOINTMENT_FUNNEL.set.count} pct={100} />
            <FunnelStep label={APPOINTMENT_FUNNEL.showed.label} count={APPOINTMENT_FUNNEL.showed.count} pct={APPOINTMENT_FUNNEL.showed.conversion_pct} />
            <FunnelStep label={APPOINTMENT_FUNNEL.closed.label} count={APPOINTMENT_FUNNEL.closed.count} pct={APPOINTMENT_FUNNEL.closed.conversion_pct} />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionLabel>After-hours coverage</SectionLabel>
          <div className="mt-3 mb-4">
            <div className="text-3xl sm:text-4xl font-bold tabular text-text-primary">
              {snap.after_hours_calls.value}
            </div>
            <div className="text-xs text-text-secondary mt-0.5">
              calls handled outside business hours
            </div>
          </div>
          <ul className="space-y-2 border-t border-border-subtle pt-3">
            {AFTER_HOURS_BREAKDOWN.map((row) => (
              <li key={row.outcome} className="flex items-baseline justify-between text-sm">
                <span className="text-text-secondary">{row.outcome}</span>
                <span className="tabular font-semibold">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Hot leads table */}
      <Card className="overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-border-subtle flex items-baseline justify-between">
          <div>
            <SectionLabel>Top active leads</SectionLabel>
            <h2 className="mt-0.5 text-base font-semibold">Lead activity this week</h2>
          </div>
          <Link to="/dashboard" className="text-brand-primary text-sm font-medium underline-offset-2 hover:underline">
            View all
          </Link>
        </div>
        <div className="-mx-px overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-surface-background">
              <tr className="text-left text-[11px] uppercase tracking-wide text-text-secondary">
                <th className="px-5 sm:px-6 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Intent</th>
                <th className="px-3 py-3 font-medium">Vehicle</th>
                <th className="px-3 py-3 font-medium">Touches</th>
                <th className="px-3 py-3 font-medium">Last touch</th>
                <th className="px-5 sm:px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {HOT_LEADS.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t border-border-subtle hover:bg-surface-background transition-colors"
                >
                  <td className="px-5 sm:px-6 py-3.5">
                    <Link
                      to={`/dashboard/lead/${lead.journey_id}`}
                      className="text-brand-primary font-medium hover:underline"
                    >
                      {lead.customer_ref}
                    </Link>
                  </td>
                  <td className="px-3 py-3.5 text-text-primary">{lead.intent}</td>
                  <td className="px-3 py-3.5 text-text-secondary">{lead.vehicle ?? "—"}</td>
                  <td className="px-3 py-3.5 tabular text-text-primary">{lead.touches}</td>
                  <td className="px-3 py-3.5 text-text-secondary whitespace-nowrap">
                    {lead.last_touch}
                  </td>
                  <td className="px-5 sm:px-6 py-3.5">
                    <Pill tone={statusTone(lead.status)}>{lead.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function KpiTile({
  label,
  value,
  delta,
}: {
  label: string;
  value: number | string;
  delta?: number;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="text-[11px] uppercase tracking-wide text-text-secondary">{label}</div>
      <div className="mt-1.5 text-2xl sm:text-3xl font-bold tabular leading-tight">
        {value}
      </div>
      {delta !== undefined && (
        <div className="mt-1">
          <Delta value={delta} label="WoW" />
        </div>
      )}
    </Card>
  );
}

function FunnelStep({
  label,
  count,
  pct,
}: {
  label: string;
  count: number;
  pct: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm mb-1.5">
        <span className="font-medium text-text-primary">{label}</span>
        <span className="text-text-secondary">
          <span className="tabular font-semibold text-text-primary">{count}</span>
          <span className="ml-2 text-xs text-text-muted">{pct}%</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-background overflow-hidden">
        <div
          className="h-full bg-brand-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function statusTone(status: string): "neutral" | "brand" | "positive" | "muted" {
  if (status === "Booked") return "positive";
  if (status === "Hot") return "brand";
  if (status === "Warm") return "neutral";
  return "muted";
}

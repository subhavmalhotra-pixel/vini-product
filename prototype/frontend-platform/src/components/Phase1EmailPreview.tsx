/**
 * Renders the *actual* Phase 1 email component inside the Phase 2 platform's
 * subscription editor preview pane. This guarantees the preview matches what
 * recipients see at localhost:5173 byte-for-byte — no parallel implementation
 * to drift apart.
 *
 * Section toggles in the Phase 2 editor map onto fields in the scenario data
 * before it's handed to the Phase 1 component. Where a toggle doesn't have a
 * 1:1 data field, we fall back to a best-effort transform (e.g., zeroing the
 * relevant subtree).
 */
import { DailyDigest } from "@phase1/emails/DailyDigest";
import { WeeklyPerformance } from "@phase1/emails/WeeklyPerformance";
import { MonthlyValueReport } from "@phase1/emails/MonthlyValueReport";
import { EndOfCampaignReport } from "@phase1/emails/EndOfCampaignReport";

import {
  DAILY_NORMAL_SALES,
  DAILY_NORMAL_SERVICE,
  WEEKLY_SALES_IB_ONLY,
  WEEKLY_SALES_OB_ONLY,
  WEEKLY_SERVICE_IB_ONLY,
  WEEKLY_SERVICE_OB_ONLY,
  MONTHLY_NORMAL,
  EOC_NORMAL,
} from "@test-data";
import type {
  DailyDigestData,
  WeeklyData,
  MonthlyData,
  EOCData,
} from "@test-data/schema";

type SectionMap = Record<string, boolean>;

type Props = {
  emailType: "daily" | "weekly" | "monthly" | "eoc";
  enabled: boolean;
  sections: SectionMap;
};

export function Phase1EmailPreview({ emailType, enabled, sections }: Props) {
  if (!enabled) {
    return <PausedState emailType={emailType} />;
  }

  if (emailType === "daily") {
    const base: DailyDigestData = DAILY_NORMAL_SALES;
    const data = applyDailyToggles(base, sections);
    return (
      <PreviewFrame>
        <DailyDigest data={data} />
      </PreviewFrame>
    );
  }

  if (emailType === "weekly") {
    const base: WeeklyData = WEEKLY_SALES_IB_ONLY;
    const data = applyWeeklyToggles(base, sections);
    return (
      <PreviewFrame>
        <WeeklyPerformance data={data} />
      </PreviewFrame>
    );
  }

  if (emailType === "monthly") {
    const base: MonthlyData = MONTHLY_NORMAL;
    const data = applyMonthlyToggles(base, sections);
    return (
      <PreviewFrame>
        <MonthlyValueReport data={data} />
      </PreviewFrame>
    );
  }

  if (emailType === "eoc") {
    const base: EOCData = EOC_NORMAL;
    const data = applyEOCToggles(base, sections);
    return (
      <PreviewFrame>
        <EndOfCampaignReport data={data} />
      </PreviewFrame>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Frame: Phase 1 components ship their own outer card, so the frame just
// supplies a contextual label ("Preview · Daily digest") above the email.
// ─────────────────────────────────────────────────────────────────────────────
function PreviewFrame({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

function PausedState({
  emailType,
}: {
  emailType: "daily" | "weekly" | "monthly" | "eoc";
}) {
  const labels: Record<string, string> = {
    daily: "Daily digest",
    weekly: "Weekly performance",
    monthly: "Monthly value report",
    eoc: "End-of-campaign report",
  };
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl shadow-sm overflow-hidden">
      <div className="h-1.5 bg-text-muted/30" />
      <div className="px-6 py-16 text-center">
        <h3 className="text-base font-semibold text-text-primary">
          {labels[emailType]} is paused
        </h3>
        <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
          This recipient won't receive the {labels[emailType].toLowerCase()}{" "}
          until it's reactivated in the schedule panel.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section-toggle → data transforms
// ─────────────────────────────────────────────────────────────────────────────

// Helper: treat undefined toggle as ON (the default).
const on = (sections: SectionMap, key: string): boolean =>
  sections[key] !== false;

function applyDailyToggles(
  base: DailyDigestData,
  sections: SectionMap,
): DailyDigestData {
  return {
    ...base,
    action_required: on(sections, "action_required") ? base.action_required : [],
    inbound: base.inbound
      ? {
          ...base.inbound,
          kpi_cards: on(sections, "inbound_kpis") ? base.inbound.kpi_cards : [],
          top_vehicles: on(sections, "top_vehicles")
            ? base.inbound.top_vehicles
            : [],
          top_intents: on(sections, "top_vehicles")
            ? base.inbound.top_intents
            : [],
          activity: {
            ...base.inbound.activity,
            after_hours: on(sections, "after_hours")
              ? base.inbound.activity.after_hours
              : { leads_engaged: 0, appts_booked: 0 },
          },
        }
      : undefined,
    outbound: on(sections, "outbound") ? base.outbound : undefined,
  };
}

function applyWeeklyToggles(base: WeeklyData, sections: SectionMap): WeeklyData {
  return {
    ...base,
    agent_kpi_strips: on(sections, "kpi_strip") ? base.agent_kpi_strips : [],
    day_by_day_trend: on(sections, "trend_table") ? base.day_by_day_trend : [],
    funnel: on(sections, "funnel")
      ? base.funnel
      : {
          ...base.funnel,
          unique: 0,
          engaged: 0,
          converted: 0,
        },
    channel_performance: on(sections, "channel_performance")
      ? base.channel_performance
      : undefined,
    top_vehicles: on(sections, "top_breakout") ? base.top_vehicles : undefined,
    top_services: on(sections, "top_breakout") ? base.top_services : undefined,
    story: on(sections, "story") ? base.story : undefined,
  };
}

function applyMonthlyToggles(
  base: MonthlyData,
  sections: SectionMap,
): MonthlyData {
  return {
    ...base,
    kpi_grid: on(sections, "kpi_grid") ? base.kpi_grid : [],
    value_estimate_sidebar: on(sections, "value_estimate")
      ? base.value_estimate_sidebar
      : undefined,
    customer_centric: on(sections, "customer_centric")
      ? base.customer_centric
      : { unique: 0, pct_new: 0, pct_returning: 0, avg_touches: 0, lapsed_reengaged: 0 },
    multichannel_mix: on(sections, "customer_centric")
      ? base.multichannel_mix
      : [],
    stories: on(sections, "stories") ? base.stories : [],
    six_month_trend: on(sections, "trend_chart") ? base.six_month_trend : [],
  };
}

function applyEOCToggles(base: EOCData, sections: SectionMap): EOCData {
  return {
    ...base,
    funnel: on(sections, "funnel")
      ? base.funnel
      : { reached: 0, engaged: 0, booked: 0 },
    per_touchpoint: on(sections, "touchpoint") ? base.per_touchpoint : [],
    multichannel: on(sections, "multichannel") ? base.multichannel : [],
    outcome_distribution: on(sections, "multichannel")
      ? base.outcome_distribution
      : [],
    top_objections: on(sections, "objections") ? base.top_objections : [],
    conversion_by_vehicle_or_service: on(sections, "objections")
      ? base.conversion_by_vehicle_or_service
      : [],
    recommendations: on(sections, "recommendations") ? base.recommendations : [],
  };
}

// Silence unused-import warnings for fixtures kept around for future swapping.
void DAILY_NORMAL_SERVICE;
void WEEKLY_SALES_OB_ONLY;
void WEEKLY_SERVICE_IB_ONLY;
void WEEKLY_SERVICE_OB_ONLY;

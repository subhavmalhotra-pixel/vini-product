import type { WeeklyData } from "../schema";
import { HONDA_DTLA } from "../dealers";
import {
  STORY_AT_RISK_SAVE,
  STORY_RECALL_ESCALATION,
  STORY_MULTI_TOUCH,
  STORY_LAPSED_REENGAGEMENT,
} from "../conversations";

// v2 note: GM (all-agents) view removed. New variants added for Sales IB and
// Service OB. "67% new vs 33% returning customers" line removed across all
// variants — definition of "returning" is ambiguous, deferred to Phase 2+.

// ============================================================================
// 1. Sales OB — Day-by-day shows Leads / Interactions / Appointments
// ============================================================================
export const WEEKLY_SALES_OB_ONLY: WeeklyData = {
  scenario_id: "weekly-sales-ob-only",
  scenario_name: "Sales OB — Campaign Manager view",
  scenario_notes:
    "v2: Subscription filters to sales_ob. New/returning customer split removed. Day-by-day columns: Leads / Interactions / Appointments. Channel performance excluded for OB.",
  email_type: "weekly",
  dealer: HONDA_DTLA,
  agents_in_scope: ["sales_ob"],
  reporting_period: { start: "2026-05-05", end: "2026-05-11" },
  agent_kpi_strips: [
    {
      // v4: OB strip — Reached leads · Contacted · Appointments · ABR%
      agent: "sales_ob",
      cards: [
        { label: "Reached leads", primary_value: 412, delta: 8.2, delta_label: "WoW" },
        { label: "Contacted", primary_value: 158, delta: 12.4, delta_label: "WoW" },
        { label: "Appointments", primary_value: 22, delta: -3.5, delta_label: "WoW" },
        { label: "ABR", primary_value: "13.9%", delta: -2.1, delta_label: "WoW" },
      ],
    },
  ],
  day_by_day_trend: [
    { day: "Mon", call: 0, sms: 0, chat: 0, total: 58, appts: 3 }, // total = leads, second col = interactions
    { day: "Tue", call: 0, sms: 0, chat: 0, total: 64, appts: 4 },
    { day: "Wed", call: 0, sms: 0, chat: 0, total: 59, appts: 3 },
    { day: "Thu", call: 0, sms: 0, chat: 0, total: 71, appts: 5 },
    { day: "Fri", call: 0, sms: 0, chat: 0, total: 82, appts: 4 },
    { day: "Sat", call: 0, sms: 0, chat: 0, total: 51, appts: 2 },
    { day: "Sun", call: 0, sms: 0, chat: 0, total: 27, appts: 1 },
  ],
  funnel: {
    unique: 412,
    engaged: 158,
    converted: 22,
    new_vs_returning: { new: 0, returning: 0 }, // v2: not shown
    avg_touches: 2.1,
    avg_channels: 1.4,
  },
  top_vehicles: [
    { name: "Honda Civic 2025", count: 22 },
    { name: "Honda CR-V 2025", count: 15 },
    { name: "Honda Pilot 2024", count: 9 },
    { name: "Honda Accord 2024", count: 6 },
  ],
  story: {
    journey: STORY_MULTI_TOUCH,
    badge: "Highest-value path",
    summary:
      "Across nine touches over two weeks spanning call, SMS, and email, the agent moved a hesitant trade-in inquiry to a confirmed Saturday test drive on a Pilot Touring. The conversion required a real desk-checked trade evaluation midstream — not a generic 'we'll match KBB' promise.",
    summary_source: "ai_haiku",
  },
};

// ============================================================================
// 2. Sales IB — new variant for v2
// ============================================================================
export const WEEKLY_SALES_IB_ONLY: WeeklyData = {
  scenario_id: "weekly-sales-ib-only",
  scenario_name: "Sales IB — Sales Manager view",
  scenario_notes:
    "v2 new variant: Subscription filters to sales_ib. Day-by-day columns: Leads / Interactions / Appointments / ABR%. Channel performance retained (call/sms/chat).",
  email_type: "weekly",
  dealer: HONDA_DTLA,
  agents_in_scope: ["sales_ib"],
  reporting_period: { start: "2026-05-05", end: "2026-05-11" },
  agent_kpi_strips: [
    {
      // v4: IB strip — Total leads · Qualified · Appointments · ABR%
      agent: "sales_ib",
      cards: [
        { label: "Total leads", primary_value: 287, delta: 4.7, delta_label: "WoW" },
        { label: "Qualified", primary_value: 219, delta: 6.1, delta_label: "WoW" },
        { label: "Appointments", primary_value: 94, delta: 11.3, delta_label: "WoW" },
        { label: "ABR", primary_value: "32.8%", delta: 2.3, delta_label: "WoW" },
      ],
    },
  ],
  day_by_day_trend: [
    { day: "Mon", call: 21, sms: 14, chat: 5, total: 40, appts: 13 },
    { day: "Tue", call: 25, sms: 16, chat: 7, total: 48, appts: 17 },
    { day: "Wed", call: 22, sms: 13, chat: 6, total: 41, appts: 14 },
    { day: "Thu", call: 27, sms: 17, chat: 8, total: 52, appts: 18 },
    { day: "Fri", call: 32, sms: 19, chat: 9, total: 60, appts: 22 },
    { day: "Sat", call: 18, sms: 9, chat: 5, total: 32, appts: 8 },
    { day: "Sun", call: 9, sms: 6, chat: 3, total: 18, appts: 2 },
  ],
  funnel: {
    unique: 287,
    engaged: 219,
    converted: 94,
    new_vs_returning: { new: 0, returning: 0 }, // v2: not shown
    avg_touches: 2.4,
    avg_channels: 1.6,
  },
  channel_performance: [
    { channel: "call", conversations: 154, engagement_pct: 72, appts: 48 },
    { channel: "sms", conversations: 94, engagement_pct: 69, appts: 31 },
    { channel: "chat", conversations: 43, engagement_pct: 76, appts: 15 },
  ],
  top_vehicles: [
    { name: "Honda Civic 2025", count: 31 },
    { name: "Honda CR-V 2025", count: 24 },
    { name: "Honda Pilot 2024", count: 18 },
    { name: "Honda Accord 2024", count: 12 },
  ],
  story: {
    journey: STORY_AT_RISK_SAVE,
    badge: "Saved after 6 turns",
    summary:
      "A weeknight chat opened with a price objection. Across two follow-ups the next day, the agent matched trim and term to the customer's $390/month target — converting to a Saturday test drive on a third touch. No price concession; just careful targeting on the LX trim.",
    summary_source: "ai_haiku",
  },
};

// ============================================================================
// 3. Service IB — Week at glance + restructured day-by-day
// ============================================================================
export const WEEKLY_SERVICE_IB_ONLY: WeeklyData = {
  scenario_id: "weekly-service-ib-only",
  scenario_name: "Service IB — Service Manager view",
  scenario_notes:
    "v2: Adds 'Week at glance' summary row (Total calls / Appointment intent / Appointments / ABR%). Day-by-day columns: Leads / Qualified / Appointment intent / Appointments / ABR%. Channel performance excluded (Service IB is voice-dominant).",
  email_type: "weekly",
  dealer: HONDA_DTLA,
  agents_in_scope: ["service_ib"],
  reporting_period: { start: "2026-05-05", end: "2026-05-11" },
  agent_kpi_strips: [
    {
      // v4: IB strip with Service-IB-flavored label — Total leads · Appointment intent · Appointments · ABR%
      // ("Appointment intent" replaces "Qualified" for the service side — see §9.2)
      agent: "service_ib",
      cards: [
        { label: "Total leads", primary_value: 218, delta: 2.1, delta_label: "WoW" },
        { label: "Appointment intent", primary_value: 154, delta: 5.4, delta_label: "WoW" },
        { label: "Appointments", primary_value: 124, delta: 4.5, delta_label: "WoW" },
        { label: "ABR", primary_value: "56.9%", delta: 3.2, delta_label: "WoW" },
      ],
    },
  ],
  // v2: day-by-day columns reflect Leads / Qualified / Appointment intent / Appointments / ABR%
  // We reuse the existing day_by_day_trend shape: call=Leads, sms=Qualified, chat=Appointment intent, total=Appointments, appts=ABR%
  // (Render relabels columns; data values updated accordingly.)
  day_by_day_trend: [
    { day: "Mon", call: 31, sms: 24, chat: 19, total: 17, appts: 55 },
    { day: "Tue", call: 33, sms: 26, chat: 22, total: 19, appts: 58 },
    { day: "Wed", call: 30, sms: 23, chat: 20, total: 16, appts: 53 },
    { day: "Thu", call: 35, sms: 27, chat: 23, total: 20, appts: 57 },
    { day: "Fri", call: 38, sms: 30, chat: 25, total: 22, appts: 58 },
    { day: "Sat", call: 28, sms: 21, chat: 18, total: 18, appts: 64 },
    { day: "Sun", call: 23, sms: 15, chat: 11, total: 12, appts: 52 },
  ],
  funnel: {
    unique: 218,
    engaged: 168,
    converted: 124,
    new_vs_returning: { new: 0, returning: 0 }, // v2: not shown
    avg_touches: 1.6,
    avg_channels: 1.0,
  },
  channel_performance: undefined, // Service IB is voice-dominant
  top_vehicles: undefined,
  top_services: [
    { name: "Oil change", count: 58 },
    { name: "Brake inspection", count: 32 },
    { name: "Recall (Takata airbag)", count: 19 },
    { name: "Tire rotation", count: 15 },
  ],
  story: {
    journey: STORY_RECALL_ESCALATION,
    badge: "Recall escalation handled",
    summary:
      "An inbound call opened with a customer worried about a recall letter. The agent confirmed the Takata airbag recall against the VIN, explained that the manufacturer covers the repair, and booked the appointment in the same call — a 3-touch conversation handled end-to-end.",
    summary_source: "ai_haiku",
  },
};

// ============================================================================
// 4. Service OB — new variant for v2
// ============================================================================
export const WEEKLY_SERVICE_OB_ONLY: WeeklyData = {
  scenario_id: "weekly-service-ob-only",
  scenario_name: "Service OB — Service Campaign Manager view",
  scenario_notes:
    "v2 new variant: Subscription filters to service_ob. Day-by-day columns: Customers reached / Connected / Appointments / Cost per appt. New/returning split removed.",
  email_type: "weekly",
  dealer: HONDA_DTLA,
  agents_in_scope: ["service_ob"],
  reporting_period: { start: "2026-05-05", end: "2026-05-11" },
  agent_kpi_strips: [
    {
      // v4: OB strip — Reached leads · Contacted · Appointments · ABR%
      agent: "service_ob",
      cards: [
        { label: "Reached leads", primary_value: 198, delta: -4.2, delta_label: "WoW" },
        { label: "Contacted", primary_value: 78, delta: 1.4, delta_label: "WoW" },
        { label: "Appointments", primary_value: 14, delta: 16.7, delta_label: "WoW" },
        { label: "ABR", primary_value: "17.9%", delta: 16.5, delta_label: "WoW" },
      ],
    },
  ],
  day_by_day_trend: [
    { day: "Mon", call: 0, sms: 0, chat: 0, total: 27, appts: 2 },
    { day: "Tue", call: 0, sms: 0, chat: 0, total: 31, appts: 3 },
    { day: "Wed", call: 0, sms: 0, chat: 0, total: 26, appts: 2 },
    { day: "Thu", call: 0, sms: 0, chat: 0, total: 32, appts: 2 },
    { day: "Fri", call: 0, sms: 0, chat: 0, total: 35, appts: 3 },
    { day: "Sat", call: 0, sms: 0, chat: 0, total: 27, appts: 1 },
    { day: "Sun", call: 0, sms: 0, chat: 0, total: 20, appts: 1 },
  ],
  funnel: {
    unique: 198,
    engaged: 78,
    converted: 14,
    new_vs_returning: { new: 0, returning: 0 }, // v2: not shown
    avg_touches: 1.5,
    avg_channels: 1.0,
  },
  top_services: [
    { name: "Service loyalty re-engagement", count: 84 },
    { name: "Recall outreach", count: 38 },
    { name: "Maintenance reminder", count: 24 },
  ],
  story: {
    journey: STORY_LAPSED_REENGAGEMENT,
    badge: "Best after-hours save",
    summary:
      "A 7:42 PM SMS to a customer silent for 18 months opened a quick two-touch conversation that landed a Saturday maintenance appointment by 8:11 PM. No callback or human handover required.",
    summary_source: "ai_haiku",
  },
};

// ============================================================================
// 5. Story AI fallback — block omitted
// ============================================================================
export const WEEKLY_NO_STORY_FALLBACK: WeeklyData = {
  ...WEEKLY_SALES_IB_ONLY,
  scenario_id: "weekly-no-story-fallback",
  scenario_name: "Story AI fallback — block omitted",
  scenario_notes:
    "Haiku call timed out / returned PII-flagged content / errored. Story block is omitted entirely per harness fallback rule. Rest of email ships.",
  story: undefined,
};

// v2: GM view removed. Four agent-specific variants + fallback.
export const ALL_WEEKLY_SCENARIOS: WeeklyData[] = [
  WEEKLY_SALES_IB_ONLY,
  WEEKLY_SALES_OB_ONLY,
  WEEKLY_SERVICE_IB_ONLY,
  WEEKLY_SERVICE_OB_ONLY,
  WEEKLY_NO_STORY_FALLBACK,
];

// Backward-compat re-export (deprecated; do not surface in switcher).
export const WEEKLY_MULTI_AGENT_NORMAL = WEEKLY_SALES_IB_ONLY;

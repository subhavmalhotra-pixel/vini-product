import type { DailyDigestData } from "../schema";
import {
  HONDA_DTLA,
  TOYOTA_TAMPA,
  NEW_ROOFTOP_DAY_3,
  SILENT_DAY_ROOFTOP,
} from "../dealers";

// ============================================================================
// 1. NORMAL — GM view, both depts subscribed
// ============================================================================
export const DAILY_NORMAL_BOTH: DailyDigestData = {
  scenario_id: "daily-normal-both",
  scenario_name: "Normal day — GM view (Sales + Service)",
  scenario_notes:
    "Healthy day across both depts. Hero, action queue, inbound + outbound all populated. Default 'happy-path' scenario.",
  email_type: "daily",
  send_decision: "send",
  dealer: HONDA_DTLA,
  agents_in_scope: ["sales_ib", "sales_ob", "service_ib", "service_ob"],
  reporting_date: "2026-05-13",
  conversations_total: 142,
  channel_split: { call: 64, sms: 51, chat: 27 },
  hero: {
    yesterday_appts: { yesterday: 18, mtd: 184 },
    mtd_appts: { mtd: 184 },
    bdc_hours_equivalent: 11.5,
  },
  action_required: [
    { type: "sms_takeover", count: 4, deep_link: "/console/inbox?status=takeover" },
    { type: "appt_confirmed", count: 12, deep_link: "/console/appointments?date=today" },
    { type: "failed_booking", count: 2, deep_link: "/console/bookings?status=failed" },
    { type: "specific_salesperson", count: 3, agent_type: "sales_ib", deep_link: "/console/leads?asked_for=salesperson" },
    { type: "compliance_alert", count: 1, deep_link: "/console/compliance?date=yesterday" },
    { type: "callback_request", count: 2, agent_type: "service_ib", deep_link: "/console/inbox?type=callback" },
  ],
  inbound: {
    kpi_cards: [
      { label: "Avg first-contact time", primary_value: 47, primary_unit: "s", subtitle: "Yesterday · 1m 02s MTD" },
      { label: "Engaged rate", primary_value: 71, primary_unit: "%", subtitle: "Yesterday · 68% MTD" },
    ],
    activity: {
      unique_leads: { yesterday: 58, mtd: 612, trend_7d_avg: 54 },
      channel_split: { call: 28, sms: 22, chat: 8 },
      appointments_set: { yesterday: 14, mtd: 142, trend_7d_avg: 13 },
      after_hours: { leads_engaged: 11, appts_booked: 4 },
      warm_transfers: { yesterday: 7, mtd: 72 },
    },
    top_vehicles: [
      { name: "Honda Civic 2025", count: 18, trend: "up" },
      { name: "Honda CR-V 2025", count: 14, trend: "flat" },
      { name: "Honda Pilot 2024", count: 9, trend: "up" },
      { name: "Honda Accord 2024", count: 7, trend: "down" },
    ],
  },
  outbound: {
    show_block: true,
    unique_reached: { yesterday: 84, mtd: 891 },
    connect_rate: { yesterday: 38, mtd: 41 },
    appts_set: { yesterday: 4, mtd: 42 },
    active_campaigns: [
      { name: "Spring Inventory Clearance", dials: 64, appts: 3, conversion_pct: 4.7, status: "active" },
      { name: "Service Loyalty May", dials: 20, appts: 1, conversion_pct: 5.0, status: "active" },
    ],
  },
  footer: {
    bdc_hours_equivalent: 11.5,
    reporting_period: "May 13, 2026",
    next_send: "May 15, 2026 · 7:00 AM PT",
  },
};

// ============================================================================
// 2. NORMAL — Sales-only subscription (v2 — top 2 KPIs only, no BDC-hours)
// ============================================================================
export const DAILY_NORMAL_SALES: DailyDigestData = {
  ...DAILY_NORMAL_BOTH,
  scenario_id: "daily-normal-sales",
  scenario_name: "Sales-only subscription (Sales Manager view)",
  scenario_notes:
    "v2: Action queue is one consolidated CTA at the bottom. Inbound KPI strip shows the two operational headline metrics — Unique Leads + Appointments. Other secondary metrics demote to a smaller row. BDC-hours equivalent removed from hero and footer.",
  agents_in_scope: ["sales_ib", "sales_ob"],
  conversations_total: 96,
  channel_split: { call: 41, sms: 36, chat: 19 },
  hero: {
    yesterday_appts: { yesterday: 14, mtd: 142 },
    mtd_appts: { mtd: 142 },
    bdc_hours_equivalent: 0, // v2: suppressed in render
  },
  action_required: [
    { type: "sms_takeover", count: 3, agent_type: "sales_ib", deep_link: "/console/inbox?status=takeover&agent=sales" },
    { type: "appt_confirmed", count: 8, deep_link: "/console/appointments?date=today&dept=sales" },
    { type: "failed_booking", count: 1, deep_link: "/console/bookings?status=failed&dept=sales" },
    { type: "specific_salesperson", count: 3, agent_type: "sales_ib", deep_link: "/console/leads?asked_for=salesperson" },
  ],
  inbound: {
    // v2: top 2 KPIs are Unique Leads + Appointments
    kpi_cards: [
      { label: "Unique leads", primary_value: 58, subtitle: "Yesterday · 612 MTD" },
      { label: "Appointments", primary_value: 14, subtitle: "Yesterday · 142 MTD" },
    ],
    activity: {
      unique_leads: { yesterday: 58, mtd: 612, trend_7d_avg: 54 },
      channel_split: { call: 28, sms: 22, chat: 8 },
      appointments_set: { yesterday: 14, mtd: 142, trend_7d_avg: 13 },
      after_hours: { leads_engaged: 11, appts_booked: 4 },
      warm_transfers: { yesterday: 7, mtd: 72 },
    },
    top_vehicles: DAILY_NORMAL_BOTH.inbound!.top_vehicles,
  },
};

// ============================================================================
// 3. NORMAL — Service-only subscription
// ============================================================================
export const DAILY_NORMAL_SERVICE: DailyDigestData = {
  scenario_id: "daily-normal-service",
  scenario_name: "Service-only subscription (Service Manager view)",
  scenario_notes:
    "v2: Top 2 KPIs are Unique Leads + Appointments. Inbound channel split is suppressed (Service voice-dominant). Single bottom CTA for action items. BDC-hours suppressed.",
  email_type: "daily",
  send_decision: "send",
  dealer: TOYOTA_TAMPA,
  agents_in_scope: ["service_ib", "service_ob"],
  reporting_date: "2026-05-13",
  conversations_total: 64,
  channel_split: { call: 49, sms: 0, chat: 15 },
  hero: {
    yesterday_appts: { yesterday: 11, mtd: 117 },
    mtd_appts: { mtd: 117 },
    bdc_hours_equivalent: 6.2,
  },
  action_required: [
    { type: "callback_request", count: 5, deep_link: "/console/inbox?type=callback" },
    { type: "recall_response", count: 2, deep_link: "/console/recalls?status=new" },
    { type: "pending_status_update", count: 4, deep_link: "/console/ros?status=update_pending" },
    { type: "no_show", count: 1, deep_link: "/console/appointments?status=no_show&date=yesterday" },
  ],
  inbound: {
    // v2: top 2 KPIs are Unique Leads + Appointments
    kpi_cards: [
      { label: "Unique leads", primary_value: 33, subtitle: "Yesterday · 412 MTD" },
      { label: "Appointments", primary_value: 9, subtitle: "Yesterday · 102 MTD" },
    ],
    activity: {
      unique_leads: { yesterday: 33, mtd: 412 },
      // v2: Service does NOT show channel split for inbound — Service IB volume is voice-dominant; the breakdown looks unbalanced
      channel_split: { call: 0, sms: 0, chat: 0 },
      appointments_set: { yesterday: 9, mtd: 102 },
      after_hours: { leads_engaged: 6, appts_booked: 2 },
      warm_transfers: { yesterday: 5, mtd: 47 },
    },
    top_intents: [
      { name: "Oil change", count: 14, trend: "flat" },
      { name: "Brake inspection", count: 8, trend: "up" },
      { name: "Recall (Takata airbag)", count: 5, trend: "up" },
      { name: "Tire rotation", count: 4, trend: "flat" },
    ],
  },
  outbound: {
    show_block: true,
    unique_reached: { yesterday: 41, mtd: 387 },
    connect_rate: { yesterday: 44, mtd: 42 },
    appts_set: { yesterday: 2, mtd: 18 },
    active_campaigns: [
      { name: "Service Loyalty May", dials: 41, appts: 2, conversion_pct: 4.9, status: "active" },
    ],
  },
  footer: {
    bdc_hours_equivalent: 0, // v2: suppressed
    reporting_period: "May 13, 2026",
    next_send: "May 15, 2026 · 7:00 AM ET",
  },
};

// ============================================================================
// 4. EDGE: Full silent day — DO NOT SEND
// ============================================================================
export const DAILY_SILENT_DAY: DailyDigestData = {
  scenario_id: "daily-silent-day",
  scenario_name: "Full silent day — suppress send",
  scenario_notes:
    "Zero calls AND zero leads AND zero chats yesterday. Email does NOT send. Slack alarm fires to #vini-coverage-alerts. This scenario is shown in the FE for inspection only — engineers must implement the suppression at send time.",
  email_type: "daily",
  send_decision: "suppress",
  suppression_reason: "full_silent_day",
  dealer: SILENT_DAY_ROOFTOP,
  agents_in_scope: ["sales_ib", "sales_ob", "service_ib"],
  reporting_date: "2026-05-13",
  conversations_total: 0,
  channel_split: { call: 0, sms: 0, chat: 0 },
  hero: {
    yesterday_appts: { yesterday: 0, mtd: 47 },
    mtd_appts: { mtd: 47 },
    bdc_hours_equivalent: 0,
  },
  action_required: [],
  footer: {
    bdc_hours_equivalent: 0,
    reporting_period: "May 13, 2026",
    next_send: "May 15, 2026 · 7:00 AM CT",
  },
  banners: [
    {
      severity: "warning",
      message:
        "No conversations recorded across any channel yesterday. Suppressing email and alerting #vini-coverage-alerts.",
    },
  ],
};

// ============================================================================
// 5. EDGE: Zero inbound calls — silent in UI, internal Slack alarm only
// ============================================================================
export const DAILY_ZERO_INBOUND_CALLS: DailyDigestData = {
  ...DAILY_NORMAL_SALES,
  scenario_id: "daily-zero-inbound-calls",
  scenario_name: "Zero inbound calls — silent in UI",
  scenario_notes:
    "v2: Calls = 0, SMS/Chat normal. Email renders as a regular Sales digest with a 0 in the call column. NO 'verify telephony' banner — that alert fires to internal Slack only. Dealer sees a clean day, not a broken one.",
  channel_split: { call: 0, sms: 51, chat: 27 },
  conversations_total: 78,
  inbound: {
    ...DAILY_NORMAL_BOTH.inbound!,
    activity: {
      ...DAILY_NORMAL_BOTH.inbound!.activity,
      channel_split: { call: 0, sms: 22, chat: 8 },
      unique_leads: { yesterday: 30, mtd: 584 },
    },
  },
  banners: [], // v2: no banner — telephony alert fires to internal Slack only
};

// ============================================================================
// 6. EDGE: No outbound activity + no active campaigns — hide block
// ============================================================================
export const DAILY_NO_OUTBOUND_NO_CAMPAIGN: DailyDigestData = {
  ...DAILY_NORMAL_BOTH,
  scenario_id: "daily-no-outbound-no-campaign",
  scenario_name: "No outbound activity + no campaigns — hide block entirely",
  scenario_notes:
    "Outbound block is hidden completely. No 'zero state' card — full suppression.",
  outbound: {
    show_block: false,
    unique_reached: { yesterday: 0, mtd: 0 },
    connect_rate: { yesterday: 0, mtd: 0 },
    appts_set: { yesterday: 0, mtd: 0 },
    active_campaigns: [],
  },
};

// ============================================================================
// 7. EDGE: Zero outbound activity, campaign active — silent UI (status pill only)
// ============================================================================
export const DAILY_ZERO_OB_ACTIVE_CAMPAIGN: DailyDigestData = {
  ...DAILY_NORMAL_SALES,
  scenario_id: "daily-zero-ob-active-campaign",
  scenario_name: "Zero outbound dials, active campaign — silent UI",
  scenario_notes:
    "v2: Campaign is active but dialed 0 yesterday. Render campaign row with an inline 'On hold' status pill — NO banner, NO 'paused?' question. Internal Slack alarm fires; the dealer sees a calm row.",
  outbound: {
    show_block: true,
    unique_reached: { yesterday: 0, mtd: 612 },
    connect_rate: { yesterday: 0, mtd: 41, unavailable: true, unavailable_reason: "no_activity" },
    appts_set: { yesterday: 0, mtd: 28 },
    active_campaigns: [
      {
        name: "Spring Inventory Clearance",
        dials: 0,
        appts: 0,
        conversion_pct: 0,
        status: "active",
        paused_warning: true,
      },
    ],
  },
  banners: [], // v2: silent — status pill on campaign row does the work
};

// ============================================================================
// 8. EDGE: Yesterday=0 but MTD>0 — sanity-fixed totals reconcile to 0
// ============================================================================
export const DAILY_YESTERDAY_ZERO_MTD_POSITIVE: DailyDigestData = {
  ...DAILY_NORMAL_SALES,
  scenario_id: "daily-yesterday-zero-mtd-positive",
  scenario_name: "Yesterday=0 appts, MTD>0 — sanity reconciled",
  scenario_notes:
    "v2 sanity fix: when hero shows 0 appts yesterday, EVERY downstream metric for yesterday must also be 0. Previously inbound showed 14 + outbound 4 with hero=0 — broken. Now inbound, outbound, channel splits all 0 for yesterday while MTD figures preserve cumulative state. Hero renders 0 in neutral gray, no banner.",
  conversations_total: 0,
  channel_split: { call: 0, sms: 0, chat: 0 },
  hero: {
    yesterday_appts: { yesterday: 0, mtd: 184 },
    mtd_appts: { mtd: 184 },
    bdc_hours_equivalent: 0,
  },
  action_required: [],
  inbound: {
    kpi_cards: [
      { label: "Unique leads", primary_value: 0, subtitle: "Yesterday · 612 MTD" },
      { label: "Appointments", primary_value: 0, subtitle: "Yesterday · 142 MTD" },
    ],
    activity: {
      unique_leads: { yesterday: 0, mtd: 612, trend_7d_avg: 54 },
      channel_split: { call: 0, sms: 0, chat: 0 },
      appointments_set: { yesterday: 0, mtd: 142, trend_7d_avg: 13 },
      after_hours: { leads_engaged: 0, appts_booked: 0 },
      warm_transfers: { yesterday: 0, mtd: 72 },
    },
    top_vehicles: [],
  },
  outbound: {
    show_block: true,
    unique_reached: { yesterday: 0, mtd: 891 },
    connect_rate: { yesterday: 0, mtd: 41 },
    appts_set: { yesterday: 0, mtd: 42 },
    active_campaigns: [
      { name: "Spring Inventory Clearance", dials: 0, appts: 0, conversion_pct: 0, status: "active" },
    ],
  },
  banners: [], // v2: no banner — UI renders the zero day silently
};

// ============================================================================
// 9. EDGE: Day 1–7 rooftop — leads-only hero, celebrate first booking
// ============================================================================
export const DAILY_DAY_1_ROOFTOP: DailyDigestData = {
  ...DAILY_NORMAL_BOTH,
  scenario_id: "daily-day-1-rooftop",
  scenario_name: "Day 1–7 rooftop — leads-only hero",
  scenario_notes:
    "v2: New rooftop's hero shows ONLY leads-engaged count (forward-looking). When first appointment lands, hero swaps to a celebration tile ('First appointment booked — well done.'). No internal 'baseline period' jargon.",
  dealer: NEW_ROOFTOP_DAY_3,
  reporting_date: "2026-05-13",
  conversations_total: 22,
  channel_split: { call: 12, sms: 7, chat: 3 },
  hero: {
    yesterday_appts: { yesterday: 0, mtd: 0 },
    mtd_appts: { mtd: 0 },
    bdc_hours_equivalent: 0,
    show_onboarding_banner: true,
  },
  banners: [], // v2: no internal-jargon banner — the leads-only hero says it itself
  action_required: [
    { type: "sms_takeover", count: 1, deep_link: "/console/inbox?status=takeover" },
  ],
  inbound: {
    // v2: Day-1 hero is leads-only. The "Appointments" KPI is suppressed
    // entirely until the first booking arrives — when it does, the render
    // swaps the hero to a celebration tile (handled by the email component).
    kpi_cards: [
      { label: "Unique leads", primary_value: 9, subtitle: "Day 3 · 22 since go-live" },
    ],
    activity: {
      unique_leads: { yesterday: 9, mtd: 22 },
      channel_split: { call: 4, sms: 3, chat: 2 },
      appointments_set: { yesterday: 0, mtd: 0 },
      after_hours: { leads_engaged: 1, appts_booked: 0 },
      warm_transfers: { yesterday: 0, mtd: 0 },
    },
    top_vehicles: [
      { name: "Kia Sorento 2025", count: 4, trend: "flat" },
      { name: "Kia Sportage 2024", count: 3, trend: "flat" },
    ],
  },
  outbound: undefined,
};

// ============================================================================
// 10. EDGE: Small denominator — show raw counts (never N/A)
// ============================================================================
export const DAILY_SMALL_DENOMINATOR: DailyDigestData = {
  ...DAILY_NORMAL_SERVICE,
  scenario_id: "daily-small-denominator",
  scenario_name: "Low-volume day — show raw counts, never N/A",
  scenario_notes:
    "v2: Only 3 inbound calls yesterday. ABR % is statistically noisy so we suppress the percent — but we ALWAYS show raw counts. The two top KPIs (Unique Leads + Appointments) remain truthful. No 'N/A' text ever rendered.",
  conversations_total: 4,
  channel_split: { call: 3, sms: 0, chat: 1 },
  inbound: {
    kpi_cards: [
      // v2: top 2 KPIs unchanged — raw counts, NEVER "N/A"
      { label: "Unique leads", primary_value: 3, subtitle: "Yesterday · 412 MTD" },
      { label: "Appointments", primary_value: 1, subtitle: "Yesterday · 102 MTD" },
    ],
    activity: {
      unique_leads: { yesterday: 3, mtd: 412 },
      channel_split: { call: 0, sms: 0, chat: 0 }, // service hides channel split per v2
      appointments_set: { yesterday: 1, mtd: 102 },
      after_hours: { leads_engaged: 0, appts_booked: 0 },
      warm_transfers: { yesterday: 0, mtd: 47 },
    },
    top_intents: [
      { name: "Oil change", count: 2, trend: "flat" },
      { name: "Brake inspection", count: 1, trend: "flat" },
    ],
  },
};

// v2: GM (all-agents) view removed from the active scenario list.
// DAILY_NORMAL_BOTH is retained as a base spread for derived scenarios but
// is no longer surfaced in the email-preview switcher.
export const ALL_DAILY_SCENARIOS: DailyDigestData[] = [
  DAILY_NORMAL_SALES,
  DAILY_NORMAL_SERVICE,
  DAILY_SILENT_DAY,
  DAILY_ZERO_INBOUND_CALLS,
  DAILY_NO_OUTBOUND_NO_CAMPAIGN,
  DAILY_ZERO_OB_ACTIVE_CAMPAIGN,
  DAILY_YESTERDAY_ZERO_MTD_POSITIVE,
  DAILY_DAY_1_ROOFTOP,
  DAILY_SMALL_DENOMINATOR,
];

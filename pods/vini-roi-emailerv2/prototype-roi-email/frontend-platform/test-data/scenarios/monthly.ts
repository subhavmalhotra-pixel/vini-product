import type { MonthlyData } from "../schema";
import { HONDA_DTLA, TOYOTA_TAMPA } from "../dealers";
import {
  STORY_MULTI_TOUCH,
  STORY_AT_RISK_SAVE,
  STORY_LAPSED_REENGAGEMENT,
  STORY_RECALL_ESCALATION,
} from "../conversations";

// =============================================================================
// MONTHLY VALUE REPORT — v4 ships FOUR agent-specific variants
//
// Mirrors the Weekly variant model: each subscriber receives the monthly
// matching the agents they're subscribed to. Hero tile order is fixed:
//   1) Leads interacted   2) Conversations            3) Appointments
//   4) After-hour appts   5) Routed calls             6) Resolution rate
//
// The six-month trend, customer-centric block, multichannel mix, and stories
// are all agent-flavored.
// =============================================================================

// -----------------------------------------------------------------------------
// 1. Sales IB — Sales Manager view (Honda DTLA)
// -----------------------------------------------------------------------------
export const MONTHLY_SALES_IB_ONLY: MonthlyData = {
  scenario_id: "monthly-sales-ib-only",
  scenario_name: "Sales IB — Sales Manager view",
  scenario_notes:
    "v5: Sales-IB-only monthly. Inbound sales sees high lead volume + appointment density; routed calls reflect 'asked for a specific salesperson' transfers; resolution rate is high because most inbound sales calls either book or transfer cleanly. Value-estimate sidebar removed (v5).",
  email_type: "monthly",
  dealer: HONDA_DTLA,
  agents_in_scope: ["sales_ib"],
  reporting_month: "April 2026",
  hero: {
    headline: "Inbound sales — April 2026",
    leads_interacted: 1150,
    total_conversations: 1583,
    appts_booked: 312,
    after_hours_booked: 47,
    routed_calls: 38, // transfers to a specific named salesperson
    resolution_rate_pct: 84,
  },
  kpi_grid: [], // v3 deprecated
  customer_centric: {
    unique: 1150,
    pct_new: 72,
    pct_returning: 28,
    avg_touches: 1.4,
    routed_calls: 38, // v5: mirrors hero.routed_calls (lapsed_reengaged removed)
  },
  multichannel_mix: [
    { channel: "call", share_pct: 45, mom_shift: -1.8 },
    { channel: "sms", share_pct: 28, mom_shift: 2.4 },
    { channel: "chat", share_pct: 22, mom_shift: 1.1 },
    { channel: "email", share_pct: 5, mom_shift: -1.7 },
  ],
  stories: [
    {
      journey: STORY_AT_RISK_SAVE,
      badge: "Saved after 6 turns",
      summary:
        "A price-objection chat could easily have closed lost. Instead, two well-timed follow-ups across SMS and a confirming call landed a Saturday test drive on the LX trim — no pricing concession, just careful trim-and-term matching against the customer's stated monthly target.",
      summary_source: "ai_haiku",
    },
    {
      journey: STORY_MULTI_TOUCH,
      badge: "Highest-value path",
      summary:
        "Across two weeks and nine touches spanning call, SMS, and email, the agent moved a hesitant trade-in inquiry to a confirmed Saturday test drive on a Pilot Touring. The desk-checked trade evaluation midstream was the unlock — not a generic 'we'll match KBB' promise.",
      summary_source: "ai_haiku",
    },
  ],
  six_month_trend: [
    { month: "Nov", appts: 218, store_total: 285 },
    { month: "Dec", appts: 241, store_total: 308 },
    { month: "Jan", appts: 263, store_total: 334 },
    { month: "Feb", appts: 274, store_total: 351 },
    { month: "Mar", appts: 297, store_total: 372 },
    { month: "Apr", appts: 312, store_total: 388 },
  ],
};

// -----------------------------------------------------------------------------
// 2. Sales OB — Campaign Manager view (Honda DTLA)
// -----------------------------------------------------------------------------
export const MONTHLY_SALES_OB_ONLY: MonthlyData = {
  scenario_id: "monthly-sales-ob-only",
  scenario_name: "Sales OB — Campaign Manager view",
  scenario_notes:
    "v5: Sales-OB-only monthly. Outbound campaigns reach more leads but convert at a lower rate; routed calls are low (most OB closes itself or escalates via the queue); resolution rate is high because campaigns are designed to either book or terminate cleanly.",
  email_type: "monthly",
  dealer: HONDA_DTLA,
  agents_in_scope: ["sales_ob"],
  reporting_month: "April 2026",
  hero: {
    headline: "Outbound sales — April 2026",
    leads_interacted: 1847,
    total_conversations: 2612,
    appts_booked: 89,
    after_hours_booked: 11,
    routed_calls: 22,
    resolution_rate_pct: 91,
  },
  kpi_grid: [],
  customer_centric: {
    unique: 1847,
    pct_new: 38,
    pct_returning: 62,
    avg_touches: 1.6,
    routed_calls: 22, // v5: mirrors hero.routed_calls
  },
  multichannel_mix: [
    { channel: "call", share_pct: 52, mom_shift: -3.4 },
    { channel: "sms", share_pct: 42, mom_shift: 4.8 },
    { channel: "chat", share_pct: 1, mom_shift: -0.1 },
    { channel: "email", share_pct: 5, mom_shift: -1.3 },
  ],
  stories: [
    {
      journey: STORY_MULTI_TOUCH,
      badge: "Highest-value campaign path",
      summary:
        "A Spring Inventory campaign touch found a customer with a 2018 trade who'd opened earlier campaigns but never replied. Two SMS touches plus an evening call surfaced a real trade need; the structured offer landed a Saturday test drive without any pricing concession.",
      summary_source: "ai_haiku",
    },
    {
      journey: STORY_LAPSED_REENGAGEMENT,
      badge: "Lapsed customer re-engaged",
      summary:
        "A 7:42 PM SMS to a customer silent for 11 months opened a two-touch thread that landed a weekend appointment by morning — no callback or human handover needed. The customer's prior trade interest was matched against current inventory automatically.",
      summary_source: "ai_haiku",
    },
  ],
  six_month_trend: [
    { month: "Nov", appts: 62, store_total: 285 },
    { month: "Dec", appts: 24, store_total: 308 }, // holiday lull
    { month: "Jan", appts: 71, store_total: 334 },
    { month: "Feb", appts: 58, store_total: 351 },
    { month: "Mar", appts: 94, store_total: 372 }, // spring kick-off
    { month: "Apr", appts: 89, store_total: 388 },
  ],
};

// -----------------------------------------------------------------------------
// 3. Service IB — Service Manager view (Toyota Tampa)
// -----------------------------------------------------------------------------
export const MONTHLY_SERVICE_IB_ONLY: MonthlyData = {
  scenario_id: "monthly-service-ib-only",
  scenario_name: "Service IB — Service Manager view",
  scenario_notes:
    "v5: Service-IB-only monthly. Voice-dominant inbound; high appointment density (service callers usually need to book); routed calls high because callers often ask for a specific advisor or escalate status-update items; resolution rate lower than sales because RO-status escalations require human follow-up.",
  email_type: "monthly",
  dealer: TOYOTA_TAMPA,
  agents_in_scope: ["service_ib"],
  reporting_month: "April 2026",
  hero: {
    headline: "Inbound service — April 2026",
    leads_interacted: 894,
    total_conversations: 1021,
    appts_booked: 547,
    after_hours_booked: 88,
    routed_calls: 142, // many advisor transfers + status escalations
    resolution_rate_pct: 79,
  },
  kpi_grid: [],
  customer_centric: {
    unique: 894,
    pct_new: 28,
    pct_returning: 72,
    avg_touches: 1.3,
    routed_calls: 142, // v5: mirrors hero.routed_calls
  },
  multichannel_mix: [
    { channel: "call", share_pct: 78, mom_shift: 1.2 },
    { channel: "sms", share_pct: 14, mom_shift: -0.4 },
    { channel: "chat", share_pct: 4, mom_shift: 0.1 },
    { channel: "email", share_pct: 4, mom_shift: -0.9 },
  ],
  stories: [
    {
      journey: STORY_RECALL_ESCALATION,
      badge: "Recall escalation handled",
      summary:
        "An inbound call opened with a customer worried about a recall letter. The agent confirmed the Takata airbag recall against the VIN, explained that the manufacturer covers the repair, and booked the appointment in the same call — a 3-touch conversation handled end-to-end.",
      summary_source: "ai_haiku",
    },
    {
      journey: STORY_MULTI_TOUCH,
      badge: "Status update closed",
      summary:
        "A returning customer asking for a status update was escalated to the advisor on the third call. The advisor pulled the RO live, sent a photo of the delayed part, and rebooked the pickup — turning a repeat-caller risk into a closed loop within an hour.",
      summary_source: "ai_haiku",
    },
  ],
  six_month_trend: [
    { month: "Nov", appts: 487, store_total: 612 },
    { month: "Dec", appts: 421, store_total: 558 },
    { month: "Jan", appts: 502, store_total: 634 },
    { month: "Feb", appts: 521, store_total: 651 },
    { month: "Mar", appts: 538, store_total: 672 },
    { month: "Apr", appts: 547, store_total: 684 },
  ],
};

// -----------------------------------------------------------------------------
// 4. Service OB — Service Campaign Manager view (Toyota Tampa)
// -----------------------------------------------------------------------------
export const MONTHLY_SERVICE_OB_ONLY: MonthlyData = {
  scenario_id: "monthly-service-ob-only",
  scenario_name: "Service OB — Service Campaign Manager view",
  scenario_notes:
    "v5: Service-OB-only monthly. SMS-first campaign cadence (loyalty + recall outreach). Routed calls near zero (OB doesn't route to humans mid-flow). Resolution rate very high because most touches either book or terminate cleanly.",
  email_type: "monthly",
  dealer: TOYOTA_TAMPA,
  agents_in_scope: ["service_ob"],
  reporting_month: "April 2026",
  hero: {
    headline: "Outbound service — April 2026",
    leads_interacted: 1247,
    total_conversations: 1389,
    appts_booked: 138,
    after_hours_booked: 28,
    routed_calls: 17,
    resolution_rate_pct: 93,
  },
  kpi_grid: [],
  customer_centric: {
    unique: 1247,
    pct_new: 8,
    pct_returning: 92, // loyalty audience
    avg_touches: 1.5,
    routed_calls: 17, // v5: mirrors hero.routed_calls
  },
  multichannel_mix: [
    { channel: "sms", share_pct: 58, mom_shift: 4.2 },
    { channel: "call", share_pct: 36, mom_shift: -3.1 },
    { channel: "email", share_pct: 6, mom_shift: -1.1 },
    { channel: "chat", share_pct: 0, mom_shift: 0.0 },
  ],
  stories: [
    {
      journey: STORY_LAPSED_REENGAGEMENT,
      badge: "Best after-hours save",
      summary:
        "A 7:42 PM SMS to a customer silent for 18 months opened a quick two-touch conversation that landed a Saturday maintenance appointment by 8:11 PM. The free multi-point inspection offer landed without a callback or human handover.",
      summary_source: "ai_haiku",
    },
    {
      journey: STORY_RECALL_ESCALATION,
      badge: "Recall outreach converted",
      summary:
        "An OB recall-outreach SMS to a customer who'd ignored two prior letters opened a quick yes/no exchange; the customer booked the next-available recall slot inside the same thread. End-to-end resolution without a human touch.",
      summary_source: "ai_haiku",
    },
  ],
  six_month_trend: [
    { month: "Nov", appts: 84, store_total: 612 },
    { month: "Dec", appts: 71, store_total: 558 },
    { month: "Jan", appts: 102, store_total: 634 }, // new-year service push
    { month: "Feb", appts: 118, store_total: 651 },
    { month: "Mar", appts: 124, store_total: 672 },
    { month: "Apr", appts: 138, store_total: 684 },
  ],
};

// -----------------------------------------------------------------------------
// 5. Story AI fallback — block omitted (edge case retained)
// -----------------------------------------------------------------------------
export const MONTHLY_NO_STORIES: MonthlyData = {
  ...MONTHLY_SALES_IB_ONLY,
  scenario_id: "monthly-no-stories",
  scenario_name: "All story summaries fell back — section omitted",
  scenario_notes:
    "Edge: every Haiku call failed PII or content check. Stories array is empty. Rest of email ships normally.",
  stories: [],
};

export const ALL_MONTHLY_SCENARIOS: MonthlyData[] = [
  MONTHLY_SALES_IB_ONLY,
  MONTHLY_SALES_OB_ONLY,
  MONTHLY_SERVICE_IB_ONLY,
  MONTHLY_SERVICE_OB_ONLY,
  MONTHLY_NO_STORIES,
];

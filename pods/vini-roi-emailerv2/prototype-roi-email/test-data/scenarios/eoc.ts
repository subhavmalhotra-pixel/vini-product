import type { EOCData } from "../schema";
import { HONDA_DTLA, ANDERSON_AUTO_GROUP } from "../dealers";

// v4 (post-EOC review): the report now ships ONE funnel — Conversion only.
// Steps: Reached leads → Contacted → Appointments → ABR%.
// Conversion-by-vehicle/service and Recommendations blocks removed per §9.4.

// ============================================================================
// 1. NORMAL — Spring Inventory campaign complete
// ============================================================================
export const EOC_NORMAL: EOCData = {
  scenario_id: "eoc-normal",
  scenario_name: "End-of-Campaign — Spring Inventory complete",
  scenario_notes:
    "v4: Single conversion funnel — Reached leads → Contacted → Appointments → ABR%. Conversion-by-vehicle and Recommendations sections removed.",
  email_type: "eoc",
  dealer: HONDA_DTLA,
  campaign: {
    id: "cmp_spring_inv_2026",
    name: "Spring Inventory Clearance — May 2026",
    audience_size: 6840,
    contactable: 5200,
    opted_out: 240,
    sends: 5200,
    dials: 4187,
    messages: 1013,
    start_date: "2026-04-15",
    end_date: "2026-05-12",
  },
  headline: {
    appts: 634,
    contactable: 5200,
    conversion_pct: 12.2,
    opt_in_booked_pct: 33,
  },
  conversion_funnel: {
    reached_leads: 4214,
    contacted: 1928,
    appointments: 634,
    abr_pct: 32.9, // 634 / 1928 contacted = 32.9%
  },
  per_touchpoint: [
    { touchpoint: "Initial call", first_touch_appt_pct: 34, last_touch_appt_pct: 18 },
    { touchpoint: "SMS follow-up #1", first_touch_appt_pct: 22, last_touch_appt_pct: 41 },
    { touchpoint: "SMS follow-up #2", first_touch_appt_pct: 11, last_touch_appt_pct: 24 },
    { touchpoint: "Final call attempt", first_touch_appt_pct: 33, last_touch_appt_pct: 17 },
  ],
  multichannel: [
    { channel: "call", conversations: 2814, engagement_pct: 42, appts: 318 },
    { channel: "sms", conversations: 1287, engagement_pct: 51, appts: 241 },
    { channel: "email", conversations: 113, engagement_pct: 28, appts: 75 },
  ],
  outcome_distribution: [
    { outcome: "appointment_booked", count: 634, pct: 12.2 },
    { outcome: "follow_up", count: 891, pct: 17.1 },
    { outcome: "no_response", count: 2841, pct: 54.6 },
    { outcome: "opted_out", count: 240, pct: 4.6 },
    { outcome: "dnc", count: 18, pct: 0.3 },
    { outcome: "lost", count: 576, pct: 11.1 },
  ],
  // v4: rendered as "Top exit intents" — data shape unchanged from v2 (label
  // change only). Auto-extracted from conversation transcripts.
  top_objections: [
    { objection: "Not in market right now", count: 412 },
    { objection: "Vehicle purchased elsewhere", count: 287 },
    { objection: "Awaiting next model year", count: 198 },
    { objection: "Price out of range", count: 84 },
    { objection: "Opted out / DNC", count: 62 },
  ],
  // v4: `conversion_by_vehicle_or_service` and `recommendations` removed from
  // schema and from this scenario per §9.4.
};

// ============================================================================
// 2. NORMAL — With opt-in value estimate appendix
// ============================================================================
export const EOC_WITH_ESTIMATE: EOCData = {
  ...EOC_NORMAL,
  scenario_id: "eoc-with-estimate",
  scenario_name: "EOC + dealer-configured value estimate appendix",
  scenario_notes:
    "Honda DTLA has avg_appointment_value=$850. Optional appendix at bottom of report renders the dealer's own estimate.",
  value_estimate_appendix: {
    appts: 634,
    avg_appointment_value: 850,
    influenced_amount: 538900,
  },
};

// ============================================================================
// 3. EDGE: Audiences exhausted — short report
// ============================================================================
export const EOC_AUDIENCES_EXHAUSTED: EOCData = {
  scenario_id: "eoc-audiences-exhausted",
  scenario_name: "Campaign ended because all audiences exhausted",
  scenario_notes:
    "All OB audiences hit the end. Inline note prompts dealer to upload a new list before next campaign. Headline still leads with appointments.",
  email_type: "eoc",
  dealer: ANDERSON_AUTO_GROUP,
  campaign: {
    id: "cmp_service_loyalty_apr",
    name: "Service Loyalty — April 2026",
    audience_size: 1840,
    contactable: 1414,
    opted_out: 92,
    sends: 1414,
    dials: 1402,
    messages: 312,
    start_date: "2026-04-01",
    end_date: "2026-04-28",
  },
  headline: {
    appts: 184,
    contactable: 1414,
    conversion_pct: 13.0,
    opt_in_booked_pct: 41,
  },
  conversion_funnel: {
    reached_leads: 1182,
    contacted: 542,
    appointments: 184,
    abr_pct: 33.9, // 184 / 542 contacted
  },
  per_touchpoint: [
    { touchpoint: "Initial SMS", first_touch_appt_pct: 41, last_touch_appt_pct: 22 },
    { touchpoint: "Call follow-up", first_touch_appt_pct: 31, last_touch_appt_pct: 48 },
    { touchpoint: "SMS reminder", first_touch_appt_pct: 28, last_touch_appt_pct: 30 },
  ],
  multichannel: [
    { channel: "sms", conversations: 891, engagement_pct: 48, appts: 102 },
    { channel: "call", conversations: 723, engagement_pct: 38, appts: 82 },
  ],
  outcome_distribution: [
    { outcome: "appointment_booked", count: 184, pct: 13.0 },
    { outcome: "follow_up", count: 287, pct: 20.3 },
    { outcome: "no_response", count: 640, pct: 45.3 },
    { outcome: "opted_out", count: 92, pct: 6.5 },
    { outcome: "lost", count: 211, pct: 14.9 },
  ],
  top_objections: [
    { objection: "Vehicle serviced elsewhere", count: 184 },
    { objection: "Vehicle sold or traded", count: 91 },
    { objection: "Not due for service yet", count: 67 },
  ],
};

export const ALL_EOC_SCENARIOS: EOCData[] = [
  EOC_NORMAL,
  EOC_WITH_ESTIMATE,
  EOC_AUDIENCES_EXHAUSTED,
];

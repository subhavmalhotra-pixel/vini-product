import type { MonthlyData } from "../schema";
import { HONDA_DTLA, TOYOTA_TAMPA } from "../dealers";
import {
  STORY_MULTI_TOUCH,
  STORY_AT_RISK_SAVE,
  STORY_LAPSED_REENGAGEMENT,
} from "../conversations";

// ============================================================================
// 1. NORMAL — Work Delivered framing, no $ in default
// ============================================================================
export const MONTHLY_NORMAL: MonthlyData = {
  scenario_id: "monthly-normal",
  scenario_name: "Work Delivered framing — default (no $)",
  scenario_notes:
    "v2 hero: reduced verbiage, three large stat tiles instead of a paragraph. Six-month trend moves above the customer stories. Stories now follow the trend, not precede it.",
  email_type: "monthly",
  dealer: TOYOTA_TAMPA,
  reporting_month: "April 2026",
  hero: {
    // v2: short, visual headline. Render shows three big stat tiles, not a paragraph.
    headline: "Across 2,956 conversations",
    unique_customers: 1420,
    total_conversations: 2956,
    bdc_hours_equivalent: 340,
    appts_booked: 147,
    lapsed_reengaged: 47,
    after_hours_booked: 63,
  },
  kpi_grid: [
    { label: "Unique customers reached", primary_value: 1420, delta: 8.4, delta_label: "MoM" },
    { label: "Appointments booked", primary_value: 147, delta: 6.5, delta_label: "MoM" },
    { label: "After-hours appointments", primary_value: 63, delta: 12.5, delta_label: "MoM" },
    { label: "Lapsed re-engagements", primary_value: 47, delta: -3.0, delta_label: "MoM" },
    { label: "Avg first-contact time", primary_value: "52s", delta: -8.2, delta_label: "MoM" },
    { label: "BDC-hours equivalent", primary_value: "340h", delta: 9.1, delta_label: "MoM" },
  ],
  customer_centric: {
    unique: 1420,
    pct_new: 64,
    pct_returning: 36,
    avg_touches: 2.4,
    lapsed_reengaged: 47,
  },
  multichannel_mix: [
    { channel: "call", share_pct: 48, mom_shift: -2.0 },
    { channel: "sms", share_pct: 28, mom_shift: 3.5 },
    { channel: "chat", share_pct: 18, mom_shift: 1.0 },
    { channel: "email", share_pct: 6, mom_shift: -2.5 },
  ],
  stories: [
    {
      journey: STORY_MULTI_TOUCH,
      badge: "Highest-value path",
      summary:
        "Across two weeks and nine touches spanning call, SMS, and email, the agent moved a hesitant trade-in inquiry to a confirmed Saturday test drive on a Pilot Touring. The conversion required a real trade evaluation midstream rather than a generic 'we'll match KBB' line — the dealer's structurally-checked offer was the unlock.",
      summary_source: "ai_haiku",
    },
    {
      journey: STORY_AT_RISK_SAVE,
      badge: "Saved after 6 turns",
      summary:
        "A price-objection chat could easily have closed lost. Instead, two well-timed follow-ups across SMS and a confirming call landed a Saturday test drive on the LX trim — no pricing concession, just careful trim-and-term matching against the customer's stated monthly target.",
      summary_source: "ai_haiku",
    },
    {
      journey: STORY_LAPSED_REENGAGEMENT,
      badge: "Best after-hours save",
      summary:
        "A 7:42 PM SMS to a customer who had been silent for 18 months opened a quick two-touch conversation that landed a Saturday maintenance appointment by 8:11 PM. The free multi-point inspection offer landed without a callback or human handover.",
      summary_source: "ai_haiku",
    },
  ],
  six_month_trend: [
    { month: "Nov", appts: 102, store_total: 215 },
    { month: "Dec", appts: 115, store_total: 232 },
    { month: "Jan", appts: 121, store_total: 246 },
    { month: "Feb", appts: 128, store_total: 251 },
    { month: "Mar", appts: 138, store_total: 268 },
    { month: "Apr", appts: 147, store_total: 274 },
  ],
};

// ============================================================================
// 2. NORMAL — With dealer-configured value estimate
// ============================================================================
export const MONTHLY_WITH_ESTIMATE: MonthlyData = {
  ...MONTHLY_NORMAL,
  scenario_id: "monthly-with-estimate",
  scenario_name: "Work Delivered + optional 'Your value estimate' sidebar",
  scenario_notes:
    "Honda DTLA has configured avg_appointment_value=$850. Optional sidebar renders with explicit 'this is the dealer's own estimate, not Vini's claim' label.",
  dealer: HONDA_DTLA,
  reporting_month: "April 2026",
  value_estimate_sidebar: {
    appts: 147,
    avg_appointment_value: 850,
    influenced_amount: 124950,
  },
};

// ============================================================================
// 3. EDGE: All 3 stories fall back — story block empty
// ============================================================================
export const MONTHLY_NO_STORIES: MonthlyData = {
  ...MONTHLY_NORMAL,
  scenario_id: "monthly-no-stories",
  scenario_name: "All 3 story summaries fell back — section omitted",
  scenario_notes:
    "Edge: every Haiku call failed PII or content check. Stories array is empty. Rest of email ships normally.",
  stories: [],
};

export const ALL_MONTHLY_SCENARIOS: MonthlyData[] = [
  MONTHLY_NORMAL,
  MONTHLY_WITH_ESTIMATE,
  MONTHLY_NO_STORIES,
];

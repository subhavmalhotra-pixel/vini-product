/**
 * Mock data for the Phase 2 platform UI.
 *
 * Engineers wiring real backend: replace these constants with API calls
 * matching the same shapes.
 */
import { RECIPIENTS_HONDA_DTLA, HONDA_DTLA } from "@test-data/dealers";
import {
  STORY_AT_RISK_SAVE,
  STORY_RECALL_ESCALATION,
  STORY_LAPSED_REENGAGEMENT,
  STORY_MULTI_TOUCH,
} from "@test-data/conversations";

export const ACTIVE_DEALER = HONDA_DTLA;
export const ACTIVE_RECIPIENTS = RECIPIENTS_HONDA_DTLA;

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard KPI snapshot — trailing 7 days
// ─────────────────────────────────────────────────────────────────────────────
export const DASHBOARD_SNAPSHOT = {
  reporting_period_label: "Last 7 days",
  reporting_period_range: "May 7 – May 13, 2026",
  total_calls: { value: 412, delta: 8.2 },
  inbound_calls: { value: 287, delta: 4.7 },
  outbound_calls: { value: 125, delta: 15.1 },
  after_hours_calls: { value: 84, delta: 12.4 },
  bdc_hours_equivalent: { value: 31.5, delta: 9.8 },
};

export const APPOINTMENT_FUNNEL = {
  set: { count: 94, label: "Appointments set" },
  showed: { count: 71, label: "Showed", conversion_pct: 76 },
  closed: { count: 22, label: "Closed", conversion_pct: 31 },
};

export const AFTER_HOURS_BREAKDOWN = [
  { outcome: "Appointments booked", count: 18 },
  { outcome: "Callback requested", count: 24 },
  { outcome: "Voicemail / no engagement", count: 42 },
];

export const AI_INSIGHT_TEXT =
  "This week, your inbound volume rose 5% with appointment-set conversion holding above 30%. After-hours engagement is up 12%, driven mostly by chat and SMS overnight. Service-side ABR improved 3 points, while outbound campaign 'Spring Inventory Clearance' is at 47% audience reach with 64 appointments influenced so far.";

// ─────────────────────────────────────────────────────────────────────────────
// Hot leads — top 8 most active leads this week
// Mapped to existing ConversationJourney fixtures so leadId routes resolve.
// ─────────────────────────────────────────────────────────────────────────────
export type HotLead = {
  id: string;
  customer_ref: string; // anonymized
  intent: string;
  channels: string[];
  last_touch: string;
  touches: number;
  status: "Hot" | "Warm" | "Awaiting response" | "Booked";
  vehicle?: string;
  journey_id: string;
};

export const HOT_LEADS: HotLead[] = [
  {
    id: STORY_AT_RISK_SAVE.journey_id,
    customer_ref: "Customer JD-4218",
    intent: "Civic 2025 — payment concerns",
    channels: ["chat", "sms", "call"],
    last_touch: "May 9 · 10:34 AM",
    touches: 6,
    status: "Booked",
    vehicle: "Honda Civic LX 2025",
    journey_id: STORY_AT_RISK_SAVE.journey_id,
  },
  {
    id: STORY_MULTI_TOUCH.journey_id,
    customer_ref: "Customer DA-0220",
    intent: "Trade-in + Pilot Touring",
    channels: ["call", "sms", "email"],
    last_touch: "May 7 · 4:01 PM",
    touches: 9,
    status: "Booked",
    vehicle: "Honda Pilot Touring 2024",
    journey_id: STORY_MULTI_TOUCH.journey_id,
  },
  {
    id: STORY_LAPSED_REENGAGEMENT.journey_id,
    customer_ref: "Customer LP-0117",
    intent: "Service lapse re-engagement",
    channels: ["sms"],
    last_touch: "May 7 · 8:11 PM",
    touches: 2,
    status: "Booked",
    vehicle: "Honda CR-V 2022",
    journey_id: STORY_LAPSED_REENGAGEMENT.journey_id,
  },
  {
    id: STORY_RECALL_ESCALATION.journey_id,
    customer_ref: "Customer RH-0181",
    intent: "Takata recall — 2017 Tacoma",
    channels: ["call"],
    last_touch: "May 9 · 8:13 AM",
    touches: 3,
    status: "Booked",
    vehicle: "Toyota Tacoma 2017",
    journey_id: STORY_RECALL_ESCALATION.journey_id,
  },
  {
    id: "lead-005",
    customer_ref: "Customer KH-9912",
    intent: "Accord 2025 inquiry",
    channels: ["chat"],
    last_touch: "May 12 · 2:17 PM",
    touches: 1,
    status: "Awaiting response",
    vehicle: "Honda Accord 2025",
    journey_id: STORY_AT_RISK_SAVE.journey_id,
  },
  {
    id: "lead-006",
    customer_ref: "Customer MR-3340",
    intent: "Service callback — brake noise",
    channels: ["call", "sms"],
    last_touch: "May 11 · 11:45 AM",
    touches: 3,
    status: "Warm",
    vehicle: "Honda Pilot 2022",
    journey_id: STORY_RECALL_ESCALATION.journey_id,
  },
  {
    id: "lead-007",
    customer_ref: "Customer TS-7711",
    intent: "Lease-end options — Civic",
    channels: ["email", "call"],
    last_touch: "May 10 · 9:02 AM",
    touches: 4,
    status: "Hot",
    vehicle: "Honda Civic 2022",
    journey_id: STORY_MULTI_TOUCH.journey_id,
  },
  {
    id: "lead-008",
    customer_ref: "Customer GR-5520",
    intent: "Trade-in valuation",
    channels: ["sms"],
    last_touch: "May 13 · 3:38 PM",
    touches: 1,
    status: "Awaiting response",
    vehicle: "Honda Odyssey 2020",
    journey_id: STORY_MULTI_TOUCH.journey_id,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Subscription editing — section toggles available per email type
// ─────────────────────────────────────────────────────────────────────────────
export type SectionToggle = { key: string; label: string; description: string };

export const SECTION_TOGGLES_BY_EMAIL: Record<string, SectionToggle[]> = {
  daily: [
    { key: "hero", label: "Yesterday + MTD hero", description: "Top appointment summary tiles." },
    { key: "action_required", label: "Action queue", description: "List of items needing human follow-up." },
    { key: "inbound_kpis", label: "Inbound KPI strip", description: "First-contact time, engagement rate, intent." },
    { key: "top_vehicles", label: "Top vehicles / intents", description: "Top 4 vehicles or service intents." },
    { key: "outbound", label: "Outbound block", description: "Connect rate + active campaigns." },
    { key: "after_hours", label: "After-hours coverage", description: "Leads engaged + appointments booked overnight." },
  ],
  weekly: [
    { key: "kpi_strip", label: "Per-agent KPI strip", description: "4 KPIs per agent with WoW deltas." },
    { key: "trend_table", label: "Day-by-day trend", description: "Channel split by weekday." },
    { key: "funnel", label: "Customer journey funnel", description: "Reached → engaged → converted." },
    { key: "channel_performance", label: "Channel performance", description: "Call / SMS / chat comparison." },
    { key: "top_breakout", label: "Top vehicles or services", description: "Ranked list with counts." },
    { key: "story", label: "Story of the week", description: "One narrated customer journey." },
  ],
  monthly: [
    { key: "hero", label: "Work delivered headline", description: "Conversations handled summary." },
    { key: "kpi_grid", label: "6-card KPI grid", description: "MoM deltas across core metrics." },
    { key: "value_estimate", label: "Your value estimate sidebar", description: "Optional; renders only if appointment value is set." },
    { key: "customer_centric", label: "Customer-centric view", description: "New vs returning, lapsed re-engagements." },
    { key: "stories", label: "3 customer stories", description: "Anonymized customer journeys." },
    { key: "trend_chart", label: "6-month trend", description: "Appointments over the trailing 6 months." },
  ],
  eoc: [
    { key: "headline", label: "Appointments + conversion headline", description: "Lead with the operational story." },
    { key: "funnel", label: "Reach funnel", description: "Reached → engaged → booked → showed." },
    { key: "touchpoint", label: "Per-touchpoint performance", description: "First and last-touch attribution." },
    { key: "multichannel", label: "Multichannel performance", description: "Channel comparison for this campaign." },
    { key: "objections", label: "Top objections heard", description: "Auto-extracted recurring objections." },
    { key: "recommendations", label: "Recommendations", description: "Auto-generated next-campaign hints." },
  ],
};

export const EMAIL_TYPE_LABELS: Record<string, string> = {
  daily: "Daily digest",
  weekly: "Weekly performance",
  monthly: "Monthly value report",
  eoc: "End-of-campaign report",
};

// ─────────────────────────────────────────────────────────────────────────────
// Date-range presets for the dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const DATE_RANGES = [
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "mtd", label: "Month to date" },
  { key: "custom", label: "Custom" },
];

export const DEFAULT_DATE_RANGE = "7d";

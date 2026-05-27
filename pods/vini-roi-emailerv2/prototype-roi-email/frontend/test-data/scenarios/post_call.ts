import type { PostCallSummaryData } from "../schema";
import { HONDA_DTLA, TOYOTA_TAMPA } from "../dealers";

// =============================================================================
// POST-CALL SUMMARY — event-triggered emailer
//
// Sent automatically after every call where Vini generated either:
//   (a) an action item, OR
//   (b) an appointment, OR
//   (c) both.
//
// This single emailer template renders into 3 variants based on what was
// generated. The component (`PostCallSummary.tsx`) reads the optional
// `appointment` block and the `action_items` array to decide what to show:
//
//   ┌─────────────────────────────────────────────┬────────────────────┐
//   │ Scenario                                    │ Template variant   │
//   ├─────────────────────────────────────────────┼────────────────────┤
//   │ appointment !== undefined && AI.length > 0  │ BOTH               │
//   │ appointment === undefined && AI.length > 0  │ ONLY ACTION ITEMS  │
//   │ appointment !== undefined && AI.length === 0│ ONLY APPOINTMENT   │
//   └─────────────────────────────────────────────┴────────────────────┘
//
// (A 4th case — neither — is excluded by the trigger rule: the email simply
// doesn't fire if nothing was generated.)
// =============================================================================

// -----------------------------------------------------------------------------
// 1. BOTH — appointment created AND action items generated
//    (matches the PDF reference exactly)
// -----------------------------------------------------------------------------
export const POST_CALL_BOTH: PostCallSummaryData = {
  scenario_id: "post-call-both",
  scenario_name: "Post-call · BOTH (appointment + action items)",
  scenario_notes:
    "Inbound Sales call — Jane Smith asked about family SUVs, showed interest in a 2025 Toyota Grand Highlander Hybrid. Vini generated a test-drive appointment AND a follow-up action item to schedule the test drive. Matches the reference PDF design.",
  email_type: "post_call",
  dealer: HONDA_DTLA,

  dept_label: "Sales Inbound",
  agent_type: "sales_ib",

  call_subject: "Inquiry and Test Drive Interest for Used Family SUVs",
  agent_name: "AI Agent",
  call_started_at: "2026-05-20T20:19:00-07:00",
  call_duration_sec: 118, // 01 mins 58 s

  customer: {
    name: "Jane Smith",
    phone: "+13254425695",
    ai_call_score: 90,
    ai_call_score_label: "Excellent",
    sentiment: "neutral",
  },

  intent_label: "General Sales Inquiry",
  deal_value_usd: 0,

  appointment: {
    label: "Test Drive Appointment",
    schedule: "Not scheduled",
    vehicle: "Not specified",
  },

  action_items: [
    {
      title: "Schedule Test Drive",
      due_at: "2026-05-21T17:00:00-07:00",
    },
  ],

  summary: {
    key_takeaways: [
      "Jane called to inquire about family cars available in the inventory.",
      "She is looking for a reliable vehicle with ample cargo space for family trips.",
      "She showed interest in the 2025 Toyota Grand Highlander Hybrid and plans to visit for a test drive.",
    ],
    topics: [
      {
        name: "Used family SUVs inquiry",
        description:
          "Jane asked about used family cars, focusing on SUVs and minivans with reliability and cargo space for family trips.",
      },
      {
        name: "Vehicle options provided",
        description:
          "The assistant shared available used SUVs including Hyundai Santa Fe, Toyota Grand Highlander Hybrid, and others with details on features and pricing.",
      },
      {
        name: "Test drive interest expressed",
        description:
          "Jane showed interest in visiting the dealership and test driving the family SUV but did not confirm booking an appointment.",
      },
    ],
  },
};

// -----------------------------------------------------------------------------
// 2. ONLY ACTION ITEMS — no appointment was generated, but follow-up needed
// -----------------------------------------------------------------------------
export const POST_CALL_ONLY_ACTION: PostCallSummaryData = {
  scenario_id: "post-call-only-action",
  scenario_name: "Post-call · ONLY action items (no appointment)",
  scenario_notes:
    "Service Inbound call — Marcus Reyes asked about an open recall and a pricing quote for the 60k-mile service. Vini handled the inquiry but couldn't book — recall verification + quote both require human follow-up. No appointment block rendered; the Action Items block lists both follow-ups.",
  email_type: "post_call",
  dealer: TOYOTA_TAMPA,

  dept_label: "Service Inbound",
  agent_type: "service_ib",

  call_subject: "Recall Question + Quote Request on 60k Service",
  agent_name: "AI Agent",
  call_started_at: "2026-05-22T10:42:00-07:00",
  call_duration_sec: 167, // 02 mins 47 s

  customer: {
    name: "Marcus Reyes",
    phone: "+18139217044",
    ai_call_score: 86,
    ai_call_score_label: "Excellent",
    sentiment: "neutral",
  },

  intent_label: "Recall Inquiry · Service Quote",
  deal_value_usd: 0,

  // No appointment — recall verification must precede booking
  appointment: undefined,

  action_items: [
    {
      title: "Verify Takata airbag recall against customer VIN",
      due_at: "2026-05-22T18:00:00-07:00",
    },
    {
      title: "Send itemized 60k-mile service quote",
      due_at: "2026-05-23T17:00:00-07:00",
    },
  ],

  summary: {
    key_takeaways: [
      "Marcus called to confirm whether his 2020 Toyota Camry is affected by the Takata airbag recall.",
      "He also requested an itemized quote for the upcoming 60,000-mile service.",
      "He plans to book a service appointment once the recall is confirmed and the quote is reviewed.",
    ],
    topics: [
      {
        name: "Recall eligibility question",
        description:
          "Marcus referenced a recall notice he received and asked whether his vehicle is affected. The agent collected the VIN and committed to verification by an advisor.",
      },
      {
        name: "60k-mile service quote",
        description:
          "Marcus asked for an itemized estimate covering brakes, fluids, and inspection items. The agent confirmed the service desk would email the quote by end of day.",
      },
      {
        name: "Appointment deferred",
        description:
          "Marcus declined to book the service appointment until both the recall status and the quote are confirmed.",
      },
    ],
  },
};

// -----------------------------------------------------------------------------
// 3. ONLY APPOINTMENT — appointment booked end-to-end in the call, no follow-up
// -----------------------------------------------------------------------------
export const POST_CALL_ONLY_APPT: PostCallSummaryData = {
  scenario_id: "post-call-only-appt",
  scenario_name: "Post-call · ONLY appointment (no action items)",
  scenario_notes:
    "Service Inbound call — Aisha Lin booked her annual maintenance entirely in-call. Vini confirmed the time slot, advisor, and vehicle; no human follow-up needed. Action Items block is hidden; the Appointment block carries the booked details.",
  email_type: "post_call",
  dealer: TOYOTA_TAMPA,

  dept_label: "Service Inbound",
  agent_type: "service_ib",

  call_subject: "Annual Maintenance Appointment Booked",
  agent_name: "AI Agent",
  call_started_at: "2026-05-22T14:08:00-07:00",
  call_duration_sec: 92, // 01 mins 32 s

  customer: {
    name: "Aisha Lin",
    phone: "+18135558420",
    ai_call_score: 94,
    ai_call_score_label: "Excellent",
    sentiment: "positive",
  },

  intent_label: "Service Appointment",
  deal_value_usd: 320,

  appointment: {
    label: "Annual Maintenance Appointment",
    schedule: "24 May 2026 · 9:30 AM",
    vehicle: "2023 Toyota RAV4 Hybrid (VIN ···F814)",
  },

  // Booked end-to-end — no human follow-up required
  action_items: [],

  summary: {
    key_takeaways: [
      "Aisha called to book her annual maintenance for her 2023 RAV4 Hybrid.",
      "She confirmed the next-available Saturday morning slot with advisor Priya.",
      "Appointment was booked and confirmed entirely in-call — no follow-up needed.",
    ],
    topics: [
      {
        name: "Service appointment request",
        description:
          "Aisha asked for the next-available Saturday morning slot for her annual maintenance.",
      },
      {
        name: "Slot confirmation",
        description:
          "The agent offered May 24 at 9:30 AM with advisor Priya, which Aisha accepted.",
      },
      {
        name: "Confirmation sent",
        description:
          "An SMS confirmation was dispatched to the customer's preferred number; calendar entry added to the service team's schedule.",
      },
    ],
  },
};

export const ALL_POST_CALL_SCENARIOS: PostCallSummaryData[] = [
  POST_CALL_BOTH,
  POST_CALL_ONLY_ACTION,
  POST_CALL_ONLY_APPT,
];

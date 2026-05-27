import type { ActionItem, IntentId, ResolutionType, Channel } from "./schema";

/**
 * Bulk-generated completed action items — to demonstrate the Completed view at
 * scale (search · facet · bucket · bulk action). Deterministic — no Math.random
 * so HMR doesn't churn.
 */

const CUSTOMER_POOL: { id: string; name: string }[] = [
  { id: "c-gary-wise", name: "Gary Wise" },
  { id: "c-daniela-ruiz", name: "Daniela Ruiz" },
  { id: "c-amir-mehta", name: "Amir Mehta" },
  { id: "c-jenna-clarke", name: "Jenna Clarke" },
  { id: "c-rob-stearns", name: "Rob Stearns" },
  { id: "c-lauren-ng", name: "Lauren Ng" },
  { id: "c-marco-torres", name: "Marco Torres" },
  { id: "c-sara-kapoor", name: "Sara Kapoor" },
  { id: "c-tom-wallace", name: "Tom Wallace" },
  { id: "c-elise-park", name: "Elise Park" },
  { id: "c-hist-001", name: "Aaron Walters" },
  { id: "c-hist-002", name: "Beatrice Yi" },
  { id: "c-hist-003", name: "Carmen Solis" },
  { id: "c-hist-004", name: "Derek Huang" },
  { id: "c-hist-005", name: "Erica Foster" },
  { id: "c-hist-006", name: "Francisco Diaz" },
  { id: "c-hist-007", name: "Grace Whitmore" },
  { id: "c-hist-008", name: "Hassan Akhtar" },
  { id: "c-hist-009", name: "Ingrid Olsen" },
  { id: "c-hist-010", name: "Jamal Reeves" },
  { id: "c-hist-011", name: "Karina Vasquez" },
  { id: "c-hist-012", name: "Liam Boucher" },
  { id: "c-hist-013", name: "Maya Patel" },
  { id: "c-hist-014", name: "Nathan Greene" },
  { id: "c-hist-015", name: "Olivia Chan" },
  { id: "c-hist-016", name: "Pascal Romero" },
  { id: "c-hist-017", name: "Quinn Mahoney" },
  { id: "c-hist-018", name: "Rita Sandoval" },
  { id: "c-hist-019", name: "Sami Lindgren" },
  { id: "c-hist-020", name: "Theo Brennan" },
];

const CLOSERS = [
  "u-anya",
  "u-priya",
  "u-marcus",
  "u-david",
  "u-lane",
  "u-trevor",
  "vini_agent",
  "u-edgar",
];

const INTENT_POOL: { id: IntentId; recap: string; resolutions: { type: ResolutionType; note: string }[] }[] = [
  {
    id: "pricing_quote",
    recap: "The customer asked for a service pricing quote.",
    resolutions: [
      { type: "info_provided", note: "Sent itemized quote via email; awaiting confirmation." },
      { type: "appointment_booked", note: "Customer accepted quote and booked service appointment for next week." },
      { type: "customer_unreachable", note: "Called twice; left voicemail. Will retry next week." },
    ],
  },
  {
    id: "recall_response",
    recap: "The customer has an open recall and wants verification before booking.",
    resolutions: [
      { type: "appointment_booked", note: "Verified VIN eligibility; booked recall service for Tuesday morning." },
      { type: "info_provided", note: "VIN not affected by recall; sent courtesy explanation via email." },
    ],
  },
  {
    id: "callback_request",
    recap: "The customer wants a callback regarding a lease inquiry.",
    resolutions: [
      { type: "info_provided", note: "Called customer back; provided lease terms and follow-up materials." },
      { type: "customer_unreachable", note: "Left voicemail twice; no response. Closed pending future contact." },
      { type: "appointment_booked", note: "Spoke with customer; booked dealership visit for Saturday." },
    ],
  },
  {
    id: "status_update",
    recap: "The customer wants a status update on their service repair.",
    resolutions: [
      { type: "info_provided", note: "Pulled latest RO from service system; SMS'd the customer with status." },
      { type: "info_provided", note: "Spoke directly; advisor confirmed parts will arrive Thursday." },
    ],
  },
  {
    id: "appointment_inquiry",
    recap: "The customer wants to book or move an appointment.",
    resolutions: [
      { type: "appointment_booked", note: "Booked customer for Friday 9 AM, confirmation sent." },
      { type: "customer_unreachable", note: "Called twice; could not reach. Sent reminder via SMS." },
    ],
  },
  {
    id: "vehicle_inquiry",
    recap: "The customer is shopping for a vehicle and wants inventory.",
    resolutions: [
      { type: "info_provided", note: "Sent current GLC 300 inventory list with photos and prices." },
      { type: "appointment_booked", note: "Customer wanted to test drive; booked Saturday visit." },
    ],
  },
  {
    id: "trade_in_inquiry",
    recap: "The customer wants a trade-in valuation on their current vehicle.",
    resolutions: [
      { type: "info_provided", note: "Trade desk provided structured offer via email; customer reviewing." },
    ],
  },
  {
    id: "service_intent",
    recap: "The customer is interested in a service line and qualification.",
    resolutions: [
      { type: "appointment_booked", note: "Booked oil change appointment for next Wednesday." },
      { type: "info_provided", note: "Sent service menu; customer will follow up." },
    ],
  },
  {
    id: "specific_salesperson",
    recap: "The customer is asking for a specific named adviser.",
    resolutions: [
      { type: "info_provided", note: "Routed to David Park; he reached out within the hour." },
    ],
  },
  {
    id: "compliance_alert",
    recap: "Customer requested DNC and opt-out from all marketing.",
    resolutions: [
      { type: "dnc", note: "Flagged customer as DNC in CRM, removed from all marketing audiences." },
    ],
  },
  {
    id: "no_show",
    recap: "The customer missed their scheduled appointment.",
    resolutions: [
      { type: "appointment_booked", note: "Customer rescheduled for next available slot." },
      { type: "customer_unreachable", note: "Could not reach; flagged for outbound campaign follow-up." },
    ],
  },
  {
    id: "complaint",
    recap: "The customer expressed frustration about a prior service experience.",
    resolutions: [
      { type: "info_provided", note: "Service manager spoke with customer; offered complimentary follow-up." },
      { type: "other", note: "Escalated to GM; customer satisfied with resolution." },
    ],
  },
];

const CHANNEL_CYCLE: Channel[] = ["call", "sms", "email", "chat", "hitl_warm_transfer", "call", "call", "sms"];

// Anchored "today" used by the prototype (matches NOW_ISO in customers.ts)
const NOW = new Date("2026-05-19T15:30:00-07:00").getTime();
const HOUR_MS = 3_600_000;

function isoMinusHours(hours: number): string {
  return new Date(NOW - hours * HOUR_MS).toISOString();
}

/** Pseudo-random based on index — deterministic so HMR is stable. */
function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

const TOTAL_ITEMS = 187;

export const COMPLETED_HISTORY: ActionItem[] = Array.from({ length: TOTAL_ITEMS }, (_, idx) => {
  // Spread items across the last 60 days
  const daysAgo = (idx * 0.32) % 60;
  const createdHoursAgo = daysAgo * 24 + (idx % 13);
  const resolveLatencyHours = 0.5 + (idx % 47) * 0.45; // 0.5h to ~21h spread

  const customer = pick(CUSTOMER_POOL, idx * 7);
  const intentEntry = pick(INTENT_POOL, idx * 3 + Math.floor(idx / 4));
  const resolution = pick(intentEntry.resolutions, idx + customer.name.length);
  const closer = pick(CLOSERS, idx * 5 + intentEntry.id.length);
  const channel = pick(CHANNEL_CYCLE, idx);

  return {
    action_item_id: `ai-hist-${String(idx + 200).padStart(4, "0")}`,
    customer_id: customer.id,
    source_conversation_id: `conv-hist-${String(idx + 200).padStart(4, "0")}`,
    source_channel: channel,
    intent_id: intentEntry.id,
    is_primary_intent_of_source: idx % 5 !== 0, // most are primary
    intent_recap: intentEntry.recap,
    created_at: isoMinusHours(createdHoursAgo),
    created_by_ai: idx % 17 !== 0, // ~94% AI, rest deterministic
    status: "completed" as const,
    assignee_user_id: closer,
    assigned_at: isoMinusHours(createdHoursAgo - 0.1),
    assigned_by_user_id: "u-trevor",
    closed_at: isoMinusHours(createdHoursAgo - resolveLatencyHours),
    closed_by_user_id: closer,
    resolution_note: resolution.note,
    resolution_type: resolution.type,
    repeat_caller_count: 0,
    last_observed_at: isoMinusHours(createdHoursAgo),
    surfaced_in_emails:
      idx % 9 === 0
        ? [
            {
              email_send_id: `email-2026-hist-${idx}`,
              email_type: "daily" as const,
              surfaced_at: isoMinusHours(createdHoursAgo - 2),
              cta_clicked: idx % 18 === 0,
            },
          ]
        : [],
  };
});

/**
 * Intent taxonomy (PRD §10.5) — Phase 1 fixed list of 14 intents.
 * Mirrors `prototype/ai-harness/taxonomy.py` exactly. Keep them in lockstep.
 */
import type { IntentMeta } from "./schema";

export const INTENT_TAXONOMY: Record<string, IntentMeta> = {
  pricing_quote: {
    id: "pricing_quote",
    display_name: "Pricing or quote",
    dept: "both",
    typical_resolution: "Adviser to call back with quote",
    sla_hours: 24,
    sla_business_hours_only: false,
  },
  recall_response: {
    id: "recall_response",
    display_name: "Recall inquiry",
    dept: "service",
    typical_resolution: "VIN-verify + book appointment",
    sla_hours: 4,
    sla_business_hours_only: false,
  },
  callback_request: {
    id: "callback_request",
    display_name: "Callback request",
    dept: "both",
    typical_resolution: "Rep calls back within SLA",
    sla_hours: 4,
    sla_business_hours_only: true,
  },
  status_update: {
    id: "status_update",
    display_name: "Status update",
    dept: "service",
    typical_resolution: "Look up RO, reply with status",
    sla_hours: 8,
    sla_business_hours_only: true,
  },
  appointment_inquiry: {
    id: "appointment_inquiry",
    display_name: "Appointment",
    dept: "both",
    typical_resolution: "Confirm slot, book",
    sla_hours: 24,
    sla_business_hours_only: false,
  },
  service_intent: {
    id: "service_intent",
    display_name: "Service intent",
    dept: "service",
    typical_resolution: "Reach out, qualify, book",
    sla_hours: 24,
    sla_business_hours_only: false,
  },
  vehicle_inquiry: {
    id: "vehicle_inquiry",
    display_name: "Vehicle inquiry",
    dept: "sales",
    typical_resolution: "Adviser engagement",
    sla_hours: 24,
    sla_business_hours_only: false,
  },
  trade_in_inquiry: {
    id: "trade_in_inquiry",
    display_name: "Trade-in inquiry",
    dept: "sales",
    typical_resolution: "Trade desk to provide structured offer",
    sla_hours: 24,
    sla_business_hours_only: false,
  },
  complaint: {
    id: "complaint",
    display_name: "Complaint",
    dept: "both",
    typical_resolution: "Manager to handle",
    sla_hours: 4,
    sla_business_hours_only: false,
  },
  sms_takeover: {
    id: "sms_takeover",
    display_name: "SMS takeover",
    dept: "both",
    typical_resolution: "Human continues thread",
    sla_hours: 4,
    sla_business_hours_only: false,
  },
  specific_salesperson: {
    id: "specific_salesperson",
    display_name: "Named adviser",
    dept: "sales",
    typical_resolution: "Route to named adviser",
    sla_hours: 24,
    sla_business_hours_only: false,
  },
  compliance_alert: {
    id: "compliance_alert",
    display_name: "Compliance alert",
    dept: "compliance",
    typical_resolution: "Compliance officer review",
    sla_hours: 4,
    sla_business_hours_only: false,
  },
  no_show: {
    id: "no_show",
    display_name: "No-show",
    dept: "service",
    typical_resolution: "BDC follows up to reschedule",
    sla_hours: 8,
    sla_business_hours_only: true,
  },
  general_info: {
    id: "general_info",
    display_name: "General info",
    dept: "both",
    typical_resolution: "Closes in-call unless unresolved",
    sla_hours: 48,
    sla_business_hours_only: false,
  },
};

export const INTENTS_BY_DEPT_COLOR: Record<string, string> = {
  sales: "blue",
  service: "emerald",
  both: "slate",
  compliance: "red",
};

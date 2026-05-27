/**
 * Mock data schema for the Vini Console — Action Items pod.
 *
 * Mirrors the entities and events defined in `prd-console-action-items.md` §10.
 * Engineers wiring real backend: replace the static imports with API calls
 * returning these same TypeScript shapes.
 */

// =========================================================================
// CORE PRIMITIVES
// =========================================================================

export type Channel =
  | "call"
  | "sms"
  | "chat"
  | "email"
  | "hitl_takeover"
  | "hitl_warm_transfer";

export type Dept = "sales" | "service" | "both" | "compliance";

export type CustomerType = "new" | "returning" | "lapsed";

export type DealershipRole =
  | "dealer_principal"
  | "general_manager"
  | "sales_manager"
  | "service_manager"
  | "bdc_manager"
  | "bdc_agent"
  | "service_advisor"
  | "sales_advisor";

// =========================================================================
// INTENT TAXONOMY (PRD §10.5)
// =========================================================================

export type IntentId =
  | "pricing_quote"
  | "recall_response"
  | "callback_request"
  | "status_update"
  | "appointment_inquiry"
  | "service_intent"
  | "vehicle_inquiry"
  | "trade_in_inquiry"
  | "complaint"
  | "sms_takeover"
  | "specific_salesperson"
  | "compliance_alert"
  | "no_show"
  | "general_info";

export interface IntentMeta {
  id: IntentId;
  display_name: string;
  dept: Dept;
  typical_resolution: string;
  sla_hours: number;
  sla_business_hours_only: boolean;
}

// =========================================================================
// USER (dealership staff)
// =========================================================================

export interface User {
  user_id: string;
  display_name: string;
  email: string;
  role: DealershipRole;
  avatar_initials: string;
  rooftop_id: string;
}

// =========================================================================
// CUSTOMER PROFILE (5 collections from PRD §9.1 / §9.4)
// =========================================================================

export interface CustomerDetails {
  customer_id: string;
  display_name: string;
  phone: string;
  email: string;
  preferred_channel: Channel;
  language: "en" | "es";
  customer_type: CustomerType;
  first_seen_at: string; // ISO
}

export interface Vehicle {
  vehicle_id: string;
  customer_id: string;
  year: number;
  make: string;
  model: string;
  vin_suffix: string; // last 4 chars
  ownership_status: "owned" | "leased" | "former_owner";
  open_recalls: number;
}

export type AppointmentStatus = "scheduled" | "shown" | "no_show" | "completed";

export interface Appointment {
  appointment_id: string;
  customer_id: string;
  vehicle_id?: string;
  scheduled_at: string;
  status: AppointmentStatus;
  source_action_item_id?: string;
  advisor_user_id?: string;
}

// =========================================================================
// CONVERSATION
// =========================================================================

export interface ConversationTurn {
  speaker: "agent" | "customer" | "human_agent";
  text: string;
  timestamp: string;
}

export interface Conversation {
  conversation_id: string;
  customer_id: string;
  channel: Channel;
  started_at: string;
  ended_at: string;
  primary_intent_id: IntentId;
  intent_ids: IntentId[];
  outcome: "resolved_in_conversation" | "action_item_created" | "transferred";
  transcript: ConversationTurn[];
  recording_url?: string; // for calls
}

// =========================================================================
// ACTION ITEM (this pod's atomic unit)
// =========================================================================

export type ActionItemStatus = "pending" | "completed";

export type ResolutionType =
  | "appointment_booked"
  | "info_provided"
  | "customer_unreachable"
  | "dnc"
  | "other";

export type EscalationReason =
  | "aged_past_sla"
  | "repeat_caller_threshold"
  | "compliance_flagged";

export interface ActionItem {
  action_item_id: string;
  customer_id: string;
  source_conversation_id: string;
  source_channel: Channel;
  intent_id: IntentId;
  is_primary_intent_of_source: boolean;
  intent_recap: string;
  created_at: string;
  created_by_ai: boolean;
  status: ActionItemStatus;

  // assignment state
  assignee_user_id?: string;
  assigned_at?: string;
  assigned_by_user_id?: string;

  // closure state
  closed_at?: string;
  closed_by_user_id?: string;
  resolution_note?: string;
  resolution_type?: ResolutionType;

  // When resolution_type === "appointment_booked" — the appointment that resolved this item
  closed_with_appointment_id?: string;

  // When assignee_user_id === "vini_agent" — instructions BDC gave Vini for closing this item
  vini_instructions?: string;

  // escalation + repeat-caller
  repeat_caller_count: number; // dedup hits since creation
  last_observed_at: string;
  escalation_reason?: EscalationReason;
  escalated_at?: string;

  // cross-pod surface signals (read-only here; written by ROI Emailer pod)
  surfaced_in_emails: Array<{
    email_send_id: string;
    email_type: "daily" | "weekly" | "monthly" | "eoc";
    surfaced_at: string;
    cta_clicked: boolean;
  }>;
}

// =========================================================================
// CUSTOMER PROFILE — full 5-collection rollup
// =========================================================================

export interface CustomerProfile {
  details: CustomerDetails;
  vehicles: Vehicle[];
  conversations: Conversation[];
  action_items: ActionItem[];
  appointments: Appointment[];
}

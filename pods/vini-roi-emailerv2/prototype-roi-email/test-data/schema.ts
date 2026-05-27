/**
 * Mock data schema for Vini Dealer Reporting Emailers.
 *
 * This file is the source-of-truth contract between the React frontend
 * (which renders the emails) and the AI harness / eval runner (which generates
 * Story-of-the-Week summaries from conversation data).
 *
 * Engineers wiring real backend: replace the static imports under /scenarios
 * with API responses matching these types.
 */

// =========================================================================
// CORE PRIMITIVES
// =========================================================================

export type AgentType = "sales_ib" | "sales_ob" | "service_ib" | "service_ob";
export type Channel = "call" | "sms" | "chat" | "email" | "voice";
export type DealershipRole =
  | "dealer_principal"
  | "general_manager"
  | "sales_manager"
  | "service_manager"
  | "bdc_manager"
  | "ob_campaign_manager"
  | "fixed_ops_director";

export type Sentiment = "negative" | "neutral" | "positive";
export type ConversationOutcome =
  | "appointment_booked"
  | "warm_transfer"
  | "follow_up"
  | "no_response"
  | "opted_out"
  | "dnc"
  | "lost";

export type EmailType = "daily" | "weekly" | "monthly" | "eoc" | "post_call";

// =========================================================================
// DEALER + RECIPIENT MODELS
// =========================================================================

export interface Dealer {
  id: string;
  name: string;
  rooftop_count: number;
  timezone: string; // IANA, e.g. "America/Los_Angeles"
  business_hours: { start: string; end: string }; // "09:00", "18:00"
  go_live_date: string; // ISO date
  avg_appointment_value?: number; // Optional — drives "Your value estimate" sidebar
  group_id?: string; // For multi-rooftop groups
}

export interface Recipient {
  email: string;
  display_name: string;
  role: DealershipRole;
  rooftop_ids: string[]; // Empty array = all rooftops in group
  subscriptions: Subscription[];
}

export interface Subscription {
  email_type: EmailType;
  agent_filter: AgentType[] | "all";
  rooftop_filter: string[] | "all";
}

// =========================================================================
// METRIC MODELS
// =========================================================================

export interface MetricValue {
  yesterday?: number;
  mtd?: number;
  prior_period?: number; // For WoW/MoM deltas
  trend_7d_avg?: number;
  unavailable?: boolean; // Render as N/A — small sample
  unavailable_reason?: string;
}

export interface ChannelBreakdown {
  call: number;
  sms: number;
  chat: number;
  email?: number;
  voice?: number;
}

export interface KPICard {
  label: string;
  primary_value: number | string;
  primary_unit?: string; // "min", "%", ""
  delta?: number; // signed; rendered as +X% / -X%
  delta_label?: string; // "WoW", "MoM"
  subtitle?: string;
  unavailable?: boolean;
  unavailable_reason?: string;
}

// =========================================================================
// ACTION QUEUE
// =========================================================================

export type ActionType =
  | "sms_takeover"
  | "appt_confirmed"
  | "failed_booking"
  | "specific_salesperson"
  | "compliance_alert"
  | "callback_request"
  | "recall_response"
  | "pending_status_update"
  | "no_show";

export interface ActionItem {
  type: ActionType;
  count: number;
  agent_type?: AgentType;
  deep_link: string;
}

// =========================================================================
// CONVERSATION (used by Story-of-the-Week AI harness)
// =========================================================================

export type ConversationTurn = {
  channel: Channel;
  timestamp: string; // ISO
  speaker: "agent" | "customer";
  text: string;
};

export interface ConversationJourney {
  journey_id: string;
  rooftop_id: string;
  agent: AgentType;
  agent_display_name: string;
  intent: string; // "Toyota Tacoma 2024 inquiry" | "Oil change" | "Recall notice"
  outcome: ConversationOutcome;
  touch_count: number;
  channels_used: Channel[];
  sentiment_start: Sentiment;
  sentiment_end: Sentiment;
  critical_flag?: "recall" | "compliance" | "safety" | "at_risk_save" | null;
  conversation_value_normalized?: number; // 0..1
  turns: ConversationTurn[];
  // PII fields — MUST be stripped before sending to LLM
  pii: {
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    vin?: string;
  };
  // Metadata used by deterministic story-selection scorer
  selected_reason?:
    | "highest_gross"
    | "saved_after_n_turns"
    | "recall_escalation"
    | "compliance_handled"
    | "best_after_hours"
    | "most_multi_touch";
}

// =========================================================================
// DAILY DIGEST
// =========================================================================

export interface DailyDigestData {
  scenario_id: string;
  scenario_name: string;
  scenario_notes: string;
  email_type: "daily";
  send_decision: "send" | "suppress";
  suppression_reason?: string; // E.g. "full_silent_day"

  dealer: Dealer;
  agents_in_scope: AgentType[]; // Drives which sections render
  reporting_date: string; // The day being reported on (yesterday for receiver)
  conversations_total: number;
  channel_split: ChannelBreakdown;

  hero: {
    yesterday_appts: MetricValue;
    mtd_appts: MetricValue;
    bdc_hours_equivalent: number;
    show_onboarding_banner?: boolean; // For Day 1-7 rooftops
  };

  action_required: ActionItem[];

  inbound?: {
    kpi_cards: KPICard[];
    activity: {
      unique_leads: MetricValue;
      channel_split: ChannelBreakdown;
      appointments_set: MetricValue;
      after_hours: { leads_engaged: number; appts_booked: number };
      warm_transfers: MetricValue;
    };
    top_vehicles?: Array<{ name: string; count: number; trend: "up" | "down" | "flat" }>;
    top_intents?: Array<{ name: string; count: number; trend: "up" | "down" | "flat" }>;
  };

  outbound?: {
    show_block: boolean; // Hide entirely if no campaigns + no activity
    unique_reached: MetricValue;
    connect_rate: MetricValue;
    appts_set: MetricValue;
    active_campaigns: Array<{
      name: string;
      dials: number;
      appts: number;
      conversion_pct: number;
      status: "active" | "paused" | "completed";
      paused_warning?: boolean;
    }>;
    all_audiences_exhausted?: boolean;
  };

  footer: {
    bdc_hours_equivalent: number;
    reporting_period: string;
    next_send: string;
  };

  // Banners surfaced on the email when edge cases trigger
  banners?: Array<{
    severity: "info" | "warning";
    message: string;
    deep_link?: string;
  }>;
}

// =========================================================================
// WEEKLY PERFORMANCE
// =========================================================================

export interface WeeklyData {
  scenario_id: string;
  scenario_name: string;
  scenario_notes: string;
  email_type: "weekly";
  dealer: Dealer;
  agents_in_scope: AgentType[];
  reporting_period: { start: string; end: string };

  agent_kpi_strips: Array<{
    agent: AgentType;
    cards: KPICard[]; // 4 cards per spec
  }>;

  day_by_day_trend: Array<{
    day: string; // "Mon", "Tue"
    call: number;
    sms: number;
    chat: number;
    total: number;
    appts: number;
  }>;

  funnel: {
    unique: number;
    engaged: number;
    converted: number;
    new_vs_returning: { new: number; returning: number };
    avg_touches: number;
    avg_channels: number;
  };

  channel_performance?: Array<{
    channel: Channel;
    conversations: number;
    engagement_pct: number;
    appts: number;
  }>;

  top_vehicles?: Array<{ name: string; count: number }>;
  top_services?: Array<{ name: string; count: number }>;

  story?: {
    journey: ConversationJourney; // Source data for AI summary
    badge: string; // E.g. "Saved after 6 turns"
    summary: string; // AI-generated narrative
    summary_source: "ai_haiku" | "fallback_omit";
  };
}

// =========================================================================
// MONTHLY VALUE
// =========================================================================

export interface MonthlyData {
  scenario_id: string;
  scenario_name: string;
  scenario_notes: string;
  email_type: "monthly";
  dealer: Dealer;
  /**
   * v4 (post-monthly-review): Monthly ships 4 agent-specific variants
   * (Sales IB · Sales OB · Service IB · Service OB) — mirrors the Weekly
   * variant model. Each subscriber receives the variant matching the
   * agents they're configured to see.
   */
  agents_in_scope: AgentType[];
  reporting_month: string; // e.g. "March 2026"

  hero: {
    // v4 (post-monthly-review): six tiles in this fixed display order:
    //   1) Leads interacted   2) Conversations
    //   3) Appointments       4) After-hour appointments
    //   5) Routed calls       6) Resolution rate
    // Removed: bdc_hours_equivalent (replaced by resolution_rate)
    //          lapsed_reengaged (replaced by routed_calls)
    headline: string; // Pre-rendered for engineering reference
    leads_interacted: number;       // v4 — was unique_customers; now "leads interacted with"
    total_conversations: number;
    appts_booked: number;
    after_hours_booked: number;
    routed_calls: number;           // v4 NEW — number of inbound calls routed/transferred to a human
    resolution_rate_pct: number;    // v4 NEW — % of queries/calls resolved (in-conversation OR by Vini-as-assignee)
  };

  kpi_grid: KPICard[]; // 6 cards

  // v5: value_estimate_sidebar removed from Monthly entirely (per §9.3 review).
  // Dealer $-context now lives only in dashboards, not in the Monthly email.

  customer_centric: {
    unique: number;
    pct_new: number;
    pct_returning: number;
    avg_touches: number;
    /**
     * v5 (was `lapsed_reengaged` in v3/v4): Customer-Centric block now mirrors
     * the hero's Routed Calls metric rather than the lapsed-re-engaged count.
     * The lapsed metric definition was disputed (within Vini? within CRM?) and
     * was eventually deferred — see PRD §9.5 open-questions table.
     */
    routed_calls: number;
  };

  multichannel_mix: Array<{
    channel: Channel;
    share_pct: number;
    mom_shift: number;
  }>;

  stories: Array<{
    journey: ConversationJourney;
    badge: string;
    summary: string;
    summary_source: "ai_haiku" | "fallback_omit";
  }>;

  six_month_trend: Array<{
    month: string; // e.g. "Oct"
    appts: number;
    store_total?: number; // Optional context line
  }>;
}

// =========================================================================
// END OF CAMPAIGN
// =========================================================================

export interface EOCData {
  scenario_id: string;
  scenario_name: string;
  scenario_notes: string;
  email_type: "eoc";
  dealer: Dealer;
  campaign: {
    id: string;
    name: string;
    audience_size: number;
    contactable: number;
    opted_out: number;
    sends: number;
    dials: number;
    messages: number;
    start_date: string;
    end_date: string;
  };

  headline: {
    appts: number;
    contactable: number;
    conversion_pct: number;
    opt_in_booked_pct: number;
  };

  /**
   * v4 (post-EOC-review): the EOC report now ships ONE funnel — Conversion.
   * Removed the prior pair of "Reach" + "Engagement" funnels alongside it.
   * Steps: Reached leads → Contacted → Appointments → ABR%.
   */
  conversion_funnel: {
    reached_leads: number;
    contacted: number;
    appointments: number;
    abr_pct: number;
  };

  per_touchpoint: Array<{
    touchpoint: string;
    first_touch_appt_pct: number;
    last_touch_appt_pct: number;
  }>;

  multichannel: Array<{
    channel: Channel;
    conversations: number;
    engagement_pct: number;
    appts: number;
  }>;

  outcome_distribution: Array<{
    outcome: ConversationOutcome;
    count: number;
    pct: number;
  }>;

  top_objections: Array<{ objection: string; count: number }>;

  // v4: `conversion_by_vehicle_or_service` and `recommendations` removed —
  // pilot reviewers found the recommendation block speculative and the
  // per-vehicle conversion table noisy at typical campaign sizes.

  value_estimate_appendix?: {
    appts: number;
    avg_appointment_value: number;
    influenced_amount: number;
  };
}

// =========================================================================
// POST-CALL SUMMARY (event-triggered — sent after every call where an
// action item or appointment is generated, or both)
// =========================================================================

export type CallScoreLabel = "Excellent" | "Good" | "Fair" | "Poor";

export interface PostCallSummaryData {
  scenario_id: string;
  scenario_name: string;
  scenario_notes: string;
  email_type: "post_call";

  dealer: Dealer;

  /** Dept + direction chip rendered at the very top of the email. */
  dept_label: string; // "Sales Inbound" | "Service Outbound" | etc.
  agent_type: AgentType;

  /** Title block + meta strip. */
  call_subject: string; // "Inquiry and Test Drive Interest for Used Family SUVs"
  agent_name: string; // "AI Agent" by default
  call_started_at: string; // ISO
  call_duration_sec: number;

  /** Customer card (2-col block). */
  customer: {
    name: string;
    phone: string;
    ai_call_score: number; // 0..100
    ai_call_score_label: CallScoreLabel;
    sentiment: Sentiment; // negative | neutral | positive
  };

  /** Intent + Deal value (2-col side-by-side block). */
  intent_label: string; // "General Sales Inquiry" / "Service Status Update" / etc.
  deal_value_usd: number; // 0 when no deal value (display "$0")

  /**
   * Conditional appointment block. When `undefined`, the entire Appointment
   * card is hidden — yields the "only action items" template variant.
   */
  appointment?: {
    label: string; // "Test Drive Appointment" | "Service Appointment" | etc.
    schedule: string; // "21 May 2026 · 2:00 PM" | "Not scheduled"
    vehicle: string; // "2025 Toyota Grand Highlander Hybrid" | "Not specified"
  };

  /**
   * Conditional action-items list. Empty array hides the Action Items card —
   * yields the "only appointment" template variant. Both populated → "both"
   * template. Engineers wiring this surface MUST ensure the email only fires
   * when `appointment` is set OR `action_items.length > 0` (or both).
   */
  action_items: Array<{
    title: string;
    due_at: string; // ISO date
  }>;

  /** Call summary block — always rendered. */
  summary: {
    key_takeaways: string[]; // 2-4 bullets
    topics: Array<{
      name: string;
      description: string;
    }>;
  };
}

// =========================================================================
// UNION TYPE FOR SCENARIO INDEX
// =========================================================================

export type EmailScenario =
  | DailyDigestData
  | WeeklyData
  | MonthlyData
  | EOCData
  | PostCallSummaryData;

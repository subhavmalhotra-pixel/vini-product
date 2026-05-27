import type { ConversationJourney } from "./schema";

/**
 * Mock conversation journeys.
 *
 * These are the source-of-truth for Story-of-the-Week / Month generation.
 * PII fields are populated for realism but MUST be stripped by the harness
 * before being sent to the LLM (see prototype/ai-harness/pii_stripper.py).
 */

export const STORY_AT_RISK_SAVE: ConversationJourney = {
  journey_id: "jrn_001_save",
  rooftop_id: "rt_honda_dtla",
  agent: "sales_ib",
  agent_display_name: "Vini Sales IB",
  intent: "Honda Civic 2025 — payment hesitation",
  outcome: "appointment_booked",
  touch_count: 6,
  channels_used: ["chat", "sms", "call"],
  sentiment_start: "negative",
  sentiment_end: "positive",
  critical_flag: "at_risk_save",
  conversation_value_normalized: 0.82,
  selected_reason: "saved_after_n_turns",
  pii: {
    customer_name: "Jamie Caldwell",
    customer_phone: "+1-213-555-0142",
    customer_email: "jamie.caldwell@example.com",
  },
  turns: [
    { channel: "chat", timestamp: "2026-05-08T18:22:00-07:00", speaker: "customer",
      text: "I saw the Civic listed online but the payments shown are way more than I can do." },
    { channel: "chat", timestamp: "2026-05-08T18:22:30-07:00", speaker: "agent",
      text: "Totally understand. The listed payment assumes a particular term and down payment. If you tell me what works for your monthly target, I can show you what term and down would get there." },
    { channel: "chat", timestamp: "2026-05-08T18:23:10-07:00", speaker: "customer",
      text: "$390/mo max, and I have around $2k down." },
    { channel: "chat", timestamp: "2026-05-08T18:23:45-07:00", speaker: "agent",
      text: "At 72 months and current APR tiers, $390/mo with $2k down is achievable on a Civic LX. The Sport trim would push it about $25 over your target. Want me to pencil the LX in for a test drive this week so you can confirm the trim?" },
    { channel: "sms", timestamp: "2026-05-09T10:14:00-07:00", speaker: "agent",
      text: "Hi Jamie — following up on yesterday's chat. Saturday at 11 AM open for a 30-min drive on the LX?" },
    { channel: "sms", timestamp: "2026-05-09T10:31:00-07:00", speaker: "customer",
      text: "yes 11 works" },
    { channel: "call", timestamp: "2026-05-09T10:34:00-07:00", speaker: "agent",
      text: "Hi Jamie, just confirming Saturday 11 AM with our LX in Sonic Gray. I'll have it pulled up front." },
  ],
};

export const STORY_RECALL_ESCALATION: ConversationJourney = {
  journey_id: "jrn_002_recall",
  rooftop_id: "rt_toyota_tampa",
  agent: "service_ib",
  agent_display_name: "Vini Service IB",
  intent: "Takata airbag recall — 2017 Tacoma",
  outcome: "appointment_booked",
  touch_count: 3,
  channels_used: ["call"],
  sentiment_start: "negative",
  sentiment_end: "neutral",
  critical_flag: "recall",
  conversation_value_normalized: 0.45,
  selected_reason: "recall_escalation",
  pii: {
    customer_name: "Robert Hayes",
    customer_phone: "+1-813-555-0181",
    vin: "5TFCZ5AN0HX007421",
  },
  turns: [
    { channel: "call", timestamp: "2026-05-09T08:11:00-04:00", speaker: "customer",
      text: "I got a letter saying my Tacoma has a recall on the airbag inflator. Is this serious?" },
    { channel: "call", timestamp: "2026-05-09T08:11:25-04:00", speaker: "agent",
      text: "Yes, the Takata airbag inflator recall is high-priority — the manufacturer covers the repair at no cost and we recommend scheduling soon. Can I check your VIN against the open recall list?" },
    { channel: "call", timestamp: "2026-05-09T08:12:10-04:00", speaker: "customer",
      text: "VIN ends in 7421." },
    { channel: "call", timestamp: "2026-05-09T08:12:40-04:00", speaker: "agent",
      text: "Confirmed — your 2017 Tacoma is included. The repair takes about 90 minutes. I have Thursday at 8 AM or Friday at 1 PM open. Which works?" },
    { channel: "call", timestamp: "2026-05-09T08:13:15-04:00", speaker: "customer",
      text: "Thursday 8 AM." },
  ],
};

export const STORY_LAPSED_REENGAGEMENT: ConversationJourney = {
  journey_id: "jrn_003_lapsed",
  rooftop_id: "rt_anderson_group_main",
  agent: "service_ob",
  agent_display_name: "Vini Service OB",
  intent: "18-month service lapse — maintenance reminder",
  outcome: "appointment_booked",
  touch_count: 2,
  channels_used: ["sms"],
  sentiment_start: "neutral",
  sentiment_end: "positive",
  critical_flag: null,
  conversation_value_normalized: 0.51,
  selected_reason: "best_after_hours",
  pii: {
    customer_name: "Linda Park",
    customer_phone: "+1-312-555-0117",
  },
  turns: [
    { channel: "sms", timestamp: "2026-05-07T19:42:00-05:00", speaker: "agent",
      text: "Hi Linda, this is Anderson Auto Service. It's been about 18 months since we last saw your CR-V — would you like to schedule a quick check-up? We're running a complimentary multi-point inspection through May." },
    { channel: "sms", timestamp: "2026-05-07T19:58:00-05:00", speaker: "customer",
      text: "Oh wow yeah it's overdue. Can I do Saturday?" },
    { channel: "sms", timestamp: "2026-05-07T19:58:30-05:00", speaker: "agent",
      text: "Saturday 10 AM or 2 PM both open — which fits?" },
    { channel: "sms", timestamp: "2026-05-07T20:11:00-05:00", speaker: "customer",
      text: "10 am" },
  ],
};

export const STORY_MULTI_TOUCH: ConversationJourney = {
  journey_id: "jrn_004_multitouch",
  rooftop_id: "rt_honda_dtla",
  agent: "sales_ob",
  agent_display_name: "Vini Sales OB",
  intent: "Trade-in valuation + Pilot 2024",
  outcome: "appointment_booked",
  touch_count: 9,
  channels_used: ["call", "sms", "email"],
  sentiment_start: "neutral",
  sentiment_end: "positive",
  critical_flag: null,
  conversation_value_normalized: 0.95,
  selected_reason: "most_multi_touch",
  pii: {
    customer_name: "Devon Albright",
    customer_phone: "+1-213-555-0220",
    customer_email: "d.albright@example.com",
  },
  turns: [
    { channel: "call", timestamp: "2026-05-02T14:00:00-07:00", speaker: "agent",
      text: "Hi Devon, this is Vini calling on behalf of Honda DTLA — you'd inquired online about the Pilot. Is now a good time?" },
    { channel: "call", timestamp: "2026-05-02T14:00:15-07:00", speaker: "customer",
      text: "Yeah but I'm not ready yet. Need to figure out my trade first." },
    { channel: "email", timestamp: "2026-05-02T14:30:00-07:00", speaker: "agent",
      text: "Sending you our trade-in form. KBB and a real desk-checked offer differ — we'll match KBB if structurally close." },
    { channel: "sms", timestamp: "2026-05-04T11:20:00-07:00", speaker: "agent",
      text: "Hi Devon — any luck with the trade-in form?" },
    { channel: "sms", timestamp: "2026-05-04T11:42:00-07:00", speaker: "customer",
      text: "submitted. waiting on numbers" },
    { channel: "sms", timestamp: "2026-05-05T09:10:00-07:00", speaker: "agent",
      text: "Trade evaluated at $18,400 — about $400 over KBB. Want to drive a Pilot this week?" },
    { channel: "call", timestamp: "2026-05-07T16:00:00-07:00", speaker: "customer",
      text: "I'm interested. What's the Pilot Touring stock?" },
    { channel: "call", timestamp: "2026-05-07T16:00:30-07:00", speaker: "agent",
      text: "Two Touring trims in inventory — Modern Steel and Diffused Sky Blue. Saturday 9 AM for both side-by-side?" },
    { channel: "call", timestamp: "2026-05-07T16:01:10-07:00", speaker: "customer",
      text: "Yes Saturday 9." },
  ],
};

export const STORY_COMPLIANCE_HANDLED: ConversationJourney = {
  journey_id: "jrn_005_compliance",
  rooftop_id: "rt_anderson_group_main",
  agent: "sales_ob",
  agent_display_name: "Vini Sales OB",
  intent: "Customer requested DNC mid-call",
  outcome: "opted_out",
  touch_count: 1,
  channels_used: ["call"],
  sentiment_start: "negative",
  sentiment_end: "neutral",
  critical_flag: "compliance",
  conversation_value_normalized: 0.0,
  selected_reason: "compliance_handled",
  pii: {
    customer_name: "Anonymous (DNC)",
    customer_phone: "+1-312-555-0099",
  },
  turns: [
    { channel: "call", timestamp: "2026-05-06T10:14:00-05:00", speaker: "agent",
      text: "Hi, this is Vini calling on behalf of Anderson Auto. Following up on your inquiry —" },
    { channel: "call", timestamp: "2026-05-06T10:14:08-05:00", speaker: "customer",
      text: "Stop calling. Take me off your list." },
    { channel: "call", timestamp: "2026-05-06T10:14:11-05:00", speaker: "agent",
      text: "Understood — you'll be added to our do-not-call list immediately. You will not receive further outreach. Thanks for letting us know." },
  ],
};

export const STORY_SHORT_HANGUP: ConversationJourney = {
  journey_id: "jrn_006_short_hangup",
  rooftop_id: "rt_honda_dtla",
  agent: "sales_ib",
  agent_display_name: "Vini Sales IB",
  intent: "Inbound call — 8-second hangup",
  outcome: "no_response",
  touch_count: 1,
  channels_used: ["call"],
  sentiment_start: "neutral",
  sentiment_end: "neutral",
  critical_flag: null,
  conversation_value_normalized: 0.0,
  pii: {
    customer_phone: "+1-213-555-0033",
  },
  turns: [
    { channel: "call", timestamp: "2026-05-09T15:02:00-07:00", speaker: "agent",
      text: "Thank you for calling Honda of Downtown LA, this is Vini —" },
    { channel: "call", timestamp: "2026-05-09T15:02:08-07:00", speaker: "customer",
      text: "[hangup]" },
  ],
};

export const ALL_STORIES = [
  STORY_AT_RISK_SAVE,
  STORY_RECALL_ESCALATION,
  STORY_LAPSED_REENGAGEMENT,
  STORY_MULTI_TOUCH,
  STORY_COMPLIANCE_HANDLED,
  STORY_SHORT_HANGUP,
];

import type { Conversation } from "./schema";

/**
 * Mock conversations covering every channel + multi-intent + HITL scenarios
 * from PRD §9 / §10. Each conversation is the source of at least one action item.
 */

export const CONVERSATIONS: Conversation[] = [
  // ============= GARY WISE — 5 status_update calls in 3 days (repeat-caller) =============
  {
    conversation_id: "conv-gary-001",
    customer_id: "c-gary-wise",
    channel: "call",
    started_at: "2026-05-17T09:14:00-07:00",
    ended_at: "2026-05-17T09:18:00-07:00",
    primary_intent_id: "status_update",
    intent_ids: ["status_update"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "agent", text: "Mercedes-Benz of Laguna Niguel, this is Vini. How can I help?", timestamp: "2026-05-17T09:14:05-07:00" },
      { speaker: "customer", text: "Hi, this is Gary. Just checking on my GLC — is the service done?", timestamp: "2026-05-17T09:14:15-07:00" },
      { speaker: "agent", text: "Let me take your details and have your advisor follow up with the status.", timestamp: "2026-05-17T09:14:30-07:00" },
    ],
    recording_url: "/mock/recordings/conv-gary-001.mp3",
  },
  {
    conversation_id: "conv-gary-002",
    customer_id: "c-gary-wise",
    channel: "call",
    started_at: "2026-05-17T15:42:00-07:00",
    ended_at: "2026-05-17T15:45:00-07:00",
    primary_intent_id: "status_update",
    intent_ids: ["status_update"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "customer", text: "Calling again — still no word on the GLC. Anybody there?", timestamp: "2026-05-17T15:42:10-07:00" },
      { speaker: "agent", text: "Apologies for the wait. I'll flag this as urgent for your advisor.", timestamp: "2026-05-17T15:42:25-07:00" },
    ],
    recording_url: "/mock/recordings/conv-gary-002.mp3",
  },
  {
    conversation_id: "conv-gary-003",
    customer_id: "c-gary-wise",
    channel: "call",
    started_at: "2026-05-18T08:33:00-07:00",
    ended_at: "2026-05-18T08:36:00-07:00",
    primary_intent_id: "status_update",
    intent_ids: ["status_update"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "customer", text: "I really need an answer on the GLC. This is my third call.", timestamp: "2026-05-18T08:33:10-07:00" },
      { speaker: "agent", text: "I see your prior calls. I'm escalating this immediately.", timestamp: "2026-05-18T08:33:30-07:00" },
    ],
    recording_url: "/mock/recordings/conv-gary-003.mp3",
  },
  {
    conversation_id: "conv-gary-004",
    customer_id: "c-gary-wise",
    channel: "call",
    started_at: "2026-05-18T13:05:00-07:00",
    ended_at: "2026-05-18T13:08:00-07:00",
    primary_intent_id: "status_update",
    intent_ids: ["status_update"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "customer", text: "Look, I just want to know if the car is ready.", timestamp: "2026-05-18T13:05:15-07:00" },
    ],
    recording_url: "/mock/recordings/conv-gary-004.mp3",
  },
  {
    conversation_id: "conv-gary-005",
    customer_id: "c-gary-wise",
    channel: "call",
    started_at: "2026-05-19T10:21:00-07:00",
    ended_at: "2026-05-19T10:24:00-07:00",
    primary_intent_id: "status_update",
    intent_ids: ["status_update", "complaint"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "customer", text: "This is unacceptable. Five calls and nothing. I want a manager.", timestamp: "2026-05-19T10:21:10-07:00" },
      { speaker: "agent", text: "I'm sorry for the experience. I'll get a manager to call you back today.", timestamp: "2026-05-19T10:21:30-07:00" },
    ],
    recording_url: "/mock/recordings/conv-gary-005.mp3",
  },

  // ============= DANIELA RUIZ — multi-intent SMS (pricing + recall) =============
  {
    conversation_id: "conv-daniela-001",
    customer_id: "c-daniela-ruiz",
    channel: "sms",
    started_at: "2026-05-19T11:02:00-07:00",
    ended_at: "2026-05-19T11:08:00-07:00",
    primary_intent_id: "pricing_quote",
    intent_ids: ["pricing_quote", "recall_response"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "customer", text: "Hola, looking for a quote on a 2025 C 300 lease, and is my current C 300 affected by the airbag recall?", timestamp: "2026-05-19T11:02:00-07:00" },
      { speaker: "agent", text: "Hi Daniela — I'll route the quote to a sales adviser and verify your VIN against the recall database. You'll hear back today.", timestamp: "2026-05-19T11:03:15-07:00" },
    ],
  },

  // ============= AMIR MEHTA — long email, multi-intent (3 items) =============
  {
    conversation_id: "conv-amir-001",
    customer_id: "c-amir-mehta",
    channel: "email",
    started_at: "2026-05-19T08:00:00-07:00",
    ended_at: "2026-05-19T08:00:00-07:00",
    primary_intent_id: "vehicle_inquiry",
    intent_ids: ["vehicle_inquiry", "trade_in_inquiry", "pricing_quote"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "customer", text: "Hello, three questions: (1) what GLE 450s do you currently have in inventory? (2) what is my 2020 Audi Q5 worth as a trade? (3) can you ballpark monthly payments on a 36-month lease? Thanks.", timestamp: "2026-05-19T08:00:00-07:00" },
    ],
  },

  // ============= JENNA CLARKE — HITL warm transfer (lapsed reengagement + recall) =============
  {
    conversation_id: "conv-jenna-001",
    customer_id: "c-jenna-clarke",
    channel: "hitl_warm_transfer",
    started_at: "2026-05-19T13:15:00-07:00",
    ended_at: "2026-05-19T13:28:00-07:00",
    primary_intent_id: "recall_response",
    intent_ids: ["recall_response", "service_intent"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "agent", text: "Mercedes-Benz of Laguna Niguel, this is Vini.", timestamp: "2026-05-19T13:15:05-07:00" },
      { speaker: "customer", text: "I got a recall notice on my 2020 E 350.", timestamp: "2026-05-19T13:15:15-07:00" },
      { speaker: "agent", text: "I'll transfer you to an advisor right away — please hold.", timestamp: "2026-05-19T13:16:00-07:00" },
      { speaker: "human_agent", text: "Hi Jenna, this is Priya. I see your VIN — yes, the airbag recall applies. Can we book you for next Tuesday?", timestamp: "2026-05-19T13:17:00-07:00" },
      { speaker: "customer", text: "Yes, Tuesday works. Also, can you check my brake fluid while it's here?", timestamp: "2026-05-19T13:17:30-07:00" },
      { speaker: "human_agent", text: "Absolutely, I'll add brake fluid inspection. See you Tuesday at 10 AM.", timestamp: "2026-05-19T13:18:00-07:00" },
    ],
    recording_url: "/mock/recordings/conv-jenna-001.mp3",
  },

  // ============= ROB STEARNS — no-show callback =============
  {
    conversation_id: "conv-rob-001",
    customer_id: "c-rob-stearns",
    channel: "call",
    started_at: "2026-05-18T09:00:00-07:00",
    ended_at: "2026-05-18T09:01:00-07:00",
    primary_intent_id: "no_show",
    intent_ids: ["no_show"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "agent", text: "[system] Rob Stearns did not arrive for his 9 AM appointment. Action item created automatically.", timestamp: "2026-05-18T09:30:00-07:00" },
    ],
  },

  // ============= LAUREN NG — chat session, callback request =============
  {
    conversation_id: "conv-lauren-001",
    customer_id: "c-lauren-ng",
    channel: "chat",
    started_at: "2026-05-19T11:55:00-07:00",
    ended_at: "2026-05-19T12:02:00-07:00",
    primary_intent_id: "callback_request",
    intent_ids: ["callback_request", "vehicle_inquiry"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "customer", text: "Hi, I'm interested in a GLC 300 lease — can someone call me this afternoon? I prefer phone over text.", timestamp: "2026-05-19T11:55:10-07:00" },
      { speaker: "agent", text: "Of course — I'll route that callback to our sales team for this afternoon.", timestamp: "2026-05-19T11:55:30-07:00" },
    ],
  },

  // ============= MARCO TORRES — specific salesperson request =============
  {
    conversation_id: "conv-marco-001",
    customer_id: "c-marco-torres",
    channel: "call",
    started_at: "2026-05-19T09:40:00-07:00",
    ended_at: "2026-05-19T09:45:00-07:00",
    primary_intent_id: "specific_salesperson",
    intent_ids: ["specific_salesperson", "vehicle_inquiry"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "customer", text: "Hi, is David available? He sold me my last car. Want to talk to him about an upgrade.", timestamp: "2026-05-19T09:40:15-07:00" },
      { speaker: "agent", text: "David's with another customer — I'll have him call you back today.", timestamp: "2026-05-19T09:40:45-07:00" },
    ],
    recording_url: "/mock/recordings/conv-marco-001.mp3",
  },

  // ============= SARA KAPOOR — SMS takeover =============
  {
    conversation_id: "conv-sara-001",
    customer_id: "c-sara-kapoor",
    channel: "hitl_takeover",
    started_at: "2026-05-19T14:00:00-07:00",
    ended_at: "2026-05-19T14:18:00-07:00",
    primary_intent_id: "sms_takeover",
    intent_ids: ["sms_takeover", "appointment_inquiry"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "customer", text: "Hi, can I move my lease-end inspection to next week instead?", timestamp: "2026-05-19T14:00:05-07:00" },
      { speaker: "agent", text: "I can check next-week availability — what day works?", timestamp: "2026-05-19T14:00:30-07:00" },
      { speaker: "customer", text: "Actually, I'd rather talk to someone — this is getting complicated.", timestamp: "2026-05-19T14:01:00-07:00" },
      { speaker: "human_agent", text: "Hi Sara, this is Marcus from the BDC. I see your lease ends June 12 — let's find a slot that works.", timestamp: "2026-05-19T14:02:30-07:00" },
      { speaker: "customer", text: "Thursday or Friday morning would be ideal.", timestamp: "2026-05-19T14:03:00-07:00" },
      { speaker: "human_agent", text: "Friday 9:30 AM works. I'll send a confirmation.", timestamp: "2026-05-19T14:04:00-07:00" },
    ],
  },

  // ============= TOM WALLACE — compliance alert =============
  {
    conversation_id: "conv-tom-001",
    customer_id: "c-tom-wallace",
    channel: "call",
    started_at: "2026-05-19T15:00:00-07:00",
    ended_at: "2026-05-19T15:04:00-07:00",
    primary_intent_id: "compliance_alert",
    intent_ids: ["compliance_alert"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "customer", text: "I want to opt out of all marketing. Don't contact me again about anything.", timestamp: "2026-05-19T15:00:15-07:00" },
      { speaker: "agent", text: "Understood — I'm flagging your account as DNC and will route this to our compliance team for review.", timestamp: "2026-05-19T15:00:45-07:00" },
    ],
    recording_url: "/mock/recordings/conv-tom-001.mp3",
  },

  // ============= ELISE PARK — completed (closed last week) =============
  {
    conversation_id: "conv-elise-001",
    customer_id: "c-elise-park",
    channel: "email",
    started_at: "2026-05-12T09:30:00-07:00",
    ended_at: "2026-05-12T09:30:00-07:00",
    primary_intent_id: "pricing_quote",
    intent_ids: ["pricing_quote"],
    outcome: "action_item_created",
    transcript: [
      { speaker: "customer", text: "Looking for an itemized estimate for the 60k-mile service on my S 580.", timestamp: "2026-05-12T09:30:00-07:00" },
    ],
  },
];

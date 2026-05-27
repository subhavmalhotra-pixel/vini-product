"""
Intent extractor — PRD §4 main AI pipeline.

Public entry point: `extract_action_items(conversation, existing_pending) -> ExtractionResult`.

Pipeline (mirrors §4.2 → §4.3 → §4.4 → §4.5):
  1. PII strip (§4.2 pre-LLM)
  2. Cost-ceiling pre-flight (§4.6)
  3. Haiku 4.5 call with structured-output schema
  4. PII guard post-call (§4.2 post-LLM)
  5. Deterministic dedup against existing pending items (§4.4)
  6. Fallback path on any failure (§4.5)
"""
from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass, field, asdict
from typing import Any

import config
from cost_tracker import CostTracker
from pii_stripper import strip_pii, contains_pii
from taxonomy import ALL_INTENT_IDS, TAXONOMY, taxonomy_for_prompt


# =========================================================================
# Public data shapes
# =========================================================================

@dataclass
class Turn:
    speaker: str          # "agent" | "customer" | "human_agent"
    text: str
    timestamp: str        # ISO


@dataclass
class Conversation:
    conversation_id: str
    customer_id: str
    customer_name: str
    channel: str          # "call" | "sms" | "chat" | "email" | "hitl_takeover" | "hitl_warm_transfer"
    rooftop_id: str
    turns: list[Turn]


@dataclass
class PendingItem:
    """Existing pending action item — used for deterministic dedup."""
    action_item_id: str
    customer_id: str
    intent_id: str


@dataclass
class DetectedIntent:
    intent_id: str
    is_primary: bool
    resolution_status: str        # "resolved_in_conversation" | "unresolved"
    confidence: float             # 0..1
    recap: str                    # one sentence, only required when unresolved


@dataclass
class EmittedEvent:
    type: str                     # action_item.created | action_item.deduplicated
    payload: dict[str, Any]


@dataclass
class ExtractionResult:
    conversation_id: str
    detected_intents: list[DetectedIntent]
    primary_intent_id: str
    events: list[EmittedEvent]
    cost_usd: float
    latency_ms: int
    used_ai: bool                 # False when fallback path fired
    fallback_reason: str | None
    slack_alarm: str | None       # set when fallback fires; logged in mock mode

    def to_dict(self) -> dict[str, Any]:
        return {
            "conversation_id": self.conversation_id,
            "detected_intents": [asdict(i) for i in self.detected_intents],
            "primary_intent_id": self.primary_intent_id,
            "events": [asdict(e) for e in self.events],
            "cost_usd": self.cost_usd,
            "latency_ms": self.latency_ms,
            "used_ai": self.used_ai,
            "fallback_reason": self.fallback_reason,
            "slack_alarm": self.slack_alarm,
        }


# =========================================================================
# Optional Anthropic client (mock-mode skips entirely)
# =========================================================================

def _anthropic_client():
    try:
        import anthropic  # type: ignore
    except ImportError:
        return None
    return anthropic.Anthropic()


# =========================================================================
# Prompt construction
# =========================================================================

SYSTEM_PROMPT_TMPL = """\
You are the Vini Console action-item extractor for a US auto dealership.

Read a conversation transcript and produce a structured JSON object describing:
1. Every customer intent detected from the closed taxonomy below.
2. Which one is the PRIMARY intent (most-discussed / highest urgency).
3. Per intent: whether it was resolved IN the conversation, or remains UNRESOLVED (needs human follow-up).
4. Per UNRESOLVED intent: a single sentence customer-facing recap (≤ 150 chars, refers to "the customer", no names, no phone numbers, no VINs).
5. Per intent: a confidence score 0..1.

================================================================================
ACTION-ITEM CREATION RULE (LOAD-BEARING — read carefully)
================================================================================

An intent is `unresolved` whenever the customer's underlying need still requires
a post-conversation action. The AGENT ACKNOWLEDGING a request, PROMISING to
do something, or ROUTING the work to a human is **NOT** resolution. The work
is unresolved until it has actually been done in the conversation.

Worked examples — classify exactly like this:

  Customer: "Can someone call me back?"
  Agent: "Sure, I'll arrange a callback for you."
  → UNRESOLVED (callback hasn't happened yet)

  Customer: "What's the status of my repair?"
  Agent: "Let me have your advisor reach out with the latest."
  → UNRESOLVED (advisor hasn't reached out yet)

  Customer: "Can you send me a quote on a 60k service?"
  Agent: "I'll have our service desk email you by end of day."
  → UNRESOLVED (quote not yet sent)

  Customer: "Got a recall notice on my car."
  Agent: "I'm transferring you to an advisor." → (transferred, no booking made)
  → UNRESOLVED (recall not yet verified or booked)

  Customer: "I want to opt out of marketing."
  Agent: "I've marked you DNC right now."
  → UNRESOLVED (compliance audit trail required regardless of agent's claim;
    a human compliance officer must verify)

  Customer: "What are your hours today?"
  Agent: "We close at 6 PM."
  Customer: "Thanks!"
  → RESOLVED (answer satisfied the need, no follow-up action required)

  Customer: "Is the GLC 300 available in white?"
  Agent: "Yes, we have two in stock."
  Customer: "Great, thanks."
  → RESOLVED (yes/no answer satisfied)

  Customer: "Just wanted to say Priya was great last time."
  Agent: "Thanks for the kind words!"
  → RESOLVED (no action required; pure positive feedback)

HEURISTIC: if the work could still fail or fall on the floor after the conversation
ends, classify as `unresolved`. A spurious action item is recoverable — the human
closer just marks it complete with a short note. A MISSED action item means the
customer falls through the cracks.

DEFAULT ON UNCERTAINTY: if you cannot confidently classify, choose `unresolved`.
Bias toward creating action items.

================================================================================
CLOSED TAXONOMY — do NOT invent intents outside this list. If no specific
intent applies, use `general_info`.
================================================================================

{taxonomy}

================================================================================
OUTPUT FORMAT — RETURN ONLY VALID JSON, NO PROSE.
================================================================================

{{
  "primary_intent_id": "<one of taxonomy IDs>",
  "intents": [
    {{
      "intent_id": "<id>",
      "is_primary": <true|false>,
      "resolution_status": "<resolved_in_conversation|unresolved>",
      "confidence": <0..1>,
      "recap": "<one sentence ≤150 chars, only for unresolved intents; empty string for resolved ones>"
    }}
  ]
}}

Anonymization rules: never include customer names, phone numbers, email addresses,
or VINs in any recap. Use phrases like "the customer", "their vehicle", or
vehicle make+model only.

Always include the primary intent in the `intents` array with `is_primary=true`.
"""


def _build_system_prompt() -> str:
    return SYSTEM_PROMPT_TMPL.format(taxonomy=taxonomy_for_prompt())


def _build_user_payload(conv: Conversation) -> str:
    lines = [
        f"channel: {conv.channel}",
        f"conversation_id: {conv.conversation_id}",
        "transcript:",
    ]
    for turn in conv.turns:
        lines.append(f"  [{turn.speaker}] {turn.text}")
    return "\n".join(lines)


# =========================================================================
# Mock + live Haiku call
# =========================================================================

def _mock_haiku_call(conv: Conversation) -> dict[str, Any]:
    """
    Deterministic mock for offline development + CI. Pattern-matches transcript
    text against layered heuristics. Real path uses `_live_haiku_call` (Haiku 4.5).

    Strategy: collect ALL signals, then pick a primary by priority. Each branch
    can add multiple intents to the output.

    ┌──────────────────────────────────────────────────────────────────────┐
    │ §4.0 ACTION-ITEM CREATION RULE — applied throughout this mock:       │
    │                                                                       │
    │ An intent is `resolved_in_conversation` ONLY when the customer's     │
    │ underlying need was actually satisfied during the conversation        │
    │ (hours answered, yes/no confirmed, in-system action completed).      │
    │ The agent ACKNOWLEDGING or PROMISING follow-up is NOT resolution.    │
    │ Default on uncertainty: `unresolved`. Bias toward creating items.    │
    └──────────────────────────────────────────────────────────────────────┘
    """
    text = " ".join(t.text for t in conv.turns).lower()
    intents: list[dict[str, Any]] = []

    def add(intent_id: str, primary: bool, resolved: bool, confidence: float, recap: str):
        intents.append({
            "intent_id": intent_id,
            "is_primary": primary,
            "resolution_status": "resolved_in_conversation" if resolved else "unresolved",
            "confidence": confidence,
            "recap": recap if not resolved else "",
        })

    # Signal detection
    has_status = any(k in text for k in ["status update", "status of my", "my service status", "is the service done", "is the car ready", "check the status", "is it ready", "the status"]) and "recall status" not in text
    has_recall = "recall" in text
    has_quote = any(k in text for k in ["quote", "pricing", "estimate", "ballpark"])
    has_callback = ("call me back" in text or "callback" in text or "someone call me" in text
                    or "call this afternoon" in text or "call my back" in text)
    has_vehicle_inquiry = (
        any(k in text for k in ["glc 300", "gle 450", "c 300", "s 580", "do you have", "inventory", "test drive"])
        and not has_quote
    ) or "what " in text and any(k in text for k in ["glc", "gle", "c 300", "s 580", "inventory"])
    has_vehicle_signal = any(k in text for k in ["glc", "gle", "c 300", "s 580", "inventory", "test drive", "shopping"])
    has_trade = "trade" in text and ("worth" in text or "value" in text or "trade-in" in text or "trade in" in text)
    has_appt = any(k in text for k in ["appointment", "book", "schedule", "thursday", "saturday", "friday morning"]) and "missed" not in text and "did not arrive" not in text
    has_complaint = any(k in text for k in ["unacceptable", "frustrated", "want a manager", "complaint", "this is the third"])
    has_dnc = any(k in text for k in ["opt me out", "opt out", "dnc", "do not contact"])
    has_named_person = any(k in text for k in ["is david available", "ask for david", "specifically"]) or ("david" in text and "sold me" in text)
    has_takeover = "this is getting complicated" in text or "rather talk to someone" in text
    has_no_show = "did not arrive" in text or "missed" in text or "no-show" in text
    has_service = any(k in text for k in ["oil change", "brake fluid", "brake inspection", "service for", "60k-mile", "battery"])
    has_thanks_only = ("thanks" in text and "anything else" in text and "all good" in text)
    has_hours = "what are your hours" in text or "hours today" in text or "are you open" in text and "appointment" not in text

    # ----- Priority routing -----

    # 1) Compliance — highest priority (overrides everything)
    if has_dnc:
        add("compliance_alert", primary=True, resolved=False, confidence=0.95,
            recap="The customer requested DNC and opt-out from all marketing — compliance team review needed.")
        return _wrap("compliance_alert", intents)

    # 2) No-show (system-generated)
    if has_no_show:
        add("no_show", primary=True, resolved=False, confidence=0.92,
            recap="The customer missed their scheduled appointment and needs to reschedule.")
        return _wrap("no_show", intents)

    # 3) Takeover — Vini hands off to human
    if has_takeover:
        add("sms_takeover", primary=True, resolved=False, confidence=0.88,
            recap="Vini handed off the SMS thread to a human agent mid-conversation.")
        if has_appt:
            # §4.0: even if the human said "Friday 9:30 works, I'll send confirmation",
            # the booking isn't actually confirmed system-side until done. Unresolved.
            add("appointment_inquiry", primary=False, resolved=False, confidence=0.78,
                recap="The customer wants to reschedule their appointment.")
        return _wrap("sms_takeover", intents)

    # 4) Named adviser request
    if has_named_person:
        add("specific_salesperson", primary=True, resolved=False, confidence=0.86,
            recap="The customer is asking for a specific named adviser to discuss an upgrade.")
        if has_vehicle_signal:
            add("vehicle_inquiry", primary=False, resolved=False, confidence=0.74,
                recap="The customer wants to discuss a vehicle upgrade with the named adviser.")
        return _wrap("specific_salesperson", intents)

    # 5) Complaint (priority over callback when both present and complaint is the driver)
    if has_complaint and (has_status or "want a manager" in text):
        # Status + complaint
        if has_status:
            add("status_update", primary=True, resolved=False, confidence=0.88,
                recap="The customer wants a status update on their service repair.")
            add("complaint", primary=False, resolved=False, confidence=0.82,
                recap="The customer is frustrated about repeated attempts to reach the dealership.")
            return _wrap("status_update", intents)
        # Pure complaint
        add("complaint", primary=True, resolved=False, confidence=0.88,
            recap="The customer is expressing frustration and requesting a manager.")
        return _wrap("complaint", intents)

    # 6) Recall (and possibly with quote — pricing_quote primary when both)
    if has_recall and has_quote:
        add("pricing_quote", primary=True, resolved=False, confidence=0.9,
            recap="The customer is asking for a lease quote on a new vehicle.")
        add("recall_response", primary=False, resolved=False, confidence=0.88,
            recap="The customer wants to confirm whether their current vehicle is affected by a recall.")
        return _wrap("pricing_quote", intents)

    if has_recall:
        add("recall_response", primary=True, resolved=False, confidence=0.9,
            recap="The customer has an open recall and wants the dealership to handle it.")
        if has_service:
            add("service_intent", primary=False, resolved=False, confidence=0.75,
                recap="The customer wants additional service work done during the recall visit.")
        return _wrap("recall_response", intents)

    # 7) Status update — possibly combined with pricing/service request
    if has_status:
        add("status_update", primary=True, resolved=False, confidence=0.88,
            recap="The customer wants a status update on their service repair.")
        if has_quote:
            add("pricing_quote", primary=False, resolved=False, confidence=0.82,
                recap="The customer is also asking for a pricing quote on an additional service.")
        return _wrap("status_update", intents)

    # 8) Multi-intent email pattern — vehicle + trade + quote
    if has_vehicle_signal and has_trade and has_quote:
        add("vehicle_inquiry", primary=True, resolved=False, confidence=0.84,
            recap="The customer is shopping for a vehicle and wants to know current inventory.")
        add("trade_in_inquiry", primary=False, resolved=False, confidence=0.82,
            recap="The customer wants a trade valuation on their current vehicle.")
        add("pricing_quote", primary=False, resolved=False, confidence=0.8,
            recap="The customer is asking for a ballpark lease quote.")
        if has_appt:
            add("appointment_inquiry", primary=False, resolved=False, confidence=0.7,
                recap="The customer is asking whether appointments are needed to test drive.")
        return _wrap("vehicle_inquiry", intents)

    # 9) Callback — high priority when explicit
    if has_callback:
        add("callback_request", primary=True, resolved=False, confidence=0.87,
            recap="The customer wants a callback this afternoon about a vehicle lease.")
        if has_vehicle_signal:
            add("vehicle_inquiry", primary=False, resolved=False, confidence=0.74,
                recap="The customer is interested in discussing a vehicle lease on the callback.")
        return _wrap("callback_request", intents)

    # 10) Trade-in alone
    if has_trade and has_quote:
        add("trade_in_inquiry", primary=True, resolved=False, confidence=0.86,
            recap="The customer wants a trade-in valuation quote on their current vehicle.")
        add("pricing_quote", primary=False, resolved=False, confidence=0.7,
            recap="The customer is asking for a quote tied to the trade.")
        return _wrap("trade_in_inquiry", intents)

    if has_trade:
        add("trade_in_inquiry", primary=True, resolved=False, confidence=0.84,
            recap="The customer wants a trade-in valuation on their current vehicle.")
        return _wrap("trade_in_inquiry", intents)

    # 11) Vehicle inquiry — multi-intent call (vehicle + quote + appt)
    if has_vehicle_signal and has_quote and has_appt:
        add("vehicle_inquiry", primary=True, resolved=False, confidence=0.85,
            recap="The customer is shopping for a vehicle and wants current inventory.")
        add("pricing_quote", primary=False, resolved=False, confidence=0.82,
            recap="The customer is asking for a pricing quote.")
        add("appointment_inquiry", primary=False, resolved=False, confidence=0.78,
            recap="The customer wants to schedule a test-drive appointment.")
        return _wrap("vehicle_inquiry", intents)

    # 12) Vehicle inquiry alone
    if has_vehicle_inquiry or (has_vehicle_signal and "shopping" in text):
        add("vehicle_inquiry", primary=True, resolved=False, confidence=0.85,
            recap="The customer is shopping for a vehicle and wants to know current inventory.")
        return _wrap("vehicle_inquiry", intents)

    # 13) Pricing quote alone (covers single-intent service quotes)
    if has_quote:
        add("pricing_quote", primary=True, resolved=False, confidence=0.86,
            recap="The customer is asking for a pricing quote on a service.")
        return _wrap("pricing_quote", intents)

    # 14) Pure complaint
    if has_complaint:
        add("complaint", primary=True, resolved=False, confidence=0.85,
            recap="The customer is expressing frustration about the experience.")
        return _wrap("complaint", intents)

    # 15) Service intent (oil change, etc.) — usually paired with appt question
    if has_service and has_appt:
        add("appointment_inquiry", primary=True, resolved=False, confidence=0.82,
            recap="The customer wants to book a service appointment.")
        return _wrap("appointment_inquiry", intents)
    if has_service:
        add("service_intent", primary=True, resolved=False, confidence=0.78,
            recap="The customer is interested in a service line.")
        return _wrap("service_intent", intents)

    # 16) Appointment alone
    if has_appt:
        add("appointment_inquiry", primary=True, resolved=False, confidence=0.84,
            recap="The customer wants to book or change an appointment.")
        return _wrap("appointment_inquiry", intents)

    # 17) Resolved hours/general info — chitchat
    if has_thanks_only or has_hours:
        add("general_info", primary=True, resolved=True, confidence=0.7, recap="")
        return _wrap("general_info", intents)

    # Default fallback — unknown intent classification falls to general_info
    add("general_info", primary=True, resolved=False, confidence=0.5,
        recap="The customer asked a general question that requires human follow-up.")
    return _wrap("general_info", intents)


def _wrap(primary_id: str, intents: list[dict[str, Any]]) -> dict[str, Any]:
    return {"primary_intent_id": primary_id, "intents": intents}


def _live_haiku_call(conv: Conversation) -> tuple[dict[str, Any], int, int]:
    """Returns (parsed_json, input_tokens, output_tokens)."""
    client = _anthropic_client()
    if client is None:
        raise RuntimeError("anthropic SDK not installed — use --mock mode")

    system = _build_system_prompt()
    user = _build_user_payload(conv)

    response = client.messages.create(  # type: ignore[union-attr]
        model=config.MODEL_ID,
        max_tokens=config.MAX_OUTPUT_TOKENS,
        timeout=config.TIMEOUT_SECONDS,
        system=system,
        messages=[{"role": "user", "content": user}],
    )

    # Pull text content
    text_parts = []
    for block in response.content:
        if getattr(block, "type", None) == "text":
            text_parts.append(block.text)  # type: ignore[attr-defined]
    raw = "\n".join(text_parts).strip()

    # Strip code fences if Haiku wrapped JSON
    raw = re.sub(r"^```(?:json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()

    parsed = json.loads(raw)
    return parsed, response.usage.input_tokens, response.usage.output_tokens


# =========================================================================
# Main public entry point
# =========================================================================

def extract_action_items(
    conv: Conversation,
    existing_pending: list[PendingItem] | None = None,
    *,
    mock: bool = False,
    cost_tracker: CostTracker | None = None,
) -> ExtractionResult:
    existing_pending = existing_pending or []
    cost_tracker = cost_tracker or CostTracker()
    start = time.monotonic()

    # 1. PII strip pre-LLM (§4.2)
    customer_names = [conv.customer_name] if conv.customer_name else []
    stripped_turns = [
        Turn(
            speaker=t.speaker,
            text=strip_pii(t.text, customer_names).text,
            timestamp=t.timestamp,
        )
        for t in conv.turns
    ]
    safe_conv = Conversation(
        conversation_id=conv.conversation_id,
        customer_id=conv.customer_id,
        customer_name="the customer",
        channel=conv.channel,
        rooftop_id=conv.rooftop_id,
        turns=stripped_turns,
    )

    # 2. Cost-ceiling pre-flight (§4.6)
    ok, blocked_reason = cost_tracker.can_proceed(conv.rooftop_id)
    if not ok:
        latency_ms = int((time.monotonic() - start) * 1000)
        return _fallback(
            conv, latency_ms,
            reason=f"cost_ceiling:{blocked_reason}",
            existing_pending=existing_pending,
        )

    # 3. AI call (or mock)
    used_ai = True
    fallback_reason: str | None = None
    try:
        if mock:
            parsed = _mock_haiku_call(safe_conv)
            input_tokens = 250
            output_tokens = 80
        else:
            parsed, input_tokens, output_tokens = _live_haiku_call(safe_conv)
    except Exception as e:
        latency_ms = int((time.monotonic() - start) * 1000)
        return _fallback(
            conv, latency_ms,
            reason=f"ai_error:{type(e).__name__}",
            existing_pending=existing_pending,
        )

    cost_entry = cost_tracker.record(conv.rooftop_id, input_tokens, output_tokens)

    # 4. Parse + structural-validate
    try:
        detected = _parse_response(parsed)
    except Exception as e:
        latency_ms = int((time.monotonic() - start) * 1000)
        return _fallback(
            conv, latency_ms,
            reason=f"parse_error:{e}",
            existing_pending=existing_pending,
        )

    # 5. Post-LLM PII guard (§4.2)
    for di in detected:
        if di.recap and contains_pii(di.recap):
            di.recap = config.RECAP_PREFIX_AUTO + _safe_fallback_recap(safe_conv)
            used_ai = False
            fallback_reason = "pii_leak_post_call"
            break

    # 6. Confidence-threshold check (§4.1)
    for di in detected:
        if di.confidence < config.INTENT_CONFIDENCE_THRESHOLD:
            di.intent_id = config.FALLBACK_INTENT
            di.confidence = 0.5

    # 7. Deduplication (§4.4) — emit events
    events = _dedup_and_emit(safe_conv, detected, existing_pending)

    primary = next((d.intent_id for d in detected if d.is_primary), detected[0].intent_id)

    latency_ms = int((time.monotonic() - start) * 1000)
    return ExtractionResult(
        conversation_id=conv.conversation_id,
        detected_intents=detected,
        primary_intent_id=primary,
        events=events,
        cost_usd=cost_entry.cost_usd,
        latency_ms=latency_ms,
        used_ai=used_ai,
        fallback_reason=fallback_reason,
        slack_alarm=None,
    )


def _parse_response(parsed: dict[str, Any]) -> list[DetectedIntent]:
    if "intents" not in parsed:
        raise ValueError("missing 'intents' key in LLM response")
    out: list[DetectedIntent] = []
    for raw in parsed["intents"]:
        intent_id = raw.get("intent_id", "")
        if intent_id not in ALL_INTENT_IDS:
            intent_id = config.FALLBACK_INTENT
        out.append(
            DetectedIntent(
                intent_id=intent_id,
                is_primary=bool(raw.get("is_primary", False)),
                resolution_status=raw.get("resolution_status", "unresolved"),
                confidence=float(raw.get("confidence", 0.5)),
                recap=str(raw.get("recap", "")).strip(),
            )
        )
    if not out:
        raise ValueError("empty 'intents' list")
    # Guarantee exactly one primary
    primaries = [d for d in out if d.is_primary]
    if len(primaries) != 1:
        # Pick highest-confidence intent as primary
        out.sort(key=lambda d: d.confidence, reverse=True)
        for i, d in enumerate(out):
            d.is_primary = i == 0
    return out


def _dedup_and_emit(
    conv: Conversation,
    detected: list[DetectedIntent],
    existing_pending: list[PendingItem],
) -> list[EmittedEvent]:
    """Per §4.4 — deterministic dedup keyed on (customer_id, intent_id) WHERE status=pending."""
    events: list[EmittedEvent] = []
    pending_by_intent: dict[str, str] = {
        p.intent_id: p.action_item_id
        for p in existing_pending
        if p.customer_id == conv.customer_id
    }

    for di in detected:
        if di.resolution_status == "resolved_in_conversation":
            continue
        if di.intent_id in pending_by_intent:
            events.append(EmittedEvent(
                type="action_item.deduplicated",
                payload={
                    "action_item_id": pending_by_intent[di.intent_id],
                    "merged_into_action_item_id": pending_by_intent[di.intent_id],
                    "customer_id": conv.customer_id,
                    "source_conversation_id": conv.conversation_id,
                    "intent_id": di.intent_id,
                },
            ))
        else:
            events.append(EmittedEvent(
                type="action_item.created",
                payload={
                    "action_item_id": f"ai-{conv.conversation_id}-{di.intent_id}",
                    "customer_id": conv.customer_id,
                    "source_conversation_id": conv.conversation_id,
                    "source_channel": conv.channel,
                    "intent_id": di.intent_id,
                    "is_primary_intent_of_source": di.is_primary,
                    "intent_recap": di.recap,
                    "created_by_ai": True,
                },
            ))
    return events


def _safe_fallback_recap(conv: Conversation) -> str:
    """Per §4.5 — first 100 chars of post-PII-strip transcript."""
    joined = " ".join(t.text for t in conv.turns).strip()
    truncated = joined[: config.FALLBACK_RECAP_MAX_CHARS].rstrip()
    return truncated + ("…" if len(joined) > config.FALLBACK_RECAP_MAX_CHARS else "")


def _fallback(
    conv: Conversation,
    latency_ms: int,
    reason: str,
    existing_pending: list[PendingItem],
) -> ExtractionResult:
    """Per §4.5 — never block creation. Use deterministic recap + general_info."""
    safe_conv = Conversation(
        conversation_id=conv.conversation_id,
        customer_id=conv.customer_id,
        customer_name="the customer",
        channel=conv.channel,
        rooftop_id=conv.rooftop_id,
        turns=[
            Turn(
                speaker=t.speaker,
                text=strip_pii(t.text, [conv.customer_name] if conv.customer_name else []).text,
                timestamp=t.timestamp,
            )
            for t in conv.turns
        ],
    )

    recap = config.RECAP_PREFIX_AUTO + _safe_fallback_recap(safe_conv)
    di = DetectedIntent(
        intent_id=config.FALLBACK_INTENT,
        is_primary=True,
        resolution_status="unresolved",
        confidence=0.5,
        recap=recap,
    )
    events = _dedup_and_emit(safe_conv, [di], existing_pending)
    # Tag created_by_ai = False on the event payload
    for ev in events:
        if ev.type == "action_item.created":
            ev.payload["created_by_ai"] = False

    return ExtractionResult(
        conversation_id=conv.conversation_id,
        detected_intents=[di],
        primary_intent_id=config.FALLBACK_INTENT,
        events=events,
        cost_usd=0.0,
        latency_ms=latency_ms,
        used_ai=False,
        fallback_reason=reason,
        slack_alarm=f"{config.SLACK_ALARM_CHANNEL}: fallback for {conv.conversation_id} — {reason}",
    )

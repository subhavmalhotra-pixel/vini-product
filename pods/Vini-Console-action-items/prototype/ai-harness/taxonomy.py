"""
Intent taxonomy — PRD §10.5. Keep in lockstep with `test-data/taxonomy.ts`.
"""
from __future__ import annotations
from dataclasses import dataclass

ALL_INTENT_IDS = (
    "pricing_quote",
    "recall_response",
    "callback_request",
    "status_update",
    "appointment_inquiry",
    "service_intent",
    "vehicle_inquiry",
    "trade_in_inquiry",
    "complaint",
    "sms_takeover",
    "specific_salesperson",
    "compliance_alert",
    "no_show",
    "general_info",
)


@dataclass(frozen=True)
class IntentMeta:
    id: str
    display_name: str
    dept: str            # "sales" | "service" | "both" | "compliance"
    sla_hours: int
    description: str


TAXONOMY: dict[str, IntentMeta] = {
    "pricing_quote": IntentMeta(
        "pricing_quote", "Pricing or quote", "both", 24,
        "Customer is asking for a price quote or itemized estimate."
    ),
    "recall_response": IntentMeta(
        "recall_response", "Recall inquiry", "service", 4,
        "Customer is asking about a recall on their vehicle."
    ),
    "callback_request": IntentMeta(
        "callback_request", "Callback request", "both", 4,
        "Customer is explicitly asking someone to call them back."
    ),
    "status_update": IntentMeta(
        "status_update", "Status update", "service", 8,
        "Customer is asking for a status update on an existing repair order or order."
    ),
    "appointment_inquiry": IntentMeta(
        "appointment_inquiry", "Appointment", "both", 24,
        "Customer wants to book, change, confirm, or cancel an appointment."
    ),
    "service_intent": IntentMeta(
        "service_intent", "Service intent", "service", 24,
        "Customer expresses interest in a service line (oil change, brakes, etc.) without a confirmed appointment ask."
    ),
    "vehicle_inquiry": IntentMeta(
        "vehicle_inquiry", "Vehicle inquiry", "sales", 24,
        "Customer is asking about a specific vehicle, model, or inventory."
    ),
    "trade_in_inquiry": IntentMeta(
        "trade_in_inquiry", "Trade-in inquiry", "sales", 24,
        "Customer is asking about a trade-in valuation."
    ),
    "complaint": IntentMeta(
        "complaint", "Complaint", "both", 4,
        "Customer is escalating, complaining, or expressing frustration."
    ),
    "sms_takeover": IntentMeta(
        "sms_takeover", "SMS takeover", "both", 4,
        "Vini handed off mid-SMS to a human agent."
    ),
    "specific_salesperson": IntentMeta(
        "specific_salesperson", "Named adviser", "sales", 24,
        "Customer is asking for a specific named adviser or salesperson."
    ),
    "compliance_alert": IntentMeta(
        "compliance_alert", "Compliance alert", "compliance", 4,
        "Customer requested DNC / opt-out / made a compliance-relevant request."
    ),
    "no_show": IntentMeta(
        "no_show", "No-show", "service", 8,
        "Customer missed a scheduled appointment."
    ),
    "general_info": IntentMeta(
        "general_info", "General info", "both", 48,
        "Generic question (hours, address, policy). Use as fallback when no specific intent applies."
    ),
}


def taxonomy_for_prompt() -> str:
    """Render the taxonomy as a closed enum for the LLM system prompt."""
    lines = []
    for tid in ALL_INTENT_IDS:
        meta = TAXONOMY[tid]
        lines.append(f"- {tid} ({meta.dept}): {meta.description}")
    return "\n".join(lines)

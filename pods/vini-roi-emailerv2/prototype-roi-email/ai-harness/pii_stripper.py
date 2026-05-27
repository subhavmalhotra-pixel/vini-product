"""
PII stripper for conversation journeys.

PRD §4 context strategy:
  "All customer names, phone numbers, VINs, and email addresses are replaced
   with role placeholders ('the customer') before the LLM ever sees the data
   — addresses failure mode #1 (hallucinating dealer-specific facts)."

This module is the LAST line of defense before the model call AND the first
line of defense after the model returns (post-check, to fail safely if the
LLM somehow reconstructs PII).
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any


# US phone number patterns: +1-NNN-NNN-NNNN, (NNN) NNN-NNNN, NNN.NNN.NNNN, etc.
_PHONE_PATTERNS = [
    re.compile(r"\+?1?[\s.\-]?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}"),
    re.compile(r"\b\d{3}-\d{3}-\d{4}\b"),
    re.compile(r"\b\d{3}\.\d{3}\.\d{4}\b"),
]

# Email pattern.
_EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b")

# VIN pattern (17 chars, alphanumeric, no I/O/Q).
_VIN_PATTERN = re.compile(r"\b[A-HJ-NPR-Z0-9]{17}\b")

# 4-digit VIN suffixes that may appear ("VIN ends in 7421")
_VIN_SUFFIX_PATTERN = re.compile(r"\bVIN\s+(?:ends?\s+in|ending|number)?\s*\d{4,8}\b", re.IGNORECASE)


@dataclass
class StripResult:
    """Result of PII stripping with diagnostics for logging."""
    text: str
    redactions: dict[str, int]  # category -> count of redactions

    def has_redactions(self) -> bool:
        return any(c > 0 for c in self.redactions.values())


def _strip_field(text: str, redactions: dict[str, int]) -> str:
    """Apply all PII patterns to a single string. Mutates redactions counts."""
    if not text:
        return text

    # Order matters: VIN first (longest), then email, then phone, then suffix.
    new_text, n = _VIN_PATTERN.subn("[VIN_REDACTED]", text)
    redactions["vin"] = redactions.get("vin", 0) + n

    new_text, n = _VIN_SUFFIX_PATTERN.subn("[VIN_REF_REDACTED]", new_text)
    redactions["vin_suffix"] = redactions.get("vin_suffix", 0) + n

    new_text, n = _EMAIL_PATTERN.subn("[EMAIL_REDACTED]", new_text)
    redactions["email"] = redactions.get("email", 0) + n

    for pat in _PHONE_PATTERNS:
        new_text, n = pat.subn("[PHONE_REDACTED]", new_text)
        redactions["phone"] = redactions.get("phone", 0) + n

    return new_text


def _replace_known_names(text: str, names: list[str], redactions: dict[str, int]) -> str:
    """Replace known customer names (case-insensitive) with 'the customer'."""
    if not names or not text:
        return text
    for name in names:
        if not name:
            continue
        # Whole-word, case-insensitive
        pat = re.compile(r"\b" + re.escape(name) + r"\b", re.IGNORECASE)
        text, n = pat.subn("the customer", text)
        redactions["name"] = redactions.get("name", 0) + n
    return text


def strip_journey(journey: dict[str, Any]) -> tuple[dict[str, Any], dict[str, int]]:
    """
    Strip PII from a conversation journey dict before sending to the LLM.

    Returns a NEW dict (does not mutate input) plus a redactions dict for
    logging / observability.

    The harness MUST call this before constructing the model prompt.
    """
    redactions: dict[str, int] = {}

    # Collect known names from the pii block so we can also redact them
    # from the text content of turns.
    pii_block = journey.get("pii") or {}
    candidate_names: list[str] = []

    raw_name = pii_block.get("customer_name")
    if raw_name and not raw_name.startswith("Anonymous"):
        # Split full name into individual tokens — first name alone may appear
        # in agent utterances ("Hi Jamie, ...").
        candidate_names.extend([raw_name, *raw_name.split()])

    # Deep-copy the turns and strip each one
    new_turns = []
    for turn in journey.get("turns", []):
        text = turn.get("text", "")
        text = _replace_known_names(text, candidate_names, redactions)
        text = _strip_field(text, redactions)
        new_turns.append({**turn, "text": text})

    # Build a sanitized journey — drop the pii block entirely; the LLM does
    # NOT need it. Anonymize agent display name (keep generic role).
    sanitized = {
        "journey_id": journey.get("journey_id"),
        "rooftop_id": journey.get("rooftop_id"),
        "agent": journey.get("agent"),
        "agent_role_label": _agent_role_label(journey.get("agent")),
        "intent": journey.get("intent"),
        "outcome": journey.get("outcome"),
        "touch_count": journey.get("touch_count"),
        "channels_used": journey.get("channels_used"),
        "sentiment_start": journey.get("sentiment_start"),
        "sentiment_end": journey.get("sentiment_end"),
        "critical_flag": journey.get("critical_flag"),
        "selected_reason": journey.get("selected_reason"),
        "turns": new_turns,
        # NO pii block — explicitly omitted
    }
    return sanitized, redactions


def _agent_role_label(agent_code: str | None) -> str:
    """Map internal agent code to a public role label for the LLM context."""
    mapping = {
        "sales_ib": "the Sales Inbound agent",
        "sales_ob": "the Sales Outbound agent",
        "service_ib": "the Service Inbound agent",
        "service_ob": "the Service Outbound agent",
    }
    return mapping.get(agent_code or "", "the agent")


def post_check_output(text: str) -> tuple[bool, list[str]]:
    """
    Post-call check: scan model output for PII fragments that should never appear.

    Returns (passed, flagged_fragments).
    PRD §4 fallback rule: if this returns (False, ...), omit the Story block.
    """
    flagged: list[str] = []
    if not text:
        return False, ["empty_output"]

    if _EMAIL_PATTERN.search(text):
        flagged.append("email")
    if _VIN_PATTERN.search(text):
        flagged.append("vin")
    for pat in _PHONE_PATTERNS:
        if pat.search(text):
            flagged.append("phone")
            break
    if _VIN_SUFFIX_PATTERN.search(text):
        flagged.append("vin_suffix_reference")

    return (len(flagged) == 0), flagged

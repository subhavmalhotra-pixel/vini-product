"""
PII stripper — PRD §4.2 pre + post LLM guard.

Strips customer PII (full name, phone, email, VIN) from transcripts before they
reach the LLM, AND re-scans LLM output to catch any leak-through.
Mirrors the pattern used by the ROI Emailer pod's `pii_stripper.py`.
"""
from __future__ import annotations

import re
from dataclasses import dataclass


# E.164-ish and US-format phone numbers
PHONE_RE = re.compile(
    r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"
)

# Emails
EMAIL_RE = re.compile(r"\b[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}\b")

# VINs are 17 alphanumerics excluding I, O, Q
VIN_RE = re.compile(r"\b[A-HJ-NPR-Z0-9]{17}\b")

# Last-4 of VIN (common in dealership transcripts)
VIN_SUFFIX_RE = re.compile(r"\bVIN[-\s]?[A-Z0-9]{4}\b", re.IGNORECASE)


@dataclass
class StripResult:
    text: str
    redactions: list[str]  # what was scrubbed — for audit


def strip_pii(text: str, customer_names: list[str] | None = None) -> StripResult:
    """
    Strip PII from `text`. Customer names from the conversation record can be
    passed explicitly so they get replaced with 'the customer'.

    NEVER strips dealer names, vehicle make/model, recall types, etc. — only
    end-customer-identifying info.
    """
    redactions: list[str] = []
    out = text

    # Customer names (passed explicitly)
    if customer_names:
        for name in customer_names:
            parts = [p.strip() for p in name.split() if p.strip()]
            if not parts:
                continue
            # full name
            full_pat = re.escape(name)
            if re.search(rf"\b{full_pat}\b", out):
                out = re.sub(rf"\b{full_pat}\b", "the customer", out)
                redactions.append(f"name:{name}")
            # first name alone (only when 2+ chars and not a common word)
            first = parts[0]
            if len(first) >= 3:
                pat = rf"\b{re.escape(first)}\b"
                if re.search(pat, out):
                    out = re.sub(pat, "the customer", out)
                    redactions.append(f"first:{first}")

    # Phone numbers
    def _phone_sub(m: re.Match) -> str:
        redactions.append(f"phone:{m.group(0)}")
        return "<phone>"

    out = PHONE_RE.sub(_phone_sub, out)

    # Emails
    def _email_sub(m: re.Match) -> str:
        redactions.append(f"email:{m.group(0)}")
        return "<email>"

    out = EMAIL_RE.sub(_email_sub, out)

    # VINs (full)
    def _vin_sub(m: re.Match) -> str:
        redactions.append(f"vin:{m.group(0)}")
        return "<vin>"

    out = VIN_RE.sub(_vin_sub, out)

    # VIN suffix patterns
    out = VIN_SUFFIX_RE.sub("<vin-suffix>", out)

    return StripResult(text=out, redactions=redactions)


def contains_pii(text: str) -> bool:
    """Post-LLM guard — returns True if any PII pattern survives in the recap."""
    if PHONE_RE.search(text):
        return True
    if EMAIL_RE.search(text):
        return True
    if VIN_RE.search(text):
        return True
    return False

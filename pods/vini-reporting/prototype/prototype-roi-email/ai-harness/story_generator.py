"""
Story-of-the-Week / Month narrative summary generator.

Implements PRD §4 harness spec exactly:
  Model:        Claude Haiku 4.5
  Tools:        None — single LLM call
  Context:      PII-stripped structured JSON in the system prompt
  Fallback:     omit Story block entirely on error/timeout/PII-fail/short-output
  Cost ceiling: $0.02 per request, enforced before invocation

Public entry point: generate_story(journey: dict, dealer_id: str) -> StoryResult
"""
from __future__ import annotations

import json
import os
import time
import uuid
from dataclasses import dataclass
from enum import Enum
from typing import Any

from config import CONFIG
from cost_tracker import CostTracker
from pii_stripper import strip_journey, post_check_output


class FallbackReason(str, Enum):
    NONE = "none"
    API_ERROR = "api_error"
    TIMEOUT = "timeout"
    PII_DETECTED_POST = "pii_detected_post"
    SHORT_OUTPUT = "short_output"
    COST_CEILING_PROJECTED = "cost_ceiling_projected"
    COST_CEILING_DAILY = "cost_ceiling_daily"
    COST_CEILING_WEEKLY = "cost_ceiling_weekly"


@dataclass
class StoryResult:
    """Result of a Story generation attempt."""
    journey_id: str
    summary: str | None             # None when fallback engaged
    source: str                     # "ai_haiku" | "fallback_omit"
    fallback_reason: FallbackReason
    redactions: dict[str, int]
    cost_usd: float
    latency_ms: int
    input_tokens: int
    output_tokens: int
    flagged_fragments: list[str]    # PII fragments caught post-call


# Module-level singleton — in production, inject via FastAPI dependency.
_COST_TRACKER = CostTracker()


# =============================================================================
# Prompt construction
# =============================================================================

_SYSTEM_PROMPT = """\
You are writing a single 2-3 paragraph narrative summary of one customer journey at a US automotive dealership.

This summary appears in an operational performance email read by dealership managers (GM, Sales Manager, Service Manager). The audience already trusts the numbers in the email; the Story exists to make ONE customer journey legible.

Strict rules:
1. PROSE ONLY — 2 to 3 paragraphs, total length under 600 words.
2. GROUND every claim in the provided transcript. Do not invent specifics (APR, term length, financing partners, additional inventory, prior visits, etc.) that are not present.
3. NEVER include customer names, phone numbers, email addresses, or VINs. Use 'the customer' generically. The data you receive has already been redacted — your output must remain redacted.
4. Preserve vehicle make/year/trim VERBATIM (e.g., "2017 Tacoma" not "a Toyota truck"; "Civic LX" not "a sedan"). Preserve service intent verbatim (e.g., "Takata airbag recall" not "a recall").
5. The outcome you describe MUST match the structured outcome field exactly:
   - appointment_booked → "booked" / "scheduled" / "confirmed for [day]"
   - warm_transfer → "warm transfer" / "handed off"
   - opted_out / dnc → "do-not-call" / "opted out"
   - no_response → "no response" / "hangup"
   - lost → "did not convert"
6. Plain operational tone. NO marketing language: avoid "delight", "best-in-class", "seamless", "world-class", "exceptional", "transformative", "leverage", "synergy", "above and beyond".
7. Reflect sentiment shift if present (e.g., "moved from frustrated to committed"). Do NOT invent sentiment that contradicts the structured fields.
8. If the transcript is too brief (1-2 turns, hangup) to summarize, return a single sentence stating insufficient content. Do not embellish.

Output: JUST the summary text. No preamble, no headings, no JSON wrapper.
"""


def _build_user_message(journey: dict[str, Any]) -> str:
    """Render the sanitized journey into a structured JSON payload for the user message."""
    return json.dumps(journey, indent=2)


# =============================================================================
# Main entry point
# =============================================================================

def generate_story(
    journey: dict[str, Any],
    dealer_id: str,
    *,
    mock_response: str | None = None,
    cost_tracker: CostTracker | None = None,
) -> StoryResult:
    """
    Generate a Story summary for one customer journey.

    Args:
        journey: ConversationJourney as a dict (matches test-data/schema.ts shape).
        dealer_id: For cost tracking + ceiling enforcement.
        mock_response: For unit tests / offline eval runs — bypasses the real
                       API call. Always exercise the rest of the pipeline.
        cost_tracker: Optional override. Defaults to module-level singleton.

    Returns:
        StoryResult — `summary` is None when fallback engaged.
    """
    tracker = cost_tracker or _COST_TRACKER
    request_id = str(uuid.uuid4())
    started = time.time()

    # ---- Step 1: PII strip ----
    sanitized, redactions = strip_journey(journey)
    journey_id = sanitized.get("journey_id") or "unknown"

    # ---- Step 2: Project cost & enforce ceilings ----
    user_message = _build_user_message(sanitized)
    estimated_input_tokens = _rough_token_count(_SYSTEM_PROMPT) + _rough_token_count(user_message)
    estimated_output_tokens = CONFIG.max_output_tokens
    projected_cost = tracker.estimate_cost(estimated_input_tokens, estimated_output_tokens)

    if tracker.is_per_request_over(projected_cost):
        return _fallback_result(
            journey_id, FallbackReason.COST_CEILING_PROJECTED,
            redactions, projected_cost, started, estimated_input_tokens, 0, [],
        )
    if tracker.is_per_day_over(dealer_id):
        return _fallback_result(
            journey_id, FallbackReason.COST_CEILING_DAILY,
            redactions, projected_cost, started, estimated_input_tokens, 0, [],
        )
    if tracker.is_per_week_over(dealer_id):
        return _fallback_result(
            journey_id, FallbackReason.COST_CEILING_WEEKLY,
            redactions, projected_cost, started, estimated_input_tokens, 0, [],
        )

    # ---- Step 3: Invoke model ----
    try:
        if mock_response is not None:
            output_text = mock_response
            actual_input_tokens = estimated_input_tokens
            actual_output_tokens = _rough_token_count(mock_response)
        else:
            output_text, actual_input_tokens, actual_output_tokens = _invoke_anthropic(
                system=_SYSTEM_PROMPT,
                user=user_message,
            )
    except TimeoutError:
        return _fallback_result(
            journey_id, FallbackReason.TIMEOUT,
            redactions, projected_cost, started, estimated_input_tokens, 0, [],
        )
    except Exception:  # noqa: BLE001 — model SDK can surface many error classes
        return _fallback_result(
            journey_id, FallbackReason.API_ERROR,
            redactions, projected_cost, started, estimated_input_tokens, 0, [],
        )

    # ---- Step 4: Record cost ----
    evt = tracker.record(
        dealer_id=dealer_id,
        request_id=request_id,
        input_tokens=actual_input_tokens,
        output_tokens=actual_output_tokens,
    )

    # ---- Step 5: Post-call PII check ----
    pii_ok, flagged = post_check_output(output_text)
    if not pii_ok and CONFIG.fallback_omit_on_pii_detected_post_call:
        return _fallback_result(
            journey_id, FallbackReason.PII_DETECTED_POST,
            redactions, evt.cost_usd, started, evt.input_tokens, evt.output_tokens, flagged,
        )

    # ---- Step 6: Short-output check ----
    if (
        CONFIG.fallback_omit_on_short_output
        and len(output_text.strip()) < CONFIG.fallback_min_output_chars
    ):
        return _fallback_result(
            journey_id, FallbackReason.SHORT_OUTPUT,
            redactions, evt.cost_usd, started, evt.input_tokens, evt.output_tokens, [],
        )

    elapsed_ms = int((time.time() - started) * 1000)
    return StoryResult(
        journey_id=journey_id,
        summary=output_text.strip(),
        source="ai_haiku",
        fallback_reason=FallbackReason.NONE,
        redactions=redactions,
        cost_usd=evt.cost_usd,
        latency_ms=elapsed_ms,
        input_tokens=evt.input_tokens,
        output_tokens=evt.output_tokens,
        flagged_fragments=[],
    )


# =============================================================================
# Helpers
# =============================================================================

def _fallback_result(
    journey_id: str,
    reason: FallbackReason,
    redactions: dict[str, int],
    cost_usd: float,
    started: float,
    input_tokens: int,
    output_tokens: int,
    flagged: list[str],
) -> StoryResult:
    """Construct a fallback StoryResult — Story block will be omitted from email."""
    elapsed_ms = int((time.time() - started) * 1000)
    return StoryResult(
        journey_id=journey_id,
        summary=None,
        source="fallback_omit",
        fallback_reason=reason,
        redactions=redactions,
        cost_usd=cost_usd,
        latency_ms=elapsed_ms,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        flagged_fragments=flagged,
    )


def _rough_token_count(text: str) -> int:
    """Approximate token count (1 token ≈ 4 chars). Engineering can replace
    with tiktoken / Anthropic's tokenizer in production."""
    return max(1, len(text) // 4)


def _invoke_anthropic(*, system: str, user: str) -> tuple[str, int, int]:
    """
    Real Anthropic SDK call. Imported lazily so the harness can be unit-tested
    without the SDK installed (use mock_response= in tests).

    Returns (output_text, input_tokens, output_tokens).
    """
    from anthropic import Anthropic  # type: ignore

    client = Anthropic(
        api_key=os.environ.get("ANTHROPIC_API_KEY"),
        timeout=CONFIG.request_timeout_seconds,
    )
    msg = client.messages.create(
        model=CONFIG.model,
        max_tokens=CONFIG.max_output_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    text = "".join(block.text for block in msg.content if block.type == "text")
    return text, msg.usage.input_tokens, msg.usage.output_tokens


def get_cost_summary() -> dict:
    """Surface aggregated cost stats for the eval-runner report."""
    return _COST_TRACKER.summary()


def reset_cost_tracker() -> None:
    """Reset the module-level cost tracker — used between eval runs."""
    global _COST_TRACKER
    _COST_TRACKER = CostTracker()

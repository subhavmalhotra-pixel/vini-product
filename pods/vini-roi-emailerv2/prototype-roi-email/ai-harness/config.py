"""
Harness configuration — single source of truth for model, ceilings, and timeouts.

All values come from PRD §4 (pods/vini-reporting/prd-roi-emailer.md).
Do not modify these without an updated PRD.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class HarnessConfig:
    # ---- Model ----
    # PRD §4: Claude Haiku 4.5. Sonnet is ~3x cost with no quality gain at this
    # length and structure. Story runs at most weekly/monthly per rooftop.
    model: str = "claude-haiku-4-5-20251001"

    # ---- Token budget ----
    # PRD §4: ≤ 4k input tokens, ≤ 600 output tokens, ≤ $0.02/request
    max_input_tokens: int = 4000
    max_output_tokens: int = 600

    # ---- Latency ----
    # PRD §4: timeout >10s triggers fallback. Eval rubric holds to 3s as
    # operational target. Set timeout slightly above the eval ceiling.
    request_timeout_seconds: float = 10.0
    target_p95_latency_ms: int = 3000

    # ---- Cost ceilings ----
    # PRD §4: per-request ≤ $0.02. Kill criterion #4: if avg cost over
    # rolling 24h exceeds $0.05, kill AI surfaces.
    cost_per_request_ceiling_usd: float = 0.02
    cost_per_week_per_dealer_ceiling_usd: float = 0.20
    cost_per_day_per_dealer_ceiling_usd: float = 1.0
    rolling_24h_cost_kill_threshold_usd: float = 0.05  # avg per request

    # ---- Pricing (Haiku 4.5 as of model release; adjust if rates change) ----
    # Used by cost_tracker to project per-request cost before invocation.
    input_token_cost_per_million_usd: float = 1.00
    output_token_cost_per_million_usd: float = 5.00

    # ---- Fallback behavior ----
    # PRD §4 fallback: omit Story block entirely on any failure path.
    fallback_omit_on_error: bool = True
    fallback_omit_on_timeout: bool = True
    fallback_omit_on_pii_detected_post_call: bool = True
    fallback_omit_on_short_output: bool = True
    fallback_min_output_chars: int = 100  # PRD §4

    # ---- Alarm channel ----
    slack_alarm_channel: str = "#vini-coverage-alerts"


CONFIG = HarnessConfig()

"""
Harness config — PRD §4.6 cost ceilings + §4.2 model choice + §4.5 fallback rules.
"""
from __future__ import annotations

# ---- Model ----------------------------------------------------------------
MODEL_ID = "claude-haiku-4-5-20251001"

# ---- Cost ceilings (§4.6) -------------------------------------------------
PER_CALL_CEILING_USD = 0.005          # target cost per conversation
PER_ROOFTOP_DAILY_CAP_USD = 0.75      # max spend per rooftop / day
HARD_KILL_24H_AVG_USD = 0.05          # auto-disable AI if 24h rolling avg exceeds this

# Approximate Haiku 4.5 pricing (USD per 1M tokens) — used by cost tracker
HAIKU_INPUT_USD_PER_MTOK = 1.00
HAIKU_OUTPUT_USD_PER_MTOK = 5.00

# ---- Generation budget ----------------------------------------------------
MAX_INPUT_TOKENS = 6000               # transcript + system prompt budget
MAX_OUTPUT_TOKENS = 300               # structured output budget
TIMEOUT_SECONDS = 10                  # §4.5 timeout threshold

# ---- Fallback (§4.5) ------------------------------------------------------
FALLBACK_RECAP_MAX_CHARS = 100        # deterministic recap length
FALLBACK_INTENT = "general_info"      # default classification on AI failure
RECAP_PREFIX_AUTO = "[auto] "         # prepended to deterministic fallback recaps

# ---- Confidence thresholds (§4.1) ----------------------------------------
INTENT_CONFIDENCE_THRESHOLD = 0.55    # below this, route to general_info

# ---- Slack alarm channel (logged in mock mode) ---------------------------
SLACK_ALARM_CHANNEL = "#vini-coverage-alerts"

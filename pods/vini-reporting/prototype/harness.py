import json
import time
from datetime import datetime, timedelta
from typing import Optional

import anthropic

from tools import (
    MOCK_DATA,
    get_dealer_info,
    get_weekly_call_stats,
    get_appointment_funnel,
    get_lead_activity_summary,
    get_top_call_examples,
)

MODEL = "claude-haiku-4-5-20251001"
MAX_OUTPUT_TOKENS = 350   # generous ceiling; grader enforces <=150 words
TIMEOUT_SEC = 10

TOOL_DEFS = [
    {
        "name": "get_weekly_call_stats",
        "description": "Returns total inbound/outbound calls, after-hours count, and per-call outcomes for a dealer for the specified week.",
        "input_schema": {
            "type": "object",
            "properties": {
                "dealer_id": {"type": "string"},
                "week_start_date": {"type": "string", "description": "ISO date YYYY-MM-DD"},
            },
            "required": ["dealer_id", "week_start_date"],
        },
    },
    {
        "name": "get_appointment_funnel",
        "description": "Returns appointments set, showed, demo'd, and closed for the dealer week.",
        "input_schema": {
            "type": "object",
            "properties": {
                "dealer_id": {"type": "string"},
                "week_start_date": {"type": "string"},
            },
            "required": ["dealer_id", "week_start_date"],
        },
    },
    {
        "name": "get_lead_activity_summary",
        "description": "Returns hot leads touched, total outreach attempts, and per-lead last action.",
        "input_schema": {
            "type": "object",
            "properties": {
                "dealer_id": {"type": "string"},
                "week_start_date": {"type": "string"},
            },
            "required": ["dealer_id", "week_start_date"],
        },
    },
    {
        "name": "get_top_call_examples",
        "description": "Returns up to n representative calls with outcome and snippet.",
        "input_schema": {
            "type": "object",
            "properties": {
                "dealer_id": {"type": "string"},
                "week_start_date": {"type": "string"},
                "n": {"type": "integer", "default": 3},
            },
            "required": ["dealer_id", "week_start_date"],
        },
    },
]

_TOOL_DISPATCH = {
    "get_weekly_call_stats": lambda i: get_weekly_call_stats(i["dealer_id"], i["week_start_date"]),
    "get_appointment_funnel": lambda i: get_appointment_funnel(i["dealer_id"], i["week_start_date"]),
    "get_lead_activity_summary": lambda i: get_lead_activity_summary(i["dealer_id"], i["week_start_date"]),
    "get_top_call_examples": lambda i: get_top_call_examples(i["dealer_id"], i["week_start_date"], i.get("n", 3)),
}


def build_insight_card(dealer_id: str, week_start_date: str) -> dict:
    """
    Returns:
      output          str | None   -- generated text, or None on fallback
      tool_results    dict         -- keyed by tool name, collected during run
      fallback        bool
      fallback_reason str | None
      latency_ms      int
      input_tokens    int
      output_tokens   int
    """
    info = get_dealer_info(dealer_id, week_start_date)
    week_end = (
        datetime.strptime(week_start_date, "%Y-%m-%d") + timedelta(days=6)
    ).strftime("%Y-%m-%d")

    system = (
        "You generate a plain-language weekly insight card for a car dealership's ROI dashboard. "
        "Call the available tools to retrieve this week's data for the given dealer, then write a "
        "concise summary of 150 words or fewer. "
        "Rules: (1) Every number you state must come directly from the tool data. "
        "(2) Do NOT say Vini caused, generated, drove, resulted in, or produced any sales or deals -- "
        "report what happened, not what caused it. "
        "(3) Mention the dealer name and the week dates. "
        "(4) Include the after-hours call count and outcomes if any after-hours calls occurred."
    )

    messages = [
        {
            "role": "user",
            "content": (
                f"Generate the weekly insight card for {info['dealer_name']} "
                f"(dealer_id: {dealer_id}) for the week of {week_start_date} through {week_end}."
            ),
        }
    ]

    client = anthropic.Anthropic()
    tool_results: dict = {}
    input_tokens = 0
    output_tokens = 0
    start = time.time()

    try:
        for _ in range(10):  # max tool-use iterations
            remaining = TIMEOUT_SEC - (time.time() - start)
            if remaining <= 0:
                return _fallback("timeout", tool_results, start, input_tokens, output_tokens)

            response = client.messages.create(
                model=MODEL,
                max_tokens=MAX_OUTPUT_TOKENS,
                system=system,
                tools=TOOL_DEFS,
                messages=messages,
                timeout=remaining,
            )
            input_tokens += response.usage.input_tokens
            output_tokens += response.usage.output_tokens

            if response.stop_reason == "tool_use":
                tool_use_results = []
                messages.append({"role": "assistant", "content": response.content})
                for block in response.content:
                    if block.type == "tool_use":
                        fn = _TOOL_DISPATCH.get(block.name)
                        result = fn(block.input) if fn else {"error": f"unknown tool {block.name}"}
                        if fn:
                            tool_results[block.name] = result
                        tool_use_results.append(
                            {
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": json.dumps(result),
                            }
                        )
                messages.append({"role": "user", "content": tool_use_results})

            elif response.stop_reason == "end_turn":
                text = _extract_text(response.content)
                if not text:
                    return _fallback("empty_output", tool_results, start, input_tokens, output_tokens)
                return {
                    "output": text,
                    "tool_results": tool_results,
                    "fallback": False,
                    "fallback_reason": None,
                    "latency_ms": int((time.time() - start) * 1000),
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                }
            else:
                return _fallback(
                    f"stop:{response.stop_reason}", tool_results, start, input_tokens, output_tokens
                )

        return _fallback("max_iterations", tool_results, start, input_tokens, output_tokens)

    except anthropic.APITimeoutError:
        return _fallback("api_timeout", tool_results, start, input_tokens, output_tokens)
    except anthropic.APIError as exc:
        return _fallback(f"api_error:{exc}", tool_results, start, input_tokens, output_tokens)


def _extract_text(content) -> str:
    return " ".join(b.text for b in content if getattr(b, "type", None) == "text").strip()


def _fallback(reason: str, tool_results: dict, start: float, in_tok: int = 0, out_tok: int = 0) -> dict:
    return {
        "output": None,
        "tool_results": tool_results,
        "fallback": True,
        "fallback_reason": reason,
        "latency_ms": int((time.time() - start) * 1000),
        "input_tokens": in_tok,
        "output_tokens": out_tok,
    }

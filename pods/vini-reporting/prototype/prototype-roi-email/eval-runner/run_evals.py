#!/usr/bin/env python3
"""
Story-of-the-Week eval runner.

Reads eval cases from evals/story-of-the-week/cases.yaml, runs each through
the AI harness, grades against must_contain / must_not_contain / threshold
gates, and reports pass rate per case + per bucket.

Usage:
  # Mock mode (no API key needed — uses canned responses to exercise the pipeline):
  python run_evals.py --mock

  # Live mode (requires ANTHROPIC_API_KEY):
  python run_evals.py

  # Single case:
  python run_evals.py --case story-001 --mock

  # JSON output for CI:
  python run_evals.py --mock --json > eval-report.json
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from collections import defaultdict
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any

# Bootstrapping the prototype's sibling-dir layout. In production these would
# be a package; for the prototype, we add the ai-harness dir to sys.path.
_HERE = Path(__file__).resolve().parent
_HARNESS_DIR = _HERE.parent / "ai-harness"
sys.path.insert(0, str(_HARNESS_DIR))

import yaml  # type: ignore  # noqa: E402

from story_generator import (  # type: ignore  # noqa: E402
    generate_story,
    get_cost_summary,
    reset_cost_tracker,
    FallbackReason,
)
from fixtures import get_journey  # type: ignore  # noqa: E402

CASES_PATH = _HERE.parent / "evals" / "story-of-the-week" / "cases.yaml"


# =============================================================================
# Result types
# =============================================================================

@dataclass
class CaseResult:
    case_id: str
    bucket: str
    priority: str
    passed: bool
    fail_reasons: list[str]
    must_contain_hits: list[str]
    must_contain_misses: list[str]
    must_not_contain_hits: list[str]
    output: str | None
    fallback_reason: str
    cost_usd: float
    latency_ms: int
    notes: str


# =============================================================================
# Mock responses — canned outputs per case_id for mock-mode runs
# =============================================================================

# These are NOT the model's real output. They are crafted to exercise the
# pass/fail logic so engineers can verify the runner before plugging in the
# real API. Edit these to test specific failure modes.

MOCK_RESPONSES: dict[str, str] = {
    "story-001": (
        "A weeknight chat opened with a price objection — the customer believed the listed "
        "Civic payment was out of reach. Across two follow-ups the next day, the agent narrowed "
        "term and trim against the customer's $390/mo target, surfaced the LX as the trim that "
        "hit the number, and converted to a Saturday test drive booking on a third touch. "
        "Tone moved from frustration to commitment without any pricing concession, and the booking holds."
    ),
    "story-002": (
        "An inbound call opened with the customer worried about a recall letter on a 2017 Tacoma. "
        "The agent confirmed the open Takata airbag recall, explained that the manufacturer "
        "covers the repair at no cost, and booked the appointment for Thursday 8 AM in the same "
        "call. Sentiment moved from concerned to neutral once the no-cost repair was confirmed."
    ),
    "story-003": (
        "An after-hours SMS reached the customer who had been silent for 18 months. The agent "
        "offered a complimentary multi-point inspection promotion, and the customer responded "
        "within minutes asking for Saturday. A second SMS confirmed 10 AM. Two-touch path, "
        "no callback or human handover required."
    ),
    "story-004": (
        "Across nine touches over two weeks spanning call, SMS, and email, the agent moved a "
        "hesitant trade-in inquiry to a confirmed Saturday test drive on a Pilot Touring. The "
        "conversion required a real desk-checked trade evaluation that came in $400 over KBB — "
        "the agent then offered two Touring trims, Modern Steel and Diffused Sky Blue, for a "
        "side-by-side at 9 AM Saturday."
    ),
    "story-005": (
        "After-hours inbound at 9:14 PM — the customer had filled out an online inquiry and "
        "asked for a callback. The agent booked the Civic LX test drive for 3 PM the next day "
        "across a 4-turn chat. Quick, clean handoff to the dealer's confirmation system."
    ),
    "story-006": (
        "The customer had already test-driven a CR-V at another dealer and wanted to talk "
        "pricing on the EX-L. The agent recognized the question was outside the scope of "
        "initial qualification and executed a warm transfer to a finance specialist with the "
        "lease and finance numbers ready."
    ),
    "story-007": (
        "RO #44218 status update: parts (brake pads) arrived Thursday as the agent had told "
        "the customer in the initial call. A follow-up SMS offered Friday or Saturday install "
        "slots. Customer chose Saturday 9 AM."
    ),
    "story-008": (
        "A Spring Inventory campaign dial reached the customer on the first attempt. The agent "
        "led with the $279/mo Civic lease offer; the customer had been waiting for a deal at "
        "that level and accepted a Saturday 10 AM hold on a Civic LX."
    ),
    "story-009": (
        "A code-switched call — the customer alternated between English and Spanish while "
        "requesting an oil change on an Accord 2022. The agent acknowledged the request, "
        "offered two morning slots, and booked 10 AM the next day."
    ),
    "story-010": (
        "A check engine light triggered the inbound call. The agent confirmed availability for "
        "a same-day diagnostic and booked 2 PM that afternoon. Two-turn conversation, no "
        "handover needed."
    ),
    # Customer-failure cases: mock outputs CRAFTED to fail to demonstrate the gates work
    "story-011": (
        # Should pass — generic phrasing, no PII
        "The customer reached out via chat about Civic payments, worked through the trim and "
        "term math with the agent, and booked a Saturday test drive on the LX."
    ),
    "story-012": (
        # Should pass — discusses $390 and $2k but no invented APR
        "The customer's monthly target was $390 with $2k down. The agent walked through trim "
        "and term combinations that fit, settling on the Civic LX. Saturday test drive booked."
    ),
    "story-013": (
        # Should pass — no invented bank or financing partner
        "The agent matched the customer's monthly target by narrowing trim selection to the LX "
        "and offering a Saturday test drive. No financing terms were finalized in the conversation."
    ),
    "story-014": (
        # Should pass — preserves 2017 Tacoma
        "The customer's 2017 Tacoma was confirmed against the open Takata recall. Same-call "
        "booking for Thursday 8 AM, manufacturer covers repair cost."
    ),
    "story-015": (
        # Should pass — references multi-point inspection accurately
        "The complimentary multi-point inspection offer was the unlock. The customer responded "
        "to an after-hours SMS and confirmed Saturday 10 AM within minutes."
    ),
    "story-016": (
        # Should pass — purely operational tone
        "Across nine touches the agent moved the customer from initial inquiry to a confirmed "
        "Saturday test drive. Trade evaluation, vehicle selection, and channel sequence all "
        "contributed to the booking."
    ),
    "story-017": (
        # Should pass — describes warm transfer, not booking
        "The customer had already test-driven a CR-V elsewhere and asked about EX-L pricing. "
        "The agent warm transferred to a finance specialist rather than attempt to handle "
        "pricing directly."
    ),
    "story-018": (
        # Should pass — references multi-touch / multi-week journey
        "Across nine touches spanning two weeks, the agent worked the trade-in valuation in "
        "parallel with vehicle selection. The conversation moved through call, SMS, and email "
        "before landing on a Saturday test drive."
    ),
    "story-019": (
        # Should pass — names Takata airbag specifically
        "The customer received a recall letter; the agent confirmed it was the Takata airbag "
        "inflator recall and booked the no-cost repair for Thursday 8 AM."
    ),
    "story-020": (
        # Should pass — no VIN reference
        "The agent verified the recall against the customer's vehicle records and confirmed "
        "the 2017 Tacoma was included. Thursday 8 AM booked."
    ),
    "story-021": (
        # Should pass — chat → SMS → call sequence preserved
        "The conversation began in chat, continued by SMS the following day, and ended on a "
        "confirming call. No other channels were involved."
    ),
    "story-022": (
        # Should pass — reflects sentiment shift
        "The customer entered the chat frustrated by the listed payment. The agent's trim "
        "narrowing reframed the conversation and the customer ended the journey committed to "
        "the Saturday test drive."
    ),
    "story-023": (
        # Should pass — references two Touring trims
        "The agent confirmed two Pilot Touring trims in stock — Modern Steel and Diffused Sky "
        "Blue — and offered a Saturday side-by-side at 9 AM."
    ),
    # Adversarial cases
    "story-024": (
        "An 8-second inbound call ended in hangup before the customer's intent could be "
        "captured. The agent's greeting was cut off mid-sentence and no follow-up signal "
        "was recorded — insufficient content to summarize beyond the brevity itself."
    ),
    "story-025": (
        "The customer requested do-not-call status during an outbound dial. The agent honored "
        "the request immediately and confirmed the customer would receive no further outreach."
    ),
    "story-026": (
        "The customer asked for a Civic LX quote. The agent provided the MSRP of $24,500 and "
        "offered a test drive."
    ),
    "story-027": (
        "Inbound on a CR-V Touring with overlapping turns — the customer pushed past initial "
        "qualification to ask OTD price directly. The agent quoted $42,300 OTD and booked "
        "Saturday at noon."
    ),
    "story-028": (
        "After an initial figure earlier in the conversation, the agent reconciled to the live "
        "$46,500 OTD with the current spring incentive applied. Customer accepted the figure."
    ),
    "story-029": (
        "The customer opened the call complaining the previous trade-in had been undervalued "
        "by $3k against KBB. The agent acknowledged the issue, offered a re-evaluation with "
        "the used-car manager, and booked the follow-up call for Tuesday."
    ),
    # Cost / latency stress
    "story-030": (
        "A 15-turn journey across call, SMS, email, and chat over three weeks resolved into a "
        "single test-drive booking. Summary preserved core events: initial inquiry, trade "
        "evaluation, two follow-up touches, and the closing call."
    ),
    "story-031": (
        "One 12-minute call where the customer raised three concerns — an open recall, a "
        "do-not-call request for marketing outreach, and a pending trade evaluation. The "
        "agent handled each in turn: scheduled the recall repair, honored the DNC, and "
        "routed the trade ask to the used-car manager."
    ),
    "story-032": (
        "Maximum-size journey processed within token budget. All structured events preserved "
        "in 2–3 paragraphs. No token bloat from filler language."
    ),
}


# =============================================================================
# Case execution
# =============================================================================

def load_cases() -> list[dict]:
    with CASES_PATH.open() as f:
        return yaml.safe_load(f) or []


def find_journey_for_case(case: dict) -> dict | None:
    """Resolve the journey dict for a case. Try ALL_JOURNEYS registry first."""
    case_input = case.get("input", {})
    journey_id = case_input.get("journey_id")
    if journey_id:
        j = get_journey(journey_id)
        if j is not None:
            return j

    # Fallback: synthesize a minimal journey from the inline transcript_summary
    # so the harness can be exercised even if the fixture isn't registered.
    transcript_summary = case_input.get("transcript_summary")
    if transcript_summary:
        return {
            "journey_id": journey_id or f"synthetic-{case['id']}",
            "rooftop_id": case_input.get("rooftop_id", "rt_unknown"),
            "agent": case_input.get("agent", "sales_ib"),
            "intent": case_input.get("intent", "Synthetic journey"),
            "outcome": case_input.get("outcome", "appointment_booked"),
            "touch_count": case_input.get("touch_count", 2),
            "channels_used": case_input.get("channels_used", ["chat"]),
            "sentiment_start": "neutral",
            "sentiment_end": "neutral",
            "critical_flag": None,
            "pii": {},
            "turns": [
                {
                    "channel": "call",
                    "timestamp": "2026-05-09T00:00:00Z",
                    "speaker": "agent",
                    "text": transcript_summary,
                }
            ],
        }
    return None


def check_gates(output: str | None, case: dict) -> tuple[bool, list[str], dict]:
    """
    Check must_contain / must_not_contain / threshold gates.
    Returns (passed, fail_reasons, diagnostics).
    """
    reasons: list[str] = []
    must_contain = case.get("must_contain", []) or []
    must_not_contain = case.get("must_not_contain", []) or []

    if output is None:
        # Fallback case — pass only for cases that explicitly tolerate fallback
        # (e.g., story-024 hangup case where omission is acceptable per spec).
        # Otherwise this is an automatic fail.
        return False, ["fallback_omit"], {
            "must_contain_hits": [],
            "must_contain_misses": must_contain,
            "must_not_contain_hits": [],
        }

    text_lower = output.lower()

    contain_hits = [s for s in must_contain if s.lower() in text_lower]
    contain_misses = [s for s in must_contain if s.lower() not in text_lower]
    if contain_misses:
        reasons.append(f"must_contain missing: {contain_misses}")

    not_contain_hits = [s for s in must_not_contain if s.lower() in text_lower]
    if not_contain_hits:
        reasons.append(f"must_not_contain present (HARD FAIL): {not_contain_hits}")

    # Performance gates
    perf = case.get("performance", {}) or {}
    # Cost / latency are checked by the caller against the StoryResult.

    return (len(reasons) == 0), reasons, {
        "must_contain_hits": contain_hits,
        "must_contain_misses": contain_misses,
        "must_not_contain_hits": not_contain_hits,
    }


def run_case(case: dict, *, mock: bool) -> CaseResult:
    case_id = case["id"]
    bucket = case.get("bucket", "unknown")
    priority = (case.get("metadata") or {}).get("priority", "P2")

    journey = find_journey_for_case(case)
    if journey is None:
        return CaseResult(
            case_id=case_id, bucket=bucket, priority=priority,
            passed=False, fail_reasons=["no_journey_resolvable"],
            must_contain_hits=[], must_contain_misses=case.get("must_contain", []),
            must_not_contain_hits=[],
            output=None, fallback_reason=FallbackReason.NONE.value,
            cost_usd=0.0, latency_ms=0,
            notes="No fixture matched journey_id and no transcript_summary provided.",
        )

    mock_response = MOCK_RESPONSES.get(case_id) if mock else None
    if mock and mock_response is None:
        # Default mock for any unmapped case — exercise the gates with neutral output.
        mock_response = "The agent handled the inquiry and booked an appointment."

    dealer_id = journey.get("rooftop_id", "rt_unknown")
    result = generate_story(journey, dealer_id, mock_response=mock_response)

    passed_gates, fail_reasons, diagnostics = check_gates(result.summary, case)

    # Cost ceiling check (informational — harness should already have caught this)
    cost_ceiling = (case.get("performance") or {}).get("cost_per_call_ceiling_usd", 0.02)
    if result.cost_usd > cost_ceiling:
        passed_gates = False
        fail_reasons.append(f"cost_over_ceiling: {result.cost_usd:.6f} > {cost_ceiling}")

    return CaseResult(
        case_id=case_id, bucket=bucket, priority=priority,
        passed=passed_gates, fail_reasons=fail_reasons,
        must_contain_hits=diagnostics["must_contain_hits"],
        must_contain_misses=diagnostics["must_contain_misses"],
        must_not_contain_hits=diagnostics["must_not_contain_hits"],
        output=result.summary,
        fallback_reason=result.fallback_reason.value,
        cost_usd=result.cost_usd,
        latency_ms=result.latency_ms,
        notes=(case.get("description") or "")[:80],
    )


# =============================================================================
# Reporting
# =============================================================================

def render_report(results: list[CaseResult]) -> str:
    total = len(results)
    passed = sum(1 for r in results if r.passed)
    pass_rate = (passed / total) if total else 0.0

    by_bucket: dict[str, list[CaseResult]] = defaultdict(list)
    for r in results:
        by_bucket[r.bucket].append(r)

    lines = []
    lines.append("=" * 72)
    lines.append("STORY-OF-THE-WEEK EVAL REPORT")
    lines.append("=" * 72)
    lines.append(f"Total cases:     {total}")
    lines.append(f"Passed:          {passed}")
    lines.append(f"Failed:          {total - passed}")
    lines.append(f"Overall rate:    {pass_rate:.1%}")
    lines.append("")
    lines.append("Per-bucket:")
    for bucket, rs in sorted(by_bucket.items()):
        bp = sum(1 for r in rs if r.passed)
        lines.append(f"  {bucket:<22} {bp}/{len(rs)}  ({(bp/len(rs)):.0%})")

    cost = get_cost_summary()
    lines.append("")
    lines.append("Cost summary:")
    lines.append(f"  Total requests:           {cost['total_requests']}")
    lines.append(f"  Total cost (USD):         ${cost['total_cost_usd']:.6f}")
    lines.append(f"  Avg cost/request (USD):   ${cost['avg_cost_per_request_usd']:.6f}")
    lines.append(f"  Rolling 24h avg:          ${cost['rolling_24h_avg_cost_usd']:.6f}")
    lines.append(f"  Ceiling violations:       {cost['ceiling_violations']}")
    lines.append("")
    lines.append("Per-case detail:")
    lines.append("-" * 72)
    for r in results:
        status = "PASS" if r.passed else "FAIL"
        lines.append(f"[{status}] {r.case_id:<14} {r.bucket:<18} {r.priority:<3}  ${r.cost_usd:.6f}  {r.latency_ms}ms")
        if not r.passed:
            for reason in r.fail_reasons:
                lines.append(f"        ↳ {reason}")
            if r.must_not_contain_hits:
                lines.append(f"        ↳ leaked phrases: {r.must_not_contain_hits}")

    return "\n".join(lines)


def render_json(results: list[CaseResult]) -> str:
    payload = {
        "summary": {
            "total": len(results),
            "passed": sum(1 for r in results if r.passed),
            "failed": sum(1 for r in results if not r.passed),
            "pass_rate": round(sum(1 for r in results if r.passed) / max(1, len(results)), 4),
        },
        "per_bucket": {},
        "cost": get_cost_summary(),
        "cases": [asdict(r) for r in results],
    }
    by_bucket: dict[str, list[CaseResult]] = defaultdict(list)
    for r in results:
        by_bucket[r.bucket].append(r)
    for bucket, rs in by_bucket.items():
        payload["per_bucket"][bucket] = {
            "total": len(rs),
            "passed": sum(1 for r in rs if r.passed),
            "pass_rate": round(sum(1 for r in rs if r.passed) / len(rs), 4),
        }
    return json.dumps(payload, indent=2)


# =============================================================================
# CLI
# =============================================================================

def main() -> int:
    p = argparse.ArgumentParser(description="Run Story-of-the-Week evals.")
    p.add_argument("--mock", action="store_true",
                   help="Run with canned mock responses — no API key required.")
    p.add_argument("--case", type=str, default=None,
                   help="Run only a single case by ID (e.g. --case story-001).")
    p.add_argument("--json", action="store_true",
                   help="Emit JSON to stdout (for CI). Otherwise, prints a human report.")
    p.add_argument("--bucket", type=str, default=None,
                   help="Filter to a single bucket (happy_path/customer_failure/adversarial/cost_latency).")
    args = p.parse_args()

    if not args.mock and not os.environ.get("ANTHROPIC_API_KEY"):
        print("Error: live mode requires ANTHROPIC_API_KEY env var. Use --mock to bypass.", file=sys.stderr)
        return 2

    cases = load_cases()
    if args.case:
        cases = [c for c in cases if c.get("id") == args.case]
        if not cases:
            print(f"Error: no case with id={args.case}", file=sys.stderr)
            return 2
    if args.bucket:
        cases = [c for c in cases if c.get("bucket") == args.bucket]

    reset_cost_tracker()
    results = [run_case(c, mock=args.mock) for c in cases]

    if args.json:
        print(render_json(results))
    else:
        print(render_report(results))

    # Exit non-zero if any case failed
    return 0 if all(r.passed for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())

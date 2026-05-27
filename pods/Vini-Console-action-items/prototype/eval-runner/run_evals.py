#!/usr/bin/env python3
"""
Intent-extraction eval runner.

Reads eval cases from `evals/intent-extraction/cases.yaml`, runs each through
the AI harness, grades against expectations, and reports pass rate per case
and per bucket.

Usage:
  # Mock mode (no API key needed — exercises the pipeline with canned outputs):
  python run_evals.py --mock

  # Live mode (requires ANTHROPIC_API_KEY):
  python run_evals.py

  # Single case:
  python run_evals.py --case hp-001 --mock

  # JSON output for CI:
  python run_evals.py --mock --json > eval-report.json

Mirrors the ROI Emailer pod's eval-runner layout.
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any

# Bootstrap the prototype's sibling-dir layout
_HERE = Path(__file__).resolve().parent
_PROTOTYPE = _HERE.parent
_HARNESS_DIR = _PROTOTYPE / "ai-harness"
sys.path.insert(0, str(_HARNESS_DIR))

import yaml  # type: ignore  # noqa: E402

from intent_extractor import (  # noqa: E402
    Conversation,
    Turn,
    PendingItem,
    extract_action_items,
)
from cost_tracker import CostTracker  # noqa: E402


CASES_PATH = _PROTOTYPE / "evals" / "intent-extraction" / "cases.yaml"


# =========================================================================
# Result shapes
# =========================================================================

@dataclass
class DimensionResult:
    score: int                # 0..4
    passed: bool              # score >= 3
    notes: list[str] = field(default_factory=list)


@dataclass
class CaseResult:
    id: str
    bucket: str
    name: str
    overall_pass: bool
    dimensions: dict[str, DimensionResult]
    error: str | None = None
    used_ai: bool = True
    fallback_reason: str | None = None
    latency_ms: int = 0
    cost_usd: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "bucket": self.bucket,
            "name": self.name,
            "overall_pass": self.overall_pass,
            "dimensions": {k: asdict(v) for k, v in self.dimensions.items()},
            "error": self.error,
            "used_ai": self.used_ai,
            "fallback_reason": self.fallback_reason,
            "latency_ms": self.latency_ms,
            "cost_usd": self.cost_usd,
        }


# =========================================================================
# Grading
# =========================================================================

DIMENSIONS = [
    "intent_classification",
    "resolution_status",
    "recap_factual",
    "recap_anonymization",
    "recap_format",
    "dedup_correctness",
]


def _grade_case(case: dict[str, Any], mock: bool) -> CaseResult:
    cid = case["id"]
    bucket = case["bucket"]
    name = case["name"]

    # Build inputs
    conv_data = case["conversation"]
    turns = [Turn(**t) for t in conv_data["turns"]]
    conv = Conversation(
        conversation_id=conv_data["conversation_id"],
        customer_id=conv_data["customer_id"],
        customer_name=conv_data.get("customer_name", "the customer"),
        channel=conv_data["channel"],
        rooftop_id=conv_data["rooftop_id"],
        turns=turns,
    )
    existing = [PendingItem(**p) for p in case.get("existing_pending", [])]

    # Run extractor
    try:
        result = extract_action_items(
            conv,
            existing_pending=existing,
            mock=mock,
            cost_tracker=CostTracker(),
        )
    except Exception as e:
        # Pipeline crashed entirely — auto-fail every dim
        return CaseResult(
            id=cid,
            bucket=bucket,
            name=name,
            overall_pass=False,
            dimensions={d: DimensionResult(0, False, [f"pipeline error: {e}"]) for d in DIMENSIONS},
            error=str(e),
        )

    expected = case.get("expected", {}) or {}
    dims: dict[str, DimensionResult] = {}

    # ---- Dim 1: intent classification --------------------------------
    dims["intent_classification"] = _grade_intents(result, expected)

    # ---- Dim 2: resolution status (proxied via created vs deduplicated counts) ---
    dims["resolution_status"] = _grade_resolution(result, expected)

    # ---- Dim 3: recap factual (manual review only — auto-grade as 3 if non-empty + plausible) ---
    dims["recap_factual"] = _grade_factual(result, expected)

    # ---- Dim 4: recap anonymization (regex check)
    dims["recap_anonymization"] = _grade_anonymization(result, expected)

    # ---- Dim 5: recap format (length + sentence count)
    dims["recap_format"] = _grade_format(result)

    # ---- Dim 6: dedup correctness
    dims["dedup_correctness"] = _grade_dedup(result, expected)

    # Blocking failures: dim 1 or dim 4 score < 3
    blocking = (
        dims["intent_classification"].score < 3
        or dims["recap_anonymization"].score < 3
    )
    overall_pass = all(d.passed for d in dims.values()) and not blocking

    return CaseResult(
        id=cid,
        bucket=bucket,
        name=name,
        overall_pass=overall_pass,
        dimensions=dims,
        used_ai=result.used_ai,
        fallback_reason=result.fallback_reason,
        latency_ms=result.latency_ms,
        cost_usd=result.cost_usd,
    )


def _grade_intents(result, expected) -> DimensionResult:
    detected_ids = [d.intent_id for d in result.detected_intents]
    detected_set = set(detected_ids)
    notes: list[str] = []

    score = 4

    # Strict equality
    if "intent_ids" in expected:
        expected_ids = set(expected["intent_ids"])
        missing = expected_ids - detected_set
        extra = detected_set - expected_ids
        if missing:
            score -= 2
            notes.append(f"missing intents: {sorted(missing)}")
        if extra:
            # Extras are softer — primary still right matters more
            score -= 1
            notes.append(f"extra intents: {sorted(extra)}")

    # Subset (multi-intent emails — at least these must appear)
    if "intent_ids_subset" in expected:
        expected_subset = set(expected["intent_ids_subset"])
        missing = expected_subset - detected_set
        if missing:
            score -= 2
            notes.append(f"missing subset intents: {sorted(missing)}")

    # Any-of — at least ONE of these intents must be present (ambiguous cases)
    if "intent_ids_any" in expected:
        expected_any = set(expected["intent_ids_any"])
        if not (expected_any & detected_set):
            score -= 2
            notes.append(
                f"none of acceptable intents present: expected any of {sorted(expected_any)}, got {sorted(detected_set)}"
            )

    # Primary check
    if "primary_intent_id" in expected:
        if result.primary_intent_id != expected["primary_intent_id"]:
            score -= 1
            notes.append(
                f"primary mismatch: got {result.primary_intent_id}, expected {expected['primary_intent_id']}"
            )

    # Forbidden-intent (prompt-injection cases)
    if "intent_id_must_not_contain" in expected:
        forbidden = expected["intent_id_must_not_contain"]
        if forbidden in detected_set:
            score -= 3
            notes.append(f"forbidden intent emitted: {forbidden}")

    score = max(0, score)
    return DimensionResult(score=score, passed=score >= 3, notes=notes)


def _grade_resolution(result, expected) -> DimensionResult:
    created = sum(1 for e in result.events if e.type == "action_item.created")
    notes: list[str] = []
    score = 4

    if "created_events" in expected:
        want = expected["created_events"]
        if created != want:
            score -= 2
            notes.append(f"created_events: got {created}, expected {want}")
    if "created_events_min" in expected:
        want = expected["created_events_min"]
        if created < want:
            score -= 2
            notes.append(f"created_events_min: got {created}, expected ≥ {want}")
    if "created_events_max" in expected:
        want = expected["created_events_max"]
        if created > want:
            score -= 1
            notes.append(f"created_events_max: got {created}, expected ≤ {want}")

    score = max(0, score)
    return DimensionResult(score=score, passed=score >= 3, notes=notes)


def _grade_factual(result, expected) -> DimensionResult:
    """
    Auto-grading factual accuracy is limited; in CI we score 4 for any non-empty
    recap that ALSO mentions key tokens from the case's expected list, and flag
    for manual review otherwise.
    """
    notes: list[str] = []
    for di in result.detected_intents:
        if di.resolution_status == "unresolved" and not di.recap:
            return DimensionResult(score=0, passed=False, notes=["empty recap on unresolved intent"])

    # `recap_must_contain` validation
    must_contain = expected.get("recap_must_contain", [])
    if must_contain:
        text = " ".join(d.recap.lower() for d in result.detected_intents)
        for word in must_contain:
            if word.lower() not in text:
                return DimensionResult(
                    score=2,
                    passed=False,
                    notes=[f"recap missing required token: {word}"],
                )

    notes.append("auto-passed; sample for human review (factual accuracy)")
    return DimensionResult(score=3, passed=True, notes=notes)


def _grade_anonymization(result, expected) -> DimensionResult:
    notes: list[str] = []
    must_not_contain = expected.get("recap_must_not_contain", [])

    for di in result.detected_intents:
        recap_lower = di.recap.lower()
        for forbidden in must_not_contain:
            if forbidden.lower() in recap_lower:
                return DimensionResult(
                    score=0,
                    passed=False,
                    notes=[f"PII leaked: '{forbidden}' in recap"],
                )

    # General PII regex check
    import re
    PHONE_RE = re.compile(r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
    EMAIL_RE = re.compile(r"\b[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}\b")
    VIN_RE = re.compile(r"\b[A-HJ-NPR-Z0-9]{17}\b")
    for di in result.detected_intents:
        if PHONE_RE.search(di.recap) or EMAIL_RE.search(di.recap) or VIN_RE.search(di.recap):
            return DimensionResult(
                score=0,
                passed=False,
                notes=["generic PII regex matched in recap"],
            )

    notes.append("clean — no PII detected in any recap")
    return DimensionResult(score=4, passed=True, notes=notes)


def _grade_format(result) -> DimensionResult:
    notes: list[str] = []
    score = 4

    for di in result.detected_intents:
        if not di.recap:
            continue
        if len(di.recap) > 150:
            score -= 2
            notes.append(f"recap > 150 chars: {len(di.recap)} for {di.intent_id}")
        # rough single-sentence check: ≤ 2 sentence-ending punctuation chars
        sentence_endings = sum(di.recap.count(p) for p in ".!?")
        if sentence_endings > 2:
            score -= 1
            notes.append(f"multi-sentence recap for {di.intent_id}")

    score = max(0, score)
    return DimensionResult(score=score, passed=score >= 3, notes=notes)


def _grade_dedup(result, expected) -> DimensionResult:
    notes: list[str] = []
    score = 4
    dedup_count = sum(1 for e in result.events if e.type == "action_item.deduplicated")

    if "deduplicated_events" in expected:
        want = expected["deduplicated_events"]
        if dedup_count != want:
            score -= 2
            notes.append(f"deduplicated_events: got {dedup_count}, expected {want}")
    if "deduplicated_events_min" in expected:
        want = expected["deduplicated_events_min"]
        if dedup_count < want:
            score -= 2
            notes.append(f"deduplicated_events_min: got {dedup_count}, expected ≥ {want}")
    if "deduplicated_intent_id" in expected:
        want = expected["deduplicated_intent_id"]
        ids_dedup = [e.payload.get("intent_id") for e in result.events if e.type == "action_item.deduplicated"]
        if want not in ids_dedup:
            score -= 2
            notes.append(f"expected dedup intent {want} not seen; got {ids_dedup}")

    score = max(0, score)
    return DimensionResult(score=score, passed=score >= 3, notes=notes)


# =========================================================================
# Reporting
# =========================================================================

def _print_report(results: list[CaseResult], as_json: bool):
    if as_json:
        out = {
            "total": len(results),
            "passed": sum(1 for r in results if r.overall_pass),
            "by_bucket": _bucket_summary(results),
            "by_dimension": _dimension_summary(results),
            "cases": [r.to_dict() for r in results],
        }
        print(json.dumps(out, indent=2))
        return

    total = len(results)
    passed = sum(1 for r in results if r.overall_pass)
    failed = total - passed
    pct = (100.0 * passed / total) if total else 0.0

    print("\n" + "=" * 72)
    print("INTENT EXTRACTION EVAL — REPORT")
    print("=" * 72)
    print(f"Total cases    : {total}")
    print(f"Passed         : {passed} ({pct:.1f}%)")
    print(f"Failed         : {failed}")
    print()

    # Per-bucket
    print("-- Pass rate by bucket --")
    for bucket, stats in sorted(_bucket_summary(results).items()):
        bp = stats["passed"]
        bt = stats["total"]
        bpct = (100.0 * bp / bt) if bt else 0.0
        bar = "█" * int(bpct / 5)
        print(f"  {bucket:<14} {bp:>2}/{bt:<2}  {bpct:5.1f}%  {bar}")
    print()

    # Per-dimension
    print("-- Pass rate by rubric dimension --")
    for dim, stats in _dimension_summary(results).items():
        dp = stats["passed"]
        dt = stats["total"]
        dpct = (100.0 * dp / dt) if dt else 0.0
        flag = "✓" if dpct >= 90 else "⚠" if dpct >= 75 else "✗"
        print(f"  {flag} {dim:<24} {dp:>2}/{dt:<2}  {dpct:5.1f}%")
    print()

    # Per-case details
    print("-- Case results --")
    for r in results:
        symbol = "✓" if r.overall_pass else "✗"
        line = f"  {symbol} [{r.bucket:<12}] {r.id:<10} {r.name}"
        suffix = []
        if r.fallback_reason:
            suffix.append(f"fallback={r.fallback_reason}")
        if suffix:
            line += f"   ({', '.join(suffix)})"
        print(line)
        if not r.overall_pass:
            for dim_name, dim_result in r.dimensions.items():
                if not dim_result.passed:
                    for note in dim_result.notes:
                        print(f"      ↳ {dim_name}: {note}")
    print()
    print("=" * 72)
    print(f"Ship bar: ≥ 90% pass rate on EVERY dimension. Current: see table above.")
    print("=" * 72)


def _bucket_summary(results: list[CaseResult]) -> dict[str, dict[str, int]]:
    out: dict[str, dict[str, int]] = defaultdict(lambda: {"total": 0, "passed": 0})
    for r in results:
        out[r.bucket]["total"] += 1
        if r.overall_pass:
            out[r.bucket]["passed"] += 1
    return dict(out)


def _dimension_summary(results: list[CaseResult]) -> dict[str, dict[str, int]]:
    out: dict[str, dict[str, int]] = {d: {"total": 0, "passed": 0} for d in DIMENSIONS}
    for r in results:
        for dim, dim_result in r.dimensions.items():
            out[dim]["total"] += 1
            if dim_result.passed:
                out[dim]["passed"] += 1
    return out


# =========================================================================
# CLI
# =========================================================================

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mock", action="store_true", help="Use mock harness (no API key)")
    parser.add_argument("--case", help="Run a single case by id")
    parser.add_argument("--bucket", help="Run cases from a single bucket")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON")
    args = parser.parse_args()

    if not CASES_PATH.exists():
        print(f"ERROR: cases file not found at {CASES_PATH}", file=sys.stderr)
        sys.exit(1)

    with CASES_PATH.open() as f:
        data = yaml.safe_load(f)

    cases = data["cases"]

    if args.case:
        cases = [c for c in cases if c["id"] == args.case]
    if args.bucket:
        cases = [c for c in cases if c["bucket"] == args.bucket]

    if not cases:
        print("No cases selected.", file=sys.stderr)
        sys.exit(1)

    results = [_grade_case(c, mock=args.mock) for c in cases]
    _print_report(results, as_json=args.json)

    # Exit non-zero if any blocking failure
    blocking = [
        r for r in results
        if (r.dimensions["intent_classification"].score < 3)
        or (r.dimensions["recap_anonymization"].score < 3)
    ]
    sys.exit(1 if blocking else 0)


if __name__ == "__main__":
    main()

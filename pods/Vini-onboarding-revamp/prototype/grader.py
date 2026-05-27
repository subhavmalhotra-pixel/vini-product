"""
Grader for the Phase-1 eval set.

Reads:
  - the actual `DealershipProfile` JSON produced by `scrape_dealership.py`
    (or the offline runner)
  - the `pass_criteria` block from `evals/cases.json`

Returns a structured grade per case + an aggregate pass rate.

Per PRD §7 Kill criteria:
  - field accuracy >= 80% across the 50-case eval
  - zero hallucinated values
  - robots-blocked sites surface `extraction_path: blocked`
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any, List, Optional


# --------------------------------------------------------------------------- #
# Helpers                                                                     #
# --------------------------------------------------------------------------- #


def _get_path(obj: Any, dotted: str) -> Any:
    """Traverse nested dicts; supports 'rooftop_address.line1' notation."""
    parts = dotted.split(".")
    cur = obj
    for p in parts:
        if isinstance(cur, dict):
            cur = cur.get(p)
        else:
            return None
        if cur is None:
            return None
    # If we landed on a Tracked-style dict, return its value
    if isinstance(cur, dict) and "value" in cur and "confidence" in cur:
        return cur.get("value")
    return cur


def _tracked_confidence(obj: Any, dotted: str) -> Optional[str]:
    parts = dotted.split(".")
    cur = obj
    for p in parts:
        if isinstance(cur, dict):
            cur = cur.get(p)
        else:
            return None
        if cur is None:
            return None
    if isinstance(cur, dict) and "confidence" in cur:
        return cur.get("confidence")
    return None


def _flatten_profile(profile: dict) -> dict:
    """
    Return a flat {field_path: value, field_path__conf: confidence} dict for the
    fields the grader cares about. Skips departments and metadata.
    """
    out: dict = {}

    def take(dotted: str, target_key: str | None = None):
        key = target_key or dotted
        val = _get_path(profile, dotted)
        conf = _tracked_confidence(profile, dotted)
        if val is not None and str(val).strip():
            out[key] = val
            out[key + "__conf"] = conf

    for f in [
        "rooftop_name",
        "website",
        "admin_name",
        "admin_email",
        "admin_phone",
        "dealer_type",
        "dealer_sub_type",
        "region",
        "rooftop_timezone",
    ]:
        take(f)

    for sub in ["line1", "line2", "district", "state_or_province", "country", "zipcode"]:
        take(f"rooftop_address.{sub}", target_key=f"address.{sub}")

    # Top-level metadata
    if "extraction_path" in profile:
        out["__extraction_path"] = profile["extraction_path"]
    if "robots_txt_allowed" in profile:
        out["__robots_allowed"] = profile["robots_txt_allowed"]

    return out


# --------------------------------------------------------------------------- #
# Grade types                                                                 #
# --------------------------------------------------------------------------- #


@dataclass
class CaseGrade:
    case_id: str
    label: str
    tier: str
    passed: bool
    score: float
    checks: List[dict] = field(default_factory=list)
    summary: str = ""

    def to_dict(self) -> dict:
        return {
            "case_id": self.case_id,
            "label": self.label,
            "tier": self.tier,
            "passed": self.passed,
            "score": round(self.score, 3),
            "checks": self.checks,
            "summary": self.summary,
        }


# --------------------------------------------------------------------------- #
# Grader                                                                      #
# --------------------------------------------------------------------------- #


def grade_case(case: dict, actual: dict) -> CaseGrade:
    """
    Grade one case against the produced profile JSON.
    Implements the pass_criteria block in evals/cases.json.
    """
    crit = case.get("pass_criteria", {})
    expected = case.get("expected", {})
    flat = _flatten_profile(actual)
    checks: List[dict] = []

    # Check 1 — extraction path is in the allowed set (if specified)
    allowed_paths = crit.get("extraction_path_in")
    if allowed_paths is not None:
        ok = flat.get("__extraction_path") in allowed_paths
        checks.append(
            {
                "name": "extraction_path_in",
                "expected": allowed_paths,
                "got": flat.get("__extraction_path"),
                "ok": ok,
            }
        )

    # Check 2 — robots_txt_allowed (if specified)
    if "robots_txt_allowed" in crit:
        ok = flat.get("__robots_allowed") is crit["robots_txt_allowed"]
        checks.append(
            {
                "name": "robots_txt_allowed",
                "expected": crit["robots_txt_allowed"],
                "got": flat.get("__robots_allowed"),
                "ok": ok,
            }
        )

    # Check 3 — must-have fields present
    must_have = crit.get("must_have_fields_present", [])
    for f in must_have:
        ok = f in flat and str(flat[f]).strip() != ""
        checks.append(
            {
                "name": f"must_have_present:{f}",
                "expected": "non-empty",
                "got": flat.get(f),
                "ok": ok,
            }
        )

    # Check 4 — min high-confidence fields
    if "min_high_confidence_fields" in crit:
        hi = sum(1 for k, v in flat.items() if k.endswith("__conf") and v == "high")
        ok = hi >= crit["min_high_confidence_fields"]
        checks.append(
            {
                "name": "min_high_confidence_fields",
                "expected": crit["min_high_confidence_fields"],
                "got": hi,
                "ok": ok,
            }
        )

    # Check 5 — min filled fields (any confidence)
    if "min_filled_fields" in crit:
        filled = sum(1 for k, v in flat.items() if not k.endswith("__conf") and not k.startswith("__") and v)
        ok = filled >= crit["min_filled_fields"]
        checks.append(
            {
                "name": "min_filled_fields",
                "expected": crit["min_filled_fields"],
                "got": filled,
                "ok": ok,
            }
        )

    # Check 6 — no hallucinated fields. We approximate hallucination as:
    #   any field present in `actual` that is also present in `expected` but with a
    #   different value (case-insensitive, ignoring punctuation).
    hallucinated = []
    for k, exp_val in _walk_expected(expected):
        got = flat.get(k)
        if got and not _values_match(got, exp_val):
            hallucinated.append({"field": k, "expected": exp_val, "got": got})
    max_hall = crit.get("max_hallucinated_fields", 0)
    ok = len(hallucinated) <= max_hall
    checks.append(
        {
            "name": "max_hallucinated_fields",
            "expected": max_hall,
            "got": len(hallucinated),
            "ok": ok,
            "detail": hallucinated,
        }
    )

    # Check 7 — fields the Needs-Input bucket should surface
    nip = crit.get("needs_input_should_contain", [])
    for f in nip:
        # A field "should be in Needs Input" iff its value is empty/None in actual
        ok = not (f in flat and str(flat[f]).strip())
        checks.append(
            {
                "name": f"needs_input_contains:{f}",
                "expected": "empty",
                "got": flat.get(f),
                "ok": ok,
            }
        )

    passed_checks = sum(1 for c in checks if c["ok"])
    total = max(len(checks), 1)
    score = passed_checks / total
    passed = all(c["ok"] for c in checks)
    summary = f"{passed_checks}/{total} checks passed"

    return CaseGrade(
        case_id=case["id"],
        label=case.get("label", ""),
        tier=case.get("tier", ""),
        passed=passed,
        score=score,
        checks=checks,
        summary=summary,
    )


def _walk_expected(expected: dict, prefix: str = ""):
    for k, v in (expected or {}).items():
        path = f"{prefix}{k}" if not prefix else f"{prefix}.{k}"
        if isinstance(v, dict):
            yield from _walk_expected(v, path + ".")
        else:
            yield path.rstrip("."), v


def _values_match(a: Any, b: Any) -> bool:
    if a is None or b is None:
        return a == b
    return _norm(a) == _norm(b)


def _norm(x: Any) -> str:
    import re

    s = str(x).strip().lower()
    s = re.sub(r"\s+", " ", s)
    return s


# --------------------------------------------------------------------------- #
# Aggregate                                                                   #
# --------------------------------------------------------------------------- #


def aggregate(grades: List[CaseGrade]) -> dict:
    if not grades:
        return {"total": 0, "passed": 0, "pass_rate": 0.0, "by_tier": {}}
    by_tier: dict = {}
    for g in grades:
        by_tier.setdefault(g.tier, {"total": 0, "passed": 0})
        by_tier[g.tier]["total"] += 1
        if g.passed:
            by_tier[g.tier]["passed"] += 1
    total = len(grades)
    passed = sum(1 for g in grades if g.passed)
    return {
        "total": total,
        "passed": passed,
        "pass_rate": round(passed / total, 3),
        "by_tier": {k: {**v, "pass_rate": round(v["passed"] / v["total"], 3)} for k, v in by_tier.items()},
    }

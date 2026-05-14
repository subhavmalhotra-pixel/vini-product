import re
from datetime import datetime, timedelta
from typing import Optional

# Criterion 2: phrases that assert Vini caused/generated/drove a sale
_GROSS_PATTERNS = [
    r"vini\s+(caused|generated|drove|produced|created|led\s+to)",
    r"(caused|drove|generated|produced|created)\s+(a\s+|the\s+)?(sale|close|deal|gross|revenue)",
    r"(resulted\s+in|led\s+to)\s+(a\s+|the\s+)?(sale|close|deal)",
    r"(responsible\s+for|credited\s+(with|for)|attributed\s+to)\s+.{0,40}(sale|close|deal)",
]


def _collect_numbers(obj) -> set:
    nums = set()
    if isinstance(obj, (int, float)):
        nums.add(float(obj))
    elif isinstance(obj, dict):
        for v in obj.values():
            nums |= _collect_numbers(v)
    elif isinstance(obj, list):
        for item in obj:
            nums |= _collect_numbers(item)
    return nums


def _whitelist(tool_results: dict) -> set:
    raw = _collect_numbers(tool_results)
    derived = set()
    raw_list = list(raw)
    for n in raw_list:
        for d in raw_list:
            if d > 0:
                pct = n / d * 100
                derived.add(round(pct, 1))
                derived.add(float(round(pct)))
    return raw | derived


def check_no_hallucinated_numbers(output: str, tool_results: dict) -> tuple[bool, list]:
    if not tool_results:
        return True, []
    wl = _whitelist(tool_results)
    # Extract integers and decimals; skip numbers >999 (likely years/phone)
    found = re.findall(r'\b(\d+(?:\.\d+)?)\b', output)
    bad = []
    for s in found:
        n = float(s)
        if n > 999:
            continue
        # allow +-2 tolerance for percentages / rounding
        if not any(abs(n - w) <= 2.0 for w in wl):
            bad.append(n)
    return len(bad) == 0, bad


def check_no_incremental_gross(output: str) -> tuple[bool, list]:
    text = output.lower()
    hits = []
    for pat in _GROSS_PATTERNS:
        m = re.findall(pat, text)
        if m:
            hits.extend(m)
    return len(hits) == 0, hits


def check_dealer_name_and_date(output: str, dealer_name: str, week_start_date: str) -> tuple[bool, str]:
    text = output.lower()
    name_ok = dealer_name.lower() in text
    dt = datetime.strptime(week_start_date, "%Y-%m-%d")
    dt_end = dt + timedelta(days=6)
    date_fmts = [
        dt.strftime("%-m/%-d"), dt.strftime("%B %-d").lower(), dt.strftime("%b %-d").lower(),
        dt_end.strftime("%-m/%-d"), dt_end.strftime("%B %-d").lower(), dt_end.strftime("%b %-d").lower(),
        week_start_date,
    ]
    date_ok = any(f in text for f in date_fmts)
    detail = f"name={'yes' if name_ok else 'NO'}, date={'yes' if date_ok else 'no (soft)'}"
    # Require dealer name; date mention is soft (nice-to-have)
    return name_ok, detail


def check_after_hours(output: str, tool_results: dict) -> tuple[bool, str]:
    cs = tool_results.get("get_weekly_call_stats", {})
    count = cs.get("after_hours_count", 0)
    if count == 0:
        return True, "no after-hours calls (trivially passed)"
    text = output.lower()
    count_present = str(count) in output
    mentioned = "after" in text and "hour" in text
    passed = count_present and mentioned
    detail = f"count={count}, in_output={'yes' if count_present else 'NO'}, mentioned={'yes' if mentioned else 'NO'}"
    return passed, detail


def check_word_count(output: str) -> tuple[bool, int]:
    n = len(output.split())
    return n <= 150, n


def grade(
    output: Optional[str],
    tool_results: dict,
    dealer_name: str,
    week_start_date: str,
) -> dict:
    if output is None:
        stub = {"passed": False, "detail": "no output (fallback)"}
        return {
            "passed": False,
            "fallback": True,
            "criteria": {k: stub for k in [
                "no_hallucinated_numbers", "no_incremental_gross",
                "dealer_name_and_date", "after_hours_correct", "under_150_words",
            ]},
        }

    c1p, c1d = check_no_hallucinated_numbers(output, tool_results)
    c2p, c2d = check_no_incremental_gross(output)
    c3p, c3d = check_dealer_name_and_date(output, dealer_name, week_start_date)
    c4p, c4d = check_after_hours(output, tool_results)
    c5p, c5d = check_word_count(output)

    return {
        "passed": c1p and c2p and c3p and c4p and c5p,
        "fallback": False,
        "criteria": {
            "no_hallucinated_numbers": {"passed": c1p, "detail": f"bad={c1d}" if not c1p else "ok"},
            "no_incremental_gross":    {"passed": c2p, "detail": f"hits={c2d}" if not c2p else "ok"},
            "dealer_name_and_date":    {"passed": c3p, "detail": c3d},
            "after_hours_correct":     {"passed": c4p, "detail": c4d},
            "under_150_words":         {"passed": c5p, "detail": f"{c5d} words"},
        },
    }

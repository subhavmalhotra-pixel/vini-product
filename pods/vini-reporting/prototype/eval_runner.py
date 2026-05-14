#!/usr/bin/env python3
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from harness import build_insight_card
from grader import grade
from tools import MOCK_DATA

CASES = json.loads(
    (Path(__file__).parent.parent / "evals" / "cases.json").read_text()
)

CRITERIA_SHORT = ["C1", "C2", "C3", "C4", "C5"]
CRITERIA_NAMES = [
    "no_hallucinated_numbers",
    "no_incremental_gross",
    "dealer_name_and_date",
    "after_hours_correct",
    "under_150_words",
]


def run_evals(verbose: bool = False) -> dict:
    print(f"\nRunning {len(CASES)} eval cases against {build_insight_card.__module__}\n")
    header = f"{'ID':<8} {'Type':<14} " + " ".join(f"{s:>4}" for s in CRITERIA_SHORT) + f"  {'RESULT':>6}"
    print(header)
    print("-" * len(header))

    results = []
    type_stats: dict = {}

    for case in CASES:
        cid = case["id"]
        dealer_id = case["dealer_id"]
        week = case["week_start_date"]
        ctype = case["type"]

        key = f"{dealer_id}:{week}"
        if key not in MOCK_DATA:
            print(f"{cid:<8} ERROR: no mock data for {key}")
            continue

        dealer_name = MOCK_DATA[key]["dealer_name"]
        run = build_insight_card(dealer_id, week)
        grading = grade(run["output"], run["tool_results"], dealer_name, week)

        c_flags = [
            "P" if grading["criteria"][n]["passed"] else "F" for n in CRITERIA_NAMES
        ]
        result_label = "PASS" if grading["passed"] else "FAIL"
        row = (
            f"{cid:<8} {ctype:<14} "
            + " ".join(f"{f:>4}" for f in c_flags)
            + f"  {result_label:>6}"
        )
        print(row)

        if verbose:
            if run["fallback"]:
                print(f"  [fallback] {run['fallback_reason']}")
            elif not grading["passed"]:
                for n in CRITERIA_NAMES:
                    cd = grading["criteria"][n]
                    if not cd["passed"]:
                        print(f"  [{n}] {cd['detail']}")
                if run["output"]:
                    preview = run["output"][:200].replace("\n", " ")
                    print(f"  OUTPUT: {preview}...")
            print(f"  latency={run['latency_ms']}ms  in={run['input_tokens']}  out={run['output_tokens']}")

        results.append({"case": case, "run": run, "grading": grading})

        type_stats.setdefault(ctype, {"total": 0, "passed": 0})
        type_stats[ctype]["total"] += 1
        if grading["passed"]:
            type_stats[ctype]["passed"] += 1

    total = len(results)
    passed = sum(1 for r in results if r["grading"]["passed"])
    rate = passed / total * 100 if total else 0.0

    print("\n" + "=" * len(header))
    print(f"OVERALL: {passed}/{total} passed  ({rate:.1f}%)")
    print()
    print(f"{'Type':<20} {'Pass':>5} {'Total':>6} {'Rate':>7}")
    print("-" * 40)
    for t, s in sorted(type_stats.items()):
        r = s["passed"] / s["total"] * 100
        print(f"{t:<20} {s['passed']:>5} {s['total']:>6} {r:>6.1f}%")

    print()
    print("Criteria key: C1=no_hallucinated_numbers  C2=no_incremental_gross")
    print("              C3=dealer_name_and_date      C4=after_hours_correct  C5=under_150_words")

    return {"total": total, "passed": passed, "pass_rate": rate, "by_type": type_stats}


if __name__ == "__main__":
    verbose = "-v" in sys.argv or "--verbose" in sys.argv
    summary = run_evals(verbose=verbose)
    sys.exit(0 if summary["pass_rate"] >= 80.0 else 1)

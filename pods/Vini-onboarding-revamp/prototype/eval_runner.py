#!/usr/bin/env python3
"""
Offline eval runner — runs the Phase-1 Rooftop+CNAM extraction pipeline against
the cases in `evals/cases.json` using HTML fixtures in `test-data/fixtures/`.

Why offline-by-default:
  - The PRD prototype scope (§6) ships with no production write and the user
    explicitly asked us not to scrape live during development.
  - Fixture-based runs are deterministic and CI-runnable.

Usage:
    python eval_runner.py                              # all cases, JSON to stdout
    python eval_runner.py --out report.json
    python eval_runner.py --case park_avenue_honda      # one case
    python eval_runner.py --no-llm                      # skip Claude fallback
    python eval_runner.py --json                        # raw JSON (else: pretty)

Exit code:
    0 — aggregate pass rate >= 0.8
    1 — aggregate pass rate <  0.8
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Optional

import click

from grader import CaseGrade, aggregate, grade_case
from merger import merge
from schemas import DealershipProfile


REPO_ROOT = Path(__file__).resolve().parent.parent
EVALS_PATH = REPO_ROOT / "evals" / "cases.json"
FIXTURES_DIR = REPO_ROOT / "test-data" / "fixtures"


# --------------------------------------------------------------------------- #
# Offline pipeline                                                            #
# --------------------------------------------------------------------------- #


def _load_fixture_html(case: dict) -> dict[str, str]:
    """Read fixture HTML files for the case into a {url: html} dict."""
    fix_id = case["input"].get("fixture_dir")
    if not fix_id:
        return {}
    base = FIXTURES_DIR / fix_id
    pages = case["input"].get("pages", {})
    out: dict[str, str] = {}
    for url, filename in pages.items():
        path = base / filename
        if path.exists():
            out[url] = path.read_text(encoding="utf-8")
    return out


def _run_case(case: dict, use_llm: bool) -> DealershipProfile:
    """Run the parser pipeline against one offline case."""
    base_url = case["input"]["base_url"]
    robots_allowed = case["input"].get("robots_allowed", True)

    if not robots_allowed:
        return DealershipProfile(
            source_url=base_url,
            robots_txt_allowed=False,
            extraction_path="blocked",
            notes=["robots.txt disallows fetching the root path for our UA (case fixture)"],
        )

    html_by_url = _load_fixture_html(case)
    if not html_by_url:
        return DealershipProfile(
            source_url=base_url,
            extraction_path="failed",
            notes=["no fixture HTML loaded"],
        )

    # Step 2 — Schema.org deterministic parse
    from schema_parser import parse as parse_schema

    schema_profile = parse_schema(html_by_url, base_url=base_url)

    # Step 3 — LLM fallback (only if requested AND yield is thin)
    needs_llm = use_llm and _schema_yield(schema_profile) < 5
    if needs_llm:
        from llm_extractor import extract_with_llm

        llm_profile = extract_with_llm(html_by_url, base_url=base_url)
    else:
        llm_profile = DealershipProfile(
            source_url=base_url,
            extraction_path="schema_org",
            notes=["LLM fallback skipped in eval run"],
        )

    merged = merge(schema_profile, llm_profile)
    merged.pages_visited = list(html_by_url.keys())
    return merged


def _schema_yield(profile: DealershipProfile) -> int:
    fields = [
        profile.rooftop_name.value,
        profile.admin_phone.value,
        profile.rooftop_address.line1.value,
        profile.rooftop_address.district.value,
        profile.rooftop_address.state_or_province.value,
        profile.rooftop_address.zipcode.value,
    ]
    return sum(1 for f in fields if f)


# --------------------------------------------------------------------------- #
# Report                                                                      #
# --------------------------------------------------------------------------- #


def _pretty_print(report: dict) -> None:
    agg = report["aggregate"]
    print()
    print("Eval Report")
    print("=" * 60)
    print(f"Aggregate: {agg['passed']}/{agg['total']} cases passed  "
          f"(pass rate {agg['pass_rate'] * 100:.1f}%)")
    print()
    print(f"{'Case':<32} {'Tier':<14} {'Score':>6}   Result")
    print("-" * 60)
    for c in report["cases"]:
        status = "✓ PASS" if c["passed"] else "✗ FAIL"
        score_pct = c["score"] * 100
        print(f"{c['case_id']:<32} {c['tier']:<14} {score_pct:5.0f}%   {status}")
    print()
    print("Per-tier pass rates:")
    for tier, stats in agg["by_tier"].items():
        print(f"  {tier:<14} {stats['passed']}/{stats['total']}  "
              f"({stats['pass_rate'] * 100:.0f}%)")
    print()

    # Surface failed checks for debugging
    failed = [c for c in report["cases"] if not c["passed"]]
    if failed:
        print("Failed cases — first failing check per case:")
        for c in failed:
            bad = next((chk for chk in c["checks"] if not chk["ok"]), None)
            if bad:
                print(f"  {c['case_id']}: {bad['name']}  expected={bad['expected']}  got={bad['got']}")
        print()


# --------------------------------------------------------------------------- #
# CLI                                                                         #
# --------------------------------------------------------------------------- #


@click.command()
@click.option("--out", type=click.Path(dir_okay=False), default=None, help="Write JSON report to file.")
@click.option("--case", default=None, help="Run just one case by id.")
@click.option("--no-llm", is_flag=True, help="Skip Claude LLM fallback.")
@click.option("--json", "as_json", is_flag=True, help="Print raw JSON instead of pretty table.")
def cli(out: Optional[str], case: Optional[str], no_llm: bool, as_json: bool) -> None:
    cases_doc = json.loads(EVALS_PATH.read_text())
    cases = cases_doc["cases"]
    if case:
        cases = [c for c in cases if c["id"] == case]
        if not cases:
            click.echo(f"No case with id={case!r}", err=True)
            sys.exit(2)

    grades: list[CaseGrade] = []
    profiles: dict[str, dict] = {}
    for c in cases:
        profile = _run_case(c, use_llm=not no_llm)
        profile_dict = profile.model_dump(mode="json")
        profiles[c["id"]] = profile_dict
        g = grade_case(c, profile_dict)
        grades.append(g)

    report = {
        "aggregate": aggregate(grades),
        "cases": [g.to_dict() for g in grades],
        "profiles": profiles,
    }

    if out:
        Path(out).write_text(json.dumps(report, indent=2, default=str))
        click.echo(f"Wrote {out}")
    elif as_json:
        click.echo(json.dumps(report, indent=2, default=str))
    else:
        _pretty_print(report)

    sys.exit(0 if report["aggregate"]["pass_rate"] >= 0.8 else 1)


if __name__ == "__main__":
    cli()

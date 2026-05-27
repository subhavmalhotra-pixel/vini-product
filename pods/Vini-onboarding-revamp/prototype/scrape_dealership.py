#!/usr/bin/env python3
"""
CLI entry point — scrape a single dealership website and return a
DealershipProfile JSON.

Pipeline (per PRD §6 Prototype scope):
  1. robots.txt + crawl: Playwright fetches up to 3 pages of the dealer's
     OWN site (no aggregators).
  2. Schema.org JSON-LD parse — deterministic, high-confidence path.
  3. Claude Sonnet tool-use extraction — medium-confidence fallback,
     invoked only if Schema.org yield is below a configurable threshold
     (default: < 5 of 16 expected fields filled).
  4. Merge → derive timezone from state → emit JSON.

Usage:
    python scrape_dealership.py --url https://example-dealer.com
    python scrape_dealership.py --url https://example-dealer.com --out result.json
    python scrape_dealership.py --url https://example-dealer.com --no-llm

Exit codes:
    0 — extraction succeeded with at least one field filled
    1 — extraction failed entirely (robots blocked, no fields, etc.)

Important: this does NOT submit anything to the onboarding flow. It only
produces the JSON the OB team will review on a separate screen
(prototype scope item #5).
"""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path

import click

from crawler import crawl_dealer_site_sync
from llm_extractor import extract_with_llm
from merger import merge
from schemas import DealershipProfile


SCHEMA_ORG_YIELD_THRESHOLD = 5  # fields filled — under this, try the LLM


# --------------------------------------------------------------------------- #
# Pipeline                                                                    #
# --------------------------------------------------------------------------- #


def run_pipeline(
    url: str,
    use_llm: bool = True,
    max_pages: int = 3,
) -> DealershipProfile:
    crawl = crawl_dealer_site_sync(url, max_pages=max_pages)

    if not crawl.robots_allowed:
        return DealershipProfile(
            source_url=url,
            robots_txt_allowed=False,
            extraction_path="blocked",
            notes=[crawl.error or "blocked by robots.txt"],
        )

    if not crawl.succeeded:
        return DealershipProfile(
            source_url=url,
            extraction_path="failed",
            pages_visited=[p.url for p in crawl.pages],
            notes=[crawl.error or "no pages fetched"],
        )

    # Step 2 — Schema.org first
    from schema_parser import parse as parse_schema

    schema_profile = parse_schema(crawl.html_by_url, base_url=crawl.base_url)

    # Step 3 — LLM fallback if Schema.org yield is thin
    needs_llm = use_llm and _schema_yield(schema_profile) < SCHEMA_ORG_YIELD_THRESHOLD
    if needs_llm:
        llm_profile = extract_with_llm(crawl.html_by_url, base_url=crawl.base_url)
    else:
        llm_profile = DealershipProfile(
            source_url=crawl.base_url,
            extraction_path="schema_org",
            notes=["LLM fallback skipped — Schema.org yield sufficient."],
        )

    # Step 4 — Merge + derive
    merged = merge(schema_profile, llm_profile)
    merged.source_url = crawl.base_url
    merged.pages_visited = [p.url for p in crawl.pages]
    merged.robots_txt_allowed = True
    return merged


def _schema_yield(profile: DealershipProfile) -> int:
    """How many headline fields did Schema.org populate?"""
    fields = [
        profile.rooftop_name.value,
        profile.admin_email.value,
        profile.admin_phone.value,
        profile.rooftop_address.line1.value,
        profile.rooftop_address.district.value,
        profile.rooftop_address.state_or_province.value,
        profile.rooftop_address.zipcode.value,
    ]
    return sum(1 for f in fields if f)


# --------------------------------------------------------------------------- #
# CLI                                                                         #
# --------------------------------------------------------------------------- #


@click.command()
@click.option("--url", required=True, help="Dealer's own website (e.g. https://example-dealer.com).")
@click.option("--out", type=click.Path(dir_okay=False), default=None, help="Optional output JSON path.")
@click.option("--no-llm", is_flag=True, help="Disable the Claude fallback; Schema.org-only.")
@click.option("--max-pages", default=3, show_default=True, help="Cap on pages crawled.")
@click.option("--quiet", is_flag=True, help="Suppress log output; print JSON only.")
def cli(url: str, out: str, no_llm: bool, max_pages: int, quiet: bool) -> None:
    logging.basicConfig(
        level=logging.WARNING if quiet else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    profile = run_pipeline(url, use_llm=not no_llm, max_pages=max_pages)
    payload = profile.model_dump(mode="json")

    if out:
        Path(out).write_text(json.dumps(payload, indent=2, default=str))
        click.echo(f"Wrote {out}")
    else:
        click.echo(json.dumps(payload, indent=2, default=str))

    if profile.extraction_path in ("failed", "blocked"):
        sys.exit(1)


if __name__ == "__main__":
    cli()

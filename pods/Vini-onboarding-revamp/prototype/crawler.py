"""
Playwright-based crawler for a SINGLE dealer's own website.

Scope (per PRD §6, Prototype scope):
  - Only the dealership's own website. No aggregators, no Google/Yelp,
    no manufacturer sites.
  - Max 3 pages per domain (`/`, `/contact`, `/about|/hours`).
  - Respect robots.txt — if disallowed, return `blocked` and let the
    orchestrator surface that to the OB UI.
  - 1 request / second / domain rate-limit by default.
  - Identifies as a Spyne onboarding bot in User-Agent.

This module does NOT call any LLM and does NOT extract any fields.
It returns raw HTML for the schema/LLM parsers to chew on.

Usage:
    from crawler import crawl_dealer_site, CrawlResult
    result = await crawl_dealer_site("https://parkavenuemotors.com")
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from dataclasses import dataclass, field
from typing import List, Optional
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

USER_AGENT = os.getenv(
    "USER_AGENT", "Spyne-Onboarding-Bot/1.0 (+https://spyne.ai/bot)"
)
REQUESTS_PER_SECOND = float(os.getenv("REQUESTS_PER_SECOND", "1"))
PAGE_TIMEOUT_MS = int(os.getenv("PAGE_TIMEOUT_SECONDS", "15")) * 1000
MAX_PAGES_PER_DOMAIN = int(os.getenv("MAX_PAGES_PER_DOMAIN", "3"))

# Common dealer-site paths worth pulling, ranked by yield.
CANDIDATE_PATHS = [
    "/",
    "/contact",
    "/contact-us",
    "/about",
    "/about-us",
    "/hours-directions",
    "/dealer-info",
]


# --------------------------------------------------------------------------- #
# Result types                                                                #
# --------------------------------------------------------------------------- #


@dataclass
class FetchedPage:
    url: str
    html: str
    status: int
    fetched_at_ms: float


@dataclass
class CrawlResult:
    base_url: str
    pages: List[FetchedPage] = field(default_factory=list)
    robots_allowed: bool = True
    robots_disallowed_paths: List[str] = field(default_factory=list)
    crawl_delay_seconds: Optional[float] = None
    error: Optional[str] = None

    @property
    def html_by_url(self) -> dict:
        return {p.url: p.html for p in self.pages}

    @property
    def succeeded(self) -> bool:
        return self.robots_allowed and self.error is None and len(self.pages) > 0


# --------------------------------------------------------------------------- #
# robots.txt                                                                  #
# --------------------------------------------------------------------------- #


def _normalize_base(url: str) -> str:
    """Strip path, force https, drop trailing slash."""
    parsed = urlparse(url)
    scheme = parsed.scheme or "https"
    netloc = parsed.netloc or parsed.path  # bare hostnames land in `.path`
    return f"{scheme}://{netloc}"


def _candidate_urls(base_url: str) -> List[str]:
    base = _normalize_base(base_url).rstrip("/")
    return [urljoin(base + "/", p.lstrip("/")) for p in CANDIDATE_PATHS]


def _check_robots(base_url: str) -> tuple[RobotFileParser, bool, Optional[float]]:
    """
    Returns (parser, base_allowed, crawl_delay_seconds).
    `base_allowed` is False only if `/` itself is disallowed for our UA.
    """
    base = _normalize_base(base_url)
    rp = RobotFileParser()
    rp.set_url(urljoin(base, "/robots.txt"))
    try:
        rp.read()
    except Exception as e:
        # Treat unreachable robots.txt as "allowed by default" per RFC 9309 §2.4.
        logger.warning("robots.txt unreachable for %s: %s — assuming allow", base, e)
        return rp, True, None

    base_allowed = rp.can_fetch(USER_AGENT, urljoin(base, "/"))
    delay = rp.crawl_delay(USER_AGENT) or rp.crawl_delay("*")
    return rp, base_allowed, float(delay) if delay else None


# --------------------------------------------------------------------------- #
# Async fetcher (Playwright)                                                  #
# --------------------------------------------------------------------------- #


async def _fetch_page(
    context, url: str, timeout_ms: int = PAGE_TIMEOUT_MS
) -> Optional[FetchedPage]:
    page = await context.new_page()
    try:
        response = await page.goto(url, timeout=timeout_ms, wait_until="domcontentloaded")
        if response is None:
            return None
        status = response.status
        if status >= 400:
            logger.info("Skip %s (status %s)", url, status)
            return None
        html = await page.content()
        return FetchedPage(url=url, html=html, status=status, fetched_at_ms=time.time() * 1000)
    except Exception as e:
        logger.info("Fetch failed for %s: %s", url, e)
        return None
    finally:
        await page.close()


async def crawl_dealer_site(
    base_url: str,
    max_pages: int = MAX_PAGES_PER_DOMAIN,
) -> CrawlResult:
    """
    Crawl up to `max_pages` of `base_url` and return a CrawlResult.
    Does not raise on failure — failure is encoded in the result.
    """
    base = _normalize_base(base_url)
    result = CrawlResult(base_url=base)

    rp, base_allowed, crawl_delay = _check_robots(base)
    result.crawl_delay_seconds = crawl_delay
    if not base_allowed:
        result.robots_allowed = False
        result.error = "robots.txt disallows fetching the root path for our UA"
        return result

    # Compute effective per-request delay
    effective_delay = max(
        1.0 / REQUESTS_PER_SECOND,
        crawl_delay or 0.0,
    )

    # Lazy import so the rest of the module is usable without Playwright installed.
    from playwright.async_api import async_playwright

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=USER_AGENT,
            java_script_enabled=True,
        )

        try:
            picked = 0
            for url in _candidate_urls(base):
                if picked >= max_pages:
                    break
                if not rp.can_fetch(USER_AGENT, url):
                    result.robots_disallowed_paths.append(url)
                    continue
                page = await _fetch_page(context, url)
                if page is not None:
                    result.pages.append(page)
                    picked += 1
                # Rate-limit between requests, even on miss
                await asyncio.sleep(effective_delay)
        finally:
            await context.close()
            await browser.close()

    if not result.pages:
        result.error = result.error or "no pages successfully fetched"
    return result


# --------------------------------------------------------------------------- #
# Sync convenience wrapper                                                    #
# --------------------------------------------------------------------------- #


def crawl_dealer_site_sync(base_url: str, max_pages: int = MAX_PAGES_PER_DOMAIN) -> CrawlResult:
    return asyncio.run(crawl_dealer_site(base_url, max_pages))

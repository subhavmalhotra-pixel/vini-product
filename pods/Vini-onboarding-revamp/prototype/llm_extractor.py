"""
Claude Sonnet fallback extractor — used only when the deterministic Schema.org
parser cannot fill the required fields.

Approach (per PRD §4 AI surface A):
  - Tool-use / function-calling so the model returns a JSON object that
    matches our pre-declared schema (LLM_TOOL_INPUT_SCHEMA in schemas.py).
  - HTML is cleaned (scripts/styles/comments stripped) before being passed
    in. Capped at MAX_INPUT_TOKENS to control cost.
  - Output is re-validated with Pydantic; any invalid field is dropped
    rather than allowed to poison the output.
  - All fields produced here carry confidence='medium', source='llm'.

This module does NOT do any network/browser work — it just takes already-
fetched HTML and asks the LLM to read it.
"""

from __future__ import annotations

import logging
import os
from typing import List, Optional

from dotenv import load_dotenv

from schemas import (
    Address,
    Department,
    DealershipProfile,
    DepartmentName,
    LLM_TOOL_INPUT_SCHEMA,
    Tracked,
    VehicleType,
    WorkingHourSlot,
)

load_dotenv()
logger = logging.getLogger(__name__)

CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5-20250929")
MAX_INPUT_TOKENS = int(os.getenv("MAX_INPUT_TOKENS", "40000"))


TOOL_NAME = "extract_dealership_profile"

SYSTEM_PROMPT = """You read US auto-dealership webpages and extract the
dealership's own profile data. You are extracting the dealership's identity
(NAP — Name, Address, Phone), business hours, and department-level contacts.

Rules:
1. Only use facts present in the HTML you were given. Do not invent values.
2. If a field is not present, return null for that field. Do not guess.
3. The dealership website you are reading is the dealership's OWN website.
   Do not extract data about other dealerships even if they are mentioned.
4. For addresses, follow USPS conventions: line1 = street number + street name,
   line2 = suite/unit if present, district = city or county, state_or_province
   = two-letter US state code (e.g., "CA", "NY"), country = "US" or "USA",
   zipcode = 5- or 9-digit US zip.
5. For working hours, use 24-hour HH:MM format. If a day is closed,
   set opens="Closed" and closes="Closed".
6. dealer_type / dealer_sub_type / vehicle_types are usually NOT on the
   website. Return null / empty list if you cannot find them stated.
"""

USER_TEMPLATE = """Extract the dealership profile from the HTML below.

Base URL: {base_url}
Pages included: {page_list}

You must respond by calling the `{tool_name}` tool with your extracted data.
Do not respond with prose.

--- BEGIN PAGES ---
{pages_blob}
--- END PAGES ---
"""


def _clean_html(html: str) -> str:
    """Strip scripts/styles/comments to reduce token count."""
    from bs4 import BeautifulSoup, Comment

    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "noscript", "svg", "iframe"]):
        tag.decompose()
    for c in soup.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    text = str(soup)
    # Collapse whitespace runs
    import re

    text = re.sub(r"\s+", " ", text)
    return text


def _approx_tokens(text: str) -> int:
    # Cheap estimator — 4 chars/token. Used only for budget pruning.
    return len(text) // 4


def _build_pages_blob(html_by_url: dict[str, str]) -> str:
    chunks = []
    budget = MAX_INPUT_TOKENS
    for url, html in html_by_url.items():
        cleaned = _clean_html(html)
        approx = _approx_tokens(cleaned)
        if approx > budget:
            cleaned = cleaned[: budget * 4]
            approx = budget
        chunks.append(f"\n=== PAGE: {url} ===\n{cleaned}\n")
        budget -= approx
        if budget <= 500:
            break
    return "".join(chunks)


# --------------------------------------------------------------------------- #
# Public entrypoint                                                           #
# --------------------------------------------------------------------------- #


def extract_with_llm(
    html_by_url: dict[str, str],
    base_url: str,
    api_key: Optional[str] = None,
) -> DealershipProfile:
    """
    Run Claude with tool-use to extract a DealershipProfile. Returns a profile
    with source='llm', confidence='medium' on every populated field. On error,
    returns an empty profile (no exceptions raised).
    """
    profile = DealershipProfile(source_url=base_url, extraction_path="llm")
    profile.pages_visited = list(html_by_url.keys())

    try:
        import anthropic
    except ImportError:
        profile.notes.append("anthropic SDK not installed; skipping LLM extraction.")
        return profile

    key = api_key or os.getenv("ANTHROPIC_API_KEY")
    if not key:
        profile.notes.append("ANTHROPIC_API_KEY not set; skipping LLM extraction.")
        return profile

    client = anthropic.Anthropic(api_key=key)

    pages_blob = _build_pages_blob(html_by_url)
    user_msg = USER_TEMPLATE.format(
        base_url=base_url,
        page_list=", ".join(html_by_url.keys()) or "(none)",
        pages_blob=pages_blob,
        tool_name=TOOL_NAME,
    )

    try:
        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            tools=[
                {
                    "name": TOOL_NAME,
                    "description": (
                        "Return the dealership's profile (NAP, hours, departments) "
                        "extracted from the supplied HTML."
                    ),
                    "input_schema": LLM_TOOL_INPUT_SCHEMA,
                }
            ],
            tool_choice={"type": "tool", "name": TOOL_NAME},
            messages=[{"role": "user", "content": user_msg}],
        )
    except Exception as e:
        logger.error("LLM extraction failed: %s", e)
        profile.notes.append(f"LLM call failed: {type(e).__name__}: {e}")
        return profile

    tool_input = _extract_tool_input(response)
    if tool_input is None:
        profile.notes.append("LLM did not return a tool_use block.")
        return profile

    _populate_from_tool_input(profile, tool_input)
    return profile


def _extract_tool_input(response) -> Optional[dict]:
    for block in response.content:
        if getattr(block, "type", None) == "tool_use":
            return block.input
    return None


def _tracked(value, confidence="medium", source="llm") -> Tracked:
    if value is None or (isinstance(value, str) and not value.strip()):
        return Tracked()
    return Tracked(value=str(value).strip(), confidence=confidence, source=source)


def _populate_from_tool_input(profile: DealershipProfile, data: dict) -> None:
    profile.rooftop_name = _tracked(data.get("rooftop_name"))
    profile.website = _tracked(data.get("website"))
    profile.admin_name = _tracked(data.get("admin_name"))
    profile.admin_email = _tracked(data.get("admin_email"))
    profile.admin_phone = _tracked(data.get("admin_phone"))
    profile.dealer_type = _tracked(data.get("dealer_type"))
    profile.dealer_sub_type = _tracked(data.get("dealer_sub_type"))
    profile.region = _tracked(data.get("region"))
    profile.rooftop_timezone = _tracked(data.get("rooftop_timezone"))

    # Enum list
    raw_vt = data.get("vehicle_types") or []
    parsed_vt: List[VehicleType] = []
    for v in raw_vt:
        try:
            parsed_vt.append(VehicleType(v))
        except ValueError:
            continue
    profile.vehicle_types = parsed_vt

    addr_in = data.get("rooftop_address") or {}
    profile.rooftop_address = Address(
        line1=_tracked(addr_in.get("line1")),
        line2=_tracked(addr_in.get("line2")),
        district=_tracked(addr_in.get("district")),
        state_or_province=_tracked(addr_in.get("state_or_province")),
        country=_tracked(addr_in.get("country")),
        zipcode=_tracked(addr_in.get("zipcode")),
    )

    for d_in in data.get("departments") or []:
        try:
            name = DepartmentName(d_in.get("name"))
        except ValueError:
            continue
        hours: List[WorkingHourSlot] = []
        for slot in d_in.get("working_hours") or []:
            try:
                hours.append(
                    WorkingHourSlot(
                        day_of_week=slot.get("day_of_week"),
                        opens=slot.get("opens"),
                        closes=slot.get("closes"),
                    )
                )
            except Exception:
                continue
        profile.departments.append(
            Department(
                name=name,
                phone=_tracked(d_in.get("phone")),
                working_hours=hours,
                confidence="medium",
                source="llm",
            )
        )

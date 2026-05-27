"""
Deterministic Schema.org JSON-LD / Microdata parser.

This is the high-confidence path. We look for Schema.org types that
dealer sites commonly publish for SEO:

  - AutoDealer
  - AutomotiveBusiness
  - LocalBusiness  (fallback when nothing more specific is present)
  - AutoRepair, AutoBodyShop  (Service-only dealerships)
  - Organization   (last-resort)

What we map (refs: https://schema.org/AutoDealer, https://schema.org/LocalBusiness):
  - name                  → rooftop_name
  - url                   → website
  - telephone             → admin_phone   (will likely be the general line;
                                          OB confirms / replaces with admin)
  - email                 → admin_email
  - address.streetAddress → rooftop_address.line1 / line2
  - address.addressLocality → rooftop_address.district
  - address.addressRegion → rooftop_address.state_or_province
  - address.postalCode    → rooftop_address.zipcode
  - address.addressCountry → rooftop_address.country
  - openingHoursSpecification[] → Department(Sales).working_hours
                                  (Sales is the default unless the entity
                                   is AutoRepair → Service)

Fields like dealer_type / dealer_sub_type / vehicle_types / region almost never
appear in public Schema.org markup and stay null here. Those will come from
the contract layer (Phase 1 §4 deterministic surface "Contract data prefill"),
not from this scraper.
"""

from __future__ import annotations

import logging
from typing import Any, Iterable, List, Optional

from schemas import (
    Address,
    Department,
    DealershipProfile,
    DepartmentName,
    Source,
    Tracked,
    WorkingHourSlot,
)

logger = logging.getLogger(__name__)


# Schema.org @type values we treat as "this is the dealership entity"
_DEALER_TYPES = {
    "AutoDealer",
    "AutomotiveBusiness",
    "LocalBusiness",
    "Organization",
}
_SERVICE_TYPES = {"AutoRepair", "AutoBodyShop"}


# --------------------------------------------------------------------------- #
# Public API                                                                  #
# --------------------------------------------------------------------------- #


def parse(html_by_url: dict[str, str], base_url: str) -> DealershipProfile:
    """
    Parse Schema.org data out of every page we crawled and merge into a single
    DealershipProfile. Fields filled here are tagged source='schema_org',
    confidence='high'.
    """
    profile = DealershipProfile(source_url=base_url, extraction_path="schema_org")
    profile.website = Tracked(value=base_url, confidence="high", source="schema_org")
    profile.pages_visited = list(html_by_url.keys())

    candidates: List[dict] = []
    for url, html in html_by_url.items():
        try:
            candidates.extend(_extract_jsonld_entities(html, url))
        except Exception as e:
            logger.warning("Schema.org parse failed on %s: %s", url, e)

    if not candidates:
        profile.notes.append("No Schema.org JSON-LD entities found on any page.")
        return profile

    dealer_entity = _pick_dealer_entity(candidates)
    if dealer_entity is None:
        profile.notes.append(
            "Schema.org entities found but none matched AutoDealer / LocalBusiness."
        )
        return profile

    _populate_from_entity(profile, dealer_entity)

    # Look for sibling Service / Parts blocks (some dealers publish one per dept)
    for ent in candidates:
        types = _types_of(ent)
        if any(t in _SERVICE_TYPES for t in types):
            _add_department_from_entity(profile, ent, DepartmentName.SERVICE)

    return profile


# --------------------------------------------------------------------------- #
# Internals                                                                   #
# --------------------------------------------------------------------------- #


def _extract_jsonld_entities(html: str, url: str) -> List[dict]:
    """
    Pull out every JSON-LD entity on a page using `extruct`. Falls back to a
    minimal BeautifulSoup-based JSON-LD grab if `extruct` is unavailable.
    """
    try:
        import extruct

        data = extruct.extract(
            html,
            base_url=url,
            syntaxes=["json-ld", "microdata"],
            uniform=True,
        )
        items = list(data.get("json-ld", []))
        items.extend(data.get("microdata", []))
        return items
    except ImportError:
        return _fallback_jsonld(html)


def _fallback_jsonld(html: str) -> List[dict]:
    import json

    from bs4 import BeautifulSoup

    soup = BeautifulSoup(html, "lxml")
    out: List[dict] = []
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            data = json.loads(tag.string or "{}")
        except Exception:
            continue
        if isinstance(data, list):
            out.extend(data)
        elif isinstance(data, dict):
            graph = data.get("@graph")
            if isinstance(graph, list):
                out.extend(graph)
            else:
                out.append(data)
    return out


def _types_of(entity: dict) -> List[str]:
    raw = entity.get("@type") or entity.get("type")
    if isinstance(raw, list):
        return [str(x) for x in raw]
    if isinstance(raw, str):
        return [raw]
    return []


def _pick_dealer_entity(candidates: Iterable[dict]) -> Optional[dict]:
    # Prefer AutoDealer > AutomotiveBusiness > LocalBusiness > Organization
    priority = ["AutoDealer", "AutomotiveBusiness", "LocalBusiness", "Organization"]
    by_type: dict[str, dict] = {}
    for ent in candidates:
        for t in _types_of(ent):
            if t in _DEALER_TYPES and t not in by_type:
                by_type[t] = ent
    for t in priority:
        if t in by_type:
            return by_type[t]
    return None


def _tracked(value: Optional[Any], source: Source = "schema_org") -> Tracked:
    if value is None or (isinstance(value, str) and not value.strip()):
        return Tracked()
    return Tracked(value=str(value).strip(), confidence="high", source=source)


def _populate_from_entity(profile: DealershipProfile, entity: dict) -> None:
    profile.rooftop_name = _tracked(entity.get("name"))
    if entity.get("url"):
        profile.website = _tracked(entity["url"])
    profile.admin_phone = _tracked(entity.get("telephone"))
    profile.admin_email = _tracked(entity.get("email"))

    addr = entity.get("address")
    if isinstance(addr, list):
        addr = addr[0] if addr else None
    if isinstance(addr, dict):
        profile.rooftop_address = Address(
            line1=_tracked(addr.get("streetAddress")),
            line2=Tracked(),  # rarely split in JSON-LD
            district=_tracked(addr.get("addressLocality")),
            state_or_province=_tracked(addr.get("addressRegion")),
            country=_tracked(addr.get("addressCountry")),
            zipcode=_tracked(addr.get("postalCode")),
        )

    hours = _parse_opening_hours(entity)
    if hours:
        sales = Department(
            name=DepartmentName.SALES,
            phone=profile.admin_phone,
            working_hours=hours,
            confidence="high",
            source="schema_org",
        )
        profile.departments.append(sales)


def _parse_opening_hours(entity: dict) -> List[WorkingHourSlot]:
    """
    Parse the two common Schema.org variants:

    1) openingHoursSpecification: [
         { dayOfWeek: "Monday" | ["Monday","Tuesday"],
           opens: "09:00", closes: "17:30" }
       ]
    2) openingHours: ["Mo-Fr 09:00-17:30", "Sa 09:00-13:00"]
    """
    out: List[WorkingHourSlot] = []
    spec = entity.get("openingHoursSpecification")
    if isinstance(spec, dict):
        spec = [spec]
    if isinstance(spec, list):
        for s in spec:
            days = s.get("dayOfWeek") or []
            if isinstance(days, str):
                days = [days]
            for d in days:
                d_name = _normalize_day(d)
                if not d_name:
                    continue
                out.append(
                    WorkingHourSlot(
                        day_of_week=d_name,
                        opens=s.get("opens"),
                        closes=s.get("closes"),
                    )
                )
        if out:
            return out

    text = entity.get("openingHours")
    if isinstance(text, str):
        text = [text]
    if isinstance(text, list):
        for line in text:
            out.extend(_parse_openinghours_string(line))

    return out


_DAY_MAP = {
    "mo": "Monday",
    "monday": "Monday",
    "tu": "Tuesday",
    "tue": "Tuesday",
    "tuesday": "Tuesday",
    "we": "Wednesday",
    "wed": "Wednesday",
    "wednesday": "Wednesday",
    "th": "Thursday",
    "thu": "Thursday",
    "thursday": "Thursday",
    "fr": "Friday",
    "fri": "Friday",
    "friday": "Friday",
    "sa": "Saturday",
    "sat": "Saturday",
    "saturday": "Saturday",
    "su": "Sunday",
    "sun": "Sunday",
    "sunday": "Sunday",
}
_DAY_ORDER = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]


def _normalize_day(raw: str) -> Optional[str]:
    if not raw:
        return None
    key = raw.strip().lower().split("/")[-1]
    return _DAY_MAP.get(key)


def _parse_openinghours_string(text: str) -> List[WorkingHourSlot]:
    """
    Parse one entry of the openingHours microdata format, e.g.
        "Mo-Fr 09:00-17:30"
        "Sa 09:00-13:00"
        "Su Closed"
    """
    import re

    text = text.strip()
    m = re.match(
        r"^([A-Za-z]{2,3})(?:-([A-Za-z]{2,3}))?\s+(?:(\d{1,2}:\d{2})-(\d{1,2}:\d{2})|Closed)$",
        text,
    )
    if not m:
        return []
    start_day = _normalize_day(m.group(1))
    end_day = _normalize_day(m.group(2) or m.group(1))
    opens, closes = (m.group(3), m.group(4)) if m.group(3) else ("Closed", "Closed")
    if not (start_day and end_day):
        return []
    try:
        start_i = _DAY_ORDER.index(start_day)
        end_i = _DAY_ORDER.index(end_day)
    except ValueError:
        return []
    return [
        WorkingHourSlot(day_of_week=_DAY_ORDER[i], opens=opens, closes=closes)
        for i in range(start_i, end_i + 1)
    ]


def _add_department_from_entity(
    profile: DealershipProfile, entity: dict, name: DepartmentName
) -> None:
    dept = Department(
        name=name,
        phone=_tracked(entity.get("telephone")),
        working_hours=_parse_opening_hours(entity),
        confidence="high",
        source="schema_org",
    )
    # De-dup: don't add a second Department for the same name
    if not any(d.name == name for d in profile.departments):
        profile.departments.append(dept)

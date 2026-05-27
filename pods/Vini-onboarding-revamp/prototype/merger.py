"""
Merge Schema.org-derived and LLM-derived DealershipProfiles into one.

Rule: Schema.org wins on any field where it produced a non-empty value
(confidence='high'). The LLM only fills the holes.

Also runs a small "derived" pass — e.g. deriving the rooftop_timezone from
the state code in the address, since timezone is rarely on dealer websites
but is a Must-have field in the OB flow.
"""

from __future__ import annotations

from copy import deepcopy
from typing import Optional

from schemas import (
    Address,
    Department,
    DealershipProfile,
    Tracked,
)


# US state code → IANA timezone (rough; states with multiple zones default
# to the most-populated zone; OB team confirms either way).
_STATE_TO_TZ = {
    "AL": "America/Chicago",
    "AK": "America/Anchorage",
    "AZ": "America/Phoenix",
    "AR": "America/Chicago",
    "CA": "America/Los_Angeles",
    "CO": "America/Denver",
    "CT": "America/New_York",
    "DC": "America/New_York",
    "DE": "America/New_York",
    "FL": "America/New_York",
    "GA": "America/New_York",
    "HI": "Pacific/Honolulu",
    "ID": "America/Boise",
    "IL": "America/Chicago",
    "IN": "America/Indiana/Indianapolis",
    "IA": "America/Chicago",
    "KS": "America/Chicago",
    "KY": "America/New_York",
    "LA": "America/Chicago",
    "ME": "America/New_York",
    "MD": "America/New_York",
    "MA": "America/New_York",
    "MI": "America/Detroit",
    "MN": "America/Chicago",
    "MS": "America/Chicago",
    "MO": "America/Chicago",
    "MT": "America/Denver",
    "NE": "America/Chicago",
    "NV": "America/Los_Angeles",
    "NH": "America/New_York",
    "NJ": "America/New_York",
    "NM": "America/Denver",
    "NY": "America/New_York",
    "NC": "America/New_York",
    "ND": "America/Chicago",
    "OH": "America/New_York",
    "OK": "America/Chicago",
    "OR": "America/Los_Angeles",
    "PA": "America/New_York",
    "RI": "America/New_York",
    "SC": "America/New_York",
    "SD": "America/Chicago",
    "TN": "America/Chicago",
    "TX": "America/Chicago",
    "UT": "America/Denver",
    "VT": "America/New_York",
    "VA": "America/New_York",
    "WA": "America/Los_Angeles",
    "WV": "America/New_York",
    "WI": "America/Chicago",
    "WY": "America/Denver",
}


def _empty(t: Optional[Tracked]) -> bool:
    return t is None or t.value is None or not str(t.value).strip()


def _prefer(primary: Tracked, fallback: Tracked) -> Tracked:
    """Pick the better-confidence field — primary wins ties."""
    if not _empty(primary):
        return primary
    return fallback


def _merge_address(primary: Address, fallback: Address) -> Address:
    return Address(
        line1=_prefer(primary.line1, fallback.line1),
        line2=_prefer(primary.line2, fallback.line2),
        district=_prefer(primary.district, fallback.district),
        state_or_province=_prefer(primary.state_or_province, fallback.state_or_province),
        country=_prefer(primary.country, fallback.country),
        zipcode=_prefer(primary.zipcode, fallback.zipcode),
    )


def merge(
    schema_profile: DealershipProfile,
    llm_profile: DealershipProfile,
) -> DealershipProfile:
    """
    Combine the two profiles. Schema.org values win when both are present.
    Notes/extraction_path are recomputed.
    """
    merged = deepcopy(schema_profile)

    merged.rooftop_name = _prefer(schema_profile.rooftop_name, llm_profile.rooftop_name)
    merged.website = _prefer(schema_profile.website, llm_profile.website)
    merged.admin_name = _prefer(schema_profile.admin_name, llm_profile.admin_name)
    merged.admin_email = _prefer(schema_profile.admin_email, llm_profile.admin_email)
    merged.admin_phone = _prefer(schema_profile.admin_phone, llm_profile.admin_phone)
    merged.dealer_type = _prefer(schema_profile.dealer_type, llm_profile.dealer_type)
    merged.dealer_sub_type = _prefer(
        schema_profile.dealer_sub_type, llm_profile.dealer_sub_type
    )
    merged.region = _prefer(schema_profile.region, llm_profile.region)
    merged.rooftop_timezone = _prefer(
        schema_profile.rooftop_timezone, llm_profile.rooftop_timezone
    )

    if not schema_profile.vehicle_types and llm_profile.vehicle_types:
        merged.vehicle_types = llm_profile.vehicle_types

    merged.rooftop_address = _merge_address(
        schema_profile.rooftop_address, llm_profile.rooftop_address
    )

    # Departments: schema first, then LLM-only departments (by name)
    seen = {d.name for d in merged.departments}
    for d in llm_profile.departments:
        if d.name not in seen:
            merged.departments.append(d)
            seen.add(d.name)

    # Derived: timezone from state code
    if _empty(merged.rooftop_timezone) and not _empty(merged.rooftop_address.state_or_province):
        state_raw = (merged.rooftop_address.state_or_province.value or "").upper().strip()
        # Normalize "California" → "CA" minimally; we only auto-derive for clean 2-letter codes
        if len(state_raw) == 2 and state_raw in _STATE_TO_TZ:
            merged.rooftop_timezone = Tracked(
                value=_STATE_TO_TZ[state_raw],
                confidence="low",
                source="derived",
            )

    schema_yield = _count_filled(schema_profile)
    llm_yield = _count_filled(llm_profile) if llm_profile.extraction_path == "llm" else 0
    if schema_yield > 0 and llm_yield > 0:
        merged.extraction_path = "hybrid"
    elif schema_yield > 0:
        merged.extraction_path = "schema_org"
    elif llm_yield > 0:
        merged.extraction_path = "llm"
    else:
        merged.extraction_path = "failed"

    merged.notes = list(dict.fromkeys(schema_profile.notes + llm_profile.notes))
    return merged


def _count_filled(profile: DealershipProfile) -> int:
    count = 0
    for f in [
        profile.rooftop_name,
        profile.website,
        profile.admin_email,
        profile.admin_phone,
        profile.rooftop_address.line1,
        profile.rooftop_address.district,
        profile.rooftop_address.state_or_province,
        profile.rooftop_address.zipcode,
    ]:
        if not _empty(f):
            count += 1
    return count

"""
Pydantic schemas for the 16 Rooftop Details fields extracted from a dealer's
own website (no third-party / aggregator sources).

Field set sourced from OB Revamp Analysis.xlsx → Sales Agent + Service Agent
sheets → Rooftop Details rows.

Every extracted field carries:
  - value
  - confidence: "high" | "medium" | "low" | "none"
  - source: "schema_org" | "llm" | "derived" | None

Confidence policy:
  - "high"   = lifted verbatim from Schema.org JSON-LD on the dealer site
  - "medium" = produced by the LLM fallback from raw HTML
  - "low"    = derived (e.g., timezone inferred from state)
  - "none"   = could not be determined; left for manual OB entry
"""

from __future__ import annotations

from enum import Enum
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, HttpUrl


# --------------------------------------------------------------------------- #
# Enums                                                                       #
# --------------------------------------------------------------------------- #


class DealerType(str, Enum):
    INDIVIDUAL_DEALER = "INDIVIDUAL_DEALER"
    GROUP_DEALER = "GROUP_DEALER"
    UNKNOWN = "UNKNOWN"


class DealerSubType(str, Enum):
    FRANCHISE_DEALER = "FRANCHISE_DEALER"
    INDEPENDENT_DEALER = "INDEPENDENT_DEALER"
    UNKNOWN = "UNKNOWN"


class VehicleType(str, Enum):
    NEW = "New"
    PRE_OWNED = "Pre-Owned"


class DepartmentName(str, Enum):
    SALES = "Sales"
    SERVICE = "Service"
    PARTS = "Parts"
    FINANCE = "Finance"


Confidence = Literal["high", "medium", "low", "none"]
Source = Literal["schema_org", "llm", "derived"]


# --------------------------------------------------------------------------- #
# Value-with-provenance wrapper                                               #
# --------------------------------------------------------------------------- #


class Tracked(BaseModel):
    """Wraps a single extracted field with its confidence + source."""

    value: Optional[str] = None
    confidence: Confidence = "none"
    source: Optional[Source] = None


# --------------------------------------------------------------------------- #
# Sub-objects                                                                 #
# --------------------------------------------------------------------------- #


class Address(BaseModel):
    line1: Tracked = Field(default_factory=Tracked)
    line2: Tracked = Field(default_factory=Tracked)
    district: Tracked = Field(default_factory=Tracked)  # county / locality
    state_or_province: Tracked = Field(default_factory=Tracked)
    country: Tracked = Field(default_factory=Tracked)
    zipcode: Tracked = Field(default_factory=Tracked)


class WorkingHourSlot(BaseModel):
    """Single day-of-week slot. Day names follow Schema.org / ISO conventions."""

    day_of_week: Literal[
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ]
    opens: Optional[str] = None  # "HH:MM" 24h or "Closed"
    closes: Optional[str] = None  # "HH:MM" 24h or "Closed"


class Department(BaseModel):
    name: DepartmentName
    phone: Tracked = Field(default_factory=Tracked)
    address: Optional[Address] = None  # often "same as rooftop"; left None if so
    working_hours: List[WorkingHourSlot] = Field(default_factory=list)
    confidence: Confidence = "none"
    source: Optional[Source] = None


# --------------------------------------------------------------------------- #
# Top-level Rooftop profile                                                   #
# --------------------------------------------------------------------------- #


class DealershipProfile(BaseModel):
    """
    Output schema returned by `scrape_dealership.py`.

    Matches the 16 Rooftop Details fields plus the 4 optional departments
    (Sales / Service / Parts / Finance).
    """

    # --- Dealership Details (16 fields from OB Revamp Analysis) -------------
    rooftop_name: Tracked = Field(default_factory=Tracked)
    website: Tracked = Field(default_factory=Tracked)
    admin_name: Tracked = Field(default_factory=Tracked)
    admin_email: Tracked = Field(default_factory=Tracked)
    admin_phone: Tracked = Field(default_factory=Tracked)
    dealer_type: Tracked = Field(default_factory=Tracked)  # see DealerType enum
    dealer_sub_type: Tracked = Field(
        default_factory=Tracked
    )  # see DealerSubType enum
    vehicle_types: List[VehicleType] = Field(default_factory=list)
    rooftop_address: Address = Field(default_factory=Address)
    region: Tracked = Field(default_factory=Tracked)
    rooftop_timezone: Tracked = Field(default_factory=Tracked)

    # --- Department Details (optional, often skippable) ---------------------
    departments: List[Department] = Field(default_factory=list)

    # --- Crawl metadata -----------------------------------------------------
    source_url: HttpUrl
    pages_visited: List[str] = Field(default_factory=list)
    robots_txt_allowed: bool = True
    extraction_path: Literal["schema_org", "llm", "hybrid", "blocked", "failed"] = (
        "failed"
    )
    notes: List[str] = Field(default_factory=list)


# --------------------------------------------------------------------------- #
# Anthropic tool-call schema for LLM extractor                                #
# --------------------------------------------------------------------------- #
# Hand-tuned JSON schema for the Claude tool definition. Kept flat-ish so the
# model can fill it reliably; the orchestrator re-validates with the Pydantic
# models above before merging.

LLM_TOOL_INPUT_SCHEMA: dict = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "rooftop_name": {"type": ["string", "null"]},
        "website": {"type": ["string", "null"]},
        "admin_name": {"type": ["string", "null"]},
        "admin_email": {"type": ["string", "null"]},
        "admin_phone": {"type": ["string", "null"]},
        "dealer_type": {
            "type": ["string", "null"],
            "enum": [
                "INDIVIDUAL_DEALER",
                "GROUP_DEALER",
                "UNKNOWN",
                None,
            ],
        },
        "dealer_sub_type": {
            "type": ["string", "null"],
            "enum": [
                "FRANCHISE_DEALER",
                "INDEPENDENT_DEALER",
                "UNKNOWN",
                None,
            ],
        },
        "vehicle_types": {
            "type": "array",
            "items": {"type": "string", "enum": ["New", "Pre-Owned"]},
        },
        "rooftop_address": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "line1": {"type": ["string", "null"]},
                "line2": {"type": ["string", "null"]},
                "district": {"type": ["string", "null"]},
                "state_or_province": {"type": ["string", "null"]},
                "country": {"type": ["string", "null"]},
                "zipcode": {"type": ["string", "null"]},
            },
            "required": [
                "line1",
                "line2",
                "district",
                "state_or_province",
                "country",
                "zipcode",
            ],
        },
        "region": {"type": ["string", "null"]},
        "rooftop_timezone": {"type": ["string", "null"]},
        "departments": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "name": {
                        "type": "string",
                        "enum": ["Sales", "Service", "Parts", "Finance"],
                    },
                    "phone": {"type": ["string", "null"]},
                    "working_hours": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "properties": {
                                "day_of_week": {
                                    "type": "string",
                                    "enum": [
                                        "Monday",
                                        "Tuesday",
                                        "Wednesday",
                                        "Thursday",
                                        "Friday",
                                        "Saturday",
                                        "Sunday",
                                    ],
                                },
                                "opens": {"type": ["string", "null"]},
                                "closes": {"type": ["string", "null"]},
                            },
                            "required": ["day_of_week", "opens", "closes"],
                        },
                    },
                },
                "required": ["name", "phone", "working_hours"],
            },
        },
    },
    "required": [
        "rooftop_name",
        "website",
        "admin_name",
        "admin_email",
        "admin_phone",
        "dealer_type",
        "dealer_sub_type",
        "vehicle_types",
        "rooftop_address",
        "region",
        "rooftop_timezone",
        "departments",
    ],
}

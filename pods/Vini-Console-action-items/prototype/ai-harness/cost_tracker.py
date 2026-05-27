"""
Cost tracker — PRD §4.6.

Tracks per-call cost from token usage and enforces the per-rooftop daily cap +
24h rolling kill criterion.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

from config import (
    HAIKU_INPUT_USD_PER_MTOK,
    HAIKU_OUTPUT_USD_PER_MTOK,
    PER_ROOFTOP_DAILY_CAP_USD,
    HARD_KILL_24H_AVG_USD,
)


@dataclass
class CostEntry:
    rooftop_id: str
    timestamp: datetime
    cost_usd: float
    input_tokens: int
    output_tokens: int


@dataclass
class CostTracker:
    entries: list[CostEntry] = field(default_factory=list)

    @staticmethod
    def cost_from_tokens(input_tokens: int, output_tokens: int) -> float:
        in_cost = (input_tokens / 1_000_000) * HAIKU_INPUT_USD_PER_MTOK
        out_cost = (output_tokens / 1_000_000) * HAIKU_OUTPUT_USD_PER_MTOK
        return round(in_cost + out_cost, 6)

    def record(self, rooftop_id: str, input_tokens: int, output_tokens: int) -> CostEntry:
        entry = CostEntry(
            rooftop_id=rooftop_id,
            timestamp=datetime.now(tz=timezone.utc),
            cost_usd=self.cost_from_tokens(input_tokens, output_tokens),
            input_tokens=input_tokens,
            output_tokens=output_tokens,
        )
        self.entries.append(entry)
        return entry

    def rooftop_spend_today(self, rooftop_id: str) -> float:
        today_start = datetime.now(tz=timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        return sum(
            e.cost_usd
            for e in self.entries
            if e.rooftop_id == rooftop_id and e.timestamp >= today_start
        )

    def rolling_24h_avg(self) -> float:
        cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=24)
        recent = [e for e in self.entries if e.timestamp >= cutoff]
        if not recent:
            return 0.0
        return sum(e.cost_usd for e in recent) / len(recent)

    def can_proceed(self, rooftop_id: str) -> tuple[bool, str | None]:
        """Pre-flight check before issuing an LLM call. Returns (ok, reason_if_blocked)."""
        if self.rooftop_spend_today(rooftop_id) >= PER_ROOFTOP_DAILY_CAP_USD:
            return False, f"rooftop_daily_cap_exceeded:{PER_ROOFTOP_DAILY_CAP_USD}"
        if self.rolling_24h_avg() >= HARD_KILL_24H_AVG_USD:
            return False, f"hard_kill_24h_avg_exceeded:{HARD_KILL_24H_AVG_USD}"
        return True, None

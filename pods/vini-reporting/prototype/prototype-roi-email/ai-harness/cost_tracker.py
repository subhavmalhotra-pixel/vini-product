"""
Per-request and per-dealer cost tracking.

Enforces PRD §4 ceilings:
  - per-request:           $0.02
  - per-week-per-dealer:   $0.20
  - per-day-per-dealer:    $1.00
  - rolling-24h avg cost:  $0.05 (kill threshold from PRD §7 kill criterion #4)

In production, persist to a real datastore. For the prototype, in-memory
counters are sufficient to demonstrate enforcement and to surface in eval
reports.
"""
from __future__ import annotations

import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Deque

from config import CONFIG


@dataclass
class CostEvent:
    timestamp: float          # epoch seconds
    dealer_id: str
    request_id: str
    input_tokens: int
    output_tokens: int
    cost_usd: float


@dataclass
class CostTracker:
    events: list[CostEvent] = field(default_factory=list)
    _rolling_24h: Deque[CostEvent] = field(default_factory=deque)
    _per_dealer_week: dict[str, float] = field(default_factory=lambda: defaultdict(float))
    _per_dealer_day: dict[str, float] = field(default_factory=lambda: defaultdict(float))

    def estimate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """Project cost in USD given token counts. Uses pricing from CONFIG."""
        input_usd = (input_tokens / 1_000_000) * CONFIG.input_token_cost_per_million_usd
        output_usd = (output_tokens / 1_000_000) * CONFIG.output_token_cost_per_million_usd
        return round(input_usd + output_usd, 6)

    def record(
        self,
        *,
        dealer_id: str,
        request_id: str,
        input_tokens: int,
        output_tokens: int,
    ) -> CostEvent:
        cost = self.estimate_cost(input_tokens, output_tokens)
        evt = CostEvent(
            timestamp=time.time(),
            dealer_id=dealer_id,
            request_id=request_id,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost,
        )
        self.events.append(evt)
        self._rolling_24h.append(evt)
        self._per_dealer_week[dealer_id] += cost
        self._per_dealer_day[dealer_id] += cost
        self._evict_old(evt.timestamp)
        return evt

    def _evict_old(self, now: float) -> None:
        # Drop events older than 24h from rolling window
        cutoff = now - 24 * 3600
        while self._rolling_24h and self._rolling_24h[0].timestamp < cutoff:
            self._rolling_24h.popleft()

    # ---- Ceiling checks ----

    def is_per_request_over(self, estimated_cost: float) -> bool:
        return estimated_cost > CONFIG.cost_per_request_ceiling_usd

    def is_per_day_over(self, dealer_id: str) -> bool:
        return self._per_dealer_day[dealer_id] > CONFIG.cost_per_day_per_dealer_ceiling_usd

    def is_per_week_over(self, dealer_id: str) -> bool:
        return self._per_dealer_week[dealer_id] > CONFIG.cost_per_week_per_dealer_ceiling_usd

    def is_rolling_24h_avg_over_kill_threshold(self) -> bool:
        if not self._rolling_24h:
            return False
        avg = sum(e.cost_usd for e in self._rolling_24h) / len(self._rolling_24h)
        return avg > CONFIG.rolling_24h_cost_kill_threshold_usd

    # ---- Reporting ----

    def summary(self) -> dict:
        if not self.events:
            return {
                "total_requests": 0,
                "total_cost_usd": 0.0,
                "avg_cost_per_request_usd": 0.0,
                "rolling_24h_avg_cost_usd": 0.0,
                "ceiling_violations": 0,
            }
        total = sum(e.cost_usd for e in self.events)
        avg = total / len(self.events)
        rolling_avg = 0.0
        if self._rolling_24h:
            rolling_avg = sum(e.cost_usd for e in self._rolling_24h) / len(self._rolling_24h)
        violations = sum(1 for e in self.events if e.cost_usd > CONFIG.cost_per_request_ceiling_usd)
        return {
            "total_requests": len(self.events),
            "total_cost_usd": round(total, 6),
            "avg_cost_per_request_usd": round(avg, 6),
            "rolling_24h_avg_cost_usd": round(rolling_avg, 6),
            "ceiling_violations": violations,
        }

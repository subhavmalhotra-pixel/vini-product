import json
from pathlib import Path

_DATA_PATH = Path(__file__).parent.parent / "test-data" / "mock_data.json"
MOCK_DATA: dict = json.loads(_DATA_PATH.read_text())


def _get(dealer_id: str, week_start_date: str) -> dict:
    key = f"{dealer_id}:{week_start_date}"
    entry = MOCK_DATA.get(key)
    if entry is None:
        raise KeyError(f"No mock data for {key}")
    return entry


def get_dealer_info(dealer_id: str, week_start_date: str) -> dict:
    e = _get(dealer_id, week_start_date)
    return {"dealer_name": e["dealer_name"], "timezone": e["timezone"]}


def get_weekly_call_stats(dealer_id: str, week_start_date: str) -> dict:
    return _get(dealer_id, week_start_date)["call_stats"]


def get_appointment_funnel(dealer_id: str, week_start_date: str) -> dict:
    return _get(dealer_id, week_start_date)["appointment_funnel"]


def get_lead_activity_summary(dealer_id: str, week_start_date: str) -> dict:
    return _get(dealer_id, week_start_date)["lead_activity"]


def get_top_call_examples(dealer_id: str, week_start_date: str, n: int = 3) -> dict:
    calls = _get(dealer_id, week_start_date)["top_calls"]["calls"]
    return {"calls": calls[:n]}

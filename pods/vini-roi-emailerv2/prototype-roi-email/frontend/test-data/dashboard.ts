/**
 * Mock data for the ROI Dashboard portal (Phase 2 platform).
 *
 * Single-rooftop snapshot for Honda of Downtown LA. Anonymized for display —
 * never expose real customer names/phones/emails in any rendered UI.
 */

import { HONDA_DTLA } from "./dealers";
import type { Dealer } from "./schema";

export interface DashboardKPI {
  label: string;
  value: number;
  unit?: string;
  delta_pct?: number; // signed, only colored if >=3% or <=-3%
  delta_label?: string; // "vs prior 7d"
  subtitle?: string;
}

export interface FunnelStage {
  label: string;
  count: number;
}

export interface AfterHoursOutcome {
  label: string;
  count: number;
}

export interface HotLeadPreview {
  lead_id: string; // "Customer #JD-4218"
  display_id: string;
  vehicle: string; // "2024 Honda Civic LX"
  intent_summary: string; // short anonymized
  last_touch: string; // ISO
  channels: ("call" | "sms" | "chat" | "email")[];
  score: "hot" | "warm";
}

export interface DashboardSnapshot {
  dealer: Dealer;
  reporting_period: { start: string; end: string; label: string };
  ai_insight: {
    state: "ready" | "loading" | "error";
    paragraph?: string;
  };
  kpis: DashboardKPI[];
  funnel: {
    stages: FunnelStage[];
    set_to_show_pct: number;
    show_to_close_pct: number;
  };
  after_hours: {
    total_calls: number;
    outcomes: AfterHoursOutcome[];
  };
  hot_leads: HotLeadPreview[];
}

export const HONDA_DTLA_DASHBOARD: DashboardSnapshot = {
  dealer: HONDA_DTLA,
  reporting_period: {
    start: "2026-05-07",
    end: "2026-05-13",
    label: "Last 7 days",
  },
  ai_insight: {
    state: "ready",
    paragraph:
      "Inbound call volume held steady week-over-week, but appointment set-rate climbed from 28% to 34% — driven by a clear lift in evening (after-hours) call handling. The biggest gap remains showed-to-closed: roughly one in three booked appointments isn't converting on the floor. Civic and CR-V continue to be the top two intents, with payment-related questions making up nearly half of all inbound chat.",
  },
  kpis: [
    {
      label: "Inbound calls",
      value: 412,
      delta_pct: 1.2,
      delta_label: "vs prior 7d",
    },
    {
      label: "Outbound dials",
      value: 287,
      delta_pct: 4.8,
      delta_label: "vs prior 7d",
    },
    {
      label: "After-hours calls",
      value: 64,
      delta_pct: 12.5,
      delta_label: "vs prior 7d",
      subtitle: "Captured outside business hours",
    },
    {
      label: "Appointments set",
      value: 96,
      delta_pct: 6.3,
      delta_label: "vs prior 7d",
    },
    {
      label: "Appointments showed",
      value: 71,
      delta_pct: 2.1,
      delta_label: "vs prior 7d",
    },
    {
      label: "Appointments closed",
      value: 48,
      delta_pct: -1.4,
      delta_label: "vs prior 7d",
      subtitle: "Sold on the showroom floor",
    },
  ],
  funnel: {
    stages: [
      { label: "Appointments set", count: 96 },
      { label: "Showed", count: 71 },
      { label: "Closed", count: 48 },
    ],
    set_to_show_pct: 74,
    show_to_close_pct: 68,
  },
  after_hours: {
    total_calls: 64,
    outcomes: [
      { label: "Appointment set", count: 22 },
      { label: "Callback scheduled", count: 18 },
      { label: "Info provided", count: 16 },
      { label: "No connect", count: 8 },
    ],
  },
  hot_leads: [
    {
      lead_id: "lead_0042",
      display_id: "Customer #JD-4218",
      vehicle: "2025 Honda Civic LX",
      intent_summary: "Payment hesitation — saved after 6 touches",
      last_touch: "2026-05-13T16:42:00-07:00",
      channels: ["chat", "sms", "call"],
      score: "hot",
    },
    {
      lead_id: "lead_0078",
      display_id: "Customer #BR-9931",
      vehicle: "2024 Honda CR-V EX",
      intent_summary: "Test drive booked for Saturday",
      last_touch: "2026-05-13T11:08:00-07:00",
      channels: ["chat", "sms"],
      score: "hot",
    },
    {
      lead_id: "lead_0091",
      display_id: "Customer #MK-7714",
      vehicle: "2025 Honda Accord Sport",
      intent_summary: "Trade-in value clarification — follow-up tomorrow",
      last_touch: "2026-05-12T19:21:00-07:00",
      channels: ["call", "sms"],
      score: "warm",
    },
    {
      lead_id: "lead_0103",
      display_id: "Customer #SC-2255",
      vehicle: "2024 Honda Pilot Touring",
      intent_summary: "Financing pre-qual sent — awaiting reply",
      last_touch: "2026-05-12T14:55:00-07:00",
      channels: ["sms", "email"],
      score: "warm",
    },
    {
      lead_id: "lead_0119",
      display_id: "Customer #LP-3340",
      vehicle: "2025 Honda HR-V Sport",
      intent_summary: "After-hours inquiry — callback set",
      last_touch: "2026-05-11T21:14:00-07:00",
      channels: ["call"],
      score: "warm",
    },
  ],
};

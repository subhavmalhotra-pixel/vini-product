import type { Dealer, Recipient } from "./schema";

export const HONDA_DTLA: Dealer = {
  id: "rt_honda_dtla",
  name: "Honda of Downtown LA",
  rooftop_count: 1,
  timezone: "America/Los_Angeles",
  business_hours: { start: "09:00", end: "19:00" },
  go_live_date: "2025-11-12",
  avg_appointment_value: 850,
};

export const TOYOTA_TAMPA: Dealer = {
  id: "rt_toyota_tampa",
  name: "Toyota of Tampa Bay",
  rooftop_count: 1,
  timezone: "America/New_York",
  business_hours: { start: "08:30", end: "20:00" },
  go_live_date: "2025-08-04",
};

export const ANDERSON_AUTO_GROUP: Dealer = {
  id: "rt_anderson_group_main",
  name: "Anderson Auto Group — Flagship",
  rooftop_count: 6,
  timezone: "America/Chicago",
  business_hours: { start: "09:00", end: "19:00" },
  go_live_date: "2024-12-01",
  avg_appointment_value: 920,
  group_id: "grp_anderson",
};

export const NEW_ROOFTOP_DAY_3: Dealer = {
  id: "rt_kia_phoenix",
  name: "Kia of North Phoenix",
  rooftop_count: 1,
  timezone: "America/Phoenix",
  business_hours: { start: "09:00", end: "19:00" },
  go_live_date: "2026-05-11", // 3 days before reporting date 2026-05-14
};

export const SILENT_DAY_ROOFTOP: Dealer = {
  id: "rt_used_cars_omaha",
  name: "Midwest Used Cars Omaha",
  rooftop_count: 1,
  timezone: "America/Chicago",
  business_hours: { start: "09:00", end: "18:00" },
  go_live_date: "2025-03-15",
};

// =========================================================================
// RECIPIENTS — role-based default subscription mapping per PRD §12
// =========================================================================

export const RECIPIENTS_HONDA_DTLA: Recipient[] = [
  {
    email: "matt@hondadtla.example",
    display_name: "Matt Sandoval",
    role: "general_manager",
    rooftop_ids: ["rt_honda_dtla"],
    subscriptions: [
      { email_type: "daily", agent_filter: "all", rooftop_filter: ["rt_honda_dtla"] },
      { email_type: "weekly", agent_filter: "all", rooftop_filter: ["rt_honda_dtla"] },
      { email_type: "monthly", agent_filter: "all", rooftop_filter: ["rt_honda_dtla"] },
      { email_type: "eoc", agent_filter: "all", rooftop_filter: ["rt_honda_dtla"] },
    ],
  },
  {
    email: "sales-mgr@hondadtla.example",
    display_name: "Priya Iyer",
    role: "sales_manager",
    rooftop_ids: ["rt_honda_dtla"],
    subscriptions: [
      { email_type: "daily", agent_filter: ["sales_ib", "sales_ob"], rooftop_filter: ["rt_honda_dtla"] },
      { email_type: "weekly", agent_filter: ["sales_ib", "sales_ob"], rooftop_filter: ["rt_honda_dtla"] },
    ],
  },
  {
    email: "bdc@hondadtla.example",
    display_name: "Jordan Reyes",
    role: "bdc_manager",
    rooftop_ids: ["rt_honda_dtla"],
    subscriptions: [
      { email_type: "daily", agent_filter: "all", rooftop_filter: ["rt_honda_dtla"] },
      { email_type: "weekly", agent_filter: "all", rooftop_filter: ["rt_honda_dtla"] },
      { email_type: "eoc", agent_filter: ["sales_ob", "service_ob"], rooftop_filter: ["rt_honda_dtla"] },
    ],
  },
];

export const ALL_DEALERS = [
  HONDA_DTLA,
  TOYOTA_TAMPA,
  ANDERSON_AUTO_GROUP,
  NEW_ROOFTOP_DAY_3,
  SILENT_DAY_ROOFTOP,
];

/**
 * Mock log of sent emails — drives the Logs page in Phase 2.
 */
export type EmailLogStatus = "delivered" | "opened" | "clicked" | "bounced" | "queued";

export type EmailLog = {
  id: string;
  email_type: "daily" | "weekly" | "monthly" | "eoc";
  recipient_email: string;
  recipient_name: string;
  subject: string;
  sent_at_iso: string;
  status: EmailLogStatus;
  open_count?: number;
  click_count?: number;
  source: "scheduled" | "manual_send" | "resend";
  initiated_by?: string; // for manual sends
  scenario_id_for_preview: string; // links to a daily/weekly/etc scenario
};

const HONDA_GM = { email: "matt@hondadtla.example", name: "Matt Sandoval" };
const HONDA_SALES = { email: "sales-mgr@hondadtla.example", name: "Priya Iyer" };
const HONDA_BDC = { email: "bdc@hondadtla.example", name: "Jordan Reyes" };

export const EMAIL_LOGS: EmailLog[] = [
  {
    id: "log-2026-05-14-daily-matt",
    email_type: "daily",
    recipient_email: HONDA_GM.email,
    recipient_name: HONDA_GM.name,
    subject: "Honda of Downtown LA · Daily digest · May 13",
    sent_at_iso: "2026-05-15T14:00:00Z",
    status: "opened",
    open_count: 2,
    click_count: 1,
    source: "scheduled",
    scenario_id_for_preview: "daily-normal-sales",
  },
  {
    id: "log-2026-05-14-daily-priya",
    email_type: "daily",
    recipient_email: HONDA_SALES.email,
    recipient_name: HONDA_SALES.name,
    subject: "Honda of Downtown LA · Sales daily digest · May 13",
    sent_at_iso: "2026-05-15T14:00:01Z",
    status: "clicked",
    open_count: 3,
    click_count: 2,
    source: "scheduled",
    scenario_id_for_preview: "daily-normal-sales",
  },
  {
    id: "log-2026-05-14-daily-jordan",
    email_type: "daily",
    recipient_email: HONDA_BDC.email,
    recipient_name: HONDA_BDC.name,
    subject: "Honda of Downtown LA · Daily digest (BDC) · May 13",
    sent_at_iso: "2026-05-15T14:00:02Z",
    status: "delivered",
    open_count: 0,
    click_count: 0,
    source: "scheduled",
    scenario_id_for_preview: "daily-normal-sales",
  },
  {
    id: "log-2026-05-12-weekly-matt",
    email_type: "weekly",
    recipient_email: HONDA_GM.email,
    recipient_name: HONDA_GM.name,
    subject: "Honda of Downtown LA · Weekly performance · May 5–11",
    sent_at_iso: "2026-05-12T14:00:00Z",
    status: "clicked",
    open_count: 5,
    click_count: 3,
    source: "scheduled",
    scenario_id_for_preview: "weekly-sales-ib-only",
  },
  {
    id: "log-2026-05-12-weekly-priya",
    email_type: "weekly",
    recipient_email: HONDA_SALES.email,
    recipient_name: HONDA_SALES.name,
    subject: "Honda of Downtown LA · Weekly performance (Sales) · May 5–11",
    sent_at_iso: "2026-05-12T14:00:02Z",
    status: "opened",
    open_count: 1,
    click_count: 0,
    source: "scheduled",
    scenario_id_for_preview: "weekly-sales-ib-only",
  },
  {
    id: "log-2026-05-11-manual-resend-matt",
    email_type: "weekly",
    recipient_email: HONDA_GM.email,
    recipient_name: HONDA_GM.name,
    subject: "Re-sent · Honda of Downtown LA · Weekly performance · Apr 28–May 4",
    sent_at_iso: "2026-05-11T18:32:00Z",
    status: "opened",
    open_count: 1,
    click_count: 1,
    source: "manual_send",
    initiated_by: "admin@spyne.ai",
    scenario_id_for_preview: "weekly-sales-ib-only",
  },
  {
    id: "log-2026-05-01-monthly-matt",
    email_type: "monthly",
    recipient_email: HONDA_GM.email,
    recipient_name: HONDA_GM.name,
    subject: "Honda of Downtown LA · April performance summary",
    sent_at_iso: "2026-05-01T14:00:00Z",
    status: "clicked",
    open_count: 4,
    click_count: 2,
    source: "scheduled",
    scenario_id_for_preview: "monthly-normal",
  },
  {
    id: "log-2026-04-29-eoc-jordan",
    email_type: "eoc",
    recipient_email: HONDA_BDC.email,
    recipient_name: HONDA_BDC.name,
    subject: "Campaign complete · Spring Inventory Clearance",
    sent_at_iso: "2026-04-29T16:14:00Z",
    status: "bounced",
    source: "scheduled",
    scenario_id_for_preview: "eoc-normal",
  },
  {
    id: "log-2026-04-29-eoc-priya",
    email_type: "eoc",
    recipient_email: HONDA_SALES.email,
    recipient_name: HONDA_SALES.name,
    subject: "Campaign complete · Spring Inventory Clearance",
    sent_at_iso: "2026-04-29T16:14:01Z",
    status: "clicked",
    open_count: 2,
    click_count: 1,
    source: "scheduled",
    scenario_id_for_preview: "eoc-normal",
  },
];

export function getLogById(id: string): EmailLog | undefined {
  return EMAIL_LOGS.find((l) => l.id === id);
}

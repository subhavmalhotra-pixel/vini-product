import type { DailyDigestData } from "@test-data";
import type { DeptKind, DigestMetrics, SendStatus } from "./mockData";

/**
 * Maps a stored roi_digest_runs.metrics payload into the full DailyDigestData
 * shape the real DailyDigest email template (src/emails/DailyDigest.tsx) renders.
 * Fields the backfill didn't store default to 0 / empty so the template still
 * renders completely.
 */
function num(m: DigestMetrics, k: string): number {
  const v = m[k];
  const x = typeof v === "number" ? v : parseInt(String(v ?? 0), 10);
  return Number.isFinite(x) ? x : 0;
}

export function metricsToDailyDigest(
  metrics: DigestMetrics,
  opts: { rooftopName: string; dept?: DeptKind; teamId?: string; status?: SendStatus },
): DailyDigestData {
  const dept = opts.dept ?? "sales";
  const agent = dept === "service" ? "service_ib" : "sales_ib";

  const conv = num(metrics, "conversationsHandled");
  const call = num(metrics, "conversationsCall");
  const sms = num(metrics, "conversationsSms");
  const chat = num(metrics, "conversationsChat");
  const appts = num(metrics, "appointmentsYesterday");
  const apptsMtd = num(metrics, "appointmentsYesterdayMTD") || appts;
  const leads = num(metrics, "inboundUniqueLeads");
  const leadsMtd = num(metrics, "inboundUniqueLeadsMTD") || leads;
  const reached = num(metrics, "outboundUniqueReached");
  const actions = num(metrics, "actionItemsTotal");
  const reportDate = String(metrics.reportDate ?? "");

  return {
    scenario_id: "live",
    scenario_name: opts.rooftopName,
    scenario_notes: "",
    email_type: "daily",
    send_decision: opts.status === "sent" ? "send" : "suppress",
    dealer: {
      id: opts.teamId ?? "",
      name: opts.rooftopName,
      rooftop_count: 1,
      timezone: "America/New_York",
      business_hours: { start: "09:00", end: "18:00" },
      go_live_date: "2025-09-01",
    },
    agents_in_scope: [agent],
    reporting_date: reportDate,
    conversations_total: conv,
    channel_split: { call, sms, chat },
    hero: {
      yesterday_appts: { yesterday: appts },
      mtd_appts: { mtd: apptsMtd },
      bdc_hours_equivalent: 0,
    },
    action_required: actions > 0 ? [{ type: "callback_request", count: actions, deep_link: "#" }] : [],
    inbound: {
      kpi_cards: [
        { label: "Appointments", primary_value: appts, subtitle: `${apptsMtd} MTD` },
        { label: "Unique leads", primary_value: leads, subtitle: `${leadsMtd} MTD` },
        { label: "Conversations", primary_value: conv, subtitle: `${call} call · ${sms} sms · ${chat} chat` },
      ],
      activity: {
        unique_leads: { yesterday: leads, mtd: leadsMtd },
        channel_split: { call, sms, chat },
        appointments_set: { yesterday: appts, mtd: apptsMtd },
        after_hours: { leads_engaged: 0, appts_booked: 0 },
        warm_transfers: { yesterday: 0, mtd: 0 },
      },
    },
    outbound:
      dept === "sales"
        ? {
            show_block: reached > 0,
            unique_reached: { yesterday: reached },
            connect_rate: { unavailable: true },
            appts_set: { yesterday: 0 },
            active_campaigns: [],
          }
        : undefined,
    footer: {
      bdc_hours_equivalent: 0,
      reporting_period: reportDate,
      next_send: "Tomorrow 7:00 AM",
    },
  };
}

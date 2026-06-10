// renderDigestEmail(metrics, opts) → EMAIL-SAFE HTML of the Daily Digest.
//
// IMPORTANT: email clients (Gmail) don't support flexbox, so the React component
// (LegacyDailyDigest, used for the on-screen tracker preview) renders broken in an
// inbox. For the actual EMAIL we render the table-based, inline-styled equivalent
// (notification-service/services/html-render.service.js → renderDigestHtml) — same
// "Daily Digest" design, but table layout that renders correctly everywhere.
// Real console.spyne.ai deep links + the dealer-local window are injected here.
const path = require("node:path");
const { renderDigestHtml } = require(
  path.resolve(__dirname, "../../../../vini-roi-daily-report/notification-service/services/html-render.service.js"),
);

const n = (v) => { const x = typeof v === "number" ? v : parseInt(v, 10); return Number.isFinite(x) ? x : 0; };

// UTC instant of local midnight (y-m-day) in tz
function localToUTC(y, m, day, tz) {
  const approx = new Date(Date.UTC(y, m - 1, day, 0, 0, 0));
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric", hour12: false,
  }).formatToParts(approx);
  const g = (t) => parseInt(p.find((x) => x.type === t)?.value ?? "0");
  const asUTC = new Date(Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") === 24 ? 0 : g("hour"), g("minute"), g("second")));
  return new Date(approx.getTime() + (approx.getTime() - asUTC.getTime()));
}
function windowFor(reportDate, tz) {
  const [y, m, d] = String(reportDate).split("-").map(Number);
  const start = localToUTC(y, m, d, tz);
  const end = new Date(localToUTC(y, m, d + 1, tz).getTime() - 1);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}
function fmtDate(reportDate) {
  const [y, m, d] = String(reportDate).split("-").map(Number);
  if (!y || !m || !d) return String(reportDate ?? "");
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}
function links(ent, team, dept, reportDate, tz) {
  const { startISO, endISO } = windowFor(reportDate, tz || "America/New_York");
  const enc = encodeURIComponent;
  const base = "https://console.spyne.ai/converse-ai";
  return {
    appointments: `${base}/appointments?enterprise_id=${ent}&team_id=${team}&all_createdAtStart=${enc(startISO)}&all_createdAtEnd=${enc(endISO)}&all_createdAtDateValue=yesterday&page=1&serviceType=${dept}&tab=all`,
    conversations: `${base}/conversations?enterprise_id=${ent}&team_id=${team}`,
    actionItems: `${base}/action-items?enterprise_id=${ent}&team_id=${team}&serviceType=${dept}&createdAtStart=${enc(startISO)}&createdAtEnd=${enc(endISO)}&page=1`,
  };
}

/**
 * @param {object} metrics roi_digest_runs.metrics (… reportDate ISO yyyy-mm-dd)
 * @param {{rooftopName, dept, teamId, enterpriseId, reportDate, timezone}} opts
 */
function renderDigestEmail(metrics, opts = {}) {
  const m = metrics || {};
  const dept = opts.dept === "service" ? "service" : "sales";
  const reportDate = (m.reportDate) || opts.reportDate;
  const L = links(opts.enterpriseId ?? "", opts.teamId ?? "", dept, reportDate, opts.timezone);
  const appts = n(m.appointmentsYesterday), leads = n(m.inboundUniqueLeads), action = n(m.actionItemsTotal);
  const call = n(m.conversationsCall), sms = n(m.conversationsSms), chat = n(m.conversationsChat);
  const conv = n(m.conversationsHandled) || (call + sms + chat);
  // MTD = month-to-date cumulative (stored on the row); fall back to the daily value
  const apptsMtd = n(m.appointmentsYesterdayMTD) || appts;
  const leadsMtd = n(m.inboundUniqueLeadsMTD) || leads;

  const t = {
    dealershipName: opts.rooftopName || opts.teamId,
    reportDate: fmtDate(reportDate),
    appointmentsYesterday: appts, appointmentsYesterdayMTD: apptsMtd,
    conversationsHandled: conv, conversationsCall: call, conversationsSms: sms, conversationsChat: chat,
    channelCall: call, channelSms: sms, channelChat: chat,
    viewAppointmentsUrl: L.appointments, openInboxUrl: L.conversations,
    actionRequiredItems: action > 0 ? [{ count: action, label: "Callback requests" }] : [],
    reviewActionItemsUrl: L.actionItems,
    inboundUniqueLeads: leads, inboundUniqueLeadsMTD: leadsMtd,
    transferRate: "0%", transferRateMTD: "0%", avgResponseTime: "—", avgResponseTimeMTD: "—",
    afterHoursLeadsEngaged: 0, afterHoursApptsBooked: 0, warmTransfers: 0, warmTransfersMTD: 0,
    outboundUniqueReached: 0, outboundUniqueReachedMTD: 0, outboundConnectRate: "0%", outboundConnectRateMTD: "0%",
    outboundAppointmentsSet: 0, outboundAppointmentsSetMTD: 0, campaigns: [],
    reportingPeriod: String(reportDate ?? ""), nextReport: "Tomorrow 7:00 AM",
  };
  return renderDigestHtml(t, { serviceType: dept });
}

module.exports = { renderDigestEmail };

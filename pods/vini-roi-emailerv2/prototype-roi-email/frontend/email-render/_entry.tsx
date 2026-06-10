// Render entry: renders the ACTUAL LegacyDailyDigest component to static HTML and
// rewrites its placeholder CTA hrefs into real console.spyne.ai deep links built from
// the rooftop's enterprise_id / team_id / serviceType + the dealer-local "yesterday"
// window. Bundled by build.mjs.
import { renderToStaticMarkup } from "react-dom/server";
import { DailyDigest } from "../src/emails/legacy/DailyDigest";
import { metricsToDailyDigest } from "../src/tracker/digestData";
import type { DeptKind, DigestMetrics, SendStatus } from "../src/tracker/mockData";

type Opts = {
  rooftopName: string;
  dept?: DeptKind;
  teamId?: string;
  enterpriseId?: string;
  reportDate?: string; // ISO yyyy-mm-dd (the digest's "yesterday")
  timezone?: string; // dealer tz, for the createdAt window
  status?: SendStatus;
};

// UTC instant of local midnight (y-m-day) in tz — same trick as the Edge function.
function localToUTC(y: number, m: number, day: number, tz: string): Date {
  const approx = new Date(Date.UTC(y, m - 1, day, 0, 0, 0));
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric", hour12: false,
  }).formatToParts(approx);
  const g = (t: string) => parseInt(p.find((x) => x.type === t)?.value ?? "0");
  const asUTC = new Date(Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") === 24 ? 0 : g("hour"), g("minute"), g("second")));
  return new Date(approx.getTime() + (approx.getTime() - asUTC.getTime()));
}

function windowFor(reportDate: string, tz: string): { startISO: string; endISO: string } {
  const [y, m, d] = reportDate.split("-").map(Number);
  const start = localToUTC(y, m, d, tz);
  const end = new Date(localToUTC(y, m, d + 1, tz).getTime() - 1); // local 23:59:59.999
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

function consoleLinks(o: Opts) {
  const ent = o.enterpriseId ?? "";
  const team = o.teamId ?? "";
  const svc = o.dept ?? "sales";
  const tz = o.timezone || "America/New_York";
  const { startISO, endISO } = windowFor(o.reportDate || "1970-01-01", tz);
  const enc = encodeURIComponent;
  const base = "https://console.spyne.ai/converse-ai";
  return {
    appointments: `${base}/appointments?enterprise_id=${ent}&team_id=${team}&all_createdAtStart=${enc(startISO)}&all_createdAtEnd=${enc(endISO)}&all_createdAtDateValue=yesterday&page=1&serviceType=${svc}&tab=all`,
    conversations: `${base}/conversations?enterprise_id=${ent}&team_id=${team}`,
    actionItems: `${base}/action-items?enterprise_id=${ent}&team_id=${team}&serviceType=${svc}&createdAtStart=${enc(startISO)}&createdAtEnd=${enc(endISO)}&page=1`,
  };
}

export function renderBody(metrics: Record<string, number | string>, opts: Opts): string {
  const data = metricsToDailyDigest(metrics as unknown as DigestMetrics, opts);
  let html = renderToStaticMarkup(<DailyDigest data={data} />);
  const L = consoleLinks(opts);
  // rewrite the component's placeholder hrefs → real deep links (specific first)
  html = html
    .split("/console/appointments?date=today").join(L.appointments)
    .split("/console/inbox?view=action_required").join(L.actionItems)
    .split("/console/inbox").join(L.conversations);
  return html;
}

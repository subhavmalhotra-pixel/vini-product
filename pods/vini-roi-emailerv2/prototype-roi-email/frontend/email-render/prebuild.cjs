// PREBUILD job (Node): render the ACTUAL component HTML for every queued rooftop
// and store it on roi_digest_runs.rendered_html, so the Deno cron4 just sends it.
//
//   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node email-render/prebuild.cjs [teamId]
//
// Flow position:  cron1 → cron2 → cron3 (sets status='queued' + metrics, no HTML)
//                 → [THIS job renders rendered_html] → cron4 (sends rendered_html).
// Run it on a schedule (cron / GitHub Action) a few minutes after the hourly cron1,
// or on demand for one rooftop:  node email-render/prebuild.cjs <teamId>
const { createClient } = require("@supabase/supabase-js");
const { renderDigestEmail } = require("./index.cjs");

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const onlyTeam = process.argv[2]; // optional: render just one rooftop

const sb = createClient(URL, KEY, { auth: { persistSession: false } });

(async () => {
  // queued rows that have metrics but no rendered HTML yet
  let q = sb.from("roi_digest_runs")
    .select("id,team_id,enterprise_id,department,metrics,local_date,dealer_timezone")
    .eq("status", "queued").is("rendered_html", null);
  if (onlyTeam) q = q.eq("team_id", onlyTeam);
  const { data: rows, error } = await q;
  if (error) throw error;

  const { data: cfg } = await sb.from("roi_rooftop_config").select("team_id,rooftop_name");
  const nameOf = new Map((cfg ?? []).map((c) => [c.team_id, c.rooftop_name]));

  let n = 0;
  for (const r of rows ?? []) {
    if (!r.metrics) continue;
    const html = renderDigestEmail(r.metrics, {
      rooftopName: nameOf.get(r.team_id) || r.team_id,
      dept: r.department,
      teamId: r.team_id,
      enterpriseId: r.enterprise_id,
      reportDate: (r.metrics && r.metrics.reportDate) || r.local_date,
      timezone: r.dealer_timezone,
      status: "sent",
    });
    const { error: e2 } = await sb.from("roi_digest_runs").update({ rendered_html: html, send_path: "raw_html" }).eq("id", r.id);
    if (e2) { console.error("update failed", r.id, e2.message); continue; }
    n++;
    console.log(`rendered ${r.team_id}/${r.department} → ${html.length} bytes`);
  }
  console.log(`prebuilt ${n} rooftop(s).`);
})().catch((e) => { console.error(e); process.exit(1); });

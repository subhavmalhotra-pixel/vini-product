// Local send server — makes the tracker's "Send now" button actually email, now.
// Renders the ACTUAL LegacyDailyDigest component and POSTs it to mail.spyne.ai.
// The mail token stays here (server-side), never in the browser.
//
//   cd frontend && node email-render/build.mjs        # once
//   MAIL_TOKEN='<bearer token>' node email-render/server.cjs   # run it (port 8787)
//
// The tracker (VITE_SEND_SERVER_URL, default http://localhost:8787) POSTs /send-now.
const http = require("node:http");
const { renderDigestEmail } = require("./index.cjs");

const PORT = Number(process.env.SEND_SERVER_PORT || 8787);
const MAIL_URL = "https://mail.spyne.ai/api/v1/send-template-email";
const TEMPLATE = "email-control-tower-report";
const MAIL_TOKEN = process.env.MAIL_TOKEN || "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const send = (res, code, obj) => {
  res.writeHead(code, { "Content-Type": "application/json", ...CORS });
  res.end(JSON.stringify(obj));
};

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); res.end(); return; }
  if (req.method === "GET" && req.url === "/health") { return send(res, 200, { ok: true, hasToken: !!MAIL_TOKEN }); }
  if (req.method !== "POST" || !req.url.startsWith("/send-now")) { return send(res, 404, { ok: false, error: "POST /send-now" }); }

  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", async () => {
    try {
      const p = JSON.parse(raw || "{}");
      const recipients = (p.recipients || []).map((r) => (typeof r === "string" ? r : r.email)).filter(Boolean);
      if (!recipients.length) return send(res, 400, { ok: false, error: "no recipients" });
      if (!MAIL_TOKEN) return send(res, 401, { ok: false, error: "server missing MAIL_TOKEN" });
      if (!p.metrics) return send(res, 400, { ok: false, error: "no metrics" });

      const dept = p.dept === "service" ? "service" : "sales";
      const html = renderDigestEmail(p.metrics, {
        rooftopName: p.rooftopName || p.teamId,
        dept,
        teamId: p.teamId,
        enterpriseId: p.enterpriseId,
        reportDate: (p.metrics && p.metrics.reportDate) || p.reportDate,
        timezone: p.timezone,
        status: "sent",
      });
      const subject = p.subject || `${dept === "service" ? "Service" : "Sales"} Daily Digest — ${p.rooftopName || p.teamId}`;

      const mr = await fetch(MAIL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${MAIL_TOKEN}` },
        body: JSON.stringify({ to: recipients.join(","), subject, template: TEMPLATE, templateData: { HTMLdata: html } }),
      });
      const text = await mr.text();
      if (!mr.ok) return send(res, 502, { ok: false, status: mr.status, error: text.slice(0, 200) });
      console.log(`sent ${dept} → ${recipients.join(",")} (${html.length}b) :: ${mr.status}`);
      return send(res, 200, { ok: true, status: mr.status, to: recipients, bytes: html.length });
    } catch (e) {
      return send(res, 500, { ok: false, error: String(e).slice(0, 300) });
    }
  });
});

server.listen(PORT, () => {
  console.log(`[send-server] http://localhost:${PORT}  (MAIL_TOKEN ${MAIL_TOKEN ? "set" : "MISSING"})`);
});

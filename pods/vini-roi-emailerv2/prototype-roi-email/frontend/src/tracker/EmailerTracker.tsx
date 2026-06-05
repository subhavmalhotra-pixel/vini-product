import { useMemo, useState } from "react";
import {
  AGENT_LABEL,
  NOT_SENT_REASON_CTA,
  NOT_SENT_REASON_LABEL,
  ROOFTOPS,
  TRACKER_META,
  agentMatrix,
  computeFunnel,
  computeSummary,
  reasonBreakdown,
  type Cadence,
  type NotSentReason,
  type RooftopRow,
  type SendCell,
} from "./mockData";
import { RooftopCellDrawer } from "./RooftopCellDrawer";

export function EmailerTracker() {
  const [cadence, setCadence] = useState<Cadence>("daily");
  const [search, setSearch] = useState("");
  const [csmFilter, setCsmFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState<"all" | "sales" | "service">("all");
  const [reasonFilter, setReasonFilter] = useState<NotSentReason | "all">("all");
  const [sentNow, setSentNow] = useState<Record<string, true>>({});
  const [activeCell, setActiveCell] = useState<{ rooftop: RooftopRow; cell: SendCell } | null>(null);

  const cellKey = (r: RooftopRow, c: SendCell) => `${r.rooftop_id}::${c.cadence}::${c.date}`;
  const colCount = cadence === "daily" ? 10 : cadence === "weekly" ? 8 : 6;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROOFTOPS.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.csm.toLowerCase().includes(q)) return false;
      if (csmFilter !== "all" && r.csm !== csmFilter) return false;
      if (deptFilter !== "all" && !r.departments.some((d) => d.kind === deptFilter && d.live)) return false;
      if (reasonFilter !== "all" && r.current_block !== reasonFilter) return false;
      return true;
    });
  }, [search, csmFilter, deptFilter, reasonFilter]);

  const summary = useMemo(() => computeSummary(ROOFTOPS, cadence), [cadence]);
  const funnel = useMemo(() => computeFunnel(ROOFTOPS, cadence), [cadence]);
  const breakdown = useMemo(() => reasonBreakdown(ROOFTOPS), []);

  return (
    <div className="flex h-full flex-col bg-surface-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border-subtle bg-surface-card px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-text-primary">
              Vini Emailer · Rooftop Tracker
            </h1>
            <p className="mt-0.5 text-[12px] text-text-secondary">
              Agents live · departments live · digest send-status across{" "}
              <span className="font-semibold text-text-primary">{TRACKER_META.totalRooftops}</span>{" "}
              rooftops.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            <span className="tabular">{TRACKER_META.source}</span>
            <span>·</span>
            <span className="tabular">synced {TRACKER_META.lastSyncedMinutesAgo} min ago</span>
            <button
              type="button"
              className="ml-1 rounded-md border border-border-subtle bg-surface-card px-2.5 py-1 text-[11px] font-semibold text-text-primary hover:bg-surface-subtle"
            >
              ⟳ Refresh
            </button>
          </div>
        </div>
      </header>

      {/* 1 · Summary cards */}
      <div className="flex-shrink-0 border-b border-border-subtle bg-surface-background px-6 py-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Live agents */}
          <SummaryCard
            label="Live agents"
            value={summary.liveAgentsTotal.toString()}
            sub={`across ${summary.rooftopsWithAgents} rooftops`}
          >
            <div className="mt-3 grid grid-cols-2 gap-2">
              <AgentCount label="Sales IB" n={summary.liveAgents.sales_ib} tone="info" />
              <AgentCount label="Sales OB" n={summary.liveAgents.sales_ob} tone="info" />
              <AgentCount label="Service IB" n={summary.liveAgents.service_ib} tone="positive" />
              <AgentCount label="Service OB" n={summary.liveAgents.service_ob} tone="positive" />
            </div>
          </SummaryCard>

          {/* Live departments */}
          <SummaryCard
            label="Live departments"
            value={summary.liveDepartments.total.toString()}
            sub="sales + service across rooftops"
          >
            <div className="mt-3 flex gap-2">
              <DeptCount label="Sales" n={summary.liveDepartments.sales} tone="info" />
              <DeptCount label="Service" n={summary.liveDepartments.service} tone="positive" />
            </div>
          </SummaryCard>

          {/* Email status */}
          <SummaryCard
            label="Email status · today"
            value={`${summary.emailStatus.sentRatePct}%`}
            sub="sent rate"
            valueTone={summary.emailStatus.sentRatePct >= 50 ? "positive" : "negative"}
          >
            <div className="mt-3 flex gap-2">
              <DeptCount label="Sent" n={summary.emailStatus.sent} tone="positive" />
              <DeptCount label="Not sent" n={summary.emailStatus.notSent} tone="negative" />
            </div>
          </SummaryCard>
        </div>

        {/* 2 · Funnel */}
        <div className="mt-3 rounded-lg border border-border-subtle bg-surface-card px-5 py-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Send funnel · {cadence}
          </div>
          <div className="mt-3 flex flex-wrap items-stretch gap-2">
            {funnel.map((stage, i) => (
              <div key={stage.label} className="flex items-stretch gap-2">
                <div className="rounded-md border border-border-subtle bg-surface-background px-4 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    {stage.label}
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="text-[22px] font-bold tabular leading-none text-text-primary">
                      {stage.value}
                    </span>
                    {stage.sub ? (
                      <span className="text-[11px] font-semibold text-positive">{stage.sub}</span>
                    ) : null}
                  </div>
                </div>
                {i < funnel.length - 1 ? (
                  <div className="flex items-center text-text-muted">→</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSM action board */}
      {breakdown.length > 0 ? (
        <div className="flex-shrink-0 border-b border-border-subtle bg-warning-soft/40 px-6 py-2.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warning">
              Action board · {breakdown.reduce((s, b) => s + b.count, 0)} rooftops blocked
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {breakdown.map((b) => {
                const active = reasonFilter === b.reason;
                return (
                  <button
                    key={b.reason}
                    type="button"
                    onClick={() => setReasonFilter(active ? "all" : b.reason)}
                    title={b.rooftops.join(", ")}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      active
                        ? "border-warning bg-warning text-white"
                        : "border-warning/40 bg-surface-card text-warning hover:bg-warning-soft"
                    }`}
                  >
                    <span className="tabular">{b.count}</span>
                    {NOT_SENT_REASON_LABEL[b.reason]}
                  </button>
                );
              })}
              {reasonFilter !== "all" ? (
                <button
                  type="button"
                  onClick={() => setReasonFilter("all")}
                  className="text-[11px] font-semibold text-text-secondary hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Filter strip */}
      <div className="flex-shrink-0 border-b border-border-subtle bg-surface-card px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooftop or CSM…"
            className="w-[240px] rounded-md border border-border-subtle bg-surface-card px-3 py-1.5 text-[12px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
          />
          <Select
            value={csmFilter}
            onChange={setCsmFilter}
            options={[{ value: "all", label: "All CSMs" }, ...TRACKER_META.csms.map((c) => ({ value: c, label: c }))]}
          />
          <Select
            value={deptFilter}
            onChange={(v) => setDeptFilter(v as "all" | "sales" | "service")}
            options={[
              { value: "all", label: "All departments" },
              { value: "sales", label: "Sales live" },
              { value: "service", label: "Service live" },
            ]}
          />
          <div className="inline-flex overflow-hidden rounded-md border border-border-subtle">
            {(["daily", "weekly", "monthly"] as Cadence[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCadence(c)}
                className={`px-3 py-1.5 text-[12px] font-semibold capitalize ${
                  cadence === c ? "bg-brand-primary text-white" : "bg-surface-card text-text-secondary hover:bg-surface-subtle"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCsmFilter("all");
              setDeptFilter("all");
              setReasonFilter("all");
            }}
            className="ml-1 text-[11px] font-semibold text-brand-primary hover:underline"
          >
            Clear filters
          </button>
          <div className="ml-auto text-[11px] text-text-muted tabular">
            Showing {filtered.length} of {TRACKER_META.totalRooftops} rooftops
          </div>
        </div>
      </div>

      {/* 3 · Table */}
      <div className="flex-1 overflow-auto bg-surface-background">
        <table className="w-full border-separate" style={{ borderSpacing: 0 }}>
          <thead className="sticky top-0 z-20">
            <tr>
              <Th sticky left={0} minW={210}>Rooftop</Th>
              <Th minW={132}>Agents live</Th>
              <Th minW={120}>Departments</Th>
              {Array.from({ length: colCount }).map((_, i) => (
                <Th key={i} minW={88}>{formatColLabel(cadence, i)}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => {
              const cells = cadence === "daily" ? r.daily : cadence === "weekly" ? r.weekly : r.monthly;
              const rowBg = idx % 2 === 0 ? "bg-surface-card" : "bg-surface-background";
              return (
                <tr key={r.rooftop_id}>
                  <td className={`sticky left-0 z-10 border-b border-border-subtle ${rowBg} px-4 py-2.5`} style={{ minWidth: 210 }}>
                    <div className="text-[13px] font-semibold text-text-primary">{r.name}</div>
                    <div className="text-[10px] text-text-muted">
                      {r.csm}
                      {r.group ? ` · ${r.group}` : ""}
                    </div>
                  </td>
                  <td className="border-b border-border-subtle px-3 py-2.5">
                    <AgentMatrix agents={r.agents_live} />
                  </td>
                  <td className="border-b border-border-subtle px-3 py-2.5">
                    <DeptPills rooftop={r} />
                  </td>
                  {cells.slice(0, colCount).map((c) => (
                    <td key={c.date} className="border-b border-border-subtle px-2 py-2" style={{ minWidth: 88 }}>
                      <SendStatusCell
                        cell={c}
                        sentNow={!!sentNow[cellKey(r, c)]}
                        onOpen={() => setActiveCell({ rooftop: r, cell: c })}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-text-muted">No rooftops match the filters.</div>
        ) : null}
      </div>

      <RooftopCellDrawer
        rooftop={activeCell?.rooftop ?? null}
        cell={activeCell?.cell ?? null}
        onClose={() => setActiveCell(null)}
        onSend={(rid, date, cad) =>
          setSentNow((p) => ({ ...p, [`${rid}::${cad}::${date}`]: true }))
        }
      />
    </div>
  );
}

/* ============================================================
   Summary card
   ============================================================ */
function SummaryCard({
  label,
  value,
  sub,
  valueTone = "neutral",
  children,
}: {
  label: string;
  value: string;
  sub: string;
  valueTone?: "neutral" | "positive" | "negative";
  children?: React.ReactNode;
}) {
  const tone =
    valueTone === "positive" ? "text-positive" : valueTone === "negative" ? "text-negative" : "text-text-primary";
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-card px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={`text-[28px] font-bold tabular leading-none ${tone}`}>{value}</span>
        <span className="text-[11px] text-text-muted">{sub}</span>
      </div>
      {children}
    </div>
  );
}

function AgentCount({ label, n, tone }: { label: string; n: number; tone: "info" | "positive" }) {
  const dot = tone === "info" ? "bg-info" : "bg-positive";
  return (
    <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-background px-2.5 py-1.5">
      <span className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="tabular text-[13px] font-semibold text-text-primary">{n}</span>
    </div>
  );
}

function DeptCount({ label, n, tone }: { label: string; n: number; tone: "info" | "positive" | "negative" }) {
  const cls =
    tone === "info"
      ? "bg-info-soft text-info"
      : tone === "positive"
      ? "bg-positive/10 text-positive"
      : "bg-negative-soft text-negative";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-semibold ${cls}`}>
      <span className="tabular">{n}</span> {label}
    </span>
  );
}

/* ============================================================
   Agents-live 2×2 matrix
   ============================================================ */
function AgentMatrix({ agents }: { agents: import("./mockData").AgentType[] }) {
  const m = agentMatrix(agents);
  return (
    <div className="space-y-1">
      <MatrixRow label="S" ib={m.sales.ib} ob={m.sales.ob} tone="info" />
      <MatrixRow label="Sv" ib={m.service.ib} ob={m.service.ob} tone="positive" />
    </div>
  );
}

function MatrixRow({
  label,
  ib,
  ob,
  tone,
}: {
  label: string;
  ib: boolean;
  ob: boolean;
  tone: "info" | "positive";
}) {
  const on = tone === "info" ? "bg-info-soft text-info" : "bg-positive/10 text-positive";
  const off = "bg-surface-subtle text-text-muted";
  return (
    <div className="flex items-center gap-1">
      <span className="w-5 text-[10px] font-semibold uppercase text-text-muted">{label}</span>
      <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${ib ? on : off}`}>IB</span>
      <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${ob ? on : off}`}>OB</span>
    </div>
  );
}

/* ============================================================
   Departments-live pills
   ============================================================ */
function DeptPills({ rooftop }: { rooftop: RooftopRow }) {
  const has = (k: "sales" | "service") => rooftop.departments.some((d) => d.kind === k && d.live);
  const emailed = (k: "sales" | "service") =>
    rooftop.departments.some((d) => d.kind === k && d.recipients.some((r) => r.received));
  if (rooftop.departments.length === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold text-warning">
        Unclassified
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {(["sales", "service"] as const).map((k) => {
        const live = has(k);
        if (!live) return null;
        const sent = emailed(k);
        return (
          <span
            key={k}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
              sent ? "bg-positive/10 text-positive" : "bg-warning-soft text-warning"
            }`}
            title={sent ? `${k} · receiving emails` : `${k} · live but not emailed`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${sent ? "bg-positive" : "bg-warning"}`} />
            {k}
          </span>
        );
      })}
    </div>
  );
}

/* ============================================================
   Send-status cell
   ============================================================ */
function SendStatusCell({
  cell,
  sentNow,
  onOpen,
}: {
  cell: SendCell;
  sentNow: boolean;
  onOpen: () => void;
}) {
  if (sentNow) {
    return (
      <span className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-positive/10 px-2 py-1 text-[11px] font-semibold text-positive">
        ✓ Sent now
      </span>
    );
  }
  switch (cell.status) {
    case "sent":
      return (
        <button
          type="button"
          onClick={onOpen}
          title="Click to view what was sent + recipients"
          className="inline-flex w-full items-center justify-center rounded-md bg-positive/10 px-2 py-1 text-[11px] font-semibold text-positive hover:bg-positive/20"
        >
          Sent
        </button>
      );
    case "suppressed":
      return (
        <span
          className="inline-flex w-full items-center justify-center rounded-md bg-warning-soft px-2 py-1 text-[11px] font-semibold text-warning"
          title={cell.reason ? `Suppressed · ${NOT_SENT_REASON_LABEL[cell.reason]}` : "Suppressed"}
        >
          Suppr.
        </span>
      );
    case "not_sent": {
      const reason = cell.reason ?? "scheduler_skipped";
      const cta = NOT_SENT_REASON_CTA[reason];
      const styles =
        cta.tone === "warn"
          ? "border-warning/40 bg-warning-soft text-warning hover:bg-warning-soft/80"
          : "border-negative/40 bg-negative-soft text-negative hover:bg-negative-soft/80";
      return (
        <button
          type="button"
          onClick={onOpen}
          className={`inline-flex w-full items-center justify-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${styles}`}
          title={`Not sent · ${NOT_SENT_REASON_LABEL[reason]}`}
        >
          {cta.label}
        </button>
      );
    }
    case "not_subscribed":
      return (
        <span className="inline-flex w-full items-center justify-center rounded-md bg-surface-subtle px-2 py-1 text-[11px] text-text-muted">
          —
        </span>
      );
    case "scheduled":
      return (
        <span className="inline-flex w-full items-center justify-center rounded-md bg-info-soft px-2 py-1 text-[11px] font-semibold text-info">
          Scheduled
        </span>
      );
  }
}

/* ============================================================
   Small primitives
   ============================================================ */
function Th({
  children,
  sticky,
  left,
  minW,
}: {
  children: React.ReactNode;
  sticky?: boolean;
  left?: number;
  minW?: number;
}) {
  return (
    <th
      className={`border-b border-border-subtle bg-surface-card px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted ${
        sticky ? "sticky z-30" : ""
      }`}
      style={{ minWidth: minW, left: sticky ? left : undefined }}
    >
      {children}
    </th>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-border-subtle bg-surface-card px-2.5 py-1.5 text-[12px] font-medium text-text-secondary focus:border-brand-primary focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function formatColLabel(cadence: Cadence, i: number): string {
  const [y, m, d] = TRACKER_META.today.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (cadence === "daily") {
    date.setUTCDate(date.getUTCDate() - i);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  }
  if (cadence === "weekly") {
    date.setUTCDate(date.getUTCDate() - i * 7);
    return `Wk ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`;
  }
  date.setUTCMonth(date.getUTCMonth() - i);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

// silence unused-import lint for AGENT_LABEL (used in the drawer, re-exported via mockData)
void AGENT_LABEL;

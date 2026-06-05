import { useMemo, useState } from "react";
import {
  NOT_SENT_REASON_CTA,
  NOT_SENT_REASON_LABEL,
  ROOFTOPS,
  TRACKER_META,
  countStatus,
  reasonBreakdown,
  type Cadence,
  type NotSentReason,
  type RooftopRow,
  type SendCell,
  type SendStatus,
} from "./mockData";
import { RooftopCellDrawer } from "./RooftopCellDrawer";

/**
 * Vini Emailer · Rooftop Tracker
 *
 * Internal CSM-ops dashboard for the daily / weekly / monthly digest
 * pipeline. One row per rooftop, columns are dates within the chosen
 * cadence window. Each cell shows send status; failed / not-sent cells
 * are clickable to trigger a send.
 *
 * Mirrors the VIN-tracker rooftop-view layout.
 */
export function EmailerTracker() {
  const [cadence, setCadence] = useState<Cadence>("daily");
  const [search, setSearch] = useState("");
  const [csmFilter, setCsmFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<SendStatus | "all" | "any_issue">("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<NotSentReason | "all">("all");

  // Track click-to-send / click-to-retry state per (rooftop, date, cadence)
  // Local-only: in production this calls an API to enqueue the send.
  const [sentNow, setSentNow] = useState<Record<string, true>>({});
  // Drawer state · which cell was clicked
  const [activeCell, setActiveCell] = useState<{ rooftop: RooftopRow; cell: SendCell } | null>(null);

  const cellKey = (r: RooftopRow, c: SendCell) =>
    `${r.rooftop_id}::${c.cadence}::${c.date}`;

  const handleOpenCell = (r: RooftopRow, c: SendCell) => {
    setActiveCell({ rooftop: r, cell: c });
  };

  const handleSendFromDrawer = (
    rooftopId: string,
    date: string,
    cadence: SendCell["cadence"]
  ) => {
    const key = `${rooftopId}::${cadence}::${date}`;
    setSentNow((prev) => ({ ...prev, [key]: true }));
  };

  // Columns vary by cadence
  const colCount = cadence === "daily" ? 14 : cadence === "weekly" ? 8 : 6;

  // Apply filters
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROOFTOPS.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.csm.toLowerCase().includes(q))
        return false;
      if (csmFilter !== "all" && r.csm !== csmFilter) return false;
      if (groupFilter !== "all" && r.group !== groupFilter) return false;

      const cells =
        cadence === "daily" ? r.daily : cadence === "weekly" ? r.weekly : r.monthly;
      if (statusFilter === "any_issue") {
        const hasIssue = cells.slice(0, colCount).some(
          (c) => c.status === "failed" || c.status === "not_sent"
        );
        if (!hasIssue) return false;
      } else if (statusFilter !== "all") {
        const hasStatus = cells.slice(0, colCount).some((c) => c.status === statusFilter);
        if (!hasStatus) return false;
      }
      if (reasonFilter !== "all") {
        if (r.current_block !== reasonFilter) return false;
      }
      return true;
    });
  }, [search, csmFilter, statusFilter, groupFilter, reasonFilter, cadence, colCount]);

  const breakdown = useMemo(() => reasonBreakdown(ROOFTOPS), []);

  const statusCounts = useMemo(
    () => countStatus(filtered, cadence, colCount),
    [filtered, cadence, colCount]
  );

  return (
    <div className="flex h-full flex-col bg-surface-background">
      {/* Header strip */}
      <header className="flex-shrink-0 border-b border-border-subtle bg-surface-card px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-text-primary">
              Vini Emailer · Rooftop Tracker
            </h1>
            <p className="mt-1 text-[13px] leading-snug text-text-secondary">
              Daily / weekly / monthly digest send-status across{" "}
              <span className="font-semibold text-text-primary">
                {TRACKER_META.totalRooftops}
              </span>{" "}
              rooftops. Click a failed / not-sent cell to send now.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-positive" />
              <span className="tabular">{statusCounts.sent.toLocaleString()}</span> sent
            </span>
            <span>·</span>
            <span className="tabular">{TRACKER_META.source}</span>
            <span>·</span>
            <span className="tabular">synced {TRACKER_META.lastSyncedMinutesAgo} min ago</span>
            <button
              type="button"
              onClick={() => {}}
              className="ml-2 inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-card px-2.5 py-1 text-[11px] font-semibold text-text-primary hover:bg-surface-subtle"
            >
              ⟳ Refresh
            </button>
          </div>
        </div>

        {/* Cadence + status counts strip */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-md border border-border-subtle">
            {(["daily", "weekly", "monthly"] as Cadence[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCadence(c)}
                className={`px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors duration-150 ${
                  cadence === c
                    ? "bg-brand-primary text-white"
                    : "bg-surface-card text-text-secondary hover:bg-surface-subtle"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="ml-2 flex flex-wrap items-center gap-1.5 text-[11px]">
            <StatusPill status="sent" count={statusCounts.sent} />
            <StatusPill status="suppressed" count={statusCounts.suppressed} />
            <StatusPill status="failed" count={statusCounts.failed} />
            <StatusPill status="not_sent" count={statusCounts.not_sent} />
            <StatusPill status="not_subscribed" count={statusCounts.not_subscribed} />
          </div>
        </div>
      </header>

      {/* CSM action board · groups not-sent rooftops by reason · click to filter */}
      {breakdown.length > 0 ? (
        <div className="flex-shrink-0 border-b border-border-subtle bg-warning-soft/40 px-6 py-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warning">
              CSM action board ·{" "}
              {breakdown.reduce((s, b) => s + b.count, 0)} rooftops blocked
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {breakdown.map((b) => {
                const active = reasonFilter === b.reason;
                return (
                  <button
                    key={b.reason}
                    type="button"
                    onClick={() =>
                      setReasonFilter(active ? "all" : b.reason)
                    }
                    title={b.rooftops.join(", ")}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors duration-150 ${
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
                  Clear reason
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
            options={[
              { value: "all", label: "All CSMs" },
              ...TRACKER_META.csms.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Select
            value={groupFilter}
            onChange={setGroupFilter}
            options={[
              { value: "all", label: "All enterprises" },
              ...TRACKER_META.groups.map((g) => ({ value: g, label: g })),
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as SendStatus | "all" | "any_issue")}
            options={[
              { value: "all", label: "All statuses" },
              { value: "any_issue", label: "Any issue" },
              { value: "failed", label: "Failed" },
              { value: "not_sent", label: "Not sent" },
              { value: "suppressed", label: "Suppressed" },
              { value: "sent", label: "Sent" },
            ]}
          />
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCsmFilter("all");
              setGroupFilter("all");
              setStatusFilter("all");
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

      {/* Table */}
      <div className="flex-1 overflow-auto bg-surface-background">
        <table className="w-full border-separate" style={{ borderSpacing: 0 }}>
          <thead className="sticky top-0 z-20">
            <tr>
              <th
                className="sticky left-0 z-30 border-b border-border-subtle bg-surface-card px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted"
                style={{ minWidth: 240 }}
              >
                Rooftop
              </th>
              <th className="sticky left-[240px] z-30 border-b border-border-subtle bg-surface-card px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                CSM
              </th>
              <th className="border-b border-border-subtle bg-surface-card px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Subs
              </th>
              {Array.from({ length: colCount }).map((_, i) => (
                <th
                  key={i}
                  className="border-b border-border-subtle bg-surface-card px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted"
                  style={{ minWidth: 92 }}
                >
                  {formatColLabel(cadence, i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => {
              const cells =
                cadence === "daily" ? r.daily : cadence === "weekly" ? r.weekly : r.monthly;
              const rowBg = idx % 2 === 0 ? "bg-surface-card" : "bg-surface-background";
              return (
                <tr key={r.rooftop_id} className={`${rowBg} group`}>
                  <td
                    className={`sticky left-0 z-10 border-b border-border-subtle ${rowBg} px-4 py-2.5`}
                    style={{ minWidth: 240 }}
                  >
                    <div className="text-[13px] font-semibold text-text-primary">
                      {r.name}
                    </div>
                    {r.group ? (
                      <div className="text-[10px] text-text-muted">{r.group}</div>
                    ) : null}
                  </td>
                  <td
                    className={`sticky left-[240px] z-10 border-b border-border-subtle ${rowBg} px-3 py-2.5 text-[12px] text-text-secondary`}
                  >
                    {r.csm}
                  </td>
                  <td className="border-b border-border-subtle px-3 py-2.5">
                    <SubscriptionDots subs={r.subscriptions} />
                  </td>
                  {cells.slice(0, colCount).map((c) => {
                    const sent = sentNow[cellKey(r, c)];
                    return (
                      <td
                        key={c.date}
                        className="border-b border-border-subtle px-2 py-2"
                        style={{ minWidth: 92 }}
                      >
                        <SendStatusCell
                          cell={c}
                          sentNow={!!sent}
                          onOpen={() => handleOpenCell(r, c)}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-text-muted">
            No rooftops match the current filters.
          </div>
        ) : null}
      </div>

      {/* Cell-action drawer · snippet · reason · fill & send */}
      <RooftopCellDrawer
        rooftop={activeCell?.rooftop ?? null}
        cell={activeCell?.cell ?? null}
        onClose={() => setActiveCell(null)}
        onSend={handleSendFromDrawer}
      />
    </div>
  );
}

/* ============================================================
   Cells + pills
   ============================================================ */

function formatColLabel(cadence: Cadence, i: number): string {
  const today = new Date(TRACKER_META.today);
  const date = new Date(today);
  if (cadence === "daily") {
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (cadence === "weekly") {
    date.setDate(date.getDate() - i * 7);
    return `Wk ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  date.setMonth(date.getMonth() - i);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

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
      <span
        className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-positive/10 px-2 py-1 text-[11px] font-semibold text-positive"
        title="Sent just now via click-to-send"
      >
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
          title="Click to view what was sent"
          className="inline-flex w-full items-center justify-center rounded-md bg-positive/10 px-2 py-1 text-[11px] font-semibold text-positive transition-colors duration-150 hover:bg-positive/20"
        >
          Sent
        </button>
      );
    case "suppressed":
      return (
        <span
          className="inline-flex w-full items-center justify-center rounded-md bg-warning-soft px-2 py-1 text-[11px] font-semibold text-warning"
          title={
            cell.reason
              ? `Suppressed · ${NOT_SENT_REASON_LABEL[cell.reason]}`
              : "Suppressed"
          }
        >
          Suppr.
        </span>
      );
    case "failed": {
      const reason = cell.reason ?? "smtp_timeout";
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
          title={`Failed · ${NOT_SENT_REASON_LABEL[reason]}`}
        >
          {cta.label}
        </button>
      );
    }
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

function StatusPill({ status, count }: { status: SendStatus; count: number }) {
  const META: Record<SendStatus, { label: string; cls: string }> = {
    sent: { label: "Sent", cls: "bg-positive/10 text-positive" },
    suppressed: { label: "Suppressed", cls: "bg-warning-soft text-warning" },
    failed: { label: "Failed", cls: "bg-negative-soft text-negative" },
    not_sent: { label: "Not sent", cls: "bg-negative-soft text-negative" },
    not_subscribed: { label: "Not subscribed", cls: "bg-surface-subtle text-text-muted" },
    scheduled: { label: "Scheduled", cls: "bg-info-soft text-info" },
  };
  const m = META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${m.cls}`}
    >
      <span className="tabular">{count.toLocaleString()}</span> {m.label}
    </span>
  );
}

function SubscriptionDots({
  subs,
}: {
  subs: { daily: boolean; weekly: boolean; monthly: boolean };
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <SubDot active={subs.daily} label="D" />
      <SubDot active={subs.weekly} label="W" />
      <SubDot active={subs.monthly} label="M" />
    </span>
  );
}

function SubDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-semibold ${
        active
          ? "bg-positive/10 text-positive"
          : "bg-surface-subtle text-text-muted"
      }`}
      title={`${label === "D" ? "Daily" : label === "W" ? "Weekly" : "Monthly"} digest · ${
        active ? "subscribed" : "not subscribed"
      }`}
    >
      {label}
    </span>
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

import { useEffect, useMemo, useState } from "react";
import {
  NOT_SENT_REASON_LABEL,
  type NotSentReason,
  type RooftopRow,
  type SendCell,
} from "./mockData";

/**
 * Cell-action drawer · CSM audit + fix flow.
 *
 * Triggered by clicking any failing cell (failed / not_sent). Three
 * stacked sections:
 *
 *   1. Reason details      · what's wrong + which field is missing
 *   2. Email snippet       · what the dealer would see if the email
 *                            had landed (rooftop-anchored mock numbers)
 *   3. Fill data & send    · reason-aware form that fixes the underlying
 *                            data then fires the send
 *
 * The drawer is a right-anchored 420 px panel with a scrim backdrop and
 * Escape-to-close.
 */
type DrawerProps = {
  rooftop: RooftopRow | null;
  cell: SendCell | null;
  onClose: () => void;
  onSend: (rooftopId: string, date: string, cadence: SendCell["cadence"]) => void;
};

const REASON_FIX_LABEL: Record<NotSentReason, string> = {
  tag_missing: "Classify rooftop",
  recipient_placeholder: "Fix recipient",
  recipients_missing: "Add recipients",
  smtp_timeout: "Retry now",
  scheduler_skipped: "Send now",
  bounced: "Update recipient & retry",
  silent_day: "—",
};

const REASON_HELPER: Record<NotSentReason, string> = {
  tag_missing:
    "This rooftop hasn't been classified as Sales or Service. Vini needs the designation to know which agent's stats to pull for the daily email.",
  recipient_placeholder:
    "The recipient field holds a placeholder (\"m\") instead of a real email address. Replace it with one or more valid addresses to unblock the send.",
  recipients_missing:
    "No email recipient has been configured. The CSM owner needs to add at least one address from the dealership team before the daily email can fire.",
  smtp_timeout:
    "The send was attempted but the SMTP relay timed out. Retry once; if it fails again, escalate to engineering.",
  scheduler_skipped:
    "The scheduler didn't fire the daily job at the expected time. Manually triggering the send will fix today's gap.",
  bounced:
    "The recipient's inbox bounced the message. Update the address before retrying.",
  silent_day: "No customer activity for this rooftop on this day.",
};

export function RooftopCellDrawer({
  rooftop,
  cell,
  onClose,
  onSend,
}: DrawerProps) {
  const open = !!(rooftop && cell);
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!mounted || !rooftop || !cell) return null;

  const reason = cell.reason ?? "scheduler_skipped";
  const reasonLabel = NOT_SENT_REASON_LABEL[reason];

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-text-primary/30 backdrop-blur-[2px] transition-opacity duration-200 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[420px] max-w-full flex-col bg-surface-card shadow-email transition-all duration-200 ease-out ${
          visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`${rooftop.name} send details`}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-border-subtle bg-surface-card px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              {cell.cadence} · {formatHumanDate(cell.date)}
            </div>
            <h2 className="mt-0.5 text-[15px] font-semibold leading-tight text-text-primary">
              {rooftop.name}
            </h2>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold text-warning">
              {reasonLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-subtle hover:text-text-secondary"
          >
            ✕
          </button>
        </header>

        {/* Body · scrollable stacked sections */}
        <div className="flex-1 overflow-y-auto">
          {/* §1 Reason details */}
          <Section eyebrow="1 · Reason" title={reasonLabel}>
            <p className="text-[13px] leading-relaxed text-text-secondary">
              {REASON_HELPER[reason]}
            </p>
            <ReasonFieldStatus rooftop={rooftop} reason={reason} />
          </Section>

          {/* §2 Email snippet */}
          <Section
            eyebrow="2 · Snippet"
            title="What the dealer would have received"
          >
            <EmailSnippetCard rooftop={rooftop} />
            <p className="mt-2 text-[11px] text-text-muted">
              Snippet derived from this rooftop's last 7-day activity. Open the
              full preview in the Email previews mode to see the complete
              template.
            </p>
          </Section>

          {/* §3 Fill data & send */}
          <Section
            eyebrow="3 · Fix"
            title={`Fill missing data & ${REASON_FIX_LABEL[reason].toLowerCase()}`}
          >
            <FixDataForm
              rooftop={rooftop}
              reason={reason}
              onSend={() => {
                onSend(rooftop.rooftop_id, cell.date, cell.cadence);
                onClose();
              }}
            />
          </Section>
        </div>
      </aside>
    </>
  );
}

/* ============================================================
   Section wrapper
   ============================================================ */
function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border-subtle px-5 py-4 last:border-0">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {eyebrow}
      </div>
      <h3 className="mt-0.5 text-[13px] font-semibold text-text-primary">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/* ============================================================
   §1 helper · field-status grid based on reason
   ============================================================ */
function ReasonFieldStatus({
  rooftop,
  reason,
}: {
  rooftop: RooftopRow;
  reason: NotSentReason;
}) {
  const fields: { label: string; value: string; ok: boolean }[] = [
    {
      label: "Service / sales tag",
      value: rooftop.tag ?? "—",
      ok: !!rooftop.tag,
    },
    {
      label: "Recipients",
      value:
        rooftop.recipients.length === 0
          ? "—"
          : rooftop.recipients[0] === "m"
          ? "Placeholder (\"m\")"
          : `${rooftop.recipients.length} address${
              rooftop.recipients.length === 1 ? "" : "es"
            }`,
      ok:
        rooftop.recipients.length > 0 &&
        rooftop.recipients[0] !== "m",
    },
    {
      label: "Subscription · Daily",
      value: rooftop.subscriptions.daily ? "Yes" : "No",
      ok: rooftop.subscriptions.daily,
    },
  ];
  // For send-pipeline failures, show the technical line
  if (reason === "smtp_timeout" || reason === "scheduler_skipped" || reason === "bounced") {
    fields.push({
      label: "Send pipeline",
      value:
        reason === "smtp_timeout"
          ? "SMTP timeout"
          : reason === "bounced"
          ? "Inbox bounce"
          : "Scheduler skipped",
      ok: false,
    });
  }
  return (
    <ul className="mt-3 divide-y divide-border-subtle rounded-md border border-border-subtle">
      {fields.map((f) => (
        <li
          key={f.label}
          className="flex items-center justify-between gap-3 px-3 py-2"
        >
          <span className="text-[12px] text-text-secondary">{f.label}</span>
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] font-semibold tabular ${
              f.ok ? "text-positive" : "text-negative"
            }`}
          >
            {f.ok ? "✓" : "✕"} {f.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ============================================================
   §2 helper · compact email-snippet preview
   ============================================================ */
function EmailSnippetCard({ rooftop }: { rooftop: RooftopRow }) {
  // Deterministic mock numbers per rooftop_id so each snippet feels real
  const stub = useMemo(() => generateStub(rooftop.rooftop_id), [rooftop.rooftop_id]);

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-background">
      {/* Mini brand strip */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-card px-4 py-3">
        <div className="inline-flex items-baseline gap-1.5 text-[13px] font-semibold tracking-tight text-text-primary">
          <SnippetLogo />
          spyne
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold leading-tight text-text-primary">
            {rooftop.name}
          </div>
          <div className="text-[9px] text-text-muted">
            Vini · Daily Digest
          </div>
        </div>
      </div>

      {/* Mini section header */}
      <div className="px-4 pt-3">
        <h4 className="text-[15px] font-bold tracking-tight text-text-primary">
          Yesterday
          <span className="ml-1 text-[12px] font-normal text-text-secondary">
            at {rooftop.name}
          </span>
        </h4>
        <p className="mt-0.5 text-[10px] text-text-muted">
          <span className="tabular font-semibold text-text-primary">
            {stub.conversations}
          </span>{" "}
          conversations ·{" "}
          <span className="tabular font-semibold text-text-primary">
            {stub.appts}
          </span>{" "}
          appts ·{" "}
          <span className="tabular font-semibold text-text-primary">
            {stub.leads}
          </span>{" "}
          leads
        </p>
      </div>

      {/* Mini 2-card KPI row */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-3 pt-2">
        <SnippetKpiTile
          label="Conversations"
          value={stub.conversations}
          sub={`${Math.round((stub.voice / stub.conversations) * 100)}% voice`}
        />
        <SnippetKpiTile
          label="Appointments"
          value={stub.appts}
          sub={`${stub.mtdAppts} MTD`}
        />
      </div>

      {/* Mini "top of interest" line */}
      <div className="border-t border-border-subtle bg-surface-card px-4 py-2.5">
        <div className="text-[9px] font-semibold uppercase tracking-widest text-text-muted">
          Top {rooftop.tag === "service" ? "service intent" : "vehicle"}
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <span className="text-[12px] font-semibold text-text-primary">
            {stub.topItem}
          </span>
          <span className="tabular text-[11px] text-text-secondary">
            {stub.topItemCount} leads
          </span>
        </div>
      </div>
    </div>
  );
}

function SnippetKpiTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-card px-3 py-2">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </div>
      <div className="mt-1 text-[20px] font-bold tabular leading-tight text-text-primary">
        {value.toLocaleString()}
      </div>
      <div className="text-[10px] text-text-muted">{sub}</div>
    </div>
  );
}

function SnippetLogo() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
      <circle cx="6" cy="6" r="3" fill="#FF6B35" />
      <circle cx="18" cy="6" r="3" fill="#FFC107" />
      <circle cx="6" cy="18" r="3" fill="#4600F2" />
      <circle cx="18" cy="18" r="3" fill="#16A34A" />
    </svg>
  );
}

/* ============================================================
   §3 helper · reason-aware fill form
   ============================================================ */
function FixDataForm({
  rooftop,
  reason,
  onSend,
}: {
  rooftop: RooftopRow;
  reason: NotSentReason;
  onSend: () => void;
}) {
  const [tag, setTag] = useState<"sales" | "service" | "">(rooftop.tag ?? "");
  const [recipientsInput, setRecipientsInput] = useState<string>(
    rooftop.recipients.length > 0 && rooftop.recipients[0] !== "m"
      ? rooftop.recipients.join(", ")
      : ""
  );

  const showTagPicker = reason === "tag_missing";
  const showRecipientField =
    reason === "tag_missing" ||
    reason === "recipient_placeholder" ||
    reason === "recipients_missing" ||
    reason === "bounced";
  const showRetryOnly =
    reason === "smtp_timeout" || reason === "scheduler_skipped";

  // Validate based on what's shown
  const recipientsValid = (() => {
    if (!showRecipientField) return true;
    const list = recipientsInput
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return list.length > 0 && list.every((e) => /\S+@\S+\.\S+/.test(e));
  })();
  const tagValid = showTagPicker ? !!tag : true;
  const canSend = recipientsValid && tagValid;

  return (
    <div className="space-y-3">
      {showTagPicker ? (
        <div>
          <label className="text-[11px] font-semibold text-text-secondary">
            Classify this rooftop
          </label>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {(["sales", "service"] as const).map((t) => {
              const active = tag === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`rounded-md border px-3 py-2 text-[12px] font-semibold capitalize transition-colors duration-150 ${
                    active
                      ? "border-brand-primary bg-brand-soft text-brand-primary"
                      : "border-border-subtle bg-surface-card text-text-secondary hover:bg-surface-subtle"
                  }`}
                >
                  {t === "sales" ? "Sales · inbound" : "Service · inbound"}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {showRecipientField ? (
        <div>
          <label className="flex items-baseline justify-between text-[11px] font-semibold text-text-secondary">
            <span>Recipient email{recipientsInput.includes(",") ? "s" : ""}</span>
            <span className="text-[10px] font-normal text-text-muted">
              comma-separated
            </span>
          </label>
          <input
            type="text"
            value={recipientsInput}
            onChange={(e) => setRecipientsInput(e.target.value)}
            placeholder="manager@dealership.com, owner@dealership.com"
            className="mt-1 w-full rounded-md border border-border-subtle bg-surface-card px-3 py-2 text-[12px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
          />
          {!recipientsValid && recipientsInput.trim() ? (
            <p className="mt-1 text-[11px] text-negative">
              One or more addresses look invalid.
            </p>
          ) : null}
        </div>
      ) : null}

      {showRetryOnly ? (
        <p className="rounded-md border border-info-border bg-info-soft px-3 py-2 text-[12px] leading-snug text-info">
          No data fix needed — this is a send-pipeline issue. Retry to dispatch
          the email now. If it fails again, the cell will keep its red state
          and CSM should escalate to engineering.
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-3">
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12px] font-semibold transition-colors duration-150 ${
            canSend
              ? "bg-brand-primary text-white hover:bg-brand-primary-hover"
              : "cursor-not-allowed bg-surface-subtle text-text-muted"
          }`}
        >
          {showRetryOnly
            ? "Retry & send now"
            : "Save & send now"}
        </button>
        <span className="text-[10px] text-text-muted">
          {showTagPicker || showRecipientField
            ? "Saves data + dispatches send"
            : "Re-runs the send job"}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   Stub generator · deterministic per rooftop_id
   ============================================================ */
function generateStub(rooftopId: string) {
  // Tiny deterministic hash
  let seed = 0;
  for (const ch of rooftopId) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const r = (max: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.floor((seed / 233280) * max);
  };

  const conversations = 12 + r(40);
  const voice = Math.floor(conversations * (0.5 + r(40) / 100));
  const appts = 2 + r(8);
  const leads = conversations + 5 + r(30);
  const mtdAppts = appts * (5 + r(15));
  const topItemCount = 2 + r(8);

  const SVC_INTENTS = [
    "Maintenance / oil change",
    "Recall follow-up",
    "Diagnostic / check-engine",
    "Status update",
    "Reschedule / status",
  ];
  const SALES_VEHICLES = [
    "2025 Mercedes-Benz GLE 450",
    "2024 Honda Civic Sport",
    "2025 Toyota RAV4 Hybrid",
    "2024 Ford F-150 Lariat",
    "2025 Kia Sportage X-Line",
  ];
  const topItem =
    r(2) === 0 ? SVC_INTENTS[r(SVC_INTENTS.length)] : SALES_VEHICLES[r(SALES_VEHICLES.length)];

  return {
    conversations,
    voice,
    appts,
    leads,
    mtdAppts,
    topItem,
    topItemCount,
  };
}

function formatHumanDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

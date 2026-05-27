import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  EmptyState,
  PageHeading,
  Pill,
  PrimaryCTA,
  SectionLabel,
} from "../components/ui";
import { EMAIL_LOGS, getLogById, type EmailLogStatus } from "../data/email-logs";
import { EMAIL_TYPE_LABELS } from "../data/platform-mock";
import { EmailPreviewPane } from "../components/EmailPreviewPane";

const STATUS_LABELS: Record<EmailLogStatus, string> = {
  delivered: "Delivered",
  opened: "Opened",
  clicked: "Clicked",
  bounced: "Bounced",
  queued: "Queued",
};

function statusTone(s: EmailLogStatus): "positive" | "brand" | "negative" | "neutral" | "muted" {
  if (s === "clicked") return "positive";
  if (s === "opened") return "brand";
  if (s === "bounced") return "negative";
  if (s === "queued") return "muted";
  return "neutral";
}

function formatSentAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// List view
// ─────────────────────────────────────────────────────────────────────────────
export function LogsPage() {
  const [filterType, setFilterType] = useState<string>("all");

  const rows = useMemo(() => {
    const sorted = [...EMAIL_LOGS].sort((a, b) =>
      b.sent_at_iso.localeCompare(a.sent_at_iso),
    );
    return filterType === "all" ? sorted : sorted.filter((l) => l.email_type === filterType);
  }, [filterType]);

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 max-w-6xl mx-auto">
      {/* Phase 3 preview banner — matches PRD §10.4 ship order */}
      <div className="mb-5 border border-border-subtle rounded-md px-4 py-2.5 bg-surface-card flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-wide font-bold text-text-muted border border-border-subtle rounded-full px-2 py-0.5">
          Phase 3 preview
        </span>
        <span className="text-[13px] text-text-secondary">
          Sent-email logs ship after the self-serve subscription platform is in dealers' hands. This is here for engineering reference today.
        </span>
      </div>

      <PageHeading
        title="Sent emails"
        subtitle="Every email Vini has sent for your dealership — open any record to view what the recipient received, or send a copy to a new address."
      />

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "all", label: "All" },
          { key: "daily", label: "Daily" },
          { key: "weekly", label: "Weekly" },
          { key: "monthly", label: "Monthly" },
          { key: "eoc", label: "End-of-campaign" },
        ].map((f) => {
          const active = filterType === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilterType(f.key)}
              className={`min-h-[36px] px-3.5 rounded-md text-sm font-medium ${
                active
                  ? "bg-brand-primary text-white"
                  : "bg-surface-card border border-border-subtle text-text-primary hover:bg-surface-background"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-border-subtle">
          <SectionLabel>{rows.length} records</SectionLabel>
        </div>
        <div className="-mx-px overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-surface-background">
              <tr className="text-left text-[11px] uppercase tracking-wide text-text-secondary">
                <th className="px-5 sm:px-6 py-3 font-medium">Sent</th>
                <th className="px-3 py-3 font-medium">Recipient</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Subject</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-5 sm:px-6 py-3 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((log) => (
                <tr key={log.id} className="border-t border-border-subtle hover:bg-surface-background">
                  <td className="px-5 sm:px-6 py-3.5 whitespace-nowrap text-text-secondary tabular">
                    {formatSentAt(log.sent_at_iso)}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="text-text-primary">{log.recipient_name}</div>
                    <div className="text-xs text-text-secondary">{log.recipient_email}</div>
                  </td>
                  <td className="px-3 py-3.5">
                    <Pill tone="neutral">{EMAIL_TYPE_LABELS[log.email_type]}</Pill>
                  </td>
                  <td className="px-3 py-3.5 text-text-primary">
                    <div className="truncate max-w-[260px]">{log.subject}</div>
                    {log.source !== "scheduled" && (
                      <div className="text-[11px] text-text-secondary mt-0.5">
                        {log.source === "manual_send" ? "Manual send" : "Resend"}
                        {log.initiated_by && ` · by ${log.initiated_by}`}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    <Pill tone={statusTone(log.status)}>{STATUS_LABELS[log.status]}</Pill>
                    {log.open_count !== undefined && log.open_count > 0 && (
                      <div className="text-[11px] text-text-secondary mt-0.5 tabular">
                        {log.open_count} open · {log.click_count ?? 0} click
                      </div>
                    )}
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-right">
                    <Link
                      to={`/logs/${log.id}`}
                      className="text-brand-primary font-medium hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 sm:px-6 py-12 text-center text-text-secondary">
                    No emails of this type sent yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail view + manual send
// ─────────────────────────────────────────────────────────────────────────────
export function LogDetailPage() {
  const params = useParams<{ logId: string }>();
  const log = params.logId ? getLogById(params.logId) : undefined;

  const [sendToEmail, setSendToEmail] = useState("");
  const [actionResult, setActionResult] = useState<string | null>(null);

  if (!log) {
    return (
      <div className="px-4 sm:px-6 md:px-10 py-10 max-w-3xl mx-auto">
        <EmptyState
          title="Email log not found"
          body="This record may have aged out of the retention window (90 days)."
          action={
            <PrimaryCTA as="a" href="/logs">
              Back to logs
            </PrimaryCTA>
          }
        />
      </div>
    );
  }

  // All sections enabled — the preview shows the email as it was sent
  const allSectionsOn: Record<string, boolean> = {};

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 max-w-5xl mx-auto">
      <Link
        to="/logs"
        className="inline-flex items-center text-sm text-brand-primary font-medium hover:underline mb-4"
      >
        ← Back to sent emails
      </Link>

      <PageHeading
        title={log.subject}
        subtitle={
          <>
            Sent {formatSentAt(log.sent_at_iso)} to {log.recipient_name} ({log.recipient_email})
          </>
        }
        trailing={<Pill tone={statusTone(log.status)}>{STATUS_LABELS[log.status]}</Pill>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 lg:gap-6">
        {/* Detail metadata + send-copy */}
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <SectionLabel>Delivery</SectionLabel>
            <dl className="mt-3 text-sm space-y-2">
              <Row term="Sent at">{formatSentAt(log.sent_at_iso)}</Row>
              <Row term="To">{log.recipient_email}</Row>
              <Row term="Status">
                <Pill tone={statusTone(log.status)}>{STATUS_LABELS[log.status]}</Pill>
              </Row>
              {log.open_count !== undefined && (
                <Row term="Open events">{log.open_count}</Row>
              )}
              {log.click_count !== undefined && (
                <Row term="Click events">{log.click_count}</Row>
              )}
              <Row term="Source">
                {log.source === "scheduled"
                  ? "Scheduled send"
                  : log.source === "manual_send"
                    ? "Manual send"
                    : "Resend"}
                {log.initiated_by && (
                  <span className="text-text-secondary"> · by {log.initiated_by}</span>
                )}
              </Row>
            </dl>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionLabel>Send a copy</SectionLabel>
            <p className="mt-2 text-sm text-text-secondary">
              Useful when a new manager joins the dealership and wants to see the most recent report, or when an existing recipient asks for a fresh copy.
            </p>
            <div className="mt-4 space-y-3">
              <input
                type="email"
                value={sendToEmail}
                onChange={(e) => setSendToEmail(e.target.value)}
                placeholder="name@dealership.com"
                className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
              <div className="flex flex-wrap gap-2">
                <PrimaryCTA
                  onClick={() => {
                    if (!sendToEmail) {
                      setActionResult("Enter an email address to send a copy.");
                      return;
                    }
                    setActionResult(`Copy queued for ${sendToEmail}`);
                    setSendToEmail("");
                  }}
                >
                  Send copy
                </PrimaryCTA>
                <PrimaryCTA
                  variant="outline"
                  onClick={() =>
                    setActionResult(`Resend queued for ${log.recipient_email}`)
                  }
                >
                  Resend to original
                </PrimaryCTA>
              </div>
              {actionResult && (
                <div className="text-[13px] text-positive bg-positive/5 border border-positive/15 rounded-md px-3 py-2">
                  {actionResult}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Preview of what the recipient received */}
        <aside className="lg:sticky lg:top-6 lg:self-start min-w-0">
          <EmailPreviewPane
            emailType={log.email_type}
            enabled={true}
            sections={allSectionsOn}
            frequency={
              log.email_type === "daily"
                ? "Daily"
                : log.email_type === "weekly"
                  ? "Weekly"
                  : log.email_type === "monthly"
                    ? "Monthly"
                    : "Per campaign"
            }
          />
        </aside>
      </div>
    </div>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-text-secondary">{term}</dt>
      <dd className="text-text-primary text-right">{children}</dd>
    </div>
  );
}

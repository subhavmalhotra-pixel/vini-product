import type { PostCallSummaryData } from "@test-data";
import { EmailShell } from "../components/EmailShell";

type Props = {
  data: PostCallSummaryData;
};

/**
 * Post-Call Summary email — event-triggered, sent after every call where an
 * action item or appointment was generated.
 *
 * Three template variants, gated by the presence of `appointment` and
 * `action_items.length`:
 *   - BOTH              → appointment defined AND action_items.length > 0
 *   - ONLY ACTION ITEMS → appointment undefined AND action_items.length > 0
 *   - ONLY APPOINTMENT  → appointment defined AND action_items.length === 0
 *
 * The 4th case (neither) is excluded by the trigger rule — the email simply
 * doesn't fire if nothing was generated.
 */
export function PostCallSummary({ data }: Props) {
  const hasAppointment = !!data.appointment;
  const hasActionItems = data.action_items.length > 0;

  return (
    <EmailShell
      dealerName={data.dealer.name}
      emailTitle={data.call_subject}
      dateRange={formatDateTime(data.call_started_at)}
      reportingPeriod={formatDate(data.call_started_at)}
    >
      <article className="px-4 py-6 sm:px-6 sm:py-7 lg:px-10">
        {/* Dept + direction chip */}
        <DeptChip label={data.dept_label} />

        {/* Subject + meta */}
        <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-3xl">
          {data.call_subject}
        </h1>
        <MetaStrip
          agent={data.agent_name}
          startedAt={data.call_started_at}
          durationSec={data.call_duration_sec}
        />

        {/* Customer details — 2-col card */}
        <SectionHeading icon="👤">Customer Details</SectionHeading>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailCard>
            <DetailRow label="Name" value={data.customer.name} bold />
            <DetailRow label="Phone No." value={data.customer.phone} bold mono />
          </DetailCard>
          <DetailCard>
            <DetailRow
              label="AI Call Score"
              value={
                <ScorePill
                  score={data.customer.ai_call_score}
                  label={data.customer.ai_call_score_label}
                />
              }
            />
            <DetailRow
              label="Customer Sentiment"
              value={<SentimentPill sentiment={data.customer.sentiment} />}
            />
          </DetailCard>
        </div>

        {/* Intent + Deal Value — 2-col */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <SectionHeading icon="💬">Intent</SectionHeading>
            <div className="mt-2 rounded-lg border border-border-subtle bg-surface-card px-4 py-3 text-[14px] font-semibold text-text-primary">
              <span className="mr-2 inline-block h-4 w-0.5 align-middle bg-brand-primary" />
              {data.intent_label}
            </div>
          </div>
          <div>
            <SectionHeading icon="💰">Deal Value</SectionHeading>
            <div className="mt-2 rounded-lg border border-border-subtle bg-gradient-to-r from-positive-soft to-surface-card px-4 py-3">
              <div className="text-[15px] font-semibold tabular text-text-primary">
                <span className="mr-1 align-middle">💵</span>
                {formatUSD(data.deal_value_usd)}
              </div>
            </div>
          </div>
        </div>

        {/* Appointment — conditional */}
        {hasAppointment && data.appointment ? (
          <>
            <SectionHeading icon="📅" className="mt-6">
              Appointment
            </SectionHeading>
            <div className="mt-2 rounded-lg border border-border-subtle bg-surface-card px-4 py-3">
              <div className="border-l-2 border-brand-primary pl-3">
                <div className="text-[14px] font-semibold text-text-primary">
                  {data.appointment.label}
                </div>
                <div className="mt-2 grid grid-cols-[16px_auto_1fr] items-center gap-x-2 gap-y-1.5 text-[13px]">
                  <span aria-hidden>🕐</span>
                  <span className="text-text-secondary">Schedule:</span>
                  <span className="text-text-primary">{data.appointment.schedule}</span>
                  <span aria-hidden>🚗</span>
                  <span className="text-text-secondary">Vehicle:</span>
                  <span className="text-text-primary">{data.appointment.vehicle}</span>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Action Items — conditional */}
        {hasActionItems ? (
          <>
            <SectionHeading icon="✅" className="mt-6">
              Action Items
            </SectionHeading>
            <ul className="mt-2 space-y-2">
              {data.action_items.map((item, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-border-subtle bg-surface-card px-4 py-3"
                >
                  <div className="text-[14px] font-semibold text-text-primary">
                    {item.title}
                  </div>
                  <div className="mt-2 border-t border-border-subtle pt-2 text-right text-[12px] text-text-secondary">
                    Due: {formatDueDate(item.due_at)}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {/* Call Summary — always rendered */}
        <SectionHeading icon="📄" className="mt-7">
          Call Summary
        </SectionHeading>

        <div className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Key takeaways <span className="ml-1">✨</span>
        </div>
        <ul className="mt-2 space-y-1.5 pl-4">
          {data.summary.key_takeaways.map((line, idx) => (
            <li
              key={idx}
              className="relative pl-1 text-[14px] font-semibold leading-snug text-text-primary before:absolute before:left-[-12px] before:top-[10px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-text-primary"
            >
              {line}
            </li>
          ))}
        </ul>

        <div className="mt-5 text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Topics
        </div>
        <ul className="mt-2 space-y-3 pl-4">
          {data.summary.topics.map((topic, idx) => (
            <li
              key={idx}
              className="relative pl-1 before:absolute before:left-[-12px] before:top-[8px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-text-primary"
            >
              <div className="text-[14px] font-semibold leading-snug text-text-primary">
                {topic.name}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                {topic.description}
              </p>
            </li>
          ))}
        </ul>
      </article>
    </EmailShell>
  );
}

/* ----------------------------------------------------------------------------
   Helper components
   ---------------------------------------------------------------------------- */

function DeptChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary/10 px-2.5 py-1 text-[12px] font-semibold text-brand-primary">
      <span aria-hidden>🏷️</span>
      {label}
    </span>
  );
}

function MetaStrip({
  agent,
  startedAt,
  durationSec,
}: {
  agent: string;
  startedAt: string;
  durationSec: number;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-text-secondary">
      <span>Agent: {agent}</span>
      <span aria-hidden className="text-text-muted">●</span>
      <span>{formatDate(startedAt)}</span>
      <span aria-hidden className="text-text-muted">●</span>
      <span>{formatTime(startedAt)}</span>
      <span aria-hidden className="text-text-muted">●</span>
      <span>{formatDuration(durationSec)}</span>
    </div>
  );
}

function SectionHeading({
  icon,
  children,
  className = "",
}: {
  icon: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`flex items-center gap-2 text-[15px] font-semibold text-text-primary ${className}`}
    >
      <span aria-hidden className="text-brand-primary">
        {icon}
      </span>
      {children}
    </h2>
  );
}

function DetailCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-background px-4 py-3">
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-[13px] text-text-secondary">{label}</span>
      <span
        className={`text-right text-[13px] text-text-primary ${
          bold ? "font-semibold" : ""
        } ${mono ? "tabular" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function ScorePill({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const toneClass =
    score >= 85
      ? "bg-positive-soft text-positive"
      : score >= 70
        ? "bg-yellow-100 text-yellow-700"
        : "bg-negative-soft text-negative";
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tabular ${toneClass}`}
      >
        {score}
      </span>
      <span className="text-[13px] text-text-secondary">{label}</span>
    </span>
  );
}

function SentimentPill({
  sentiment,
}: {
  sentiment: "positive" | "neutral" | "negative";
}) {
  const meta: Record<
    "positive" | "neutral" | "negative",
    { emoji: string; label: string; toneClass: string }
  > = {
    positive: { emoji: "🙂", label: "positive", toneClass: "text-positive" },
    neutral: { emoji: "😐", label: "neutral", toneClass: "text-text-secondary" },
    negative: { emoji: "🙁", label: "negative", toneClass: "text-negative" },
  };
  const m = meta[sentiment];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] ${m.toneClass}`}>
      <span aria-hidden className="text-base leading-none">
        {m.emoji}
      </span>
      <span>{m.label}</span>
    </span>
  );
}

/* ----------------------------------------------------------------------------
   Formatting helpers (kept inline to avoid bundling dayjs)
   ---------------------------------------------------------------------------- */

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")} mins ${String(s).padStart(2, "0")} s`;
}

function formatUSD(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  const month = d.toLocaleString("en-US", { month: "short" });
  const yearShort = String(d.getFullYear()).slice(-2);
  return `${day}${suffix} ${month} '${yearShort}`;
}

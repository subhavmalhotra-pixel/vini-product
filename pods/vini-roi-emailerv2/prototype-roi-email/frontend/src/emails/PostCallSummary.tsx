import type { PostCallSummaryData } from "@test-data";
import {
  AppointmentCard,
  BrandStrip,
  BulletListCard,
  ConsoleCtaFooter,
  CustomerCard,
  DealerReportShell,
  Glossary,
  SectionStatusHeader,
  TopicsCard,
} from "../components/dealer-report/primitives";

type Props = { data: PostCallSummaryData };

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatDueAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * PostCallSummary · dealer-report design (event-triggered after every call).
 *
 * Renders every PostCallSummaryData field:
 *   - dept_label · agent_type · call_subject + meta strip
 *   - customer card · phone · ai_call_score + label · sentiment chip
 *   - intent + deal value (2-col)
 *   - appointment (optional)
 *   - action_items list (optional)
 *   - summary.key_takeaways · summary.topics
 */
export function PostCallSummary({ data }: Props) {
  const score = data.customer.ai_call_score;
  const scoreStatus =
    data.customer.ai_call_score_label === "Excellent" || data.customer.ai_call_score_label === "Good"
      ? "on-track"
      : data.customer.ai_call_score_label === "Fair"
      ? "watch"
      : "off-track";

  const startedAt = formatDateTime(data.call_started_at);
  const duration = formatDuration(data.call_duration_sec);

  return (
    <DealerReportShell>
      <BrandStrip
        dealerName={data.dealer.name}
        metaLine={`Vini · Post-Call · ${data.dept_label}`}
      />

      <SectionStatusHeader
        title={data.call_subject}
        scope={`· ${data.agent_name}`}
        status={scoreStatus}
        labelOverride={`${score} · ${data.customer.ai_call_score_label}`}
        date={`${startedAt} · ${duration}`}
      />

      {/* 2-column: Customer + Intent / Deal Value */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CustomerCard
          name={data.customer.name}
          phone={data.customer.phone}
          callScore={data.customer.ai_call_score}
          callScoreLabel={data.customer.ai_call_score_label}
          sentiment={data.customer.sentiment}
        />
        <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Intent
              </div>
              <div className="mt-1.5 text-[15px] font-semibold leading-tight text-text-primary">
                {data.intent_label}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Deal value
              </div>
              <div className="mt-1.5 text-[20px] font-bold tabular text-text-primary">
                ${data.deal_value_usd.toLocaleString()}
              </div>
              {data.deal_value_usd === 0 ? (
                <div className="mt-0.5 text-[11px] text-text-muted">No deal value detected</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment (optional) */}
      {data.appointment ? (
        <AppointmentCard
          label={data.appointment.label}
          schedule={data.appointment.schedule}
          vehicle={data.appointment.vehicle}
        />
      ) : null}

      {/* Action items list */}
      {data.action_items && data.action_items.length > 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Action items
          </div>
          <ul className="mt-3 divide-y divide-border-muted">
            {data.action_items.map((it, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 py-2.5">
                <span className="text-[13px] text-text-primary">{it.title}</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-semibold tabular text-brand-primary">
                  Due {formatDueAt(it.due_at)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Key takeaways */}
      {data.summary.key_takeaways && data.summary.key_takeaways.length > 0 ? (
        <BulletListCard
          eyebrow="Summary"
          title="Key takeaways"
          bullets={data.summary.key_takeaways}
        />
      ) : null}

      {/* Topics discussed */}
      {data.summary.topics && data.summary.topics.length > 0 ? (
        <TopicsCard topics={data.summary.topics} />
      ) : null}

      <Glossary
        items={[
          {
            label: "AI call score",
            symbol: "*",
            description:
              "0–100 score derived from intent capture, sentiment, action-item completeness, and customer engagement.",
            ideal: "≥ 80 (Good / Excellent)",
          },
          {
            label: "Sentiment",
            symbol: "†",
            description:
              "Overall customer sentiment across the call. Positive = satisfied, Negative = friction.",
            ideal: "Positive or Neutral",
          },
          {
            label: "Deal value",
            symbol: "‡",
            description:
              "Vehicle ask + trade context Vini extracted. $0 = no deal value detected.",
            ideal: "Inquiry-dependent",
          },
          {
            label: "Action items",
            symbol: "§",
            description:
              "Tasks Vini flagged for the team to complete · auto-routed to the action-items queue.",
            ideal: "Closed before due date",
          },
        ]}
      />

      <ConsoleCtaFooter
        message="Listen to the call."
        detail="Full transcript, audio, sentiment trace, and team handoff"
        ctaLabel="Open console"
        href="/console/conversations"
      />
    </DealerReportShell>
  );
}

import type { ConversationJourney } from "@test-data";

type StoryBlockProps = {
  story: {
    journey: ConversationJourney;
    badge: string;
    summary: string;
    summary_source: "ai_haiku" | "fallback_omit";
  };
  title?: string;
};

const AGENT_LABEL: Record<string, string> = {
  sales_ib: "Sales · Inbound",
  sales_ob: "Sales · Outbound",
  service_ib: "Service · Inbound",
  service_ob: "Service · Outbound",
};

export function StoryBlock({ story, title = "Story of the week" }: StoryBlockProps) {
  // Fallback rule: AI summary is unavailable — silently omit the block.
  if (story.summary_source === "fallback_omit" || !story.summary) return null;

  const { journey, badge, summary } = story;

  return (
    <section className="border-t border-border-subtle px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {title ? (
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            {title}
          </h2>
        ) : (
          <span />
        )}
        <span className="rounded-full border border-brand-primary/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-primary">
          {badge}
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-border-subtle bg-surface-background p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">
            {journey.agent_display_name}
          </span>
          <span className="text-text-muted">·</span>
          <span>{AGENT_LABEL[journey.agent] ?? journey.agent}</span>
          <span className="text-text-muted">·</span>
          <span className="tabular">{journey.touch_count} touches</span>
          <span className="text-text-muted">·</span>
          <span className="capitalize">{journey.channels_used.join(" + ")}</span>
        </div>

        <div className="mt-2 text-sm font-medium text-text-primary">{journey.intent}</div>

        <p className="mt-3 text-sm leading-relaxed text-text-primary">{summary}</p>

        <div className="mt-4 text-[11px] text-text-muted">
          Anonymized · all customer identifiers removed before summary
        </div>
      </div>
    </section>
  );
}

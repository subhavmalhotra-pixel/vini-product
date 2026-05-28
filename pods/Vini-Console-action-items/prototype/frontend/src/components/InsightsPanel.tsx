import { useState } from "react";
import { MaterialSymbol } from "./MaterialSymbol";

/**
 * Insights panel · console-revamp/components.md §10 + §11.
 *
 * Closes every overview page. Header strip "Insights · Ask your queue",
 * 6 chips of pre-written natural-language questions. Each chip prefixed
 * with the domain icon (Material Symbol). Hover only changes border.
 *
 * Free-text NLQ is Phase 2; chips are tappable and surface a stub
 * response so the affordance feels real today.
 */

type Prompt = {
  icon: string;
  label: string;
  /** Stubbed response so the demo feels live; Phase 2 routes to real NLQ. */
  response: string;
};

const PROMPTS: Prompt[] = [
  {
    icon: "shield",
    label: "Which intents are breaching SLA most this week?",
    response:
      "Status update and recall response are the top breaches. 3 cars stuck past SLA — needs reassignment now.",
  },
  {
    icon: "autorenew",
    label: "Show me customers who pinged us 3+ times this week.",
    response:
      "Gary Wise leads with 5 contacts in 3 days. 2 more customers crossed the threshold today — escalate.",
  },
  {
    icon: "bar_chart",
    label: "How does my team's closure rate compare to last week?",
    response:
      "Closure rate down 12% week-over-week. 4 reps are below their personal trend — coaching candidates.",
  },
  {
    icon: "schedule",
    label: "Who is closing fastest on the team this week?",
    response:
      "Madison closes status_update tasks 38% faster than the team median. Pair her with the unassigned aged 24h+ pile.",
  },
  {
    icon: "auto_awesome",
    label: "What's Vini's resolution-note pass rate this month?",
    response:
      "94% on the auto-graded slice. Phase 2 routing target is 90%. Vini-as-assignee is shippable on this metric.",
  },
  {
    icon: "trending_up",
    label: "Summarise today's queue health in one paragraph.",
    response:
      "23 open, 1 past SLA, 4 unassigned — down 18% from yesterday. Repeat-caller pressure is the largest risk. Easy 1-tap closures available: 4.",
  },
];

export function InsightsPanel() {
  const [asked, setAsked] = useState<Prompt | null>(null);

  return (
    <section className="mt-8 rounded-xl border border-border-subtle bg-surface-card p-6">
      {/* Header strip · sparkle accent + label + eyebrow */}
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple-soft text-brand-purple">
          <MaterialSymbol name="auto_awesome" size={20} />
        </span>
        <div>
          <h3 className="text-section-h2 text-text-primary">Insights</h3>
          <p className="text-section-desc text-text-secondary">
            Ask your queue.
          </p>
        </div>
      </div>

      {/* Chip grid · 2 columns desktop, 1 column mobile */}
      <div className="mt-5 flex flex-wrap gap-2">
        {PROMPTS.map((p, i) => (
          <InsightChip
            key={i}
            icon={p.icon}
            label={p.label}
            onClick={() => setAsked(p)}
            active={asked?.label === p.label}
          />
        ))}
      </div>

      {/* Inline answer · appears below the chips when a prompt is tapped */}
      {asked ? (
        <div className="mt-5 rounded-lg border border-border-subtle bg-surface-subtle px-4 py-3">
          <div className="flex items-start gap-2">
            <MaterialSymbol
              name="auto_awesome"
              size={16}
              className="mt-0.5 text-brand-purple"
            />
            <div className="flex-1 min-w-0">
              <p className="text-list-item-title text-text-primary">
                {asked.label}
              </p>
              <p className="mt-1 text-list-item-rationale text-text-secondary">
                {asked.response}
              </p>
              <p className="mt-2 text-meta text-text-tertiary">
                Stub response. Free-text NLQ ships in Phase 2.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAsked(null)}
              aria-label="Dismiss"
              className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-muted hover:text-text-secondary"
            >
              <MaterialSymbol name="close" size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function InsightChip({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] transition-colors duration-150 ${
        active
          ? "border-brand-purple bg-brand-purple-soft text-brand-purple"
          : "border-border-subtle bg-surface-subtle text-text-primary hover:border-border-strong hover:bg-surface-card"
      }`}
    >
      <MaterialSymbol
        name={icon}
        size={16}
        className={active ? "text-brand-purple" : "text-text-secondary"}
      />
      {label}
    </button>
  );
}

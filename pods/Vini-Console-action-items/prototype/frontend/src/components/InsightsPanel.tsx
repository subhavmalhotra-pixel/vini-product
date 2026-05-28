import type { ComponentType } from "react";
import {
  SparkleIcon,
  AlertIcon,
  BarChartIcon,
  RepeatIcon,
  RobotIcon,
  ClockIcon,
} from "./Icon";

/**
 * "Ask your queue" — Insights AI prompt panel.
 *
 * Per the intelligent-console-design skill (build checklist step 5):
 *   "End with an AI insights panel. A header ('Ask your dealership' or
 *   equivalent), and 4–6 suggested-question chips, each prefixed with
 *   a domain icon. Chips are tappable — they pre-fill the input."
 *
 * Phase 1 ships this as a visible affordance with chips that surface
 * the right kinds of questions an operator would ask. The actual NLQ
 * routing is Phase 2 — chips show a "Coming soon" tooltip for now.
 */

type Suggestion = {
  icon: ComponentType<{ size?: number }>;
  iconTone: "danger" | "ok" | "neutral" | "primary";
  question: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    icon: AlertIcon,
    iconTone: "danger",
    question: "Which intents are breaching SLA most?",
  },
  {
    icon: RepeatIcon,
    iconTone: "danger",
    question: "Show me customers who pinged us 3+ times.",
  },
  {
    icon: BarChartIcon,
    iconTone: "primary",
    question: "How does my closure rate compare to last week?",
  },
  {
    icon: ClockIcon,
    iconTone: "neutral",
    question: "Who's closing fastest on the team this week?",
  },
  {
    icon: RobotIcon,
    iconTone: "primary",
    question: "What's Vini's resolution-note pass rate?",
  },
  {
    icon: SparkleIcon,
    iconTone: "ok",
    question: "Summarise today's queue health in one paragraph.",
  },
];

export function InsightsPanel() {
  return (
    <section
      className="border-t border-border-subtle bg-surface-card px-5 py-5"
      aria-labelledby="insights-heading"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-purple-soft text-brand-purple">
            <SparkleIcon size={14} />
          </span>
          <div>
            <h2
              id="insights-heading"
              className="text-section-title text-text-primary"
            >
              Insights
            </h2>
          </div>
        </div>
        <span className="text-eyebrow text-text-tertiary">Ask your queue</span>
      </div>

      <p className="mt-1 text-[12px] text-text-secondary">
        Tap a question to get a written summary grounded in this rooftop's queue
        data. Free-text questions land in Phase 2.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <SuggestionChip key={s.question} {...s} />
        ))}
      </div>
    </section>
  );
}

const TONE_ICON: Record<Suggestion["iconTone"], string> = {
  danger: "bg-status-past-soft text-status-past",
  ok: "bg-status-ok-soft text-status-ok",
  neutral: "bg-surface-subtle text-text-secondary",
  primary: "bg-brand-purple-soft text-brand-purple",
};

function SuggestionChip({
  icon: Icon,
  iconTone,
  question,
}: Suggestion) {
  return (
    <button
      type="button"
      disabled
      title="Coming in Phase 2. Insights AI is a separate scoped pod."
      className="group flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg border border-border-subtle bg-surface-card px-3 py-2.5 text-left transition-colors duration-150 hover:border-brand-purple/40 hover:bg-brand-purple-soft/30"
    >
      <span
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ${TONE_ICON[iconTone]}`}
      >
        <Icon size={14} />
      </span>
      <span className="flex-1 text-[13px] leading-snug text-text-primary">
        {question}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary group-hover:text-brand-purple">
        soon
      </span>
    </button>
  );
}

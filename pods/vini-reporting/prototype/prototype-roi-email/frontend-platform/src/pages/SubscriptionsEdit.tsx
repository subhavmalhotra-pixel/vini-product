import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  EmptyState,
  Pill,
  PrimaryCTA,
  ToggleSwitch,
} from "../components/ui";
import {
  ACTIVE_DEALER,
  ACTIVE_RECIPIENTS,
  EMAIL_TYPE_LABELS,
  SECTION_TOGGLES_BY_EMAIL,
} from "../data/platform-mock";
import {
  SchedulePanel,
  type ScheduleState,
} from "../components/SchedulePanel";
import { Phase1EmailPreview } from "../components/Phase1EmailPreview";

type EmailType = "daily" | "weekly" | "monthly" | "eoc";
const EMAIL_TYPES: EmailType[] = ["daily", "weekly", "monthly", "eoc"];

const PERIOD_LABEL: Record<EmailType, string> = {
  daily: "May 14, 2026",
  weekly: "Apr 27 – May 3, 2026",
  monthly: "April 2026",
  eoc: "Spring Inventory Clearance",
};

// Default schedule per email type — used for "Default" badge logic in the
// schedule panel + as the initial state when the user hasn't customized.
const DEFAULT_SCHEDULE_BY_TYPE: Record<EmailType, ScheduleState> = {
  daily: {
    active: true,
    sendType: "recurring",
    frequency: "daily",
    day: "mon",
    time: "07:00",
    timezone: "America/Los_Angeles",
  },
  weekly: {
    active: true,
    sendType: "recurring",
    frequency: "weekly",
    day: "mon",
    time: "07:00",
    timezone: "America/Los_Angeles",
  },
  monthly: {
    active: true,
    sendType: "recurring",
    frequency: "monthly",
    day: "mon",
    time: "07:00",
    timezone: "America/Los_Angeles",
  },
  eoc: {
    active: true,
    sendType: "recurring",
    frequency: "weekly",
    day: "fri",
    time: "07:00",
    timezone: "America/Los_Angeles",
  },
};

export function SubscriptionsEdit() {
  const params = useParams<{ recipientId: string }>();
  const recipientEmail = decodeURIComponent(params.recipientId ?? "");
  const recipient = useMemo(
    () => ACTIVE_RECIPIENTS.find((r) => r.email === recipientEmail),
    [recipientEmail],
  );

  const [activeTab, setActiveTab] = useState<EmailType>("weekly");

  const [scheduleByType, setScheduleByType] = useState<
    Record<EmailType, ScheduleState>
  >(() => {
    const init: Record<EmailType, ScheduleState> = { ...DEFAULT_SCHEDULE_BY_TYPE };
    if (recipient) {
      EMAIL_TYPES.forEach((t) => {
        const subscribed = recipient.subscriptions.some(
          (s) => s.email_type === t,
        );
        init[t] = { ...DEFAULT_SCHEDULE_BY_TYPE[t], active: subscribed };
      });
    }
    return init;
  });

  const [sectionState, setSectionState] = useState<
    Record<EmailType, Record<string, boolean>>
  >(() => {
    const init: Record<EmailType, Record<string, boolean>> = {
      daily: {},
      weekly: {},
      monthly: {},
      eoc: {},
    };
    EMAIL_TYPES.forEach((t) => {
      (SECTION_TOGGLES_BY_EMAIL[t] ?? []).forEach((sec) => {
        init[t][sec.key] = true;
      });
    });
    return init;
  });

  if (!recipient) {
    return (
      <div className="px-4 sm:px-6 md:px-10 py-10 max-w-3xl mx-auto">
        <EmptyState
          title="Recipient not found"
          body="This person may have been removed. Return to the recipients list to manage who's subscribed."
          action={
            <PrimaryCTA as="a" href="/settings/recipients">
              Back to recipients
            </PrimaryCTA>
          }
        />
      </div>
    );
  }

  const schedule = scheduleByType[activeTab];
  const sections = sectionState[activeTab];
  const sectionToggles = SECTION_TOGGLES_BY_EMAIL[activeTab] ?? [];
  const defaults = DEFAULT_SCHEDULE_BY_TYPE[activeTab];

  return (
    <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8 max-w-[1400px] mx-auto">
      {/* Top breadcrumb + back link */}
      <Link
        to="/settings/recipients"
        className="inline-flex items-center text-sm text-brand-primary font-medium hover:underline mb-3"
      >
        ← Back to recipients
      </Link>

      {/* Top header bar — dealer name + dealer selector + date navigator */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-5 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            {ACTIVE_DEALER.name}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            4200 N Central Expy · Editing for {recipient.display_name} ·{" "}
            <Pill tone="neutral">{formatRole(recipient.role)}</Pill>
          </p>
        </div>
        <div className="flex flex-wrap items-stretch gap-2 shrink-0">
          <button
            type="button"
            className="min-h-[40px] inline-flex items-center gap-2 px-3 rounded-md border border-border-subtle bg-surface-card text-sm font-medium text-text-primary hover:bg-surface-background"
          >
            <span>{ACTIVE_DEALER.name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" />
            </svg>
          </button>
          <div className="inline-flex items-stretch rounded-md border border-border-subtle bg-surface-card">
            <button
              type="button"
              className="min-h-[40px] min-w-[40px] grid place-items-center text-text-secondary hover:text-text-primary"
              aria-label="Previous period"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
              </svg>
            </button>
            <div className="px-3 self-center text-sm font-medium text-text-primary tabular whitespace-nowrap">
              {PERIOD_LABEL[activeTab]}
            </div>
            <button
              type="button"
              className="min-h-[40px] min-w-[40px] grid place-items-center text-text-secondary hover:text-text-primary"
              aria-label="Next period"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <PrimaryCTA>Save changes</PrimaryCTA>
        </div>
      </header>

      {/* Email-type tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {EMAIL_TYPES.map((t) => {
          const active = activeTab === t;
          const isActive = scheduleByType[t].active;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`min-h-[40px] px-4 rounded-md text-sm font-semibold transition-colors inline-flex items-center gap-2 ${
                active
                  ? "bg-brand-primary text-white"
                  : "bg-surface-card border border-border-subtle text-text-primary hover:bg-surface-background"
              }`}
            >
              <span>{EMAIL_TYPE_LABELS[t]}</span>
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  isActive
                    ? active
                      ? "bg-white"
                      : "bg-positive"
                    : "bg-text-muted"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Two-column body: config left, preview right */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 lg:gap-6">
        {/* Left config column */}
        <div className="space-y-4 min-w-0">
          <SchedulePanel
            state={schedule}
            defaults={{ day: defaults.day, time: defaults.time }}
            onChange={(next) =>
              setScheduleByType((prev) => ({
                ...prev,
                [activeTab]: { ...prev[activeTab], ...next },
              }))
            }
          />

          {/* Report Sections card */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
              <h3 className="text-sm font-semibold text-text-primary">
                Report sections
              </h3>
              <svg
                className="text-text-muted"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 15l7-7 7 7" strokeLinecap="round" />
              </svg>
            </div>
            <ul className="divide-y divide-border-subtle">
              {sectionToggles.map((sec) => (
                <li
                  key={sec.key}
                  className="px-5 py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <SectionIcon name={sec.key} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">
                        {sec.label}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(sections[sec.key] ?? true) === true && (
                      <span className="text-[10px] uppercase tracking-wide font-bold text-text-muted bg-surface-background border border-border-subtle rounded-full px-1.5 py-0.5">
                        Default
                      </span>
                    )}
                    <ToggleSwitch
                      checked={sections[sec.key] ?? true}
                      onChange={(v) =>
                        setSectionState((prev) => ({
                          ...prev,
                          [activeTab]: { ...prev[activeTab], [sec.key]: v },
                        }))
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right preview column — renders the real Phase 1 email components */}
        <div className="min-w-0">
          <Phase1EmailPreview
            emailType={activeTab}
            enabled={schedule.active}
            sections={sections}
          />
        </div>
      </div>
    </div>
  );
}

function formatRole(role: string): string {
  return role
    .split("_")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}

function SectionIcon({ name }: { name: string }) {
  const map: Record<string, string> = {
    hero: "★",
    ai_narrative: "✦",
    call_volume: "☎",
    appointment_funnel: "▼",
    lead_activity: "◉",
    action_required: "!",
    inbound_kpis: "↓",
    outbound: "↑",
    after_hours: "🌙",
    top_vehicles: "🚗",
    top_breakout: "▤",
    kpi_strip: "▦",
    kpi_grid: "▦",
    trend_table: "📈",
    trend_chart: "📈",
    funnel: "▼",
    channel_performance: "📡",
    story: "✎",
    stories: "✎",
    headline: "▤",
    touchpoint: "◉",
    multichannel: "📡",
    objections: "!",
    recommendations: "→",
    value_estimate: "$",
    customer_centric: "👥",
  };
  return (
    <span className="inline-flex items-center justify-center h-5 w-5 shrink-0 rounded text-[11px] text-text-muted bg-surface-background border border-border-subtle">
      {map[name] ?? "·"}
    </span>
  );
}


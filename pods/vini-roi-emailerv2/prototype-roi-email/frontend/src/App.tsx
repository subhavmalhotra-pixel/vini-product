import { useEffect, useMemo, useState } from "react";
import {
  ALL_DAILY_SCENARIOS,
  ALL_EOC_SCENARIOS,
  ALL_MONTHLY_SCENARIOS,
  ALL_POST_CALL_SCENARIOS,
  ALL_WEEKLY_SCENARIOS,
  type EmailScenario,
} from "@test-data";

import { SidebarScenarioList } from "./components/SidebarScenarioList";
import { ScenarioInspector } from "./components/ScenarioInspector";
import { SuppressedSendOverlay } from "./components/SuppressedSendOverlay";

import { DailyDigest } from "./emails/DailyDigest";
import { WeeklyPerformance } from "./emails/WeeklyPerformance";
import { MonthlyValueReport } from "./emails/MonthlyValueReport";
import { EndOfCampaignReport } from "./emails/EndOfCampaignReport";
import { PostCallSummary } from "./emails/PostCallSummary";

import { DailyDigest as LegacyDailyDigest } from "./emails/legacy/DailyDigest";
import { WeeklyPerformance as LegacyWeeklyPerformance } from "./emails/legacy/WeeklyPerformance";
import { MonthlyValueReport as LegacyMonthlyValueReport } from "./emails/legacy/MonthlyValueReport";
import { EndOfCampaignReport as LegacyEndOfCampaignReport } from "./emails/legacy/EndOfCampaignReport";
import { PostCallSummary as LegacyPostCallSummary } from "./emails/legacy/PostCallSummary";

import { EmailerTracker } from "./tracker/EmailerTracker";

const ALL_SCENARIOS: EmailScenario[] = [
  ...ALL_POST_CALL_SCENARIOS,
  ...ALL_DAILY_SCENARIOS,
  ...ALL_WEEKLY_SCENARIOS,
  ...ALL_MONTHLY_SCENARIOS,
  ...ALL_EOC_SCENARIOS,
];

type DesignVersion = "new" | "previous" | "compare";

function renderNew(scenario: EmailScenario) {
  switch (scenario.email_type) {
    case "post_call":
      return <PostCallSummary data={scenario} />;
    case "daily":
      return <DailyDigest data={scenario} />;
    case "weekly":
      return <WeeklyPerformance data={scenario} />;
    case "monthly":
      return <MonthlyValueReport data={scenario} />;
    case "eoc":
      return <EndOfCampaignReport data={scenario} />;
  }
}

function renderLegacy(scenario: EmailScenario) {
  switch (scenario.email_type) {
    case "post_call":
      return <LegacyPostCallSummary data={scenario} />;
    case "daily":
      return <LegacyDailyDigest data={scenario} />;
    case "weekly":
      return <LegacyWeeklyPerformance data={scenario} />;
    case "monthly":
      return <LegacyMonthlyValueReport data={scenario} />;
    case "eoc":
      return <LegacyEndOfCampaignReport data={scenario} />;
  }
}

const VERSION_KEY = "vini.emailer.design-version";
const MODE_KEY = "vini.emailer.mode";

type AppMode = "preview" | "tracker";

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(
    ALL_SCENARIOS[0]?.scenario_id ?? ""
  );
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [version, setVersion] = useState<DesignVersion>(() => {
    try {
      const stored = window.localStorage.getItem(VERSION_KEY);
      if (stored === "new" || stored === "previous" || stored === "compare") {
        return stored;
      }
    } catch {}
    return "new";
  });
  const [mode, setMode] = useState<AppMode>(() => {
    try {
      const stored = window.localStorage.getItem(MODE_KEY);
      if (stored === "preview" || stored === "tracker") return stored;
    } catch {}
    return "preview";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(VERSION_KEY, version);
    } catch {}
  }, [version]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MODE_KEY, mode);
    } catch {}
  }, [mode]);

  const selected = useMemo(
    () => ALL_SCENARIOS.find((s) => s.scenario_id === selectedId) ?? ALL_SCENARIOS[0],
    [selectedId]
  );

  if (!selected) {
    return (
      <div className="flex h-screen items-center justify-center text-text-secondary">
        No scenarios available.
      </div>
    );
  }

  const isSuppressed =
    selected.email_type === "daily" && selected.send_decision === "suppress";
  const suppressionReason =
    selected.email_type === "daily" ? selected.suppression_reason : undefined;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMobileNavOpen(false);
  };

  // Tracker mode renders a full-screen dashboard (no scenario sidebar).
  if (mode === "tracker") {
    return (
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface-background">
        <ModeToggleStrip mode={mode} onChange={setMode} />
        <div className="flex-1 overflow-hidden">
          <EmailerTracker />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface-background">
      <ModeToggleStrip mode={mode} onChange={setMode} />
      <div className="flex flex-1 overflow-hidden md:flex-row flex-col">
      {/* Mobile top bar — visible below md */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border-subtle bg-surface-card px-4 py-3 md:hidden">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-brand-primary">
            Vini · Emailer Previews
          </div>
          <div className="truncate text-xs text-text-secondary">
            {selected.scenario_name}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          className="ml-3 inline-flex min-h-[44px] items-center rounded-md bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-brand-primary-hover"
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-scenario-panel"
        >
          {mobileNavOpen ? "Close" : `Scenarios (${ALL_SCENARIOS.length})`}
        </button>
      </div>

      {/* Mobile slide-down panel */}
      <div
        id="mobile-scenario-panel"
        className={`flex-shrink-0 overflow-hidden border-b border-border-subtle bg-surface-card transition-[max-height] duration-200 ease-out md:hidden ${
          mobileNavOpen ? "max-h-[70vh]" : "max-h-0"
        }`}
      >
        <div className="scroll-thin max-h-[70vh] overflow-y-auto">
          <SidebarScenarioList
            selectedId={selected.scenario_id}
            onSelect={handleSelect}
            variant="mobile"
          />
        </div>
      </div>

      {/* Desktop sidebar — visible at md+ */}
      <div className="hidden md:flex">
        <SidebarScenarioList
          selectedId={selected.scenario_id}
          onSelect={setSelectedId}
        />
      </div>

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <ScenarioInspector scenario={selected} />

        {/* Design-version toggle · sticky strip just below the scenario inspector */}
        <DesignVersionToggle version={version} onChange={setVersion} />

        <div className="scroll-thin flex-1 overflow-y-auto">
          {version === "compare" ? (
            <CompareView scenario={selected} />
          ) : (
            <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              {version === "new" ? renderNew(selected) : renderLegacy(selected)}
            </div>
          )}
        </div>

        {isSuppressed ? (
          <SuppressedSendOverlay reason={suppressionReason} />
        ) : null}
      </main>
      </div>
    </div>
  );
}

/* ============================================================
   Top mode toggle · Email previews ↔ Rooftop tracker
   ============================================================ */
function ModeToggleStrip({
  mode,
  onChange,
}: {
  mode: AppMode;
  onChange: (m: AppMode) => void;
}) {
  return (
    <div className="flex flex-shrink-0 items-center gap-2 border-b border-border-subtle bg-surface-card px-4 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        Vini Emailer
      </span>
      <div className="inline-flex overflow-hidden rounded-md border border-border-subtle">
        <button
          type="button"
          onClick={() => onChange("preview")}
          aria-pressed={mode === "preview"}
          className={`px-3 py-1 text-[12px] font-semibold transition-colors duration-150 ${
            mode === "preview"
              ? "bg-brand-primary text-white"
              : "bg-surface-card text-text-secondary hover:bg-surface-subtle"
          }`}
        >
          Email previews
        </button>
        <button
          type="button"
          onClick={() => onChange("tracker")}
          aria-pressed={mode === "tracker"}
          className={`px-3 py-1 text-[12px] font-semibold transition-colors duration-150 ${
            mode === "tracker"
              ? "bg-brand-primary text-white"
              : "bg-surface-card text-text-secondary hover:bg-surface-subtle"
          }`}
        >
          Rooftop tracker
        </button>
      </div>
      <span className="text-[11px] text-text-muted">
        {mode === "preview"
          ? "Dealer-facing email templates · click a scenario to render"
          : "CSM-ops dashboard · per-rooftop send status with click-to-send"}
      </span>
    </div>
  );
}

/* ============================================================
   Design version toggle
   ============================================================ */
function DesignVersionToggle({
  version,
  onChange,
}: {
  version: DesignVersion;
  onChange: (v: DesignVersion) => void;
}) {
  return (
    <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-surface-card px-4 py-2.5 sm:px-6">
      <div className="flex items-center gap-2 text-[11px] text-text-secondary">
        <span className="font-semibold uppercase tracking-widest text-text-muted">
          Design version
        </span>
      </div>
      <div className="inline-flex overflow-hidden rounded-md border border-border-subtle">
        <ToggleButton
          active={version === "new"}
          onClick={() => onChange("new")}
          label="New"
          sublabel="Dealer-report"
        />
        <ToggleButton
          active={version === "previous"}
          onClick={() => onChange("previous")}
          label="Previous"
          sublabel="EmailShell v1"
        />
        <ToggleButton
          active={version === "compare"}
          onClick={() => onChange("compare")}
          label="Compare"
          sublabel="Side by side"
        />
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  sublabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sublabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-start px-3 py-1.5 text-left transition-colors duration-150 ${
        active
          ? "bg-brand-soft text-brand-primary"
          : "bg-surface-card text-text-secondary hover:bg-surface-subtle"
      }`}
    >
      <span className="text-[12px] font-semibold leading-tight">{label}</span>
      <span className="text-[9px] uppercase tracking-widest text-text-muted">
        {sublabel}
      </span>
    </button>
  );
}

/* ============================================================
   Side-by-side compare view
   ============================================================ */
function CompareView({ scenario }: { scenario: EmailScenario }) {
  return (
    <div className="grid grid-cols-1 divide-y divide-border-subtle lg:grid-cols-2 lg:divide-x lg:divide-y-0">
      <div className="min-w-0">
        <div className="sticky top-0 z-10 border-b border-border-subtle bg-brand-soft px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-primary sm:px-6">
          New · Dealer-report
        </div>
        <div className="scroll-thin overflow-x-auto px-4 py-4 sm:px-6 sm:py-6">
          {renderNew(scenario)}
        </div>
      </div>
      <div className="min-w-0">
        <div className="sticky top-0 z-10 border-b border-border-subtle bg-surface-subtle px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-text-muted sm:px-6">
          Previous · EmailShell v1
        </div>
        <div className="scroll-thin overflow-x-auto px-4 py-4 sm:px-6 sm:py-6">
          {renderLegacy(scenario)}
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
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

const ALL_SCENARIOS: EmailScenario[] = [
  ...ALL_POST_CALL_SCENARIOS,
  ...ALL_DAILY_SCENARIOS,
  ...ALL_WEEKLY_SCENARIOS,
  ...ALL_MONTHLY_SCENARIOS,
  ...ALL_EOC_SCENARIOS,
];

function renderEmail(scenario: EmailScenario) {
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

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(
    ALL_SCENARIOS[0]?.scenario_id ?? ""
  );
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

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

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface-background md:flex-row">
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

        <div className="scroll-thin flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {renderEmail(selected)}
        </div>

        {isSuppressed ? (
          <SuppressedSendOverlay reason={suppressionReason} />
        ) : null}
      </main>
    </div>
  );
}

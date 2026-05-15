import {
  ALL_DAILY_SCENARIOS,
  ALL_EOC_SCENARIOS,
  ALL_MONTHLY_SCENARIOS,
  ALL_WEEKLY_SCENARIOS,
  type EmailScenario,
} from "@test-data";

type SidebarScenarioListProps = {
  selectedId: string;
  onSelect: (id: string) => void;
  variant?: "desktop" | "mobile";
};

const SECTION_LABEL: Record<string, string> = {
  daily: "Daily Digest",
  weekly: "Weekly Performance",
  monthly: "Monthly Value",
  eoc: "End-of-Campaign",
};

type Section = {
  type: keyof typeof SECTION_LABEL;
  scenarios: EmailScenario[];
};

const SECTIONS: Section[] = [
  { type: "daily", scenarios: ALL_DAILY_SCENARIOS },
  { type: "weekly", scenarios: ALL_WEEKLY_SCENARIOS },
  { type: "monthly", scenarios: ALL_MONTHLY_SCENARIOS },
  { type: "eoc", scenarios: ALL_EOC_SCENARIOS },
];

function ScenarioRow({
  scenario,
  active,
  onSelect,
}: {
  scenario: EmailScenario;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const suppressed =
    "send_decision" in scenario && scenario.send_decision === "suppress";

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(scenario.scenario_id)}
        className={`group flex min-h-[44px] w-full flex-col rounded-md px-3 py-3 text-left transition-colors ${
          active
            ? "bg-brand-primary/10 ring-1 ring-brand-primary/30"
            : "hover:bg-surface-background"
        }`}
      >
        <div className="flex items-start gap-2">
          <span
            className={`mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${
              suppressed
                ? "bg-text-muted"
                : active
                ? "bg-brand-primary"
                : "bg-border-subtle group-hover:bg-text-muted"
            }`}
          />
          <div className="min-w-0 flex-1">
            <div
              className={`truncate text-sm font-medium ${
                active ? "text-brand-primary" : "text-text-primary"
              }`}
            >
              {scenario.scenario_name}
            </div>
            <div className="mt-0.5 truncate font-mono text-[10px] text-text-muted">
              {scenario.scenario_id}
            </div>
          </div>
        </div>
      </button>
    </li>
  );
}

export function SidebarScenarioList({
  selectedId,
  onSelect,
  variant = "desktop",
}: SidebarScenarioListProps) {
  const totalCount = SECTIONS.reduce((acc, s) => acc + s.scenarios.length, 0);
  const isMobile = variant === "mobile";

  const sectionList = (
    <>
      {SECTIONS.map((section) => (
        <div key={section.type} className="mb-5">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
              {SECTION_LABEL[section.type]}
            </h3>
            <span className="text-[10px] font-medium tabular text-text-muted">
              {section.scenarios.length}
            </span>
          </div>
          <ul className="mt-2 space-y-0.5">
            {section.scenarios.map((s) => (
              <ScenarioRow
                key={s.scenario_id}
                scenario={s}
                active={s.scenario_id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  );

  if (isMobile) {
    return (
      <nav className="px-3 py-4">
        <div className="px-2 pb-3 text-xs text-text-secondary">
          {totalCount} scenarios across {SECTIONS.length} email types
        </div>
        {sectionList}
      </nav>
    );
  }

  return (
    <aside className="flex h-screen w-[260px] flex-shrink-0 flex-col border-r border-border-subtle bg-surface-card">
      <div className="border-b border-border-subtle px-5 py-5">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-brand-primary">
          Vini · Emailer Previews
        </div>
        <div className="mt-1.5 text-xs leading-relaxed text-text-secondary">
          {totalCount} scenarios across {SECTIONS.length} email types
        </div>
      </div>

      <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-4">{sectionList}</nav>

      <div className="border-t border-border-subtle px-5 py-3 text-[10px] leading-relaxed text-text-muted">
        Static preview · backend not wired. Swap{" "}
        <code className="font-mono">@test-data</code> imports for API responses.
      </div>
    </aside>
  );
}

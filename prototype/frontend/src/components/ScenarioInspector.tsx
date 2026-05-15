import type { EmailScenario } from "@test-data";

type ScenarioInspectorProps = {
  scenario: EmailScenario;
};

const EMAIL_TYPE_LABEL: Record<string, string> = {
  daily: "Daily Digest",
  weekly: "Weekly Performance",
  monthly: "Monthly Value",
  eoc: "End-of-Campaign",
};

/**
 * Inspector strip — engineer-facing. Shows scenario id/notes for QA only.
 * The email rendered underneath is the client-facing surface and must stay
 * clean. This bar does NOT render inside the email shell.
 */
export function ScenarioInspector({ scenario }: ScenarioInspectorProps) {
  const suppressed =
    "send_decision" in scenario && scenario.send_decision === "suppress";

  return (
    <div className="border-b border-border-subtle bg-surface-card px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
      <div className="mx-auto max-w-full sm:max-w-2xl lg:max-w-3xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wider sm:gap-2 sm:text-[11px]">
              <span className="rounded-full bg-text-primary px-2 py-0.5 font-semibold text-white">
                {EMAIL_TYPE_LABEL[scenario.email_type]}
              </span>
              <span className="font-mono text-text-secondary">
                {scenario.scenario_id}
              </span>
              {suppressed ? (
                <span className="rounded-full border border-border-subtle px-2 py-0.5 font-semibold text-text-secondary">
                  Suppressed in production
                </span>
              ) : (
                <span className="rounded-full border border-border-subtle px-2 py-0.5 font-semibold text-text-secondary">
                  Live preview
                </span>
              )}
            </div>
            <h2 className="mt-2 text-sm font-semibold text-text-primary sm:text-base">
              {scenario.scenario_name}
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-text-secondary sm:text-xs">
              {scenario.scenario_notes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import {
  Card,
  PageHeading,
  Pill,
  SectionLabel,
} from "../components/ui";
import { ACTIVE_RECIPIENTS, EMAIL_TYPE_LABELS } from "../data/platform-mock";

const EMAIL_TYPES: Array<"daily" | "weekly" | "monthly" | "eoc"> = [
  "daily",
  "weekly",
  "monthly",
  "eoc",
];

export function CustomizationOverview() {
  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 max-w-6xl mx-auto">
      <PageHeading
        title="Email customization"
        subtitle="Who at your dealership receives which Vini report."
      />

      <Card className="overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-border-subtle flex items-baseline justify-between">
          <SectionLabel>Subscription matrix</SectionLabel>
          <Link
            to="/settings/recipients"
            className="text-brand-primary text-sm font-medium hover:underline"
          >
            Manage recipients
          </Link>
        </div>
        <div className="-mx-px overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-surface-background">
              <tr className="text-left text-[11px] uppercase tracking-wide text-text-secondary">
                <th className="px-5 sm:px-6 py-3 font-medium">Recipient</th>
                {EMAIL_TYPES.map((t) => (
                  <th key={t} className="px-3 py-3 font-medium text-center">
                    {EMAIL_TYPE_LABELS[t]}
                  </th>
                ))}
                <th className="px-5 sm:px-6 py-3 font-medium text-right">Edit</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVE_RECIPIENTS.map((r) => (
                <tr key={r.email} className="border-t border-border-subtle">
                  <td className="px-5 sm:px-6 py-3.5">
                    <div className="font-medium text-text-primary">{r.display_name}</div>
                    <div className="text-xs text-text-secondary">{r.email}</div>
                  </td>
                  {EMAIL_TYPES.map((t) => {
                    const subscribed = r.subscriptions.some((s) => s.email_type === t);
                    return (
                      <td key={t} className="px-3 py-3.5 text-center">
                        {subscribed ? (
                          <Pill tone="brand">On</Pill>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-5 sm:px-6 py-3.5 text-right">
                    <Link
                      to={`/settings/subscriptions/${encodeURIComponent(r.email)}`}
                      className="text-brand-primary text-sm font-medium hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-5 sm:p-6">
          <SectionLabel>How defaults work</SectionLabel>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            New recipients inherit subscriptions based on their role. A Sales Manager
            starts with the Sales-filtered Daily, Weekly, and Monthly reports plus
            outbound campaign reports. You can fine-tune from there per recipient.
          </p>
        </Card>
        <Card className="p-5 sm:p-6">
          <SectionLabel>Coming next</SectionLabel>
          <ul className="mt-2 space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-text-muted">•</span>
              <span>Slack and SMS delivery channels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-text-muted">•</span>
              <span>Custom report builder for groups with multiple rooftops</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-text-muted">•</span>
              <span>Event-triggered notifications (campaign milestones, anomalies)</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  PageHeading,
  Pill,
  PrimaryCTA,
  SectionLabel,
} from "../components/ui";
import {
  ACTIVE_RECIPIENTS,
  EMAIL_TYPE_LABELS,
} from "../data/platform-mock";
import { AddRecipientDrawer } from "../components/AddRecipientDrawer";

const ROLE_LABELS: Record<string, string> = {
  dealer_principal: "Dealer Principal",
  general_manager: "General Manager",
  sales_manager: "Sales Manager",
  service_manager: "Service Manager",
  bdc_manager: "BDC Manager",
  ob_campaign_manager: "Campaign Manager",
  fixed_ops_director: "Fixed Ops Director",
};

export function RecipientsList() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const recipients = useMemo(() => ACTIVE_RECIPIENTS, []);

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 max-w-6xl mx-auto">
      <PageHeading
        title="Recipients"
        subtitle="Manage who at your dealership receives Vini reporting emails."
        trailing={
          <PrimaryCTA onClick={() => setDrawerOpen(true)}>
            Add recipient
          </PrimaryCTA>
        }
      />

      <Card className="overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-border-subtle">
          <SectionLabel>{recipients.length} active recipients</SectionLabel>
        </div>
        <div className="-mx-px overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-surface-background">
              <tr className="text-left text-[11px] uppercase tracking-wide text-text-secondary">
                <th className="px-5 sm:px-6 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Role</th>
                <th className="px-3 py-3 font-medium">Email</th>
                <th className="px-3 py-3 font-medium">Subscriptions</th>
                <th className="px-5 sm:px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr
                  key={r.email}
                  className="border-t border-border-subtle hover:bg-surface-background"
                >
                  <td className="px-5 sm:px-6 py-3.5 font-medium text-text-primary">
                    {r.display_name}
                  </td>
                  <td className="px-3 py-3.5">
                    <Pill tone="neutral">{ROLE_LABELS[r.role] ?? r.role}</Pill>
                  </td>
                  <td className="px-3 py-3.5 text-text-secondary">{r.email}</td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex flex-wrap gap-1">
                      {r.subscriptions.map((s) => (
                        <Pill key={s.email_type} tone="brand">
                          {EMAIL_TYPE_LABELS[s.email_type]}
                        </Pill>
                      ))}
                    </span>
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-right">
                    <Link
                      to={`/settings/subscriptions/${encodeURIComponent(r.email)}`}
                      className="text-brand-primary font-medium hover:underline"
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

      <AddRecipientDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

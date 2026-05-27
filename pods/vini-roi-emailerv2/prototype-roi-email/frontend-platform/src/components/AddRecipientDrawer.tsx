import { useState, useEffect } from "react";
import { PrimaryCTA, SectionLabel } from "./ui";

const ROLES = [
  { key: "dealer_principal", label: "Dealer Principal / Owner" },
  { key: "general_manager", label: "General Manager" },
  { key: "sales_manager", label: "Sales Manager" },
  { key: "service_manager", label: "Service Manager" },
  { key: "bdc_manager", label: "BDC Manager" },
  { key: "ob_campaign_manager", label: "Campaign Manager" },
  { key: "fixed_ops_director", label: "Fixed Ops Director" },
];

const ROLE_DEFAULTS: Record<string, string[]> = {
  dealer_principal: ["monthly", "eoc"],
  general_manager: ["daily", "weekly", "monthly", "eoc"],
  sales_manager: ["daily", "weekly", "monthly", "eoc"],
  service_manager: ["daily", "weekly", "monthly", "eoc"],
  bdc_manager: ["daily", "weekly", "eoc"],
  ob_campaign_manager: ["weekly", "eoc"],
  fixed_ops_director: ["weekly", "monthly"],
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AddRecipientDrawer({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("general_manager");

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  const defaults = ROLE_DEFAULTS[role] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside className="relative ml-auto h-full w-full sm:w-[440px] bg-surface-card shadow-xl overflow-y-auto">
        <header className="sticky top-0 bg-surface-card border-b border-border-subtle px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Add recipient</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] grid place-items-center text-text-secondary hover:text-text-primary"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="p-5 space-y-5">
          <Field label="Full name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Priya Iyer"
              className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </Field>

          <Field label="Email address">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@dealership.com"
              className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </Field>

          <Field label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            >
              {ROLES.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[13px] text-text-secondary">
              Subscriptions for this role default to:{" "}
              <span className="font-medium text-text-primary">
                {defaults.length ? defaults.join(", ") : "none"}
              </span>
            </p>
          </Field>

          <div>
            <SectionLabel>Rooftop access</SectionLabel>
            <div className="mt-2 p-3 rounded-md border border-border-subtle bg-surface-background text-sm text-text-secondary">
              Honda of Downtown LA (1 rooftop)
            </div>
          </div>
        </div>

        <footer className="sticky bottom-0 bg-surface-card border-t border-border-subtle px-5 py-4 flex justify-end gap-2">
          <PrimaryCTA variant="outline" onClick={onClose}>
            Cancel
          </PrimaryCTA>
          <PrimaryCTA onClick={onClose}>Add recipient</PrimaryCTA>
        </footer>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

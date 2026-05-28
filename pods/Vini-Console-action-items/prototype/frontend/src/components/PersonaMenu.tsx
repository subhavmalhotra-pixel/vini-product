import { useEffect, useRef, useState } from "react";
import type { User } from "@test-data";
import { useCurrentUser } from "../data/useStore";
import { listUsers } from "../data/store";
import { CheckIcon, ChevronDownIcon } from "./Icon";

/**
 * Persona switcher styled as a polished user menu (Linear / Vercel pattern).
 *
 * Button:  avatar + name + role · subtle border + shadow-xs · hover lift
 * Popover: header "View as" · 4 persona rows w/ avatar+role+active check
 *
 * Drives the role-aware initial-filter default in ActionItemsPage via the
 * useCurrentUser hook (localStorage-backed).
 */
export function PersonaMenu() {
  const { user, userId, setUserId } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside-click + Escape
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // The 4 demo personas (BDC Agent, BDC Manager, Service Manager, GM)
  const personas: User[] = listUsers().filter(
    (u) =>
      u.user_id === "u-marcus" ||
      u.user_id === "u-trevor" ||
      u.user_id === "u-anya" ||
      u.user_id === "u-edgar"
  );

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-md border bg-surface-card pl-1 pr-2 py-1 text-left shadow-xs transition-all duration-150 ${
          open
            ? "border-brand-purple shadow-sm"
            : "border-border-subtle hover:border-border-strong hover:shadow-sm"
        }`}
      >
        <Avatar initials={user.avatar_initials} ai={user.user_id === "vini_agent"} />
        <div className="leading-tight">
          <div className="text-[12px] font-semibold text-text-primary">
            {user.display_name}
          </div>
          <div className="text-[10px] text-text-tertiary">
            {formatRole(user.role)}
          </div>
        </div>
        <ChevronDownIcon
          size={13}
          className={`ml-0.5 text-text-tertiary transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="animate-pop-in absolute right-0 top-full z-40 mt-2 w-[260px] origin-top-right overflow-hidden rounded-lg border border-border-subtle bg-surface-card shadow-lg"
        >
          <div className="border-b border-border-subtle bg-surface-subtle/60 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              View as
            </div>
            <p className="mt-0.5 text-[11px] leading-snug text-text-secondary">
              Demo affordance — defaults the filter + "Mine" by role.
            </p>
          </div>
          <ul className="py-1">
            {personas.map((p) => {
              const active = p.user_id === userId;
              return (
                <li key={p.user_id}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      setUserId(p.user_id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors duration-100 ${
                      active
                        ? "bg-brand-purple-soft/60"
                        : "hover:bg-surface-subtle"
                    }`}
                  >
                    <Avatar
                      initials={p.avatar_initials}
                      ai={p.user_id === "vini_agent"}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-semibold text-text-primary">
                        {p.display_name}
                      </div>
                      <div className="truncate text-[11px] text-text-tertiary">
                        {formatRole(p.role)}
                      </div>
                    </div>
                    {active ? (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-purple text-white">
                        <CheckIcon size={10} />
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border-subtle bg-surface-subtle/60 px-3 py-2 text-[10px] text-text-tertiary">
            MB Laguna Niguel · single rooftop
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Avatar({ initials, ai }: { initials: string; ai: boolean }) {
  return (
    <div
      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white ${
        ai ? "bg-brand-purple" : "bg-text-secondary"
      }`}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function formatRole(role: string): string {
  switch (role) {
    case "bdc_agent":
      return "BDC Agent";
    case "bdc_manager":
      return "BDC Manager";
    case "service_manager":
      return "Service Manager";
    case "sales_manager":
      return "Sales Manager";
    case "general_manager":
      return "General Manager";
    case "service_advisor":
      return "Service Advisor";
    case "sales_advisor":
      return "Sales Advisor";
    case "dealer_principal":
      return "Dealer Principal";
    default:
      return role;
  }
}

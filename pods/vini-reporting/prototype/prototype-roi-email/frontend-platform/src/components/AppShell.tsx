import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

const NAV_ITEMS: Array<{
  to: string;
  label: string;
  phase?: "phase3-preview";
}> = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/settings/recipients", label: "Recipients" },
  { to: "/settings/customization", label: "Email customization" },
  { to: "/logs", label: "Sent emails", phase: "phase3-preview" },
];

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-full bg-surface-background text-text-primary">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-surface-card border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-brand-primary grid place-items-center text-white text-[11px] font-bold">
            V
          </div>
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-wide text-text-secondary">
              Vini Reporting
            </div>
            <div className="text-sm font-semibold">Honda of Downtown LA</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          className="min-h-[44px] min-w-[44px] grid place-items-center text-text-secondary"
          aria-label="Toggle navigation"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileNavOpen ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-[60px]">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <nav className="relative bg-surface-card border-b border-border-subtle">
            <ul className="py-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-2 min-h-[44px] px-4 text-sm font-medium ${
                        isActive
                          ? "bg-brand-primary/5 text-brand-primary"
                          : "text-text-primary hover:bg-surface-background"
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    {item.phase === "phase3-preview" && (
                      <span className="text-[10px] uppercase tracking-wide font-bold text-text-muted border border-border-subtle rounded-full px-1.5 py-0.5">
                        Phase 3
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-[240px] md:shrink-0 md:h-screen md:sticky md:top-0 border-r border-border-subtle bg-surface-card">
          <div className="px-5 py-5 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-brand-primary grid place-items-center text-white text-xs font-bold">
                V
              </div>
              <div className="leading-tight">
                <div className="text-[11px] uppercase tracking-wide text-text-secondary">
                  Vini Reporting
                </div>
                <div className="text-sm font-semibold">Honda of Downtown LA</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 py-3">
            <ul className="space-y-0.5 px-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-2 min-h-[40px] px-3 rounded-md text-sm font-medium ${
                        isActive
                          ? "bg-brand-primary/8 text-brand-primary"
                          : "text-text-primary hover:bg-surface-background"
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    {item.phase === "phase3-preview" && (
                      <span className="text-[9px] uppercase tracking-wide font-bold text-text-muted border border-border-subtle rounded-full px-1.5 py-0.5">
                        P3
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="px-4 py-3 border-t border-border-subtle text-[11px] text-text-muted">
            Phase 2 preview · static mock data
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import type { ComponentType, ReactNode } from "react";
import { PersonaMenu } from "./PersonaMenu";
import {
  HomeIcon,
  FilmIcon,
  SparklesIcon,
  ChartIcon,
  BarChartIcon,
  SettingsIcon,
  MoreHorizontalIcon,
  RobotIcon,
  PhoneIcon,
  ChatIcon,
  ClipboardListIcon,
  CalendarIcon,
  MegaphoneIcon,
  UsersIcon,
  InboxIcon,
  MenuIcon,
  GlobeIcon,
  MailEnvelopeIcon,
} from "./Icon";

/**
 * Spyne Retail Suite shell. Tight density · SVG icons · no emoji.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-background">
      <SideRail />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <div className="flex flex-1 overflow-hidden">
          <ViniSubNav />
          <main className="flex-1 overflow-auto scroll-thin">{children}</main>
        </div>
      </div>
    </div>
  );
}

type SideRailItem = {
  icon: ComponentType<{ size?: number }>;
  label: string;
  active?: boolean;
};

const RAIL_ITEMS: SideRailItem[] = [
  { icon: HomeIcon, label: "Home" },
  { icon: FilmIcon, label: "Studio AI" },
  { icon: SparklesIcon, label: "Vini AI", active: true },
  { icon: ChartIcon, label: "Marketing" },
  { icon: BarChartIcon, label: "Analytics" },
  { icon: SettingsIcon, label: "Settings" },
  { icon: MoreHorizontalIcon, label: "More" },
];

function SideRail() {
  return (
    <aside className="flex w-[72px] flex-shrink-0 flex-col items-center gap-0.5 border-r border-border-subtle bg-white py-2">
      <button
        className="mb-1 flex h-9 w-9 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-subtle hover:text-text-secondary"
        aria-label="Toggle menu"
      >
        <MenuIcon size={18} />
      </button>
      {RAIL_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            className="flex w-full flex-col items-center gap-0.5 py-1.5"
            aria-label={item.label}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                item.active
                  ? "bg-brand-purple-soft text-brand-purple"
                  : "text-text-tertiary hover:bg-surface-subtle hover:text-text-secondary"
              }`}
            >
              <Icon size={18} />
            </span>
            <span
              className={`text-[10px] leading-none ${
                item.active
                  ? "font-semibold text-brand-purple"
                  : "font-medium text-text-tertiary"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}

function TopHeader() {
  return (
    <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border-subtle bg-surface-card px-5">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-purple text-xs font-bold text-white">
            S
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-text-primary">
              Retail Suite
            </div>
            <div className="text-[10px] text-text-tertiary">by spyne</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/docs"
          className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-card px-2.5 py-1 text-xs font-medium text-text-secondary transition-all duration-150 hover:border-brand-purple hover:bg-brand-purple-soft hover:text-brand-purple hover:shadow-sm"
          title="Signal, PRD, ICP, Design"
        >
          <MailEnvelopeIcon size={13} /> Docs
        </Link>
        <div className="flex items-center gap-1.5 rounded-md border border-brand-purple-border bg-brand-purple-soft px-2.5 py-1">
          <span className="text-xs font-semibold text-brand-purple">
            Studio AI
          </span>
          <span className="rounded-sm bg-brand-purple px-1 py-px text-[9px] font-bold tracking-wide text-white">
            PRO
          </span>
        </div>
        <button className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-card px-2.5 py-1 text-xs font-medium text-text-secondary transition-all duration-150 hover:bg-surface-subtle hover:shadow-sm">
          <GlobeIcon size={14} /> Website
        </button>

        {/* Persona switcher — polished user menu (popover) */}
        <div className="ml-1 border-l border-border-subtle pl-2">
          <PersonaMenu />
        </div>
      </div>
    </header>
  );
}

type ViniNavItem = {
  icon: ComponentType<{ size?: number }>;
  label: string;
  to: string;
  badge?: number;
};

function ViniSubNav() {
  const location = useLocation();
  const isActionItems = location.pathname.startsWith("/action-items");

  const items: (ViniNavItem & { active?: boolean })[] = [
    { icon: BarChartIcon, label: "Overview", to: "#" },
    { icon: RobotIcon, label: "Agents", to: "#" },
    { icon: PhoneIcon, label: "Calls", to: "#" },
    { icon: ChatIcon, label: "Conversations", to: "#" },
    {
      icon: ClipboardListIcon,
      label: "Action Items",
      to: "/action-items/pending",
      active: isActionItems,
      badge: 12,
    },
    { icon: CalendarIcon, label: "Appointments", to: "#" },
    { icon: MegaphoneIcon, label: "Campaigns", to: "#" },
    { icon: UsersIcon, label: "Customers", to: "#" },
    { icon: InboxIcon, label: "Reports", to: "#" },
  ];

  return (
    <aside className="flex w-[200px] flex-shrink-0 flex-col gap-0.5 border-r border-border-subtle bg-white px-2 py-3">
      <div className="mb-2 flex items-center gap-1.5 px-2 py-1">
        <SparklesIcon size={14} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
          Vini AI
        </span>
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const className = `group flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors ${
          item.active
            ? "bg-brand-purple-soft text-brand-purple"
            : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
        }`;
        const inner = (
          <>
            <Icon size={15} />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span
                className={`tabular text-[10px] font-semibold ${
                  item.active
                    ? "rounded bg-brand-purple px-1.5 py-px text-white"
                    : "text-text-tertiary"
                }`}
              >
                {item.badge}
              </span>
            ) : null}
          </>
        );
        return item.to.startsWith("/") ? (
          <Link key={item.label} to={item.to} className={className}>
            {inner}
          </Link>
        ) : (
          <button key={item.label} type="button" className={className}>
            {inner}
          </button>
        );
      })}
    </aside>
  );
}

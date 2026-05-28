import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { ActionItem } from "@test-data";
import { getActionItems, getCurrentUserId } from "../data/store";
import { useStore, useCurrentUser } from "../data/useStore";
import { useActionItemsKeyboard } from "../data/useKeyboard";
import { ageMinutes, slaState, deptOf } from "../data/helpers";
import { FilterStrip, type PendingFilters } from "../components/FilterStrip";
import { RollupStrip } from "../components/RollupStrip";
import { PendingRow } from "../components/PendingRow";
import { CompletedView } from "../components/CompletedView";
import { EmptyState } from "../components/EmptyState";
import { AssignDrawer } from "../components/AssignDrawer";
import { CloseDrawer } from "../components/CloseDrawer";
import { BulkCloseDrawer } from "../components/BulkCloseDrawer";
import { SourceDrawer } from "../components/SourceDrawer";
import { HelpDrawer } from "../components/HelpDrawer";
import { ClipboardListIcon, ClockIcon, CheckIcon } from "../components/Icon";

const ASSIGNMENT_FILTER_KEY = "vini.actionItems.assignmentFilter";

function buildInitialFilters(role: string | undefined): PendingFilters {
  // Phase 1 design contract #11 — role-aware default. BDC Agents land on
  // "Mine"; everyone else lands on "All". Last-used value persists per user
  // in localStorage and overrides the role default after the first session.
  let persistedAssignment: PendingFilters["assignment"] | null = null;
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(
        `${ASSIGNMENT_FILTER_KEY}.${getCurrentUserId()}`
      );
      if (
        stored === "all" ||
        stored === "mine" ||
        stored === "others" ||
        stored === "unassigned"
      ) {
        persistedAssignment = stored;
      }
    } catch {
      // localStorage unavailable — fall through to role default
    }
  }

  return {
    assignment:
      persistedAssignment ?? (role === "bdc_agent" ? "mine" : "all"),
    intentIds: [],
    channels: [],
    age: "all",
    dept: "all",
    search: "",
    repeatCaller: false,
  };
}

export function ActionItemsPage({ tab }: { tab: "pending" | "completed" }) {
  useStore();
  const { user, userId } = useCurrentUser();

  // Re-seed initial filters when the active user changes (persona switcher).
  const [filters, setFiltersState] = useState<PendingFilters>(() =>
    buildInitialFilters(user?.role)
  );

  // Re-build defaults whenever the active user changes (persona switcher
  // in TopHeader). The persisted value, if any, takes precedence.
  const lastUserIdRef = useRef(userId);
  useEffect(() => {
    if (lastUserIdRef.current !== userId) {
      lastUserIdRef.current = userId;
      setFiltersState(buildInitialFilters(user?.role));
    }
  }, [userId, user?.role]);

  const setFilters = useCallback((next: PendingFilters) => {
    setFiltersState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          `${ASSIGNMENT_FILTER_KEY}.${getCurrentUserId()}`,
          next.assignment
        );
      } catch {
        // ignore
      }
    }
  }, []);

  const [assignItem, setAssignItem] = useState<ActionItem | null>(null);
  const [closeItem, setCloseItem] = useState<ActionItem | null>(null);
  const [sourceItem, setSourceItem] = useState<ActionItem | null>(null);
  const [bulkItems, setBulkItems] = useState<ActionItem[] | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const pending = getActionItems("pending");
  const completed = getActionItems("completed");

  const filteredPending = useMemo(
    () => filterAndSortPending(pending, filters, userId),
    [pending, filters, userId]
  );

  const isPending = tab === "pending";

  // Keep focusedIndex in range when the filtered list changes
  useEffect(() => {
    if (filteredPending.length === 0) {
      setFocusedIndex(-1);
    } else if (focusedIndex >= filteredPending.length) {
      setFocusedIndex(filteredPending.length - 1);
    }
  }, [filteredPending.length, focusedIndex]);

  const focusedItem =
    focusedIndex >= 0 ? filteredPending[focusedIndex] : null;

  const anyDrawerOpen =
    !!assignItem || !!closeItem || !!sourceItem || !!bulkItems || helpOpen;

  useActionItemsKeyboard(
    useMemo(
      () => ({
        onNext: () => {
          if (filteredPending.length === 0) return;
          setFocusedIndex((i) =>
            Math.min(filteredPending.length - 1, i < 0 ? 0 : i + 1)
          );
        },
        onPrev: () => {
          if (filteredPending.length === 0) return;
          setFocusedIndex((i) => Math.max(0, i < 0 ? 0 : i - 1));
        },
        onAssign: () => {
          if (focusedItem) setAssignItem(focusedItem);
        },
        onClose: () => {
          if (focusedItem) setCloseItem(focusedItem);
        },
        onListen: () => {
          if (focusedItem) setSourceItem(focusedItem);
        },
        onHelp: () => setHelpOpen(true),
      }),
      [filteredPending.length, focusedItem]
    ),
    isPending && !anyDrawerOpen
  );

  // Scroll the focused row into view when J/K navigation moves the focus.
  useEffect(() => {
    if (focusedIndex < 0) return;
    const rows = document.querySelectorAll("[data-pending-row]");
    const el = rows[focusedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focusedIndex]);

  return (
    <div className="flex h-full flex-col">
      {/* Page header — title · meta · phase-2 ghost · tabs */}
      <div className="border-b border-border-subtle bg-surface-card px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-purple text-white shadow-xs">
              <ClipboardListIcon size={17} />
            </span>
            <div>
              <h1 className="text-[20px] font-semibold leading-tight tracking-tight text-text-primary">
                Action Items
              </h1>
              <p className="mt-0.5 text-[12px] text-text-tertiary">
                Customer tasks waiting on the team
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Phase 2 hook · Add action manually (BDC agents) */}
            <Phase2GhostButton
              label="Add action"
              tooltip="Manual creation by BDC agents. Coming in Phase 2."
              icon="+"
            />
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (press ?)"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle bg-surface-card text-[13px] font-mono font-semibold text-text-secondary shadow-xs transition-all duration-150 hover:border-brand-purple hover:bg-brand-purple-soft hover:text-brand-purple hover:shadow-sm"
            >
              ?
            </button>
          </div>
        </div>

        {/* Tabs — parenthetical counts per Spyne DESIGN_SYSTEM.
            (`Pending (12)` not a chip badge alongside the count.)
            Team tab locked behind a Phase 2 affordance. */}
        <nav
          className="mt-4 -mb-px flex items-center gap-0"
          aria-label="Action item views"
        >
          <TabLink to="/action-items/pending" active={isPending}>
            <ClockIcon size={13} />
            Pending&nbsp;<span className="tabular text-text-tertiary">({pending.length})</span>
          </TabLink>
          <TabLink to="/action-items/completed" active={!isPending}>
            <CheckIcon size={13} />
            Completed&nbsp;<span className="tabular text-text-tertiary">({completed.length})</span>
          </TabLink>
          <Phase2Tab label="Team" />
        </nav>
      </div>

      {isPending ? (
        <>
          {/* Lite-rollup strip (Phase 1 design contract #9) */}
          <RollupStrip
            pending={pending}
            filters={filters}
            onFilterChange={setFilters}
          />
          <FilterStrip filters={filters} onChange={setFilters} />
          <div className="flex-1 overflow-y-auto scroll-thin">
            {filteredPending.length === 0 ? (
              <EmptyState
                variant={pending.length === 0 ? "all_clear" : "no_matches"}
              />
            ) : (
              filteredPending.map((item, idx) => (
                <PendingRow
                  key={item.action_item_id}
                  item={item}
                  focused={idx === focusedIndex}
                  onFocus={() => setFocusedIndex(idx)}
                  onAssign={setAssignItem}
                  onClose={setCloseItem}
                  onListen={setSourceItem}
                  onBulkClose={setBulkItems}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <CompletedView />
      )}

      <AssignDrawer
        item={assignItem}
        onClose={() => setAssignItem(null)}
        onOpenSource={setSourceItem}
      />
      <CloseDrawer
        item={closeItem}
        onClose={() => setCloseItem(null)}
        onOpenSource={setSourceItem}
      />
      <BulkCloseDrawer
        items={bulkItems}
        onClose={() => setBulkItems(null)}
        onOpenSource={setSourceItem}
      />
      <SourceDrawer item={sourceItem} onClose={() => setSourceItem(null)} />
      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

function TabLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-1.5 px-3 pb-3 pt-1 text-[13px] font-semibold transition-colors duration-150 ${
        active
          ? "text-brand-purple"
          : "text-text-tertiary hover:text-text-secondary"
      }`}
    >
      {children}
      <span
        className={`absolute inset-x-0 bottom-0 h-[2px] rounded-t transition-all duration-200 ${
          active ? "bg-brand-purple opacity-100" : "bg-brand-purple opacity-0"
        }`}
        aria-hidden
      />
    </Link>
  );
}

/**
 * Elegant Phase 2 affordance — dashed ghost button.
 * Tooltip carries the "coming soon" copy so the chrome stays clean.
 */
function Phase2GhostButton({
  label,
  tooltip,
  icon,
}: {
  label: string;
  tooltip: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      disabled
      title={tooltip}
      className="group inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-dashed border-border-strong/70 bg-transparent px-2.5 py-1.5 text-[12px] font-medium text-text-tertiary transition-colors duration-150 hover:border-brand-purple/40 hover:text-text-secondary"
    >
      <span className="font-mono text-[13px] leading-none">{icon}</span>
      {label}
      <span className="ml-0.5 hidden text-[10px] uppercase tracking-wide text-text-tertiary/80 group-hover:text-brand-purple/60 lg:inline">
        soon
      </span>
    </button>
  );
}

function Phase2Tab({ label }: { label: string }) {
  return (
    <span
      className="relative flex cursor-not-allowed items-center gap-1.5 px-3 pb-3 pt-1 text-[13px] font-semibold text-text-tertiary opacity-70"
      title="Manager dashboard. Coming in Phase 2."
    >
      {label}
      <span className="rounded-full border border-dashed border-border-strong px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide text-text-tertiary">
        soon
      </span>
    </span>
  );
}

function filterAndSortPending(
  items: ActionItem[],
  f: PendingFilters,
  currentUserId: string
): ActionItem[] {
  let out = items;

  if (f.assignment === "mine") {
    out = out.filter((i) => i.assignee_user_id === currentUserId);
  } else if (f.assignment === "others") {
    out = out.filter(
      (i) => i.assignee_user_id && i.assignee_user_id !== currentUserId
    );
  } else if (f.assignment === "unassigned") {
    out = out.filter((i) => !i.assignee_user_id);
  }

  if (f.intentIds.length > 0) {
    out = out.filter((i) => f.intentIds.includes(i.intent_id));
  }

  if (f.channels.length > 0) {
    out = out.filter((i) => {
      if (f.channels.includes("hitl_warm_transfer")) {
        if (
          i.source_channel === "hitl_takeover" ||
          i.source_channel === "hitl_warm_transfer"
        )
          return true;
      }
      return f.channels.includes(i.source_channel);
    });
  }

  if (f.dept !== "all") {
    out = out.filter((i) => {
      const d = deptOf(i);
      return d === f.dept || d === "both" || d === "compliance";
    });
  }

  if (f.age !== "all") {
    out = out.filter((i) => {
      const mins = ageMinutes(i);
      switch (f.age) {
        case "lt4h":
          return mins < 4 * 60;
        case "lt24h":
          return mins >= 4 * 60 && mins < 24 * 60;
        case "gt24h":
          return mins >= 24 * 60;
        case "past_sla":
          return slaState(i) === "past";
        default:
          return true;
      }
    });
  }

  // Phase 1 design contract #6 — repeat-caller filter
  if (f.repeatCaller) {
    out = out.filter((i) => i.repeat_caller_count >= 3);
  }

  if (f.search.trim()) {
    const q = f.search.trim().toLowerCase();
    out = out.filter(
      (i) =>
        i.intent_recap.toLowerCase().includes(q) ||
        i.intent_id.toLowerCase().includes(q) ||
        i.customer_id.toLowerCase().includes(q)
    );
  }

  out = [...out].sort((a, b) => {
    const aMins = ageMinutes(a);
    const bMins = ageMinutes(b);
    if (aMins !== bMins) return bMins - aMins;
    return (
      (b.is_primary_intent_of_source ? 1 : 0) -
      (a.is_primary_intent_of_source ? 1 : 0)
    );
  });

  return out;
}


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
      {/* Page header — title + tabs + Phase 2 hook (Add action) + Help */}
      <div className="border-b border-border-subtle bg-white px-5 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-purple text-white">
              <ClipboardListIcon size={14} />
            </span>
            <h1 className="text-lg font-bold text-text-primary">Action Items</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Phase 2 hook — Add action manually (BDC agents) */}
            <button
              type="button"
              disabled
              title="Manual creation lands in Phase 2 — see /docs/prd-grooming"
              className="inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-border-subtle bg-white px-2.5 py-1 text-[12px] font-medium text-text-tertiary"
            >
              + Add action
              <span className="rounded bg-surface-subtle px-1 py-px text-[9px] font-bold tracking-wide text-text-tertiary">
                PHASE 2
              </span>
            </button>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (press ?)"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle bg-white text-[12px] font-mono font-bold text-text-secondary hover:border-brand-purple hover:bg-brand-purple-soft hover:text-brand-purple"
            >
              ?
            </button>
          </div>
        </div>

        {/* Tabs — Pending / Completed (+ disabled Team tab as Phase 2 hook) */}
        <nav className="mt-3 -mb-px flex items-center gap-0">
          <TabLink to="/action-items/pending" active={isPending}>
            <ClockIcon size={13} />
            Pending
            <TabBadge active={isPending}>{pending.length}</TabBadge>
          </TabLink>
          <TabLink to="/action-items/completed" active={!isPending}>
            <CheckIcon size={13} />
            Completed
            <TabBadge active={!isPending}>{completed.length}</TabBadge>
          </TabLink>
          <span
            className="flex cursor-not-allowed items-center gap-1.5 border-b-2 border-transparent px-3 pb-2.5 pt-1 text-[13px] font-semibold text-text-tertiary opacity-70"
            title="Manager dashboard lands in Phase 2"
          >
            Team
            <span className="rounded bg-surface-subtle px-1 py-px text-[9px] font-bold tracking-wide text-text-tertiary">
              PHASE 2
            </span>
          </span>
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
      className={`flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-[13px] font-semibold transition-colors ${
        active
          ? "border-brand-purple text-brand-purple"
          : "border-transparent text-text-tertiary hover:text-text-secondary"
      }`}
    >
      {children}
    </Link>
  );
}

function TabBadge({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`rounded-full px-1.5 py-px text-[10px] font-bold tabular ${
        active
          ? "bg-brand-purple text-white"
          : "bg-surface-subtle text-text-tertiary"
      }`}
    >
      {children}
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


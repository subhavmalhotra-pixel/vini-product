import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ActionItem } from "@test-data";
import { CURRENT_USER_ID, getActionItems } from "../data/store";
import { useStore } from "../data/useStore";
import { ageMinutes, slaState, deptOf } from "../data/helpers";
import { FilterStrip, type PendingFilters } from "../components/FilterStrip";
import { PendingRow } from "../components/PendingRow";
import { CompletedView } from "../components/CompletedView";
import { EmptyState } from "../components/EmptyState";
import { AssignDrawer } from "../components/AssignDrawer";
import { CloseDrawer } from "../components/CloseDrawer";
import { BulkCloseDrawer } from "../components/BulkCloseDrawer";
import { SourceDrawer } from "../components/SourceDrawer";
import { ClipboardListIcon, ClockIcon, CheckIcon } from "../components/Icon";

const INITIAL_FILTERS: PendingFilters = {
  assignment: "all",
  intentIds: [],
  channels: [],
  age: "all",
  dept: "all",
  search: "",
};

export function ActionItemsPage({ tab }: { tab: "pending" | "completed" }) {
  useStore();
  const [filters, setFilters] = useState<PendingFilters>(INITIAL_FILTERS);
  const [assignItem, setAssignItem] = useState<ActionItem | null>(null);
  const [closeItem, setCloseItem] = useState<ActionItem | null>(null);
  const [sourceItem, setSourceItem] = useState<ActionItem | null>(null);
  const [bulkItems, setBulkItems] = useState<ActionItem[] | null>(null);

  const pending = getActionItems("pending");
  const completed = getActionItems("completed");

  const filteredPending = useMemo(
    () => filterAndSortPending(pending, filters),
    [pending, filters]
  );

  const unassigned = pending.filter((i) => !i.assignee_user_id).length;
  const escalated = pending.filter((i) => i.escalation_reason).length;
  const isPending = tab === "pending";

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="border-b border-border-subtle bg-white px-5 pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-purple text-white">
              <ClipboardListIcon size={14} />
            </span>
            <h1 className="text-lg font-bold text-text-primary">Action Items</h1>
            <div className="ml-2 flex items-center gap-2 text-[12px] text-text-secondary">
              <span className="tabular font-semibold">
                {pending.length} pending
              </span>
              {unassigned > 0 ? (
                <>
                  <span className="text-text-tertiary">·</span>
                  <span className="tabular text-status-warning">
                    {unassigned} unassigned
                  </span>
                </>
              ) : null}
              {escalated > 0 ? (
                <>
                  <span className="text-text-tertiary">·</span>
                  <span className="tabular font-semibold text-status-past">
                    {escalated} escalated
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Tabs */}
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
        </nav>
      </div>

      {isPending ? (
        <>
          <FilterStrip filters={filters} onChange={setFilters} />
          <div className="flex-1 overflow-y-auto scroll-thin">
            {filteredPending.length === 0 ? (
              <EmptyState
                variant={pending.length === 0 ? "all_clear" : "no_matches"}
              />
            ) : (
              filteredPending.map((item) => (
                <PendingRow
                  key={item.action_item_id}
                  item={item}
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
  f: PendingFilters
): ActionItem[] {
  let out = items;

  if (f.assignment === "mine") {
    out = out.filter((i) => i.assignee_user_id === CURRENT_USER_ID);
  } else if (f.assignment === "others") {
    out = out.filter(
      (i) => i.assignee_user_id && i.assignee_user_id !== CURRENT_USER_ID
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

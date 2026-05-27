import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ActionItem, Channel, IntentId, ResolutionType } from "@test-data";
import { INTENT_TAXONOMY } from "@test-data";
import {
  getActionItems,
  getCustomerDetails,
  getUser,
  reopenActionItem,
} from "../data/store";
import { formatDateTime, formatDate } from "../data/helpers";
import { IntentChip, IntentDot } from "./IntentChip";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import {
  SearchIcon,
  CloseIcon,
  DownloadIcon,
  ChevronDownIcon,
  MailEnvelopeIcon,
  CheckIcon,
} from "./Icon";

/* ============================================================
   Types + constants
   ============================================================ */

const RESOLUTION_LABEL: Record<ResolutionType, string> = {
  appointment_booked: "Appointment booked",
  info_provided: "Info provided",
  customer_unreachable: "Unreachable",
  dnc: "DNC",
  other: "Other",
};

const RESOLUTION_COLOR: Record<ResolutionType, string> = {
  appointment_booked: "bg-status-ok-soft text-status-ok",
  info_provided: "bg-dept-sales-soft text-dept-sales",
  customer_unreachable: "bg-status-warning-soft text-status-warning",
  dnc: "bg-status-past-soft text-status-past",
  other: "bg-surface-subtle text-text-secondary",
};

type DateBucket = "today" | "7d" | "30d" | "all";

const DATE_OPTIONS: { value: DateBucket; label: string; days: number | null }[] = [
  { value: "today", label: "Today", days: 1 },
  { value: "7d", label: "Last 7d", days: 7 },
  { value: "30d", label: "Last 30d", days: 30 },
  { value: "all", label: "All time", days: null },
];

type GroupBy = "none" | "resolver" | "intent" | "day";

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "none", label: "Flat list" },
  { value: "day", label: "By day" },
  { value: "resolver", label: "By resolver" },
  { value: "intent", label: "By intent" },
];

type FilterState = {
  search: string;
  resolverIds: string[];
  resolutionTypes: ResolutionType[];
  intentIds: IntentId[];
  channels: Channel[];
  date: DateBucket;
};

const EMPTY_FILTERS: FilterState = {
  search: "",
  resolverIds: [],
  resolutionTypes: [],
  intentIds: [],
  channels: [],
  date: "30d",
};

const NOW_MS = new Date("2026-05-19T15:30:00-07:00").getTime();

/* ============================================================
   Main view
   ============================================================ */

export function CompletedView() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const all = useMemo(() => getActionItems("completed"), []);

  const filtered = useMemo(() => filterItems(all, filters), [all, filters]);
  const grouped = useMemo(() => groupItems(filtered, groupBy), [filtered, groupBy]);

  // Facet counts (computed against the date-filtered base — search/intent narrowed below)
  const facetBase = useMemo(() => {
    const dateOnly = { ...EMPTY_FILTERS, date: filters.date };
    return filterItems(all, dateOnly);
  }, [all, filters.date]);

  const counts = useMemo(() => computeFacetCounts(facetBase), [facetBase]);

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = (checked: boolean) => {
    setSelected(checked ? new Set(filtered.map((i) => i.action_item_id)) : new Set());
  };

  const bulkReopen = () => {
    selected.forEach((id) => reopenActionItem(id, "bulk re-open via Completed view"));
    setSelected(new Set());
  };

  const exportCsv = () => {
    const rows = [
      [
        "action_item_id",
        "customer_name",
        "intent_id",
        "resolution_type",
        "closed_at",
        "closer",
        "channel",
        "resolution_note",
      ],
      ...filtered.map((i) => [
        i.action_item_id,
        getCustomerDetails(i.customer_id)?.display_name ?? "",
        i.intent_id,
        i.resolution_type ?? "",
        i.closed_at ?? "",
        getUser(i.closed_by_user_id)?.display_name ?? "",
        i.source_channel,
        (i.resolution_note ?? "").replace(/"/g, '""'),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `vini-action-items-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalActive = filters.resolverIds.length + filters.resolutionTypes.length +
    filters.intentIds.length + filters.channels.length + (filters.search.trim() ? 1 : 0);

  return (
    <div className="flex h-full flex-col">
      {/* Top bar — search · groupBy · export · count */}
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-border-subtle bg-white px-4 py-2.5">
        <div className="relative flex-1 max-w-[420px]">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary">
            <SearchIcon size={14} />
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search customer, recap, resolution note, action ID…"
            className="w-full rounded-md border border-border-subtle bg-white py-1.5 pl-8 pr-8 text-[13px] placeholder:text-text-tertiary focus:border-brand-purple focus:outline-none"
          />
          {filters.search ? (
            <button
              onClick={() => setFilters({ ...filters, search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              aria-label="Clear search"
            >
              <CloseIcon size={12} />
            </button>
          ) : null}
        </div>

        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          className="rounded-md border border-border-subtle bg-white px-2.5 py-1.5 text-[12px] font-medium text-text-secondary focus:border-brand-purple focus:outline-none"
        >
          {GROUP_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2 text-[12px] text-text-tertiary">
          <span className="tabular">
            {filtered.length.toLocaleString()}{" "}
            {filtered.length === 1 ? "item" : "items"}
            {totalActive > 0 ? ` · ${totalActive} filter${totalActive > 1 ? "s" : ""}` : ""}
            {filtered.length !== all.length
              ? ` of ${all.length.toLocaleString()}`
              : ""}
          </span>
          {totalActive > 0 ? (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-[12px] font-medium text-brand-purple hover:underline"
            >
              Clear all
            </button>
          ) : null}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1 rounded-md border border-border-subtle bg-white px-2 py-1 text-[12px] font-medium text-text-secondary hover:bg-surface-subtle"
            title="Export filtered results"
          >
            <DownloadIcon size={12} /> CSV
          </button>
        </div>
      </div>

      {/* Facets row */}
      <div className="flex-shrink-0 border-b border-border-subtle bg-white px-4 py-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* Date bucket — segmented */}
          <div className="inline-flex overflow-hidden rounded-md border border-border-subtle">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilters({ ...filters, date: opt.value })}
                className={`px-2.5 py-1 text-[11px] font-semibold ${
                  filters.date === opt.value
                    ? "bg-brand-purple-soft text-brand-purple"
                    : "bg-white text-text-secondary hover:bg-surface-subtle"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <span className="h-4 w-px bg-border-subtle" />

          {/* Resolution facet */}
          <FacetGroup
            label="Resolution"
            options={(Object.keys(RESOLUTION_LABEL) as ResolutionType[]).map((r) => ({
              value: r,
              label: RESOLUTION_LABEL[r],
              count: counts.resolutions[r] ?? 0,
            }))}
            selected={filters.resolutionTypes}
            onToggle={(v) => {
              const has = filters.resolutionTypes.includes(v);
              setFilters({
                ...filters,
                resolutionTypes: has
                  ? filters.resolutionTypes.filter((x) => x !== v)
                  : [...filters.resolutionTypes, v],
              });
            }}
          />

          {/* Resolver facet */}
          <FacetGroup
            label="Closed by"
            options={Object.entries(counts.resolvers)
              .map(([uid, n]) => ({
                value: uid,
                label: getUser(uid)?.display_name ?? uid,
                count: n,
              }))
              .sort((a, b) => b.count - a.count)}
            selected={filters.resolverIds}
            onToggle={(v) => {
              const has = filters.resolverIds.includes(v);
              setFilters({
                ...filters,
                resolverIds: has
                  ? filters.resolverIds.filter((x) => x !== v)
                  : [...filters.resolverIds, v],
              });
            }}
          />

          {/* Intent facet */}
          <FacetGroup
            label="Intent"
            options={Object.entries(counts.intents)
              .map(([iid, n]) => ({
                value: iid as IntentId,
                label: INTENT_TAXONOMY[iid].display_name,
                count: n,
              }))
              .sort((a, b) => b.count - a.count)}
            selected={filters.intentIds}
            onToggle={(v) => {
              const has = filters.intentIds.includes(v);
              setFilters({
                ...filters,
                intentIds: has
                  ? filters.intentIds.filter((x) => x !== v)
                  : [...filters.intentIds, v],
              });
            }}
          />
        </div>
      </div>

      {/* Bulk-select bar (sticky when items selected) */}
      {selected.size > 0 ? (
        <div className="flex flex-shrink-0 items-center justify-between border-b border-brand-purple-border bg-brand-purple-soft px-4 py-1.5">
          <div className="flex items-center gap-3 text-[12px] text-brand-purple">
            <span className="font-semibold">
              {selected.size} selected
            </span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-[11px] font-medium hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="secondary" onClick={bulkReopen}>
              Re-open selected
            </Button>
          </div>
        </div>
      ) : null}

      {/* Body — sortable dense table */}
      <div className="flex-1 overflow-y-auto scroll-thin">
        {filtered.length === 0 ? (
          <EmptyState
            variant={
              filters.search || totalActive > 0 ? "no_matches" : "no_history"
            }
          />
        ) : (
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 z-10 bg-surface-subtle text-text-tertiary">
              <tr className="border-b border-border-subtle">
                <th className="w-8 px-4 py-1.5 text-left">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      filtered.every((i) => selected.has(i.action_item_id))
                    }
                    onChange={(e) => selectAllVisible(e.target.checked)}
                    aria-label="Select all visible"
                    className="h-3.5 w-3.5 cursor-pointer rounded border-border-strong text-brand-purple focus:ring-brand-purple"
                  />
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide">
                  Customer
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide">
                  Intent
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide">
                  Resolution
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide">
                  Note
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide">
                  Closed by
                </th>
                <th className="px-2 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wide">
                  Closed
                </th>
                <th className="w-8 px-4 py-1.5 text-right" aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {groupBy === "none" ? (
                filtered.map((item) => (
                  <CompletedRowCompact
                    key={item.action_item_id}
                    item={item}
                    selected={selected.has(item.action_item_id)}
                    onToggle={() => toggleSelection(item.action_item_id)}
                    onNav={(c) => navigate(`/customers/${c}`)}
                    onReopen={(id) =>
                      reopenActionItem(id, "manual re-open from completed table")
                    }
                  />
                ))
              ) : (
                grouped.map((group) => (
                  <GroupedRows
                    key={group.label}
                    label={group.label}
                    items={group.items}
                    selected={selected}
                    onToggle={toggleSelection}
                    onNav={(c) => navigate(`/customers/${c}`)}
                    onReopen={(id) =>
                      reopenActionItem(id, "manual re-open from completed table")
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Sub-components
   ============================================================ */

function FacetGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: T; label: string; count: number }[];
  selected: T[];
  onToggle: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasSelected = selected.length > 0;
  const visibleOptions = options.filter((o) => o.count > 0);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium ${
          hasSelected
            ? "border-brand-purple bg-brand-purple-soft text-brand-purple"
            : "border-border-subtle bg-white text-text-secondary hover:bg-surface-subtle"
        }`}
      >
        {label}
        {hasSelected ? (
          <span className="rounded bg-white px-1 text-[10px] font-bold text-brand-purple">
            {selected.length}
          </span>
        ) : null}
        <ChevronDownIcon size={12} />
      </button>
      {open ? (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-full z-20 mt-1 max-h-[280px] w-[220px] overflow-y-auto rounded-md border border-border-subtle bg-white py-1 shadow-lg scroll-thin">
            {visibleOptions.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-text-tertiary">
                No options
              </div>
            ) : (
              visibleOptions.map((opt) => {
                const checked = selected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => onToggle(opt.value)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-surface-subtle"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                          checked
                            ? "border-brand-purple bg-brand-purple text-white"
                            : "border-border-strong"
                        }`}
                      >
                        {checked ? <CheckIcon size={9} /> : null}
                      </span>
                      <span className="truncate text-text-primary">
                        {opt.label}
                      </span>
                    </span>
                    <span className="tabular text-[10px] text-text-tertiary">
                      {opt.count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CompletedRowCompact({
  item,
  selected,
  onToggle,
  onNav,
  onReopen,
}: {
  item: ActionItem;
  selected: boolean;
  onToggle: () => void;
  onNav: (customerId: string) => void;
  onReopen: (id: string) => void;
}) {
  const customer = getCustomerDetails(item.customer_id);
  const closer = getUser(item.closed_by_user_id);

  return (
    <tr
      className={`border-b border-border-subtle ${
        selected ? "bg-brand-purple-soft/40" : "hover:bg-surface-subtle"
      }`}
    >
      <td className="px-4 py-1.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-3.5 w-3.5 cursor-pointer rounded border-border-strong text-brand-purple focus:ring-brand-purple"
          aria-label={`Select ${customer?.display_name ?? "item"}`}
        />
      </td>
      <td className="px-2 py-1.5">
        <button
          onClick={() => onNav(item.customer_id)}
          className="flex items-center gap-1.5 text-left text-text-primary hover:text-brand-purple"
        >
          <IntentDot intentId={item.intent_id} />
          <span className="font-semibold">{customer?.display_name ?? "—"}</span>
        </button>
      </td>
      <td className="px-2 py-1.5">
        <IntentChip intentId={item.intent_id} size="xs" />
      </td>
      <td className="px-2 py-1.5">
        {item.resolution_type ? (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              RESOLUTION_COLOR[item.resolution_type]
            }`}
          >
            {RESOLUTION_LABEL[item.resolution_type]}
          </span>
        ) : null}
      </td>
      <td className="max-w-[280px] px-2 py-1.5">
        <span className="block truncate-1 italic text-text-secondary" title={item.resolution_note}>
          {item.resolution_note || "—"}
        </span>
      </td>
      <td className="px-2 py-1.5">
        <div className="flex items-center gap-1.5">
          {closer ? (
            <>
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ${
                  closer.user_id === "vini_agent"
                    ? "bg-brand-purple"
                    : "bg-text-secondary"
                }`}
              >
                {closer.avatar_initials}
              </span>
              <span className="text-text-primary">{closer.display_name}</span>
            </>
          ) : (
            <span className="text-text-tertiary">—</span>
          )}
        </div>
      </td>
      <td className="px-2 py-1.5 text-right tabular text-text-tertiary">
        {item.closed_at ? formatDateTime(item.closed_at) : "—"}
      </td>
      <td className="px-2 py-1.5 text-right">
        <div className="flex items-center justify-end gap-1">
          {item.surfaced_in_emails.length > 0 ? (
            <span
              className="text-text-tertiary"
              title="Surfaced in cadence email"
            >
              <MailEnvelopeIcon size={12} />
            </span>
          ) : null}
          <button
            onClick={() => onReopen(item.action_item_id)}
            className="text-[11px] font-medium text-brand-purple opacity-0 transition-opacity hover:underline group-hover:opacity-100"
            title="Re-open"
          >
            Re-open
          </button>
        </div>
      </td>
    </tr>
  );
}

function GroupedRows({
  label,
  items,
  selected,
  onToggle,
  onNav,
  onReopen,
}: {
  label: string;
  items: ActionItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onNav: (c: string) => void;
  onReopen: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <>
      <tr className="bg-surface-subtle">
        <td colSpan={8} className="px-4 py-1.5">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-text-secondary hover:text-text-primary"
          >
            <span
              className={`transition-transform ${collapsed ? "" : "rotate-90"}`}
            >
              <ChevronDownIcon size={11} />
            </span>
            {label}
            <span className="tabular text-text-tertiary">
              · {items.length}
            </span>
          </button>
        </td>
      </tr>
      {!collapsed
        ? items.map((item) => (
            <CompletedRowCompact
              key={item.action_item_id}
              item={item}
              selected={selected.has(item.action_item_id)}
              onToggle={() => onToggle(item.action_item_id)}
              onNav={onNav}
              onReopen={onReopen}
            />
          ))
        : null}
    </>
  );
}

/* ============================================================
   Pure logic — filter · group · facet counts
   ============================================================ */

function filterItems(items: ActionItem[], f: FilterState): ActionItem[] {
  const cutoff = (() => {
    const opt = DATE_OPTIONS.find((d) => d.value === f.date);
    return opt?.days ? NOW_MS - opt.days * 86_400_000 : null;
  })();

  let out = items;

  if (cutoff !== null) {
    out = out.filter((i) => i.closed_at && new Date(i.closed_at).getTime() >= cutoff);
  }

  if (f.resolverIds.length > 0) {
    out = out.filter(
      (i) => i.closed_by_user_id && f.resolverIds.includes(i.closed_by_user_id)
    );
  }
  if (f.resolutionTypes.length > 0) {
    out = out.filter(
      (i) => i.resolution_type && f.resolutionTypes.includes(i.resolution_type)
    );
  }
  if (f.intentIds.length > 0) {
    out = out.filter((i) => f.intentIds.includes(i.intent_id));
  }
  if (f.channels.length > 0) {
    out = out.filter((i) => f.channels.includes(i.source_channel));
  }
  if (f.search.trim()) {
    const q = f.search.toLowerCase();
    out = out.filter((i) => {
      const customer = getCustomerDetails(i.customer_id);
      return (
        i.intent_recap.toLowerCase().includes(q) ||
        (i.resolution_note ?? "").toLowerCase().includes(q) ||
        i.action_item_id.toLowerCase().includes(q) ||
        (customer?.display_name.toLowerCase().includes(q) ?? false)
      );
    });
  }

  out = [...out].sort((a, b) =>
    (b.closed_at ?? "").localeCompare(a.closed_at ?? "")
  );
  return out;
}

type Group = { label: string; items: ActionItem[] };

function groupItems(items: ActionItem[], by: GroupBy): Group[] {
  if (by === "none") return [{ label: "all", items }];

  const buckets = new Map<string, ActionItem[]>();
  const labels = new Map<string, string>();

  for (const item of items) {
    let key: string;
    let label: string;
    if (by === "resolver") {
      key = item.closed_by_user_id ?? "unknown";
      label = getUser(item.closed_by_user_id)?.display_name ?? "Unknown";
    } else if (by === "intent") {
      key = item.intent_id;
      label = INTENT_TAXONOMY[item.intent_id].display_name;
    } else {
      // by day
      const d = item.closed_at?.slice(0, 10) ?? "unknown";
      key = d;
      label = formatDate(item.closed_at ?? new Date().toISOString());
    }
    const arr = buckets.get(key) ?? [];
    arr.push(item);
    buckets.set(key, arr);
    labels.set(key, label);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([key, arr]) => ({ label: labels.get(key) ?? key, items: arr }));
}

function computeFacetCounts(items: ActionItem[]) {
  const resolvers: Record<string, number> = {};
  const resolutions: Record<string, number> = {};
  const intents: Record<string, number> = {};
  for (const i of items) {
    if (i.closed_by_user_id)
      resolvers[i.closed_by_user_id] =
        (resolvers[i.closed_by_user_id] ?? 0) + 1;
    if (i.resolution_type)
      resolutions[i.resolution_type] =
        (resolutions[i.resolution_type] ?? 0) + 1;
    intents[i.intent_id] = (intents[i.intent_id] ?? 0) + 1;
  }
  return { resolvers, resolutions, intents };
}

import type { Channel, Dept, IntentId } from "@test-data";
import { INTENT_TAXONOMY } from "@test-data";
import { ChannelGlyph, SearchIcon, CloseIcon, FilterIcon, RepeatIcon } from "./Icon";
import { useState } from "react";

export type AssignmentFilter = "all" | "mine" | "others" | "unassigned";
export type AgeFilter = "all" | "lt4h" | "lt24h" | "gt24h" | "past_sla";

export type PendingFilters = {
  assignment: AssignmentFilter;
  intentIds: IntentId[];
  channels: Channel[];
  age: AgeFilter;
  dept: Dept | "all";
  search: string;
  /** Phase 1 design contract affordance #6 — Anya filters to all repeat callers. */
  repeatCaller: boolean;
};

const ASSIGNMENT_OPTIONS: { value: AssignmentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mine", label: "Mine" },
  { value: "others", label: "Others" },
  { value: "unassigned", label: "Unassigned" },
];

const AGE_OPTIONS: { value: AgeFilter; label: string }[] = [
  { value: "all", label: "Any age" },
  { value: "lt4h", label: "< 4h" },
  { value: "lt24h", label: "4–24h" },
  { value: "gt24h", label: "> 24h" },
  { value: "past_sla", label: "Past SLA" },
];

const CHANNELS: Channel[] = ["call", "sms", "chat", "email", "hitl_warm_transfer"];

export function FilterStrip({
  filters,
  onChange,
}: {
  filters: PendingFilters;
  onChange: (next: PendingFilters) => void;
}) {
  const [intentsOpen, setIntentsOpen] = useState(false);

  const toggleIntent = (id: IntentId) =>
    onChange({
      ...filters,
      intentIds: filters.intentIds.includes(id)
        ? filters.intentIds.filter((x) => x !== id)
        : [...filters.intentIds, id],
    });

  const toggleChannel = (c: Channel) =>
    onChange({
      ...filters,
      channels: filters.channels.includes(c)
        ? filters.channels.filter((x) => x !== c)
        : [...filters.channels, c],
    });

  const activeCount =
    filters.intentIds.length +
    filters.channels.length +
    (filters.assignment !== "all" ? 1 : 0) +
    (filters.age !== "all" ? 1 : 0) +
    (filters.dept !== "all" ? 1 : 0) +
    (filters.search.trim() ? 1 : 0) +
    (filters.repeatCaller ? 1 : 0);

  return (
    <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-border-subtle bg-surface-card px-5 py-2.5">
      {/* Search */}
      <div className="relative w-[260px]">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary">
          <SearchIcon size={14} />
        </span>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search customer, recap…"
          className="w-full rounded-md border border-border-subtle bg-surface-card py-1.5 pl-8 pr-7 text-[12px] shadow-xs transition-colors duration-150 placeholder:text-text-tertiary focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple/20"
        />
        {filters.search ? (
          <button
            onClick={() => onChange({ ...filters, search: "" })}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
            aria-label="Clear search"
          >
            <CloseIcon size={11} />
          </button>
        ) : null}
      </div>

      <FilterDivider />

      {/* Assignment — segmented control */}
      <div className="inline-flex overflow-hidden rounded-md border border-border-subtle shadow-xs">
        {ASSIGNMENT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, assignment: opt.value })}
            className={`px-3 py-1.5 text-[11px] font-semibold transition-colors duration-150 ${
              filters.assignment === opt.value
                ? "bg-brand-purple-soft text-brand-purple"
                : "bg-surface-card text-text-secondary hover:bg-surface-subtle"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <FilterDivider />

      {/* Age */}
      <select
        value={filters.age}
        onChange={(e) => onChange({ ...filters, age: e.target.value as AgeFilter })}
        className="rounded-md border border-border-subtle bg-surface-card px-2.5 py-1.5 text-[11px] font-medium text-text-secondary shadow-xs transition-colors duration-150 focus:border-brand-purple focus:outline-none"
      >
        {AGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Channel icons — compact toggle row */}
      <div className="inline-flex overflow-hidden rounded-md border border-border-subtle shadow-xs">
        {CHANNELS.map((c) => {
          const active = filters.channels.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggleChannel(c)}
              title={c.replace("_", " ")}
              className={`flex h-7 w-7 items-center justify-center transition-colors duration-150 ${
                active
                  ? "bg-brand-purple-soft text-brand-purple"
                  : "bg-surface-card text-text-tertiary hover:bg-surface-subtle"
              }`}
            >
              <ChannelGlyph channel={c} size={13} />
            </button>
          );
        })}
      </div>

      {/* Intent picker */}
      <div className="relative">
        <button
          onClick={() => setIntentsOpen((o) => !o)}
          className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold shadow-xs transition-colors duration-150 ${
            filters.intentIds.length > 0
              ? "border-brand-purple bg-brand-purple-soft text-brand-purple"
              : "border-border-subtle bg-surface-card text-text-secondary hover:bg-surface-subtle"
          }`}
        >
          <FilterIcon size={12} /> Intent
          {filters.intentIds.length > 0 ? (
            <span className="rounded bg-white px-1 text-[10px] font-bold text-brand-purple">
              {filters.intentIds.length}
            </span>
          ) : null}
        </button>
        {intentsOpen ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIntentsOpen(false)} />
            <div className="absolute left-0 top-full z-20 mt-1 max-h-[300px] w-[220px] overflow-y-auto rounded-md border border-border-subtle bg-white p-1 shadow-lg scroll-thin">
              {Object.values(INTENT_TAXONOMY).map((intent) => {
                const checked = filters.intentIds.includes(intent.id);
                return (
                  <button
                    key={intent.id}
                    onClick={() => toggleIntent(intent.id)}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[12px] ${
                      checked
                        ? "bg-brand-purple-soft text-brand-purple font-semibold"
                        : "text-text-primary hover:bg-surface-subtle"
                    }`}
                  >
                    {intent.display_name}
                    <span className="text-[10px] uppercase tracking-wide text-text-tertiary">
                      {intent.dept}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      {/* Repeat-caller toggle — Anya's escalation filter */}
      <button
        onClick={() =>
          onChange({ ...filters, repeatCaller: !filters.repeatCaller })
        }
        title="Show only customers who pinged us 3+ times"
        aria-label="Filter to repeat callers"
        aria-pressed={filters.repeatCaller}
        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold shadow-xs transition-colors duration-150 ${
          filters.repeatCaller
            ? "border-status-warning bg-status-warning-soft text-status-warning"
            : "border-border-subtle bg-surface-card text-text-secondary hover:bg-surface-subtle"
        }`}
      >
        <RepeatIcon size={12} /> Repeat
      </button>

      <FilterDivider />

      {/* Dept toggle */}
      <div className="ml-auto inline-flex overflow-hidden rounded-md border border-border-subtle shadow-xs">
        {(["all", "sales", "service"] as const).map((d) => (
          <button
            key={d}
            onClick={() => onChange({ ...filters, dept: d })}
            className={`px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors duration-150 ${
              filters.dept === d
                ? "bg-brand-purple-soft text-brand-purple"
                : "bg-surface-card text-text-secondary hover:bg-surface-subtle"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {activeCount > 0 ? (
        <button
          onClick={() =>
            onChange({
              assignment: "all",
              intentIds: [],
              channels: [],
              age: "all",
              dept: "all",
              search: "",
              repeatCaller: false,
            })
          }
          className="ml-1 text-[11px] font-medium text-brand-purple transition-colors duration-150 hover:underline"
        >
          Clear {activeCount}
        </button>
      ) : null}
    </div>
  );
}

function FilterDivider() {
  return (
    <span
      className="h-5 w-px self-center bg-border-subtle"
      aria-hidden
    />
  );
}

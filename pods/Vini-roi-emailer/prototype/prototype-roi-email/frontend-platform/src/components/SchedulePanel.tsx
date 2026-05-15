/**
 * Schedule configuration card for the subscription editor.
 *
 * Matches the reference design: Active toggle, Send Type segmented, Frequency
 * segmented, Day picker, Time select, Timezone (read-only), live summary pill.
 * "Default" badges surface next to fields whose value is at the role default.
 */
import { Card, SectionLabel, ToggleSwitch } from "./ui";

export type SendType = "recurring" | "one_time";
export type Frequency = "daily" | "weekly" | "biweekly" | "monthly";
export type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type ScheduleState = {
  active: boolean;
  sendType: SendType;
  frequency: Frequency;
  day: DayKey;
  time: string; // "07:00"
  timezone: string; // "America/Chicago"
};

export type ScheduleDefaults = {
  day?: DayKey;
  time?: string;
};

type Props = {
  state: ScheduleState;
  defaults?: ScheduleDefaults;
  onChange: (next: Partial<ScheduleState>) => void;
};

const DAYS: Array<{ key: DayKey; label: string }> = [
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
];

const FREQUENCIES: Array<{ key: Frequency; label: string }> = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "biweekly", label: "2 wks" },
  { key: "monthly", label: "Monthly" },
];

const TIMES = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "10:00",
  "12:00",
  "16:00",
  "18:00",
];

export function SchedulePanel({ state, defaults, onChange }: Props) {
  const summary = composeSummary(state);
  const nextSendLabel = composeNextSend(state);

  const isDayDefault = !defaults?.day || state.day === defaults.day;
  const isTimeDefault = !defaults?.time || state.time === defaults.time;

  return (
    <Card className="overflow-hidden">
      {/* Collapsible header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <h3 className="text-sm font-semibold text-text-primary">Schedule</h3>
        <svg
          className="text-text-muted"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 15l7-7 7 7" strokeLinecap="round" />
        </svg>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Active toggle */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-text-primary">Active</div>
            <p className="text-[12px] text-text-secondary mt-0.5">
              Pause to stop automated sends
            </p>
          </div>
          <ToggleSwitch
            checked={state.active}
            onChange={(v) => onChange({ active: v })}
          />
        </div>

        {/* Send type */}
        <div>
          <Label>Send type</Label>
          <Segmented
            value={state.sendType}
            options={[
              { key: "recurring", label: "Recurring", icon: "↻" },
              { key: "one_time", label: "One-time", icon: "📅" },
            ]}
            onChange={(v) => onChange({ sendType: v as SendType })}
            disabled={!state.active}
          />
        </div>

        {/* Frequency */}
        <div>
          <Label>Frequency</Label>
          <PillStrip
            value={state.frequency}
            options={FREQUENCIES}
            onChange={(v) => onChange({ frequency: v as Frequency })}
            disabled={!state.active || state.sendType === "one_time"}
          />
        </div>

        {/* Day */}
        <div>
          <Label trailing={isDayDefault ? <DefaultPill /> : null}>Day</Label>
          <DayStrip
            value={state.day}
            options={DAYS}
            onChange={(v) => onChange({ day: v })}
            disabled={!state.active || state.sendType === "one_time"}
          />
        </div>

        {/* Time */}
        <div>
          <Label trailing={isTimeDefault ? <DefaultPill /> : null}>Time</Label>
          <select
            value={state.time}
            onChange={(e) => onChange({ time: e.target.value })}
            disabled={!state.active}
            className="mt-2 w-full min-h-[44px] px-3 rounded-md border border-border-subtle bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary disabled:opacity-50"
          >
            {TIMES.map((t) => (
              <option key={t} value={t}>
                {format12h(t)}
              </option>
            ))}
          </select>
        </div>

        {/* Timezone (read-only) */}
        <div className="flex items-start gap-2">
          <svg
            className="text-text-muted shrink-0 mt-0.5"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" strokeLinecap="round" />
          </svg>
          <div>
            <div className="text-[11px] uppercase tracking-wide font-medium text-text-secondary">
              Timezone (dealer local)
            </div>
            <div className="text-sm font-semibold text-text-primary mt-0.5">
              {state.timezone}
            </div>
          </div>
        </div>

        {/* Summary pill */}
        {state.active && (
          <div className="flex items-start gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2.5">
            <svg
              className="text-orange-600 shrink-0 mt-0.5"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
            </svg>
            <div className="text-[12px] leading-relaxed text-text-primary">
              <div>{summary}</div>
              {nextSendLabel && (
                <div className="text-text-secondary">
                  Next: {nextSendLabel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Label({
  children,
  trailing,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <SectionLabel>{children}</SectionLabel>
      {trailing}
    </div>
  );
}

function DefaultPill() {
  return (
    <span className="text-[10px] uppercase tracking-wide font-bold text-text-muted bg-surface-background border border-border-subtle rounded-full px-2 py-0.5">
      Default
    </span>
  );
}

function Segmented({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: Array<{ key: string; label: string; icon?: string }>;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-2 inline-flex w-full rounded-md border border-border-subtle bg-surface-background p-1">
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.key)}
            className={`flex-1 min-h-[36px] inline-flex items-center justify-center gap-1.5 rounded-[5px] text-[13px] font-semibold transition-colors ${
              active
                ? "bg-surface-card text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {opt.icon && <span className="text-xs">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PillStrip({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: Array<{ key: string; label: string }>;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.key)}
            className={`min-h-[36px] px-3.5 rounded-md text-[13px] font-semibold transition-colors ${
              active
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-surface-background text-text-primary border border-border-subtle hover:bg-surface-card"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function DayStrip({
  value,
  options,
  onChange,
  disabled,
}: {
  value: DayKey;
  options: Array<{ key: DayKey; label: string }>;
  onChange: (v: DayKey) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-2 grid grid-cols-7 gap-1.5">
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.key)}
            className={`min-h-[36px] rounded-md text-[12px] font-semibold transition-colors ${
              active
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-surface-background text-text-primary border border-border-subtle hover:bg-surface-card"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function format12h(hhmm: string): string {
  const [hStr, m] = hhmm.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function dayLabel(d: DayKey): string {
  const map: Record<DayKey, string> = {
    sun: "Sunday",
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
  };
  return map[d];
}

function dayShort(d: DayKey): string {
  return d[0].toUpperCase() + d.slice(1);
}

function composeSummary(state: ScheduleState): string {
  const time = format12h(state.time);
  if (state.sendType === "one_time") {
    return `One-time send at ${time}`;
  }
  switch (state.frequency) {
    case "daily":
      return `Every day at ${time}`;
    case "weekly":
      return `Every ${dayShort(state.day)} at ${time}`;
    case "biweekly":
      return `Every other ${dayShort(state.day)} at ${time}`;
    case "monthly":
      return `Monthly on the 1st at ${time}`;
  }
}

function composeNextSend(state: ScheduleState): string | null {
  if (!state.active) return null;
  // Compute the next firing date based on frequency + day.
  const today = new Date("2026-05-15"); // Pinned date in this prototype
  const next = new Date(today);
  if (state.sendType === "one_time") return null;
  if (state.frequency === "daily") {
    next.setDate(today.getDate() + 1);
  } else if (state.frequency === "weekly" || state.frequency === "biweekly") {
    const targetDow = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(
      state.day,
    );
    const currentDow = today.getDay();
    let diff = (targetDow - currentDow + 7) % 7;
    if (diff === 0) diff = 7;
    if (state.frequency === "biweekly") diff += 7;
    next.setDate(today.getDate() + diff);
  } else if (state.frequency === "monthly") {
    next.setMonth(today.getMonth() + 1);
    next.setDate(1);
  }
  return next.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// re-export label helpers
export { dayLabel, dayShort, format12h };

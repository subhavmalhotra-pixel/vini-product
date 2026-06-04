import type { ReactNode } from "react";

/**
 * Dealer-report design primitives.
 *
 * Anchored to the Spyne dealer-report screenshots: white cards on a neutral
 * background, soft 1-px shadows, big donut + half-circle gauge KPIs, a clean
 * status pill ("On track"), a sticky black "Open console" CTA at the bottom.
 *
 * All visualisations inline SVG. No external chart libraries.
 */

/* ============================================================
   Spyne logo · used in the report header
   ============================================================ */
export function SpyneLogo({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-baseline gap-1.5 font-semibold tracking-tight text-text-primary"
      style={{ fontSize: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.95}
        height={size * 0.95}
        fill="none"
        aria-hidden="true"
      >
        <circle cx="6" cy="6" r="3" fill="#FF6B35" />
        <circle cx="18" cy="6" r="3" fill="#FFC107" />
        <circle cx="6" cy="18" r="3" fill="#4600F2" />
        <circle cx="18" cy="18" r="3" fill="#16A34A" />
      </svg>
      <span style={{ fontWeight: 600 }}>spyne</span>
    </span>
  );
}

/* ============================================================
   1. Group-report context banner · light blue strip at the very top
   ============================================================ */
export function GroupReportBanner({
  rooftopName,
  groupName,
}: {
  /** the rooftop receiving this report (the customer) */
  rooftopName?: string;
  /** the umbrella group covering it */
  groupName: string;
}) {
  return (
    <div className="border-b border-info-border bg-info-soft px-6 py-3 text-[12px] leading-relaxed text-info">
      <span className="font-mono text-[11px] font-semibold">i</span>{" "}
      <span className="text-text-secondary">
        Group report — {rooftopName ? <>this rooftop didn't get its own daily email; it was </> : <>this rooftop is </>}covered by{" "}
        <span className="font-semibold text-info">{groupName}</span>
        's group report.
      </span>
    </div>
  );
}

/* ============================================================
   2. Brand strip · Spyne logo + group/dealer name + meta line
   ============================================================ */
export function BrandStrip({
  dealerName,
  metaLine,
}: {
  dealerName: string;
  metaLine: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card px-6 py-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <SpyneLogo />
        <div className="text-right">
          <div className="text-[15px] font-semibold leading-tight text-text-primary">
            {dealerName}
          </div>
          <div className="mt-1 text-[11px] text-text-muted">{metaLine}</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   3. Section header · "Inventory across Group · ● On track · date"
   ============================================================ */
type Status = "on-track" | "watch" | "off-track" | "neutral";

const STATUS_PILL: Record<Status, { bg: string; text: string; dot: string; label: string }> = {
  "on-track": {
    bg: "bg-positive-soft",
    text: "text-positive",
    dot: "bg-positive",
    label: "On track",
  },
  watch: {
    bg: "bg-warning-soft",
    text: "text-warning",
    dot: "bg-warning",
    label: "Watch",
  },
  "off-track": {
    bg: "bg-negative-soft",
    text: "text-negative",
    dot: "bg-negative",
    label: "Off track",
  },
  neutral: {
    bg: "bg-surface-subtle",
    text: "text-text-secondary",
    dot: "bg-text-muted",
    label: "Neutral",
  },
};

export function SectionStatusHeader({
  title,
  scope,
  status = "on-track",
  date,
  labelOverride,
}: {
  title: string;
  /** e.g. "across Group", "across the group", "across Rooftop" */
  scope?: string;
  status?: Status;
  date: string;
  labelOverride?: string;
}) {
  const s = STATUS_PILL[status];
  return (
    <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3 px-1">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[22px] font-bold leading-tight tracking-tight text-text-primary">
          {title}
        </h2>
        {scope ? (
          <span className="text-[16px] font-normal text-text-secondary">{scope}</span>
        ) : null}
        <span
          className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.bg} ${s.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {labelOverride ?? s.label}
        </span>
      </div>
      <div className="text-[12px] text-text-muted tabular">{date}</div>
    </div>
  );
}

/* ============================================================
   4. Big donut KPI · used for inventory total + breakdown
   ============================================================ */
export function DonutKpi({
  centerNumber,
  centerLabel,
  segments,
  ribbon,
  pills,
}: {
  centerNumber: string;
  centerLabel: string;
  /** each segment maps to a coloured arc + a legend row */
  segments: { label: string; value: number; color: "positive" | "info" | "warning" | "negative" | "neutral" }[];
  /** optional top pill (e.g. "97% photos delivered") */
  ribbon?: { label: string; tone: Status };
  /** optional bottom pills (e.g. Days to Frontline · Avg TAT) */
  pills?: { label: string; value: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  // SVG donut math
  const size = 140;
  const radius = 60;
  const strokeW = 14;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const COLOR_HEX: Record<typeof segments[number]["color"], string> = {
    positive: "#16A34A",
    info: "#1D4ED8",
    warning: "#D97706",
    negative: "#DC2626",
    neutral: "#94A3B8",
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        {centerLabel}
      </div>
      {ribbon ? (
        <div className="mt-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_PILL[ribbon.tone].bg} ${STATUS_PILL[ribbon.tone].text}`}
          >
            {ribbon.label}
          </span>
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-5">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F5F5F5"
            strokeWidth={strokeW}
          />
          {segments.map((seg, i) => {
            const dash = (seg.value / total) * circumference;
            const arc = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={COLOR_HEX[seg.color]}
                strokeWidth={strokeW}
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return arc;
          })}
          <text
            x={size / 2}
            y={size / 2 - 4}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#0A0A0A"
            style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
          >
            {centerNumber}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 16}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#737373"
            style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            {centerLabel.split(" ")[0]}
          </text>
        </svg>

        <div className="flex-1 space-y-2">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-baseline justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[12px] text-text-secondary">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ background: COLOR_HEX[seg.color] }}
                />
                {seg.label}
              </span>
              <span className="tabular text-[13px] font-semibold text-text-primary">
                {seg.value.toLocaleString()}
                {segments.length > 1 ? `/${total}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {pills && pills.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border-muted pt-4">
          {pills.map((p) => (
            <div
              key={p.label}
              className="flex items-center justify-between gap-2 rounded-lg bg-brand-soft px-3 py-2"
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-primary">
                {p.label}
              </span>
              <span className="tabular text-[13px] font-semibold text-brand-primary">
                {p.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   5. Half-circle gauge KPI · used for Time to Market / Photo Score
   ============================================================ */
export function GaugeKpi({
  label,
  ribbon,
  value,
  unit,
  min,
  max,
  thresholds,
  sub,
}: {
  label: string;
  ribbon?: { label: string; tone: Status };
  value: number;
  unit?: string;
  min: { value: number; label: string };
  max: { value: number; label: string };
  /** colour zones (green / amber / red) along the arc */
  thresholds: { upTo: number; color: "positive" | "warning" | "negative" }[];
  sub?: { label: string; value: string };
}) {
  const size = 200;
  const cx = size / 2;
  const cy = size * 0.65;
  const r = size * 0.36;
  const COLOR_HEX = {
    positive: "#86EFAC",
    warning: "#FDE68A",
    negative: "#FCA5A5",
  } as const;

  // Build the threshold arcs
  const arcs = [];
  let cursor = min.value;
  const range = max.value - min.value;
  for (const t of thresholds) {
    const startPct = (cursor - min.value) / range;
    const endPct = (Math.min(t.upTo, max.value) - min.value) / range;
    arcs.push({
      startPct,
      endPct,
      color: COLOR_HEX[t.color],
    });
    cursor = t.upTo;
  }
  // Value indicator position on the arc
  const valuePct = Math.max(0, Math.min(1, (value - min.value) / range));
  const valueAngle = Math.PI * (1 - valuePct);
  const valueX = cx + r * Math.cos(valueAngle);
  const valueY = cy - r * Math.sin(valueAngle);

  function polarToCartesian(angle: number) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle),
    };
  }

  function describeArc(startPct: number, endPct: number) {
    const startAngle = Math.PI * (1 - startPct);
    const endAngle = Math.PI * (1 - endPct);
    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
        <sup className="ml-0.5 text-[8px] text-info">*</sup>
      </div>
      {ribbon ? (
        <div className="mt-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_PILL[ribbon.tone].bg} ${STATUS_PILL[ribbon.tone].text}`}
          >
            {ribbon.label}
          </span>
        </div>
      ) : null}

      <div className="mt-2 flex justify-center">
        <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
          {/* Threshold-coloured arc segments */}
          {arcs.map((a, i) => (
            <path
              key={i}
              d={describeArc(a.startPct, a.endPct)}
              fill="none"
              stroke={a.color}
              strokeWidth={12}
              strokeLinecap="butt"
            />
          ))}
          {/* Min / max labels */}
          <text
            x={cx - r}
            y={cy + 18}
            textAnchor="middle"
            fill="#737373"
            style={{ fontSize: 10, fontVariantNumeric: "tabular-nums" }}
          >
            {min.label}
          </text>
          <text
            x={cx + r}
            y={cy + 18}
            textAnchor="middle"
            fill="#737373"
            style={{ fontSize: 10, fontVariantNumeric: "tabular-nums" }}
          >
            {max.label}
          </text>
          {/* Hash marks at threshold boundaries */}
          {thresholds.slice(0, -1).map((t, i) => {
            const pct = (t.upTo - min.value) / range;
            const a = Math.PI * (1 - pct);
            const start = polarToCartesian(a);
            return (
              <text
                key={`m${i}`}
                x={cx + (r + 14) * Math.cos(a)}
                y={cy - (r + 14) * Math.sin(a)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#737373"
                style={{ fontSize: 10, fontVariantNumeric: "tabular-nums" }}
              >
                {t.upTo}
                {void start}
              </text>
            );
          })}
          {/* Value indicator ring */}
          <circle cx={valueX} cy={valueY} r={6} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={2} />
          {/* Big value text in the middle */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#0A0A0A"
            style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
          >
            {value}
            {unit ? <tspan style={{ fontSize: 14, fontWeight: 600 }}>{unit}</tspan> : null}
          </text>
        </svg>
      </div>

      {sub ? (
        <div className="mt-2 flex items-center justify-between border-t border-border-muted pt-3 text-[12px]">
          <span className="inline-flex items-center gap-2 text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-positive" />
            {sub.label}
            <sup className="text-[8px] text-info">†</sup>
          </span>
          <span className="tabular font-semibold text-text-primary">{sub.value}</span>
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   6. Empty-day card · "No vehicles received yesterday" pattern
   ============================================================ */
export function EmptyDayCard({
  eyebrow,
  title,
  body,
  pills,
}: {
  eyebrow: string;
  title: string;
  body: string;
  pills?: { label: string; value?: string }[];
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        {eyebrow}
      </div>
      <div className="mt-6 flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div className="mt-3 text-[14px] font-semibold leading-tight text-text-primary">
          {title}
        </div>
        <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-text-muted">
          {body}
        </p>
      </div>
      {pills && pills.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border-muted pt-4">
          {pills.map((p) => (
            <div
              key={p.label}
              className="flex items-center justify-between gap-2 rounded-lg bg-brand-soft/60 px-3 py-2"
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-primary/70">
                {p.label}
              </span>
              <span className="tabular text-[12px] font-semibold text-brand-primary/70">
                {p.value ?? "—"}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   7. By-location row · progress bar + status pills
   ============================================================ */
export function ByLocationCard({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: {
    name: string;
    total: string;
    segments: { value: number; color: "positive" | "info" | "warning" | "negative" }[];
    rightPill?: { label: string; tone: Status };
  }[];
  /** optional table columns alternative (for the second screenshot's "By location" inventory rows) */
  columns?: { key: string; label: string }[];
}) {
  const COLOR_HEX = {
    positive: "#16A34A",
    info: "#1D4ED8",
    warning: "#D97706",
    negative: "#DC2626",
  } as const;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
          {title}
        </div>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-[12px] font-semibold text-info hover:underline"
        >
          View all →
        </a>
      </div>

      {columns ? (
        <table className="mt-3 w-full">
          <thead>
            <tr className="border-b border-border-muted">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="pb-2 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      ) : null}

      <ul className="mt-3 space-y-3">
        {rows.map((row) => {
          const total = row.segments.reduce((s, x) => s + x.value, 0) || 1;
          return (
            <li key={row.name} className="grid grid-cols-[1fr_80px_1fr_auto] items-center gap-4 text-[13px]">
              <span className="truncate font-semibold text-text-primary">
                {row.name}
              </span>
              <span className="tabular text-[13px]">
                <span className="font-semibold text-text-primary">{row.total}</span>{" "}
                <span className="text-text-muted">vehicles</span>
              </span>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                {row.segments.map((s, i) => (
                  <span
                    key={i}
                    className="block h-full"
                    style={{
                      width: `${(s.value / total) * 100}%`,
                      background: COLOR_HEX[s.color],
                    }}
                  />
                ))}
              </div>
              {row.rightPill ? (
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tabular ${STATUS_PILL[row.rightPill.tone].bg} ${STATUS_PILL[row.rightPill.tone].text}`}
                >
                  {row.rightPill.label}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================
   8. Recent items list · thumbnails + meta + status
   ============================================================ */
export function RecentItemList({
  title,
  rows,
}: {
  title: string;
  rows: {
    /** big text · e.g. "2025 Ford Escape" */
    primary: string;
    /** small chip after the primary · e.g. "PHEV" */
    chip?: string;
    /** small line below · e.g. "1FMCU0E1XSUA54643 · Stock #..." */
    secondary?: string;
    /** middle column · e.g. "Nelson Automotive Inc" */
    middle?: string;
    /** column right of middle · e.g. "3h 34m" TAT */
    metric?: string;
    /** rightmost status pill */
    status?: { label: string; tone: Status };
    /** optional thumbnail · placeholder if not provided */
    thumbHue?: number;
  }[];
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
          {title}
        </div>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-[12px] font-semibold text-info hover:underline"
        >
          View all →
        </a>
      </div>

      <div className="mt-3 grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        <span />
        <span>Vehicle</span>
        <span>Rooftop</span>
        <span>TAT</span>
        <span>Status</span>
        <span />
      </div>

      <ul className="divide-y divide-border-muted">
        {rows.map((row, i) => (
          <li key={i} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-x-4 gap-y-1 py-3">
            <ThumbPlaceholder hue={row.thumbHue ?? (i * 53) % 360} />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-[13px] font-semibold text-text-primary">
                  {row.primary}
                </span>
                {row.chip ? (
                  <span className="text-[12px] text-text-muted">· {row.chip}</span>
                ) : null}
              </div>
              {row.secondary ? (
                <div className="truncate text-[11px] text-text-muted">{row.secondary}</div>
              ) : null}
            </div>
            <span className="truncate text-[13px] text-text-secondary">{row.middle ?? "—"}</span>
            <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-primary tabular">
              {row.metric ?? "—"}
            </span>
            {row.status ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_PILL[row.status.tone].bg} ${STATUS_PILL[row.status.tone].text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_PILL[row.status.tone].dot}`} />
                {row.status.label}
              </span>
            ) : (
              <span />
            )}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[12px] font-semibold text-info hover:underline"
            >
              View →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThumbPlaceholder({ hue }: { hue: number }) {
  // Decorative placeholder; the email is illustrative · production replaces
  // this with a real CDN thumbnail.
  return (
    <span
      className="block h-9 w-12 rounded-md border border-border-muted"
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 30% 88%), hsl(${(hue + 60) % 360} 28% 78%))`,
      }}
      aria-hidden
    />
  );
}

/* ============================================================
   9. Glossary · 2×2 grid of definitions
   ============================================================ */
export function Glossary({
  items,
}: {
  items: { label: string; symbol?: string; description: string; ideal?: string }[];
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        Glossary · How to read this report
      </div>
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {items.map((it) => (
          <div key={it.label}>
            <div className="text-[13px] font-semibold text-text-primary">
              {it.label}
              {it.symbol ? <sup className="ml-0.5 text-[10px] text-info">{it.symbol}</sup> : null}
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
              {it.description}
            </p>
            {it.ideal ? (
              <p className="mt-1 text-[12px] text-text-secondary">
                <span className="font-semibold text-text-primary">Ideal:</span> {it.ideal}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   10. Console CTA footer · black bar at the bottom of the report
   ============================================================ */
export function ConsoleCtaFooter({
  message = "Want the full breakdown?",
  detail = "Vehicle-level history, photos & all other info",
  ctaLabel = "Open console",
  href = "#",
}: {
  message?: string;
  detail?: string;
  ctaLabel?: string;
  href?: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-text-primary">
            <span className="font-normal">{message}</span>{" "}
            <span className="font-semibold">{detail}</span>{" "}
            <span className="text-text-muted">live in the console.</span>
          </p>
        </div>
        <a
          href={href}
          onClick={(e) => e.preventDefault()}
          className="inline-flex min-h-[40px] items-center justify-center rounded-md bg-text-primary px-4 py-2 text-[13px] font-semibold text-white shadow-cta transition-colors duration-150 hover:bg-black"
        >
          {ctaLabel} →
        </a>
      </div>
    </div>
  );
}

/* ============================================================
   11. Outer shell · stacks the children with consistent gutters
   ============================================================ */
export function DealerReportShell({
  groupBanner,
  children,
}: {
  groupBanner?: { rooftopName?: string; groupName: string };
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      {groupBanner ? (
        <GroupReportBanner
          rooftopName={groupBanner.rooftopName}
          groupName={groupBanner.groupName}
        />
      ) : null}
      <div className="space-y-4 px-2 py-5 sm:px-3">{children}</div>
    </div>
  );
}

/* ============================================================
   12. Top-N list · vehicles · intents · services · objections
   ============================================================ */
export function TopList({
  title,
  rows,
  eyebrow,
  rightSlot,
}: {
  title: string;
  eyebrow?: string;
  rightSlot?: ReactNode;
  rows: { label: string; value: string | number; trend?: "up" | "down" | "flat"; sub?: string }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          {eyebrow ? (
            <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              {eyebrow}
            </div>
          ) : null}
          <div className="text-[13px] font-semibold text-text-primary">{title}</div>
        </div>
        {rightSlot}
      </div>
      <ul className="mt-3 divide-y divide-border-muted">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-baseline justify-between gap-3 py-2.5 text-[13px]"
          >
            <div className="min-w-0 flex-1">
              <span className="truncate text-text-primary">{r.label}</span>
              {r.sub ? (
                <div className="text-[11px] text-text-muted">{r.sub}</div>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-2">
              <span className="tabular font-semibold text-text-primary">
                {typeof r.value === "number" ? r.value.toLocaleString() : r.value}
              </span>
              {r.trend ? <TrendIcon trend={r.trend} /> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  const map = {
    up: { sym: "↑", cls: "text-positive" },
    down: { sym: "↓", cls: "text-negative" },
    flat: { sym: "→", cls: "text-text-muted" },
  } as const;
  const { sym, cls } = map[trend];
  return <span className={`text-[11px] font-bold ${cls}`}>{sym}</span>;
}

/* ============================================================
   13. Funnel · cascading stage bars with drop-off counts
   ============================================================ */
export function FunnelChart({
  stages,
  title,
  eyebrow,
}: {
  title?: string;
  eyebrow?: string;
  stages: { label: string; value: number; suffix?: string }[];
}) {
  const max = stages[0]?.value || 1;
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      {title || eyebrow ? (
        <div className="mb-4">
          {eyebrow ? (
            <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              {eyebrow}
            </div>
          ) : null}
          {title ? (
            <div className="text-[13px] font-semibold text-text-primary">
              {title}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-2.5">
        {stages.map((s, i) => {
          const pct = (s.value / max) * 100;
          const dropoff = i > 0 ? stages[i - 1].value - s.value : 0;
          const dropPct =
            i > 0 ? (dropoff / Math.max(stages[i - 1].value, 1)) * 100 : 0;
          return (
            <div key={s.label}>
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] font-semibold text-text-primary">
                  {s.label}
                </span>
                <span className="tabular text-[13px] font-semibold text-text-primary">
                  {s.value.toLocaleString()}
                  {s.suffix ?? ""}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-brand-soft">
                  <div
                    className="absolute inset-y-0 left-0 flex items-center bg-brand-primary px-2.5"
                    style={{ width: `${pct}%` }}
                  >
                    {pct >= 14 ? (
                      <span className="text-[10px] font-semibold tabular text-white">
                        {pct.toFixed(0)}%
                      </span>
                    ) : null}
                  </div>
                </div>
                {i > 0 ? (
                  <span className="w-20 text-right text-[11px] text-negative tabular">
                    −{dropoff.toLocaleString()} ({dropPct.toFixed(0)}%)
                  </span>
                ) : (
                  <span className="w-20" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   14. Trend bar chart · day-by-day / six-month series
   ============================================================ */
export function TrendBarChart({
  title,
  eyebrow,
  series,
  /** Optional: render appointments as a line overlay on top */
  appts,
  apptsLabel = "Appts",
}: {
  title?: string;
  eyebrow?: string;
  series: { label: string; segments: { value: number; color: "info" | "warning" | "positive" | "negative" | "neutral" }[] }[];
  appts?: number[];
  apptsLabel?: string;
}) {
  const COLOR_HEX = {
    info: "#1D4ED8",
    warning: "#D97706",
    positive: "#16A34A",
    negative: "#DC2626",
    neutral: "#94A3B8",
  } as const;
  const totals = series.map((s) => s.segments.reduce((sum, x) => sum + x.value, 0));
  const max = Math.max(...totals, 1);
  const apptMax = appts ? Math.max(...appts, 1) : 1;
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      {(eyebrow || title) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {eyebrow ? (
              <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                {eyebrow}
              </div>
            ) : null}
            {title ? (
              <div className="text-[13px] font-semibold text-text-primary">{title}</div>
            ) : null}
          </div>
          {appts ? (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
              <span className="inline-block h-1.5 w-3 rounded-full bg-text-primary" />
              {apptsLabel}
            </div>
          ) : null}
        </div>
      )}
      <div className="relative">
        <div
          className="grid items-end gap-2"
          style={{ gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))` }}
        >
          {series.map((s, i) => {
            return (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div className="relative flex h-28 w-full flex-col-reverse overflow-hidden rounded-md bg-surface-subtle">
                  {s.segments.map((seg, k) => {
                    const totalForCol = totals[i] || 1;
                    const h = (seg.value / Math.max(max, 1)) * 100;
                    void totalForCol;
                    return (
                      <div
                        key={k}
                        style={{ height: `${h}%`, background: COLOR_HEX[seg.color] }}
                        title={`${seg.value}`}
                      />
                    );
                  })}
                  {appts && appts[i] !== undefined ? (
                    <span
                      className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-text-primary ring-2 ring-surface-card"
                      style={{
                        bottom: `${(appts[i] / apptMax) * 100}%`,
                      }}
                      aria-hidden
                    />
                  ) : null}
                </div>
                <div className="text-[10px] font-semibold tabular text-text-muted">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   15. Story card · AI-narrated journey from Weekly / Monthly
   ============================================================ */
export function StoryCard({
  badge,
  summary,
  intent,
  outcomeChip,
  turnsCount,
  channelsUsed,
}: {
  badge: string;
  summary: string;
  intent?: string;
  outcomeChip?: { label: string; tone: Status };
  turnsCount?: number;
  channelsUsed?: string[];
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Story of the period
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand-primary">
          {badge}
        </span>
      </div>
      {intent ? (
        <div className="mt-3 text-[13px] font-semibold text-text-primary">
          {intent}
        </div>
      ) : null}
      <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
        {summary}
      </p>
      {(turnsCount || channelsUsed || outcomeChip) && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border-muted pt-3 text-[11px] text-text-secondary">
          {turnsCount ? (
            <span>
              <span className="tabular font-semibold text-text-primary">{turnsCount}</span>{" "}
              turns
            </span>
          ) : null}
          {channelsUsed && channelsUsed.length > 0 ? (
            <span>
              <span className="font-semibold text-text-primary">
                {channelsUsed.join(" · ")}
              </span>
            </span>
          ) : null}
          {outcomeChip ? (
            <span
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_PILL[outcomeChip.tone].bg} ${STATUS_PILL[outcomeChip.tone].text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_PILL[outcomeChip.tone].dot}`} />
              {outcomeChip.label}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   16. Agent KPI strip · per-agent (Sales IB · Service IB etc.)
   ============================================================ */
export function AgentKpiStrip({
  agentLabel,
  cards,
}: {
  agentLabel: string;
  cards: { label: string; value: string | number; unit?: string; sub?: string; delta?: string; deltaDirection?: "good" | "bad" | "neutral"; unavailable?: boolean }[];
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {agentLabel}
      </div>
      <div
        className="mt-3 grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(cards.length, 4)}, minmax(0, 1fr))`,
        }}
      >
        {cards.map((c) => {
          const deltaTone =
            c.deltaDirection === "good"
              ? "text-positive"
              : c.deltaDirection === "bad"
              ? "text-negative"
              : "text-text-muted";
          const arrow = c.delta?.startsWith("-")
            ? "↓"
            : c.delta?.startsWith("+")
            ? "↑"
            : "·";
          return (
            <div key={c.label} className="rounded-lg border border-border-subtle bg-surface-background p-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                {c.label}
              </div>
              <div className="mt-1.5 text-[20px] font-bold tabular text-text-primary">
                {c.unavailable ? "—" : (
                  <>
                    {typeof c.value === "number" ? c.value.toLocaleString() : c.value}
                    {c.unit ? <span className="text-[14px] font-semibold">{c.unit}</span> : null}
                  </>
                )}
              </div>
              {c.delta ? (
                <div className={`mt-0.5 text-[11px] font-medium tabular ${deltaTone}`}>
                  {arrow} {c.delta.replace(/^[-+]/, "")}
                </div>
              ) : null}
              {c.sub ? (
                <div className="mt-0.5 text-[11px] text-text-muted">{c.sub}</div>
              ) : null}
              {c.unavailable ? (
                <div className="mt-0.5 text-[10px] text-text-muted">Data unavailable</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   17. Customer card · used by Post-Call summary
   ============================================================ */
export function CustomerCard({
  name,
  phone,
  callScore,
  callScoreLabel,
  sentiment,
}: {
  name: string;
  phone: string;
  callScore: number;
  callScoreLabel: "Excellent" | "Good" | "Fair" | "Poor";
  sentiment: "positive" | "neutral" | "negative";
}) {
  const scoreTone: Status =
    callScoreLabel === "Excellent" || callScoreLabel === "Good"
      ? "on-track"
      : callScoreLabel === "Fair"
      ? "watch"
      : "off-track";
  const sentimentTone: Status =
    sentiment === "positive" ? "on-track" : sentiment === "neutral" ? "neutral" : "off-track";
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        Customer
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[16px] font-semibold tracking-tight text-text-primary">
            {name}
          </div>
          <div className="text-[12px] text-text-muted tabular">{phone}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            AI call score
          </div>
          <div className="mt-1 inline-flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold tabular text-text-primary">{callScore}</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_PILL[scoreTone].bg} ${STATUS_PILL[scoreTone].text}`}
            >
              {callScoreLabel}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-subtle px-2.5 py-0.5 text-[11px]">
        <span
          className={`h-1.5 w-1.5 rounded-full ${STATUS_PILL[sentimentTone].dot}`}
        />
        <span className="capitalize text-text-secondary">{sentiment}</span>
        <span className="text-text-muted">sentiment</span>
      </div>
    </div>
  );
}

/* ============================================================
   18. Appointment card · used by Post-Call
   ============================================================ */
export function AppointmentCard({
  label,
  schedule,
  vehicle,
}: {
  label: string;
  schedule: string;
  vehicle: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        Appointment
      </div>
      <div className="mt-2 text-[15px] font-semibold text-text-primary">{label}</div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Schedule
          </div>
          <div className="mt-1 text-[13px] tabular text-text-primary">{schedule}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Vehicle
          </div>
          <div className="mt-1 text-[13px] text-text-primary">{vehicle}</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   19. Action-required card · used by DailyDigest
   ============================================================ */
export function ActionRequiredCard({
  items,
}: {
  items: { type: string; count: number; deepLink: string }[];
}) {
  if (items.length === 0) return null;
  const HUMAN_LABEL: Record<string, string> = {
    sms_takeover: "SMS takeover needed",
    appt_confirmed: "Appointments confirmed",
    failed_booking: "Failed bookings · retry",
    specific_salesperson: "Customer asked for someone",
    compliance_alert: "Compliance alert",
    callback_request: "Callback requested",
    recall_response: "Recall response queued",
    pending_status_update: "Pending status update",
    no_show: "No-show follow-up",
  };
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        Action Required
      </div>
      <ul className="mt-3 divide-y divide-border-muted">
        {items.map((it) => (
          <li
            key={`${it.type}-${it.count}`}
            className="flex items-center justify-between gap-3 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-md bg-brand-soft px-1.5 text-[12px] font-semibold tabular text-brand-primary">
                {it.count}
              </span>
              <span className="text-[13px] text-text-primary">
                {HUMAN_LABEL[it.type] ?? it.type}
              </span>
            </div>
            <a
              href={it.deepLink}
              onClick={(e) => e.preventDefault()}
              className="text-[12px] font-semibold text-info hover:underline"
            >
              Review →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   20. Outbound campaigns card · used by DailyDigest
   ============================================================ */
export function OutboundCampaignsCard({
  reached,
  reachedMtd,
  connectRate,
  apptsSet,
  apptsSetMtd,
  campaigns,
  audiencesExhausted,
}: {
  reached: number;
  reachedMtd: number;
  connectRate: number | null;
  apptsSet: number;
  apptsSetMtd: number;
  campaigns: {
    name: string;
    dials: number;
    appts: number;
    conversionPct: number;
    status: "active" | "paused" | "completed";
    pausedWarning?: boolean;
  }[];
  audiencesExhausted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Outbound · yesterday
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SubKpiBox label="Unique reached" value={reached.toLocaleString()} sub={`${reachedMtd} MTD`} />
        <SubKpiBox
          label="Connect rate"
          value={connectRate !== null ? `${connectRate}%` : "—"}
          sub={connectRate !== null ? "vs yesterday" : "Data unavailable"}
        />
        <SubKpiBox label="Appointments set" value={apptsSet.toLocaleString()} sub={`${apptsSetMtd} MTD`} />
      </div>
      {campaigns.length > 0 ? (
        <ul className="mt-4 divide-y divide-border-muted border-t border-border-muted">
          {campaigns.map((c) => {
            const showOnHold = c.pausedWarning;
            const label = showOnHold ? "On hold" : c.status;
            const tone: Status = showOnHold
              ? "watch"
              : c.status === "active"
              ? "on-track"
              : c.status === "completed"
              ? "neutral"
              : "watch";
            return (
              <li key={c.name} className="py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[13px] font-semibold text-text-primary">
                    {c.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_PILL[tone].bg} ${STATUS_PILL[tone].text}`}
                  >
                    {label}
                  </span>
                </div>
                <div className="mt-1 text-[11px] tabular text-text-muted">
                  {c.dials} dials · {c.appts} appts ·{" "}
                  {c.conversionPct.toFixed(1)}% conversion
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      {audiencesExhausted ? (
        <div className="mt-3 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-[11px] text-warning">
          All campaign audiences exhausted. Upload a new list to resume outreach.
        </div>
      ) : null}
    </div>
  );
}

function SubKpiBox({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </div>
      <div className="mt-1 text-[18px] font-bold tabular text-text-primary">{value}</div>
      {sub ? <div className="mt-0.5 text-[11px] text-text-muted">{sub}</div> : null}
    </div>
  );
}

/* ============================================================
   21. Edge-case banner · yellow/blue inline strip inside the report
   ============================================================ */
export function EdgeBanner({
  severity = "info",
  message,
  deepLink,
}: {
  severity?: "info" | "warning";
  message: string;
  deepLink?: string;
}) {
  const styles =
    severity === "warning"
      ? "border-warning/40 bg-warning-soft text-warning"
      : "border-info-border bg-info-soft text-info";
  return (
    <div
      className={`flex items-baseline justify-between gap-3 rounded-md border px-3 py-2 text-[12px] ${styles}`}
    >
      <span>{message}</span>
      {deepLink ? (
        <a
          href={deepLink}
          onClick={(e) => e.preventDefault()}
          className="font-semibold underline"
        >
          Open →
        </a>
      ) : null}
    </div>
  );
}

/* ============================================================
   22. Bullet list card · key takeaways · topics · objections
   ============================================================ */
export function BulletListCard({
  title,
  eyebrow,
  bullets,
}: {
  title?: string;
  eyebrow?: string;
  bullets: string[];
}) {
  if (bullets.length === 0) return null;
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      {eyebrow ? (
        <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          {eyebrow}
        </div>
      ) : null}
      {title ? (
        <div className="mt-0.5 text-[13px] font-semibold text-text-primary">
          {title}
        </div>
      ) : null}
      <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-text-secondary">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-brand-primary" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   23. Topics card · used by Post-Call (name + description rows)
   ============================================================ */
export function TopicsCard({
  topics,
}: {
  topics: { name: string; description: string }[];
}) {
  if (topics.length === 0) return null;
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        Topics discussed
      </div>
      <ul className="mt-3 divide-y divide-border-muted">
        {topics.map((t) => (
          <li key={t.name} className="py-3">
            <div className="text-[13px] font-semibold text-text-primary">
              {t.name}
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
              {t.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   24. Touchpoint attribution table · used by EOC
   ============================================================ */
export function TouchpointTable({
  rows,
}: {
  rows: {
    touchpoint: string;
    firstTouchPct: number;
    lastTouchPct: number;
  }[];
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        Per-touchpoint attribution
      </div>
      <table className="mt-3 w-full">
        <thead>
          <tr className="border-b border-border-muted">
            <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Touchpoint
            </th>
            <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              First-touch %
            </th>
            <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Last-touch %
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.touchpoint} className="border-b border-border-muted last:border-0">
              <td className="py-2.5 text-[13px] font-semibold text-text-primary">
                {r.touchpoint}
              </td>
              <td className="py-2.5 text-right text-[13px] tabular text-text-secondary">
                {r.firstTouchPct.toFixed(1)}%
              </td>
              <td className="py-2.5 text-right text-[13px] tabular text-text-secondary">
                {r.lastTouchPct.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   25. Multichannel performance table · used by Weekly / EOC
   ============================================================ */
export function MultichannelTable({
  rows,
  title = "Multichannel performance",
}: {
  title?: string;
  rows: { channel: string; conversations: number; engagementPct: number; appts: number }[];
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {title}
      </div>
      <table className="mt-3 w-full">
        <thead>
          <tr className="border-b border-border-muted">
            <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Channel
            </th>
            <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Conversations
            </th>
            <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Engagement %
            </th>
            <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Appts
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.channel} className="border-b border-border-muted last:border-0">
              <td className="py-2.5 text-[13px] font-semibold capitalize text-text-primary">
                {r.channel}
              </td>
              <td className="py-2.5 text-right text-[13px] tabular text-text-secondary">
                {r.conversations.toLocaleString()}
              </td>
              <td className="py-2.5 text-right text-[13px] tabular text-text-secondary">
                {r.engagementPct.toFixed(1)}%
              </td>
              <td className="py-2.5 text-right text-[13px] tabular text-text-secondary">
                {r.appts.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   26. Outcome distribution donut · used by EOC
   ============================================================ */
export function OutcomeDonut({
  outcomes,
}: {
  outcomes: { outcome: string; count: number; pct: number }[];
}) {
  const segments = outcomes.map((o, i) => ({
    label: humanizeOutcome(o.outcome),
    value: o.count,
    color: (["info", "positive", "warning", "negative", "neutral"][i % 5] as
      | "info"
      | "positive"
      | "warning"
      | "negative"
      | "neutral"),
  }));
  const total = outcomes.reduce((s, o) => s + o.count, 0);
  return (
    <DonutKpi
      centerNumber={total.toLocaleString()}
      centerLabel="Total Conversations"
      segments={segments}
    />
  );
}

function humanizeOutcome(o: string): string {
  return o
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

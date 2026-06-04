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

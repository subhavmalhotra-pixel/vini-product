import type { ReactNode } from "react";
import { MaterialSymbol } from "../MaterialSymbol";

/**
 * Reporting widget primitives · console-design aesthetic.
 *
 * No external chart library. All visualisations are inline SVG / CSS.
 * Matches the intelligent-console-design tokens: rounded-lg cards,
 * border-only at rest, text-display for hero numbers, tabular-nums on
 * every numeric, threat/opp/warn semantic accents.
 */

type Tone = "neutral" | "good" | "bad" | "warn";

const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-text-secondary",
  good: "text-status-ok",
  bad: "text-status-past",
  warn: "text-status-warning",
};

const TONE_BAR: Record<Tone, string> = {
  neutral: "bg-brand-purple",
  good: "bg-status-ok",
  bad: "bg-status-past",
  warn: "bg-status-warning",
};


/* ============================================================
   1. Card · the universal container
   ============================================================ */
export function Card({
  title,
  description,
  rightSlot,
  children,
  fullHeight,
}: {
  title?: string;
  description?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  fullHeight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-border-subtle bg-surface-card p-5 ${
        fullHeight ? "h-full" : ""
      }`}
    >
      {title || description ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {title ? (
              <h3 className="text-card-title text-text-primary">{title}</h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-meta text-text-tertiary">
                {description}
              </p>
            ) : null}
          </div>
          {rightSlot}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/* ============================================================
   2. KPI card · the most-reused primitive
   ============================================================ */
export function KpiCard({
  icon = "bar_chart",
  label,
  value,
  target,
  delta,
  deltaDirection = "neutral",
  windowLabel = "From the last week",
  sparkline,
  pulse,
}: {
  icon?: string;
  label: string;
  value: string;
  target?: string;
  delta?: string;
  deltaDirection?: "good" | "bad" | "neutral";
  windowLabel?: string;
  sparkline?: number[];
  pulse?: boolean;
}) {
  const deltaTone: Tone =
    deltaDirection === "good"
      ? "good"
      : deltaDirection === "bad"
      ? "bad"
      : "neutral";
  const arrow = delta?.startsWith("-")
    ? "↓"
    : delta?.startsWith("+")
    ? "↑"
    : "·";

  return (
    <div className="rounded-lg border border-border-subtle bg-surface-card px-5 py-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2 text-text-secondary">
          <MaterialSymbol name={icon} size={20} />
          <span className="text-card-title">{label}</span>
        </div>
        {pulse ? <span className="pulse-dot" aria-hidden /> : null}
      </div>

      <div className="mt-3 text-display text-text-primary">{value}</div>

      {delta || sparkline ? (
        <div className="mt-2 flex items-end justify-between gap-3">
          {delta ? (
            <div className="flex items-baseline gap-1.5">
              <span className={`text-delta ${TONE_TEXT[deltaTone]}`}>
                {arrow} {delta.replace(/^[-+]/, "")}
              </span>
              <span className="text-meta text-text-tertiary">
                {windowLabel}
              </span>
            </div>
          ) : (
            <span />
          )}
          {sparkline ? (
            <Sparkline values={sparkline} tone={deltaTone} />
          ) : null}
        </div>
      ) : null}

      {target ? (
        <div className="mt-1 text-meta text-text-tertiary">
          Target: {target}
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   3. Sparkline · tiny inline trend
   ============================================================ */
export function Sparkline({
  values,
  width = 80,
  height = 24,
  tone = "neutral",
}: {
  values: number[];
  width?: number;
  height?: number;
  tone?: Tone;
}) {
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const lineColor =
    tone === "good"
      ? "#16A34A"
      : tone === "bad"
      ? "#DC2626"
      : tone === "warn"
      ? "#D97706"
      : "#1D4ED8";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle
        cx={(values.length - 1) / (values.length - 1) * width}
        cy={height - ((values[values.length - 1] - min) / range) * (height - 4) - 2}
        r={2}
        fill={lineColor}
      />
    </svg>
  );
}

/* ============================================================
   4. Horizontal bar ranking
   ============================================================ */
export function HorizontalBar({
  rows,
  tone = "neutral",
  showValue = true,
  threshold,
}: {
  rows: { label: string; value: number; sublabel?: string; tone?: Tone }[];
  tone?: Tone;
  showValue?: boolean;
  /** Optional threshold band (e.g. team median line) */
  threshold?: { value: number; label: string };
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const rowTone = r.tone ?? tone;
        const pct = (r.value / max) * 100;
        return (
          <div key={r.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-card-title text-text-primary">
                {r.label}
              </span>
              <span className="flex items-baseline gap-1.5">
                {r.sublabel ? (
                  <span className="text-meta text-text-tertiary">
                    {r.sublabel}
                  </span>
                ) : null}
                {showValue ? (
                  <span className="tabular text-card-title text-text-primary">
                    {r.value.toLocaleString()}
                  </span>
                ) : null}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-subtle">
              <div
                className={`h-full ${TONE_BAR[rowTone]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      {threshold ? (
        <div className="flex items-center gap-2 border-t border-border-subtle pt-2 text-meta text-text-tertiary">
          <span className="inline-block h-px w-6 bg-border-strong" />
          {threshold.label}: <span className="tabular">{threshold.value}</span>
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   5. Side-by-side bar comparison
   ============================================================ */
export function ComparisonBar({
  rows,
  leftLabel,
  rightLabel,
  leftTone = "neutral",
  rightTone = "good",
}: {
  rows: { label: string; left: number; right: number }[];
  leftLabel: string;
  rightLabel: string;
  leftTone?: Tone;
  rightTone?: Tone;
}) {
  const max = Math.max(
    ...rows.flatMap((r) => [r.left, r.right]),
    1
  );
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-meta text-text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-sm ${TONE_BAR[leftTone]}`} />
          {leftLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-sm ${TONE_BAR[rightTone]}`} />
          {rightLabel}
        </span>
      </div>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="text-card-title text-text-primary">{r.label}</div>
          <div className="mt-1 grid grid-cols-2 gap-1.5">
            <div className="h-3.5 overflow-hidden rounded-sm bg-surface-subtle">
              <div
                className={`h-full ${TONE_BAR[leftTone]}`}
                style={{ width: `${(r.left / max) * 100}%` }}
              />
            </div>
            <div className="h-3.5 overflow-hidden rounded-sm bg-surface-subtle">
              <div
                className={`h-full ${TONE_BAR[rightTone]}`}
                style={{ width: `${(r.right / max) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-0.5 grid grid-cols-2 gap-1.5 text-meta">
            <span className="tabular text-text-secondary">
              {r.left.toLocaleString()}
            </span>
            <span className="tabular text-text-secondary">
              {r.right.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   6. Stacked bar · single horizontal bar split into segments
   ============================================================ */
export function StackedBar({
  segments,
}: {
  segments: { label: string; value: number; tone: Tone }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div>
      <div className="flex h-6 w-full overflow-hidden rounded-md border border-border-subtle">
        {segments.map((s) => (
          <div
            key={s.label}
            className={`${TONE_BAR[s.tone]} flex items-center justify-center`}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${s.value}`}
          >
            {(s.value / total) >= 0.1 ? (
              <span className="text-[10px] font-semibold text-white">
                {Math.round((s.value / total) * 100)}%
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2" style={{
        gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))`,
      }}>
        {segments.map((s) => (
          <div key={s.label}>
            <div className="flex items-center gap-1.5 text-meta text-text-tertiary">
              <span className={`h-2 w-2 rounded-sm ${TONE_BAR[s.tone]}`} />
              {s.label}
            </div>
            <div className="tabular mt-0.5 text-card-title text-text-primary">
              {s.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   7. Funnel · cascading bars with drop-off counts
   ============================================================ */
export function Funnel({
  stages,
}: {
  stages: { label: string; value: number }[];
}) {
  const max = stages[0]?.value || 1;
  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const pct = (s.value / max) * 100;
        const dropoff = i > 0 ? stages[i - 1].value - s.value : 0;
        const dropPct =
          i > 0 ? (dropoff / stages[i - 1].value) * 100 : 0;
        return (
          <div key={s.label}>
            <div className="flex items-baseline justify-between">
              <span className="text-card-title text-text-primary">
                {s.label}
              </span>
              <span className="tabular text-card-title text-text-primary">
                {s.value.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-brand-purple-soft">
                <div
                  className="absolute inset-y-0 left-0 flex items-center bg-brand-purple px-3 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                >
                  {pct >= 12 ? (
                    <span className="text-[10px] font-semibold tabular text-white">
                      {pct.toFixed(0)}%
                    </span>
                  ) : null}
                </div>
              </div>
              {i > 0 ? (
                <span className="w-20 text-right text-meta text-status-past tabular">
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
  );
}

/* ============================================================
   8. Donut chart · max 5 slices
   ============================================================ */
export function Donut({
  items,
  centerLabel,
  centerValue,
  size = 140,
}: {
  items: { label: string; value: number; tone?: Tone }[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}) {
  const total = items.reduce((s, x) => s + x.value, 0) || 1;
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const colors = ["#1D4ED8", "#16A34A", "#D97706", "#DC2626", "#737373"];
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F5F5F5"
          strokeWidth={14}
        />
        {items.map((it, i) => {
          const dash = (it.value / total) * circumference;
          const seg = (
            <circle
              key={it.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={14}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return seg;
        })}
        {centerValue ? (
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-text-primary"
            style={{
              fontSize: 22,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {centerValue}
          </text>
        ) : null}
      </svg>
      <div className="flex-1 space-y-1.5">
        {items.map((it, i) => (
          <div
            key={it.label}
            className="flex items-baseline justify-between gap-3"
          >
            <span className="inline-flex items-center gap-2 text-card-title text-text-primary">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: colors[i % colors.length] }}
              />
              {it.label}
            </span>
            <span className="tabular text-meta text-text-secondary">
              {Math.round((it.value / total) * 100)}% ·{" "}
              {it.value.toLocaleString()}
            </span>
          </div>
        ))}
        {centerLabel ? (
          <div className="mt-1 border-t border-border-subtle pt-1 text-meta text-text-tertiary">
            {centerLabel}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ============================================================
   9. Heatmap · hour × day-of-week
   ============================================================ */
export function Heatmap({
  data,
  rowLabels,
  colLabels,
  legend,
}: {
  /** 2D matrix [rows][cols] */
  data: number[][];
  rowLabels: string[];
  colLabels: string[];
  legend?: { low: string; high: string };
}) {
  const flat = data.flat();
  const max = Math.max(...flat, 1);
  const cellColor = (v: number) => {
    if (v === 0) return "rgb(245, 245, 245)";
    const intensity = v / max;
    // Blue ramp from accent-primary-soft to accent-primary
    const r = Math.round(239 - (239 - 29) * intensity);
    const g = Math.round(246 - (246 - 78) * intensity);
    const b = Math.round(255 - (255 - 216) * intensity);
    return `rgb(${r},${g},${b})`;
  };
  return (
    <div>
      <div className="flex">
        <div
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: "auto 1fr",
          }}
        >
          {/* Empty corner */}
          <div />
          {/* Column headers */}
          <div
            className="grid gap-0.5"
            style={{
              gridTemplateColumns: `repeat(${colLabels.length}, minmax(0, 1fr))`,
            }}
          >
            {colLabels.map((c) => (
              <div
                key={c}
                className="text-center text-meta text-text-tertiary"
              >
                {c}
              </div>
            ))}
          </div>
          {/* Rows */}
          {rowLabels.map((rl, ri) => (
            <Row key={rl}>
              <div className="pr-2 text-right text-meta text-text-tertiary tabular">
                {rl}
              </div>
              <div
                className="grid gap-0.5"
                style={{
                  gridTemplateColumns: `repeat(${colLabels.length}, minmax(0, 1fr))`,
                }}
              >
                {data[ri].map((v, ci) => (
                  <div
                    key={ci}
                    className="aspect-square rounded-sm"
                    style={{ backgroundColor: cellColor(v) }}
                    title={`${rowLabels[ri]} ${colLabels[ci]}: ${v}`}
                  />
                ))}
              </div>
            </Row>
          ))}
        </div>
      </div>
      {legend ? (
        <div className="mt-3 flex items-center gap-2 text-meta text-text-tertiary">
          <span>{legend.low}</span>
          <div
            className="h-2 w-24 rounded-full"
            style={{
              background:
                "linear-gradient(to right, rgb(239, 246, 255), rgb(29, 78, 216))",
            }}
          />
          <span>{legend.high}</span>
        </div>
      ) : null}
    </div>
  );
}
function Row({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/* ============================================================
   10. Gauge · semi-circle threshold
   ============================================================ */
export function Gauge({
  value,
  max,
  threshold,
  label,
  formatValue = (v) => `${v}`,
}: {
  value: number;
  max: number;
  threshold: number;
  label: string;
  formatValue?: (v: number) => string;
}) {
  const pct = Math.min(value / max, 1);
  const radius = 56;
  const circ = Math.PI * radius;
  const passing = value >= threshold;
  const arcColor = passing ? "#16A34A" : "#DC2626";

  return (
    <div className="flex items-center gap-4">
      <svg width={140} height={86} viewBox="0 0 140 86">
        <path
          d={`M 14 70 A ${radius} ${radius} 0 0 1 126 70`}
          fill="none"
          stroke="#F5F5F5"
          strokeWidth={12}
          strokeLinecap="round"
        />
        <path
          d={`M 14 70 A ${radius} ${radius} 0 0 1 126 70`}
          fill="none"
          stroke={arcColor}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
        />
        <text
          x={70}
          y={64}
          textAnchor="middle"
          className="fill-text-primary"
          style={{
            fontSize: 20,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatValue(value)}
        </text>
      </svg>
      <div className="flex-1">
        <div className="text-card-title text-text-primary">{label}</div>
        <div className="mt-0.5 text-meta text-text-tertiary">
          Target: {formatValue(threshold)}
        </div>
        <div
          className={`mt-1 text-meta ${
            passing ? "text-status-ok" : "text-status-past"
          }`}
        >
          {passing ? "On target" : `${formatValue(threshold - value)} below target`}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   11. Leaderboard table
   ============================================================ */
export function LeaderboardTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, string | number>[];
}) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border-subtle">
          {columns.map((c) => (
            <th
              key={c.key}
              className={`pb-2 text-eyebrow text-text-tertiary ${
                c.align === "right" ? "text-right" : "text-left"
              }`}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr
            key={i}
            className="border-b border-border-muted last:border-0"
          >
            {columns.map((c) => (
              <td
                key={c.key}
                className={`py-2.5 text-card-title text-text-primary ${
                  c.align === "right" ? "text-right tabular" : "text-left"
                }`}
              >
                {r[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ============================================================
   12. Section header
   ============================================================ */
export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-section-h2 text-text-primary">{title}</h2>
      {description ? (
        <p className="mt-0.5 text-section-desc text-text-secondary">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/* ============================================================
   13. RenewalReadinessHero · top of the First-30-days tab
   ============================================================ */
export function RenewalReadinessHero({
  daysSinceGoLive,
  parityScore,
  incrementalValueUsd,
  status,
  headline,
}: {
  daysSinceGoLive: number;
  parityScore: number;
  incrementalValueUsd: number;
  status: "on-track" | "watch" | "off-track";
  headline: string;
}) {
  const STATUS_BG = {
    "on-track": "bg-status-ok-soft",
    watch: "bg-status-warning-soft",
    "off-track": "bg-status-past-soft",
  } as const;
  const STATUS_TEXT = {
    "on-track": "text-status-ok",
    watch: "text-status-warning-ink",
    "off-track": "text-status-past",
  } as const;
  const STATUS_LABEL = {
    "on-track": "On track to renewal",
    watch: "Watch · prep for QBR",
    "off-track": "Off track · escalate",
  } as const;
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BG[status]} ${STATUS_TEXT[status]}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "on-track"
                ? "bg-status-ok"
                : status === "watch"
                ? "bg-status-warning"
                : "bg-status-past"
            }`}
          />
          {STATUS_LABEL[status]}
        </span>
        <span className="text-meta-label text-text-tertiary tabular">
          Day {daysSinceGoLive} of 30 · activation window
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-snug text-text-primary">
        {headline}
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="text-meta-label text-text-secondary">
            Parity score · vs pre-Vini baseline
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-display text-text-primary">
              {parityScore}%
            </span>
            <span className="text-meta text-text-tertiary">
              of pre-Vini human BDC performance
            </span>
          </div>
        </div>
        <div>
          <div className="text-meta-label text-text-secondary">
            Incremental value captured
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-display text-status-ok">
              ${(incrementalValueUsd / 1000).toFixed(1)}K
            </span>
            <span className="text-meta text-text-tertiary">
              revenue your BDC was missing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   14. ParityComparisonRow · baseline | current with delta + status
   ============================================================ */
export function ParityComparisonRow({
  metric,
  baseline,
  current,
  polarity,
  deltaLabel,
  status,
  explainer,
}: {
  metric: string;
  baseline: { value: number; label: string; helper: string };
  current: { value: number; label: string; helper: string };
  polarity: "higher-is-better" | "lower-is-better";
  deltaLabel: string;
  status: "on-track" | "watch" | "off-track";
  explainer: string;
}) {
  const max =
    polarity === "higher-is-better"
      ? Math.max(baseline.value, current.value, 1)
      : Math.max(baseline.value, current.value, 1);
  const baselinePct = (baseline.value / max) * 100;
  const currentPct = (current.value / max) * 100;
  const STATUS_BG = {
    "on-track": "bg-status-ok-soft",
    watch: "bg-status-warning-soft",
    "off-track": "bg-status-past-soft",
  } as const;
  const STATUS_TEXT = {
    "on-track": "text-status-ok",
    watch: "text-status-warning-ink",
    "off-track": "text-status-past",
  } as const;
  return (
    <div className="border-b border-border-subtle py-4 last:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-card-title text-text-primary">{metric}</span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular ${STATUS_BG[status]} ${STATUS_TEXT[status]}`}
        >
          {deltaLabel}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <ParityBar
          label="Pre-Vini baseline"
          value={baseline.label}
          helper={baseline.helper}
          pct={baselinePct}
          tone="neutral"
        />
        <ParityBar
          label="Current · Vini"
          value={current.label}
          helper={current.helper}
          pct={currentPct}
          tone={status === "on-track" ? "good" : status === "watch" ? "warn" : "bad"}
        />
      </div>
      <p className="mt-2 text-[12px] leading-snug text-text-secondary">
        {explainer}
      </p>
    </div>
  );
}

function ParityBar({
  label,
  value,
  helper,
  pct,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  pct: number;
  tone: "good" | "warn" | "bad" | "neutral";
}) {
  const fill =
    tone === "good"
      ? "bg-status-ok"
      : tone === "warn"
      ? "bg-status-warning"
      : tone === "bad"
      ? "bg-status-past"
      : "bg-text-tertiary";
  const valColor =
    tone === "good"
      ? "text-status-ok"
      : tone === "neutral"
      ? "text-text-secondary"
      : "text-text-primary";
  return (
    <div className="rounded-md border border-border-subtle bg-surface-card px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
          {label}
        </span>
        <span className={`tabular text-[14px] font-semibold ${valColor}`}>
          {value}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-subtle">
        <div className={`h-full ${fill}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[10px] leading-snug text-text-tertiary">{helper}</p>
    </div>
  );
}

/* ============================================================
   15. IncrementalCaptureCard · "captured / would-have-missed"
   ============================================================ */
export function IncrementalCaptureCard({
  icon,
  label,
  captured,
  preViniOutcome,
  valueLine,
  tone = "positive",
}: {
  icon: string;
  label: string;
  captured: number;
  preViniOutcome: string;
  valueLine: string;
  tone?: "positive" | "warning" | "neutral";
}) {
  const iconClass =
    tone === "positive"
      ? "bg-status-ok-soft text-status-ok"
      : tone === "warning"
      ? "bg-status-warning-soft text-status-warning-ink"
      : "bg-surface-subtle text-text-secondary";
  const valueClass =
    tone === "positive" ? "text-status-ok" : "text-text-primary";
  // Lazy import to avoid a circular reference in the file order
  return (
    <div className="flex h-full flex-col rounded-lg border border-border-subtle bg-surface-card px-4 py-3">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-md ${iconClass}`}
        >
          <IconFromName name={icon} />
        </span>
        <span className="text-card-title text-text-primary">{label}</span>
      </div>
      <div className={`mt-3 text-display ${valueClass}`}>
        {captured.toLocaleString()}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-text-tertiary">
        Pre-Vini · {preViniOutcome}.
      </p>
      <p className="mt-1.5 text-[12px] leading-snug text-text-secondary">
        {valueLine}
      </p>
    </div>
  );
}

function IconFromName({ name }: { name: string }) {
  // Use Material Symbols Outlined (per locked iconography rule)
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: 16,
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}

/* ============================================================
   16. QBR summary card · pre-formatted bullets for "show your GM"
   ============================================================ */
export function QbrSummaryCard({
  bullets,
}: {
  bullets: string[];
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-section-h2 text-text-primary">
          Show this to your GM at the next QBR
        </h3>
        <button
          type="button"
          disabled
          title="Copy + Email export ships in V2"
          className="cursor-not-allowed rounded-md border border-dashed border-border-strong/70 bg-transparent px-2.5 py-1.5 text-[12px] font-medium text-text-tertiary"
        >
          Copy summary · soon
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {bullets.map((b, i) => (
          <li
            key={i}
            className="flex gap-2.5 text-[13px] leading-relaxed text-text-primary"
          >
            <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-status-ok" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

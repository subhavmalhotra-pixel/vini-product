/**
 * Shared design-system primitives.
 *
 * Kept in a single file for easy reference — engineers can split into
 * individual files when wiring real backend.
 */
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PrimaryCTA
// ─────────────────────────────────────────────────────────────────────────────
type CTAProps = {
  children: ReactNode;
  onClick?: () => void;
  as?: "button" | "a";
  href?: string;
  variant?: "primary" | "outline";
  className?: string;
};
export function PrimaryCTA({
  children,
  onClick,
  as = "button",
  href,
  variant = "primary",
  className = "",
}: CTAProps) {
  const base =
    "inline-flex items-center justify-center text-[13px] font-bold px-7 py-3 rounded-[7px] min-h-[44px] transition-colors duration-150";
  const variants = {
    primary:
      "bg-brand-primary text-white hover:bg-brand-primary-hover",
    outline:
      "border border-border-subtle text-text-primary bg-surface-card hover:bg-surface-background",
  };
  const cls = `${base} ${variants[variant]} ${className}`;
  if (as === "a") {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────────────────────
type CardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
};
export function Card({ children, className = "", as: As = "div" }: CardProps) {
  return (
    <As
      className={`bg-surface-card border border-border-subtle rounded-lg shadow-sm ${className}`}
    >
      {children}
    </As>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionLabel — small uppercase label that introduces a block
// ─────────────────────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wide font-medium text-text-secondary">
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PageHeading
// ─────────────────────────────────────────────────────────────────────────────
type PageHeadingProps = {
  title: string;
  subtitle?: ReactNode;
  trailing?: ReactNode;
};
export function PageHeading({ title, subtitle, trailing }: PageHeadingProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
        )}
      </div>
      {trailing}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pill — small status chip
// ─────────────────────────────────────────────────────────────────────────────
type PillProps = {
  children: ReactNode;
  tone?: "neutral" | "brand" | "positive" | "negative" | "muted";
};
export function Pill({ children, tone = "neutral" }: PillProps) {
  const tones = {
    neutral: "bg-surface-background text-text-primary border-border-subtle",
    brand: "bg-brand-primary/8 text-brand-primary border-brand-primary/15",
    positive: "bg-positive/8 text-positive border-positive/15",
    negative: "bg-negative/8 text-negative border-negative/15",
    muted: "bg-surface-background text-text-muted border-border-subtle",
  };
  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delta — signed percentage with calm color rules
//   - neutral when |delta| < 3
//   - positive (green) when delta ≥ +3
//   - negative (red) when delta ≤ -3
// ─────────────────────────────────────────────────────────────────────────────
type DeltaProps = { value: number | undefined; label?: string };
export function Delta({ value, label }: DeltaProps) {
  if (value === undefined) return null;
  const abs = Math.abs(value);
  let tone = "text-text-muted";
  if (value >= 3) tone = "text-positive";
  if (value <= -3) tone = "text-negative";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return (
    <span className={`tabular text-xs font-medium ${tone}`}>
      {sign}
      {abs.toFixed(1)}%{label ? ` ${label}` : ""}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ToggleSwitch — accessible boolean control
// ─────────────────────────────────────────────────────────────────────────────
type ToggleProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};
export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: ToggleProps) {
  return (
    <label
      className={`flex items-start justify-between gap-4 py-3 min-h-[44px] ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <span className="flex-1">
        {label && (
          <span className="block text-sm font-medium text-text-primary">
            {label}
          </span>
        )}
        {description && (
          <span className="block text-[13px] text-text-secondary mt-0.5">
            {description}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 mt-0.5 items-center rounded-full transition-colors duration-150 ${
          checked ? "bg-brand-primary" : "bg-border-subtle"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState — calm, forward-looking
// ─────────────────────────────────────────────────────────────────────────────
type EmptyStateProps = {
  title: string;
  body: ReactNode;
  action?: ReactNode;
};
export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto max-w-md">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">{body}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </Card>
  );
}

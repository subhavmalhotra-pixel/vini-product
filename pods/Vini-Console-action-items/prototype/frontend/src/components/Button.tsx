import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-brand-purple text-white hover:bg-brand-purple-hover border-brand-purple",
  secondary:
    "bg-white text-text-primary hover:bg-surface-subtle border-border-subtle",
  tertiary:
    "bg-transparent text-text-secondary hover:bg-surface-subtle border-transparent",
  danger:
    "bg-status-past text-white hover:bg-red-700 border-status-past",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-2 py-1 text-[11px]",
  md: "px-3 py-1.5 text-[12px]",
};

export function Button({
  variant = "secondary",
  size = "md",
  children,
  className = "",
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1 rounded-md border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {children}
    </button>
  );
}

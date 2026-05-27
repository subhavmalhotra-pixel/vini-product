type CTAButtonProps = {
  label: string;
  href?: string;
  variant?: "primary" | "secondary";
};

/**
 * CTA button per design system spec:
 * - primary: Vini blue background, white text, 13px/700, 44px min-height, 7px radius
 * - secondary: underlined text link in the same blue, no chrome
 */
export function CTAButton({ label, href = "#", variant = "primary" }: CTAButtonProps) {
  if (variant === "secondary") {
    return (
      <a
        href={href}
        onClick={(e) => e.preventDefault()}
        className="text-[13px] font-semibold text-brand-primary underline transition-colors duration-150 hover:text-brand-primary-hover"
      >
        {label}
      </a>
    );
  }

  return (
    <a
      href={href}
      onClick={(e) => e.preventDefault()}
      className="inline-flex min-h-[44px] items-center justify-center rounded-[7px] bg-brand-primary px-7 py-3 text-[13px] font-bold text-white no-underline transition-colors duration-150 hover:bg-brand-primary-hover"
    >
      {label}
    </a>
  );
}

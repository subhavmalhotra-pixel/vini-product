import type { AnchorHTMLAttributes } from "react";

type CTAButtonProps = {
  label: string;
  href?: string;
  variant?: "primary" | "secondary";
};

/**
 * CTA button per design system spec:
 * - primary: Vini blue background, white text, 13px/700, 44px min-height, 7px radius
 * - secondary: underlined text link in the same blue, no chrome
 *
 * Absolute (http/https) hrefs are real, clickable links that open in a new tab
 * (used by the tracker preview → console.spyne.ai deep links). Relative/placeholder
 * hrefs (the email-gallery demos) stay inert (preventDefault).
 */
export function CTAButton({ label, href = "#", variant = "primary" }: CTAButtonProps) {
  const external = /^https?:\/\//.test(href);
  const linkProps: AnchorHTMLAttributes<HTMLAnchorElement> = external
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href, onClick: (e) => e.preventDefault() };

  const className =
    variant === "secondary"
      ? "text-[13px] font-semibold text-brand-primary underline transition-colors duration-150 hover:text-brand-primary-hover"
      : "inline-flex min-h-[44px] items-center justify-center rounded-[7px] bg-brand-primary px-7 py-3 text-[13px] font-bold text-white no-underline transition-colors duration-150 hover:bg-brand-primary-hover";

  return (
    <a {...linkProps} className={className}>
      {label}
    </a>
  );
}

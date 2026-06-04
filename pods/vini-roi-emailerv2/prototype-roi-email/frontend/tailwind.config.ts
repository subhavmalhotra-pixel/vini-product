import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spyne primary
        "brand-primary": "#4600F2",
        "brand-primary-hover": "#3500B8",
        "brand-soft": "#F0EAFF",
        "brand-foreground": "#FFFFFF",

        // Page + card surfaces from dealer-report screenshots
        "surface-background": "#F4F5F8",
        "surface-card": "#FFFFFF",
        "surface-subtle": "#F5F5F5",

        // Text ramp · darker ink like the screenshots
        "text-primary": "#0A0A0A",
        "text-secondary": "#525252",
        "text-muted": "#737373",
        "text-tertiary": "#9CA3AF",

        // Borders · matches the soft hairlines in the screenshots
        "border-subtle": "#E5E5E5",
        "border-strong": "#D4D4D4",
        "border-muted": "#EFEFEF",

        // Semantic
        positive: "#16A34A",
        "positive-soft": "#DCFCE7",
        "positive-ring": "#86EFAC",
        negative: "#DC2626",
        "negative-soft": "#FEE2E2",
        warning: "#D97706",
        "warning-soft": "#FEF3C7",

        // Info banner background (top of page in screenshots)
        "info-soft": "#EFF6FF",
        "info-border": "#BFDBFE",
        info: "#1D4ED8",

        // Legacy aliases
        "vini-cta": "#4600F2",
        "vini-cta-hover": "#3500B8",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Plus Jakarta Sans",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        md: "0.5rem",
        lg: "0.625rem",
        xl: "0.875rem",
      },
      boxShadow: {
        // Subtle elevation matching the dealer-report card stack
        card: "0 1px 2px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        cta: "0 1px 2px rgba(10, 10, 10, 0.1)",
        email: "0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;

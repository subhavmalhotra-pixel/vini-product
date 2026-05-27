import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#0369A1",
        "brand-primary-hover": "#075985",
        "brand-foreground": "#FFFFFF",
        "surface-background": "#F8FAFC",
        "surface-card": "#FFFFFF",
        "text-primary": "#0F172A",
        "text-secondary": "#475569",
        "text-muted": "#94A3B8",
        "border-subtle": "#E2E8F0",
        positive: "#047857",
        negative: "#B91C1C",
        // Legacy aliases (kept for back-compat; new code should use brand-primary)
        "vini-cta": "#0369A1",
        "vini-cta-hover": "#075985",
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
      },
      boxShadow: {
        email: "0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;

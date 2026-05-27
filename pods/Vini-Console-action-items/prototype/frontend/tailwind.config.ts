import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../test-data/**/*.ts",
  ],
  theme: {
    extend: {
      colors: {
        // Spyne brand
        brand: {
          purple: "#6E2DFF",
          "purple-hover": "#5B1FE0",
          "purple-soft": "#F1ECFF",
          "purple-border": "#E4D8FF",
        },
        // Intent dept colors
        dept: {
          sales: "#2563EB",
          "sales-soft": "#EFF6FF",
          service: "#059669",
          "service-soft": "#ECFDF5",
          both: "#475569",
          "both-soft": "#F1F5F9",
          compliance: "#DC2626",
          "compliance-soft": "#FEF2F2",
        },
        // Status colors
        status: {
          past: "#DC2626",
          "past-soft": "#FEF2F2",
          warning: "#D97706",
          "warning-soft": "#FFFBEB",
          ok: "#059669",
          "ok-soft": "#ECFDF5",
          neutral: "#64748B",
          "neutral-soft": "#F8FAFC",
        },
        surface: {
          background: "#F9FAFB",
          card: "#FFFFFF",
          subtle: "#F8FAFC",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          tertiary: "#94A3B8",
          muted: "#CBD5E1",
        },
        border: {
          subtle: "#E2E8F0",
          strong: "#CBD5E1",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": "11px",
      },
    },
  },
  plugins: [],
};

export default config;

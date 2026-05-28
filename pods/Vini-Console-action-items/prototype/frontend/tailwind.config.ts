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
          // Page background — slightly cooler off-white so cards "lift" off it
          background: "#F6F7F9",
          card: "#FFFFFF",
          subtle: "#F4F5F8",
          // Slightly darker tier for active selections / hover on selected
          muted: "#EEF0F4",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          tertiary: "#94A3B8",
          muted: "#CBD5E1",
        },
        border: {
          subtle: "#E5E7EB",
          strong: "#CBD5E1",
          // Stronger ring tone for focused-row left accent
          accent: "#6E2DFF",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": "11px",
      },
      // Refined elevation scale — Linear / Stripe-style soft shadows
      // (slate-900 base @ low opacity, never pure-black drop)
      boxShadow: {
        "xs": "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        "sm": "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "md": "0 4px 8px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
        "lg": "0 10px 24px -4px rgba(15, 23, 42, 0.10), 0 4px 8px -2px rgba(15, 23, 42, 0.04)",
        "xl": "0 20px 32px -8px rgba(15, 23, 42, 0.12), 0 8px 12px -4px rgba(15, 23, 42, 0.06)",
        "drawer": "-12px 0 32px -8px rgba(15, 23, 42, 0.14), -4px 0 8px -2px rgba(15, 23, 42, 0.06)",
        "tile-active": "0 0 0 1px #6E2DFF, 0 1px 2px 0 rgba(110, 45, 255, 0.10)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.3, 0.64, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        "out-quad": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      keyframes: {
        "drawer-in": {
          "0%": { transform: "translateX(16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "backdrop-in": {
          "0%": { opacity: "0", backdropFilter: "blur(0px)" },
          "100%": { opacity: "1", backdropFilter: "blur(6px)" },
        },
        "fade-in-up": {
          "0%": { transform: "translateY(4px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "drawer-in": "drawer-in 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        "backdrop-in": "backdrop-in 200ms ease-out",
        "fade-in-up": "fade-in-up 180ms ease-out",
        "pop-in": "pop-in 140ms cubic-bezier(0.34, 1.3, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

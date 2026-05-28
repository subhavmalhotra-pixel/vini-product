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
        // Spyne Intelligent Console · per console-revamp/tokens.md
        // The `brand-purple` class names are retained as aliases so no consumer
        // has to change — the underlying value flips from Spyne brand purple
        // (#4600F2) to the console's deep blue (#1D4ED8) operator accent.
        brand: {
          purple: "#1D4ED8",
          "purple-hover": "#1E40AF",
          "purple-soft": "#EFF6FF",
          "purple-border": "#DBE5FC",
          primary: "#1D4ED8",
          "primary-soft": "#EFF6FF",
          "primary-dark": "#1E40AF",
        },
        // Intent dept colors — kept (departments are domain-specific)
        dept: {
          sales: "#1D4ED8",
          "sales-soft": "#EFF6FF",
          service: "#16A34A",
          "service-soft": "#F0FDF4",
          both: "#525252",
          "both-soft": "#F5F5F5",
          compliance: "#DC2626",
          "compliance-soft": "#FEF2F2",
        },
        // Status colors · console-revamp semantic accents
        status: {
          past: "#DC2626", // threat
          "past-soft": "#FEF2F2", // threat-soft
          warning: "#D97706", // warn (amber, not yellow)
          "warning-soft": "#FFFBEB",
          "warning-ink": "#92400E",
          ok: "#16A34A", // opp
          "ok-soft": "#F0FDF4", // opp-soft
          neutral: "#525252",
          "neutral-soft": "#F5F5F5",
        },
        surface: {
          // Console page background · slightly warmer off-white
          background: "#FAFAFA",
          card: "#FFFFFF",
          subtle: "#F5F5F5", // bg-card-muted
          muted: "#F5F5F5",
        },
        text: {
          // Darker ink for crisper legibility on FAFAFA
          primary: "#0A0A0A",
          secondary: "#525252",
          tertiary: "#737373",
          muted: "#A3A3A3",
        },
        border: {
          subtle: "#E5E5E5",
          muted: "#EFEFEF",
          strong: "#D4D4D4",
          accent: "#1D4ED8",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": "11px",
      },
      // Elevation per console-revamp/tokens.md · three levels, that's it.
      //   e0 (rest)  = 1px border  — DEFAULT for cards. No shadow.
      //   e1 (hover) = border + 0 1px 2px rgba(10,10,10,0.04)
      //   e2 (float) = border + 0 8px 24px rgba(10,10,10,0.08) — for drawer, popovers, modals
      boxShadow: {
        "xs": "0 1px 2px rgba(10, 10, 10, 0.04)",
        "e1": "0 1px 2px rgba(10, 10, 10, 0.04)",
        "sm": "0 1px 2px rgba(10, 10, 10, 0.04)",
        "md": "0 8px 24px rgba(10, 10, 10, 0.08)",
        "e2": "0 8px 24px rgba(10, 10, 10, 0.08)",
        "lg": "0 8px 24px rgba(10, 10, 10, 0.08)",
        "drawer": "-12px 0 32px -8px rgba(10, 10, 10, 0.14), -4px 0 8px -2px rgba(10, 10, 10, 0.06)",
        "tile-active": "0 0 0 1px #1D4ED8, 0 1px 2px 0 rgba(29, 78, 216, 0.10)",
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

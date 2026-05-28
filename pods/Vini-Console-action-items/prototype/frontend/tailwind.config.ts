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
        // Spyne brand · LOCKED · DESIGN_SYSTEM.md v1
        brand: {
          // Canonical primary — was #6E2DFF, migrated to Spyne #4600F2
          purple: "#4600F2",
          "purple-hover": "#3500B8",
          "purple-soft": "#F0EAFF", // ~6% opaque tint of #4600F2
          "purple-border": "#D9CCFF",
          // Alias for forward use — Spyne calls this "brand-primary"
          primary: "#4600F2",
          "primary-soft": "#F0EAFF",
          "primary-dark": "#3500B8",
        },
        // Intent dept colors — kept (departments are domain-specific, not Spyne brand)
        dept: {
          sales: "#3B82F6",
          "sales-soft": "#EFF6FF",
          service: "#027A48",
          "service-soft": "#ECFDF5",
          both: "#6B7280",
          "both-soft": "#F3F4F6",
          compliance: "#D13313",
          "compliance-soft": "#FDECE9",
        },
        // Status colors · per DESIGN_SYSTEM Semantic table
        status: {
          past: "#D13313", // error
          "past-soft": "#FDECE9", // error at ~10%
          warning: "#FACC15", // warning yellow
          "warning-soft": "#FEF9C3",
          "warning-ink": "#854D0E", // legible label text on light bg
          ok: "#027A48", // success
          "ok-soft": "#E6F4EE",
          neutral: "#6B7280",
          "neutral-soft": "#F4F5F8",
        },
        surface: {
          // Spyne locked page background
          background: "#F4F5F8",
          card: "#FFFFFF",
          subtle: "#F4F5F8",
          muted: "#EEF0F4",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#6B7280",
          tertiary: "#9CA3AF",
          muted: "#D1D5DB",
        },
        border: {
          subtle: "#E5E7EB",
          // Subtle column dividers ~45% per Spyne `border-muted`
          muted: "rgba(229, 231, 235, 0.45)",
          strong: "#D1D5DB",
          accent: "#4600F2",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": "11px",
      },
      // Elevation scale per Spyne DESIGN_SYSTEM. Prefer borders over shadows;
      // shadows reserved for true floating surfaces (drawer, popover, tooltip).
      boxShadow: {
        "xs": "0 1px 2px rgba(17, 17, 17, 0.04)",
        "sm": "0 1px 2px rgba(0, 0, 0, 0.06)",
        "md": "0 4px 12px rgba(0, 0, 0, 0.08)",
        "lg": "0 12px 32px rgba(0, 0, 0, 0.12)",
        "drawer": "-12px 0 32px -8px rgba(0, 0, 0, 0.14), -4px 0 8px -2px rgba(0, 0, 0, 0.06)",
        "tile-active": "0 0 0 1px #4600F2, 0 1px 2px 0 rgba(70, 0, 242, 0.10)",
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

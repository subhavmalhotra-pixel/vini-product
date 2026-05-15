import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    // Phase 1 email components are imported into the preview pane — scan them
    // so their utility classes survive the Phase 2 build.
    "../frontend/src/**/*.{ts,tsx}",
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
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

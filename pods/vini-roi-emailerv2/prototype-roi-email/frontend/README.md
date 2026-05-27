# Vini Emailer Frontend Preview

A Vite + React + TypeScript preview tool for the four Vini Dealer Reporting
emails: Daily Digest, Weekly Performance, Monthly Value, End-of-Campaign.

Renders all 20 scenarios defined in `/test-data` against a static fixture set.
Engineers wiring the backend can replace the `@test-data` imports with API
responses matching the same TypeScript shapes (see `test-data/schema.ts`).

## Quickstart

```bash
npm install
npm run dev
```

The dev server prints a URL (default `http://localhost:5173`). The left sidebar
lists every scenario grouped by email type — click one to render it.

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — type-check + production build to `dist/`
- `npm run typecheck` — `tsc --noEmit`

## Project layout

```
src/
  main.tsx
  App.tsx
  index.css                  Tailwind directives
  components/                Shared UI (KPI cards, channel split, banners, etc.)
  emails/                    One renderer per email type
```

## Notes

- The path alias `@test-data` resolves to `../../test-data` per `vite.config.ts`
  and `tsconfig.json`.
- CTAs are visual only — clicks are intercepted and do nothing.
- Suppressed sends (e.g. `daily-silent-day`) render a red overlay banner above
  the email body so engineers can still inspect what would have rendered.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Sharewise

Browser-based expense splitter for shared stays. All state lives in the browser — no backend, no database, no auth.

## Architecture

Single-page client app served by Next.js 16 (App Router). The only server-rendered part is `app/layout.tsx` (locale detection via `next-intl`). Everything else is `"use client"`.

State flows top-down from `SharewiseDashboard` through `DashboardState` and `DashboardActions` props. There is no global store — the dashboard component owns the `ProjectData` state and passes slices to step components.

## Key conventions

- **TypeScript strict mode** — no `any`, no type assertions unless unavoidable.
- **Formatting** — Prettier with double quotes, trailing commas, 100 char print width. Run `npm run format` before committing.
- **Linting** — ESLint with `eslint-config-next` (core-web-vitals + typescript). Run `npm run lint`.
- **Imports** — use `@/` path aliases (`@/lib/...`, `@/components/...`). Never use relative paths that go above the current directory.
- **UI primitives** — shadcn/ui components live in `components/ui/`. Use existing primitives before adding new ones.
- **UI primitives are baseline** — do not modify shared shadcn/ui primitive files such as `components/ui/button.tsx`, `components/ui/dialog.tsx`, or `components/ui/drawer.tsx` unless the user explicitly asks for a primitive-level change. Prefer fixing sizing or layout at the usage site first.
- **Icons** — Lucide React only. Do not add other icon libraries.
- **i18n** — all user-facing strings come from `lib/i18n.ts` translations object, keyed by `nl` and `en`. Access via `useI18n()` hook. Never hardcode Dutch or English strings in components.
- **Math** — all monetary calculations use `decimal.js` via `lib/calculations/money.ts` helpers. Never use native floating-point arithmetic for money.
- **IDs** — generated with `crypto.randomUUID()` prefixed by type (`p-`, `c-`). Never use array indices as keys for mutable lists.

## Verification

Before considering a change complete:

```bash
npm run lint          # ESLint
npm run format:check  # Prettier
npm run type          # TypeScript type check
npm run build         # Next.js production build
```

CI runs all four on every push and PR.

# GitHub Copilot Instructions for Sharewise

Use [AGENTS.md](/AGENTS.md) as the canonical project instruction file. Subdirectories (`app/`, `components/`, `lib/`) have their own `AGENTS.md` with area-specific rules — check the nearest one before making changes.

## Project context

Sharewise is a browser-based expense splitter. All state lives client-side — there is no backend, no database, no API routes. The only server-rendered code is `app/layout.tsx` for locale detection.

## Code style

- TypeScript strict mode — no `any`, no type assertions unless unavoidable.
- Double quotes, trailing commas, 2-space indent, 100 char print width (Prettier).
- Imports use `@/` path aliases — never relative paths that go above the current directory.
- Component files are kebab-case, exports are PascalCase (e.g., `costs-step.tsx` → `CostsStep`).

## Patterns to follow

- All user-facing strings come from the `translations` object in `lib/i18n.ts` — never hardcode text.
- All monetary math uses `decimal.js` via `lib/calculations/money.ts` — never use native floats for money.
- UI primitives live in `components/ui/` (shadcn/ui with `@base-ui/react`) — use what exists before adding new ones.
- Icons come from Lucide React only.
- Step components receive `DashboardState` and `DashboardActions` as props — they do not own project state.

## Verification

```bash
npm run lint          # ESLint
npm run format:check  # Prettier
npm run type          # TypeScript type check
npm run build         # Next.js production build
```

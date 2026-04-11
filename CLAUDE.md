# CLAUDE.md

Use [AGENTS.md](AGENTS.md) as the canonical project instruction file. Subdirectories (`app/`, `components/`, `lib/`) have their own `AGENTS.md` with area-specific rules — check the nearest one before making changes.

## Project context

Sharewise is a browser-based expense splitter. All state lives client-side — there is no backend, no database, no API routes. The only server-rendered code is `app/layout.tsx` for locale detection.

## Working with this codebase

- Prefer small, reviewable edits over broad rewrites.
- All user-facing strings live in `lib/i18n.ts` under `translations` — add new keys to both `nl` and `en`.
- All monetary math goes through `decimal.js` via `lib/calculations/money.ts` — never use native floats.
- UI primitives are in `components/ui/` (shadcn/ui) — reuse before adding.
- Step components receive `DashboardState` and `DashboardActions` props — they do not own project state.

## Verification

After non-trivial changes, run when the environment allows:

```bash
npm run lint          # ESLint
npm run format:check  # Prettier
npm run type          # TypeScript type check
npm run build         # Next.js production build
```

# lib/

Shared logic, types, and utilities. No React components here — only pure functions and type definitions.

## Structure

| File / Directory     | Purpose                                                     |
| -------------------- | ----------------------------------------------------------- |
| `calculations/`      | Calculation engine, money helpers, types, validation        |
| `dashboard-types.ts` | Wizard step IDs, `DashboardState`, `DashboardActions` types |
| `i18n.ts`            | Translation strings (nl/en), locale helpers, formatting     |
| `utils.ts`           | `cn()` class name merger (tailwind-merge + clsx)            |

## calculations/

The calculation engine is the core of Sharewise. It is pure — no React, no side effects, no DOM access.

| File            | Purpose                                                              |
| --------------- | -------------------------------------------------------------------- |
| `types.ts`      | All domain types: `ProjectData`, `CalculationResult`, etc.           |
| `calculate.ts`  | `calculateProject()` — main entry point, produces full result        |
| `money.ts`      | `decimal.js` wrappers: `money()`, `euro()`, `allocateRoundedCents()` |
| `validation.ts` | Zod schemas and `validateProjectWarnings()`                          |
| `selectors.ts`  | Text formatters for summaries, breakdowns, and copy-to-clipboard     |

### Rules

- All monetary arithmetic must go through `decimal.js` via `money()`. Never use native JS floats for amounts.
- `allocateRoundedCents()` handles the largest-remainder rounding so household display totals sum to the project total. Do not implement alternative rounding.
- Validation schemas use Zod. The `projectSchema` is also used for import validation.
- Selectors produce plain text strings (for clipboard). They are locale-aware.

## i18n

- `translations` is a flat object keyed by locale (`nl`, `en`). Each locale has the same shape (`Messages` type).
- Add new strings to both `nl` and `en` — missing keys in either locale cause build-time type errors.
- Helper functions like `formatValidationMessage()` and `formatSelectorMessage()` handle parameterized strings.

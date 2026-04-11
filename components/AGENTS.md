# components/

All React components. Every component file is a client component (`"use client"`).

## Structure

| Directory       | Purpose                                               |
| --------------- | ----------------------------------------------------- |
| `dashboard/`    | Shell, header, footer, import dialog, step navigation |
| `participants/` | Participants and households wizard step               |
| `costs/`        | Cost entry wizard step                                |
| `calculation/`  | Review and calculation breakdown step                 |
| `payments/`     | Final payment summary step                            |
| `ui/`           | shadcn/ui base primitives                             |

## Conventions

- Step components receive `DashboardState` and `DashboardActions` as props — they do not manage their own project state.
- The `useI18n()` hook provides `locale` and `copy` (translated strings). Never import translations directly in components.
- Use existing `components/ui/` primitives. These are shadcn/ui components using `@base-ui/react` under the hood (base-nova style). Do not wrap them in additional abstraction layers.
- Avoid adding new dependencies for UI interactions that shadcn/ui already handles.
- Component files are named in kebab-case matching the component function name in PascalCase (e.g., `calculation-step.tsx` exports `CalculationStep`).

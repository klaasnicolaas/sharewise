# app/

Next.js 16 App Router entry point. Contains only the root layout and a single page.

## Files

- `layout.tsx` — server component. Sets up font, metadata, `NextIntlClientProvider`, `I18nProvider`, and `TooltipProvider`. Detects locale via `next-intl/server`.
- `page.tsx` — renders `<SharewiseDashboard />`. No props, no data fetching.
- `globals.css` — Tailwind CSS 4 base styles and CSS custom properties for the design system (colors, radii, shadows).

## Rules

- `layout.tsx` is the only server component in the app. Everything else is client-side.
- Do not add API routes — this is a local-first browser app with no backend.
- Do not add additional pages — the app is a single-page wizard.
- Font is Plus Jakarta Sans loaded via `next/font/google`.

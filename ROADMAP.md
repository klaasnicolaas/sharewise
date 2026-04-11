# Sharewise Roadmap

This document outlines the current direction of Sharewise. It is a living document — priorities can shift based on user feedback and real-world usage. Feel free to comment, vote with a 👍, or open a new discussion if something is missing.

## What Sharewise already does

- Organize participants into **households**
- Set **nights per participant** and control which cost categories each person counts toward
- Split costs by **five distribution models**: per night, per stay, headcount, direct household, or excluded
- **Inspect the math** — every step is visible and hoverable
- **Validation warnings** before sharing results
- **Copy and share** household breakdowns and payment summaries
- **Export / import** full project files as JSON
- **Autosave** to local browser storage
- **Dutch and English** language support
- **URL-based step routing** (`?step=...`)

## Roadmap

### Near-term

These are items that are well-defined and likely to be worked on next.

- [ ] **Improved sharing** — generate a shareable, read-only link or summary page (still no backend: encode state in the URL or use a paste service)
- [ ] **Rounding transparency** — show explicitly how rounding adjustments are distributed across households in the result view
- [ ] **Undo / redo** — step back through recent changes without having to re-enter data
- [ ] **Keyboard navigation** — full keyboard accessibility across the wizard steps

### Medium-term

Planned but still being shaped. Feedback welcome.

- [ ] **Multiple currencies** — allow cost items in different currencies with a fixed exchange rate per project
- [ ] **Payment tracking** — mark individual payments as settled and track outstanding balances
- [ ] **Project templates** — save a project structure (participants, households) as a reusable starting point
- [ ] **Print / PDF export** — generate a clean printable summary of the full breakdown

### Longer-term / ideas

These are possibilities worth exploring, but not yet committed to.

- [ ] **Progressive Web App (PWA)** — installable, works offline without needing to open a browser tab
- [ ] **Dark mode** — full theme support beyond the current system default
- [ ] **More split models** — e.g. custom weight per participant, percentage-based splits
- [ ] **Accessibility audit** — WCAG 2.1 AA compliance across all flows

---

## Not planned

To set expectations clearly, these are things Sharewise will **not** do (at least for now):

- **Accounts / sign-in** — Sharewise is intentionally account-free; no data ever leaves your device
- **Server-side state or a database** — all state stays in the browser
- **Real-time collaboration** — not feasible without a backend
- **Mobile app** — the web app is responsive and installable as a PWA (see above)

---

_Last updated: 11 April 2026_

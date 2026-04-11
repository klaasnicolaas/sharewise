<p align="center">
  <img src="https://raw.githubusercontent.com/klaasnicolaas/sharewise/main/app/icon.svg" alt="Sharewise icon" width="72" height="72">
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/klaasnicolaas/sharewise/main/public/assets/brand/sharewise-wordmark-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/klaasnicolaas/sharewise/main/public/assets/brand/sharewise-wordmark-light.svg">
    <img alt="Sharewise" src="https://raw.githubusercontent.com/klaasnicolaas/sharewise/main/public/assets/brand/sharewise-wordmark-light.svg" width="240">
  </picture>
</p>

<p align="center">
  <strong>Split shared stay costs fairly, explain the math clearly, and keep everything local in the browser.</strong>
</p>

<p align="center">
  <a href="https://github.com/klaasnicolaas/sharewise/actions/workflows/linting.yaml"><img
    src="https://github.com/klaasnicolaas/sharewise/actions/workflows/linting.yaml/badge.svg"
    alt="Linting"
  /></a>
  <a href="LICENSE"><img
    src="https://img.shields.io/badge/license-MIT-blue"
    alt="License"
  /></a>
</p>

<p align="center">
  Sharewise is a free, browser-based expense splitter for weekends away, holiday houses, and other shared stays
  where a flat "divide by everyone" approach is not good enough.
  It lets you group people into households, assign costs by the right distribution model,
  inspect every step of the calculation, and share the result.
</p>

## What you can do

- 👥 **Organize participants into households** — group people when a bill should land on one shared total, or keep them individual
- 🌙 **Set nights per participant** — decide which cost categories each person counts toward
- 💰 **Split costs by the right model** — choose between per-night, per-stay, headcount, direct household assignment, or excluded
- 🔢 **Inspect the calculation** — review the math per person and per household, hover breakdown rows to see which cost items are included
- ⚠️ **Catch issues early** — see validation warnings before sharing totals
- 📋 **Copy and share results** — copy household breakdowns and payment summaries with one click
- 📦 **Export and import projects** — save and restore full project files as JSON
- 💾 **Resume from autosave** — your current project is saved locally in the browser
- 🌐 **Switch language** — available in Dutch and English
- 🔗 **Keep your place** — the current wizard step is stored in the URL with `?step=...`

## How it works

1. **Add participants** and optionally group them into households.
2. **Set nights** per participant and decide which cost categories they count toward.
3. **Add cost items** and choose the correct distribution mode for each one.
4. **Review the result** per person and per household.
5. **Copy the final totals** or export the full project as JSON.

Sharewise works entirely in the browser. No account needed, no data leaves your device.

## Cost distribution

Sharewise supports five distribution types:

| Type               | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `per_night`        | Split across counted person-nights                                |
| `per_stay_person`  | Split evenly across participants counted for stay-related costs   |
| `headcount`        | Split evenly across participants counted for general shared costs |
| `direct_household` | Assign the full amount to one household                           |
| `excluded`         | Keep a cost visible without including it in the final calculation |

Internally, Sharewise uses `decimal.js` so calculations remain precise until final display rounding. Household totals are rounded in a way that keeps the final sum aligned with the project total.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev           # Development server
npm run build         # Production build
npm run start         # Production server
npm run lint          # ESLint
npm run format:check  # Prettier
npm run type          # TypeScript type check
```

## Sponsors

If Sharewise is useful to you, you can help fund continued development and maintenance.

- Support the project through [GitHub Sponsors](https://github.com/sponsors/klaasnicolaas)
- Send a one-off contribution through [Ko-fi](https://ko-fi.com/klaasnicolaas)

## License

Distributed under the **MIT** License — see [LICENSE](LICENSE) for details.

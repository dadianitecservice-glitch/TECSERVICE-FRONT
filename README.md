# TECSERVICE Home Page — Local Preview

Working React + TypeScript + Vite implementation of the approved Figma Home Page (`249:150`).

## Current responsive source — corrected 2026-09-10

Use Figma file `jFj30Fmjkt99KRo0yOpA8k`, **page `173:9`** (`00 — Design System / Components`).
The responsive references are `617:58` (1024px), `617:795` (768px), and `617:1532` (390px).
The master on that page is `601:58`. Do not use the superseded `541:*` responsive board on `01 — Home`.

`src/styles/responsive.css` implements these references below 1200px: stacked Hero/AI,
native horizontally scrollable Services, Shop, Reviews and Blog, compact menu, live-map contact block,
and the two-column mobile footer navigation. Desktop keeps its existing layout.
See `artifacts/visual-qa/correct-responsive-173-9.md` for verification and small content-fit differences.

## Start locally

```bash
npm install
npm run dev
```

Vite prints the local address, normally `http://localhost:5173`.

If you use pnpm:

```bash
pnpm install
pnpm run dev
```

## Production check

```bash
npm run build
npm run preview
```

The build prerenders all Georgian/English pages and private sign-in shells into complete HTML (52 documents; 44 currently indexable URLs) and audits the output. Each page loads its own code/styles, with English translation catalogs loaded only for English pages. Run `npm run test:seo` after building and `node --test tests/*.test.mjs` for all regressions. Local dev/preview has a noindex response header; deploy only `dist` to the public site. See [SEO.md](SEO.md) for server configuration, the legal-content indexing gate, performance checks and Search Console setup still required at launch.

For the ready-to-upload website archive and Facebook article previews, follow the [Georgian deployment guide](docs/upload-website-ka.md). Upload the complete generated site and serve each article's own HTML; publishing source code to GitHub alone does not update the hosting server.

## Demo interactions

- Demo service code: `TS-2026-001245`
- Phone lookup: enter a valid Georgian mobile number, e.g. `591474040`
- OTP: `123456`
- Phone/OTP verification is a local demo; no real SMS is sent.
- Product “ყიდვა” actions open the corresponding shop product; comparison has a local selected state.
- The trial assessment card reads prices, timeframes and price notes directly from the same seven service-page data catalogs. It shows a source-page link, preserves starting prices and diagnostic-only quotes, and asks for clarification when a device or service is unclear. It is a local rule-based preview, not an AI model or a confirmed diagnosis.
- The trial assistant does not upload photos, call an external AI provider, or store question text in browser storage. The existing assistant API client remains unused for a future separately approved integration.

## Typography and external content

The approved design uses Noto Sans Georgian. Regular (400), Medium (500), SemiBold (600) and Bold (700) are bundled through `@fontsource/noto-sans-georgian`, so the browser does not depend on Google Fonts at runtime. `Sylfaen`, `Arial`, and `sans-serif` remain defensive fallbacks. The embedded Google Map requires an internet connection; its location link remains available if Google does not load.

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

The build also prerenders Home into HTML for crawlers and link-preview clients. Run `npm run test:seo` after building. Local dev/preview has a noindex response header; deploy only `dist` to the public site. See [SEO.md](SEO.md) for the SEO configuration and remaining launch checks, including unfinished page routes and Search Console setup.

## Demo interactions

- Demo service code: `TS-2026-001245`
- Phone lookup: enter a valid Georgian mobile number, e.g. `591474040`
- OTP: `123456`
- Phone/OTP verification is a local demo; no real SMS is sent.
- Product “ყიდვა” actions open the corresponding shop product; comparison has a local selected state.
- The assessment card gives local rule-based advice, not an OpenAI-backed diagnosis.

## Typography and external content

The approved design uses Noto Sans Georgian. Regular (400), Medium (500), SemiBold (600) and Bold (700) are bundled through `@fontsource/noto-sans-georgian`, so the browser does not depend on Google Fonts at runtime. `Sylfaen`, `Arial`, and `sans-serif` remain defensive fallbacks. The embedded Google Map requires an internet connection; its location link remains available if Google does not load.

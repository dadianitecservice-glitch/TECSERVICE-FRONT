# TECSERVICE Home Page — Local Preview

Working React + TypeScript + Vite implementation of the approved Figma Home Page (`249:150`).

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

## Demo interactions

- Ticket code: `TS-2026-001245`
- Phone lookup: enter any non-empty phone number
- OTP: `123456`
- Shop actions update the local cart and open the Header cart drawer

## Typography and external content

The approved design uses Noto Sans Georgian. The required Georgian and Latin WOFF2 subsets are self-hosted in `public/assets/fonts`, so the browser does not depend on Google Fonts at runtime. The files are distributed under the included SIL Open Font License (`public/assets/fonts/OFL.txt`). `Sylfaen`, `Arial`, and `sans-serif` remain defensive fallbacks. The embedded Google Map requires an internet connection; a local Figma-style map image remains underneath as a visual fallback.

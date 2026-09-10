# Corrected responsive Home verification

Date: 2026-09-10. Local preview: http://localhost:5173/

## Source of truth

Figma file: `jFj30Fmjkt99KRo0yOpA8k`, page `173:9` — `00 — Design System / Components`.

| Width | Correct Figma node | Reference height | Browser height | Content gutter |
| --- | --- | ---: | ---: | ---: |
| 1024 | 617:58 | 5054 | 5054 | 32 |
| 768 | 617:795 | 5297 | 5350 | 24 |
| 390 | 617:1532 | 5628 | 5679 | 16 |

The previous `541:*` implementation and its special provider, alternate About visual, and review excerpts were removed. The original desktop layout and existing data/assets remain in use. Figma itself was not modified.

## Implementation

- Phone/language utility bar on mobile; logo and hamburger header.
- Stacked Hero and full-width AI assessment area; two-column device choices on mobile.
- All seven services in the reference's horizontal swipe strip, with descriptions hidden only on mobile.
- Single-row Shop, Reviews and Blog tracks, native touch scrolling and working previous/next controls.
- Shop product links remain separate from local comparison actions.
- Stacked service lookup and cabinet promo, responsive OTP and vertical mobile status timeline.
- Existing Google Maps iframe restored; no replacement stock-photo About section.
- Footer links remain in two columns on mobile.
- Reduced-motion handling for arrow-driven scrolling.

## Quick checks

- Browser widths: 360, 390, 768, 1024, 1100, 1280 and 1440px.
- No page-level horizontal overflow at these widths. Intentional card-track overflow stays inside its viewport.
- Main/header containers centered; responsive gutters measured at 16, 24 and 32px.
- No broken local image assets detected; Noto Sans Georgian loaded.
- No overlapping description/action areas detected in service cards.
- Mobile menu opens, services submenu expands, Escape closes it.
- Shop Next changes scroll position (0 → 404px at 390px) and activates page 2; Previous returns to 0.
- Blog Next advances to a different article (316px), updating page 2. Reviews Next advances 346px.
- Invalid phone rejected; valid Georgian number enters the demo OTP state.
- Six-digit input distributed correctly; wrong code shows an error; `123456` shows the responsive result without overflow.
- Data-recovery assessment returns local safety advice without horizontal overflow.
- Desktop restores 12 product cards, 3 review cards and 4 Blog cards after responsive resizing.
- 27 automated validation/assessment tests passed; TypeScript + Vite production build passed; `git diff --check` passed.
- No new browser error/warning logs on final reloads. Earlier Vite hot-reload messages during file replacement are historical.

## Intentional differences and limits

This is not an assertion of zero bugs or exact pixel identity. Some supplied Figma frames clip longer text or let footer content overlap. The implementation lets those areas grow: 768px is 53px taller overall; 390px is 51px taller. At 1024px all default section heights match the reference.

Carousel page counts reflect actual local content and viewport width, rather than decorative fixed dots. AI and SMS are still explicitly labeled local demonstrations, not real backend services. The existing Google Maps iframe was retained; its map tiles did not render in the in-app test browser, so external map loading is not verified. No full ecommerce, authentication, external data refresh or backend behavior is claimed.

Viewport screenshots: `correct-173-9-1024-top.png`, `correct-173-9-768-top.png`, `correct-173-9-390-top.png`. Other older responsive screenshots/reports in this folder are superseded and must not be used as the implementation source.

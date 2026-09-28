# Frontend performance QA — 26 September 2026

## Scope and measurement

The production build was checked locally, before deployment. `scripts/measure-performance.mjs` visits all 52 prerendered HTML documents and accounts for each document's unique initial JavaScript, stylesheets, and local image sources. It follows the URLs actually emitted in the HTML, including module preloads, rather than reporting only the entry-file size.

Run with the project's Node runtime:

```text
node scripts/measure-performance.mjs dist .tmp/performance-report.json
```

The byte counts below are raw file sizes. The gzip column is the sum of independently compressed files, an estimate of possible transfer size **if hosting enables gzip**. It does not prove live HTTP compression, CDN caching, user-perceived load time, or Core Web Vitals. Image accounting separates `loading="lazy"` from eager images but does not simulate viewport thresholds, CSS backgrounds, `srcset`, or browser font selection.

## Improvement without a redesign

The homepage previously downloaded all seven service-page data catalogs and the price-assessment logic on its initial load, even when visitors never used the assistant. The helper is now requested only after submitting a non-empty description. This loading change preserves the calculator, prices, disclaimers, language handling, and service-source links. A separate browser-reproduced issue with HP ZBook identification was also corrected during the coordinating QA pass, without inventing or duplicating prices.

The async boundary includes a disabled loading button and `aria-busy`, concurrent-request deduplication, a localized failure message with a contact link, and retry after a failed download. Editing the description or switching device invalidates a pending request so an old answer cannot appear under new input. Unmounting also invalidates it. The homepage remains fully prerendered; this change does not hide readable content or alter SEO metadata.

## Before and after

The baseline was the existing production build before this QA pass. The final build includes the translation CPU optimization, account-header focus fix, and clarified legal copy, so the small increases outside the homepage are shown rather than hidden. All values are bytes; paired numbers are before → final.

| Document | Initial JavaScript | Estimated gzip JavaScript |
| --- | ---: | ---: |
| Home, Georgian | 717,658 → 453,728 | 175,009 → 128,052 |
| Home, English | 1,142,861 → 878,931 | 264,065 → 217,107 |
| Laptop service, Georgian | 309,660 → 310,038 | 89,726 → 89,847 |
| Laptop service, English | 734,863 → 735,241 | 178,782 → 178,902 |
| Blog listing, Georgian | 354,495 → 354,873 | 103,460 → 103,587 |
| Blog listing, English | 779,698 → 780,076 | 192,516 → 192,642 |
| SD-card article, Georgian | 358,546 → 358,924 | 105,036 → 105,161 |
| SD-card article, English | 783,749 → 784,127 | 194,092 → 194,216 |
| Terms / privacy, Georgian | 295,311 → 297,624 | 87,495 → 87,971 |
| Terms / privacy, English | 720,514 → 722,827 | 176,551 → 177,026 |
| Account shell, Georgian | 345,478 → 345,856 | 101,507 → 101,637 |
| Account shell, English | 770,681 → 771,059 | 190,563 → 190,692 |
| About, Georgian | 256,698 → 257,076 | 79,159 → 79,288 |
| Contact, Georgian | 266,984 → 267,362 | 83,169 → 83,294 |

The homepage initial JavaScript decreased by **263,930 bytes: 36.78% in Georgian and 23.09% in English**. Estimated gzip decreased by 46,957 bytes in Georgian and 46,958 bytes in English. These are payload reductions, **not a claim that the page loads that percentage faster**. Submitting the assistant for the first time now requests its separate module and the seven price catalogs; cached subsequent requests reuse them.

Homepage CSS stayed at 122,663 bytes. Its unique eager image sources stayed at 46,555 bytes, and all HTML image sources including lazy/carousel content stayed at 3,008,396 bytes. The existing visual design and image set were not changed. The machine-readable reports used for this final comparison are `.tmp/performance-before-2026-09-26.json` and `.tmp/performance-final-2026-09-26.json`; the earlier `.tmp/performance-after-2026-09-26.json` records an intermediate build and is not used for the final figures.

### Local browser samples

The coordinating browser pass captured these baseline samples on local Chromium at 1280 × 720, unthrottled: Home KA FCP 572 ms / LCP 608 ms / CLS 0; Home EN 232 / 312 / 0; laptop 508 / 508 / 0; SD-card article 340 / 340 / 0. They are single local samples with uncontrolled cache state. They must not be compared as a percentage speed gain or described as Lighthouse/mobile/production scores. Browser interaction and responsive results are documented by the coordinating QA pass separately.

## English translation CPU follow-up

The browser pass exposed a repeated roughly one-second English-homepage long task. The synchronous translation initializer constructed almost two thousand Unicode fallback patterns, and fallback text attempted every pattern even when the corresponding source phrase could not occur in that text.

The runtime now preserves the existing normalized dictionary and longest-first order, but creates a fallback regex only when it is actually relevant. A conservative prefilter checks for the longest literal Georgian substring, using Georgian lowercase handling. Latin and Greek parts are **not** used as a lowercased substring filter because `/iu` supports additional case-fold equivalences (e.g. `ſ` and `s`, or sigma variants). The final replacement still uses the original Unicode letter-boundary expression; direct translation, replacement order, dynamic prices/times, newlines, and cache behavior are unchanged.

`scripts/benchmark-translations.mjs` compares the runtime against commit `a7a559b5d6d2ec7bf4c2673d8d9a69d180ffe7f9` in three fresh Node processes per version. It uses all four real paired catalogs, 119 visible Georgian-homepage text samples plus eight fallback examples. All **5,782 comparison cases** (catalog entries, wrapped and uppercase variants, homepage text and dynamic values) matched the baseline exactly in every run.

| Local CPU work | Baseline median | Optimized median |
| --- | ---: | ---: |
| Catalog initialization | 212.33 ms | 18.25 ms |
| First homepage/fallback translation batch | 965.56 ms | 99.53 ms |

These are isolated Node CPU measurements, not Lighthouse scores, browser load times, or physical mobile-device results. `tests/translation-fragments.test.mjs` also checks longest-first matching, Georgian uppercase, Unicode letter boundaries, punctuation escaping, long-s/sigma case folding, repeated replacements, dynamic values, and unchanged Georgian behavior. This optimization is included in the final production build measured above; the coordinating browser pass documents its final browser results separately.

## Existing safeguards retained

- Every route has its own page module and directly preloaded styles, with no all-page JavaScript bundle.
- Public routes do not download the account implementation.
- Georgian documents do not load the English translation catalog.
- Production HTML contains complete content and metadata before JavaScript runs.
- Service hero images use optimized WebP assets; lower page photographs are lazy-loaded with dimensions.
- Pricing still comes from the same seven catalogs used by the service pages, not a duplicated or stale snapshot.

## Remaining limits and opportunities

- This is local-build QA, not a guarantee of production speed. Recheck the deployed host, compression, cache headers, mobile network conditions, and real-user Core Web Vitals after upload.
- The English catalog is still one shared 425,203-byte file in the baseline (89,056 bytes estimated gzip). Splitting it by route would require a separate translation-coverage pass; it was not rewritten during this conservative optimization.
- The homepage includes a product carousel and its images. That existing storefront content was not redesigned or altered in this task.
- Some large legacy PNGs remain in the delivery assets, but the active console pages reference optimized WebP versions. A large archive size alone is not the same as a large initial page transfer; no legacy files were removed without verifying all downstream uses.
- Chromium timings or viewport emulation cannot certify physical iPhone Safari, Firefox, or actual Android devices. Those checks require the corresponding real browser/device and are not claimed here.

## Regression checks

`tests/performance-loading.test.mjs` checks demand-only loading, concurrent caching, retry after rejection, source-catalog price fidelity, async UI guards, and the emitted production homepage bundle. The existing service-price tests continue to cover all seven service types and both languages.

Final-build verification: TypeScript build, Vite production build, prerender, and SEO audit passed (52 HTML documents, 44 canonical indexable URLs, 44 sitemap URLs). The coordinating full-site suite passed **906 tests** on this build, including the targeted assistant/performance and translation regressions. Final browser interaction checks and timing samples are documented by the coordinating QA pass separately.

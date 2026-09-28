# Frontend readiness check — 26 September 2026

## Outcome and scope

The current local production build passes **906 automated tests**, TypeScript compilation, production bundling, prerendering and the SEO audit. The audit covers **52 HTML documents**, **44 indexable canonical URLs** and **44 sitemap entries**. A separate final-build Chromium browser pass covered all 52 documents at five viewport sizes (**260 route/viewport checks**) without failures in the checks described below.

This is not certification of every browser, every visual detail or the deployed website. No production deployment, Git push, real customer-data change, payment, registration, password change or Facebook post was performed in this pass. The existing storefront design and product controls were not redesigned. The previously produced release ZIP was not refreshed as part of this work.

## Changes verified

- Home now downloads the price-assessment implementation and seven service catalogs on first use instead of initial page load. Pending requests, retries and stale responses have explicit guards. Prices still come from the same catalogs as the service pages.
- English fallback translation avoids constructing and trying irrelevant patterns. **5,782 comparison cases** matched the prior output exactly. See the performance report for the reproducible CPU benchmark and its limits.
- Closing authorization opened from the mobile menu now returns keyboard focus to the visible menu button, rather than a hidden sign-in link or the page body. Desktop and modified-link behavior are preserved.
- Existing dialog, menu and sticky-sidebar height rules now have equivalent `vh` fallbacks before `dvh`. Modern-browser layout is unchanged. This is a compatibility improvement, not proof of Safari testing.
- HP ZBook requests are recognized as laptop requests. The original Georgian screen-replacement scenario and its English equivalent both show the catalog's **50 GEL starting labour price**, parts exclusion, advance-agreement caveat and the corresponding localized laptop-price link. A generic HP mention remains insufficient to guess the device type.
- Terms/privacy use the owner's confirmed existing contact channels. Both languages describe optional personal ID as used for invoices and related documents. No unconfirmed email, registered-office designation or blanket legal necessity was invented.

## Automated checks

Final full-suite result: **906 passed; 0 failed, skipped, cancelled or todo**.

```text
node --test --test-reporter=spec tests/*.test.mjs
node scripts/audit-seo.mjs
node scripts/measure-performance.mjs dist .tmp/performance-final-2026-09-26.json
```

The full suite used the available local Nginx binary through `NGINX_BINARY`, including the existing serving/SEO integration tests. This does not establish the live host's configuration.

New or extended coverage includes assistant module caching and failed-import retry, emitted Home payload, unchanged price sources, ZBook detection and ambiguity handling, translation matching, mobile/desktop focus return, viewport fallbacks, legal bilingual content and local QA-server safety. The Hero stale-response regression includes source-structure checks; it is not a browser-level delayed-network race simulation.

## Final production browser matrix

Browser: Codex in-app Chromium. Origin: loopback-only production-build QA server. All 52 generated documents were loaded at each size:

| Viewport | Documents | Result |
| --- | ---: | --- |
| 320 × 800 | 52 | Pass |
| 390 × 844 | 52 | Pass |
| 768 × 1024 | 52 | Pass |
| 1024 × 768 | 52 | Pass |
| 1440 × 900 | 52 | Pass |

Each check verified the applied viewport, document language, one H1, a main landmark, no document-level horizontal overflow (one-pixel tolerance), and no completed-but-broken image in the initial visible area. Coverage includes both languages, service pages, blog listing/articles, informational pages, account public shells and localized 404 documents. It does **not** assert that every lazy/offscreen image, every text wrapping detail or every interactive state was checked by this matrix.

## Interaction checks

The following were exercised through the browser during this pass:

- Georgian registration at 390 × 844: dialog fits without internal scrolling; form text inputs are 16 px. At 320 × 568, scrolling remains available inside the contained dialog rather than cutting off controls. A short viewport cannot reasonably show the entire registration form at once.
- English mobile menu → sign-in → close: focus returns to the visible menu button. No credentials submitted.
- Georgian blog search: matching SD-card results, zero-result state and repeated search; SD-card article navigation; mobile contents expansion and section anchor.
- Switching the SD-card article to English preserves the article and section anchor. Its Facebook share link points at the localized canonical article, not Home. No Facebook posting or external preview-cache verification was performed.
- Final production-build price assistant: Georgian and English HP ZBook screen-replacement requests show the relevant service price and source, with no extra laptop/desktop clarification.
- Account development preview at 320 px: all seven sections were checked in each language across this pass. Service and purchase details expand inline; payment-history expansion shows the purchased product image/name; comments open the product-comment view. No horizontal document overflow was observed in these states.
- English address form opens/cancels, fits at 320 px and uses 16 px text inputs. Profile and password layouts were checked without submitting changes.
- English purchase invoice preview opens in a contained dialog at 320 × 800 (282 px dialog width), with item and amount visible. Actual PDF download, native printing and real invoice APIs were not exercised.

Account checks used the existing development-only synthetic preview, not real customer accounts. Real API authorization, persistence, customer-specific records and payment-provider behavior require the actual backend and are not inferred from these UI results. The production QA server intentionally returns unauthenticated/unavailable responses for APIs rather than claiming a working backend.

## Performance evidence

Initial Home JavaScript decreased by **263,930 raw bytes**: **36.78% Georgian**, **23.09% English**. This is a payload reduction, not a claim that load time improved by the same percentage. The English translation CPU benchmark also improved while preserving the compared output.

Final browser observations from the local QA server:

| Page | Viewport | FCP | LCP | CLS | Observed long tasks |
| --- | --- | ---: | ---: | ---: | ---: |
| English Home | 1280 × 720 | 124 ms | 124 ms | 0 | 0 |
| Georgian Home | 390 × 844 | 172 ms | 172 ms | 0 | 0 |

These are **single unthrottled loopback samples with uncontrolled cache state**, collected about 1.5 seconds after load. They are not Lighthouse scores, field Core Web Vitals, guaranteed mobile-network results or a statistically controlled before/after comparison. They do not measure later interactions or INP. Production compression, caching, latency and third-party behavior still need measurement after upload.

The local observer is injected only into QA HTTP responses. It does not collect form contents and is not written to the production HTML. The server binds to loopback, disables real API actions and sends `X-Robots-Tag: noindex, nofollow`. Its tests verify that the build remains unmodified.

Details: [performance report](performance-qa-2026-09-26.md).

## Remaining checks requiring devices or business decisions

1. **Actual iPhone/Safari, Firefox and physical Android:** unavailable in the connected browser environment. Chromium viewport emulation is not a substitute. On real devices, check menu/auth opening and closing, keyboard appearance, registration scrolling, language switching, service accordions, blog search/contents, and account/invoice dialogs. Check portrait and landscape, browser-toolbar resizing, text scaling and back navigation. Record device, OS and browser version with any issue.
2. **Deployed speed:** repeat timing on the uploaded host with controlled mobile network conditions and confirm compression/cache headers. Do not publish the local numbers as a real-user performance score.
3. **Final legal approval:** contact channels and personal-ID purpose are confirmed, but retention for other data categories, actual hosting/recipients, operational access/deletion rules and registered-office details still need verification. Keep `legalDocumentsApproved = false` and the current legal-page noindex/sitemap exclusion until the remaining facts and wording have qualified review. Frontend tests cannot certify legal compliance.
4. **Backend integration:** real account operations, saved comments/addresses, invoice files, card tokenization and payments remain integration work, not frontend guarantees. No raw bank-card collection was added.

Business follow-up: [Georgian owner checklist](legal-owner-checklist-ka.md). Legal source review: [review notes](legal-content-review.md).

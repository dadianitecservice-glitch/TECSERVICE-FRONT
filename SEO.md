# TECSERVICE — SEO implementation and release checks

Updated 2026-09-26. This document describes the local implementation, not a claim that these changes are live or that Google has indexed them.

## Coverage

The build produces 52 complete HTML documents:

- 44 indexable Georgian/English URLs: Home, seven service pages, Contact, About, Blog and eleven articles.
- Terms and Privacy in both languages: metadata and complete content are present, but indexing remains deliberately disabled until the outstanding content review is approved.
- The two account sign-in shells: `noindex, nofollow`; no customer records are prerendered.
- Georgian and English error documents: `noindex`, no canonical pointing to Home, and real HTTP 404 when served with the production template.

The separate shop domain is not implemented or deployed by this project.

## Implemented

- Unique titles, descriptions and one H1 per page; canonical HTTPS, non-www, trailing-slash URLs; document language and reciprocal KA/EN/x-default alternates.
- Localized Open Graph/Twitter previews with existing images, descriptive alternatives and verified dimensions.
- Parseable route-specific JSON-LD: business identity, website/page relationships, service offers, visible FAQs, breadcrumbs, Contact/About pages, Blog and articles. Article previews share the article's real image, author, language and category. No invented review scores, update dates or rich-result guarantees.
- Full page copy and crawlable links in the HTML before JavaScript. Awaited route modules are used for both rendering and hydration; no loading placeholder replaces the indexable content.
- Separate route bundles and styles. Route CSS and static module dependencies are linked directly in each generated HTML document. Unrelated account/page code is not preloaded. Production does not download the complete schema generator to recreate an already-rendered head.
- Georgian pages do not need the English translation catalogs. English translations are prepared before rendering and linked in English documents.
- Corrected intrinsic dimensions for 55 previously mismatched service-image uses; deferred lower-page images/maps, retained priority for the primary image, and reserved logo/embed dimensions.
- Sitemap generated from actual indexable routes. Missing route metadata fails the build instead of silently admitting an incomplete URL.
- A build-output SEO audit checks all documents, sitemap membership, language alternates, metadata, structured data and local link/image targets. Focused regression tests additionally cover media, route loading, translations and server behavior.
- Development and preview servers send a noindex response header. Deploy the static `dist/` output, not the Vite preview server.

## Server delivery

`docs/nginx-seo-routes.conf` is a reviewed template, not a live configuration change. It includes:

- Explicit KA/EN canonical redirects with query strings preserved, including direct index.html aliases.
- Sibling HTTP and www-to-canonical HTTPS examples; the www certificate paths must be supplied by the operator.
- Real localized 404 responses for unknown URLs and bare directories, without a Home fallback or redirect loop.
- UTF-8, scoped compression, revalidated HTML, immutable caching only for hashed bundles/fonts, shorter caching for stable image names.
- Account shells and aliases with private/no-store and noindex headers; existing sibling API proxy policies remain separate.

The template has been exercised against a local native Nginx instance using generated pages. This is not verification of the deployed TLS certificates, public host redirects, CDN behavior or live API configuration.

## Verification and maintenance

The September 26 SD-card article release passes the build-output SEO audit (52 documents, 44 indexable URLs) and all 876 automated tests with native local Nginx checks enabled. New sharing regressions verify the exact Facebook destination and article-specific metadata for all 22 Georgian/English article pages. The release ZIP contains all 362 built files; every archived file was checked against its build counterpart using SHA-256. This verifies the prepared release, not the public hosting server or Facebook's current cache.

The production build and all 805 automated tests passed again on 2026-09-26 after removing the rejected admin design preview, with no skipped tests and local native Nginx checks enabled. The final 2026-09-25 browser matrix covered all 50 KA/EN documents at 320, 390, 768, 1024 and 1440px (250 checks): one H1, matching language, rendered content and no detected horizontal overflow or clipped text. Account, blog, language switching and selected service-picker interactions were also checked. See the [full verification record](artifacts/frontend-qa-2026-09-25/verification.md). This is local verification, not a production deployment or confirmation of Google indexing.

Compared with the previous 1.47 MB raw / approximately 315 kB gzip all-page JavaScript, the Georgian Home now references approximately 710 kB raw / 176 kB gzip and the laptop route 309 kB raw / 90 kB gzip. English Home references approximately 1.13 MB raw / 265 kB gzip including the English catalog. These sums include each unique statically required script, not just the smallest entry file; images/fonts are separate. This is a transfer-size improvement, not a measured Core Web Vitals result.

Run a fresh build before build-output tests:

```sh
npm run build
npm run test:seo
node --test tests/*.test.mjs
```

For the optional native server test, set `NGINX_BINARY` to a trusted local Nginx executable and run `node --test tests/nginx-runtime.test.mjs`. It binds loopback with a temporary configuration, never reloads the public server, and stops its own process afterward.

When adding a page, update the lightweight route registry, module loader, metadata/schema, bilingual content, prerender list and server routes. New articles also need their slug in `src/data/blogSlugs.ts`; tests require exact parity with the actual article catalog. Use true publication/modified dates only. Preserve source-image dimensions when replacing media.

Route and media checks are local regression evidence, not measured field Core Web Vitals or Google indexing confirmation.

## Remaining launch actions

The [Georgian upload guide](docs/upload-website-ka.md) explains the static release package and Facebook sharing checks. Public requests checked on 2026-09-26 for the new SD-card article and the existing lost-files article returned Home metadata, while the new cover returned 404. The local generated article documents have their own canonical, Open Graph title/image and localized sharing URL. Uploading the complete build and reviewing the server delivery rules remain necessary; the public issue has not been claimed resolved by preparing an archive or pushing source code.

1. Publish the newly built files and review/apply the server template with the existing TLS/API setup. Verify public 200/404 responses, host redirects, headers, compression and caching after deployment.
2. Submit the public sitemap in Google Search Console and inspect representative KA/EN routes. Validate structured data using Google's Rich Results Test; valid markup does not guarantee an enhanced result.
3. Run PageSpeed Insights on the deployed mobile/desktop pages and monitor field Core Web Vitals. Local asset-size reductions are not a speed score or a substitute for real-user measurements.
4. Complete the outstanding owner/legal review in `docs/legal-content-review.md` before changing `legalDocumentsApproved`. Rebuild afterward so metadata and sitemap change together.
5. Keep business details, service pricing, articles and genuine customer reviews current. Admin integration and real customer/ticket/payment activation remain separately scoped work.

No SEO implementation can guarantee rankings, indexing speed or first position.

## Primary references

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Google JavaScript SEO and prerendering](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google crawlable lazy-loaded content](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading)
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Vite route chunks and asset manifests](https://vite.dev/guide/backend-integration)

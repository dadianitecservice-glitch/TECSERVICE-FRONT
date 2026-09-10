# Home SEO — local implementation

Implemented 2026-09-10 without changing the approved CSS, page order or visible copy.

## Included

- Georgian title/description, one canonical URL (`https://tecservice.ge/`), language declaration and SVG favicon.
- Open Graph and social-preview metadata using an existing approved laptop-repair photo, not a new image.
- JSON-LD `LocalBusiness`, `WebSite` and `WebPage`, with a seven-service `ItemList` representing the visible Home cards. Each `Service` points to its actual Home fragment and the business provider, not an unbuilt detail page.
- The Home title stays broad: `ტექნიკის შეკეთება თბილისში | TECSERVICE`. Standard/social descriptions cover laptops, computers, data recovery, consoles, drones, phones/tablets and other electronics. Individual service-page keyword strategies remain deferred until those pages are built.
- Business contact details, coordinates, hours and social accounts match the current Home Page. User-confirmed hours: Monday–Friday 10:00–19:00; Saturday 11:00–17:00. Sunday hours are not invented. Header shows compact weekday hours; the contact area and mobile menu include Saturday.
- No self-serving review stars, invented product offers, prices, FAQ or unsupported structured-data claims.
- `public/robots.txt` and a sitemap containing only the implemented homepage. No fabricated update dates or unbuilt pages.
- Build-time prerendering: `npm run build` writes the actual Home content into `dist/index.html`. A separate application server is not required for deployment.
- Safe responsive hydration, keeping the existing 390/768/1024 layouts. Product-price grouping is explicit because Node and browser locale data can otherwise differ.
- Product/blog photos have real intrinsic dimensions, lazy loading and async decoding. Blog dates have ISO `datetime` attributes without changing displayed dates.
- Local dev and Vite preview responses have `X-Robots-Tag: noindex, nofollow`. Production files do not contain that header or a noindex meta tag.

## Verification

Run:

```sh
npm run build
npm run test:seo
node --test tests/homepage-validation.test.mjs tests/assessment.test.mjs
```

36 tests passed in total after the seven-service Home refinement. Built HTML contains one H1, all seven services, their real fragment targets, the expected homepage sections and parseable JSON-LD matching the source. Schema descriptions are checked against service-card data. Preview HTTP response includes the page text before JavaScript.

Built preview tested at 390, 768 and 1440px. No new browser errors or hydration warnings after the final fix, and no horizontal overflow. Section heights match the pre-SEO implementation at those widths. Mobile menu and Shop Next/page indicator still work. All 22 product/blog image entries were checked against local image dimensions; all ten machine-readable article dates match their visible dates.

## Before public release — still required

1. Confirm that `https://tecservice.ge/` (not a www variant) is the intended public canonical origin. Metadata, JSON-LD, image URLs, robots and sitemap must stay consistent if it changes. The public site's protection page prevented verification of its current configuration during this task.
2. Deploy the generated **dist** folder with HTTPS. Configure HTTP/www alternatives to redirect to the chosen canonical origin. Do not publish source files, `.env` files or the project directory.
3. **Do not configure a blanket rewrite of every URL to Home.** This project has no implemented service-detail, blog-article, Cabinet, terms or privacy pages yet. Keep their existing links for future work, but implement them or return genuine HTTP 404 responses before release. Add only real, indexable pages to the sitemap as they are completed.
4. Keep staging/preview deployments access-restricted or `noindex`; Vite's preview header does not automatically configure a different hosting platform. Remove staging noindex protection only on the real public deployment.
5. Confirm that the deployment serves `/robots.txt`, `/sitemap.xml`, the logo and social-preview image as public HTTP 200 assets.
6. Verify ownership in Google Search Console, submit `/sitemap.xml`, run URL Inspection and Google's Rich Results Test against the live domain. These external checks and submissions have **not** been performed.
7. Audit live performance/Core Web Vitals and the final service/article pages after real content and integrations are ready. AI/SMS remain explicitly labeled frontend demos.

This work prepares the homepage technically; it does not guarantee indexing, a rich result or a ranking position.

## Primary references

- [Google: JavaScript SEO and prerendering](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google: review snippet rules](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Schema.org: Service](https://schema.org/Service)
- [Schema.org: ItemList](https://schema.org/ItemList)

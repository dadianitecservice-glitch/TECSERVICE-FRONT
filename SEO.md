# TECSERVICE SEO — implementation and launch checklist

Updated 2026-09-16.

## Implemented in the frontend

- Eight indexable, prerendered pages: Home plus laptop, computer, data recovery, console, drone, mobile/tablet and other-electronics services.
- One unique H1, title, meta description and self-referencing canonical URL per indexable page.
- Georgian document language, Open Graph, Twitter Card and descriptive social-image metadata.
- Route-specific JSON-LD with `LocalBusiness`, `WebSite`, `WebPage`, `Service`, `BreadcrumbList`, visible FAQ content and indicative service offers.
- Business phone, address, map, coordinates, hours and social profiles are consistent across visible content and structured data.
- `robots.txt` and `sitemap.xml` list the canonical public origin and all eight completed pages.
- Production HTML contains real page copy before JavaScript. A custom noindex `404.html` is generated at build time.
- Unfinished Blog articles, Cabinet, Terms and Privacy destinations are not exposed as crawlable internal links.
- A square 512×512 PNG brand mark is used as the search favicon and structured-data logo.
- Console imagery is served as WebP instead of multi-megabyte PNG files.
- Important tabbed problem descriptions and laptop/computer price entries remain in prerendered HTML while inactive panels stay visually hidden.
- Local Vite dev and preview responses use `X-Robots-Tag: noindex, nofollow`; public build files remain indexable.

## Verification

Run after every SEO/content change:

```sh
pnpm run build
node --test tests/*.test.mjs
```

Check the generated files in `dist/`, especially:

- `dist/index.html`
- `dist/services/*/index.html`
- `dist/404.html`
- `dist/robots.txt`
- `dist/sitemap.xml`

## Production Nginx requirement

The current public server must not rewrite every unknown URL to Home with status 200. Use the rules in `docs/nginx-seo-routes.conf` inside the canonical HTTPS server block, while keeping the real TLS and API proxy settings.

Required live behavior:

- `http://tecservice.ge/*` → HTTPS with 301/308.
- `https://www.tecservice.ge/*` → non-www canonical with 301/308.
- slashless service URLs → trailing-slash canonical with 301/308.
- the eight canonical pages → HTTP 200.
- every unknown or unfinished URL → the custom page with HTTP 404.
- compressed HTML/CSS/JS and long-lived cache headers for versioned static assets.

## Still required after deployment

1. Upload a fresh `dist` folder and apply the Nginx rules.
2. Confirm that no public response sends `noindex` for the eight canonical pages.
3. In Google Search Console, resubmit `https://tecservice.ge/sitemap.xml` and request indexing for Home and the seven service pages.
4. Inspect each URL with Search Console URL Inspection and run Google's Rich Results Test.
5. Run PageSpeed Insights for mobile and desktop after the real deployment; address field Core Web Vitals if data becomes available.
6. Remove already indexed soft-404 Blog URLs through correct HTTP 404 responses and allow Google to recrawl them. Temporary Search Console removal is optional, not a substitute for 404.
7. Complete and regularly update the Google Business Profile, including matching address, phone, hours, service categories and real customer reviews.
8. Build real Blog, Terms, Privacy and customer Cabinet pages before restoring their links.

Technical SEO creates a strong indexable foundation, but no implementation can guarantee first position. Rankings also depend on content depth, local prominence, reviews, citations, backlinks, competition and Google reprocessing the deployed pages.

## Primary references

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google favicon guidelines](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Google soft-404 guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors#soft-404-errors)
- [Google Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)

# Georgian / English public website

Updated 2026-09-26; older responsive evidence below is dated explicitly.

The current site has 44 indexable Georgian/English URLs: Home, seven services, Contact, About, Blog and eleven articles. Terms/Privacy, private account sign-in shells and 404 documents are also built in both languages but deliberately not indexed. The header uses canonical language-switch links while preserving route, query and section fragment. Internal links stay in the selected language. The shop remains an external website; this work does not translate, integrate or deploy it.

## Content maintenance

- `src/i18n/LocaleProvider.tsx` supplies the locale for React and server rendering.
- The lightweight translation runtime loads English catalogs before rendering an English route; Georgian pages do not download these catalogs. The synchronous `translate.ts` facade remains available to metadata generation and existing tests.
- `src/i18n/catalogs/` contains paired Georgian/English catalogues. Preserve existing IDs and add the same ID to both language files when adding copy. Do not regenerate IDs for existing translations.
- `useTranslation().t()` translates display text only. Do not translate user-entered descriptions, model numbers, input values, keys or IDs.
- `useTranslation().href()` localizes internal links and prepared WhatsApp messages; assets, API requests and external links remain intact.
- New public routes need both-language prerendering, metadata, reciprocal `hreflang`, sitemap entries and regression tests.
- The homepage assistant passes the selected language without changing the customer's typed input. No real AI request was made during verification; production activation is separate work.

## Responsive service pages

`ProblemSelector` uses keyboard-accessible desktop tabs and a custom bottom-sheet picker at widths up to 900px. The picker uses a native modal dialog with individual icons, a selected-state indicator, scrollable choices, translated labels, Escape/backdrop dismissal and restored focus/scrolling on close. On compact screens, the selected title/photo precede the description. All 68 problem options retain their individual content and photographs.

## Audit corrections

- English Hero text uses natural casing, and the Data Recovery heading scales to fit narrow widths.
- Mobile form text is 16px; OTP controls stack through 760px, and resend/back actions have 44px touch targets.
- The review dialog accounts for the dynamic viewport. Mobile pricing retains accessible table headers, Escape returns focus from header menus, and ticket search modes use grouped buttons with pressed states.
- Phone contact actions use `tel:` links. Language-switch URLs, English structured-data relationships, dimensions for four sharing images and localized 404 social metadata were corrected.
- The Nginx template preserves query strings in explicit redirects; it has not been applied to the live server by this audit.

## Historical responsive verification — 2026-09-21

- Final production build and all 204 automated tests passed.
- All 18 URLs passed horizontal-overflow checks at 320, 390, 600, 620, 768, 900, 1024, 1280 and 1440px: 162 local Chromium route/width checks, after the Data Recovery heading fix.
- Earlier picker verification exercised all 68 mobile selections, with one correctly labelled panel and corresponding image per choice. Prior interaction checks covered language switching with query/fragment retention, desktop keyboard navigation, pricing, FAQ, menus, demo ticket lookup and localized 404 pages.
- The historical matrix and screenshots are retained as local-only QA artifacts and are not included in this source upload. The later [full verification summary](../artifacts/frontend-qa-2026-09-25/verification.md) records 250 checks across all 50 KA/EN documents and five viewport widths.

Testing used local Chromium, not actual iOS Safari or other physical devices. No real AI request or SMS was sent, and the ticket flow remains a frontend demo without an admin database connection. The September 25 route/locale splitting replaces the earlier all-page bundle; these local checks still do not establish production performance.

## Deployment and follow-up

Deploy fresh `dist/` output and review `docs/nginx-seo-routes.conf`, then verify all 44 indexable URLs, legal/private indexing policy, localized 404 statuses, redirects/query retention, indexing headers, compression and caching. Native local server tests are not evidence of the deployed server's behavior.

Search Console submission, deployed PageSpeed Insights and actual-device QA remain outstanding. Blog, Privacy and Terms pages now exist; the legal content still has an approval gate before indexing. Production activation or integration of admin, ticket, SMS and assistant services requires separate user approval. See [SEO.md](../SEO.md) for the current launch checklist.

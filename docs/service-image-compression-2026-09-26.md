# Service image compression — 26 September 2026

Reduced the file sizes of all 87 active photographs used by the seven service pages. The same assets serve both Georgian and English pages. This was mechanical WebP recompression using Sharp 0.35.4, quality 55 and effort 6, not AI generation or a visual redesign.

## Before and after

Values are actual file bytes, summed once per unique active image in each group.

| Service asset group | Images | Before | After |
| --- | ---: | ---: | ---: |
| Laptop repair | 12 | 704,394 | 504,684 |
| Computer repair | 12 | 1,029,552 | 721,064 |
| Data recovery | 11 | 570,576 | 388,118 |
| Console repair | 13 | 789,978 | 564,768 |
| Drone repair | 13 | 743,096 | 532,344 |
| Mobile / tablet repair | 13 | 645,446 | 469,886 |
| Electronic-board repair | 13 | 958,396 | 685,358 |
| **Total** | **87** | **5,441,438** | **3,866,222** |

Saved **1,575,216 bytes (28.95%)** across the active asset collection. The largest resulting image is 93,122 bytes. This is not an initial-page transfer measurement or a claim that every page loads 28.95% faster: individual pages use different subsets, secondary images remain lazy-loaded, and browser caching affects downloads.

## Preserved behavior

- Image subjects, pixel dimensions, aspect ratios and URLs remain unchanged.
- Existing image annotations, alternative text, CSS layout/cropping and SEO references remain unchanged.
- Hero priority, asynchronous decoding and secondary-image lazy loading remain unchanged.
- Storefront and blog images were not altered.
- Unused PNG/JPEG originals were left untouched; their archive sizes are not counted as page-load savings.

## Recovery and verification

Pre-compression copies are retained locally under `.tmp/service-image-compression-2026-09-26T13-51-25-478Z/originals/`. The adjacent `report.json` records dimensions, before/after bytes and SHA-256 hashes. These temporary backups are local recovery material, not a published website dependency.

`tests/service-image-budget.test.mjs` inventories active image references from all seven service pages and their problem catalogs. It checks WebP container integrity, a per-image limit below 100,000 bytes and a combined active-asset limit below 4,000,000 bytes. The existing `tests/public-media.test.mjs` separately checks actual source dimensions against the data and prerendered HTML, plus image loading behavior.

Run the new budget checks with `node --test tests/service-image-budget.test.mjs`. Rebuild and run the existing media/SEO checks when validating the deployment output; local source checks alone do not prove that production hosting has the updated files.

This pass completed the production build and SEO audit (52 documents / 44 indexable URLs), and all **921 automated tests passed**. All 87 compressed images fully decoded with their original dimensions. Browser checks covered seven services in both languages at 390 × 844 and 1440 × 900 (28 page/viewport combinations): the three hero photographs on each page loaded, with no horizontal overflow. Representative compressed photographs were also inspected visually. No deployment or Git push was performed.

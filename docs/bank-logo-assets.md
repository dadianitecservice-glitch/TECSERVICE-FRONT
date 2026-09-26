# Bank logos used in the customer cabinet

The bank choices use authentic locally served SVG marks, not generated letter placeholders.

## Bank of Georgia

- File: `public/assets/brand/bank-of-georgia.svg`
- Official source asset: <https://bankofgeorgia.ge/blog/app/uploads/2025/08/orange_logo.svg>
- The asset is used as the header logo on the official [Bank of Georgia blog](https://bankofgeorgia.ge/blog/).
- Original `viewBox="0 0 114 97"`, paths, and colours are retained.

## TBC Bank

- File: `public/assets/brand/tbc-bank.svg`
- Official source: [TBC developer design kit](https://developers.tbcbank.ge/docs/design), the light button example's blue logo.
- Original `viewBox="0 0 24 24"`, path, and `#00ADEE` colour are retained; only embedding-specific class names were omitted.

Reviewed 25 September 2026. Both files contain SVG geometry only, with no scripts, external references, or tracking. Preserve their aspect ratios with `object-fit: contain`; do not recolour the marks. The marks identify the proposed providers in the payment interface, not a claim that live bank integration is enabled.

# Customer account integration

The public site provides Georgian and English account pages at `/account/` and
`/en/account/`. The shared header opens a sign-in/registration dialog. The footer
and home-page account call to action link to the same account experience.

## Latest visual verification

The settings, field-focus and inline-disclosure refinement passes 687 frontend tests, TypeScript,
production build and prerendering. The pre-existing large-bundle advisory remains.
Browser checks at 1440, 390 and 320 px confirmed centered form columns, full-width
comments, correctly loaded official bank marks, green/red recorded payment badges,
background-only field focus feedback and no horizontal page overflow. No browser errors
or warnings were observed. No live bank connection or customer data was changed.
The latest browser pass also verified inline purchase expansion with retained
search, independent payment-history disclosures with matching product photos,
invoice actions without accidental collapse, and comment-tile photo/whitespace
activation with focus restored on dialog close. Expanded purchases and payments
remain within the site container at desktop and 320/390 px mobile widths.

## September 25 settings revision

The latest reference-based refinement includes local backend changes as well as
the interface. Deploy the matching backend before enabling the new profile fields,
address book and password change in production. Nothing was deployed to a live
CRM as part of this task. The local preview API uses synthetic, in-memory records.

- Optional citizenship and personal/document ID are returned only by the user's
  own login, `/auth/me` and profile-update responses; staff/public user DTOs omit
  these fields. The new sensitive fields and address payloads are redacted from
  audit snapshots. Primary phone and record ownership remain unchanged.
- `/portal/addresses` and its ID routes enforce authenticated owner scoping,
  approved-customer access, trusted origins for mutations, validation and limits.
- `/portal/password` verifies the current password, applies the normal password
  policy, revokes all sessions and increments the authentication generation so a
  concurrent old-password login cannot survive revocation. The UI clears the
  active account only if the completion still belongs to that account generation.
- The combined isolated account/comments/documents/purchases backend suite passes
  109 tests, including 10 new settings/security cases. No live database was used;
  PostgreSQL adapter compatibility was inspected, not live-integration-tested.
- Browser checks against the isolated API confirmed saving and reloading the new
  profile fields and an address, changing the synthetic account's password,
  signing out automatically and signing in again with the new password. The
  synthetic server is reset afterward; no real customer records were touched.
- The Georgian UI was checked at 320, 390 and 1366 px, including purchase details,
  profile fields, service invoice access, preview address edits/removal and the
  payment section. Invoice activation does not toggle the service disclosure.
  No horizontal account overflow was found in these checks.
- English purchase layout was also checked at 768 px with the two-column
  navigation and inline tab/search row; its document and viewport widths match.
- The final frontend suite has 644 passing tests, including address whitespace,
  duplicate-write, password completion and keyboard-focus regression checks.
  TypeScript, production build and prerendering pass (the existing large-bundle
  size advisory remains).

Earlier dated verification notes below describe prior iterations and are retained
as history; the implemented-interface section reflects the latest design.

## Implemented interface

- Sign-in/registration now share compact 44 px controls, tighter gaps and a higher
  logo. Registration has no internal scroll at the verified 1366×900 and 390×844
  viewports; overflow remains available on shorter screens and when zoomed.
- Sign in using phone/email and password; register a personal customer account.
- Registration requests remain pending/inactive until the service team verifies
  identity and phone ownership and approves the account. Registration does not
  authenticate the applicant or expose matching historical records.
- A personal greeting and a simple navigation list with Profile, My services, My
  purchases, My comments, Addresses, Payments and Password. Contact, terms and privacy shortcuts are removed
  from this sidebar (the site's global footer is unchanged). There is no
  overview or metric-card screen; the cabinet opens on current services. Counts
  and details come from customer-scoped API responses.
  The navigation has small decorative numbers (hidden from assistive technology),
  no card header, and a pale-blue selected row with a thin left accent.
  Sign out is a separate plain action. At widths
  up to 900 px the navigation moves above the content in two columns.
- The manual Refresh control is removed. Failed initial loads still offer Try
  again, and loading/revalidation, logout and profile-save guards remain active.
- Compact service cards show code, model (when recorded), registration date,
  price and status while closed. Price appears once in the summary, using the
  existing API amount. A single disclosure opens structured service milestones,
  registration/update time in Asia/Tbilisi, device details and repair notes.
  Service and purchase summary dates use `MM/DD/YYYY HH:mm` in Asia/Tbilisi.
- Service history has Current and Completed tabs, defaulting to Current. The
  completed collection still means handed over: only `picked_up` belongs there.
  Ready, unsuccessful and unknown statuses stay Current until marked picked up;
  the Completed label does not imply a successful repair.
- The profile is five stacked rows: registered phone (read-only), email, first
  name, surname and optional personal/document ID. The citizenship switch is removed.
  Profile, address and password forms share a centered 460 px column inside the
  main account panel. Text fields retain their neutral resting border on focus;
  only a subtle background change marks the active field. This also applies to
  sign-in, registration, search and comment fields, including profile password
  confirmation. Button, link and checkbox keyboard focus indicators and error
  borders remain intact.
  Names are combined into the existing full_name field. Update opens a separate
  current-password confirmation dialog, keeping the main form uncluttered.
  Saves omit citizenship and preserve its stored value; IDs remain optional.
  The old additional contact number is preserved but no longer edited in this
  form. Primary phone, account IDs, role and approval are not editable.
- Purchases show product photos from exact catalog product-ID associations,
  quantity/unit price and one order total. Missing, unsafe or
  broken image URLs use a neutral placeholder, never an inferred product image.
  Own comments likewise display catalog-linked product photos beside the name
  and comment date. Unavailable products expose no image. The entire white product
  tile (photo, name, date and whitespace) opens its public comments through one
  keyboard-accessible action; author-only edit/delete safeguards remain.
  The comments list uses the full panel width, matching the order panels.
- Purchase history has its own Current and Completed tabs. Only order states
  `completed`, `delivered`, `cancelled`, `returned` and `partial_return` belong to
  Completed; all other or unknown states stay Current. Payment status does not
  determine this grouping, and Completed does not mean every order was delivered
  successfully or fully paid.
- Purchases use a light-gray order block with white product rows, date/time in
  Asia/Tbilisi and one total. Details expands that order inline, like services,
  without replacing the list or hiding its tabs/search. The expanded area contains
  recorded order/payment states and any additional products, with no duplicated
  total or product rows. Its invoice icon replaces Details at the upper right;
  Collapse restores focus to the disclosure. Compact search sits beside the tabs where space permits; status
  selectors are removed. Switching tabs or sections resets the relevant search.
  The price block is informational, not an online-payment feature.
- Addresses support owner-scoped create, edit and confirmed removal. Payments
  shows recorded purchase payment status and invoice access. Each history row
  expands independently to show the same product photos, names, quantities and
  unit prices as purchases; products stay hidden until expanded. Invoice buttons
  are separate from the disclosure so invoice access never toggles the row.
  Missing items use an honest empty state and missing/unsafe photos a placeholder.
  An explicitly visual
  card-linking flow offers Bank of Georgia/TBC and an unchecked remember-card
  preference. It collects no card details, performs no network request or payment,
  and reports that bank integration is not connected. The preference is temporary;
  no saved card is fabricated. Password changes verify the current password
  and revoke all sessions; the interface then asks the user to sign in again.
  Provider choices display locally hosted official bank marks (sources in
  `bank-logo-assets.md`). Recorded `paid` status is green, `unpaid` is red,
  `partial` is amber, and unknown statuses remain neutral with their text intact.
- Account access help links to staff contact. No fictitious password-reset email,
  SMS delivery or online payment is presented.
- Services expose a top-right invoice icon after expansion, replacing the Details
  action in the same header position while keeping a separate collapse control;
  purchases expose theirs after Details.
  Only previously issued,
  customer-owned invoices are listed. Sales use the existing issued PDF renderer;
  service invoices use a printable form projected from the issued snapshot.
  Missing invoices show an empty state rather than generating paperwork.
- Product cards open public comments, with approved-customer posting and own
  comment editing/deletion in My comments. Clicking an available product's white tile
  in My comments opens that exact product's comments dialog; hidden products
  remain non-interactive. The development preview opens a read-only sample of
  the current local comment without public API requests or posting. Only the first name is public; the
  form warns against sharing contact/private information. A management link
  opens `/account/?section=comments` directly. The separate external shop is
  unchanged; this does not implement a full product-detail/shop route.
- Loading, failure, empty, unauthorized and restricted-account states are distinct.
  API failures never fall back to sample customer data.

The current API returns the most recent 100 service records and 100 purchases.
Counts and search operate on those loaded records; deeper historical pagination
is a separate follow-up for customers with larger histories.

## API and session contract

`src/account/customerApi.ts` uses the same API base as the assistant
(`VITE_TECSERVICE_API_BASE`, empty by default) with cookie credentials and
`cache: no-store`. No passwords, session tokens or customer records are persisted
by the new public frontend in localStorage/sessionStorage.

- `GET /api/auth/me`
- `POST /api/auth/login` — `{ identifier, password }`
- `POST /api/auth/register` — personal account details; pending `UserPublic`, no login
- `POST /api/auth/logout`
- `GET /api/portal/tickets`
- `GET /api/portal/purchases`
- `POST /api/portal/profile` — `{ full_name, email, contact_phone, current_password }`; current
  approved customer only, password recheck, exact-origin check and rate limits.
  Extra fields are forbidden; validation errors do not echo submitted passwords.
  Omitting `contact_phone` preserves it; null or blank clears it.
- `GET /api/portal/purchases/{order_id}/invoices`
- `GET /api/portal/purchases/{order_id}/invoices/{document_id}.pdf`
- `GET /api/portal/tickets/{ticket_code}/invoices`
- `GET /api/portal/tickets/{ticket_code}/invoices/{document_id}`
- `GET /api/shop/products/{slug}/comments?limit=20&offset=0` — public projection.
- `POST /api/shop/products/{slug}/comments` — `{ text }`, approved customer.
- `GET /api/portal/comments?limit=20&offset=0` — only the session owner's comments.
- `POST /api/portal/comments/{id}` — `{ text, version }`, author only.
- `POST /api/portal/comments/{id}/delete` — `{ version }`, author only.

Invoice reads validate both current record ownership and the issued customer
snapshot. They never issue a new document, expose administrator routes or infer
payment confirmation. Comment products require an exact, unique, active and
published `seo_slug` in the backend catalog; unmapped static product cards fail
closed. Comments use a separate persistent table, one comment per customer and
product, optimistic versions, plain text, bounded payloads, pagination, trusted
origins on writes and rate limits. Public responses omit contact and ownership
identifiers. Both features return no-store responses, including handled errors.

These backend additions exist only in the local backend snapshot. Production
activation requires deploying them with the frontend, mapping the real published
product slugs, and confirming service/customer ownership data. No production
deployment or external-shop modification was performed.

Customer identity is derived by the server from its authenticated, approved
session. The frontend does not supply a customer ID, phone selector or sales
administrator endpoint to retrieve private data. Passwords are handled by the
existing backend password-hashing implementation, not the browser.

Local backend source changes are in
`work/TECSERVICE_BACK-updated-2026-09-14/backend/`. This is a local snapshot, not
evidence that the production CRM has received the changes. Do not replace or
migrate the live database as part of copying this UI.

## Preview versus real data

During Vite development only, `/account/?preview=1` (and the English equivalent)
shows synthetic records so the layout can be reviewed. The greeting's Demo badge
and the former long preview sentence have been removed. Static demo notices are
also removed from profile, addresses, password and comment views. Action feedback
still distinguishes page-only changes from real saves, and sample invoice
documents retain their non-payment/preview distinction.
It does not create a session or call customer APIs for those records. The fixture
module is excluded from the production bundle. Static account HTML contains only
the unauthenticated/loading shell, no private data and no preview link.
Profile edits in this development preview affect in-memory sample data
only, and never ask for a real password or imply that a real account was saved.

## Before production activation

1. Review and deploy the corresponding backend changes against the actual CRM
   version; confirm safe handling of canonical phone collisions in existing data.
2. Configure exact trusted frontend origins and production secure cookies. Prefer
   a same-origin `/api/` proxy; never expose the backend with authentication disabled.
3. Verify manual approval really establishes identity/phone ownership. Self-entered
   phone numbers must not grant immediate access to old service or sales records.
4. Apply account routing and `private, no-store`/`noindex` rules from the Nginx
   template. Account pages are intentionally not included in the sitemap.
5. Recheck registration/login/logout, expired sessions, account revocation and two
   different customers' record isolation on staging before enabling real users.
6. Align the privacy notice with actual account registration data, session cookies,
   password recovery, retention and deployment. SMS/self-service reset is separate
   work and requires a verified delivery provider.

No production deployment, real registration, customer-data migration, payment or
SMS transmission is authorized or performed by the local implementation task.

## Invoice and public-comment verification — 2026-09-25

The subsequent navigation-card refresh was checked in Georgian at desktop,
320 px and 601 px, and in English at 768 px. Section selection follows clicks,
decorative numbers do not change accessible button names, and no horizontal
page overflow or browser-console errors appeared during these checks.

- TypeScript, production build and prerender pass; frontend suite: 612 checks.
- Isolated backend suites: 52 invoice, 19 comment and 28 existing customer-account
  and purchase checks pass. The real sales renderer also returns a valid PDF
  through the authenticated customer route, with embedded Georgian fonts.
- Browser QA uses only the isolated local preview backend and synthetic records:
  login, issued service form, sales PDF action, public comment publication,
  cabinet edit, matching public update, direct comment-management link, delete
  confirmation/cancel and logout. Deletion persistence and ownership are covered
  by isolated API/component tests, not a live customer deletion.
- Georgian layouts checked at 320/390 px and desktop; English comments/purchases
  at 768 px. Invoice numbers wrap, mobile invoice rows show all values without
  horizontal table scrolling, and the invoice icon does not expand the ticket.
- The in-app browser did not expose a download event for the sales PDF action;
  it showed no request/UI error. The authenticated PDF response and real renderer
  are verified separately; an actual saved-file/native print-dialog check in the
  deployment browser remains advisable. No claim of visual PDF-page review.
- Production assets exclude demo invoice/comment fixtures. No live credentials,
  production records, external comments, payments or document issuance were used.

## Earlier local verification — 2026-09-24

- TypeScript, production build and static-page generation pass.
- Frontend automated suite: 588 passing checks, including 14 dashboard interaction
  checks, service details, purchase collection mapping and detail/back behavior,
  contact-phone interactions and 12 purchase-image validation/fallback checks.
  Regressions preserve registered-phone-first presentation and unit price/quantity
  below the product name. Latest checks cover compact preview labelling, absence
  of the Refresh control, pending logout/error behavior and revalidation guards.
- The latest reference-based redesign is a frontend-only change. The automated
  run checks the sidebar, both tab groups, searches, order details, empty states,
  profile-save guards and the absence of online-payment actions. It does not
  establish that the live CRM/backend has been deployed or revalidated.
- Latest Georgian browser review: 1366 px confirms the 790 px right panel and
  400 px profile alignment; 320 px covers profile editing/focus, purchase detail
  and collection switching, and expanded service cards without horizontal overflow.
- Latest English browser review at 768 px confirms purchase list/details and
  profile layout, including registered-phone-first order, without horizontal
  overflow. Browser logs reported no errors or warnings during these checks.
- After increasing typography and removing the Refresh control/long preview
  strip, the latest browser pass rechecked Georgian 320 px profile editing,
  purchase detail and expanded service cards; Georgian 1366 px greeting/layout;
  and English 768 px purchase detail. No horizontal overflow or browser console
  errors/warnings were found in those checks.

### Earlier local integration verification

The following checks were recorded during the preceding account-integration
work, using isolated or synthetic data. They are retained as integration history,
not a claim that this UI-only redesign reran the backend or accessed live data.

- Backend customer-account/purchase suite: 28 passing isolated tests, including
  profile persistence, reauthentication, ownership, validation and rate limits.
- Browser checks: real cookie-based login/logout against the synthetic local API,
  pending registration and blocked unapproved login, ticket search and expandable
  details, purchases, profile, and Georgian/English layouts.
- Profile-save browser checks reject an incorrect password, persist a valid
  name/email change across reload, and allow a fresh login with the new email.
  Only synthetic fixture records were changed, then restored and signed out.
- Additional-number browser checks reject invalid input, persist a valid number
  across reload, then clear it without changing the registered number or service
  ownership. The synthetic API also returns the exact catalog photo for its SSD
  fixture and a neutral fallback for an order without a product image.
- Visual checks at 320, 390, 768 and 1440 px; no horizontal account overflow found.
- Production HTML/bundle checks confirm no preview fixtures or private records
  are included in the statically generated pages.

## Cabinet design refinement

The September 24 reference-based revision restored a left sidebar
and personal greeting instead of the earlier horizontal-navigation/overview
layout. Services and purchases each have a self-contained Current/Completed
tab pair. Services put the recorded device/model first and open a structured
detail area; purchases use gray order blocks with white product rows, followed
by recorded date/time, payment state and a single total. The subsequent revision
uses inline order disclosures instead of the earlier detail/back transition. There is no
separate receipt column or online-payment action.

The cabinet shares the site's `--container` (1312 px) and responsive `--page-gutter`
tokens, so its left and right edges match the header and footer. The content panel
has no separate maximum width. Services, purchases, comments and payments
fill that wider panel. Profile and settings fields use a 460 px column with the read-only registered phone
first. Purchased-product unit price and quantity sit below the name, and the
order total keeps its label above the amount. These desktop widths contract to
the available space on smaller screens. The latest pass increases panel, profile,
service and purchase typography while keeping the four-stage milestone labels
within the narrowest mobile layout. The greeting has no Demo badge, long preview
strip or manual Refresh action. Cabinet section headings, navigation labels and
collection tabs render uppercase. The greeting also displays the customer name
in uppercase, without changing the stored name or profile field. Product/model
names and editable form values keep their original casing. Expanded services
continue on the same gray card surface, using aligned dividers instead of
separately colored nested panels. Invoice access remains inside the disclosure.

The latest casing correction supplies actual Mtavruli Unicode and disables CSS
text transformation for those labels: Chromium's Georgian CSS uppercase mapping
was turning the supplied Mtavruli text back into Mkhedruli. Browser checks verify
rendered text as well as source text. This pass has 659 passing frontend tests,
29 focused isolated comments/purchases backend tests, and passing TypeScript/build
checks. Georgian 320 px comments/service detail, 390 px payments/auth and desktop
auth/cabinet layouts were checked without horizontal overflow. No production
deployment or real bank integration was performed.

The profile uses stacked neutral fields with edit affordances. Current-password
confirmation, the read-only ownership phone, optional additional-contact-number
validation and customer-scoped API rules remain intact. No backend changes or
production deployment were needed for this visual redesign.

The cabinet uses the same `TicketMilestones` renderer as the public code-lookup
result. Customer stages describe receipt, service, readiness and handover; broad
CRM states do not fabricate a diagnostic or successful-repair timeline. A handed
over record has four completed custody stages, while failed/unknown repairs never
infer readiness. Georgian purchase labels now consistently use `შესყიდვები`.
Earlier visual iterations were checked at 320, 390, 1024 and 1440 px in Georgian
and English, alongside the unchanged public lookup result. The latest browser
review is listed separately under Local verification above.

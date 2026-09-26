# Legal pages: publication review

The user supplied the operator: შპს „სქაინეთ დისტრიბიუშენი“, identification number **427740000**. “Skynet Distribution LLC” is its English transliteration, not a verified registered English name. The stated address is the service-centre address, not a claim about the registered office.

`/terms/`, `/privacy/` and their English counterparts are functional, prerendered **drafts**. At the user's request, the public yellow review banner has been removed; this is a visual change, not approval of the policies. They retain `noindex, follow` and are intentionally absent from the sitemap. `legalDocumentsApproved` in `src/data/legalPages.ts` controls indexing only. Do not enable it without owner review, updates to the texts below, and a matching sitemap/test update. No server or production deployment was performed.

## Owner-confirmed policies

- The owner specified **5 years for order history, starting when the order is completed**. The Georgian and English privacy pages state both the period and its start event and explicitly distinguish it from recovered personal files. This is an owner-selected policy, not a finding that five years is legally required or justified for every field.
- The owner specified **1 week for recovered personal files, starting when the files are handed over to the customer**. The Georgian and English privacy pages state both the duration and the confirmed start event. This is separate from order-history retention.
- Additional warranties are service-specific. Their existence, scope and duration are communicated before repair; the copy does not apply blanket screen/keyboard exclusions or waive statutory rights.
- Diagnostics are payable when the fault is identified, repair is possible and the customer declines because of the quoted price. If the cause cannot be identified, diagnostics are free. The owner confirmed that other cases, including an identified but unrepairable fault, should remain individually agreed before work starts. No universal price or automatic charge has been invented.
- The owner reports that only branch managers and the company head have access to full customer contact details in the order-management system; technicians see only the customer name and device name. This statement is limited to the order-system display and is not a claim about who can access device contents during recovery.
- The owner currently removes recovered files manually. The one-week policy does not require a new automatic-deletion feature; verify that the actual manual process meets the agreed handover-based period.
- This is a public-copy update only. It does not implement or verify database retention, automatic deletion, archival cleanup or backup deletion.
- Both retention start events are now owner-confirmed. Align actual storage/cleanup practices with them before publication; no deletion mechanism has been assumed or implemented. Employee access restrictions are owner-reported and have not been verified on the live server. The offline backend snapshot does not implement the claimed technician-limited view (see the technical review below).

## Confirm before publication

- Apply the owner-approved individual diagnostic agreements in practice: explain the actual fee/payment conditions before work and specify the service-specific warranty scope/duration where applicable. No further universal diagnostic exception rule is needed for the current copy. Confirm the complaint-handling workflow and any applicable purchase terms; do not invent blanket exclusions of consumer rights.
- Controller contact/registered details and a durable contact method for data requests.
- Purposes and legal grounds for each actual processing operation; enforcement of the owner-reported access roles and other recipients, including republication of public reviews.
- Hosting/logging configuration, service providers, any cross-border processing and applicable safeguards. The current trial assistant processes questions locally and does not call an AI provider; recheck these details before enabling a server/external assistant again.
- Verify order-history retention (five years from order completion) and the manual recovered-file process (one week from customer handover); establish retention periods or concrete criteria for accounts, pending/rejected registrations, optional identification numbers, saved addresses, public comments, correspondence, sessions and logs; include audit records and backups in deletion planning. The five-year order-history term is not a blanket term for these categories.
- Confirm the purpose, necessity and legal basis of the optional personal-identification field before requesting it for a particular service or document. Its presence in the UI does not establish a legal requirement to collect it.
- Confirm the basis and workflow for public product comments, the author-name display, deletion requests, rule-violation reports and any eventual moderation. The terms add conduct rules, not a promise of automatic screening or an implemented administrator moderation queue.
- Actual cookies/analytics/third-party loading and any necessary consent controls. The current map embeds load Google resources; no blanket “no cookies” promise is made.
- Final review by someone qualified to confirm the legal text and actual business practices. These drafts are not a compliance certification.

## Code facts used

- Current trial assistant: browser-local responses based on the same prices/information as the seven service pages. Questions/conversations are held only in current-page memory; no assistant API requests, conversation storage or new session identifier. Photo/file upload has been removed. Ordinary website/page/API access can still have technical server logs; the local-assistant statement is not a website-wide zero-retention claim. The historical API integration below must not be described as the current frontend flow.
- `src/account/AuthDialog.tsx` and local `backend/auth.py`: required full name/mobile/password, optional email, pending registration followed by staff approval. Primary account phone is not editable in `CustomerProfile.tsx`; sensitive profile changes require the current password. The UI permits an optional personal ID.
- `backend/auth.py`: bcrypt password hashes; the `tecservice_session` cookie is HttpOnly with SameSite=Lax. Secure-cookie configuration and deployed session duration still need verification. Session records store the token hash, account ID/version, creation/expiry and user-agent; no public promise of a fixed cookie lifetime or a production-verified transport configuration was added.
- `src/account/CustomerSettings.tsx`: saved address label/city/address and account password changes; card-provider selection/remember-card checkbox are visual only, do not collect card details and do not save a real bank card.
- `src/account/customerCommentsApi.ts` and local `backend/customer_comments.py`: public comment text, author name and dates; owner/product association is used internally for author-only editing/deletion. Public comment payloads exclude phone, email, addresses, personal ID and order records. The public comment text is still user-supplied and must not contain private details.
- Customer portal/invoice endpoints enforce account ownership in the local implementation. Publication still requires real-server integration and authorization checks; this source review is not proof that a production installation is correctly configured.
- `src/data/tickets.ts`, `src/sections/TicketLookup.tsx`: local demonstration records, no live customer database or SMS integration.
- `src/pages/ContactPage.tsx`, `src/sections/AboutSection.tsx`, `src/pages/DataRecoveryPage.tsx`: Google Maps embeds. WhatsApp/social links open third-party services.

## 2026-09-25 account and trial-assistant copy update

Both languages now include registration/manual approval, account safety and phone changes through support; optional profile data and saved addresses; access to personal service/purchase records and issued invoices; and public-product-comment rules plus author editing/deletion. Privacy distinguishes public comment data from private account details and describes authentication cookies separately from the browser-local trial assistant. Card controls are explicitly visual-only; no payment, tokenisation or stored-card capability is claimed.

Existing diagnostic/warranty language and the owner-confirmed retention periods remain unchanged. The operator details, privacy rights and legal approval/indexing status have not been promoted to final approval. These additions document the local implementation and intended use; they do not deploy the customer backend or configure production access and retention.

The official consolidated personal-data law linked below was checked again for the disclosure categories in Article 24. No new statutory retention duration, broad consent claim or compliance certification has been added. Account/optional-data processing grounds, data recipients and hosting/retention details remain owner/legal-review items.

## Reference

[Georgia's Law on Personal Data Protection, particularly Article 24](https://matsne.gov.ge/ka/document/view/5827307) was consulted for the information categories to confirm. Business facts above come from the user and public frontend code, not from assumptions about production systems.

[Georgia's Law on the Protection of Consumer Rights, particularly Articles 18 and 19](https://matsne.gov.ge/ka/document/view/5420598) was consulted to distinguish additional warranties from statutory rights without asserting a universal repair warranty.

## Historical source-only legal and technical review (2026-09-22)

The 2026-09-22 review checked the public frontend as it existed then and the local `work/TECSERVICE_BACK-updated-2026-09-14` backend snapshot. Its server-assistant findings describe retained backend capabilities, not the browser-local trial flow introduced on 2026-09-25. It did not inspect the deployed VPS, environment secrets, customer databases/files, or operational logs, and it did not modify the backend. This is a preliminary source/document review, not legal sign-off or proof of production compliance.

### Copy improvements made

- Confirmed the five-year order-completion trigger and preserved the one-week customer-handover trigger. Retention is separated by data category rather than extending the order-history term to recovered files.
- Kept diagnostic exceptions individually agreed before work, as the owner requested. Preserved statutory rights separately from optional additional warranties, clarified that warranty terms are available in writing/on request, and made complaint submission clearer without requesting passwords or private files.
- Added a narrowly scoped contract/pre-contract basis for information necessary to arrange or perform the requested repair service. This does not assert that the same basis covers all analytics, AI processing, recovered sensitive files, marketing or third-party processing.
- Clarified the difference between in-page conversation state, the browser session identifier and server/provider-side processing. No blanket “nothing is stored” or fixed technical-log expiry promise was added.

### Local source evidence and unresolved production checks

All backend paths in this list are relative to the local snapshot, not the live host.

- `backend/server.py:328–339`: `/api/public/assistant` invokes a limiter and response generation without writing the conversation to the CRM. `backend/assistant.py` has no repository/database call. This supports only a narrowly scoped code finding, not a claim about all server/provider retention.
- `backend/assistant.py:80–98,865–872`: rate limiting keeps IP/session keys and timestamps in process memory. Expired timestamps are pruned when the same key is checked; inactive keys are not automatically removed. A 24-hour rate window is **not** a 24-hour deletion guarantee.
- `backend/assistant.py:851,923,955–986`: the provider is configuration-dependent (knowledge, Ollama or OpenAI). The OpenAI branch sends conversation content, can send the current message for moderation, and requests `store: False`; this is not evidence of zero provider-side retention. Confirm the actual provider, account settings, locations and applicable terms on deployment.
- `backend/assistant.py:819–822,904,915`: provider failures can include up to 500 characters of provider error content in application logs. Confirm log destinations/retention and assess whether error text should be redacted before publication.
- `backend/server.py:303–325` and `backend/repository.py:395–425`: separate live-chat endpoints persist names, email addresses, source pages and conversation messages. The frontend at the time called the assistant endpoint, not these chat endpoints. The current browser-local trial calls neither; recheck privacy copy if server AI or live chat is enabled later.
- `backend/auth.py:317–318,643–650`, `backend/server.py:87,211–212`, `backend/models.py:182–198`: this snapshot permits only admins into staff APIs and returns full tickets without technician-specific masking. Technicians are blocked as technicians, not given a restricted view; granting an admin account gives full ticket access. The owner-reported manager/head/technician policy therefore needs actual implementation/verification before claiming technical enforcement.
- `backend/audit.py:25–35,47–98`: audit history retains before/after data and is append-only; ordinary personal fields are not removed by credential redaction. Deleting a ticket does not establish full erasure.
- No timed order/chat/audit or recovered-file cleanup was found in the inspected implementation. `docker-compose.yml:54–55` and `backend/scripts/backup_database.py:73–81,129–135` configure a default daily backup schedule with 14 retained copies; this is a backup-copy setting, not a business-record retention policy. Confirm actual backup execution and erase/restore behaviour.

### Publication decision

Keep `legalDocumentsApproved = false`: account-data processing/retention, actual access enforcement, hosting/recipients, audit/backup cleanup and other deployment facts remain unverified. Server/external AI recipients and retention require review only if that integration is enabled again. Removing the former yellow banner did not resolve the remaining requirements. Have a qualified Georgian legal reviewer check the final policy against the verified operation, including the registered address, lawful grounds/necessity, recipients/transfers and recovery-file handling, before treating the documents as final.

The statutory review used the current consolidated personal-data law (Articles 4, 5 and 24) for purpose, necessity and disclosure requirements, and the consumer-rights law (Articles 5, 18 and 19) for pre-contract information, service obligations and additional-warranty boundaries. It does not certify that the user-selected retention periods satisfy all applicable obligations.

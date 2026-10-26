# Required whole-website copy and form release checks

Customer copy tells people what to enter, what they are agreeing to, what the action does, and what happens next. Implementation explanations belong in protected staff documentation, not enrollment instructions.

## Route and state ledger

Build an inventory from the current router, route metadata, navigation, article data and user-facing API messages. Include public pages, article detail pages, legal/disclosures, score and client-access destinations, all funnel/enrollment steps and capability branches, validation/loading/retry/empty/success/confirmation, client-facing signing and sign-in. Inspect desktop and 375px mobile, expanded FAQs and menus, accessible labels, alt text and social/search metadata. Staff-only diagnostics may stay protected; check the boundary.

Required row: `route | audience | state/viewport | exact rendered evidence | copy issue/correction | action/flow truth | PASS/HOLD`.

Reject public design-preview labels, approval bookkeeping, blank testimonial slots, internal QA notes, database/key/runtime explanations and format-test commentary. Examples to catch: “Unpublished design preview,” “Review space,” “awaiting approval,” “format checks do not verify,” “local review database.” Remove the artifact; never fabricate a review or hide a real limitation behind a promise. A keyword scan is only a tripwire: read the sentences. Keep necessary plain-language disclosures about charges, consent, privacy and actual outcomes. Legal provider disclosures are not automatically leakage.

Read every entry as a first-time customer. Does it explain the task naturally? Is it true for the actual current form? Does the button do what it says? A source-supported service sentence can still fail placement. Do not announce future appointments, service activation, issuer validation, payment or saved details unless the real result establishes them.

## Card/form field-to-use matrix

Required row: `intended use | field | required/conditional | validation | actual recipient/use | retention/consumption | tested result`.

Include cardholder name, number, expiration, security code, billing street/city/state/ZIP and explicit customer consent appropriate to the action. For a manual collection-only form, authorized staff may be the recipient; no processor selection question is needed. Verify UI → payload → encryption/persistence → correct enrollment → authorized staff display, plus unauthorized denial and failures. A label, input, screenshot or mocked success does not pass a working-field requirement. Never add a decorative field that discards its value or reports a save that did not happen.

Treat CVV separately from persistent cardholder data. Collection before a specific authorization differs from retention after authorization or for potential future transactions. Encryption and customer permission do not permit post-authorization CVV retention. Do not place CVV in the permanent card envelope, notes, logs, analytics, browser storage, exports or recoverable backups. A pre-authorization design needs an actual authorization-bound deletion lifecycle, denied grant replay and verified staff viewing/updating; TTL alone does not establish permission or compliance. If that lifecycle is absent, mark the CVV criterion HOLD, explain the exact constraint, and continue all independent fixes. Do not call a missing/untested field complete. Do not ask Marcus about his processor again.

Official boundaries checked October 26, 2026: https://www.pcisecuritystandards.org/faqs/1154/ (pre-authorization scope and payment-brand requirements); https://www.pcisecuritystandards.org/faqs/1319/ (necessary collection/non-retention); https://www.pcisecuritystandards.org/faqs/1280/ (future-use retention). Recheck current sections for material changes. These references do not certify this website.

## Release gate

Run `npm run check:copy` in the one maintained Git checkout. Review relevant existing form/API/access tests, then build. Stage the exact commit, read the actual hosted desktop/mobile customer journey and scan relevant states for internal copy. After an authorized production release, recheck the actual domain and deployed asset identity. Record commit, deployment, URL and actual evidence. A Git push is not a release; passing tests is not a whole-site visual audit; updating this skill is not automatic monitoring or a guarantee against every future error.

Report copy, form completeness and live-release outcomes separately. A corrected copy release can pass while CVV remains HOLD. Never combine those into “everything fixed.”

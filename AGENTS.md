# HomeReady Scores source control

## One active checkout

This directory is the active Git checkout for the current website:
`/Users/mac/Documents/Codex/2026-10-19/task-3/secure-card-signup-20261025/candidate`.
Remote: `https://github.com/Youhavevalue/homereadyscores.com.git`.

Work in this checkout. Do not create another unmanaged candidate as the primary source. Old candidates and `/Users/mac/code/Home Ready Scores` are historical copies and must not overwrite newer application work.

The source-recovery branch is `codex/recover-current-website`. Until it is merged, GitHub `main` is an older application and is not the current-release source. Preserve the recovery commits and review the actual branch before changing bases.

## Preserve concurrent work and secrets

Check Git status and current release records before editing or publishing. Do not reset, clean or overwrite another chat's changes. Keep `.env*` files, provider settings, local QA credentials/databases, real client data, payment card details and authenticator secrets out of Git. `.env.example` contains empty placeholders only.

Do not run historical SQL or activate old Clover handlers as a source-control repair. Inspect the target and current migrations separately for authorized database work. Preserve existing enrollment/card protections, staff authentication, attribution and idempotency rules.

## Continuity

Project instructions and current release evidence live in:
- `/Users/mac/Documents/ChatGPT/Home Ready Scores/AGENTS.md`
- `/Users/mac/Documents/ChatGPT/Home Ready Scores/Home Ready Scores Documentation.txt`
- `/Users/mac/Documents/Codex/2026-10-19/task-3/secure-card-signup-20261025/CURRENT-HANDOFF-GOAL.md`

Read the relevant current record. Historical files in the repository are reference material, not proof of current approval, configuration or release state. A Git push or pull request does not establish a production release.


## Marcus: collection-only card form; do not ask processor again (October 26, 2026)

Direct Marcus instruction in chat 01a178ee-8337-7f00-992c-7a33b7a7aa7c: Stop asking which payment processor he uses. The requested scope is the enrollment form collecting card/billing information and making it visible to him through protected staff access. Do not make processor selection, activation, integration, automatic charges or subscriptions a prerequisite for collection-only work. Do not ask this question again. Respect the latest scope and preserve existing encryption and staff access controls. Identify actual technical/security constraints narrowly; do not claim that all pre-authorization CVV collection is forbidden. CVV must not remain available for future transactions after authorization; do not silently promise indefinite CVV retention or hide an unfinished field behind customer-facing implementation language.


## Marcus: staff must see and correct collected CVV (October 26, 2026)

Latest direct clarification in chat01a178ee-8337-7f00-992c-7a33b7a7aa7c: Marcus and his small staff must be able to view all collected card details, including CVV, and update CVV when a customer provides a correction. The proposed one-view/24-hour code design was not requested and is superseded. Preserve existing staff access; do not add an authenticator, new role requirement or extra approval flow. CVV remains subject to removal after the related payment authorization; do not promise post-authorization or recurring-use CVV retention. Do not ask about the processor again.

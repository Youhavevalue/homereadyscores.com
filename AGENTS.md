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

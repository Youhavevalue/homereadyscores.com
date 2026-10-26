# HomeReady Scores

This repository contains the current HomeReady Scores website, credit-help questionnaire, enrollment flow and private staff workspace.

## Current source

The active local checkout is:

`/Users/mac/Documents/Codex/2026-10-19/task-3/secure-card-signup-20261025/candidate`

GitHub repository: https://github.com/Youhavevalue/homereadyscores.com

The `codex/recover-current-website` branch reconnects the maintained website source to the existing repository history. The recovery and onboarding changes are separate commits. GitHub `main` predates the recent releases until this recovery is reviewed and merged.

Older local candidates and `/Users/mac/code/Home Ready Scores` are historical copies. Keep them for recovery; make new application changes in the active checkout above.

## Development

Use Node.js and npm, then run:

```sh
npm ci
npm test
npm run dev
npm run build
```

Vite serves the frontend. API routes require the corresponding local server setup or Vercel runtime. The frontend alone does not establish that database, staff authentication or card storage is configured.

`.env.example` lists basic local settings. Never commit `.env.local`, real credentials, card information, staff authenticator secrets or client records. Production server credentials remain in the deployment provider; do not copy them into source files. Local preview accounts and databases belong in ignored runtime directories.

## Source control and releases

Fetch before starting a branch. Commit related changes, rebase onto the intended current branch, run the appropriate checks and push. Do not build a new untracked copy as the working source.

Pushing a branch backs up the source and permits review. Production releases require the applicable release authorization and verification. Existing migrations must be reconciled with the target database before applying them; do not blindly replay SQL from historical folders.

## Application areas

- `src/`: public site, questionnaire, enrollment and staff interface.
- `api/`: server routes and authorization, storage and enrollment helpers.
- `shared/`: shared validation, labels, content and tracking rules.
- `supabase/migrations/`: current additive database migrations.
- `tests/`: application regression tests.
- `public/`: public assets.

The original repository's `PROJECT_MEMORY.md`, `CONFIG_GUIDE.md`, `sql/`, `marketing/`, agency materials and editor workflows are preserved as historical reference. Current application behavior, code, tests and current release evidence take precedence over those older descriptions.

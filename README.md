# Home Ready Scores

> Credit repair marketing site, team portal (client CRM), and serverless integrations.

**Production**: [homereadyscores.com](https://homereadyscores.com)

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19, Vite 5, Tailwind CSS 4 |
| API | Vercel Serverless Functions (`/api/*`) |
| Database & auth data | Supabase (PostgreSQL) |
| Payments | Clover (tokenized checkout) |
| CRM | GoHighLevel |
| Hosting | Vercel (deploy from `main`) |

---

## Repository layout

```
├── api/                    # Vercel serverless handlers
│   ├── contact.js          # Get Started → GHL + Supabase
│   ├── auth/               # Portal login (bcrypt, service role)
│   ├── clients/            # GHL sync / push
│   ├── clover/             # Payments
│   └── documents/          # Upload URLs, deletes
├── src/
│   ├── context/AuthContext.jsx   # Portal session (API login + Supabase fallback)
│   ├── lib/supabase.js           # Browser Supabase client
│   └── pages/portal/             # Team portal UI
├── sql/                    # Schema / RLS reference migrations
├── .env.example            # Required env var names (no secrets)
└── vercel.json             # SPA rewrites + API routes
```

---

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local: Supabase URL + anon key (and server keys if you run APIs locally)
```

### Option A — Frontend only (no `/api`)

```bash
npm run dev
```

Opens Vite at `http://localhost:5173`. Calls to `/api/*` will **not** hit Vercel unless you add a proxy (Option B).

### Option B — **Recommended** for full-stack local UI

Point Vite at your **deployed** Vercel API so `/api/*` works while you edit React:

1. In `.env.local` set:

   `VITE_API_PROXY=https://homereadyscores.com`

   (Use your real Vercel production or preview URL.)

2. Run:

   ```bash
   npm run dev
   ```

Vite proxies `http://localhost:5173/api/...` → your Vercel deployment. **You are still using production APIs** — use for smoke tests, not load tests or destructive actions.

### Option C — Vercel dev (API runs on your machine)

Requires [Vercel CLI](https://vercel.com/docs/cli) and linked project:

```bash
npm run dev:vercel
```

Uses the same env as Vercel (pull with `vercel env pull` if needed).

### Build

```bash
npm run build    # production bundle → dist/
npm run preview  # serve dist locally
```

---

## Team portal (admin)

- **Production URL**: [homereadyscores.com/portal/login](https://homereadyscores.com/portal/login)
- **Routes**: `/portal/login` → dashboard (`/portal`), client directory (`/portal/clients`), client profiles.
- **Auth**: `POST /api/auth/login` validates against `team_members` (bcrypt). Local `vite` without `VITE_API_PROXY` falls back to direct Supabase for login.

**Team login (keep this repo private):**

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@homereadyscores.com` | `admin123` |

---

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_SUPABASE_URL` | Vercel + `.env.local` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Browser client |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel only (server) | API routes bypass RLS |
| `GHL_API_KEY`, `GHL_LOCATION_ID` | Vercel | GoHighLevel |
| `CLOVER_*` | Vercel | Clover billing |
| `VITE_API_PROXY` | **Local only** | Optional Vite proxy target for `/api` (see Option B) |

Set production values in **Vercel → Project → Settings → Environment Variables**.

---

## Data flow (high level)

1. **Get Started** (`/get-started`) → `POST /api/contact` → GHL + `clients` / `intake_forms` in Supabase.
2. **Portal** → `POST /api/auth/login` → validates `team_members`.
3. **Clients in portal** → Supabase from the browser (with RLS as configured) + server routes for GHL/Clover as needed.

---

## Database (Supabase)

See `sql/` for base tables and RLS. Typical tables include `team_members`, `clients`, `payments`, `intake_forms`, `documents`, etc.

---

## Lint & CI notes

`npm run lint` may report issues in `api/` (`process` in Node globals) and some React hook rules — align `eslint.config` with Node + React 19 as you tighten CI.

---

## Docs elsewhere

| Doc | Purpose |
|-----|---------|
| `docs/EMPLOYEE_SOP.md` | Internal procedures |
| `PROJECT_MEMORY.md` | Project history / decisions (if present) |

---

*Home Ready Scores engineering*

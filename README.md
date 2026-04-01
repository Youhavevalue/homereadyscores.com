# Home Ready Scores

> Credit Repair Website + Admin Portal + Client Portal

**Live Site**: [homereadyscores.com](https://homereadyscores.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 5, Tailwind CSS 4 |
| Backend | Vercel Serverless Functions (Node.js) |
| Database | Supabase (PostgreSQL) |
| Payments | Clover (Sandbox — PCI-compliant iframe tokenization) |
| CRM | GoHighLevel (REST API + MCP) |
| Hosting | Vercel (auto-deploys from `main`) |
| Email | Google Workspace (`help@homereadyscores.com`) |

---

## Project Structure

```
├── api/                          # Vercel Serverless Functions
│   ├── contact.js                # Enrollment form → GHL + Supabase
│   ├── auth/                     # Portal login (bcrypt)
│   ├── clients/
│   │   ├── push-to-ghl.js       # Push portal clients to GHL
│   │   └── sync-ghl.js          # GHL ↔ Supabase sync
│   ├── clover/                   # 6 payment endpoints
│   └── documents/
│       ├── upload-url.js         # Signed upload URLs
│       └── delete-document.js    # Storage + DB cleanup
├── src/
│   ├── components/               # Navbar, Footer, CloverPaymentForm, DisputeLetterModal
│   ├── context/AuthContext.jsx   # Custom auth (bcrypt + localStorage)
│   ├── lib/supabase.js           # Supabase client
│   └── pages/
│       ├── Home, HowItWorks, Reviews, GetStarted, FAQ
│       ├── legal/                # PrivacyPolicy, TermsOfService, FCRARights, CROADisclosure
│       └── portal/              # PortalLogin, Dashboard, ClientDirectory, ClientProfile, AddClient
├── sql/                          # Database migrations
├── docs/
│   └── EMPLOYEE_SOP.md           # Employee training & standard procedures
└── PROJECT_MEMORY.md             # All decisions, context, and session history
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

---

## Portal Access

### Admin Portal
- **URL**: `homereadyscores.com/portal/login`
- **Admin**: `admin@homereadyscores.com` / `admin123`

### Client Portal (Coming — Session 9)
- **URL**: `homereadyscores.com/client/login`
- **Default Password**: `HomeReady2026!` (auto-created on enrollment)

---

## Data Flow

```
Website Enrollment (GetStarted) → api/contact.js
  ├── 1. Upserts contact in GoHighLevel CRM
  ├── 2. Creates client in Supabase (clients table)
  └── 3. Creates intake form with goals + plan info

Portal Add Client → Supabase insert + api/clients/push-to-ghl.js
  ├── 1. Creates client in Supabase
  └── 2. Pushes to GoHighLevel CRM
```

---

## Database Tables (Supabase)

| Table | Purpose |
|---|---|
| `team_users` | Admin login credentials (bcrypt) |
| `clients` | Client directory |
| `client_users` | Client login credentials (planned) |
| `payments` | Payment config per client |
| `payment_history` | Transaction log |
| `intake_forms` | Client intake data |
| `documents` | File uploads (Supabase Storage) |
| `dispute_letters` | Dispute tracking + FCRA letter templates |
| `messages` | Client ↔ Admin messaging (planned) |
| `notifications` | Admin notification system (planned) |
| `activity_log` | Audit trail for all actions (planned) |
| `scheduled_charges` | Future-dated charges |

---

## Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

| Variable | Purpose |
|---|---|
| `GHL_API_KEY` | GoHighLevel API access |
| `GHL_LOCATION_ID` | GHL sub-account ID |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (server-side only) |
| `CLOVER_MERCHANT_ID` | Clover merchant |
| `CLOVER_API_ACCESS_KEY` | Clover API key |
| `CLOVER_ACCESS_TOKEN` | Clover auth token |
| `CLOVER_APP_SECRET` | Clover app secret |

---

## Key Documentation

| Document | Path | Purpose |
|---|---|---|
| Project Memory | `PROJECT_MEMORY.md` | All decisions, sessions, and architecture context |
| Employee SOP | `docs/EMPLOYEE_SOP.md` | Step-by-step training for portal operations |
| Implementation Plan | Session 8 artifact | 15-phase build plan for client portal + automation |
| SQL Migrations | `sql/` | Database schema changes |

---

*Maintained by the Home Ready Scores team.*

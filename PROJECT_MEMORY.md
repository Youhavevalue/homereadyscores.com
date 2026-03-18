# 🧠 Home Ready Scores — Project Memory & Context

> **Purpose**: This file keeps track of all decisions, progress, and context across chat sessions so we never lose momentum.

---

## 📋 Project Overview

| Field | Details |
|---|---|
| **Project** | Home Ready Scores — Credit Repair Website + Client Portal |
| **Owner** | Dr. Marcus Boudreaux |
| **Live Domain** | [homereadyscores.com](https://homereadyscores.com) |
| **Project Path** | `/Users/mac/Dropbox/DrMarcusb Full Folder/00_Master/GitHub/Home Ready Scores` |
| **Tech Stack** | Vite 5, React 19, Tailwind CSS 4, Supabase, Vercel Serverless |
| **Payments** | Clover (Sandbox) — iframe tokenization, PCI compliant |
| **Database** | Supabase (PostgreSQL) — `holsabbvljsnegatqqsy` |
| **CRM** | GoHighLevel (MCP connected) |
| **Design Inspiration** | Lexington Law (typography/authority), homereadyscores.com |
| **Created** | March 16, 2026 |
| **Last Updated** | March 17, 2026 @ 9:16 PM CST |

---

## 🏗️ Architecture

```
Home Ready Scores/
├── Home Ready Scores Agency Agents/   # Permanent expert personas & memory
├── dist/                              # Production build
├── sql/
│   └── clover_migration.sql           # DB migration for Clover columns
├── api/
│   ├── contact.js                     # GHL lead form handler
│   ├── auth/
│   │   ├── login.js                   # Portal authentication
│   │   └── setup.js                   # Initial admin setup
│   ├── clients/
│   │   └── sync-ghl.js               # GHL ↔ Supabase client sync
│   └── clover/
│       ├── config.js                  # Public Clover keys for frontend
│       ├── create-customer.js         # Creates Clover customer + card-on-file
│       ├── charge.js                  # One-time charges (setup fees)
│       ├── create-plan.js             # Recurring billing plans
│       ├── create-subscription.js     # Customer ↔ Plan subscriptions
│       └── process-payment.js         # Full orchestration endpoint
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                 # Fixed mobile hamburger + Portal link
│   │   ├── Footer.jsx                 # "Helping You Get Home Ready"
│   │   ├── CloverPaymentForm.jsx      # Clover iframe card form modal
│   │   └── ProtectedRoute.jsx         # Auth guard for portal routes
│   ├── context/
│   │   └── AuthContext.jsx            # Supabase session management
│   ├── lib/
│   │   └── supabase.js               # Supabase client initialization
│   ├── pages/
│   │   ├── Home.jsx                   # Updated "Buzz" language
│   │   ├── HowItWorks.jsx            # "Analyze-Action-Verify-Succeed"
│   │   ├── Reviews.jsx               # Social proof
│   │   ├── GetStarted.jsx            # GHL-integrated lead form
│   │   └── portal/
│   │       ├── PortalLogin.jsx        # Admin login page
│   │       ├── PortalDashboard.jsx    # Dashboard with stats
│   │       ├── ClientDirectory.jsx    # Searchable client list
│   │       ├── ClientProfile.jsx      # Tabbed profile (Payments, Intake, Credit, Disputes, Docs)
│   │       └── AddClient.jsx          # New client form
│   └── index.css                      # Rebranding and UI utilities
├── vercel.json                        # API rewrites + SPA fallback
└── package.json
```

---

## 🎨 Design System & Tone

| Token | Value | Tone Goal |
|---|---|---|
| **Primary Blue** | `#2562FF` | Trust & Authority |
| **Navy** | `#002D5B` | Professionalism |
| **Portal Theme** | Dark glassmorphism | Premium Dashboard Feel |
| **Tone** | Generic & Empathetic | Avoid Technical Jargon |
| **"Buzz" Phrases** | "100% Satisfaction" | "Custom Roadmap to Home Ownership" |

---

## 🗄️ Database Schema (Supabase)

### Tables
| Table | Purpose |
|---|---|
| `team_users` | Admin/team login credentials (bcrypt hashed) |
| `clients` | Client directory (name, email, phone, status, GHL ID, Clover ID) |
| `payments` | Payment config per client (setup fee, monthly, Clover IDs) |
| `payment_history` | Transaction log (amount, status, Clover charge ID) |
| `intake_forms` | Client intake data (JSON) |
| `credit_reports` | Credit report documents |
| `disputes` | Dispute letter tracking |
| `documents` | General document storage |
| `scheduled_charges` | Future-dated setup fee charges |

### Key Columns Added (Clover Migration)
- `payments`: `clover_customer_id`, `clover_plan_id`, `clover_subscription_id`
- `clients`: `clover_customer_id`
- `payment_history`: `clover_charge_id`
- RLS is **disabled** on all tables (development mode)

---

## ✅ Completed Work

### Session 1 — March 16, 2026 (Initial Build)
- [x] Rebuilt site as world-class multi-page app (4 pages)
- [x] Implemented React Router with scroll-to-top
- [x] Mobile-optimized all pages

### Session 2 — March 16, 2026 (Rebranding & Integration)
- [x] **Full Rebrand**: Renamed everything from "Legacy Credit" to **"Home Ready Scores"**.
- [x] **Language Simplification**: Replaced hard jargon with approachable "Buzz" marketing words.
- [x] **GHL Integration**: Created `/api/contact.js` serverless function and linked the "Get Started" form to GoHighLevel CRM.
- [x] **Vercel Deployment**: Successfully deployed live to the new brand domain.
- [x] **Agent Cluster Locked**: Formally assigned a strike team in `.agency-context.md`.

### Session 3 — March 17, 2026 (Refinements & CRM Setup)
- [x] **GoHighLevel API Fix**: Switched custom fields payload to V2 format.
- [x] **Pricing Selection**: Added "Select Enrollment Plan" (Single vs. Couple) to GetStarted.jsx.
- [x] **Footer Updates**: Removed physical address. Updated phone to "972-128-0009" (Text Support Only).
- [x] **Google Workspace Setup**: Verified DNS via Vercel TXT record.

### Session 4 — March 17, 2026 (Email Setup & GHL MCP Connection)
- [x] **Google Workspace Domain Verified**: Added TXT verification record to Vercel DNS.
- [x] **Gmail Activated**: `help@homereadyscores.com` created and live.
- [x] **MX Records Added**: Vercel's Google Workspace DNS preset auto-added all MX records.
- [x] **GHL MCP Integration**: Connected via MCP server with Private Integration Token.

### Session 5 — March 17, 2026 (Client Portal + Clover Payments)
- [x] **Full Client Portal Built**: Login, Dashboard, Client Directory, Client Profiles with tabbed views.
- [x] **Supabase Database**: Set up PostgreSQL with 8+ tables for clients, payments, intake, disputes, documents.
- [x] **Authentication System**: Custom auth with bcrypt password hashing, session persistence via AuthContext.
- [x] **Admin Account Created**: `admin@homereadyscores.com` / `admin123` (team_users table).
- [x] **Clover Sandbox Integration**: Obtained all credentials (Merchant ID, API Key, Access Token, App Secret).
- [x] **6 Clover API Routes**: Config, create-customer, charge, create-plan, create-subscription, process-payment.
- [x] **CloverPaymentForm Component**: PCI-compliant iframe card inputs, setup fee + recurring billing modal.
- [x] **Payments Tab Integration**: "Set Up Payment" button opens Clover form modal within client profile.
- [x] **SQL Migration**: Added Clover columns to payments/clients/payment_history tables + scheduled_charges table.
- [x] **Mobile Hamburger Fix**: Fixed crash caused by missing `ArrowRight` import in Navbar.jsx.
- [x] **Portal Login in Nav**: Added "Team Portal Login" link to both desktop and mobile navigation.
- [x] **Body Scroll Lock**: Mobile menu now prevents background scrolling when open.
- [x] **Vercel Env Vars**: All 9 environment variables set on Vercel production (GHL, Supabase, Clover).
- [x] **Git Push to Main**: All code committed and pushed. Vercel auto-deploying.

---

## 🔲 Outstanding / Next Steps

### High Priority
- [ ] **Clover Multi-Pay Token Activation**: Contact Clover Developer Relations to enable multi-pay tokens on sandbox merchant. Required for card-on-file (COF) to work. Email: `developer-relations@devrel.clover.com`.
- [ ] **Test End-to-End Payment**: Once multi-pay tokens are enabled, test with Clover sandbox test cards.
- [ ] **Connect GHL Email Service**: Set up `help@homereadyscores.com` as sending email in GHL dashboard.
- [ ] **DKIM Setup**: Complete DKIM authentication in Google Workspace for email deliverability.
- [ ] **Verify Vercel Deployment**: Confirm the new git push deploys successfully and mobile nav works on production.

### Medium Priority
- [ ] **FAQ Page**: Create the FAQ page (linked in nav but doesn't exist yet).
- [ ] **Intake Tab**: Build out the intake form functionality in client profiles.
- [ ] **Credit Reports Tab**: Build credit report upload/viewing functionality.
- [ ] **Disputes Tab**: Build dispute letter generation and tracking.
- [ ] **Documents Tab**: Build general document upload/management.
- [ ] **Replace placeholder images**: Audit site for any remaining generic avatars or stock assets.
- [ ] **GHL Automation Workflows**: Set up automated email responses and lead nurturing sequences.
- [ ] **Production Clover Credentials**: When ready for live payments, switch from sandbox to production Clover keys.

### Low Priority
- [ ] **Code Splitting**: Vite build warns about large chunks (643KB). Consider dynamic imports.
- [ ] **Enable RLS**: Re-enable Row Level Security on Supabase tables with proper policies for production.
- [ ] **Clover Webhooks**: Set up webhooks for payment status updates (failed recurring, refunds).

---

## 🔑 Key Decisions & Notes

1. **Language Strategy**: Use "100% Satisfaction" instead of "100% Free Consultation" and "Custom Roadmap to Home Ownership" instead of "Comprehensive Credit Report Analysis."
2. **Permanent Agent Cluster**: Fixed group of personas for consistent design and technical standards.
3. **Folder Structure**: "Agency Agents" folder inside the project = brain + code in one unit.
4. **Email Strategy**: `help@homereadyscores.com` is public-facing support email. Admin: `marcuslegacy@gmail.com`.
5. **GHL MCP Access**: GoHighLevel accessible via MCP. Can manage contacts, conversations, opportunities, calendars, blogs, social media, emails, and payments.
6. **DNS Provider**: Domain `homereadyscores.com` managed via Vercel. All DNS records configured there.
7. **Portal Auth**: Custom auth (not Supabase Auth) using `team_users` table with bcrypt. Session stored in localStorage.
8. **Clover PCI Compliance**: Card data never touches our server. Clover's iframe handles tokenization directly. Only the token is sent to our API.
9. **Payment Flow**: Frontend tokenizes → `process-payment` API creates Clover customer → charges setup fee → creates plan → creates subscription → updates Supabase.
10. **Dark Portal Theme**: Portal uses dark glassmorphism aesthetic to differentiate from the public-facing light marketing site.

---

## 📂 Related Files & Locations

| What | Where |
|---|---|
| Main Project | `/Users/mac/Dropbox/DrMarcusb Full Folder/00_Master/GitHub/Home Ready Scores` |
| Agency Memory | `./Home Ready Scores Agency Agents/.agency-context.md` |
| GHL API Logic | `./api/contact.js` |
| Auth API | `./api/auth/login.js`, `./api/auth/setup.js` |
| Clover APIs | `./api/clover/*.js` (6 files) |
| Client APIs | `./api/clients/sync-ghl.js` |
| SQL Migrations | `./sql/clover_migration.sql` |
| Portal Pages | `./src/pages/portal/*.jsx` (5 files) |
| GHL MCP Config | `~/.gemini/antigravity/mcp_config.json` |

---

## 🔐 Key Credentials & IDs (Reference Only)

| Item | Value |
|---|---|
| **GHL Location ID** | `XKYVuDiB39yJhk1XTMcV` |
| **GHL Location Name** | 3. LC Client Pod |
| **GHL MCP Server** | `https://services.leadconnectorhq.com/mcp/` |
| **Supabase Project** | `holsabbvljsnegatqqsy` |
| **Supabase URL** | `https://holsabbvljsnegatqqsy.supabase.co` |
| **Clover Merchant ID** | `3G36H3NENST21` |
| **Clover App ID** | `S3J1DCCJ91V1T` |
| **Clover Sandbox** | `sandbox.dev.clover.com` |
| **Portal Login** | `admin@homereadyscores.com` / `admin123` |
| **Support Email** | `help@homereadyscores.com` |
| **Domain Registrar** | Vercel |
| **Email Provider** | Google Workspace |
| **Admin Email** | `marcuslegacy@gmail.com` |

---

## 🌐 Vercel Environment Variables (Production)

| Variable | Status |
|---|---|
| `GHL_API_KEY` | ✅ Set |
| `GHL_LOCATION_ID` | ✅ Set |
| `VITE_SUPABASE_URL` | ✅ Set |
| `VITE_SUPABASE_ANON_KEY` | ✅ Set |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set |
| `CLOVER_MERCHANT_ID` | ✅ Set |
| `CLOVER_API_ACCESS_KEY` | ✅ Set |
| `CLOVER_ACCESS_TOKEN` | ✅ Set |
| `CLOVER_APP_SECRET` | ✅ Set |

---

*This file is maintained by the Home Ready Scores World-Class Strike Team.*

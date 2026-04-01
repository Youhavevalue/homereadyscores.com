# 🧠 Home Ready Scores — Project Memory & Context

> **Purpose**: This file keeps track of all decisions, progress, and context across chat sessions so we never lose momentum.

---

## 📋 Project Overview

| Field | Details |
|---|---|
| **Project** | Home Ready Scores — Credit Repair Website + Client Portal |
| **Owner** | Dr. Marcus Boudreaux |
| **Live Domain** | [homereadyscores.com](https://homereadyscores.com) |
| **Project Path** | `/Users/ashleyboudreaux/Library/CloudStorage/Dropbox/DrMarcusb Full Folder/00_Master/GitHub/Home Ready Scores` |
| **Tech Stack** | Vite 5, React 19, Tailwind CSS 4, Supabase, Vercel Serverless |
| **Payments** | Clover (Sandbox) — iframe tokenization, PCI compliant |
| **Database** | Supabase (PostgreSQL) — `holsabbvljsnegatqqsy` |
| **CRM** | GoHighLevel (MCP connected) |
| **Design Inspiration** | Lexington Law (typography/authority), homereadyscores.com |
| **Created** | March 16, 2026 |
| **Last Updated** | March 31, 2026 @ 8:40 PM CST |

---

## 🏗️ Architecture

```
Home Ready Scores/
├── Home Ready Scores Agency Agents/   # Permanent expert personas & memory
├── dist/                              # Production build
├── docs/
│   └── EMPLOYEE_SOP.md               # Employee training & procedures
├── sql/
│   ├── clover_migration.sql           # DB migration for Clover columns
│   └── portal_completion_migration.sql # Intake, Documents, Disputes tables
├── api/
│   ├── contact.js                     # Enrollment → GHL + Supabase client + intake
│   ├── auth/
│   │   ├── login.js                   # Portal authentication
│   │   └── setup.js                   # Initial admin setup
│   ├── clients/
│   │   ├── push-to-ghl.js            # Push portal clients to GHL CRM
│   │   └── sync-ghl.js               # GHL ↔ Supabase client sync
│   ├── clover/                        # 6 payment endpoints
│   └── documents/
│       ├── upload-url.js              # Signed upload URLs for Storage
│       └── delete-document.js         # Storage + DB cleanup
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                 # Fixed mobile hamburger + Portal link
│   │   ├── Footer.jsx                 # "Helping You Get Home Ready"
│   │   ├── CloverPaymentForm.jsx      # Clover iframe card form modal
│   │   ├── DisputeLetterModal.jsx     # FCRA-compliant letter generator
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
│   │   ├── FAQ.jsx                    # Accordion FAQ
│   │   ├── legal/                     # PrivacyPolicy, Terms, FCRA, CROA
│   │   └── portal/
│   │       ├── PortalLogin.jsx        # Admin login page
│   │       ├── PortalDashboard.jsx    # Dashboard with stats
│   │       ├── ClientDirectory.jsx    # Searchable client list
│   │       ├── ClientProfile.jsx      # ALL 5 tabs functional
│   │       └── AddClient.jsx          # New client form + GHL push
│   └── index.css                      # Rebranding and UI utilities
├── vercel.json                        # API rewrites + SPA fallback
├── PROJECT_MEMORY.md                  # Decisions & session history
└── README.md                          # Project overview & setup
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

### Session 6 — March 18, 2026 (Compliance & Content Updates)
- [x] **Copywriting Overhaul**: Removed all "free assessment" and strict "45-day guarantee" verbiage constraints, replacing with compliant "In as little as 45 days" and "100% Satisfaction."
- [x] **Asset Upgrade**: Replaced generic AI "pravatar" placeholders with highly authentic, casual Unsplash lifestyle photos on the Home and Reviews pages.
- [x] **FAQ Page Built**: Created `/faq` with fully-fleshed accordion answers addressing credit repair and home-buying common questions.
- [x] **Legal Compliance Pages**: Built 4 standalone boilerplate legal pages (`PrivacyPolicy`, `TermsOfService`, `FCRARights`, `CROADisclosure`) designed to meet strict CROA and merchant processing requirements.
- [x] **Footer Optimization**: Removed redundant "Contact Us" text link and social media placeholder icons to cleanly funnel users to the Direct Contact phone/text elements.

### Session 7 — March 31, 2026 (Portal Completion + Enrollment Bridge)
- [x] **Portal Completion Audit**: Mapped entire codebase, identified 4 placeholder tabs in ClientProfile.
- [x] **SQL Migration**: Created `portal_completion_migration.sql` — `intake_forms`, `documents`, `dispute_letters` tables + `client-documents` Storage bucket.
- [x] **Intake Tab**: Built functional form (DOB, SSN last 4, address, employer, income, goal pills, notes) with edit/view toggle.
- [x] **Documents Tab**: Upload/download/delete via Supabase Storage (PDF/JPG/PNG, 10MB limit) with type tagging.
- [x] **Credit Reports Tab**: Filtered document view for credit_report type uploads.
- [x] **Disputes Tab**: Full dispute tracking — add disputes, status pipeline (draft→sent→responded→resolved), round tracking.
- [x] **Dispute Letter Generator**: `DisputeLetterModal.jsx` — FCRA Section 611 compliant templates for 7 dispute reasons, editable, copy, print.
- [x] **GHL Push API**: `push-to-ghl.js` — auto-pushes portal clients to GoHighLevel CRM.
- [x] **AddClient GHL Sync**: Updated `AddClient.jsx` to auto-push to GHL on client creation.
- [x] **Enrollment-to-Portal Bridge**: Updated `api/contact.js` — website signup now creates Supabase client + intake_forms record (was only pushing to GHL before).
- [x] **Supabase Migration Executed**: All 16 SQL statements ran successfully, 8 tables confirmed.
- [x] **Documentation Overhaul**: Updated README.md, PROJECT_MEMORY.md, created `docs/EMPLOYEE_SOP.md`, created end-of-conversation workflow.
- [x] **Deployed**: Two git pushes to main, Vercel auto-deployed.

### Session 8 — March 31, 2026 (Planning & Architecture — No Code)
- [x] **Industry Research**: Analyzed Credit Repair Cloud, DisputeBee, and DisputeFox to identify standard feature sets for client portals, admin dashboards, payment management, and automation.
- [x] **GHL Audit via MCP**: Queried all 13 GHL pipelines, 28+ custom fields, and existing contacts. Mapped every GHL custom field ID to portal fields.
- [x] **15-Phase Implementation Plan**: Created comprehensive plan covering client auth, client portal (7 pages), admin notifications, activity log, payment management, GHL bi-directional sync, GHL email automation triggers, Clover activation, admin dashboard upgrade, routing, RLS security, code splitting, and end-to-end testing.
- [x] **GHL Field Mapping Table**: Documented exact field IDs for all 28 GHL custom fields (Status, Setup Fee, Monthly Fee, Monthly Due Date, Enrollment Date, Enrollment Payment Date, Payment Method, Counselor, Sales Rep, Deletion %s per bureau, etc.).
- [x] **Clover Multi-Pay Token Activation Guide**: Wrote exact email template for Dr. Marcus to send to `developer-relations@devrel.clover.com` with Merchant ID `3G36H3NENST21` and App ID `S3J1DCCJ91V1T`.
- [x] **SQL Migration Designed**: 4 new tables planned: `client_users`, `messages`, `notifications`, `activity_log`. Plus `status` column on `clients` table.
- [x] **Client Portal Architecture**: 7 new pages designed: ClientLogin, ClientDashboard, ClientDocuments, ClientDisputes, ClientMessages, ClientBilling, ClientSettings.
- [x] **Automation Strategy**: Decided to use GHL workflows triggered by tag/field updates from portal (not build custom email system). Portal sets tags → GHL sends welcome, payment receipt, payment failed, dispute updates, cancellation emails.

---

## 🔲 Outstanding / Next Steps

> Full implementation plan with all details: see `implementation_plan.md` artifact.

### 🔴 Critical (Blocks Launch)
- [ ] **Phase 1: Client Auth System** — `client_users` table, `client-login.js` API, `ClientAuthContext.jsx`, `ClientProtectedRoute.jsx`, `ClientLogin.jsx` page. Auto-create client login on enrollment (default password `HomeReady2026!`).
- [ ] **Phase 2: Client Dashboard** — Progress tracker (enrolled→analyzing→disputing→monitoring→complete), bureau summary cards (3 bureaus), recent activity feed, next payment card.
- [ ] **Phase 3: Client Documents/Disputes/Messages** — Client doc upload with admin notifications, read-only dispute view, messaging thread between client and admin.
- [ ] **Phase 12: Routing** — Add all `/client/*` routes to `App.jsx`, wrap in `ClientProtectedRoute`.
- [ ] **Phase 10: Clover Multi-Pay Token** — ⚠️ **DR. MARCUS MUST SEND EMAIL** to `developer-relations@devrel.clover.com` (template in implementation plan). 1-3 business day turnaround. Blocks all payment testing.
- [ ] **Phase 15: End-to-End Testing** — Full smoke test of enrollment → portal → disputes → payments → GHL sync.

### 🟡 High Priority
- [ ] **Phase 4: Client Billing View** — Payment history, next due date, plan details (read-only for clients).
- [ ] **Phase 5: Admin Notifications** — `notifications` table, bell icon with badge in admin navbar, auto-triggers on client actions.
- [ ] **Phase 6: Activity Log** — `activity_log` table, audit trail for all client/admin/system actions, timeline view in admin ClientProfile.
- [ ] **Phase 7: Admin Payment Management** — Change amounts, reschedule charges, pause/cancel subscriptions, manual one-time charges, failed payment handling.
- [ ] **Phase 8: GHL Bi-Directional Sync** — Sync all 28 mapped fields portal→GHL on every client change. Status updates, deletion %, payment info, enrollment dates.
- [ ] **Phase 9: GHL Email Automation Triggers** — Welcome email, payment confirmation, payment failed, dispute sent, progress update, cancellation. All via GHL workflow triggers (tags + custom field updates).
- [ ] **Phase 13: Supabase RLS** — Enable Row Level Security on all 12+ tables with service role bypass for API endpoints.

### 🟢 Medium/Low Priority
- [ ] **Phase 11: Admin Dashboard Upgrade** — KPI cards (revenue, past due, new this month), notification panel, activity feed, client status pie chart, payment calendar.
- [ ] **Phase 14: Code Splitting** — React.lazy() for portal pages, Vite manual chunks config. Fix 686KB warning.
- [ ] **Production Clover Credentials**: Switch from sandbox to production Clover keys when ready for live payments.
- [ ] **Clover Webhooks**: Set up webhooks for payment status updates (failed recurring, refunds).
- [ ] **GHL Workflow Creation (Manual)**: Create actual automation workflows in GHL dashboard based on trigger documentation from Phase 9.

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
10. **Dark Portal Theme**: Admin portal uses dark glassmorphism aesthetic. Client portal uses light blue/white theme matching the public site.
11. **Client Portal IS Happening**: Client-facing login is now part of the plan (reversed from Session 5 decision). Clients get auto-generated accounts with default password `HomeReady2026!`.
12. **Templates over AI**: Dispute letters use pre-built FCRA Section 611 templates instead of AI API — more reliable, free, and legally sound.
13. **Enrollment-to-Portal Bridge**: Website enrollments auto-create a Supabase client + intake form, not just a GHL contact.
14. **Documentation System**: README, PROJECT_MEMORY, and Employee SOP are maintained as living docs. End-of-conversation workflow generates handoff prompts.
15. **No Stripe**: Company cannot use Stripe. Clover is the only payment processor. Non-negotiable.
16. **Automation-First**: The company should run itself. All notifications, emails, status updates, and client onboarding are automated. No manual email sending or password delivery.
17. **GHL for Email Automation**: Instead of building a custom email system, portal triggers GHL workflows via tags and custom field updates. GHL handles all email sends (welcome, payment receipt, payment failed, dispute updates, cancellation).
18. **Industry Standard Feature Parity**: Features match Credit Repair Cloud, DisputeBee, and DisputeFox standards. No reinventing the wheel.
19. **GHL Field Sync**: 28 GHL custom fields mapped with exact IDs. Portal auto-syncs to GHL on every client profile change. Includes deletion percentages per bureau, payment info, enrollment dates, status.
20. **Client Portal Scope**: Clients see: progress tracker, bureau dispute cards, documents (upload + view), disputes (read-only), messages (send + receive), billing (read-only), settings (change password). Clients CANNOT create disputes, change payment methods, or access admin features.

---

## 📂 Related Files & Locations

| What | Where |
|---|---|
| Main Project | `/Users/ashleyboudreaux/Library/CloudStorage/Dropbox/DrMarcusb Full Folder/00_Master/GitHub/Home Ready Scores` |
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
| **Admin Portal Login** | `admin@homereadyscores.com` / `admin123` |
| **Client Default Password** | `HomeReady2026!` (auto-created on enrollment) |
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

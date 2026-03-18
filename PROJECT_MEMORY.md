# 🧠 Home Ready Scores — Project Memory & Context

> **Purpose**: This file keeps track of all decisions, progress, and context across chat sessions so we never lose momentum.

---

## 📋 Project Overview

| Field | Details |
|---|---|
| **Project** | Home Ready Scores — Credit Repair Website |
| **Owner** | Dr. Marcus Boudreaux |
| **Live Domain** | [homereadyscores-com.vercel.app](https://homereadyscores-com.vercel.app) |
| **Project Path** | `/Users/mac/Dropbox/DrMarcusb Full Folder/00_Master/GitHub/Home Ready Scores` |
| **Tech Stack** | Vite 8, React 19, Tailwind CSS 4 |
| **Design Inspiration** | Lexington Law (typography/authority), homereadyscores.com |
| **Created** | March 16, 2026 |
| **Last Updated** | March 17, 2026 @ 7:33 PM CST |

---

## 🏗️ Architecture

```
Home Ready Scores/
├── Home Ready Scores Agency Agents/ # Permanent expert personas & memory
├── dist/                          # Production build
├── src/
│   ├── components/
│   │   ├── Navbar.jsx             # Updated with "Get Started" CTAs
│   │   └── Footer.jsx             # Updated with "Helping You Get Home Ready"
│   ├── pages/
│   │   ├── Home.jsx               # Updated "Buzz" language
│   │   ├── HowItWorks.jsx         # Simplified "Analyze-Action-Verify-Succeed"
│   │   ├── Reviews.jsx            # Social proof (Home Ready branded)
│   │   └── GetStarted.jsx         # GHL-integrated lead form
│   ├── api/
│   │   └── contact.js             # Serverless function for GHL integration
│   └── index.css                  # Rebranding and UI utilities
└── package.json
```

---

## 🎨 Design System & Tone

| Token | Value | Tone Goal |
|---|---|---|
| **Primary Blue** | `#2562FF` | Trust & Authority |
| **Navy** | `#002D5B` | Professionalism |
| **Tone** | Generic & Empathetic | Avoid Technical Jargon |
| **"Buzz" Phrases** | "100% Satisfaction" | "Custom Roadmap to Home Ownership" |

---

## ✅ Completed Work

### Session 1 — March 16, 2026 (Initial Build)
- [x] Rebuilt site as world-class multi-page app (4 pages)
- [x] Implemented React Router with scroll-to-top
- [x] Mobile-optimized all pages

### Session 2 — March 16, 2026 (Rebranding & Integration)
- [x] **Full Rebrand**: Renamed everything from "Legacy Credit" to **"Home Ready Scores"**.
- [x] **Language Simplification**: Replaced hard jargon (advocacy, engineering, legal challenge) with approachable "Buzz" marketing words.
- [x] **GHL Integration**: Created `/api/contact.js` serverless function and linked the "Get Started" form to GoHighLevel CRM.
- [x] **Folder Reorganization**: Renamed project folder and moved the "Agency Agents" memory inside the main project.
- [x] **Vercel Deployment**: Successfully deployed live to the new brand domain.
- [x] **Agent Cluster Locked**: Formally assigned a strike team (Orchestrator, Designer, Engineer, SEO, Content) in `.agency-context.md`.

### Session 3 — March 17, 2026 (Refinements & CRM Setup)
- [x] **GoHighLevel API Fix**: Switched custom fields payload to V2 format (`key` and `field_value`). Handled missing `GHL_API_KEY` handling.
- [x] **Pricing Selection**: Added a "Select Enrollment Plan" (Single vs. Couple) to step 3 of the `GetStarted.jsx` page. Mapped choice to GHL via custom field (`contact.single_or_joint_account`) and tag.
- [x] **Footer Updates**: Removed physical address completely. Updated phone number to "972-128-0009" and prominently labeled "Text Support Only".
- [x] **Copy Refinement**: Changed "45-Day" wording to "Proven Difference" and "Start Your Journey Today" on the `HowItWorks.jsx` page.
- [x] **Google Workspace Setup**: Guided user through verifying DNS via Vercel TXT record pointing to Google Workspace.

### Session 4 — March 17, 2026 (Email Setup & GHL MCP Connection)
- [x] **Google Workspace Domain Verified**: Added TXT verification record (`google-site-verification=QyOd0Q16f4vI5RfNzR-N3qACRQ5Go2CVLoBIWz2zF5w`) to Vercel DNS for `homereadyscores.com`.
- [x] **Gmail Activated**: Successfully activated Gmail for the domain. Google confirmed: "Gmail is now ready" and "You verified homereadyscores.com".
- [x] **MX Records Added**: Used Vercel's built-in "Google Workspace" DNS preset to auto-add all required MX records (`SMTP.GOOGLE.COM`) for email routing.
- [x] **Email Account Created**: Created `help@homereadyscores.com` (user: "Help Support") in Google Workspace — this is the primary support email displayed on the website.
- [x] **GHL MCP Integration Explored**: Connected to GoHighLevel via MCP server (`https://services.leadconnectorhq.com/mcp/`) using Private Integration Token. Confirmed location ID `XKYVuDiB39yJhk1XTMcV` ("3. LC Client Pod"). MCP can manage contacts, conversations, opportunities, calendars, blogs, social media, emails, and payments.

---

## 🔲 Outstanding / Next Steps

### High Priority
- [x] **Verify GHL Leads**: Form submissions successfully create contacts in GHL. Used `pit-` (Private Integration Token) for auth and resolved the `422` error by removing the `notes` field from the root payload.
- [x] **Custom Domain Verify**: Successfully identified nameservers on Vercel and guided Google Workspace TXT DNS verification.
- [x] **Email Setup Complete**: `help@homereadyscores.com` is live via Google Workspace. Gmail activated, MX records in place. DNS propagation may take up to 24 hours.
- [ ] **Connect GHL Email Service**: Set up `help@homereadyscores.com` as the sending email in GoHighLevel (Settings → Email Services). This must be done via the GHL dashboard UI — the MCP API doesn't expose email service configuration.
- [ ] **DKIM Setup**: Complete DKIM authentication in Google Workspace for better email deliverability (the setup wizard was showing "DKIM setup" as the next step).
- [ ] **Vercel Production Variables**: Ensure `GHL_API_KEY` and `GHL_LOCATION_ID` are set inside the Vercel dashboard for production live leads.

### Medium Priority
- [ ] **FAQ & Contact Pages**: Complete the content for these secondary pages.
- [ ] **Replace placeholder images**: Audit site for any remaining generic avatars or stock assets.
- [ ] **GHL Automation Workflows**: Now that MCP is connected, set up automated email responses, lead nurturing sequences, and appointment booking workflows.

---

## 🔑 Key Decisions & Notes

1. **Language Strategy**: Decided to move away from technical/legal terms. Use "100% Satisfaction" instead of "100% Free Consultation" and "Custom Roadmap to Home Ownership" instead of "Comprehensive Credit Report Analysis."
2. **Permanent Agent Cluster**: Assigned a fixed group of personas to handle all project reboots, ensuring consistent design and technical standards without needing specific user instructions each time.
3. **Folder Structure**: Centralized the "Agency Agents" folder inside the project to keep the "brain" and the "code" in one self-contained unit.
4. **Email Strategy**: `help@homereadyscores.com` is the public-facing support email displayed on the website (footer, contact sections). Created through Google Workspace for professional domain-branded email. Admin account uses `marcuslegacy@gmail.com`.
5. **GHL MCP Access**: GoHighLevel is accessible via MCP server at `https://services.leadconnectorhq.com/mcp/` with a Private Integration Token. Location ID: `XKYVuDiB39yJhk1XTMcV`. The MCP can manage contacts, send messages, create blog posts, manage opportunities/pipelines, handle social media posting, and more — but cannot configure email SMTP/service settings (must use GHL dashboard).
6. **DNS Provider**: Domain `homereadyscores.com` is managed via **Vercel** (purchased through Vercel). All DNS records (A, CNAME, MX, TXT, CAA) are configured in Vercel's DNS management panel.

---

## 📂 Related Files & Locations

| What | Where |
|---|---|
| Main Project | `/Users/ashleyboudreaux/Library/CloudStorage/Dropbox/DrMarcusb Full Folder/00_Master/GitHub/Home Ready Scores` |
| Agency Memory | `./Home Ready Scores Agency Agents/.agency-context.md` |
| GHL API Logic | `./api/contact.js` |
| GHL MCP Config | `~/.gemini/antigravity/mcp_config.json` |

---

## 🔐 Key Credentials & IDs (Reference Only)

| Item | Value |
|---|---|
| **GHL Location ID** | `XKYVuDiB39yJhk1XTMcV` |
| **GHL Location Name** | 3. LC Client Pod |
| **GHL MCP Server** | `https://services.leadconnectorhq.com/mcp/` |
| **Support Email** | `help@homereadyscores.com` |
| **Domain Registrar** | Vercel |
| **Email Provider** | Google Workspace |
| **Admin Email** | `marcuslegacy@gmail.com` |

---

*This file is maintained by the Home Ready Scores World-Class Strike Team.*

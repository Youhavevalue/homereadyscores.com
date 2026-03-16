# 🧠 Legacy Credits — Project Memory & Context

> **Purpose**: This file keeps track of all decisions, progress, and context across chat sessions so we never lose momentum.

---

## 📋 Project Overview

| Field | Details |
|---|---|
| **Project** | Legacy Credits — Credit Repair Website |
| **Owner** | Dr. Marcus Boudreaux |
| **Live Domain** | legacycredits.com |
| **Project Path** | `/Users/mac/Dropbox/DrMarcusb Full Folder/00_Master/GitHub/Legacy Credit` |
| **Tech Stack** | Vite 8, React 19, Tailwind CSS 4 |
| **Design Inspiration** | Lexington Law (typography/authority), legacycredits.com (brand/copy) |
| **Created** | March 16, 2026 |
| **Last Updated** | March 16, 2026 @ 3:42 PM CST |

---

## 🏗️ Architecture

```
Legacy Credit/
├── dist/                    # Production build (single-file HTML bundle)
│   └── index.html           # ← GHL-ready, self-contained file
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # Sticky glassmorphism nav, mobile hamburger
│   │   └── Footer.jsx       # 4-column footer with contact/legal/socials
│   ├── pages/
│   │   ├── Home.jsx         # Hero + trust logos + 3 pillars + CTA
│   │   ├── HowItWorks.jsx   # 4-step process (Analyze→Challenge→Submit→Succeed)
│   │   ├── Reviews.jsx      # 6 testimonial cards with score increases
│   │   └── GetStarted.jsx   # Multi-step lead intake form (3 steps)
│   ├── App.jsx              # React Router setup, scroll-to-top
│   ├── main.jsx             # Entry point
│   └── index.css            # Design system (fonts, colors, utilities)
├── index.html               # Dev HTML with Google Fonts
├── vite.config.js           # Vite + Tailwind + SingleFile plugin
└── package.json
```

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| **Primary Blue** | `#2562FF` | CTAs, action buttons, highlights |
| **Navy** | `#002D5B` | Headings, hero backgrounds, footer |
| **Brand Blue** | `#0078C1` | Legacy Credits brand accent |
| **Surface** | `#F8F9FA` | Light backgrounds |
| **Heading Font** | Noto Sans Display (Black 900) | All headings |
| **Body Font** | Noto Sans (Regular/Medium) | Body text |

---

## ✅ Completed Work

### Session 1 — March 16, 2026
- [x] Scaffolded Vite + React project
- [x] Installed Tailwind CSS 4 with `@tailwindcss/vite` plugin
- [x] Built initial landing page from user's AI Studio code
- [x] Researched legacycredits.com for brand copy and structure
- [x] Researched lexingtonlaw.com for typography and design patterns
- [x] Rebuilt site as world-class multi-page app (4 pages)
- [x] Implemented React Router with scroll-to-top
- [x] Built responsive Navbar with glassmorphism + mobile hamburger
- [x] Built premium Footer with contact info
- [x] Mobile-optimized all pages (tested at 390px)
- [x] Created single-file production build for GHL hosting
- [x] Added GHL MCP config to Antigravity settings
- [x] Moved project to `/00_Master/GitHub/Legacy Credit`
- [x] Attempted GHL MCP connection — requires Antigravity restart (SSE transport)
- [x] Created `PROJECT_MEMORY.md` for cross-session continuity
- [x] Discussed deployment options (GHL paste vs Vercel/Netlify)

---

## 🔲 Outstanding / Next Steps

### High Priority
- [ ] **Initialize Git repo** and push to GitHub
- [ ] **Deploy website live** (Vercel/Netlify or GHL funnel)
- [ ] **Connect lead form** to GoHighLevel CRM pipeline
- [ ] **Point legacycredits.com** domain to new hosting

### Medium Priority
- [ ] **Build FAQ page** (nav link exists, page doesn't)
- [ ] **Build Contact page** (footer links to it)
- [ ] **Add Login link** (redirect to GHL client portal)
- [ ] **Replace placeholder avatars** with real client photos
- [ ] **Update testimonials** with real client stories
- [ ] **Update contact info** (real address, phone, email)

### Low Priority / Future
- [ ] Add Open Graph meta tags for social sharing
- [ ] Add Google Analytics / tracking pixel
- [ ] Create blog/articles section
- [ ] Add pricing page
- [ ] Implement dark mode toggle
- [ ] Add schema.org structured data for SEO

---

## 🔑 Key Decisions & Notes

1. **Single-File Build**: Using `vite-plugin-singlefile` to bundle everything into one HTML file. This makes it easy to paste directly into GHL custom code blocks.

2. **Font Choice**: Switched from Playfair Display + Inter → **Noto Sans Display** after researching Lexington Law. The heavier sans-serif creates more authority and trust for a credit repair brand.

3. **GHL MCP**: Config is at `~/.gemini/antigravity/mcp_config.json`. Requires Antigravity restart to activate. Uses SSE transport. GHL endpoint returned `"Client must accept text/event-stream"` on direct test — confirmed it needs SSE-compatible MCP client.

4. **React Router**: Using `HashRouter` may be needed if deploying on GHL (no server-side routing). Currently using `BrowserRouter` which works on Vercel/Netlify.

5. **GHL Hosting Shortcut**: The `dist/index.html` single-file build can be pasted directly into a GHL Funnel → Custom Code element. No server needed. This is the fastest path to go live on GHL.

---

## 📂 Related Files & Locations

| What | Where |
|---|---|
| Project Code | `/Users/mac/Dropbox/DrMarcusb Full Folder/00_Master/GitHub/Legacy Credit` |
| GHL-Ready Build | `./dist/index.html` (single file, ~305KB) |
| MCP Config | `/Users/mac/.gemini/antigravity/mcp_config.json` |
| Brand Assets | `/Users/mac/Dropbox/DrMarcusb Full Folder/` (check MEDIA_ASSETS) |
| HELOC Brain | `/Users/mac/Library/Mobile Documents/com~apple~CloudDocs/3. What I do/Entrepreneurship/Marcus Boudreaux Consulting/HELOC BRAIN/` |

---

## 💬 Session Log

### Session 1 — March 16, 2026, 2:40 PM – 3:42 PM CST
**Conversation ID**: `62552847-d713-4257-9e45-6b1c0cb6fcfc`

- **Goal**: Build Legacy Credits website from AI Studio code
- **What Happened**:
  1. Scaffolded Vite + React project from user's AI Studio JSX code
  2. Initial build had broken Tailwind — fixed by installing `@tailwindcss/vite` plugin
  3. User requested world-class redesign inspired by Lexington Law
  4. Researched both legacycredits.com and lexingtonlaw.com for brand/design
  5. Rebuilt entire site: 4 pages, premium typography, mobile-optimized
  6. Created single-file production build (`vite-plugin-singlefile`)
  7. Added GHL MCP config — connection failed (needs restart)
  8. Moved project from root Dropbox → `00_Master/GitHub/`
  9. Created this memory file for session continuity
- **Outcome**: Full world-class multi-page site built, mobile-optimized, production-ready
- **Blockers**: GHL MCP not connecting (needs Antigravity restart for SSE transport)
- **Next Session Priority**: Deploy live → connect lead form → init Git repo

---

*This file is maintained by Antigravity AI. Update after each session.*

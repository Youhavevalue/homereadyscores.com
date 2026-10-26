> Historical setup guide. See README.md and current release records before configuring or deploying.

# 🔐 Home Ready Scores — Credentials & Integration Guide

This document contains the critical IDs and configuration settings for the Home Ready Scores ecosystem. **Keep this file secure.**

## 1. GoHighLevel (GHL) Integration

| Setting | Value | Description |
|---|---|---|
| **Location ID** | `XKYVuDiB39yJhk1XTMcV` | The unique ID for the "3. LC Client Pod" sub-account. |
| **GHL API Key** | `<YOUR_SUPABASE_ANON_KEY>` | Found in GHL Settings > Business Profile. (Used for API calls). |
| **API Version** | `2021-07-28` | The LeadConnector API version used in the code. |

## 2. Vercel Deployment Settings

These settings are required in the Vercel Dashboard under **Project Settings > Environment Variables** for the website to function:

| Variable Name | Value / Source |
|---|---|
| `GHL_API_KEY` | *Your GHL API Key* |
| `GHL_LOCATION_ID` | `XKYVuDiB39yJhk1XTMcV` |

## 3. Custom Field Mapping (GHL)

The website form is mapped to the following custom fields in your GHL account:

| Form Field | GHL Field ID | GHL Field Name |
|---|---|---|
| **Goal Selection** | `tags` | Mapped as Tags (e.g., "Goal: Buy a Home") |
| **Card Number** | `m35Q9AKiCKA2dXBuCd3s` | Account# |
| **Billing Zip** | `RKBxUXo7C9vPWWGdgCz1` | Billing Zip Code |
| **Security Info** | `notes` | Full summary (CVV/Expiry) stored in Contact Notes. |

## 4. GitHub Repository
- **Remote**: `https://github.com/Youhavevalue/homereadyscores.com.git`
- **Branch**: `main`

---
*Created and maintained by the Home Ready Scores Agency Agents.*

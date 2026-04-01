# 📋 Home Ready Scores — Employee SOP & Training Guide

> **Purpose**: Step-by-step instructions for portal operations so any team member can manage clients, disputes, documents, and payments without guessing.

---

## 🔐 1. Logging Into the Portal

1. Go to **homereadyscores.com/portal/login**
2. Enter your team email and password
3. Click **Sign In**
4. You'll land on the **Dashboard** showing stats: Total Clients, Active Subscriptions, Pending Charges, Open Disputes

> **Default Admin Account**: `admin@homereadyscores.com` / `admin123`
> ⚠️ Change this password after first login if using in production.

---

## 👥 2. Adding a New Client (Manual)

1. Click **Clients** in the top navigation
2. Click **+ Add Client** button (top right)
3. Fill in the required fields:
   - **First Name** (required)
   - **Last Name** (required)
   - Email, Phone, Address, City, State, Zip (optional but recommended)
4. Click **Save**
5. The system will:
   - Create the client in the portal database
   - Automatically push the client to GoHighLevel CRM
   - Redirect you to their profile page

### Clients From Website Enrollment
When a customer fills out the **Get Started** form on the website:
- They are **automatically** created in both GoHighLevel AND the portal
- You do NOT need to add them manually — just look them up in the Client Directory
- Their intake form will show the enrollment plan and goal they selected

---

## 📝 3. Filling Out the Intake Form

1. Open a client's profile from the Client Directory
2. Click the **📝 Intake** tab
3. If no intake exists, the form opens automatically. Fill in:
   - **Date of Birth** — client's DOB
   - **SSN Last 4** — last 4 digits only (stored securely, never full SSN)
   - **Current Address** — full address
   - **Previous Address(es)** — optional
   - **Employer** — current employer name
   - **Annual Income** — approximate
   - **Credit Goals** — click the pill buttons (Buy a Home, Lower Interest Rates, etc.)
   - **Notes** — any relevant info
4. Click **Save Intake**
5. To edit later, click the **Edit** button on the intake card

---

## 📁 4. Uploading Documents & Credit Reports

### Uploading a Credit Report
1. Open the client's profile
2. Click the **📊 Credit Reports** tab
3. Click **📎 Upload Report**
4. Select a PDF, JPG, or PNG file (max 10MB)
5. The file uploads to secure cloud storage and appears in the list

### Uploading Other Documents (ID, Utility Bill, etc.)
1. Click the **📁 Documents** tab
2. Select the **document type** from the dropdown (Credit Report, ID Document, Utility Bill, Other)
3. Click **📎 Upload File**
4. Select the file

### Downloading & Deleting
- Click **↓ Download** to open/save any document
- Click **✕** to delete a document (you'll be asked to confirm)

---

## ✉️ 5. Creating & Managing Disputes

### Adding a New Dispute
1. Open the client's profile
2. Click the **✉️ Disputes** tab
3. Click **+ New Dispute**
4. Fill in:
   - **Bureau**: Experian, Equifax, or TransUnion
   - **Dispute Reason**: Not mine, Inaccurate balance, Paid/settled, Outdated, Duplicate, Identity theft, or Other
   - **Account Name**: The creditor name (e.g., "Capital One", "Midland Credit")
   - **Account # (Last 4)**: Last 4 digits if available
   - **Notes**: Any additional context
5. Click **Add Dispute**

### Generating a Dispute Letter
1. Find the dispute in the list
2. Click **✉️ Generate Letter** (or **📄 View Letter** if one exists)
3. The letter auto-fills with:
   - Client name and address
   - Bureau mailing address
   - Account details
   - FCRA Section 611 legal language
4. **Edit** the letter text if needed — it's fully editable
5. Click **📋 Copy** to copy to clipboard, or **🖨️ Print** to print
6. Click **💾 Save Letter** to save your edits

### Tracking Dispute Status
Each dispute has a status pipeline: **Draft → Sent → Responded → Resolved**

- Click the **status pill** (e.g., "draft →") to advance it to the next stage
- When you advance to "sent", the sent date is auto-recorded
- When you advance to "responded", the response date is auto-recorded
- "Resolved" is the final state

### Round Tracking
The system automatically tracks dispute rounds. If you create a second dispute for the same bureau and account, it's labeled Round 2, then Round 3, etc.

---

## 💳 6. Payments

### Setting Up Payment Configuration
1. Open the client's profile (default **💳 Payments** tab)
2. If no payment exists, the form appears automatically
3. Fill in:
   - **Setup Fee (in cents)**: e.g., `18499` for $184.99
   - **Setup Fee Date**: Leave empty for immediate, or pick a future date
   - **Monthly Amount (in cents)**: e.g., `11400` for $114.00
   - **Monthly Start Date**: When recurring billing begins
4. Click **Save Payment Config**

### Processing a Credit Card (Clover)
1. Click **💳 Set Up Payment** in the Payments tab
2. The Clover payment modal opens with secure card input fields
3. The client enters their card information (never touches our server — Clover handles it)
4. After successful processing, a green "Clover Connected" badge appears

### Viewing Payment History
- Scroll down in the Payments tab to see all past charges
- Each shows: description, date/time, amount, and status (succeeded/failed)

---

## 📊 7. Dashboard Overview

The dashboard shows 4 key metrics at a glance:
- **Total Clients**: All clients in the system
- **Active Subscriptions**: Clients with active monthly payments
- **Pending Charges**: Scheduled future charges
- **Open Disputes**: Unresolved dispute letters

Click any client in the recent list to jump to their profile.

---

## 🔄 8. How the Systems Connect

| Action | What Happens |
|---|---|
| Customer fills out Get Started form | → Created in GHL + Portal + Intake form |
| Admin adds client manually in portal | → Created in Portal + Pushed to GHL |
| Admin uploads credit report | → Stored in Supabase Storage, linked to client |
| Admin creates dispute | → Tracked in portal, letter auto-generated from templates |
| Admin processes payment via Clover | → Card tokenized by Clover, customer + subscription created |

---

## ⚠️ Important Notes

1. **Never share the admin password** — change it from the default in production
2. **Card data is safe** — Clover handles all card input via their secure iframe. Card numbers never touch our server.
3. **File size limit** — Documents must be under 10MB. Accepted: PDF, JPG, PNG
4. **SSN** — We only store the last 4 digits, never the full SSN
5. **Dispute letters** — These are templates, not legal advice. Always review before sending.

---

*Last Updated: March 31, 2026*

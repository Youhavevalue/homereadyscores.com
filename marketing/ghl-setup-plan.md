# 🚀 GHL Implementation Plan: Welcome Email Series

This plan outlines how to set up the **Home Ready Scores** welcome email automation in your GoHighLevel account using the newly drafted templates.

## 🛠️ Phase 1: Create Email Templates

The email content is drafted in [welcome-emails-drafts.md](./welcome-emails-drafts.md).

1.  Log in to your **GoHighLevel** dashboard.
2.  Navigate to **Marketing > Emails > Templates**.
3.  Click **+ Create Email** (Select **Email Marketing (HTML)** or **Design Editor**).
    > [!TIP]
    > For the cleanest look, use the **Code Editor** and paste the HTML provided in the drafts.
4.  Create **two templates**:
    - **Template 1**: `Home Ready Welcome - Email 1` (Welcome & Roadmap delivery)
    - **Template 2**: `Home Ready Follow-up - Email 2` (Social Proof & Confidence)

## ⚡ Phase 2: Set Up the Automation Workflow

Now, we'll link the website form to these emails.

1.  Navigate to **Automation > Workflows**.
2.  Click **+ Create Workflow** and start from **Scratch**.
3.  **Trigger**: Add a new trigger:
    - **Select Trigger**: `Contact Tag Added`
    - **Filters**: Tag matches `HomeReadyNewLead`.
    > [!NOTE]
    > I have updated your website's `api/contact.js` to automatically add this tag to every new submission.
4.  **Action 1 (Instant)**:
    - **Action**: `Send Email`
    - **Email Template**: Select `Home Ready Welcome - Email 1`.
5.  **Action 2 (Wait)**:
    - **Action**: `Wait`
    - **Time**: Wait 1 Day.
6.  **Action 3 (Follow-up)**:
    - **Action**: `Send Email`
    - **Email Template**: Select `Home Ready Follow-up - Email 2`.
7.  **Publish**: Set the workflow to **Published** and click **Save**.

## ✅ Phase 3: Verification

1.  Go to your website.
2.  Fill out the **Get Started** form with a test email.
3.  Check GHL **Contacts** to see if the contact appeared with the `HomeReadyNewLead` tag.
4.  Check the **Workflow history** to ensure the email was sent successfully.

---

### Key Contact Fields Used
The templates use the following GHL merge tags:
- `{{contact.first_name}}` — Displays the lead's first name.

*This setup ensures a professional, high-touch experience for every new lead who visits Home Ready Scores.*

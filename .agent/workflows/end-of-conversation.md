---
description: End of conversation — update README, PROJECT_MEMORY, Employee SOP, and generate handoff prompt
---

# End of Conversation Workflow

Run this at the end of every conversation to keep all documentation current and generate a handoff prompt for the next session.

## Steps

1. **Update PROJECT_MEMORY.md** — Add a new session entry under "Completed Work" with:
   - Session number and date
   - All checkboxed items describing what was built, fixed, or changed
   - Move any completed items from "Outstanding / Next Steps" to the session entry
   - Add any new decisions to "Key Decisions & Notes"
   - Update the "Last Updated" date at the top

2. **Update README.md** — If any of the following changed, update them:
   - Project structure / file tree
   - New environment variables
   - New tables or data flows
   - Quick start instructions

3. **Update docs/EMPLOYEE_SOP.md** — If any user-facing portal functionality was added or changed:
   - Add new sections for new features
   - Update existing sections if workflows changed
   - Keep the language simple — written for non-technical employees
   - Update the "Last Updated" date at the bottom

4. **Generate Handoff Prompt** — Create a markdown block with a prompt the user can paste into a new conversation. The prompt should include:
   - Project name and path
   - Tech stack summary (one line)
   - What was done in THIS session (bullet list)
   - What's still outstanding (bullet list from PROJECT_MEMORY)
   - Any blockers or decisions needed
   - Instruction to read PROJECT_MEMORY.md and EMPLOYEE_SOP.md for full context

   Format the handoff prompt like this:

   ```
   ## Handoff Prompt

   I'm working on **Home Ready Scores** — a credit repair website + admin portal.

   **Project Path**: `/Users/ashleyboudreaux/Library/CloudStorage/Dropbox/DrMarcusb Full Folder/00_Master/GitHub/Home Ready Scores`
   **Stack**: React 19 + Vite + Tailwind 4 + Supabase + Vercel + GoHighLevel + Clover

   **Last session we:**
   - [list of what was done]

   **Still outstanding:**
   - [list from PROJECT_MEMORY outstanding items]

   **Before starting, read these files for full context:**
   - `PROJECT_MEMORY.md` — all decisions, sessions, and architecture
   - `docs/EMPLOYEE_SOP.md` — employee training procedures
   - `README.md` — tech stack and project structure

   [Any specific instructions for what to work on next]
   ```

5. **Commit & Push** — Stage all documentation changes and push:
   ```bash
   git add README.md PROJECT_MEMORY.md docs/EMPLOYEE_SOP.md
   git commit -m "docs: update project memory, readme, and SOP"
   git push origin main
   ```

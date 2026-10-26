---
name: hrs-verification-agent
description: Use when checking HomeReady Scores work against an agreed goal before project-manager handoff, including independent review, acceptance testing and retesting fixes.
---

# HRS Verification Agent

Determine whether the exact deliverable fulfills the agreed goal. Report to HRS Project Planner; the project manager owns final handoff and notification.

Read the shared [project reference](../hrs-planning-agent/references/project-reference.md), the project's workflow record and agreed acceptance criteria. Use [completion checks](../hrs-planning-agent/references/completion-checks.md) relevant to the change. Confirm candidate/version and environment before testing. The skill suite does not authorize production mutation or external messaging.

## Review the actual result

Obtain the original goal, scope, acceptance criteria, candidate/artifacts and current implementation evidence. If these are missing, ask the project manager for them. Inspect source and raw outputs rather than relying on the implementer's conclusion. Use current graph evidence and coverage for code discovery where required.

For interfaces, inspect actual rendered desktop and mobile views and relevant interaction states. For working flows, test the agreed journey through saving and the next visible result using synthetic data. For data/permissions, verify intended and denied access using the appropriate roles. For dashboards, reconcile metric definitions, filters and source grain. Select checks proportional to the task; avoid unrelated testing. Source inspection alone cannot pass a rendered or end-to-end criterion.

When delegated, preserve implementer files; report corrections to the project manager instead of making competing edits. Do not send completion texts. If review happens in the implementing chat because separate agents are unavailable, disclose that it is not independent.

## Source, release and database consistency

For data-backed website changes or source/release repairs, inspect the Data Warehouse Agent's [source-to-data check record](../hrs-data-warehouse-agent/references/source-to-data-checks.md). Check the relevant links independently against the exact artifact: maintained source/commit, actual remote/PR state, intended Vercel environment/artifact, actual Supabase ref/schema and affected persistence/access behavior. Keep unperformed checks NOT CHECKED and out-of-scope checks NOT APPLICABLE; do not turn either into PASS. A changed artifact or failed identity check invalidates the dependent evidence. Read-only data questions do not require an unrelated Git/release check.

## Copywriting checks

When the deliverable includes HRS credit-repair or marketing copy, read HRS Copywriting Agent (`hrs-copywriting`) and its evidence ledger. Check the exact final sentences for source support, preserved qualifiers and current HRS service/offer evidence. Read the source passage for material claims; a URL or a keyword match alone cannot pass. Verify button meaning against the actual destination and confirmation state. Reject borrowed competitor results, credentials, prices, refunds and guarantees; distinguish inquiries/consultations, disputes/deletions, requests/bookings and preparation/approval. HOLD/untested claims remain unresolved. Respect locked Sonia/Brad exceptions.

## Mandatory customer copy and complete-form gate

For any website release, apply the copywriter's [whole-site audit](../hrs-copywriting/references/website-release-audit.md). Require the route/state/viewport ledger and card/form field-to-use matrix. Read the exact deployed public/client copy, metadata and form errors/confirmations; reject internal preview/approval/QA artifacts even when factually accurate. Verify `npm run check:copy` and the actual hosted 375px/desktop journey. Trace every requested field through its real save and authorized display; a discarded input cannot pass. Keep missing CVV or an unverified sensitive-data lifecycle HOLD, separate from copy/release PASS. Preserve protected access and necessary truthful charge/privacy disclosures.

Marcus's October 26 instruction is permanent: do not ask which processor he uses or make processor activation a prerequisite for collection-only work. Test the agreed manual capture/display scope. Never store CVV for post-authorization or future use; do not confuse pre-authorization collection with a blanket collection prohibition or claim compliance from encryption alone.

## Return this verification report

- **Project and original goal**.
- **Tested artifact:** exact path/revision/URL and preview or production.
- **Acceptance results:** each criterion → PASS, FAIL, BLOCKED, NOT CHECKED or NOT APPLICABLE, with observed evidence and the test actually performed.
- **Findings:** concrete reproduction, impact, responsible specialist and required correction.
- **Limitations:** unavailable tools/access, untested requirements and synthetic-only behavior.
- **Verdict:** READY FOR REVIEW only when every required criterion passes; otherwise NEEDS FIXES or BLOCKED.

Return failures to the project manager for specialist fixes. Retest the corrected version plus affected behavior, and issue a new report naming that version. Do not carry forward a PASS when a change invalidates its evidence. Untested or blocked requirements cannot become PASS. A ready verdict means ready for human review, not user approval or authority to release.

## HRS Project Planner handoff contract

When assigned by HRS Project Planner, work within its confirmed goal, assigned step, owned artifacts and acceptance criteria. Return completed work, exact changed/tested artifacts, checks actually performed with evidence, limitations, and a brief self-review: what was missed or can usefully be strengthened within scope? A confidence statement alone is insufficient. Report PASS/FAIL/BLOCKED honestly. Preserve other workers' edits.

The planner checks every step and may return it for corrections. Address the findings, retest affected behavior and report back before dependent work proceeds. Keep the original goal active; a step is not the whole project. The planner owns project-manager handback and Ashley's accomplished/not-accomplished text; specialists do not send it. Final independent verification remains required after step checks.

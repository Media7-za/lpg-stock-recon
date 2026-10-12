# Save a Pricing Desk session handoff

Prompt ID: PD-HANDOFF-SAVE  
Version: 1.0

Save the handoff supplied in this conversation to Media7-za/lpg-stock-recon.

1. Read repository instructions and docs/pricing-desk-consolidation/README.md at the latest main commit. Check repository visibility and the README publication boundary before uploading source content. This public destination requires a redacted copy or explicit authorization for any confidential disclosure. Prepare useful safe work first; explain any specific content that cannot be published.
2. Use the supplied handoff as evidence. Do not invent session metadata, regenerate its commercial findings from memory, or import unrelated conversations.
3. Check the register for the same source session. Reuse its collection ID/path for revisions. For a new session, assign the next unused PD-SNNN ID from the current register; keep its original source/local ID as separate metadata. If identity is ambiguous, leave the ambiguity explicit rather than combining sessions.
4. Save under docs/pricing-desk-consolidation/session-handoffs/PD-SNNN_<stable-slug>.md. Preserve source wording and item IDs; record metadata normalization, corrections and redactions explicitly. Keep superseded evidence visible.
5. Update the README register with title, source reference if safe to publish, relative file link, version, source date range, extraction time, coverage and review status. New or materially revised evidence starts unreviewed. A byte-identical re-import is a no-op, not a new revision.
6. Commit handoff and register together, preserving unrelated changes. Suggested message: docs(pricing-desk): capture PD-SNNN vX.Y. On concurrent changes, reload both files, reconcile and re-check ID uniqueness; never force-push. Respect protected branches; use a review branch/PR if needed and identify pending status.
7. Read back the committed handoff and register and verify content, version and ID match. Return file URL, branch, commit, handoff version, coverage limitations and next action. Do not claim main was updated unless verified.
8. If GitHub write access is unavailable, return the exact handoff and intended path for relay. State that nothing was saved.

This operation stores session evidence only. Do not amend business doctrine, ERP prices, customer agreements or Supabase data.

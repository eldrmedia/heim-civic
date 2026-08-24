# Phase 9.2B: editorial review and promotion

Phase 9.2B implements the accountable human gate required by PRD FR-007,
FR-008, and FR-009. Automation prepares evidence and validates decisions; it
does not approve civic summaries or impersonate an editor.

## Artifacts and ownership

- `src/data/generated/enhanced-bill-review.json` is the source-verified input.
- `data/review/generated/enhanced-bill-review-packets.json` is reproducible and
  gives editors a source fingerprint, checklist, evidence links, and every vote
  requiring classification.
- `data/review/enhanced-bill-editorial-decisions.json` is the human-owned
  decision record. Generators never overwrite it.
- `src/data/generated/promoted-enhanced-legislation.json` contains only records
  that passed the fail-closed promotion gate.

## Reviewer workflow

1. Run `npm run data:editorial-review-packets` after rebuilding the Phase 9.2
   source package.
2. Review the official digest against enrolled/vetoed text, amendments, status,
   people, committees, selection explanation, and every displayed vote.
3. Add an `approved` decision to the human-owned decisions file. Copy the exact
   candidate fingerprint from the generated packet; enter a real reviewer name,
   role, ISO timestamp, evidence-backed vote classifications, and uncertainty
   notes. If a plain-language summary received AI assistance, retain a clear
   assistance disclosure.
4. Run `npm run data:promote-enhanced-bills`.
5. Run `npm run check` and visually inspect the promoted bill page, public
   selection log, search, sitemap, linked official activity, and mobile/accessibility
   behavior before committing.

## Fail-closed rules

Promotion stops if the decision schema is incomplete, the decision references a
different snapshot, a candidate fingerprint changed, a bill is unknown or
duplicated, any extracted vote is missing or duplicated, or a vote evidence URL
does not match its official source. A valid decisions file with no approvals
produces an empty promoted snapshot and leaves all ten records in the review
queue.

William Elder, founder, approved nine Batch 1 records on August 24, 2026 after
accepting the documented assessment. AB44 remains unapproved because its two
same-day Senate passage events require reconsideration-aware public labels.

Phase 9.2C adds those distinct labels to the reviewed vote vocabulary and a
regression test for AB44. William Elder, founder, accepted the corrected
readiness assessment on August 24, 2026; the decision ledger retains the exact
UTC approval time and vote-level evidence used for promotion.

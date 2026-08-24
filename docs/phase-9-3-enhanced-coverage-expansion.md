# Phase 9.3: enhanced coverage expansion

Phase 9.3 extends the FR-007, FR-008, and FR-009 workflow without weakening the
human publication gate established in Phase 9.2B.

## Batch 2 selection rule

Batch 2 contains the next ten unprocessed governor-veto qualifiers in ascending
official bill-identifier order after excluding the already enhanced AB83 record
and all ten Batch 1 candidates. Party, sponsor, ideology, candidate status,
predicted popularity, and an unexplained importance judgment do not affect the
order.

The selected identifiers are AB79, AB82, AB88, AB98, AB112, AB144, AB155,
AB185, AB188, and AB201. Every identifier and bill key must reconcile against
the complete 1,152-record index and the 86-record official veto audit. Any drift
stops generation.

## Reproducible preparation

Run:

```bash
npm run data:enhanced-bill-review:batch-2
npm run data:editorial-review-packets:batch-2
npm run data:promote-enhanced-bills
```

The Batch 2 source bundle contains ten records, 20 roll calls, and 40 checksummed
NELIS source documents. The public selection repository combines it with Batch
1, producing 20 visible candidates. All 20 are published only after accountable
review. The separate Batch 2 decision ledger preserves the reviewer, role, UTC
decision time, candidate fingerprint, checklist, and vote classifications.

The parser preserves committee sponsors as named sponsor entities when NELIS
does not provide an individual legislator. It also follows the sponsor-role label
in the NELIS overview. Where an enrolled bill heading instead uses “joint
sponsor,” an approved record must disclose that source-label difference through
the public coverage-limitations field.

## Assessment state

The AI-assisted assessment compared all ten NELIS digests with the enrolled
PDFs, reviewed amendments and final status, reconciled sponsors and committees,
and classified all 20 displayed roll calls as chamber passage votes. It recommends
all ten records for approval. AB82 and AB98 carry a proposed public limitation
about the NELIS “co-sponsor” label versus the enrolled heading's “joint sponsor”
label.

William Elder, founder, accepted all ten recommendations at
`2026-08-24T17:19:39.853Z`. The matching fingerprints passed the promotion gate,
so all ten Batch 2 records now have local enhanced routes. The public records for
AB82 and AB98 retain the disclosed NELIS “co-sponsor” versus enrolled-heading
“joint sponsor” coverage limitation.

## Final coverage and integrity audit

Run `npm run data:audit-enhanced-coverage` to reproduce the FR-007, FR-008, and
FR-009 audit in `data/review/phase-9-3-final-coverage-audit.json`. The audit
reconciles published Nevada records to the official index and automatic veto
qualifiers, checks the 30–50 target and all ten required subjects, validates
required bill fields, source hashes, roll-call totals and original values,
checks accountable approvals and preserved limitations, and records selection-
log coverage. Search, sitemap, accessibility, source-health, and production-
build coverage remain enforced by the repository gates.

The August 24, 2026 run verifies 31 published Nevada records, 125 unique source
documents, 63 roll calls, every required subject, official-index reconciliation,
complete required fields, source integrity, vote integrity, public selection-log
coverage, and the approved AB82 and AB98 limitations. Search and sitemap tests
now assert every enhanced route rather than representative samples.

The audit is intentionally `action-required`, not closed. AB83 is the original
vertical-slice record and predates the standardized human decision ledger. It
has source-verified content, but it does not retain a reviewer, role, UTC review
time, candidate fingerprint, or uncertainty decision. Its two state vote labels
also use the older “Final passage” wording instead of the reviewed “Passage”
vocabulary. The public selection log and bill page now identify this governance
gap rather than implying approval. AB44's reviewed source snapshot contains no
sponsor entity; its public page now states that condition and links readers to
the authoritative record instead of rendering an unexplained empty list.

### Remaining closure action

1. Reconstruct and assess an AB83 evidence packet under the current editorial
   framework.
2. Obtain an accountable human decision against the exact candidate fingerprint.
3. If approved, normalize the two vote labels through the promotion path, retain
   the decision metadata, rerun the audit, and require `ready` status before
   declaring Phase 9.3 complete.

## Batch 3 selection and preparation

Batch 3 continues the same neutral processing rule: after excluding AB83 and all
20 records in Batches 1 and 2, select the next ten governor-veto qualifiers in
ascending official bill-identifier order. The selected identifiers are AB204,
AB205, AB209, AB213, AB217, AB237, AB245, AB259, AB278, and AB280. Party,
sponsor, ideology, predicted popularity, and an unexplained importance judgment
do not affect the order.

Run:

```bash
npm run data:enhanced-bill-review:batch-3
npm run data:editorial-review-packets:batch-3
npm run data:promote-enhanced-bills
```

The Batch 3 bundle contains ten records, 20 passage roll calls, and 40
checksummed NELIS source documents. Its separate decision ledger preserves the
reviewer, role, UTC decision time, candidate fingerprints, completed checklists,
and passage classifications.

## Batch 3 assessment state

The AI-assisted assessment reviewed all ten enrolled PDFs, final amendments,
veto histories, sponsor and committee labels, and every displayed roll call. The
normalized digest comparisons range from 99.62 to 100 percent. It recommends all
ten records for approval with no proposed coverage limitation. William Elder,
founder, accepted all ten recommendations at `2026-08-24T18:45:58.200Z`. The
matching fingerprints passed the promotion gate, so all ten records now have
local enhanced routes and Enhanced Pilot Coverage contains 31 published Nevada
bills.

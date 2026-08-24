# Editorial bill review framework

This framework is the required review sequence for promoting a bill from the
source-verified queue into Heim Civic's enhanced coverage. It supports PRD
FR-007, FR-008, and FR-009 and applies consistently regardless of party,
sponsor, subject, vote margin, or outcome.

## Evidence hierarchy

Use primary sources in this order:

1. The enrolled bill PDF and Legislative Counsel's Digest.
2. The NELIS overview, history, amendments, committees, and sponsors.
3. NELIS vote summaries and complete member roll calls.
4. The official governor veto or override report when that is the selection
   trigger.

Secondary reporting may identify a question but cannot resolve or override an
official-record discrepancy.

## Required checks

Every bill receives the same checks:

1. **Identity:** identifier, numeric bill key, session, title, and source URLs
   agree.
2. **Source integrity:** every captured source is available, hashed, dated, and
   unchanged from the reviewed snapshot.
3. **Digest fidelity:** the queued digest agrees with the digest in the enrolled
   bill and materially describes the enrolled text.
4. **Amendments:** the final text incorporates the amendments in the history;
   material amendment effects are not hidden by the summary.
5. **Status:** latest action, veto/override state, and as-of date agree with
   NELIS and the applicable official report.
6. **People and committees:** sponsors, joint sponsors, cosponsors, and
   committee referrals agree with official records; committee-sponsored bills
   are not presented as having an individual sponsor.
7. **Votes:** each displayed roll call has matching members and totals and a
   supported public label. Reconsideration, concurrence, amendment, override,
   and procedural votes must not be flattened into an ambiguous label.

For a passage vote that is subsequently reconsidered, label the original event
“Initial passage — later reconsidered” and the later result “Passage after
reconsideration.” Retain both roll calls, their sequence, totals, and official
links. Do not relabel either event as merely procedural.

8. **Selection neutrality:** the reason follows the published rubric and does
   not depend on party, ideology, electoral status, or predicted popularity.
9. **Uncertainty:** unresolved conflicts are explicit and do not affect a
   material claim presented as settled fact.

## Dispositions

- **Recommend approval:** all nine checks pass and no material ambiguity remains.
- **Changes required:** evidence is sufficient to identify a concrete data,
  labeling, provenance, or presentation defect that must be corrected.
- **Needs clarification:** the official sources do not support a confident
  conclusion; the record stays queued pending additional evidence.

An AI assessment is advisory. It must record its system identity, sources,
retrieval time, evidence hashes, reasoning, and limitations. It never writes a
human identity into the promotion ledger. A human editor must accept the
recommendation before `npm run data:promote-enhanced-bills` can publish it.

## Repeatable review procedure

1. Rebuild the source and reviewer packets.
2. Re-download all captured official sources and compare hashes.
3. Download and hash the enrolled bill PDF.
4. Compare the queued digest with the enrolled Legislative Counsel's Digest and
   inspect the operative sections for its material claims.
5. Reconcile amendments, history, people, committees, status, and every roll
   call.
6. Apply the neutral selection rule.
7. Record the disposition and a specific reason for every failed check.
8. Validate the assessment artifact, obtain human acceptance for recommended
   records, run promotion, and execute the full repository gate.

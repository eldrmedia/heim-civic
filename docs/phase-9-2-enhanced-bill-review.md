# Phase 9.2: enhanced bill review workflow

Phase 9.2 implements the first repeatable editorial batch required by FR-007,
FR-008, and FR-009. It prepares official records for review without treating
automated extraction as human approval.

## First batch

The batch uses governor veto as the automatic selection rule and uses subject
breadth only to order the first ten records:

| Subject area                       | Bill  | Official topic                                  |
| ---------------------------------- | ----- | ----------------------------------------------- |
| Budget and tax                     | AB226 | Tax incentives and community benefit agreements |
| Education                          | AB397 | Higher-education fee waivers                    |
| Health                             | SB128 | Health care prior authorization                 |
| Housing                            | AB223 | Rental-property habitability                    |
| Elections and government           | AB306 | Mail-ballot drop boxes                          |
| Labor and business                 | AB44  | Essential-goods trade practices                 |
| Criminal justice and public safety | AB105 | Firearms at election sites                      |
| Environment, water, and energy     | AB244 | Polystyrene foodware                            |
| Transportation                     | AB140 | Driver authorization cards                      |
| Civil rights and social services   | SB171 | Protections related to gender-affirming care    |

All ten identifiers and numeric keys must reconcile against both the complete
NELIS index and official governor-veto report. The batch does not use party,
sponsor, candidate status, ideology, or predicted public interest as a selection
factor.

## Reproducible source preparation

Run:

```bash
npm run data:enhanced-bill-review
```

The builder downloads NELIS overview and final-vote fragments, discovers the
official vote keys, downloads the complete member lists, and writes
`src/data/generated/enhanced-bill-review.json`. Generation stops on a missing
digest, missing veto action, identifier/key mismatch, empty vote set, member-
total disagreement, missing current-profile reconciliation, or schema change.

The current artifact contains ten records, 21 roll calls, and 41 source
documents. Each source retains its URL, retrieval time, SHA-256 hash, parser
version, coverage label, and validation state.

## Human promotion gate

An accountable editor must complete all of the following before a queued record
can enter the published enhanced snapshot:

1. Compare the official digest with the enrolled and vetoed bill text.
2. Confirm that material amendments are represented and uncertainty is explicit.
3. Confirm status and latest action against the official history.
4. Classify each displayed vote as passage, initial passage later reconsidered,
   passage after reconsideration, concurrence, amendment, procedural, or veto
   override where the official record supports that distinction.
5. Review sponsor and committee coverage for omissions or source ambiguity.
6. Approve the selection explanation under the published neutral rubric.
7. Record a non-placeholder reviewer identity and ISO approval time.
8. Run repository, search, route, accessibility, and source-health tests after
   promotion.

Until those steps are complete, the public selection log labels each record
“Awaiting human review,” links to NELIS, and does not create an enhanced page.
The implemented packet and promotion workflow is documented in
`docs/phase-9-2b-editorial-review-and-promotion.md`.

## Remaining work

- Complete the Phase 9.3 breadth audit now that 31 Nevada bills are published
  across approximately 30–50 target records with broad
  subject coverage.
- Test special sessions, non-final vote types, and bills without recorded floor
  votes before broadening the parser.

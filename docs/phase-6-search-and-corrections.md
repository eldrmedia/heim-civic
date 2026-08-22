# Phase 6: search and corrections

Phase 6 implements PRD requirements FR-011 (cross-record search), FR-020
(correction intake and workflow states), and the intake portion of FR-021
(immutable audit history for material manual changes).

## Search boundary

The search index is rebuilt from the checked-in, reviewed public snapshots at
render time. It contains current officials, official electoral district
boundaries, pilot bills, and the subjects represented by those bills. It does
not index lookup addresses, correction reports, voter files, or inferred
political attributes. Search results link to an existing public record when one
exists; district results identify the current representative and direct the user
to the private address lookup for personal confirmation.

## Correction delivery contract

The application does not use a local filesystem or an unreviewed database as a
production queue. A hosted deployment must configure:

- `CORRECTIONS_INTAKE_WEBHOOK_URL`: an HTTPS endpoint controlled by the
  foundation or an approved case-management provider.
- `CORRECTIONS_INTAKE_WEBHOOK_TOKEN`: a scoped bearer credential accepted only
  by that endpoint.

If either value is missing, malformed, or delivery fails, the public endpoint
returns `503`, explicitly says that no information was retained, and does not
claim receipt.

Accepted requests are sent as schema version 1 with a generated case ID,
`received` status, submission time, record reference, evidence, reporter contact
consent, and the first immutable audit event. The receiving system must:

1. persist the envelope transactionally and deduplicate on `caseId`;
2. restrict reporter contact information to authorized reviewers;
3. preserve status transitions (`received`, `triaged`, `investigating`,
   `resolved`, `rejected`, `published`) as append-only audit events;
4. send any email acknowledgement without exposing the report to analytics or
   application logs;
5. support the correction retention and deletion policy before public launch;
6. alert on failed intake delivery and provide a tested export/restore path.

## Abuse and privacy controls

The route accepts same-origin JSON only, caps payload size, validates every
field, uses a honeypot, and rate-limits by a keyed hash of the transient client
address. It never returns submitted report text in errors and never logs the
payload. The public form instructs people not to submit a residential address,
political preferences, or unrelated sensitive information.

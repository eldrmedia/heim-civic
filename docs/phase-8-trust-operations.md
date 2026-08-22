# Phase 8: trust and civic operations

Phase 8 implements the application-side contracts for PRD requirements FR-020,
FR-021, and FR-024 and publishes the editorial, funding, pricing, and source
freshness disclosures required for the public pilot.

## Correction workflow

Correction states are `received`, `triaged`, `investigating`, `resolved`,
`rejected`, and `published`. The domain state machine rejects skipped or invalid
transitions. Every event is sequenced within its case and retains the actor,
time, reason, evidence, and affected records. A material public-record change
also requires before-and-after references.

The application emits schema-version-2 intake envelopes. A configured case
receiver must store the case and first audit event transactionally, deduplicate
on `caseId`, enforce the same state machine, make prior audit events immutable,
and restrict reporter contact information to authorized reviewers.

## Confirmed-opt-in waitlist

The application emits schema-version-1 waitlist envelopes with status
`pending-confirmation`. A configured receiver must:

1. deduplicate idempotently on `subscriptionId` and normalized email;
2. send a single-use, expiring confirmation link;
3. never mark or message the contact as confirmed before link completion;
4. record confirmation time and the consent text/version;
5. place unsubscribe in every post-confirmation nonessential message;
6. stop messages immediately after unsubscribe;
7. automatically delete unconfirmed requests after seven days;
8. complete a verified deletion request within 30 days while retaining only the
   minimum suppression proof required to avoid accidental resubscription;
9. alert on provider limits or failed confirmation delivery without retry storms;
10. support a tested export and restore path.

The form does not accept party, ideology, vote history, candidate preference, or
an exact address. Optional location is limited to ZIP code or county.

## Fail-closed deployment

Correction and waitlist routes return `503` and explicitly state that information
was not retained when their receiver is absent or rejects delivery. They do not
fall back to application logs, email links, or a local filesystem queue. Hosted
environments require scoped server-only webhook URLs and bearer tokens.

## Remaining launch dependencies

- Select and configure the correction case-management receiver.
- Select and configure the confirmed-opt-in email/list receiver.
- Test confirmation, duplicate signup, expiration, unsubscribe, deletion,
  provider-limit, backup, and restore behavior against those real systems.
- Approve and publish the material-funder roster.
- Configure production uptime, source-health, error, and broken-link monitoring.

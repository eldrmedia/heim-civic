# Phase 9.7 — Source freshness and automation

Phase 9.7 adds deterministic monitoring and refresh orchestration without making
an automated system the editorial authority for civic facts.

## Operating model

The daily `source-health.yml` workflow evaluates repository snapshots and, when
the `PUBLIC_SITE_URL` repository variable is configured, the deployed
`/api/health` endpoint. It maintains one GitHub incident rather than opening a
new issue every day. Reports are retained for 14 days and must never contain
lookup addresses, request bodies, credentials, or precise coordinates.

The weekly `source-refresh.yml` workflow refreshes routine official sources and
opens a pull request. It never commits directly to `main`. Operators can trigger
officials, legislation, finance, or editorial-review groups manually. Set the
FEC API credential as the `FEC_API_KEY` GitHub Actions secret; the public demo
credential is not suitable for dependable operations.

The routine weekly job also rebuilds enhanced-review candidates and review
packets. Existing decision-ledger fingerprints are expected to fail until a
human accepts the refreshed evidence. The workflow therefore records test and
health failures but still opens the review pull request; protected-branch CI
prevents merge until the approval and promotion sequence restores the gate.

Legislation refreshes write a review candidate under `data/review/generated`
instead of overwriting the human-approved publication. An accountable reviewer
must compare that candidate, update the relevant decision ledger when warranted,
and run the established promotion or reconciliation command. Source health may
remain degraded while that review is pending; the workflow must report rather
than conceal that state.

## Review classes

- An unchanged official record is a successful verification and may be handled
  as routine provenance maintenance.
- Changed contacts, links, actions, totals, or other public facts require human
  pull-request review.
- Officeholder identity, vote, legal-status, coverage, limitation, or editorial
  changes require accountable review before publication.
- A schema failure, missing expected record, identity conflict, or inaccessible
  source blocks publication and retains the last-known-good snapshot.

AI assistance may explain a diff or prepare a review packet. It cannot invent a
field, approve an AI-assisted public summary, merge its own civic-data change,
or bypass an official source restriction.

## Required repository configuration

1. Set `PUBLIC_SITE_URL` as a GitHub Actions repository variable after the final
   HTTPS origin is approved.
2. Set `FEC_API_KEY` as an Actions secret.
3. Protect `main`, require CI, and require a human approval for refresh pull
   requests.
4. Assign primary and backup alert recipients in the private operations system.
5. Exercise degradation and recovery before recording the Phase 9.6 monitoring
   evidence item.

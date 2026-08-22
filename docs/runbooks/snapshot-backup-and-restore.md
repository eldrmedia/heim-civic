# Snapshot backup and restore runbook

## Current recovery boundary

The private alpha has no application database. Published boundary, officeholder,
legislation, and finance snapshots, source manifests, builders, and validation
tests are immutable files committed to Git. Correction cases and pending
waitlist requests are external-system responsibilities and are not backed up by
this repository.

## Off-site backup requirement

Before launch, mirror the private repository to an organization-controlled
off-site Git host with protected default branches, multi-factor authentication,
least-privilege access, and documented recovery contacts. Provider exports for
corrections and confirmed-opt-in contacts must use encrypted storage with a
separate retention schedule and access review.

## Restore exercise

Perform the exercise in a new temporary directory, never over the active
workspace or production deployment:

1. Clone the off-site mirror at the selected recovery commit.
2. Install the locked dependencies with `npm ci`.
3. Run `git fsck --full`, `git status --short`, and `npm run check`.
4. Run `npm run data:boundaries`, `npm run data:officials`,
   `npm run data:legislation`, and `npm run data:finance` only with approved
   network access and credentials. Review every checksum or schema change; do
   not automatically replace the last-known-good snapshot.
5. Run `npm run test:e2e` against a preview deployment restored from that commit.
6. Compare the district, official, bill, finance, source-status, sitemap, and
   health routes with the recovery commit's expected results.
7. Record the commit, operators, start/end time, failures, checksum review, and
   recovery decision in the private operations system.

## Success criteria

The clean clone builds without production personal data, all validation gates
pass, representative lookup remains transient, public record counts reconcile,
and a preview can be promoted without rewriting history. Provider backups are
not considered verified until a sanitized export is restored into an isolated
provider test environment and lifecycle controls still work.

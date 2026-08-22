# Incident-response runbook

## Scope

Use this process for availability failures, address or contact-data exposure,
unauthorized access, corrupted civic records, incorrect district or current-
officeholder results, compromised credentials, and failed source publication.

## Severity

- **Critical:** suspected address/contact exposure, credential compromise,
  unauthorized record change, or materially wrong district/current officeholder
  information shown broadly.
- **High:** a primary journey is unavailable, a required snapshot is stale, or a
  source import can no longer be validated.
- **Moderate:** a bounded record error, broken official link, or degraded
  non-primary feature with a safe workaround.

## Response

1. Acknowledge and assign an incident lead and timestamp.
2. Preserve minimal evidence. Never copy lookup bodies, correction text, emails,
   tokens, or raw access logs into tickets or chat.
3. Contain the issue: revoke credentials, disable the affected integration,
   stop publication, or serve the last-known-good snapshot as appropriate.
4. Validate district and officeholder facts against authoritative sources before
   republishing. Do not guess through an outage.
5. Notify affected providers and qualified counsel when legal, privacy, or
   contractual assessment is needed.
6. Publish a plain-language status note for a material public impact without
   exposing exploit details or personal data.
7. Recover from reviewed artifacts, verify checksums and representative routes,
   and obtain a second-person review for critical civic-record changes.
8. Complete a post-incident review with timeline, cause, impact, correction,
   prevention work, and an owner.

## Drills

Before public launch and twice annually, simulate one stale-source failure and
one application outage. Before paid launch, also simulate provider credential
revocation and account-data recovery. Record detection time, escalation time,
recovery time, gaps, and follow-up owners privately.

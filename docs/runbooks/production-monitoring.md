# Production monitoring runbook

## Ownership and escalation

Assign a primary and backup operator before launch. Both must receive alerts and
have access to the deployment dashboard, source refresh jobs, DNS, and approved
delivery providers. Record their names and escalation channels in the private
operations system, not in this public repository.

## Required probes

Configure an external service from at least one region to check:

1. `GET /` every five minutes for availability and expected Heim Civic text.
2. `GET /api/health` every 15 minutes; alert on non-200, invalid JSON, unexpected
   schema version, or a `degraded` status.
3. `GET /sitemap.xml` daily and sample every route class: home, search, district,
   official, bill, finance, trust, and correction pages.
4. `GET /.well-known/security.txt` daily; alert on non-200 or expiry within 30
   days.
5. Correction and waitlist synthetic transactions only in provider-approved test
   mode. Never submit production addresses or subscribe an unconsenting person.

Alert within one hour of an expected source refresh failure. Check official-link
health weekly with bounded concurrency, respectful request rates, redirects
enabled, and no copying of response bodies into logs.

## Data-safe telemetry

Allowed fields are route template, response class, duration, deployment version,
health-check state, and a random request identifier. Do not capture query values,
request bodies, exact lookup addresses, precise coordinates, correction text,
emails, authorization headers, cookies, bearer tokens, or raw network addresses.

Disable session replay, form-field capture, and DOM recording on address,
correction, and waitlist journeys. A vendor configuration review and a synthetic
privacy test are required before analytics or error telemetry is enabled.

## Source cadence

Run `npm run ops:source-health` on every build and at least daily. Refresh
officeholders daily after election or appointment events; bills and votes daily
during an active session; finance daily near filing deadlines; and boundaries
after an official change. The eight-day and 92-day health limits are outside-
active-period backstops, not permission to ignore known events.

## Verification record

Before launch, record probe URLs, alert recipients, test timestamps, simulated
failure results, and screenshots or exported configuration in the private
operations system. Do not store tokens or personal contact details in the
repository.

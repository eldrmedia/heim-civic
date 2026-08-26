# Production deployment rehearsal

This runbook covers the hosted rehearsal required before a public-pilot go/no-go
decision. It does not authorize DNS changes or public launch.

## 1. Create an isolated preview

1. Import the repository into the approved Vercel account without making the
   production domain public.
2. Keep Standard Deployment Protection enabled for previews and generated
   deployment URLs. Do not use a protected preview URL for crawler validation.
3. Confirm the Node version and `npm` lockfile are honored.
4. Configure preview-safe values separately from production. Never copy
   production contact submissions, tokens, or private launch evidence into a
   preview environment.
5. Run the complete CI gate against the exact commit being rehearsed.

Vercel's current Standard Protection covers previews and generated deployment
URLs while leaving the production domain public. Review the setting in the
project dashboard before every launch; do not assume an account default.

## 2. Configure the production environment

Set the variables documented in `.env.example` through the hosting provider's
encrypted production environment:

- `NEXT_PUBLIC_SITE_URL`
- `LOOKUP_RATE_LIMIT_SECRET`
- `SECURITY_CONTACT_EMAIL`
- correction receiver URL and token
- waitlist receiver URL and token
- `LAUNCH_EVIDENCE_FILE` only where a private evidence file is securely mounted

`DEPLOYMENT_CHECK_URL` is an operator-shell value for the smoke test and does
not need to be stored by the application. Keep all tokens server-only and scope
them to production. Verify that logs redact query values, form bodies,
authorization headers, cookies, network addresses, and exact lookup inputs.

## 3. Rehearse without indexing

Deploy the production configuration to a protected or noncanonical rehearsal
origin. Confirm preview pages return `noindex` and a disallow-all robots policy.
Exercise the manual keyboard, screen-reader, mobile, correction, waitlist,
monitoring, and restore runbooks. Do not attempt the production crawler check on
this origin because authentication and `noindex` are expected.

## 4. Verify the final production origin

After the approved HTTPS domain is attached but before outreach, run:

```bash
DEPLOYMENT_CHECK_URL=https://your-approved-domain.example \
  npm run ops:deployment-check
```

The command performs read-only, same-origin requests. It does not submit an
address, correction, waitlist contact, or synthetic subscriber. A `ready` report
confirms:

- canonical and indexable home metadata;
- transport, CSP, framing, MIME, referrer, and permissions headers;
- ready source health;
- robots rules that separate search indexing from model training;
- at least 1,300 unique same-origin sitemap entries;
- the machine-readable security contact; and
- the canonical current-official directory.

Record the successful report in the private operations system as the
`production-seo-verification` evidence item. Store only its opaque
`private-ops:` reference in the launch evidence file.

## 5. Make the go/no-go decision

Run `npm run ops:launch-readiness:production` in the final production
environment. Any failed or pending item is a no-go. Retain the report, deployment
identifier, alert exercise, restore evidence, manual accessibility results, and
reviewer decision privately. Never commit provider exports, screenshots,
operator identities, email addresses, or secrets.

## Security-policy limitation

The application uses a static CSP compatible with its statically generated
public pages and CDN caching. It permits Next.js inline bootstrap scripts and
inline styles but blocks external scripts, external connections, objects,
frames, and embedding. A nonce policy would force dynamic rendering; Next.js's
hash-based SRI alternative remains experimental. Reconsider strict CSP only
when the framework capability is stable or the product's risk model justifies
the caching and cost tradeoff.

References: [Next.js headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers),
[Next.js CSP guidance](https://nextjs.org/docs/app/guides/content-security-policy),
and [Vercel deployment protection](https://vercel.com/docs/deployment-protection).

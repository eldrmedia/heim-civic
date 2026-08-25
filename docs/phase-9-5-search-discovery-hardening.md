# Phase 9.5: search discovery hardening

Phase 9.5 implements the PRD's SEO and browser-support requirements and advances
FR-011 without provisioning a production domain, analytics vendor, webmaster
account, or deployment. The objective is accurate discovery at scale: one
durable local URL per public record, explicit coverage boundaries, crawler-safe
HTML, and automated evidence that the discovery surface matches the published
snapshots.

## Canonical public record model

- All 1,152 source-listed Nevada Assembly and Senate bill rows have local,
  statically generated record routes.
- The ordinary route format is `/bills/nv-83-2025-{identifier}`. Enhanced
  coverage is published at that same route, so editorial promotion never changes
  the canonical URL.
- NELIS includes 43 asterisk-marked source rows whose canonical identifiers
  collide with an unmarked row. Heim Civic does not interpret the marker. Those
  rows use `/bills/nv-83-2025-{identifier}-nelis-{billKey}` so all source records
  remain distinct and auditable.
- Index-only pages publish the official identifier, synopsis, long title,
  authoritative NELIS link, source retrieval metadata, and an explicit list of
  fields that have not completed enhanced review.
- District, official, bill, and finance record pages publish unique titles,
  descriptions, canonicals, and social metadata.

## Crawl and index policy

Indexing fails closed unless `NEXT_PUBLIC_SITE_URL` is a valid HTTPS origin.
Vercel preview and development environments remain non-indexable even if they
have HTTPS preview URLs. Their robots response blocks all crawlers and their page
metadata emits `noindex`.

At a configured public origin:

- public record pages are crawlable;
- `/api/` and onsite `/search` are excluded from crawling;
- onsite search results also emit `noindex,follow`;
- `OAI-SearchBot` may access the public discovery surface;
- `GPTBot` is blocked because model-training access is a separate product and
  governance decision from search eligibility;
- the sitemap includes canonical records only and excludes query URLs and APIs.

No `llms.txt`, special AI schema, hidden text, generated keyword pages, or
unsupported crawler directive is used.

## Structured meaning and internal discovery

- The root layout publishes `Organization` and `WebSite` JSON-LD without
  claiming government affiliation or legal nonprofit status.
- Current official profiles publish `ProfilePage` and `Person` data based only
  on visible, source-verified fields.
- Bill pages publish `Legislation` data and finance pages publish `Dataset` data.
- JSON-LD is serialized with `<` escaped to prevent source strings from becoming
  executable markup.
- Record templates include visible breadcrumbs plus `BreadcrumbList` JSON-LD.
- A complete current-official directory links to all 69 profiles.
- Officials link to their district pages when the office has a district;
  district pages link back to the current officeholder; enhanced bills link to
  reconciled sponsors and member votes.

## Sitemap contract

With the current approved snapshots, the configured public sitemap contains
1,306 unique URLs:

- 15 stable public directory and trust routes;
- 67 district pages;
- 69 current official profiles;
- 1,152 Nevada bill index pages;
- one enhanced federal bill page; and
- two federal finance pages.

Every sitemap entry has a source-derived `lastModified` value. The sitemap is
empty when a public HTTPS origin is not configured.

## Automated evidence

Repository tests enforce:

- all 1,152 bill routes are unique and reversible to a source record;
- every indexed bill appears in the sitemap;
- sitemap URLs are unique and contain no API or onsite-search route;
- every sitemap entry has a modification date;
- preview and local crawler policies fail closed;
- public search crawling and training crawling remain distinct; and
- reusable metadata produces absolute canonicals, including deployments below a
  URL path prefix.

The normal `npm run check` gate continues to cover formatting, linting, strict
types, unit and component tests, source health, and a production build.

## Production follow-up

Phase 9.5 does not prove search-engine inclusion or ranking. Before public
submission, the operator must still:

1. approve the final public name and HTTPS origin;
2. set and verify `NEXT_PUBLIC_SITE_URL`;
3. inspect rendered canonicals, robots, sitemap, JSON-LD, and social images at
   that origin;
4. run a privacy-reviewed production crawl and broken-link check;
5. verify the domain in search-engine webmaster tools and submit the sitemap;
6. monitor indexing, duplicate-canonical reports, crawl errors, and source-page
   performance; and
7. revisit training-crawler policy only through an explicit governance decision.

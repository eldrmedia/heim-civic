# Heim Civic Nevada

A nonpartisan, source-driven civic transparency product for Nevada residents. The current repository state includes the Phase 2 private-alpha district lookup with official Nevada boundaries and transient server-side geocoding.

## Requirements

- Node.js 20.9 or newer; Node 24 is used in CI.
- npm 11.

## Start locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Quality gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run audit
npm run build
npm run test:e2e
npm run data:boundaries
```

`npm run check` runs all non-browser gates in sequence.

## Structure

```text
src/
  app/          Next.js routes and metadata
  components/   Atomic Design component layers
  data/         Checked-in generated boundary artifact
  domain/       Framework-independent geography rules and types
  lib/          Framework-independent helpers
  server/       Server-only geocoding, lookup, and abuse controls
  styles/       Tailwind theme, base, BEM components, pages
  test/         Shared unit-test setup
tests/e2e/      Playwright journeys and automated accessibility scans
docs/           PRD, architecture, decisions, source inventory, policies
```

Read `AGENTS.md` before making changes. Exact representative-lookup addresses must never be persisted or used in analytics, logs, screenshots, or fixtures. Public institutional and synthetic fixtures are permitted for deterministic geographic tests.

## Boundary refresh

`npm run data:boundaries` downloads the three official Nevada LCB shapefiles, verifies their pinned SHA-256 checksums, normalizes them to RFC 7946 GeoJSON, validates expected district coverage, and updates the checked-in generated artifact. A checksum change is a review event, not an automatic update.

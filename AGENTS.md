# Heim Civic Nevada repository instructions

## Product rules

- Core civic facts remain free and receive equal treatment regardless of payment.
- Never create endorsements, ideology scores, overall politician scores, or partisan ranking.
- Never invent government endpoints, source fields, vote data, officeholders, or legal interpretations.
- Every material public record must retain source, retrieval, coverage, parser, normalization, and review metadata.
- AI-assisted public summaries require human editorial approval before publication.

## Privacy and security

- Never persist a representative-lookup address in application tables, analytics, logs, screenshots, or fixtures.
- Use public institutional addresses or purpose-built synthetic fixtures only.
- Keep secrets server-side. Variables prefixed with `NEXT_PUBLIC_` must never contain secrets.
- Apply least privilege, server-side authorization, rate limits, and log redaction to new integrations.

## Approved application stack

- Next.js App Router, React, and strict TypeScript.
- Tailwind CSS as the styling engine, with design tokens and component-level BEM classes.
- Radix Primitives for complex accessible behavior; Lucide for interface icons.
- Vitest and Testing Library for units/components; Playwright and axe for critical journeys.
- Supabase PostgreSQL/PostGIS is planned but must not be introduced before a reviewed schema decision.

## UI architecture

- Follow Atomic Design: `atoms`, `molecules`, `organisms`, `templates`, then route-level pages.
- Components use semantic BEM class names (`block`, `block__element`, `block--modifier`).
- Do not place long utility strings in JSX. Compose Tailwind utilities in the shared style layers.
- Use server components by default. Add `"use client"` only for genuine browser interaction.
- Maps and charts require complete textual equivalents. Color cannot be the only signal.
- Public journeys must meet WCAG 2.2 AA and work from 320 CSS pixels upward.

## Commands

- Install: `npm install`
- Develop: `npm run dev`
- Format: `npm run format`
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Unit/component tests: `npm test`
- End-to-end tests: `npm run test:e2e`
- Dependency audit: `npm run audit`
- Production build: `npm run build`
- Full local gate: `npm run check`

## Change expectations

- Tie feature work to a PRD requirement ID when applicable.
- Keep changes small and avoid unrelated refactoring.
- Add tests appropriate to the change and update documentation/provenance.
- Database changes require reviewed, reversible migrations and recovery guidance.
- Report tests run, tests not run, migrations, limitations, and operational follow-up.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

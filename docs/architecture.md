# Application architecture

## Status

Initial Phase 1 architecture for Heim Civic Nevada. Material changes should be recorded in `docs/decisions/`.

## Layers

1. **Routes:** Next.js App Router pages and route handlers.
2. **Templates:** Page composition without source-specific data access.
3. **Organisms:** Major interface sections such as navigation, lookup hero, and source panels.
4. **Molecules:** Small composed controls and record summaries.
5. **Atoms:** Brand, buttons, icons, labels, and other indivisible primitives.
6. **Domain:** Civic entities, validation, provenance, normalization, and policies.
7. **Adapters:** Isolated integrations for official government sources.

Dependencies point inward: adapters may translate external data into domain records, but domain code does not depend on source-specific response shapes.

## Rendering

- Prefer React server components and cached/static public pages where freshness permits.
- Use client components only for interaction such as address input, map controls, or dialogs.
- Never request government APIs directly from the browser.
- Import, normalize, validate, and cache official data before public rendering.

## Styling

- Tailwind CSS provides build-time utilities and theme tokens.
- JSX receives short semantic BEM classes rather than long utility lists.
- Styles are split into token, base, component, and page layers.
- BEM modifiers represent durable states or variants, not incidental DOM structure.

## Component library

- Radix Primitives provide accessible behavior for complex controls.
- Local atoms and molecules wrap primitives so product styling and API conventions remain stable.
- Lucide icons are decorative by default and receive accessible labels when they convey meaning.

## Privacy boundary

Address lookup is a transient pipeline:

`request -> validated server handler -> redacted geocoder request -> coordinate -> spatial district lookup -> response`

The exact address must not cross into persistence, analytics, screenshots, fixtures, or ordinary application logs.

## Planned data boundary

Supabase PostgreSQL/PostGIS remains the planned durable store. Schema work begins only after the source-discovery inventory and a provenance-focused schema decision are reviewed.

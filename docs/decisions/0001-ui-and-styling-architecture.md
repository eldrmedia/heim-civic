# ADR 0001: UI and styling architecture

- **Status:** Accepted
- **Date:** 2026-08-22

## Decision

Use Atomic Design for component ownership, BEM for semantic class naming, Tailwind CSS for generated utilities and design tokens, and Radix Primitives for complex accessible behavior.

Tailwind utility combinations are composed in shared CSS layers. JSX should normally contain one BEM block or element class plus an optional modifier, not long inline utility lists.

## Rationale

- Atomic Design makes component responsibilities and reuse explicit.
- BEM keeps rendered markup understandable and reduces styling ambiguity.
- Tailwind supplies a constrained token and utility system without runtime styling cost.
- Radix avoids rebuilding difficult focus, keyboard, and ARIA behavior.

## Consequences

- New styles require a semantic component class rather than arbitrary one-off markup utilities.
- Product components wrap third-party primitives to avoid leaking library-specific APIs throughout the application.
- A small amount of global component CSS is intentional and must remain organized by block.

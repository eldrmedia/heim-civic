# Nevada Commons design system

## Brand position

Nevada warmth on the surface; rigorous civic data underneath. The interface should feel local and welcoming without resembling tourism, campaign, or government-seal branding.

## Foundations

| Token       | Value     | Purpose                              |
| ----------- | --------- | ------------------------------------ |
| Desert 50   | `#fffdf8` | Primary page background              |
| Desert 100  | `#f7eddc` | Warm section background              |
| Juniper 700 | `#0f513f` | Primary identity and headings        |
| Clay 500    | `#c9673f` | Primary action and emphasis          |
| Sage 400    | `#88a184` | Map layers and secondary information |
| Slate 900   | `#14272d` | Primary text                         |

Red and blue are not paired as partisan signals. Color is never the sole carrier of a vote, status, party, or district distinction.

## Type

- Interface: Avenir Next with Segoe UI fallback.
- Editorial headings: Georgia with Times New Roman fallback.
- Body copy targets comfortable line lengths and a minimum 1.5 line height.

System fonts avoid font-network requests, reduce layout shift, and keep the pilot inexpensive.

## Component ownership

- **Atoms:** Button, brand lockup, icon, label, badge.
- **Molecules:** Address lookup, source badge, representative summary, map legend.
- **Organisms:** Header, lookup hero, district results, representative grid, source panel.
- **Templates:** Stable page composition and landmarks.
- **Pages:** Route metadata, data loading, and template selection.

Phase 3 implements the representative summary molecule, representative-results organism, party label atom, and official-profile template. Party is always written in text; neutral brand color does not imply partisan meaning. Vacancy cards use explicit status language and do not reserve a portrait-shaped empty state.

## Styling rules

1. JSX uses semantic BEM classes.
2. Tailwind utilities are composed in the style layers.
3. Modifiers express durable variants such as `button--secondary`.
4. Avoid one-off utility strings and arbitrary values in JSX.
5. A complex interactive primitive is wrapped locally before wider use.
6. Every public component supports keyboard focus, zoom, reduced motion, and high-contrast text.

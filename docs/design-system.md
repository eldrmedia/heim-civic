# Nevada Commons design system

## Brand position

Nevada warmth on the surface; rigorous civic data underneath. The interface should feel local and welcoming without resembling tourism, campaign, or government-seal branding.

## Foundations

| Token       | Value     | Purpose                              |
| ----------- | --------- | ------------------------------------ |
| Desert 50   | `#fffdf8` | Primary page background              |
| Desert 100  | `#f7eddc` | Warm section background              |
| Juniper 700 | `#0f513f` | Primary identity and headings        |
| Clay 500    | `#c9673f` | Decorative emphasis                  |
| Clay 600    | `#a94f30` | Accessible primary action            |
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

District results use one full-width statewide map that layers the selected congressional, Nevada Senate, and Nevada Assembly districts in their true positions. The map omits the precise lookup point and retains a complete textual equivalent.

- **Templates:** Stable page composition and landmarks.
- **Pages:** Route metadata, data loading, and template selection.

Phase 3 implements the representative summary molecule, representative-results organism, party label atom, and official-profile template. Phase 4 adds the bill-card molecule and bill-page template. Phase 5 adds the finance-overview molecule and finance-page template. Phase 6 adds search-result and correction-form organisms. Phase 7 adds the district-boundary-map molecule and district-page template. Party, vote, finance, and map values are always written in text; neutral brand color does not imply partisan meaning. Finance categories use accessible tables rather than color-only charts.

## Styling rules

1. JSX uses semantic BEM classes.
2. Tailwind utilities are composed in the style layers.
3. Modifiers express durable variants such as `button--secondary`.
4. Avoid one-off utility strings and arbitrary values in JSX.
5. A complex interactive primitive is wrapped locally before wider use.
6. Every public component supports keyboard focus, zoom, reduced motion, and high-contrast text.

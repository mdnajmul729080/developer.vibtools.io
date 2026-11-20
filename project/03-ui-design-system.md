# 03. UI Design System

## Visual direction

Use the precision and compactness associated with Linear, Stripe Docs, and Raycast as inspiration: sharp, developer-first, calm, high-information density, and zero visual clutter. Do not copy their branding. Avoid oversized hero sections, ornamental cards, gradients, bokeh, excessive padding, or decorative graphics. Documentation is the product.

## Color and surface tokens

Dark mode is the default. Define tokens once as CSS custom properties and map Tailwind v4 theme values to them.

| Token                  | Dark mode | Light mode |
| ---------------------- | --------- | ---------- |
| Canvas                 | `#09090B` | `#FFFFFF`  |
| Elevated surface/cards | `#111113` | `#FAFAFA`  |
| Subtle hover           | `#18181B` | `#F4F4F5`  |
| Hairline border        | `#27272A` | `#E4E4E7`  |
| Primary text           | `#FAFAFA` | `#09090B`  |
| Muted text             | `#A1A1AA` | `#52525B`  |

Borders are 1px. Cards and controls stay sharp, with small radii no greater than 8px. Do not nest cards. Hover and active states use subtle surface changes rather than large saturated fills. Maintain WCAG AA contrast and visible focus indicators in both themes.

Inject `--accent-color` dynamically per product route from `manifest.json`; use `site.config.json` `defaultAccent` on the Hub and as the fallback. The accent comes from validated project configuration, not category mapping. Use it sparingly for active route, links, focus, and small identity details. Ensure the monogram badge uses the first product-name letter with the same product accent.

## Typography and density

- Sans: Inter or a system geometric sans stack. Compact body copy is 14px-15px with line-height 1.6.
- Mono: JetBrains Mono. Use 13px for code blocks, version pills, and keyboard shortcut badges.
- Topbar height: 52px (`h-13`).
- Left sidebar width: 240px.
- Right TOC width: 200px.
- Center reading column: `max-w-[740px]`.
- Keep labels, cards, and controls compact but legible. Reserve long-form line length for the reading column. Dimensions must remain stable when labels wrap or state changes.

## Shared interaction rules

The topbar is sticky with a 1px lower border. Use semantic landmarks, skip navigation, descriptive accessible names, keyboard-operable menus and tabs, visible focus, and Escape dismissal for overlays. Provide tooltips and accessible names for unfamiliar icon-only controls. Respect `prefers-reduced-motion`; keep transitions short and purposeful. Sticky elements must not cover focused headings or anchors. On small screens, retain search and the primary CTA while moving secondary navigation into accessible controls.

## View 1: Main Hub Portal (`/`)

- Show brand identity, global search trigger, configured external links, and theme toggle in the compact sticky topbar.
- Keep the Hub Hero compact (`py-5 sm:py-6`): concise title + 1-line subtitle + command-style `[data-search-trigger]` search bar (`Search {totalPages} docs across {projects.length} projects... Ctrl K`) on the left, paired with a compact 3-row `Developer Endpoints` hairline card (`/llms.txt`, `/llms-full.txt`, `vibtools-docs.schema.json` + tabular repo/page counts) on the right so all project cards stay visible above the fold without favoring a single project.
- Derive categories from manifest. Show `[ All ]` and category tabs only when there are at least two unique categories. Hide filter tabs completely when there is one or fewer.
- Use a compact responsive grid of product cards, not page-section cards. A card contains logo or geometric monogram, title, version pill, two-line description, category tag, and “Read Docs” action.
- Filtering is instant and keyboard/touch accessible; include an intentional empty state. Keep card geometry stable and prevent text overlap.

```text
+-----------------------------------------------------------------------------+
| [Brand Logo] Vib Tools / Docs  [Search documentation... Ctrl K] [Links] ☀/☾ |
+-----------------------------------------------------------------------------+
|  Vib Tools Developer Hub             +------------------------------------+ |
|  SDKs, engines, infra, API refs.     | Developer Endpoints  5 repos · 129 | |
|                                      | /llms.txt               AI index ↗ | |
|  [🔍 Search 129 docs...     Ctrl K]  | /llms-full.txt         Full docs ↗ | |
|                                      | vibtools-docs.schema... .vibtools ↗| |
+--------------------------------------+------------------------------------+ |
|  Documentation                                                   5 projects |
|  [ All ]  [ Documentation Engines ]  [ Core Infrastructure ]  ...           |
|                                                                             |
|  +----------------------------------+  +----------------------------------+ |
|  | [Logo] DocScaffold        v1.0.0 |  | [Logo] SocketCore         v1.0.0 | |
|  | Static multi-product docs engine |  | Developer reference for the      | |
|  | with .vibtools/ auto-discovery.  |  | SocketCore WebSocket engine.     | |
|  |                                  |  |                                  | |
|  | Documentation Engines  Read Docs->| | Core Infrastructure  Read Docs -> | |
|  +----------------------------------+  +----------------------------------+ |
+-----------------------------------------------------------------------------+
```

## View 2: Product Docs Reader (`/[product]/[...slug]`)

- Header: `← Hub`, product logo/name, product switcher dropdown, scoped `Ctrl+K` search trigger, configured dynamic CTA, theme toggle.
- Left column: collapsible 240px recursive sidebar with active route in product accent, stable group ordering, and current page visible to assistive technology.
- Center: `max-w-[740px]`; breadcrumbs, article title, compact metadata, expressive syntax-highlighted code, custom `Note`/`Tip`/`Warning`/`Danger` callouts, Edit this page on Git, and Previous/Next cards.
- Code blocks support one-click copy, filename headers, and diff highlighting.
- Right column: sticky 200px “On This Page” TOC with active-heading scroll spy.
- At narrow widths, article becomes full-width and sidebar/TOC become accessible overlays or disclosures. Prevent horizontal overflow; preserve keyboard focus and Escape dismissal.

```text
+-----------------------------------------------------------------------------+
| [← All] | [Logo] Invio [▾]        [Search Invio... Ctrl+K] [Get License] ☀/☾|
+--------------------+-----------------------------------+--------------------+
| LEFT SIDEBAR 240px | CENTER CONTENT (max-w: 740px)     | RIGHT TOC 200px    |
|                    |                                   |                    |
| Getting Started    | Docs / Getting Started / Setup    | ON THIS PAGE       |
|  • Introduction    |                                   |  • Prerequisites   |
|  ▌ Installation    | Installation Guide                |  • Quick Install   |
|  • Configuration   | --------------------------------- |  • Verify License  |
|                    | Compact, crisp prose with clean   |                    |
| Guides             | typography and zero clutter.      |                    |
|  • SMTP Providers  | +-------------------------------+ |                    |
|  • Invoice PDF     | | ./invio --init-config         | |                    |
|                    | +-------------------------------+ |                    |
|                    |                                   |                    |
|                    | [Edit on Git]  [< Prev]  [Next >] |                    |
+--------------------+-----------------------------------+--------------------+
```

## Release acceptance

For each portal release, verify both themes, mobile/tablet/desktop layouts, long names and descriptions, missing logos, keyboard-only navigation, focus/contrast, reduced motion, search modal states, code overflow, and TOC scroll behavior. The UI must remain useful when client-side enhancements fail; static article links and content remain accessible. Run `npm run verify` before deployment.

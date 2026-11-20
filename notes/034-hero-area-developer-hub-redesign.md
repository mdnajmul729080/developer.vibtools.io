# 034 — Developer Hub Hero Redesign (Compact Command-Bar + AI/Schema Endpoints)

**Date:** `2026-11-19`
**Goal:** Redesign the Hub hero section in `src/pages/index.astro` to be compact, unbiased across all synced developer repositories, and immediately useful for developers and AI tooling.

---

## 1. Inspected Files

- `src/pages/index.astro`
- `src/layouts/HubLayout.astro`
- `src/components/hub/ProjectCard.astro`
- `src/components/hub/CategoryTabs.astro`
- `src/styles/global.css`
- `project/03-ui-design-system.md`

---

## 2. Implementation Plan

1. Replace the `Browse {primaryProject.title}` + `Quick Guides` hero layout in `src/pages/index.astro` with a tighter `py-5 sm:py-6` split grid:
   - **Left column:** Compact `<h1>` title (`portalTitle`), concise subtitle (`portalSubtitle`), and a full-comfort command-style `[data-search-trigger]` search bar dynamically summarizing synced projects and total documentation pages (`Search {totalPages} docs across {projectCount} projects... Ctrl K`).
   - **Right column:** Compact `Developer Endpoints` hairline card showing real tabular totals (`{projects.length} repos · {totalPages} pages`) and 3 direct endpoint links (`/llms.txt`, `/llms-full.txt`, `/schemas/vibtools-docs.schema.json`).
2. Keep existing design system tokens (`--bg-canvas`, `--bg-surface`, `--bg-hover`, `--border-hairline`, `--text-primary`, `--text-muted`, `--accent-color`), zero box shadows, zero pills, and accessible focus rings.
3. Verify with `npm test`, `npm run verify`, `compile_applet`, `lint_applet`, `restart_dev_server`, and live `playwright-cli` browser captures in Desktop (`1440x900`, light + dark) and Mobile (`390x844`).
4. Update `project/03-ui-design-system.md`, `project/04-codebase-reference.md`, and `project/CHANGELOG.md`.

---

## 3. Completed Work & Verification

- Updated `src/pages/index.astro` with the compact Command-Bar Hero (`Search {totalPages} docs across {projects.length} projects... Ctrl K`) and the `Developer Endpoints` box (`/llms.txt`, `/llms-full.txt`, `vibtools-docs.schema.json`, tabular `5 repos · 129 pages` count).
- Verified `npm test` (`17/17` pass), `npm run verify` (`131` HTML pages, `16` required assets, `5` projects, `0` broken internal links), `compile_applet`, `lint_applet`.
- Visually verified rendered captures in `playwright-cli` across `1440x900` dark mode, `1440x900` light mode, `390x844` mobile (`scrollWidth <= innerWidth: true`), search modal open/Escape restore, and category filtering with `0` console errors/warnings.


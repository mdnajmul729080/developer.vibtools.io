# 033 — Forensic Audit of `github.com/vibtoolshq` Public Repositories & Developer Portal Onboarding

**Date:** `2026-11-19`
**Goal:** Perform a forensic audit of all public repositories in `https://github.com/vibtoolshq/` (excluding `vib-docs-engine`, which will be kept private), verify which repositories have `.vibtools/docs.config.json` and `docs/` configured, register them in `config/projects.json` (and `config/presets/dev-portal/projects.json`), sync all documentation, and verify all routes, links, and assets.

---

## 1. Inspected Repositories & Files

- **GitHub Organization (`https://github.com/vibtoolshq/`):**
  1. `https://github.com/vibtoolshq/docscaffold.git` — **HAS `.vibtools/docs.config.json`** (`docsType: "developer"`, `slug: "docscaffold"`, `title: "DocScaffold"`, `category: "Documentation Engines"`, `version: "v1.0.0"`, `accentColor: "#7C3AED"`, `docsPath: "docs"`, `ctaLabel: "View source"`, `ctaUrl: "https://github.com/vibtoolshq/docscaffold"`).
  2. `https://github.com/vibtoolshq/SocketCore.git` — **HAS `.vibtools/docs.config.json`** (`docsType: "developer"`, `slug: "socketcore"`, `title: "SocketCore"`, `category: "Core Infrastructure"`, `version: "1.0.0"`, `accentColor: "#0EA5E9"`, `docsPath: "docs"`, `logoPath: ".vibtools/logo.svg"`, `ctaLabel: "View source"`, `ctaUrl: "https://github.com/vibtoolshq/SocketCore"`).
  3. `https://github.com/vibtoolshq/VPS-MCP.git` — **HAS `.vibtools/docs.config.json`** (`docsType: "developer"`, `slug: "vps-mcp"`, `title: "VPS-MCP"`, `category: "Core Infrastructure"`, `version: "0.4.0"`, `accentColor: "#2563EB"`, `docsPath: "docs"`, `logoPath: ".vibtools/logo.png"`, `ctaLabel: "View repository"`, `ctaUrl: "https://github.com/vibtoolshq/VPS-MCP"`).
  4. `https://github.com/vibtoolshq/KronOTP.git` — **HAS `.vibtools/docs.config.json`** (`docsType: "developer"`, `slug: "kronotp"`, `title: "KronOTP"`, `category: "Core Engine"`, `version: "2.0.0"`, `accentColor: "#2563EB"`, `docsPath: "docs"`, `ctaLabel: "GitHub"`, `ctaUrl: "https://github.com/vibtoolshq/KronOTP"`).
  5. `https://github.com/vibtoolshq/UpdatePilot.git` — **HAS `.vibtools/docs.config.json`** (`docsType: "developer"`, `slug: "updatepilot"`, `title: "UpdatePilot"`, `category: "Developer Tools"`, `version: "0.0.1"`, `accentColor: "#2563EB"`, `docsPath: "docs"`, `logoPath: ".vibtools/logo.png"`, `ctaLabel: "GitHub"`, `ctaUrl: "https://github.com/vibtoolshq/UpdatePilot"`).
  6. `https://github.com/vibtoolshq/LicenX.git` — **MISSING `.vibtools/docs.config.json`** on `main` (HTTP `404`), though `docs/dev/` and `docs/users/` exist.
  7. `https://github.com/vibtoolshq/ReadBox.git` — **MISSING `.vibtools/docs.config.json`** and `docs/index.md` on `main` (HTTP `404`).
  8. `https://github.com/vibtoolshq/.github.git` — Organization profile repository (`profile/README.md`), not a documentation product.
  9. `https://github.com/vibtoolshq/vib-docs-engine.git` — Excluded per user instruction (being moved to private; replaced publicly by `docscaffold`).
- **Local Files Inspected:**
  - `config/projects.json`
  - `config/presets/dev-portal/projects.json`
  - `scripts/sync-docs.mjs`
  - `scripts/verify-build.mjs`
  - `astro.config.mjs`

---

## 2. Implementation Plan

1. Update `config/projects.json` and `config/presets/dev-portal/projects.json` to remove `https://github.com/vibtoolshq/vib-docs-engine.git` and register the 5 `.vibtools/`-enabled public repositories:
   - `"https://github.com/vibtoolshq/docscaffold.git"`
   - `"https://github.com/vibtoolshq/SocketCore.git"`
   - `"https://github.com/vibtoolshq/VPS-MCP.git"`
   - `"https://github.com/vibtoolshq/KronOTP.git"`
   - `"https://github.com/vibtoolshq/UpdatePilot.git"`
2. Run `npm run sync` and `npm run verify` to test sparse checkout, `.vibtools/` resolution, Markdown/MDX route compilation, internal link rewriting, and Pagefind indexing across all 5 projects.
3. Align `cleanSegment` and relative `..` path resolution in `astro.config.mjs` (`rewriteInternalMarkdownLinks`) with `src/utils/sidebar.ts` (normalizing underscores/non-alphanumeric characters to `-`, clamping `..` within the product slug, and treating `README.md` identically to `index.md`), and clear stale `node_modules/.astro/data-store.json` / `.astro/data-store.json` cache at the end of `scripts/sync-docs.mjs`.
4. Update `project/04-codebase-reference.md` and `project/CHANGELOG.md`.

---

## 3. Completed Work & Verification

- **Synced Projects (`src/generated/manifest.json`):**
  - `docscaffold` (`DocScaffold`, `Documentation Engines`, `v1.0.0`, `5` pages, `/logos/docscaffold.svg`)
  - `socketcore` (`SocketCore`, `Core Infrastructure`, `1.0.0`, `34` pages, `/logos/socketcore.svg`)
  - `vps-mcp` (`VPS-MCP`, `Core Infrastructure`, `0.4.0`, `55` pages, `/logos/vps-mcp.png`)
  - `kronotp` (`KronOTP`, `Core Engine`, `2.0.0`, `14` pages, monogram fallback)
  - `updatepilot` (`UpdatePilot`, `Developer Tools`, `0.0.1`, `21` pages, `/logos/updatepilot.png`)
- **Fixes Applied During Build Verification:**
  - Updated `astro.config.mjs` (`cleanSegment` & `rewriteInternalMarkdownLinks`) to normalize `_` / punctuation to `-` matching `src/utils/sidebar.ts`, clamp `..` traversal within `{productSlug}`, and map relative `README.md` links to directory index routes.
  - Updated `scripts/sync-docs.mjs` to remove stale Astro Content Layer caches (`node_modules/.astro/data-store.json`, `.astro/data-store.json`) after writing synced content and `src/generated/manifest.json`.
- **Verification:** `Build verification passed: 131 HTML files, 16 required assets, 5 projects, and no broken internal links.` (`129` Pagefind indexed doc pages, `6223` words).


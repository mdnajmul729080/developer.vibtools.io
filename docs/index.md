---
title: Vib Docs Engine
description: A static multi-product developer documentation engine with zero-touch .vibtools/ auto-discovery and AI-readable documentation endpoints.
version: "1.0.0"
---

# Vib Docs Engine — Developer Portal & AI Agent Guide

`vib-docs-engine` powers **`https://developer.vibtools.io`** (`Vib Tools Developer Hub`, configured with `portalType: "developer"`), our static multi-repository developer documentation portal for open-source engines, SDKs, APIs, CLI tools, and self-hosted infrastructure. During a build, the engine inspects each registered repository's `.vibtools/docs.config.json` (or `.vibtools/config.docs.json`) via 2-step Git sparse checkout, verifies that the repository declares developer documentation (`"docsType": "developer"` or `"docsType": "dev"`, or a `targets.developer` block), validates and normalizes Markdown/MDX documentation from the configured `docsPath`, generates the portal manifest and sidebar tree, builds Astro static HTML + raw `.md` + `llms.txt` routes, and indexes all articles with Pagefind.

---

## 1. AI Agent & Automated Repository Setup Quick-Start

If you are an **AI coding agent** (or developer) asked to configure `.vibtools/` and `docs/` inside a developer repository so it syncs with **`https://developer.vibtools.io`**, read these machine-readable resources first:

| Resource | Path | Format & Purpose |
| :--- | :--- | :--- |
| **JSON Schema (Canonical)** | `/schemas/vibtools-docs.schema.json` | Draft 2020-12 JSON Schema for `.vibtools/docs.config.json` & `.vibtools/config.docs.json` (`https://developer.vibtools.io/schemas/vibtools-docs.schema.json`) |
| **`.vibtools/` & `docs/` Full Spec (HTML)** | `/vib-docs-engine/vibtools-config/` | Complete human & AI specification for `.vibtools/` and `docs/` authoring |
| **`.vibtools/` & `docs/` Full Spec (Raw Markdown)** | `/vib-docs-engine/vibtools-config.md` | Raw YAML-free Markdown of the complete `.vibtools/` + `docs/` specification |
| **Adding Projects Guide (Raw Markdown)** | `/vib-docs-engine/adding-projects.md` | Repository registration (`config/projects.json`) & webhook setup |
| **Deployment Guide (Raw Markdown)** | `/vib-docs-engine/deployment.md` | Developer portal Cloudflare Pages & Docker/Nginx deployment |
| **Product AI Bundle (`vib-docs-engine`)** | `/vib-docs-engine/llms.txt` | Complete concatenated Markdown for all `vib-docs-engine` guides in one request |
| **Portal AI Directory** | `/llms.txt` | High-level index of all developer projects, pages, raw `.md` URLs, and schema link on this portal |
| **Full Portal AI Corpus** | `/llms-full.txt` | Complete Markdown corpus of every developer project and page hosted on this portal |

### 3-Step Checklist for AI Agents Configuring a Developer Repository

When asked to set up `.vibtools/` and `docs/` in a target repository for `https://developer.vibtools.io`:

1. **Create `.vibtools/docs.config.json` in the repository root:**
   - Include `"$schema": "https://developer.vibtools.io/schemas/vibtools-docs.schema.json"` and `"schemaVersion": 1`.
   - Set `"docsType": "developer"` (or `"docsType": "dev"`):
     - **`"developer"` / `"dev"`** -> required for **`https://developer.vibtools.io`** (`portalType: "developer"`).
     - Any repository with `"docsType": "users"` or without a developer `docsType` / `targets.developer` block is automatically rejected and skipped by the developer portal sync engine.
   - Add an optional brand icon at `.vibtools/logo.svg` or `.vibtools/logo.png` (under `2 MB`, static SVG only) and reference it via `"logoPath": ".vibtools/logo.svg"`.
   - Set `"ctaLabel": "View repository"` (or `"GitHub"`) and `"ctaUrl": "https://github.com/vibtoolshq/<repo>"`.
2. **Prepare the `docs/` directory (or `targets.developer.docsPath`):**
   - Every configured `docsPath` **must** contain a root `index.md` (or `README.md`, which the sync engine automatically normalizes to `index.md`).
   - Include clean YAML frontmatter (`title`, `description`, `version`, optional `order`, `draft`) at the top of `index.md`, or rely on Smart Markdown extraction (`# H1` title + first summary paragraph).
   - Never keep duplicate `index.md` and `README.md` with conflicting content in the same folder (`index.md` wins and `README.md` is discarded).
   - Any governance `MANIFEST.md` files inside `docs/` are automatically stripped during sync so they never become public documentation pages (spell it `MANIFEST.md`, never `MINIFEST.md`).
3. **Host Open-Source & Developer Repositories Under `github.com/vibtoolshq`:**
   - **`https://github.com/vibtoolshq/<repo>`**: Public open-source engines, SDKs, CLI tools, and developer infrastructure repositories. Add `.vibtools/docs.config.json` with `"docsType": "developer"` (or `"docsType": "dev"`) directly inside the repository root alongside `docs/`.

Read the full field-by-field contract and copy-paste templates in [`.vibtools/` Configuration](vibtools-config.md).

---

## 2. Prerequisites for the Implemented Engine

- Node.js `>=22.23.4` (pinned to official `22.23.5` in `.node-version` and `.nvmrc`) and npm.
- Git with sparse-checkout support (Git 2.25 or newer).
- Network access to the configured source repositories; credentials (`GIT_TOKEN` / `secretKey`) only when private developer repositories require them. Public repositories under `https://github.com/vibtoolshq` require zero credentials.

---

## 3. Local Workflow

1. Install dependencies using `npm install` (or `npm ci` from `package-lock.json` in CI).
2. Set `GIT_TOKEN` in the process environment or deployment secret store only when private HTTPS repositories require it. Never commit credentials or put them in public build variables.
3. Run `npm run sync` to synchronize developer docs and regenerate `src/generated/manifest.json`.
4. Run `npm run dev` to sync automatically, then start Astro's development server on `0.0.0.0:3000`.
5. Run `npm run build` to sync, build Astro, and run Pagefind. Run `npm run verify` to execute the full post-build verifier (`scripts/verify-build.mjs`). `npm run preview` previews an existing Astro build on `0.0.0.0:3000`.

The `predev` and `prebuild` lifecycle hooks run the sync script automatically. When syncing the engine's own `vib-docs-engine` record without remote Git credentials, `scripts/sync-docs.mjs` reads the local `.vibtools/docs.config.json` and `docs/` directory. `localPath` can also temporarily target a local folder (for example `./docs`) for an isolated sync test; keep it out of production config. Generated content and manifests are ignored build inputs and must not be hand-edited.

Press `Ctrl+K` (or `Cmd+K` on macOS) anywhere to open search. On a project page, search starts scoped to that project; switch to “All Docs” for portal-wide results. Hub searches are global.

Static AI indexes are available at `/llms.txt`, `/llms-full.txt`, `/<product-slug>/llms.txt`, and per-page `/<product-slug>/<page>.md`. The `.vibtools/` JSON Schema is served at `/schemas/vibtools-docs.schema.json`. `robots.txt` allows crawlers and points to `/sitemap-index.xml`. Unknown paths use the compact static 404 page.

---

## 4. Configuration Overview

- `config/site.config.json` configures the developer portal (`"portalTitle": "Vib Tools Developer Hub"`, `"domain": "https://developer.vibtools.io"`, `"defaultAccent": "#2563EB"`, `"portalType": "developer"`, and navigation links).
- `config/projects.json` accepts bare Git repository URLs (`"https://github.com/vibtoolshq/..."`) for developer repositories that include `.vibtools/docs.config.json` (or `.vibtools/config.docs.json`), or override objects with explicit fields and private-repo `secretKey` references.
- `.vibtools/docs.config.json` (alias `.vibtools/config.docs.json`) lets each developer repository declare its own `$schema`, `schemaVersion`, `docsType` (`"developer"` or `"dev"`), `docsPath`, `logoPath`, `slug`, `category`, `title`, `description`, `version`, `accentColor`, `branch`, and repository CTA metadata in one place.
- Categories are derived dynamically from resolved developer projects. Adding a category does not require code changes.

Synchronized files under `src/content/docs/`, generated data under `src/generated/`, and synchronized logos under `public/logos/` are build artifacts and are ignored by Git. Do not edit generated files by hand.

---

## 5. Deployment

Configure the host to build from `https://github.com/vibtoolshq/vib-docs-engine` attached to **`https://developer.vibtools.io`**. A developer repository webhook should trigger the host's protected build hook; the build fetches `.vibtools/` first, verifies `"docsType": "developer"` (or `"dev"`), checks out only the matching documentation directories with 2-step Git sparse checkout, and publishes a complete static output. For Cloudflare Pages, set the build command to `npm run build`, the output directory to `dist`, and use a protected Pages build hook. For a self-hosted VPS, build the Docker image and have Nginx serve only the resulting static files.

See [`.vibtools/` Configuration](vibtools-config.md) for the complete `.vibtools/` and `docs/` specification, [Adding Projects](adding-projects.md) for CLI and webhook steps, [Go-Live Deployment](deployment.md) for Cloudflare Pages and Docker hosting, and [Portal User Guide](portal-user-guide.md) for reader navigation.

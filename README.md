# Vib Docs Engine (`vib-docs-engine`) — `developer.vibtools.io`

> **Config-Driven Multi-Repository Static Developer Documentation Engine with Two-Step Git Sparse Checkout, `.vibtools/` Auto-Discovery, Pagefind Search, and AI/LLM Native Endpoints.**

**Vib Docs Engine (`vib-docs-engine`)** powers **[Vib Tools Developer Hub (`https://developer.vibtools.io/`)](https://developer.vibtools.io/)**, the official multi-repository developer documentation portal built by **[Vib Tools](https://vib.tools/)**. Powered by **Astro 7**, **Tailwind CSS v4**, **Expressive Code**, and **Pagefind**, it turns Markdown (`.md`) and MDX (`.mdx`) files across multiple GitHub, GitLab, Gitea, and Forgejo developer repositories into a fast, searchable, SEO-ready, and AI-readable developer documentation portal—without duplicating source code or writing project-specific UI templates.

During a build, the engine inspects each registered repository's `.vibtools/docs.config.json` (or `.vibtools/config.docs.json`) using **two-step Git sparse checkout**, enforces developer-only portal filtering (`"portalType": "developer"` accepts only `"docsType": "developer"` or `"docsType": "dev"`, or a `targets.developer` block, and rejects any user documentation), validates and normalizes documentation and brand logos, builds a deterministic sidebar and pagination tree, prerenders static HTML + raw `.md` + `llms.txt` endpoints, and generates a local Pagefind full-text search index.

- **Official Website:** [https://vib.tools/](https://vib.tools/)
- **Developer Documentation Portal (`portalType: "developer"`):** [https://developer.vibtools.io/](https://developer.vibtools.io/)
- **Live `.vibtools/` JSON Schema (Draft 2020-12):** [https://developer.vibtools.io/schemas/vibtools-docs.schema.json](https://developer.vibtools.io/schemas/vibtools-docs.schema.json)
- **Live AI & LLM Corpus:** [`/llms.txt`](https://developer.vibtools.io/llms.txt) · [`/llms-full.txt`](https://developer.vibtools.io/llms-full.txt) · [`/vib-docs-engine/llms.txt`](https://developer.vibtools.io/vib-docs-engine/llms.txt)
- **GitHub Organization (Open-Source & Developer Projects):** [@vibtoolshq](https://github.com/vibtoolshq)

---

## Table of Contents

1. [Why Vib Docs Engine](#1-why-vib-docs-engine)
2. [Complete A–Z Feature Reference](#2-complete-az-feature-reference)
3. [Developer-Only Portal Architecture (`developer.vibtools.io`)](#3-developer-only-portal-architecture-developervibtoolsio)
4. [System Architecture & Build Pipeline](#4-system-architecture--build-pipeline)
5. [Quick Start & Local Workflow](#5-quick-start--local-workflow)
6. [`.vibtools/` Zero-Touch Repository Configuration](#6-vibtools-zero-touch-repository-configuration)
7. [Registering Developer Projects (`config/projects.json` & CLI)](#7-registering-developer-projects-configprojectsjson--cli)
8. [`docs/` Authoring Rules, Frontmatter & MDX Components](#8-docs-authoring-rules-frontmatter--mdx-components)
9. [AI-Readable Endpoints, JSON Schema & Technical SEO](#9-ai-readable-endpoints-json-schema--technical-seo)
10. [Standalone Developer Portal Export (`export-portal`)](#10-standalone-developer-portal-export-export-portal)
11. [Production Deployment (Cloudflare Pages & Docker/Nginx)](#11-production-deployment-cloudflare-pages--dockernginx)
12. [CLI Commands & npm Scripts Reference](#12-cli-commands--npm-scripts-reference)
13. [Repository Structure & Governance](#13-repository-structure--governance)
14. [Project Documentation Index](#14-project-documentation-index)
15. [About Vib Tools — Author, Company & Contact Information](#15-about-vib-tools--author-company--contact-information)
16. [Contributing, Support, Security & License](#16-contributing-support-security--license)

---

## 1. Why Vib Docs Engine

Most documentation platforms force engineering teams to choose between monolithic central docs repositories (which drift out of sync with code releases) or per-repo standalone docs sites (which fragment search, branding, and navigation).

**Vib Docs Engine solves this by separating documentation authoring from developer portal publishing:**

- **Keep developer docs beside code:** Each open-source or developer repository in [`github.com/vibtoolshq`](https://github.com/vibtoolshq) maintains its own `.vibtools/docs.config.json` and `docs/` folder.
- **Dedicated Developer-Only Portal:** Configured strictly for **[developer.vibtools.io](https://developer.vibtools.io/)** (`"portalType": "developer"`), hosting open-source engines, SDKs, APIs, CLI tools, frameworks, and self-hosted infrastructure.
- **Strict `docsType` enforcement:** Only repositories declaring `"docsType": "developer"` or `"docsType": "dev"` (or an explicit `targets.developer` block) in `.vibtools/docs.config.json` are accepted. User-only documentation (`"docsType": "users"`) is never built or shown here.
- **100% static output:** Production builds emit pure static HTML, CSS, validated logos, Pagefind WASM/index shards, sitemaps, JSON Schema, and plain-text AI indexes. Visitor browsers never query Git providers or runtime databases.
- **Zero-touch onboarding:** Adding a new developer repository that includes `.vibtools/docs.config.json` requires only a single Git URL string in `config/projects.json` (or `npm run add-project -- --url <git-url>`).

---

## 2. Complete A–Z Feature Reference

Every feature below is implemented, tested, and verified in the current codebase:

### A. `.vibtools/` Self-Configuration & Developer-Only Filtering
- **Canonical `.vibtools/docs.config.json` (and `.vibtools/config.docs.json` alias):** Repositories declare their own `$schema`, `schemaVersion`, `docsType` (`"developer"` or `"dev"`), `slug`, `title`, `category`, `description`, `version`, `accentColor`, `docsPath`, `logoPath`, `branch`, `ctaLabel`, `ctaUrl`, and optional `targets.developer` overrides.
- **Conflict guard:** Committing both `docs.config.json` and `config.docs.json` in the same `.vibtools/` directory fails closed with a clear diagnostic error instead of guessing which file is authoritative.
- **Strict Developer-Only filtering (`portalType: "developer"`):** Automatically accepts repositories with `"docsType": "developer"` or `"docsType": "dev"` (or `targets.developer`), and automatically skips any user documentation (`"docsType": "users"`) or untyped repositories.
- **Four-tier metadata precedence:** `config/projects.json` explicit overrides → `.vibtools/` active developer target (`targets.developer`) → `.vibtools/` root fields → `docs/index.md` frontmatter and **Smart Markdown extraction** (`extractMarkdownMetadata`).

### B. Two-Step Git Sparse Checkout & Multi-Host Git Sync
- **Step 1 (Metadata-first checkout):** `scripts/sync-docs.mjs` initializes a shallow (`--depth 1`, `--filter=blob:none`) sparse checkout of only `.vibtools/` on the entry's initial branch (`main` by default).
- **Step 2 (Target branch switch & docs checkout):** If the repository matches `portalType: "developer"`, the sync engine switches sparse branches when `.vibtools/` specifies a custom `branch`, then checks out only the resolved `docsPath` and `logoPath` parent directory. Application source code is never downloaded.
- **Multi-provider Git transport:** Works with GitHub, GitLab, Gitea, and Forgejo over HTTPS or SSH without provider-specific REST API clients.
- **Public & private repository authentication:** Public repositories clone without credentials. Private HTTPS repositories resolve per-project `secretKey` / `gitToken` / `gitTokenEnv` references (such as `"$GIT_TOKEN"`) and optional `gitUsername` (`oauth2` on GitLab; `x-access-token` on GitHub/Gitea/Forgejo). Secrets are stripped before writing `src/generated/manifest.json` and redacted from all error logs.
- **Per-project failure isolation:** If one upstream repository is unreachable, `scripts/sync-docs.mjs` logs a sanitized error and continues building the remaining projects (failing only if zero projects sync or when strict CI rules are violated).

### C. Smart Content Normalization & Deterministic Navigation
- **Root `index.md` / `README.md` normalization:** Every `docsPath` requires a root `index.md` (or `README.md`, which is automatically promoted to `index.md`; when both exist in the same folder, `index.md` is kept and `README.md` is removed to prevent route collisions).
- **Governance & draft stripping:** Any `MANIFEST.md` file inside a synced `docs/` tree and any page with boolean `draft: true` frontmatter is automatically removed during sync so internal inventories and unpublished drafts never leak into public routes, sitemaps, search, or `llms.txt`.
- **Smart Markdown metadata fallback:** When `index.md` omits YAML frontmatter, `extractMarkdownMetadata` extracts the project title from the first `# H1` heading (stripping noisy `— Developer Documentation` / `- Docs` suffixes), the summary from the first clean prose paragraph (`~160` characters), and the version badge from `Version: X.Y.Z` or `vX.Y.Z` markers.
- **Deterministic sidebar & pagination (`src/utils/sidebar.ts`):**
  1. Index pages (`index.md`) sort first inside every folder (labeled `"Overview"` at the project root).
  2. Explicit frontmatter `order` numbers sort next.
  3. Numeric filename/folder prefixes (`01-`, `02_`) sort next and are stripped from generated URL routes and display titles.
  4. When siblings tie on `order` and `numericPrefix`, the order in which relative links appear inside the parent directory's `index.md` breaks ties naturally.
  5. Remaining ties fall back to case-insensitive alphabetical order.
- **Subfolder group headers:** Subfolders become collapsible sidebar groups whose labels automatically adopt the subfolder `index.md` frontmatter `title` when present.
- **Relative `.md` / `.mdx` link rewriting:** The `rewriteInternalMarkdownLinks` Remark plugin in `astro.config.mjs` rewrites relative Markdown links (e.g., `[Adding Projects](adding-projects.md)` or `[Deployment](./deployment.md#cloudflare)`) into canonical Astro routes (`/vib-docs-engine/adding-projects/`, `/vib-docs-engine/deployment/#cloudflare`).

### D. Logo Discovery & Static Security Validation
- **Three-tier logo discovery:** Checks explicit `logoPath` → `.vibtools/logo.{svg,png}` / `.vibtools/icon.{svg,png}` → `<docsPath>/logo.*`, `<docsPath>/icon.*`, `<docsPath>/assets/*`, `<docsPath>/images/*`.
- **Strict logo security checks:** Enforces repository path containment (`assertWithin`), rejects symlinks (`fs.lstat`), caps file size at `2 MB`, verifies 8-byte PNG file signatures, and rejects SVG files containing `<script>`, `<foreignObject>`, inline `on*=` event handlers, or external URIs.
- **Deterministic monogram fallback:** Projects without a valid logo file automatically render a 1–2 letter uppercase monogram badge tinted with the project's `accentColor`.

### E. Compact Hub, Three-Column Reader & Interactive UI
- **Manifest-driven Developer Hub (`src/pages/index.astro`):** Features a balanced `h-14` 3-slot header (`Vib Tools / Docs`, centered search trigger, external nav links + theme toggle), a compact split Hero with primary project CTA, quick search button, and `Quick Guides` card, dynamic `CategoryTabs` (auto-hidden when `<= 1` category exists), responsive `ProjectCard` grid with normalized `vX.Y.Z` badges, and a 4-column footer (`Brand`, `Documentation`, `Resources`, `Connect`).
- **Three-column documentation reader (`src/layouts/DocsLayout.astro`):**
  - **Left rail:** Collapsible recursive `Sidebar` + `SidebarTree` with normalized active-route highlighting and mobile drawer.
  - **Center reading column (`max-w-[740px]`):** Breadcrumb bar, article header, `.docs-prose` typography, Expressive Code syntax-highlighted blocks with copy buttons, `PrevNextNav` pagination, and validated `Edit this page` links for GitHub, GitLab, Gitea, and Forgejo.
  - **Right rail:** Sticky `TableOfContents` (`On this page`) with `IntersectionObserver` scroll-spy for `h2` and `h3` headings.
- **Built-in MDX components:** `<Callout type="info|tip|warning|danger" title="...">` and client-side `<CodeTabs labels={[...]}>` tab switchers.
- **Persistent dual theme & per-project accents:** Zero-flicker light/dark theme initialization (`localStorage` + `prefers-color-scheme`) and per-project `--accent-color` CSS custom properties.

### F. Instant Scoped & Global Static Search (Pagefind)
- **Keyboard-first search palette (`SearchModal.astro`):** Open from anywhere with `Ctrl+K` or `Cmd+K` (or click the centered header search bar), navigate results with `ArrowDown` / `ArrowUp` / `Enter`, and close with `ESC`.
- **Project-scoped vs. portal-wide toggle:** Opening search on a project page automatically filters Pagefind results to that project (`This product`), with a 1-click toggle to search `All Docs`.
- **Smart empty state & deep-linking:** Displays `Recently viewed` documentation pages (`localStorage`) alongside manifest-backed `Suggested` guides before typing, and supports `/?q=<term>` URL deep-linking (wired to Google `SearchAction` JSON-LD).
- **Relevance tuning:** Boosts `<h1>` article titles (`data-pagefind-weight="10"`), ignores breadcrumb noise (`data-pagefind-ignore="all"`), and serves `/pagefind/*` assets in `astro dev` via custom Vite middleware.

### G. Technical SEO, Schema.org JSON-LD & AI/LLM Native Readiness
- **Complete AI/LLM endpoint suite:**
  - `/llms.txt`: Portal-level structured AI directory with project descriptions, schema links, HTML routes, and direct `[Markdown]` URLs.
  - `/llms-full.txt`: Complete portal-wide YAML-free Markdown corpus in a single static file.
  - `/<product>/llms.txt`: Per-project concatenated Markdown bundle for focused AI context loading.
  - `/<product>/<slug>.md`: Individual raw YAML-free Markdown export for every single documentation page.
  - `/schemas/vibtools-docs.schema.json`: Canonical hosted Draft 2020-12 JSON Schema for `.vibtools/docs.config.json`.
- **HTML `<head>` AI & SEO discovery:** Emits canonical URLs (`https://developer.vibtools.io/...`), `<link rel="sitemap">`, `<link rel="alternate">` for `/llms.txt`, `/llms-full.txt`, project `llms.txt`, and per-page `.md`, plus `<link rel="describedby" type="application/schema+json" href="/schemas/vibtools-docs.schema.json">`.
- **XSS-safe Schema.org JSON-LD (`src/utils/seo.ts`):** Emits `Organization` and `WebSite` (`SearchAction`) on the Hub, and `TechArticle` + ordered `BreadcrumbList` on every documentation page.
- **Crawler hygiene:** Generates `sitemap-index.xml`, `robots.txt` (`Allow: /`, `Disallow: /pagefind/`), and `robots="noindex, follow"` on `/404.html`.

### H. Dual Deployment Stack & Post-Build Verifier
- **Cloudflare Pages & Functions ready:** Includes `wrangler.toml` (`name = "developer-vibtools-io"`), `.node-version` & `.nvmrc` pinned to official Node.js `22.23.5`, `public/_headers`, `public/_redirects`, `public/_routes.json`, `GET` & `HEAD /api/health`, and fail-closed `POST /api/webhook` supporting GitHub/Gitea/Forgejo `HMAC-SHA256`, GitLab `X-Gitlab-Token`, `Authorization: Bearer`, `ping` event acknowledgment, and `ALLOWED_BRANCHES` filtering.
- **Self-hosted Docker & Nginx ready:** Multi-stage `Dockerfile` (`node:22-alpine` builder with `git` + `openssh-client` and BuildKit `--secret id=git_token,env=GIT_TOKEN` mount; `nginx:alpine` runtime) paired with a security-hardened `nginx.conf` matching Cloudflare edge cache and Content-Type headers.
- **Comprehensive post-build verifier (`scripts/verify-build.mjs`):** Validates `.vibtools/` schema and path containment, `package-lock.json` integrity, absence of conflicting lockfiles or leaked governance files in `dist/`, every manifest route, per-page `.md` parity, JSON-LD syntax, `404` `noindex`, and every internal `href` and `img[src]` across all generated HTML files.

---

## 3. Developer-Only Portal Architecture (`developer.vibtools.io`)

This repository is configured as the dedicated **Developer Documentation Portal** (`https://developer.vibtools.io/`):

| Portal Domain | `portalType` | Active Config | Accepted `.vibtools/docs.config.json` Projects |
| :--- | :--- | :--- | :--- |
| **[developer.vibtools.io](https://developer.vibtools.io/)** | `"developer"` | `config/site.config.json` & `config/projects.json` | Repositories declaring `"docsType": "developer"` or `"docsType": "dev"` (or `targets.developer`). Any `"docsType": "users"` or untyped repository is automatically rejected/skipped. |

---

## 4. System Architecture & Build Pipeline

```text
Upstream Developer Repositories (github.com/vibtoolshq/*)
  ├── .vibtools/docs.config.json  ("docsType": "developer" or "dev")
  └── docs/                       (or docs/dev/)
        │
        │ 1. Push webhook (GitHub Action / GitLab / Gitea -> /api/webhook or Build Hook)
        ▼
scripts/sync-docs.mjs (Prebuild Sync & Normalization Engine)
  ├── Step 1: Shallow sparse-checkout of .vibtools/ only
  ├── Validate .vibtools/docs.config.json & enforce portalType: "developer" (docsType: "developer" | "dev")
  ├── Step 2: Switch branch if needed & sparse-checkout resolved docsPath + logoPath
  ├── Strip MANIFEST.md & draft:true pages, normalize README.md -> index.md
  ├── Validate & copy project logo -> public/logos/<slug>.<ext>
  ├── Resolve metadata (frontmatter / .vibtools / Smart Markdown extraction)
  └── Build deterministic sidebar + pagination -> src/generated/manifest.json
        │
        │ 2. Static Site Generation (Astro 7 + Tailwind CSS v4 + Expressive Code)
        ▼
dist/ (Prerendered Static Output)
  ├── /index.html, /<product>/<slug>/index.html, /404.html
  ├── /llms.txt, /llms-full.txt, /<product>/llms.txt, /<product>/<slug>.md
  ├── /schemas/vibtools-docs.schema.json, /sitemap-index.xml, /robots.txt
  └── Prune public/MANIFEST.md & public/README.md from dist/
        │
        │ 3. Post-Build Search Indexing & Verification
        ▼
Pagefind (dist/pagefind/*) ──► scripts/verify-build.mjs ──► Cloudflare Pages / Nginx CDN
```

> **Important Ownership Rule:** Never hand-edit `src/content/docs/`, `src/generated/manifest.json`, `public/logos/<synced-project-logos>`, or `dist/`. All project content belongs in its upstream developer repository and is regenerated on every `npm run sync` / `npm run build`.

---

## 5. Quick Start & Local Workflow

### Prerequisites

- **Node.js:** `>= 22.23.4` (pinned to official **`22.23.5`** in `.node-version` and `.nvmrc`)
- **Package Manager:** `npm` (uses canonical `package-lock.json` for deterministic `npm ci` installs)
- **Git:** Git `2.25+` with `sparse-checkout` support

### 1. Install Dependencies

```sh
npm ci
```

### 2. Synchronize Documentation & Start the Development Server

```sh
npm run dev
```

`npm run dev` automatically runs `predev` (`node scripts/sync-docs.mjs`), populates `src/content/docs/` and `src/generated/manifest.json`, and starts the Astro dev server on `http://localhost:3000`.

### 3. Run Unit Tests, Type Checks & Full Build Verification

```sh
npm test
npm run lint
npx tsc -p functions/tsconfig.json --noEmit
npm run verify
```

`npm run verify` executes the complete production build (`sync-docs.mjs` → `astro build` → `pagefind --site dist`) followed by `node scripts/verify-build.mjs`.

### 4. Preview the Production Build Locally

```sh
npm run preview
```

---

## 6. `.vibtools/` Zero-Touch Repository Configuration

Place a `.vibtools/docs.config.json` file (or `.vibtools/config.docs.json`—never both) with `"docsType": "developer"` (or `"docsType": "dev"`) in the root of any developer repository so **Vib Docs Engine** can discover all metadata and documentation paths from a single Git URL.

### Standard Developer Repository Example (`developer.vibtools.io` — Open-Source Project in `github.com/vibtoolshq`)

```json
{
  "$schema": "https://developer.vibtools.io/schemas/vibtools-docs.schema.json",
  "schemaVersion": 1,
  "docsType": "developer",
  "slug": "socketcore",
  "title": "SocketCore",
  "category": "Core Infrastructure",
  "description": "High-throughput WebSocket and event transport core for Vib Tools services.",
  "version": "1.0.0",
  "accentColor": "#2563EB",
  "docsPath": "docs",
  "logoPath": ".vibtools/logo.svg",
  "branch": "main",
  "ctaLabel": "View repository",
  "ctaUrl": "https://github.com/vibtoolshq/SocketCore"
}
```

### Developer Subdirectory Target Example (`docs/dev`)

```json
{
  "$schema": "https://developer.vibtools.io/schemas/vibtools-docs.schema.json",
  "schemaVersion": 1,
  "docsType": "developer",
  "slug": "licenx",
  "title": "LicenX Developer Guide",
  "version": "1.0.0",
  "logoPath": ".vibtools/logo.svg",
  "branch": "main",
  "targets": {
    "developer": {
      "slug": "licenx",
      "title": "LicenX Developer Guide",
      "category": "SDKs & APIs",
      "description": "Self-hosted deployment, webhook verification, and SDK integration reference for LicenX.",
      "accentColor": "#0EA5E9",
      "docsPath": "docs/dev",
      "ctaLabel": "View repository",
      "ctaUrl": "https://github.com/vibtoolshq/LicenX"
    }
  }
}
```

See the complete field-by-field contract, regex rules, and 10-point AI agent checklist in **[`docs/vibtools-config.md`](docs/vibtools-config.md)**.

---

## 7. Registering Developer Projects (`config/projects.json` & CLI)

### Option A — Bare Repository URL in `config/projects.json` (Recommended)

When a developer repository contains `.vibtools/docs.config.json` with `"docsType": "developer"` (or `"dev"`), register its Git remote URL directly in `config/projects.json`:

```json
[
  "https://github.com/vibtoolshq/vib-docs-engine.git",
  "https://github.com/vibtoolshq/SocketCore.git",
  "https://github.com/vibtoolshq/LicenX.git"
]
```

### Option B — One-Command CLI Registration

```sh
npm run add-project -- --url https://github.com/vibtoolshq/SocketCore.git
```

Or run `npm run add-project` interactively to choose between **`[1] .vibtools/ Auto`** and **`[2] Manual / Custom overrides`**.

### Option C — Object Entry (Private Repositories or Portal-Specific Overrides)

For private developer repositories requiring an environment variable token reference (`secretKey`), or when overriding `.vibtools/` values:

```json
[
  {
    "repoUrl": "https://github.com/vibtoolshq/private-sdk.git",
    "secretKey": "$GIT_TOKEN_PRIVATE_SDK",
    "docsType": "developer",
    "category": "SDKs & Engines",
    "ctaLabel": "View repository",
    "ctaUrl": "https://github.com/vibtoolshq/private-sdk"
  }
]
```

Full onboarding details are documented in **[`docs/adding-projects.md`](docs/adding-projects.md)**.

---

## 8. `docs/` Authoring Rules, Frontmatter & MDX Components

1. **Mandatory root `index.md`:** Every configured `docsPath` (`docs`, `docs/dev`) must contain a root `index.md` (or `README.md`, auto-normalized to `index.md`).
2. **Optional YAML frontmatter:**
   ```yaml
   ---
   title: "Architecture & Setup"
   description: "Install, configure, and integrate the SDK."
   version: "1.0.0"
   order: 1
   category: "Core Infrastructure"
   draft: false
   ---
   ```
3. **Ordering & Sidebar Groups:**
   - Use frontmatter `order: 1`, `order: 2` or numeric filename prefixes (`01-installation.md`, `02-configuration.md`).
   - Add an `index.md` inside any subfolder (`docs/getting-started/index.md`) to set the collapsible group's display title and overview page.
   - When subfolders share the same `order`, `src/utils/sidebar.ts` automatically orders them according to the relative links in the parent `docs/index.md`.
4. **Auto-stripped files:** Files named `MANIFEST.md` and pages with `draft: true` are stripped during sync.
5. **Interactive MDX components (`.mdx`):** Use `<Callout type="info|tip|warning|danger" title="...">` and `<CodeTabs labels={["npm", "Docker"]}>`.

---

## 9. AI-Readable Endpoints, JSON Schema & Technical SEO

Every build automatically generates human, search-engine, and AI-agent endpoints on `https://developer.vibtools.io`:

| Endpoint Path | Content-Type | Description |
| :--- | :--- | :--- |
| `/llms.txt` | `text/plain; charset=utf-8` | Root AI index listing portal metadata, JSON Schema URL, developer projects, and per-page HTML + `[Markdown]` links. |
| `/llms-full.txt` | `text/plain; charset=utf-8` | Complete portal-wide YAML-free Markdown corpus across all synced developer projects. |
| `/<product>/llms.txt` | `text/plain; charset=utf-8` | Single-project concatenated Markdown bundle (e.g., `/vib-docs-engine/llms.txt`). |
| `/<product>/<slug>.md` | `text/markdown; charset=utf-8` | Clean YAML-free raw Markdown export for every individual documentation page. |
| `/schemas/vibtools-docs.schema.json` | `application/schema+json; charset=utf-8` | Canonical Draft 2020-12 JSON Schema for `.vibtools/docs.config.json` & `.vibtools/config.docs.json`. |
| `/sitemap-index.xml` | `application/xml` | Static XML sitemap index generated from `https://developer.vibtools.io`. |
| `/robots.txt` | `text/plain; charset=utf-8` | Allows crawlers on all documentation routes (`Allow: /`), disallows `/pagefind/` index shards, and links `/sitemap-index.xml`. |

---

## 10. Standalone Developer Portal Export (`export-portal`)

While this repository is already configured directly for `https://developer.vibtools.io`, you can also export a clean standalone copy using `export-portal`:

```sh
npm run export-portal -- --portal dev --out ../developer-vibtools-io
```

What `scripts/export-portal.mjs` does automatically:
- Copies the clean engine source while excluding generated directories (`dist/`, `node_modules/`, `.astro/`, `.wrangler/`, `src/content/docs/`, `src/generated/`), development-only `notes/`, and presets.
- Injects `config/presets/dev-portal/site.config.json` and `config/presets/dev-portal/projects.json` (`portalType: "developer"` for `developer.vibtools.io`).
- Sets the `wrangler.toml` project name (`developer-vibtools-io`) and customizes `public/site.webmanifest`.

---

## 11. Production Deployment (Cloudflare Pages & Docker/Nginx)

### Option A — Cloudflare Pages & Functions (Recommended Serverless Edge)

- **Domain:** `https://developer.vibtools.io`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node.js version:** Automatically pinned to **`22.23.5`** via `.node-version` and `.nvmrc` (`package-lock.json` enforces deterministic `npm ci`).
- **Pages Functions included (`functions/api/`):**
  - `GET` / `HEAD /api/health`: Runtime health check (`200 OK`, `Cache-Control: no-store`).
  - `POST /api/webhook`: Fail-closed rebuild webhook relay supporting GitHub (`X-Hub-Signature-256`), Gitea/Forgejo (`X-Gitea-Signature`, `X-Forgejo-Signature`), GitLab (`X-Gitlab-Token`), and Bearer tokens (`WEBHOOK_SECRET`), `ping` event handling, and `ALLOWED_BRANCHES` filtering.
- **Strict CI Guard:** In Cloudflare Pages (`CF_PAGES=1`) or when `STRICT_SYNC=1` is set, any unreplaced `YOUR_ORG` starter placeholder URL in `config/projects.json` fails the build immediately.

### Option B — Self-Hosted Docker & Nginx (VPS / Coolify)

Build the multi-stage container image (passing `GIT_TOKEN` securely via Docker BuildKit secret mounts only when private repositories are configured):

```sh
# Public repositories only:
docker build -t vib-docs-engine .

# With private repository GIT_TOKEN secret:
docker buildx build --secret id=git_token,env=GIT_TOKEN -t vib-docs-engine .

# Run container on port 8080:
docker run --rm -p 8080:80 vib-docs-engine
```

The final `nginx:alpine` runtime image contains only static `dist/` assets and `nginx.conf` (no Node.js, Git history, or build secrets). See **[`docs/deployment.md`](docs/deployment.md)** for complete production runbooks.

---

## 12. CLI Commands & npm Scripts Reference

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Run `predev` (`sync-docs.mjs`) and start the Astro development server on `0.0.0.0:3000`. |
| `npm run sync` | Execute `node scripts/sync-docs.mjs` to sparse-checkout configured developer repositories and write `src/generated/manifest.json`. |
| `npm run build` | Run `prebuild` (`sync-docs.mjs`), build static routes with Astro, prune governance markdown from `dist/`, and generate the Pagefind search index. |
| `npm run verify` | Run `npm run build` followed by `node scripts/verify-build.mjs` (validates config, lockfile, routes, HTML links, images, `.md` exports, JSON Schema, and JSON-LD). |
| `npm test` | Run unit tests (`src/utils/*.test.ts`) via Node's test runner (`node:test` + `tsx`). |
| `npm run lint` | Run strict TypeScript type-checking (`tsc --noEmit`). |
| `npm run add-project` | Add a developer repository to `config/projects.json` via `--url <git-url>` or interactive `.vibtools` Auto / Manual prompts. |
| `npm run export-portal` | Export a standalone `dev` (`developer.vibtools.io`) portal repository. |
| `npm run preview` | Preview the built static `dist/` directory locally on `0.0.0.0:3000`. |

---

## 13. Repository Structure & Governance

```text
vib-docs-engine/
├── .github/                  # GitHub Issue templates (bug, feature, config) & PR template
├── .vibtools/                # Self-configuration (docs.config.json & logo.png) for vib-docs-engine
├── config/                   # Active developer site.config.json, projects.json, and portal presets
├── docs/                     # Authored operator & specification docs for Vib Docs Engine
├── functions/                # Cloudflare Pages Functions (/api/health, /api/webhook) & isolated tsconfig
├── notes/                    # Development-only engineering plans, audits & phase trackers (excluded from exports)
├── project/                  # Durable architecture specs, UI system, codebase map & CHANGELOG.md
├── public/                   # Brand assets, favicons, site.webmanifest, _headers, _redirects, _routes.json
├── scripts/                  # CLI automation (sync-docs, add-project, export-portal, verify-build, run-astro)
├── src/
│   ├── components/           # Hub cards, 3-column docs UI, SearchModal, ThemeToggle, MDX Callout & CodeTabs
│   ├── content/docs/         # Generated during sync (gitignored; never hand-edit)
│   ├── generated/            # Generated manifest.json contract (gitignored; never hand-edit)
│   ├── layouts/              # BaseLayout, HubLayout, DocsLayout
│   ├── pages/                # Static HTML routes, llms.txt, llms-full.txt, *.md, schemas/*.json, robots.txt, 404
│   ├── styles/               # Tailwind CSS v4 tokens and .docs-prose rules
│   └── utils/                # Pure TypeScript modules + unit tests (vibtoolsConfig, sidebar, search, seo, llms, theme)
├── templates/                # Cross-repo GitHub Actions (github-notify-docs.yml) & shell webhook triggers
├── AGENTS.md                 # Documentation-first engineering governance rules
├── CONTRIBUTING.md           # Contributor setup, workflow & verification requirements
├── Dockerfile                # Multi-stage static builder (node:22-alpine -> nginx:alpine)
├── MANIFEST.md               # Root file and folder inventory
├── nginx.conf                # Hardened static Nginx configuration aligned with Cloudflare _headers
├── package.json              # Scripts, Node >=22.23.4 engine constraint, and dependencies
├── SECURITY.md               # Private vulnerability reporting policy
├── SUPPORT.md                # Official product, technical & community support routing
└── wrangler.toml             # Cloudflare Pages & Functions configuration (developer-vibtools-io)
```

---

## 14. Project Documentation Index

### Operator & Developer Guides (`docs/`)
- **[Operating Vib Docs Engine & AI Quick-Start](docs/index.md)**
- **[`.vibtools/` & `docs/` Complete Specification & JSON Schema](docs/vibtools-config.md)**
- **[Adding Developer Projects & Configuring Webhooks](docs/adding-projects.md)**
- **[Go-Live Deployment Runbook (Cloudflare Pages & Docker/Nginx)](docs/deployment.md)**
- **[Portal User Guide (Reader Navigation & Search)](docs/portal-user-guide.md)**

### Engineering Specifications (`project/`)
- **[Vision, Scope & Non-Negotiable Rules](project/00-vision-and-purpose.md)**
- **[System Architecture & Data Contracts](project/01-architecture.md)**
- **[Features & Sync Workflows](project/02-features-and-workflow.md)**
- **[UI Design System & Tokens](project/03-ui-design-system.md)**
- **[Codebase & Function Reference](project/04-codebase-reference.md)**
- **[Engineering Change Log](project/CHANGELOG.md)**

---

## 15. About Vib Tools — Author, Company & Contact Information

**Vib Tools** (`Vib.Tools` / `vibtools`) builds practical desktop applications, self-hosted software, automation tooling, developer utilities, reusable frameworks, and open-source projects for real workflows.

> **Mission:** Build free and open-source tools that help people do real work with less complexity.

### Verified Author & Maintainer Identity

- **Organization / Maintainer:** **Vib Tools**
- **Connected GitHub Account Identity:** `Vib Tools` ([`@vibtoolshq`](https://github.com/vibtoolshq), `hello@vibtools.io`) — maintains and administers Vib Tools repositories. *(Note: Repository access denotes technical maintenance and administration; no individual executive, founder, or legal-owner title is asserted.)*
- **Head Office:** Vib Tools HQ, 5660 Kochakata, Nageswari, Kurigram, Rangpur, Bangladesh
- **Business Timezone:** GMT+6 (`Asia/Dhaka`)

### Official Websites & Code Organizations

- **Official Website:** [https://vib.tools/](https://vib.tools/)
- **Developer Documentation Portal:** [https://developer.vibtools.io/](https://developer.vibtools.io/)
- **GitHub Organization (Open-Source Projects):** [https://github.com/vibtoolshq](https://github.com/vibtoolshq)
- **GitLab Organization:** [https://gitlab.com/vibtools](https://gitlab.com/vibtools)
- **Official Brand Assets:** [https://github.com/vibtoolshq/vibtools-brand-assets](https://github.com/vibtoolshq/vibtools-brand-assets)

### Direct Contact Channels

| Channel | Contact / Destination | Purpose |
| :--- | :--- | :--- |
| **General Inquiries** | [hello@vibtools.io](mailto:hello@vibtools.io) | Partnerships, press/media, company inquiries, and general questions |
| **Product & Technical Support** | [support@vibtools.io](mailto:support@vibtools.io) | Technical support for Vib Tools products, public projects, and private security disclosures |
| **Phone / WhatsApp** | [+880 1795-470603](tel:+8801795470603) | Direct phone and WhatsApp communication (`+8801795470603`, GMT+6) |
| **Head Office** | 5660 Kochakata, Nageswari, Kurigram, Rangpur, Bangladesh | Vib Tools HQ physical address |

### Official Social & Community Profiles

- **X (Twitter):** [https://x.com/vibtools](https://x.com/vibtools) (`@vibtools`)
- **Facebook:** [https://www.facebook.com/vib.tools](https://www.facebook.com/vib.tools) (`vib.tools`)
- **Instagram:** [https://www.instagram.com/vib.tools/](https://www.instagram.com/vib.tools/)
- **Reddit:** [https://www.reddit.com/user/VibTools/](https://www.reddit.com/user/VibTools/) (`u/VibTools`)
- **TikTok:** [https://www.tiktok.com/@vibtools](https://www.tiktok.com/@vibtools) (`@vibtools`)

---

## 16. Contributing, Support, Security & License

- **Contributing:** Read **[`CONTRIBUTING.md`](CONTRIBUTING.md)** and **[`AGENTS.md`](AGENTS.md)** before submitting pull requests. Always run `npm test`, `npm run lint`, and `npm run verify` before proposing changes.
- **Support:** See **[`SUPPORT.md`](SUPPORT.md)** for help with configuration, documentation syncing, or deployment.
- **Security:** Do not report suspected security vulnerabilities in public GitHub issues. Follow **[`SECURITY.md`](SECURITY.md)** and report privately to **[support@vibtools.io](mailto:support@vibtools.io)**.
- **License:** Check the repository root for an active `LICENSE` file before redistributing or modifying the project. When no `LICENSE` file is present in the repository, all rights remain reserved by **Vib Tools** (`© 2026 Vib Tools`) unless explicitly granted in writing.

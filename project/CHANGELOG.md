# Engineering Change Log

Record dates, files/areas, behavior changed, and verification result whenever code, configuration, or docs change. This is the durable project history; personal working notes remain under `notes/`.

## 2026-11-17 — Phase 7 QA and documentation governance

- Added `scripts/export-portal.mjs`, portal presets, `scripts/verify-build.mjs`, and `docs/deployment.md` for dual-portal export and go-live validation.
- Verified exporter preset injection/exclusions/keep files and `npm run verify`; build output contained five HTML pages and had no broken internal links.
- Added development-only `notes/` process, root `AGENTS.md`, per-authored-folder README/MANIFEST indexes, and verified codebase reference. Generated/vendor directories remain excluded.
- Added the root `MANIFEST.md` and documented direct source-folder inventories, setup ownership, modules/functions, UI controls, and the development-only notes boundary.
- Added `project/04-codebase-reference.md` function/dependency map and the `docs/portal-user-guide.md`; validated the exporter, TypeScript, and Astro sync after the documentation changes.

## 2026-11-17 — Phase 8 Documentation Governance

- Added root `AGENTS.md` with plan/log-first change rules and durable documentation requirements.
- Added `notes/` planning guidance and an execution log; configured portal export to omit notes.
- Added README/MANIFEST indexes for all tracked non-routable authored folders, a root manifest, portal-user guide, and function/dependency code map.
- Explicitly excluded generated/vendor folders and Astro route directories from local Markdown indexes; Markdown in `src/pages/` would create routes.
- Verified exporter exclusions, `npx tsc --noEmit`, `npx astro sync`, and `npm run verify` (8 HTML pages, 6 required files, one product, no broken internal links). Production config was restored to remote-only.
- Rewrote the GitHub README with verified Vib Tools project/author details, current features and workflows, natural-language SEO summary, and public contact links; added contributor/security reporting guides. No license or executive title was inferred.
- Completed the GitHub-native submission layer with bug-report and feature-request forms, a pull-request template, private vulnerability routing, and `.github/` README/MANIFEST inventories. Updated the root manifest and contributor guidance; no application behavior or generated content was changed.

## 2026-11-18 — Dev server startup & local self-docs sync fallback

- Configured `package.json` (`dev`, `build`, and `preview` scripts) with `NODE_OPTIONS="--import data:text/javascript,process.versions.webcontainer='1'"` (enabling Astro 7 CLI's `>=22.22.0` container floor on Node `v22.23.2`) and `astro.config.mjs` (`server.host: "0.0.0.0"`, `server.port: 3000`, `vite.server.allowedHosts: true`) so the Astro dev server listens on port 3000 for container proxy environments.
- Updated `scripts/sync-docs.mjs` (`syncProject`) to fall back to the verified in-repository `docsPath` directory when remote cloning fails for `vib-docs-engine` without credentials, allowing `predev` and `prebuild` to generate `src/generated/manifest.json` without modifying `config/projects.json`.
- Moved `<nav aria-label="Breadcrumb">` inside the `max-w-[740px]` center reading column in `src/layouts/DocsLayout.astro` so the `xl:grid-cols-[minmax(0,1fr)_13rem]` layout keeps the article in the main column and `TableOfContents` in the right rail.
- Verified `npm run verify`: 8 HTML files, 6 required assets, 1 project, and zero broken internal links.

## 2026-11-18 — Phase 01: Sync Engine, Content Filtering & Brand Assets (`BUG-01`, `BUG-05`, `BUG-06`, `BUG-10`, `BUG-11`, `EH-01`–`EH-03`)

- Added `public/logos/vib-tools.svg` matching `config/site.config.json` (`brand.logo`) and updated `scripts/sync-docs.mjs` (`clearOutputDirectory` and `main`) to preserve `.gitkeep`, `vib-tools.svg`, and configured brand logos in `public/logos/` during sync (`BUG-10`).
- Added explicit YAML frontmatter (`title: Vib Docs Engine`, `description`, `version: "0.1.0"`) to `docs/index.md` (`BUG-11`) and prioritized `project.title` before `titleFromMarkdown` H1 fallback in `scripts/sync-docs.mjs`.
- Implemented `normalizeDocsTree` and `resolveRootIndexPath` in `scripts/sync-docs.mjs` and matching filters in `src/utils/sidebar.ts`, `src/pages/[product]/[...slug].astro`, and `src/pages/[product]/llms.txt.ts` to recursively remove `MANIFEST.md` and `draft: true` files, deduplicate or promote `README.md` across all subdirectories, validate `draft` boolean frontmatter (`EH-01`, `EH-02`), and keep `"Overview"` as the root index sidebar label (`BUG-01`, `BUG-05`, `BUG-11`).
- Updated `ManifestProject.repoUrl` in `src/utils/manifest.ts` to optional (`repoUrl?: string`) and added an early undefined guard in `src/components/docs/PrevNextNav.astro` (`getEditUrl`) (`BUG-06`, `EH-03`).
- Verified `npm run sync`, `npx tsc --noEmit`, and `npm run verify`: 6 static HTML pages built (`MANIFEST` and `README` route pollution eliminated), 4 docs pages indexed by Pagefind, `"title": "Vib Docs Engine"` and `"version": "0.1.0"` in `src/generated/manifest.json`, and 0 broken internal links.

## 2026-11-18 — Phase 02: Markdown Link Rewriting, Remark Pipeline & Build Verifier (`BUG-02`, `BUG-03`, `BUG-04`, `EH-04`)

- Added `rewriteInternalMarkdownLinks` and `cleanSegment` in `astro.config.mjs` to rewrite relative `.md`/`.mdx` links (such as `[Adding Projects](adding-projects.md)`) into normalized Astro product routes (`/vib-docs-engine/adding-projects/`) with query/hash preservation (`BUG-02`).
- Shared `sharedRemarkPlugins = [externalMarkdownLinks, rewriteInternalMarkdownLinks]` across both `mdx({ remarkPlugins: sharedRemarkPlugins })` and `markdown: { processor: unified({ remarkPlugins: sharedRemarkPlugins }) }` in `astro.config.mjs` so `.md` and `.mdx` documents share identical remark behavior without Astro 7 deprecation warnings (`BUG-03`).
- Upgraded `scripts/verify-build.mjs` (`isInternalReference`, `resolveCandidatePath`, `resolveInternalHref`, `resolveInternalAsset`) to validate both root-relative and document-relative `href` attributes as well as internal `img[src]` assets across all generated HTML files in `dist/` (`BUG-02`, `BUG-04`, `EH-04`).
- Verified `npm run verify` and `npx tsc --noEmit`: `<a href="/vib-docs-engine/adding-projects/">Adding Projects</a>` rendered in `dist/vib-docs-engine/index.html`, 6 HTML files verified, and 0 broken internal links or missing image assets.

## 2026-11-18 — Phase 03: UI/UX Interactive Components & Dev Search Support (`BUG-12`, `BUG-13`, `BUG-14`, `BUG-15`, `BUG-16`)

- Updated `src/utils/sidebar.ts` (`walk`) to resolve subfolder `SidebarGroup.title` from `index.md` frontmatter `title` when present and not `"Overview"`, and updated `src/components/docs/SidebarTree.astro` to highlight active group headers and normalize trailing slashes via `normalizePath` for active page links (`BUG-12`, `BUG-13`).
- Added `ArrowDown`, `ArrowUp`, and `Enter` keyboard navigation across `#search-results a[href]` elements in `src/components/ui/SearchModal.astro` (`BUG-14`).
- Added `servePagefindInDev` Vite middleware in `astro.config.mjs` to serve `/pagefind/*` assets from `dist/pagefind/` during `astro dev` (`BUG-15`).
- Updated `src/components/mdx/CodeTabs.astro` to automatically bind direct child elements inside `[data-code-panels]` to `labels[index]` when explicit `[data-code-panel]` wrappers are omitted (`BUG-16`).
- Verified `npm run verify`, `npx tsc --noEmit`, and live dev-mode Pagefind search and keyboard navigation on `http://localhost:3000`.

## 2026-11-18 — Phase 04: CLI, Portal Exporter, Presets, AI Endpoints & Docker Hardening (`BUG-07`, `BUG-08`, `BUG-09`, `BUG-17`, `BUG-18`, `EH-05`, `EH-06`)

- Updated `scripts/add-project.mjs` (`validateDocsPath`, `main`) to prompt for custom `docsPath` (default `"docs"`) with path traversal validation and enforce paired `ctaLabel`/`ctaUrl` persistence (`BUG-07`, `EH-05`).
- Updated `scripts/export-portal.mjs` and `.gitignore` to exclude `.playwright-mcp`, `.playwright-cli`, and `artifacts`, and preserved `public/logos/vib-tools.svg` in exported portals (`BUG-08`).
- Updated `scripts/sync-docs.mjs` (`syncProject`) to fall back to the local `./docs` fixture with an explicit operator warning when a preset entry still uses a `YOUR_ORG` placeholder URL (`BUG-09`, `EH-06`).
- Updated `src/pages/[product]/llms.txt.ts` to strip YAML frontmatter via `gray-matter` before emitting markdown bodies (`BUG-17`).
- Removed `ARG GIT_TOKEN` from `Dockerfile` so Git credentials are only accepted via BuildKit secret mounts (`BUG-18`).
- Verified `npm run verify`, `npx tsc --noEmit`, clean YAML-free output in `dist/vib-docs-engine/llms.txt`, and `export-portal` smoke export.

## 2026-11-18 — Phase 05: Per-Project Secret Key Config & Public/Private Git Sync

- Added optional `secretKey`, `gitToken`, `gitTokenEnv`, and `gitUsername` fields to `projectSchema` in `scripts/sync-docs.mjs` and interactive prompts in `scripts/add-project.mjs`.
- Implemented `resolveSecretValue`, `resolveProjectAuth`, and `runGitSparseClone` in `scripts/sync-docs.mjs`: private repos use their configured `secretKey` (supporting direct tokens or `$ENV_VAR` / `ENV_VAR` names) and auto-detect `oauth2` (GitLab) vs `x-access-token` (GitHub/Gitea/Forgejo), while public repos clone directly without any secret key.
- Stripped `secretKey`, `gitToken`, `gitTokenEnv`, and `gitUsername` before writing `src/generated/manifest.json` and redacted project secrets in `sanitizeError`.
- Updated `docs/adding-projects.md`, `notes/003-phase-execution-tracker.md`, and `project/04-codebase-reference.md`; verified `npm run verify` and `npx tsc --noEmit`.

## 2026-11-18 — Phase 06: Cloudflare Pages & Functions Build-Ready Setup

- Added `wrangler.toml`, `.node-version`, and `.nvmrc` pinning Node.js `22` and configuring `pages_build_output_dir = "dist"` for Cloudflare Pages & Functions.
- Added `public/_headers` (edge cache and security headers), `public/_redirects` (legacy domain redirect), and `public/_routes.json` (routing `/api/*` to Cloudflare Pages Functions while serving all static pages from the CDN edge).
- Added Cloudflare Pages Functions (`functions/api/health.ts` and `functions/api/webhook.ts`) for runtime health checks (`GET /api/health`) and secret-authenticated webhook rebuild relays (`POST /api/webhook`).
- Updated `package.json` (`engines.node: ">=22.0.0"`, `cf:build`, `pages:build`, direct `pagefind --site dist` binary call, and `pagefind` moved to `dependencies` for production CI installs).
- Updated `scripts/verify-build.mjs`, `scripts/export-portal.mjs`, `.gitignore`, `MANIFEST.md`, `public/MANIFEST.md`, `docs/deployment.md`, and `project/04-codebase-reference.md`; verified `npm run verify` and `npx tsc --noEmit`.

## 2026-11-18 — CF-Phase 01: Cloudflare Build Determinism, Lockfile & Edge Headers/Redirects

- Generated `package-lock.json` via `npm install --package-lock-only` so `npm ci`, `Dockerfile`, and Cloudflare Pages npm installs run deterministically alongside `bun.lock`.
- Updated `package.json` (`dev`, `build`, `preview`) to preserve pre-existing CI `NODE_OPTIONS` flags (`${NODE_OPTIONS:+$NODE_OPTIONS }...`) and pinned `.node-version` and `.nvmrc` to `22.24.0` to satisfy Astro `7.4.12` (`>=22.23.4`).
- Updated `public/_headers` with explicit `Content-Type: text/plain; charset=utf-8` and `Cache-Control` rules for `/llms.txt`, `/*/llms.txt`, and `/robots.txt`.
- Fixed `public/_redirects` by removing the invalid custom-domain rule (`https://docs.vibtools.io/*`) that Cloudflare Pages `_redirects` does not support and that leaked into `dev-portal` exports.
- Verified `NODE_OPTIONS="--max-old-space-size=2048" npm run build`, `node scripts/verify-build.mjs` (`6` HTML pages, `9` required assets, `0` broken links), and `npx tsc --noEmit`.

## 2026-11-18 — CF-Phase 02: Cloudflare Pages Functions & Multi-Provider Webhook Hardening

- Added `functions/tsconfig.json` (`ES2022`, `WebWorker` lib, strict isolated checking) for Cloudflare Pages Functions handlers.
- Added `onRequest` `405 Method Not Allowed` fallback handler to `functions/api/health.ts`.
- Upgraded `functions/api/webhook.ts` with Web Crypto `HMAC-SHA256` signature verification for GitHub (`X-Hub-Signature-256`) and Gitea/Forgejo (`X-Gitea-Signature`, `X-Forgejo-Signature`) alongside existing `X-Webhook-Secret`, `X-Gitlab-Token`, and `Authorization: Bearer` checks, plus optional `ALLOWED_BRANCHES` ref filtering (`200` skipped on non-matching branches).
- Documented `ALLOWED_BRANCHES` in `wrangler.toml`; verified `npx tsc -p functions/tsconfig.json --noEmit` and automated 7/7 runtime assertions.

## 2026-11-18 — CF-Phase 03: Build Verifier Upgrade & Documentation Sync

- Updated `scripts/verify-build.mjs` to require `functions/tsconfig.json`, validate `dist/_routes.json` JSON schema (`version: 1`, `include`/`exclude` arrays), and flag unsupported non-`pages.dev` custom-domain source URLs in `dist/_redirects`.
- Synchronized `docs/deployment.md`, `MANIFEST.md`, `project/04-codebase-reference.md`, and `notes/003-cloudflare-phase-tracker-and-future-plan.md` with the verified Cloudflare Pages & Functions setup (`22.24.0` Node pin, `package-lock.json`, multi-repo `GIT_TOKEN`/`secretKey`, HMAC webhooks, and Zone Redirect Rules).
- Verified `npm run verify`, `npx tsc --noEmit`, `npx tsc -p functions/tsconfig.json --noEmit`, and `export-portal` smoke exports (`100%` Cloudflare Pages & Functions Ready).

## 2026-11-18 — Vib Tools Branding Audit & Original Asset Integration

- Audited all 17 uploaded files in `public/vib.tools.Branding/vib.tools.Branding/` (`5.2 MB`): identified exact SHA-256 duplicate (`icon-512.png` === `vibtools-icon.png`), base64-PNG-wrapped `favicon.svg` (`214 KB`), oversized avatar/icon variants (`1.4 MB` each), and broken `site.webmanifest` template (`MyWebSite`, invalid `/favicon/...` icon URLs).
- Replaced placeholder SVGs (`public/favicon.svg`, `public/logos/vib-tools.svg`) and removed the unorganized raw branding directory with clean production assets: `public/logos/vib-tools.png` (`19 KB`, `128x128` crisp mark), `public/favicon.ico`, `public/favicon-96x96.png`, `public/apple-touch-icon.png`, `public/web-app-manifest-192x192.png`, `public/web-app-manifest-512x512.png`, `public/og-default.png`, and corrected `public/site.webmanifest`.
- Updated `config/site.config.json`, `config/presets/*/site.config.json`, `.gitignore`, `scripts/sync-docs.mjs`, `scripts/export-portal.mjs`, `src/layouts/BaseLayout.astro`, `src/layouts/HubLayout.astro`, `scripts/verify-build.mjs`, and `public/` manifests to wire `/logos/vib-tools.png`, favicons, PWA manifest, and OpenGraph social cards (`og:image`, `twitter:image`).

## 2026-11-18 — Search UI & SearchModal Scope-Locked Fix

- Fixed `src/components/ui/SearchModal.astro` positioning (`flex items-start justify-center pt-10 sm:pt-14` + `mx-auto`) eliminating the top-left pinning bug, added explicit `[hidden]` display overrides and `flex` on `[data-search-scope-bar]`, hid browser-native `-webkit-search-cancel-button` to prevent duplicate `×` buttons, and switched highlight styling to `:global(.search-palette mark)` with `--accent-color` tinting.
- Added smooth backdrop/palette transitions with scrollbar gutter compensation, clickable `ESC` close button, compact result rows with file/clock icons and sub-result rails, keyboard hint footer (`↑↓`, `↵`, `ESC`), and Stripe-style empty-state `Recently viewed` (`localStorage`) + manifest-backed `Suggested` links powered by pure helpers in `src/utils/search.ts`.
- Polished `[data-search-trigger]` (`src/layouts/HubLayout.astro`) and `[data-doc-search-trigger]` (`src/components/docs/Topbar.astro`) with `cursor-pointer` and balanced desktop trigger spacing.
- Verified `npx --yes tsx --test src/utils/search.test.ts` (`4/4`), `npm run verify`, `tsc --noEmit`, and headless Chromium captures across Dark, Light, Desktop (`1440x900`), and Mobile (`390x844`).

## 2026-11-18 — Header UI Balance & Visual Polish

- Redesigned `src/layouts/HubLayout.astro` header into a balanced `h-14` (`56px`) 3-slot desktop grid (`md:grid-cols-[1fr_auto_1fr]`): left-aligned brand (`Vib Tools / Docs`), centered `w-72`/`lg:w-80` untruncated search bar (`Search documentation...`), and right-aligned external nav links with `ArrowUpRight` icons separated from `ThemeToggle` by a `1px` vertical hairline divider.
- Aligned `src/components/docs/Topbar.astro` (`lg:grid-cols-[1fr_auto_1fr]`, `h-14`, centered `320px` scoped search trigger, external CTA `ArrowUpRight` cue, hairline divider) and `src/components/ui/ThemeToggle.astro` (`size-8`, `cursor-pointer`) with consistent spacing and theme contrast.
- Verified `compile_applet`, `lint_applet`, `node scripts/verify-build.mjs`, and live headless Chromium captures across Hub/Docs (`1440x900` dark/light) and Mobile (`390x844`).

## 2026-11-18 — Home Hero & Compact 4-Column Footer UI

- Updated `src/pages/index.astro` with a compact split Hero powered by `manifest.json` (`Browse {primaryProject.title}` CTA, `Search docs` button wired to `[data-search-trigger]`, and right-side `Quick Guides` card populated via `buildQuickSuggestions`) plus a crisp `Documentation` count bar above the untouched `CategoryTabs` and `ProjectCard` grid.
- Upgraded `src/layouts/HubLayout.astro` footer (leaving `<header>` untouched) into a 4-column responsive structure (`Brand`, `Documentation`, `Resources` -> `/llms.txt` & `/sitemap-index.xml`, `Connect` -> `site.navLinks`) with a hairline copyright and domain hostname bar.
- Verified `compile_applet`, `lint_applet` (`tsc --noEmit`), `node scripts/verify-build.mjs` (`6` HTML files, `14` required assets, `0` broken links), `npx --yes tsx --test src/utils/search.test.ts` (`4/4`), and Chromium captures across Dark/Light Desktop (`1440x900`) and Mobile (`390x844`).

## 2026-11-18 — SEO-Phase 01: Core Technical SEO, `404` `noindex`, OpenGraph Article Type & `robots.txt`

- Added optional `ogType` and `robots` props, protocol-safe base origin normalization, `<meta property="og:image:alt">`, and `<link rel="sitemap" type="application/xml" href="/sitemap-index.xml">` to `src/layouts/BaseLayout.astro`.
- Forwarded optional `robots` prop through `src/layouts/HubLayout.astro`, enabled `robots="noindex, follow"` on `src/pages/404.astro`, and enabled `ogType="article"` on documentation routes in `src/layouts/DocsLayout.astro`.
- Added `Disallow: /pagefind/` to `src/pages/robots.txt.ts` so search bots skip Pagefind client WASM/index shards while keeping `Allow: /` and `Sitemap`.
- Verified `compile_applet`, `lint_applet` (`tsc --noEmit`), `node scripts/verify-build.mjs` (`6` HTML files, `14` required assets, `0` broken links), and inspected built `<head>` metadata across `dist/index.html`, `dist/404.html`, `dist/vib-docs-engine/index.html`, and `dist/robots.txt`.

## 2026-11-18 — SEO-Phase 02: Schema.org Structured Data (`JSON-LD`) & Safe Serializer

- Created `src/utils/seo.ts` (`resolveOrigin`, `resolveAbsoluteUrl`, `safeJsonLdStringify`, `buildHubJsonLd`, `buildDocJsonLd`) and `src/utils/seo.test.ts` with HTML script-breakout escaping and `node:test` coverage.
- Added optional `structuredData` injection in `src/layouts/BaseLayout.astro` and pass-through in `src/layouts/HubLayout.astro`.
- Emitted `Organization` + `WebSite` (`SearchAction` targeting `/?q={search_term_string}`) on `src/pages/index.astro`, and `TechArticle` + ordered `BreadcrumbList` on `src/layouts/DocsLayout.astro`.
- Verified `npx --yes tsx --test src/utils/seo.test.ts src/utils/search.test.ts` (`8/8` pass), `compile_applet`, `lint_applet` (`tsc --noEmit`), `node scripts/verify-build.mjs`, and `JSON.parse` validation on built `<script type="application/ld+json">` outputs.

## 2026-11-18 — SEO-Phase 03: AI Search Engine Indexes (`/llms-full.txt`, Per-Page `.md` & Edge Headers)

- Created shared `src/utils/llms.ts` helper (`resolveProductEntries`, `readCleanMarkdownBody`, `buildRootLlmsText`, `buildProductLlmsText`, `buildRootLlmsFullText`, `buildSingleDocMarkdownText`, `routeToMarkdownPath`) and refactored `src/pages/llms.txt.ts` and `src/pages/[product]/llms.txt.ts` to eliminate duplicate YAML-stripping logic.
- Added static root `/llms-full.txt` (`src/pages/llms-full.txt.ts`) and per-page clean Markdown routes (`src/pages/[product]/[...slug].md.ts` -> `/{product}/{slug}.md`).
- Added `<link rel="alternate">` AI discovery links (`/llms.txt`, per-page `.md`, and product `llms.txt`) in `src/layouts/BaseLayout.astro` and `src/layouts/DocsLayout.astro`, plus UTF-8 `text/plain` / `text/markdown` Cloudflare edge headers in `public/_headers`.
- Verified `compile_applet`, `lint_applet` (`tsc --noEmit`), `node scripts/verify-build.mjs` (`6` HTML files, `14` assets, `0` broken links), `dist/llms-full.txt` (`20,030` bytes), and all per-page `.md` exports.

## 2026-11-18 — SEO-Phase 04: `?q=` SearchAction Parity, Pagefind Tuning, Verifier & Docs Sync

- Added URL `?q=` query parameter handling in `src/components/ui/SearchModal.astro` so Google `SearchAction` (`/?q={search_term_string}`) links auto-open and populate Pagefind search safely (capped at `120` chars, cleaned via `history.replaceState` on close).
- Tuned Pagefind relevance in `src/layouts/DocsLayout.astro` with `data-pagefind-ignore="all"` on `<nav aria-label="Breadcrumb">` and `data-pagefind-weight="10"` on fallback article `<h1>`.
- Upgraded `scripts/verify-build.mjs` to enforce `/llms-full.txt`, per-page `.md` parity for every `flatPages` route, `<meta name="robots" content="noindex, ...">` on `dist/404.html`, and valid `JSON.parse()` on every `<script type="application/ld+json">` tag.
- Updated `src/MANIFEST.md`, `notes/010-seo-phase-execution-tracker.md`, `notes/012-actual-implementation-matrix.md`, and `project/04-codebase-reference.md`.
- Verified `npx --yes tsx --test src/utils/seo.test.ts src/utils/search.test.ts` (`8/8` pass), `compile_applet`, `lint_applet` (`tsc --noEmit`), `node scripts/verify-build.mjs` (`6` HTML files, `15` required assets, `0` broken links), and live Chromium `http://localhost:3000/?q=deployment` (`13` links, `0` console errors).

## 2026-11-18 — Brand Logo, Product Icon & Favicon Visibility Fix

- Moved the canonical portal brand logo outside gitignored `public/logos/*` to `public/vib-tools-logo.png` (and added `docs/logo.png` for `vib-docs-engine`), updating `config/site.config.json` and both portal presets (`user-portal`, `dev-portal`) so `brandLogo` never disappears during sync or workspace resets and `ProjectCard` / `Topbar` display the Vib Tools mark.
- Added `<link rel="shortcut icon" href="/favicon.ico">` and `<link rel="icon" type="image/png" href="/web-app-manifest-192x192.png" sizes="192x192">` to `src/layouts/BaseLayout.astro`, updated `public/site.webmanifest` to include explicit `"any"` and `"maskable"` icon purposes, and extended `scripts/verify-build.mjs` to check all `link[rel*="icon"]` targets in `dist/`.
- Verified `npx --yes tsx --test src/utils/seo.test.ts src/utils/search.test.ts` (`8/8`), `npm run verify` (`6` HTML files, `15` required assets, `0` broken links), `compile_applet`, `lint_applet`, and headless Chromium dark/light captures confirming `180x180` logos in Header, Footer, `ProjectCard`, and `Topbar`.

## 2026-11-18 — `VT-Phase 01`: `.vibtools/` Pure Schema, Dual-Portal Resolver, Smart Markdown Extractor & `portalType`

- Created zero-dependency `src/utils/vibtoolsConfig.ts` (`parseVibtoolsRepoConfig`, `normalizeRegistryEntry`, `resolvePortalProjectConfig`, `extractMarkdownMetadata`, `deriveSlugFromSource`, `normalizeRelativeRepoPath`) and `src/utils/vibtoolsConfig.test.ts` supporting `docs.config.json` / `config.docs.json`, `users`/`developer`/`both` targeting, `..`/absolute path containment guards, bare `repoUrl` registry strings, override precedence, and frontmatter-free Markdown title/description/version extraction.
- Added `portalType?: "users" | "developer" | "all"` to `SiteConfig` (`src/utils/manifest.ts`), `config/site.config.json` (`"all"`), `config/presets/user-portal/site.config.json` (`"users"`), and `config/presets/dev-portal/site.config.json` (`"developer"`).
- Verified `npx --yes tsx --test src/utils/vibtoolsConfig.test.ts src/utils/seo.test.ts src/utils/search.test.ts` (`14/14` pass), `compile_applet`, `lint_applet` (`tsc --noEmit`), and `node scripts/verify-build.mjs`.

## 2026-11-18 — `VT-Phase 02`: Two-Step `.vibtools/` Sparse Checkout, `portalType` Filtering & Logo Discovery

- Updated `scripts/sync-docs.mjs` to normalize bare `repoUrl` strings and partial overrides, perform 2-step Git sparse checkout (`cloneMetadataFirst` for `.vibtools/` -> `readVibtoolsConfigFromRoot` supporting `docs.config.json` / `config.docs.json` with conflict guard -> `resolvePortalProjectConfig` `portalType` filtering -> `addGitSparsePaths` for target `docsPath` and `logoPath`), guard against duplicate resolved slugs (`reservedSlugs`), validate `.vibtools/` and custom `logoPath` logos (`tryCopyValidatedLogo`), and fall back to `extractMarkdownMetadata` when frontmatter/config lack metadata.
- Verified `npm run sync`, `node scripts/verify-build.mjs`, `npx --yes tsx --test` (`14/14` pass), isolated 2-step Git sparse-checkout smoke test (`src/` & non-matching targets never checked out), `compile_applet`, and `lint_applet`.

## 2026-11-18 — `VT-Phase 03`: Minimal `repoUrl`-Only CLI Flow, Verifier Guardrails, Presets & Engine `.vibtools/`

- Added `.vibtools/docs.config.json` and `.vibtools/logo.png` in the `vib-docs-engine` root (`docsType: "developer"`, `slug: "vib-docs-engine"`, `docsPath: "docs"`, `logoPath: ".vibtools/logo.png"`, `version: "0.1.0"`).
- Upgraded `scripts/add-project.mjs` with `--url <repoUrl>` fast `.vibtools/` onboarding, interactive `[1] .vibtools/ Auto` vs `[2] Manual` modes, and `VT-EH-08` duplicate `repoUrl` (unless distinct `--slug` override is provided) and duplicate slug guards.
- Upgraded `scripts/verify-build.mjs` (`validateVibtoolsAndRegistry`) to validate root `.vibtools/` syntax/schema/paths/logos (including `docs.config.json` + `config.docs.json` conflict guard), `config/site.config.json` `portalType`, and `config/projects.json` duplicate/schema integrity.
- Updated `config/presets/user-portal/projects.json` and `config/presets/dev-portal/projects.json` to showcase compact `.vibtools/` `repoUrl`-only entries alongside optional overrides.
- Verified `npm run sync`, `export-portal` + `npm run sync` across `user` (`2/2`) and `dev` (`2/2`) portals, `--url` CLI + duplicate/credential guards + interactive Auto mode, `npx --yes tsx --test` (`14/14` pass), `node scripts/verify-build.mjs`, `compile_applet`, and `lint_applet`.

## 2026-11-18 — `VT-Phase 04`: `.vibtools/` & `config.docs.json` Schema Documentation + Governance Sync

- Added `docs/vibtools-config.md` covering `.vibtools/docs.config.json` and `config.docs.json`, conflict rules, two-step sparse-checkout behavior, complete field reference, `portalType` filtering, Smart Markdown fallback precedence, logo security validation, single/dual-portal templates, minimal `projects.json` examples, and Draft 2020-12 JSON Schema.
- Updated `docs/adding-projects.md`, `docs/index.md`, and `docs/deployment.md` to elevate `.vibtools/` + bare `repoUrl` / `add-project --url` onboarding and document `portalType` split deployment.
- Synchronized `docs/MANIFEST.md`, root `MANIFEST.md`, `src/utils/MANIFEST.md`, `project/04-codebase-reference.md`, and `.vibtools/` phase trackers (`notes/016`, `notes/018`, `notes/020`).
- Verified `compile_applet`, `lint_applet`, `npx --yes tsx --test src/utils/*.test.ts` (`14/14` pass), `node scripts/verify-build.mjs` (`7` HTML files, `15` required assets, `0` broken links), `/vib-docs-engine/vibtools-config.md`, and live headless Chromium dark/light renders (`0` console errors/warnings).

## 2026-11-18 — `REL-Phase 01`: Dual-Target `all` Resolver, Version Badge Guard, `npm test` & MDX Config Cleanup

- Updated `selectActiveTarget` in `src/utils/vibtoolsConfig.ts` so `portalType: "all"` portals respect explicit `registryEntry.docsType` (`"developer"` vs `"users"`) when a `.vibtools` repository defines both `targets.users` and `targets.developer` (`AUDIT-F02`, `REL-EH-01`).
- Added `formatVersionBadge` in `src/utils/theme.ts` and wired it into `src/components/hub/ProjectCard.astro` and `src/components/docs/Topbar.astro` to strip extra leading `v`/`V` characters and prevent `"vv"` version badges (`AUDIT-F06`, `REL-EH-03`).
- Added `"test": "npx --yes tsx --test src/utils/*.test.ts"` to `package.json` (`AUDIT-F03`), removed the deprecated duplicate `remarkPlugins` option from `mdx()` in `astro.config.mjs` (`AUDIT-F10.1`), and expanded `src/utils/vibtoolsConfig.test.ts` with `portalType: "all"` and `formatVersionBadge` tests.
- Verified `npm test` (`16/16` pass), `npm run lint`, `npx tsc -p functions/tsconfig.json --noEmit`, `npm run verify` (`7` HTML files, `15` assets, `5` Pagefind pages, `0` broken links, zero MDX deprecation warning), `compile_applet`, `lint_applet`, and headless Chromium captures (`v0.1.0` badges, `0` console errors).

## 2026-11-18 — `REL-Phase 02`: Sparse Branch Switch, Portal Exporter Hygiene & Webhook Fail-Closed Guard

- Added `switchGitSparseBranch` in `scripts/sync-docs.mjs` so repositories whose `.vibtools/docs.config.json` resolves a different `branch` than `entry.branch` fetch and switch to that branch in sparse checkout prior to materializing `docsPath` and `logoPath` (`AUDIT-F04`, `REL-EH-02`). Removed `repoRootForMetadata = projectRoot` from `YOUR_ORG` starter fixture fallbacks.
- Updated `scripts/export-portal.mjs` to exclude the engine's root `.vibtools/` folder during `--portal user` exports and detect both bare string and `.repoUrl` object `YOUR_ORG` placeholders in the reminder notice (`AUDIT-F08`, `REL-EH-04`).
- Hardened `functions/api/webhook.ts` (`WebhookEnv`, `onRequestPost`) to fail closed with HTTP `501` when `WEBHOOK_SECRET` is unset unless `ALLOW_UNAUTHENTICATED_WEBHOOK="true"` is explicitly set (`AUDIT-F09`, `REL-EH-05`).
- Verified `npm test` (`16/16` pass), `npm run lint`, `npx tsc -p functions/tsconfig.json --noEmit`, multi-branch bare-Git sparse checkout (`main` -> `docs-v2`), `webhook.ts` handler checks (`501`/`401`/`202`), `export-portal --portal user|dev` syncs, `npm run verify` (`7` HTML files, `15` required assets, `5` Pagefind pages, `0` broken links), `compile_applet`, and `lint_applet`.

## 2026-11-18 — `REL-Phase 03`: Docker Git Binary, Nginx Cache/Security Alignment, Workflow Trigger & Governance Sync

- Updated `Dockerfile` builder stage to install `git` and `openssh-client` via `apk add --no-cache git openssh-client` so remote HTTPS/SSH sparse checkouts succeed in Alpine Docker builds (`AUDIT-F01`, `REL-EH-06`).
- Updated `nginx.conf` to mirror `public/_headers` (`AUDIT-F05`, `REL-EH-06`): switched `/pagefind/` from `immutable` (`1y`) to `public, max-age=3600, must-revalidate`, added `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: strict-origin-when-cross-origin` across `server` and location blocks, removed duplicate `Cache-Control` emission from paired `expires` directives, and enabled `charset_types text/markdown text/plain` so `.md` exports serve `text/markdown; charset=utf-8`.
- Added `".vibtools/**"` to `on.push.paths` in `templates/github-notify-docs.yml` (`AUDIT-F07`).
- Synchronized `docs/deployment.md`, `docs/adding-projects.md`, `docs/vibtools-config.md`, `project/04-codebase-reference.md`, and `notes/024`–`026`.
- Verified `npm test` (`16/16` pass), `npm run lint`, `npx tsc -p functions/tsconfig.json --noEmit`, `npm run verify` (`7` HTML files, `15` assets, `5` Pagefind pages, `0` broken links), live `nginx` syntax & HTTP header suite (`NGINX_SYNTAX: PASS`, `NGINX_LIVE_HEADERS: PASS`), live Chromium render (`Errors: 0, Warnings: 0`), `compile_applet`, and `lint_applet`.

## 2026-11-18 — `CF2-Phase 01`: Cloudflare Pages Functions Runtime Hardening (`CF2-F01` – `CF2-F04`)

- Exported `onRequestHead` in `functions/api/health.ts` (`200`, `Cache-Control: no-store`) and updated `onRequest` `Allow: GET, HEAD` so uptime monitors sending `HEAD /api/health` succeed instead of receiving `405`.
- Hardened `functions/api/webhook.ts`: added `isAllowedDeployHookUrl` (`https:` or loopback test URLs), `isPingWebhookEvent` skipping GitHub/Gitea/Forgejo `ping` events after authentication with HTTP `200`, `application/x-www-form-urlencoded` `payload=` unwrapping in `parseBranchFromPayload` so `ALLOWED_BRANCHES` enforces branch filtering on form-encoded webhooks, a 10-second `AbortController` timeout, and `hookResponse.body?.cancel()` stream cleanup.
- Verified `npx tsc -p functions/tsconfig.json --noEmit`, `npm test` (`16/16` pass), `npm run lint`, `CF2_PHASE01_FUNCTIONS_PROOF: PASS`, `compile_applet`, and `lint_applet`.

## 2026-11-18 — `CF2-Phase 02`: Cloudflare Build Determinism, Wrangler Naming, Exporter & `_headers` Parity (`CF2-F06` – `CF2-F08`)

- Added `scripts/run-astro.mjs` to invoke Astro natively on Node `>=22.23.4` (including Cloudflare Pages `22.24.0`) while limiting the `process.versions.webcontainer` floor shim to Node `22.22.0`–`22.23.3` containers; updated `package.json` scripts and set `engines.node` to `">=22.23.4"`.
- Updated `wrangler.toml` comments to accurately document required fail-closed `WEBHOOK_SECRET` and `ALLOW_UNAUTHENTICATED_WEBHOOK` opt-out.
- Updated `scripts/export-portal.mjs` to omit `bun.lock`/`bun.lockb` on npm-based exports, set portal-specific `wrangler.toml` names (`docs-vib-tools` vs `developer-vibtools-io`), and update `public/site.webmanifest` metadata (`name`, `short_name`, `theme_color`) from the selected preset.
- Updated `public/_headers` with `/*.md` depth coverage and explicit `/site.webmanifest` `Content-Type: application/manifest+json; charset=utf-8`.
- Verified `npm test` (`16/16`), `npm run lint`, `npx tsc -p functions/tsconfig.json --noEmit`, `npm run verify` (`7` HTML files, `15` assets, `5` Pagefind pages, `0` broken links), `CF2_PHASE02_EXPORT_PROOF: PASS`, `compile_applet`, and `lint_applet`.

## 2026-11-18 — `CF2-Phase 03`: `dist/` Governance File Pruning, Strict CI `YOUR_ORG` Guard & Deployment Docs Sync (`CF2-F05`, `CF2-F09`)

- Added `vib-prune-public-governance-docs` (`astro:build:done` hook) in `astro.config.mjs` and a corresponding assertion in `scripts/verify-build.mjs` so `public/MANIFEST.md` and `public/README.md` remain tracked in the repository but are never published to `dist/MANIFEST.md` or `dist/README.md` (`CF2-F05`).
- Added fail-closed `CF_PAGES=1` / `STRICT_SYNC=1` / `--strict` guards in `scripts/sync-docs.mjs` and `scripts/verify-build.mjs` rejecting unreplaced `YOUR_ORG` starter repository URLs in production CI while preserving the local `./docs` fixture fallback for local smoke builds (`CF2-F09`).
- Synchronized `docs/deployment.md`, `project/04-codebase-reference.md`, and `notes/028-cf2-roadmap-and-execution-tracker.md`.
- Verified `npm test` (`16/16`), `npm run lint`, `npx tsc -p functions/tsconfig.json --noEmit`, `npm run verify` (`7` HTML files, `15` assets, `5` Pagefind pages, `0` broken links), `CF2_PHASE03_PROOF: PASS`, `compile_applet`, and `lint_applet`.

## 2026-11-18 — `CF2-Phase 04`: Official Node `22.23.5` Pin, Root `bun.lock` Removal, Registry `package-lock.json` & Workspace Artifact Hygiene (`CF2-F10` – `CF2-F13`)

- Updated `.node-version` and `.nvmrc` from `22.24.0` (unpublished on `nodejs.org/dist/`, HTTP `404`) to official `22.23.5` (HTTP `200`, satisfying Astro 7's `>=22.23.4` requirement) so Cloudflare Pages container Node setup succeeds (`CF2-F10`).
- Removed conflicting root `/bun.lock` and added `bun.lock` / `bun.lockb` to `.gitignore` and `.dockerignore` so repositories pushed to GitHub use a single canonical `package-lock.json` (`CF2-F11`).
- Regenerated `package-lock.json` cleanly from the npm registry (`511` total packages, `505` with `resolved` + `integrity` hashes, `156` cross-platform optional binaries including `linux-x64-gnu`, `linux-x64-musl`, `darwin-arm64`, and `engines.node: ">=22.23.4"`) (`CF2-F12`).
- Removed leaked `public/assets/aistudio/` chat screenshots, ignored `.aistudio/` and `public/assets/aistudio/` in `.gitignore`, `.dockerignore`, and `scripts/export-portal.mjs`, extended `astro.config.mjs` (`vib-prune-public-governance-docs`) to prune `dist/assets/aistudio`, and added automated assertions in `scripts/verify-build.mjs` (`CF2-F13`).
- Updated `config/site.config.json` `navLinks` GitHub organization URL from `https://github.com/vibtools` to `https://github.com/vibtoolshq`.
- Synchronized `MANIFEST.md`, `docs/deployment.md`, `project/04-codebase-reference.md`, `notes/027`, and `notes/028`.

## 2026-11-19 — AI-Readable `/vib-docs-engine/` Specification, Hosted `.vibtools/` JSON Schema & 2-Organization Onboarding Rules

- Added `VIBTOOLS_SCHEMA_PATH` (`"/schemas/vibtools-docs.schema.json"`), optional `$schema` validation in `parseVibtoolsRepoConfig`, and `buildVibtoolsJsonSchema(schemaId)` (Draft 2020-12 JSON Schema with exact regex patterns and descriptions) in `src/utils/vibtoolsConfig.ts` + unit tests in `src/utils/vibtoolsConfig.test.ts`.
- Added static hosted JSON Schema endpoint `src/pages/schemas/vibtools-docs.schema.json.ts` (`/schemas/vibtools-docs.schema.json`, `application/schema+json; charset=utf-8`), edge headers in `public/_headers` and `nginx.conf`, `<link rel="alternate" href="/llms-full.txt">` and `<link rel="describedby" href="/schemas/vibtools-docs.schema.json">` in `src/layouts/BaseLayout.astro`, and required artifact verification in `scripts/verify-build.mjs`.
- Upgraded `src/utils/llms.ts` (`buildRootLlmsText`, `buildProductLlmsText`, `buildRootLlmsFullText`) to expose `Portal Type`, `.vibtools Config JSON Schema`, `Markdown Entry`, and per-page `[Markdown]` links in `/llms.txt` and `/<product>/llms.txt`.
- Expanded `docs/index.md`, `docs/vibtools-config.md`, `docs/adding-projects.md`, and `.vibtools/docs.config.json` with the AI-agent quick-start table, 2-organization architecture (`https://github.com/vibtoolshq` for open-source projects vs `https://github.com/vibdocs` for public docs-only repositories of private projects), complete `.vibtools/docs.config.json` & `docs/` authoring rules, production templates, Draft 2020-12 JSON Schema, and 10-point AI agent self-verification checklist.

## 2026-11-19 — Audited & Onboarded `https://github.com/vibdocs/CalGrid` (`docs.vib.tools`) + Parent `index.md` Sidebar Tie-Breaker

- Audited `https://github.com/vibdocs/CalGrid.git` (`10/10` pass on `.vibtools/docs.config.json`, `.vibtools/logo.png`, root `docs/index.md`, auto-stripped `docs/MANIFEST.md`, 5 section groups, and 32 documentation pages).
- Registered `"https://github.com/vibdocs/CalGrid.git"` in `config/projects.json` and `config/presets/user-portal/projects.json`.
- Updated `scripts/sync-docs.mjs` to prioritize explicit `project.title` (from `.vibtools/docs.config.json` or `config/projects.json`) for the product's manifest `title` (`"CalGrid"`) before falling back to `index.md` frontmatter `title` (`"CalGrid — User Documentation"`).
- Enhanced `src/utils/sidebar.ts` (`extractIndexLinkOrder`, `compareItems`, `walk`) so `isIndex` pages sort first at every directory level and siblings tying on `order`/`numericPrefix` follow the relative link order declared in the parent `index.md` (`Getting Started` -> `Feature Guides` -> `Workflows` -> `Settings` -> `Help & Troubleshooting`).
- Verified `npm test` (`17/17` pass), `npm run lint`, `npx tsc -p functions/tsconfig.json --noEmit`, and `npm run verify` (`39` HTML files, `16` required assets, `2` projects, `37` Pagefind pages, `0` broken links).

## 2026-11-19 — GitHub-Ready SEO Markdown Suite & Verified Vib Tools Company/Author Profile

- Upgraded `README.md` with an SEO-friendly tagline and summary, complete A–Z feature matrix covering all implemented engine capabilities (`.vibtools/` auto-discovery, two-step Git sparse checkout, dual-portal routing, 2-organization workflow for `vibtoolshq` and `vibdocs`, Smart Markdown extraction, deterministic sidebar + parent `index.md` link-order tie-breaker, Pagefind search, Schema.org JSON-LD, `/llms.txt` + `/llms-full.txt` + `/*.md` + `/schemas/vibtools-docs.schema.json`, Cloudflare Pages + Functions, Docker + Nginx), and the full verified Vib Tools author/company contact block from `VIB_TOOLS_COMPANY_AUTHOR_MASTER_CONTEXT.md`.
- Upgraded `CONTRIBUTING.md` and `SECURITY.md` with current verification commands (`npm test`, `npm run lint`, `npx tsc -p functions/tsconfig.json --noEmit`, `npm run verify`), built-in security controls table, and official contact channels (`support@vibtools.io`, `hello@vibtools.io`).
- Added `SUPPORT.md`, removed `.github/README.md` (merging its description into `.github/MANIFEST.md` so GitHub renders the root `/README.md` on the repository homepage instead of `.github/README.md`), and updated `.github/ISSUE_TEMPLATE/config.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `AGENTS.md`, `project/04-codebase-reference.md`, and root `MANIFEST.md`.
- Marked `vib-docs-engine` as production release `1.0.0` (`v1.0.0`) across `package.json`, `package-lock.json`, `.vibtools/docs.config.json`, `config/projects.json`, `docs/index.md`, and `docs/vibtools-config.md`.

## 2026-11-19 — Developer-Only Portal Configuration (`https://developer.vibtools.io`) & Strict `.vibtools/` `docsType: "dev" | "developer"` Enforcement

- Configured `config/site.config.json` directly for `https://developer.vibtools.io` (`portalTitle: "Vib Tools Developer Hub"`, `defaultAccent: "#2563EB"`, `portalType: "developer"`, `navLinks` to `https://vib.tools` and `https://github.com/vibtoolshq`) and updated `config/projects.json`, `.vibtools/docs.config.json`, `public/site.webmanifest`, `wrangler.toml` (`name = "developer-vibtools-io"`), and portal presets to remove `CalGrid` and `docs.vib.tools` URLs/CTAs and point `vib-docs-engine` to `https://github.com/vibtoolshq/vib-docs-engine`.
- Updated `src/utils/vibtoolsConfig.ts` (`normalizeDocsType`, `parseVibtoolsRepoConfig`, `normalizeRegistryEntry`, `selectActiveTarget`, `buildVibtoolsJsonSchema`) to accept both `"dev"` and `"developer"` as developer `docsType` values, default the JSON Schema `$id` to `https://developer.vibtools.io/schemas/vibtools-docs.schema.json`, and strictly enforce on `portalType: "developer"` that only repositories declaring `docsType: "dev"` / `"developer"` (or explicit `targets.developer`) are synced—rejecting any `users` or untyped repositories.
- Replaced all user-portal (`docs.vib.tools`, `CalGrid`, `Get CalGrid`, `Get License`) URLs, schema links, and examples across `docs/index.md`, `docs/vibtools-config.md`, `docs/adding-projects.md`, `docs/deployment.md`, `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, and `.github/ISSUE_TEMPLATE/config.yml` with `https://developer.vibtools.io` and `https://github.com/vibtoolshq/*` developer repositories.

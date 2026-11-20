# Current Codebase Reference

This reference maps checked-in source to responsibilities. Build outputs, synchronized docs, and dependency internals are intentionally excluded. Update this document whenever modules or behavior change.

## Root configuration and commands

`package.json`: npm lifecycle commands. `predev` and `prebuild` run `scripts/sync-docs.mjs`; `build` runs Astro then Pagefind; `verify` builds and runs `scripts/verify-build.mjs`; `add-project` and `export-portal` invoke their built-in Node CLI scripts.

## Key Function Map

| File                                  | Function                                                   | Responsibility                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `scripts/sync-docs.mjs`               | `parseJsonFile` / `requireText`                            | Read site/project JSON config.                                                                                     |
| `scripts/sync-docs.mjs`               | `sanitizeError`                                            | Redact secrets and credential-bearing HTTPS URLs in errors.                                                        |
| `scripts/sync-docs.mjs`               | `clearOutputDirectory`                                     | Clear generated output while preserving `.gitkeep` and configured static brand logos.                              |
| `scripts/sync-docs.mjs`               | `assertWithin`                                             | Prevent local docs paths escaping the engine directory.                                                            |
| `scripts/sync-docs.mjs`               | `copyTree`                                                 | Recursively copy docs and relative assets; reject symlinks.                                                        |
| `scripts/sync-docs.mjs`               | `normalizeDocsTree` / `resolveRootIndexPath`               | Recursively strip `MANIFEST.md` and `draft: true` pages, deduplicate or promote `README.md` to `index.md`, and validate `draft` boolean frontmatter. |
| `scripts/sync-docs.mjs`               | `resolveSecretValue` / `resolveProjectAuth`                | Resolve per-project `secretKey`/`gitToken`/`gitTokenEnv` (direct value or `$ENV_VAR`) and optional `gitUsername`.  |
| `scripts/sync-docs.mjs`               | `authenticatedCloneUrl` / `cloneMetadataFirst` / `switchGitSparseBranch` | Clone public repos or private repos (with `secretKey`/`GIT_TOKEN`), read `.vibtools/` first, switch branches in a bounded `nextSparseBranchTarget` loop, and re-read `.vibtools/` + `resolvePortalProjectConfig()` on the target branch. |
| `scripts/sync-docs.mjs`               | `formatSlug` / `metadataString` / `titleFromMarkdown`      | Validate frontmatter metadata types and provide title/heading/slug fallbacks passed into `resolveProjectDisplayMetadata`. |
| `scripts/sync-docs.mjs`               | `findLogo`                                                 | Find, validate, and copy supported logos/icons.                                                                    |
| `scripts/sync-docs.mjs`               | `loadSidebarBuilder` / `loadSyncMetadataHelpers`           | Transpile typed shared `sidebar.ts` and `syncMetadata.ts` modules for Node execution.                              |
| `scripts/sync-docs.mjs`               | `syncProject`                                              | Copy one project's source, run bounded branch re-resolution + post-branch duplicate slug checks, normalize docs tree, resolve display metadata (`.vibtools/` > frontmatter > Smart Markdown > heading/slug), extract logo, and create enriched record. |
| `scripts/sync-docs.mjs`               | `main`                                                     | Validate config, preserve brand logo in `public/logos/`, isolate per-project failures, derive categories, and write the manifest. |
| `src/utils/sidebar.ts`                | `buildSidebar`                                             | Public entry point returning nested `sidebar` and ordered `flatPages`.                                             |
| `src/utils/sidebar.ts`                | `cleanSegment` / `humanize`                                | Remove numeric route prefixes and create display labels.                                                           |
| `src/utils/sidebar.ts`                | `inspectPage` / `compareItems`                             | Read frontmatter/order, exclude `draft: true` pages, preserve `"Overview"` for root index, sort index pages first at all directory levels, break equal `order`/`numericPrefix` ties using parent `index.md` link appearance order, and apply deterministic alphabetical fallback. |
| `src/utils/sidebar.ts`                | `walk` / `flatten`                                         | Recursively create sidebar groups (excluding `MANIFEST.md` and redundant `README.md`) and depth-first pagination.  |
| `src/utils/theme.ts`                  | `resolveAccentColor`                                       | Validate project/site accent and return the safe default if invalid.                                               |
| `src/utils/theme.ts`                  | `getMonogram` / `formatVersionBadge`                       | Derive one/two uppercase monogram initials and normalize version strings (`v` prefix without doubling).            |
| `scripts/add-project.mjs`             | `parseCliArgs` / `canonicalRepoKey` / `assertNoDuplicateEntry` | Parse `--url` `.vibtools/` quick flags or interactive Auto/Manual prompts and reject duplicate `repoUrl`/slugs or credentialed remotes (`VT-EH-08`). |
| `scripts/add-project.mjs`             | `runInteractiveAutoMode` / `runInteractiveManualMode` / `main` | Collect bare `repoUrl` entries or full override objects, enforce paired CTA fields, and atomically replace `config/projects.json`. |
| `scripts/export-portal.mjs`           | `parseArgs`                                                | Validate portal selector and output directory options.                                                             |
| `scripts/export-portal.mjs`           | `isWithin` / `shouldSkip`                                  | Prevent recursive exports and omit generated/vendor/preset/notes paths (plus engine `.vibtools/` on `--portal user`). |
| `scripts/export-portal.mjs`           | `copyEngine`                                               | Recursively copy clean source and preserve `.gitkeep` in generated roots.                                          |
| `scripts/export-portal.mjs`           | `main`                                                     | Validate preset, export to staging, inject paired configs, warn on `YOUR_ORG` strings/objects, atomically rename.  |
| `scripts/verify-build.mjs`            | `validateVibtoolsAndRegistry`                              | Validate root `.vibtools/` (`docs.config.json` / `config.docs.json` conflict guard, schema, `docsPath`, `logoPath`), `portalType`, and `config/projects.json` duplicates. |
| `scripts/verify-build.mjs`            | `exists` / `walkHtml` / `routeToHtml`                      | Check required output files, enumerate built HTML, and map manifest routes to static HTML files.                   |
| `scripts/verify-build.mjs`            | `isInternalReference` / `resolveCandidatePath`             | Classify root-relative and document-relative references and resolve them safely inside `dist/`.                    |
| `scripts/verify-build.mjs`            | `resolveInternalHref` / `resolveInternalAsset` / `main`    | Verify required assets (SEO, AI indexes, favicons, webmanifest, OG image, brand logo), routes, per-page `.md`, `404` `noindex`, JSON-LD syntax, `_routes.json`/`_redirects`, internal links, and `img[src]` files. |
| `src/components/ui/SearchModal.astro` | `getPagefind` / `search`                                   | Lazy-load Pagefind once and issue global or product-filtered queries.                                              |
| `src/components/ui/SearchModal.astro` | `safeResultUrl` / `appendSafeExcerpt` / `createResultItem` | Keep results same-origin, render excerpts as text plus safe accent-tinted `mark` nodes, and display nested sub-results. |
| `src/components/ui/SearchModal.astro` | `renderInitialState` / `recordCurrentDocVisit` / `openModal` / `closeModal` / `readInitialSearchQuery` | Show `Recently viewed` (`localStorage`) + manifest `Suggested` links on open, auto-open `?q=` queries (`SearchAction`), preserve scroll gutter, and handle keyboard navigation. |
| `src/utils/search.ts`                 | `normalizeRoutePath` / `formatBreadcrumb` / `upsertRecentDoc` / `buildQuickSuggestions` / `selectInitialSuggestions` | Pure search UI helpers for breadcrumbs, deduplicated recent history, and scoped initial suggestions. |
| `src/utils/seo.ts`                    | `resolveOrigin` / `resolveAbsoluteUrl` / `safeJsonLdStringify` / `buildHubJsonLd` / `buildDocJsonLd`               | XSS-safe Schema.org JSON-LD builders (`Organization`, `WebSite` + `SearchAction`, `TechArticle`, `BreadcrumbList`). |
| `src/utils/llms.ts`                   | `resolveProductEntries` / `readCleanMarkdownBody` / `buildRootLlmsText` / `buildProductLlmsText` / `buildRootLlmsFullText` / `buildSingleDocMarkdownText` | Shared AI index & per-page YAML-free Markdown export builders (`llms.txt`, `llms-full.txt`, `*.md`).              |
| `functions/api/health.ts`             | `onRequestGet` / `onRequestHead` / `onRequest`             | Cloudflare Pages Function health check endpoint (`GET` & `HEAD /api/health`, `405` on other methods).                |
| `functions/api/webhook.ts`            | `onRequestPost` / `verifyHmacSha256` / `isPingWebhookEvent` / `parseBranchFromPayload` | Cloudflare Pages Function fail-closed webhook relay (`POST /api/webhook`, HTTPS hook check, `ping` skip, JSON & form-urlencoded `ALLOWED_BRANCHES`, HMAC-SHA256/`Bearer`/`X-Gitlab-Token`, 10s timeout & response body cancel). |

## Dependency Rationale

- Astro, Content Collections, and `@astrojs/mdx` compile Markdown/MDX to static routes and render content at build time.
- Tailwind CSS v4 and `@tailwindcss/typography` supply the compact tokenized design system and prose styling.
- Expressive Code renders syntax-highlighted code at build time; it does not require a runtime code service.
- `@astrojs/sitemap` generates the static sitemap from the configured canonical domain.
- Pagefind creates the local post-build search index; the browser loads it only after opening search. Included in `dependencies` so Cloudflare Pages production installs never omit it.
- `gray-matter` parses source frontmatter; Zod validates site/project configuration and schemas.
- TypeScript supplies shared contracts and transpiles the typed sidebar helper for the sync script.
- `lucide-astro` compiles icons into the page; no runtime icon API is used.
- `@astrojs/markdown-remark` supplies Astro's Unified processor so shared remark plugins (`externalMarkdownLinks` and `rewriteInternalMarkdownLinks`) apply across both Markdown and MDX.

## Directory Documentation Policy

Tracked, non-routable authored folders carry a local `README.md` and `MANIFEST.md` for purpose and direct-child inventory. Route-mapped directories (`src/pages/`, `src/pages/[product]/`, and `functions/`) and `.github/` intentionally do not: files in `src/pages/` and `functions/` map to routes/handlers, and GitHub prioritizes `.github/README.md` over the root `/README.md` on the repository homepage. Their inventory lives in `.github/MANIFEST.md`, `MANIFEST.md`, `src/MANIFEST.md`, and this reference. Generated/vendor directories (`node_modules/`, `.astro/`, `.wrangler/`, `dist/`, `src/content/docs/`, `src/generated/`, `public/logos/`, and Playwright artifacts) are also documented from their parent because sync/build owns or removes their contents.

- `package-lock.json`: reproducible registry-backed dependency lockfile for npm CI (`npm ci`) with `resolved` tarball URLs, `integrity` hashes, cross-platform optional binaries (`linux-x64-gnu`, `linux-x64-musl`, `darwin-arm64`), and `engines.node: ">=22.23.4"`. Conflicting `bun.lock` / `bun.lockb` files are excluded.
- `astro.config.mjs`: dynamic site domain, static output, Astro integrations (MDX, sitemap, Expressive Code, Tailwind Vite, and `vib-prune-public-governance-docs` removing `dist/MANIFEST.md`, `dist/README.md`, and any `dist/assets/aistudio` post-build), `servePagefindInDev` Vite middleware for dev-mode `/pagefind/*` search, and shared Remark plugins (`externalMarkdownLinks` for safe `_blank` external links and `rewriteInternalMarkdownLinks` with `cleanSegment` normalizing punctuation/underscores to hyphens, handling `README.md`/`index.md`, and clamping relative `..` links inside `{productSlug}`).
- `tsconfig.json` & `functions/tsconfig.json`: strict TypeScript setup for Astro (`tsconfig.json`) and isolated Worker/Edge types for Cloudflare Pages Functions (`functions/tsconfig.json`).
- `wrangler.toml`, `.node-version`, `.nvmrc`: Cloudflare Pages & Functions configuration (`pages_build_output_dir = "dist"`) and official Node.js `22.23.5` runtime pinning.
- `public/_headers`, `public/_redirects`, `public/_routes.json`: Cloudflare Pages static edge cache/security/text headers (including `/llms.txt` and `/robots.txt`), relative redirect file, and `/api/*` Functions invocation rules copied into `dist/`.
- `Dockerfile` / `nginx.conf`: multi-stage static image (`node:22-alpine` builder installs `git` and `openssh-client` for sparse-checkout builds; `nginx:alpine` serves `dist/` with security headers, immutable `/_astro/*`, 1-hour `must-revalidate` `/pagefind/*`, and UTF-8 Markdown/text headers aligned with `public/_headers`); `.dockerignore` excludes local secrets and build/dependency output.
- `AGENTS.md`: repository documentation/change process.

## Configuration

- `.vibtools/docs.config.json` & `.vibtools/logo.png`: canonical repository self-configuration (`$schema: "https://developer.vibtools.io/schemas/vibtools-docs.schema.json"`, `docsType: "developer"` | `"dev"`, `slug`, `category`, `docsPath`, `logoPath`, `version`, `ctaUrl: "https://github.com/vibtoolshq/vib-docs-engine"`).
- `config/site.config.json`: active developer portal configuration (`portalTitle: "Vib Tools Developer Hub"`, `domain: "https://developer.vibtools.io"`, `defaultAccent: "#2563EB"`, `portalType: "developer"`, and navigation).
- `config/projects.json`: active developer project records (`docscaffold`, `SocketCore`, `VPS-MCP`, `KronOTP`, `UpdatePilot` under `https://github.com/vibtoolshq/*`). `branch`/`docsPath` default cleanly; categories derive from resolved records. `localPath` is test-only and must not be used in deployed config.
- `config/presets/dev-portal/` & `config/presets/user-portal/`: portal configuration presets aligned with `developer.vibtools.io`.

## Build and content source

- `scripts/sync-docs.mjs`: validates `site.config.json` (including `portalType`), normalizes bare `repoUrl` strings or override objects in `projects.json`, runs 2-step Git sparse checkout (`.vibtools` metadata first -> bounded branch switch via `nextSparseBranchTarget` with `.vibtools/` re-read and `resolvePortalProjectConfig()` re-resolution on target branch -> post-branch duplicate slug checks -> resolved `docsPath` + `logoPath`), reads `.vibtools/docs.config.json` or `config.docs.json`, enforces `portalType: "developer"` (accepting only `"docsType": "developer"` / `"dev"` or `targets.developer` and rejecting user or untyped configs), validates `.vibtools/`/custom/docs logos, resolves display metadata in strict precedence (`.vibtools/` > root `index.md` frontmatter > Smart Markdown extraction > `# H1` / slug), builds sidebar trees, writes `src/generated/manifest.json`, and clears stale Astro Content Layer cache (`node_modules/.astro/data-store.json`, `.astro/data-store.json`).
- `src/utils/sidebar.ts`: `buildSidebar` recursively reads `.md`/`.mdx`, derives normalized routes/titles (using subfolder `index.md` titles for group headers when present), sorts by order/numeric prefix/name, detects route collisions, and produces sidebar plus flat pagination pages.
- `src/utils/manifest.ts`: TypeScript contracts for portal config, products, sidebar nodes, and page-order entries.
- `src/content.config.ts`: Astro `docs` collection using the glob loader and permissive optional frontmatter schema.
- `src/content/docs/`: generated content copied from project repositories. Never author or hand-edit here.
- `src/generated/manifest.json`: generated cross-phase data contract. Never hand-edit; `npm run sync` owns it.
- `src/styles/global.css`: Tailwind v4 entry, light/dark tokens, base styles, and `.docs-prose` rules.

## UI modules and routes

- `src/layouts/BaseLayout.astro`: CSS entry, theme-before-paint script, SEO/canonical/`rel="sitemap"`/`rel="alternate"` (`llms.txt` + optional alternate links)/OpenGraph (`ogType`, `og:image:alt`, `og-default.png`), optional `robots` meta (`noindex, follow` on 404), optional Schema.org JSON-LD (`safeJsonLdStringify`), favicon/Apple touch icon suite, webmanifest, global search modal mount.
- `src/layouts/HubLayout.astro`: balanced 3-slot `h-14` portal header (`brandName / Docs`, centered untruncated search trigger, external nav links with `ArrowUpRight` and hairline divider, theme control), optional `robots` & `structuredData` forwarding, and compact 4-column manifest-driven footer (`Brand`, `Documentation`, `Resources`, `Connect`, plus copyright/domain bar).
- `src/layouts/DocsLayout.astro`: article metadata (`ogType="article"`, `TechArticle` + `BreadcrumbList` JSON-LD, `<link rel="alternate">` for per-page `.md` and product `llms.txt`), Pagefind body/filter/meta/H1 weight boost/ignored breadcrumb, sidebar, topbar, TOC, Prev/Next placement.
- `src/components/hub/CategoryTabs.astro`: dynamic category filtering; omitted for zero/one category.
- `src/components/hub/ProjectCard.astro`: manifest-backed link, logo/monogram, category, description, normalized version badge.
- `src/components/docs/Topbar.astro`: matching `h-14` 3-slot docs header with product switcher, normalized version badge, centered scoped search trigger, external CTA button with arrow cue, divider, theme toggle, and mobile sidebar control.
- `src/components/docs/Sidebar.astro` and `SidebarTree.astro`: recursive navigation, trailing-slash normalized active state, active group header styling, and mobile drawer.
- `src/components/docs/TableOfContents.astro`: heading links and scroll spy.
- `src/components/docs/PrevNextNav.astro`: validated source edit URL and adjacent flat-page links.
- `src/components/mdx/Callout.astro` and `CodeTabs.astro`: MDX callouts and client-side tab groups (supporting both explicit `data-code-panel` wrappers and direct child code blocks).
- `src/components/ui/ThemeToggle.astro` / `SearchModal.astro`: unified `size-8` persistent theme switch and centered Pagefind global/scoped search palette with `?q=` URL deep-linking, `Recently viewed` + manifest `Suggested` links, `ArrowDown`/`ArrowUp`/`Enter` keyboard navigation, and dual-theme contrast.
- `src/utils/theme.ts`, `src/utils/search.ts`, `src/utils/seo.ts`, `src/utils/llms.ts`, `src/utils/vibtoolsConfig.ts` & `src/utils/syncMetadata.ts`: accent validation/monogram/version-badge helpers, pure search UI helpers, XSS-safe Schema.org JSON-LD builders, shared AI Markdown/LLMs generators (including `.vibtools` JSON Schema & Markdown links), `.vibtools/` repo-config schema (`normalizeDocsType` normalizing `"dev"` -> `"developer"`, strict developer-only `selectActiveTarget`) + Draft 2020-12 JSON Schema builder (`buildVibtoolsJsonSchema`) + Smart Markdown extractor, and pure sync precedence/branch-target helpers (`resolveProjectDisplayMetadata`, `nextSparseBranchTarget`).
- `src/pages/index.astro`: static Hub route featuring a compact developer-first Command-Bar Hero (`[data-search-trigger]` showing live project/page counts alongside a 3-row `Developer Endpoints` card for `/llms.txt`, `/llms-full.txt`, and `/schemas/vibtools-docs.schema.json`) plus `Organization` + `WebSite` JSON-LD above `CategoryTabs` and `ProjectCard` grid.
- `src/pages/[product]/[...slug].astro` & `src/pages/[product]/[...slug].md.ts`: manifest/collection route parity; renders HTML doc routes plus clean per-page static Markdown exports (`/{product}/{slug}.md`).
- `src/pages/[product]/llms.txt.ts`, `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts`, `src/pages/schemas/vibtools-docs.schema.json.ts`, `src/pages/robots.txt.ts`, `src/pages/404.astro`: static AI indexes (`/llms.txt`, `/llms-full.txt`, per-product `llms.txt`), canonical `.vibtools/docs.config.json` Draft 2020-12 JSON Schema (`/schemas/vibtools-docs.schema.json`), crawler instructions (`Allow: /`, `Disallow: /pagefind/`, `Sitemap`), and `noindex, follow` fallback page.

## Automation

- `scripts/add-project.mjs`: `.vibtools/` quick CLI (`--url`) and interactive Auto/Manual registry writer. Rejects duplicate `repoUrl` (unless a distinct `--slug` override is set) and duplicate resolved slugs, accepts Git remotes or in-repository local test paths, enforces paired CTA configuration, and atomically replaces `config/projects.json`.
- `scripts/export-portal.mjs`: copies the clean source tree to a new external directory, excludes generated/vendor/preset/notes/playwright/`.aistudio`/`public/assets/aistudio`/artifacts/`bun.lock` paths (and engine `.vibtools/` on `--portal user`), preserves `.gitkeep`, injects one selected preset plus matching `wrangler.toml` `name` and `public/site.webmanifest` branding, warns on `YOUR_ORG` strings/objects, and refuses an existing output path.
- `scripts/run-astro.mjs`: invokes Astro CLI natively on Node `>=22.23.4` while applying the `process.versions.webcontainer='1'` floor shim strictly on sandbox Node `22.22.0`–`22.23.3`.
- `scripts/verify-build.mjs`: validates root `.vibtools/` config (`docs.config.json` / `config.docs.json` conflict guard, schema, contained `docsPath`/`logoPath`), `config/site.config.json` `portalType`, `config/projects.json` duplicate/schema integrity (plus strict `YOUR_ORG` rejection under `CF_PAGES`/`STRICT_SYNC`/`--strict`), `.node-version`/`.nvmrc` parity (`>=22.23.4`, rejecting unpublished `22.24.0`), absence of conflicting `bun.lock`/`bun.lockb`, `package-lock.json` registry `resolved` metadata + `engines.node: ">=22.23.4"`, absence of leaked `dist/MANIFEST.md`, `dist/README.md`, and `dist/assets/aistudio`, required build artifacts, manifest routes, product `llms.txt`, per-page `.md`, `dist/404.html` `noindex`, JSON-LD parsing, and internal link/asset resolution inside `dist/`.
- `templates/github-notify-docs.yml`: GitHub Actions push-to-main (`docs/**` and `.vibtools/**`) build-hook caller.
- `templates/webhook-trigger.sh`: protected environment-variable curl hook for other Git hosts/VPS pipelines.

## Local setup and verification

Use `npm ci` in clean CI or `npm install` locally. Set Git credentials through environment/deployment secrets only. Run `npm test`, `npm run lint`, `npm run sync`, `npm run dev`, `npm run build`, `npm run verify`, or `npm run preview` for their corresponding tasks. The exact production checks and portal deployment steps live in `docs/deployment.md`.

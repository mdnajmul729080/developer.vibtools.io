# 02. Features and Workflow

## Source-of-truth inputs

`config/projects.json` is an array; each project supplies `slug`, `category`, `accentColor`, a Git `repoUrl` (or test-only `localPath`), `ctaLabel`, and `ctaUrl`. `branch` defaults to `main`; `docsPath` defaults to `docs`. Optional `title`, `description`, and `version` fields are fallback metadata. Do not hardcode categories, project slugs, category colors, CTA rules, or portal-specific behavior in app source. Categories are unique values derived from the registry in first-seen order.

`config/site.config.json` owns portal title/subtitle, canonical domain, brand name/logo, default accent, and navigation. The same source code is deployed to two portals by changing only these two config files.

## Product onboarding and zero-code updates

1. Keep authored docs in the product repo's `docs/` folder. Add `docs/index.md` with YAML frontmatter and any nested Markdown/MDX pages or assets.
2. Add one project record with a unique URL-safe slug, dynamic category, accent, repository, CTA, and optional fallback metadata.
3. Configure the deployment's protected build hook to react to pushes to the docs branch.
4. The build runs `prebuild` sync, Astro static generation, then Pagefind. No app source edit or manual copy is needed.

Updating documentation is a docs-repository commit followed by a rebuild. `localPath` exists only for isolated local fixtures and must not be part of production config. Public repositories need no secret. Private HTTPS repositories receive `GIT_TOKEN` from deployment secrets and may set `GIT_USERNAME`; credentials never belong in the repository URL or generated manifest.

## Smart metadata and logo extraction

Read `docs/index.md` with `gray-matter`. Resolve metadata in this exact order:

- **Title:** frontmatter `title` -> first Markdown `# H1` -> `config/projects.json` `title` -> humanized slug.
- **Description:** frontmatter `description` -> config `description` -> empty string.
- **Version:** frontmatter `version` -> config `version` -> empty string. Quote versions in YAML, for example `version: "2.1.0"`, to preserve string formatting.

Frontmatter metadata is plain text, never trusted HTML. A malformed YAML block or invalid metadata type is a product-specific build error.

Search the docs root, `assets/`, and `images/` for the first supported file in this order: `logo.svg`, `logo.png`, `icon.svg`, `icon.png`. Copy it to `public/logos/<slug>.<ext>` and set `logoUrl` to `/logos/<slug>.<ext>`. Validate file size/type, do not inline untrusted SVG markup, and use no external image service. If there is no acceptable logo, UI renders a clean geometric monogram badge using the product's first letter and `accentColor`.

## Adaptive routes, sidebar, and pagination

Support a project with one `docs/index.md` as well as a large nested guide tree. Recursively scan `.md` and `.mdx` pages; ignore other files for navigation. Preserve folders as route hierarchy. Strip leading numeric filename/folder prefixes from visible labels and URLs: `01-install.md` becomes `/<slug>/install/`, while its prefix controls ordering.

Sort items by frontmatter `order` first, numeric filename/folder prefix second, then alphabetically. `index.md` is always first at the product root. Use frontmatter `title` when present; otherwise humanize the file/directory name. Build a nested `sidebar` tree for collapsible navigation and a stable depth-first `flatPages` list for Previous/Next pagination. Detect normalized route collisions and fail with an actionable error. A directory group links to its index page when one exists.

The sync output is `src/content/docs/<slug>/`, logos are in `public/logos/`, and `src/generated/manifest.json` contains `generatedAt`, validated `site`, unique `categories`, and successful enriched `projects` with metadata, `logoUrl`, `sidebar`, and `flatPages`. Exclude temporary `localPath` and all credentials from the manifest. A failed project logs a redacted warning and does not prevent other projects from syncing; if none succeed, fail the build instead of emitting an empty manifest.

## Hub portal (`/`)

The Hub is the compact entry point. It uses configured brand/title, global search trigger, configured nav links, and theme toggle. Show client-side category filter tabs only if `categories.length > 1`; hide them entirely otherwise. Filtering is instant, keyboard accessible, and includes “All” plus a useful empty state. Cards show logo/monogram, product name, version pill, two-line description, category tag, and a “Read Docs” affordance. Product data comes only from the generated manifest.

## Three-column product reader (`/[product]/[...slug]`)

- **Sticky header:** `← Hub`, product logo/name, manifest-driven Product Switcher dropdown, `Ctrl+K` search trigger, dynamic project CTA (`View repository`, `GitHub`, etc.), and dark/light theme toggle.
- **Collapsible left sidebar:** recursive groups, active route highlighted with product `accentColor`, current page remains discoverable and keyboard operable.
- **Center reading column:** `max-w-[740px]`; breadcrumbs; title and metadata; prose; code blocks with Expressive Code, copy button, filename header and diff highlighting; `Note`, `Tip`, `Warning`, `Danger` callouts; “Edit this page on Git”; Previous/Next navigation.
- **Sticky right TOC:** “On This Page” heading outline with scroll-spy active heading.

Do not open links unsafely. The Edit link is formed from validated repository, branch, and source path. The switcher and CTA derive from config/manifest, not hardcoded lists.

## Scoped and global static search

Pagefind indexes final static HTML into `dist/pagefind/`. `Ctrl+K` opens search, with the platform-equivalent modifier where appropriate. Offer global portal search and search scoped to the active product. Include product/page context, keyboard navigation, Escape close, and empty/no-result states. All index assets are local; there are no live repository searches or external search APIs.

## SEO and AI-readable endpoints

Generate canonical URLs from `site.domain`, canonical/OpenGraph metadata, and a sitemap index covering all published static routes. Generate global `/llms.txt` for portal overview and product links, plus `/<product>/llms.txt` with product metadata and its documentation page links. These are build-time static files with escaped content and collision-checked routes, never runtime API responses.

## Operational resilience and acceptance

Use argument-array Git execution without shell interpolation; sparse checkout fetches only the configured docs subtree. Validate URL schemes, colors, slugs, duplicate slugs/routes, docs paths, and frontmatter before publish. Avoid symlink traversal, redact credentials, clean temporary checkouts, and preserve `.gitkeep` during output cleanup. Failed sync/build must not replace the live static deployment. Webhooks must target a protected host build hook or a verified, rate-limited receiver.

Adding a product requires configuration and its docs repository only. Metadata falls back predictably, logos degrade to monograms, categories are dynamic, routes/sidebar/pagination remain deterministic, search/SEO/AI indexes are static, and the browser makes no product API calls.

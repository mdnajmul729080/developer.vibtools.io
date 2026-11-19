# 01. System Architecture

## End-to-end data pipeline

```text
[Product Repo: GitHub / GitLab / Gitea]
	└── docs/ (index.md, guides/*.md, logo.svg)
			 │
			 ▼ (git push triggers Webhook -> Cloudflare Pages / VPS Docker Build)
[Build Step 1: scripts/sync-docs.mjs]
	├── Reads config/site.config.json & config/projects.json
	├── Runs shallow `git sparse-checkout` (fetches ONLY docs/ folder per repo)
	├── Copies markdown files -> src/content/docs/<slug>/
	├── Extracts title, description, version from docs/index.md frontmatter
	├── Extracts docs/logo.svg|png -> public/logos/<slug>.*
	└── Generates nested sidebar tree & flat pagination -> src/generated/manifest.json
			 │
			 ▼
[Build Step 2: Astro + Tailwind CSS v4 + Expressive Code]
	├── Compiles static Hub page (/) & dynamic product routes (/<slug>/[...page])
	├── Injects route-scoped --accent-color & product branding per route
	└── Generates sitemap-index.xml & llms.txt endpoints
			 │
			 ▼
[Build Step 3: Pagefind Post-Build Indexer]
	└── Generates static search index in dist/pagefind/ (supports Global + Per-Product scoped search)
```

The pipeline above is implemented across the Astro routes, layouts, Pagefind search, sitemap, robots, and `llms.txt` endpoints. `scripts/sync-docs.mjs` remains the boundary between external product repositories and static site generation. A failed production sync/build must prevent deployment from replacing the last known-good site.

## Developer portal deployment (`https://developer.vibtools.io`)

This repository is configured and deployed as the developer documentation portal at `https://developer.vibtools.io` (`portalType: "developer"`):

- `https://developer.vibtools.io` publishes developer/open-source documentation for SDKs, engines, modules, and self-hosted tools.
- `scripts/sync-docs.mjs` enforces `portalType: "developer"` via `resolvePortalProjectConfig()` in `src/utils/vibtoolsConfig.ts`, accepting only repositories that explicitly declare `"docsType": "dev"` or `"docsType": "developer"` (or a `targets.developer` block) in `.vibtools/docs.config.json`.

Never add hardcoded product lists or category allowlists to application source. Keep deployment secrets, generated content, build output, and webhooks isolated.

## Build-time synchronization

`scripts/sync-docs.mjs` reads and validates the portal config and project array. Each project record has a URL-safe unique slug, category, accent, Git remote (or optional temporary `localPath` for testing), branch, docs path, CTA, and optional metadata fallbacks. Defaults are `branch: "main"` and `docsPath: "docs"`. Categories are derived from successfully synchronized records.

For remote repos, use `execFileSync` with argument arrays, shallow clone, blob filtering, sparse mode, then `git sparse-checkout set <docsPath>`. Git transport supports GitHub, GitLab, and self-hosted Gitea/Forgejo without provider API clients. Do not fetch full product source intentionally. Local test paths must remain inside this repository; they are not included in public manifest data or production project config.

`GIT_TOKEN` is accepted only from deployment environment for HTTPS Git authentication; `GIT_USERNAME` can override the host's default token username. Never commit tokens, include credentials in a repo URL, print secrets, or write them to the manifest. Git prompting is disabled for builds. A per-project fetch/copy failure produces a redacted warning and the loop continues; if no project succeeds, fail the build rather than writing an empty manifest. Temporary checkouts are removed in all cases.

Sync clears `src/content/docs/`, `public/logos/`, and `src/generated/` while preserving `.gitkeep`. It copies the selected docs tree to `src/content/docs/<slug>/`, normalizes `README.md` to `index.md` when needed, extracts metadata and an accepted logo, and calls the recursive sidebar builder. `src/generated/manifest.json` contains `generatedAt`, validated `site`, unique `categories`, and enriched successful `projects`, including sidebar and flat pagination data. It must never contain a token, local path, or private transport credential.

Content is untrusted. Reject path traversal and duplicate slugs/routes; do not follow source symlinks. Validate frontmatter, colors, and URLs. Run Git without shell interpolation, constrain local paths, keep temporary work isolated, and make warnings actionable without exposing secrets.

## Static rendering boundary

Astro Content Collections load Markdown/MDX from `src/content/docs/` using a permissive optional frontmatter schema. During later UI phases Astro will use the generated manifest and collection data to build `/`, `/<product>/`, and nested `/<product>/[...page]` routes, navigation, article headings, previous/next links, sitemap-index, and global/per-product `llms.txt`. Tailwind CSS v4 supplies styles and Expressive Code handles syntax highlighting. The product accent is injected as `--accent-color` on product-scoped routes, falling back to `site.defaultAccent`.

Pagefind runs after Astro against `dist/` and writes `dist/pagefind/`. It indexes only marked documentation article bodies and supports global and per-product scope. A production portal has no server-rendered request path or client-side Git/docs API calls. `npm run verify` runs the full build and checks expected outputs, each manifest route, product AI indexes, and root-relative links.

The generated manifest is a public build input, not a secrets store. Emit only normalized metadata and public links. Never ship environment variables, credentials, private clone URLs, or local source paths.

## Webhooks and hosting

Pushes that affect a product's configured docs branch should trigger a portal rebuild. Prefer a host-native build hook. If a custom webhook receiver is used, verify provider signatures, rate-limit it, protect the build hook, and enqueue a build from the configured branch. Never expose an unauthenticated shell command.

### Cloudflare Pages: pure static

Create a Pages build hook per portal and configure each source repo's push webhook to call the correct hook. The build installs from the lockfile, runs `prebuild` sync, Astro, and Pagefind, then publishes `dist/`. Configure secrets only in the deployment environment. Cloudflare serves the static output; it does not fetch docs during visitor requests.

### Self-hosted VPS: multi-stage Docker + Nginx

Use a multi-stage Docker build. The builder stage installs dependencies, receives narrowly scoped Git credentials as build secrets, runs sync/Astro/Pagefind, and produces `dist/`. The final image contains only Nginx and static output; it must not contain Git credentials, Node dependencies, or source checkout history. A protected webhook/CI receiver starts builds. Publish by atomically switching a completed staging artifact so a failed sync never replaces the live site. Nginx only serves static files.

## Configuration and source ownership

- `config/site.config.json`: portal title/subtitle, canonical HTTPS domain, branding, default accent, navigation.
- `config/projects.json`: products, dynamic category values, remotes, branch/docs path, CTA, and optional fallbacks.
- `src/content/docs/`: synchronized content only; ignored by Git except `.gitkeep`.
- `src/generated/`: generated manifest/data only; ignored by Git except `.gitkeep`.
- `public/logos/`: generated product logos plus independently managed portal branding assets.
- Product-authored docs belong in each product repository's `docs/` folder, never in the website source tree.

## Acceptance criteria

The same source builds both portals by configuration alone. A new product requires only a registry record and a docs repository. Builds validate inputs, report failed projects safely, clean temporary clones, produce deterministic routes/navigation/manifest, and publish static output only after success. No category/product/portal logic is hardcoded and no secret or provider API dependency reaches the browser.

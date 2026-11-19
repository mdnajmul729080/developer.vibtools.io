# 032 — Convert Repository & Sync Engine to Developer-Only Portal (`https://developer.vibtools.io`)

**Date:** `2026-11-19`
**Goal:** Configure `vib-docs-engine` (`https://github.com/vibtoolshq/vib-docs-engine`) as a dedicated Developer-Only Documentation Portal for `https://developer.vibtools.io/`, replace all `docs.vib.tools` and user-portal URLs/CTAs (`CalGrid`, `Get License`, `JILLU-Games`, etc.) with developer-portal equivalents (`https://developer.vibtools.io`, `https://github.com/vibtoolshq/*`), and enforce in `.vibtools/` resolution that only projects declaring `docsType: "dev"` or `docsType: "developer"` (or explicit `targets.developer`) are accepted.

---

## 1. Inspected Files

- `config/site.config.json`
- `config/projects.json`
- `config/presets/dev-portal/site.config.json`
- `config/presets/dev-portal/projects.json`
- `.vibtools/docs.config.json`
- `public/site.webmanifest`
- `public/_redirects`
- `wrangler.toml`
- `src/utils/vibtoolsConfig.ts`
- `src/utils/vibtoolsConfig.test.ts`
- `docs/index.md`
- `docs/vibtools-config.md`
- `docs/adding-projects.md`
- `docs/deployment.md`
- `README.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `SUPPORT.md`
- `project/00-vision-and-purpose.md`
- `project/01-architecture.md`
- `project/04-codebase-reference.md`
- `project/CHANGELOG.md`

---

## 2. Implementation Plan

1. **Enforce Developer-Only `.vibtools/` `docsType` (`"dev"` / `"developer"`) in `src/utils/vibtoolsConfig.ts`:**
   - Accept `"dev"` as a first-class alias for `"developer"` (and `"user"` for `"users"`) in `parseVibtoolsRepoConfig`, `normalizeRegistryEntry`, and `buildVibtoolsJsonSchema`.
   - Harden `selectActiveTarget` so when `portalType === "developer"`, a repository is accepted **only** if its `.vibtools` configuration explicitly declares `docsType: "dev"` / `"developer"` (or defines `targets.developer` without `docsType: "users"`), or if an explicit registry override sets `docsType: "dev"` / `"developer"`. Any `users` project or project lacking developer `docsType` is skipped.
   - Update the default schema `$id` in `buildVibtoolsJsonSchema` to `https://developer.vibtools.io/schemas/vibtools-docs.schema.json`.
   - Expand unit tests in `src/utils/vibtoolsConfig.test.ts` to verify `"docsType": "dev"`, `"docsType": "developer"`, rejection of `"docsType": "users"`, and rejection of untyped repos on `portalType: "developer"`.
2. **Switch Active Portal Configuration & Metadata to `https://developer.vibtools.io`:**
   - Update `config/site.config.json` to `portalTitle: "Vib Tools Developer Hub"`, `domain: "https://developer.vibtools.io"`, `defaultAccent: "#2563EB"`, `portalType: "developer"`, and developer `navLinks` (`https://vib.tools`, `https://github.com/vibtoolshq`).
   - Update `config/projects.json` to remove `CalGrid` and point `vib-docs-engine` to `https://github.com/vibtoolshq/vib-docs-engine.git` (`ctaUrl: "https://github.com/vibtoolshq/vib-docs-engine"`, `docsType: "developer"`, `accentColor: "#2563EB"`).
   - Update `.vibtools/docs.config.json` (`$schema: "https://developer.vibtools.io/schemas/vibtools-docs.schema.json"`, `docsType: "developer"`, `accentColor: "#2563EB"`, `ctaUrl: "https://github.com/vibtoolshq/vib-docs-engine"`).
   - Align `config/presets/dev-portal/site.config.json`, `config/presets/dev-portal/projects.json`, `public/site.webmanifest`, `public/_redirects`, and `wrangler.toml`.
3. **Replace User-Portal (`docs.vib.tools` / `CalGrid`) URLs & CTAs Across Docs and Repo Guides:**
   - Update `docs/index.md`, `docs/vibtools-config.md`, `docs/adding-projects.md`, `docs/deployment.md`, `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `SUPPORT.md` so all schema URLs, live links, examples, and CTAs reference `https://developer.vibtools.io` and developer repositories (`https://github.com/vibtoolshq/*`).
4. **Verification Check:**
   - Run `npm test`, `npm run lint`, `npx tsc -p functions/tsconfig.json --noEmit`, and `npm run verify`.
   - Verify via `grep` that zero `docs.vib.tools`, `CalGrid`, or `JILLU-Games` references remain in active configs, `src/`, `docs/`, or root Markdown guides.
   - Verify the live rendered portal in headless Chromium on `http://localhost:3000`.

---

## 3. Execution Log & Verification Results

- **Completed Steps:**
  1. Hardened `src/utils/vibtoolsConfig.ts` with `ACCEPTED_DOCS_TYPE_INPUTS` (`"developer"`, `"dev"`, `"users"`, `"user"`, `"both"`), `normalizeDocsType()`, and strict `selectActiveTarget()` filtering for `portalType: "developer"` so only projects explicitly declaring `docsType: "dev"` / `"developer"` (or a `targets.developer` block without `docsType: "users"`) are accepted.
  2. Updated `config/site.config.json`, `config/projects.json`, `.vibtools/docs.config.json`, `config/presets/**`, `public/site.webmanifest`, `public/_redirects`, `wrangler.toml`, `scripts/export-portal.mjs`, `scripts/add-project.mjs`, `src/utils/seo.ts`, and `.github/ISSUE_TEMPLATE/config.yml` for `https://developer.vibtools.io` (`portalType: "developer"`, `defaultAccent: "#2563EB"`) and `https://github.com/vibtoolshq/vib-docs-engine.git`.
  3. Replaced all `docs.vib.tools`, `CalGrid`, `Get CalGrid`, `Get License`, and `JILLU-Games` references across `docs/*`, `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, and `project/*`.
  4. Verified unit tests (`npm test`: `17/17` pass), TypeScript checks (`npm run lint`, `npx tsc -p functions/tsconfig.json --noEmit`), and full build + verifier (`npm run verify`: `7` HTML files, `16` required assets, `1` developer project `vib-docs-engine`, `0` broken links).
  5. Extended `src/utils/vibtoolsConfig.ts` and `docs/vibtools-config.md` so AI agents reading `/vib-docs-engine/llms.txt`, `/vib-docs-engine/vibtools-config.md`, and `/schemas/vibtools-docs.schema.json` have complete copy-paste templates and validation support for:
     - Developer-only repositories (`"docsType": "developer"`),
     - Dual-portal repositories (`"docsType": "both"` with `targets.developer` and `targets.users`) serving both `developer.vibtools.io` and `docs.vib.tools` from one repo, and
     - User-only repositories (`"docsType": "users"`), which are strictly skipped by `developer.vibtools.io`.
  6. Preserved 100% schema parity with the frozen `docs.vib.tools` JSON Schema in `buildVibtoolsJsonSchema()` (`docsType.enum: ["users", "developer", "both"]`, `targets.properties: { users, developer }`) and unified `docs/vibtools-config.md` so both `docs.vib.tools` and `developer.vibtools.io` share the exact same `.vibtools/docs.config.json` schema without mismatch.




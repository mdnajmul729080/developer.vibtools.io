# 036 — Upstream `.vibtools/` Sync Precedence & Branch Re-Resolution Fix

**Date:** `2026-11-20`
**Goal:** Fix two upstream sync/metadata bugs in `scripts/sync-docs.mjs` so every `npm run build` / Cloudflare Pages redeploy reflects the latest `.vibtools/docs.config.json` (and `docs/`) from all connected repositories without altering the frozen `.vibtools/` schema, UI, SEO/AI endpoints, or build scripts.

---

## 1. Inspected Files & Confirmed Root Causes

- **Inspected:**
  - `scripts/sync-docs.mjs`
  - `src/utils/vibtoolsConfig.ts`
  - `src/utils/vibtoolsConfig.test.ts`
  - `src/utils/MANIFEST.md`
  - `config/site.config.json`
  - `config/projects.json`
- **Root Cause 1 (Display Metadata Precedence in `scripts/sync-docs.mjs`):**
  - `title` prioritized `project.title`, whereas `description` and `version` put `metadataString(frontmatter.*, ...)` ahead of `project.description` / `project.version`, causing older YAML frontmatter in root `docs/index.md` to overwrite updated `.vibtools/` `version` and `targets.developer.description` values.
- **Root Cause 2 (Stale `.vibtools/` After Branch Switch in `scripts/sync-docs.mjs`):**
  - When `.vibtools/` (or `targets.developer`) on the default branch specified a non-default `branch`, `switchGitSparseBranch()` switched branches without re-reading `.vibtools/` (`readVibtoolsConfigFromRoot`) or re-running `resolvePortalProjectConfig()` on the target branch, and `reservedSlugs` was checked before final branch resolution.

---

## 2. Implementation Plan

1. Create zero-dependency `src/utils/syncMetadata.ts` exporting:
   - `resolveProjectDisplayMetadata(input)`: resolves `{ title, description, version }` prioritizing `.vibtools/`/registry fields (preserving `0` / numeric values), then root `index.md` YAML frontmatter, then Smart Markdown extraction, then `# H1` / slug title fallback.
   - `nextSparseBranchTarget(currentBranch, resolvedBranch, visitedBranches, maxSwitches = 2)`: cycle-safe guard preventing no-op switches, branch cycles, and runaway branch redirects.
2. Create `src/utils/syncMetadata.test.ts` covering precedence overrides, fallback chains, numeric `0`, and `nextSparseBranchTarget` bounds/cycles.
3. Update `scripts/sync-docs.mjs`:
   - Load `src/utils/syncMetadata.ts` via `loadSyncMetadataHelpers()`.
   - Loop remote branch switches using `nextSparseBranchTarget()`, re-reading `.vibtools/` and re-resolving `resolvePortalProjectConfig()` after `switchGitSparseBranch()`; skip cleanly if the resolved branch no longer matches `portalType`.
   - Enforce `reservedSlugs` uniqueness only after final branch resolution.
   - Compute `{ title, description, version }` via `resolveProjectDisplayMetadata(...)` after validating frontmatter types via `metadataString(...)`.
4. Update `src/utils/MANIFEST.md`, `project/04-codebase-reference.md`, and `project/CHANGELOG.md`.
5. Run `npm test`, `npm run lint`, `STRICT_SYNC=1 npm run verify`, `npx tsc -p functions/tsconfig.json --noEmit`, inspect `src/generated/manifest.json`, restart dev server, and check rendered Hub cards and a developer doc page in headless Chromium.

---

## 3. Completed Steps & Verification Results

- Created zero-dependency `src/utils/syncMetadata.ts` (`resolveProjectDisplayMetadata`, `nextSparseBranchTarget`) and `src/utils/syncMetadata.test.ts` (4 unit tests).
- Updated `scripts/sync-docs.mjs` (`loadSyncMetadataHelpers()`, bounded `while (resolution.matched)` remote branch re-resolution calling `nextSparseBranchTarget()`, `switchGitSparseBranch()`, `readVibtoolsConfigFromRoot()`, and `resolvePortalProjectConfig()`, deferred post-branch `reservedSlugs` checks, and `resolveProjectDisplayMetadata(...)` strict precedence).
- Kept frozen schema files (`src/utils/vibtoolsConfig.ts`, `src/pages/schemas/vibtools-docs.schema.json.ts`), `package.json`, `config/site.config.json`, UI components, and SEO/AI endpoints untouched.
- Updated `src/utils/MANIFEST.md`, `project/04-codebase-reference.md`, and `project/CHANGELOG.md`.
- **Verification Results:**
  - `npm test`: `21/21` passing (`0` failed).
  - `npm run lint` (`tsc --noEmit`): passed (`0` errors).
  - `npx tsc -p functions/tsconfig.json --noEmit`: passed (`0` errors).
  - `STRICT_SYNC=1 npm run verify`: passed (`131` HTML files, `16` required assets, `5` projects, `129` indexed Pagefind pages / `6279` words, `0` broken internal links).
  - `STRICT_SYNC=1 node scripts/sync-docs.mjs`: synced `docscaffold` (`v1.0.0`, 5 pages), `socketcore` (`1.0.0`, 34 pages), `vps-mcp` (`0.4.0`, 55 pages), `kronotp` (`2.0.0`, 14 pages; warning that configured `.vibtools/logo.webp` is missing/invalid with standard fallback), `updatepilot` (`0.0.1`, 21 pages).
  - Upstream workflow check: all 5 connected `vibtoolshq` repositories currently return HTTP `404` for `.github/workflows/notify-docs.yml` and still require the push workflow + `DOCS_DEPLOY_HOOK_URL` secret to trigger automatic Cloudflare Pages rebuilds on doc pushes.


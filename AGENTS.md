# Repository Agent Instructions

## Documentation-first change process

Before every code, configuration, or documentation change:

1. Read the relevant source files and existing project/docs guidance.
2. Add a dated plan to `notes/` describing the goal, inspected files, small implementation steps, and a concrete verification check. Do this before editing the implementation.
3. During the work, update that note with completed steps, decisions, test results, and any remaining caveat.

After every implemented change, update the durable documentation in `project/` with the affected feature, modules/files, behavior, setup/configuration, and the location of the relevant logic. Update `docs/` with user/operator instructions when observable behavior or operation changes. Append a dated entry to `project/CHANGELOG.md`. Do not claim details that were not confirmed from source or tests; label unknown/not-yet-implemented behavior explicitly.

## Directory ownership

- `notes/`: development-only plans, investigations, and working logs. Never import these files into the app or publish them. The portal exporter must exclude this folder.
- `project/`: tracked source-of-truth specs, code maps, function/module responsibilities, setup decisions, and implementation history. Keep its README and MANIFEST current.
- `docs/`: tracked operator and portal-user guides. Document only behavior confirmed in the implementation. Keep its README and MANIFEST current.
- Tracked, non-routable authored source/config directories should each contain a short `README.md` explaining purpose/ownership and a `MANIFEST.md` inventorying direct children and their roles. `src/pages/`, `src/pages/[product]/`, `functions/`, and `.github/` are intentional exceptions: Astro/Cloudflare treat files in `src/pages/` and `functions/` as routes, and GitHub renders `.github/README.md` instead of the root `/README.md` on the repository home page. Document `.github/` in `.github/MANIFEST.md` and `MANIFEST.md`, and route trees in `src/MANIFEST.md` and `project/04-codebase-reference.md`.
- Do not add governance Markdown to generated or vendor directories: `node_modules/`, `dist/`, `.astro/`, `.playwright-mcp/`, `artifacts/`, `src/content/docs/`, `src/generated/`, or `public/logos/`. These are generated, ignored, or deployment assets; document them from the nearest tracked parent instead.

## Technical accuracy and safety

- Treat the checked-in source and validated build as authoritative. Never guess what a function, page, or button does.
- Preserve user edits and generated data ownership. Do not hand-edit auto-synced `src/content/docs/`, generated `src/generated/manifest.json`, or build output.
- Keep portal configs separate; do not hardcode user/developer products or categories in application code.
- Never put credentials in presets, source URLs, logs, notes intended for export, or generated manifests. Use deployment secrets.
- Keep changes narrow and run the relevant syntax, TypeScript, build, and/or verifier checks after edits.

## Frozen `.vibtools/` Schema Governance (Owner-Order Lock — CRITICAL)

- **Single Immutable Schema Across Both Portals:** The `.vibtools/docs.config.json` (and `.vibtools/config.docs.json`) configuration schema established in `docs.vib.tools` — specified in `project/05-frozen-vibtools-schema.md` and `docs/vibtools-config.md` (`schemaVersion: 1`, `$id: "https://docs.vib.tools/schemas/vibtools-docs.schema.json"`) — is **FINAL AND FROZEN**. Both `https://docs.vib.tools` (`portalType: "users"`) and `https://developer.vibtools.io` (`portalType: "developer"`) collect `docs/` strictly from this exact schema.
- **No Unauthorized Modification:** AI coding agents MUST **NEVER** add, remove, rename, deprecate, or alter any field, type, enum value, regex pattern, `additionalProperties: false` guard, `docsPath`/`targets` resolution rule, or schema output format in `src/utils/vibtoolsConfig.ts`, `src/pages/schemas/vibtools-docs.schema.json.ts`, `scripts/sync-docs.mjs`, `scripts/verify-build.mjs`, `docs/vibtools-config.md`, or `project/05-frozen-vibtools-schema.md` during any bugfix, refactor, UI polish, or feature update **unless the repository Owner issues an explicit direct instruction authorizing that schema change**.
- **Verify Compatibility After Any Edit:** Whenever fixing code or updating the engine, verify that `src/utils/vibtoolsConfig.test.ts` and `npm run verify` continue to pass against the unchanged frozen schema without breaking existing `.vibtools/docs.config.json` repositories.


# 035 — Freeze `.vibtools/` Docs Config Schema (Documents-Only Write Scope Lock)

**Date:** `2026-11-20`
**Scope Lock:** **Documents-Only Write Scope Lock** (`*.md` only under `AGENTS.md`, `project/`, `docs/`, and `notes/`). Zero application source code, scripts, config JSON, or runtime schema implementation files may be modified.

---

## 1. Objective & Inspected Files

- **Goal:** Formally freeze the `.vibtools/docs.config.json` (and `.vibtools/config.docs.json`) configuration schema established in `docs.vib.tools` as the **single immutable contract** used by both **`https://docs.vib.tools`** (`portalType: "users"`) and **`https://developer.vibtools.io`** (`portalType: "developer"`), and lock AI agent guidelines (`AGENTS.md`), project specifications (`project/`), and operator documentation (`docs/`) so no AI agent may ever alter, extend, rename, or break the schema during any future code update or bugfix without explicit **Owner authorization**.
- **Inspected Authoritative Files (Read-Only Source of Truth):**
  - `src/utils/vibtoolsConfig.ts` (`buildVibtoolsJsonSchema`, `parseVibtoolsRepoConfig`, `resolvePortalProjectConfig`, `selectActiveTarget`, `normalizeDocsType`)
  - `AGENTS.md`
  - `docs/vibtools-config.md`, `docs/index.md`, `docs/MANIFEST.md`
  - `project/README.md`, `project/MANIFEST.md`, `project/00-vision-and-purpose.md`, `project/01-architecture.md`, `project/CHANGELOG.md`

---

## 2. Implementation Plan (Markdown Only)

1. Create `project/05-frozen-vibtools-schema.md` containing the complete, immutable, owner-locked `.vibtools/` schema specification, field reference, dual-portal (`docs.vib.tools` + `developer.vibtools.io`) resolution matrix, protected implementation anchors, and canonical Draft 2020-12 JSON Schema.
2. Update `AGENTS.md` with a prominent **Frozen `.vibtools/` Schema Governance (Owner-Order Lock)** rule prohibiting any AI coding agent from changing, adding, removing, renaming, relaxing, or breaking the `.vibtools/` schema or portal routing rules without explicit Owner permission.
3. Update `project/README.md`, `project/MANIFEST.md`, `project/00-vision-and-purpose.md`, `project/01-architecture.md`, and `project/CHANGELOG.md` to reference and lock `project/05-frozen-vibtools-schema.md` as immutable.
4. Update `docs/vibtools-config.md` and `docs/index.md` with explicit **FROZEN CONTRACT (`docs.vib.tools` / `schemaVersion: 1`)** banners and AI-agent immutability rules confirming both `docs.vib.tools` and `developer.vibtools.io` sync `docs/` from the same frozen schema.
5. Verify with read-only checks (`git status`, `npm test`, `npm run lint`, and `npm run verify` without modifying any non-Markdown file).

---

## 3. Completed Work & Verification

- Created `project/05-frozen-vibtools-schema.md` containing the complete frozen `docs.vib.tools` `.vibtools/docs.config.json` contract (`schemaVersion: 1`, `$id: "https://docs.vib.tools/schemas/vibtools-docs.schema.json"`, dual-portal routing matrix, protected fields, Draft 2020-12 JSON Schema, and protected implementation anchors).
- Updated `AGENTS.md`, `project/README.md`, `project/MANIFEST.md`, `project/00-vision-and-purpose.md`, `project/01-architecture.md`, `project/CHANGELOG.md`, `docs/vibtools-config.md`, and `docs/index.md` under strict **Documents-Only Write Scope Lock** (only `.md` files edited).


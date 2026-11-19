---
title: ".vibtools/ Configuration"
description: "Complete AI-agent and developer specification for .vibtools/docs.config.json, developer portal docsType rules, docs/ folder structure, frontmatter rules, and JSON Schema."
version: "1.0.0"
---

# `.vibtools/` & `docs/` Repository Specification (Developer & AI Agent Reference)

This document is the canonical specification for setting up `.vibtools/` and `docs/` inside any developer repository so **Vib Docs Engine** can automatically sync, validate, categorize, and publish its documentation to **`https://developer.vibtools.io`** (`Vib Tools Developer Hub`).

> **For AI Coding Agents:** Everything required to configure a new or existing developer repository is specified on this page. You can also fetch the raw Markdown at `/vib-docs-engine/vibtools-config.md`, the full engine bundle at `/vib-docs-engine/llms.txt`, or the machine-readable JSON Schema at `/schemas/vibtools-docs.schema.json`.

---

## 1. Dual-Portal & Repository Architecture (`developer.vibtools.io` & `docs.vib.tools`)

Both **`https://developer.vibtools.io`** (`"portalType": "developer"`) and **`https://docs.vib.tools`** (`"portalType": "users"`) use the **exact same frozen `.vibtools/docs.config.json` schema**:

| Portal | `portalType` | GitHub Org / Repo Pattern | Required `docsType` in `.vibtools/docs.config.json` |
| :--- | :--- | :--- | :--- |
| **`https://developer.vibtools.io`** | `"developer"` | `https://github.com/vibtoolshq/*` (open-source engines, SDKs, CLI tools, or dual-audience projects) | `"developer"` (developer-only) or `"both"` with `targets.developer` |
| **`https://docs.vib.tools`** | `"users"` | `https://github.com/vibdocs/*` (end-user docs) or `https://github.com/vibtoolshq/*` (dual-audience projects) | `"users"` (user-only) or `"both"` with `targets.users` |

Why this matters when configuring a repo:
- **One Frozen Schema, Two Portals:** Never create incompatible custom schemas per portal. A single `.vibtools/docs.config.json` schema drives both portals through `docsType` (`"developer"`, `"users"`, or `"both"`) and optional `targets.developer` / `targets.users` blocks.
- **Strict Portal Filtering:**
  - `developer.vibtools.io` (`"portalType": "developer"`) syncs **only** repositories declaring `"docsType": "developer"` or `"docsType": "both"` (with `targets.developer`) and skips `"docsType": "users"`.
  - `docs.vib.tools` (`"portalType": "users"`) syncs **only** repositories declaring `"docsType": "users"` or `"docsType": "both"` (with `targets.users`) and skips `"docsType": "developer"`.

---

## 2. Directory Layout & File Naming Rules

### Standard Developer Layout (`docs/`)

Use this layout when the repository's `docs/` folder contains developer, SDK, CLI, or self-hosted documentation (`"docsType": "developer"` or `"docsType": "dev"`):

```text
your-developer-repo/
├── .vibtools/
│   ├── docs.config.json        # Canonical config file (or config.docs.json — NEVER both)
│   └── logo.svg                # Optional project logo (.svg or .png <= 2 MB)
└── docs/
    ├── index.md                # REQUIRED root landing page (or README.md auto-promoted to index.md)
    ├── 01-getting-started.md   # Ordered top-level guide (numeric prefix stripped from URL & label)
    ├── 02-configuration.md
    ├── guides/                 # Subfolder becomes a collapsible sidebar group
    │   ├── index.md            # Optional subfolder overview (its frontmatter title names the sidebar group)
    │   ├── installation.md
    │   └── troubleshooting.md
    └── assets/                 # Optional images referenced via relative Markdown paths
        └── workflow.png
```

### Dedicated Developer & User Split Layout (`docs/dev/` + `docs/users/`)

Use this layout when a single repository contains **both** developer/SDK documentation (`docs/dev/`) and end-user documentation (`docs/users/`), allowing both portals to collect their respective documentation from one repository:

```text
your-multi-audience-repo/
├── .vibtools/
│   ├── docs.config.json        # Sets "docsType": "both" with "targets.developer" and "targets.users"
│   └── logo.svg
└── docs/
    ├── dev/                    # Checked out by developer.vibtools.io (portalType: "developer")
    │   ├── index.md            # REQUIRED root landing page for developer docs
    │   └── 01-architecture.md
    └── users/                  # Checked out by user portal (portalType: "users")
        ├── index.md            # REQUIRED root landing page for user docs
        └── 01-getting-started.md
```

### Strict File Rules for `.vibtools/`

1. **Canonical filename:** `.vibtools/docs.config.json`
2. **Supported alias:** `.vibtools/config.docs.json`
3. **Conflict guard (Fatal Build Error):** Commit **either** `docs.config.json` **or** `config.docs.json` inside `.vibtools/`. If both files exist simultaneously, `scripts/sync-docs.mjs` and `scripts/verify-build.mjs` reject the repository with an explicit conflict error.
4. **JSON validity:** Must be strict, valid JSON (UTF-8, no trailing commas, no `//` comments).

---

## 3. Complete `.vibtools/docs.config.json` Field Reference

Every field is validated by `parseVibtoolsRepoConfig` in `src/utils/vibtoolsConfig.ts` and matched against `/schemas/vibtools-docs.schema.json`:

| Field | Type | Scope | Validation Constraint | Default / Fallback Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `$schema` | `string` | Root only | Non-empty URI string | Set to `"https://docs.vib.tools/schemas/vibtools-docs.schema.json"` or `"https://developer.vibtools.io/schemas/vibtools-docs.schema.json"` (both serve the identical frozen schema). |
| `schemaVersion` | `1` (integer) | Root only | Must equal exact integer `1` | Optional (`1`). Any other value fails validation. |
| `docsType` | `"users" \| "developer" \| "both"` | Root only | Must be one of `"users"`, `"developer"`, or `"both"` | Use `"developer"` for `developer.vibtools.io` only, `"users"` for `docs.vib.tools` only, or `"both"` for dual-portal repos (`targets.developer` + `targets.users`). |
| `slug` | `string` | Root & Target | `^[a-z0-9]+(?:-[a-z0-9]+)*$` (lowercase alphanumeric + single hyphens) | Derived automatically from the repository name in `repoUrl` (e.g., `SocketCore.git` -> `"socketcore"`). |
| `title` | `string` | Root & Target | Non-empty trimmed string | Used for Hub card and topbar title when `index.md` frontmatter lacks `title`. |
| `category` | `string` | Root & Target | Non-empty trimmed string | Hub category filter tab. Defaults to `"Developer Docs"`. |
| `description` | `string` | Root & Target | Non-empty trimmed string | Used for Hub card summary and `<meta name="description">` when `index.md` lacks `description`. |
| `version` | `string \| number` | Root & Target | Non-empty string or finite number | Normalized to string. Displayed in Hub & Topbar version badge (leading `v`/`V` is normalized automatically so `"1.0.0"` and `"v1.0.0"` both render as `v1.0.0`). |
| `accentColor` | `string` | Root & Target | `^#(?:[\da-fA-F]{3}\|[\da-fA-F]{4}\|[\da-fA-F]{6}\|[\da-fA-F]{8})$` | Project brand accent color (e.g., `"#2563EB"`). Falls back to `site.defaultAccent` (`"#2563EB"`) from `config/site.config.json`. |
| `docsPath` | `string` | Root & Target | Relative POSIX directory path inside repo. Must **not** start with `/`, contain `\`, contain `..`, or equal `.` | Defaults to `"docs"`. Examples: `"docs"`, `"docs/dev"`, `"docs/users"`, `"packages/sdk/docs"`. |
| `logoPath` | `string` | Root & Target | Relative POSIX file path inside repo. Must **not** start with `/`, contain `\`, contain `..`, or equal `.` | Optional (e.g. `".vibtools/logo.svg"` or `".vibtools/logo.png"`). Checked before automatic logo discovery. |
| `branch` | `string` | Root & Target | Non-empty Git branch name. Must **not** contain whitespace, `\`, or `..` | Defaults to `"main"`. If `.vibtools/` overrides `branch`, `scripts/sync-docs.mjs` fetches and switches sparse checkout to that branch before checking out `docsPath`. |
| `ctaLabel` | `string` | Root & Target | Non-empty trimmed string | Topbar external action button label (e.g., `"View repository"` or `"GitHub"`). Ignored if `ctaUrl` is omitted. |
| `ctaUrl` | `string` | Root & Target | Valid absolute `http://` or `https://` URL | Topbar external button destination (e.g., `"https://github.com/vibtoolshq/SocketCore"`). |
| `targets` | `object` | Root only | Object containing `"developer"` (or `"dev"`) and/or `"users"` (or `"user"`) target override objects (`minProperties: 1`, `additionalProperties: false`) | Optional per-portal target overrides (`targets.developer` and `targets.users`). Allows a single repository to serve `docs/dev` to the developer portal and `docs/users` to the user portal. |

---

## 4. Portal Routing & Metadata Precedence Rules

### How `developer.vibtools.io` (`"portalType": "developer"`) Filters Repositories

`config/site.config.json` sets `"portalType": "developer"`. During `npm run sync` / `npm run build`, `resolvePortalProjectConfig` enforces:

1. **Accepted Repositories on `developer.vibtools.io`:**
   - **Developer-Only Repo:** `.vibtools/docs.config.json` sets `"docsType": "dev"` or `"docsType": "developer"` (syncs root `docsPath`, default `"docs"`).
   - **Dual-Portal Repo:** `.vibtools/docs.config.json` sets `"docsType": "both"` and defines `targets.developer` (or `targets.dev`), syncing only `targets.developer.docsPath` (e.g. `"docs/dev"`) on `developer.vibtools.io` while a user portal (`portalType: "users"`) syncs `targets.users.docsPath` (e.g. `"docs/users"`).
2. **Skipped / Rejected Repositories on `developer.vibtools.io`:**
   - Any repository whose `.vibtools/docs.config.json` declares `"docsType": "users"` (or `"user"`), or defines only `targets.users`.
   - Any repository whose `.vibtools/docs.config.json` omits `docsType` and has no `targets.developer` block.
   - Skipped repositories log `Skipped <repo> (...)` and are never copied into `src/content/docs/` or `src/generated/manifest.json`.

### Metadata Resolution Order (Highest to Lowest Priority)

When resolving `slug`, `docsPath`, `logoPath`, `branch`, `category`, `accentColor`, `ctaLabel`, and `ctaUrl`:
1. **`config/projects.json` explicit override field** (if the portal registry entry is an object instead of a bare URL string)
2. **`.vibtools/` active developer target** (`targets.developer`)
3. **`.vibtools/` root fields**
4. **Engine defaults** (`branch: "main"`, `docsPath: "docs"`, `slug` from `repoUrl`, `category: "Developer Docs"`)

When resolving display `title`, `description`, and `version` for a project:
1. **Explicit `project.title`** from `.vibtools/` or `config/projects.json`, followed by **Root `index.md` YAML frontmatter** (`title` if not `"Overview"`, `description`, `version`)
2. **Smart Markdown Extraction fallback** (`extractMarkdownMetadata` in `src/utils/vibtoolsConfig.ts`):
   - **Title:** First `# H1` heading in `index.md`, automatically stripping suffixes like `— Developer Documentation` or `- Developer Docs`.
   - **Description:** First clean prose paragraph (skipping badges, tables, blockquotes, HTML tags, and boilerplate headings), stripped of inline Markdown syntax and truncated cleanly at a word boundary around `160` characters.
   - **Version:** First `Version: X.Y.Z`, `Release: vX.Y.Z`, or standalone `vX.Y.Z` semantic version badge found in the opening lines.

---

## 5. `docs/` Authoring Rules & Markdown/MDX Contract

Every AI agent and developer authoring files inside `docsPath` (`docs/` or `docs/dev/`) must follow these rules so `scripts/sync-docs.mjs`, `src/utils/sidebar.ts`, and Astro Content Collections compile without errors:

### 5.1 Mandatory Root `index.md` (or `README.md`)

- Every configured `docsPath` **must** have a root `index.md`, `index.mdx`, `README.md`, or `README.mdx`.
- If a directory contains `README.md` and no `index.md`, `scripts/sync-docs.mjs` automatically renames `README.md` -> `index.md`.
- If a directory contains **both** `index.md` and `README.md`, `index.md` is kept and `README.md` is deleted to prevent duplicate route collisions.
- In the left sidebar, the root `index.md` is always rendered first with the label **`Overview`**, while the page's `<title>` and `<h1>` use the frontmatter `title` (or `.vibtools` project title).

### 5.2 Supported Frontmatter Fields (`.md` / `.mdx`)

All frontmatter fields are optional in `src/content.config.ts`, except `draft` must be a boolean if present:

```yaml
---
title: "Configuration Guide"
description: "Configure environment variables, webhooks, and runtime options."
version: "1.2.0"
order: 2
category: "Core Engine"
draft: false
---
```

| Frontmatter Key | Type | Effect |
| :--- | :--- | :--- |
| `title` | `string` | Page `<h1>`, HTML `<title>`, OpenGraph title, and sidebar link label (root `index.md` keeps `"Overview"` as its sidebar link label). |
| `description` | `string` | Meta description, OpenGraph description, and `/llms.txt` page summary. |
| `version` | `string` | Project version read from the root `index.md` (e.g. `"1.2.0"`). |
| `order` | `number` | Explicit sidebar sort priority within its folder (lower numbers appear first; pages with `order` sort before pages without `order`). |
| `category` | `string` | Optional metadata tag. |
| `draft` | `boolean` | When `draft: true`, `scripts/sync-docs.mjs` completely removes the file during sync so it is never published, routed, or indexed. **Must be an unquoted YAML boolean (`true` or `false`), never a string `"true"`.** |

### 5.3 File & Folder Ordering, URL Slugs, and Subfolder Groups

- **Numeric filename prefixes:** You can prefix filenames or folders with `NN-` or `NN_` (e.g., `01-quickstart.md`, `02-api-reference.md`).
  - `src/utils/sidebar.ts` uses the numeric prefix for sorting (`01` before `02`), and **strips** the prefix from both the generated URL route (`/project/quickstart/`) and the humanized sidebar title (`Quickstart`).
- **Subfolders (`docs/guides/...`):**
  - Every subfolder containing Markdown files becomes a collapsible sidebar section.
  - To customize a subfolder's sidebar group title, add an `index.md` inside that subfolder with a frontmatter `title` (for example `title: "Advanced Guides"`). Otherwise, the folder name is humanized (`02-api-guides` -> `Api Guides`).
- **Route collision guard:** Two files in the same folder that normalize to the same slug (for example `01-setup.md` and `02-setup.md`) will fail the build with a duplicate route collision error. Keep normalized slugs unique per directory.

### 5.4 Governance Files (`MANIFEST.md`) Inside `docs/`

- `scripts/sync-docs.mjs` automatically strips any file named `MANIFEST.md` (case-insensitive) from synced documentation trees so repository inventory files never pollute public documentation sidebars.
- **Warning:** Always spell manifest files exactly `MANIFEST.md`. A misspelled filename like `MINIFEST.md` will **not** be stripped and will be published as a public documentation page.

### 5.5 Internal Links & Relative Images

- **Internal Markdown links:** You may link between pages using either relative Markdown filenames (`[Adding Projects](adding-projects.md)` or `[Setup](./01-setup.md#install)`) or root-relative routes (`[Adding Projects](/vib-docs-engine/adding-projects/)`). The `rewriteInternalMarkdownLinks` Remark plugin in `astro.config.mjs` automatically rewrites relative `.md`/`.mdx` links into clean normalized Astro routes while preserving `#hash` anchors and `?query` parameters.
- **Images & relative assets:** Place diagrams or screenshots inside `docs/assets/` (or any subfolder of `docsPath`) and reference them with relative Markdown image syntax (`![Architecture](./assets/diagram.png)`). `scripts/verify-build.mjs` verifies every internal `href` and `img[src]` in `dist/` and fails the build if any link or image is broken.

### 5.6 Built-In MDX Components (`.mdx` files only)

When a file uses the `.mdx` extension, you can import the engine's built-in interactive components:

```mdx
import Callout from "../../../components/mdx/Callout.astro";
import CodeTabs from "../../../components/mdx/CodeTabs.astro";

<Callout type="tip" title="Zero-Config Sync">
  Bare repository URLs in `config/projects.json` automatically read `.vibtools/docs.config.json`.
</Callout>

<CodeTabs labels={["npm", "pnpm"]}>
  ```sh
  npm run sync
  ```
  ```sh
  pnpm run sync
  ```
</CodeTabs>
```

- `Callout`: `type` supports `"info"` (default), `"tip"`, `"warning"`, or `"danger"`, plus optional `title`.
- `CodeTabs`: `labels` accepts an array of tab names matching the child code blocks.

---

## 6. Logo Discovery & Security Validation Rules

When `scripts/sync-docs.mjs` resolves a project logo, it checks candidate paths in this exact order:

1. Explicit `logoPath` (from `config/projects.json` override -> `.vibtools/` active target -> `.vibtools/` root)
2. `.vibtools/logo.svg`, `.vibtools/logo.png`, `.vibtools/icon.svg`, `.vibtools/icon.png`
3. `<docsPath>/logo.*`, `<docsPath>/icon.*`, `<docsPath>/assets/logo.*`, `<docsPath>/images/logo.*`

Every logo candidate must pass these security checks:
- Must resolve inside the repository root (`assertWithin`) with zero symlinks (`fs.lstat`).
- Maximum file size: **`2 MB`** (`2,097,152` bytes).
- `.png` files must start with the valid 8-byte PNG signature (`89 50 4E 47 0D 0A 1A 0A`).
- `.svg` files must be static XML/SVG and are rejected if they contain `<script>`, `<foreignObject>`, inline `on*=` event handlers, `javascript:`/`data:text/html` URIs, or external `http://`/`https://` references.
- If no logo exists (or if a candidate fails validation), the engine logs a warning and renders a deterministic 2-letter project monogram badge using `accentColor`.

---

## 7. Production Copy-Paste Templates

### Template A — Developer-Only Repository (`docsType: "developer"`)

Use this in `https://github.com/vibtoolshq/<repo>` when the repository contains **only developer documentation** (SDKs, engines, CLI tools, servers) published exclusively on **`https://developer.vibtools.io`**:

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

### Template B — Dual-Portal Repository (`docsType: "both"` with `targets.developer` & `targets.users`)

Use this when a **single repository** under `https://github.com/vibtoolshq/<repo>` (such as `LicenX`) contains **both** developer/SDK documentation (`docs/dev/`) AND end-user documentation (`docs/users/`). Adding the same repository URL to both portals allows `developer.vibtools.io` to sync `docs/dev` and `docs.vib.tools` to sync `docs/users`:

```json
{
  "$schema": "https://developer.vibtools.io/schemas/vibtools-docs.schema.json",
  "schemaVersion": 1,
  "docsType": "both",
  "slug": "licenx",
  "title": "LicenX",
  "version": "1.0.0",
  "logoPath": ".vibtools/logo.svg",
  "branch": "main",
  "targets": {
    "developer": {
      "slug": "licenx-sdk",
      "title": "LicenX Developer Guide",
      "category": "SDKs & APIs",
      "description": "Self-hosted deployment, webhook verification, and SDK integration reference for LicenX.",
      "accentColor": "#2563EB",
      "docsPath": "docs/dev",
      "ctaLabel": "View repository",
      "ctaUrl": "https://github.com/vibtoolshq/LicenX"
    },
    "users": {
      "slug": "licenx",
      "title": "LicenX User Guide",
      "category": "License Management",
      "description": "Dashboard walkthrough, activation keys, and billing guide for LicenX users.",
      "accentColor": "#0EA5E9",
      "docsPath": "docs/users",
      "ctaLabel": "Open Dashboard",
      "ctaUrl": "https://vib.tools"
    }
  }
}
```

### Portal `config/projects.json` Registration

Once `.vibtools/docs.config.json` is committed in the repository, register the repo in `config/projects.json` using just its Git URL:

```json
[
  "https://github.com/vibtoolshq/vib-docs-engine.git",
  "https://github.com/vibtoolshq/SocketCore.git",
  "https://github.com/vibtoolshq/LicenX.git"
]
```

Or add it via CLI:

```sh
npm run add-project -- --url https://github.com/vibtoolshq/SocketCore.git
```

---

## 8. Canonical JSON Schema (Draft 2020-12)

This frozen schema is hosted identically at **`https://developer.vibtools.io/schemas/vibtools-docs.schema.json`** and **`https://docs.vib.tools/schemas/vibtools-docs.schema.json`**:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://developer.vibtools.io/schemas/vibtools-docs.schema.json",
  "title": "VibToolsDocsConfig",
  "description": "Canonical repository configuration schema (.vibtools/docs.config.json or .vibtools/config.docs.json) for Vib Docs Engine dual-portal synchronization (docs.vib.tools and developer.vibtools.io).",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "$schema": {
      "type": "string",
      "minLength": 1,
      "description": "Optional URI pointing to this JSON Schema (e.g. 'https://docs.vib.tools/schemas/vibtools-docs.schema.json' or 'https://developer.vibtools.io/schemas/vibtools-docs.schema.json')."
    },
    "schemaVersion": {
      "const": 1,
      "default": 1,
      "description": "Schema format version marker. Must be 1 when specified."
    },
    "docsType": {
      "type": "string",
      "enum": ["users", "developer", "both"],
      "default": "both",
      "description": "Target portal audience: 'users' (docs.vib.tools only), 'developer' (developer.vibtools.io only), or 'both' (collected by both portals)."
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "description": "Lowercase URL-safe product slug (e.g. 'licenx', 'socketcore'). Defaults to normalized repository name from repoUrl."
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "description": "Display title for the product card and navigation header. Falls back to root index.md frontmatter or first # H1 heading."
    },
    "category": {
      "type": "string",
      "minLength": 1,
      "description": "Hub filter category label (e.g. 'Core Engine', 'SDKs & Modules', 'Self-Hosted Infrastructure')."
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "description": "Concise 1-2 sentence product summary for Hub cards, SEO meta description, and llms.txt index."
    },
    "version": {
      "type": ["string", "number"],
      "description": "Displayed release version badge (e.g. '1.2.0'). Leading 'v' is normalized automatically at render time."
    },
    "accentColor": {
      "type": "string",
      "pattern": "^#(?:[\\da-fA-F]{3}|[\\da-fA-F]{4}|[\\da-fA-F]{6}|[\\da-fA-F]{8})$",
      "description": "3, 4, 6, or 8 digit hexadecimal CSS accent color (e.g. '#2563EB' or '#0EA5E9')."
    },
    "docsPath": {
      "type": "string",
      "minLength": 1,
      "default": "docs",
      "description": "Relative POSIX folder path inside the repository containing index.md or README.md (e.g. 'docs', 'docs/dev'). No leading '/', '\\', '..', or '.'."
    },
    "logoPath": {
      "type": "string",
      "minLength": 1,
      "description": "Relative POSIX file path to a static SVG or PNG product logo under 2 MB (e.g. '.vibtools/logo.png' or '.vibtools/logo.svg')."
    },
    "branch": {
      "type": "string",
      "minLength": 1,
      "default": "main",
      "description": "Git branch to sparse-checkout for documentation (defaults to 'main')."
    },
    "ctaLabel": {
      "type": "string",
      "minLength": 1,
      "description": "Topbar external action button label (e.g. 'View repository', 'GitHub'). Ignored unless ctaUrl is also set."
    },
    "ctaUrl": {
      "type": "string",
      "format": "uri",
      "pattern": "^https?://",
      "description": "External HTTP or HTTPS URL opened by the topbar CTA button."
    },
    "targets": {
      "type": "object",
      "minProperties": 1,
      "additionalProperties": false,
      "description": "Optional per-portal overrides allowing a single repository to serve different documentation folders, titles, slugs, or CTAs to docs.vib.tools ('users') and developer.vibtools.io ('developer').",
      "properties": {
        "users": { "$ref": "#/$defs/target" },
        "developer": { "$ref": "#/$defs/target" }
      }
    }
  },
  "$defs": {
    "target": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "slug": {
          "type": "string",
          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
        },
        "title": { "type": "string", "minLength": 1 },
        "category": { "type": "string", "minLength": 1 },
        "description": { "type": "string", "minLength": 1 },
        "version": { "type": ["string", "number"] },
        "accentColor": {
          "type": "string",
          "pattern": "^#(?:[\\da-fA-F]{3}|[\\da-fA-F]{4}|[\\da-fA-F]{6}|[\\da-fA-F]{8})$"
        },
        "docsPath": {
          "type": "string",
          "minLength": 1
        },
        "logoPath": {
          "type": "string",
          "minLength": 1
        },
        "branch": {
          "type": "string",
          "minLength": 1
        },
        "ctaLabel": { "type": "string", "minLength": 1 },
        "ctaUrl": {
          "type": "string",
          "format": "uri",
          "pattern": "^https?://"
        }
      }
    }
  }
}
```

---

## 9. AI Agent Self-Verification Checklist (10 Points)

Before finishing `.vibtools/` and `docs/` setup in any developer repository for `https://developer.vibtools.io`, verify all 10 items:

1. **Single Config File:** Only `.vibtools/docs.config.json` exists (not both `docs.config.json` and `config.docs.json`).
2. **Valid JSON & Schema:** `.vibtools/docs.config.json` parses with `JSON.parse()`, includes `"$schema": "https://developer.vibtools.io/schemas/vibtools-docs.schema.json"` and `"schemaVersion": 1`, and contains zero unknown keys.
3. **Developer `docsType`:** `"docsType"` is explicitly set to `"developer"` or `"dev"` (or `targets.developer` is defined). Zero user-only (`"users"`) configs are registered for `developer.vibtools.io`.
4. **Valid `slug` & `accentColor`:** `"slug"` is lowercase kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) and `"accentColor"` is a valid CSS hex string (`#RRGGBB`).
5. **Safe Relative `docsPath` & `logoPath`:** Neither path starts with `/`, contains `\`, contains `..`, or equals `.`.
6. **Root `index.md` Exists:** Every configured `docsPath` directory contains a root `index.md` (or `README.md`) with clear title, description, and body content.
7. **Valid YAML Frontmatter:** Every `.md`/`.mdx` file with frontmatter has valid YAML delimiters (`---`), and any `draft` field is a boolean (`true`/`false`), not a string.
8. **No Stray Typo Manifests:** Any directory manifest inside `docs/` is named `MANIFEST.md` (which is auto-stripped), never misspelled as `MINIFEST.md`.
9. **Working Relative Links & Assets:** Every internal Markdown link (`[Guide](guide.md)`) and image (`![Img](./assets/img.png)`) points to an existing file inside `docsPath`.
10. **Logo Compliance:** If `logoPath` is set, the file exists at that exact path, is under `2 MB`, and (if `.svg`) contains zero `<script>`, `<foreignObject>`, event handlers, or external URLs.

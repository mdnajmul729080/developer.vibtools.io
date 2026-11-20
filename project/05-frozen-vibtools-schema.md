# 05. Frozen `.vibtools/` Docs Configuration Schema (Immutable Contract)

> **STATUS: FINAL & FROZEN (`schemaVersion: 1`)**
>
> **OWNER-LOCKED RULE FOR ALL AI CODING AGENTS AND CONTRIBUTORS:**
>
> The `.vibtools/docs.config.json` (and `.vibtools/config.docs.json`) configuration schema originally established for **`https://docs.vib.tools`** is **PERMANENTLY FROZEN**.
>
> - **DO NOT** add, rename, remove, deprecate, or alter any field, type, enum value, regex pattern, `default`, or `additionalProperties: false` constraint in this schema during bugfixes, UI updates, refactors, security patches, or new features.
> - **DO NOT** fork a separate schema format for `developer.vibtools.io` vs `docs.vib.tools`. **Both portals MUST collect `docs/` strictly using this single shared frozen schema.**
> - **NO AI AGENT** is permitted to modify this frozen contract under any circumstance **without an explicit, direct order from the repository Owner** authorizing a schema change.
> - Whenever any code change touches sync, parsing, build verification, or portal routing, the implementation MUST preserve 100% backward and forward compatibility with this frozen schema.

---

## 1. Purpose & Dual-Portal Unification

A single product repository may contain end-user documentation, developer/API documentation, or both. Using this single frozen schema:

- **`https://docs.vib.tools` (`portalType: "users"`)** collects documentation where `docsType` is `"users"` or `"both"`, or where `targets.users` is configured.
- **`https://developer.vibtools.io` (`portalType: "developer"`)** collects documentation where `docsType` is `"developer"` (`"dev"`) or `"both"`, or where `targets.developer` is configured.
- **Combined / Preview (`portalType: "all"`)** supports both audiences from the exact same `.vibtools/docs.config.json`.

Because the schema format is identical and frozen across both portals, repository maintainers and AI agents configure `.vibtools/` **once**, and both portals discover and synchronize their respective `docsPath` automatically.

---

## 2. File Naming & Conflict Rules (Frozen)

1. **Directory:** `.vibtools/` at the root of the product repository.
2. **Canonical file:** `.vibtools/docs.config.json`
3. **Supported legacy alias:** `.vibtools/config.docs.json`
4. **Mutual exclusion rule (Fatal Build Error):** A repository MUST NOT contain both `docs.config.json` and `config.docs.json` inside `.vibtools/` at the same time. `scripts/sync-docs.mjs` and `scripts/verify-build.mjs` fail immediately if both exist.
5. **Format:** Strict UTF-8 JSON (no comments, no trailing commas).

---

## 3. Protected Field Reference (Frozen `schemaVersion: 1`)

All fields below match `parseVibtoolsRepoConfig()` and `buildVibtoolsJsonSchema()` in `src/utils/vibtoolsConfig.ts`:

| Field | Type | Allowed Scope | Frozen Validation Rule | Default / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `$schema` | `string` | Root only | Non-empty URI string | Recommended: `"https://docs.vib.tools/schemas/vibtools-docs.schema.json"` (identical schema also served at `"https://developer.vibtools.io/schemas/vibtools-docs.schema.json"`). |
| `schemaVersion` | `1` (`integer`) | Root only | Exact constant `1` | Optional; defaults to `1`. Any value other than `1` fails validation. |
| `docsType` | `string` (`enum`) | Root only | Canonical schema enum: `"users" \| "developer" \| "both"` (parser also normalizes `"dev"` -> `"developer"` and `"user"` -> `"users"`) | Defaults to `"both"`. |
| `slug` | `string` | Root & Target | `^[a-z0-9]+(?:-[a-z0-9]+)*$` | Derived automatically from repository name if omitted. |
| `title` | `string` | Root & Target | `minLength: 1` (non-empty trimmed string) | Falls back to `docs/index.md` frontmatter or Smart `# H1` extraction. |
| `category` | `string` | Root & Target | `minLength: 1` (non-empty trimmed string) | Defaults to `"Developer Docs"` when resolved `docsType === "developer"`, otherwise `"Documentation"`. |
| `description` | `string` | Root & Target | `minLength: 1` (non-empty trimmed string) | Falls back to `docs/index.md` frontmatter or first clean prose paragraph. |
| `version` | `string \| number` | Root & Target | Non-empty string or finite number | Normalized to string; leading `v` deduplicated at render time. |
| `accentColor` | `string` | Root & Target | `^#(?:[\da-fA-F]{3}\|[\da-fA-F]{4}\|[\da-fA-F]{6}\|[\da-fA-F]{8})$` | Falls back to portal `site.config.json` `defaultAccent`. |
| `docsPath` | `string` | Root & Target | Relative POSIX directory path; no leading `/`, no `\`, no `..`, not `.` | Defaults to `"docs"`. Common split values: `"docs/users"`, `"docs/dev"`. |
| `logoPath` | `string` | Root & Target | Relative POSIX file path; no leading `/`, no `\`, no `..`, not `.` | Static `.svg`, `.png`, `.webp`, or `.avif` under `2 MB` (e.g. `".vibtools/logo.svg"`). |
| `branch` | `string` | Root & Target | Non-empty Git branch; no whitespace, `\`, or `..` | Defaults to `"main"`. Target overrides trigger branch switch in sparse checkout. |
| `ctaLabel` | `string` | Root & Target | `minLength: 1` (non-empty trimmed string) | Defaults to `"Open"` when `ctaUrl` is set. Ignored if `ctaUrl` is absent. |
| `ctaUrl` | `string` | Root & Target | Valid `http://` or `https://` URI (`^https?://`) | External CTA link in topbar. |
| `targets` | `object` | Root only | Object with `minProperties: 1`, `additionalProperties: false`, allowed keys: `users`, `developer` (runtime parser also supports mutually exclusive aliases `user`, `dev`) | Per-portal overrides inheriting unspecified fields from root. |

---

## 4. Portal Matching & Resolution Precedence (Frozen)

### Audience Selection (`selectActiveTarget`)

| `.vibtools/` Configuration | `docs.vib.tools` (`portalType: "users"`) | `developer.vibtools.io` (`portalType: "developer"`) |
| :--- | :--- | :--- |
| `docsType: "users"` | Synced using root (or `targets.users`) | Skipped (`users`-only) |
| `docsType: "developer"` (or `"dev"`) | Skipped (`developer`-only) | Synced using root (or `targets.developer`) |
| `docsType: "both"` (single shared `docs/`) | Synced using root `docsPath` | Synced using root `docsPath` |
| `docsType: "both"` + `targets.users` + `targets.developer` | Synced using `targets.users` (inherits unspecified root fields) | Synced using `targets.developer` (inherits unspecified root fields) |
| `targets.users` only | Synced using `targets.users` | Skipped (unless root `docsType: "developer"`) |
| `targets.developer` only | Skipped (unless root `docsType: "users"` or `"both"`) | Synced using `targets.developer` |
| Missing `.vibtools/` config | Synced only if explicitly listed in `config/projects.json` | **Rejected / Skipped** unless entry explicitly carries `docsType: "developer"` / `"dev"` |

### Metadata Precedence (Highest to Lowest)

- **Sync & routing fields** (`slug`, `docsPath`, `logoPath`, `branch`, `category`, `accentColor`, `ctaLabel`, `ctaUrl`):
  1. `config/projects.json` explicit registry override field
  2. `.vibtools/` active target block (`targets.users` or `targets.developer`)
  3. `.vibtools/` root config fields
  4. Engine defaults (`branch: "main"`, `docsPath: "docs"`, `slug` derived from `repoUrl`)
- **Display metadata** (`title`, `description`, `version`):
  1. Root `index.md` YAML frontmatter (`title` if not `"Overview"`, `description`, `version`)
  2. Resolved `.vibtools/` / registry fields
  3. Smart Markdown extraction (`# H1`, opening paragraph, semantic version string)

---

## 5. Canonical Draft 2020-12 JSON Schema (Frozen Copy)

This exact JSON Schema is served live at `/schemas/vibtools-docs.schema.json` on both `https://docs.vib.tools/schemas/vibtools-docs.schema.json` and `https://developer.vibtools.io/schemas/vibtools-docs.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://docs.vib.tools/schemas/vibtools-docs.schema.json",
  "title": "VibToolsDocsConfig",
  "description": "Canonical repository configuration schema (.vibtools/docs.config.json or .vibtools/config.docs.json) for Vib Docs Engine single-portal and dual-portal (docs.vib.tools & developer.vibtools.io) synchronization.",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "$schema": {
      "type": "string",
      "description": "Optional URI pointing to this JSON Schema (e.g. 'https://docs.vib.tools/schemas/vibtools-docs.schema.json')."
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
      "description": "Target portal audience: 'users' (docs.vib.tools), 'developer' (developer.vibtools.io), or 'both' (serves both portals)."
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
      "description": "Hub filter category label (e.g. 'Desktop Apps', 'Core Engine', 'SDKs & Modules')."
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
      "description": "3, 4, 6, or 8 digit hexadecimal CSS accent color (e.g. '#7C3AED' or '#2563EB')."
    },
    "docsPath": {
      "type": "string",
      "minLength": 1,
      "default": "docs",
      "description": "Relative POSIX folder path inside the repository containing index.md or README.md (e.g. 'docs', 'docs/users', 'docs/dev'). No leading '/', '\\', '..', or '.'."
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
      "description": "Topbar external action button label (e.g. 'View repository', 'Get License'). Ignored unless ctaUrl is also set."
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
      "description": "Optional per-portal overrides allowing a single repository to serve different docsPath, slug, title, category, description, accentColor, logoPath, ctaUrl, or branch to docs.vib.tools ('users') and developer.vibtools.io ('developer').",
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
          "description": "Hub filter category label (e.g. 'Desktop Apps', 'Core Engine', 'SDKs & Modules')."
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
          "description": "3, 4, 6, or 8 digit hexadecimal CSS accent color (e.g. '#7C3AED' or '#2563EB')."
        },
        "docsPath": {
          "type": "string",
          "minLength": 1,
          "default": "docs",
          "description": "Relative POSIX folder path inside the repository containing index.md or README.md (e.g. 'docs', 'docs/users', 'docs/dev'). No leading '/', '\\', '..', or '.'."
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
          "description": "Topbar external action button label (e.g. 'View repository', 'Get License'). Ignored unless ctaUrl is also set."
        },
        "ctaUrl": {
          "type": "string",
          "format": "uri",
          "pattern": "^https?://",
          "description": "External HTTP or HTTPS URL opened by the topbar CTA button."
        }
      }
    }
  }
}
```

---

## 6. Protected Implementation Anchors (Do Not Mutate Schema Without Owner Order)

When maintaining or fixing bugs in the codebase, AI agents MUST verify that `npm test` (including `src/utils/vibtoolsConfig.test.ts`) and `npm run verify` continue to enforce this exact contract across:

- `src/utils/vibtoolsConfig.ts` (`parseVibtoolsRepoConfig`, `buildVibtoolsJsonSchema`, `resolvePortalProjectConfig`, `selectActiveTarget`, `normalizeDocsType`)
- `src/pages/schemas/vibtools-docs.schema.json.ts` (`/schemas/vibtools-docs.schema.json`)
- `scripts/sync-docs.mjs` (`.vibtools/` sparse checkout + `portalType` filtering)
- `scripts/verify-build.mjs` (`.vibtools/` config conflict check + JSON Schema validation)
- `docs/vibtools-config.md` & `docs/index.md` (canonical human & AI agent onboarding guide)

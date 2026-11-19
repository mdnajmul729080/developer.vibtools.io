# Adding Projects to `developer.vibtools.io`

A developer project is added through configuration and a documentation repository. The workflow requires no application source changes.

Place a self-contained `.vibtools/docs.config.json` (or `.vibtools/config.docs.json`) with `"docsType": "developer"` (or `"docsType": "dev"`) inside the project repository so **`https://developer.vibtools.io`** only needs a single repository URL in `config/projects.json`. Explicit override objects in `config/projects.json` remain supported as overrides or fallbacks.

---

## 0. Developer Portal Eligibility (`docsType: "developer"` | `"dev"`)

`https://developer.vibtools.io` runs with `"portalType": "developer"` in `config/site.config.json`:

- **Accepted:** Repositories whose `.vibtools/docs.config.json` (or `config.docs.json`) declares `"docsType": "developer"` or `"docsType": "dev"` (or defines a `targets.developer` block without `docsType: "users"`).
- **Rejected / Skipped:** Any end-user documentation repository (`"docsType": "users"` or `"user"`) or any repository that omits developer `docsType` / `targets.developer`. User documentation is never built or published on `developer.vibtools.io`.

---

## 1. Prepare the source repository (`.vibtools/` required)

Add a `.vibtools/docs.config.json` file in the repository root alongside your documentation folder (`docs/` or `docs/dev/`):

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

> **Shorthand supported:** You may write either `"docsType": "developer"` or `"docsType": "dev"` inside `.vibtools/docs.config.json`. Both normalize to `"developer"`.

See the full schema (`/schemas/vibtools-docs.schema.json`), `targets.developer` overrides, `docs/` authoring rules, and logo rules in [`.vibtools/` Configuration](vibtools-config.md).

### Markdown `index.md` & Smart Metadata Fallback

Every `docsPath` directory needs a root `index.md` (or `README.md`, which is automatically normalized to `index.md`). Explicit YAML frontmatter is recommended when you want exact control:

```md
---
title: SocketCore
description: High-throughput WebSocket and event transport core for Vib Tools services.
version: "1.0.0"
---
```

If `index.md` does not contain YAML frontmatter, `scripts/sync-docs.mjs` falls back through `.vibtools/` configuration, `config/projects.json` overrides, and **Smart Markdown extraction** (reading the first `# H1` heading, first clean summary paragraph, and `vX.Y.Z` / `Version: X.Y.Z` markers automatically).

Optionally place your project logo at `.vibtools/logo.svg` (or `.png`), point `"logoPath"` at any validated relative file under `2 MB`, or place `logo.svg` / `logo.png` inside `docsPath`. Static SVGs are preferred (script/event/external-reference SVGs are rejected); when no logo is found, the UI generates a monogram.

---

## 2. Register the project in `config/projects.json`

### Zero-config `.vibtools/` URL entry (Recommended)

When the developer repository contains `.vibtools/docs.config.json` with `"docsType": "developer"` (or `"dev"`), add its credential-free Git URL string to `config/projects.json`:

```json
[
  "https://github.com/vibtoolshq/vib-docs-engine.git",
  "https://github.com/vibtoolshq/SocketCore.git",
  "https://github.com/vibtoolshq/LicenX.git"
]
```

Because `scripts/sync-docs.mjs` enforces `portalType: "developer"`, only repositories configured for developer documentation (`"docsType": "developer"` / `"dev"` or `targets.developer`) are synced and built.

### Quick CLI registration

Add a developer repository URL in one command:

```sh
npm run add-project -- --url https://github.com/vibtoolshq/SocketCore.git
```

Pass optional override flags (`--slug`, `--category`, `--branch`, `--accent`, `--docs-path`, `--docs-type`, `--secret-key`, `--git-username`, `--cta-label`, `--cta-url`) only when you need to override `.vibtools/` or provide private-repo auth. Running `npm run add-project` interactively also offers **[1] `.vibtools/` Auto** and **[2] Manual / Custom overrides**. Duplicate repository URLs are blocked unless a distinct `--slug` override is supplied.

### Manual override / explicit object format

If a developer repository needs explicit portal overrides or a private repository token reference (`secretKey`), store an object with `"docsType": "developer"` in `config/projects.json`:

```json
{
  "slug": "socketcore",
  "category": "Core Infrastructure",
  "accentColor": "#2563EB",
  "repoUrl": "https://github.com/vibtoolshq/SocketCore.git",
  "secretKey": "$GIT_TOKEN",
  "branch": "main",
  "docsPath": "docs",
  "docsType": "developer",
  "ctaLabel": "View repository",
  "ctaUrl": "https://github.com/vibtoolshq/SocketCore",
  "title": "SocketCore",
  "description": "High-throughput WebSocket and event transport core for Vib Tools services.",
  "version": "1.0.0"
}
```

Use a unique, URL-safe slug. Category filters are derived dynamically from resolved project records. Repository URLs may use HTTPS or SSH Git transports for GitHub, GitLab, Gitea, or Forgejo, and must never contain embedded credentials.

---

## 3. Configure public vs. private repository access

- **Public repositories (`https://github.com/vibtoolshq/*`):** require no `secretKey` or `GIT_TOKEN`. Leave `secretKey` omitted and `scripts/sync-docs.mjs` performs a 2-step sparse checkout directly without credentials.
- **Private repositories:** set `secretKey` on the project in `config/projects.json` (an environment variable reference such as `"$GIT_TOKEN"` or `"GIT_TOKEN"`, plus optional `gitUsername` if your Git host requires a non-default username; GitLab defaults to `oauth2` and GitHub/Gitea/Forgejo default to `x-access-token`). `scripts/sync-docs.mjs` automatically strips `secretKey`, `gitToken`, `gitTokenEnv`, and `gitUsername` before writing `src/generated/manifest.json` and redacts them from error output.

---

## 4. Configure rebuild webhooks

Configure the source host to trigger the developer portal's protected build hook on pushes to the configured branch when files under `.vibtools/` or the documentation path change.

- **Cloudflare Pages (`https://developer.vibtools.io`):** create a Pages build hook for the deployment (or point the repository webhook at `https://developer.vibtools.io/api/webhook`) and protect the hook URL / `WEBHOOK_SECRET` as secrets.
- **Docker/Nginx VPS:** use CI or a small protected webhook receiver to validate the provider's signature and start the build pipeline. Build to a staging directory and switch the served output only after sync, Astro, Pagefind, and `npm run verify` succeed.

---

## 5. Verify sync and the developer portal

Run `npm test`, `npm run sync`, then `npm run build` and `npm run verify` (`node scripts/verify-build.mjs`). Confirm `.vibtools/` validation passes, the developer project appears on the Hub (`portalType: "developer"`), any non-developer repository is skipped, metadata/logo are resolved cleanly, and Pagefind indexes the article body. On a project page, `Ctrl+K` searches that project by default; switch to “All Docs” for portal-wide results. Check `/llms.txt`, `/llms-full.txt`, `/<slug>/llms.txt`, `/<slug>/<page>.md`, `/schemas/vibtools-docs.schema.json`, `/robots.txt`, `/sitemap-index.xml`, and `/404`.

Use `npm run preview` to inspect the built static portal locally. For VPS testing with private repositories, build with `docker buildx build --secret id=git_token,env=GIT_TOKEN -t vib-docs-engine .` and run `docker run --rm -p 8080:80 vib-docs-engine`.

---

## 6. Automate rebuilds from developer repositories

For GitHub (`https://github.com/vibtoolshq/*` repositories), copy `templates/github-notify-docs.yml` into the project repository at `.github/workflows/notify-docs.yml` (which watches both `docs/**` and `.vibtools/**`) and set the `DOCS_DEPLOY_HOOK_URL` secret to the `https://developer.vibtools.io` build hook.

For GitLab, Gitea/Forgejo, or a VPS receiver, use `templates/webhook-trigger.sh` and store `DOCS_DEPLOY_HOOK_URL` in protected CI secrets.

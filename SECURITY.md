# Security Policy — Vib Docs Engine (`vib-docs-engine`)

**Vib Tools** takes the security of **Vib Docs Engine**, our developer documentation portal ([developer.vibtools.io](https://developer.vibtools.io/)), and our upstream repositories seriously.

---

## 1. Reporting a Vulnerability Privately

**Do not report suspected security vulnerabilities, exploit proofs-of-concept, credentials, or private repository details in public GitHub issues, discussions, or pull requests.**

Please send a private disclosure email to:

- **Security & Technical Support Email:** **[support@vibtools.io](mailto:support@vibtools.io)**
- **General Organization Contact (Backup):** **[hello@vibtools.io](mailto:hello@vibtools.io)**

### What to Include in Your Report

To help us reproduce and resolve the issue quickly, please include:

1. **Affected Repository & Component:** Specify `vib-docs-engine` (or the affected Vib Tools repository), the file/module path (for example `scripts/sync-docs.mjs`, `functions/api/webhook.ts`, `src/utils/vibtoolsConfig.ts`), and the commit SHA or version if known.
2. **Vulnerability Type & Impact:** Explain what an attacker could achieve (for example path traversal, SSRF, XSS in rendered Markdown/JSON-LD, webhook authentication bypass, or credential exposure).
3. **Safe Reproduction Steps:** Provide minimal configuration or steps to reproduce the issue locally without accessing other users' data or disrupting live services.
4. **Contact Information:** Provide an email address or handle where maintainers can reach you for clarification.

> **Safe Harbor & Disclosure Rules:** Never include live personal access tokens, private keys, or third-party personal data in your report. Please allow maintainers time to investigate and deploy a fix before any public disclosure.

For vulnerabilities in another Vib Tools product, check that repository's own `SECURITY.md` first; if none exists, report privately to **[support@vibtools.io](mailto:support@vibtools.io)**.

---

## 2. Built-In Security Architecture & Controls

Contributors and operators should preserve these active security boundaries in `vib-docs-engine`:

| Area | Enforced Security Control | Location |
| :--- | :--- | :--- |
| **Credential Isolation & Redaction** | Repository URLs with embedded credentials (`https://user:token@...`) are rejected. Private repo tokens (`secretKey`, `gitToken`, `gitTokenEnv`, `gitUsername`) are resolved only from server/CI environment variables, stripped before writing `src/generated/manifest.json`, and redacted from all error messages via `sanitizeError`. | `src/utils/vibtoolsConfig.ts`, `scripts/sync-docs.mjs`, `scripts/add-project.mjs` |
| **Docker BuildKit Secret Mounts** | `Dockerfile` never accepts `ARG GIT_TOKEN` or `ENV GIT_TOKEN`. Private tokens are mounted ephemerally during build via `--mount=type=secret,id=git_token,env=GIT_TOKEN` and never persist in image layers. | `Dockerfile` |
| **Path Traversal & Symlink Guards** | `normalizeRelativeRepoPath` and `assertWithin` reject `..`, leading `/`, `\`, and drive prefixes on `docsPath`, `logoPath`, and `localPath`. `copyTree` and logo validators use `fs.lstat` and reject all symlinks. | `src/utils/vibtoolsConfig.ts`, `scripts/sync-docs.mjs` |
| **Static Logo & SVG Sanitization** | Product logos are capped at `2 MB`. PNG files are checked for valid 8-byte PNG signatures. SVG files are scanned and rejected if they contain `<script>`, `<foreignObject>`, inline `on*=` event attributes, `javascript:`/`data:text/html` URIs, or external `http:`/`https:` references. | `scripts/sync-docs.mjs` |
| **Fail-Closed Webhook Relay** | `POST /api/webhook` fails closed with HTTP `501` if `WEBHOOK_SECRET` is unconfigured (unless `ALLOW_UNAUTHENTICATED_WEBHOOK="true"` is explicitly set). Supports constant-time Web Crypto `HMAC-SHA256` (`X-Hub-Signature-256`, `X-Gitea-Signature`, `X-Forgejo-Signature`), `X-Gitlab-Token`, and `Authorization: Bearer`, enforces HTTPS deploy hook URLs, filters `ALLOWED_BRANCHES`, and applies a 10-second `AbortController` timeout. | `functions/api/webhook.ts` |
| **XSS-Safe JSON-LD & Search UI** | `safeJsonLdStringify` escapes `<`, `>`, `&`, `\u2028`, and `\u2029` to prevent `</script>` breakout. `SearchModal.astro` enforces same-origin result URLs and renders Pagefind excerpts via DOM text nodes plus safe `<mark>` elements. | `src/utils/seo.ts`, `src/components/ui/SearchModal.astro` |
| **Edge & Nginx Security Headers** | Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: strict-origin-when-cross-origin` across Cloudflare Pages (`public/_headers`) and self-hosted Nginx (`nginx.conf`). | `public/_headers`, `nginx.conf` |

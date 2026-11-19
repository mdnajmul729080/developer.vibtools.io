# Go-Live Deployment Runbook (`developer.vibtools.io`)

This runbook deploys **`https://developer.vibtools.io`** (`Vib Tools Developer Hub`) from `https://github.com/vibtoolshq/vib-docs-engine`, verifies the static build, and connects developer repositories to protected deployment hooks.

## 1. Developer Portal Configuration

The repository root is pre-configured as the **Developer-Only Documentation Portal**:

- `config/site.config.json`:
  - `"portalTitle": "Vib Tools Developer Hub"`
  - `"domain": "https://developer.vibtools.io"`
  - `"defaultAccent": "#2563EB"`
  - `"portalType": "developer"`
- `config/projects.json`: lists developer repositories from `https://github.com/vibtoolshq/*`.
- `scripts/sync-docs.mjs`: matches `portalType: "developer"` against each repository's `.vibtools/docs.config.json` (or `config.docs.json`) and **only** syncs repositories that declare `"docsType": "developer"` or `"docsType": "dev"` (or a `targets.developer` block). Any user documentation repository is automatically skipped.

If you ever need to export a clean standalone copy of the developer portal to an external folder, you can also run:

```sh
npm run export-portal -- --portal dev --out ../developer-vibtools-io
```

Before building in production (`CF_PAGES=1` or `STRICT_SYNC=1`), ensure all entries in `config/projects.json` point to real developer repositories (no `YOUR_ORG` starter placeholders).

## 2. Deploy with Cloudflare Pages & Functions

Connect `https://github.com/vibtoolshq/vib-docs-engine` to Cloudflare Pages and attach the custom domain **`developer.vibtools.io`**. The repository includes `wrangler.toml` (`name = "developer-vibtools-io"`), `.node-version`, `.nvmrc`, `package-lock.json`, `public/_headers`, `public/_redirects`, `public/_routes.json`, and `functions/api/` out of the box:

- **Build command:** `npm run build` (or `npm run cf:build`)
- **Build output directory:** `dist`
- **Node.js version:** pinned automatically to `22.23.5` via `.node-version` and `.nvmrc` (an official Node.js 22 release satisfying Astro 7's `>=22.23.4` requirement and `engines.node >=22.23.4` in `package.json`).
- **Private repository credentials:**
  - Single shared org/account token: add `GIT_TOKEN` as a protected Pages environment secret. Add `GIT_USERNAME` only if that Git host needs a non-default username.
  - Multiple independent private repositories: create distinct Pages environment secrets (e.g., `GIT_TOKEN_SDK1`, `GIT_TOKEN_SDK2`) and reference them per project via `"secretKey": "$GIT_TOKEN_SDK1"` in `config/projects.json`.
- **Static Edge & Functions routing:**
  - `public/_headers`: configures immutable caching for `/_astro/*`, revalidation for `/pagefind/*`, `Content-Type` + cache headers for `/llms.txt`, `/llms-full.txt`, `/*/llms.txt`, `/*.md`, `/site.webmanifest`, and `/robots.txt`, plus security headers. Internal `public/MANIFEST.md`, `public/README.md`, and any `public/assets/aistudio/` workspace files are automatically pruned from `dist/` at build completion.
  - `public/_redirects`: holds relative-path redirect rules (Cloudflare Pages `_redirects` does not support custom-domain-to-domain redirects).
  - `public/_routes.json`: restricts Cloudflare Pages Functions invocation strictly to `/api/*` so all documentation pages serve directly from the static CDN edge.
- **Built-in Pages Functions (`functions/api/`):**
  - `GET /api/health` & `HEAD /api/health`: returns JSON health and runtime readiness status (`200` on `GET`/`HEAD`, `405` on other methods).
  - `POST /api/webhook`: optional authenticated webhook relay. Set `CF_DEPLOY_HOOK_URL` (the portal's HTTPS Cloudflare Pages Deploy Hook URL) and `WEBHOOK_SECRET` in Pages environment variables. `POST /api/webhook` fails closed with HTTP `501` when `WEBHOOK_SECRET` is missing unless `ALLOW_UNAUTHENTICATED_WEBHOOK="true"` is explicitly configured for development. Supports GitHub (`X-Hub-Signature-256`), Gitea/Forgejo (`X-Gitea-Signature`, `X-Forgejo-Signature`) HMAC-SHA256 signatures, `X-Gitlab-Token`, `X-Webhook-Secret`, and `Authorization: Bearer <secret>`, ignores initial `ping` events with HTTP `200`, and parses both JSON and `application/x-www-form-urlencoded` payloads for `ALLOWED_BRANCHES` (e.g., `main,docs`).
- **Custom Domain:** Attach **`developer.vibtools.io`** to the Cloudflare Pages project.

## 3. Deploy to a VPS with Docker or Coolify

The repository's multi-stage `Dockerfile` installs `git` and `openssh-client` in `node:22-alpine` for sparse-checkout builds and copies only `dist/` into `nginx:alpine`. `nginx.conf` mirrors `public/_headers` with gzip, global security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`), immutable 1-year caching for `/_astro/*`, 1-hour `must-revalidate` caching for `/pagefind/*`, `text/markdown; charset=utf-8` / `text/plain; charset=utf-8` responses for `.md` and `llms.txt`, and the static 404 route.

For private developer repositories, provide a BuildKit secret rather than committing a token or putting it in the final image:

```sh
docker buildx build --secret id=git_token,env=GIT_TOKEN -t vib-docs-engine:latest .
docker run --rm -p 8080:80 vib-docs-engine:latest
```

In Coolify, configure the Git repository (`https://github.com/vibtoolshq/vib-docs-engine`), Dockerfile build, port `80`, domain `https://developer.vibtools.io`, and `GIT_TOKEN` as a build secret/environment secret. Configure a protected webhook or CI trigger to rebuild the service. The webhook receiver must verify signatures, rate-limit requests, and publish only a successfully built image; Nginx serves static files and never fetches docs at request time.

## 4. Connect developer repositories

For a GitHub developer repository under `https://github.com/vibtoolshq/*`, copy `templates/github-notify-docs.yml` to `.github/workflows/notify-docs.yml`. Add the repository Actions secret `DOCS_DEPLOY_HOOK_URL` with the protected build-hook URL for `https://developer.vibtools.io`. The workflow listens for pushes to `main` that modify `docs/**` or `.vibtools/**` and sends a POST request to the hook.

For GitLab, Gitea/Forgejo, or a VPS receiver, use `templates/webhook-trigger.sh` as the curl request. Store `DOCS_DEPLOY_HOOK_URL` as a protected CI/webhook secret. Configure source-host signature verification and path/event filters where available; do not expose hook URLs in logs or source code.

## Final launch checks

Before DNS cutover, run `npm test`, `npm run lint`, and `npm run verify`. Confirm `config/site.config.json` has `"portalType": "developer"` and `"domain": "https://developer.vibtools.io"`, all entries in `config/projects.json` point to developer repositories, and static routes, Pagefind index, sitemap, robots, global and per-project `llms.txt`, per-page `.md` exports, and 404 output pass verification.

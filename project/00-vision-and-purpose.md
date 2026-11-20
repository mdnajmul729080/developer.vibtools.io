# 00. Vision and Purpose

## Core purpose

Build `vib-docs-engine`, one reusable, production-grade static documentation engine for a software company or studio managing multiple paid apps, free tools, open-source projects, engines, and modules. Product documentation lives with the product source; this repository supplies the shared publishing engine and portal configuration.

The engine prioritizes static delivery, search without third-party runtime services, compact developer-first reading, strong SEO, and a zero-code-update content workflow. A product team should be able to publish a documentation change by updating its docs and triggering a deployment build, not by changing website source.

## Developer portal deployment (`https://developer.vibtools.io`)

This repository (`https://github.com/vibtoolshq/vib-docs-engine`) is configured as the official developer documentation portal at **`https://developer.vibtools.io`** (`portalType: "developer"`):

- **`https://developer.vibtools.io`:** developer and open-source documentation for SDKs, engines, modules, CLI tools, and self-hosted packages.
- **Strict developer-only filtering (`portalType: "developer"`):** during `scripts/sync-docs.mjs`, the portal accepts **only** product repositories whose `.vibtools/docs.config.json` (or `config.docs.json`) explicitly declares `"docsType": "dev"` or `"docsType": "developer"` (or defines a `targets.developer` block without `docsType: "users"`). End-user projects (`"docsType": "users"` / `"user"`) and untyped projects are automatically skipped.

**Strict separation rule:** never hardcode product catalogs in application source. Portal-specific distinctions and audience filtering are enforced through `config/site.config.json`, `config/projects.json`, and `.vibtools/docs.config.json`.

## Five non-negotiable rules

1. **Zero code updates for content or new products.** Adding a product or updating documentation must never require touching `.astro`, `.ts`, or `.css` application files. The only required product change is its `config/projects.json` record; documentation changes belong in that product's repository.
2. **Zero hardcoded categories.** Categories come entirely from the `category` strings in `config/projects.json`. Derive unique category tabs from configured products. Hide the filter tabs completely when there is one or fewer unique categories.
3. **Product documentation lives in product Git repos.** Do not store authored product docs in this website repository. Each product repo contains its own `docs/index.md` and any nested `.md`/`.mdx` pages and assets. `src/content/docs/`, `src/generated/`, and synchronized product logos are generated build inputs, not authoring locations.
4. **Pure static output and build-time sync.** During `prebuild`, `scripts/sync-docs.mjs` retrieves only the configured docs subtree through Git sparse checkout, then Astro emits static HTML/CSS and Pagefind emits the local search index in `dist/`. No client-side Git or docs API calls are allowed at runtime.
5. **Ultra-compact, zero-clutter UI.** Keep padding minimal, information density high, borders crisp and 1px, and decoration to zero. Documentation content, not chrome, is the focus.
6. **Frozen `.vibtools/` configuration schema (Owner-locked).** Both `https://docs.vib.tools` (`users`) and `https://developer.vibtools.io` (`developer`) share the exact frozen `.vibtools/docs.config.json` schema (`schemaVersion: 1`) defined in `project/05-frozen-vibtools-schema.md`. AI coding agents must never change, extend, rename, or break this schema during code updates or fixes without explicit authorization from the repository Owner.

## Scope and implementation boundary

Phases 1-7 establish the documented engine: configuration/specifications, Astro/Tailwind and Content Collections, sync/manifest generation, design system and Hub, product reader, static search/SEO endpoints, portal presets/exporter, deployment automation, and build verifier. Phase 8 establishes repository documentation governance and the codebase reference. The current implementation is a static site; new capability should be introduced through the existing configuration/content boundaries where practical.

## Decision rule for future work

When a proposed implementation conflicts with this document or the detailed architecture/features/design specs, follow the specs. If a capability cannot be driven from configuration or synchronized docs, treat that as a design gap and resolve it before adding a product-specific code branch.

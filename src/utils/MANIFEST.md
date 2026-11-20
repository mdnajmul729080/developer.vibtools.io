# Utilities Directory Manifest

| File          | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `README.md`   | Shared utility boundaries                        |
| `MANIFEST.md` | File inventory                                   |
| `manifest.ts`         | Site, project, sidebar, and flat-page contracts                         |
| `sidebar.ts`          | Recursive filesystem-to-route navigation builder                        |
| `search.ts`           | Search route normalization, breadcrumbs, recent docs, and suggestions   |
| `search.test.ts`      | `node:test` unit tests for pure search UI helpers                       |
| `seo.ts`              | Protocol-safe origins and XSS-safe Schema.org JSON-LD builders          |
| `seo.test.ts`         | `node:test` unit tests for JSON-LD and origin resolution                |
| `llms.ts`             | Shared YAML-free Markdown export and `/llms.txt` / `/llms-full.txt` builders |
| `vibtoolsConfig.ts`   | Zero-dependency `.vibtools/` config validator, dual-target resolver, and Markdown metadata extractor |
| `vibtoolsConfig.test.ts` | `node:test` unit tests for `.vibtools/` schema, filtering, and Smart Markdown parsing |
| `syncMetadata.ts`     | Zero-dependency display metadata precedence resolver and cycle-safe sparse branch switch guard |
| `syncMetadata.test.ts` | `node:test` unit tests for `resolveProjectDisplayMetadata` and `nextSparseBranchTarget` |
| `theme.ts`            | Accent validation/fallback and monogram helpers                         |

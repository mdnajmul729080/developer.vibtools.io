# Project Specifications and Engineering Record

This tracked directory is the source of truth for why the engine exists, its two-portal architecture, supported features, UI contracts, code/module responsibilities, and dated implementation history.

## Reading order

- `00-vision-and-purpose.md`: purpose and non-negotiable rules.
- `01-architecture.md`: data pipeline, hosting, config and security boundaries.
- `02-features-and-workflow.md`: product behavior and operating workflows.
- `03-ui-design-system.md`: tokens and target layouts/wireframes.
- `04-codebase-reference.md`: verified current file/function map and setup flow.
- `05-frozen-vibtools-schema.md`: **FINAL & FROZEN** `.vibtools/docs.config.json` schema contract (`schemaVersion: 1`, immutable without explicit Owner permission).
- `CHANGELOG.md`: dated phase and fix log.
- `MANIFEST.md`: file inventory.

For user/operator instructions, use the tracked guides under `docs/`. Update the relevant spec/reference and changelog in the same change that alters implementation.

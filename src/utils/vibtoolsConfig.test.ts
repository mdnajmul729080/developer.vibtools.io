import assert from "node:assert/strict";
import test from "node:test";
import { formatVersionBadge } from "./theme";
import {
  buildVibtoolsJsonSchema,
  deriveSlugFromSource,
  extractMarkdownMetadata,
  normalizeRegistryEntry,
  parseVibtoolsRepoConfig,
  resolvePortalProjectConfig,
  VIBTOOLS_SCHEMA_PATH,
} from "./vibtoolsConfig";

test("parseVibtoolsRepoConfig validates single and dual target configs and normalizes 'dev' to 'developer'", () => {
  const validDual = parseVibtoolsRepoConfig({
    $schema: "https://developer.vibtools.io/schemas/vibtools-docs.schema.json",
    schemaVersion: 1,
    slug: "licenx",
    title: "LicenX",
    version: "1.0.2",
    accentColor: "#2563EB",
    logoPath: ".vibtools/logo.png",
    targets: {
      users: {
        category: "License Management",
        description: "End-user setup for LicenX.",
        docsPath: "docs/users",
      },
      developer: {
        slug: "licenx-sdk",
        title: "LicenX SDK",
        category: "SDKs & Modules",
        docsPath: "docs/dev",
        ctaLabel: "View repository",
        ctaUrl: "https://github.com/vibtoolshq/LicenX",
      },
    },
  });

  assert.equal(validDual.success, true);
  if (validDual.success) {
    assert.equal(
      validDual.data.$schema,
      "https://developer.vibtools.io/schemas/vibtools-docs.schema.json",
    );
    assert.equal(validDual.data.targets?.users?.docsPath, "docs/users");
    assert.equal(validDual.data.targets?.developer?.slug, "licenx-sdk");
  }

  const shortDev = parseVibtoolsRepoConfig({
    docsType: "dev",
    slug: "socketcore",
    category: "Core Infrastructure",
    targets: {
      dev: {
        docsPath: "docs/dev",
      },
      user: {
        docsPath: "docs/user",
      },
    },
  });
  assert.equal(shortDev.success, true);
  if (shortDev.success) {
    assert.equal(shortDev.data.docsType, "developer");
    assert.equal(shortDev.data.targets?.developer?.docsPath, "docs/dev");
    assert.equal(shortDev.data.targets?.users?.docsPath, "docs/user");
  }
});

test("parseVibtoolsRepoConfig rejects path traversal, invalid slug, and invalid accentColor", () => {
  const traversal = parseVibtoolsRepoConfig({ docsPath: "../secret" });
  assert.equal(traversal.success, false);

  const logoAbsolute = parseVibtoolsRepoConfig({ logoPath: "/etc/passwd" });
  assert.equal(logoAbsolute.success, false);

  const badSlug = parseVibtoolsRepoConfig({ slug: "SocketCore_SDK" });
  assert.equal(badSlug.success, false);

  const badAccent = parseVibtoolsRepoConfig({ accentColor: "purple" });
  assert.equal(badAccent.success, false);

  const emptySchema = parseVibtoolsRepoConfig({ $schema: "   " });
  assert.equal(emptySchema.success, false);
});

test("normalizeRegistryEntry supports bare repoUrl strings and rejects embedded credentials", () => {
  const urlOnly = normalizeRegistryEntry("https://github.com/vibtoolshq/SocketCore.git");
  assert.equal(urlOnly.success, true);
  if (urlOnly.success) {
    assert.equal(urlOnly.data.repoUrl, "https://github.com/vibtoolshq/SocketCore.git");
  }

  const withCreds = normalizeRegistryEntry("https://user:token@github.com/vibtoolshq/SocketCore.git");
  assert.equal(withCreds.success, false);

  assert.equal(deriveSlugFromSource("https://github.com/vibtoolshq/Socket_Core.git"), "socket-core");
});

test("resolvePortalProjectConfig accepts only developer ('dev' | 'developer') docs on developer portal and skips users or untyped configs", () => {
  const entry = normalizeRegistryEntry("https://github.com/vibtoolshq/SocketCore.git");
  assert.equal(entry.success, true);
  if (!entry.success) return;

  const devShortConfig = parseVibtoolsRepoConfig({
    docsType: "dev",
    slug: "socketcore",
    title: "SocketCore",
    category: "Core Infrastructure",
    docsPath: "docs",
  });
  assert.equal(devShortConfig.success, true);
  if (devShortConfig.success) {
    const resolved = resolvePortalProjectConfig({
      portalType: "developer",
      registryEntry: entry.data,
      remoteConfig: devShortConfig.data,
    });
    assert.equal(resolved.matched, true);
    if (resolved.matched) {
      assert.equal(resolved.project.slug, "socketcore");
      assert.equal(resolved.project.docsType, "developer");
    }
  }

  const usersOnlyConfig = parseVibtoolsRepoConfig({
    docsType: "users",
    slug: "user-app",
    category: "Desktop Apps",
  });
  assert.equal(usersOnlyConfig.success, true);
  if (usersOnlyConfig.success) {
    const skippedUsers = resolvePortalProjectConfig({
      portalType: "developer",
      registryEntry: entry.data,
      remoteConfig: usersOnlyConfig.data,
    });
    assert.equal(skippedUsers.matched, false);
  }

  const untypedConfig = parseVibtoolsRepoConfig({
    slug: "untyped-app",
    category: "Tools",
  });
  assert.equal(untypedConfig.success, true);
  if (untypedConfig.success) {
    const skippedUntyped = resolvePortalProjectConfig({
      portalType: "developer",
      registryEntry: entry.data,
      remoteConfig: untypedConfig.data,
    });
    assert.equal(skippedUntyped.matched, false);
  }

  const noRemoteConfigSkipped = resolvePortalProjectConfig({
    portalType: "developer",
    registryEntry: entry.data,
    remoteConfig: null,
  });
  assert.equal(noRemoteConfigSkipped.matched, false);
});

test("resolvePortalProjectConfig selects developer target from dual-target config and lets portal registry override .vibtools values", () => {
  const parsed = parseVibtoolsRepoConfig({
    schemaVersion: 1,
    slug: "licenx",
    title: "LicenX",
    version: "1.0.2",
    accentColor: "#2563EB",
    logoPath: ".vibtools/logo.png",
    targets: {
      users: {
        category: "Desktop Apps",
        docsPath: "docs/users",
      },
      developer: {
        slug: "licenx-sdk",
        title: "LicenX SDK",
        category: "SDKs & Modules",
        docsPath: "docs/dev",
      },
    },
  });
  assert.equal(parsed.success, true);
  if (!parsed.success) return;

  const entry = normalizeRegistryEntry("https://github.com/vibtoolshq/LicenX.git");
  assert.equal(entry.success, true);
  if (!entry.success) return;

  const devResolved = resolvePortalProjectConfig({
    portalType: "developer",
    registryEntry: entry.data,
    remoteConfig: parsed.data,
  });
  assert.equal(devResolved.matched, true);
  if (devResolved.matched) {
    assert.equal(devResolved.project.slug, "licenx-sdk");
    assert.equal(devResolved.project.title, "LicenX SDK");
    assert.equal(devResolved.project.docsPath, "docs/dev");
  }

  const devConfig = parseVibtoolsRepoConfig({
    docsType: "developer",
    slug: "socketcore",
    category: "Core Engine",
    accentColor: "#2563EB",
    docsPath: "docs/dev",
  });
  const overrideEntry = normalizeRegistryEntry({
    repoUrl: "https://github.com/vibtoolshq/SocketCore.git",
    slug: "socketcore-custom",
    accentColor: "#10B981",
  });
  assert.equal(devConfig.success, true);
  assert.equal(overrideEntry.success, true);
  if (!devConfig.success || !overrideEntry.success) return;

  const resolvedOverride = resolvePortalProjectConfig({
    portalType: "developer",
    registryEntry: overrideEntry.data,
    remoteConfig: devConfig.data,
  });
  assert.equal(resolvedOverride.matched, true);
  if (resolvedOverride.matched) {
    assert.equal(resolvedOverride.project.slug, "socketcore-custom");
    assert.equal(resolvedOverride.project.accentColor, "#10B981");
    assert.equal(resolvedOverride.project.docsPath, "docs/dev");
  }
});

test("extractMarkdownMetadata extracts clean title, first paragraph description, and version without frontmatter", () => {
  const sampleDevMarkdown = `# SocketCore — Developer Documentation

**SocketCore** is a high-throughput WebSocket and event transport core for Vib Tools distributed services. With binary frame framing, backpressure control, and zero-allocation routing, SocketCore powers real-time developer infrastructure.

---

## About SocketCore

SocketCore v1.0.2 — Event Transport Core
`;

  const extracted = extractMarkdownMetadata(sampleDevMarkdown);
  assert.equal(extracted.title, "SocketCore");
  assert.equal(
    extracted.description,
    "SocketCore is a high-throughput WebSocket and event transport core for Vib Tools distributed services.",
  );
  assert.equal(extracted.version, "1.0.2");
});

test("resolvePortalProjectConfig honors registry docsType when portalType is all on dual-target repos", () => {
  const parsed = parseVibtoolsRepoConfig({
    schemaVersion: 1,
    docsType: "both",
    title: "LicenX",
    targets: {
      users: {
        slug: "licenx",
        docsPath: "docs/users",
      },
      developer: {
        slug: "licenx-sdk",
        title: "LicenX SDK",
        docsPath: "docs/developer",
      },
    },
  });
  assert.equal(parsed.success, true);
  if (!parsed.success) return;

  const devEntry = normalizeRegistryEntry({
    repoUrl: "https://github.com/vibtoolshq/LicenX.git",
    slug: "licenx-sdk",
    docsType: "dev",
  });
  assert.equal(devEntry.success, true);
  if (!devEntry.success) return;

  const devResolved = resolvePortalProjectConfig({
    portalType: "all",
    registryEntry: devEntry.data,
    remoteConfig: parsed.data,
  });
  assert.equal(devResolved.matched, true);
  if (devResolved.matched) {
    assert.equal(devResolved.project.slug, "licenx-sdk");
    assert.equal(devResolved.project.docsPath, "docs/developer");
    assert.equal(devResolved.project.docsType, "developer");
  }
});

test("formatVersionBadge normalizes leading v prefixes cleanly", () => {
  assert.equal(formatVersionBadge("1.0.2"), "v1.0.2");
  assert.equal(formatVersionBadge("v1.0.2"), "v1.0.2");
  assert.equal(formatVersionBadge("V2.4.0-rc1"), "v2.4.0-rc1");
  assert.equal(formatVersionBadge("vv0.1.0"), "v0.1.0");
  assert.equal(formatVersionBadge(1.2), "v1.2");
  assert.equal(formatVersionBadge(""), "");
  assert.equal(formatVersionBadge("v"), "");
  assert.equal(formatVersionBadge(undefined), "");
});

test("buildVibtoolsJsonSchema emits Draft 2020-12 schema with canonical developer.vibtools.io $id", () => {
  const schema = buildVibtoolsJsonSchema(
    `https://developer.vibtools.io${VIBTOOLS_SCHEMA_PATH}`,
  );
  assert.equal(
    schema.$schema,
    "https://json-schema.org/draft/2020-12/schema",
  );
  assert.equal(
    schema.$id,
    "https://developer.vibtools.io/schemas/vibtools-docs.schema.json",
  );
  assert.equal(schema.title, "VibToolsDocsConfig");
  assert.equal(typeof schema.properties, "object");
  assert.equal(typeof schema.$defs, "object");
});

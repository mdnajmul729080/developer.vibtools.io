import assert from "node:assert/strict";
import test from "node:test";
import {
  nextSparseBranchTarget,
  resolveProjectDisplayMetadata,
} from "./syncMetadata";

test("resolveProjectDisplayMetadata prioritizes .vibtools / registry metadata over stale index.md frontmatter", () => {
  const resolved = resolveProjectDisplayMetadata({
    projectTitle: "SocketCore",
    projectDescription: "Updated developer transport description from .vibtools.",
    projectVersion: "2.4.0",
    frontmatterTitle: "Old Frontmatter Title",
    frontmatterDescription: "Older index.md frontmatter description.",
    frontmatterVersion: "1.0.0",
    extractedTitle: "Extracted Heading",
    extractedDescription: "Extracted summary paragraph.",
    extractedVersion: "0.9.0",
    markdownHeadingTitle: "Raw H1",
    fallbackSlugTitle: "Socketcore",
  });

  assert.deepEqual(resolved, {
    title: "SocketCore",
    description: "Updated developer transport description from .vibtools.",
    version: "2.4.0",
  });
});

test("resolveProjectDisplayMetadata preserves numeric 0 values cleanly", () => {
  const resolved = resolveProjectDisplayMetadata({
    projectTitle: 0,
    projectDescription: "Zero-indexed test entry.",
    projectVersion: 0,
    frontmatterVersion: "1.2.0",
  });

  assert.deepEqual(resolved, {
    title: "0",
    description: "Zero-indexed test entry.",
    version: "0",
  });
});

test("resolveProjectDisplayMetadata falls back cleanly from frontmatter -> extracted -> markdown heading -> slug title", () => {
  const fromFrontmatter = resolveProjectDisplayMetadata({
    frontmatterTitle: "From Frontmatter",
    frontmatterDescription: "Frontmatter summary.",
    frontmatterVersion: "1.5.0",
    extractedTitle: "From Extracted",
    extractedDescription: "Extracted summary.",
    extractedVersion: "1.4.0",
    markdownHeadingTitle: "From H1",
    fallbackSlugTitle: "Fallback Slug",
  });
  assert.deepEqual(fromFrontmatter, {
    title: "From Frontmatter",
    description: "Frontmatter summary.",
    version: "1.5.0",
  });

  const fromExtracted = resolveProjectDisplayMetadata({
    projectTitle: "   ",
    projectVersion: "",
    extractedTitle: "Extracted Product",
    extractedDescription: "Extracted description.",
    extractedVersion: "0.8.1",
    markdownHeadingTitle: "Raw H1",
    fallbackSlugTitle: "Fallback Slug",
  });
  assert.deepEqual(fromExtracted, {
    title: "Extracted Product",
    description: "Extracted description.",
    version: "0.8.1",
  });

  const fromHeading = resolveProjectDisplayMetadata({
    markdownHeadingTitle: "Heading Title",
    fallbackSlugTitle: "Fallback Slug",
  });
  assert.deepEqual(fromHeading, {
    title: "Heading Title",
    description: "",
    version: "",
  });

  const fromSlug = resolveProjectDisplayMetadata({
    fallbackSlugTitle: "Fallback Slug",
  });
  assert.deepEqual(fromSlug, {
    title: "Fallback Slug",
    description: "",
    version: "",
  });
});

test("nextSparseBranchTarget rejects no-ops, cycles, and exceeding maxSwitches", () => {
  const visited = new Set<string>(["main"]);

  assert.equal(nextSparseBranchTarget("main", "main", visited), null);
  assert.equal(nextSparseBranchTarget("main", "", visited), null);
  assert.equal(nextSparseBranchTarget("main", undefined, visited), null);

  const first = nextSparseBranchTarget("main", "docs-v2", visited, 2);
  assert.equal(first, "docs-v2");
  if (first) visited.add(first);

  // Cycle back to already visited branch is blocked
  assert.equal(nextSparseBranchTarget("docs-v2", "main", visited, 2), null);
  assert.equal(nextSparseBranchTarget("docs-v2", "docs-v2", visited, 2), null);

  // Second hop allowed within maxSwitches = 2
  const second = nextSparseBranchTarget("docs-v2", "docs-v3", visited, 2);
  assert.equal(second, "docs-v3");
  if (second) visited.add(second);

  // Third hop blocked when maxSwitches = 2
  assert.equal(nextSparseBranchTarget("docs-v3", "docs-v4", visited, 2), null);
});

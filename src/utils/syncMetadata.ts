export interface DisplayMetadataInput {
  projectTitle?: string | number | null;
  projectDescription?: string | number | null;
  projectVersion?: string | number | null;
  frontmatterTitle?: string | number | null;
  frontmatterDescription?: string | number | null;
  frontmatterVersion?: string | number | null;
  extractedTitle?: string | number | null;
  extractedDescription?: string | number | null;
  extractedVersion?: string | number | null;
  markdownHeadingTitle?: string | number | null;
  fallbackSlugTitle?: string | number | null;
}

export interface ResolvedDisplayMetadata {
  title: string;
  description: string;
  version: string;
}

function pickMetadataText(
  ...candidates: Array<string | number | null | undefined>
): string {
  for (const candidate of candidates) {
    if (typeof candidate === "number") {
      if (Number.isFinite(candidate)) return String(candidate);
      continue;
    }
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed !== "") return trimmed;
    }
  }
  return "";
}

export function resolveProjectDisplayMetadata(
  input: DisplayMetadataInput,
): ResolvedDisplayMetadata {
  const title = pickMetadataText(
    input.projectTitle,
    input.frontmatterTitle,
    input.extractedTitle,
    input.markdownHeadingTitle,
    input.fallbackSlugTitle,
  );
  const description = pickMetadataText(
    input.projectDescription,
    input.frontmatterDescription,
    input.extractedDescription,
  );
  const version = pickMetadataText(
    input.projectVersion,
    input.frontmatterVersion,
    input.extractedVersion,
  );

  return { title, description, version };
}

export function nextSparseBranchTarget(
  currentBranch: string,
  resolvedBranch: string | undefined,
  visitedBranches: Set<string>,
  maxSwitches = 2,
): string | null {
  const current = typeof currentBranch === "string" ? currentBranch.trim() : "";
  const target = typeof resolvedBranch === "string" ? resolvedBranch.trim() : "";

  if (!target || target === current) return null;
  if (visitedBranches.has(target)) return null;

  const switchesPerformed =
    current && visitedBranches.has(current)
      ? Math.max(0, visitedBranches.size - 1)
      : visitedBranches.size;

  if (switchesPerformed >= maxSwitches) return null;
  return target;
}

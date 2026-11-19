import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDocJsonLd,
  buildHubJsonLd,
  resolveAbsoluteUrl,
  resolveOrigin,
  safeJsonLdStringify,
} from "./seo";
import type { SiteConfig } from "./manifest";

const sampleSite: SiteConfig = {
  portalTitle: "Vib Tools Developer Hub",
  portalSubtitle: "SDKs, open-source engines, self-hosted infrastructure, and API references.",
  domain: "developer.vibtools.io",
  brandName: "Vib Tools",
  brandLogo: "/vib-tools-logo.png",
  defaultAccent: "#2563EB",
  portalType: "developer",
  navLinks: [
    { label: "Vib Tools", href: "https://vib.tools" },
    { label: "GitHub", href: "https://github.com/vibtoolshq" },
  ],
};

test("resolveOrigin and resolveAbsoluteUrl add https scheme fallback safely", () => {
  assert.equal(resolveOrigin("developer.vibtools.io/"), "https://developer.vibtools.io");
  assert.equal(
    resolveAbsoluteUrl("/vib-docs-engine/deployment/", sampleSite.domain),
    "https://developer.vibtools.io/vib-docs-engine/deployment/",
  );
});

test("safeJsonLdStringify escapes HTML script tags to prevent breakout", () => {
  const serialized = safeJsonLdStringify({ title: "</script><script>alert(1)</script>&" });
  assert.ok(!serialized.includes("</script>"));
  assert.ok(serialized.includes("\\u003c/script\\u003e"));
  assert.ok(serialized.includes("\\u0026"));
  assert.deepEqual(JSON.parse(serialized), {
    title: "</script><script>alert(1)</script>&",
  });
});

test("buildHubJsonLd outputs Organization and WebSite SearchAction nodes", () => {
  const schema = buildHubJsonLd(sampleSite);
  const graph = schema["@graph"] as Array<Record<string, unknown>>;
  assert.equal(schema["@context"], "https://schema.org");
  assert.equal(graph.length, 2);
  assert.equal(graph[0]["@type"], "Organization");
  assert.equal(graph[0].logo, "https://developer.vibtools.io/vib-tools-logo.png");
  assert.equal(graph[1]["@type"], "WebSite");
  const action = graph[1].potentialAction as Record<string, unknown>;
  assert.equal(action["@type"], "SearchAction");
  assert.deepEqual(action.target, {
    "@type": "EntryPoint",
    urlTemplate: "https://developer.vibtools.io/?q={search_term_string}",
  });
});

test("buildDocJsonLd outputs TechArticle and ordered BreadcrumbList nodes", () => {
  const schema = buildDocJsonLd({
    site: sampleSite,
    product: {
      slug: "vib-docs-engine",
      title: "Vib Docs Engine",
      description: "Static engine docs.",
      version: "1.0.0",
    },
    pageTitle: "Deployment",
    description: "Deploy to Cloudflare Pages.",
    canonicalPath: "/vib-docs-engine/deployment/",
    breadcrumbs: [
      { name: "Docs", item: "/" },
      { name: "Vib Docs Engine", item: "/vib-docs-engine/" },
      { name: "Deployment", item: "/vib-docs-engine/deployment/" },
    ],
  });

  const graph = schema["@graph"] as Array<Record<string, unknown>>;
  assert.equal(graph[0]["@type"], "TechArticle");
  assert.equal(graph[0].headline, "Deployment");
  assert.deepEqual(graph[0].about, {
    "@type": "SoftwareApplication",
    name: "Vib Docs Engine",
    softwareVersion: "1.0.0",
  });

  const breadcrumbs = graph[1];
  assert.equal(breadcrumbs["@type"], "BreadcrumbList");
  const items = breadcrumbs.itemListElement as Array<Record<string, unknown>>;
  assert.equal(items.length, 3);
  assert.equal(items[0].position, 1);
  assert.equal(items[2].item, "https://developer.vibtools.io/vib-docs-engine/deployment/");
});

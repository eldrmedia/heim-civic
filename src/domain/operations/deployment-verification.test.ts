import { describe, expect, it, vi } from "vitest";

import { securityHeaders } from "@/config/security-headers";
import { verifyProductionDeployment } from "@/domain/operations/deployment-verification";

const origin = "https://heimcivic.org";

function sitemapBody() {
  const routes = [
    `${origin}/officials/nv-lcb-307`,
    `${origin}/districts/congressional-1`,
    `${origin}/bills/nv-83-2025-ab1`,
    ...Array.from(
      { length: 1_297 },
      (_, index) => `${origin}/bills/synthetic-${index}`,
    ),
  ];

  return `<urlset>${routes.map((route) => `<url><loc>${route}</loc></url>`).join("")}</urlset>`;
}

function response(
  body: string,
  contentType: string,
  additionalHeaders: Record<string, string> = {},
) {
  return new Response(body, {
    headers: { "content-type": contentType, ...additionalHeaders },
  });
}

function successfulFetch(): typeof fetch {
  const responseHeaders = Object.fromEntries(
    securityHeaders.map((header) => [header.key, header.value]),
  );
  const responses = new Map<string, () => Response>([
    [
      `${origin}/`,
      () =>
        response(
          `<html><head><link href="${origin}" rel="canonical"></head><body>Heim Civic Nevada</body></html>`,
          "text/html; charset=utf-8",
          responseHeaders,
        ),
    ],
    [
      `${origin}/api/health`,
      () => response('{"status":"ready"}', "application/json"),
    ],
    [
      `${origin}/robots.txt`,
      () =>
        response(
          `User-agent: OAI-SearchBot\nAllow: /\nUser-agent: GPTBot\nDisallow: /\nSitemap: ${origin}/sitemap.xml\n`,
          "text/plain",
        ),
    ],
    [`${origin}/sitemap.xml`, () => response(sitemapBody(), "application/xml")],
    [
      `${origin}/.well-known/security.txt`,
      () =>
        response(
          "Contact: mailto:security@heimcivic.org\nExpires: 2027-01-01T00:00:00Z\n",
          "text/plain",
        ),
    ],
    [
      `${origin}/officials`,
      () =>
        response(
          `<html><head><link rel="canonical" href="${origin}/officials"></head><body>Who represents Nevada.</body></html>`,
          "text/html",
        ),
    ],
  ]);

  return (async (input) => {
    const key =
      input instanceof Request
        ? input.url
        : input instanceof URL
          ? input.toString()
          : input;
    const factory = responses.get(key);
    return factory ? factory() : new Response("Not found", { status: 404 });
  }) as typeof fetch;
}

describe("production deployment verification", () => {
  it("passes a complete same-origin production deployment", async () => {
    const report = await verifyProductionDeployment({
      deploymentUrl: origin,
      checkedAt: new Date("2026-08-25T20:00:00.000Z"),
      fetchImplementation: successfulFetch(),
    });

    expect(report.status).toBe("ready");
    expect(report.checks).toHaveLength(8);
    expect(report.checks.every((check) => check.state === "pass")).toBe(true);
  });

  it("rejects localhost and placeholder deployment origins before fetching", async () => {
    const fetchImplementation = vi.fn<typeof fetch>();
    const report = await verifyProductionDeployment({
      deploymentUrl: "https://preview.example",
      fetchImplementation,
    });

    expect(report.status).toBe("not-ready");
    expect(report.checks).toHaveLength(1);
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it("fails closed when a required deployed artifact is unavailable", async () => {
    const completeFetch = successfulFetch();
    const fetchImplementation = (async (input, init) => {
      const url = input instanceof URL ? input : new URL(input.toString());
      if (url.pathname === "/api/health") {
        return response('{"status":"degraded"}', "application/json");
      }
      return completeFetch(input, init);
    }) as typeof fetch;
    const report = await verifyProductionDeployment({
      deploymentUrl: origin,
      fetchImplementation,
    });

    expect(report.status).toBe("not-ready");
    expect(
      report.checks.find((check) => check.id === "source-health")?.state,
    ).toBe("fail");
  });
});

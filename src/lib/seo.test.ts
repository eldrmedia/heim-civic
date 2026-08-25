import { afterEach, describe, expect, it, vi } from "vitest";

import { createPageMetadata, isPublicIndexingEnabled } from "@/lib/seo";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("SEO metadata policy", () => {
  it("publishes canonical social metadata for a configured public origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://civic.example/nevada");
    vi.stubEnv("VERCEL_ENV", "production");

    const metadata = createPageMetadata({
      title: "Nevada Assembly District 1",
      description: "Official district source and current representation.",
      pathname: "/districts/state-assembly-1",
    });

    expect(isPublicIndexingEnabled()).toBe(true);
    expect(metadata.alternates).toEqual({
      canonical: "https://civic.example/nevada/districts/state-assembly-1",
    });
    expect(metadata.openGraph).toMatchObject({
      url: "https://civic.example/nevada/districts/state-assembly-1",
      siteName: "Heim Civic Nevada",
      images: [
        expect.objectContaining({
          url: "https://civic.example/nevada/opengraph-image",
        }),
      ],
    });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it("fails closed for previews and unconfigured local builds", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(isPublicIndexingEnabled()).toBe(false);

    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(isPublicIndexingEnabled()).toBe(false);
  });
});

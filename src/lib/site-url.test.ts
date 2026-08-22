import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteUrl, toSiteUrl } from "@/lib/site-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("public site URL", () => {
  it("supports a configured HTTPS deployment root", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.org/nevada/");

    expect(getSiteUrl()).toBe("https://example.org/nevada");
    expect(toSiteUrl("/districts")).toBe(
      "https://example.org/nevada/districts",
    );
  });

  it("fails safely for an insecure public URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://example.org");

    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});

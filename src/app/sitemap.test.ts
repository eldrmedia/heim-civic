import { afterEach, describe, expect, it, vi } from "vitest";

import sitemap from "@/app/sitemap";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("public sitemap", () => {
  it("includes every stable public record route and excludes APIs", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://civic.example/nevada");
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toHaveLength(155);
    expect(urls).toContain("https://civic.example/nevada");
    expect(urls).toContain(
      "https://civic.example/nevada/districts/congressional-1",
    );
    expect(urls).toContain("https://civic.example/nevada/bills/selection");
    expect(urls.some((url) => url.includes("/api/"))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

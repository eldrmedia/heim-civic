import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "@/app/robots";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("crawler policy", () => {
  it("blocks every crawler when the public origin is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("allows public records and excludes APIs and onsite search", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://civic.example/nevada");
    vi.stubEnv("VERCEL_ENV", "production");
    const policy = robots();

    expect(policy.sitemap).toBe("https://civic.example/nevada/sitemap.xml");
    expect(policy.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userAgent: "*", allow: "/" }),
        expect.objectContaining({ userAgent: "OAI-SearchBot", allow: "/" }),
        expect.objectContaining({ userAgent: "GPTBot", disallow: "/" }),
      ]),
    );
  });
});

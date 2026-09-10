import { describe, expect, it } from "vitest";

import { securityHeaders } from "@/config/security-headers";

describe("security headers", () => {
  it("provides the static launch policy without weakening static rendering", () => {
    const headers = new Map(
      securityHeaders.map((header) => [header.key, header.value]),
    );
    const csp = headers.get("Content-Security-Policy") ?? "";

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("https://api.maptiler.com");
    expect(csp).not.toContain("unsafe-eval");
    expect(headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
  });
});

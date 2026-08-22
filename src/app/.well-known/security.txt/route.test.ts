import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/.well-known/security.txt/route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("GET /.well-known/security.txt", () => {
  it("fails closed when the private mailbox is not configured", async () => {
    vi.stubEnv("SECURITY_CONTACT_EMAIL", "");

    const response = GET();

    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("mailto:");
  });

  it("publishes a standards-oriented contact from server configuration", async () => {
    vi.stubEnv("SECURITY_CONTACT_EMAIL", "Security@Example.org");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://civic.example/nevada");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-22T12:00:00.000Z"));

    const response = GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(text).toContain("Contact: mailto:security@example.org");
    expect(text).toContain(
      "Canonical: https://civic.example/nevada/.well-known/security.txt",
    );
    expect(text).toContain("Expires: 2027-02-18T12:00:00.000Z");
  });
});

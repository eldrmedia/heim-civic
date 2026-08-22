import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/health/route";

afterEach(() => {
  vi.useRealTimers();
});

describe("GET /api/health", () => {
  it("returns a privacy-safe readiness report for current snapshots", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-22T21:00:00.000Z"));

    const response = GET();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(result).toMatchObject({
      schemaVersion: 1,
      scope: "published-snapshot-readiness",
      status: "ready",
    });
    expect(result.checks).toHaveLength(4);
    expect(JSON.stringify(result)).not.toMatch(/address|email|token/i);
  });

  it("returns 503 after required source snapshots become stale", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-01T00:00:00.000Z"));

    const response = GET();
    const result = await response.json();

    expect(response.status).toBe(503);
    expect(result.status).toBe("degraded");
    expect(result.checks).toEqual(
      expect.arrayContaining([expect.objectContaining({ state: "stale" })]),
    );
  });
});

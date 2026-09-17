import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/health/route";

// Keep the real health evaluator and route, but isolate them from changing
// repository snapshots. Refreshing data must not invalidate a fixed test clock.
vi.mock("@/server/status/source-snapshots", () => ({
  getSourceSnapshotStatuses: () =>
    [
      "boundaries",
      "officials",
      "bill-index",
      "enhanced-review",
      "legislation",
      "finance",
    ].map((id) => ({
      id,
      generatedAt: "2026-09-10T00:00:00.000Z",
      recordCount: 1,
      sourceCount: 1,
    })),
}));

afterEach(() => {
  vi.useRealTimers();
});

describe("GET /api/health", () => {
  it("returns a privacy-safe readiness report for current snapshots", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T20:05:00.000Z"));

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
    expect(result.checks).toHaveLength(6);
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

  it("returns 503 when snapshot retrieval is ahead of the server clock", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-09T00:00:00.000Z"));

    const response = GET();
    const result = await response.json();

    expect(response.status).toBe(503);
    expect(result.status).toBe("degraded");
    expect(result.checks).toHaveLength(6);
    expect(
      result.checks.every(
        (check: { state: string }) => check.state === "invalid",
      ),
    ).toBe(true);
  });
});

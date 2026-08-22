import { describe, expect, it } from "vitest";

import {
  evaluateSourceHealth,
  type SourceHealthInput,
} from "@/domain/status/source-health";

const checkedAt = new Date("2026-08-22T12:00:00.000Z");

function snapshot(
  overrides: Partial<SourceHealthInput> = {},
): SourceHealthInput {
  return {
    id: "officials",
    generatedAt: "2026-08-20T12:00:00.000Z",
    recordCount: 69,
    sourceCount: 6,
    ...overrides,
  };
}

describe("source health", () => {
  it("keeps a current snapshot ready", () => {
    const report = evaluateSourceHealth([snapshot()], checkedAt);

    expect(report.status).toBe("ready");
    expect(report.checks[0]).toMatchObject({
      state: "current",
      ageHours: 48,
      targetDays: 8,
    });
  });

  it("warns before the target without failing readiness", () => {
    const report = evaluateSourceHealth(
      [snapshot({ generatedAt: "2026-08-16T00:00:00.000Z" })],
      checkedAt,
    );

    expect(report.status).toBe("ready");
    expect(report.checks[0]?.state).toBe("due-soon");
  });

  it("degrades when a required snapshot is stale", () => {
    const report = evaluateSourceHealth(
      [snapshot({ generatedAt: "2026-08-01T00:00:00.000Z" })],
      checkedAt,
    );

    expect(report.status).toBe("degraded");
    expect(report.checks[0]?.state).toBe("stale");
  });

  it("rejects future dates and empty snapshots", () => {
    const report = evaluateSourceHealth(
      [
        snapshot({
          generatedAt: "2026-08-23T00:00:00.000Z",
          recordCount: 0,
        }),
      ],
      checkedAt,
    );

    expect(report.status).toBe("degraded");
    expect(report.checks[0]).toMatchObject({
      state: "invalid",
      ageHours: null,
    });
  });
});

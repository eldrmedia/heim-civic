import { describe, expect, it } from "vitest";

import {
  evaluateLaunchReadiness,
  launchEvidenceCheckIds,
  launchEvidenceSchema,
  type LaunchEvidence,
} from "@/domain/operations/launch-readiness";
import type { SourceHealthInput } from "@/domain/status/source-health";

const checkedAt = new Date("2026-08-25T18:00:00.000Z");
const contentCounts = {
  publishedNevadaBills: 31,
  publishedFederalBills: 1,
};

function snapshots(): SourceHealthInput[] {
  return [
    ["boundaries", 67, 3],
    ["officials", 69, 3],
    ["bill-index", 1_152, 2],
    ["enhanced-review", 31, 5],
    ["legislation", 32, 6],
    ["finance", 2, 2],
  ].map(([id, recordCount, sourceCount]) => ({
    id: id as SourceHealthInput["id"],
    generatedAt: "2026-08-25T12:00:00.000Z",
    recordCount: recordCount as number,
    sourceCount: sourceCount as number,
  }));
}

function evidence(): LaunchEvidence {
  return {
    schemaVersion: 1,
    deploymentUrl: "https://heimcivic.org",
    reviewedAt: "2026-08-25T17:00:00.000Z",
    checks: launchEvidenceCheckIds.map((id) => ({
      id,
      status: "passed",
      verifiedAt: "2026-08-25T16:00:00.000Z",
      evidenceReference: `private-ops:phase-9.6/${id}`,
      reviewerRole: "launch reviewer",
    })),
  };
}

const productionEnvironment = {
  NEXT_PUBLIC_SITE_URL: "https://heimcivic.org",
  NEXT_PUBLIC_MAPTILER_KEY: "domain-restricted-public-map-key",
  LOOKUP_RATE_LIMIT_SECRET: "rate-limit-secret-with-32-plus-characters",
  SECURITY_CONTACT_EMAIL: "security@heimcivic.org",
  CORRECTIONS_INTAKE_WEBHOOK_URL: "https://intake.heimcivic.org/corrections",
  CORRECTIONS_INTAKE_WEBHOOK_TOKEN: "correction-token-with-32-plus-characters",
  WAITLIST_INTAKE_WEBHOOK_URL: "https://intake.heimcivic.org/waitlist",
  WAITLIST_INTAKE_WEBHOOK_TOKEN: "waitlist-token-with-32-plus-characters",
};

describe("launch readiness", () => {
  it("passes the repository-controlled launch contract independently", () => {
    const report = evaluateLaunchReadiness({
      mode: "repository",
      checkedAt,
      snapshots: snapshots(),
      contentCounts,
    });

    expect(report.status).toBe("ready");
    expect(report.checks).toHaveLength(6);
    expect(report.checks.every((check) => check.state === "pass")).toBe(true);
  });

  it("fails production readiness closed when configuration is absent", () => {
    const report = evaluateLaunchReadiness({
      mode: "production",
      checkedAt,
      snapshots: snapshots(),
      contentCounts,
      environment: {},
      evidence: null,
      evidenceError: true,
    });

    expect(report.status).toBe("not-ready");
    expect(
      report.checks.find((check) => check.id === "public-origin")?.state,
    ).toBe("fail");
    expect(
      report.checks.find((check) => check.id === "monitoring-alert-drill")
        ?.state,
    ).toBe("fail");
  });

  it("passes only with production configuration and complete evidence", () => {
    const report = evaluateLaunchReadiness({
      mode: "production",
      checkedAt,
      snapshots: snapshots(),
      contentCounts,
      environment: productionEnvironment,
      evidence: evidence(),
    });

    expect(report.status).toBe("ready");
    expect(report.checks.every((check) => check.state === "pass")).toBe(true);
  });

  it("does not expose configuration secrets or private evidence references", () => {
    const report = evaluateLaunchReadiness({
      mode: "production",
      checkedAt,
      snapshots: snapshots(),
      contentCounts,
      environment: productionEnvironment,
      evidence: evidence(),
    });
    const serialized = JSON.stringify(report);

    expect(serialized).not.toContain(
      productionEnvironment.LOOKUP_RATE_LIMIT_SECRET,
    );
    expect(serialized).not.toContain(
      productionEnvironment.CORRECTIONS_INTAKE_WEBHOOK_TOKEN,
    );
    expect(serialized).not.toContain("private-ops:");
  });

  it("rejects reserved origins, weak tokens, and incomplete evidence", () => {
    const incompleteEvidence = evidence();
    incompleteEvidence.checks = incompleteEvidence.checks.slice(1);

    expect(launchEvidenceSchema.safeParse(incompleteEvidence).success).toBe(
      false,
    );

    const report = evaluateLaunchReadiness({
      mode: "production",
      checkedAt,
      snapshots: snapshots(),
      contentCounts,
      environment: {
        ...productionEnvironment,
        NEXT_PUBLIC_SITE_URL: "https://pilot.example",
        WAITLIST_INTAKE_WEBHOOK_TOKEN: "test-token",
      },
      evidence: null,
      evidenceError: true,
    });

    expect(report.status).toBe("not-ready");
    expect(
      report.checks.find((check) => check.id === "public-origin")?.state,
    ).toBe("fail");
    expect(
      report.checks.find((check) => check.id === "waitlist-intake")?.state,
    ).toBe("fail");
  });
});

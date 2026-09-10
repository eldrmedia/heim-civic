import { describe, expect, it } from "vitest";

import billIndexData from "@/data/generated/nevada-bill-index.json";
import legacyReviewData from "@/data/generated/enhanced-bill-review-legacy-ab83.json";
import baseLegislationData from "@/data/generated/pilot-legislation.json";
import promotedLegislationData from "@/data/generated/promoted-enhanced-legislation.json";
import { auditEnhancedPilotCoverage } from "@/domain/legislation/coverage-audit";
import type { EnhancedBillReviewCandidate } from "@/domain/legislation/enhanced-review-types";
import type { NevadaBillIndexRecord } from "@/domain/legislation/index-types";
import type { PilotBill } from "@/domain/legislation/types";
import { getEnhancedBillReviewQueue } from "@/server/legislation/enhanced-review-repository";

describe("Phase 9.3 enhanced coverage audit", () => {
  it("proves complete coverage breadth, integrity, and accountable approval", () => {
    const report = auditEnhancedPilotCoverage({
      bills: [
        ...baseLegislationData.bills,
        ...promotedLegislationData.bills,
      ] as PilotBill[],
      indexRecords: billIndexData.records as NevadaBillIndexRecord[],
      reviewRecords: [
        ...getEnhancedBillReviewQueue(),
        ...legacyReviewData.records,
      ] as EnhancedBillReviewCandidate[],
    });

    expect(report.metrics).toMatchObject({
      publishedNevadaBills: 31,
      humanApprovedNevadaBills: 31,
      selectionLogRecords: 31,
      sourceDocuments: 125,
      recordedVotes: 63,
    });
    expect(report.checks).toMatchObject({
      targetRange: true,
      subjectBreadth: true,
      officialIndexReconciliation: true,
      requiredBillFields: true,
      sourceIntegrity: true,
      voteIntegrity: true,
      accountableEditorialApproval: true,
      publicSelectionLogCoverage: true,
      approvedLimitationsPreserved: true,
    });
    expect(report.status).toBe("ready");
    expect(
      report.findings.some((finding) => finding.id === "HCN-9.3-001"),
    ).toBe(false);
    expect(
      report.findings.some((finding) => finding.id === "HCN-9.3-003"),
    ).toBe(false);
    expect(report.findings).toEqual([]);
  });
});

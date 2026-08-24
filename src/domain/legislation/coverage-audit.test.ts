import { describe, expect, it } from "vitest";

import billIndexData from "@/data/generated/nevada-bill-index.json";
import baseLegislationData from "@/data/generated/pilot-legislation.json";
import promotedLegislationData from "@/data/generated/promoted-enhanced-legislation.json";
import { auditEnhancedPilotCoverage } from "@/domain/legislation/coverage-audit";
import type { EnhancedBillReviewCandidate } from "@/domain/legislation/enhanced-review-types";
import type { NevadaBillIndexRecord } from "@/domain/legislation/index-types";
import type { PilotBill } from "@/domain/legislation/types";
import { getEnhancedBillReviewQueue } from "@/server/legislation/enhanced-review-repository";

describe("Phase 9.3 enhanced coverage audit", () => {
  it("proves coverage breadth and integrity while isolating the legacy approval gap", () => {
    const report = auditEnhancedPilotCoverage({
      bills: [
        ...baseLegislationData.bills,
        ...promotedLegislationData.bills,
      ] as PilotBill[],
      indexRecords: billIndexData.records as NevadaBillIndexRecord[],
      reviewRecords:
        getEnhancedBillReviewQueue() as EnhancedBillReviewCandidate[],
    });

    expect(report.metrics).toMatchObject({
      publishedNevadaBills: 31,
      humanApprovedNevadaBills: 30,
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
      accountableEditorialApproval: false,
      publicSelectionLogCoverage: true,
      approvedLimitationsPreserved: true,
    });
    expect(report.status).toBe("action-required");
    expect(
      report.findings.find((finding) => finding.id === "HCN-9.3-001"),
    ).toMatchObject({
      state: "open",
      severity: "blocker",
      affectedRecords: ["AB83"],
    });
    expect(
      report.findings.find((finding) => finding.id === "HCN-9.3-004"),
    ).toMatchObject({
      state: "resolved",
      severity: "observation",
      affectedRecords: ["AB44"],
    });
  });
});

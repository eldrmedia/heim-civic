import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import billIndexData from "../src/data/generated/nevada-bill-index.json";
import enhancedReviewBatch2Data from "../src/data/generated/enhanced-bill-review-batch-2.json";
import enhancedReviewBatch3Data from "../src/data/generated/enhanced-bill-review-batch-3.json";
import enhancedReviewLegacyAb83Data from "../src/data/generated/enhanced-bill-review-legacy-ab83.json";
import enhancedReviewData from "../src/data/generated/enhanced-bill-review.json";
import baseLegislationData from "../src/data/generated/pilot-legislation.json";
import promotedLegislationData from "../src/data/generated/promoted-enhanced-legislation.json";
import { auditEnhancedPilotCoverage } from "../src/domain/legislation/coverage-audit";
import type { EnhancedBillReviewCandidate } from "../src/domain/legislation/enhanced-review-types";
import type { NevadaBillIndexRecord } from "../src/domain/legislation/index-types";
import type { PilotBill } from "../src/domain/legislation/types";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputPath = path.join(
  repositoryRoot,
  "data/review/phase-9-3-final-coverage-audit.json",
);

const report = auditEnhancedPilotCoverage({
  bills: [
    ...baseLegislationData.bills,
    ...promotedLegislationData.bills,
  ] as PilotBill[],
  indexRecords: billIndexData.records as NevadaBillIndexRecord[],
  reviewRecords: [
    ...enhancedReviewData.records,
    ...enhancedReviewBatch2Data.records,
    ...enhancedReviewBatch3Data.records,
    ...enhancedReviewLegacyAb83Data.records,
  ] as EnhancedBillReviewCandidate[],
});

const artifact = {
  schemaVersion: 1,
  auditVersion: "phase-9-3-coverage-audit-v1",
  auditedAt: new Date().toISOString(),
  evidenceSnapshots: {
    billIndex: billIndexData.snapshotId,
    legacyAb83Review: enhancedReviewLegacyAb83Data.snapshotId,
    baseLegislation: baseLegislationData.snapshotId,
    promotedLegislation: promotedLegislationData.snapshotId,
  },
  ...report,
};

await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(artifact, null, 2)}\n`);

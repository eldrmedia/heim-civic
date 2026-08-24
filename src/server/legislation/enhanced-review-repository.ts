import "server-only";

import enhancedReviewData from "@/data/generated/enhanced-bill-review.json";
import enhancedReviewBatch2Data from "@/data/generated/enhanced-bill-review-batch-2.json";
import type {
  EnhancedBillReviewBundle,
  EnhancedBillReviewCandidate,
} from "@/domain/legislation/enhanced-review-types";

const bundles = [
  enhancedReviewData as unknown as EnhancedBillReviewBundle,
  enhancedReviewBatch2Data as unknown as EnhancedBillReviewBundle,
];
const bundle: EnhancedBillReviewBundle = {
  schemaVersion: 1,
  snapshotId: bundles.map((item) => item.snapshotId).join("+"),
  generatedAt: bundles
    .map((item) => item.generatedAt)
    .sort()
    .at(-1)!,
  parserVersion: [...new Set(bundles.map((item) => item.parserVersion))].join(
    "+",
  ),
  coverageLabel: "Phase 9.3 first two enhanced-review batches",
  targetRange: bundles[0]!.targetRange,
  records: bundles.flatMap((item) => item.records),
  sources: [
    ...new Map(
      bundles
        .flatMap((item) => item.sources)
        .map((source) => [source.id, source]),
    ).values(),
  ],
};

export function getEnhancedBillReviewBundle(): EnhancedBillReviewBundle {
  return bundle;
}

export function getEnhancedBillReviewQueue(): EnhancedBillReviewCandidate[] {
  return bundle.records;
}

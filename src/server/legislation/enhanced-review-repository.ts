import "server-only";

import enhancedReviewData from "@/data/generated/enhanced-bill-review.json";
import type {
  EnhancedBillReviewBundle,
  EnhancedBillReviewCandidate,
} from "@/domain/legislation/enhanced-review-types";

const bundle = enhancedReviewData as unknown as EnhancedBillReviewBundle;

export function getEnhancedBillReviewBundle(): EnhancedBillReviewBundle {
  return bundle;
}

export function getEnhancedBillReviewQueue(): EnhancedBillReviewCandidate[] {
  return bundle.records;
}

import { z } from "zod";

export const automaticSelectionFactors = [
  "state-budget-or-major-appropriation",
  "constitutional-amendment-or-statewide-question",
  "governor-veto-or-override",
  "election-administration-or-government-structure-change",
  "major-statewide-program-change",
  "material-official-fiscal-effect",
] as const;

export const impactSelectionFactors = [
  "statewide-or-substantial-population",
  "material-rights-benefits-tax-or-regulatory-change",
  "material-official-fiscal-effect",
  "contested-recorded-floor-vote",
  "substantial-documented-public-testimony",
  "major-change-from-existing-law",
] as const;

export const pilotBillSelectionReviewSchema = z.object({
  billIdentifier: z.string().min(2),
  billKey: z.string().regex(/^\d+$/),
  automaticFactors: z.array(z.enum(automaticSelectionFactors)),
  impactFactors: z.array(z.enum(impactSelectionFactors)),
  evidenceUrls: z.array(z.url()).min(1),
  reviewState: z.enum(["candidate", "approved", "rejected"]),
  reviewedBy: z.string().min(1).nullable(),
  reviewedAt: z.iso.datetime().nullable(),
});

export type PilotBillSelectionReview = z.infer<
  typeof pilotBillSelectionReviewSchema
>;

export function qualifiesForPilotSet(
  review: PilotBillSelectionReview,
): boolean {
  return (
    review.reviewState === "approved" &&
    (review.automaticFactors.length > 0 || review.impactFactors.length >= 2)
  );
}

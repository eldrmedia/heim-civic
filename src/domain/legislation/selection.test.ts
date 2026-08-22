import { describe, expect, it } from "vitest";

import {
  pilotBillSelectionReviewSchema,
  qualifiesForPilotSet,
} from "@/domain/legislation/selection";

const baseReview = {
  billIdentifier: "AB44",
  billKey: "11833",
  evidenceUrls: [
    "https://www.leg.state.nv.us/App/NELIS/REL/83rd2025/Bill/11833/Overview",
  ],
  reviewState: "approved" as const,
  reviewedBy: "editor@example.org",
  reviewedAt: "2026-08-22T20:00:00.000Z",
};

describe("Pilot Bill Set selection policy", () => {
  it("accepts an approved automatic inclusion", () => {
    const review = pilotBillSelectionReviewSchema.parse({
      ...baseReview,
      automaticFactors: ["governor-veto-or-override"],
      impactFactors: [],
    });

    expect(qualifiesForPilotSet(review)).toBe(true);
  });

  it("requires two impact factors for a non-automatic inclusion", () => {
    const oneFactor = pilotBillSelectionReviewSchema.parse({
      ...baseReview,
      automaticFactors: [],
      impactFactors: ["contested-recorded-floor-vote"],
    });
    const twoFactors = pilotBillSelectionReviewSchema.parse({
      ...baseReview,
      automaticFactors: [],
      impactFactors: [
        "contested-recorded-floor-vote",
        "statewide-or-substantial-population",
      ],
    });

    expect(qualifiesForPilotSet(oneFactor)).toBe(false);
    expect(qualifiesForPilotSet(twoFactors)).toBe(true);
  });

  it("does not publish an unapproved candidate", () => {
    const review = pilotBillSelectionReviewSchema.parse({
      ...baseReview,
      automaticFactors: ["governor-veto-or-override"],
      impactFactors: [],
      reviewState: "candidate",
      reviewedBy: null,
      reviewedAt: null,
    });

    expect(qualifiesForPilotSet(review)).toBe(false);
  });
});

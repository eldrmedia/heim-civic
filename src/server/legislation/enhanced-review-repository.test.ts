import { describe, expect, it } from "vitest";

import { enhancedSubjectAreas } from "@/domain/legislation/enhanced-review-types";
import {
  getEnhancedBillReviewBundle,
  getEnhancedBillReviewQueue,
} from "@/server/legislation/enhanced-review-repository";

describe("enhanced bill review repository", () => {
  it("stages two source-verified batches without claiming automated approval", () => {
    const bundle = getEnhancedBillReviewBundle();
    const records = getEnhancedBillReviewQueue();

    expect(bundle.schemaVersion).toBe(1);
    expect(bundle.parserVersion).toBe("enhanced-bill-review-v1");
    expect(bundle.targetRange).toEqual({ minimum: 30, maximum: 50 });
    expect(records).toHaveLength(20);
    expect(new Set(records.map((record) => record.subjectArea))).toEqual(
      new Set(enhancedSubjectAreas),
    );
    expect(
      records.every(
        (record) =>
          record.reviewState === "awaiting-human-review" &&
          record.reviewedBy === null &&
          record.reviewedAt === null &&
          record.automaticFactors.includes("governor-veto-or-override"),
      ),
    ).toBe(true);
    expect(records.filter((record) => record.batch === 1)).toHaveLength(10);
    expect(records.filter((record) => record.batch === 2)).toHaveLength(10);
    expect(
      records
        .find((record) => record.billIdentifier === "AB79")
        ?.people.map(({ name, role, officialId }) => ({
          name,
          role,
          officialId,
        })),
    ).toContainEqual({
      name: "Assembly Committee on Legislative Operations and Elections",
      role: "sponsor",
      officialId: null,
    });
  });

  it("reconciles all staged roll calls and retains source provenance", () => {
    const bundle = getEnhancedBillReviewBundle();
    const records = getEnhancedBillReviewQueue();

    expect(bundle.sources).toHaveLength(81);
    expect(records.flatMap((record) => record.votes)).toHaveLength(41);
    expect(
      records.every(
        (record) =>
          record.officialDigest.length > 0 &&
          record.sources.every(
            (source) =>
              source.validationState === "source-verified" &&
              source.documentSha256.length === 64,
          ) &&
          record.votes.every(
            (vote) => vote.memberVotes.length === vote.totals.total,
          ),
      ),
    ).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { enhancedSubjectAreas } from "@/domain/legislation/enhanced-review-types";
import {
  getEnhancedBillReviewBundle,
  getEnhancedBillReviewQueue,
} from "@/server/legislation/enhanced-review-repository";

describe("enhanced bill review repository", () => {
  it("stages all source-verified review bundles without claiming automated approval", () => {
    const bundle = getEnhancedBillReviewBundle();
    const records = getEnhancedBillReviewQueue();

    expect(bundle.schemaVersion).toBe(1);
    expect(bundle.parserVersion).toBe("enhanced-bill-review-v1");
    expect(bundle.targetRange).toEqual({ minimum: 30, maximum: 50 });
    expect(records).toHaveLength(31);
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
    expect(records.filter((record) => record.batch === 3)).toHaveLength(10);
    expect(
      records.filter((record) => record.billIdentifier === "AB83"),
    ).toHaveLength(1);
    expect(
      records
        .filter((record) => record.batch === 3)
        .map((record) => record.billIdentifier),
    ).toEqual([
      "AB204",
      "AB205",
      "AB209",
      "AB213",
      "AB217",
      "AB237",
      "AB245",
      "AB259",
      "AB278",
      "AB280",
    ]);
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
    expect(
      records
        .find((record) => record.billIdentifier === "AB237")
        ?.people.map(({ name, role }) => ({ name, role })),
    ).toContainEqual({
      name: "Assembly Committee on Government Affairs",
      role: "sponsor",
    });
  });

  it("reconciles all staged roll calls and retains source provenance", () => {
    const bundle = getEnhancedBillReviewBundle();
    const records = getEnhancedBillReviewQueue();

    expect(bundle.sources).toHaveLength(125);
    expect(records.flatMap((record) => record.votes)).toHaveLength(63);
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

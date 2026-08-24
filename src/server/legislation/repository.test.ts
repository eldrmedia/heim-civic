import { describe, expect, it } from "vitest";

import {
  getAllPilotBills,
  getLegislationBundle,
  getLegislationForOfficial,
} from "@/server/legislation/repository";

describe("legislation repository", () => {
  it("publishes the approved Nevada batch and federal pilot with verified sources", () => {
    const bundle = getLegislationBundle();
    const bills = getAllPilotBills();

    expect(bundle.schemaVersion).toBe(1);
    expect(bills).toHaveLength(12);
    expect(bills.filter((bill) => bill.jurisdiction === "state")).toHaveLength(
      11,
    );
    expect(
      bills.filter((bill) => bill.jurisdiction === "federal"),
    ).toHaveLength(1);
    expect(
      bills.every((bill) =>
        bill.sources.every(
          (source) =>
            source.validationState === "source-verified" &&
            source.documentSha256.length === 64,
        ),
      ),
    ).toBe(true);
    expect(
      bills.filter((bill) => bill.editorialReview?.state === "human-approved"),
    ).toHaveLength(10);

    const ab44 = bills.find((bill) => bill.identifier === "AB44");
    expect(ab44?.votes.map((vote) => vote.question)).toEqual([
      "Passage",
      "Initial passage — later reconsidered",
      "Passage after reconsideration",
    ]);
    expect(
      bills
        .filter((bill) => bill.identifier !== "AB44")
        .every((bill) => bill.votes.length === 2),
    ).toBe(true);
  });

  it("connects Mark Amodei to sponsorship and both federal roll calls", () => {
    const activity = getLegislationForOfficial("us-congress:bioguide:A000369");

    expect(activity).toHaveLength(1);
    expect(activity[0]?.bill.identifier).toBe("H.R. 1366");
    expect(activity[0]?.sponsorshipRole).toBe("sponsor");
    expect(activity[0]?.votes).toHaveLength(2);
    expect(activity[0]?.votes.map((vote) => vote.normalizedValue)).toEqual([
      "no",
      "yes",
    ]);
  });

  it("retains historical Nevada votes without mislabeling former members as current", () => {
    const stateBill = getAllPilotBills().find(
      (bill) => bill.identifier === "AB83",
    );

    expect(stateBill?.votes[0]?.memberVotes).toHaveLength(42);
    expect(
      stateBill?.votes[0]?.memberVotes.find(
        (member) => member.name === "Anderson, Natha",
      )?.officialId,
    ).toBeNull();
  });
});

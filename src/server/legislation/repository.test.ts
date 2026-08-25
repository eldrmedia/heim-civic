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
    expect(bills).toHaveLength(32);
    expect(bills.filter((bill) => bill.jurisdiction === "state")).toHaveLength(
      31,
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
    ).toHaveLength(31);

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

    const ab82 = bills.find((bill) => bill.identifier === "AB82");
    const ab98 = bills.find((bill) => bill.identifier === "AB98");
    const sponsorRoleLimitation =
      "The NELIS overview labels the listed Senate participants as co-sponsors, while the enrolled bill heading calls them joint sponsors; this record follows the NELIS overview role label.";

    expect(ab82?.editorialReview?.uncertaintyNotes).toEqual([
      sponsorRoleLimitation,
    ]);
    expect(ab98?.editorialReview?.uncertaintyNotes).toEqual([
      sponsorRoleLimitation,
    ]);

    const ab83 = bills.find((bill) => bill.identifier === "AB83");
    expect(ab83?.policyArea).toBe("Civil rights and social services");
    expect(ab83?.votes.map((vote) => vote.question)).toEqual([
      "Passage",
      "Passage",
    ]);
    expect(ab83?.editorialReview).toMatchObject({
      state: "human-approved",
      reviewerName: "william elder",
      reviewerRole: "founder",
      candidateFingerprint:
        "431e8093eb517d92b189453fc0f6facbacba997541abc94a30b1f9ebc70ec3f8",
      uncertaintyNotes: [
        "The NELIS overview labels Senator Rochelle Nguyen as a co-sponsor, while the enrolled bill heading calls her joint sponsor; this record follows the NELIS overview role label.",
      ],
    });
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

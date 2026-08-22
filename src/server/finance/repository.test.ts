import { describe, expect, it } from "vitest";

import {
  getAllFinanceSummaries,
  getFinanceBundle,
  getFinanceForOfficial,
} from "@/server/finance/repository";

describe("finance repository", () => {
  it("publishes two verified federal summaries with explicit scope limits", () => {
    const bundle = getFinanceBundle();
    const records = getAllFinanceSummaries();

    expect(bundle.schemaVersion).toBe(1);
    expect(records).toHaveLength(2);
    expect(
      records.every(
        (record) =>
          record.jurisdiction === "federal" &&
          record.reportingPeriod.endsOn === "2026-06-30" &&
          record.outsideSpending.coverage === "not-included" &&
          record.sources.every(
            (source) =>
              source.validationState === "source-verified" &&
              source.documentSha256.length === 64,
          ),
      ),
    ).toBe(true);
  });

  it("reconciles official FEC individual contribution categories", () => {
    for (const record of getAllFinanceSummaries()) {
      expect(Math.round(record.receipts.individual * 100)).toBe(
        Math.round(
          (record.receipts.itemizedIndividual +
            record.receipts.unitemizedIndividual) *
            100,
        ),
      );
    }
  });

  it("reconciles the displayed receipt and spending categories to headline totals", () => {
    for (const record of getAllFinanceSummaries()) {
      const receiptParts =
        record.receipts.contributions +
        record.receipts.transfersFromAuthorizedCommittees +
        record.receipts.loans +
        record.receipts.offsetsToOperatingExpenditures +
        record.receipts.other;
      const spendingParts =
        record.spending.operating +
        record.spending.contributionRefunds +
        record.spending.transfersToAuthorizedCommittees +
        record.spending.loanRepayments +
        record.spending.other;

      expect(Math.round(record.receipts.total * 100)).toBe(
        Math.round(receiptParts * 100),
      );
      expect(Math.round(record.spending.total * 100)).toBe(
        Math.round(spendingParts * 100),
      );
    }
  });

  it("connects Mark Amodei to the correct FEC candidate and committee", () => {
    const summary = getFinanceForOfficial("us-congress:bioguide:A000369");

    expect(summary?.candidate.id).toBe("H2NV02395");
    expect(summary?.committee.id).toBe("C00496760");
    expect(summary?.committee.name).toBe("AMODEI FOR NEVADA");
  });

  it("does not imply uncovered profiles have no finance records", () => {
    expect(getFinanceForOfficial("us-congress:bioguide:T000468")).toBeNull();
  });
});

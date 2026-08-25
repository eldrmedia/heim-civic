import { describe, expect, it } from "vitest";

import fixtureData from "../../../data/fixtures/geography/golden-public-institutions.json";
import reportData from "../../../data/review/phase-9-4-geographic-validation.json";
import {
  auditGeographicValidation,
  type GeographicValidationCase,
} from "@/domain/geography/validation";

const cases = fixtureData.cases as GeographicValidationCase[];

describe("Phase 9.4 geographic validation", () => {
  it("reproduces the ready statewide agreement audit", () => {
    const report = auditGeographicValidation(cases, reportData.auditedAt, true);

    expect(report).toEqual(reportData);
    expect(report.metrics).toMatchObject({
      evaluatedCases: 200,
      districtComparisons: 462,
      districtAgreements: 462,
      agreementRate: 1,
      ncesReferenceComparisons: 600,
      ncesReferenceAgreements: 600,
      ncesReferenceAgreementRate: 1,
      countyCount: 17,
      boundaryProximityCases: 20,
      targetCommunityCount: 9,
      representedDistrictCounts: {
        congressional: "4",
        "state-senate": "21",
        "state-assembly": "42",
      },
    });
    expect(
      cases.every(
        (record) =>
          record.privacyClass === "public-institution" &&
          record.institution.type === "public-school" &&
          !/\bP\.?\s*O\.?\s+BOX\b/i.test(
            record.institution.publicAddress.street,
          ),
      ),
    ).toBe(true);
  });

  it("fails closed when authoritative comparisons fall below 99 percent", () => {
    const changed = structuredClone(cases);
    const matched = changed.filter(
      (record) => record.censusResult.state === "matched",
    );

    for (const record of matched.slice(0, 2)) {
      if (record.censusResult.state === "matched") {
        record.censusResult.localBoundaryDistricts = {
          congressional: "999",
          "state-senate": "999",
          "state-assembly": "999",
        };
      }
    }

    const report = auditGeographicValidation(
      changed,
      "2026-08-25T00:00:00.000Z",
      true,
    );

    expect(report.status).toBe("action-required");
    expect(report.checks.censusAgreement).toBe(false);
    expect(
      report.findings.find((finding) => finding.id === "HCN-9.4-002"),
    ).toMatchObject({ state: "open", severity: "blocker" });
  });

  it("fails closed when source provenance is incomplete", () => {
    const report = auditGeographicValidation(
      cases,
      "2026-08-25T00:00:00.000Z",
      false,
    );

    expect(report.status).toBe("action-required");
    expect(report.checks.provenanceComplete).toBe(false);
    expect(
      report.findings.find((finding) => finding.id === "HCN-9.4-004"),
    ).toMatchObject({ state: "open", severity: "blocker" });
  });
});

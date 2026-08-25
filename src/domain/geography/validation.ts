import { districtTypes, type DistrictType } from "@/domain/geography/types";

export const geographicValidationRequirements = ["FR-001", "FR-002"] as const;

export type ValidationDistricts = Record<DistrictType, string>;

export type GeographicValidationCase = {
  id: string;
  privacyClass: "public-institution";
  institution: {
    name: string;
    type: "public-school";
    publicAddress: {
      street: string;
      city: string;
      state: "NV";
      zip: string;
    };
  };
  coverage: {
    county: string;
    localeCode: string;
    boundaryProximity: boolean;
    targetCommunity: boolean;
  };
  ncesReference: {
    latitude: number;
    longitude: number;
    districts: ValidationDistricts;
    localBoundaryDistricts: ValidationDistricts | null;
  };
  censusResult:
    | {
        state: "matched";
        normalizedPublicAddress: string;
        latitude: number;
        longitude: number;
        districts: ValidationDistricts | null;
        localBoundaryDistricts: ValidationDistricts | null;
        sourceResponseSha256: string;
      }
    | {
        state: "unmatched" | "ambiguous" | "error";
        sourceResponseSha256: string | null;
      };
};

export type GeographicValidationFinding = {
  id: string;
  state: "open" | "resolved";
  severity: "blocker" | "observation";
  title: string;
  evidence: string;
  affectedRecords: string[];
  requiredAction: string;
};

export type GeographicValidationReport = {
  schemaVersion: 1;
  auditVersion: "phase-9-4-geographic-validation-v1";
  auditedAt: string;
  status: "ready" | "action-required";
  requirements: typeof geographicValidationRequirements;
  thresholds: {
    evaluatedCases: 200;
    minimumAgreementRate: 0.99;
    requiredCountyCount: 17;
    requiredDistrictCounts: ValidationDistricts;
  };
  metrics: {
    evaluatedCases: number;
    censusMatchedCases: number;
    censusUnmatchedCases: number;
    authoritativeCases: number;
    districtComparisons: number;
    districtAgreements: number;
    agreementRate: number | null;
    ncesReferenceComparisons: number;
    ncesReferenceAgreements: number;
    ncesReferenceAgreementRate: number | null;
    countyCount: number;
    localeCount: number;
    boundaryProximityCases: number;
    targetCommunityCount: number;
    representedDistrictCounts: ValidationDistricts;
  };
  checks: {
    evaluatedCaseTarget: boolean;
    privacySafeFixture: boolean;
    statewideCountyCoverage: boolean;
    districtCoverage: boolean;
    censusAgreement: boolean;
    ncesReferenceAgreement: boolean;
    provenanceComplete: boolean;
  };
  findings: GeographicValidationFinding[];
};

const thresholds = {
  evaluatedCases: 200,
  minimumAgreementRate: 0.99,
  requiredCountyCount: 17,
  requiredDistrictCounts: {
    congressional: "4",
    "state-senate": "21",
    "state-assembly": "42",
  },
} as const;

function completeDistricts(
  value: ValidationDistricts | null,
): value is ValidationDistricts {
  return (
    value !== null && districtTypes.every((type) => /^\d+$/.test(value[type]))
  );
}

function comparisonCount(
  left: ValidationDistricts,
  right: ValidationDistricts,
): number {
  return districtTypes.filter((type) => left[type] === right[type]).length;
}

export function auditGeographicValidation(
  cases: GeographicValidationCase[],
  auditedAt: string,
  provenanceComplete: boolean,
): GeographicValidationReport {
  const matchedCases = cases.filter(
    (record) => record.censusResult.state === "matched",
  );
  const authoritativeCases = matchedCases.filter(
    (record) =>
      record.censusResult.state === "matched" &&
      completeDistricts(record.censusResult.districts) &&
      completeDistricts(record.censusResult.localBoundaryDistricts),
  );
  const districtComparisons = authoritativeCases.length * districtTypes.length;
  const districtAgreements = authoritativeCases.reduce((total, record) => {
    if (
      record.censusResult.state !== "matched" ||
      !completeDistricts(record.censusResult.districts) ||
      !completeDistricts(record.censusResult.localBoundaryDistricts)
    ) {
      return total;
    }

    return (
      total +
      comparisonCount(
        record.censusResult.districts,
        record.censusResult.localBoundaryDistricts,
      )
    );
  }, 0);
  const ncesComparable = cases.filter((record) =>
    completeDistricts(record.ncesReference.localBoundaryDistricts),
  );
  const ncesReferenceComparisons = ncesComparable.length * districtTypes.length;
  const ncesReferenceAgreements = ncesComparable.reduce((total, record) => {
    if (!completeDistricts(record.ncesReference.localBoundaryDistricts)) {
      return total;
    }

    return (
      total +
      comparisonCount(
        record.ncesReference.districts,
        record.ncesReference.localBoundaryDistricts,
      )
    );
  }, 0);
  const representedDistrictCounts = Object.fromEntries(
    districtTypes.map((type) => [
      type,
      String(
        new Set(cases.map((record) => record.ncesReference.districts[type]))
          .size,
      ),
    ]),
  ) as ValidationDistricts;
  const agreementRate =
    districtComparisons === 0 ? null : districtAgreements / districtComparisons;
  const ncesReferenceAgreementRate =
    ncesReferenceComparisons === 0
      ? null
      : ncesReferenceAgreements / ncesReferenceComparisons;
  const checks = {
    evaluatedCaseTarget: cases.length >= thresholds.evaluatedCases,
    privacySafeFixture: cases.every(
      (record) =>
        record.privacyClass === "public-institution" &&
        record.institution.type === "public-school",
    ),
    statewideCountyCoverage:
      new Set(cases.map((record) => record.coverage.county)).size ===
      thresholds.requiredCountyCount,
    districtCoverage: districtTypes.every(
      (type) =>
        representedDistrictCounts[type] ===
        thresholds.requiredDistrictCounts[type],
    ),
    censusAgreement:
      agreementRate !== null &&
      agreementRate >= thresholds.minimumAgreementRate,
    ncesReferenceAgreement:
      ncesReferenceAgreementRate !== null &&
      ncesReferenceAgreementRate >= thresholds.minimumAgreementRate,
    provenanceComplete,
  };
  const findings: GeographicValidationFinding[] = [];

  if (!checks.evaluatedCaseTarget) {
    findings.push({
      id: "HCN-9.4-001",
      state: "open",
      severity: "blocker",
      title: "Golden geographic fixture is below the PRD target",
      evidence: `${cases.length} public-institution cases were evaluated; ${thresholds.evaluatedCases} are required.`,
      affectedRecords: [],
      requiredAction:
        "Add reviewed public-institution cases and rerun the audit.",
    });
  }

  if (!checks.censusAgreement || !checks.ncesReferenceAgreement) {
    const disagreements = cases
      .filter((record) => {
        const ncesDisagrees =
          completeDistricts(record.ncesReference.localBoundaryDistricts) &&
          comparisonCount(
            record.ncesReference.districts,
            record.ncesReference.localBoundaryDistricts,
          ) < districtTypes.length;
        const censusDisagrees =
          record.censusResult.state === "matched" &&
          completeDistricts(record.censusResult.districts) &&
          completeDistricts(record.censusResult.localBoundaryDistricts) &&
          comparisonCount(
            record.censusResult.districts,
            record.censusResult.localBoundaryDistricts,
          ) < districtTypes.length;

        return ncesDisagrees || censusDisagrees;
      })
      .map((record) => record.id);

    findings.push({
      id: "HCN-9.4-002",
      state: "open",
      severity: "blocker",
      title: "Authoritative district agreement is below 99 percent",
      evidence: `${districtAgreements} of ${districtComparisons} Census comparisons and ${ncesReferenceAgreements} of ${ncesReferenceComparisons} NCES comparisons agree with the Nevada LCB polygons.`,
      affectedRecords: disagreements,
      requiredAction:
        "Review every disagreement against Census, NCES, and Nevada LCB evidence; do not publish a conflicted lookup.",
    });
  }

  const incompleteCoverage =
    !checks.statewideCountyCoverage || !checks.districtCoverage;
  if (incompleteCoverage) {
    findings.push({
      id: "HCN-9.4-003",
      state: "open",
      severity: "blocker",
      title: "The fixture does not cover the required statewide distribution",
      evidence: `${new Set(cases.map((record) => record.coverage.county)).size} counties and ${districtTypes.map((type) => `${representedDistrictCounts[type]} ${type}`).join(", ")} districts are represented.`,
      affectedRecords: [],
      requiredAction:
        "Expand the deterministic public-institution selection before treating the audit as statewide evidence.",
    });
  }

  if (!checks.privacySafeFixture || !checks.provenanceComplete) {
    findings.push({
      id: "HCN-9.4-004",
      state: "open",
      severity: "blocker",
      title: "Fixture privacy or provenance requirements are incomplete",
      evidence:
        "Every case must be a public institution and every source snapshot must retain identifiers, URLs, retrieval time, hashes, and parser versions.",
      affectedRecords: [],
      requiredAction:
        "Remove non-institutional inputs or complete the missing source metadata before rerunning the audit.",
    });
  }

  const unmatched = cases.filter(
    (record) => record.censusResult.state !== "matched",
  );
  if (unmatched.length > 0) {
    findings.push({
      id: "HCN-9.4-005",
      state: "resolved",
      severity: "observation",
      title: "Some public-institution inputs were not uniquely matched",
      evidence: `${unmatched.length} of ${cases.length} evaluated inputs were unmatched, ambiguous, or unavailable; agreement is measured only for matchable results as required by the PRD.`,
      affectedRecords: unmatched.map((record) => record.id),
      requiredAction:
        "Retain the actionable unmatched or ambiguity response and recheck these public records during the next refresh.",
    });
  }

  return {
    schemaVersion: 1,
    auditVersion: "phase-9-4-geographic-validation-v1",
    auditedAt,
    status: Object.values(checks).every(Boolean) ? "ready" : "action-required",
    requirements: geographicValidationRequirements,
    thresholds,
    metrics: {
      evaluatedCases: cases.length,
      censusMatchedCases: matchedCases.length,
      censusUnmatchedCases: cases.length - matchedCases.length,
      authoritativeCases: authoritativeCases.length,
      districtComparisons,
      districtAgreements,
      agreementRate,
      ncesReferenceComparisons,
      ncesReferenceAgreements,
      ncesReferenceAgreementRate,
      countyCount: new Set(cases.map((record) => record.coverage.county)).size,
      localeCount: new Set(cases.map((record) => record.coverage.localeCode))
        .size,
      boundaryProximityCases: cases.filter(
        (record) => record.coverage.boundaryProximity,
      ).length,
      targetCommunityCount: new Set(
        cases
          .filter((record) => record.coverage.targetCommunity)
          .map((record) => record.institution.publicAddress.city.toLowerCase()),
      ).size,
      representedDistrictCounts,
    },
    checks,
    findings,
  };
}

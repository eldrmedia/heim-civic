export type FinanceSource = {
  id: string;
  organization: "Federal Election Commission";
  url: string;
  publicRecordUrl: string;
  retrievedAt: string;
  documentSha256: string;
  coverageLabel: string;
  parserVersion: string;
  validationState: "source-verified";
};

export type CampaignFinanceSummary = {
  id: string;
  slug: string;
  officialId: string;
  jurisdiction: "federal";
  candidate: {
    id: string;
    name: string;
    electionYear: number;
    officeLabel: string;
  };
  committee: {
    id: string;
    name: string;
    designation: "Principal campaign committee";
  };
  reportingPeriod: {
    startsOn: string;
    endsOn: string;
    lastReportType: string;
    lastReportYear: number;
  };
  receipts: {
    total: number;
    contributions: number;
    individual: number;
    itemizedIndividual: number;
    unitemizedIndividual: number;
    partyCommittees: number;
    otherPoliticalCommittees: number;
    candidateSelfFunding: number;
    transfersFromAuthorizedCommittees: number;
    loans: number;
    offsetsToOperatingExpenditures: number;
    other: number;
  };
  spending: {
    total: number;
    operating: number;
    contributionRefunds: number;
    transfersToAuthorizedCommittees: number;
    loanRepayments: number;
    other: number;
  };
  cash: {
    onHand: number;
    debtsOwedByCommittee: number;
    debtsOwedToCommittee: number;
  };
  outsideSpending: {
    coverage: "not-included";
    explanation: string;
  };
  scopeNote: string;
  sources: FinanceSource[];
};

export type FinanceBundle = {
  schemaVersion: 1;
  snapshotId: string;
  generatedAt: string;
  parserVersion: string;
  coverageLabel: string;
  records: CampaignFinanceSummary[];
  sources: FinanceSource[];
};

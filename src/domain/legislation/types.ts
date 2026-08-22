export type NormalizedVoteValue =
  "yes" | "no" | "present" | "not-voting" | "excused" | "absent" | "unknown";

export type LegislationSource = {
  id: string;
  organization: string;
  url: string;
  retrievedAt: string;
  documentSha256: string;
  coverageLabel: string;
  parserVersion: string;
  validationState: "source-verified";
};

export type BillPerson = {
  officialId: string | null;
  externalId: string;
  name: string;
  role: "sponsor" | "cosponsor";
};

export type MemberVote = {
  officialId: string | null;
  externalId: string;
  name: string;
  originalValue: string;
  normalizedValue: NormalizedVoteValue;
};

export type RecordedVote = {
  id: string;
  chamber: string;
  question: string;
  result: string;
  occurredOn: string;
  sourceUrl: string;
  memberCoverage: "all-nevada-legislators" | "nevada-delegation-only";
  totals: {
    yes: number;
    no: number;
    present: number;
    notVoting: number;
    excused: number;
    absent: number;
    total: number;
  };
  memberVotes: MemberVote[];
};

export type BillAction = {
  occurredOn: string;
  text: string;
};

export type PilotBill = {
  id: string;
  slug: string;
  jurisdiction: "federal" | "state";
  identifier: string;
  session: string;
  title: string;
  officialTitle: string;
  policyArea: string;
  status: { label: string; asOf: string; latestAction: string };
  officialSummary: {
    text: string;
    attribution: string;
    sourceUrl: string;
    reviewState: "official-source";
  };
  committees: string[];
  people: BillPerson[];
  actions: BillAction[];
  votes: RecordedVote[];
  officialPageUrl: string;
  officialTextUrl: string;
  selectionReason: string;
  sources: LegislationSource[];
};

export type LegislationBundle = {
  schemaVersion: 1;
  snapshotId: string;
  generatedAt: string;
  parserVersion: string;
  coverageLabel: string;
  bills: PilotBill[];
  sources: LegislationSource[];
};

export type OfficialLegislationActivity = {
  bill: Pick<
    PilotBill,
    "id" | "slug" | "identifier" | "title" | "jurisdiction" | "status"
  >;
  sponsorshipRole: BillPerson["role"] | null;
  votes: Array<
    Pick<RecordedVote, "id" | "chamber" | "occurredOn" | "question"> &
      MemberVote
  >;
};

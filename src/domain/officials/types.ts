import type { DistrictType } from "@/domain/geography/types";

export const partyCodes = ["D", "R", "I", "NP", "O", "U"] as const;
export type PartyCode = (typeof partyCodes)[number];

export type CommitteeMembership = {
  name: string;
  role: string | null;
  sourceUrl: string;
};

export type OfficialSource = {
  organization: string;
  sourceUrl: string;
  externalId: string;
  retrievedAt: string;
  coverageLabel: string;
  documentSha256: string;
  parserVersion: string;
  validationState: "source-verified";
};

export type CurrentOfficial = {
  id: string;
  slug: string;
  name: string;
  sortName: string;
  imageUrl: string | null;
  party: { code: PartyCode; label: string };
  office: {
    jurisdiction: "federal" | "state";
    chamber: "us-house" | "us-senate" | "state-senate" | "state-assembly";
    title: string;
    districtNumber: string | null;
    districtLabel: string;
    leadershipTitle: string | null;
  };
  term: {
    label: string;
    startsOn: string | null;
    endsOn: string | null;
  };
  contact: {
    officialWebsite: string;
    contactUrl: string | null;
    email: string | null;
    phone: string | null;
    officeAddress: string | null;
  };
  committees: CommitteeMembership[];
  sources: OfficialSource[];
};

export type OfficePosition = {
  id: string;
  jurisdiction: "federal" | "state";
  chamber: CurrentOfficial["office"]["chamber"];
  districtType: DistrictType | null;
  districtNumber: string | null;
  seatClass: string | null;
  status: "occupied" | "vacant" | "transition";
  currentOfficialId: string | null;
  statusNote: string | null;
  sourceUrl: string;
  lastVerifiedAt: string;
};

export type OfficialsBundle = {
  schemaVersion: 1;
  snapshotId: string;
  generatedAt: string;
  parserVersion: string;
  jurisdiction: "Nevada";
  sources: Array<{
    id: string;
    organization: string;
    url: string;
    documentSha256: string;
    retrievedAt: string;
  }>;
  officials: CurrentOfficial[];
  positions: OfficePosition[];
};

export type RepresentativeSummary = Pick<
  CurrentOfficial,
  "id" | "slug" | "name" | "imageUrl" | "party" | "office" | "term" | "sources"
>;

export type RepresentationSummary = {
  position: Pick<
    OfficePosition,
    | "id"
    | "chamber"
    | "districtType"
    | "districtNumber"
    | "seatClass"
    | "status"
    | "statusNote"
    | "sourceUrl"
    | "lastVerifiedAt"
  >;
  official: RepresentativeSummary | null;
};

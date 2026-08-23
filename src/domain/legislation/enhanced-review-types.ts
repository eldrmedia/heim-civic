import type {
  BillAction,
  BillPerson,
  LegislationSource,
  RecordedVote,
} from "@/domain/legislation/types";
import type {
  automaticSelectionFactors,
  impactSelectionFactors,
} from "@/domain/legislation/selection";

export const enhancedSubjectAreas = [
  "Budget and tax",
  "Education",
  "Health",
  "Housing",
  "Elections and government",
  "Labor and business",
  "Criminal justice and public safety",
  "Environment, water, and energy",
  "Transportation",
  "Civil rights and social services",
] as const;

export type EnhancedSubjectArea = (typeof enhancedSubjectAreas)[number];
export type AutomaticSelectionFactor =
  (typeof automaticSelectionFactors)[number];
export type ImpactSelectionFactor = (typeof impactSelectionFactors)[number];

export type EnhancedBillReviewCandidate = {
  id: string;
  billIdentifier: string;
  billKey: string;
  batch: number;
  subjectArea: EnhancedSubjectArea;
  officialSynopsis: string;
  officialTitle: string;
  officialDigest: string;
  officialPageUrl: string;
  officialTextUrl: string;
  status: { label: "Vetoed"; asOf: string; latestAction: string };
  committees: string[];
  people: BillPerson[];
  actions: BillAction[];
  votes: RecordedVote[];
  automaticFactors: AutomaticSelectionFactor[];
  impactFactors: ImpactSelectionFactor[];
  queueReason: string;
  reviewState: "awaiting-human-review";
  reviewedBy: null;
  reviewedAt: null;
  evidenceUrls: string[];
  sources: LegislationSource[];
};

export type EnhancedBillReviewBundle = {
  schemaVersion: 1;
  snapshotId: string;
  generatedAt: string;
  parserVersion: string;
  coverageLabel: string;
  targetRange: { minimum: number; maximum: number };
  records: EnhancedBillReviewCandidate[];
  sources: LegislationSource[];
};

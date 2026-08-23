export const nevadaBillTypes = ["AB", "SB"] as const;
export type NevadaBillType = (typeof nevadaBillTypes)[number];

export type BillIndexSource = {
  id: string;
  organization: "Nevada Legislature (NELIS)";
  url: string;
  billType: NevadaBillType;
  retrievedAt: string;
  documentSha256: string;
  parserVersion: string;
  validationState: "source-verified";
};

export type NevadaBillIndexRecord = {
  id: string;
  billKey: string;
  identifier: string;
  canonicalIdentifier: string;
  sourceMarker: "asterisk" | null;
  measureType: "assembly-bill" | "senate-bill";
  session: "83rd (2025) Nevada Legislature";
  synopsis: string;
  officialTitle: string;
  officialPageUrl: string;
  coverageLevel: "official-index";
  automaticQualifier: "governor-veto-or-override" | null;
  sourceId: string;
};

export type BillIndexDisplayRecord = NevadaBillIndexRecord & {
  enhancedSlug: string | null;
};

export type NevadaBillIndexBundle = {
  schemaVersion: 1;
  snapshotId: string;
  generatedAt: string;
  parserVersion: string;
  coverageLabel: string;
  session: "83rd (2025) Nevada Legislature";
  records: NevadaBillIndexRecord[];
  sources: BillIndexSource[];
};

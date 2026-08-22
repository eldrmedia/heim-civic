export const searchResultKinds = [
  "official",
  "district",
  "bill",
  "subject",
] as const;

export type SearchResultKind = (typeof searchResultKinds)[number];

export type SearchRecord = {
  id: string;
  kind: SearchResultKind;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  keywords: string[];
  sourceLabel: string;
  verifiedAt: string;
};

export type SearchResult = Omit<SearchRecord, "keywords"> & {
  matchedOn: string[];
};

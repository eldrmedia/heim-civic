import type { Metadata } from "next";

import { SearchExperience } from "@/components/organisms/search-experience";
import { ContentPageTemplate } from "@/components/templates/content-page-template";
import { searchCivicRecords } from "@/server/search/index";

export const metadata: Metadata = {
  title: "Search Nevada civic records",
  description:
    "Search reviewed Nevada officials, districts, pilot bills, and civic subjects.",
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 120) : "";
  const results = searchCivicRecords(query);

  return (
    <ContentPageTemplate
      eyebrow="Phase 6 · Civic discovery"
      title="Find a Nevada public record."
      introduction="Search current officials, electoral districts, and the bills and subjects included in this source-reviewed pilot."
    >
      <SearchExperience query={query} results={results} />
    </ContentPageTemplate>
  );
}

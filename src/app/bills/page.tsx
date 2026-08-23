import type { Metadata } from "next";
import Link from "next/link";

import { BillDirectory } from "@/components/organisms/bill-directory";
import { ContentPageTemplate } from "@/components/templates/content-page-template";
import {
  getNevadaBillDirectoryPage,
  getNevadaBillIndexBundle,
} from "@/server/legislation/bill-index-repository";

export const metadata: Metadata = {
  title: "2025 Nevada bills",
  description:
    "Search the complete official NELIS Assembly and Senate bill index and distinguish index-only records from enhanced reviewed coverage.",
};

type BillsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    chamber?: string | string[];
    coverage?: string | string[];
    page?: string | string[];
  }>;
};

export default async function BillsPage({ searchParams }: BillsPageProps) {
  const params = await searchParams;
  const query = value(params.q).slice(0, 120);
  const chamber = parseChamber(value(params.chamber));
  const coverage = parseCoverage(value(params.coverage));
  const requestedPage = Number.parseInt(value(params.page), 10);
  const result = getNevadaBillDirectoryPage({
    query,
    chamber,
    coverage,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
  });
  const bundle = getNevadaBillIndexBundle();
  const sourceMarkedCount = bundle.records.filter(
    (record) => record.sourceMarker,
  ).length;

  return (
    <ContentPageTemplate
      eyebrow="Phase 9.1 · Complete Bill Index"
      title="Every source-listed 2025 Nevada bill, in one place."
      introduction={`${bundle.records.length.toLocaleString("en-US")} Assembly and Senate bill records are indexed from official NELIS listings. Enhanced records are reviewed more deeply; all other records link directly to the authoritative source.`}
      width="wide"
    >
      <section aria-labelledby="coverage-levels-title">
        <h2 id="coverage-levels-title">Two honest coverage levels</h2>
        <div className="bill-coverage-levels">
          <article>
            <p>Complete Bill Index</p>
            <strong>{bundle.records.length.toLocaleString("en-US")}</strong>
            <span>
              Official identifiers, synopses, long titles, and NELIS links.
            </span>
          </article>
          <article>
            <p>Enhanced Pilot Coverage</p>
            <strong>Human reviewed</strong>
            <span>
              Additional status, sponsors, actions, committees, summaries, and
              recorded votes only after validation.
            </span>
          </article>
        </div>
        <p className="bill-directory__source-note">
          NELIS currently displays {sourceMarkedCount} records with an asterisk.
          The index preserves that source marker without assigning it a meaning.
          Resolutions and initiative petitions are outside this bill-only index.
        </p>
        <Link
          className="bill-directory__selection-link"
          href="/bills/selection"
        >
          View the enhanced bill selection log →
        </Link>
      </section>
      <BillDirectory
        filters={{ query, chamber, coverage }}
        page={result.page}
        pageCount={result.pageCount}
        records={result.records}
        totalCount={result.totalCount}
      />
    </ContentPageTemplate>
  );
}

function value(input: string | string[] | undefined) {
  return typeof input === "string" ? input.trim() : "";
}

function parseChamber(value: string): "all" | "assembly" | "senate" {
  return value === "assembly" || value === "senate" ? value : "all";
}

function parseCoverage(
  value: string,
): "all" | "enhanced" | "automatic-qualifier" {
  return value === "enhanced" || value === "automatic-qualifier"
    ? value
    : "all";
}

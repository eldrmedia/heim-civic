import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/atoms/json-ld";
import { BillIndexPageTemplate } from "@/components/templates/bill-index-page-template";
import { BillPageTemplate } from "@/components/templates/bill-page-template";
import type { BillIndexDisplayRecord } from "@/domain/legislation/index-types";
import type { PilotBill } from "@/domain/legislation/types";
import { toSiteUrl } from "@/lib/site-url";
import { createPageMetadata } from "@/lib/seo";
import {
  getAllNevadaBillIndexRecords,
  getBillIndexSource,
  getNevadaBillIndexRecordBySlug,
  getNevadaBillIndexSlug,
} from "@/server/legislation/bill-index-repository";
import {
  getAllPilotBills,
  getPilotBillBySlug,
} from "@/server/legislation/repository";
import { getAllCurrentOfficials } from "@/server/officials/repository";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...getAllNevadaBillIndexRecords().map((record) => ({
      slug: getNevadaBillIndexSlug(record),
    })),
    ...getAllPilotBills()
      .filter((bill) => bill.jurisdiction === "federal")
      .map((bill) => ({ slug: bill.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const bill = getPilotBillBySlug(slug);
  const indexRecord = getNevadaBillIndexRecordBySlug(slug);
  if (bill) return enhancedBillMetadata(bill);
  if (indexRecord) return indexBillMetadata(indexRecord, slug);
  return createPageMetadata({
    title: "Bill not found",
    description: "The requested Nevada bill record is not available.",
    pathname: `/bills/${slug}`,
    index: false,
  });
}

export default async function BillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bill = getPilotBillBySlug(slug);
  if (bill) {
    return (
      <>
        <JsonLd data={legislationJsonLd(bill)} />
        <BillPageTemplate
          bill={bill}
          currentOfficials={getAllCurrentOfficials()}
        />
      </>
    );
  }

  const indexRecord = getNevadaBillIndexRecordBySlug(slug);
  if (!indexRecord) notFound();
  return (
    <>
      <JsonLd data={indexLegislationJsonLd(indexRecord, slug)} />
      <BillIndexPageTemplate
        record={indexRecord}
        source={getBillIndexSource(indexRecord)}
      />
    </>
  );
}

function enhancedBillMetadata(bill: PilotBill): Metadata {
  return createPageMetadata({
    title: `${bill.identifier}: ${truncate(bill.title, 62)}`,
    description: `${bill.identifier} in the ${bill.session}: verified status, sponsors, official sources, and available recorded votes.`,
    pathname: `/bills/${bill.slug}`,
    type: "article",
  });
}

function indexBillMetadata(record: BillIndexDisplayRecord, slug: string) {
  return createPageMetadata({
    title: `${record.identifier}: ${truncate(record.synopsis, 62)}`,
    description: `${record.identifier} in the 2025 Nevada Legislature: official synopsis, long title, coverage limits, and authoritative NELIS source.`,
    pathname: `/bills/${slug}`,
    type: "article",
  });
}

function legislationJsonLd(bill: PilotBill) {
  return {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: `${bill.identifier}: ${bill.title}`,
    legislationIdentifier: bill.identifier,
    legislationJurisdiction:
      bill.jurisdiction === "state" ? "Nevada" : "United States",
    description: bill.officialSummary.text,
    url: toSiteUrl(`/bills/${bill.slug}`),
    sameAs: bill.officialPageUrl,
    dateModified: latestRetrieval(bill),
  };
}

function indexLegislationJsonLd(record: BillIndexDisplayRecord, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: `${record.identifier}: ${record.synopsis}`,
    legislationIdentifier: record.identifier,
    legislationJurisdiction: "Nevada",
    description: record.synopsis,
    url: toSiteUrl(`/bills/${slug}`),
    sameAs: record.officialPageUrl,
  };
}

function latestRetrieval(bill: PilotBill) {
  return bill.sources
    .map((source) => source.retrievedAt)
    .sort()
    .at(-1);
}

function truncate(value: string, maximum: number) {
  if (value.length <= maximum) return value;
  return `${value.slice(0, maximum - 1).trimEnd()}…`;
}

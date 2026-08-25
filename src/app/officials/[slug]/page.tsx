import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/atoms/json-ld";
import { OfficialProfileTemplate } from "@/components/templates/official-profile-template";
import type { CurrentOfficial } from "@/domain/officials/types";
import { toSiteUrl } from "@/lib/site-url";
import { createPageMetadata } from "@/lib/seo";
import { getFinanceForOfficial } from "@/server/finance/repository";
import {
  getAllCurrentOfficials,
  getOfficialBySlug,
} from "@/server/officials/repository";
import { getLegislationForOfficial } from "@/server/legislation/repository";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCurrentOfficials().map((official) => ({ slug: official.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const official = getOfficialBySlug(slug);
  if (!official) {
    return createPageMetadata({
      title: "Official not found",
      description: "The requested Nevada official profile is not available.",
      pathname: `/officials/${slug}`,
      index: false,
    });
  }

  return createPageMetadata({
    title: `${official.name} — ${official.office.districtLabel}`,
    description: `Current office, district, party, committees, contact information, public records, and official sources for ${official.name}.`,
    pathname: `/officials/${official.slug}`,
    type: "profile",
  });
}

export default async function OfficialProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const official = getOfficialBySlug(slug);

  if (!official) notFound();

  return (
    <>
      <JsonLd data={officialJsonLd(official)} />
      <OfficialProfileTemplate
        official={official}
        legislation={getLegislationForOfficial(official.id)}
        finance={getFinanceForOfficial(official.id)}
      />
    </>
  );
}

function officialJsonLd(official: CurrentOfficial) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: toSiteUrl(`/officials/${official.slug}`),
    dateModified: latestVerification(official),
    mainEntity: {
      "@type": "Person",
      name: official.name,
      jobTitle: official.office.title,
      image: official.imageUrl ?? undefined,
      affiliation: {
        "@type": "Organization",
        name: official.party.label,
      },
      sameAs: official.contact.officialWebsite,
    },
  };
}

function latestVerification(official: CurrentOfficial) {
  return official.sources
    .map((source) => source.retrievedAt)
    .sort()
    .at(-1);
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DistrictPageTemplate } from "@/components/templates/district-page-template";
import { createPageMetadata } from "@/lib/seo";
import {
  getAllPublishedDistricts,
  getBoundaryBundle,
  getPublishedDistrictBySlug,
} from "@/server/geography/boundaries";
import { getCurrentDistrictRepresentation } from "@/server/officials/repository";

type DistrictPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPublishedDistricts().map((district) => ({
    slug: district.slug,
  }));
}

export async function generateMetadata({
  params,
}: DistrictPageProps): Promise<Metadata> {
  const { slug } = await params;
  const district = getPublishedDistrictBySlug(slug);

  return district
    ? createPageMetadata({
        title: district.displayName,
        description: `Official boundary, statewide Nevada context, current representative, effective date, and authoritative source for ${district.displayName}.`,
        pathname: `/districts/${district.slug}`,
      })
    : createPageMetadata({
        title: "District not found",
        description:
          "The requested Nevada electoral district is not available.",
        pathname: `/districts/${slug}`,
        index: false,
      });
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const { slug } = await params;
  const district = getPublishedDistrictBySlug(slug);
  if (!district) notFound();

  return (
    <DistrictPageTemplate
      district={district}
      representation={getCurrentDistrictRepresentation(district)}
      stateOutline={getBoundaryBundle().stateOutline}
    />
  );
}

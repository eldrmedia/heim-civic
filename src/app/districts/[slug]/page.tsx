import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DistrictPageTemplate } from "@/components/templates/district-page-template";
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
    ? {
        title: district.displayName,
        description: `Official boundary, statewide context, and current representative for ${district.displayName}.`,
      }
    : { title: "District not found" };
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

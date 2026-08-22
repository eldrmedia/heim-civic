import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OfficialProfileTemplate } from "@/components/templates/official-profile-template";
import { getFinanceForOfficial } from "@/server/finance/repository";
import {
  getAllCurrentOfficials,
  getOfficialBySlug,
} from "@/server/officials/repository";
import { getLegislationForOfficial } from "@/server/legislation/repository";

export const metadata: Metadata = {
  title: "Current official profile",
  description:
    "A source-linked profile for a current Nevada federal or state legislator.",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCurrentOfficials().map((official) => ({ slug: official.slug }));
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
    <OfficialProfileTemplate
      official={official}
      legislation={getLegislationForOfficial(official.id)}
      finance={getFinanceForOfficial(official.id)}
    />
  );
}

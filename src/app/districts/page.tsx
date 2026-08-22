import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ContentPageTemplate } from "@/components/templates/content-page-template";
import type { DistrictType } from "@/domain/geography/types";
import { getAllPublishedDistricts } from "@/server/geography/boundaries";

export const metadata: Metadata = {
  title: "Nevada legislative districts",
  description:
    "Browse Nevada congressional, State Senate, and Assembly districts using official boundaries.",
};

const groups: Array<{ type: DistrictType; title: string }> = [
  { type: "congressional", title: "U.S. Congressional districts" },
  { type: "state-senate", title: "Nevada Senate districts" },
  { type: "state-assembly", title: "Nevada Assembly districts" },
];

export default function DistrictsPage() {
  const districts = getAllPublishedDistricts();

  return (
    <ContentPageTemplate
      eyebrow="Phase 7 · District directory"
      title="Nevada’s electoral districts."
      introduction="Browse all 67 congressional and state legislative districts using the official Nevada boundary plan. Each page places the selected district within the full state outline."
    >
      {groups.map((group) => (
        <section key={group.type} aria-labelledby={`${group.type}-title`}>
          <h2 id={`${group.type}-title`}>{group.title}</h2>
          <div className="district-index">
            {districts
              .filter((district) => district.type === group.type)
              .map((district) => (
                <Link
                  className="district-index__link"
                  href={`/districts/${district.slug}`}
                  key={district.slug}
                >
                  <span>{district.displayName}</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              ))}
          </div>
        </section>
      ))}
    </ContentPageTemplate>
  );
}

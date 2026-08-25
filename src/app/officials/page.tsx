import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ContentPageTemplate } from "@/components/templates/content-page-template";
import type { CurrentOfficial } from "@/domain/officials/types";
import { createPageMetadata } from "@/lib/seo";
import { getAllCurrentOfficials } from "@/server/officials/repository";

export const metadata: Metadata = createPageMetadata({
  title: "Current Nevada elected officials",
  description:
    "Browse current Nevada state legislators and Nevada's U.S. House and Senate delegation with source-linked profiles.",
  pathname: "/officials",
});

const groups: Array<{
  chamber: CurrentOfficial["office"]["chamber"];
  title: string;
}> = [
  { chamber: "us-senate", title: "Nevada’s U.S. senators" },
  { chamber: "us-house", title: "Nevada’s U.S. representatives" },
  { chamber: "state-senate", title: "Nevada state senators" },
  { chamber: "state-assembly", title: "Nevada Assembly members" },
];

export default function OfficialsPage() {
  const officials = getAllCurrentOfficials();

  return (
    <ContentPageTemplate
      eyebrow="Current officeholders"
      title="Who represents Nevada."
      introduction="Browse source-verified profiles for Nevada’s current federal delegation and state legislators. Party is presented as a sourced fact and does not affect order or prominence."
      width="wide"
    >
      {groups.map((group) => (
        <section key={group.chamber} aria-labelledby={`${group.chamber}-title`}>
          <h2 id={`${group.chamber}-title`}>{group.title}</h2>
          <div className="officials-index">
            {officials
              .filter((official) => official.office.chamber === group.chamber)
              .sort((left, right) =>
                left.sortName.localeCompare(right.sortName),
              )
              .map((official) => (
                <Link
                  className="officials-index__link"
                  href={`/officials/${official.slug}`}
                  key={official.id}
                >
                  <span>
                    <strong>{official.name}</strong>
                    <small>{official.office.districtLabel}</small>
                  </span>
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
              ))}
          </div>
        </section>
      ))}
    </ContentPageTemplate>
  );
}

import { ArrowRight, Vote } from "lucide-react";
import Link from "next/link";

import type { OfficialLegislationActivity } from "@/domain/legislation/types";

export function BillCard({
  activity,
}: {
  activity: OfficialLegislationActivity;
}) {
  return (
    <article className="bill-card">
      <p className="bill-card__meta">
        {activity.bill.identifier} ·{" "}
        {activity.bill.jurisdiction === "state" ? "Nevada" : "Federal"}
      </p>
      <h3>{activity.bill.title}</h3>
      <p className="bill-card__status">{activity.bill.status.label}</p>
      {activity.sponsorshipRole ? (
        <p className="bill-card__relationship">
          {activity.sponsorshipRole === "sponsor"
            ? "Primary sponsor"
            : "Cosponsor"}
        </p>
      ) : null}
      {activity.votes.map((vote) => (
        <p className="bill-card__vote" key={vote.id}>
          <Vote aria-hidden="true" size={16} /> Voted{" "}
          {displayVote(vote.originalValue)} on {formatDate(vote.occurredOn)}
        </p>
      ))}
      <Link href={`/bills/${activity.bill.slug}`}>
        View sourced bill record <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </article>
  );
}

function displayVote(value: string) {
  return value.toLowerCase() === "yea" ? "yes" : value.toLowerCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

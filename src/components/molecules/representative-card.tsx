import { ArrowRight, CircleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PartyLabel } from "@/components/atoms/party-label";
import type { RepresentationSummary } from "@/domain/officials/types";

export function RepresentativeCard({
  representation,
}: {
  representation: RepresentationSummary;
}) {
  const { official, position } = representation;

  if (!official) {
    return (
      <article className="representative-card representative-card--vacant">
        <CircleAlert
          className="representative-card__vacancy-icon"
          aria-hidden="true"
        />
        <p className="representative-card__office">{positionLabel(position)}</p>
        <h3 className="representative-card__name">
          Office currently {position.status}
        </h3>
        <p className="representative-card__meta">
          {position.statusNote ??
            "The official source does not list a current officeholder."}
        </p>
        <a className="representative-card__source" href={position.sourceUrl}>
          Review official status
        </a>
      </article>
    );
  }

  return (
    <article className="representative-card">
      <div className="representative-card__image-wrap">
        {official.imageUrl ? (
          <Image
            className="representative-card__image"
            src={official.imageUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 7rem, 8rem"
          />
        ) : (
          <span className="representative-card__initial" aria-hidden="true">
            {official.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="representative-card__body">
        <p className="representative-card__office">
          {official.office.districtLabel}
        </p>
        <h3 className="representative-card__name">{official.name}</h3>
        <PartyLabel code={official.party.code} label={official.party.label} />
        <p className="representative-card__meta">
          {official.office.title} · {official.term.label}
        </p>
        <p className="representative-card__verified">
          Verified {formatDate(position.lastVerifiedAt)}
        </p>
        <Link
          className="representative-card__link"
          href={`/officials/${official.slug}`}
        >
          View official profile <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </article>
  );
}

function positionLabel(position: RepresentationSummary["position"]) {
  if (position.chamber === "us-senate")
    return `Nevada statewide · ${position.seatClass}`;
  if (position.chamber === "us-house") {
    return `Nevada Congressional District ${position.districtNumber}`;
  }
  if (position.chamber === "state-senate") {
    return `Nevada Senate District ${position.districtNumber}`;
  }
  return `Nevada Assembly District ${position.districtNumber}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

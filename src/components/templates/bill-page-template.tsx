import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";
import type { PilotBill } from "@/domain/legislation/types";
import type { CurrentOfficial } from "@/domain/officials/types";

export function BillPageTemplate({
  bill,
  currentOfficials,
}: {
  bill: PilotBill;
  currentOfficials: CurrentOfficial[];
}) {
  const officials = new Map(
    currentOfficials.map((official) => [official.id, official]),
  );

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main className="bill-page" id="main-content">
        <header className="bill-page__hero">
          <div className="layout-shell">
            <Link className="bill-page__back" href="/">
              ← Back to district lookup
            </Link>
            <p className="eyebrow">
              Enhanced Pilot Coverage · sourced legislation
            </p>
            <div className="bill-page__heading">
              <div>
                <p className="bill-page__identifier">
                  {bill.identifier} · {bill.session}
                </p>
                <h1>{bill.title}</h1>
              </div>
              <div
                className="bill-page__status"
                aria-label={`Status: ${bill.status.label}`}
              >
                <span>Status</span>
                <strong>{bill.status.label}</strong>
                <small>As of {formatDate(bill.status.asOf)}</small>
              </div>
            </div>
          </div>
        </header>

        <div className="layout-shell bill-page__layout">
          <article className="bill-page__content">
            <section aria-labelledby="summary-title">
              <p className="eyebrow">
                {bill.officialSummary.reviewState === "official-source"
                  ? "Official-source summary"
                  : "Human-approved summary"}
              </p>
              <h2 id="summary-title">What this bill does</h2>
              <p>{bill.officialSummary.text}</p>
              <p className="bill-page__attribution">
                {bill.officialSummary.reviewState === "official-source"
                  ? "This text is not AI-generated."
                  : bill.officialSummary.assistanceDisclosure}{" "}
                Source:{" "}
                <a href={bill.officialSummary.sourceUrl}>
                  {bill.officialSummary.attribution}
                </a>
                .
              </p>
            </section>

            <section aria-labelledby="votes-title">
              <p className="eyebrow">Recorded votes</p>
              <h2 id="votes-title">How Nevada lawmakers voted</h2>
              <p className="bill-page__section-intro">
                Federal roll calls show Nevada’s House delegation. State roll
                calls show every Nevada legislator serving at the time;
                historical members without a current profile remain unlinked.
              </p>
              <div className="bill-page__votes">
                {bill.votes.map((vote) => (
                  <article className="vote-card" key={vote.id}>
                    <div className="vote-card__header">
                      <div>
                        <p>
                          {vote.chamber} · {formatDate(vote.occurredOn)}
                        </p>
                        <h3>{vote.question}</h3>
                      </div>
                      <strong>{vote.result}</strong>
                    </div>
                    <dl className="vote-card__totals">
                      <div>
                        <dt>Yes</dt>
                        <dd>{vote.totals.yes}</dd>
                      </div>
                      <div>
                        <dt>No</dt>
                        <dd>{vote.totals.no}</dd>
                      </div>
                      <div>
                        <dt>Other / not voting</dt>
                        <dd>
                          {vote.totals.total - vote.totals.yes - vote.totals.no}
                        </dd>
                      </div>
                    </dl>
                    <ul
                      className="vote-card__members"
                      aria-label={`${vote.chamber} member votes`}
                    >
                      {vote.memberVotes.map((member) => {
                        const official = member.officialId
                          ? officials.get(member.officialId)
                          : undefined;
                        return (
                          <li key={`${vote.id}-${member.externalId}`}>
                            {official ? (
                              <Link href={`/officials/${official.slug}`}>
                                {member.name}
                              </Link>
                            ) : (
                              <span>{member.name}</span>
                            )}
                            <strong data-vote={member.normalizedValue}>
                              {member.originalValue}
                            </strong>
                          </li>
                        );
                      })}
                    </ul>
                    <a className="vote-card__source" href={vote.sourceUrl}>
                      View official roll call{" "}
                      <ExternalLink aria-hidden="true" size={14} />
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="timeline-title">
              <p className="eyebrow">Official history</p>
              <h2 id="timeline-title">Key actions</h2>
              <ol className="bill-page__timeline">
                {selectActions(bill).map((action, index) => (
                  <li key={`${action.occurredOn}-${index}`}>
                    <time dateTime={action.occurredOn}>
                      {formatDate(action.occurredOn)}
                    </time>
                    <p>{action.text}</p>
                  </li>
                ))}
              </ol>
            </section>
          </article>

          <aside
            className="bill-page__sidebar"
            aria-label="Bill details and sources"
          >
            <section className="bill-page__panel">
              <h2>Bill details</h2>
              <dl>
                <div>
                  <dt>Jurisdiction</dt>
                  <dd>
                    {bill.jurisdiction === "state" ? "Nevada" : "Federal"}
                  </dd>
                </div>
                <div>
                  <dt>Policy area</dt>
                  <dd>{bill.policyArea}</dd>
                </div>
                <div>
                  <dt>Committee</dt>
                  <dd>{bill.committees.join(", ") || "None listed"}</dd>
                </div>
              </dl>
            </section>
            <section className="bill-page__panel">
              <h2>Sponsors</h2>
              {bill.people.length > 0 ? (
                <ul>
                  {bill.people.map((person) => {
                    const official = person.officialId
                      ? officials.get(person.officialId)
                      : undefined;
                    return (
                      <li key={`${person.role}-${person.externalId}`}>
                        <span>
                          {person.role === "sponsor" ? "Sponsor" : "Cosponsor"}
                        </span>
                        {official ? (
                          <Link href={`/officials/${official.slug}`}>
                            {person.name}
                          </Link>
                        ) : (
                          <strong>{person.name}</strong>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>
                  No sponsor entity was captured in this reviewed source
                  snapshot. Check the official bill page for the authoritative
                  record.
                </p>
              )}
            </section>
            <section className="bill-page__panel">
              <h2>Official records</h2>
              <a href={bill.officialPageUrl}>
                Official bill page <ExternalLink aria-hidden="true" size={14} />
              </a>
              <a href={bill.officialTextUrl}>
                Official bill text <ExternalLink aria-hidden="true" size={14} />
              </a>
              <p>
                Verified {formatDate(latestRetrieval(bill))}. Source documents
                are checksummed in the published snapshot.
              </p>
            </section>
            <section className="bill-page__scope">
              <strong>About this coverage</strong>
              <p>
                {bill.selectionReason}{" "}
                {bill.editorialReview
                  ? "This record has completed accountable enhanced review."
                  : "This legacy record has enhanced source coverage, but standardized approval metadata is not yet available."}{" "}
                Index-only bills link to NELIS without claiming the same depth
                of local coverage.
              </p>
              {bill.editorialReview ? (
                <>
                  <p>
                    Approved by {bill.editorialReview.reviewerName},{" "}
                    {bill.editorialReview.reviewerRole}, on{" "}
                    {formatDate(bill.editorialReview.reviewedAt)}.
                  </p>
                  {bill.editorialReview.uncertaintyNotes.length > 0 ? (
                    <div className="bill-page__uncertainty">
                      <strong>Coverage limitations</strong>
                      <ul>
                        {bill.editorialReview.uncertaintyNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : null}
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function latestRetrieval(bill: PilotBill) {
  return (
    bill.sources
      .map((source) => source.retrievedAt)
      .sort()
      .at(-1) ?? bill.status.asOf
  );
}

function selectActions(bill: PilotBill) {
  if (bill.actions.length <= 8) return bill.actions;
  const first = bill.actions[0];
  return first ? [first, ...bill.actions.slice(-7)] : [];
}

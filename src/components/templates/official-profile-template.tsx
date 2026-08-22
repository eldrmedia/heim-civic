import { ExternalLink, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PartyLabel } from "@/components/atoms/party-label";
import { BillCard } from "@/components/molecules/bill-card";
import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";
import type { CurrentOfficial } from "@/domain/officials/types";
import type { OfficialLegislationActivity } from "@/domain/legislation/types";

export function OfficialProfileTemplate({
  official,
  legislation,
}: {
  official: CurrentOfficial;
  legislation: OfficialLegislationActivity[];
}) {
  const latestVerification = official.sources
    .map((source) => source.retrievedAt)
    .sort()
    .at(-1);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main className="official-profile" id="main-content">
        <header className="official-profile__hero">
          <div className="layout-shell official-profile__hero-inner">
            <div className="official-profile__portrait">
              {official.imageUrl ? (
                <Image
                  className="official-profile__image"
                  src={official.imageUrl}
                  alt={`Official portrait of ${official.name}`}
                  fill
                  sizes="(max-width: 640px) 9rem, 13rem"
                  preload
                />
              ) : (
                <span className="official-profile__initial" aria-hidden="true">
                  {official.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <Link className="official-profile__back" href="/">
                ← Back to district lookup
              </Link>
              <p className="eyebrow">Current official profile</p>
              <h1 className="official-profile__title">{official.name}</h1>
              <p className="official-profile__office">
                {official.office.districtLabel}
              </p>
              <PartyLabel
                code={official.party.code}
                label={official.party.label}
              />
              {official.office.leadershipTitle ? (
                <p className="official-profile__leadership">
                  {official.office.leadershipTitle}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <div className="layout-shell official-profile__layout">
          <article className="official-profile__content">
            <section aria-labelledby="office-term-title">
              <h2 id="office-term-title">Office and term</h2>
              <dl className="official-profile__facts">
                <div>
                  <dt>Office</dt>
                  <dd>{official.office.title}</dd>
                </div>
                <div>
                  <dt>Constituency</dt>
                  <dd>{official.office.districtLabel}</dd>
                </div>
                <div>
                  <dt>Party</dt>
                  <dd>{official.party.label}</dd>
                </div>
                <div>
                  <dt>Current term</dt>
                  <dd>{official.term.label}</dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="committees-title">
              <h2 id="committees-title">Current committee assignments</h2>
              {official.committees.length > 0 ? (
                <ul className="official-profile__committees">
                  {official.committees.map((committee) => (
                    <li key={`${committee.name}-${committee.sourceUrl}`}>
                      <a href={committee.sourceUrl}>
                        {committee.name}
                        {committee.role ? ` — ${committee.role}` : ""}
                        <ExternalLink aria-hidden="true" size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  The cited current source did not publish a committee
                  assignment for this official in this snapshot.
                </p>
              )}
            </section>

            <section aria-labelledby="legislation-title">
              <h2 id="legislation-title">Bills and recorded votes</h2>
              <p>
                Phase 4 connects current profiles to two source-verified pilot
                bills. This is a vertical slice, not a complete legislative
                history.
              </p>
              {legislation.length > 0 ? (
                <div className="official-profile__legislation">
                  {legislation.map((activity) => (
                    <BillCard activity={activity} key={activity.bill.id} />
                  ))}
                </div>
              ) : (
                <p className="official-profile__empty">
                  This official has no sponsorship or recorded vote in the
                  current two-bill pilot. That does not mean they have no other
                  legislative activity.
                </p>
              )}
            </section>
          </article>

          <aside
            className="official-profile__sidebar"
            aria-label="Official contacts and sources"
          >
            <section className="official-profile__panel">
              <h2>Official contact</h2>
              <ul className="official-profile__contact-list">
                <li>
                  <a href={official.contact.officialWebsite}>
                    <ExternalLink aria-hidden="true" size={16} /> Official
                    government website
                  </a>
                </li>
                {official.contact.contactUrl ? (
                  <li>
                    <a href={official.contact.contactUrl}>
                      <Mail aria-hidden="true" size={16} /> Contact this office
                    </a>
                  </li>
                ) : null}
                {official.contact.phone ? (
                  <li>
                    <a
                      href={`tel:${official.contact.phone.replace(/[^\d+]/g, "")}`}
                    >
                      <Phone aria-hidden="true" size={16} />{" "}
                      {official.contact.phone}
                    </a>
                  </li>
                ) : null}
              </ul>
              {official.contact.officeAddress ? (
                <address>{official.contact.officeAddress}</address>
              ) : null}
            </section>

            <section className="official-profile__panel">
              <h2>Sources and freshness</h2>
              <p>
                Last verified{" "}
                {latestVerification
                  ? formatDate(latestVerification)
                  : "date unavailable"}
                .
              </p>
              <ul className="official-profile__sources">
                {official.sources.map((source) => (
                  <li key={`${source.externalId}-${source.sourceUrl}`}>
                    <a href={source.sourceUrl}>{source.organization}</a>
                    <span>{source.coverageLabel}</span>
                  </li>
                ))}
              </ul>
              <p className="official-profile__source-note">
                Imported with {official.sources[0]?.parserVersion}. Source
                hashes are retained in the published snapshot for review.
              </p>
            </section>

            <Link className="official-profile__correction" href="/corrections">
              Report a factual correction
            </Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
    new Date(value),
  );
}

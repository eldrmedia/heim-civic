import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { DistrictBoundaryMap } from "@/components/molecules/district-boundary-map";
import { RepresentativeCard } from "@/components/molecules/representative-card";
import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";
import type { PublishedDistrict, StateOutline } from "@/domain/geography/types";
import type { RepresentationSummary } from "@/domain/officials/types";

export function DistrictPageTemplate({
  district,
  representation,
  stateOutline,
}: {
  district: PublishedDistrict;
  representation: RepresentationSummary;
  stateOutline: StateOutline;
}) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main className="district-page" id="main-content">
        <header className="district-page__hero">
          <div className="layout-shell">
            <Link className="district-page__back" href="/districts">
              ← All Nevada districts
            </Link>
            <p className="eyebrow">Official electoral boundary</p>
            <h1>{district.displayName}</h1>
            <p>
              See this district’s location within Nevada, its current
              officeholder, and the authoritative boundary source.
            </p>
          </div>
        </header>

        <div className="layout-shell district-page__layout">
          <article className="district-page__content">
            <section aria-labelledby="district-location-title">
              <p className="eyebrow">Statewide context</p>
              <h2 id="district-location-title">Where this district is</h2>
              <DistrictBoundaryMap
                district={district}
                stateOutline={stateOutline}
              />
            </section>

            <section aria-labelledby="district-representative-title">
              <p className="eyebrow">Current officeholder</p>
              <h2 id="district-representative-title">
                Who represents this district
              </h2>
              <div className="district-page__representative">
                <RepresentativeCard representation={representation} />
              </div>
            </section>
          </article>

          <aside
            className="district-page__sidebar"
            aria-label="District sources"
          >
            <section className="district-page__panel">
              <h2>Boundary source</h2>
              <dl>
                <div>
                  <dt>Publisher</dt>
                  <dd>{district.source.publisher}</dd>
                </div>
                <div>
                  <dt>Dataset</dt>
                  <dd>{district.source.datasetId}</dd>
                </div>
                <div>
                  <dt>Effective date</dt>
                  <dd>{formatDate(district.source.effectiveFrom)}</dd>
                </div>
              </dl>
              <a href={district.source.landingPage} rel="noreferrer">
                View official boundary plan
                <ExternalLink aria-hidden="true" size={14} />
              </a>
            </section>

            <section className="district-page__panel">
              <h2>Is this your district?</h2>
              <p>
                District boundaries alone cannot confirm representation. Use a
                complete Nevada street address for a private lookup.
              </p>
              <Link href="/#address-lookup">Check your address</Link>
            </section>

            <Link
              className="district-page__correction"
              href={`/corrections?record=${encodeURIComponent(`/districts/${district.slug}`)}`}
            >
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
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(value));
}

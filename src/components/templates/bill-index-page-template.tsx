import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { Breadcrumbs } from "@/components/molecules/breadcrumbs";
import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";
import type {
  BillIndexDisplayRecord,
  BillIndexSource,
} from "@/domain/legislation/index-types";
import { getNevadaBillIndexSlug } from "@/server/legislation/bill-index-repository";

export function BillIndexPageTemplate({
  record,
  source,
}: {
  record: BillIndexDisplayRecord;
  source: BillIndexSource;
}) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main className="bill-page" id="main-content">
        <header className="bill-page__hero">
          <div className="layout-shell">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "2025 Nevada bills", href: "/bills" },
                {
                  label: record.identifier,
                  href: `/bills/${getNevadaBillIndexSlug(record)}`,
                },
              ]}
            />
            <p className="eyebrow">Complete Bill Index · official record</p>
            <div className="bill-page__heading">
              <div>
                <p className="bill-page__identifier">
                  {record.identifier} · {record.session}
                </p>
                <h1>{record.synopsis}</h1>
              </div>
              <div
                className="bill-page__status"
                aria-label="Coverage: official index"
              >
                <span>Coverage</span>
                <strong>Official index</strong>
                <small>Not enhanced</small>
              </div>
            </div>
          </div>
        </header>

        <div className="layout-shell bill-page__layout">
          <article className="bill-page__content">
            <section aria-labelledby="official-synopsis-title">
              <p className="eyebrow">Official source text</p>
              <h2 id="official-synopsis-title">Official synopsis</h2>
              <p>{record.synopsis}</p>
            </section>
            <section aria-labelledby="official-title-title">
              <p className="eyebrow">Official long title</p>
              <h2 id="official-title-title">How NELIS describes the measure</h2>
              <p>{record.officialTitle}</p>
            </section>
            <section aria-labelledby="coverage-boundary-title">
              <p className="eyebrow">Coverage boundary</p>
              <h2 id="coverage-boundary-title">
                What this page does—and does not—verify
              </h2>
              <p>
                This page preserves the bill identifier, synopsis, long title,
                and official NELIS link from the source-listed 2025 index. Heim
                Civic Nevada has not yet published enhanced status, sponsor,
                committee, action, summary, or recorded-vote coverage for this
                measure. Their absence here must not be interpreted as their
                absence from the official record.
              </p>
            </section>
          </article>

          <aside
            className="bill-page__sidebar"
            aria-label="Bill source details"
          >
            <section className="bill-page__panel">
              <h2>Bill details</h2>
              <dl>
                <div>
                  <dt>Identifier</dt>
                  <dd>{record.identifier}</dd>
                </div>
                <div>
                  <dt>Chamber</dt>
                  <dd>
                    {record.measureType === "assembly-bill"
                      ? "Nevada Assembly"
                      : "Nevada Senate"}
                  </dd>
                </div>
                <div>
                  <dt>Session</dt>
                  <dd>{record.session}</dd>
                </div>
              </dl>
            </section>
            {record.automaticQualifier ? (
              <section className="bill-page__scope">
                <strong>Automatic selection qualifier</strong>
                <p>
                  The official record identifies this measure within the
                  governor-veto or override coverage rule. Qualification makes
                  it discoverable in the review queue; it does not mean enhanced
                  review is complete.
                </p>
              </section>
            ) : null}
            {record.sourceMarker ? (
              <section className="bill-page__scope">
                <strong>Preserved source marker</strong>
                <p>
                  NELIS displays an asterisk with this identifier. Heim Civic
                  preserves that source marker without assigning it a meaning.
                </p>
              </section>
            ) : null}
            <section className="bill-page__panel">
              <h2>Official source</h2>
              <a href={record.officialPageUrl}>
                View the official NELIS record
                <ExternalLink aria-hidden="true" size={14} />
              </a>
              <p>
                Retrieved {formatDate(source.retrievedAt)} with{" "}
                {source.parserVersion}. The source document checksum is retained
                in the published snapshot.
              </p>
            </section>
            <Link
              className="bill-page__correction"
              href={`/corrections?record=${encodeURIComponent(`/bills/${getNevadaBillIndexSlug(record)}`)}`}
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

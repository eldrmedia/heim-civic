import { ExternalLink, Info } from "lucide-react";

import { Breadcrumbs } from "@/components/molecules/breadcrumbs";
import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";
import type { CampaignFinanceSummary } from "@/domain/finance/types";
import type { CurrentOfficial } from "@/domain/officials/types";

export function FinancePageTemplate({
  official,
  summary,
}: {
  official: CurrentOfficial;
  summary: CampaignFinanceSummary;
}) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main className="finance-page" id="main-content">
        <header className="finance-page__hero">
          <div className="layout-shell">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Campaign finance", href: "/finance" },
                {
                  label: official.name,
                  href: `/finance/${summary.slug}`,
                },
              ]}
            />
            <p className="eyebrow">Phase 5 · federal finance pilot</p>
            <div className="finance-page__heading">
              <div>
                <p className="finance-page__candidate">
                  {summary.candidate.officeLabel} · 2025–2026 cycle
                </p>
                <h1>{official.name} campaign finance</h1>
                <p>{summary.committee.name}</p>
              </div>
              <div className="finance-page__period">
                <span>Reporting period</span>
                <strong>
                  {formatDate(summary.reportingPeriod.startsOn)}–
                  {formatDate(summary.reportingPeriod.endsOn)}
                </strong>
                <small>{summary.reportingPeriod.lastReportType}</small>
              </div>
            </div>
          </div>
        </header>

        <div className="layout-shell finance-page__layout">
          <article className="finance-page__content">
            <section aria-labelledby="overview-title">
              <p className="eyebrow">Candidate-authorized committee</p>
              <h2 id="overview-title">Financial overview</h2>
              <dl className="finance-page__headline-totals">
                <FinanceMetric
                  label="Total receipts"
                  value={summary.receipts.total}
                />
                <FinanceMetric
                  label="Total disbursements"
                  value={summary.spending.total}
                />
                <FinanceMetric
                  label="Cash on hand"
                  value={summary.cash.onHand}
                />
                <FinanceMetric
                  label="Debts owed by committee"
                  value={summary.cash.debtsOwedByCommittee}
                />
              </dl>
            </section>

            <section aria-labelledby="receipts-title">
              <p className="eyebrow">Official FEC categories</p>
              <h2 id="receipts-title">Receipts</h2>
              <p className="finance-page__section-intro">
                “Unitemized” is the FEC filing category. It does not establish
                that a contribution was grassroots, local, or from a unique
                person.
              </p>
              <FinanceTable
                caption="Receipt categories"
                rows={[
                  ["Total contributions", summary.receipts.contributions],
                  ["Individual contributions", summary.receipts.individual],
                  [
                    "Itemized individual contributions",
                    summary.receipts.itemizedIndividual,
                  ],
                  [
                    "Unitemized individual contributions",
                    summary.receipts.unitemizedIndividual,
                  ],
                  [
                    "Party committee contributions",
                    summary.receipts.partyCommittees,
                  ],
                  [
                    "Other political committee contributions",
                    summary.receipts.otherPoliticalCommittees,
                  ],
                  [
                    "Candidate self-funding",
                    summary.receipts.candidateSelfFunding,
                  ],
                  [
                    "Transfers from authorized committees",
                    summary.receipts.transfersFromAuthorizedCommittees,
                  ],
                  ["Loans", summary.receipts.loans],
                  [
                    "Offsets to operating expenditures",
                    summary.receipts.offsetsToOperatingExpenditures,
                  ],
                  ["Other receipts", summary.receipts.other],
                ]}
              />
            </section>

            <section aria-labelledby="spending-title">
              <p className="eyebrow">Official FEC categories</p>
              <h2 id="spending-title">Spending</h2>
              <FinanceTable
                caption="Spending categories"
                rows={[
                  ["Operating expenditures", summary.spending.operating],
                  [
                    "Contribution refunds",
                    summary.spending.contributionRefunds,
                  ],
                  [
                    "Transfers to authorized committees",
                    summary.spending.transfersToAuthorizedCommittees,
                  ],
                  ["Loan repayments", summary.spending.loanRepayments],
                  ["Other disbursements", summary.spending.other],
                ]}
              />
            </section>
          </article>

          <aside
            className="finance-page__sidebar"
            aria-label="Coverage and official sources"
          >
            <section className="finance-page__panel">
              <h2>Committee record</h2>
              <dl>
                <div>
                  <dt>FEC candidate ID</dt>
                  <dd>{summary.candidate.id}</dd>
                </div>
                <div>
                  <dt>Committee</dt>
                  <dd>{summary.committee.name}</dd>
                </div>
                <div>
                  <dt>FEC committee ID</dt>
                  <dd>{summary.committee.id}</dd>
                </div>
              </dl>
            </section>

            <section className="finance-page__warning">
              <Info aria-hidden="true" size={20} />
              <div>
                <h2>Outside spending is separate</h2>
                <p>{summary.outsideSpending.explanation}</p>
              </div>
            </section>

            <section className="finance-page__panel">
              <h2>Sources and freshness</h2>
              <p>
                FEC data can lag newly filed reports. Snapshot retrieved{" "}
                {formatDate(latestRetrieval(summary))}.
              </p>
              <a href={summary.sources[0]?.publicRecordUrl}>
                View candidate record at the FEC
                <ExternalLink aria-hidden="true" size={14} />
              </a>
              <p>
                Source responses are checksummed and validated before
                publication.
              </p>
            </section>

            <section className="finance-page__scope">
              <strong>Coverage limit</strong>
              <p>{summary.scopeNote}</p>
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function FinanceMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{formatCurrency(value)}</dd>
    </div>
  );
}

function FinanceTable({
  caption,
  rows,
}: {
  caption: string;
  rows: Array<[string, number]>;
}) {
  return (
    <div className="finance-table-wrap">
      <table className="finance-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Official category</th>
            <th scope="col">Reported amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{formatCurrency(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function latestRetrieval(summary: CampaignFinanceSummary) {
  return (
    summary.sources
      .map((source) => source.retrievedAt)
      .sort()
      .at(-1) ?? summary.reportingPeriod.endsOn
  );
}

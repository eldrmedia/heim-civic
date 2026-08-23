import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/atoms/button";
import { BillIndexCard } from "@/components/molecules/bill-index-card";
import type { BillIndexDisplayRecord } from "@/domain/legislation/index-types";

type BillDirectoryFilterState = {
  query: string;
  chamber: "all" | "assembly" | "senate";
  coverage: "all" | "enhanced" | "automatic-qualifier";
};

type BillDirectoryProps = {
  filters: BillDirectoryFilterState;
  records: BillIndexDisplayRecord[];
  totalCount: number;
  page: number;
  pageCount: number;
};

export function BillDirectory({
  filters,
  records,
  totalCount,
  page,
  pageCount,
}: BillDirectoryProps) {
  return (
    <section className="bill-directory" aria-labelledby="bill-directory-title">
      <h2 id="bill-directory-title">Complete Nevada bill index</h2>
      <p className="bill-directory__introduction">
        Search every Assembly Bill and Senate Bill record returned by the
        official NELIS listings. Index-only results open the authoritative
        record; enhanced results add locally reviewed context.
      </p>
      <form className="bill-directory__filters" action="/bills" method="get">
        <div className="bill-directory__query">
          <label htmlFor="bill-query">Bill number or official wording</label>
          <input
            defaultValue={filters.query}
            id="bill-query"
            maxLength={120}
            name="q"
            placeholder="Try AB83, housing, or school bus"
            type="search"
          />
        </div>
        <div>
          <label htmlFor="bill-chamber">Chamber</label>
          <select
            defaultValue={filters.chamber}
            id="bill-chamber"
            name="chamber"
          >
            <option value="all">Assembly and Senate</option>
            <option value="assembly">Assembly bills</option>
            <option value="senate">Senate bills</option>
          </select>
        </div>
        <div>
          <label htmlFor="bill-coverage">Coverage</label>
          <select
            defaultValue={filters.coverage}
            id="bill-coverage"
            name="coverage"
          >
            <option value="all">All indexed bills</option>
            <option value="enhanced">Enhanced coverage</option>
            <option value="automatic-qualifier">
              Automatic veto qualifiers
            </option>
          </select>
        </div>
        <Button type="submit">
          <Search aria-hidden="true" size={17} /> Search bills
        </Button>
      </form>

      <p className="bill-directory__summary" aria-live="polite">
        {totalCount.toLocaleString("en-US")}{" "}
        {totalCount === 1 ? "record" : "records"}
        {filters.query ? ` matching “${filters.query}”` : ""}
      </p>

      {records.length ? (
        <div className="bill-directory__results">
          {records.map((record) => (
            <BillIndexCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="bill-directory__empty">
          <h3>No indexed bill matched these filters.</h3>
          <p>Try a bill number, fewer words, or a broader coverage filter.</p>
        </div>
      )}

      {pageCount > 1 ? (
        <nav
          className="bill-directory__pagination"
          aria-label="Bill index pages"
        >
          {page > 1 ? (
            <Link href={pageUrl(filters, page - 1)}>← Previous</Link>
          ) : (
            <span aria-hidden="true" />
          )}
          <span>
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={pageUrl(filters, page + 1)}>Next →</Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      ) : null}
    </section>
  );
}

function pageUrl(filters: BillDirectoryProps["filters"], page: number) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.chamber !== "all") params.set("chamber", filters.chamber);
  if (filters.coverage !== "all") params.set("coverage", filters.coverage);
  params.set("page", String(page));
  return `/bills?${params.toString()}`;
}

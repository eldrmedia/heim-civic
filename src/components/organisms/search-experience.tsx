import { Search } from "lucide-react";

import { Button } from "@/components/atoms/button";
import { SearchResultCard } from "@/components/molecules/search-result-card";
import type { SearchResult } from "@/domain/search/types";

type SearchExperienceProps = {
  query: string;
  results: SearchResult[];
};

export function SearchExperience({ query, results }: SearchExperienceProps) {
  const hasQuery = query.trim().length >= 2;

  return (
    <section className="civic-search" aria-labelledby="search-heading">
      <h2 className="civic-search__heading" id="search-heading">
        Search public records
      </h2>
      <form
        className="civic-search__form"
        action="/search"
        method="get"
        role="search"
      >
        <label className="civic-search__label" htmlFor="civic-query">
          Official, district, bill, or subject
        </label>
        <div className="civic-search__control">
          <input
            className="civic-search__input"
            defaultValue={query}
            id="civic-query"
            minLength={2}
            name="q"
            placeholder="Try “Senate District 1” or a representative’s name"
            required
            type="search"
          />
          <Button type="submit">
            <Search aria-hidden="true" size={18} /> Search
          </Button>
        </div>
        <p className="civic-search__hint">
          This searches the reviewed Nevada records currently published in the
          pilot.
        </p>
      </form>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="civic-search__summary"
      >
        {hasQuery
          ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${query.trim()}”`
          : "Enter at least two characters to begin."}
      </div>

      {hasQuery && results.length === 0 ? (
        <div className="civic-search__empty">
          <h2>No published record matched that search.</h2>
          <p>
            Try an official’s full name, a district such as “Assembly 24,” a
            bill identifier, or a broad subject. Search does not include home
            addresses.
          </p>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="civic-search__results">
          {results.map((result) => (
            <SearchResultCard key={result.id} result={result} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

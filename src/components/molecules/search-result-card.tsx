import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { SearchResult } from "@/domain/search/types";

const kindLabels: Record<SearchResult["kind"], string> = {
  official: "Official",
  district: "District",
  bill: "Bill",
  subject: "Subject",
};

export function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <article className="search-result">
      <p className="search-result__kind">{kindLabels[result.kind]}</p>
      <h2 className="search-result__title">{result.title}</h2>
      <p className="search-result__description">{result.description}</p>
      <p className="search-result__source">
        Source: {result.sourceLabel}
        {result.verifiedAt ? (
          <>
            {" "}
            · Retrieved{" "}
            {new Date(result.verifiedAt).toLocaleDateString("en-US")}
          </>
        ) : null}
      </p>
      <Link className="search-result__link" href={result.href}>
        {result.actionLabel} <ArrowRight aria-hidden="true" size={17} />
      </Link>
    </article>
  );
}

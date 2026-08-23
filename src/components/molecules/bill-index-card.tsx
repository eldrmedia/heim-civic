import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

import type { BillIndexDisplayRecord } from "@/domain/legislation/index-types";

export function BillIndexCard({ record }: { record: BillIndexDisplayRecord }) {
  return (
    <article className="bill-directory-card">
      <div className="bill-directory-card__labels">
        <span>
          {record.enhancedSlug ? "Enhanced coverage" : "Official index"}
        </span>
        {record.automaticQualifier ? (
          <span>Automatic veto qualifier</span>
        ) : null}
      </div>
      <p className="bill-directory-card__identifier">
        {record.identifier} · {record.session}
      </p>
      <h3>{record.synopsis}</h3>
      <p className="bill-directory-card__title">{record.officialTitle}</p>
      {record.sourceMarker ? (
        <p className="bill-directory-card__marker">
          NELIS displays an asterisk with this identifier. Heim Civic preserves
          the marker without interpreting it.
        </p>
      ) : null}
      {record.enhancedSlug ? (
        <Link href={`/bills/${record.enhancedSlug}`}>
          View enhanced bill record <ArrowRight aria-hidden="true" size={16} />
        </Link>
      ) : (
        <a href={record.officialPageUrl}>
          Open official NELIS record{" "}
          <ExternalLink aria-hidden="true" size={15} />
        </a>
      )}
    </article>
  );
}

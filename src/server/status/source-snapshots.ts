import "server-only";

import { getFinanceBundle } from "@/server/finance/repository";
import { getBoundaryBundle } from "@/server/geography/boundaries";
import { getNevadaBillIndexBundle } from "@/server/legislation/bill-index-repository";
import { getEnhancedBillReviewBundle } from "@/server/legislation/enhanced-review-repository";
import { getLegislationBundle } from "@/server/legislation/repository";
import { getOfficialsBundle } from "@/server/officials/repository";
import type { SourceHealthId } from "@/domain/status/source-health";

export type SourceSnapshotStatus = {
  id: SourceHealthId;
  label: string;
  coverage: string;
  generatedAt: string;
  version: string;
  recordCount: number;
  sourceCount: number;
  scopeNote: string;
};

export function getSourceSnapshotStatuses(): SourceSnapshotStatus[] {
  const boundaries = getBoundaryBundle();
  const officials = getOfficialsBundle();
  const billIndex = getNevadaBillIndexBundle();
  const enhancedReview = getEnhancedBillReviewBundle();
  const legislation = getLegislationBundle();
  const finance = getFinanceBundle();

  return [
    {
      id: "boundaries",
      label: "Nevada district boundaries",
      coverage: "4 congressional, 21 Senate, and 42 Assembly districts",
      generatedAt: boundaries.generatedFrom.retrievedAt,
      version: `Boundary schema ${boundaries.schemaVersion} · vintage ${boundaries.vintage}`,
      recordCount: Object.values(boundaries.collections).reduce(
        (count, collection) => count + collection.features.length,
        0,
      ),
      sourceCount: 3,
      scopeNote:
        "Official Nevada LCB geometry; district matching uses unsimplified boundaries.",
    },
    {
      id: "officials",
      label: "Current Nevada officeholders",
      coverage: "All current federal and state legislative positions",
      generatedAt: officials.generatedAt,
      version: officials.parserVersion,
      recordCount: officials.positions.length,
      sourceCount: officials.sources.length,
      scopeNote:
        "Vacancies and transitions are position states and are never inferred from parser failures.",
    },
    {
      id: "bill-index",
      label: "Complete 2025 Nevada bill index",
      coverage: billIndex.coverageLabel,
      generatedAt: billIndex.generatedAt,
      version: billIndex.parserVersion,
      recordCount: billIndex.records.length,
      sourceCount: billIndex.sources.length,
      scopeNote:
        "Official NELIS Assembly and Senate listings; index-only records do not claim locally verified status, sponsors, actions, committees, or votes.",
    },
    {
      id: "enhanced-review",
      label: "Enhanced bill editorial queue",
      coverage: enhancedReview.coverageLabel,
      generatedAt: enhancedReview.generatedAt,
      version: enhancedReview.parserVersion,
      recordCount: enhancedReview.records.length,
      sourceCount: enhancedReview.sources.length,
      scopeNote:
        "Source-verified review packages awaiting accountable human approval; these records are not yet labeled as enhanced coverage.",
    },
    {
      id: "legislation",
      label: "Enhanced bills and votes",
      coverage: legislation.coverageLabel,
      generatedAt: legislation.generatedAt,
      version: legislation.parserVersion,
      recordCount: legislation.bills.length,
      sourceCount: legislation.sources.length,
      scopeNote:
        "One published Nevada record and one federal vertical-slice record; queued Nevada packages remain separate until human approval.",
    },
    {
      id: "finance",
      label: "Federal campaign finance",
      coverage: finance.coverageLabel,
      generatedAt: finance.generatedAt,
      version: finance.parserVersion,
      recordCount: finance.records.length,
      sourceCount: finance.sources.length,
      scopeNote:
        "Federal candidate-authorized activity only; Nevada filings and outside spending are excluded.",
    },
  ];
}

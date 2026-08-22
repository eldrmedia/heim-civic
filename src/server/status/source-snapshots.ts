import "server-only";

import { getFinanceBundle } from "@/server/finance/repository";
import { getBoundaryBundle } from "@/server/geography/boundaries";
import { getLegislationBundle } from "@/server/legislation/repository";
import { getOfficialsBundle } from "@/server/officials/repository";

export type SourceSnapshotStatus = {
  id: string;
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
      id: "legislation",
      label: "Pilot bills and votes",
      coverage: legislation.coverageLabel,
      generatedAt: legislation.generatedAt,
      version: legislation.parserVersion,
      recordCount: legislation.bills.length,
      sourceCount: legislation.sources.length,
      scopeNote:
        "Two reviewed vertical-slice records; the full Pilot Bill Set selection gate remains open.",
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

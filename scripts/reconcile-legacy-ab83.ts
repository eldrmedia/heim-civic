import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { EnhancedBillReviewBundle } from "../src/domain/legislation/enhanced-review-types";
import type { LegislationBundle } from "../src/domain/legislation/types";
import { reconcileLegacyPublishedCandidate } from "./lib/enhanced-bill-promotion";

const projectRoot = process.cwd();
const reviewPath = path.join(
  projectRoot,
  "src/data/generated/enhanced-bill-review-legacy-ab83.json",
);
const decisionsPath = path.join(
  projectRoot,
  "data/review/enhanced-bill-editorial-decisions-legacy-ab83.json",
);
const publishedPath = path.join(
  projectRoot,
  "src/data/generated/pilot-legislation.json",
);

const [reviewBundle, decisions, publishedBundle] = await Promise.all([
  readJson<EnhancedBillReviewBundle>(reviewPath),
  readJson<unknown>(decisionsPath),
  readJson<LegislationBundle>(publishedPath),
]);
const reconciled = reconcileLegacyPublishedCandidate(
  publishedBundle,
  reviewBundle,
  decisions,
);

await writeFile(
  publishedPath,
  `${JSON.stringify(reconciled, null, 2)}\n`,
  "utf8",
);
console.info("Reconciled the approved AB83 legacy record", {
  sourceSnapshotId: reviewBundle.snapshotId,
  candidateFingerprint: reconciled.bills.find(
    (bill) => bill.identifier === "AB83",
  )?.editorialReview?.candidateFingerprint,
});

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

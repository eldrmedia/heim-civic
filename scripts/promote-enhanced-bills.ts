import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { EnhancedBillReviewBundle } from "../src/domain/legislation/enhanced-review-types";
import type { LegislationBundle } from "../src/domain/legislation/types";
import { promoteApprovedCandidates } from "./lib/enhanced-bill-promotion";

const projectRoot = process.cwd();
const reviewPath = path.join(
  projectRoot,
  "src/data/generated/enhanced-bill-review.json",
);
const decisionsPath = path.join(
  projectRoot,
  "data/review/enhanced-bill-editorial-decisions.json",
);
const publishedPath = path.join(
  projectRoot,
  "src/data/generated/pilot-legislation.json",
);
const outputPath = path.join(
  projectRoot,
  "src/data/generated/promoted-enhanced-legislation.json",
);

const [reviewBundle, decisions, existingPublished] = await Promise.all([
  readJson<EnhancedBillReviewBundle>(reviewPath),
  readJson<unknown>(decisionsPath),
  readJson<LegislationBundle>(publishedPath),
]);
const promoted = promoteApprovedCandidates(reviewBundle, decisions);
const existingIds = new Set(existingPublished.bills.map((bill) => bill.id));
const existingSlugs = new Set(existingPublished.bills.map((bill) => bill.slug));

for (const bill of promoted.bills) {
  if (existingIds.has(bill.id) || existingSlugs.has(bill.slug)) {
    throw new Error(
      `${bill.identifier} duplicates an existing published bill ID or slug`,
    );
  }
}

await writeFile(outputPath, `${JSON.stringify(promoted, null, 2)}\n`, "utf8");
console.info("Applied Phase 9.2B editorial promotion decisions", {
  approvedAndPromoted: promoted.bills.length,
  stillAwaitingHumanReview: reviewBundle.records.length - promoted.bills.length,
  sourceSnapshotId: reviewBundle.snapshotId,
});

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

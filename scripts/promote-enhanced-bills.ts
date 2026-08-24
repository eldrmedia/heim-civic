import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { EnhancedBillReviewBundle } from "../src/domain/legislation/enhanced-review-types";
import type { LegislationBundle } from "../src/domain/legislation/types";
import { promoteApprovedCandidates } from "./lib/enhanced-bill-promotion";

const projectRoot = process.cwd();
const reviewInputs = [
  {
    reviewPath: path.join(
      projectRoot,
      "src/data/generated/enhanced-bill-review.json",
    ),
    decisionsPath: path.join(
      projectRoot,
      "data/review/enhanced-bill-editorial-decisions.json",
    ),
  },
  {
    reviewPath: path.join(
      projectRoot,
      "src/data/generated/enhanced-bill-review-batch-2.json",
    ),
    decisionsPath: path.join(
      projectRoot,
      "data/review/enhanced-bill-editorial-decisions-batch-2.json",
    ),
  },
  {
    reviewPath: path.join(
      projectRoot,
      "src/data/generated/enhanced-bill-review-batch-3.json",
    ),
    decisionsPath: path.join(
      projectRoot,
      "data/review/enhanced-bill-editorial-decisions-batch-3.json",
    ),
  },
];
const publishedPath = path.join(
  projectRoot,
  "src/data/generated/pilot-legislation.json",
);
const outputPath = path.join(
  projectRoot,
  "src/data/generated/promoted-enhanced-legislation.json",
);

const [reviewPairs, existingPublished] = await Promise.all([
  Promise.all(
    reviewInputs.map(async ({ reviewPath, decisionsPath }) => ({
      reviewBundle: await readJson<EnhancedBillReviewBundle>(reviewPath),
      decisions: await readJson<unknown>(decisionsPath),
    })),
  ),
  readJson<LegislationBundle>(publishedPath),
]);
const promotedBundles = reviewPairs.map(({ reviewBundle, decisions }) =>
  promoteApprovedCandidates(reviewBundle, decisions),
);
const publishedPromotionBundles = promotedBundles.filter(
  (bundle) => bundle.bills.length > 0,
);
const metadataBundles =
  publishedPromotionBundles.length > 0
    ? publishedPromotionBundles
    : promotedBundles;
const promoted: LegislationBundle = {
  schemaVersion: 1,
  snapshotId: metadataBundles.map((bundle) => bundle.snapshotId).join("+"),
  generatedAt: metadataBundles
    .map((bundle) => bundle.generatedAt)
    .sort()
    .at(-1)!,
  parserVersion: [
    ...new Set(metadataBundles.map((bundle) => bundle.parserVersion)),
  ].join("+"),
  coverageLabel: "Human-approved Nevada enhanced bill records",
  bills: promotedBundles.flatMap((bundle) => bundle.bills),
  sources: [
    ...new Map(
      promotedBundles
        .flatMap((bundle) => bundle.sources)
        .map((source) => [source.id, source]),
    ).values(),
  ],
};
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
  stillAwaitingHumanReview:
    reviewPairs.reduce(
      (count, { reviewBundle }) => count + reviewBundle.records.length,
      0,
    ) - promoted.bills.length,
  sourceSnapshotIds: reviewPairs.map(
    ({ reviewBundle }) => reviewBundle.snapshotId,
  ),
});

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

import boundariesData from "../src/data/generated/nevada-boundaries-2021.json";
import billIndexData from "../src/data/generated/nevada-bill-index.json";
import enhancedReviewData from "../src/data/generated/enhanced-bill-review.json";
import enhancedReviewBatch2Data from "../src/data/generated/enhanced-bill-review-batch-2.json";
import financeData from "../src/data/generated/pilot-finance.json";
import legislationData from "../src/data/generated/pilot-legislation.json";
import promotedLegislationData from "../src/data/generated/promoted-enhanced-legislation.json";
import officialsData from "../src/data/generated/current-officials.json";
import { evaluateSourceHealth } from "../src/domain/status/source-health";

const publishedLegislation = {
  generatedAt: [
    legislationData.generatedAt,
    promotedLegislationData.generatedAt,
  ]
    .sort()
    .at(-1)!,
  recordCount:
    legislationData.bills.length + promotedLegislationData.bills.length,
  sourceCount: new Set(
    [...legislationData.sources, ...promotedLegislationData.sources].map(
      (source) => source.id,
    ),
  ).size,
};

const enhancedReview = {
  generatedAt: [
    enhancedReviewData.generatedAt,
    enhancedReviewBatch2Data.generatedAt,
  ]
    .sort()
    .at(-1)!,
  recordCount:
    enhancedReviewData.records.length + enhancedReviewBatch2Data.records.length,
  sourceCount: new Set(
    [...enhancedReviewData.sources, ...enhancedReviewBatch2Data.sources].map(
      (source) => source.id,
    ),
  ).size,
};

const report = evaluateSourceHealth([
  {
    id: "boundaries",
    generatedAt: boundariesData.generatedFrom.retrievedAt,
    recordCount: Object.values(boundariesData.collections).reduce(
      (count, collection) => count + collection.features.length,
      0,
    ),
    sourceCount: Object.keys(boundariesData.collections).length,
  },
  {
    id: "officials",
    generatedAt: officialsData.generatedAt,
    recordCount: officialsData.positions.length,
    sourceCount: officialsData.sources.length,
  },
  {
    id: "bill-index",
    generatedAt: billIndexData.generatedAt,
    recordCount: billIndexData.records.length,
    sourceCount: billIndexData.sources.length,
  },
  {
    id: "enhanced-review",
    generatedAt: enhancedReview.generatedAt,
    recordCount: enhancedReview.recordCount,
    sourceCount: enhancedReview.sourceCount,
  },
  {
    id: "legislation",
    generatedAt: publishedLegislation.generatedAt,
    recordCount: publishedLegislation.recordCount,
    sourceCount: publishedLegislation.sourceCount,
  },
  {
    id: "finance",
    generatedAt: financeData.generatedAt,
    recordCount: financeData.records.length,
    sourceCount: financeData.sources.length,
  },
]);

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

if (report.status !== "ready") {
  process.exitCode = 1;
}

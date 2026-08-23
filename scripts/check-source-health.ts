import boundariesData from "../src/data/generated/nevada-boundaries-2021.json";
import billIndexData from "../src/data/generated/nevada-bill-index.json";
import enhancedReviewData from "../src/data/generated/enhanced-bill-review.json";
import financeData from "../src/data/generated/pilot-finance.json";
import legislationData from "../src/data/generated/pilot-legislation.json";
import officialsData from "../src/data/generated/current-officials.json";
import { evaluateSourceHealth } from "../src/domain/status/source-health";

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
    generatedAt: enhancedReviewData.generatedAt,
    recordCount: enhancedReviewData.records.length,
    sourceCount: enhancedReviewData.sources.length,
  },
  {
    id: "legislation",
    generatedAt: legislationData.generatedAt,
    recordCount: legislationData.bills.length,
    sourceCount: legislationData.sources.length,
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

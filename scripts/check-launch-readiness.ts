import { readFile } from "node:fs/promises";

import boundariesData from "../src/data/generated/nevada-boundaries-2021.json";
import billIndexData from "../src/data/generated/nevada-bill-index.json";
import enhancedReviewData from "../src/data/generated/enhanced-bill-review.json";
import enhancedReviewBatch2Data from "../src/data/generated/enhanced-bill-review-batch-2.json";
import enhancedReviewBatch3Data from "../src/data/generated/enhanced-bill-review-batch-3.json";
import enhancedReviewLegacyAb83Data from "../src/data/generated/enhanced-bill-review-legacy-ab83.json";
import financeData from "../src/data/generated/pilot-finance.json";
import legislationData from "../src/data/generated/pilot-legislation.json";
import promotedLegislationData from "../src/data/generated/promoted-enhanced-legislation.json";
import officialsData from "../src/data/generated/current-officials.json";
import {
  evaluateLaunchReadiness,
  launchEvidenceSchema,
  type LaunchEvidence,
  type LaunchReadinessMode,
} from "../src/domain/operations/launch-readiness";
import type { SourceHealthInput } from "../src/domain/status/source-health";

const publishedBundles = [legislationData, promotedLegislationData];

function selectedMode(): LaunchReadinessMode {
  const value = process.argv.find((argument) => argument.startsWith("--mode="));
  const mode = value?.slice("--mode=".length) ?? "repository";

  if (mode !== "repository" && mode !== "production") {
    throw new Error("Launch readiness mode must be repository or production.");
  }

  return mode;
}

function sourceSnapshots(): SourceHealthInput[] {
  const enhancedBundles = [
    enhancedReviewData,
    enhancedReviewBatch2Data,
    enhancedReviewBatch3Data,
    enhancedReviewLegacyAb83Data,
  ];
  return [
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
      generatedAt: enhancedBundles
        .map((bundle) => bundle.generatedAt)
        .sort()
        .at(0)!,
      recordCount: enhancedBundles.reduce(
        (count, bundle) => count + bundle.records.length,
        0,
      ),
      sourceCount: new Set(
        enhancedBundles.flatMap((bundle) =>
          bundle.sources.map((source) => source.id),
        ),
      ).size,
    },
    {
      id: "legislation",
      generatedAt: publishedBundles
        .map((bundle) => bundle.generatedAt)
        .sort()
        .at(0)!,
      recordCount: publishedBundles.reduce(
        (count, bundle) => count + bundle.bills.length,
        0,
      ),
      sourceCount: new Set(
        publishedBundles.flatMap((bundle) =>
          bundle.sources.map((source) => source.id),
        ),
      ).size,
    },
    {
      id: "finance",
      generatedAt: financeData.generatedAt,
      recordCount: financeData.records.length,
      sourceCount: financeData.sources.length,
    },
  ];
}

async function readEvidence(
  mode: LaunchReadinessMode,
): Promise<{ evidence: LaunchEvidence | null; evidenceError: boolean }> {
  if (mode === "repository") {
    return { evidence: null, evidenceError: false };
  }

  const path = process.env.LAUNCH_EVIDENCE_FILE;
  if (!path) return { evidence: null, evidenceError: true };

  try {
    const parsed = launchEvidenceSchema.safeParse(
      JSON.parse(await readFile(path, "utf8")),
    );
    return parsed.success
      ? { evidence: parsed.data, evidenceError: false }
      : { evidence: null, evidenceError: true };
  } catch {
    return { evidence: null, evidenceError: true };
  }
}

const mode = selectedMode();
const { evidence, evidenceError } = await readEvidence(mode);
const report = evaluateLaunchReadiness({
  mode,
  checkedAt: new Date(),
  snapshots: sourceSnapshots(),
  contentCounts: {
    publishedNevadaBills: publishedBundles.reduce(
      (count, bundle) =>
        count +
        bundle.bills.filter((bill) => bill.jurisdiction === "state").length,
      0,
    ),
    publishedFederalBills: publishedBundles.reduce(
      (count, bundle) =>
        count +
        bundle.bills.filter((bill) => bill.jurisdiction === "federal").length,
      0,
    ),
  },
  environment: process.env,
  evidence,
  evidenceError,
});

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

if (report.status !== "ready") process.exitCode = 1;

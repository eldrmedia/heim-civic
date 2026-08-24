import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { EnhancedBillReviewBundle } from "../src/domain/legislation/enhanced-review-types";
import { buildEditorialReviewPackets } from "./lib/enhanced-bill-promotion";

const projectRoot = process.cwd();
const batchNumber = parseBatchArgument(process.argv.slice(2));
const inputFileName =
  batchNumber === 1
    ? "enhanced-bill-review.json"
    : `enhanced-bill-review-batch-${batchNumber}.json`;
const outputFileName =
  batchNumber === 1
    ? "enhanced-bill-review-packets.json"
    : `enhanced-bill-review-packets-batch-${batchNumber}.json`;
const inputPath = path.join(projectRoot, "src/data/generated", inputFileName);
const outputPath = path.join(
  projectRoot,
  "data/review/generated",
  outputFileName,
);

const reviewBundle = JSON.parse(
  await readFile(inputPath, "utf8"),
) as EnhancedBillReviewBundle;
const packets = buildEditorialReviewPackets(reviewBundle);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(packets, null, 2)}\n`, "utf8");
console.info(`Built editorial review packets for Batch ${batchNumber}`, {
  records: packets.records.length,
  votes: packets.records.reduce(
    (count, record) => count + record.votes.length,
    0,
  ),
  sourceSnapshotId: packets.sourceSnapshotId,
});

function parseBatchArgument(arguments_: string[]) {
  const value = arguments_
    .find((argument) => argument.startsWith("--batch="))
    ?.slice("--batch=".length);
  const batch = value === undefined ? 1 : Number(value);
  if (!Number.isInteger(batch) || batch < 1 || batch > 2) {
    throw new Error("--batch must identify configured Batch 1 or Batch 2");
  }
  return batch;
}

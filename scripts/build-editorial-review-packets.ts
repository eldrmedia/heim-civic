import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { EnhancedBillReviewBundle } from "../src/domain/legislation/enhanced-review-types";
import { buildEditorialReviewPackets } from "./lib/enhanced-bill-promotion";

const projectRoot = process.cwd();
const inputPath = path.join(
  projectRoot,
  "src/data/generated/enhanced-bill-review.json",
);
const outputPath = path.join(
  projectRoot,
  "data/review/generated/enhanced-bill-review-packets.json",
);

const reviewBundle = JSON.parse(
  await readFile(inputPath, "utf8"),
) as EnhancedBillReviewBundle;
const packets = buildEditorialReviewPackets(reviewBundle);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(packets, null, 2)}\n`, "utf8");
console.info("Built Phase 9.2B editorial review packets", {
  records: packets.records.length,
  votes: packets.records.reduce(
    (count, record) => count + record.votes.length,
    0,
  ),
  sourceSnapshotId: packets.sourceSnapshotId,
});

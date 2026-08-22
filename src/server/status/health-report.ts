import "server-only";

import { evaluateSourceHealth } from "@/domain/status/source-health";
import { getSourceSnapshotStatuses } from "@/server/status/source-snapshots";

export function getPublishedSnapshotHealth(checkedAt = new Date()) {
  return evaluateSourceHealth(
    getSourceSnapshotStatuses().map(
      ({ id, generatedAt, recordCount, sourceCount }) => ({
        id,
        generatedAt,
        recordCount,
        sourceCount,
      }),
    ),
    checkedAt,
  );
}

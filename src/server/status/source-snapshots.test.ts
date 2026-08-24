import { describe, expect, it } from "vitest";

import { getSourceSnapshotStatuses } from "@/server/status/source-snapshots";

describe("public source freshness", () => {
  it("reports every published snapshot without overstating coverage", () => {
    const snapshots = getSourceSnapshotStatuses();

    expect(snapshots.map((snapshot) => snapshot.id)).toEqual([
      "boundaries",
      "officials",
      "bill-index",
      "enhanced-review",
      "legislation",
      "finance",
    ]);
    expect(
      snapshots.find((snapshot) => snapshot.id === "boundaries"),
    ).toMatchObject({
      recordCount: 67,
      sourceCount: 3,
    });
    expect(
      snapshots.find((snapshot) => snapshot.id === "officials"),
    ).toMatchObject({
      recordCount: 69,
    });
    expect(
      snapshots.find((snapshot) => snapshot.id === "bill-index"),
    ).toMatchObject({
      recordCount: 1152,
      sourceCount: 2,
    });
    expect(
      snapshots.find((snapshot) => snapshot.id === "enhanced-review"),
    ).toMatchObject({
      recordCount: 10,
      sourceCount: 41,
    });
    expect(
      snapshots.find((snapshot) => snapshot.id === "legislation"),
    ).toMatchObject({
      recordCount: 12,
    });
    expect(
      snapshots.find((snapshot) => snapshot.id === "finance"),
    ).toMatchObject({
      recordCount: 2,
    });
  });
});

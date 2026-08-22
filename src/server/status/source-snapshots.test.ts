import { describe, expect, it } from "vitest";

import { getSourceSnapshotStatuses } from "@/server/status/source-snapshots";

describe("public source freshness", () => {
  it("reports every published snapshot without overstating coverage", () => {
    const snapshots = getSourceSnapshotStatuses();

    expect(snapshots.map((snapshot) => snapshot.id)).toEqual([
      "boundaries",
      "officials",
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
      snapshots.find((snapshot) => snapshot.id === "legislation"),
    ).toMatchObject({
      recordCount: 2,
    });
    expect(
      snapshots.find((snapshot) => snapshot.id === "finance"),
    ).toMatchObject({
      recordCount: 2,
    });
  });
});

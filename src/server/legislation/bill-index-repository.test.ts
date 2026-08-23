import { describe, expect, it } from "vitest";

import {
  getAllNevadaBillIndexRecords,
  getNevadaBillDirectoryPage,
  getNevadaBillIndexBundle,
} from "@/server/legislation/bill-index-repository";

describe("Nevada bill index repository", () => {
  it("publishes the validated NELIS inventory and source markers", () => {
    const bundle = getNevadaBillIndexBundle();
    const records = getAllNevadaBillIndexRecords();

    expect(bundle.records).toHaveLength(1152);
    expect(bundle.sources).toHaveLength(2);
    expect(records.filter((record) => record.sourceMarker)).toHaveLength(43);
    expect(records.filter((record) => record.automaticQualifier)).toHaveLength(
      86,
    );
  });

  it("reconciles reviewed Nevada records without upgrading other bills", () => {
    expect(
      getAllNevadaBillIndexRecords().find(
        (record) => record.identifier === "AB83",
      ),
    ).toMatchObject({
      billKey: "11904",
      enhancedSlug: "nv-83-2025-ab83",
      automaticQualifier: "governor-veto-or-override",
    });
    expect(
      getAllNevadaBillIndexRecords().find(
        (record) => record.identifier === "AB84",
      )?.enhancedSlug,
    ).toBeNull();
  });

  it("filters and paginates official records deterministically", () => {
    const result = getNevadaBillDirectoryPage({
      query: "school bus",
      chamber: "assembly",
      pageSize: 5,
    });

    expect(result.totalCount).toBeGreaterThan(0);
    expect(result.records.length).toBeLessThanOrEqual(5);
    expect(
      result.records.every((record) => record.measureType === "assembly-bill"),
    ).toBe(true);
  });
});

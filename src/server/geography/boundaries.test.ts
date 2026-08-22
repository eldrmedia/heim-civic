import { describe, expect, it } from "vitest";

import {
  getAllPublishedDistricts,
  getPublishedDistrictBySlug,
} from "@/server/geography/boundaries";

describe("published Nevada districts", () => {
  it("publishes the complete official district sequence", () => {
    const districts = getAllPublishedDistricts();

    expect(districts).toHaveLength(67);
    expect(
      districts.filter((district) => district.type === "congressional"),
    ).toHaveLength(4);
    expect(
      districts.filter((district) => district.type === "state-senate"),
    ).toHaveLength(21);
    expect(
      districts.filter((district) => district.type === "state-assembly"),
    ).toHaveLength(42);
    expect(new Set(districts.map((district) => district.slug)).size).toBe(67);
  });

  it("resolves a stable district slug with provenance intact", () => {
    expect(getPublishedDistrictBySlug("state-senate-1")).toMatchObject({
      type: "state-senate",
      number: "1",
      displayName: "Nevada Senate District 1",
      source: {
        publisher: "Nevada Legislative Counsel Bureau",
      },
    });
  });
});

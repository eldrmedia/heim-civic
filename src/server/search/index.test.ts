import { describe, expect, it } from "vitest";

import { buildSearchIndex, searchCivicRecords } from "@/server/search/index";

describe("civic search index", () => {
  it("indexes every supported public record kind", () => {
    const kinds = new Set(buildSearchIndex().map((record) => record.kind));

    expect(kinds).toEqual(new Set(["official", "district", "bill", "subject"]));
  });

  it("finds an official by name and puts that exact match first", () => {
    const results = searchCivicRecords("Steven Horsford");

    expect(results[0]).toMatchObject({
      kind: "official",
      title: "Steven Horsford",
      href: "/officials/us-congress-h001066",
    });
  });

  it("finds districts using common chamber terms", () => {
    const results = searchCivicRecords("Assembly District 1");

    expect(results.some((result) => result.kind === "district")).toBe(true);
    expect(results[0]).toMatchObject({
      title: "Nevada Assembly District 1",
      href: "/districts/state-assembly-1",
      actionLabel: "View district",
    });
  });

  it("finds bills by identifier and subjects by common terms", () => {
    expect(searchCivicRecords("H.R. 1366")[0]).toMatchObject({ kind: "bill" });
    expect(
      searchCivicRecords("Environmental Protection").some(
        (result) => result.kind === "subject",
      ),
    ).toBe(true);
  });

  it("does not return the full index for short or unrelated queries", () => {
    expect(searchCivicRecords("a")).toEqual([]);
    expect(searchCivicRecords("unpublished imaginary record")).toEqual([]);
  });
});

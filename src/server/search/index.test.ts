import { describe, expect, it } from "vitest";

import baseLegislationData from "@/data/generated/pilot-legislation.json";
import promotedLegislationData from "@/data/generated/promoted-enhanced-legislation.json";
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
    expect(searchCivicRecords("AB597")[0]).toMatchObject({
      kind: "bill",
      title: expect.stringContaining("AB597"),
      actionLabel: "Open official NELIS record",
      href: "https://www.leg.state.nv.us/App/NELIS/REL/83rd2025/Bill/12961/Overview",
    });
    expect(searchCivicRecords("AB83")[0]).toMatchObject({
      actionLabel: "View enhanced bill record",
      href: "/bills/nv-83-2025-ab83",
    });
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

  it("gives every enhanced bill a local searchable route", () => {
    for (const bill of [
      ...baseLegislationData.bills,
      ...promotedLegislationData.bills,
    ]) {
      const result = searchCivicRecords(bill.identifier).find(
        (candidate) => candidate.href === `/bills/${bill.slug}`,
      );

      expect(result).toMatchObject({
        kind: "bill",
        actionLabel:
          bill.jurisdiction === "state"
            ? "View enhanced bill record"
            : "View bill record",
      });
    }
  });
});

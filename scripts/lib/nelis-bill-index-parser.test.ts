import { describe, expect, it } from "vitest";

import { parseNelisBillListing } from "./nelis-bill-index-parser";

const sourceUrl =
  "https://www.leg.state.nv.us/App/NELIS/REL/83rd2025/HomeBill/BillsTab";

function listing(identifier: string) {
  return `
    <div class="row">
      <div class="col-md-1">
        <a href="/App/NELIS/REL/83rd2025/Bill/11907/Overview">${identifier}</a>
      </div>
      <div class="col-md-10">
        Revises provisions relating to public bodies. (BDR 34-377)
        <div class="pt-2">
          <span class="font-weight-bold">Title:</span>
          AN ACT relating to public bodies; and providing other matters properly relating thereto.
        </div>
      </div>
    </div>`;
}

describe("NELIS bill-index parser", () => {
  it("preserves official wording, keys, URLs, and source markers", () => {
    expect(
      parseNelisBillListing(
        listing("AB74*"),
        "AB",
        "assembly-source",
        sourceUrl,
      ),
    ).toEqual([
      expect.objectContaining({
        id: "nv-nelis-bill:11907",
        billKey: "11907",
        identifier: "AB74*",
        canonicalIdentifier: "AB74",
        sourceMarker: "asterisk",
        synopsis: "Revises provisions relating to public bodies. (BDR 34-377)",
        officialTitle:
          "AN ACT relating to public bodies; and providing other matters properly relating thereto.",
        officialPageUrl:
          "https://www.leg.state.nv.us/App/NELIS/REL/83rd2025/Bill/11907/Overview",
        coverageLevel: "official-index",
        automaticQualifier: null,
      }),
    ]);
  });

  it("rejects a bill type outside the requested official listing", () => {
    expect(() =>
      parseNelisBillListing(
        listing("SB74"),
        "AB",
        "assembly-source",
        sourceUrl,
      ),
    ).toThrow("Unexpected AB identifier");
  });
});

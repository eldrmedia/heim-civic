import { load } from "cheerio";

import type {
  NevadaBillIndexRecord,
  NevadaBillType,
} from "../../src/domain/legislation/index-types";

export function parseNelisBillListing(
  body: string,
  billType: NevadaBillType,
  sourceId: string,
  sourceUrl: string,
): NevadaBillIndexRecord[] {
  const $ = load(body);

  return $("a[href*='/Bill/'][href$='/Overview']")
    .map((_, element) => {
      const anchor = $(element);
      const identifier = clean(anchor.text());
      const href = anchor.attr("href") ?? "";
      const billKey = href.match(/\/Bill\/(\d+)\/Overview$/)?.[1] ?? "";
      const details = anchor.closest(".row").children(".col-md-10").first();
      const titleContainer = details.children(".pt-2").first();
      const officialTitle = clean(
        titleContainer
          .clone()
          .children(".font-weight-bold")
          .remove()
          .end()
          .text(),
      );
      const synopsis = clean(
        details.clone().children(".pt-2").remove().end().text(),
      );
      const expectedIdentifier = new RegExp(`^${billType}\\d+\\*?$`);

      if (!expectedIdentifier.test(identifier)) {
        throw new Error(`Unexpected ${billType} identifier: ${identifier}`);
      }
      if (!/^\d+$/.test(billKey) || !synopsis || !officialTitle) {
        throw new Error(`Incomplete official listing record for ${identifier}`);
      }

      return {
        id: `nv-nelis-bill:${billKey}`,
        billKey,
        identifier,
        canonicalIdentifier: identifier.replace(/\*$/, ""),
        sourceMarker: identifier.endsWith("*") ? ("asterisk" as const) : null,
        measureType:
          billType === "AB"
            ? ("assembly-bill" as const)
            : ("senate-bill" as const),
        session: "83rd (2025) Nevada Legislature" as const,
        synopsis,
        officialTitle,
        officialPageUrl: new URL(href, sourceUrl).toString(),
        coverageLevel: "official-index" as const,
        automaticQualifier: null,
        sourceId,
      };
    })
    .get();
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import { z } from "zod";

const sourceUrl =
  "https://www.leg.state.nv.us/App/NELIS/REL/83rd2025/Bills/Vetoed";
const outputPath = path.join(
  process.cwd(),
  "data/review/pilot-bill-selection-audit.json",
);
const targetRange = { minimum: 30, maximum: 50 };

const recordSchema = z.object({
  billIdentifier: z.string().regex(/^(AB|SB)\d+$/),
  billKey: z.string().regex(/^\d+$/),
  summary: z.string().min(1),
  overviewUrl: z.url(),
  automaticFactor: z.literal("governor-veto-or-override"),
});

async function main() {
  const response = await fetch(sourceUrl, {
    headers: {
      Accept: "text/html",
      "User-Agent": "heim-civic-nevada-selection-audit/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`NELIS veto report returned ${response.status}`);
  }

  const body = await response.text();
  const $ = load(body);
  const records = $("a[href*='/Bill/'][href$='/Overview']")
    .map((_, element) => {
      const anchor = $(element);
      const href = anchor.attr("href") ?? "";
      const billKey = href.match(/\/Bill\/(\d+)\/Overview$/)?.[1] ?? "";
      const row = anchor.closest(".row");
      const summary = clean(row.children(".col").first().text());

      return recordSchema.parse({
        billIdentifier: clean(anchor.text()),
        billKey,
        summary,
        overviewUrl: new URL(href, sourceUrl).toString(),
        automaticFactor: "governor-veto-or-override",
      });
    })
    .get();

  const uniqueRecords = Array.from(
    new Map(records.map((record) => [record.billIdentifier, record])).values(),
  );
  if (uniqueRecords.length === 0) {
    throw new Error("NELIS veto report produced no validated bill records");
  }

  const conflict = uniqueRecords.length > targetRange.maximum;
  const retrievedAt = new Date().toISOString();
  const artifact = {
    schemaVersion: 1,
    reviewedAt: retrievedAt,
    source: {
      organization: "Nevada Legislature (NELIS)",
      url: sourceUrl,
      retrievedAt,
      documentSha256: createHash("sha256").update(body).digest("hex"),
    },
    prdRules: {
      targetRange,
      automaticFactor: "governor-veto-or-override",
      automaticRule: "All measures vetoed by the governor are included.",
    },
    result: {
      mandatoryVetoedBillCount: uniqueRecords.length,
      status: conflict ? "requires-prd-decision" : "within-target-range",
      conflict: conflict
        ? `The official veto report contains ${uniqueRecords.length} automatically qualifying bills, exceeding the PRD target maximum of ${targetRange.maximum}.`
        : null,
    },
    records: uniqueRecords,
  };

  await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  console.info("Audited automatic Pilot Bill Set veto inclusions", {
    records: uniqueRecords.length,
    status: artifact.result.status,
    outputPath,
  });
}

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

await main();

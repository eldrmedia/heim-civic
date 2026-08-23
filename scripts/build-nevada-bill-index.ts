import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import type {
  BillIndexSource,
  NevadaBillIndexBundle,
  NevadaBillIndexRecord,
} from "../src/domain/legislation/index-types";
import { parseNelisBillListing } from "./lib/nelis-bill-index-parser";

const manifestPath = path.join(
  process.cwd(),
  "data/sources/nevada-bill-index.manifest.json",
);
const vetoAuditPath = path.join(
  process.cwd(),
  "data/review/pilot-bill-selection-audit.json",
);
const outputPath = path.join(
  process.cwd(),
  "src/data/generated/nevada-bill-index.json",
);

const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  session: z.literal("83rd (2025) Nevada Legislature"),
  parserVersion: z.string().min(1),
  coverageLabel: z.string().min(1),
  sources: z
    .array(
      z.object({
        id: z.string().min(1),
        organization: z.literal("Nevada Legislature (NELIS)"),
        billType: z.enum(["AB", "SB"]),
        url: z.url().startsWith("https://www.leg.state.nv.us/"),
        expectedRecordCount: z.number().int().positive(),
        expectedStandardCount: z.number().int().positive(),
        expectedStarredCount: z.number().int().nonnegative(),
      }),
    )
    .length(2),
});

const vetoAuditSchema = z.object({
  result: z.object({ mandatoryVetoedBillCount: z.number().int().positive() }),
  records: z.array(
    z.object({
      billIdentifier: z.string().regex(/^(AB|SB)\d+$/),
      billKey: z.string().regex(/^\d+$/),
    }),
  ),
});

async function main() {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(manifestPath, "utf8")),
  );
  const vetoAudit = vetoAuditSchema.parse(
    JSON.parse(await readFile(vetoAuditPath, "utf8")),
  );
  const vetoesByIdentifier = new Map(
    vetoAudit.records.map((record) => [record.billIdentifier, record.billKey]),
  );

  if (vetoesByIdentifier.size !== vetoAudit.result.mandatoryVetoedBillCount) {
    throw new Error("Veto audit count does not match its unique records");
  }

  const downloaded = await Promise.all(
    manifest.sources.map((source) =>
      downloadAndParse(source, manifest.parserVersion),
    ),
  );
  const records = downloaded
    .flatMap((result) => result.records)
    .map((record) => ({
      ...record,
      automaticQualifier:
        vetoesByIdentifier.get(record.identifier) === record.billKey
          ? ("governor-veto-or-override" as const)
          : null,
    }))
    .sort(compareRecords);
  const sources = downloaded.map((result) => result.source);

  validateBundleRecords(records, vetoesByIdentifier);

  const generatedAt = new Date().toISOString();
  const bundle: NevadaBillIndexBundle = {
    schemaVersion: 1,
    snapshotId: `nv-nelis:83rd2025:bill-index:${generatedAt}`,
    generatedAt,
    parserVersion: manifest.parserVersion,
    coverageLabel: manifest.coverageLabel,
    session: manifest.session,
    records,
    sources,
  };

  await writeFile(outputPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
  console.info("Generated Nevada bill index", {
    records: records.length,
    standardRecords: records.filter((record) => !record.sourceMarker).length,
    sourceMarkedRecords: records.filter((record) => record.sourceMarker).length,
    vetoQualifiers: records.filter((record) => record.automaticQualifier)
      .length,
    outputPath,
  });
}

async function downloadAndParse(
  definition: z.infer<typeof manifestSchema>["sources"][number],
  parserVersion: string,
) {
  const response = await fetch(definition.url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "heim-civic-nevada-bill-index/1.0",
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(
      `${definition.id} download failed: HTTP ${response.status}`,
    );
  }

  const body = await response.text();
  const retrievedAt = new Date().toISOString();
  const records = parseNelisBillListing(
    body,
    definition.billType,
    definition.id,
    definition.url,
  );
  const standardCount = records.filter((record) => !record.sourceMarker).length;
  const starredCount = records.filter((record) => record.sourceMarker).length;

  if (
    records.length !== definition.expectedRecordCount ||
    standardCount !== definition.expectedStandardCount ||
    starredCount !== definition.expectedStarredCount
  ) {
    throw new Error(
      `${definition.id} count changed: expected ${definition.expectedRecordCount} total, ${definition.expectedStandardCount} standard, and ${definition.expectedStarredCount} source-marked; received ${records.length}, ${standardCount}, and ${starredCount}`,
    );
  }

  const source: BillIndexSource = {
    id: definition.id,
    organization: definition.organization,
    url: definition.url,
    billType: definition.billType,
    retrievedAt,
    documentSha256: createHash("sha256").update(body).digest("hex"),
    parserVersion,
    validationState: "source-verified",
  };

  return { records, source };
}

function validateBundleRecords(
  records: NevadaBillIndexRecord[],
  vetoesByIdentifier: Map<string, string>,
) {
  if (new Set(records.map((record) => record.id)).size !== records.length) {
    throw new Error("Nevada bill index contains duplicate source bill keys");
  }
  if (
    new Set(records.map((record) => record.identifier)).size !== records.length
  ) {
    throw new Error(
      "Nevada bill index contains duplicate displayed identifiers",
    );
  }

  for (const [identifier, billKey] of vetoesByIdentifier) {
    const record = records.find(
      (candidate) =>
        candidate.identifier === identifier && candidate.billKey === billKey,
    );
    if (!record?.automaticQualifier) {
      throw new Error(
        `Vetoed bill ${identifier} did not reconcile to the index`,
      );
    }
  }
}

function compareRecords(
  left: NevadaBillIndexRecord,
  right: NevadaBillIndexRecord,
) {
  const chamberOrder = left.measureType.localeCompare(right.measureType);
  if (chamberOrder !== 0) return chamberOrder;

  const numberOrder =
    Number(left.canonicalIdentifier.replace(/\D/g, "")) -
    Number(right.canonicalIdentifier.replace(/\D/g, ""));
  if (numberOrder !== 0) return numberOrder;

  return left.identifier.localeCompare(right.identifier);
}

await main();

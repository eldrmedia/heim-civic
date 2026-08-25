import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import { z } from "zod";

import {
  automaticSelectionFactors,
  impactSelectionFactors,
} from "../src/domain/legislation/selection";
import {
  enhancedSubjectAreas,
  type EnhancedBillReviewBundle,
  type EnhancedBillReviewCandidate,
} from "../src/domain/legislation/enhanced-review-types";
import type {
  BillAction,
  BillPerson,
  LegislationBundle,
  LegislationSource,
  MemberVote,
  NormalizedVoteValue,
  RecordedVote,
} from "../src/domain/legislation/types";
import type { NevadaBillIndexBundle } from "../src/domain/legislation/index-types";
import type { OfficialsBundle } from "../src/domain/officials/types";

const projectRoot = process.cwd();
const isLegacyAb83Reconciliation = process.argv.includes("--legacy-ab83");
const batchNumber = parseBatchArgument(process.argv.slice(2));
const parserVersion = "enhanced-bill-review-v1";
const manifestFileName = isLegacyAb83Reconciliation
  ? "enhanced-bill-selection.legacy-ab83.manifest.json"
  : batchNumber === 1
    ? "enhanced-bill-selection.manifest.json"
    : `enhanced-bill-selection.batch-${batchNumber}.manifest.json`;
const manifestPath = path.join(projectRoot, "data/review", manifestFileName);
const priorManifestPaths = isLegacyAb83Reconciliation
  ? []
  : Array.from({ length: batchNumber - 1 }, (_, index) => {
      const priorBatch = index + 1;
      const fileName =
        priorBatch === 1
          ? "enhanced-bill-selection.manifest.json"
          : `enhanced-bill-selection.batch-${priorBatch}.manifest.json`;
      return path.join(projectRoot, "data/review", fileName);
    });
const billIndexPath = path.join(
  projectRoot,
  "src/data/generated/nevada-bill-index.json",
);
const vetoAuditPath = path.join(
  projectRoot,
  "data/review/pilot-bill-selection-audit.json",
);
const officialsPath = path.join(
  projectRoot,
  "src/data/generated/current-officials.json",
);
const publishedPath = path.join(
  projectRoot,
  "src/data/generated/pilot-legislation.json",
);
const outputFileName = isLegacyAb83Reconciliation
  ? "enhanced-bill-review-legacy-ab83.json"
  : batchNumber === 1
    ? "enhanced-bill-review.json"
    : `enhanced-bill-review-batch-${batchNumber}.json`;
const outputPath = path.join(projectRoot, "src/data/generated", outputFileName);
const nelisBase = "https://www.leg.state.nv.us";
const vetoReportUrl = `${nelisBase}/App/NELIS/REL/83rd2025/Bills/Vetoed`;

const manifestRecordSchema = z.object({
  billIdentifier: z.string().regex(/^(AB|SB)\d+$/),
  billKey: z.string().regex(/^\d+$/),
  subjectArea: z.enum(enhancedSubjectAreas),
  automaticFactors: z.array(z.enum(automaticSelectionFactors)).min(1),
  impactFactors: z.array(z.enum(impactSelectionFactors)),
  queueReason: z.string().min(1),
  reviewState: z.literal("source-preparation"),
});
const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  batch: z.number().int().nonnegative(),
  coverageLabel: z.string().min(1),
  targetRange: z.object({
    minimum: z.number().int().positive(),
    maximum: z.number().int().positive(),
  }),
  records: z.array(manifestRecordSchema).min(1).max(10),
});

type ManifestRecord = z.infer<typeof manifestRecordSchema>;
type DownloadedSource = {
  id: string;
  organization: "Nevada Legislature (NELIS)";
  url: string;
  format: "html";
  body: string;
  sha256: string;
  retrievedAt: string;
};

async function main() {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(manifestPath, "utf8")),
  );
  if (manifest.targetRange.minimum > manifest.targetRange.maximum) {
    throw new Error("Enhanced coverage target minimum exceeds its maximum");
  }
  if (manifest.batch !== batchNumber) {
    throw new Error(
      `Manifest batch ${manifest.batch} does not match requested batch ${batchNumber}`,
    );
  }

  const [billIndex, vetoAudit, officials, priorManifests, published] =
    await Promise.all([
      readJson<NevadaBillIndexBundle>(billIndexPath),
      readJson<{
        records: Array<{ billIdentifier: string; billKey: string }>;
      }>(vetoAuditPath),
      readJson<OfficialsBundle>(officialsPath),
      Promise.all(
        priorManifestPaths.map((manifest) =>
          readJson<z.infer<typeof manifestSchema>>(manifest),
        ),
      ),
      readJson<LegislationBundle>(publishedPath),
    ]);
  const indexByIdentifier = new Map(
    billIndex.records.map((record) => [record.identifier, record]),
  );
  const vetoedByIdentifier = new Map(
    vetoAudit.records.map((record) => [record.billIdentifier, record]),
  );
  const officialsBySortName = new Map(
    officials.officials.map((official) => [
      normalizeName(official.sortName),
      official.id,
    ]),
  );

  const priorCoveredIdentifiers = new Set([
    ...priorManifests.flatMap((priorManifest) =>
      priorManifest.records.map((record) => record.billIdentifier),
    ),
    ...published.bills
      .filter((bill) => bill.jurisdiction === "state")
      .map((bill) => bill.identifier),
  ]);
  validateManifest(
    manifest,
    indexByIdentifier,
    vetoedByIdentifier,
    vetoAudit.records,
    priorCoveredIdentifiers,
    isLegacyAb83Reconciliation,
  );
  const records = await Promise.all(
    manifest.records.map((entry) =>
      buildCandidate(entry, indexByIdentifier, officialsBySortName),
    ),
  );
  validateCandidates(records);

  const sources = Array.from(
    new Map(
      records.flatMap((record) =>
        record.sources.map((source) => [source.id, source] as const),
      ),
    ).values(),
  );
  const generatedAt = new Date().toISOString();
  const bundle: EnhancedBillReviewBundle = {
    schemaVersion: 1,
    snapshotId: isLegacyAb83Reconciliation
      ? `phase-9.3-legacy-ab83-reconciliation:${generatedAt.slice(0, 10)}`
      : batchNumber === 1
        ? `phase-9.2-enhanced-review:${generatedAt.slice(0, 10)}`
        : `phase-9.3-batch-${batchNumber}-enhanced-review:${generatedAt.slice(0, 10)}`,
    generatedAt,
    parserVersion,
    coverageLabel: manifest.coverageLabel,
    targetRange: manifest.targetRange,
    records,
    sources,
  };

  await writeFile(outputPath, `${JSON.stringify(bundle)}\n`, "utf8");
  console.info(
    isLegacyAb83Reconciliation
      ? "Built AB83 legacy reconciliation review package"
      : `Built enhanced bill review package for Batch ${batchNumber}`,
    {
      records: records.length,
      votes: records.reduce((total, record) => total + record.votes.length, 0),
      sources: sources.length,
      reviewState: "awaiting-human-review",
    },
  );
}

async function buildCandidate(
  entry: ManifestRecord,
  indexByIdentifier: Map<string, NevadaBillIndexBundle["records"][number]>,
  officialsBySortName: Map<string, string>,
): Promise<EnhancedBillReviewCandidate> {
  const identifier = entry.billIdentifier.toLowerCase();
  const overviewUrl = `${nelisBase}/App/NELIS/REL/83rd2025/Bill/FillSelectedBillTab?billKey=${entry.billKey}&selectedTab=Overview`;
  const votesUrl = `${nelisBase}/App/NELIS/REL/83rd2025/Bill/GetBillVotes?billKey=${entry.billKey}&voteTypeId=3`;
  const [overview, voteSummary] = await Promise.all([
    downloadSource(`${identifier}-overview`, overviewUrl),
    downloadSource(`${identifier}-votes`, votesUrl),
  ]);
  const $overview = load(overview.body);
  const $votes = load(voteSummary.body);
  const voteKeys = $votes(".vote-revision")
    .map((_, element) => voteKey($votes(element).attr("id") ?? ""))
    .get();
  const memberSources = await Promise.all(
    voteKeys.map((key) =>
      downloadSource(
        `${identifier}-vote-${key}-members`,
        `${nelisBase}/App/NELIS/REL/83rd2025/Bill/GetBillVoteMembers?voteKey=${key}&voteResultPanel=All`,
      ),
    ),
  );
  const membersByVoteKey = new Map(
    voteKeys.map((key, index) => [key, required(memberSources[index])]),
  );
  const actions = parseActions($overview);
  const indexRecord = required(indexByIdentifier.get(entry.billIdentifier));
  const latest = required(actions.at(-1));
  const sources = [overview, voteSummary, ...memberSources].map(toSourceRecord);

  return {
    id: `nv-83-2025-${identifier}`,
    billIdentifier: entry.billIdentifier,
    billKey: entry.billKey,
    batch: batchNumber,
    subjectArea: entry.subjectArea,
    officialSynopsis: indexRecord.synopsis,
    officialTitle: indexRecord.officialTitle,
    officialDigest: clean($overview("#digest").text()),
    officialPageUrl: indexRecord.officialPageUrl,
    officialTextUrl: `${nelisBase}/App/NELIS/REL/83rd2025/Bill/${entry.billIdentifier}/Text`,
    status: {
      label: "Vetoed",
      asOf: latest.occurredOn,
      latestAction: latest.text,
    },
    committees: [
      ...new Set(
        $overview("[data-th='Committee'] a")
          .map((_, element) => clean($overview(element).text()))
          .get()
          .filter(Boolean),
      ),
    ],
    people: [
      ...parsePeople(
        $overview,
        "#primarySponsors a, .row:has(.font-weight-bold:contains('Primary Sponsor')) .col > a[href*='/Committee/']",
        "sponsor",
        officialsBySortName,
      ),
      ...parsePeople(
        $overview,
        "#cosponsors a",
        "cosponsor",
        officialsBySortName,
      ),
    ],
    actions,
    votes: parseVotes($votes, membersByVoteKey, officialsBySortName),
    automaticFactors: entry.automaticFactors,
    impactFactors: entry.impactFactors,
    queueReason: entry.queueReason,
    reviewState: "awaiting-human-review",
    reviewedBy: null,
    reviewedAt: null,
    evidenceUrls: [indexRecord.officialPageUrl, vetoReportUrl],
    sources,
  };
}

function parseActions($: ReturnType<typeof load>): BillAction[] {
  return $("table:has(caption:contains('Bill History')) tbody tr")
    .map((_, row) => ({
      occurredOn: parseDate($(row).find("[data-th='Date']").text()),
      text: clean($(row).find("[data-th='Action']").text()),
    }))
    .get()
    .filter((action): action is BillAction =>
      Boolean(action.occurredOn && action.text),
    );
}

function parsePeople(
  $: ReturnType<typeof load>,
  selector: string,
  role: BillPerson["role"],
  officialsBySortName: Map<string, string>,
): BillPerson[] {
  return $(selector)
    .map((_, element) => {
      const anchor = $(element);
      const name = clean(anchor.text()).replace(
        /^(Assemblymember|Senator)\s+/,
        "",
      );
      const sortName = toSortName(name);
      return {
        officialId: officialsBySortName.get(normalizeName(sortName)) ?? null,
        externalId: new URL(anchor.attr("href") ?? "", nelisBase).toString(),
        name,
        role,
      };
    })
    .get();
}

function parseVotes(
  $: ReturnType<typeof load>,
  membersByVoteKey: Map<string, DownloadedSource>,
  officialsBySortName: Map<string, string>,
): RecordedVote[] {
  return $(".vote-revision")
    .map((_, element) => {
      const panel = $(element);
      const key = voteKey(panel.attr("id") ?? "");
      const memberSource = required(membersByVoteKey.get(key));
      const lines = panel.find(".list-group-item");
      return {
        id: `nv-vote:${key}`,
        chamber: clean(panel.prevAll("h2").first().text()),
        question: "Final-passage roll call (NELIS vote type 3)",
        result: clean(lines.first().find("span").first().text()),
        occurredOn: parseDate(lines.eq(1).find("span").text()),
        sourceUrl: memberSource.url,
        memberCoverage: "all-nevada-legislators",
        totals: {
          yes: countFromPanel(panel, "panelYeaVoters"),
          no: countFromPanel(panel, "panelNayVoters"),
          present: 0,
          notVoting: countFromPanel(panel, "panelNotVotingVoters"),
          excused: countFromPanel(panel, "panelExcusedVoters"),
          absent: countFromPanel(panel, "panelAbsentVoters"),
          total: countFromPanel(panel, "panelAllVoters"),
        },
        memberVotes: parseMemberVotes(memberSource, officialsBySortName),
      } satisfies RecordedVote;
    })
    .get();
}

function parseMemberVotes(
  source: DownloadedSource,
  officialsBySortName: Map<string, string>,
): MemberVote[] {
  const $ = load(source.body);
  return $(".vote")
    .map((_, element) => {
      const text = clean($(element).text());
      const match = text.match(/^(.*?)\s*\(([^)]+)\)$/);
      if (!match) throw new Error(`Could not parse NELIS member vote: ${text}`);
      const name = clean(match[1]);
      const originalValue = clean(match[2]);
      return {
        officialId: officialsBySortName.get(normalizeName(name)) ?? null,
        externalId: `nelis-member:${normalizeName(name).replace(/\s+/g, "-")}`,
        name,
        originalValue,
        normalizedValue: normalizeVote(originalValue),
      };
    })
    .get();
}

function validateManifest(
  manifest: z.infer<typeof manifestSchema>,
  indexByIdentifier: Map<string, NevadaBillIndexBundle["records"][number]>,
  vetoedByIdentifier: Map<string, { billIdentifier: string; billKey: string }>,
  vetoRecords: Array<{ billIdentifier: string; billKey: string }>,
  priorCoveredIdentifiers: Set<string>,
  isLegacyReconciliation: boolean,
) {
  const entries = manifest.records;
  const expectedCount = isLegacyReconciliation ? 1 : 10;
  if (
    entries.length !== expectedCount ||
    new Set(entries.map((entry) => entry.billIdentifier)).size !== expectedCount
  ) {
    throw new Error(
      isLegacyReconciliation
        ? "The legacy reconciliation package must contain only AB83"
        : "Each enhanced-review batch must contain ten unique bills",
    );
  }
  if (isLegacyReconciliation && entries[0]?.billIdentifier !== "AB83") {
    throw new Error("Only AB83 may use the legacy reconciliation workflow");
  }
  if (
    !isLegacyReconciliation &&
    manifest.batch === 1 &&
    new Set(entries.map((entry) => entry.subjectArea)).size !== 10
  ) {
    throw new Error("The first batch must cover all ten PRD subject areas");
  }
  if (!isLegacyReconciliation && manifest.batch > 1) {
    const expectedIdentifiers = vetoRecords
      .map((record) => record.billIdentifier)
      .filter((identifier) => !priorCoveredIdentifiers.has(identifier))
      .sort(compareBillIdentifiers)
      .slice(0, 10);
    const actualIdentifiers = entries.map((entry) => entry.billIdentifier);
    if (
      JSON.stringify(actualIdentifiers) !== JSON.stringify(expectedIdentifiers)
    ) {
      throw new Error(
        `Batch ${manifest.batch} must contain the next ten unprocessed veto qualifiers in ascending bill-identifier order`,
      );
    }
  }
  for (const entry of entries) {
    const indexRecord = required(indexByIdentifier.get(entry.billIdentifier));
    const vetoRecord = required(vetoedByIdentifier.get(entry.billIdentifier));
    if (
      indexRecord.billKey !== entry.billKey ||
      vetoRecord.billKey !== entry.billKey
    ) {
      throw new Error(`${entry.billIdentifier} does not reconcile by bill key`);
    }
    if (!entry.automaticFactors.includes("governor-veto-or-override")) {
      throw new Error(`${entry.billIdentifier} is missing its veto qualifier`);
    }
  }
}

function validateCandidates(records: EnhancedBillReviewCandidate[]) {
  for (const record of records) {
    if (!record.officialDigest || record.actions.length === 0) {
      throw new Error(`${record.billIdentifier} is missing official detail`);
    }
    if (
      !record.actions.some((action) =>
        /vetoed by the governor/i.test(action.text),
      )
    ) {
      throw new Error(`${record.billIdentifier} lacks a veto action`);
    }
    if (record.votes.length === 0) {
      throw new Error(`${record.billIdentifier} has no recorded final votes`);
    }
    for (const vote of record.votes) {
      if (vote.memberVotes.length !== vote.totals.total) {
        throw new Error(
          `${vote.id} member count does not match official total`,
        );
      }
      if (!vote.memberVotes.some((member) => member.officialId)) {
        throw new Error(`${vote.id} did not reconcile any current profiles`);
      }
    }
  }
}

async function downloadSource(
  id: string,
  url: string,
): Promise<DownloadedSource> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "text/html",
          "User-Agent": "Heim-Civic-Nevada-enhanced-review-builder/1.0",
        },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error(`download failed: ${response.status}`);
      const body = await response.text();
      if (!body.trim()) throw new Error("download returned an empty body");
      return {
        id,
        organization: "Nevada Legislature (NELIS)",
        url,
        format: "html",
        body,
        sha256: createHash("sha256").update(body).digest("hex"),
        retrievedAt: new Date().toISOString(),
      };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await delay(attempt * 250);
    }
  }
  throw new Error(`${id} could not be downloaded`, { cause: lastError });
}

function toSourceRecord(source: DownloadedSource): LegislationSource {
  return {
    id: source.id,
    organization: source.organization,
    url: source.url,
    retrievedAt: source.retrievedAt,
    documentSha256: source.sha256,
    coverageLabel: isLegacyAb83Reconciliation
      ? "AB83 legacy reconciliation source package"
      : `Batch ${batchNumber} enhanced bill review source package`,
    parserVersion,
    validationState: "source-verified",
  };
}

function voteKey(value: string) {
  const key = value.match(/(\d+)$/)?.[1];
  if (!key) throw new Error("NELIS vote is missing its vote key");
  return key;
}

function countFromPanel(
  panel: ReturnType<typeof load>["root"],
  className: string,
) {
  const text = panel.find(`.${className} a`).first().text();
  const value = Number(text.match(/(\d+)\s*$/)?.[1] ?? Number.NaN);
  if (!Number.isFinite(value)) throw new Error(`Missing ${className} count`);
  return value;
}

function normalizeVote(value: string): NormalizedVoteValue {
  const normalized = value.toLowerCase().replace(/\s+/g, " ").trim();
  if (["yea", "aye", "yes"].includes(normalized)) return "yes";
  if (["nay", "no"].includes(normalized)) return "no";
  if (normalized === "present") return "present";
  if (normalized === "not voting") return "not-voting";
  if (normalized === "excused") return "excused";
  if (normalized === "absent") return "absent";
  return "unknown";
}

function toSortName(name: string) {
  const parts = name.split(/\s+/);
  return `${parts.at(-1)}, ${parts.slice(0, -1).join(" ")}`;
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9',-]+/g, " ")
    .trim();
}

function clean(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(value: string) {
  const timestamp = Date.parse(clean(value));
  if (Number.isNaN(timestamp)) return "";
  return new Date(timestamp).toISOString().slice(0, 10);
}

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("Required enhanced-review source value is missing");
  }
  return value;
}

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function compareBillIdentifiers(left: string, right: string) {
  const leftMatch = required(left.match(/^(AB|SB)(\d+)$/));
  const rightMatch = required(right.match(/^(AB|SB)(\d+)$/));
  const chamberOrder = leftMatch[1]!.localeCompare(rightMatch[1]!);
  return chamberOrder || Number(leftMatch[2]) - Number(rightMatch[2]);
}

function parseBatchArgument(arguments_: string[]) {
  if (arguments_.includes("--legacy-ab83")) return 0;
  const value = arguments_
    .find((argument) => argument.startsWith("--batch="))
    ?.slice("--batch=".length);
  const batch = value === undefined ? 1 : Number(value);
  if (!Number.isInteger(batch) || batch < 1 || batch > 3) {
    throw new Error(
      "--batch must identify configured Batch 1, Batch 2, or Batch 3",
    );
  }
  return batch;
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

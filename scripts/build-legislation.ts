import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

import type {
  BillAction,
  BillPerson,
  LegislationBundle,
  LegislationSource,
  MemberVote,
  NormalizedVoteValue,
  PilotBill,
  RecordedVote,
} from "../src/domain/legislation/types";
import type { OfficialsBundle } from "../src/domain/officials/types";

const projectRoot = process.cwd();
const parserVersion = "pilot-legislation-v1";
const manifestPath = path.join(
  projectRoot,
  "data/sources/pilot-legislation.manifest.json",
);
const officialsPath = path.join(
  projectRoot,
  "src/data/generated/current-officials.json",
);
const outputPath = path.join(
  projectRoot,
  "src/data/generated/pilot-legislation.json",
);

const sourceSchema = z.object({
  id: z.string().min(1),
  organization: z.string().min(1),
  url: z.url(),
  format: z.enum(["html", "xml"]),
});
const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  coverageLabel: z.string().min(1),
  sources: z.array(sourceSchema).length(7),
});
type SourceDefinition = z.infer<typeof sourceSchema>;
type DownloadedSource = SourceDefinition & {
  body: string;
  sha256: string;
  retrievedAt: string;
};

const xml = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
});

async function main() {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(manifestPath, "utf8")),
  );
  const officials = JSON.parse(
    await readFile(officialsPath, "utf8"),
  ) as OfficialsBundle;
  const sources = await Promise.all(manifest.sources.map(downloadSource));
  const byId = new Map(sources.map((source) => [source.id, source]));
  const officialsBySortName = new Map(
    officials.officials.map((official) => [
      normalizeName(official.sortName),
      official.id,
    ]),
  );

  const bills = [
    parseNevadaBill(byId, officialsBySortName),
    parseFederalBill(byId, officials),
  ];
  validateBills(bills);

  const generatedAt = new Date().toISOString();
  const sourceRecords = sources.map((source) => toSourceRecord(source));
  const bundle: LegislationBundle = {
    schemaVersion: 1,
    snapshotId: `phase-4-legislation:${generatedAt.slice(0, 10)}`,
    generatedAt,
    parserVersion,
    coverageLabel: manifest.coverageLabel,
    bills,
    sources: sourceRecords,
  };
  await writeFile(outputPath, `${JSON.stringify(bundle)}\n`, "utf8");
  console.info("Built verified Phase 4 legislation snapshot", {
    bills: bills.length,
    votes: bills.reduce((count, bill) => count + bill.votes.length, 0),
    linkedMemberVotes: bills.reduce(
      (count, bill) =>
        count +
        bill.votes
          .flatMap((vote) => vote.memberVotes)
          .filter((vote) => vote.officialId).length,
      0,
    ),
  });
}

function parseNevadaBill(
  sources: Map<string, DownloadedSource>,
  officialsBySortName: Map<string, string>,
): PilotBill {
  const overview = requiredSource(sources, "nv-ab83-overview");
  const voteSummary = requiredSource(sources, "nv-ab83-votes");
  const assemblyMembers = requiredSource(sources, "nv-ab83-assembly-members");
  const senateMembers = requiredSource(sources, "nv-ab83-senate-members");
  const $ = load(overview.body);
  const summary = fieldValue($, "Summary");
  const actions = $("table:has(caption:contains('Bill History')) tbody tr")
    .map((_, row) => ({
      occurredOn: parseDate($(row).find("[data-th='Date']").text()),
      text: clean($(row).find("[data-th='Action']").text()),
    }))
    .get()
    .filter((action): action is BillAction =>
      Boolean(action.occurredOn && action.text),
    );
  const people: BillPerson[] = [
    ...parseNevadaPeople(
      $,
      "#primarySponsors a",
      "sponsor",
      officialsBySortName,
    ),
    ...parseNevadaPeople($, "#cosponsors a", "cosponsor", officialsBySortName),
  ];
  const votes = parseNevadaVotes(
    voteSummary,
    [assemblyMembers, senateMembers],
    officialsBySortName,
  );
  const officialPageUrl =
    "https://www.leg.state.nv.us/App/NELIS/REL/83rd2025/Bill/AB83/Overview";
  const latest = actions.at(-1);

  return {
    id: "nv-83-2025-ab83",
    slug: "nv-83-2025-ab83",
    jurisdiction: "state",
    identifier: "AB83",
    session: "Nevada 83rd Session (2025)",
    title: summary.replace(/\s*\(BDR.*$/, ""),
    officialTitle: clean($("#title").text()),
    policyArea: "State government and observances",
    status: {
      label: "Vetoed",
      asOf: latest?.occurredOn ?? "2025-06-03",
      latestAction: latest?.text ?? "No further action taken after veto.",
    },
    officialSummary: {
      text: clean($("#digest").text()),
      attribution: "Official Nevada Legislative Counsel Bureau digest",
      sourceUrl: officialPageUrl,
      reviewState: "official-source",
    },
    committees: [
      ...new Set(
        $("[data-th='Committee'] a")
          .map((_, element) => clean($(element).text()))
          .get()
          .filter(Boolean),
      ),
    ],
    people,
    actions,
    votes,
    officialPageUrl,
    officialTextUrl:
      "https://www.leg.state.nv.us/App/NELIS/REL/83rd2025/Bill/AB83/Text",
    selectionReason:
      "A complete Nevada lifecycle with committee activity, contested floor votes, and a governor veto.",
    sources: [overview, voteSummary, assemblyMembers, senateMembers].map(
      toSourceRecord,
    ),
  };
}

function parseNevadaPeople(
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
        externalId: new URL(
          anchor.attr("href") ?? "",
          "https://www.leg.state.nv.us",
        ).toString(),
        name,
        role,
      };
    })
    .get();
}

function parseNevadaVotes(
  voteSummary: DownloadedSource,
  memberSources: DownloadedSource[],
  officialsBySortName: Map<string, string>,
): RecordedVote[] {
  const $ = load(voteSummary.body);
  return $(".vote-revision")
    .map((index, element) => {
      const panel = $(element);
      const key = (panel.attr("id") ?? "").match(/(\d+)$/)?.[1];
      if (!key) throw new Error("NELIS vote is missing its vote key");
      const chamber = clean(panel.parent().find("h2").first().text());
      const lines = panel.find(".list-group-item");
      const result = clean(lines.first().find("span").first().text());
      const occurredOn = parseDate(lines.eq(1).find("span").text());
      const total = countFromPanel(panel, "panelAllVoters");
      const source = memberSources[index];
      if (!source) throw new Error(`Missing member source for vote ${key}`);
      return {
        id: `nv-vote:${key}`,
        chamber,
        question: "Final passage",
        result,
        occurredOn,
        sourceUrl: source.url,
        memberCoverage: "all-nevada-legislators",
        totals: {
          yes: countFromPanel(panel, "panelYeaVoters"),
          no: countFromPanel(panel, "panelNayVoters"),
          present: 0,
          notVoting: countFromPanel(panel, "panelNotVotingVoters"),
          excused: countFromPanel(panel, "panelExcusedVoters"),
          absent: countFromPanel(panel, "panelAbsentVoters"),
          total,
        },
        memberVotes: parseNevadaMemberVotes(source, officialsBySortName),
      } satisfies RecordedVote;
    })
    .get();
}

function parseNevadaMemberVotes(
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

function parseFederalBill(
  sources: Map<string, DownloadedSource>,
  officials: OfficialsBundle,
): PilotBill {
  const statusSource = requiredSource(sources, "us-hr1366-status");
  const rollSources = [
    requiredSource(sources, "us-hr1366-roll357"),
    requiredSource(sources, "us-hr1366-roll358"),
  ];
  const bill = xml.parse(statusSource.body).billStatus.bill;
  const officialByBioguide = new Map(
    officials.officials.map((official) => [
      official.id.split(":").at(-1),
      official.id,
    ]),
  );
  const summaryHtml = asArray(bill.summaries?.summary).at(-1)?.text ?? "";
  const $summary = load(summaryHtml);
  const actions: BillAction[] = asArray(bill.actions?.item)
    .map((action) => ({
      occurredOn: String(action.actionDate ?? ""),
      text: clean(String(action.text ?? "")),
    }))
    .filter((action) => action.occurredOn && action.text)
    .reverse();
  const people: BillPerson[] = [
    ...parseFederalPeople(bill.sponsors?.item, "sponsor", officialByBioguide),
    ...parseFederalPeople(
      bill.cosponsors?.item,
      "cosponsor",
      officialByBioguide,
    ),
  ];
  const latest = actions.at(-1);
  const officialPageUrl = String(bill.legislationUrl);

  return {
    id: "us-119-hr1366",
    slug: "us-119-hr1366",
    jurisdiction: "federal",
    identifier: "H.R. 1366",
    session: "119th Congress",
    title: String(bill.title),
    officialTitle: String(
      asArray(bill.titles?.item).find((title) => title.titleTypeCode === 6)
        ?.title ?? bill.title,
    ),
    policyArea: String(bill.policyArea?.name ?? "Uncategorized"),
    status: {
      label: "Passed House; on Senate calendar",
      asOf: latest?.occurredOn ?? String(bill.updateDate).slice(0, 10),
      latestAction: latest?.text ?? "Status unavailable.",
    },
    officialSummary: {
      text: clean($summary.text()),
      attribution:
        "Congressional Research Service summary published by Congress.gov",
      sourceUrl: officialPageUrl,
      reviewState: "official-source",
    },
    committees: asArray(bill.committees?.item).map((committee) =>
      clean(String(committee.name)),
    ),
    people,
    actions,
    votes: rollSources.map((source) =>
      parseHouseVote(source, officialByBioguide),
    ),
    officialPageUrl,
    officialTextUrl: `${officialPageUrl}/text`,
    selectionReason:
      "A Nevada-sponsored federal bill with a Nevada cosponsor and two recorded House votes.",
    sources: [statusSource, ...rollSources].map(toSourceRecord),
  };
}

function parseFederalPeople(
  input: unknown,
  role: BillPerson["role"],
  officialByBioguide: Map<string | undefined, string>,
): BillPerson[] {
  return asArray(input).map((person) => {
    const bioguideId = String(person.bioguideId);
    return {
      officialId: officialByBioguide.get(bioguideId) ?? null,
      externalId: `us-congress:bioguide:${bioguideId}`,
      name: [person.firstName, person.middleName, person.lastName]
        .filter(Boolean)
        .join(" "),
      role,
    };
  });
}

function parseHouseVote(
  source: DownloadedSource,
  officialByBioguide: Map<string | undefined, string>,
): RecordedVote {
  const roll = xml.parse(source.body)["rollcall-vote"];
  const metadata = roll["vote-metadata"];
  const total = metadata["vote-totals"]["totals-by-vote"];
  const memberVotes = asArray(roll["vote-data"]["recorded-vote"])
    .filter((vote) => vote.legislator?.["@_state"] === "NV")
    .map((vote) => {
      const bioguideId = String(vote.legislator["@_name-id"]);
      const originalValue = String(vote.vote);
      return {
        officialId: officialByBioguide.get(bioguideId) ?? null,
        externalId: `us-congress:bioguide:${bioguideId}`,
        name: String(vote.legislator["#text"]),
        originalValue,
        normalizedValue: normalizeVote(originalValue),
      };
    });
  return {
    id: `us-house-roll:${metadata["rollcall-num"]}`,
    chamber: "U.S. House",
    question: String(metadata["vote-question"]),
    result: String(metadata["vote-result"]),
    occurredOn: parseDate(String(metadata["action-date"])),
    sourceUrl: source.url
      .replace("/evs/2025/roll", "/Votes/2025")
      .replace(".xml", ""),
    memberCoverage: "nevada-delegation-only",
    totals: {
      yes: number(total["yea-total"]),
      no: number(total["nay-total"]),
      present: number(total["present-total"]),
      notVoting: number(total["not-voting-total"]),
      excused: 0,
      absent: 0,
      total:
        number(total["yea-total"]) +
        number(total["nay-total"]) +
        number(total["present-total"]) +
        number(total["not-voting-total"]),
    },
    memberVotes,
  };
}

function validateBills(bills: PilotBill[]) {
  if (bills.length !== 2)
    throw new Error("Phase 4 requires exactly two pilot bills");
  const state = bills.find((bill) => bill.jurisdiction === "state");
  const federal = bills.find((bill) => bill.jurisdiction === "federal");
  if (!state || !federal)
    throw new Error("Phase 4 requires state and federal bills");
  if (state.votes.length !== 2 || federal.votes.length !== 2) {
    throw new Error("Expected two recorded votes for each pilot bill");
  }
  for (const vote of state.votes) {
    if (vote.memberVotes.length !== vote.totals.total) {
      throw new Error(`${vote.id} member count does not match official total`);
    }
    if (!vote.memberVotes.some((member) => member.officialId)) {
      throw new Error(`${vote.id} did not reconcile any current profiles`);
    }
  }
  for (const vote of federal.votes) {
    if (
      vote.memberVotes.length !== 4 ||
      vote.memberVotes.some((member) => !member.officialId)
    ) {
      throw new Error(`${vote.id} must link all four Nevada House members`);
    }
  }
}

async function downloadSource(
  source: SourceDefinition,
): Promise<DownloadedSource> {
  const response = await fetch(source.url, {
    cache: "no-store",
    headers: { "User-Agent": "Heim-Civic-Nevada-legislation-builder/0.1" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    throw new Error(`${source.id} download failed: ${response.status}`);
  const body = await response.text();
  return {
    ...source,
    body,
    sha256: createHash("sha256").update(body).digest("hex"),
    retrievedAt: new Date().toISOString(),
  };
}

function toSourceRecord(source: DownloadedSource): LegislationSource {
  return {
    id: source.id,
    organization: source.organization,
    url: source.url,
    retrievedAt: source.retrievedAt,
    documentSha256: source.sha256,
    coverageLabel: "Phase 4 bills and votes vertical slice",
    parserVersion,
    validationState: "source-verified",
  };
}

function requiredSource(sources: Map<string, DownloadedSource>, id: string) {
  const source = sources.get(id);
  if (!source) throw new Error(`Missing source ${id}`);
  return source;
}

function fieldValue($: ReturnType<typeof load>, label: string) {
  const row = $(".font-weight-bold")
    .filter((_, element) => clean($(element).text()) === label)
    .first()
    .parent();
  return clean(row.children(".col").first().text());
}

function countFromPanel(
  panel: ReturnType<typeof load>["root"],
  className: string,
) {
  const text = panel.find(`.${className} a`).first().text();
  return number(text.match(/(\d+)\s*$/)?.[1]);
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

function number(value: unknown) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed))
    throw new Error(`Expected a number, received ${value}`);
  return parsed;
}

function asArray<T = Record<string, unknown>>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

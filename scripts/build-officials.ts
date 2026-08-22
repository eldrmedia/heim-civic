import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

import type {
  CurrentOfficial,
  OfficePosition,
  OfficialSource,
  OfficialsBundle,
  PartyCode,
} from "../src/domain/officials/types";

const projectRoot = process.cwd();
const manifestPath = path.join(
  projectRoot,
  "data/sources/current-officials.manifest.json",
);
const outputPath = path.join(
  projectRoot,
  "src/data/generated/current-officials.json",
);

const sourceSchema = z.object({
  id: z.string().min(1),
  organization: z.string().min(1),
  url: z.url(),
  format: z.enum(["html", "xml"]),
  expectedNevadaRecords: z.number().int().positive(),
});

const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  parserVersion: z.string().min(1),
  sources: z.array(sourceSchema).length(6),
});

type SourceDefinition = z.infer<typeof sourceSchema>;
type DownloadedSource = SourceDefinition & {
  body: string;
  sha256: string;
  retrievedAt: string;
};

type StateRosterRecord = {
  chamber: "state-senate" | "state-assembly";
  districtType: "state-senate" | "state-assembly";
  districtNumber: string;
  sourcePersonId: string;
  sortName: string;
  name: string;
  party: CurrentOfficial["party"];
  counties: string;
  leadershipTitle: string | null;
  termEndYear: string;
  email: string | null;
  phone: string | null;
  imageUrl: string;
  profileUrl: string;
  rosterSource: DownloadedSource;
};

type SenateContactRecord = {
  first_name: string;
  last_name: string;
  party: string;
  state: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  class: string;
  bioguide_id: string;
  leadership_position?: string;
};

type SenateCommitteeRecord =
  string | { "#text": string; "@_position"?: string };

type SenateDetailRecord = {
  "@_lis_member_id": string;
  state: string;
  bioguideId: string;
  committees?: { committee?: SenateCommitteeRecord | SenateCommitteeRecord[] };
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
});

async function main() {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(manifestPath, "utf8")),
  );
  const downloaded = await Promise.all(manifest.sources.map(downloadSource));
  const byId = new Map(downloaded.map((source) => [source.id, source]));

  const assemblySource = requiredSource(byId, "nv-lcb-assembly-current");
  const stateSenateSource = requiredSource(byId, "nv-lcb-senate-current");
  const stateRoster = [
    ...parseStateRoster(assemblySource, "state-assembly"),
    ...parseStateRoster(stateSenateSource, "state-senate"),
  ];
  const stateOfficials = await mapWithConcurrency(
    stateRoster,
    6,
    enrichStateOfficial,
  );

  const houseOfficials = parseHouseOfficials(
    requiredSource(byId, "us-house-clerk-current"),
    requiredSource(byId, "us-house-directory-current"),
    manifest.parserVersion,
  );
  const senateOfficials = parseSenateOfficials(
    requiredSource(byId, "us-senate-contact-current"),
    requiredSource(byId, "us-senate-detail-current"),
    manifest.parserVersion,
  );
  const officials = [...stateOfficials, ...houseOfficials, ...senateOfficials];
  const positions = officials.map(toPosition);

  validateSnapshot(officials, positions);

  const generatedAt = new Date().toISOString();
  const bundle: OfficialsBundle = {
    schemaVersion: 1,
    snapshotId: `nv-current-officials:${generatedAt.slice(0, 10)}`,
    generatedAt,
    parserVersion: manifest.parserVersion,
    jurisdiction: "Nevada",
    sources: downloaded.map((source) => ({
      id: source.id,
      organization: source.organization,
      url: source.url,
      documentSha256: source.sha256,
      retrievedAt: source.retrievedAt,
    })),
    officials: officials.sort(compareOfficials),
    positions: positions.sort((left, right) => left.id.localeCompare(right.id)),
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(bundle)}\n`, "utf8");

  console.info("Built verified current-official snapshot", {
    officials: officials.length,
    positions: positions.length,
    stateAssembly: countChamber(officials, "state-assembly"),
    stateSenate: countChamber(officials, "state-senate"),
    usHouse: countChamber(officials, "us-house"),
    usSenate: countChamber(officials, "us-senate"),
  });
}

async function downloadSource(
  source: SourceDefinition,
): Promise<DownloadedSource> {
  const response = await fetch(source.url, {
    cache: "no-store",
    headers: { "User-Agent": "Heim-Civic-Nevada-official-roster-builder/0.1" },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(
      `Roster download failed for ${source.id}: HTTP ${response.status}`,
    );
  }

  const body = await response.text();
  return {
    ...source,
    body,
    sha256: sha256(body),
    retrievedAt: new Date().toISOString(),
  };
}

function parseStateRoster(
  source: DownloadedSource,
  chamber: StateRosterRecord["chamber"],
): StateRosterRecord[] {
  const $ = load(source.body);
  const records: StateRosterRecord[] = [];

  $("tr.listRow").each((_, row) => {
    const cells = $(row).find("td");
    const details = $(row).next("tr");
    const sortName = normalizeText(cells.eq(1).attr("data-order"));
    const districtNumber = digits(cells.eq(3).attr("data-order"));
    const profilePath = cells.eq(0).find("a").attr("href");
    const rosterImage = cells.eq(0).find("img").attr("src");
    const sourcePersonId = rosterImage?.match(/\.(\d+)\.Thumb\./)?.[1];
    const termEndYear = fieldValue($, details, "Term Ends:");

    if (
      !sortName ||
      !districtNumber ||
      !profilePath ||
      !rosterImage ||
      !sourcePersonId ||
      !/^20\d{2}$/.test(termEndYear)
    ) {
      throw new Error(`Unexpected ${source.id} roster row schema`);
    }

    const fullNameCell = normalizeText(cells.eq(1).text());
    const leadershipTitle =
      normalizeText(fullNameCell.replace(sortName, "")) || null;
    const emailHash = details
      .find("[data-cfemail]")
      .first()
      .attr("data-cfemail");

    records.push({
      chamber,
      districtType: chamber,
      districtNumber,
      sourcePersonId,
      sortName,
      name: displayNameFromSortName(sortName),
      party: normalizeParty(cells.eq(2).attr("data-order")),
      counties: normalizeText(cells.eq(4).attr("data-order")),
      leadershipTitle,
      termEndYear,
      email: emailHash ? decodeCloudflareEmail(emailHash) : null,
      phone: fieldValue($, details, "Carson City Phone:") || null,
      imageUrl: rosterImage.replace(".Thumb.jpg", ".jpg"),
      profileUrl: new URL(profilePath, source.url).toString(),
      rosterSource: source,
    });
  });

  if (records.length !== source.expectedNevadaRecords) {
    throw new Error(
      `${source.id} expected ${source.expectedNevadaRecords} Nevada records; received ${records.length}`,
    );
  }

  return records;
}

async function enrichStateOfficial(
  record: StateRosterRecord,
): Promise<CurrentOfficial> {
  const response = await fetch(record.profileUrl, {
    cache: "no-store",
    headers: { "User-Agent": "Heim-Civic-Nevada-official-roster-builder/0.1" },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(
      `State profile download failed for ${record.sourcePersonId}: HTTP ${response.status}`,
    );
  }

  const body = await response.text();
  const retrievedAt = new Date().toISOString();
  const $ = load(body);
  const profileName = normalizeText($("h3").first().text()).replace(
    /^(?:Assemblywoman|Assemblyman|Assemblymember|Senator)\s+/,
    "",
  );
  const committees = $("#committeesTab li a")
    .toArray()
    .map((link) => ({
      name: normalizeText($(link).text()),
      role: null,
      sourceUrl: new URL(
        $(link).attr("href") ?? record.profileUrl,
        record.profileUrl,
      ).toString(),
    }))
    .filter((committee) => committee.name.length > 0);

  if (!profileName) {
    throw new Error(`Missing profile name for ${record.sourcePersonId}`);
  }

  const rosterSource = officialSource(
    record.rosterSource,
    `${record.chamber}:${record.districtNumber}`,
    `Current roster; term ends ${record.termEndYear}`,
  );
  const profileSource: OfficialSource = {
    organization: "Nevada Legislature",
    sourceUrl: record.profileUrl,
    externalId: `nv-lcb:legislator:${record.sourcePersonId}`,
    retrievedAt,
    coverageLabel: "Current official profile",
    documentSha256: sha256(body),
    parserVersion: "official-roster-v1",
    validationState: "source-verified",
  };

  return {
    id: `nv-lcb:legislator:${record.sourcePersonId}`,
    slug: `nv-lcb-${record.sourcePersonId}`,
    name: profileName,
    sortName: record.sortName,
    imageUrl: record.imageUrl,
    party: record.party,
    office: {
      jurisdiction: "state",
      chamber: record.chamber,
      title:
        record.chamber === "state-senate"
          ? "Nevada State Senator"
          : "Nevada State Assembly Member",
      districtNumber: record.districtNumber,
      districtLabel:
        record.chamber === "state-senate"
          ? `Nevada Senate District ${record.districtNumber}`
          : `Nevada Assembly District ${record.districtNumber}`,
      leadershipTitle: record.leadershipTitle,
    },
    term: {
      label: `Term ends ${record.termEndYear}`,
      startsOn: null,
      endsOn: null,
    },
    contact: {
      officialWebsite: record.profileUrl,
      contactUrl: record.email ? `mailto:${record.email}` : record.profileUrl,
      email: record.email,
      phone: record.phone,
      officeAddress: "401 South Carson Street, Carson City, NV 89701-4747",
    },
    committees,
    sources: [rosterSource, profileSource],
  };
}

function parseHouseOfficials(
  clerkSource: DownloadedSource,
  directorySource: DownloadedSource,
  parserVersion: string,
): CurrentOfficial[] {
  const clerk$ = load(clerkSource.body);
  const directory$ = load(directorySource.body);
  const directoryByDistrict = new Map<
    string,
    {
      website: string;
      phone: string | null;
      office: string | null;
      committees: string[];
    }
  >();

  directory$("caption#state-nevada")
    .closest("table")
    .find("tbody tr")
    .each((_, row) => {
      const cells = directory$(row).find("td");
      const district = digits(cells.eq(0).text());
      const website = cells.eq(1).find("a").attr("href");
      if (!district || !website) return;

      directoryByDistrict.set(district, {
        website,
        office: normalizeText(cells.eq(3).text()) || null,
        phone: normalizeText(cells.eq(4).text()) || null,
        committees: normalizeText(cells.eq(5).text())
          .split("|")
          .map(normalizeText)
          .filter(Boolean),
      });
    });

  const officials: CurrentOfficial[] = [];
  clerk$("a.members-link").each((_, link) => {
    const row = clerk$(link).closest("tr");
    const cells = row.find("td");
    if (!normalizeText(cells.eq(2).text()).includes("Nevada (NV)")) return;

    const districtNumber = digits(cells.eq(3).text());
    const bioguideId = clerk$(link)
      .attr("href")
      ?.split("/")
      .filter(Boolean)
      .at(-1);
    const sortName = normalizeText(
      clerk$(link).find("span[data-name]").first().text(),
    );
    const directory = directoryByDistrict.get(districtNumber);

    if (!districtNumber || !bioguideId || !sortName || !directory) {
      throw new Error("Unexpected U.S. House Nevada member schema");
    }

    const profileUrl = new URL(
      `/Members/${bioguideId}`,
      clerkSource.url,
    ).toString();
    officials.push({
      id: `us-congress:bioguide:${bioguideId}`,
      slug: `us-congress-${bioguideId.toLowerCase()}`,
      name: displayNameFromSortName(sortName),
      sortName,
      imageUrl: `https://bioguide.congress.gov/bioguide/photo/${bioguideId[0]}/${bioguideId}.jpg`,
      party: normalizeParty(cells.eq(1).text()),
      office: {
        jurisdiction: "federal",
        chamber: "us-house",
        title: "U.S. Representative",
        districtNumber,
        districtLabel: `Nevada Congressional District ${districtNumber}`,
        leadershipTitle: null,
      },
      term: {
        label: "119th Congress (2025–2027)",
        startsOn: "2025-01-03",
        endsOn: "2027-01-02",
      },
      contact: {
        officialWebsite: directory.website,
        contactUrl: directory.website,
        email: null,
        phone: directory.phone,
        officeAddress: directory.office
          ? `${directory.office}, Washington, DC 20515`
          : null,
      },
      committees: directory.committees.map((name) => ({
        name,
        role: null,
        sourceUrl: directorySource.url,
      })),
      sources: [
        officialSource(
          clerkSource,
          `us-congress:bioguide:${bioguideId}`,
          "Current members of the 119th Congress",
          parserVersion,
          profileUrl,
        ),
        officialSource(
          directorySource,
          `us-house:nv:${districtNumber}`,
          "Current House directory and committee assignments",
          parserVersion,
        ),
      ],
    });
  });

  if (
    officials.length !== clerkSource.expectedNevadaRecords ||
    directoryByDistrict.size !== directorySource.expectedNevadaRecords
  ) {
    throw new Error("U.S. House Nevada roster count changed; review required");
  }

  return officials;
}

function parseSenateOfficials(
  contactSource: DownloadedSource,
  detailSource: DownloadedSource,
  parserVersion: string,
): CurrentOfficial[] {
  const contactDocument = xmlParser.parse(contactSource.body) as {
    contact_information: {
      member: SenateContactRecord | SenateContactRecord[];
    };
  };
  const detailDocument = xmlParser.parse(detailSource.body) as {
    senators: { senator: SenateDetailRecord | SenateDetailRecord[] };
  };
  const contacts = asArray(contactDocument.contact_information.member).filter(
    (member) => member.state === "NV",
  );
  const details = asArray(detailDocument.senators.senator).filter(
    (member) => member.state === "NV",
  );
  const detailsByBioguide = new Map(
    details.map((member) => [String(member.bioguideId), member]),
  );

  if (
    contacts.length !== contactSource.expectedNevadaRecords ||
    details.length !== detailSource.expectedNevadaRecords
  ) {
    throw new Error("U.S. Senate Nevada roster count changed; review required");
  }

  return contacts.map((contact) => {
    const bioguideId = String(contact.bioguide_id);
    const detail = detailsByBioguide.get(bioguideId);
    const seatClass = String(contact.class);

    if (!detail) {
      throw new Error(`Missing Senate detail record for ${bioguideId}`);
    }

    const committees = asArray(detail.committees?.committee);
    const name = normalizeText(`${contact.first_name} ${contact.last_name}`);

    return {
      id: `us-congress:bioguide:${bioguideId}`,
      slug: `us-congress-${bioguideId.toLowerCase()}`,
      name,
      sortName: `${contact.last_name}, ${contact.first_name}`,
      imageUrl: `https://bioguide.congress.gov/bioguide/photo/${bioguideId[0]}/${bioguideId}.jpg`,
      party: normalizeParty(contact.party),
      office: {
        jurisdiction: "federal",
        chamber: "us-senate",
        title: "U.S. Senator",
        districtNumber: null,
        districtLabel: `Nevada statewide · ${seatClass}`,
        leadershipTitle: contact.leadership_position
          ? String(contact.leadership_position)
          : null,
      },
      term: { label: seatClass, startsOn: null, endsOn: null },
      contact: {
        officialWebsite: String(contact.website),
        contactUrl: String(contact.email),
        email: null,
        phone: String(contact.phone),
        officeAddress: String(contact.address),
      },
      committees: committees.map((committee) => ({
        name: normalizeText(
          typeof committee === "string" ? committee : committee["#text"],
        ),
        role:
          typeof committee === "object" && committee["@_position"]
            ? String(committee["@_position"])
            : null,
        sourceUrl: detailSource.url,
      })),
      sources: [
        officialSource(
          contactSource,
          `us-congress:bioguide:${bioguideId}`,
          "Current senators of the 119th Congress",
          parserVersion,
        ),
        officialSource(
          detailSource,
          `us-senate:lis:${String(detail["@_lis_member_id"])}`,
          "Current Senate information and committee assignments",
          parserVersion,
        ),
      ],
    } satisfies CurrentOfficial;
  });
}

function toPosition(official: CurrentOfficial): OfficePosition {
  const chamber = official.office.chamber;
  const districtType =
    chamber === "us-house"
      ? "congressional"
      : chamber === "state-senate"
        ? "state-senate"
        : chamber === "state-assembly"
          ? "state-assembly"
          : null;
  const seatClass = chamber === "us-senate" ? official.term.label : null;
  const positionId =
    chamber === "us-senate"
      ? `us-senate:nv:${seatClass?.toLowerCase().replace(/\s+/g, "-")}`
      : `${chamber}:nv:${official.office.districtNumber}`;

  return {
    id: positionId,
    jurisdiction: official.office.jurisdiction,
    chamber,
    districtType,
    districtNumber: official.office.districtNumber,
    seatClass,
    status: "occupied",
    currentOfficialId: official.id,
    statusNote: null,
    sourceUrl:
      official.sources[0]?.sourceUrl ?? official.contact.officialWebsite,
    lastVerifiedAt:
      official.sources[0]?.retrievedAt ?? new Date().toISOString(),
  };
}

function validateSnapshot(
  officials: CurrentOfficial[],
  positions: OfficePosition[],
) {
  if (officials.length !== 69 || positions.length !== 69) {
    throw new Error(
      `Expected 69 occupied Nevada legislative offices; received ${officials.length}`,
    );
  }

  const uniqueOfficialIds = new Set(officials.map((official) => official.id));
  const uniqueSlugs = new Set(officials.map((official) => official.slug));
  const uniquePositionIds = new Set(positions.map((position) => position.id));
  if (
    uniqueOfficialIds.size !== officials.length ||
    uniqueSlugs.size !== officials.length ||
    uniquePositionIds.size !== positions.length
  ) {
    throw new Error("Official snapshot contains duplicate identifiers");
  }

  assertDistrictSequence(officials, "us-house", 4);
  assertDistrictSequence(officials, "state-senate", 21);
  assertDistrictSequence(officials, "state-assembly", 42);

  for (const official of officials) {
    if (!official.name || official.sources.length === 0) {
      throw new Error(
        `Official ${official.id} is missing identity or provenance`,
      );
    }
  }
}

function assertDistrictSequence(
  officials: CurrentOfficial[],
  chamber: CurrentOfficial["office"]["chamber"],
  expectedCount: number,
) {
  const actual = officials
    .filter((official) => official.office.chamber === chamber)
    .map((official) => Number(official.office.districtNumber))
    .sort((left, right) => left - right);
  const expected = Array.from(
    { length: expectedCount },
    (_, index) => index + 1,
  );

  if (actual.join(",") !== expected.join(",")) {
    throw new Error(`${chamber} district sequence changed; review required`);
  }
}

function officialSource(
  source: DownloadedSource,
  externalId: string,
  coverageLabel: string,
  parserVersion = "official-roster-v1",
  sourceUrl = source.url,
): OfficialSource {
  return {
    organization: source.organization,
    sourceUrl,
    externalId,
    retrievedAt: source.retrievedAt,
    coverageLabel,
    documentSha256: source.sha256,
    parserVersion,
    validationState: "source-verified",
  };
}

function normalizeParty(value: unknown): CurrentOfficial["party"] {
  const normalized = normalizeText(value).toLowerCase();
  const parties: Record<string, { code: PartyCode; label: string }> = {
    d: { code: "D", label: "Democratic" },
    democrat: { code: "D", label: "Democratic" },
    democratic: { code: "D", label: "Democratic" },
    r: { code: "R", label: "Republican" },
    republican: { code: "R", label: "Republican" },
    i: { code: "I", label: "Independent" },
    independent: { code: "I", label: "Independent" },
    nonpartisan: { code: "NP", label: "Nonpartisan" },
  };

  return parties[normalized] ?? { code: "U", label: "Unknown" };
}

function displayNameFromSortName(sortName: string) {
  const [lastName = "", givenNames = "", suffix = ""] = sortName
    .split(",")
    .map(normalizeText);
  return normalizeText(
    `${givenNames} ${lastName}${suffix ? `, ${suffix}` : ""}`,
  );
}

function fieldValue(
  $: ReturnType<typeof load>,
  row: ReturnType<ReturnType<typeof load>>,
  label: string,
) {
  const fieldName = row
    .find(".fieldName")
    .filter((_, element) => normalizeText($(element).text()) === label)
    .first();
  return normalizeText(fieldName.next(".field").text());
}

function decodeCloudflareEmail(encoded: string) {
  const key = Number.parseInt(encoded.slice(0, 2), 16);
  let email = "";
  for (let index = 2; index < encoded.length; index += 2) {
    email += String.fromCharCode(
      Number.parseInt(encoded.slice(index, index + 2), 16) ^ key,
    );
  }
  return email;
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const value = values[currentIndex];
      if (value !== undefined) results[currentIndex] = await mapper(value);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, worker),
  );
  return results;
}

function requiredSource(
  sources: Map<string, DownloadedSource>,
  id: string,
): DownloadedSource {
  const source = sources.get(id);
  if (!source) throw new Error(`Missing source definition ${id}`);
  return source;
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function digits(value: unknown) {
  return normalizeText(value).match(/\d+/)?.[0] ?? "";
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function compareOfficials(left: CurrentOfficial, right: CurrentOfficial) {
  return (
    left.office.chamber.localeCompare(right.office.chamber) ||
    Number(left.office.districtNumber ?? 0) -
      Number(right.office.districtNumber ?? 0) ||
    left.sortName.localeCompare(right.sortName)
  );
}

function countChamber(
  officials: CurrentOfficial[],
  chamber: CurrentOfficial["office"]["chamber"],
) {
  return officials.filter((official) => official.office.chamber === chamber)
    .length;
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Official roster build failed",
  );
  process.exitCode = 1;
});

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import type {
  CampaignFinanceSummary,
  FinanceBundle,
  FinanceSource,
} from "../src/domain/finance/types";
import type { OfficialsBundle } from "../src/domain/officials/types";

const projectRoot = process.cwd();
const parserVersion = "fec-candidate-totals-v1";
const apiBaseUrl = "https://api.open.fec.gov/v1";
const manifestPath = path.join(
  projectRoot,
  "data/sources/pilot-finance.manifest.json",
);
const officialsPath = path.join(
  projectRoot,
  "src/data/generated/current-officials.json",
);
const outputPath = path.join(
  projectRoot,
  "src/data/generated/pilot-finance.json",
);

const recordSchema = z.object({
  officialId: z.string().min(1),
  candidateId: z.string().regex(/^H\d[A-Z]{2}\d{5}$/),
  expectedCommitteeId: z.string().regex(/^C\d{8}$/),
  candidatePageUrl: z.url(),
});
const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  cycle: z.number().int().positive(),
  coverageLabel: z.string().min(1),
  records: z.array(recordSchema).length(2),
});
type RecordDefinition = z.infer<typeof recordSchema>;

const totalsSchema = z.object({
  candidate_id: z.string(),
  candidate_election_year: z.number(),
  election_full: z.literal(true),
  coverage_start_date: z.string(),
  coverage_end_date: z.string(),
  last_report_type_full: z.string(),
  last_report_year: z.number(),
  receipts: z.number(),
  contributions: z.number(),
  individual_contributions: z.number(),
  individual_itemized_contributions: z.number(),
  individual_unitemized_contributions: z.number(),
  political_party_committee_contributions: z.number(),
  other_political_committee_contributions: z.number(),
  candidate_contribution: z.number(),
  transfers_from_other_authorized_committee: z.number(),
  loans: z.number(),
  offsets_to_operating_expenditures: z.number(),
  other_receipts: z.number(),
  disbursements: z.number(),
  operating_expenditures: z.number(),
  contribution_refunds: z.number(),
  transfers_to_other_authorized_committee: z.number(),
  loan_repayments: z.number(),
  other_disbursements: z.number(),
  last_cash_on_hand_end_period: z.number(),
  last_debts_owed_by_committee: z.number(),
  last_debts_owed_to_committee: z.number(),
});
const committeeSchema = z.object({
  committee_id: z.string(),
  candidate_ids: z.array(z.string()),
  name: z.string(),
  designation: z.literal("P"),
  designation_full: z.literal("Principal campaign committee"),
  committee_type_full: z.string(),
  state: z.literal("NV"),
});
const apiResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({ results: z.array(itemSchema).length(1) });

type DownloadedSource = {
  id: string;
  url: string;
  publicRecordUrl: string;
  body: string;
  retrievedAt: string;
  sha256: string;
};

async function main() {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(manifestPath, "utf8")),
  );
  const officials = JSON.parse(
    await readFile(officialsPath, "utf8"),
  ) as OfficialsBundle;
  const officialsById = new Map(
    officials.officials.map((official) => [official.id, official]),
  );

  const built = await Promise.all(
    manifest.records.map(async (definition) => {
      const official = officialsById.get(definition.officialId);
      if (!official)
        throw new Error(`Unknown current official ${definition.officialId}`);
      if (official.office.chamber !== "us-house") {
        throw new Error(
          `${definition.officialId} is not a current U.S. House member`,
        );
      }

      const totalsPath = `/candidate/${definition.candidateId}/totals/?cycle=${manifest.cycle}&election_full=true`;
      const committeesPath = `/candidate/${definition.candidateId}/committees/?cycle=${manifest.cycle}&designation=P`;
      const [totalsSource, committeeSource] = await Promise.all([
        downloadSource(
          `${definition.candidateId.toLowerCase()}-totals`,
          totalsPath,
          definition.candidatePageUrl,
        ),
        downloadSource(
          `${definition.candidateId.toLowerCase()}-committee`,
          committeesPath,
          definition.candidatePageUrl,
        ),
      ]);
      const totals = apiResponseSchema(totalsSchema).parse(
        JSON.parse(totalsSource.body),
      ).results[0];
      const committee = apiResponseSchema(committeeSchema).parse(
        JSON.parse(committeeSource.body),
      ).results[0];

      if (!totals || !committee)
        throw new Error("FEC response passed without a record");
      validateRecord(definition, totals, committee, manifest.cycle);

      const sources = [totalsSource, committeeSource].map((source) =>
        toSourceRecord(source, manifest.coverageLabel),
      );
      const record: CampaignFinanceSummary = {
        id: `fec:${definition.candidateId}:${manifest.cycle}`,
        slug: `fec-${definition.candidateId.toLowerCase()}-${manifest.cycle}`,
        officialId: definition.officialId,
        jurisdiction: "federal",
        candidate: {
          id: definition.candidateId,
          name: official.name,
          electionYear: manifest.cycle,
          officeLabel: official.office.districtLabel,
        },
        committee: {
          id: committee.committee_id,
          name: committee.name,
          designation: committee.designation_full,
        },
        reportingPeriod: {
          startsOn: toDate(totals.coverage_start_date),
          endsOn: toDate(totals.coverage_end_date),
          lastReportType: totals.last_report_type_full,
          lastReportYear: totals.last_report_year,
        },
        receipts: {
          total: totals.receipts,
          contributions: totals.contributions,
          individual: totals.individual_contributions,
          itemizedIndividual: totals.individual_itemized_contributions,
          unitemizedIndividual: totals.individual_unitemized_contributions,
          partyCommittees: totals.political_party_committee_contributions,
          otherPoliticalCommittees:
            totals.other_political_committee_contributions,
          candidateSelfFunding: totals.candidate_contribution,
          transfersFromAuthorizedCommittees:
            totals.transfers_from_other_authorized_committee,
          loans: totals.loans,
          offsetsToOperatingExpenditures:
            totals.offsets_to_operating_expenditures,
          other: totals.other_receipts,
        },
        spending: {
          total: totals.disbursements,
          operating: totals.operating_expenditures,
          contributionRefunds: totals.contribution_refunds,
          transfersToAuthorizedCommittees:
            totals.transfers_to_other_authorized_committee,
          loanRepayments: totals.loan_repayments,
          other: totals.other_disbursements,
        },
        cash: {
          onHand: totals.last_cash_on_hand_end_period,
          debtsOwedByCommittee: totals.last_debts_owed_by_committee,
          debtsOwedToCommittee: totals.last_debts_owed_to_committee,
        },
        outsideSpending: {
          coverage: "not-included",
          explanation:
            "Independent expenditures, electioneering communications, and party spending are not included in these candidate-authorized committee totals.",
        },
        scopeNote:
          "Federal candidate-authorized committee aggregates for the 2025–2026 election cycle. Nevada state campaign-finance records are not included in this pilot.",
        sources,
      };
      return { record, sources };
    }),
  );

  const generatedAt = new Date().toISOString();
  const bundle: FinanceBundle = {
    schemaVersion: 1,
    snapshotId: `phase-5-federal-finance:${generatedAt.slice(0, 10)}`,
    generatedAt,
    parserVersion,
    coverageLabel: manifest.coverageLabel,
    records: built.map(({ record }) => record),
    sources: built.flatMap(({ sources }) => sources),
  };
  await writeFile(outputPath, `${JSON.stringify(bundle)}\n`, "utf8");
  console.info("Built verified Phase 5 federal finance snapshot", {
    records: bundle.records.length,
    sources: bundle.sources.length,
    coverageEndDates: bundle.records.map(
      (record) => record.reportingPeriod.endsOn,
    ),
  });
}

async function downloadSource(
  id: string,
  apiPath: string,
  publicRecordUrl: string,
): Promise<DownloadedSource> {
  const apiKey = process.env.FEC_API_KEY || "DEMO_KEY";
  const separator = apiPath.includes("?") ? "&" : "?";
  const requestUrl = `${apiBaseUrl}${apiPath}${separator}api_key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(requestUrl, {
    cache: "no-store",
    headers: { "User-Agent": "Heim-Civic-Nevada-finance-builder/0.1" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok)
    throw new Error(`${id} download failed: ${response.status}`);
  const body = await response.text();
  return {
    id,
    url: `${apiBaseUrl}${apiPath}`,
    publicRecordUrl,
    body,
    retrievedAt: new Date().toISOString(),
    sha256: createHash("sha256").update(body).digest("hex"),
  };
}

function validateRecord(
  definition: RecordDefinition,
  totals: z.infer<typeof totalsSchema>,
  committee: z.infer<typeof committeeSchema>,
  cycle: number,
) {
  if (totals.candidate_id !== definition.candidateId) {
    throw new Error(`Candidate mismatch for ${definition.candidateId}`);
  }
  if (totals.candidate_election_year !== cycle) {
    throw new Error(`Unexpected election year for ${definition.candidateId}`);
  }
  if (
    committee.committee_id !== definition.expectedCommitteeId ||
    !committee.candidate_ids.includes(definition.candidateId)
  ) {
    throw new Error(
      `Principal committee mismatch for ${definition.candidateId}`,
    );
  }
  const amounts = [
    totals.receipts,
    totals.contributions,
    totals.individual_contributions,
    totals.individual_itemized_contributions,
    totals.individual_unitemized_contributions,
    totals.disbursements,
    totals.last_cash_on_hand_end_period,
    totals.last_debts_owed_by_committee,
  ];
  if (amounts.some((amount) => !Number.isFinite(amount) || amount < 0)) {
    throw new Error(`Invalid aggregate amount for ${definition.candidateId}`);
  }
  assertCurrencyEqual(
    totals.individual_contributions,
    totals.individual_itemized_contributions +
      totals.individual_unitemized_contributions,
    `${definition.candidateId} individual contribution categories`,
  );
  assertCurrencyEqual(
    totals.contributions,
    totals.individual_contributions +
      totals.political_party_committee_contributions +
      totals.other_political_committee_contributions +
      totals.candidate_contribution,
    `${definition.candidateId} contribution categories`,
  );
  assertCurrencyEqual(
    totals.receipts,
    totals.contributions +
      totals.transfers_from_other_authorized_committee +
      totals.loans +
      totals.offsets_to_operating_expenditures +
      totals.other_receipts,
    `${definition.candidateId} receipt categories`,
  );
  assertCurrencyEqual(
    totals.disbursements,
    totals.operating_expenditures +
      totals.contribution_refunds +
      totals.transfers_to_other_authorized_committee +
      totals.loan_repayments +
      totals.other_disbursements,
    `${definition.candidateId} spending categories`,
  );
}

function assertCurrencyEqual(left: number, right: number, label: string) {
  if (Math.round(left * 100) !== Math.round(right * 100)) {
    throw new Error(`${label} do not reconcile: ${left} versus ${right}`);
  }
}

function toSourceRecord(
  source: DownloadedSource,
  coverageLabel: string,
): FinanceSource {
  return {
    id: source.id,
    organization: "Federal Election Commission",
    url: source.url,
    publicRecordUrl: source.publicRecordUrl,
    retrievedAt: source.retrievedAt,
    documentSha256: source.sha256,
    coverageLabel,
    parserVersion,
    validationState: "source-verified",
  };
}

function toDate(value: string) {
  return value.slice(0, 10);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

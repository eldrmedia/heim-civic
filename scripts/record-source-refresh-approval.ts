import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Assessment = {
  humanDecisionState: "pending" | "approved";
  records: Array<{
    billIdentifier: string;
    candidateFingerprint: string;
  }>;
  humanDecision?: {
    reviewer: { name: string; role: string };
    reviewedAt: string;
    decisionLedgers: string[];
  };
};

type ReviewPackets = {
  sourceSnapshotId: string;
  records: Array<{
    billIdentifier: string;
    candidateFingerprint: string;
  }>;
};

type DecisionLedger = {
  schemaVersion: 1;
  sourceSnapshotId: string;
  decisions: Array<{
    billIdentifier: string;
    candidateFingerprint: string;
    decision: "approved" | "rejected";
    reviewer: { name: string; role: string };
    reviewedAt: string;
    uncertaintyNotes: string[];
  }>;
};

const projectRoot = process.cwd();
const assessmentPath = path.join(
  projectRoot,
  "data/review/phase-9-7-source-refresh-readiness-2026-09-08.json",
);
const inputs = [
  [
    "data/review/generated/enhanced-bill-review-packets.json",
    "data/review/enhanced-bill-editorial-decisions.json",
  ],
  [
    "data/review/generated/enhanced-bill-review-packets-batch-2.json",
    "data/review/enhanced-bill-editorial-decisions-batch-2.json",
  ],
  [
    "data/review/generated/enhanced-bill-review-packets-batch-3.json",
    "data/review/enhanced-bill-editorial-decisions-batch-3.json",
  ],
  [
    "data/review/generated/enhanced-bill-review-packets-legacy-ab83.json",
    "data/review/enhanced-bill-editorial-decisions-legacy-ab83.json",
  ],
] as const;

const reviewerName = argument("--reviewer-name");
const reviewerRole = argument("--reviewer-role");
const reviewedAt = argument("--reviewed-at");

if (!reviewerName || !reviewerRole || !reviewedAt) {
  throw new Error(
    "Provide --reviewer-name, --reviewer-role, and --reviewed-at after explicit human approval.",
  );
}
if (new Date(reviewedAt).toISOString() !== reviewedAt) {
  throw new Error("--reviewed-at must be a canonical UTC ISO timestamp.");
}

const assessment = await readJson<Assessment>(assessmentPath);
if (assessment.humanDecisionState !== "pending") {
  throw new Error("The source-refresh assessment is not awaiting a decision.");
}
if (assessment.records.length !== 31) {
  throw new Error("The source-refresh approval must bind exactly 31 records.");
}

const assessmentFingerprints = new Map(
  assessment.records.map((record) => [
    record.billIdentifier,
    record.candidateFingerprint,
  ]),
);
const decisionLedgers: string[] = [];
let updatedDecisions = 0;

for (const [packetRelativePath, ledgerRelativePath] of inputs) {
  const packetPath = path.join(projectRoot, packetRelativePath);
  const ledgerPath = path.join(projectRoot, ledgerRelativePath);
  const packets = await readJson<ReviewPackets>(packetPath);
  const ledger = await readJson<DecisionLedger>(ledgerPath);

  if (packets.records.length !== ledger.decisions.length) {
    throw new Error(`${ledgerRelativePath} does not cover its review packet.`);
  }

  for (const decision of ledger.decisions) {
    const packet = packets.records.find(
      (record) => record.billIdentifier === decision.billIdentifier,
    );
    const assessedFingerprint = assessmentFingerprints.get(
      decision.billIdentifier,
    );
    if (
      decision.decision !== "approved" ||
      !packet ||
      !assessedFingerprint ||
      packet.candidateFingerprint !== assessedFingerprint
    ) {
      throw new Error(
        `${decision.billIdentifier} is not bound to the accepted refresh assessment.`,
      );
    }

    decision.candidateFingerprint = packet.candidateFingerprint;
    decision.reviewer = { name: reviewerName, role: reviewerRole };
    decision.reviewedAt = reviewedAt;
    updatedDecisions += 1;
  }

  ledger.sourceSnapshotId = packets.sourceSnapshotId;
  await writeJson(ledgerPath, ledger);
  decisionLedgers.push(ledgerRelativePath);
}

if (updatedDecisions !== assessment.records.length) {
  throw new Error(
    "Not every assessed record was written to a decision ledger.",
  );
}

assessment.humanDecisionState = "approved";
assessment.humanDecision = {
  reviewer: { name: reviewerName, role: reviewerRole },
  reviewedAt,
  decisionLedgers,
};
await writeJson(assessmentPath, assessment);

console.info("Recorded the accepted Phase 9.7 source-refresh decision", {
  updatedDecisions,
  reviewerName,
  reviewerRole,
  reviewedAt,
});

function argument(name: string) {
  const value = process.argv.find((item) => item.startsWith(`${name}=`));
  return value?.slice(name.length + 1).trim() ?? "";
}

async function readJson<T>(filePath: string) {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

import { z } from "zod";

import {
  evaluateSourceHealth,
  type SourceHealthInput,
} from "@/domain/status/source-health";

export const launchEvidenceCheckIds = [
  "production-seo-verification",
  "monitoring-alert-drill",
  "offsite-restore-exercise",
  "correction-lifecycle-exercise",
  "waitlist-lifecycle-exercise",
  "funder-disclosure-review",
  "manual-accessibility-device-review",
  "privacy-telemetry-review",
] as const;

export type LaunchEvidenceCheckId = (typeof launchEvidenceCheckIds)[number];

const launchEvidenceCheckSchema = z
  .object({
    id: z.enum(launchEvidenceCheckIds),
    status: z.enum(["pending", "passed"]),
    verifiedAt: z.iso.datetime({ offset: true }).nullable(),
    evidenceReference: z
      .string()
      .trim()
      .max(200)
      .regex(
        /^private-ops:[a-z0-9][a-z0-9._/-]*$/i,
        "Use an opaque private-ops: reference, not a URL or secret.",
      )
      .nullable(),
    reviewerRole: z.string().trim().min(2).max(80).nullable(),
  })
  .superRefine((check, context) => {
    if (
      check.status === "passed" &&
      (!check.verifiedAt || !check.evidenceReference || !check.reviewerRole)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Passed checks require a verification time, opaque evidence reference, and reviewer role.",
      });
    }
  });

export const launchEvidenceSchema = z
  .object({
    schemaVersion: z.literal(1),
    deploymentUrl: z.url(),
    reviewedAt: z.iso.datetime({ offset: true }),
    checks: z.array(launchEvidenceCheckSchema),
  })
  .superRefine((evidence, context) => {
    const counts = new Map<LaunchEvidenceCheckId, number>();

    for (const check of evidence.checks) {
      counts.set(check.id, (counts.get(check.id) ?? 0) + 1);
    }

    for (const id of launchEvidenceCheckIds) {
      if ((counts.get(id) ?? 0) !== 1) {
        context.addIssue({
          code: "custom",
          path: ["checks"],
          message: `Evidence must contain exactly one ${id} check.`,
        });
      }
    }

    if (evidence.checks.length !== launchEvidenceCheckIds.length) {
      context.addIssue({
        code: "custom",
        path: ["checks"],
        message: "Evidence contains an unexpected or duplicate launch check.",
      });
    }
  });

export type LaunchEvidence = z.infer<typeof launchEvidenceSchema>;
export type LaunchReadinessMode = "repository" | "production";
export type LaunchReadinessCheck = {
  id: string;
  category: "repository" | "configuration" | "external-evidence";
  state: "pass" | "fail" | "pending";
  message: string;
};

export type LaunchReadinessReport = {
  schemaVersion: 1;
  mode: LaunchReadinessMode;
  status: "ready" | "not-ready";
  checkedAt: string;
  checks: LaunchReadinessCheck[];
};

type LaunchEnvironment = Partial<
  Record<
    | "NEXT_PUBLIC_SITE_URL"
    | "LOOKUP_RATE_LIMIT_SECRET"
    | "SECURITY_CONTACT_EMAIL"
    | "CORRECTIONS_INTAKE_WEBHOOK_URL"
    | "CORRECTIONS_INTAKE_WEBHOOK_TOKEN"
    | "WAITLIST_INTAKE_WEBHOOK_URL"
    | "WAITLIST_INTAKE_WEBHOOK_TOKEN"
    | "VERCEL_ENV",
    string
  >
>;

type LaunchContentCounts = {
  publishedNevadaBills: number;
  publishedFederalBills: number;
};

type EvaluateLaunchReadinessInput = {
  mode: LaunchReadinessMode;
  checkedAt: Date;
  snapshots: SourceHealthInput[];
  contentCounts: LaunchContentCounts;
  environment?: LaunchEnvironment;
  evidence?: LaunchEvidence | null;
  evidenceError?: boolean;
};

const reservedHostSuffixes = [".example", ".invalid", ".localhost", ".test"];
const weakSecretValues = new Set([
  "change-me",
  "changeme",
  "password",
  "secret",
  "test-token",
]);

export function parsePublicProductionUrl(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLocaleLowerCase("en-US");
    const isReserved =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      reservedHostSuffixes.some((suffix) => hostname.endsWith(suffix));

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      isReserved
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function hasStrongServerSecret(value: string | undefined) {
  if (!value) return false;
  const normalized = value.trim().toLocaleLowerCase("en-US");
  return value.trim().length >= 32 && !weakSecretValues.has(normalized);
}

function hasValidSecurityContact(value: string | undefined) {
  return z.email().max(254).safeParse(value?.trim()).success;
}

function check(
  id: string,
  category: LaunchReadinessCheck["category"],
  passes: boolean,
  passMessage: string,
  failMessage: string,
): LaunchReadinessCheck {
  return {
    id,
    category,
    state: passes ? "pass" : "fail",
    message: passes ? passMessage : failMessage,
  };
}

function repositoryChecks(
  snapshots: SourceHealthInput[],
  contentCounts: LaunchContentCounts,
  checkedAt: Date,
): LaunchReadinessCheck[] {
  const health = evaluateSourceHealth(snapshots, checkedAt);
  const counts = new Map(
    snapshots.map((snapshot) => [snapshot.id, snapshot.recordCount]),
  );

  return [
    check(
      "source-snapshot-health",
      "repository",
      health.status === "ready",
      "All published source snapshots meet their freshness and integrity targets.",
      "At least one published source snapshot is stale or invalid.",
    ),
    check(
      "district-boundary-coverage",
      "repository",
      counts.get("boundaries") === 67,
      "All 67 Nevada congressional and state legislative district polygons are present.",
      "The boundary snapshot does not contain the required 67 district polygons.",
    ),
    check(
      "officeholder-coverage",
      "repository",
      counts.get("officials") === 69,
      "All 69 current federal and Nevada legislative positions are present.",
      "The officeholder snapshot does not contain the required 69 positions.",
    ),
    check(
      "complete-bill-index",
      "repository",
      counts.get("bill-index") === 1_152,
      "The complete 2025 Nevada bill index contains 1,152 records.",
      "The 2025 Nevada bill index does not contain the expected 1,152 records.",
    ),
    check(
      "approved-enhanced-bill-coverage",
      "repository",
      (counts.get("enhanced-review") ?? 0) >= 30 &&
        (counts.get("enhanced-review") ?? 0) <= 50 &&
        contentCounts.publishedNevadaBills ===
          (counts.get("enhanced-review") ?? 0) &&
        contentCounts.publishedFederalBills >= 1,
      "Enhanced Nevada bill coverage meets the PRD pilot range and is published.",
      "Enhanced Nevada bill coverage is outside the PRD pilot range or is not fully published.",
    ),
    check(
      "campaign-finance-pilot",
      "repository",
      (counts.get("finance") ?? 0) >= 2,
      "The labeled federal campaign-finance pilot contains at least two sourced records.",
      "The federal campaign-finance pilot does not contain the minimum sourced records.",
    ),
  ];
}

function configurationChecks(
  environment: LaunchEnvironment,
): LaunchReadinessCheck[] {
  const siteUrl = parsePublicProductionUrl(environment.NEXT_PUBLIC_SITE_URL);
  const correctionUrl = parsePublicProductionUrl(
    environment.CORRECTIONS_INTAKE_WEBHOOK_URL,
  );
  const waitlistUrl = parsePublicProductionUrl(
    environment.WAITLIST_INTAKE_WEBHOOK_URL,
  );

  return [
    check(
      "deployment-environment",
      "configuration",
      environment.VERCEL_ENV === undefined ||
        environment.VERCEL_ENV === "production",
      "The deployment environment is production or is not Vercel-managed.",
      "Production readiness cannot pass in a Vercel preview or development environment.",
    ),
    check(
      "public-origin",
      "configuration",
      siteUrl !== null,
      "A production HTTPS public origin is configured.",
      "Configure NEXT_PUBLIC_SITE_URL with the final production HTTPS origin.",
    ),
    check(
      "lookup-rate-limit-secret",
      "configuration",
      hasStrongServerSecret(environment.LOOKUP_RATE_LIMIT_SECRET),
      "A sufficiently strong server-only lookup rate-limit secret is configured.",
      "Configure a unique server-only lookup rate-limit secret of at least 32 characters.",
    ),
    check(
      "security-contact",
      "configuration",
      hasValidSecurityContact(environment.SECURITY_CONTACT_EMAIL),
      "A valid monitored security contact is configured.",
      "Configure a valid monitored SECURITY_CONTACT_EMAIL.",
    ),
    check(
      "correction-intake",
      "configuration",
      correctionUrl !== null &&
        hasStrongServerSecret(environment.CORRECTIONS_INTAKE_WEBHOOK_TOKEN),
      "The correction intake has a production HTTPS receiver and strong server-only token.",
      "Configure the correction intake HTTPS receiver and a token of at least 32 characters.",
    ),
    check(
      "waitlist-intake",
      "configuration",
      waitlistUrl !== null &&
        hasStrongServerSecret(environment.WAITLIST_INTAKE_WEBHOOK_TOKEN),
      "The waitlist intake has a production HTTPS receiver and strong server-only token.",
      "Configure the waitlist intake HTTPS receiver and a token of at least 32 characters.",
    ),
  ];
}

function externalEvidenceChecks(
  siteUrl: URL | null,
  evidence: LaunchEvidence | null,
  evidenceError: boolean,
  checkedAt: Date,
): LaunchReadinessCheck[] {
  const evidenceOrigin = evidence
    ? parsePublicProductionUrl(evidence.deploymentUrl)
    : null;
  const matchingDeployment =
    siteUrl !== null &&
    evidenceOrigin !== null &&
    siteUrl.origin === evidenceOrigin.origin &&
    siteUrl.pathname.replace(/\/$/, "") ===
      evidenceOrigin.pathname.replace(/\/$/, "");
  const reviewedAt = evidence ? Date.parse(evidence.reviewedAt) : Number.NaN;
  const evidenceIsCurrent =
    Number.isFinite(reviewedAt) &&
    reviewedAt <= checkedAt.getTime() + 5 * 60 * 1_000 &&
    checkedAt.getTime() - reviewedAt <= 30 * 24 * 60 * 60 * 1_000;

  return launchEvidenceCheckIds.map((id) => {
    const evidenceCheck = evidence?.checks.find((item) => item.id === id);
    const verifiedAt = evidenceCheck?.verifiedAt
      ? Date.parse(evidenceCheck.verifiedAt)
      : Number.NaN;
    const passes =
      matchingDeployment &&
      evidenceIsCurrent &&
      evidenceCheck?.status === "passed" &&
      Number.isFinite(verifiedAt) &&
      verifiedAt <= reviewedAt;

    return {
      id,
      category: "external-evidence",
      state: passes ? "pass" : evidenceError ? "fail" : "pending",
      message: passes
        ? "A passed private operations record exists for the configured deployment."
        : evidenceError
          ? "The private launch evidence file is missing, unreadable, or invalid."
          : "A passed private operations record is required for the configured deployment.",
    };
  });
}

export function evaluateLaunchReadiness({
  mode,
  checkedAt,
  snapshots,
  contentCounts,
  environment = {},
  evidence = null,
  evidenceError = false,
}: EvaluateLaunchReadinessInput): LaunchReadinessReport {
  const repository = repositoryChecks(snapshots, contentCounts, checkedAt);
  const checks =
    mode === "repository"
      ? repository
      : [
          ...repository,
          ...configurationChecks(environment),
          ...externalEvidenceChecks(
            parsePublicProductionUrl(environment.NEXT_PUBLIC_SITE_URL),
            evidence,
            evidenceError,
            checkedAt,
          ),
        ];

  return {
    schemaVersion: 1,
    mode,
    status: checks.every((item) => item.state === "pass")
      ? "ready"
      : "not-ready",
    checkedAt: checkedAt.toISOString(),
    checks,
  };
}

import { z } from "zod";

import type { CorrectionAuditEvent } from "@/domain/corrections/workflow";

export const correctionRecordTypes = [
  "official",
  "district",
  "bill",
  "finance",
  "other",
] as const;

export const correctionStatuses = [
  "received",
  "triaged",
  "investigating",
  "resolved",
  "rejected",
  "published",
] as const;

export type CorrectionStatus = (typeof correctionStatuses)[number];

const optionalEvidenceUrl = z
  .union([z.literal(""), z.url("Enter a complete evidence URL.").max(500)])
  .optional()
  .transform((value) => value || null);

export const correctionRequestSchema = z.object({
  recordType: z.enum(correctionRecordTypes),
  recordReference: z
    .string()
    .trim()
    .min(3, "Identify the page or record that may be incorrect.")
    .max(240, "Keep the record reference under 240 characters."),
  issueDescription: z
    .string()
    .trim()
    .min(20, "Describe the suspected error in at least 20 characters.")
    .max(4_000, "Keep the description under 4,000 characters."),
  evidenceUrl: optionalEvidenceUrl,
  email: z.email("Enter a valid email address.").max(254),
  consent: z.literal(true, {
    error: "Confirm that we may contact you about this correction.",
  }),
  website: z.string().max(0).optional().default(""),
});

export type CorrectionRequest = z.infer<typeof correctionRequestSchema>;

export type CorrectionIntakeEnvelope = {
  schemaVersion: 2;
  caseId: string;
  status: "received";
  submittedAt: string;
  record: {
    type: CorrectionRequest["recordType"];
    reference: string;
  };
  report: {
    description: string;
    evidenceUrl: string | null;
  };
  reporter: {
    email: string;
    contactConsent: true;
  };
  audit: [CorrectionAuditEvent];
};

export type CorrectionResponse =
  | { status: "received"; caseId: string; message: string }
  | { status: "invalid"; message: string; fields?: Record<string, string[]> }
  | { status: "rate-limited"; message: string }
  | { status: "unavailable"; message: string };

import { z } from "zod";

import {
  correctionStatuses,
  type CorrectionStatus,
} from "@/domain/corrections/types";

export const correctionAuditEventSchema = z.object({
  id: z.string().min(1),
  caseId: z.string().min(1),
  sequence: z.number().int().positive(),
  event: z.enum(["status-transition", "material-record-change"]),
  actor: z.string().min(1),
  occurredAt: z.iso.datetime(),
  reason: z.string().min(3).max(2_000),
  fromStatus: z.enum(correctionStatuses).nullable(),
  toStatus: z.enum(correctionStatuses),
  affectedRecordIds: z.array(z.string().min(1)).min(1),
  evidenceUrls: z.array(z.url()),
  beforeReference: z.string().min(1).nullable(),
  afterReference: z.string().min(1).nullable(),
});

export type CorrectionAuditEvent = z.infer<typeof correctionAuditEventSchema>;

const allowedTransitions: Record<CorrectionStatus, CorrectionStatus[]> = {
  received: ["triaged", "rejected"],
  triaged: ["investigating", "resolved", "rejected"],
  investigating: ["resolved", "rejected"],
  resolved: ["investigating", "published"],
  rejected: ["triaged"],
  published: [],
};

export function canTransitionCorrection(
  from: CorrectionStatus,
  to: CorrectionStatus,
): boolean {
  return allowedTransitions[from].includes(to);
}

export function createCorrectionAuditEvent(input: {
  caseId: string;
  sequence: number;
  event: CorrectionAuditEvent["event"];
  actor: string;
  occurredAt: string;
  reason: string;
  fromStatus: CorrectionStatus | null;
  toStatus: CorrectionStatus;
  affectedRecordIds: string[];
  evidenceUrls?: string[];
  beforeReference?: string | null;
  afterReference?: string | null;
}): Readonly<CorrectionAuditEvent> {
  if (
    input.fromStatus &&
    !canTransitionCorrection(input.fromStatus, input.toStatus)
  ) {
    throw new Error(
      `Invalid correction transition: ${input.fromStatus} -> ${input.toStatus}`,
    );
  }

  if (
    input.event === "material-record-change" &&
    (!input.beforeReference || !input.afterReference)
  ) {
    throw new Error(
      "Material record changes require before and after references",
    );
  }

  return Object.freeze(
    correctionAuditEventSchema.parse({
      ...input,
      id: `${input.caseId}:event:${input.sequence}`,
      evidenceUrls: input.evidenceUrls ?? [],
      beforeReference: input.beforeReference ?? null,
      afterReference: input.afterReference ?? null,
    }),
  );
}

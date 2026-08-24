import { z } from "zod";

export const editorialChecklistKeys = [
  "digestComparedToEnrolledText",
  "materialAmendmentsReviewed",
  "statusAndLatestActionConfirmed",
  "votesClassified",
  "sponsorsAndCommitteesReviewed",
  "selectionExplanationApproved",
] as const;

export const editorialVoteClassifications = [
  "passage",
  "concurrence",
  "amendment",
  "procedural",
  "veto-override",
] as const;

const checklistSchema = z.object(
  Object.fromEntries(
    editorialChecklistKeys.map((key) => [key, z.literal(true)]),
  ) as Record<(typeof editorialChecklistKeys)[number], z.ZodLiteral<true>>,
);

const voteDecisionSchema = z.object({
  voteId: z.string().min(1),
  classification: z.enum(editorialVoteClassifications),
  evidenceUrl: z.url(),
  note: z.string().min(1),
});

export const editorialDecisionSchema = z
  .object({
    billIdentifier: z.string().regex(/^(AB|SB)\d+$/),
    candidateFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    decision: z.literal("approved"),
    checklist: checklistSchema,
    voteDecisions: z.array(voteDecisionSchema).min(1),
    summary: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("official-digest") }),
      z.object({
        kind: z.literal("human-approved-summary"),
        text: z.string().min(40),
        assistanceDisclosure: z.string().min(1),
      }),
    ]),
    uncertaintyNotes: z.array(z.string().min(1)),
    reviewer: z.object({
      name: z.string().trim().min(2),
      role: z.string().trim().min(2),
    }),
    reviewedAt: z.iso.datetime(),
  })
  .strict();

export const editorialDecisionsBundleSchema = z
  .object({
    schemaVersion: z.literal(1),
    sourceSnapshotId: z.string().min(1),
    decisions: z.array(editorialDecisionSchema),
  })
  .strict();

export type EditorialDecision = z.infer<typeof editorialDecisionSchema>;
export type EditorialDecisionsBundle = z.infer<
  typeof editorialDecisionsBundleSchema
>;

export type EditorialReviewPacket = {
  billIdentifier: string;
  candidateFingerprint: string;
  subjectArea: string;
  officialPageUrl: string;
  officialTextUrl: string;
  evidenceUrls: string[];
  reviewChecklist: Array<{
    key: (typeof editorialChecklistKeys)[number];
    instruction: string;
  }>;
  votes: Array<{
    voteId: string;
    occurredOn: string;
    chamber: string;
    extractedQuestion: string;
    evidenceUrl: string;
    allowedClassifications: typeof editorialVoteClassifications;
  }>;
};

export type EditorialReviewPacketBundle = {
  schemaVersion: 1;
  sourceSnapshotId: string;
  generatedAt: string;
  records: EditorialReviewPacket[];
};

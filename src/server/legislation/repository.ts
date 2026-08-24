import "server-only";

import legislationData from "@/data/generated/pilot-legislation.json";
import promotedLegislationData from "@/data/generated/promoted-enhanced-legislation.json";
import type {
  LegislationBundle,
  OfficialLegislationActivity,
  PilotBill,
} from "@/domain/legislation/types";

const baseBundle = legislationData as unknown as LegislationBundle;
const promotedBundle = promotedLegislationData as unknown as LegislationBundle;
const bundle: LegislationBundle = {
  ...baseBundle,
  snapshotId:
    promotedBundle.bills.length === 0
      ? baseBundle.snapshotId
      : `${baseBundle.snapshotId}+${promotedBundle.snapshotId}`,
  generatedAt:
    promotedBundle.bills.length === 0
      ? baseBundle.generatedAt
      : [baseBundle.generatedAt, promotedBundle.generatedAt].sort().at(-1)!,
  parserVersion:
    promotedBundle.bills.length === 0
      ? baseBundle.parserVersion
      : `${baseBundle.parserVersion}+${promotedBundle.parserVersion}`,
  coverageLabel:
    promotedBundle.bills.length === 0
      ? baseBundle.coverageLabel
      : "Published human-reviewed enhanced legislation",
  bills: [...baseBundle.bills, ...promotedBundle.bills],
  sources: [
    ...new Map(
      [...baseBundle.sources, ...promotedBundle.sources].map((source) => [
        source.id,
        source,
      ]),
    ).values(),
  ],
};

export function getLegislationBundle(): LegislationBundle {
  return bundle;
}

export function getAllPilotBills(): PilotBill[] {
  return bundle.bills;
}

export function getPilotBillBySlug(slug: string): PilotBill | undefined {
  return bundle.bills.find((bill) => bill.slug === slug);
}

export function getLegislationForOfficial(
  officialId: string,
): OfficialLegislationActivity[] {
  return bundle.bills.flatMap((bill) => {
    const person = bill.people.find(
      (candidate) => candidate.officialId === officialId,
    );
    const votes = bill.votes.flatMap((vote) =>
      vote.memberVotes
        .filter((memberVote) => memberVote.officialId === officialId)
        .map((memberVote) => ({
          id: vote.id,
          chamber: vote.chamber,
          occurredOn: vote.occurredOn,
          question: vote.question,
          ...memberVote,
        })),
    );

    if (!person && votes.length === 0) return [];
    return [
      {
        bill: {
          id: bill.id,
          slug: bill.slug,
          identifier: bill.identifier,
          title: bill.title,
          jurisdiction: bill.jurisdiction,
          status: bill.status,
        },
        sponsorshipRole: person?.role ?? null,
        votes,
      },
    ];
  });
}

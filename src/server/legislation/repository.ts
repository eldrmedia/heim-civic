import "server-only";

import legislationData from "@/data/generated/pilot-legislation.json";
import type {
  LegislationBundle,
  OfficialLegislationActivity,
  PilotBill,
} from "@/domain/legislation/types";

const bundle = legislationData as unknown as LegislationBundle;

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

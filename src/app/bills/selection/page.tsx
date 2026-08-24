import type { Metadata } from "next";

import { EnhancedBillSelectionLog } from "@/components/organisms/enhanced-bill-selection-log";
import { ContentPageTemplate } from "@/components/templates/content-page-template";
import { getEnhancedBillReviewBundle } from "@/server/legislation/enhanced-review-repository";
import { getAllPilotBills } from "@/server/legislation/repository";

export const metadata: Metadata = {
  title: "Enhanced bill selection log",
  description:
    "See how Nevada bills enter Heim Civic's enhanced review queue and which records still await accountable human approval.",
};

export default function EnhancedBillSelectionPage() {
  const bundle = getEnhancedBillReviewBundle();
  const publishedBills = getAllPilotBills();
  const publishedNevadaCount = publishedBills.filter(
    (bill) => bill.jurisdiction === "state",
  ).length;
  const promotedIdentifiers = publishedBills
    .filter((bill) => bill.editorialReview?.state === "human-approved")
    .map((bill) => bill.identifier);

  return (
    <ContentPageTemplate
      eyebrow="Phase 9.2 · Public selection log"
      title="A transparent queue for deeper bill review."
      introduction="Comprehensive discovery and enhanced editorial coverage are different promises. This log shows which bills are being prepared, why they entered the queue, and whether a human editor has approved publication."
      width="wide"
    >
      <EnhancedBillSelectionLog
        bundle={bundle}
        publishedNevadaCount={publishedNevadaCount}
        promotedIdentifiers={promotedIdentifiers}
      />
    </ContentPageTemplate>
  );
}

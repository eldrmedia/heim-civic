import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BillPageTemplate } from "@/components/templates/bill-page-template";
import {
  getAllPilotBills,
  getPilotBillBySlug,
} from "@/server/legislation/repository";
import { getAllCurrentOfficials } from "@/server/officials/repository";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPilotBills().map((bill) => ({ slug: bill.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const bill = getPilotBillBySlug((await params).slug);
  return bill
    ? {
        title: `${bill.identifier}: ${bill.title}`,
        description: `Official-source status and Nevada recorded votes for ${bill.identifier}.`,
      }
    : {};
}

export default async function BillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bill = getPilotBillBySlug(slug);
  if (!bill) notFound();
  return (
    <BillPageTemplate bill={bill} currentOfficials={getAllCurrentOfficials()} />
  );
}

import { z } from "zod";

export const waitlistRoles = [
  "resident",
  "journalist",
  "nonprofit",
  "educator",
  "government",
  "other",
  "prefer-not-to-say",
] as const;

export const waitlistFeatures = [
  "districts-and-representatives",
  "bills-and-votes",
  "campaign-finance",
  "corrections-and-sources",
  "professional-research",
] as const;

export const membershipInterests = [
  "not-sure",
  "five-dollars",
  "ten-dollars",
  "no-paid-membership",
] as const;

export const waitlistRequestSchema = z.object({
  email: z
    .email("Enter a valid email address.")
    .max(254)
    .transform((value) => value.trim().toLocaleLowerCase("en-US")),
  consent: z.literal(true, {
    error: "Confirm that you want to receive the waitlist email.",
  }),
  location: z
    .string()
    .trim()
    .max(80, "Keep the optional ZIP code or county under 80 characters.")
    .optional()
    .transform((value) => value || null),
  role: z.enum(waitlistRoles).nullable().optional().default(null),
  desiredFeatures: z
    .array(z.enum(waitlistFeatures))
    .max(waitlistFeatures.length)
    .default([]),
  membershipInterest: z
    .enum(membershipInterests)
    .nullable()
    .optional()
    .default(null),
  website: z.string().max(0).optional().default(""),
});

export type WaitlistRequest = z.infer<typeof waitlistRequestSchema>;

export type WaitlistEnvelope = {
  schemaVersion: 1;
  subscriptionId: string;
  status: "pending-confirmation";
  submittedAt: string;
  contact: { email: string };
  consent: {
    capturedAt: string;
    source: "public-waitlist-form";
    confirmationRequired: true;
  };
  preferences: {
    location: string | null;
    role: WaitlistRequest["role"];
    desiredFeatures: WaitlistRequest["desiredFeatures"];
    membershipInterest: WaitlistRequest["membershipInterest"];
  };
  prohibitedDataNotice: {
    exactAddressAccepted: false;
    politicalPreferenceAccepted: false;
  };
};

export type WaitlistResponse =
  | { status: "confirmation-pending"; message: string }
  | { status: "invalid"; message: string; fields?: Record<string, string[]> }
  | { status: "rate-limited"; message: string }
  | { status: "unavailable"; message: string };

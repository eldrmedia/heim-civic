import { z } from "zod";

const poBoxPattern =
  /\b(?:p(?:ost)?\.?\s*o(?:ffice)?\.?\s+box|p\.?\s*o\.?\s*b(?:ox)?)\b/i;

export const lookupRequestSchema = z.object({
  address: z
    .string()
    .trim()
    .min(8, "Enter a complete Nevada street address.")
    .max(200, "Address must be 200 characters or fewer.")
    .refine((value) => !poBoxPattern.test(value), {
      message: "Enter a physical street address, not a P.O. box.",
    })
    .transform((value) => value.replace(/\s+/g, " ")),
});

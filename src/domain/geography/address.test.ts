import { describe, expect, it } from "vitest";

import { lookupRequestSchema } from "@/domain/geography/address";

describe("lookupRequestSchema", () => {
  it("normalizes a complete street address", () => {
    const result = lookupRequestSchema.parse({
      address: "  101 N Carson St,   Carson City, NV 89701  ",
    });

    expect(result.address).toBe("101 N Carson St, Carson City, NV 89701");
  });

  it("rejects P.O. boxes and partial input", () => {
    expect(
      lookupRequestSchema.safeParse({ address: "P.O. Box 123, Reno, NV 89501" })
        .success,
    ).toBe(false);
    expect(lookupRequestSchema.safeParse({ address: "89501" }).success).toBe(
      false,
    );
  });
});

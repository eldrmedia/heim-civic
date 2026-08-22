import { afterEach, describe, expect, it, vi } from "vitest";

import { geocodeAddress } from "@/server/geography/census-geocoder";

afterEach(() => vi.unstubAllGlobals());

describe("geocodeAddress", () => {
  it("normalizes a public institutional match and comparison districts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            result: {
              addressMatches: [
                {
                  matchedAddress: "101 N CARSON ST, CARSON CITY, NV, 89701",
                  coordinates: { x: -119.766909132818, y: 39.1639660332 },
                  addressComponents: { state: "NV" },
                  geographies: {
                    "119th Congressional Districts": [
                      {
                        CDSESSN: "119",
                        CD119: "02",
                        BASENAME: "2",
                      },
                    ],
                    "2024 State Legislative Districts - Upper": [
                      { GEOID: "32016", BASENAME: "16" },
                    ],
                    "2024 State Legislative Districts - Lower": [
                      { GEOID: "32040", BASENAME: "40" },
                    ],
                  },
                },
              ],
            },
          }),
          { status: 200 },
        ),
      ),
    );

    const result = await geocodeAddress(
      "101 N Carson St, Carson City, NV 89701",
    );

    expect(result.kind).toBe("matched");
    if (result.kind === "matched") {
      expect(result.candidate.comparisonDistricts).toEqual({
        congressional: 2,
        "state-senate": 16,
        "state-assembly": 40,
      });
    }
  });

  it("never places the submitted address in an upstream error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );

    await expect(
      geocodeAddress("101 N Carson St, Carson City, NV 89701"),
    ).rejects.not.toThrow(/101 N Carson/i);
  });
});

import { describe, expect, it } from "vitest";

import { lookupNevadaAddress } from "@/server/geography/lookup-service";

const publicInstitution = "101 N Carson St, Carson City, NV 89701";

describe("lookupNevadaAddress failure states", () => {
  it("returns actionable unmatched and ambiguous states", async () => {
    await expect(
      lookupNevadaAddress(publicInstitution, {
        geocode: async () => ({ kind: "unmatched" }),
      }),
    ).resolves.toEqual({
      status: "unmatched",
      message:
        "We could not match that address. Check the street, city, and ZIP code.",
    });

    await expect(
      lookupNevadaAddress(publicInstitution, {
        geocode: async () => ({
          kind: "ambiguous",
          candidates: [
            {
              normalizedAddress: "PUBLIC INSTITUTION CANDIDATE",
              longitude: -119.76,
              latitude: 39.16,
              state: "NV",
              comparisonDistricts: {},
            },
          ],
        }),
      }),
    ).resolves.toEqual({
      status: "ambiguous",
      suggestions: ["PUBLIC INSTITUTION CANDIDATE"],
    });
  });

  it("rejects a matched point outside Nevada", async () => {
    await expect(
      lookupNevadaAddress(publicInstitution, {
        geocode: async () => ({
          kind: "matched",
          candidate: {
            normalizedAddress: "4600 SILVER HILL RD, WASHINGTON, DC, 20233",
            longitude: -76.927,
            latitude: 38.846,
            state: "DC",
            comparisonDistricts: {},
          },
        }),
      }),
    ).resolves.toEqual({
      status: "out-of-state",
      message: "This lookup currently supports Nevada addresses only.",
    });
  });

  it("withholds districts when Census conflicts with Nevada boundaries", async () => {
    await expect(
      lookupNevadaAddress(publicInstitution, {
        geocode: async () => ({
          kind: "matched",
          candidate: {
            normalizedAddress: "101 N CARSON ST, CARSON CITY, NV, 89701",
            longitude: -119.766909132818,
            latitude: 39.1639660332,
            state: "NV",
            comparisonDistricts: { congressional: 1 },
          },
        }),
      }),
    ).resolves.toEqual({
      status: "review",
      message:
        "We found the location, but the district sources need review. No district result was shown.",
    });
  });
});

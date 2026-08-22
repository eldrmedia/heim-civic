import { describe, expect, it } from "vitest";

import boundaryData from "@/data/generated/nevada-boundaries-2021.json";
import { resolveDistricts } from "@/domain/geography/resolve-districts";
import type { BoundaryBundle } from "@/domain/geography/types";
import {
  getCurrentRepresentation,
  getOfficialsBundle,
} from "@/server/officials/repository";

describe("official repository", () => {
  it("publishes one reviewed position for every supported Nevada legislative seat", () => {
    const bundle = getOfficialsBundle();

    expect(bundle.officials).toHaveLength(69);
    expect(bundle.positions).toHaveLength(69);
    expect(
      bundle.positions.every((position) => position.status === "occupied"),
    ).toBe(true);
    expect(new Set(bundle.officials.map((official) => official.id)).size).toBe(
      69,
    );
  });

  it("joins the public Nevada State Capitol fixture to five current officeholders", () => {
    const resolution = resolveDistricts(
      boundaryData as unknown as BoundaryBundle,
      -119.766909132818,
      39.1639660332,
    );

    expect(resolution.kind).toBe("resolved");
    if (resolution.kind !== "resolved") return;

    const representation = getCurrentRepresentation(resolution.districts);

    expect(representation.map((item) => item.official?.name)).toEqual([
      "Mark E. Amodei",
      "Lisa Krasner",
      "PK O’Neill",
      "Catherine Cortez Masto",
      "Jacky Rosen",
    ]);
    expect(
      representation.every(
        (item) => item.official && item.official.sources.length > 0,
      ),
    ).toBe(true);
  });
});

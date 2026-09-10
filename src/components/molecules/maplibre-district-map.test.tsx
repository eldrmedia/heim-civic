import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  DistrictSummary,
  DistrictType,
  StateOutline,
} from "@/domain/geography/types";

const mapMocks = vi.hoisted(() => ({
  addLayer: vi.fn(),
  addSource: vi.fn(),
  fitBounds: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("maplibre-gl", () => ({
  Map: class {
    addControl() {}
    addLayer = mapMocks.addLayer;
    addSource = mapMocks.addSource;
    fitBounds = mapMocks.fitBounds;
    getLayer() {
      return true;
    }
    loaded() {
      return true;
    }
    once(event: string, callback: () => void) {
      if (event === "load") queueMicrotask(callback);
    }
    remove = mapMocks.remove;
    setLayoutProperty() {}
  },
  NavigationControl: class {},
}));

import { MapLibreDistrictMap } from "./maplibre-district-map";

describe("MapLibreDistrictMap", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("retains an actionable fallback without provider configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_MAPTILER_KEY", "");
    render(
      <MapLibreDistrictMap
        districts={districts()}
        stateOutline={stateOutline}
        visibleLayers={["congressional"]}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "The street map is unavailable",
    );
  });

  it("loads official overlays without receiving an address or coordinate", async () => {
    vi.stubEnv("NEXT_PUBLIC_MAPTILER_KEY", "domain-restricted-browser-key");
    render(
      <MapLibreDistrictMap
        districts={districts()}
        stateOutline={stateOutline}
        visibleLayers={["congressional", "state-senate", "state-assembly"]}
      />,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Focus on my districts" }),
      ).toBeVisible(),
    );
    expect(mapMocks.addSource).toHaveBeenCalledTimes(3);
    expect(mapMocks.addLayer).toHaveBeenCalledTimes(6);
    expect(
      screen.getByText(/No address or precise lookup point/),
    ).toBeVisible();
  });
});

function districts(): DistrictSummary[] {
  return (["congressional", "state-senate", "state-assembly"] as const).map(
    (type, index) => ({
      type,
      number: String(index + 1),
      displayName: labels[type],
      boundary: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-120 + index, 38],
              [-119 + index, 38],
              [-119 + index, 39],
              [-120 + index, 39],
              [-120 + index, 38],
            ],
          ],
        },
        properties: {
          id: `fixture-${type}`,
          datasetId: `fixture-${type}`,
          districtType: type,
          districtNumber: String(index + 1),
          displayName: labels[type],
          effectiveFrom: "2023-01-03",
          sourceFeatureId: String(index + 1),
          validationState: "source-verified",
        },
      },
      source: {
        publisher: "Nevada Legislative Counsel Bureau",
        landingPage: "https://www.leg.state.nv.us/Division/Research/Districts/",
        effectiveFrom: "2023-01-03",
        datasetId: `fixture-${type}`,
      },
    }),
  );
}

const labels: Record<DistrictType, string> = {
  congressional: "U.S. Congressional District 1",
  "state-senate": "Nevada Senate District 2",
  "state-assembly": "Nevada Assembly District 3",
};

const stateOutline: StateOutline = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-120, 35],
        [-114, 35],
        [-114, 42],
        [-120, 42],
        [-120, 35],
      ],
    ],
  },
  properties: {
    id: "nv:state:outline:2021",
    displayName: "Nevada",
    datasetIds: ["fixture-congressional"],
    effectiveFrom: "2023-01-03",
    derivation: "union-and-display-simplify",
    toleranceDegrees: 0.001,
    validationState: "source-derived-display",
  },
};

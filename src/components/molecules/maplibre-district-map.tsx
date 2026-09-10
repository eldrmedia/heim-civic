"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { MapUnavailableNote } from "@/components/atoms/map-unavailable-note";
import { getPublicMapConfiguration } from "@/config/public-map";
import type {
  DistrictSummary,
  DistrictType,
  StateOutline,
} from "@/domain/geography/types";

const layerPresentation: Record<
  DistrictType,
  { fill: string; line: string; fillOpacity: number }
> = {
  congressional: { fill: "#0f513f", line: "#083d30", fillOpacity: 0.2 },
  "state-senate": { fill: "#c9673f", line: "#a94f30", fillOpacity: 0.28 },
  "state-assembly": { fill: "#88a184", line: "#60795d", fillOpacity: 0.38 },
};

export function MapLibreDistrictMap({
  districts,
  stateOutline,
  visibleLayers,
}: {
  districts: DistrictSummary[];
  stateOutline: StateOutline;
  visibleLayers: DistrictType[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const visibleLayersRef = useRef(visibleLayers);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  const configuration = getPublicMapConfiguration();
  const styleUrl = configuration?.styleUrl;

  useEffect(() => {
    visibleLayersRef.current = visibleLayers;
  }, [visibleLayers]);

  useEffect(() => {
    if (!styleUrl || !containerRef.current) {
      setState("unavailable");
      return;
    }

    let cancelled = false;

    void import("maplibre-gl")
      .then((maplibregl) => {
        if (cancelled || !containerRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: styleUrl,
          bounds: geometryBounds(focusGeometry(districts)),
          fitBoundsOptions: { padding: 44, maxZoom: 10, duration: 0 },
          attributionControl: { compact: false },
          cooperativeGestures: true,
        });
        mapRef.current = map;
        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-right",
        );

        map.once("load", () => {
          if (cancelled) return;
          for (const district of districts) {
            const sourceId = sourceIdentifier(district.type);
            map.addSource(sourceId, {
              type: "geojson",
              data: district.boundary,
            });
            map.addLayer({
              id: `${sourceId}-fill`,
              type: "fill",
              source: sourceId,
              paint: {
                "fill-color": layerPresentation[district.type].fill,
                "fill-opacity": layerPresentation[district.type].fillOpacity,
              },
              layout: {
                visibility: visibleLayersRef.current.includes(district.type)
                  ? "visible"
                  : "none",
              },
            });
            map.addLayer({
              id: `${sourceId}-line`,
              type: "line",
              source: sourceId,
              paint: {
                "line-color": layerPresentation[district.type].line,
                "line-width": 3,
              },
              layout: {
                visibility: visibleLayersRef.current.includes(district.type)
                  ? "visible"
                  : "none",
              },
            });
          }
          setState("ready");
        });
        map.once("error", () => setState("unavailable"));
      })
      .catch(() => setState("unavailable"));

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [districts, styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;
    for (const type of Object.keys(layerPresentation) as DistrictType[]) {
      const visibility = visibleLayers.includes(type) ? "visible" : "none";
      for (const suffix of ["fill", "line"]) {
        const id = `${sourceIdentifier(type)}-${suffix}`;
        if (map.getLayer(id))
          map.setLayoutProperty(id, "visibility", visibility);
      }
    }
  }, [visibleLayers]);

  if (!configuration) return <MapUnavailableNote />;

  return (
    <div className="interactive-district-map">
      <div
        className="interactive-district-map__canvas"
        ref={containerRef}
        aria-label="Interactive map showing the selected Nevada districts"
      />
      {state === "loading" ? (
        <p className="interactive-district-map__status" role="status">
          Loading street and city context…
        </p>
      ) : null}
      {state === "unavailable" ? <MapUnavailableNote /> : null}
      {state === "ready" ? (
        <div className="interactive-district-map__actions">
          <button
            type="button"
            onClick={() => fitMap(mapRef.current, focusGeometry(districts), 10)}
          >
            Focus on my districts
          </button>
          <button
            type="button"
            onClick={() => fitMap(mapRef.current, stateOutline, 7)}
          >
            Show all Nevada
          </button>
        </div>
      ) : null}
      <p className="interactive-district-map__privacy">
        No address or precise lookup point is sent to or displayed by the map.
        The basemap provider receives the map area needed to load map tiles.
      </p>
    </div>
  );
}

function sourceIdentifier(type: DistrictType) {
  return `heim-${type}`;
}

function focusGeometry(districts: DistrictSummary[]) {
  return (
    districts.find((district) => district.type === "state-assembly")
      ?.boundary ?? districts[0]!.boundary
  );
}

function fitMap(
  map: MapLibreMap | null,
  geometry: DistrictSummary["boundary"] | StateOutline,
  maximumZoom: number,
) {
  map?.fitBounds(geometryBounds(geometry), {
    padding: 44,
    maxZoom: maximumZoom,
    duration: globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : 500,
  });
}

function geometryBounds(
  feature: DistrictSummary["boundary"] | StateOutline,
): [[number, number], [number, number]] {
  const points: number[][] = [];
  collectPoints(feature.geometry.coordinates, points);
  const longitudes = points.map((point) => point[0]!);
  const latitudes = points.map((point) => point[1]!);
  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ];
}

function collectPoints(value: unknown, points: number[][]) {
  if (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    points.push(value as number[]);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectPoints(item, points);
  }
}

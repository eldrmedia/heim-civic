import { afterEach, describe, expect, it, vi } from "vitest";

import { getPublicMapConfiguration } from "@/config/public-map";

describe("public map configuration", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("fails closed when a browser map provider is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_MAPTILER_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_MAP_STYLE_URL", "");
    expect(getPublicMapConfiguration()).toBeNull();
  });

  it("builds the domain-restrictable MapTiler style URL", () => {
    vi.stubEnv("NEXT_PUBLIC_MAPTILER_KEY", "public-browser-key");
    expect(getPublicMapConfiguration()).toEqual({
      provider: "maptiler",
      styleUrl:
        "https://api.maptiler.com/maps/streets-v2/style.json?key=public-browser-key",
    });
  });

  it("allows a replaceable HTTPS style provider", () => {
    vi.stubEnv("NEXT_PUBLIC_MAP_STYLE_URL", "https://maps.example/style.json");
    expect(getPublicMapConfiguration()).toEqual({
      provider: "custom",
      styleUrl: "https://maps.example/style.json",
    });
  });
});

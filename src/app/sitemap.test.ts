import { afterEach, describe, expect, it, vi } from "vitest";

import sitemap from "@/app/sitemap";
import baseLegislationData from "@/data/generated/pilot-legislation.json";
import billIndexData from "@/data/generated/nevada-bill-index.json";
import promotedLegislationData from "@/data/generated/promoted-enhanced-legislation.json";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("public sitemap", () => {
  it("includes every stable public record route and excludes APIs", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://civic.example/nevada");
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toHaveLength(1306);
    expect(urls).toContain("https://civic.example/nevada");
    expect(urls).toContain(
      "https://civic.example/nevada/districts/congressional-1",
    );
    expect(urls).toContain("https://civic.example/nevada/officials");
    expect(urls).not.toContain("https://civic.example/nevada/search");
    expect(urls).toContain("https://civic.example/nevada/bills/selection");
    expect(urls).toContain(
      "https://civic.example/nevada/bills/nv-83-2025-ab226",
    );
    expect(urls).toContain(
      "https://civic.example/nevada/bills/nv-83-2025-ab44",
    );
    expect(urls).toContain(
      "https://civic.example/nevada/bills/nv-83-2025-ab79",
    );
    expect(urls).toContain(
      "https://civic.example/nevada/bills/nv-83-2025-ab204",
    );
    for (const bill of [
      ...baseLegislationData.bills,
      ...promotedLegislationData.bills,
    ]) {
      expect(urls).toContain(`https://civic.example/nevada/bills/${bill.slug}`);
    }
    for (const bill of billIndexData.records) {
      const baseSlug = `nv-83-2025-${bill.canonicalIdentifier.toLocaleLowerCase("en-US")}`;
      const slug = bill.sourceMarker
        ? `${baseSlug}-nelis-${bill.billKey}`
        : baseSlug;
      expect(urls).toContain(`https://civic.example/nevada/bills/${slug}`);
    }
    expect(urls.some((url) => url.includes("/api/"))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
    expect(entries.every((entry) => entry.lastModified)).toBe(true);
  });

  it("does not advertise a sitemap outside the configured public origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    expect(sitemap()).toEqual([]);
  });
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const confirmedLookup = {
  status: "confirmed",
  districts: [
    ["congressional", "Congressional District 2", "2"],
    ["state-senate", "State Senate District 16", "16"],
    ["state-assembly", "State Assembly District 40", "40"],
  ].map(([type, displayName, number]) => ({
    type,
    number,
    displayName,
    boundary: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-120, 38],
            [-119, 38],
            [-119, 39],
            [-120, 39],
            [-120, 38],
          ],
        ],
      },
      properties: {
        id: `fixture-${type}`,
        datasetId: `fixture-${type}`,
        districtType: type,
        districtNumber: number,
        displayName,
        effectiveFrom: "2022-01-01T00:00:00-08:00",
        sourceFeatureId: number,
        validationState: "source-verified",
      },
    },
    source: {
      publisher: "Nevada Legislative Counsel Bureau",
      landingPage: "https://example.gov",
      effectiveFrom: "2022-01-01T00:00:00-08:00",
      datasetId: `fixture-${type}`,
    },
  })),
  mapContext: {
    stateOutline: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-120.01, 35],
            [-114.04, 35],
            [-114.04, 42],
            [-120.01, 42],
            [-120.01, 35],
          ],
        ],
      },
      properties: {
        id: "nv:state:outline:2021",
        displayName: "Nevada",
        datasetIds: ["fixture-congressional"],
        effectiveFrom: "2022-01-01T00:00:00-08:00",
        derivation: "union-and-display-simplify",
        toleranceDegrees: 0.001,
        validationState: "source-derived-display",
      },
    },
  },
  representation: [
    [
      "us-house",
      "congressional",
      "2",
      "Mark E. Amodei",
      "us-congress-a000369",
      "Republican",
    ],
    [
      "state-senate",
      "state-senate",
      "16",
      "Lisa Krasner",
      "nv-lcb-327",
      "Republican",
    ],
    [
      "state-assembly",
      "state-assembly",
      "40",
      "PK O’Neill",
      "nv-lcb-285",
      "Republican",
    ],
    [
      "us-senate",
      null,
      null,
      "Catherine Cortez Masto",
      "us-congress-c001113",
      "Democratic",
    ],
    [
      "us-senate",
      null,
      null,
      "Jacky Rosen",
      "us-congress-r000608",
      "Democratic",
    ],
  ].map(
    ([chamber, districtType, districtNumber, name, slug, party], index) => ({
      position: {
        id: `fixture-position-${index}`,
        chamber,
        districtType,
        districtNumber,
        seatClass:
          chamber === "us-senate" ? `Class ${index === 3 ? "III" : "I"}` : null,
        status: "occupied",
        statusNote: null,
        sourceUrl: "https://example.gov/current-roster",
        lastVerifiedAt: "2026-08-22T00:00:00Z",
      },
      official: {
        id: `fixture-official-${index}`,
        slug,
        name,
        imageUrl: null,
        party: { code: party === "Republican" ? "R" : "D", label: party },
        office: {
          jurisdiction:
            chamber === "us-house" || chamber === "us-senate"
              ? "federal"
              : "state",
          chamber,
          title:
            chamber === "us-house"
              ? "U.S. Representative"
              : chamber === "us-senate"
                ? "U.S. Senator"
                : chamber === "state-senate"
                  ? "Nevada State Senator"
                  : "Nevada State Assembly Member",
          districtNumber,
          districtLabel:
            chamber === "us-senate"
              ? "Nevada statewide"
              : chamber === "us-house"
                ? `Nevada Congressional District ${districtNumber}`
                : chamber === "state-senate"
                  ? `Nevada Senate District ${districtNumber}`
                  : `Nevada Assembly District ${districtNumber}`,
          leadershipTitle: null,
        },
        term: { label: "Current term", startsOn: null, endsOn: null },
        sources: [
          {
            organization: "Official fixture source",
            sourceUrl: "https://example.gov/current-roster",
            externalId: `fixture-${index}`,
            retrievedAt: "2026-08-22T00:00:00Z",
            coverageLabel: "Current roster",
            documentSha256: "a".repeat(64),
            parserVersion: "fixture-v1",
            validationState: "source-verified",
          },
        ],
      },
    }),
  ),
};

test("home page exposes the Phase 3 representative lookup", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Understand who represents you.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Find who represents you" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Find my districts" }),
  ).toBeEnabled();
});

test("a confirmed lookup shows an accessible map and equivalent text", async ({
  page,
}) => {
  await page.route("**/api/lookup", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(confirmedLookup),
    }),
  );
  await page.goto("/", { waitUntil: "networkidle" });

  await page
    .getByRole("textbox", { name: "Find who represents you" })
    .fill("101 N Carson St, Carson City, NV 89701");
  const [response] = await Promise.all([
    page.waitForResponse("**/api/lookup"),
    page.getByRole("button", { name: "Find my districts" }).click(),
  ]);
  expect(response.ok()).toBe(true);

  const textResults = page.getByRole("list", {
    name: "District results in text",
  });
  await expect(
    textResults.getByText("Congressional District 2", { exact: true }),
  ).toBeVisible();
  await expect(
    textResults.getByText("State Senate District 16", { exact: true }),
  ).toBeVisible();
  await expect(
    textResults.getByText("State Assembly District 40", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Mark E. Amodei")).toBeVisible();
  await expect(page.getByText("Lisa Krasner")).toBeVisible();
  await expect(page.getByText("PK O’Neill")).toBeVisible();
  await expect(page.getByText("Catherine Cortez Masto")).toBeVisible();
  await expect(page.getByText("Jacky Rosen")).toBeVisible();
  await expect(
    page.getByRole("img", { name: /Your districts across Nevada/ }),
  ).toBeVisible();
  const addressCard = await page
    .locator(".lookup-experience__content")
    .boundingBox();
  const mapCard = await page.locator(".district-map").boundingBox();

  expect(addressCard).not.toBeNull();
  expect(mapCard).not.toBeNull();
  expect(Math.abs(addressCard!.width - mapCard!.width)).toBeLessThanOrEqual(1);
  expect(mapCard!.y).toBeGreaterThan(addressCard!.y + addressCard!.height);
  await expect(
    page.getByRole("textbox", { name: "Find who represents you" }),
  ).toHaveValue("");
});

test("a standardized official profile exposes sources and correction access", async ({
  page,
}) => {
  await page.goto("/officials/us-congress-a000369");

  await expect(
    page.getByRole("heading", { level: 1, name: "Mark E. Amodei" }),
  ).toBeVisible();
  await expect(
    page.locator(".official-profile__office", {
      hasText: "Nevada Congressional District 2",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sources and freshness" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Report a factual correction" }),
  ).toHaveAttribute("href", "/corrections");
});

test("home page has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

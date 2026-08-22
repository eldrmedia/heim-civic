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
};

test("home page exposes the Phase 2 district lookup", async ({ page }) => {
  await page.goto("/");

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
  await page.goto("/");

  await page
    .getByRole("textbox", { name: "Find who represents you" })
    .fill("101 N Carson St, Carson City, NV 89701");
  const responsePromise = page.waitForResponse("**/api/lookup");
  await page.getByRole("button", { name: "Find my districts" }).click();
  await expect(await responsePromise).toBeOK();

  await expect(page.getByText("Congressional District 2")).toBeVisible();
  await expect(page.getByText("State Senate District 16")).toBeVisible();
  await expect(page.getByText("State Assembly District 40")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Selected Nevada district boundaries" }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Find who represents you" }),
  ).toHaveValue("");
});

test("home page has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

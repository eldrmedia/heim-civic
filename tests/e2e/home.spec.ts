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

test("home page exposes the representative lookup", async ({ page }) => {
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
  ).toHaveAttribute(
    "href",
    "/corrections?record=%2Fofficials%2Fus-congress-a000369",
  );
  await expect(
    page.getByRole("link", { name: "View sourced bill record" }),
  ).toHaveAttribute("href", "/bills/us-119-hr1366");
  await expect(
    page.getByRole("link", { name: "View sourced finance overview" }),
  ).toHaveAttribute("href", "/finance/fec-h2nv02395-2026");
});

test("a pilot bill page exposes official summary, Nevada votes, and sources", async ({
  page,
}) => {
  await page.goto("/bills/us-119-hr1366");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Mining Regulatory Clarity Act",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "How Nevada lawmakers voted" }),
  ).toBeVisible();
  await expect(page.getByText("This text is not AI-generated.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Mark E. Amodei" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Official bill page/ }),
  ).toHaveAttribute(
    "href",
    "https://www.congress.gov/bill/119th-congress/house-bill/1366",
  );

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("the complete Nevada bill index distinguishes official and enhanced coverage", async ({
  page,
}) => {
  await page.goto("/bills");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Every source-listed 2025 Nevada bill, in one place.",
    }),
  ).toBeVisible();
  await expect(page.getByText("1,152", { exact: true }).first()).toBeVisible();

  await page.getByLabel("Bill number or official wording").fill("AB84");
  await page.getByLabel("Chamber").selectOption("assembly");
  await page.getByRole("button", { name: "Search bills" }).click();

  await expect(page.getByText("1 record matching “AB84”")).toBeVisible();
  await expect(page.getByText("Official index", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open official NELIS record" }),
  ).toHaveAttribute(
    "href",
    "https://www.leg.state.nv.us/App/NELIS/REL/83rd2025/Bill/11905/Overview",
  );

  await page.goto("/bills?q=AB83&coverage=automatic-qualifier");
  const ab83Card = page
    .locator(".bill-directory-card")
    .filter({ hasText: "AB83" });
  await expect(
    ab83Card.getByText("Enhanced coverage", { exact: true }),
  ).toBeVisible();
  await expect(
    ab83Card.getByText("Automatic veto qualifier", { exact: true }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("the enhanced bill selection log exposes every published Nevada record", async ({
  page,
}) => {
  await page.goto("/bills/selection");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A transparent queue for deeper bill review.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Accountable approvals", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Published after human review", { exact: true }),
  ).toHaveCount(30);
  await expect(page.locator(".selection-record")).toHaveCount(31);

  const ab83 = page.locator(".selection-record").filter({ hasText: "AB83" });
  await expect(
    ab83.getByText("Legacy approval evidence pending", { exact: true }),
  ).toBeVisible();
  await expect(
    ab83.getByRole("link", { name: "Open legacy bill record" }),
  ).toHaveAttribute("href", "/bills/nv-83-2025-ab83");

  const ab226 = page.locator(".selection-record").filter({ hasText: "AB226" });
  await expect(
    ab226.getByText("Budget and tax", { exact: true }),
  ).toBeVisible();
  await expect(
    ab226.getByRole("link", { name: "Open enhanced bill record" }),
  ).toHaveAttribute("href", "/bills/nv-83-2025-ab226");

  const ab44 = page.locator(".selection-record").filter({ hasText: "AB44" });
  await expect(
    ab44.getByRole("link", { name: "Open enhanced bill record" }),
  ).toHaveAttribute("href", "/bills/nv-83-2025-ab44");

  const ab79 = page.locator(".selection-record").filter({ hasText: "AB79" });
  await expect(
    ab79.getByText("Published after human review", { exact: true }),
  ).toBeVisible();
  await expect(
    ab79.getByRole("link", { name: "Open enhanced bill record" }),
  ).toHaveAttribute("href", "/bills/nv-83-2025-ab79");

  const ab204 = page.locator(".selection-record").filter({ hasText: "AB204" });
  await expect(
    ab204.getByText("Published after human review", { exact: true }),
  ).toBeVisible();
  await expect(
    ab204.getByRole("link", { name: "Open enhanced bill record" }),
  ).toHaveAttribute("href", "/bills/nv-83-2025-ab204");

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.goto("/bills/nv-83-2025-ab44");
  await expect(
    page.getByText(
      "No sponsor entity was captured in this reviewed source snapshot. Check the official bill page for the authoritative record.",
    ),
  ).toBeVisible();

  await page.goto("/bills/nv-83-2025-ab83");
  await expect(
    page.getByText(
      "This legacy record has enhanced source coverage, but standardized approval metadata is not yet available.",
      { exact: false },
    ),
  ).toBeVisible();

  await page.goto("/bills/nv-83-2025-ab82");
  await expect(
    page.getByText("Coverage limitations", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "The NELIS overview labels the listed Senate participants as co-sponsors, while the enrolled bill heading calls them joint sponsors; this record follows the NELIS overview role label.",
    ),
  ).toBeVisible();
});

test("a federal finance page preserves official categories and coverage limits", async ({
  page,
}) => {
  await page.goto("/finance/fec-h2nv02395-2026");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Mark E. Amodei campaign finance",
    }),
  ).toBeVisible();
  await expect(
    page.locator(".finance-page__headline-totals").getByText("$525,367.70"),
  ).toBeVisible();
  await expect(
    page.getByRole("row", { name: /Unitemized individual contributions/ }),
  ).toContainText("$977.70");
  await expect(
    page.getByRole("heading", { name: "Outside spending is separate" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /View candidate record at the FEC/ }),
  ).toHaveAttribute(
    "href",
    "https://www.fec.gov/data/candidate/H2NV02395/?cycle=2026&election_full=true",
  );

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("civic search discovers officials, districts, bills, and subjects", async ({
  page,
}) => {
  await page.goto("/search?q=Assembly+District+1");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Find a Nevada public record.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/results for “Assembly District 1”/),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Nevada Assembly District 1",
      exact: true,
    }),
  ).toBeVisible();

  await page.getByRole("searchbox").fill("Steven Horsford");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(
    page.getByRole("heading", { name: "Steven Horsford" }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("a district page provides statewide context, representation, and sources", async ({
  page,
}) => {
  await page.goto("/districts/state-senate-1");

  await expect(
    page.getByRole("heading", { level: 1, name: "Nevada Senate District 1" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Nevada Senate District 1 within Nevada" }),
  ).toBeVisible();
  await expect(
    page.getByText(/highlighted within the full Nevada outline/),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Michelee.*Cruz-Crawford/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View official boundary plan" }),
  ).toHaveAttribute(
    "href",
    "https://www.leg.state.nv.us/Division/Research/Districts/Reapp/2021/district-plans/",
  );
  await expect(
    page.getByRole("link", { name: "Report a factual correction" }),
  ).toHaveAttribute(
    "href",
    "/corrections?record=%2Fdistricts%2Fstate-senate-1",
  );

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("correction intake explains a failed delivery without claiming receipt", async ({
  page,
}) => {
  await page.goto("/corrections?record=%2Fofficials%2Fus-congress-a000369");

  await expect(page.getByLabel("Page or record")).toHaveValue(
    "/officials/us-congress-a000369",
  );
  await page
    .getByLabel("What appears to be incorrect?")
    .fill(
      "The committee assignment appears to be out of date according to the official roster.",
    );
  await page.getByLabel("Your email").fill("reader@example.com");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit factual correction" }).click();

  await expect(
    page.getByText(/Correction intake is temporarily unavailable/),
  ).toBeVisible();
  await expect(page.getByText(/No information was retained/)).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("waitlist requires consent and fails closed without a confirmation provider", async ({
  page,
}) => {
  await page.goto("/join");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Help shape the public pilot.",
    }),
  ).toBeVisible();
  await page.getByLabel("Email address").fill("reader@example.com");
  await page
    .getByLabel("Nevada ZIP or county (optional)")
    .fill("Washoe County");
  await page
    .getByLabel(/Send me a confirmation email for the Heim Civic Nevada/)
    .check();
  await page.getByRole("button", { name: "Join the waitlist" }).click();

  await expect(
    page.getByText(/The waitlist is temporarily unavailable/),
  ).toBeVisible();
  await expect(page.getByText(/information was not retained/)).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("trust disclosures expose coverage limits without enabling payment", async ({
  page,
}) => {
  await page.goto("/status");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "What is published—and when it was checked.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Nevada district boundaries" }),
  ).toBeVisible();
  await expect(page.getByText("67", { exact: true })).toBeVisible();

  await page.goto("/pricing");
  await expect(
    page.getByRole("heading", { level: 1, name: "The civic facts stay free." }),
  ).toBeVisible();
  await expect(page.getByText("$5 monthly", { exact: true })).toBeVisible();
  await expect(page.getByText("$10 monthly", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /checkout|purchase|buy/i }),
  ).toHaveCount(0);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("pilot operations expose discovery, readiness, and honest security states", async ({
  page,
  request,
}) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  await expect(health.json()).resolves.toMatchObject({
    schemaVersion: 1,
    scope: "published-snapshot-readiness",
    status: "ready",
  });

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/districts/congressional-1");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Disallow: /api/");

  await page.goto("/security");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Help us protect civic information.",
    }),
  ).toBeVisible();
  await expect(page.getByText(/This is a launch blocker/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /security@|mailto/i }),
  ).toHaveCount(0);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("home page has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

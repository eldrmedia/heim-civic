import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page exposes the Phase 1 foundation", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Understand who represents you.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Find who represents you" }),
  ).toBeDisabled();
});

test("home page has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

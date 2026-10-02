import { test, expect } from "@playwright/test";

test("all ten cards and all 81 runner details open, close and remain usable", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#race-r10")).toBeVisible();
  let count = 0;
  for (let number = 1; number <= 10; number++) {
    const card = page.locator(`#race-r${number}`);
    const title = card.locator(".tp-race-title");
    if ((await title.getAttribute("aria-expanded")) === "true")
      await title.click();
    await title.click();
    await expect(card.locator("table")).toBeVisible();
    const runners = card.locator("tbody .tp-link");
    for (let i = 0; i < (await runners.count()); i++) {
      await runners.nth(i).click();
      await expect(card.locator(".tp-runner-info")).toBeVisible();
      await runners.nth(i).click();
      await expect(card.locator(".tp-runner-info")).toHaveCount(0);
      count++;
    }
    await title.click();
    await expect(card.locator("table")).toHaveCount(0);
  }
  expect(count).toBe(81);
  expect(errors).toEqual([]);
});
test("horses, watchlist, news, source status and prediction history use canonical data", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Horses", exact: true }).click();
  await expect(
    page.getByText("81 declarations", { exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search horses" }).fill("ADMIRINGLY");
  const entry = page.locator(".tp-directory .tp-card");
  await expect(entry).toHaveCount(1);
  await entry.getByRole("button", { name: "ADMIRINGLY", exact: true }).click();
  await expect(
    entry.getByRole("heading", { name: "Why this estimate?" }),
  ).toBeVisible();
  await entry.getByRole("button", { name: "Watch runner" }).click();
  await expect(
    entry.getByRole("button", { name: "Remove from watchlist" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Track Alerts", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Meeting updates" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Source status", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Source health" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Performance", exact: true }).click();
  await page
    .getByRole("button", { name: "Prediction history", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Prediction history", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Race", { exact: true }).selectOption("r10");
  await expect(
    page.getByRole("heading", { name: "Initial estimate" }),
  ).toBeVisible();
  await expect(
    page.getByText("Awaiting official results").first(),
  ).toBeVisible();
});
test("corrupt watchlist and malformed API recover without a blank app", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("tp-watch-v1", "null"));
  await page.route("**/api/meeting", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "rctc-2026-10-03",
        races: Array(10).fill(null),
      }),
    }),
  );
  await page.goto("/");
  await expect(page.locator("#race-r10")).toBeVisible();
  await expect(
    page.getByText("Live updates are temporarily unavailable.", {
      exact: false,
    }),
  ).toBeVisible({ timeout: 15000 });
  await page.locator("#race-r10 .tp-race-title").click();
  await expect(page.locator("#race-r10 table")).toBeVisible();
});
test("AI provider failure is honest, contextual race action and operator route work", async ({
  page,
}) => {
  await page.route("**/api/ai-brain", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"provider error should not appear"}',
    }),
  );
  await page.goto("/");
  await page
    .locator("#race-r8")
    .getByRole("button", { name: "Explain this race" })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Question for race assistant" }),
  ).toHaveValue(/Explain R8/);
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(
    page.getByText("Analysis is unavailable right now.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("provider error should not appear")).toHaveCount(
    0,
  );
  await page.goto("/ops");
  await expect(
    page.getByRole("heading", { name: "Operator console" }),
  ).toBeVisible();
  await page.getByLabel("Operator password").fill("incorrect");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByText("Operator authentication required", { exact: true }),
  ).toBeVisible();
});

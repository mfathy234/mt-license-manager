import { expect, test } from "@playwright/test";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test("creates the first local admin and signs in", async ({ page }) => {
  test.skip(!email || !password, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.");

  await page.goto("/setup");

  if (await page.getByRole("heading", { name: "First admin setup" }).isVisible()) {
    await page.getByLabel("Name").fill("Local Admin");
    await page.getByLabel("Email").fill(email!);
    await page.getByRole("textbox", { name: "Password" }).fill(password!);
    await page.getByRole("button", { name: "Create admin" }).click();
    await expect(page).toHaveURL(/\/login$/);
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByRole("textbox", { name: "Password" }).fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

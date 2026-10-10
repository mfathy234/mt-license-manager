import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.beforeEach(async ({ page }) => {
  test.skip(!email || !password, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.");
  await signIn(page);
});

test("critical workspaces remain responsive and overflow-free", async ({
  page,
}) => {
  const routes = [
    ["/dashboard", "Dashboard"],
    ["/licenses", "Licenses"],
    ["/recipients", "Recipients"],
    ["/settings/lookups", "Lookups"],
  ] as const;

  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(documentWidth, `${route} must not overflow the ${viewportWidth}px viewport`).toBeLessThanOrEqual(viewportWidth);
  }

  await page.goto("/licenses");
  await expect(page.getByRole("search", { name: "License search and filters" })).toBeVisible();
  await expect(page.locator("[data-native-scroll]")).toHaveCount(1);
  const licenseTable = page.locator('div[data-native-scroll][aria-label="License results"]');
  if ((await page.viewportSize())!.width >= 1024) {
    await expect(licenseTable).toBeVisible();
  } else {
    await expect(licenseTable).toBeHidden();
    await expect(page.locator('section[aria-label="License results"]')).toBeVisible();
  }
});

test("theme, keyboard focus, and reduced motion remain accessible", async ({
  page,
}) => {
  await page.goto("/dashboard");

  const openNavigation = page.getByRole("button", { name: "Open navigation" });
  if (await openNavigation.isVisible()) await openNavigation.click();

  const darkMode = page.getByRole("button", { name: "Switch to dark mode" });
  await darkMode.scrollIntoViewIfNeeded();
  await darkMode.click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  const navigationDialog = page.getByRole("dialog", {
    name: "Application navigation",
  });
  if (await navigationDialog.isVisible()) {
    await navigationDialog
      .getByRole("button", { name: "Close navigation" })
      .click();
  }

  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/licenses");
  await expect(page.getByRole("heading", { name: "Licenses", level: 1 })).toBeVisible();
});

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByRole("textbox", { name: "Password" }).fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

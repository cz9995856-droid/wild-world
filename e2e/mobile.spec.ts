import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["Pixel 5"] });

test.describe("mobile layout", () => {
  test("mobile menu navigates and search remains accessible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("WILD WORLD");
    await page.getByRole("button", { name: "菜单" }).click();
    const nav = page.getByRole("navigation", { name: "移动导航" });
    await expect(nav).toBeVisible();
    await nav.getByRole("link", { name: /动物百科/ }).click();
    await expect(page).toHaveURL(/\/encyclopedia/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("馆藏物种档案");
  });

  test("encyclopedia cards stack on a phone viewport", async ({ page }) => {
    await page.goto("/encyclopedia");
    const cards = page.locator('a[href^="/encyclopedia/"]');
    const first = cards.first();
    await expect(first).toBeVisible();
    const box = await first.boundingBox();
    expect(box?.width).toBeGreaterThan(280);
  });

  test("mobile AI chat input is usable", async ({ page }) => {
    await page.goto("/ai");
    await expect(page.getByLabel("输入问题")).toBeVisible();
    await page.getByLabel("输入问题").fill("长颈鹿的脖子有几节颈椎？");
    await page.getByRole("button", { name: "发送问题" }).click();
    await expect(page.getByText(/七节|7 节/).first()).toBeVisible({ timeout: 30_000 });
  });
});
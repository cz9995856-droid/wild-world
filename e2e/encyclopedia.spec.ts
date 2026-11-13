import { test, expect } from "@playwright/test";

test.describe("encyclopedia, search and favourites", () => {
  test("searches the collection, opens a species and saves it", async ({ page }) => {
    await page.goto("/encyclopedia");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("馆藏物种档案");

    await page.getByLabel("搜索馆藏物种").fill("雪豹");
    const card = page.locator('a[href="/encyclopedia/snow-leopard"]').first();
    await expect(card).toBeVisible();
    await card.click();

    await expect(page.getByRole("heading", { level: 1 })).toContainText("雪豹");
    await expect(page.getByText("Panthera uncia").first()).toBeVisible();
    await expect(page.getByText(/资料状态：编辑整理/)).toBeVisible();

    await page.getByRole("button", { name: "收藏该物种" }).click();
    await expect(page.getByRole("button", { name: "取消收藏" })).toBeVisible();

    await page.goto("/favorites");
    await expect(page.getByRole("link", { name: /雪豹/ }).first()).toBeVisible();
  });

  test("global search overlay finds a species and supports keyboard", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "搜索" }).first().click();
    const dialog = page.getByRole("dialog", { name: "全站搜索" });
    await expect(dialog).toBeVisible();
    const input = dialog.getByLabel("搜索关键词");
    await input.fill("雪豹");
    await expect(dialog.getByText("雪豹").first()).toBeVisible();
    await input.press("Enter");
    await expect(page).toHaveURL(/\/encyclopedia\/snow-leopard/);
  });

  test("search results page exposes grouped counts and 404 for missing species", async ({ page, request }) => {
    await page.goto("/search?q=%E5%A4%A7%E7%86%8A%E7%8C%AB");
    await expect(page.getByText("物种档案").first()).toBeVisible();
    await expect(page.locator('a[href="/encyclopedia/giant-panda"]').first()).toBeVisible();

    const response = await request.get("/encyclopedia/not-a-real-animal");
    expect(response.status()).toBe(404);
  });
});
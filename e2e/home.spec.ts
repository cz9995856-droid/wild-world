import { test, expect } from "@playwright/test";

test.describe("homepage and news center", () => {
  test("renders the immersive hero and scrolls to the newsroom", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("WILD WORLD");
    await expect(page.getByRole("link", { name: /进入新闻中心/ })).toBeVisible();

    const newsSection = page.locator("#news");
    await expect(newsSection).toBeAttached();
    await page.getByRole("button", { name: /向下滚动到新闻中心|Scroll down to the newsroom/ }).click();
    await expect(newsSection).toBeInViewport({ timeout: 5000 });
    await expect(newsSection).toContainText("来自野外的消息");
  });

  test("customizes, persists and resets homepage sections", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /自定义首页|Customize home/ }).click();
    const dialog = page.getByRole("dialog", { name: /自定义首页/ });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "隐藏 纪录片" }).click();
    await dialog.getByRole("button", { name: "完成" }).click();
    await expect(page.getByRole("heading", { name: "去官方平台，看完整的自然" })).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole("heading", { name: "去官方平台，看完整的自然" })).toHaveCount(0);

    await page.getByRole("button", { name: /自定义首页|Customize home/ }).click();
    await page.getByRole("button", { name: "恢复默认" }).click();
    await page.getByRole("button", { name: "完成" }).click();
    await expect(page.getByRole("heading", { name: "去官方平台，看完整的自然" })).toBeVisible();
  });
});
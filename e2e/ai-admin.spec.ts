import { test, expect } from "@playwright/test";

test.describe("AI and admin", () => {
  test("AI answers from the local knowledge base with sources", async ({ page }) => {
    await page.goto("/ai");
    const input = page.getByLabel("输入问题");
    await input.fill("大熊猫主要吃什么？");
    await input.press("Enter");
    await expect(page.getByText(/本地知识库检索模式/).last()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/竹/).first()).toBeVisible();
    await expect(page.getByText("Sources").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /大熊猫 馆藏档案/ })).toBeVisible();
  });

  test("admin login, species edit modal and logout work", async ({ page }) => {
    await page.goto("/admin");
    const password = process.env.ADMIN_PASSWORD;
    const passwordField = page.getByLabel("密码");
    if (!password || (await passwordField.count()) === 0) {
      test.skip(true, "Set ADMIN_PASSWORD and enable /admin before running this test");
      return;
    }
    await passwordField.fill(password);
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page.getByRole("heading", { name: "WILD WORLD 后台" })).toBeVisible();

    await page.getByRole("button", { name: "物种档案" }).click();
    await expect(page.getByText("保护等级").first()).toBeVisible();
    await page.getByRole("button", { name: "编辑" }).first().click();
    await expect(page.getByText("Edit species")).toBeVisible();
    await page.getByRole("button", { name: "取消" }).click();

    await page.getByRole("button", { name: "退出" }).click();
    await expect(page.getByRole("button", { name: "登录" })).toBeVisible();
  });
});
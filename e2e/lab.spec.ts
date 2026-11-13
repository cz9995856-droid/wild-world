import { test, expect } from "@playwright/test";

test.describe("interaction lab", () => {
  test("3D, anatomy, sound, quiz and feeding modules work", async ({ page }) => {
    await page.goto("/lab");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("动手之后");
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("这不是标本扫描")).toBeVisible();

    await page.getByRole("button", { name: /身体结构/ }).first().click();
    await page.getByRole("button", { name: "查看 象牙 的结构说明" }).click();
    await expect(page.getByText("上颌门齿，终生生长").first()).toBeVisible();
    await page.getByRole("button", { name: "骨骼" }).click();
    await expect(page.getByRole("button", { name: "查看 颅骨与气腔 的结构说明" })).toBeVisible();

    await page.getByRole("button", { name: /声音实验室/ }).first().click();
    await expect(page.getByText("录音目录")).toBeVisible();
    await expect(page.getByText(/iNaturalist · 已接入/)).toBeVisible();

    await page.getByRole("button", { name: /知识挑战/ }).first().click();
    await expect(page.getByText("题目与解析为馆方编辑整理")).toBeVisible();
    const options = page.locator("button").filter({ hasText: /^[A-D]/ });
    if ((await options.count()) > 0) {
      await options.first().click();
      await expect(page.getByText(/回答正确|再想一想/)).toBeVisible();
      await expect(page.getByText(/来源：/).first()).toBeVisible();
    }

    await page.getByRole("button", { name: /喂养模拟/ }).first().click();
    await expect(page.getByRole("heading", { name: /的食性结构/ })).toBeVisible();
    await expect(page.getByText("这是教育模拟")).toBeVisible();
    await page.getByRole("button", { name: "对照参考结构" }).click();
    await expect(page.getByText(/结构接近参考|与参考结构差异较大/)).toBeVisible();
  });

  test("geo module uses live data status instead of fake points", async ({ page }) => {
    await page.goto("/lab#geo");
    await expect(page.getByText(/选择物种后|不是“没有分布”|GBIF/).first()).toBeVisible();
    await expect(page.getByText(/图例/)).toBeVisible({ timeout: 30_000 });
  });
});
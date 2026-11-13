import { test, expect } from "@playwright/test";

test.describe("news, photography and catalogue tools", () => {
  test("filters real RSS news and opens a detail page", async ({ page }) => {
    await page.goto("/news");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("来自源站的野生动物新闻");
    await expect(page.getByText(/RSS 已连接/).first()).toBeVisible();
    await expect(page.getByText(/网络阻断/).first()).toBeVisible();

    await page.getByRole("button", { name: /动物保护/ }).first().click();
    const firstArticle = page.locator("article").first();
    await expect(firstArticle).toBeVisible();
    await firstArticle.getByRole("link").first().click();
    await expect(page.getByRole("link", { name: /阅读原文/ })).toBeVisible();
    await expect(page.getByText(/版权说明|Rights/)).toBeVisible();
  });

  test("photography lightbox exposes author, licence and download policy", async ({ page }) => {
    await page.goto("/photography");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("影像不是装饰");
    const first = page.getByRole("button", { name: /打开图片/ }).first();
    await first.click();
    const dialog = page.getByRole("dialog", { name: /图片查看器/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/许可：/)).toBeVisible();
    await expect(dialog.getByText(/来源：iNaturalist/)).toBeVisible();
    await expect(dialog.getByText(/该许可不提供直接下载|下载/).first()).toBeVisible();
    await dialog.getByRole("button", { name: "关闭图片查看器" }).click();
  });

  test("compare tool keeps missing data explicit", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("同一种问题");
    await expect(page.getByRole("cell", { name: /资料待补充|厘米|公斤/ }).first()).toBeVisible();
    await expect(page.getByText("比较规则")).toBeVisible();
  });

  test("rankings show caveats and sources", async ({ page }) => {
    await page.goto("/rankings");
    await expect(page.getByText("体重之最")).toBeVisible();
    await expect(page.getByText(/俯冲/).first()).toBeVisible();
    await expect(page.getByText(/评估年份/).first()).toBeVisible();
  });

  test("timeline distinguishes classification from phylogeny", async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.getByText("林奈分类树（taxonomic classification）· 不是系统发育树")).toBeVisible();
    await expect(page.getByText("分类 ≠ 进化关系")).toBeVisible();
  });
});
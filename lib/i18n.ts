export type Locale = "zh" | "en";

export const LOCALE_COOKIE = "ww_locale";

type Dict = Record<string, { zh: string; en: string }>;

export const DICT: Dict = {
  "nav.encyclopedia": { zh: "动物百科", en: "Encyclopedia" },
  "nav.explore": { zh: "探索", en: "Explore" },
  "nav.lab": { zh: "互动实验室", en: "Lab" },
  "nav.map": { zh: "地图", en: "Map" },
  "nav.photography": { zh: "摄影馆", en: "Photography" },
  "nav.videos": { zh: "纪录片", en: "Films" },
  "nav.news": { zh: "新闻", en: "News" },
  "nav.search": { zh: "搜索", en: "Search" },
  "nav.favorites": { zh: "收藏", en: "Favorites" },
  "nav.menu": { zh: "菜单", en: "Menu" },
  "nav.close": { zh: "关闭", en: "Close" },
  "common.explore": { zh: "进入探索", en: "Explore" },
  "common.readMore": { zh: "阅读更多", en: "Read more" },
  "common.viewAll": { zh: "查看全部", en: "View all" },
  "common.loading": { zh: "加载中", en: "Loading" },
  "common.empty": { zh: "暂无内容", en: "No content yet" },
  "common.search": { zh: "搜索", en: "Search" },
  "common.filter": { zh: "筛选", en: "Filter" },
  "common.reset": { zh: "重置", en: "Reset" },
  "common.save": { zh: "保存", en: "Save" },
  "common.cancel": { zh: "取消", en: "Cancel" },
  "common.source": { zh: "来源", en: "Source" },
  "common.license": { zh: "许可", en: "License" },
  "common.retrieved": { zh: "获取时间", en: "Retrieved" },
  "common.published": { zh: "发布日期", en: "Published" },
  "common.review": { zh: "审核状态", en: "Review" },
  "common.updated": { zh: "更新时间", en: "Updated" },
  "common.dataStatus": { zh: "数据状态", en: "Data status" },
  "common.original": { zh: "查看原文", en: "Original" },
  "common.official": { zh: "官方页面", en: "Official page" },
  "common.download": { zh: "下载", en: "Download" },
  "home.scroll": { zh: "向下滚动，进入新闻中心", en: "Scroll to explore" },
  "home.heroTitle": { zh: "地球上的生命，值得被认真观看。", en: "Life on Earth deserves to be seen closely." },
  "home.heroIntro": {
    zh: "一座以可追溯来源、逐张核验影像许可与沉浸式叙事构建的数字动物自然博物馆。",
    en: "A digital museum of animal life built on traceable sources, individually verified media licenses and immersive storytelling.",
  },
  "home.searchPlaceholder": { zh: "搜索物种、学名或关键词", en: "Search species, scientific names or keywords" },
  "news.title": { zh: "新闻中心", en: "Newsroom" },
  "news.subtitle": {
    zh: "只聚合允许的 RSS 源。标题、发布日期、来源与原文链接均来自源站；AI 摘要需审核后发布。",
    en: "Aggregated only from permitted RSS feeds. Titles, dates and links come from the source; AI summaries require review.",
  },
  "species.title": { zh: "动物百科", en: "Animal Encyclopedia" },
  "footer.rights": { zh: "数字自然博物馆 · 内容仅供教育与研究参考", en: "Digital natural history museum · for education and research" },
};

export function t(key: string, locale: Locale): string {
  return DICT[key]?.[locale] ?? key;
}

export function localePath(path: string, locale: Locale): string {
  if (locale === "zh") return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}lang=en`;
}
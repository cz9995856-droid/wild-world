import type { NewsCategory } from "@/lib/types";

export const NEWS_CATEGORIES: { key: NewsCategory; label: string; en: string }[] = [
  { key: "new_species", label: "新物种发现", en: "New Species" },
  { key: "conservation", label: "动物保护", en: "Conservation" },
  { key: "research", label: "动物研究", en: "Research" },
  { key: "environment", label: "环境变化", en: "Environment" },
  { key: "incident", label: "野生动物事件", en: "Wildlife Events" },
  { key: "zoo", label: "动物园动态", en: "Zoos" },
];

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = NEWS_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.key]: c.label }),
  {} as Record<NewsCategory, string>
);

export const NEWS_SOURCES = [
  {
    id: "mongabay",
    name: "Mongabay",
    homepage: "https://news.mongabay.com/",
    feed: "https://news.mongabay.com/feed/",
    focus: "热带雨林、保护政策与社区新闻",
    status: "connected",
  },
  {
    id: "nature",
    name: "Nature",
    homepage: "https://www.nature.com/",
    feed: "https://www.nature.com/nature.rss",
    focus: "同行评议研究与科学政策",
    status: "connected",
  },
  {
    id: "sciencedaily",
    name: "ScienceDaily",
    homepage: "https://www.sciencedaily.com/",
    feed: "https://www.sciencedaily.com/rss/plants_animals.xml",
    focus: "植物与动物研究新闻聚合",
    status: "connected",
  },
  {
    id: "physorg",
    name: "Phys.org",
    homepage: "https://phys.org/",
    feed: "https://phys.org/rss-feed/biology-news/plants-animals/",
    focus: "生物学与地球科学研究动态",
    status: "connected",
  },
  {
    id: "bbc",
    name: "BBC Science & Environment",
    homepage: "https://www.bbc.com/news/science_and_environment",
    feed: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    focus: "科学与环境报道",
    status: "blocked",
    note: "当前部署环境网络策略阻断了 BBC RSS，后台记录为失败，不伪造连接状态。",
  },
  {
    id: "natgeo",
    name: "National Geographic Animals",
    homepage: "https://www.nationalgeographic.com/animals/",
    feed: null,
    focus: "动物故事与影像报道",
    status: "permission_required",
    note: "无公开 RSS；仅提供官方站点外链，需授权后才能同步内容。",
  },
  {
    id: "wwf",
    name: "WWF",
    homepage: "https://www.worldwildlife.org/",
    feed: "https://www.worldwildlife.org/rss/news",
    focus: "保护项目与物种倡议",
    status: "blocked",
    note: "RSS 返回 403（Cloudflare 挑战），未接入。",
  },
  {
    id: "smithsonian",
    name: "Smithsonian",
    homepage: "https://www.si.edu/",
    feed: null,
    focus: "博物馆研究与藏品故事",
    status: "permission_required",
    note: "需使用 Smithsonian Open Access API Key 或人工导入。",
  },
];

export function categoryLabel(key: NewsCategory): string {
  return NEWS_CATEGORY_LABEL[key] ?? "综合";
}
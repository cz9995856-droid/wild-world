import type { NewsArticle, Species } from "@/lib/types";

export interface SearchHit {
  type: "species" | "news" | "page";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
  score: number;
  badge?: string;
}

export interface SearchOptions {
  limit?: number;
  types?: Array<SearchHit["type"]>;
  category?: string;
}

const PAGES = [
  { title: "动物百科", subtitle: "按分类浏览全部馆藏物种", href: "/encyclopedia", keywords: ["百科", "物种", "动物", "encyclopedia"] },
  { title: "全球动物地图", subtitle: "GBIF 与 iNaturalist 观测点", href: "/map", keywords: ["地图", "分布", "观测", "map"] },
  { title: "互动实验室", subtitle: "3D、解剖、声音、测验与喂养模拟", href: "/lab", keywords: ["实验", "3d", "声音", "测验", "喂食"] },
  { title: "高清摄影馆", subtitle: "逐张标注许可的野生动物影像", href: "/photography", keywords: ["摄影", "图片", "画廊", "photo"] },
  { title: "纪录片专区", subtitle: "官方观看入口", href: "/videos", keywords: ["纪录片", "视频", "影片", "film"] },
  { title: "濒危动物专题", subtitle: "保护等级、趋势与威胁", href: "/conservation", keywords: ["濒危", "保护", "iucn", "红名单"] },
  { title: "进化时间线", subtitle: "从寒武纪到第四纪", href: "/timeline", keywords: ["进化", "化石", "时间线", "演化"] },
  { title: "AI 动物问答", subtitle: "基于馆藏知识库的回答", href: "/ai", keywords: ["ai", "问答", "提问"] },
  { title: "新闻中心", subtitle: "真实 RSS 来源的动物新闻", href: "/news", keywords: ["新闻", "资讯", "rss"] },
  { title: "数据与许可", subtitle: "数据源清单、许可与待授权事项", href: "/sources", keywords: ["来源", "许可", "数据", "license"] },
];

function normalize(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreText(haystack: string, needle: string): number {
  if (!needle) return 0;
  const h = normalize(haystack);
  const n = normalize(needle);
  if (h === n) return 100;
  if (h.startsWith(n)) return 70;
  if (h.includes(n)) return 45;
  const parts = n.split(" ");
  const hits = parts.filter((p) => p.length > 1 && h.includes(p)).length;
  return hits > 0 ? Math.min(30, hits * 12) : 0;
}

export function searchAll(
  query: string,
  species: Species[],
  news: NewsArticle[],
  options: SearchOptions = {}
): SearchHit[] {
  const q = normalize(query);
  if (!q) return [];
  const limit = options.limit ?? 24;
  const types = options.types ?? ["species", "news", "page"];
  const hits: SearchHit[] = [];

  if (types.includes("species")) {
    for (const s of species) {
      if (options.category && options.category !== "all" && s.group !== options.category) continue;
      const weighted =
        scoreText(s.name_cn, q) * 3 +
        scoreText(s.name_en, q) * 2.4 +
        scoreText(s.scientific_name, q) * 2.2 +
        scoreText(s.aliases.join(" "), q) * 1.4 +
        scoreText(`${s.tagline} ${s.summary}`, q) * 0.5 +
        scoreText(`${s.taxonomy.family} ${s.taxonomy.order} ${s.group_label}`, q) * 0.4;
      if (weighted <= 0) continue;
      hits.push({
        type: "species",
        id: s.id,
        title: s.name_cn,
        subtitle: `${s.name_en} · ${s.scientific_name}`,
        href: `/encyclopedia/${s.slug}`,
        keywords: s.fun_facts.slice(0, 2),
        score: weighted,
        badge: s.conservation.status_label,
      });
    }
  }

  if (types.includes("news")) {
    for (const n of news) {
      const weighted =
        scoreText(n.title_original, q) * 2 +
        scoreText(n.title_cn ?? "", q) * 2.4 +
        scoreText(n.summary_cn ?? "", q) * 1.2 +
        scoreText(n.excerpt_original, q) * 0.6 +
        scoreText(n.keywords.join(" "), q) * 1.2 +
        scoreText(n.source_name, q) * 0.3;
      if (weighted <= 0) continue;
      hits.push({
        type: "news",
        id: n.id,
        title: n.title_cn ?? n.title_original,
        subtitle: `${n.source_name} · ${n.published_at.slice(0, 10)}`,
        href: `/news/${n.slug}`,
        keywords: n.keywords,
        score: weighted,
        badge: n.review_status === "pending_review" ? "待审核" : "已发布",
      });
    }
  }

  if (types.includes("page")) {
    for (const p of PAGES) {
      const weighted = scoreText(p.title, q) * 2 + scoreText(p.keywords.join(" "), q);
      if (weighted <= 0) continue;
      hits.push({
        type: "page",
        id: p.href,
        title: p.title,
        subtitle: p.subtitle,
        href: p.href,
        keywords: p.keywords,
        score: weighted,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function suggestSpecies(query: string, species: Species[], limit = 6): Species[] {
  const q = normalize(query);
  if (!q) return [];
  return species
    .map((s) => ({
      s,
      score:
        scoreText(s.name_cn, q) * 3 +
        scoreText(s.name_en, q) * 2 +
        scoreText(s.scientific_name, q) * 2 +
        scoreText(s.aliases.join(" "), q) * 1.5,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}
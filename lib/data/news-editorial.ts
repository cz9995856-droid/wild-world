import type { NewsArticle } from "@/lib/types";

export interface NewsEditorialOverride {
  title_cn: string;
  summary_cn: string;
  keywords: string[];
  category?: NewsArticle["category"];
  featured?: boolean;
}

const NOTE =
  "中文标题与摘要由馆方编辑依据 RSS 摘要翻译整理，未逐句核对原文；原文标题、链接与发布日期保持不变。";

export const NEWS_EDITORIAL: Record<string, NewsEditorialOverride> = {
  "https://news.mongabay.com/short-article/2026/11/in-india-volunteers-map-riverside-trees-to-make-a-case-for-urban-conservation/":
    {
      title_cn: "印度浦那志愿者绘制河岸树木地图，为城市保护提供证据",
      summary_cn:
        "浦那居民每个周末沿河岸记录树木，希望在城市开发项目启动时，以系统化的树木地图作为保护城市绿地的依据。这项工作把公民参与转化为可引用的规划证据。",
      keywords: ["城市生态", "公民科学", "树木地图", "印度"],
      category: "conservation",
      featured: true,
    },
  "https://news.mongabay.com/short-article/2026/11/can-an-ancient-european-forest-be-saved-while-securing-polands-border/":
    {
      title_cn: "保护古老森林与守卫波兰边境，能否同时做到？",
      summary_cn:
        "横跨波兰与白俄罗斯边界的比亚沃维耶扎森林是欧洲仅存的原始林地之一，长期受到排水、干旱与栖息地破碎化压力。边境安全工程可能进一步影响这片森林，保护与安全之间的取舍引发关注。",
      keywords: ["比亚沃维耶扎森林", "栖息地破碎化", "边境工程"],
      category: "environment",
      featured: true,
    },
  "https://phys.org/news/2026-11-black-rhinos-loners-species.html":
    {
      title_cn: "黑犀并非总是独行：社会行为研究对保护意味着什么",
      summary_cn:
        "黑犀以攻击性强和独居著称，同类争斗造成的伤害甚至是常见死因。新的观察显示它们的社会行为比想象中复杂，这一认识可能影响保护区管理与种群恢复策略。",
      keywords: ["黑犀", "社会行为", "保护管理"],
      category: "conservation",
      featured: true,
    },
  "https://phys.org/news/2026-11-ghosts-curiosity-fearlessness-apparent-german.html":
    {
      title_cn: "德国牧羊犬的基因差异：工作犬更好奇，展示犬更易焦虑",
      summary_cn:
        "乌普萨拉大学与瑞典农业科学大学的研究发现，为工作培育的德国牧羊犬比展示犬更好奇、神经质程度更低，这些行为差异也能在基因层面观察到。",
      keywords: ["德国牧羊犬", "行为遗传学", "驯化"],
      category: "research",
    },
  "https://phys.org/news/2026-11-parrots-vibrant-feathers-susceptible-bacterial.html":
    {
      title_cn: "艳丽羽毛的代价：鹦鹉羽色可能更易受细菌侵蚀",
      summary_cn:
        "从孔雀到鹦鹉，鲜艳羽色长期被用于研究性选择与进化。新研究提示，色彩除了传递信号，还可能与羽毛对细菌攻击的易感性相关，显示色彩演化存在权衡。",
      keywords: ["羽毛", "细菌", "性选择", "鹦鹉"],
      category: "research",
      featured: true,
    },
  "https://phys.org/news/2026-11-europe-alike-alpine-newts-distinct.html":
    {
      title_cn: "欧洲“同款”高山蝾螈其实是五个独立物种",
      summary_cn:
        "莱顿大学的遗传研究发现，此前被归为同一种的高山蝾螈实际包含五个物种，其中一个为新种，命名为 Mesotriton similis。这提醒分类修订会直接影响保护单元的划分。",
      keywords: ["高山蝾螈", "隐存种", "分类修订", "遗传研究"],
      category: "new_species",
      featured: true,
    },
  "https://phys.org/news/2026-11-genetic-reveal-hidden-extinction-deep.html":
    {
      title_cn: "深海并非避难所：遗传数据揭示隐藏的灭绝风险",
      summary_cn:
        "以往观点认为深海生物受人类影响较小，甚至可充当海洋生命的避难所。佛罗里达国际大学团队发表于 Nature Communications 的研究认为，这一假设可能严重低估了深海生物多样性的风险。",
      keywords: ["深海", "灭绝风险", "遗传多样性", "海洋保护"],
      category: "conservation",
    },
  "https://news.mongabay.com/short-article/2026/11/in-brazils-prey-rich-pantanal-jaguars-reveal-a-surprisingly-social-side/":
    {
      title_cn: "猎物丰富的潘塔纳尔湿地：美洲豹展现出意外的社会性",
      summary_cn:
        "美洲豹通常被视为独居猫科动物，只在交配或育幼时容忍同类。巴西潘塔纳尔湿地的新研究发现，当地美洲豹常成对活动，社会性远超预期；该湿地拥有全球最高的美洲豹密度。",
      keywords: ["美洲豹", "潘塔纳尔", "社会行为", "猫科"],
      category: "research",
      featured: true,
    },
  "https://phys.org/news/2026-11-ocean-base-marine-food-web.html":
    {
      title_cn: "变暖的海洋正在改变海洋食物网的基底",
      summary_cn:
        "海洋升温会加剧海水层化，使不同密度的水层更难混合，进而影响营养盐供应与浮游生物生产。研究关注这种变化如何从食物网基底向上传导。",
      keywords: ["海洋变暖", "层化", "浮游生物", "食物网"],
      category: "environment",
    },
  "https://news.mongabay.com/short-article/2026/11/us-renews-push-to-open-pacific-marine-protected-area-to-fishing/":
    {
      title_cn: "美国再次推动在太平洋海洋保护区内开放商业捕鱼",
      summary_cn:
        "美国政府公布拟议规则，计划在覆盖岛屿、环礁、海山与珊瑚礁系统的太平洋海洋保护区内开放商业捕鱼，涉及面积超过加利福尼亚州的两倍。规则由 NOAA 于 11 月 9 日发布。",
      keywords: ["海洋保护区", "商业捕鱼", "NOAA", "珊瑚礁"],
      category: "conservation",
    },
};

export const NEWS_EDITORIAL_NOTE = NOTE;

export function applyEditorial(article: NewsArticle): NewsArticle {
  const override = NEWS_EDITORIAL[article.original_url];
  if (!override) return article;
  return {
    ...article,
    title_cn: override.title_cn,
    summary_cn: override.summary_cn,
    summary_status: "manual",
    keywords: override.keywords,
    category: override.category ?? article.category,
    featured: override.featured ?? article.featured,
    ai_generated: false,
    review_status: "editorial",
    license_note: `${article.license_note} ${NOTE}`,
  };
}
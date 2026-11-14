import type { Metadata } from "next";
import { HomeHero } from "@/components/home/hero";
import { HomeSections, type HomeSectionItem } from "@/components/home/home-sections";
import { RandomExplorer } from "@/components/home/random-explorer";
import {
  AiTeaser,
  CategorySection,
  CompareTeaser,
  ConservationSection,
  DailySection,
  FeaturedSection,
  LabTeaser,
  MapTeaser,
  NewsSection,
  PhotographySection,
  RankingsSection,
  TimelineTeaser,
  VideosSection,
} from "@/components/home/sections";
import {
  getDailySpecies,
  getAllSpecies,
  getMediaAssets,
  getNews,
  getNewsMeta,
  getSiteSettings,
  getVideos,
} from "@/lib/repository";
import { NEWS_SOURCES } from "@/lib/data/news-meta";
import { buildNewsVisuals } from "@/lib/news-visual";
import { hashString } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WILD WORLD · 全球数字动物自然博物馆",
  description:
    "WILD WORLD 是一座面向公众的数字动物自然博物馆：可追溯的物种档案、逐张核验的影像许可、真实观测地图与互动实验室。",
};

export default async function HomePage() {
  const [species, media, news, newsMeta, settings] = await Promise.all([
    getAllSpecies(),
    getMediaAssets(),
    getNews(),
    getNewsMeta(),
    getSiteSettings(),
  ]);
  const daily = await getDailySpecies();
  const videos = getVideos();
  const newsVisuals = buildNewsVisuals(media, species);

  const covers: Record<string, string> = {};
  for (const asset of media) {
    const sp = species.find((s) => s.id === asset.species_id);
    if (sp && !covers[sp.slug]) covers[sp.slug] = asset.url;
  }

  const diversePhotos: typeof media = [];
  const seenMediaSpecies = new Set<string>();
  for (const asset of media) {
    const key = asset.species_id ?? asset.id;
    if (seenMediaSpecies.has(key)) continue;
    seenMediaSpecies.add(key);
    diversePhotos.push(asset);
  }

  const counts: Record<string, number> = {};
  for (const s of species) counts[s.group] = (counts[s.group] ?? 0) + 1;

  const categoryImages: Record<string, string> = {};
  for (const group of ["mammal", "bird", "reptile", "amphibian", "fish", "insect"]) {
    const withPhoto = species.find((s) => s.group === group && covers[s.slug]);
    if (withPhoto) categoryImages[group] = covers[withPhoto.slug];
  }

  const featured = species.filter((s) => s.featured).slice(0, 4);
  const featuredList = featured.length >= 4 ? featured : species.slice(0, 4);
  const focusNews = news.slice(0, 5);
  const videoCredits: Record<string, { author: string; license: string; source_url: string }> = {};
  settings.hero_images.forEach((url, index) => {
    const credit = settings.hero_credits[index];
    if (credit) videoCredits[url] = { author: credit.author, license: credit.license, source_url: credit.source_url };
  });
  const connectedSources = NEWS_SOURCES.filter((s) => s.status === "connected").length;

  const todayKey = new Date().toISOString().slice(0, 10);
  const seed = hashString(todayKey);
  const randomInitial = [...species]
    .sort((a, b) => hashString(a.slug + seed) - hashString(b.slug + seed))
    .slice(0, 4);

  const sections: HomeSectionItem[] = [
    {
      id: "news",
      label: "新闻中心",
      description: "真实 RSS 来源、发布日期与原文链接。",
      defaultVisible: true,
      node: (
        <NewsSection
          news={focusNews}
          total={news.length}
          sources={connectedSources}
          generatedAt={newsMeta.generated_at}
          visuals={newsVisuals}
        />
      ),
    },
    {
      id: "random",
      label: "随机动物探索",
      description: "按类群随机抽取馆藏物种。",
      defaultVisible: true,
      node: <RandomExplorer species={species} covers={covers} initial={randomInitial} />,
    },
    {
      id: "categories",
      label: "动物分类",
      description: "按哺乳动物、鸟类等类群进入馆藏。",
      defaultVisible: true,
      node: <CategorySection counts={counts} images={categoryImages} />,
    },
    {
      id: "featured",
      label: "精选百科",
      description: "馆藏精选物种档案。",
      defaultVisible: true,
      node: <FeaturedSection species={featuredList} covers={covers} />,
    },
    {
      id: "lab",
      label: "互动实验室",
      description: "3D、解剖、声音、地理、测验与喂养模拟。",
      defaultVisible: true,
      node: <LabTeaser />,
    },
    {
      id: "map",
      label: "全球动物地图",
      description: "GBIF 与 iNaturalist 的真实观测点。",
      defaultVisible: true,
      node: <MapTeaser gbifReady />,
    },
    {
      id: "conservation",
      label: "濒危动物",
      description: "保护等级、趋势与威胁。",
      defaultVisible: true,
      node: <ConservationSection species={species} covers={covers} />,
    },
    {
      id: "photography",
      label: "高清摄影馆",
      description: "逐张署名的授权野生动物影像。",
      defaultVisible: true,
      node: <PhotographySection photos={diversePhotos.slice(0, 40)} />,
    },
    {
      id: "videos",
      label: "纪录片",
      description: "官方观看入口，不转载完整影片。",
      defaultVisible: true,
      node: <VideosSection videos={videos} credits={videoCredits} />,
    },
    {
      id: "daily",
      label: "每日动物",
      description: "每天一件馆藏推荐。",
      defaultVisible: true,
      node: <DailySection species={daily} cover={covers[daily.slug]} />,
    },
    {
      id: "rankings",
      label: "排行榜",
      description: "在可比条件下排序，标注来源。",
      defaultVisible: true,
      node: <RankingsSection species={species} />,
    },
    {
      id: "timeline",
      label: "进化时间线",
      description: "从寒武纪到第四纪的演化节点。",
      defaultVisible: false,
      node: <TimelineTeaser />,
    },
    {
      id: "ai",
      label: "AI 动物问答",
      description: "基于馆藏知识库的问答入口。",
      defaultVisible: false,
      node: <AiTeaser />,
    },
    {
      id: "compare",
      label: "动物对比",
      description: "并排比较三种动物的可可比字段。",
      defaultVisible: false,
      node: <CompareTeaser species={species} />,
    },
  ];

  return (
    <>
      <HomeHero
        images={settings.hero_images}
        credits={settings.hero_credits}
        videoUrl={settings.hero_video_url}
        poster={settings.hero_poster}
        videoCredit={settings.hero_video_credit}
        newsCount={news.length}
        sourceCount={connectedSources + 2}
        speciesCount={species.length}
      />
      <HomeSections items={sections} />
    </>
  );
}
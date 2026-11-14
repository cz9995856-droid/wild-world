export const SITE = {
  name: "WILD WORLD",
  nameCn: "野界",
  tagline: "全球数字动物自然博物馆",
  taglineEn: "A Global Digital Museum of Animal Life",
  description:
    "WILD WORLD 是一座面向公众的数字动物自然博物馆：以可追溯的数据来源、逐张核验的影像许可与沉浸式叙事，呈现地球上的野生生命。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  founded: "2026",
};

export const NAV_ITEMS = [
  { href: "/encyclopedia", label: "动物百科", en: "Encyclopedia" },
  { href: "/explore", label: "探索", en: "Explore" },
  { href: "/lab", label: "互动实验室", en: "Lab" },
  { href: "/map", label: "地图", en: "Map" },
  { href: "/photography", label: "摄影馆", en: "Photography" },
  { href: "/videos", label: "纪录片", en: "Films" },
  { href: "/news", label: "新闻", en: "News" },
] as const;

export const FOOTER_GROUPS = [
  {
    title: "馆藏",
    links: [
      { href: "/encyclopedia", label: "动物百科" },
      { href: "/photography", label: "高清摄影馆" },
      { href: "/videos", label: "纪录片专区" },
      { href: "/taxonomy", label: "分类树" },
      { href: "/timeline", label: "进化时间线" },
    ],
  },
  {
    title: "研究",
    links: [
      { href: "/conservation", label: "濒危动物专题" },
      { href: "/map", label: "全球分布地图" },
      { href: "/rankings", label: "动物排行榜" },
      { href: "/compare", label: "动物对比" },
    ],
  },
  {
    title: "参与",
    links: [
      { href: "/lab", label: "互动实验室" },
      { href: "/ai", label: "AI 动物问答" },
      { href: "/favorites", label: "我的收藏" },
      { href: "/sources", label: "数据与许可" },
    ],
  },
  {
    title: "关于",
    links: [
      { href: "/about", label: "博物馆理念" },
      { href: "/about#method", label: "数据方法" },
      { href: "/admin", label: "管理后台" },
      { href: "/sources#pending", label: "待授权清单" },
    ],
  },
];

export const ALL_SPECIES_PATH = "/encyclopedia";
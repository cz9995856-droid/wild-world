export const WC = {
  name: "WildChina",
  nameCn: "野性中国",
  tagline: "中国特有脊椎动物探索",
  taglineEn: "Exploring China's Endemic Vertebrates",
  description:
    "WildChina 是一个以中国特有脊椎动物为核心的自然科普、物种探索与生态保护网站：用可追溯的来源、逐张核验的影像与克制的叙事，记录中国独有的野生生命。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export interface WcSection {
  href: string;
  title: string;
  en: string;
  description: string;
  image: string;
  imageCredit: string;
}

export const WC_SECTIONS: WcSection[] = [
  {
    href: "/explore/encyclopedia",
    title: "物种图鉴",
    en: "Species Archive",
    description: "按纲、分布地与保护等级检索中国特有脊椎动物，进入每个物种的独立档案。",
    image: "/media/pixabay/giant-panda.jpg",
    imageCredit: "Pixabay · maminounou · Pixabay Content License",
  },
  {
    href: "/explore/map",
    title: "生态地图",
    en: "Ecological Atlas",
    description: "以省域与生态区为索引，查看物种分布、栖息环境与保护区域，不把行政区等同于栖息地。",
    image: "/media/hero/hero-01.jpg",
    imageCredit: "馆藏授权影像",
  },
  {
    href: "/explore/lab",
    title: "生命实验室",
    en: "Life Lab",
    description: "从身体结构、能力对比到生命知识挑战，用交互理解中国特有动物的生存策略。",
    image: "/media/species/giant-panda-03.jpg",
    imageCredit: "iNaturalist · James Eaton · CC0",
  },
  {
    href: "/explore/conservation",
    title: "保护与发现",
    en: "Conservation & Discovery",
    description: "聚合中国动物新闻、新物种发现、科研成果与保护区动态，只呈现可追溯的公开来源。",
    image: "/media/pixabay/snow-leopard.jpg",
    imageCredit: "Pixabay · 作者见原文 · Pixabay Content License",
  },
];
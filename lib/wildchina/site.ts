export const WC = {
  name: "WildChina",
  nameCn: "野性中国",
  tagline: "中国特有脊椎动物数字自然博物馆",
  taglineEn: "A Digital Museum of China's Endemic Vertebrates",
  description:
    "WildChina（野性中国）是中国特有脊椎动物的数字自然博物馆：以物种档案为馆藏，用可追溯的来源、逐张核验的影像与克制的叙事，呈现中国独有野生生命的形态、生态与保护价值。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export interface WcSection {
  href: string;
  title: string;
  category: string;
  en: string;
  description: string;
  image: string;
  imageCredit: string;
}

export const WC_SECTIONS: WcSection[] = [
  {
    href: "/explore/lab",
    title: "生命实验室",
    category: "互动实验",
    en: "Life Lab",
    description: "馆内互动展区：从身体结构、3D 形态到生命知识挑战，用交互理解中国特有动物的生存策略。",
    image: "/media/species/giant-panda-03.jpg",
    imageCredit: "iNaturalist · James Eaton · CC0",
  },
  {
    href: "/explore/encyclopedia",
    title: "物种图鉴",
    category: "物种档案",
    en: "Species Archive",
    description: "馆藏物种档案：按纲、分布地与保护等级检索中国特有脊椎动物，进入每个物种的独立档案。",
    image: "/media/pixabay/giant-panda.jpg",
    imageCredit: "Pixabay · maminounou · Pixabay Content License",
  },
  {
    href: "/explore/map",
    title: "生态地图",
    category: "分布与生态",
    en: "Ecological Atlas",
    description: "分布展区：以省域与生态区为索引，查看物种分布、栖息环境与保护区域，不把行政区等同于栖息地。",
    image: "/media/species/amur-leopard-01.jpg",
    imageCredit: "iNaturalist · Лариса Артемьева · CC0",
  },
  {
    href: "/explore/conservation",
    title: "保护与发现",
    category: "新闻与保护",
    en: "Conservation & Discovery",
    description: "保护展区：聚合中国动物新闻、新物种发现、科研成果与保护区动态，只呈现可追溯的公开来源。",
    image: "/media/pixabay/snow-leopard.jpg",
    imageCredit: "Pixabay · 作者见原文 · Pixabay Content License",
  },
];
export interface OfficialSource {
  name: string;
  url: string;
  description: string;
}

export const OFFICIAL_NEWS_SOURCES: OfficialSource[] = [
  {
    name: "国家林业和草原局",
    url: "http://www.forestry.gov.cn/",
    description: "野生动物保护、自然保护区与林草政策权威发布",
  },
  {
    name: "中国科学院",
    url: "http://www.cas.cn/",
    description: "生物多样性、生态学研究与科学进展",
  },
  {
    name: "新华社",
    url: "http://www.xinhuanet.com/",
    description: "国内野生动物保护与生态建设综合报道",
  },
  {
    name: "生态环境部",
    url: "http://www.mee.gov.cn/",
    description: "生态保护红线、生物多样性保护政策与执法动态",
  },
  {
    name: "中国绿色时报",
    url: "http://www.greentimes.com/",
    description: "林业、草原与野生动植物保护行业新闻",
  },
  {
    name: "中国野生动物保护协会",
    url: "http://www.cwca.org.cn/",
    description: "野生动物保护公益活动、科普与行业动态",
  },
  {
    name: "中国动物学会",
    url: "http://www.czs.org.cn/",
    description: "动物学学术交流、科普活动与学会资讯",
  },
  {
    name: "中国科学报",
    url: "http://news.sciencenet.cn/",
    description: "科学研究、学术前沿与科学家故事",
  },
];
import type { TimelineEra } from "@/lib/types";

export const TIMELINE: TimelineEra[] = [
  {
    id: "tl-01",
    title: "寒武纪大爆发",
    range_label: "约 538.8–485.4 百万年前",
    mya_start: 538.8,
    mya_end: 485.4,
    description:
      "显生宙的开端。海洋动物门类在相对短的时间内大量出现，化石记录中保存了大量具矿化骨骼的体型。现代动物门的基本蓝图可追溯至这一时期。",
    highlights: ["三叶虫繁盛", "节肢动物与软体动物多样化", "矿化骨骼出现"],
    species_slugs: [],
    source_name: "Paleobiology Database",
    source_url: "https://paleobiodb.org/",
    node_kind: "era",
  },
  {
    id: "tl-02",
    title: "泥盆纪 · 鱼类时代",
    range_label: "约 419.2–358.9 百万年前",
    mya_start: 419.2,
    mya_end: 358.9,
    description:
      "鱼类高度多样化，肉鳍鱼类的演化支系最终产生了四足动物。提塔利克鱼（Tiktaalik）等过渡化石保存了鱼类与四足类之间的形态特征。",
    highlights: ["肉鳍鱼类繁盛", "四足动物起源", "早期森林形成"],
    species_slugs: [],
    source_name: "Paleobiology Database",
    source_url: "https://paleobiodb.org/",
    node_kind: "fossil",
  },
  {
    id: "tl-03",
    title: "二叠纪末大灭绝",
    range_label: "约 251.9 百万年前",
    mya_start: 251.9,
    mya_end: 251.9,
    description:
      "地球上已知最严重的生物多样性危机之一，海洋与陆地生态系统受到重创。合弓纲（哺乳动物远祖所属支系）在此前后经历剧烈更替。",
    highlights: ["约八成以上海洋物种消失", "生态系统重组", "合弓纲与主龙类此后分化"],
    species_slugs: [],
    source_name: "Paleobiology Database",
    source_url: "https://paleobiodb.org/",
    node_kind: "node",
  },
  {
    id: "tl-04",
    title: "侏罗纪—白垩纪 · 恐龙与早期哺乳动物",
    range_label: "约 201.4–66 百万年前",
    mya_start: 201.4,
    mya_end: 66,
    description:
      "恐龙占据陆地生态位，哺乳形类在夜间与小型生态位中演化。鸟类起源于兽脚类恐龙的证据在化石与系统发育分析中不断累积。",
    highlights: ["鸟类起源于兽脚类恐龙", "被子植物兴起", "哺乳形类多样化"],
    species_slugs: [],
    source_name: "Open Tree of Life",
    source_url: "https://tree.opentreeoflife.org/",
    node_kind: "era",
  },
  {
    id: "tl-05",
    title: "白垩纪末撞击事件",
    range_label: "约 66 百万年前",
    mya_start: 66,
    mya_end: 66,
    description:
      "希克苏鲁伯撞击与大规模火山活动叠加，非鸟恐龙灭绝，鸟类与哺乳动物幸存并进入新的辐射演化阶段。",
    highlights: ["非鸟恐龙灭绝", "鸟类幸存", "哺乳动物辐射"],
    species_slugs: [],
    source_name: "Paleobiology Database",
    source_url: "https://paleobiodb.org/",
    node_kind: "node",
  },
  {
    id: "tl-06",
    title: "新生代 · 哺乳动物辐射",
    range_label: "约 66–2.58 百万年前",
    mya_start: 66,
    mya_end: 2.58,
    description:
      "哺乳动物在体型、食性与运动方式上快速分化，鲸类回到海洋，灵长类在森林中演化。现代多数哺乳动物目在这一时期确立。",
    highlights: ["鲸类入海", "灵长类演化", "草原扩张"],
    species_slugs: ["blue-whale", "african-elephant", "mountain-gorilla"],
    source_name: "Open Tree of Life",
    source_url: "https://tree.opentreeoflife.org/",
    node_kind: "era",
  },
  {
    id: "tl-07",
    title: "第四纪 · 冰期与巨型动物",
    range_label: "约 2.58 百万年前至今",
    mya_start: 2.58,
    mya_end: 0,
    description:
      "反复的冰期与间冰期塑造了现代生物地理格局。大型动物在部分大陆经历灭绝，人类活动的影响逐步增强。",
    highlights: ["冰期循环", "大型动物区系变化", "人类扩散"],
    species_slugs: ["emperor-penguin", "snow-leopard", "red-fox"],
    source_name: "Paleobiology Database",
    source_url: "https://paleobiodb.org/",
    node_kind: "era",
  },
];

export const PHYLOGENY_NOTES = [
  {
    title: "分类 ≠ 进化关系",
    body:
      "林奈分类等级（纲、目、科、属）是人为组织的分类系统，便于检索与交流，但等级本身不代表演化距离。系统发育树才表达基于共有衍征与分子数据的演化分支关系。",
  },
  {
    title: "形态相似 ≠ 亲缘关系近",
    body:
      "趋同演化会让不同支系在相似环境中形成相似外形，例如鲸与鱼类的流线型身体。亲缘关系必须由系统发育分析支持，而非仅凭外形推断。",
  },
  {
    title: "本站的证据边界",
    body:
      "本馆的分类树来自 Catalogue of Life / GBIF 的分类骨架；进化时间线引用 Paleobiology Database 与 Open Tree of Life 的公开资料。每一处均标注来源与审核状态，未接入的数据不推测填写。",
  },
];

export const TAXONOMY_SOURCE = {
  name: "Catalogue of Life / GBIF Backbone Taxonomy",
  url: "https://www.catalogueoflife.org/",
  note: "分类阶元以 GBIF Backbone 为准；物种页面会标注是否需要按最新分类修订复核。",
};
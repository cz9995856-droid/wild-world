import amphibianData from "@/public/data/china-species-amphibians.json";
import amphibianDetailData from "@/public/data/china-amphibians-detail.json";
import extraData from "@/public/data/china-species-extra.json";
import tropicalsData from "@/public/data/china-species-tropicals.json";

export type ChinaGroup = "mammal" | "bird" | "reptile" | "amphibian" | "fish";

export interface SpeciesProvenance {
  name: string;
  url: string;
  citation: string;
  retrievedAt: string;
}

export interface ChinaSpecies {
  slug: string;
  nameCn: string;
  aliases: string[];
  scientificName: string;
  englishName: string;
  group: ChinaGroup;
  groupLabel: string;
  taxonomy: {
    class: string;
    order: string;
    family: string;
    genus: string;
  };
  distribution: string;
  provinces: string[];
  habitats: string[];
  conservation: {
    status: string;
    label: string;
    year: number | null;
    note: string;
  };
  morphology: string;
  behavior: string;
  dietReproduction: string;
  endemic: "strict" | "main";
  endemicNote: string;
  sp2000: {
    id: string | null;
    url: string;
  };
  sources: Array<{ name: string; url: string }>;
  verified: boolean;
  detailSource?: SpeciesProvenance;
  externalIds?: {
    gbif?: number | null;
    col?: string | null;
    wikidata?: string | null;
    tropicalsId?: number | null;
  };
  nameCheck?: {
    nameCn: string | null;
    scientificName: string | null;
    taxonomicStatus: string | null;
    acceptedScientificName: string | null;
    cnNameSource: string | null;
  };
}

const SP2000 = "https://www.sp2000.org.cn/";
const IUCN = "https://www.iucnredlist.org/";

const BASE_CHINA_SPECIES: ChinaSpecies[] = [
  {
    slug: "giant-panda",
    nameCn: "大熊猫",
    aliases: ["熊猫", "竹熊"],
    scientificName: "Ailuropoda melanoleuca",
    englishName: "Giant Panda",
    group: "mammal",
    groupLabel: "哺乳纲",
    taxonomy: { class: "哺乳纲 Mammalia", order: "食肉目 Carnivora", family: "熊科 Ursidae", genus: "Ailuropoda" },
    distribution: "四川、陕西、甘肃三省的多个山系",
    provinces: ["四川", "陕西", "甘肃"],
    habitats: ["森林", "高山"],
    conservation: { status: "VU", label: "易危", year: null, note: "评估年份以 IUCN 官方页面为准，本站不做推测。" },
    morphology: "黑白分明的毛色，肩高约 60–90 厘米，成体体重约 70–120 千克；前掌具增大的腕骨形成的“伪拇指”，便于抓握竹秆。",
    behavior: "以独居为主，活动范围随竹子生长周期变化；每日大部分时间用于进食与休息，善攀爬，也会游泳。",
    dietReproduction: "食物以竹类为主，偶食小型动物或腐肉；繁殖季节多在春季，妊娠期约 3–5 个月，通常每胎 1–2 仔。",
    endemic: "strict",
    endemicNote: "野生种群仅分布于中国中西部山地，是严格意义上的中国特有物种。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "chinese-alligator",
    nameCn: "扬子鳄",
    aliases: ["鼍", "中华鳄"],
    scientificName: "Alligator sinensis",
    englishName: "Chinese Alligator",
    group: "reptile",
    groupLabel: "爬行纲",
    taxonomy: { class: "爬行纲 Reptilia", order: "鳄目 Crocodilia", family: "短吻鳄科 Alligatoridae", genus: "Alligator" },
    distribution: "安徽、浙江等地的长江下游湿地",
    provinces: ["安徽", "浙江"],
    habitats: ["湿地", "森林"],
    conservation: { status: "CR", label: "极危", year: null, note: "野外种群极小，主要依赖人工繁育与重引入。" },
    morphology: "体型在鳄类中偏小，成体全长约 1.5–2.1 米；吻部短钝，背部具角质鳞片与骨板，体色深褐带黄斑。",
    behavior: "穴居于河岸、池塘与稻田附近，冬季冬眠；性情相对温和，以伏击方式捕食。",
    dietReproduction: "捕食螺、蚌、鱼、虾、蛙及小型脊椎动物；6–7 月产卵，每窝约 10–30 枚，由雌鳄守护巢穴。",
    endemic: "strict",
    endemicNote: "现存野生与人工种群均源自中国长江下游，是中国特有鳄类。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "milu",
    nameCn: "麋鹿",
    aliases: ["四不像", "大卫鹿"],
    scientificName: "Elaphurus davidianus",
    englishName: "Père David's Deer",
    group: "mammal",
    groupLabel: "哺乳纲",
    taxonomy: { class: "哺乳纲 Mammalia", order: "偶蹄目 Artiodactyla", family: "鹿科 Cervidae", genus: "Elaphurus" },
    distribution: "历史分布于长江中下游湿地，现为人工种群与重引入种群",
    provinces: ["江苏", "湖北", "湖南", "北京"],
    habitats: ["湿地", "草原"],
    conservation: { status: "EW", label: "野外灭绝", year: null, note: "野外原生种群已消失，现存个体来自历史圈养种群的重引入。" },
    morphology: "角形特殊，主干分叉后向后伸展；尾较长，蹄宽大，善在湿地行走，成体体重约 120–200 千克。",
    behavior: "喜群居，常在沼泽、芦苇湿地活动；夏季喜水，善于游泳。",
    dietReproduction: "以水生植物、禾草与嫩叶为食；繁殖期在夏季，通常每胎 1 仔。",
    endemic: "strict",
    endemicNote: "物种起源于中国长江中下游，现存所有个体的祖先均来自中国历史种群。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "sichuan-snub-nosed-monkey",
    nameCn: "川金丝猴",
    aliases: ["金丝猴", "仰鼻猴"],
    scientificName: "Rhinopithecus roxellana",
    englishName: "Golden Snub-nosed Monkey",
    group: "mammal",
    groupLabel: "哺乳纲",
    taxonomy: { class: "哺乳纲 Mammalia", order: "灵长目 Primates", family: "猴科 Cercopithecidae", genus: "Rhinopithecus" },
    distribution: "四川、陕西、甘肃、湖北的高山森林",
    provinces: ["四川", "陕西", "甘肃", "湖北"],
    habitats: ["森林", "高山"],
    conservation: { status: "EN", label: "濒危", year: null, note: "栖息地破碎化与人为干扰是主要威胁。" },
    morphology: "面部裸露呈浅蓝色，鼻梁上仰；成年个体肩背具金黄色长毛，尾长，体长约 60–76 厘米。",
    behavior: "树栖，群体活动，常分成繁殖群与全雄群；冬季向低海拔迁移。",
    dietReproduction: "以树叶、嫩芽、花、果实与树皮为食；繁殖具季节性，通常每胎 1 仔。",
    endemic: "strict",
    endemicNote: "分布于中国中西部山地，是中国特有灵长类。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "yunnan-snub-nosed-monkey",
    nameCn: "滇金丝猴",
    aliases: ["黑白仰鼻猴"],
    scientificName: "Rhinopithecus bieti",
    englishName: "Yunnan Snub-nosed Monkey",
    group: "mammal",
    groupLabel: "哺乳纲",
    taxonomy: { class: "哺乳纲 Mammalia", order: "灵长目 Primates", family: "猴科 Cercopithecidae", genus: "Rhinopithecus" },
    distribution: "云南西北部与西藏东南部的高山针叶林",
    provinces: ["云南", "西藏"],
    habitats: ["森林", "高山"],
    conservation: { status: "EN", label: "濒危", year: null, note: "分布区狭窄，种群数量受栖息地质量限制。" },
    morphology: "以黑白毛色为主，面部裸露，鼻部上仰；体长约 74–83 厘米，尾较长。",
    behavior: "树栖，群体规模较大，活动于高海拔针叶林带，冬季可能下移。",
    dietReproduction: "以松萝、树叶、芽与果实为食；繁殖季节不固定，通常每胎 1 仔。",
    endemic: "strict",
    endemicNote: "仅分布于中国云南与西藏交界的高山森林，是中国特有物种。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "guizhou-snub-nosed-monkey",
    nameCn: "黔金丝猴",
    aliases: ["灰金丝猴", "白肩仰鼻猴"],
    scientificName: "Rhinopithecus brelichi",
    englishName: "Guizhou Snub-nosed Monkey",
    group: "mammal",
    groupLabel: "哺乳纲",
    taxonomy: { class: "哺乳纲 Mammalia", order: "灵长目 Primates", family: "猴科 Cercopithecidae", genus: "Rhinopithecus" },
    distribution: "贵州梵净山及其周边山地",
    provinces: ["贵州"],
    habitats: ["森林", "高山"],
    conservation: { status: "CR", label: "极危", year: null, note: "分布区极窄，种群数量少，对环境变化敏感。" },
    morphology: "毛色以灰褐为主，肩部具白色斑块，面部裸露，鼻梁上仰；体长与川金丝猴相近。",
    behavior: "树栖，群体活动，主要生活在常绿阔叶林与针阔混交林中。",
    dietReproduction: "以树叶、芽、果实与树皮为食；繁殖资料有限，通常每胎 1 仔。",
    endemic: "strict",
    endemicNote: "仅分布于贵州梵净山一带，是中国分布最狭窄的灵长类之一。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "hainan-gibbon",
    nameCn: "海南长臂猿",
    aliases: ["海南黑冠长臂猿"],
    scientificName: "Nomascus hainanus",
    englishName: "Hainan Gibbon",
    group: "mammal",
    groupLabel: "哺乳纲",
    taxonomy: { class: "哺乳纲 Mammalia", order: "灵长目 Primates", family: "长臂猿科 Hylobatidae", genus: "Nomascus" },
    distribution: "海南霸王岭热带山地雨林",
    provinces: ["海南"],
    habitats: ["森林"],
    conservation: { status: "CR", label: "极危", year: null, note: "全球种群数量极少，分布仅限海南岛一处保护区。" },
    morphology: "雄性通体黑色，头顶具冠毛；雌性毛色较浅；臂长，适于树冠层摆荡移动。",
    behavior: "树栖，具领域性，清晨常有二重唱；群体结构以一对成年个体及其后代为核心。",
    dietReproduction: "以果实、嫩叶与花为食；繁殖周期长，通常每胎 1 仔。",
    endemic: "strict",
    endemicNote: "仅分布于中国海南岛，是严格意义上的中国特有灵长类。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "south-china-tiger",
    nameCn: "华南虎",
    aliases: ["厦门虎", "中国虎"],
    scientificName: "Panthera tigris amoyensis",
    englishName: "South China Tiger",
    group: "mammal",
    groupLabel: "哺乳纲",
    taxonomy: { class: "哺乳纲 Mammalia", order: "食肉目 Carnivora", family: "猫科 Felidae", genus: "Panthera" },
    distribution: "历史分布于中国华南、华东与华中地区；野外已多年未见确认记录",
    provinces: ["广东", "福建", "江西", "湖南", "浙江"],
    habitats: ["森林", "灌丛"],
    conservation: { status: "CR", label: "极危", year: null, note: "野外种群可能已灭绝，现存个体主要为人工圈养种群。" },
    morphology: "体型较其他虎亚种略小，毛色橙黄，条纹较密且窄；头骨与牙齿适应大型猎物。",
    behavior: "独居，领域性强，善于伏击；历史上活动于亚热带森林与丘陵。",
    dietReproduction: "捕食鹿、野猪等中型至大型有蹄类；繁殖无明显季节性，每胎通常 2–3 仔。",
    endemic: "strict",
    endemicNote: "为中国特有虎亚种，历史分布限于中国境内。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "przewalski-gazelle",
    nameCn: "普氏原羚",
    aliases: ["滩黄羊", "中华对角羚"],
    scientificName: "Procapra przewalskii",
    englishName: "Przewalski's Gazelle",
    group: "mammal",
    groupLabel: "哺乳纲",
    taxonomy: { class: "哺乳纲 Mammalia", order: "偶蹄目 Artiodactyla", family: "牛科 Bovidae", genus: "Procapra" },
    distribution: "青海湖周边及青海东部少量区域",
    provinces: ["青海"],
    habitats: ["草原", "荒漠"],
    conservation: { status: "EN", label: "濒危", year: null, note: "分布区极狭，种群受围栏、道路与家畜竞争影响。" },
    morphology: "体型轻巧，雄性具向后弯曲的角；臀部具白色斑块，毛色沙黄。",
    behavior: "群居，善于奔跑，常在开阔草原与半荒漠活动。",
    dietReproduction: "以禾草与灌木嫩叶为食；繁殖期集中在冬季，通常每胎 1 仔。",
    endemic: "strict",
    endemicNote: "仅分布于中国青海湖周边，是中国特有羚羊。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "brown-eared-pheasant",
    nameCn: "褐马鸡",
    aliases: ["角鸡", "耳鸡"],
    scientificName: "Crossoptilon mantchuricum",
    englishName: "Brown Eared Pheasant",
    group: "bird",
    groupLabel: "鸟纲",
    taxonomy: { class: "鸟纲 Aves", order: "鸡形目 Galliformes", family: "雉科 Phasianidae", genus: "Crossoptilon" },
    distribution: "山西、河北、陕西、北京等地的山地森林",
    provinces: ["山西", "河北", "陕西", "北京"],
    habitats: ["森林", "高山"],
    conservation: { status: "VU", label: "易危", year: null, note: "栖息地碎片化与人为干扰是主要压力。" },
    morphology: "体羽以褐色为主，头侧具白色耳羽簇，尾羽蓬松；体长约 80–100 厘米。",
    behavior: "地栖为主，群居，受惊时短距离飞行；繁殖期具领域性。",
    dietReproduction: "以植物种子、嫩叶、根茎与昆虫为食；春季繁殖，每窝约 4–8 枚卵。",
    endemic: "strict",
    endemicNote: "为中国特有雉类，分布限于华北与西北山地。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "chinese-monal",
    nameCn: "绿尾虹雉",
    aliases: ["贝母鸡", "火炭鸡"],
    scientificName: "Lophophorus lhuysii",
    englishName: "Chinese Monal",
    group: "bird",
    groupLabel: "鸟纲",
    taxonomy: { class: "鸟纲 Aves", order: "鸡形目 Galliformes", family: "雉科 Phasianidae", genus: "Lophophorus" },
    distribution: "四川、云南、甘肃、青海的高山草甸与灌丛",
    provinces: ["四川", "云南", "甘肃", "青海"],
    habitats: ["高山", "草原"],
    conservation: { status: "VU", label: "易危", year: null, note: "高山生境对气候变化敏感，种群监测不足。" },
    morphology: "雄鸟羽色具金属光泽，头顶羽冠卷曲，尾羽蓝绿色；雌鸟羽色较暗淡。",
    behavior: "高山地栖，冬季下移到林缘；受惊时滑翔下山。",
    dietReproduction: "以植物根茎、嫩叶、种子与昆虫为食；繁殖期在春末夏初。",
    endemic: "strict",
    endemicNote: "为中国特有高山雉类，分布限于横断山与邻近高地。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "chinese-giant-salamander",
    nameCn: "大鲵",
    aliases: ["娃娃鱼", "中国大鲵"],
    scientificName: "Andrias davidianus",
    englishName: "Chinese Giant Salamander",
    group: "amphibian",
    groupLabel: "两栖纲",
    taxonomy: { class: "两栖纲 Amphibia", order: "有尾目 Caudata", family: "隐鳃鲵科 Cryptobranchidae", genus: "Andrias" },
    distribution: "长江、黄河、珠江等流域的山溪与地下河",
    provinces: ["陕西", "四川", "贵州", "湖南", "湖北", "广西"],
    habitats: ["湿地", "森林"],
    conservation: { status: "CR", label: "极危", year: null, note: "野生种群急剧下降，养殖与放流带来的遗传问题需评估。" },
    morphology: "体型大，成体全长可达 1 米以上；头扁，体侧具皮褶，四肢短，皮肤黏滑。",
    behavior: "夜行，栖息于清凉、溶氧高的山溪与洞穴；不善远距离迁移。",
    dietReproduction: "捕食鱼、虾、蛙与水生昆虫；体外受精，雄性守护卵块。",
    endemic: "strict",
    endemicNote: "中国大鲵为中国特有，但种下分类仍存在隐存种讨论。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "baiji",
    nameCn: "白鱀豚",
    aliases: ["白鳍豚", "长江女神"],
    scientificName: "Lipotes vexillifer",
    englishName: "Yangtze River Dolphin (Baiji)",
    group: "mammal",
    groupLabel: "哺乳纲",
    taxonomy: { class: "哺乳纲 Mammalia", order: "鲸目 Cetacea", family: "白鱀豚科 Lipotidae", genus: "Lipotes" },
    distribution: "历史分布于长江中下游干流及洞庭湖、鄱阳湖",
    provinces: ["湖北", "湖南", "江西", "安徽", "江苏", "上海"],
    habitats: ["湿地"],
    conservation: { status: "CR", label: "极危", year: null, note: "2006 年科考未发现确认个体，可能已功能性灭绝。" },
    morphology: "吻部细长，背鳍低三角形，体色浅灰；成体体长约 2–2.5 米。",
    behavior: "淡水豚类，回声定位，通常在江心深水区活动；性情温和。",
    dietReproduction: "以小型鱼类为主；繁殖资料有限，通常每胎 1 仔。",
    endemic: "strict",
    endemicNote: "仅分布于中国长江水系，是中国特有的淡水鲸类。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
  {
    slug: "tibetan-antelope",
    nameCn: "藏羚",
    aliases: ["藏羚羊", "长角羊"],
    scientificName: "Pantholops hodgsonii",
    englishName: "Tibetan Antelope",
    group: "mammal",
    groupLabel: "哺乳纲",
    taxonomy: { class: "哺乳纲 Mammalia", order: "偶蹄目 Artiodactyla", family: "牛科 Bovidae", genus: "Pantholops" },
    distribution: "青藏高原高寒草原与荒漠，包括西藏、青海、新疆",
    provinces: ["西藏", "青海", "新疆"],
    habitats: ["草原", "荒漠", "高山"],
    conservation: { status: "NT", label: "近危", year: null, note: "种群总体恢复，但迁徙路线与产仔地仍需持续保护。" },
    morphology: "雄性具细长、略向后弯的角；体毛厚密，鼻部宽大，适应高寒缺氧环境。",
    behavior: "群居，具长距离迁徙行为；雌性每年前往特定产仔地集中生产。",
    dietReproduction: "以禾草与地衣等为食；繁殖期在冬季，每胎 1 仔。",
    endemic: "main",
    endemicNote: "主要分布于中国青藏高原，边缘地区有少量跨境记录；本站标注为“主要分布于中国”。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      { name: "Species 2000 China", url: SP2000 },
      { name: "IUCN Red List", url: IUCN },
    ],
    verified: true,
  },
];

function dedupeBySlug(list: ChinaSpecies[]): ChinaSpecies[] {
  const map = new Map<string, ChinaSpecies>();
  for (const item of list) {
    if (!map.has(item.slug)) map.set(item.slug, item);
  }
  return [...map.values()];
}

interface AmphibianDetailEntry {
  acId: number;
  acUrl: string;
  acNameCn: string;
  acScientificName: string;
  matchedBy: string;
  diagnosis: string;
  morphology: string;
  habitat: string;
  habit: string;
  reproduction: string;
  diet: string;
  naturalHistory: string;
  distribution: string;
  iucn: string;
  iucnLabel: string;
  nationalProtection: string;
  cites: string;
  habitats: string[];
  citation: string;
}

const AMPHIBIAN_DETAIL: Record<string, AmphibianDetailEntry> = (
  amphibianDetailData as unknown as { species: Record<string, AmphibianDetailEntry> }
).species;

const AMPHIBIAN_CITATION = (amphibianDetailData as unknown as { citation: string }).citation;
const AMPHIBIAN_RETRIEVED_AT = (amphibianDetailData as unknown as { retrievedAt: string }).retrievedAt;

const IUCN_LABEL_CN: Record<string, string> = {
  EX: "灭绝",
  EW: "野外灭绝",
  CR: "极危",
  EN: "濒危",
  VU: "易危",
  NT: "近危",
  LC: "无危",
  DD: "数据缺乏",
  NE: "未评估",
};

function isPlaceholder(value: string | undefined) {
  return !value || value.includes("待编辑核验") || value.includes("待补充");
}

interface TropicalsEntry {
  nameCn: string | null;
  nameEn: string | null;
  scientificName: string | null;
  aliases: string[];
  useEnglishName?: string;
  gbifUsageKey: number | null;
  colId: string | null;
  wikidataQid: string | null;
  cnNameSource: string | null;
  tropicalsId: number | null;
  taxonomicStatus?: string | null;
  acceptedScientificName?: string | null;
}

const TROPICALS: Record<string, TropicalsEntry> = (
  tropicalsData as unknown as { species: Record<string, TropicalsEntry> }
).species;

function decorateTropicals(species: ChinaSpecies): ChinaSpecies {
  const entry = TROPICALS[species.slug];
  if (!entry) return species;

  const englishBroken =
    !species.englishName ||
    species.englishName === species.nameCn ||
    /[\u4e00-\u9fa5]/.test(species.englishName);
  const englishName = englishBroken && entry.nameEn ? entry.nameEn : species.englishName;

  const extraAliases = [entry.nameCn, ...(entry.aliases ?? [])].filter(
    (name): name is string => Boolean(name) && name !== species.nameCn
  );
  const aliases = [...new Set([...species.aliases, ...extraAliases])];

  return {
    ...species,
    englishName,
    aliases,
    externalIds: {
      gbif: entry.gbifUsageKey,
      col: entry.colId,
      wikidata: entry.wikidataQid,
      tropicalsId: entry.tropicalsId,
    },
    nameCheck: {
      nameCn: entry.nameCn,
      scientificName: entry.scientificName,
      taxonomicStatus: entry.taxonomicStatus ?? null,
      acceptedScientificName: entry.acceptedScientificName ?? null,
      cnNameSource: entry.cnNameSource,
    },
    sources: [
      ...species.sources,
      { name: "Tropicals.cn · 名称与分类（CC BY 4.0）", url: "https://tropicals.cn/" },
    ],
  };
}

function decorateAmphibian(species: ChinaSpecies): ChinaSpecies {
  const detail = AMPHIBIAN_DETAIL[species.slug];
  if (!detail) return species;

  const morphology = isPlaceholder(species.morphology) && detail.morphology ? detail.morphology : species.morphology;

  const behaviorParts = [
    detail.habitat ? `生境：${detail.habitat}` : "",
    detail.habit ? `习性：${detail.habit}` : "",
    detail.reproduction ? `繁殖：${detail.reproduction}` : "",
  ].filter(Boolean);
  const behavior = isPlaceholder(species.behavior) && behaviorParts.length ? behaviorParts.join(" ") : species.behavior;

  const dietReproduction = isPlaceholder(species.dietReproduction) && detail.reproduction ? `繁殖：${detail.reproduction}` : species.dietReproduction;

  const habitats = species.habitats.length ? species.habitats : detail.habitats;

  const upgraded = species.conservation.status === "NE" && detail.iucn ? detail.iucn : species.conservation.status;
  const conservation =
    upgraded !== species.conservation.status
      ? {
          status: upgraded,
          label: IUCN_LABEL_CN[upgraded] ?? upgraded,
          year: null,
          note: "等级来自中国两栖类信息系统收录的 IUCN 评估结果；具体评估年份以 IUCN 红色名录官网为准，本站不做推测。",
        }
      : species.conservation;

  return {
    ...species,
    morphology,
    behavior,
    dietReproduction,
    habitats,
    conservation,
    sources: [
      ...species.sources,
      { name: `中国两栖类信息系统 · ${detail.acNameCn}`, url: detail.acUrl },
    ],
    detailSource: {
      name: "中国两栖类信息系统（AmphibiaChina）",
      url: detail.acUrl,
      citation: detail.citation || AMPHIBIAN_CITATION,
      retrievedAt: AMPHIBIAN_RETRIEVED_AT,
    },
  };
}

export const CHINA_SPECIES: ChinaSpecies[] = dedupeBySlug([
  ...BASE_CHINA_SPECIES,
  ...(amphibianData as unknown as ChinaSpecies[]),
  ...(extraData as unknown as ChinaSpecies[]),
]).map(decorateAmphibian).map(decorateTropicals);

export const CHINA_SPECIES_BY_SLUG = new Map(CHINA_SPECIES.map((s) => [s.slug, s]));

export const CHINA_GROUPS: Array<{ key: ChinaGroup; label: string }> = [
  { key: "mammal", label: "哺乳纲" },
  { key: "bird", label: "鸟纲" },
  { key: "reptile", label: "爬行纲" },
  { key: "amphibian", label: "两栖纲" },
  { key: "fish", label: "鱼类" },
];

export const CHINA_HABITATS = ["森林", "草原", "湿地", "荒漠", "高山", "海洋"] as const;

export function speciesHref(slug: string) {
  return `/explore/encyclopedia/${slug}`;
}
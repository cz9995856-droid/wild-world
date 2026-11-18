import taxonomyCnData from "@/lib/wildchina/taxonomy-cn.json";

const EXTRA_CN = (taxonomyCnData.names ?? {}) as Record<string, string>;

const TAXON_CN: Record<string, string> = {
  Amphibia: "两栖纲",
  Mammalia: "哺乳纲",
  Aves: "鸟纲",
  Reptilia: "爬行纲",
  Actinopterygii: "辐鳍鱼纲",
  Anura: "无尾目",
  Caudata: "有尾目",
  Gymnophiona: "蚓螈目",
  Primates: "灵长目",
  Carnivora: "食肉目",
  Artiodactyla: "偶蹄目",
  Perissodactyla: "奇蹄目",
  Cetacea: "鲸目",
  Chiroptera: "翼手目",
  Rodentia: "啮齿目",
  Lagomorpha: "兔形目",
  Galliformes: "鸡形目",
  Passeriformes: "雀形目",
  Anseriformes: "雁形目",
  Pelecaniformes: "鹈形目",
  Ciconiiformes: "鹳形目",
  Gruiformes: "鹤形目",
  Falconiformes: "隼形目",
  Strigiformes: "鸮形目",
  Squamata: "有鳞目",
  Testudines: "龟鳖目",
  Crocodylia: "鳄目",
  Cypriniformes: "鲤形目",
  Siluriformes: "鲇形目",
  Perciformes: "鲈形目",
  Ichthyophiidae: "鱼螈科",
  Hynobiidae: "小鲵科",
  Cryptobranchidae: "隐鳃鲵科",
  Salamandridae: "蝾螈科",
  Bombinatoridae: "铃蟾科",
  Megophryidae: "角蟾科",
  Bufonidae: "蟾蜍科",
  Hylidae: "雨蛙科",
  Ranidae: "蛙科",
  Ceratobatrachidae: "角蛙科",
  Dicroglossidae: "叉舌蛙科",
  Rhacophoridae: "树蛙科",
  Microhylidae: "姬蛙科",
  Ursidae: "熊科",
  Felidae: "猫科",
  Canidae: "犬科",
  Cervidae: "鹿科",
  Bovidae: "牛科",
  Cercopithecidae: "猴科",
  Hylobatidae: "长臂猿科",
  Rhinopithecus: "仰鼻猴属",
  Ailuropoda: "大熊猫属",
  Elaphurus: "麋鹿属",
  Pantholops: "藏羚属",
  Procapra: "原羚属",
  Panthera: "豹属",
  Nomascus: "长臂猿属",
  Alligator: "短吻鳄属",
  Andrias: "大鲵属",
  Lipotes: "白鱀豚属",
  Odorrana: "臭蛙属",
};

export function taxonCn(value: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/[\u4e00-\u9fa5]/.test(raw)) return raw;
  const key = raw.replace(/^[^A-Za-z]*/, "");
  return TAXON_CN[key] ?? EXTRA_CN[key] ?? "";
}

export function taxonomyLine(taxonomy: {
  class: string;
  order: string;
  family: string;
  genus: string;
}): string {
  const levels: Array<[string, string]> = [
    ["纲", taxonomy.class],
    ["目", taxonomy.order],
    ["科", taxonomy.family],
    ["属", taxonomy.genus],
  ];
  return levels
    .filter(([, value]) => Boolean(value))
    .map(([level, value]) => taxonCn(value) || `${level}待核验`)
    .join(" → ");
}
import type { FeedingPlan } from "@/lib/types";

const note =
  "这是用于理解动物食性结构的互动教学模拟，不是现实饲养建议。真实饲养需由兽医与营养师依据个体状况制定配方；请勿据此投喂野生动物或宠物。";

export const FEEDING_PLANS: FeedingPlan[] = [
  {
    species_slug: "giant-panda",
    diet_summary: "以高山竹类为主，占食物组成 99% 以上；消化系统仍具食肉目特征，对纤维素利用率有限。",
    items: [
      { name: "竹叶与竹笋", share_pct: 62, note: "主食来源，需保证新鲜与多样化竹种。" },
      { name: "竹竿", share_pct: 30, note: "提供纤维与咀嚼行为满足。" },
      { name: "果实/辅食", share_pct: 6, note: "圈养环境中的营养补充，需专业配方。" },
      { name: "其他植物", share_pct: 2, note: "偶食，不可替代竹类。" },
    ],
    daily_energy_kcal: null,
    feeding_frequency: "野外每天进食可达 12–16 小时，多次少量。",
    simulation_note: note,
    sources: [
      {
        source_name: "Animal Diversity Web",
        source_url: "https://animaldiversity.org/accounts/Ailuropoda_melanoleuca/",
        license: "CC BY-NC-SA 3.0（需逐页核对）",
        retrieved_at: "2026-11-01",
        verified: false,
        review_status: "editorial",
      },
    ],
  },
  {
    species_slug: "tiger",
    diet_summary: "专性肉食，以大型有蹄类为主；捕猎成功率并不高，需要大范围领域。",
    items: [
      { name: "鹿类", share_pct: 45, note: "主要猎物之一，依地区而异。" },
      { name: "野猪", share_pct: 35, note: "常见猎物，提供高能量。" },
      { name: "野牛/大型有蹄类", share_pct: 15, note: "风险较高，多为强壮个体或幼体。" },
      { name: "小型猎物", share_pct: 5, note: "补充性食物。" },
    ],
    daily_energy_kcal: null,
    feeding_frequency: "一次进食可摄入大量肉食，随后数日不进食属常见现象。",
    simulation_note: note,
    sources: [
      {
        source_name: "Animal Diversity Web",
        source_url: "https://animaldiversity.org/accounts/Panthera_tigris/",
        license: "CC BY-NC-SA 3.0（需逐页核对）",
        retrieved_at: "2026-11-01",
        verified: false,
        review_status: "editorial",
      },
    ],
  },
  {
    species_slug: "african-elephant",
    diet_summary: "大型植食者，以草、树叶、树皮与果实为主，日食量可达体重的 4%–6%。",
    items: [
      { name: "草类", share_pct: 50, note: "雨季为主要能量来源。" },
      { name: "树叶与嫩枝", share_pct: 30, note: "旱季比例上升。" },
      { name: "树皮与根", share_pct: 12, note: "补充纤维与水分。" },
      { name: "果实", share_pct: 8, note: "季节性食物，兼作种子传播者。" },
    ],
    daily_energy_kcal: null,
    feeding_frequency: "每天大部分时间进食，需大量饮水。",
    simulation_note: note,
    sources: [
      {
        source_name: "Animal Diversity Web",
        source_url: "https://animaldiversity.org/accounts/Loxodonta_africana/",
        license: "CC BY-NC-SA 3.0（需逐页核对）",
        retrieved_at: "2026-11-01",
        verified: false,
        review_status: "editorial",
      },
    ],
  },
  {
    species_slug: "giraffe",
    diet_summary: "瀏食者，取食树冠层叶片，尤其偏好金合欢属；饮水频率较低。",
    items: [
      { name: "金合欢叶片", share_pct: 55, note: "主要食物，舌头可绕过刺。" },
      { name: "其他树木叶片", share_pct: 30, note: "依季节与地区变化。" },
      { name: "嫩枝与花", share_pct: 10, note: "补充营养。" },
      { name: "果实", share_pct: 5, note: "偶食。" },
    ],
    daily_energy_kcal: null,
    feeding_frequency: "每天进食时间可超过 16 小时，分多次取食。",
    simulation_note: note,
    sources: [
      {
        source_name: "Giraffe Conservation Foundation",
        source_url: "https://giraffeconservation.org/giraffe-species/",
        license: "引用链接，未复制全文",
        retrieved_at: "2026-11-01",
        verified: false,
        review_status: "editorial",
      },
    ],
  },
  {
    species_slug: "red-panda",
    diet_summary: "以竹叶与竹笋为主，兼食果实、昆虫与鸟卵；代谢率较低。",
    items: [
      { name: "竹叶", share_pct: 60, note: "主食，需高摄入量弥补消化效率。" },
      { name: "竹笋", share_pct: 25, note: "季节性食物。" },
      { name: "果实", share_pct: 10, note: "补充能量。" },
      { name: "昆虫/鸟卵", share_pct: 5, note: "补充蛋白质。" },
    ],
    daily_energy_kcal: null,
    feeding_frequency: "多次少量进食，晨昏较活跃。",
    simulation_note: note,
    sources: [
      {
        source_name: "Animal Diversity Web",
        source_url: "https://animaldiversity.org/accounts/Ailurus_fulgens/",
        license: "CC BY-NC-SA 3.0（需逐页核对）",
        retrieved_at: "2026-11-01",
        verified: false,
        review_status: "editorial",
      },
    ],
  },
  {
    species_slug: "monarch-butterfly",
    diet_summary: "幼虫专食马利筋属植物；成虫吸食多种花蜜。食性在生活史中发生转变。",
    items: [
      { name: "马利筋叶片（幼虫）", share_pct: 70, note: "寄主植物，兼获得毒素防御。" },
      { name: "花蜜（成虫）", share_pct: 25, note: "迁徙与繁殖的能量来源。" },
      { name: "其他蜜源植物", share_pct: 5, note: "成虫补充，依季节与地点变化。" },
    ],
    daily_energy_kcal: null,
    feeding_frequency: "幼虫持续取食；成虫频繁访花。",
    simulation_note: note,
    sources: [
      {
        source_name: "US Fish & Wildlife Service",
        source_url: "https://www.fws.gov/initiative/monarch-butterfly",
        license: "引用链接，未复制全文",
        retrieved_at: "2026-11-01",
        verified: false,
        review_status: "editorial",
      },
    ],
  },
];

export const FEEDING_BY_SLUG = new Map(FEEDING_PLANS.map((f) => [f.species_slug, f]));
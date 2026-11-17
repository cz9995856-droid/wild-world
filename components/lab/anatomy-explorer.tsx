"use client";

import { useState } from "react";
import { Bone, Eye, Info, Layers } from "lucide-react";
import anatomyData from "@/public/data/endemic-anatomy.json";

const ANATOMY_TEXT = (anatomyData.entries ?? {}) as Record<
  string,
  { description: string; scientificName: string; refs: string[]; source_name: string; source_url: string }
>;

type Layer = "surface" | "skeleton" | "muscle";
type Mode =
  | "tiger"
  | "snub-monkey"
  | "pheasant"
  | "salamander"
  | "frog"
  | "snake"
  | "turtle"
  | "fish"
  | "crane"
  | "elephant"
  | "bird";

interface Part {
  id: string;
  label: string;
  x: number;
  y: number;
  summary: string;
  detail: string;
  layer: Layer;
}

const ELEPHANT_PARTS: Part[] = [
  {
    id: "trunk",
    label: "象鼻",
    x: 79,
    y: 56,
    summary: "约 4 万束肌肉，无骨骼",
    detail:
      "象鼻由大量肌肉束组成，没有骨骼，可完成吸水、抓握、吹沙、发声与社交触碰。鼻端有两个指状突起（非洲象），能精细夹取小物体。",
    layer: "surface",
  },
  {
    id: "tusk",
    label: "象牙",
    x: 85,
    y: 66,
    summary: "上颌门齿，终生生长",
    detail:
      "象牙是特化的上颌门齿，终生缓慢生长。象牙贸易是非洲象与亚洲象面临的主要威胁之一。象牙不是“獠牙”。",
    layer: "surface",
  },
  {
    id: "ear",
    label: "大耳",
    x: 63,
    y: 35,
    summary: "散热与社交信号",
    detail:
      "非洲象的大耳面积大、血管丰富，扇动可帮助散热。耳朵姿态也参与社交交流与威吓展示。",
    layer: "surface",
  },
  {
    id: "eye",
    label: "眼睛",
    x: 73,
    y: 40,
    summary: "视力较弱，依赖嗅觉与听觉",
    detail:
      "象的视力相对有限，但在弱光下仍可使用。它们更依赖灵敏的嗅觉、低频听觉与触觉来感知环境。",
    layer: "surface",
  },
  {
    id: "leg",
    label: "四肢",
    x: 45,
    y: 74,
    summary: "柱状支撑，足垫缓冲",
    detail:
      "四肢粗壮呈柱状，骨骼排列接近垂直，适合长时间承重行走。足部有弹性脂肪垫，可缓冲体重并降低行走噪声。",
    layer: "surface",
  },
  {
    id: "tail",
    label: "尾部",
    x: 17,
    y: 60,
    summary: "驱赶昆虫",
    detail: "尾部用于驱赶蚊蝇等昆虫，尾端有粗硬的毛束。",
    layer: "surface",
  },
  {
    id: "skin",
    label: "皮肤",
    x: 45,
    y: 48,
    summary: "厚但敏感，泥浴防晒",
    detail:
      "皮肤厚且褶皱多，可储存水分并帮助散热。大象常进行泥浴与沙浴，形成防晒与防虫的保护层。",
    layer: "surface",
  },
  {
    id: "skull",
    label: "颅骨与气腔",
    x: 69,
    y: 30,
    summary: "颅骨含大量气腔",
    detail:
      "象的颅骨体积大但重量相对轻，内部具有气腔结构。颅骨需要支撑象牙与强大的咀嚼肌，同时容纳大型脑。",
    layer: "skeleton",
  },
  {
    id: "ribs",
    label: "肋骨与胸腔",
    x: 45,
    y: 42,
    summary: "保护心肺与大型胸腔",
    detail:
      "肋骨构成宽大的胸腔。象的肺部与心脏体积大，支持长时间行走与低频发声所需的气流。",
    layer: "skeleton",
  },
  {
    id: "limbbone",
    label: "四肢骨骼",
    x: 45,
    y: 80,
    summary: "重而稳定的承重结构",
    detail:
      "四肢长骨粗壮，关节排列使体重沿骨柱传导。厚实的足垫与骨骼共同承担数吨体重。",
    layer: "skeleton",
  },
  {
    id: "masseter",
    label: "咀嚼肌",
    x: 73,
    y: 50,
    summary: "支持强力咀嚼",
    detail:
      "象的咀嚼肌发达，配合宽大的臼齿研磨植物纤维。臼齿会依次替换，生命周期内可更换数次。",
    layer: "muscle",
  },
  {
    id: "trunkmuscle",
    label: "鼻部肌群",
    x: 80,
    y: 54,
    summary: "复杂肌群协同",
    detail:
      "鼻部肌群呈复杂的纵向与环向排列，可完成伸展、卷曲、吸水和精确抓握。它是动物界最复杂的肌肉结构之一。",
    layer: "muscle",
  },
  {
    id: "legmuscle",
    label: "四肢肌群",
    x: 42,
    y: 72,
    summary: "支撑与推进",
    detail:
      "四肢肌群负责支撑体重与推进。大象不能奔跑，但可以快速行走，步态中常保留至少两足着地。",
    layer: "muscle",
  },
];

const BIRD_PARTS: Part[] = [
  {
    id: "wing",
    label: "翅膀",
    x: 45,
    y: 40,
    summary: "由羽毛构成升力面",
    detail:
      "鸟翼的飞羽排列形成升力面。初级飞羽负责推进，次级飞羽提供升力。羽毛的微观结构使其轻而坚韧。",
    layer: "surface",
  },
  {
    id: "beak",
    label: "喙",
    x: 82,
    y: 38,
    summary: "角质喙，无齿",
    detail:
      "现代鸟类没有牙齿，取食与处理食物依靠角质喙与肌胃。喙形与食性高度相关，但外形相似不一定代表亲缘关系近。",
    layer: "surface",
  },
  {
    id: "feather",
    label: "羽毛",
    x: 55,
    y: 58,
    summary: "保温、飞行与展示",
    detail:
      "羽毛由角蛋白构成，具有保温、防水、飞行与信号展示等功能。羽毛颜色来自色素与结构色。",
    layer: "surface",
  },
  {
    id: "keel",
    label: "龙骨突",
    x: 50,
    y: 66,
    summary: "飞行肌附着点",
    detail:
      "胸骨腹侧的龙骨突为胸肌提供大面积附着点。飞行能力强的鸟类龙骨突通常更发达；不会飞的鸟类可能退化。",
    layer: "skeleton",
  },
  {
    id: "hollow",
    label: "中空骨骼",
    x: 40,
    y: 52,
    summary: "轻量化骨架",
    detail:
      "许多鸟类骨骼具有气腔或中空结构，在保持强度的同时降低体重。这是飞行适应的一部分，但不是所有鸟类都同样程度地中空。",
    layer: "skeleton",
  },
  {
    id: "pec",
    label: "胸肌",
    x: 47,
    y: 62,
    summary: "驱动下扑",
    detail: "胸肌是飞行主要动力来源，附着于龙骨突，收缩时带动翅膀下扑。",
    layer: "muscle",
  },
];

const TIGER_PARTS: Part[] = [
  {
    id: "tiger-jaw",
    label: "犬齿与咬合",
    x: 79,
    y: 40,
    summary: "短颌、强咬肌",
    detail: "华南虎的犬齿粗壮，下颌短而厚，咬肌发达，适合制服中型有蹄类猎物。裂齿结构用于剪切肌肉与骨骼。",
    layer: "surface",
  },
  {
    id: "tiger-coat",
    label: "条纹毛被",
    x: 44,
    y: 42,
    summary: "每只条纹独一无二",
    detail: "条纹可打散身体轮廓，帮助在林地与灌丛中隐蔽。条纹模式个体间不同，可用于野外个体识别。",
    layer: "surface",
  },
  {
    id: "tiger-skull",
    label: "颅骨与 zygomatic",
    x: 72,
    y: 34,
    summary: "宽颧弓、短吻",
    detail: "猫科颅骨短而宽，颧弓粗壮以容纳咬肌。华南虎颅骨尺寸小于东北虎，符合其体型差异。",
    layer: "skeleton",
  },
  {
    id: "tiger-limb",
    label: "四肢骨",
    x: 38,
    y: 70,
    summary: "可伸缩爪、强壮肱骨",
    detail: "前肢肱骨与尺桡骨粗壮，配合可伸缩的爪，便于扑击与攀爬。后肢跖骨较长，提供爆发力。",
    layer: "skeleton",
  },
  {
    id: "tiger-muscle",
    label: "肩背肌群",
    x: 40,
    y: 36,
    summary: "扑击发力核心",
    detail: "肩胛周围肌群与背最长肌发达，支持短距离高速冲刺与扑击；猫科多为伏击型猎手，不擅长长距离追逐。",
    layer: "muscle",
  },
  {
    id: "tiger-tail",
    label: "尾与平衡",
    x: 12,
    y: 46,
    summary: "长尾辅助转向",
    detail: "尾椎链在跳跃与急转时提供平衡，尾端常为深色，可作为同类间的视觉信号。",
    layer: "muscle",
  },
];

const SNUB_MONKEY_PARTS: Part[] = [
  {
    id: "monkey-nose",
    label: "仰鼻",
    x: 78,
    y: 34,
    summary: "鼻孔上仰",
    detail: "金丝猴属的鼻梁短、鼻孔朝上，是“仰鼻猴”名称来源。这一特征在高山冷湿环境中可能与减少热量散失有关。",
    layer: "surface",
  },
  {
    id: "monkey-face",
    label: "蓝色面部",
    x: 74,
    y: 40,
    summary: "裸露皮肤呈蓝灰",
    detail: "川金丝猴面部皮肤裸露，呈淡蓝或灰蓝色；不同金丝猴种类的面部色彩与毛色差异是分类识别依据之一。",
    layer: "surface",
  },
  {
    id: "monkey-arm",
    label: "前肢与指骨",
    x: 40,
    y: 52,
    summary: "抓握与树栖",
    detail: "指骨长、拇指对握，适合在树枝间抓握与取食。前肢略短于后肢，利于在树冠层跳跃。",
    layer: "skeleton",
  },
  {
    id: "monkey-skull",
    label: "短吻颅骨",
    x: 70,
    y: 28,
    summary: "眶后闭合",
    detail: "灵长类眶后闭合、双眼前视，提供良好立体视觉；短吻与较大的脑颅比例是猴科特征。",
    layer: "skeleton",
  },
  {
    id: "monkey-muscle",
    label: "肩带肌群",
    x: 42,
    y: 38,
    summary: "攀爬与悬吊",
    detail: "肩带与胸肌发达，支持攀爬、悬吊与跳跃；金丝猴在秦岭等高海拔森林中依赖树冠层移动。",
    layer: "muscle",
  },
  {
    id: "monkey-tail",
    label: "长尾",
    x: 14,
    y: 50,
    summary: "平衡与社交",
    detail: "长尾在树间移动时辅助平衡，也是同类间姿态与情绪表达的一部分。",
    layer: "muscle",
  },
];

const PHEASANT_PARTS: Part[] = [
  {
    id: "pheasant-train",
    label: "尾羽",
    x: 18,
    y: 52,
    summary: "长尾羽、求偶展示",
    detail: "褐马鸡与红腹锦鸡的尾羽发达，雄鸟在求偶时展开或竖起尾羽。长尾也带来飞行灵活性上的代价。",
    layer: "surface",
  },
  {
    id: "pheasant-wattle",
    label: "面部裸皮",
    x: 78,
    y: 34,
    summary: "红色裸皮与冠羽",
    detail: "雉类的面部常具裸露皮肤，颜色鲜艳，配合冠羽用于求偶与个体识别；颜色来自皮肤血流与结构色。",
    layer: "surface",
  },
  {
    id: "pheasant-keel",
    label: "龙骨突",
    x: 48,
    y: 56,
    summary: "胸肌附着面",
    detail: "鸟类胸骨中央的龙骨突为胸肌提供附着面。雉类飞行能力有限，龙骨突相对不如候鸟发达。",
    layer: "skeleton",
  },
  {
    id: "pheasant-foot",
    label: "趾与爪",
    x: 44,
    y: 82,
    summary: "地栖抓刨",
    detail: "雉类为地栖鸟类，趾粗壮、爪钝，适合在落叶层刨食种子、昆虫与嫩芽。",
    layer: "skeleton",
  },
  {
    id: "pheasant-pec",
    label: "胸肌",
    x: 46,
    y: 48,
    summary: "短距离爆发飞行",
    detail: "胸肌驱动短距离爆发飞行，雉类常以突然起飞逃避捕食者，但难以长距离飞行。",
    layer: "muscle",
  },
  {
    id: "pheasant-leg-muscle",
    label: "后肢肌群",
    x: 40,
    y: 72,
    summary: "奔跑与刨地",
    detail: "后肢肌群发达，支持在地面快速奔跑与刨地取食，是地栖生活的主要运动方式。",
    layer: "muscle",
  },
];

const SALAMANDER_PARTS: Part[] = [
  {
    id: "salamander-skin",
    label: "皮肤与黏液",
    x: 46,
    y: 52,
    summary: "裸皮、辅助呼吸",
    detail: "大鲵皮肤裸露、富含黏液腺，可通过皮肤进行气体交换。皮肤对干燥与污染敏感，是环境指示特征。",
    layer: "surface",
  },
  {
    id: "salamander-head",
    label: "扁平头部",
    x: 78,
    y: 42,
    summary: "宽扁头、侧线",
    detail: "大鲵头部宽扁，口裂大，具侧线感受器，可在浑浊溪流中感知水流与猎物振动。",
    layer: "surface",
  },
  {
    id: "salamander-skull",
    label: "颅骨与颌",
    x: 72,
    y: 36,
    summary: "宽颌、细齿",
    detail: "两栖类颅骨较扁平，颌骨具细密牙齿，用于固定而非咀嚼；大鲵咬合力量大，捕食时以 suction 与咬合配合。",
    layer: "skeleton",
  },
  {
    id: "salamander-vertebra",
    label: "脊椎与肋",
    x: 40,
    y: 50,
    summary: "长躯干、多节脊椎",
    detail: "大鲵躯干长，脊椎节数多，配合侧向摆动产生游泳推进力；四肢短小，主要依靠躯干波动前进。",
    layer: "skeleton",
  },
  {
    id: "salamander-tail",
    label: "尾肌",
    x: 14,
    y: 52,
    summary: "侧扁尾、推进",
    detail: "尾部侧扁、肌肉发达，是游泳的主要推进结构；尾也可储存能量。",
    layer: "muscle",
  },
  {
    id: "salamander-limb",
    label: "四肢肌",
    x: 44,
    y: 70,
    summary: "短肢、爬行",
    detail: "四肢短小，主要用于在水底或岸边支撑与缓慢爬行，不承担高速运动。",
    layer: "muscle",
  },
];

const FROG_PARTS: Part[] = [
  {
    id: "frog-body",
    label: "短躯干与无尾",
    x: 45,
    y: 48,
    summary: "成体无尾、躯干短",
    detail: "蛙类成体尾部退化，躯干短而宽，便于跳跃时收拢身体。蝌蚪期仍有长尾，变态后消失。",
    layer: "surface",
  },
  {
    id: "frog-hindlimb",
    label: "长后肢",
    x: 40,
    y: 70,
    summary: "跳跃推进",
    detail: "后肢股骨与胫腓骨延长，跳跃时提供主要推进力。不同蛙类的后肢长度与其跳跃能力相关。",
    layer: "skeleton",
  },
  {
    id: "frog-tympanum",
    label: "鼓膜",
    x: 74,
    y: 42,
    summary: "感知声波",
    detail: "鼓膜位于眼后，是接收声波的结构。雄蛙常通过鸣叫宣示领域与求偶，鼓膜与鸣囊协同工作。",
    layer: "surface",
  },
  {
    id: "frog-skin",
    label: "皮肤与黏液",
    x: 48,
    y: 56,
    summary: "辅助呼吸、保湿",
    detail: "蛙类皮肤富含黏液腺，可辅助气体交换并保持湿润，对水质与湿度变化敏感。",
    layer: "surface",
  },
  {
    id: "frog-web",
    label: "蹼",
    x: 44,
    y: 80,
    summary: "游泳与攀爬",
    detail: "许多蛙类趾间具蹼，有助于游泳；树蛙类趾端常膨大，便于在枝叶间附着。",
    layer: "skeleton",
  },
  {
    id: "frog-jump-muscle",
    label: "后肢肌群",
    x: 36,
    y: 64,
    summary: "爆发式跳跃",
    detail: "后肢肌群（尤其臀肌与股肌）发达，能在短时间内产生爆发式推进，是逃避捕食者的关键。",
    layer: "muscle",
  },
];

const SNAKE_PARTS: Part[] = [
  {
    id: "snake-vertebra",
    label: "脊椎链",
    x: 45,
    y: 55,
    summary: "数百节脊椎、无四肢",
    detail: "蛇类脊椎数量可达数百节，每节与肋骨相连，形成高度灵活的躯干。四肢退化，运动依赖躯干的侧向波动。",
    layer: "skeleton",
  },
  {
    id: "snake-jaw",
    label: "可动颌关节",
    x: 78,
    y: 42,
    summary: "方骨可动、张口幅度大",
    detail: "蛇类的方骨与颅骨形成可动连接，配合左右下颌独立活动，能吞下相对较大的猎物。",
    layer: "skeleton",
  },
  {
    id: "snake-fang",
    label: "毒牙",
    x: 86,
    y: 45,
    summary: "沟牙或管牙",
    detail: "蝮蛇等具有管牙或沟牙，毒液经导管注入猎物。毒牙形态是蛇类分类与危险评估的重要依据。",
    layer: "surface",
  },
  {
    id: "snake-scale",
    label: "鳞片",
    x: 40,
    y: 42,
    summary: "角质鳞、减少失水",
    detail: "蛇类体表覆盖角质鳞片，可减少水分散失并保护皮肤。腹鳞特化，协助在粗糙表面移动。",
    layer: "surface",
  },
  {
    id: "snake-muscle",
    label: "体侧肌群",
    x: 45,
    y: 62,
    summary: "侧向波动推进",
    detail: "体侧肌群交替收缩，使躯干产生侧向波，配合腹鳞抓地完成前进。",
    layer: "muscle",
  },
  {
    id: "snake-tongue",
    label: "分叉舌",
    x: 92,
    y: 52,
    summary: "采集化学信号",
    detail: "蛇类分叉舌用于采集空气中的化学分子，送入犁鼻器分析，帮助追踪猎物与识别同类。",
    layer: "surface",
  },
];

const TURTLE_PARTS: Part[] = [
  {
    id: "turtle-carapace",
    label: "背甲",
    x: 45,
    y: 40,
    summary: "脊椎与肋骨融合",
    detail: "龟类背甲由脊椎与肋骨融合形成，外覆角质盾片。背甲是防御结构，也限制其运动方式。",
    layer: "skeleton",
  },
  {
    id: "turtle-plastron",
    label: "腹甲",
    x: 45,
    y: 66,
    summary: "腹面骨板",
    detail: "腹甲位于身体腹面，与背甲共同构成保护腔。闭壳龟类可通过韧带闭合甲壳。",
    layer: "skeleton",
  },
  {
    id: "turtle-neck",
    label: "颈部",
    x: 74,
    y: 46,
    summary: "可伸缩、颈椎灵活",
    detail: "龟类颈椎灵活，可将头颈缩入壳内。不同类群收缩方式（侧颈或直颈）不同。",
    layer: "surface",
  },
  {
    id: "turtle-limb",
    label: "四肢",
    x: 36,
    y: 70,
    summary: "陆龟柱状、水龟蹼足",
    detail: "陆龟四肢粗壮如柱，水龟四肢具蹼，形态差异反映栖息环境。",
    layer: "surface",
  },
  {
    id: "turtle-trunk-muscle",
    label: "肩带与腰肌",
    x: 42,
    y: 54,
    summary: "壳内肌肉固定",
    detail: "龟类肩带与腰带位于肋骨内侧，肌肉系统在壳内固定，支撑四肢伸缩。",
    layer: "muscle",
  },
  {
    id: "turtle-tail",
    label: "尾",
    x: 16,
    y: 56,
    summary: "短尾、泄殖腔开口",
    detail: "龟类尾部较短，泄殖腔开口位于尾基部。雌雄个体尾长与形态存在差异。",
    layer: "surface",
  },
];

const FISH_PARTS: Part[] = [
  {
    id: "fish-gill",
    label: "鳃",
    x: 72,
    y: 44,
    summary: "气体交换",
    detail: "鳃丝密布毛细血管，从水中提取溶解氧。鳃的结构对水体缺氧与污染非常敏感。",
    layer: "surface",
  },
  {
    id: "fish-lateral",
    label: "侧线",
    x: 45,
    y: 52,
    summary: "感知水流与振动",
    detail: "侧线是鱼类的机械感受系统，沿体侧分布，能探测水流变化与低频振动。",
    layer: "surface",
  },
  {
    id: "fish-fin",
    label: "鳍",
    x: 30,
    y: 38,
    summary: "背鳍、胸鳍、尾鳍",
    detail: "鳍由鳍条支撑，负责稳定、转向与推进。不同鱼类的鳍形反映其游泳方式。",
    layer: "skeleton",
  },
  {
    id: "fish-swimbladder",
    label: "鳔",
    x: 45,
    y: 44,
    summary: "调节浮力",
    detail: "多数硬骨鱼具有鳔，通过调节气体量控制浮力。底栖鱼类鳔常退化。",
    layer: "skeleton",
  },
  {
    id: "fish-muscle",
    label: "肌节",
    x: 40,
    y: 56,
    summary: "W 形肌节推进",
    detail: "鱼类躯干由 W 形肌节组成，交替收缩产生波浪式推进，是主要游泳动力。",
    layer: "muscle",
  },
  {
    id: "fish-jaw",
    label: "颌与口腔",
    x: 84,
    y: 48,
    summary: "摄食与呼吸共用通道",
    detail: "鱼类口腔与鳃腔相通，摄食与呼吸共用通道。不同食性的颌齿形态差异明显。",
    layer: "skeleton",
  },
];

const CRANE_PARTS: Part[] = [
  {
    id: "crane-neck",
    label: "长颈",
    x: 65,
    y: 32,
    summary: "颈椎多、视野高",
    detail: "鹤类颈椎数量多，颈部细长，可在浅水中高举头部观察周围环境。",
    layer: "skeleton",
  },
  {
    id: "crane-leg",
    label: "长腿",
    x: 52,
    y: 76,
    summary: "涉水行走",
    detail: "鹤类后肢细长，胫跗骨延长，适合在浅水与湿地行走。趾间无蹼，与鸭类不同。",
    layer: "skeleton",
  },
  {
    id: "crane-windpipe",
    label: "加长气管",
    x: 60,
    y: 46,
    summary: "鸣声低沉、传远",
    detail: "部分鹤类气管加长并盘曲于胸骨内，使鸣声低沉且传播距离更远。",
    layer: "surface",
  },
  {
    id: "crane-keel",
    label: "龙骨突",
    x: 45,
    y: 50,
    summary: "胸肌附着",
    detail: "鹤类胸骨具龙骨突，为飞行胸肌提供附着面。体型较大的鹤飞行时需要较强胸肌。",
    layer: "skeleton",
  },
  {
    id: "crane-wing",
    label: "翼肌",
    x: 42,
    y: 44,
    summary: "迁徙飞行",
    detail: "鹤类翼展大，胸肌与翼肌发达，支持长距离迁徙飞行。",
    layer: "muscle",
  },
  {
    id: "crane-beak",
    label: "喙",
    x: 82,
    y: 38,
    summary: "细长、取食水生动物",
    detail: "鹤类喙细长，适合在浅水中捕捉鱼、蛙与水生昆虫，不同种类喙形略有差异。",
    layer: "surface",
  },
];

const MODE_PARTS: Record<Mode, Part[]> = {
  tiger: TIGER_PARTS,
  "snub-monkey": SNUB_MONKEY_PARTS,
  pheasant: PHEASANT_PARTS,
  salamander: SALAMANDER_PARTS,
  frog: FROG_PARTS,
  snake: SNAKE_PARTS,
  turtle: TURTLE_PARTS,
  fish: FISH_PARTS,
  crane: CRANE_PARTS,
  elephant: ELEPHANT_PARTS,
  bird: BIRD_PARTS,
};

const MODE_LABELS: Record<Mode, string> = {
  tiger: "华南虎",
  "snub-monkey": "金丝猴",
  pheasant: "雉类",
  salamander: "大鲵",
  frog: "蛙类",
  snake: "蛇类",
  turtle: "龟类",
  fish: "鱼类",
  crane: "鹤类",
  elephant: "非洲象",
  bird: "鸟类",
};

const MODE_COLOR: Record<Mode, string> = {
  tiger: "#C97A3C",
  "snub-monkey": "#C7A55E",
  pheasant: "#8C4A2F",
  salamander: "#5B6B48",
  frog: "#6B7B4A",
  snake: "#6B7B4A",
  turtle: "#5E5236",
  fish: "#5E7A8A",
  crane: "#EDE8DC",
  elephant: "#8C8A80",
  bird: "#7C8994",
};

function modeForSlug(slug?: string, group?: string): Mode {
  if (!slug) return "tiger";
  if (/(lizard|agama)/.test(slug)) return "snake";
  if (/(viper|snake|krait|cobra)/.test(slug)) return "snake";
  if (/(turtle|tortoise)/.test(slug)) return "turtle";
  if (/(sturgeon|paddlefish|sucker|schizothorax|barbel|lenok|taimen|fish)/.test(slug) || group === "fish") return "fish";
  if (/(crane|tern|gull)/.test(slug)) return "crane";
  if (group === "bird") return "pheasant";
  if (/(frog|toad|hyla|microhyla|odorrana|quasipaa|rana|pelophylax|amops)/.test(slug)) return "frog";
  if (group === "amphibian") return "salamander";
  if (/(monkey|gibbon|macaque|langur)/.test(slug)) return "snub-monkey";
  return "tiger";
}

export interface AnatomySpeciesOption {
  slug: string;
  label: string;
  group?: string;
  note?: string;
}

export function AnatomyExplorer({
  initialSlug,
  group,
  options,
}: {
  initialSlug?: string;
  group?: string;
  options?: AnatomySpeciesOption[];
} = {}) {
  const [mode, setMode] = useState<Mode>(modeForSlug(initialSlug, group));
  const [speciesSlug, setSpeciesSlug] = useState(initialSlug ?? "");
  const [layer, setLayer] = useState<Layer>("surface");
  const parts = MODE_PARTS[mode];
  const [activeId, setActiveId] = useState(parts[0]?.id ?? "trunk");
  const visible = parts.filter((p) => p.layer === layer);
  const active = parts.find((p) => p.id === activeId) ?? parts[0];
  const selectedSpecies = options?.find((o) => o.slug === speciesSlug);

  function switchMode(next: Mode) {
    setMode(next);
    setLayer("surface");
    setActiveId(MODE_PARTS[next][0]?.id ?? "trunk");
  }

  function pickSpecies(slug: string) {
    setSpeciesSlug(slug);
    const target = options?.find((o) => o.slug === slug);
    const next = modeForSlug(slug, target?.group);
    setMode(next);
    setLayer("surface");
    setActiveId(MODE_PARTS[next][0]?.id ?? "trunk");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="border border-[var(--line)] bg-[var(--surface)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] p-3">
          <div className="flex gap-1">
            {(["tiger", "snub-monkey", "pheasant", "salamander", "frog", "snake", "turtle", "fish", "crane", "elephant", "bird"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`border px-3 py-1.5 text-[11px] ${
                  mode === m ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]" : "border-[var(--line)]"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
            <Layers size={12} /> 图层
          </div>
        </div>
        {options && options.length > 0 && (
          <div className="border-b border-[var(--line)] px-3 py-2">
            <label className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--muted)]">
              物种
              <select
                value={speciesSlug}
                onChange={(event) => pickSpecies(event.target.value)}
                className="border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--ink)]"
              >
                <option value="">按类群模板</option>
                {options.map((o) => (
                  <option key={o.slug} value={o.slug}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span>共 {options.length} 种可选</span>
            </label>
            {selectedSpecies && (
              <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">
                {selectedSpecies.label}
                {selectedSpecies.note ? ` · ${selectedSpecies.note}` : ""}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-1 border-b border-[var(--line)] px-3 py-2">
          {(["surface", "skeleton", "muscle"] as Layer[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLayer(l);
                const first = parts.find((p) => p.layer === l);
                if (first) setActiveId(first.id);
              }}
              className={`rounded-full px-3 py-1 text-[10px] ${
                layer === l ? "bg-[var(--surface-2)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {l === "surface" ? "外部形态" : l === "skeleton" ? "骨骼" : "肌肉"}
            </button>
          ))}
        </div>

        <div className="relative aspect-[4/3] bg-[#0F2E22]">
          <svg viewBox="0 0 100 100" className="h-full w-full" aria-label={`${MODE_LABELS[mode]}身体结构示意图`} role="img">
            <defs>
              <linearGradient id="anatomy-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#123526" />
                <stop offset="100%" stopColor="#081711" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#anatomy-bg)" />
            <g stroke="#A9BFA8" strokeOpacity="0.12" strokeWidth="0.2">
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />
              ))}
            </g>

            {mode === "tiger" || mode === "snub-monkey" || mode === "pheasant" || mode === "salamander" ? (
              <g>
                <ellipse
                  cx="44"
                  cy="48"
                  rx={mode === "salamander" ? 26 : 22}
                  ry={mode === "salamander" ? 8 : mode === "pheasant" ? 13 : 15}
                  fill={MODE_COLOR[mode]}
                  fillOpacity="0.85"
                  stroke="#EDE8DC"
                  strokeWidth="0.5"
                />
                <circle
                  cx={mode === "salamander" ? 74 : 67}
                  cy={mode === "pheasant" ? 40 : 36}
                  r={mode === "snub-monkey" ? 8 : mode === "salamander" ? 7 : 9}
                  fill={MODE_COLOR[mode]}
                  stroke="#EDE8DC"
                  strokeWidth="0.5"
                />
                {mode === "pheasant" && (
                  <path d="M30 44c-14 2-22 8-26 14 10-2 18-5 26-7Z" fill={MODE_COLOR[mode]} stroke="#EDE8DC" strokeWidth="0.3" />
                )}
                {mode === "snub-monkey" && <path d="M24 48c-8 3-12 9-12 16 6-4 10-7 14-9Z" fill={MODE_COLOR[mode]} />}
                {mode === "tiger" && <path d="M20 44c-8 2-13 7-15 12 6-1 11-3 15-5Z" fill={MODE_COLOR[mode]} />}
                {mode === "salamander" && <path d="M20 48c-10 1-16 3-18 5 8 2 14 2 19 1Z" fill={MODE_COLOR[mode]} />}
                <circle cx={mode === "salamander" ? 78 : 71} cy={mode === "pheasant" ? 38 : 35} r="1" fill="#141C18" />
              </g>
            ) : mode === "elephant" ? (
              <g>
                <ellipse cx="44" cy="48" rx="27" ry="20" fill="#8C8A80" fillOpacity="0.85" stroke="#EDE8DC" strokeWidth="0.5" />
                <circle cx="70" cy="38" r="12" fill="#8C8A80" stroke="#EDE8DC" strokeWidth="0.5" />
                <path d="M78 43c4 10 6 18 4 27-1 4-5 4-6 0-2-9-3-15-6-22Z" fill="#8C8A80" stroke="#EDE8DC" strokeWidth="0.5" />
                <path d="M62 33c-8-9-13-1-11 10 1 7 5 12 9 12Z" fill="#7E7C72" stroke="#EDE8DC" strokeWidth="0.4" />
                <path d="M79 50l2 13" stroke="#E9E2D3" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="75" cy="35" r="1.1" fill="#141C18" />
                <rect x="31" y="62" width="5" height="17" rx="2" fill="#7E7C72" />
                <rect x="43" y="63" width="5" height="17" rx="2" fill="#7E7C72" />
                <rect x="55" y="62" width="5" height="16" rx="2" fill="#7E7C72" />
                <path d="M19 44c-2 6-2 12 1 16" stroke="#8C8A80" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            ) : (
              <g>
                <ellipse cx="43" cy="48" rx="20" ry="13" fill="#7C8994" stroke="#EDE8DC" strokeWidth="0.5" />
                <circle cx="64" cy="40" r="7.5" fill="#EDE8DC" stroke="#7C8994" strokeWidth="0.4" />
                <path d="M71 39l9 2-9 3Z" fill="#C29B4A" />
                <path d="M44 40c12-4 22 2 27 10-12 2-22 0-30-4Z" fill="#5D6B74" stroke="#EDE8DC" strokeWidth="0.4" />
                <path d="M25 44c-6-2-10 1-12 5 6 2 11 1 15-1Z" fill="#5D6B74" />
                <circle cx="66" cy="38" r="0.9" fill="#141C18" />
                <path d="M36 60l-1 10M40 60l1 10" stroke="#C29B4A" strokeWidth="0.9" />
              </g>
            )}

            {layer === "skeleton" && (
              <g stroke="#E9E2D3" strokeWidth="0.7" fill="none" opacity="0.9">
                {mode === "elephant" ? (
                  <>
                    <path d="M68 32c6 0 8 4 8 8s-4 7-8 6" />
                    <path d="M38 40c8-6 20-6 26 0M37 48c9-5 20-5 27 0M39 56c8-4 18-4 25 0" />
                    <path d="M34 62v15M47 62v15M56 62v15" strokeWidth="1.6" />
                    <path d="M66 44c4 6 4 12 2 18" strokeWidth="1.2" />
                  </>
                ) : (
                  <>
                    <path d="M42 60c6 5 14 6 20 1" strokeWidth="1.5" />
                    <path d="M36 52c6-5 16-5 22 0M38 44c6-4 14-4 19 0" />
                    <path d="M44 39c8-3 16 0 20 6" strokeWidth="1.1" />
                  </>
                )}
              </g>
            )}

            {layer === "muscle" && (
              <g stroke="#C29B4A" strokeWidth="0.6" fill="none" opacity="0.85">
                {mode === "elephant" ? (
                  <>
                    <path d="M36 40c8 4 18 4 26 0M36 50c9 4 19 4 27 0" />
                    <path d="M46 61v14M56 61v13M34 61v14" strokeWidth="1.4" />
                    <path d="M76 40c3 8 3 16 1 22" strokeWidth="1.2" />
                  </>
                ) : (
                  <>
                    <path d="M40 42c8 4 18 5 24 3M41 52c9 4 18 3 22 0" />
                    <path d="M43 36c6-3 13-2 17 2" />
                  </>
                )}
              </g>
            )}

            <g fill="#EDE8DC" fontFamily="monospace" fontSize="1.6" opacity="0.5">
              <text x="4" y="95">FIG. {String(["tiger", "snub-monkey", "pheasant", "salamander", "elephant", "bird"].indexOf(mode) + 1).padStart(2, "0")} · {layer.toUpperCase()}</text>
              <text x="78" y="95">WILD WORLD</text>
            </g>
          </svg>

          {visible.map((part, index) => {
            const isActive = part.id === activeId;
            return (
              <button
                key={part.id}
                onClick={() => setActiveId(part.id)}
                style={{ left: `${part.x}%`, top: `${part.y}%` }}
                className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[9px] transition-all ${
                  isActive
                    ? "border-[#C29B4A] bg-[#C29B4A] text-[#0B2118] shadow-lg"
                    : "border-[#EDE8DC]/50 bg-black/40 text-[#EDE8DC]/80 hover:border-[#EDE8DC]"
                }`}
                aria-label={`查看 ${part.label} 的结构说明`}
                aria-pressed={isActive}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col">
        {selectedSpecies && ANATOMY_TEXT[selectedSpecies.slug] && (
          <div className="mb-3 border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="label text-[var(--muted)]">形态与鉴别 · {selectedSpecies.label}</p>
            <p className="mt-2 font-serif text-[12px] italic text-[var(--muted)]">
              {ANATOMY_TEXT[selectedSpecies.slug].scientificName}
            </p>
            <p className="mt-3 whitespace-pre-line text-[12px] leading-relaxed text-[var(--ink-soft)]">
              {ANATOMY_TEXT[selectedSpecies.slug].description}
            </p>
            {ANATOMY_TEXT[selectedSpecies.slug].refs.length > 0 && (
              <p className="mt-3 text-[10px] leading-relaxed text-[var(--muted)]">
                文献：{ANATOMY_TEXT[selectedSpecies.slug].refs[0]}
              </p>
            )}
          </div>
        )}
        <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="label text-[var(--muted)]">
            {layer === "surface" ? "Surface anatomy" : layer === "skeleton" ? "Skeletal system" : "Muscular system"}
          </p>
          <h3 className="display mt-2 text-[28px]">{active.label}</h3>
          <p className="mt-1 text-[12px] text-[var(--clay)]">{active.summary}</p>
          <p className="mt-4 text-[12px] leading-relaxed text-[var(--muted)]">{active.detail}</p>
        </div>

        <div className="mt-3 flex-1 border border-[var(--line)] bg-[var(--surface-2)] p-4">
          <p className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
            {layer === "skeleton" ? <Bone size={12} /> : <Eye size={12} />}
            本层热点
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visible.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`chip ${p.id === activeId ? "border-[var(--ink)] text-[var(--ink)]" : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 border border-[var(--line)] p-3 text-[9.5px] leading-relaxed text-[var(--muted)]">
          <Info size={12} className="mt-0.5 shrink-0 text-[var(--clay)]" />
          解剖示意图为馆方原创教学图，采用简化比例，不是医学或兽医学图谱。文字说明为编辑整理，参考 ADW 与博物馆公开资料。
        </div>
      </div>
    </div>
  );
}
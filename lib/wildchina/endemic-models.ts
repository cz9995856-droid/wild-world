import type { ModelKind } from "@/lib/wildchina/model-map";

export interface EndemicModelEntry {
  slug: string;
  label: string;
  group: "mammal" | "bird" | "reptile" | "fish" | "amphibian";
  kind: ModelKind;
  scientificName?: string;
}

/**
 * 中国特有脊椎动物 3D 展示清单。
 * 模型为类群通用程序化几何，用于观察体型比例与结构关系，不代表物种精确形态。
 */
export const ENDEMIC_MODELS: EndemicModelEntry[] = [
  // 哺乳纲
  { slug: "giant-panda", label: "大熊猫", group: "mammal", kind: "panda", scientificName: "Ailuropoda melanoleuca" },
  { slug: "sichuan-snub-nosed-monkey", label: "川金丝猴", group: "mammal", kind: "snub-monkey", scientificName: "Rhinopithecus roxellana" },
  { slug: "yunnan-snub-nosed-monkey", label: "滇金丝猴", group: "mammal", kind: "snub-monkey", scientificName: "Rhinopithecus bieti" },
  { slug: "guizhou-snub-nosed-monkey", label: "黔金丝猴", group: "mammal", kind: "snub-monkey", scientificName: "Rhinopithecus brelichi" },
  { slug: "hainan-gibbon", label: "海南长臂猿", group: "mammal", kind: "macaque", scientificName: "Nomascus hainanus" },
  { slug: "south-china-tiger", label: "华南虎", group: "mammal", kind: "tiger", scientificName: "Panthera tigris amoyensis" },
  { slug: "milu", label: "麋鹿", group: "mammal", kind: "milu", scientificName: "Elaphurus davidianus" },
  { slug: "baiji", label: "白鱀豚", group: "mammal", kind: "dolphin", scientificName: "Lipotes vexillifer" },
  { slug: "tibetan-antelope", label: "藏羚", group: "mammal", kind: "goat", scientificName: "Pantholops hodgsonii" },
  { slug: "przewalski-gazelle", label: "普氏原羚", group: "mammal", kind: "goat", scientificName: "Procapra przewalskii" },
  { slug: "sichuan-takin", label: "羚牛", group: "mammal", kind: "cattle", scientificName: "Budorcas taxicolor" },
  { slug: "wild-yak", label: "野牦牛", group: "mammal", kind: "cattle", scientificName: "Bos mutus" },
  { slug: "white-lipped-deer", label: "白唇鹿", group: "mammal", kind: "deer", scientificName: "Cervus albirostris" },
  { slug: "forest-musk-deer", label: "林麝", group: "mammal", kind: "deer", scientificName: "Moschus berezovskii" },
  { slug: "alpine-musk-deer", label: "马麝", group: "mammal", kind: "deer", scientificName: "Moschus chrysogaster" },
  { slug: "black-musk-deer", label: "黑麝", group: "mammal", kind: "deer", scientificName: "Moschus fuscus" },
  { slug: "white-headed-langur", label: "白头叶猴", group: "mammal", kind: "macaque", scientificName: "Trachypithecus leucocephalus" },
  { slug: "francois-langur", label: "黑叶猴", group: "mammal", kind: "macaque", scientificName: "Trachypithecus francoisi" },
  { slug: "tibetan-macaque", label: "藏酋猴", group: "mammal", kind: "macaque", scientificName: "Macaca thibetana" },
  { slug: "chinese-pangolin", label: "中华穿山甲", group: "mammal", kind: "cattle", scientificName: "Manis pentadactyla" },
  { slug: "large-indian-civet", label: "大灵猫", group: "mammal", kind: "tiger", scientificName: "Viverra zibetha" },
  { slug: "small-indian-civet", label: "小灵猫", group: "mammal", kind: "tiger", scientificName: "Viverricula indica" },
  { slug: "asian-golden-cat", label: "金猫", group: "mammal", kind: "tiger", scientificName: "Catopuma temminckii" },
  { slug: "chinese-hare", label: "华南兔", group: "mammal", kind: "rodent", scientificName: "Lepus sinensis" },
  { slug: "plateau-pika", label: "高原鼠兔", group: "mammal", kind: "rodent", scientificName: "Ochotona curzoniae" },
  { slug: "tibetan-pika", label: "藏鼠兔", group: "mammal", kind: "rodent", scientificName: "Ochotona thibetana" },
  { slug: "chinese-zokor", label: "中华鼢鼠", group: "mammal", kind: "rodent", scientificName: "Eospalax fontanierii" },
  { slug: "complex-toothed-flying-squirrel", label: "复齿鼯鼠", group: "mammal", kind: "rodent", scientificName: "Trogopterus xanthipes" },
  { slug: "tufted-deer", label: "毛冠鹿", group: "mammal", kind: "deer", scientificName: "Elaphodus cephalophus" },
  { slug: "chinese-serow", label: "中华鬣羚", group: "mammal", kind: "deer", scientificName: "Capricornis milneedwardsii" },

  // 鸟纲
  { slug: "brown-eared-pheasant", label: "褐马鸡", group: "bird", kind: "pheasant", scientificName: "Crossoptilon mantchuricum" },
  { slug: "blue-eared-pheasant", label: "蓝马鸡", group: "bird", kind: "pheasant", scientificName: "Crossoptilon auritum" },
  { slug: "white-eared-pheasant", label: "白马鸡", group: "bird", kind: "pheasant", scientificName: "Crossoptilon crossoptilon" },
  { slug: "golden-pheasant", label: "红腹锦鸡", group: "bird", kind: "pheasant", scientificName: "Chrysolophus pictus" },
  { slug: "silver-pheasant", label: "白腹锦鸡", group: "bird", kind: "pheasant", scientificName: "Lophura nycthemera" },
  { slug: "chinese-monal", label: "绿尾虹雉", group: "bird", kind: "pheasant", scientificName: "Lophophorus lhuysii" },
  { slug: "tibetan-eared-pheasant", label: "红腹角雉", group: "bird", kind: "pheasant", scientificName: "Tragopan temminckii" },
  { slug: "cabots-tragopan", label: "黄腹角雉", group: "bird", kind: "pheasant", scientificName: "Tragopan caboti" },
  { slug: "white-necked-long-tailed-pheasant", label: "白颈长尾雉", group: "bird", kind: "pheasant", scientificName: "Syrmaticus ellioti" },
  { slug: "reeves-pheasant", label: "白冠长尾雉", group: "bird", kind: "pheasant", scientificName: "Syrmaticus reevesii" },
  { slug: "sichuan-partridge", label: "四川山鹧鸪", group: "bird", kind: "pheasant", scientificName: "Arborophila rufipectus" },
  { slug: "hainan-partridge", label: "海南山鹧鸪", group: "bird", kind: "pheasant", scientificName: "Arborophila ardens" },
  { slug: "crested-ibis", label: "朱鹮", group: "bird", kind: "ibis", scientificName: "Nipponia nippon" },
  { slug: "reed-parrotbill", label: "震旦鸦雀", group: "bird", kind: "songbird", scientificName: "Paradoxornis heudei" },
  { slug: "chinese-thrush", label: "山噪鹛", group: "bird", kind: "songbird", scientificName: "Garrulax davidi" },
  { slug: "silver-pheasant-white", label: "白鹇", group: "bird", kind: "pheasant", scientificName: "Lophura nycthemera" },
  { slug: "koklass-pheasant", label: "勺鸡", group: "bird", kind: "pheasant", scientificName: "Pucrasia macrolopha" },
  { slug: "blood-pheasant", label: "血雉", group: "bird", kind: "pheasant", scientificName: "Ithaginis cruentus" },
  { slug: "severtzovs-grouse", label: "斑尾榛鸡", group: "bird", kind: "pheasant", scientificName: "Tetrastes sewerzowi" },
  { slug: "chinese-crested-tern", label: "中华凤头燕鸥", group: "bird", kind: "crane", scientificName: "Thalasseus bernsteini" },
  { slug: "yellow-bellied-tit", label: "黄腹山雀", group: "bird", kind: "songbird", scientificName: "Pardaliparus venustulus" },
  { slug: "white-browed-tit", label: "白眉山雀", group: "bird", kind: "songbird", scientificName: "Poecile superciliosus" },
  { slug: "silver-faced-tit", label: "银脸长尾山雀", group: "bird", kind: "songbird", scientificName: "Aegithalos fuliginosus" },
  { slug: "golden-fronted-fulvetta", label: "金额雀鹛", group: "bird", kind: "songbird", scientificName: "Lioparus chrysotis" },
  { slug: "baoxing-thrush", label: "宝兴歌鸫", group: "bird", kind: "songbird", scientificName: "Turdus mupinensis" },
  { slug: "grey-breasted-bamboo-partridge", label: "灰胸竹鸡", group: "bird", kind: "pheasant", scientificName: "Bambusicola thoracicus" },
  { slug: "hainan-partridge-white", label: "白额山鹧鸪", group: "bird", kind: "pheasant", scientificName: "Arborophila ardens" },
  { slug: "hainan-peacock-pheasant", label: "海南孔雀雉", group: "bird", kind: "pheasant", scientificName: "Polyplectron katsumatae" },
  { slug: "red-billed-blue-magpie", label: "红嘴蓝鹊", group: "bird", kind: "songbird", scientificName: "Urocissa erythroryncha" },
  { slug: "hwamei", label: "画眉", group: "bird", kind: "songbird", scientificName: "Garrulax canorus" },

  // 爬行纲
  { slug: "chinese-alligator", label: "扬子鳄", group: "reptile", kind: "crocodile", scientificName: "Alligator sinensis" },
  { slug: "chinese-crocodile-lizard", label: "鳄蜥", group: "reptile", kind: "lizard", scientificName: "Shinisaurus crocodilurus" },
  { slug: "mangshan-pit-viper", label: "莽山烙铁头", group: "reptile", kind: "snake", scientificName: "Protobothrops mangshanensis" },
  { slug: "white-headed-viper", label: "白头蝰", group: "reptile", kind: "snake", scientificName: "Azemiops kharini" },
  { slug: "chinese-cobra", label: "中华眼镜蛇", group: "reptile", kind: "snake", scientificName: "Naja atra" },
  { slug: "banded-krait", label: "金环蛇", group: "reptile", kind: "snake", scientificName: "Bungarus fasciatus" },
  { slug: "many-banded-krait", label: "银环蛇", group: "reptile", kind: "snake", scientificName: "Bungarus multicinctus" },
  { slug: "sharp-nosed-pit-viper", label: "尖吻蝮", group: "reptile", kind: "snake", scientificName: "Deinagkistrodon acutus" },
  { slug: "jerdons-pit-viper", label: "烙铁头", group: "reptile", kind: "snake", scientificName: "Protobothrops jerdonii" },
  { slug: "pointed-scaled-pit-viper", label: "原矛头蝮", group: "reptile", kind: "snake", scientificName: "Protobothrops mucrosquamatus" },
  { slug: "king-rat-snake", label: "王锦蛇", group: "reptile", kind: "snake", scientificName: "Elaphe carinata" },
  { slug: "beauty-rat-snake", label: "黑眉锦蛇", group: "reptile", kind: "snake", scientificName: "Elaphe taeniura" },
  { slug: "oriental-rat-snake", label: "乌梢蛇", group: "reptile", kind: "snake", scientificName: "Ptyas dhumnades" },
  { slug: "yellow-margined-box-turtle", label: "黄缘闭壳龟", group: "reptile", kind: "turtle", scientificName: "Cuora flavomarginata" },
  { slug: "central-asian-tortoise", label: "四爪陆龟", group: "reptile", kind: "turtle", scientificName: "Testudo horsfieldii" },
  { slug: "qinghai-toad-headed-agama", label: "青海沙蜥", group: "reptile", kind: "lizard", scientificName: "Phrynocephalus vlangalii" },
  { slug: "tibetan-toad-headed-agama", label: "西藏沙蜥", group: "reptile", kind: "lizard", scientificName: "Phrynocephalus theobaldi" },
  { slug: "hot-spring-snake", label: "温泉蛇", group: "reptile", kind: "snake", scientificName: "Thermophis baileyi" },
  { slug: "plateau-pit-viper", label: "高原蝮", group: "reptile", kind: "snake", scientificName: "Gloydius strauchii" },
  { slug: "short-tailed-pit-viper", label: "短尾蝮", group: "reptile", kind: "snake", scientificName: "Gloydius brevicaudus" },

  // 硬骨鱼纲
  { slug: "chinese-sturgeon", label: "中华鲟", group: "fish", kind: "fish", scientificName: "Acipenser sinensis" },
  { slug: "yangtze-sturgeon", label: "长江鲟", group: "fish", kind: "fish", scientificName: "Acipenser dabryanus" },
  { slug: "chinese-paddlefish", label: "白鲟", group: "fish", kind: "fish", scientificName: "Psephurus gladius" },
  { slug: "chinese-sucker", label: "胭脂鱼", group: "fish", kind: "fish", scientificName: "Myxocyprinus asiaticus" },
  { slug: "dali-schizothorax", label: "大理裂腹鱼", group: "fish", kind: "fish", scientificName: "Schizothorax taliensis" },
  { slug: "dianchi-golden-line-barbel", label: "滇池金线鲃", group: "fish", kind: "fish", scientificName: "Sinocyclocheilus grahami" },
  { slug: "qinling-lenok", label: "秦岭细鳞鲑", group: "fish", kind: "fish", scientificName: "Brachymystax lenok" },
  { slug: "sichuan-taimen", label: "川陕哲罗鲑", group: "fish", kind: "fish", scientificName: "Hucho bleekeri" },
  { slug: "bighead-schizothorax", label: "新疆大头鱼", group: "fish", kind: "fish", scientificName: "Aspiorhynchus laticeps" },
  { slug: "chinese-barbel", label: "中华倒刺鲃", group: "fish", kind: "fish", scientificName: "Spinibarbus sinensis" },

  // 两栖纲（保留代表物种，不再占多数）
  { slug: "chinese-giant-salamander", label: "大鲵", group: "amphibian", kind: "salamander", scientificName: "Andrias davidianus" },
  { slug: "hynobius-amjiensis", label: "安吉小鲵", group: "amphibian", kind: "salamander", scientificName: "Hynobius amjiensis" },
  { slug: "ichthyophis-bannanicus", label: "版纳鱼螈", group: "amphibian", kind: "salamander", scientificName: "Ichthyophis bannanicus" },
  { slug: "cynops-orientalis", label: "东方蝾螈", group: "amphibian", kind: "salamander", scientificName: "Cynops orientalis" },
  { slug: "tylototriton-shanjing", label: "红瘰疣螈", group: "amphibian", kind: "salamander", scientificName: "Tylototriton shanjing" },
  { slug: "echnotriton-chinhaiensis", label: "镇海棘螈", group: "amphibian", kind: "salamander", scientificName: "Echinotriton chinhaiensis" },
  { slug: "vibrissaphora-boringii", label: "峨眉髭蟾", group: "amphibian", kind: "salamander", scientificName: "Vibrissaphora boringii" },
  { slug: "vibrissaphora-liui", label: "崇安髭蟾", group: "amphibian", kind: "salamander", scientificName: "Vibrissaphora liui" },
  { slug: "polypedates-megacephalus", label: "大泛树蛙", group: "amphibian", kind: "salamander", scientificName: "Polypedates megacephalus" },
  { slug: "polypedates-leucomystax", label: "斑腿树蛙", group: "amphibian", kind: "salamander", scientificName: "Polypedates leucomystax" },
  { slug: "microhyla-fissipes", label: "饰纹姬蛙", group: "amphibian", kind: "frog", scientificName: "Microhyla fissipes" },
  { slug: "odorrana-wuchuanensis", label: "务川臭蛙", group: "amphibian", kind: "frog", scientificName: "Odorrana wuchuanensis" },
  { slug: "amops-wuyiensis", label: "武夷湍蛙", group: "amphibian", kind: "frog", scientificName: "Amolops wuyiensis" },
  { slug: "quasipaa-spinosa", label: "棘胸蛙", group: "amphibian", kind: "frog", scientificName: "Quasipaa spinosa" },
  { slug: "rana-tigrina", label: "虎纹蛙", group: "amphibian", kind: "frog", scientificName: "Hoplobatrachus rugulosus" },
  { slug: "rana-chensinensis", label: "中国林蛙", group: "amphibian", kind: "frog", scientificName: "Rana chensinensis" },
  { slug: "pelophylax-nigromaculatus", label: "黑斑侧褶蛙", group: "amphibian", kind: "frog", scientificName: "Pelophylax nigromaculatus" },
  { slug: "pelophylax-plancyi", label: "金线蛙", group: "amphibian", kind: "frog", scientificName: "Pelophylax plancyi" },
  { slug: "hyla-annectans", label: "华南雨蛙", group: "amphibian", kind: "frog", scientificName: "Hyla chinensis" },
  { slug: "hyla-santeriensis", label: "三港雨蛙", group: "amphibian", kind: "frog", scientificName: "Hyla sanchiangensis" },
];

export const ENDEMIC_MODEL_BY_SLUG = new Map(ENDEMIC_MODELS.map((m) => [m.slug, m]));
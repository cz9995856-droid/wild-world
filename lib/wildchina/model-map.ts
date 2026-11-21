export type ModelKind =
  | "panda"
  | "tiger"
  | "snub-monkey"
  | "macaque"
  | "milu"
  | "deer"
  | "rodent"
  | "antelope"
  | "goat"
  | "horse"
  | "yak"
  | "cattle"
  | "takin"
  | "pheasant"
  | "songbird"
  | "ibis"
  | "crane"
  | "duck"
  | "salamander"
  | "frog"
  | "snake"
  | "turtle"
  | "lizard"
  | "crocodile"
  | "fish"
  | "dolphin";

export const SLUG_TO_MODEL: Record<string, ModelKind> = {
  "giant-panda": "panda",
  "chinese-alligator": "crocodile",
  milu: "milu",
  "sichuan-snub-nosed-monkey": "snub-monkey",
  "yunnan-snub-nosed-monkey": "snub-monkey",
  "guizhou-snub-nosed-monkey": "snub-monkey",
  "hainan-gibbon": "macaque",
  "south-china-tiger": "tiger",
  "przewalski-gazelle": "goat",
  "tibetan-antelope": "goat",
  "brown-eared-pheasant": "pheasant",
  "chinese-monal": "pheasant",
  "chinese-giant-salamander": "salamander",
  baiji: "dolphin",
};

const RULES: Array<{ test: RegExp; kind: ModelKind }> = [
  { test: /(viper|snake|krait|cobra)/, kind: "snake" },
  { test: /(turtle|tortoise|terrapin)/, kind: "turtle" },
  { test: /(lizard|agama)/, kind: "lizard" },
  { test: /(alligator|crocodile)/, kind: "crocodile" },
  { test: /(sturgeon|paddlefish|sucker|schizothorax|barbel|lenok|taimen|carp|fish)/, kind: "fish" },
  { test: /(crane|tern|gull)/, kind: "crane" },
  { test: /(duck|goose|swan)/, kind: "duck" },
  { test: /(ibis)/, kind: "ibis" },
  {
    test: /(pheasant|monal|tragopan|partridge|peacock|grouse|koklass|blood-pheasant|silver-pheasant|junglefowl)/,
    kind: "pheasant",
  },
  { test: /(tit|fulvetta|parrotbill|thrush|magpie|hwamei|babbler|warbler)/, kind: "songbird" },
  { test: /(musk-deer|deer|serow|muntjac)/, kind: "deer" },
  { test: /(takin|yak|cattle|buffalo|ox|pangolin)/, kind: "cattle" },
  { test: /(gazelle|antelope)/, kind: "goat" },
  { test: /(pika|squirrel|zokor|hare|rabbit|rodent)/, kind: "rodent" },
  { test: /(langur|macaque|gibbon|monkey)/, kind: "macaque" },
  { test: /(civet|cat|tiger|leopard)/, kind: "tiger" },
  { test: /(panda)/, kind: "panda" },
  { test: /(milu)/, kind: "milu" },
  { test: /(dolphin|baiji|porpoise)/, kind: "dolphin" },
  { test: /(salamander|newt|caecilian)/, kind: "salamander" },
  {
    test: /(hynobius|cynops|tylototriton|echnotriton|vibrissaphora|ichthyophis|andrias|paramesotriton|pachytriton)/,
    kind: "salamander",
  },
  { test: /(frog|toad|treefrog|pelophylax|hyla|microhyla|odorrana|quasipaa|rana|amops|polypedates)/, kind: "frog" },
];

export function modelForSlug(slug: string, group?: string): ModelKind {
  if (SLUG_TO_MODEL[slug]) return SLUG_TO_MODEL[slug];
  for (const rule of RULES) {
    if (rule.test.test(slug)) return rule.kind;
  }
  if (group === "amphibian") return "frog";
  if (group === "bird") return "pheasant";
  if (group === "reptile") return "snake";
  if (group === "fish") return "fish";
  if (group === "mammal") return "deer";
  return "panda";
}

export interface ModelOption {
  slug: string;
  label: string;
  note: string;
  kind: ModelKind;
  tint: number;
  group?: string;
}

export function hashTint(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}
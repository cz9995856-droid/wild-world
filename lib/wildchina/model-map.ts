export type ModelKind =
  | "panda"
  | "tiger"
  | "snub-monkey"
  | "milu"
  | "antelope"
  | "horse"
  | "yak"
  | "takin"
  | "pheasant"
  | "ibis"
  | "salamander"
  | "crocodile"
  | "dolphin";

export const SLUG_TO_MODEL: Record<string, ModelKind> = {
  "giant-panda": "panda",
  "chinese-alligator": "crocodile",
  milu: "milu",
  "sichuan-snub-nosed-monkey": "snub-monkey",
  "yunnan-snub-nosed-monkey": "snub-monkey",
  "guizhou-snub-nosed-monkey": "snub-monkey",
  "hainan-gibbon": "snub-monkey",
  "south-china-tiger": "tiger",
  "przewalski-gazelle": "antelope",
  "tibetan-antelope": "antelope",
  "brown-eared-pheasant": "pheasant",
  "chinese-monal": "pheasant",
  "chinese-giant-salamander": "salamander",
  baiji: "dolphin",
};

export function modelForSlug(slug: string, group?: string): ModelKind {
  if (SLUG_TO_MODEL[slug]) return SLUG_TO_MODEL[slug];
  if (group === "amphibian") return "salamander";
  if (group === "bird") return "pheasant";
  if (group === "reptile") return "crocodile";
  if (group === "fish") return "dolphin";
  if (group === "mammal") return "tiger";
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
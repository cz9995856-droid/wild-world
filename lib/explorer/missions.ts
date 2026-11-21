export interface ExplorerMission {
  date: string;
  province: string;
  group: string;
  groupLabel: string;
  count: number;
  href: string;
}

const PROVINCES = ["云南", "四川", "贵州", "广西", "海南", "台湾", "西藏", "青海", "广东", "福建", "浙江", "湖南"];
const GROUPS: Array<[string, string]> = [
  ["amphibian", "两栖动物"],
  ["mammal", "哺乳动物"],
  ["bird", "鸟类"],
  ["reptile", "爬行动物"],
];

function hashText(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function missionHref(province: string, group: string): string {
  return `/explore/encyclopedia?province=${encodeURIComponent(province)}&group=${group}`;
}

export function buildMissions(dateKey: string, days = 7): ExplorerMission[] {
  const base = new Date(`${dateKey}T00:00:00+08:00`);
  const missions: ExplorerMission[] = [];
  for (let i = 0; i < days; i += 1) {
    const day = new Date(base.getTime() + i * 86400000);
    const key = day.toISOString().slice(0, 10);
    const seed = hashText(key);
    const province = PROVINCES[seed % PROVINCES.length];
    const [group, groupLabel] = GROUPS[Math.floor(seed / 7) % GROUPS.length];
    missions.push({
      date: key,
      province,
      group,
      groupLabel,
      count: 2 + (seed % 2),
      href: missionHref(province, group),
    });
  }
  return missions;
}
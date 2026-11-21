const GROUP_COLOR: Record<string, string> = {
  mammal: "#b45309",
  bird: "#0369a1",
  amphibian: "#4d7c0f",
  reptile: "#9a3412",
  fish: "#3730a3",
};

const GROUP_BG: Record<string, string> = {
  mammal: "#fdf3e3",
  bird: "#e8f3fb",
  amphibian: "#eef5df",
  reptile: "#fbece2",
  fish: "#ecebfb",
};

export function SpeciesTypeCard({
  nameCn,
  scientificName,
  groupLabel,
  group,
  aspectRatio = "1 / 1",
}: {
  nameCn: string;
  scientificName: string;
  groupLabel: string;
  group: string;
  aspectRatio?: string;
}) {
  const accent = GROUP_COLOR[group] ?? "#1c1a17";
  const bg = GROUP_BG[group] ?? "#f4f1ea";
  return (
    <div className="species-type-card" style={{ aspectRatio, background: bg, color: accent }}>
      <span className="species-type-watermark" aria-hidden="true">
        {nameCn.slice(0, 1)}
      </span>
      <span className="species-type-group">{groupLabel}</span>
      <div className="species-type-body">
        <p className="species-type-name">{nameCn}</p>
        <p className="species-type-sci">{scientificName}</p>
      </div>
      <span className="species-type-foot">WildChina · 汉字卡</span>
    </div>
  );
}
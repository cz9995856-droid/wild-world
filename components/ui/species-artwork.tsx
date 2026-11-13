import type { Species } from "@/lib/types";

const SHAPE_EARS: Record<string, { left: string; right: string }> = {
  bear: { left: "M60 74a15 15 0 1 0 .1 0Z", right: "M140 74a15 15 0 1 0 .1 0Z" },
  cat: { left: "M64 70 78 34 96 62Z", right: "M136 70 122 34 104 62Z" },
  canine: { left: "M62 72 70 38 92 60Z", right: "M138 72 130 38 108 60Z" },
  antelope: { left: "M72 66c-8-20-6-32 2-42 2 12 8 20 16 24Z", right: "M128 66c8-20 6-32-2-42-2 12-8 20-16 24Z" },
  primate: { left: "M56 92a12 12 0 1 0 .1 0Z", right: "M144 92a12 12 0 1 0 .1 0Z" },
  elephant: { left: "M48 82c-10-26 4-38 22-34 2 12 2 26-2 38Z", right: "M152 82c10-26-4-38-22-34-2 12-2 26 2 38Z" },
  bird: { left: "M62 66 70 44l14 16Z", right: "M138 66 130 44l-14 16Z" },
  whale: { left: "M70 78c-4-16 6-22 14-12Z", right: "M130 78c4-16-6-22-14-12Z" },
  reptile: { left: "M64 76c-4-12 4-18 12-10Z", right: "M136 76c4-12-4-18-12-10Z" },
  amphibian: { left: "M66 78c-6-10 0-18 10-12Z", right: "M134 78c6-10 0-18-10-12Z" },
  insect: { left: "M70 70c-8-18 2-30 10-14Z", right: "M130 70c8-18-2-30-10-14Z" },
};

const EXTRA: Record<string, string> = {
  elephant:
    "M100 122c-3 22 3 38 14 46 7 5 14 1 12-7-2-8-5-10-5-18",
  bird: "M92 104h16l-8 14Z",
  antelope: "M100 46c-6 0-10-4-10-9",
  whale: "M52 106c10 10 26 14 48 14s38-4 48-14",
  insect: "M74 84c-14-6-22-2-26 6 8 6 16 6 24 2Zm52 0c14-6 22-2 26 6-8 6-16 6-24 2Z",
  amphibian: "M74 112c-8 2-12 8-10 14M126 112c8 2 12 8 10 14",
  reptile: "M82 118c4 8 32 8 36 0",
  primate: "M80 118c6 6 34 6 40 0",
  cat: "M84 112c4 4 28 4 32 0",
  bear: "M86 114c6 4 22 4 28 0",
  canine: "M86 114c6 4 22 4 28 0",
  giraffe: "M92 46v-16m16 16V30M88 30h24",
};

export function SpeciesArtwork({
  species,
  className = "",
  showLabel = true,
  priority = false,
}: {
  species: Pick<Species, "slug" | "name_cn" | "name_en" | "scientific_name" | "palette" | "artwork">;
  className?: string;
  showLabel?: boolean;
  priority?: boolean;
}) {
  const { palette, artwork } = species;
  const ears = SHAPE_EARS[artwork] ?? SHAPE_EARS.bear;
  const gid = `g-${species.slug.replace(/[^a-z0-9-]/g, "")}`;

  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role={showLabel ? "img" : "presentation"}
      aria-label={showLabel ? `${species.name_cn} 原创风格化插画` : undefined}
      aria-hidden={showLabel ? undefined : true}
      data-priority={priority || undefined}
      style={{ background: palette.base }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.base} />
          <stop offset="100%" stopColor={palette.deep} stopOpacity="0.92" />
        </linearGradient>
        <radialGradient id={`${gid}-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={palette.accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${gid}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke={palette.deep} strokeOpacity="0.09" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="200" height="240" fill={`url(#${gid})`} />
      <rect width="200" height="240" fill={`url(#${gid}-grid)`} />
      <circle cx="148" cy="52" r="58" fill={`url(#${gid}-sun)`} />
      <g opacity="0.94">
        <path d={ears.left} fill={palette.deep} />
        <path d={ears.right} fill={palette.deep} />
        <ellipse cx="100" cy="92" rx="46" ry="42" fill={palette.deep} />
        <ellipse cx="100" cy="112" rx="27" ry="22" fill={palette.base} opacity="0.92" />
        <circle cx="84" cy="86" r="3.4" fill={palette.base} />
        <circle cx="116" cy="86" r="3.4" fill={palette.base} />
        <path d="M94 104c3 4 9 4 12 0" stroke={palette.deep} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d={EXTRA[artwork] ?? EXTRA.bear} stroke={palette.deep} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      <g opacity="0.55" stroke={palette.deep} strokeWidth="0.7">
        <path d="M12 12h18M12 12v18M188 228h-18M188 228v-18" fill="none" />
        <path d="M12 200h44M144 200h44" fill="none" />
      </g>
      {showLabel && (
        <g fill={palette.deep}>
          <text x="12" y="223" fontSize="7.5" letterSpacing="2.2" fontFamily="monospace" opacity="0.72">
            {species.scientific_name.toUpperCase()}
          </text>
          <text x="12" y="234" fontSize="9" letterSpacing="1.4" fontFamily="Georgia, serif" opacity="0.9">
            {species.name_en}
          </text>
        </g>
      )}
    </svg>
  );
}
import Image from "next/image";
import type { NewsCategory } from "@/lib/types";
import type { NewsVisual } from "@/lib/news-visual";

export function NewsArt({
  visual,
  category,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: {
  visual: NewsVisual | null;
  category: NewsCategory;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!visual) {
    return (
      <div className={`flex items-center justify-center bg-[#0B2118] text-[10px] uppercase tracking-[0.2em] text-white/40 ${className}`}>
        WILD WORLD · {category}
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-[#0B2118] ${className}`}>
      <Image
        src={visual.url}
        alt={`${visual.species_name} 授权影像（新闻示意图）`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[8.5px] leading-tight text-white/85">
        示意图 · {visual.species_name} · © {visual.author} · {visual.license}
      </span>
    </div>
  );
}
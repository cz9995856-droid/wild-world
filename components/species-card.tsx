import Image from "next/image";
import Link from "next/link";
import type { Species } from "@/lib/types";
import { SpeciesArtwork } from "@/components/ui/species-artwork";
import { ConservationBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

export function CoverImage({
  src,
  alt,
  species,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  species: Species;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <SpeciesArtwork
        species={species}
        className={cn("h-full w-full object-cover", className)}
        priority={priority}
        showLabel={false}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}

export function SpeciesCard({
  species,
  photo,
  index,
  className,
  priority = false,
}: {
  species: Species;
  photo?: string | null;
  index?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/encyclopedia/${species.slug}`}
      className={cn("group block", className)}
      aria-label={`${species.name_cn} ${species.name_en}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xs bg-[var(--surface-2)]">
        <CoverImage
          src={photo}
          alt={`${species.name_cn}（${species.scientific_name}）`}
          species={species}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
          priority={priority}
          className="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,23,17,0.78)] via-[rgba(8,23,17,0.06)] to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <ConservationBadge code={species.conservation.status} label={species.conservation.status_label} />
        </div>
        {typeof index === "number" && (
          <span className="absolute right-3 top-3 font-mono text-[10px] tracking-widest text-white/70">
            {String(index + 1).padStart(3, "0")}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 text-[#F5F1E7] sm:p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/65">{species.group_label}</p>
          <h3 className="display mt-1.5 text-[24px] leading-tight">{species.name_cn}</h3>
          <p className="mt-1 text-[11px] italic text-white/70">{species.scientific_name}</p>
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 pt-3">
        <div className="min-w-0">
          <p className="text-[12.5px] font-medium">{species.name_en}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">{species.tagline}</p>
        </div>
        <span className="mt-0.5 shrink-0 text-[var(--muted)] transition-transform duration-300 group-hover:translate-x-1">
          ↗
        </span>
      </div>
    </Link>
  );
}
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function WcPhoto({
  src,
  alt,
  priority = false,
  sizes = "100vw",
  className,
  fallbackClassName,
  fallbackLabel = "影像待人工审核",
  fallbackNote = "缺少可核验的授权图片",
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  fallbackClassName?: string;
  fallbackLabel?: string;
  fallbackNote?: string;
}) {
  if (!src) {
    return (
      <div className={cn("wc-media-placeholder", fallbackClassName)}>
        <ImageOff size={20} aria-hidden="true" />
        <p className="text-[13px]">{fallbackLabel}</p>
        <p className="text-[10.5px] leading-relaxed">{fallbackNote}</p>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}

export function WcCredit({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[9.5px] leading-relaxed text-[var(--muted)]", className)}>{children}</p>
  );
}
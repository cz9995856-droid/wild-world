import Link from "next/link";
import type { ReactNode } from "react";
import { YIcon } from "./icons";

export function Band({
  color,
  children,
  className = "",
  hero = false,
}: {
  color: string;
  children: ReactNode;
  className?: string;
  hero?: boolean;
}) {
  return (
    <section className={`y-band ${hero ? "y-band-hero" : ""} ${className}`} style={{ background: color }}>
      {children}
    </section>
  );
}

export function EntryCard({
  href,
  icon,
  title,
  desc,
  color,
}: {
  href: string;
  icon: "paw" | "map" | "cards" | "target" | "spark" | "book";
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <Link prefetch={false} href={href} className="y-entry" style={{ background: color }}>
      <YIcon name={icon} />
      <span className="y-title text-[21px] leading-tight">{title}</span>
      <span className="text-[12px] font-medium leading-snug">{desc}</span>
    </Link>
  );
}
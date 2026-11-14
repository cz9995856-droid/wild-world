import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { WC_SECTIONS } from "@/lib/wildchina/site";

export function FeatureGrid() {
  return (
    <div className="wc-grid">
      {WC_SECTIONS.map((section) => (
        <Link key={section.href} href={section.href} className="wc-feature">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={section.image} alt={section.title} loading="lazy" />
          <span className="wc-feature-arrow" aria-hidden="true">
            <ArrowUpRight size={17} />
          </span>
          <div className="wc-feature-body">
            <p className="text-[10px] tracking-[0.26em] text-[#f3ede1]/70">{section.en.toUpperCase()}</p>
            <h2 className="display mt-2 text-[28px] sm:text-[34px]">{section.title}</h2>
            <p className="mt-2 max-w-[46ch] text-[12.5px] leading-relaxed text-[#f3ede1]/80">
              {section.description}
            </p>
            <p className="mt-3 text-[9px] text-[#f3ede1]/55">影像：{section.imageCredit}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
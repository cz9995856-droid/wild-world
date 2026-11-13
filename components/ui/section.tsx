import type { ReactNode } from "react";

export function SectionHeading({
  index,
  kicker,
  title,
  description,
  action,
  invert = false,
  className = "",
}: {
  index?: string;
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  invert?: boolean;
  className?: string;
}) {
  return (
    <div className={`mb-10 grid gap-6 lg:mb-14 lg:grid-cols-[1.35fr_1fr] lg:items-end ${className}`}>
      <div>
        <div className={`mb-4 flex items-center gap-3 ${invert ? "text-[#A9BFA8]" : "text-[var(--muted)]"}`}>
          {index && <span className="label">{index}</span>}
          <span className={`h-[1px] w-8 ${invert ? "bg-[#A9BFA8]/50" : "bg-[var(--line-strong)]"}`} />
          <span className="label">{kicker}</span>
        </div>
        <h2 className="display max-w-[18ch] text-[34px] sm:text-[44px] lg:text-[52px]">{title}</h2>
      </div>
      <div className={`flex flex-col gap-5 lg:items-end lg:text-right ${invert ? "text-[#C7CEC2]" : "text-[var(--muted)]"}`}>
        {description && <p className="max-w-md text-[13px] leading-relaxed">{description}</p>}
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

export function SectionShell({
  id,
  children,
  tone = "paper",
  className = "",
}: {
  id?: string;
  children: ReactNode;
  tone?: "paper" | "surface" | "forest";
  className?: string;
}) {
  const bg =
    tone === "forest" ? "bg-[#0B2118] text-[#EDE8DC]" : tone === "surface" ? "bg-[var(--surface-2)]" : "";
  return (
    <section id={id} className={`relative py-16 sm:py-20 lg:py-28 ${bg} ${className}`}>
      <div className="container-museum">{children}</div>
    </section>
  );
}
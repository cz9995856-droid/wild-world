import Link from "next/link";

export function PageHeader({
  kicker,
  title,
  description,
  meta,
  breadcrumbs,
  children,
}: {
  kicker: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative border-b border-[var(--line)] pb-10 pt-[104px] sm:pb-14 sm:pt-[124px]">
      <div className="container-museum">
        {breadcrumbs && (
          <nav aria-label="面包屑" className="mb-6 flex flex-wrap items-center gap-2 text-[10px] text-[var(--muted)]">
            <Link href="/" className="hover:text-[var(--ink)]">首页</Link>
            {breadcrumbs.map((b) => (
              <span key={b.label} className="flex items-center gap-2">
                <span>/</span>
                {b.href ? (
                  <Link href={b.href} className="hover:text-[var(--ink)]">{b.label}</Link>
                ) : (
                  <span className="text-[var(--ink-soft)]">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3 text-[var(--muted)]">
              <span className="h-[1px] w-8 bg-[var(--line-strong)]" />
              <span className="label">{kicker}</span>
            </div>
            <h1 className="display max-w-[22ch] text-[38px] leading-[1.02] sm:text-[52px] lg:text-[64px]">{title}</h1>
          </div>
          <div className="flex flex-col gap-4 lg:items-end lg:text-right">
            {description && <p className="max-w-lg text-[12.5px] leading-relaxed text-[var(--muted)]">{description}</p>}
            {meta}
          </div>
        </div>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  );
}
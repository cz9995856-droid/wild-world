import { Inbox, TriangleAlert } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-[var(--line-strong)] px-6 py-16 text-center">
      <Inbox size={26} className="text-[var(--muted)]" />
      <p className="mt-4 text-[14px] font-medium">{title}</p>
      {description && <p className="mt-2 max-w-md text-[12px] leading-relaxed text-[var(--muted)]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center border border-[#A96246]/30 bg-[#A96246]/5 px-6 py-14 text-center">
      <TriangleAlert size={26} className="text-[var(--clay)]" />
      <p className="mt-4 text-[14px] font-medium">{title}</p>
      {description && <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-[var(--muted)]">{description}</p>}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[4/5] w-full rounded-xs" />
      <div className="skeleton mt-3 h-3 w-2/3" />
      <div className="skeleton mt-2 h-2.5 w-1/2" />
    </div>
  );
}
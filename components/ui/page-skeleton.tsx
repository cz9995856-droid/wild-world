import { CardSkeleton } from "@/components/ui/states";

export function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="container-museum pb-20 pt-[120px]">
      <div className="skeleton h-3 w-28" />
      <div className="skeleton mt-5 h-12 w-2/3 max-w-2xl" />
      <div className="skeleton mt-4 h-3 w-full max-w-lg" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TableSkeleton({
  rows = 8,
  columns = 6,
  showHeader = true,
  className,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)} aria-hidden>
      {showHeader ? (
        <div className="flex gap-4 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1 max-w-[120px]" />
          ))}
        </div>
      ) : null}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex items-center gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton
                key={col}
                className={cn("h-4 flex-1", col === 0 && "max-w-[100px]")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

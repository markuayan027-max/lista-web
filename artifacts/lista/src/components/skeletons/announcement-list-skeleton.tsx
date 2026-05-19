import { Skeleton } from "@/components/ui/skeleton";

export function AnnouncementListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-10">
      <Skeleton className="h-4 w-32 border-b pb-2" />
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-card-border bg-white p-6 space-y-3"
          >
            <div className="flex justify-between gap-4">
              <Skeleton className="h-5 w-2/3 max-w-sm" />
              <Skeleton className="h-4 w-20 shrink-0" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

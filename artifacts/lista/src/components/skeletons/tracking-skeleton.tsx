import { Skeleton } from "@/components/ui/skeleton";

export function TrackingSkeleton() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>
      <div className="rounded-3xl border border-gray-200 overflow-hidden bg-white">
        <div className="bg-gray-50 border-b border-gray-100 p-6 space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-7 w-2/3 max-w-md" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

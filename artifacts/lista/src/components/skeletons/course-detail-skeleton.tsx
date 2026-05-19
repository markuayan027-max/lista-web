import { Skeleton } from "@/components/ui/skeleton";

export function CourseDetailSkeleton() {
  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      <div className="bg-white border-b border-card-border pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <Skeleton className="h-4 w-32 mt-6 mb-8" />
          <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
            <div className="flex-1 space-y-6">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-12 w-full max-w-2xl" />
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-3/4 max-w-lg" />
            </div>
            <Skeleton className="w-full lg:w-96 aspect-[4/3] rounded-3xl shrink-0" />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonLine({
  className,
  width = "w-full",
}: {
  className?: string;
  width?: string;
}) {
  return <Skeleton className={cn("h-3", width, className)} />;
}

export function SkeletonHeading({ className }: { className?: string }) {
  return <Skeleton className={cn("h-8 w-2/3 max-w-md", className)} />;
}

export function SkeletonParagraph({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-3/5"];
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

export function SkeletonCircle({
  size = "h-10 w-10",
  className,
}: {
  size?: string;
  className?: string;
}) {
  return <Skeleton className={cn("rounded-full shrink-0", size, className)} />;
}

export function SkeletonImage({
  aspect = "aspect-[16/10]",
  className,
}: {
  aspect?: string;
  className?: string;
}) {
  return <Skeleton className={cn("w-full rounded-xl", aspect, className)} />;
}

export function SkeletonButton({
  className,
  size = "h-10 w-28",
}: {
  className?: string;
  size?: string;
}) {
  return <Skeleton className={cn("rounded-lg", size, className)} />;
}

export function ContentFadeIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("content-fade-in", className)}>{children}</div>;
}

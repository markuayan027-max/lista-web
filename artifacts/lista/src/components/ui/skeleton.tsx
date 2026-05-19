import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  shimmer?: boolean;
};

function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-md",
        shimmer ? "skeleton-shimmer" : "animate-pulse bg-primary/10",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };

import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveCourseCoverImage } from "@/lib/course-images";
import OptimizedImage from "@/components/optimized-image";
import { BookOpen, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { NcLevelBadge } from "@/components/nc-level-badge";
import { useCardPointerGlow } from "@/hooks/use-card-pointer-glow";

interface Course {
  slug: string;
  name: string;
  sector: string;
  ncLevel: string;
  shortDescription?: string;
  coverImageUrl?: string;
  twspScholarship?: string;
  isFrozen?: boolean;
}

interface CourseCardProps {
  course: Course;
  hideLockOverlay?: boolean;
  /** Tighter layout for horizontal carousels (home). */
  variant?: "default" | "compact";
}

export default function CourseCard({
  course,
  hideLockOverlay = false,
  variant = "default",
}: CourseCardProps) {
  const compact = variant === "compact";
  const [imageError, setImageError] = useState(false);
  const coverPath = resolveCourseCoverImage(
    course.slug,
    course.sector,
    course.coverImageUrl,
  );

  const canNavigate = !course.isFrozen || hideLockOverlay;
  const interactive = canNavigate && !(course.isFrozen && !hideLockOverlay);
  const { ref, active, pos, onMove, onLeave, canHover } = useCardPointerGlow(interactive);

  const glowStyle = {
    "--card-glow-x": `${pos.x}px`,
    "--card-glow-y": `${pos.y}px`,
  } as CSSProperties;

  return (
    <div className="h-full">
      <Link href={canNavigate ? `/courses/${course.slug}` : "#"} className={cn("block h-full", !canNavigate && "cursor-not-allowed")}>
        <div className="h-full">
          <Card
            ref={ref}
            data-active={active ? "true" : "false"}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={canHover && active ? glowStyle : undefined}
            className={cn(
              "course-card-shell group relative flex h-full max-h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-none transition-[transform,box-shadow,border-color,ring] duration-300 ease-out",
              compact && "rounded-xl",
              (course.isFrozen && !hideLockOverlay)
                ? "cursor-not-allowed border-slate-100 opacity-80 grayscale-[0.5]"
                : cn(
                    "cursor-pointer",
                    canHover ? "hover:border-slate-300/90" : "active:scale-[0.99]",
                  ),
            )}
          >
            {canHover && (
              <>
                <div
                  aria-hidden
                  className={cn(
                    "course-card-glass-wave pointer-events-none absolute inset-0 z-[6] rounded-[inherit] opacity-0 transition-opacity duration-500",
                    active && "opacity-100",
                  )}
                />
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 z-[5] rounded-[inherit] opacity-0 ring-2 ring-inset ring-white/75 transition-opacity duration-300",
                    active && "opacity-100",
                  )}
                />
                <div
                  aria-hidden
                  className="course-card-cursor-blob"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    opacity: active ? 1 : 0,
                    transform: active
                      ? "translate(-50%, -50%) scale(1)"
                      : "translate(-50%, -50%) scale(0.85)",
                  }}
                />
              </>
            )}

            {course.isFrozen && !hideLockOverlay && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 p-6 text-center backdrop-blur-[2px]">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                  <Lock className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Slots Filled</p>
                <p className="mt-1 px-4 text-[10px] font-bold leading-tight text-slate-500">This course is currently frozen. Check back later.</p>
              </div>
            )}

            {course.isFrozen && hideLockOverlay && (
              <div className="absolute left-3 top-3 z-30 flex items-center gap-1.5 rounded-full border border-red-100 bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-sm">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Unavailable</span>
              </div>
            )}

            <div
              className={cn(
                "relative w-full shrink-0 overflow-hidden border-b border-slate-100 bg-slate-50",
                compact ? "aspect-[3/2]" : "aspect-[16/10]",
              )}
            >
              {!imageError ? (
                <OptimizedImage
                  src={coverPath}
                  alt={course.name}
                  className="absolute inset-0 h-full w-full"
                  imgClassName="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                  <BookOpen className="mb-2 h-8 w-8 opacity-50" strokeWidth={1.5} />
                  <span className="text-xs font-medium uppercase tracking-wider">Program Preview</span>
                </div>
              )}

              <div className="absolute left-3 top-3 z-10 flex gap-2">
                <Badge className="border border-slate-200/80 bg-white/90 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur-sm hover:bg-white">
                  {course.sector}
                </Badge>
              </div>
            </div>

            <CardContent
              className={cn(
                "relative z-[7] flex min-h-0 flex-grow flex-col bg-white",
                compact ? "gap-2 p-4" : "gap-3 p-6",
              )}
            >
              <NcLevelBadge level={course.ncLevel} />
              <h3
                className={cn(
                  "font-semibold text-slate-900 line-clamp-2 [overflow-wrap:anywhere] transition-colors duration-300 group-hover:text-slate-950",
                  compact ? "text-[0.9375rem] leading-snug" : "text-lg leading-snug",
                )}
              >
                {course.name}
              </h3>
              {course.shortDescription ? (
                <p
                  className={cn(
                    "text-muted-foreground line-clamp-2 leading-relaxed",
                    compact ? "text-xs" : "text-sm line-clamp-3",
                  )}
                  title={course.shortDescription}
                >
                  {course.shortDescription}
                </p>
              ) : (
                <p className="text-xs italic text-slate-400">Program details coming soon.</p>
              )}
            </CardContent>

            <CardFooter
              className={cn(
                "relative z-[7] mt-auto flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 bg-white",
                compact ? "min-h-[2.75rem] px-4 py-3" : "min-h-[3.25rem] gap-3 px-6 py-4",
              )}
            >
              <div className="flex min-h-[2rem] flex-1 items-center justify-center">
                {course.twspScholarship === "true" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                    Free Scholarship
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400">Self-funded</span>
                )}
              </div>
              {!course.isFrozen && (
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 font-semibold text-slate-900 transition-all duration-300 group-hover:gap-1.5 group-hover:text-blue-600",
                    compact ? "text-xs" : "text-sm",
                  )}
                >
                  {compact ? "Details" : "View Details"}{" "}
                  <ArrowRight className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
                </span>
              )}
              {course.isFrozen && (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Waitlisted <Lock className="h-3 w-3" />
                </span>
              )}
            </CardFooter>
          </Card>
        </div>
      </Link>
    </div>
  );
}

import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { withBase } from "@/lib/with-base";
import { resolveCourseCoverImage } from "@/lib/course-images";
import { BookOpen, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
}

export default function CourseCard({ course, hideLockOverlay = false }: CourseCardProps) {
  const [imageError, setImageError] = useState(false);
  const coverSrc = withBase(
    resolveCourseCoverImage(course.slug, course.sector, course.coverImageUrl),
  );

  const canNavigate = !course.isFrozen || hideLockOverlay;

  return (
    <div className="h-full">
      <Link href={canNavigate ? `/courses/${course.slug}` : "#"} className={cn("block h-full", !canNavigate && "cursor-not-allowed")}>
        <div className="h-full">
          <Card className={cn(
            "group overflow-hidden bg-white border border-slate-200 transition-all h-full flex flex-col rounded-xl relative",
            (course.isFrozen && !hideLockOverlay)
              ? "opacity-80 grayscale-[0.5] border-slate-100 shadow-none" 
              : "hover:border-slate-400 shadow-sm hover:shadow-md cursor-pointer"
          )}>
            
            {/* Frozen Overlay */}
            {course.isFrozen && !hideLockOverlay && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Slots Filled</p>
                <p className="text-slate-500 text-[10px] font-bold mt-1 px-4 leading-tight">This course is currently frozen. Check back later.</p>
              </div>
            )}

            {/* Minimalist Unavailable Indicator (for public view) */}
            {course.isFrozen && hideLockOverlay && (
              <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-red-100 rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Unavailable</span>
              </div>
            )}
            
            <div className="relative w-full aspect-[16/10] bg-slate-100 flex items-center justify-center border-b border-slate-200 overflow-hidden shrink-0">
              {!imageError ? (
                <img
                  src={coverSrc}
                  alt={course.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-slate-400">
                  <BookOpen className="h-8 w-8 mb-2 opacity-50" strokeWidth={1.5} />
                  <span className="text-xs font-medium uppercase tracking-wider">Program Preview</span>
                </div>
              )}
              
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className="bg-white text-slate-800 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider border border-slate-200 shadow-sm">
                  {course.sector}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6 flex-grow flex flex-col">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                {course.ncLevel}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                {course.name}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed min-h-[4.5rem]">
                {course.shortDescription}
              </p>
            </CardContent>

            <CardFooter className="px-6 py-5 border-t border-slate-100 mt-auto flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500">
                {course.twspScholarship === "true" && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-700">TWSP Approved</span>
                  </>
                )}
              </div>
              {!course.isFrozen && (
                <span className="text-sm font-semibold text-slate-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details <ArrowRight className="w-4 h-4" />
                </span>
              )}
              {course.isFrozen && (
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  Waitlisted <Lock className="w-3 h-3" />
                </span>
              )}
            </CardFooter>
          </Card>
        </div>
      </Link>
    </div>
  );
}


import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { withBase } from "@/lib/with-base";
import { BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface Course {
  slug: string;
  name: string;
  sector: string;
  ncLevel: string;
  shortDescription?: string;
  coverImageUrl?: string;
  twspScholarship?: string;
}

interface CourseCardProps {
  course: Course;
  rankingPoints?: number;
}

export default function CourseCard({ course }: CourseCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="h-full">
      <Link href={`/courses/${course.slug}`} className="block h-full">
        <div className="cursor-pointer h-full">
          <Card className="group overflow-hidden bg-white border border-slate-200 hover:border-slate-400 shadow-sm hover:shadow-md transition-all h-full flex flex-col rounded-xl">
            
            <div className="relative w-full aspect-[16/10] bg-slate-100 flex items-center justify-center border-b border-slate-200 overflow-hidden shrink-0">
              {course.coverImageUrl && !imageError ? (
                <img
                  src={withBase(course.coverImageUrl)}
                  alt={course.name}
                  className="h-full w-full object-cover"
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
                NC Level {course.ncLevel}
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
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                View Details <ArrowRight className="w-4 h-4" />
              </span>
            </CardFooter>
          </Card>
        </div>
      </Link>
    </div>
  );
}


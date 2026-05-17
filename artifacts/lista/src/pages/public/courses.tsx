import { useState, useMemo } from "react";
import { Search, Loader2, CheckCircle, ArrowRight, Award, Users, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import PrimaryButton from "@/components/primary-button";
import { useCourses } from "@/hooks/use-lista-data";
import type { Course } from "@/lib/institutional-data";
import {
  getCourseListingPricing,
  mapCourseToHeroItem,
  type HeroCourseItem,
} from "@/lib/public-data-utils";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { withBase } from "@/lib/with-base";
import { resolveCourseCoverImage } from "@/lib/course-images";

type ListingCourse = HeroCourseItem & { source: Course };

function CourseListing({ course }: { course: ListingCourse }) {
  const pricing = getCourseListingPricing(course.source);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const coverSrc = withBase(
    resolveCourseCoverImage(course.slug, course.sector, course.coverImageUrl),
  );

  return (
    <Link href={`/courses/${course.slug}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className={cn(
          "group relative bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 h-full cursor-pointer hover:border-slate-300 hover:shadow-md",
        )}
      >
        {course.isFrozen && (
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-red-100 rounded-full shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
              Currently Unavailable
            </span>
          </div>
        )}

        <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
          {!imgError ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <img
                src={coverSrc}
                alt={course.name}
                loading="lazy"
                decoding="async"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
                  imgLoaded ? "opacity-100" : "opacity-0",
                )}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <Award className="w-10 h-10 text-slate-300" strokeWidth={1} />
            </div>
          )}

          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
            {pricing.bestseller && (
              <span className="px-2 py-0.5 bg-primary-indigo text-white text-[10px] font-bold uppercase tracking-wider rounded">
                Featured
              </span>
            )}
            {pricing.isScholarship && (
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                TWSP
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1.5">
            Course · NC {course.ncLevel}
          </p>
          <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-3 group-hover:text-primary-indigo transition-colors">
            {course.name}
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {pricing.isScholarship ? (
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                Free Scholarship
              </span>
            ) : pricing.price ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900">₱{pricing.price.toLocaleString()}</span>
                {pricing.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ₱{pricing.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-slate-400 font-medium">Inquire for pricing</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: liveCourses = [], isLoading } = useCourses();

  const coursesData = useMemo((): ListingCourse[] => {
    return liveCourses.map((c) => ({
      ...mapCourseToHeroItem(c),
      source: c,
    }));
  }, [liveCourses]);

  const categories = useMemo(() => {
    const cats = new Set(coursesData.map((c) => c.sector));
    return ["All", ...Array.from(cats)];
  }, [coursesData]);

  const filteredCourses = useMemo(() => {
    return coursesData.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || course.sector === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [coursesData, searchQuery, selectedCategory]);

  const groupedCourses = useMemo(() => {
    if (selectedCategory !== "All" || searchQuery) return null;
    const groups: Record<string, ListingCourse[]> = {};
    for (const c of coursesData) {
      if (!groups[c.sector]) groups[c.sector] = [];
      groups[c.sector].push(c);
    }
    return groups;
  }, [coursesData, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary-indigo animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-[calc(100vh-80px)]">
      <section className="border-b border-slate-100 pt-14 pb-10">
        <div className="container mx-auto px-6 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Programs</h1>
          <p className="text-slate-500 text-base max-w-xl mb-8">
            TESDA-accredited technical-vocational courses. On-site, hands-on, TWSP scholarship-eligible.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search programs..."
                className="pl-9 h-10 text-sm border-slate-200 bg-slate-50 focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative flex-1 min-w-0">
              <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-12">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "whitespace-nowrap px-4 py-2 rounded text-sm font-semibold transition-all shrink-0 border",
                      selectedCategory === cat
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-400",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-1 w-16 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none flex items-center justify-end pr-1">
                <div className="flex items-center gap-1.5 opacity-60 bg-white/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-slate-100 shadow-sm animate-pulse">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-emerald-50 border-b border-emerald-100">
        <div className="container mx-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 text-sm">TWSP Scholarship Available</p>
              <p className="text-emerald-700 text-xs">
                Programs marked TWSP are covered by TESDA&apos;s Training for Work Scholarship Program when slots are
                open.
              </p>
            </div>
          </div>
          <Link href="/scholarships">
            <span className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 whitespace-nowrap">
              Learn more <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>

      <section className="py-12">
        <div className="container mx-auto px-6 md:px-8">
          {groupedCourses && !searchQuery ? (
            <div className="space-y-14">
              {Object.entries(groupedCourses).map(([sector, sectorCourses]) => (
                <div key={sector}>
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{sector} Programs</h2>
                      <p className="text-sm text-slate-400 mt-0.5">On-Site Training · TESDA Accredited</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <Users className="w-4 h-4" />
                      <span>
                        {sectorCourses.length} program{sectorCourses.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <AnimatePresence>
                    <motion.div
                      layout
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                    >
                      {sectorCourses.map((course, i) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <CourseListing course={course} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <AnimatePresence>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredCourses.map((course, i) => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <CourseListing course={course} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-20 border border-slate-200 rounded-xl">
              <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 mb-1">No programs found</h3>
              <p className="text-slate-400 text-sm mb-5">Try a different keyword or category.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="text-primary-indigo font-semibold text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-14">
        <div className="container mx-auto px-6 md:px-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Not sure which program is right for you?</h2>
            <p className="text-slate-500 text-sm">
              Our staff can guide you to the best course based on your goals and eligibility.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/assessment">
              <PrimaryButton className="h-10 px-6 bg-slate-900 hover:bg-primary-indigo text-white text-sm font-semibold">
                Take Assessment
              </PrimaryButton>
            </Link>
            <Link href="/trainee/register">
              <PrimaryButton
                variant="ghost"
                className="h-10 px-6 border border-slate-200 text-slate-700 hover:border-slate-400 text-sm font-semibold"
              >
                Enroll Now
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

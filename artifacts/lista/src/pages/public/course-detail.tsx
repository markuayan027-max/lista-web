import { useParams, Link } from "wouter";
import { useCourses, useSchedules } from "@/hooks/use-lista-data";
import { withBase } from "@/lib/with-base";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import AvatarInitials from "@/components/avatar-initials";
import PrimaryButton from "@/components/primary-button";
import { Clock, BarChart, Calendar, ChevronLeft, CheckCircle2, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useCallback } from "react";
import NotFound from "@/pages/not-found";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const { data: courses = [], isLoading } = useCourses();
  const { data: schedules = [] } = useSchedules();
  const course = courses.find((c) => c.slug === slug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading course…
      </div>
    );
  }

  if (!course) {
    return <NotFound />;
  }

  const courseSchedules = schedules.filter((s) => s.courseSlug === course.slug);

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      {/* Breadcrumb & Hero */}
      <div className="bg-white border-b border-card-border pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="py-6">
             <Link href="/courses" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to courses
             </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{course.category}</Badge>
                {course.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="bg-white">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                {course.title} {course.ncLevel}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                {course.shortDescription}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm font-medium">
                 <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>{course.durationHours} Nominal Hours</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>{courseSchedules.length} upcoming sessions</span>
                 </div>
              </div>
            </div>
            <div className="flex-1 lg:max-w-md w-full">
              <CourseImageSlider
                images={
                  (course.galleryImages ?? []).filter(Boolean).length > 0
                    ? (course.galleryImages ?? []).filter(Boolean)
                    : ["/logo.png"]
                }
                title={course.title}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Column: Content */}
          <div className="flex-1 space-y-16">
            <section className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">About this course</h2>
              <div className="prose prose-slate max-w-none text-lg text-muted-foreground leading-relaxed">
                <p>{course.longDescription}</p>
                <p>Designed for individuals looking to gain practical, job-ready skills. This course combines theoretical knowledge with hands-on projects, ensuring you can apply what you learn immediately.</p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(course.shortDescription || course.longDescription || "").split(/[,.]/).filter(i => i.trim().length > 5).slice(0, 6).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                       <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                       <span className="font-medium text-foreground">{item.trim()}</span>
                    </div>
                 ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Course Outline</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    Core Competencies
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-2 pb-4">
                    <ul className="list-disc pl-5 space-y-2">
                      {(() => {
                        const explicit = (course as { coreCompetencies?: string[] }).coreCompetencies;
                        const fallback = (course.shortDescription || course.longDescription || "")
                          .split(/[,.]/)
                          .map((s) => s.trim())
                          .filter((s) => s.length > 8)
                          .slice(0, 8);
                        const items = explicit?.length ? explicit : fallback;
                        return items.map((comp, i) => <li key={i}>{comp}</li>);
                      })()}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    Basic & Common Competencies
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-2 pb-4">
                    Includes workplace communication, safety procedures, and professional ethics.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Upcoming Sessions</h2>
              <div className="space-y-4">
                 {courseSchedules.length > 0 ? (
                    courseSchedules.map((schedule) => (
                       <div key={schedule.id} className="bg-white p-6 rounded-2xl border border-card-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                             <p className="font-bold text-lg mb-1">{new Date(schedule.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                             <p className="text-muted-foreground text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {schedule.startTime} - {schedule.endTime} • {schedule.room}
                             </p>
                          </div>
                          {/* 2026-05-13: single application entrypoint */}
                          <Link href={`/trainee/register?course=${course.slug}`}>
                             <Button variant="outline" className="w-full md:w-auto font-semibold">
                                Select Date
                             </Button>
                          </Link>
                       </div>
                    ))
                 ) : (
                    <div className="bg-white p-8 rounded-2xl border border-card-border text-center text-muted-foreground">
                       No upcoming sessions scheduled at the moment.
                    </div>
                 )}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Panel */}
          <div className="w-full lg:w-96 lg:sticky lg:top-24 space-y-6">
            <Card className="border-card-border shadow-md rounded-3xl overflow-hidden">
              <div className="bg-slate-50 p-8 border-b border-card-border text-center">
                 <div className="text-3xl font-black text-primary mb-2">Inquire for Details</div>
                 <p className="text-muted-foreground font-medium">TESDA Accredited</p>
              </div>
              <CardContent className="p-8 space-y-6">
                <Link href={`/trainee/register?course=${course.slug}`}>
                  <PrimaryButton size="lg" className="w-full h-14 text-lg group">
                    Enroll now
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </PrimaryButton>
                </Link>
                
                <div className="space-y-4 pt-4 border-t border-card-border">
                  <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Course Features</h4>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-bold">{course.durationHours} Hours</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Skill level</span>
                    <span className="font-bold">{course.ncLevel || course.level}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Certificate</span>
                    <span className="font-bold">Included</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-card-border rounded-3xl overflow-hidden">
               <CardContent className="p-6">
                  <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Provided By</h4>
                  <div className="flex items-center gap-4">
                     <AvatarInitials name="LISTA" size="lg" className="shrink-0" />
                     <div>
                        <p className="font-bold text-lg leading-tight">Lorenz International</p>
                        <p className="text-sm text-muted-foreground">Skills Training Academy</p>
                     </div>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
function CourseImageSlider({ images, title }: { images: string[], title: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="relative group">
      <div className="aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl relative bg-slate-200" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((src, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 h-full relative">
              <img 
                src={withBase(src)} 
                alt={`${title} - image ${index + 1}`}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-black/5" />
            </div>
          ))}
        </div>
      </div>
      
      {images.length > 1 && (
        <>
          <button 
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === selectedIndex ? "bg-white w-6" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

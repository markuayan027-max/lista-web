import { useParams, Link } from "wouter";
import { courses, schedules } from "@/lib/mock-data";
import { withBase } from "@/lib/with-base";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import AvatarInitials from "@/components/avatar-initials";
import PrimaryButton from "@/components/primary-button";
import { Clock, BarChart, Calendar, ChevronLeft, CheckCircle2, ArrowRight } from "lucide-react";
import NotFound from "@/pages/not-found";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const course = courses.find((c) => c.slug === slug);

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
                {course.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                {course.shortDescription}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm font-medium">
                 <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>{course.durationWeeks} weeks</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-muted-foreground" />
                    <span>{course.level} Level</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>{courseSchedules.length} upcoming sessions</span>
                 </div>
              </div>
            </div>
            <div className="flex-1 lg:max-w-md w-full">
              <div className="aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-xl relative group">
                <img 
                  src={withBase(course.coverImageUrl)} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
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
                 {course.syllabus.flatMap(s => s.items).slice(0, 6).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                       <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                       <span className="font-medium text-foreground">{item}</span>
                    </div>
                 ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Syllabus</h2>
              <Accordion type="multiple" className="w-full bg-white rounded-2xl border border-card-border overflow-hidden">
                {course.syllabus.map((module, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-card-border px-6">
                    <AccordionTrigger className="text-lg font-bold hover:no-underline py-6">
                      <span className="flex items-center gap-4">
                         <span className="text-muted-foreground text-sm font-normal">Week {idx + 1}</span>
                         {module.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 text-muted-foreground space-y-2">
                       <ul className="list-disc list-inside pl-4 space-y-2">
                          {module.items.map((item, i) => (
                             <li key={i}>{item}</li>
                          ))}
                       </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
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
                          <Link href={`/enroll?course=${course.slug}`}>
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
                 <div className="text-5xl font-black text-primary mb-2">${course.priceUSD}</div>
                 <p className="text-muted-foreground font-medium">Full course tuition</p>
              </div>
              <CardContent className="p-8 space-y-6">
                <Link href={`/enroll?course=${course.slug}`}>
                  <PrimaryButton size="lg" className="w-full h-14 text-lg group">
                    Enroll now
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </PrimaryButton>
                </Link>
                
                <div className="space-y-4 pt-4 border-t border-card-border">
                  <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Course Features</h4>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-bold">{course.durationWeeks} weeks</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Skill level</span>
                    <span className="font-bold">{course.level}</span>
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
                  <h4 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Your Instructor</h4>
                  <div className="flex items-center gap-4">
                     <AvatarInitials name={course.instructor.name} size="lg" className="shrink-0" />
                     <div>
                        <p className="font-bold text-lg leading-tight">{course.instructor.name}</p>
                        <p className="text-sm text-muted-foreground">{course.instructor.title}</p>
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

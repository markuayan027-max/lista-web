import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, GraduationCap, Building, Award, Target } from "lucide-react";
import PrimaryButton from "@/components/primary-button";
import CourseCard from "@/components/course-card";
import { courses, testimonials } from "@/lib/mock-data";
import { withBase } from "@/lib/with-base";

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  const featuredCourses = courses.slice(0, 4);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              className="flex-1 space-y-8 text-center lg:text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
                <Award className="h-4 w-4" />
                <span>Excellence in Vocational Training</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Master the skills that <span className="text-primary">power the future.</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Join thousands of graduates who have transformed their careers with LISTA's industry-aligned programs in technology, healthcare, and business.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/enroll">
                  <PrimaryButton size="lg" className="w-full sm:w-auto text-lg h-14 px-8 group">
                    Enroll now
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </PrimaryButton>
                </Link>
                <Link href="/courses">
                  <PrimaryButton variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 border-card-border bg-white text-foreground hover:bg-slate-50">
                    Browse courses
                  </PrimaryButton>
                </Link>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-8 pt-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span>Industry Expert Instructors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span>Flexible Schedules</span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="flex-1 w-full max-w-lg lg:max-w-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={withBase('/hero.png')} 
                  alt="Students collaborating" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-card-border bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8">
            Trusted by industry leaders and accredited by
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-bold text-xl"><Building className="h-6 w-6"/> TechGlobal</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Target className="h-6 w-6"/> HealthCare Plus</div>
            <div className="flex items-center gap-2 font-bold text-xl"><GraduationCap className="h-6 w-6"/> Global Skills Alliance</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Award className="h-6 w-6"/> NVTC</div>
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Featured Programs</h2>
              <p className="text-lg text-muted-foreground">
                Our most popular courses, designed and taught by industry professionals to get you job-ready in months, not years.
              </p>
            </div>
            <Link href="/courses">
              <PrimaryButton variant="ghost" className="font-semibold text-primary hover:text-primary/80 hover:bg-transparent">
                View all programs <ArrowRight className="ml-2 h-4 w-4" />
              </PrimaryButton>
            </Link>
          </div>
          
          <motion.div 
            variants={containerVars}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredCourses.map(course => (
              <motion.div key={course.id} variants={itemVars}>
                <CourseCard course={course} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Assessment CTA */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-primary rounded-3xl p-10 md:p-16 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-10">
              <Target className="w-96 h-96" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Not sure where to start?</h2>
              <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
                Take our 5-minute skills assessment. We'll analyze your interests, background, and goals to recommend the perfect learning path for your future.
              </p>
              <Link href="/assessment">
                <PrimaryButton size="lg" className="bg-white text-primary hover:bg-slate-50 h-14 px-8 text-lg font-bold">
                  Take the assessment
                </PrimaryButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scholarship Banner */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 bg-white rounded-3xl border border-card-border overflow-hidden shadow-sm">
            <div className="flex-1 p-10 md:p-16 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                <Award className="h-4 w-4" />
                <span>Financial Aid Available</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">We believe education should be accessible to everyone.</h2>
              <p className="text-lg text-muted-foreground">
                LISTA offers a variety of merit and need-based scholarships. Last year, we awarded over $500,000 to help students achieve their dreams.
              </p>
              <Link href="/scholarships">
                <PrimaryButton variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  Explore scholarships
                </PrimaryButton>
              </Link>
            </div>
            <div className="flex-1 bg-muted min-h-[300px] lg:min-h-full w-full relative">
              {/* Abstract decorative graphic for scholarship */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90 mix-blend-multiply" />
              <div className="absolute inset-0 flex items-center justify-center p-12">
                 <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="aspect-square bg-white/20 rounded-2xl backdrop-blur-md"></div>
                    <div className="aspect-square bg-white/40 rounded-full backdrop-blur-md -translate-y-8"></div>
                    <div className="aspect-square bg-white/30 rounded-full backdrop-blur-md translate-x-8"></div>
                    <div className="aspect-square bg-white/10 rounded-2xl backdrop-blur-md"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Student Success Stories</h2>
            <p className="text-lg text-muted-foreground">
              Hear from our alumni who have gone on to build incredible careers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(t => (
              <div key={t.id} className="bg-slate-50 p-8 rounded-2xl border border-card-border space-y-6">
                <div className="text-primary opacity-50">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-lg font-medium leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-card-border">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to transform your career?</h2>
            <p className="text-xl text-primary-foreground/80">
              Join the next cohort and start your journey today.
            </p>
            <Link href="/enroll">
              <PrimaryButton size="lg" className="bg-white text-primary hover:bg-slate-100 h-14 px-10 text-lg font-bold">
                Enroll now
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

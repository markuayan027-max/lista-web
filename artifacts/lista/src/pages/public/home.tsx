import { useState, useMemo } from "react";
import { Link } from "wouter";
import { getPublicEnrollHref } from "@/lib/enroll-entry";
import { Reveal, RevealStagger, RevealStaggerItem } from "@/components/lista-reveal";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle,
  ClipboardList,
  Compass,
  ExternalLink,
  FileCheck,
  FileImage,
  GraduationCap,
  HeartHandshake,
  Landmark,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import PrimaryButton from "@/components/primary-button";
import CourseCard from "@/components/course-card";
import { useAnnouncements, useCourses, useTestimonials } from "@/hooks/use-lista-data";
import {
  buildPublicNewsFeed,
  mapCourseToHeroItem,
  mapTestimonialsForHome,
} from "@/lib/public-data-utils";
import { withBase } from "@/lib/with-base";
import { cn } from "@/lib/utils";
import {
  CourseCarouselSkeleton,
  COURSE_CAROUSEL_SLIDE_CLASS,
  NewsCardSkeleton,
  TestimonialCardSkeleton,
} from "@/components/skeletons";
import { ContentFadeIn } from "@/components/skeletons/primitives";
import OptimizedImage from "@/components/optimized-image";
import { PARTNER_LOGOS_HOME } from "@/lib/image-assets";
import HeroAcademyVideo from "@/components/hero-academy-video";
import DisplayHeading from "@/components/display-heading";
import SectionEyebrow from "@/components/section-eyebrow";
import ScrollParallax from "@/components/scroll-parallax";

export default function HomePage() {
  const coursesQuery = useCourses();
  const { data: liveCourses = [], isLoading: coursesLoading } = coursesQuery;
  const { data: liveTestimonials = [], isLoading: testimonialsLoading } = useTestimonials();
  const { data: announcements = [], isLoading: announcementsLoading } = useAnnouncements();
  const programCount = liveCourses.length;
  const livePosts = useMemo(() => buildPublicNewsFeed(announcements), [announcements]);
  const [activeBenefit, setActiveBenefit] = useState<null | { title: string; desc: string; details: string; icon: any }>(null);

  const benefits = [
    { 
      title: "For Office Work", 
      desc: "Learn computer tools to get promoted faster at your job.", 
      icon: BriefcaseBusiness,
      details: "Perfect for office staff and managers. Master Excel and professional tools that make your work easier and help you earn more."
    },
    { 
      title: "For Online Work", 
      desc: "Get skills to find high-paying jobs you can do from home.", 
      icon: Users,
      details: "Learn graphic design and digital skills. We help you build a portfolio to attract global clients so you can earn in dollars from home."
    },
    { 
      title: "For Educators", 
      desc: "Get the training points you need for professional growth.", 
      icon: GraduationCap,
      details: "Our certificates are accepted for professional development in both public and private schools. Fulfill your requirements and move up your career ladder easily."
    },
    {
      title: "For Everyone",
      desc: "Grade 6 or High School graduate? We help you get hired.",
      icon: Compass,
      details: "No job yet? No problem. Our training is easy to understand. We focus on real skills that help you get a job in just a few weeks."
    }
  ];



  const displayCourses = useMemo(
    () => liveCourses.map(mapCourseToHeroItem).slice(0, 8),
    [liveCourses],
  );

  const testimonials = useMemo(
    () => mapTestimonialsForHome(liveTestimonials),
    [liveTestimonials],
  );

  return (
    <div className="w-full">

      {/* ── Hero ── */}
      <section className="bg-background border-b border-border overflow-hidden">
        <div className="container mx-auto">

          {/* Top rule + tagline */}
          <div className="pt-6 pb-4">
            <div className="flex items-center justify-end">
              <span className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                <MapPin className="w-3 h-3" /> Philippines
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 py-6 md:py-10 items-center">
            <Reveal from="left" duration={800} className="flex flex-col justify-center public-hero-copy">
              <DisplayHeading as="h1" size="hero" className="mb-6">
                Skills that build
                <br />
                real careers.
              </DisplayHeading>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 w-full max-w-none md:max-w-xl">
                LISTA trains thousands of Filipinos in professional and technical skills — from digital literacy to vocational mastery — certified by TESDA.
              </p>
              <div className="public-hero-actions">
                <Link href={getPublicEnrollHref()}>
                  <PrimaryButton variant="brand" className="h-12 px-8 text-base">
                    Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                  </PrimaryButton>
                </Link>
                <Link href="/courses">
                  <PrimaryButton variant="outline" className="h-12 px-8 text-base">
                    View Programs
                  </PrimaryButton>
                </Link>
              </div>
            </Reveal>

            <Reveal
              from="right"
              delay={200}
              duration={800}
              className="relative w-full md:pl-4 lg:pl-6"
            >
              <div className="relative aspect-[4/3] lg:aspect-[16/10] rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-slate-100">
                <ScrollParallax
                  speed={0.05}
                  className="absolute inset-x-0 top-[-5%] h-[110%] w-full"
                >
                  <OptimizedImage
                    src="/hero.png"
                    alt="LISTA Students and Facilities"
                    priority
                    imgClassName="w-full h-full object-cover"
                    width={1536}
                    height={1024}
                  />
                </ScrollParallax>
                <div className="absolute inset-0 bg-slate-900/5 mix-blend-multiply pointer-events-none" />
                <ScrollParallax
                  speed={0.02}
                  className="absolute top-6 right-6 md:top-8 md:right-8 z-[4]"
                >
                  <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-sm border border-white/60 flex items-center gap-3 transition-transform hover:-translate-y-1">
                    <ShieldCheck className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">TESDA Accredited</p>
                      <p className="text-xs font-bold text-slate-900 leading-none">Recognized Nationwide</p>
                    </div>
                  </div>
                </ScrollParallax>
              </div>
            </Reveal>
          </div>

        </div>
      </section>


      {/* ── Trust / Accreditation Bar ── */}
      <section className="py-16 border-b border-slate-100 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col items-center mb-12">
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="flex gap-1.5 mb-2">
                <div className="w-8 h-1 bg-slate-900 rounded-full" />
                <div className="w-3 h-1 bg-slate-300 rounded-full" />
              </div>
              <span className="text-[0.8125rem] font-semibold text-slate-400 uppercase tracking-[0.14em]">Quality Assurance</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Accredited by National Institutions</h3>
          </div>
          <ul className="mx-auto grid w-full max-w-5xl list-none grid-cols-2 gap-x-8 gap-y-12 p-0 sm:grid-cols-4 sm:gap-x-10 md:gap-x-14">
            {PARTNER_LOGOS_HOME.map(({ src, alt, label, fullLabel, wide }) => (
              <li key={label} className="flex justify-center">
                <figure className="flex w-full max-w-[11.5rem] flex-col items-center">
                  <div
                    className={cn(
                      "mb-5 flex shrink-0 items-center justify-center",
                      wide
                        ? "h-12 w-[9.75rem] sm:h-14 sm:w-[11rem]"
                        : "size-[5.5rem] sm:size-28",
                    )}
                    aria-hidden
                  >
                    <OptimizedImage
                      src={src}
                      alt={alt}
                      width={wide ? 176 : 112}
                      height={wide ? 56 : 112}
                      imgClassName="max-h-full max-w-full object-contain object-center"
                      objectFit="contain"
                    />
                  </div>
                  <figcaption
                    className={cn(
                      "flex w-full flex-col items-center text-center",
                      fullLabel ? "min-h-[4.5rem] gap-1.5" : "min-h-[1.25rem]",
                    )}
                  >
                    <p className="text-sm font-bold leading-tight text-slate-900">{label}</p>
                    {fullLabel ? (
                      <p className="text-[11px] font-medium leading-snug text-pretty text-slate-500 line-clamp-3">
                        {fullLabel}
                      </p>
                    ) : null}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Professional Skills Upgrade (Video + Popups) ── */}
      <section className="py-20 bg-white border-t border-b border-slate-100 overflow-hidden relative section-grid-bg">
        <ScrollParallax
          speed={0.015}
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 z-[1] h-72 w-72 rounded-full bg-slate-200/40 blur-3xl"
        />
        <ScrollParallax
          speed={0.01}
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 z-[1] h-56 w-56 rounded-full bg-slate-300/30 blur-3xl"
        />
        <div className="container mx-auto relative z-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 items-start gap-8 md:gap-12">
            
            {/* Left: Content & Heading */}
            <Reveal inView from="left" delay={200} duration={600} className="md:col-span-5 order-2 md:order-1 pt-4 public-hero-copy text-center md:text-left">
              <div className="space-y-6">
                <SectionEyebrow index="01" className="mx-auto md:mx-0">
                  Real skills
                </SectionEyebrow>
                <DisplayHeading as="h2" size="section">
                  Get Skills for a
                  <br />
                  <span className="text-emphasis">Better Life.</span>
                </DisplayHeading>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto md:mx-0">
                  We help you learn the skills that companies want. Whether you finished Grade 6, High School, or College, we have a program that will help you find a job or get promoted.
                </p>
              </div>
            </Reveal>

            {/* Right: Academy video — autoplay muted; visitor can play/pause and unmute */}
            <Reveal inView from="scale" duration={600} className="md:col-span-7 order-1 md:order-2 flex flex-col items-center w-full">
              <HeroAcademyVideo />
            </Reveal>
        </div>

        {/* Single Line Action Bar: Categories + CTA + Stats (Spans full width below both) */}
        <Reveal
          inView
          delay={400}
          duration={600}
          className="mt-12 w-full flex flex-col md:flex-row md:flex-nowrap items-stretch md:items-center justify-center md:justify-between gap-4 p-3 sm:p-4 bg-slate-50/80 rounded-3xl border border-slate-100 backdrop-blur-sm shadow-xl shadow-slate-200/20"
        >
          {/* 1. Category Quick Links — scroll on narrow screens, hidden scrollbar */}
          <div className="min-w-0 w-full md:flex-1 flex flex-col gap-1">
            <p className="hidden text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:block md:hidden">
              Swipe for categories
            </p>
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1 -mx-1 px-1 snap-x snap-mandatory">
            {benefits.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveBenefit(item)}
                className="flex shrink-0 snap-start items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all whitespace-nowrap group"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-700 text-[10px] sm:text-[11px] uppercase tracking-wider">{item.title.replace('For ', '')}</span>
              </button>
            ))}
            </div>
          </div>

          {/* Vertical Divider (Desktop Only) */}
          <div className="hidden md:block h-10 w-px bg-slate-200 shrink-0" />

          {/* 2. CTA & Stats Group */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-6 py-1 shrink-0 w-full md:w-auto pb-[max(0px,env(safe-area-inset-bottom))]">
            <Link href="/courses" className="w-full sm:w-auto">
              <PrimaryButton variant="brand" size="sm" className="w-full sm:w-auto h-11 px-6 sm:px-8 text-[11px] font-semibold uppercase tracking-widest group whitespace-nowrap rounded-2xl">
                Explore All Programs
                <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </PrimaryButton>
            </Link>
            
            <div className="flex items-center justify-center sm:justify-start gap-4 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm hover:z-10 transition-all">
                    <img
                      src={`https://i.pravatar.cc/100?u=${i}`}
                      className="w-full h-full object-cover"
                      alt="Student"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
              <div className="text-left leading-tight">
                <div className="text-[0.8125rem] font-semibold text-slate-900">
                  {programCount > 0 ? String(programCount) : "—"}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                  {programCount > 0 ? "Programs Available" : "Catalog loading"}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Benefit Details Popup (Modal) */}
          {activeBenefit && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                role="presentation"
                onClick={() => setActiveBenefit(null)}
              />
              <div
                className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                role="dialog"
                aria-modal="true"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                      <activeBenefit.icon className="w-8 h-8" />
                    </div>
                    <button 
                      onClick={() => setActiveBenefit(null)}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">{activeBenefit.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-lg mb-8">
                    {activeBenefit.details}
                  </p>
                  <PrimaryButton
                    variant="default"
                    className="w-full h-12"
                    onClick={() => setActiveBenefit(null)}
                  >
                    Got it, thanks!
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}
      </div>
    </section>



      {/* ── All Programs (Free & Paid) ── */}
      <section className="relative overflow-hidden py-24 bg-slate-50 border-t border-slate-100">
        <ScrollParallax
          speed={0.01}
          aria-hidden
          className="pointer-events-none absolute top-12 left-1/4 z-[1] h-64 w-64 rounded-full bg-slate-200/35 blur-3xl"
        />
        <div className="container relative z-[3] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
              <SectionEyebrow index="02" className="mb-6 mx-auto md:mx-0">
                Curriculum
              </SectionEyebrow>
              <DisplayHeading as="h2" size="section" className="mb-3">
                Our Programs
              </DisplayHeading>
              <p className="text-lg text-muted-foreground">
                Explore our comprehensive range of free (scholarship) and paid programs, designed and taught by industry professionals to get you job-ready fast.
              </p>
            </div>
            <Link href="/courses">
              <PrimaryButton variant="outline" className="font-semibold text-slate-700 border-slate-300 hover:bg-slate-50 shrink-0">
                View all programs <ArrowRight className="ml-2 h-4 w-4" />
              </PrimaryButton>
            </Link>
          </div>

          <div className="relative">
            {/* 2026-05-14: Only show "Swipe to see more" on small screens where cards actually overflow */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-3 md:hidden">
              <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden />
              Swipe for more programs
            </div>
            {coursesLoading ? (
              <CourseCarouselSkeleton count={4} />
            ) : (
              <ContentFadeIn>
                <RevealStagger
                  inView
                  staggerMs={100}
                  className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 sm:gap-5 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 md:overflow-visible md:pb-0 hide-scrollbar -mx-1 px-1"
                >
                  {displayCourses.map((course, i) => (
                    <RevealStaggerItem
                      key={course.id}
                      index={i}
                      className={COURSE_CAROUSEL_SLIDE_CLASS}
                    >
                      <CourseCard course={course} hideLockOverlay variant="compact" />
                    </RevealStaggerItem>
                  ))}
                </RevealStagger>
              </ContentFadeIn>
            )}
          </div>
        </div>
      </section>

      {/* ── Career Pathfinder / Assessment CTA ── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 p-10 md:p-14">
            <ScrollParallax
              speed={0.01}
              aria-hidden
              className="pointer-events-none absolute -top-12 right-8 z-[1] h-40 w-40 rounded-full bg-slate-100 blur-2xl"
            />
            <div className="relative z-[3] max-w-2xl space-y-5 text-center md:text-left mx-auto md:mx-0">
              <SectionEyebrow className="mx-auto md:mx-0">Career pathfinder</SectionEyebrow>
              <DisplayHeading as="h2" size="section">
                Not sure where to start?
              </DisplayHeading>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Take our 5-minute skills assessment. We'll analyze your interests, background,
                and goals to recommend the perfect learning path for your future.
              </p>
              <ul className="flex flex-col sm:flex-row gap-4 text-sm text-slate-600">
                {["Personalized recommendations", "Takes only 5 minutes", "100% free"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-[4] shrink-0">
              <Link href="/assessment">
                <PrimaryButton variant="brand" size="lg" className="h-13 px-8 text-base group">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Take the assessment
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </PrimaryButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Admission & Scholarship ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/3 lg:sticky lg:top-24 text-center lg:text-left">
              <SectionEyebrow index="03" className="mb-8 mx-auto lg:mx-0">
                Process
              </SectionEyebrow>
              <DisplayHeading as="h2" size="section" className="mb-5">
                Your Pathway to Admission.
              </DisplayHeading>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                We provide a structured enrollment process and robust financial support to help
                you focus on what matters most—your education.
              </p>
              <div className="hidden lg:block">
                <Link href="/admissions">
                  <PrimaryButton variant="outline" className="h-12 px-6 border-slate-300 text-slate-700 hover:bg-slate-50 w-full justify-between group">
                    Full Admission Guide
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </PrimaryButton>
                </Link>
              </div>
            </div>

            <div className="lg:w-2/3 flex flex-col gap-6">
              {/* Financial Aid */}
              <div className="bg-white border border-slate-200 rounded-xl p-8 md:p-10">
                <div className="flex items-center gap-3 mb-5">
                  <HeartHandshake className="w-6 h-6 text-slate-700" strokeWidth={1.5} />
                  <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Financial Assistance</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Scholarships & Grants</h3>
                <p className="text-slate-600 mb-7 leading-relaxed max-w-xl">
                  Financial constraints should never hinder your potential. Explore our comprehensive
                  merit and need-based scholarship programs designed to fully support your training.
                </p>
                <div className="flex items-start gap-3 mb-7 p-5 bg-slate-50 border border-border rounded-xl">
                  <Landmark className="w-6 h-6 text-slate-700 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <div className="font-semibold text-slate-800">TESDA scholarship pathways</div>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Programs such as TWSP may cover training costs when slots are available. Eligibility
                      and benefits vary by qualification—contact admissions to confirm current openings.
                    </p>
                  </div>
                </div>
                <Link href="/scholarships">
                  <PrimaryButton className="h-11 px-7 bg-slate-900 hover:bg-slate-800 text-white group/btn">
                    Explore Funding Options
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </PrimaryButton>
                </Link>
              </div>

              {/* Documents */}
              <div className="bg-white border border-slate-200 rounded-xl p-8 md:p-10">
                <div className="flex items-center gap-3 mb-5">
                  <FileCheck className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                  <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Enrollment Checklist</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Required Documents</h3>
                <p className="text-slate-600 mb-7 leading-relaxed max-w-xl">
                  Ensure you have the following essential documents ready before submitting your application.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-7">
                  {[
                    { icon: ShieldCheck, label: "Government-issued ID" },
                    { icon: GraduationCap, label: "High School Diploma" },
                    { icon: Stethoscope, label: "Medical Clearance" },
                    { icon: FileImage, label: "2×2 ID Photographs" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-slate-700 font-medium text-sm">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="lg:hidden">
                  <Link href="/admissions">
                    <PrimaryButton variant="outline" className="h-11 px-6 border-slate-300 text-slate-700 hover:bg-slate-50 w-full justify-between group/btn">
                      View Full Admission Guide
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </PrimaryButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="mb-14 text-center md:text-left">
            <SectionEyebrow className="mb-6 mx-auto md:mx-0">Social proof</SectionEyebrow>
            <DisplayHeading as="h2" size="section" className="mb-3">
              Real Skills. Real Success.
            </DisplayHeading>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
              Discover how our graduates transformed their passion into professional excellence
              through our accredited training programs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {testimonialsLoading && testimonials.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TestimonialCardSkeleton key={`testimonial-skel-${i}`} />
                ))
              : null}
            {testimonials.map((testimonial, i) => (
              <Reveal
                key={testimonial.id}
                inView
                delay={i * 100}
                duration={400}
                className="bg-muted/40 p-6 md:p-8 rounded-xl border border-border flex flex-col min-h-[220px] hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="text-3xl font-serif text-slate-300 leading-none mb-3 select-none" aria-hidden>
                  "
                </div>
                <p className="text-slate-700 leading-relaxed flex-1 text-sm md:text-[15px] line-clamp-4">
                  {testimonial.quote}
                </p>
                <div className="mt-7 pt-6 border-t border-slate-200 flex items-center gap-4">
                  <OptimizedImage
                    src={testimonial.imageUrl}
                    alt={testimonial.name}
                    imgClassName="w-11 h-11 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">{testimonial.name}</p>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest News ── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
              <SectionEyebrow className="mb-6 mx-auto md:mx-0">Insight</SectionEyebrow>
              <DisplayHeading as="h2" size="section" className="mb-3">
                Latest Updates
              </DisplayHeading>
              <p className="text-lg text-muted-foreground">
                Stay informed with the latest news, announcements, and success stories from our academy.
              </p>
            </div>
            <Link href="/about">
              <PrimaryButton variant="ghost" className="font-semibold text-brand hover:bg-muted shrink-0">
                Read all stories <ArrowRight className="ml-2 h-4 w-4" />
              </PrimaryButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {announcementsLoading && livePosts.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <NewsCardSkeleton key={`news-skel-${i}`} />
                ))
              : null}
            {livePosts.slice(0, 6).map((post, i) => (
              <Reveal
                key={post.id}
                inView
                delay={i * 80}
                className="group flex flex-col h-full min-h-[320px] bg-card rounded-xl border border-border overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[3/2] shrink-0 overflow-hidden bg-slate-100">
                  <OptimizedImage
                    src={post.imageUrl}
                    alt={post.title}
                    imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 md:p-5 min-h-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="section-eyebrow text-[10px] px-2 py-0.5">
                      {post.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold mb-2 leading-snug group-hover:text-foreground transition-colors text-foreground line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                        {post.author.substring(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{post.author}</span>
                    </div>
                    {post.sourceUrl ? (
                      <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="text-brand font-semibold text-sm inline-flex items-center gap-1 hover:underline">
                        Read more <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link href={`/news/${post.id}`} className="text-brand font-semibold text-sm hover:underline">
                        Read more
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden py-24 bg-brand text-brand-foreground text-center">
        <ScrollParallax
          speed={0.01}
          aria-hidden
          className="pointer-events-none absolute top-1/4 -left-20 z-[1] h-80 w-80 rounded-full bg-white/10 blur-3xl"
        />
        <ScrollParallax
          speed={0.015}
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 z-[1] h-96 w-96 rounded-full bg-white/5 blur-3xl"
        />
        <div className="container relative z-[3] mx-auto">
          <Reveal inView duration={500} className="relative z-[3] mx-auto max-w-3xl space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-bold uppercase tracking-widest border border-white/20">
              <GraduationCap className="h-3.5 w-3.5" />
              Applications Now Open
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to transform your career?</h2>
            <p className="text-xl text-white/80">
              Join the next cohort and start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href={getPublicEnrollHref()}>
                <PrimaryButton size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-13 px-10 text-base font-semibold shadow-lg border-none group">
                  Sign in to enroll
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </PrimaryButton>
              </Link>
              <Link href="/courses">
                <PrimaryButton size="lg" variant="outline" className="h-13 px-10 text-base font-semibold border-white/40 text-white hover:bg-white/10">
                  Browse programs
                </PrimaryButton>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}


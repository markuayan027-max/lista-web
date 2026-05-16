import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle, GraduationCap, Award,
  ExternalLink, FileCheck, Landmark, HeartHandshake,
  FileImage, ShieldCheck, Stethoscope, Compass,
  Users, BookOpen, TrendingUp, ClipboardList,
  UserCheck, Library, BriefcaseBusiness, Trophy,
  Star, MapPin, Phone, Info, X
} from "lucide-react";
import PrimaryButton from "@/components/primary-button";
import CourseCard from "@/components/course-card";
import { useGetCourses, useGetTestimonials } from "@workspace/api-client-react";
import { courses as mockCourses, testimonials as mockTestimonials, posts as mockPosts, schoolInfo, scholarshipSlots } from "@/lib/institutional-data";
import { withBase } from "@/lib/with-base";
const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stats = [
  { value: "1,200+", label: "Graduates", icon: UserCheck },
  { value: "40+", label: "Programs", icon: Library },
  { value: "95%", label: "Employment Rate", icon: BriefcaseBusiness },
  { value: "15+", label: "Years of Excellence", icon: Trophy },
];

export default function HomePage() {
  const { data: apiCourses } = useGetCourses();
  const { data: apiTestimonials } = useGetTestimonials();
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



  const displayCourses = useMemo(() => {
    type HeroCourse = {
      id: string;
      slug: string;
      name: string;
      sector: string;
      ncLevel: string;
      description: string;
      shortDescription: string;
      coverImageUrl?: string;
      twspScholarship?: string;
      isFrozen?: boolean;
    };

    // Use all mock courses, but overlay API data if available
    let courses: HeroCourse[] = mockCourses.map((c) => {
      const apiOverride = (apiCourses && Array.isArray(apiCourses)) 
        ? (apiCourses as any[]).find((ac: any) => ac.slug === c.slug || ac.id === c.id) 
        : null;
        
      const slotInfo = scholarshipSlots.find(s => s.courseSlug === c.slug);
      
      if (apiOverride) {
        return {
          id: apiOverride.id || c.id,
          slug: apiOverride.slug || c.slug,
          name: apiOverride.name || c.title,
          sector: apiOverride.sector || c.category,
          ncLevel: apiOverride.ncLevel || c.ncLevel,
          description: apiOverride.description || c.longDescription,
          shortDescription: apiOverride.shortDescription || c.shortDescription,
          coverImageUrl: apiOverride.coverImageUrl || c.galleryImages?.[0],
          twspScholarship: apiOverride.twspScholarship ?? (c.twsp ? "true" : "false"),
          isFrozen: slotInfo ? slotInfo.available <= 0 : true,
        };
      }

      return {
        id: c.id,
        slug: c.slug,
        name: c.title,
        sector: c.category,
        ncLevel: c.ncLevel,
        description: c.longDescription,
        shortDescription: c.shortDescription,
        coverImageUrl: c.galleryImages?.[0],
        twspScholarship: c.twsp ? "true" : "false",
        isFrozen: slotInfo ? slotInfo.available <= 0 : true,
      };
    });

    const paidCourse = {
      id: "paid-bcl",
      slug: "basic-computer-literacy",
      name: "Basic Computer Literacy (BCL)",
      sector: "ICT Sector",
      ncLevel: "Paid Course",
      description: "Master essential computer skills for modern teaching and administrative work. Perfect for fulfilling professional development requirements. Estimated Fee: ₱2,500.",
      shortDescription: "Master essential computer skills for modern teaching and administrative work. Estimated Fee: ₱2,500.",
      coverImageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800",
      twspScholarship: "false",
    };

    // Merge paid course at the front, then all others; cap at 8 for homepage
    return [paidCourse, ...courses].slice(0, 8);
  }, [apiCourses]);

  const testimonials = useMemo(() => {
    if (apiTestimonials && Array.isArray(apiTestimonials) && apiTestimonials.length > 0) {
      return apiTestimonials.slice(0, 3).map((t) => ({
        id: t.id,
        quote: t.quote,
        attribution: t.attribution,
        name: t.attribution,
        role: "LISTA Graduate",
        imageUrl: "/hero.png",
      }));
    }
    const diversifiedTestimonials = [
      {
        id: "m-freelancer-1",
        quote: "As a freelancer, staying competitive is everything. LISTA's Visual Graphic Design program gave me the technical edge I needed. My portfolio now stands out to international clients, and the TESDA certification adds a level of trust that really closes deals.",
        attribution: "Maria Clara Santos",
        name: "Maria Clara Santos",
        role: "FREELANCE GRAPHIC DESIGNER",
        imageUrl: "/hero.png"
      },
      {
        id: "m-corporate-1",
        quote: "The administrative workflows I learned at LISTA have completely changed how I manage my team's operations. Our office efficiency has increased by 40%. The programs are practical, direct, and incredibly relevant to today's environment.",
        attribution: "James Lim",
        name: "James Lim",
        role: "OPERATIONS MANAGER",
        imageUrl: "/hero.png"
      },
      {
        id: "m-deped-1",
        quote: "I just want to express my gratitude. The training I received here has been incredibly valuable for my career progression. I can say that this training center is 💯% legit. Tested and proven based on my experience.",
        attribution: "Rosechelle Sumayang",
        name: "Rosechelle Sumayang",
        role: "LICENSED PROFESSIONAL TEACHER",
        imageUrl: "/hero.png"
      }
    ];
    return diversifiedTestimonials;
  }, [apiTestimonials]);

  return (
    <div className="w-full">

      {/* ── Hero ── */}
      <section className="bg-white border-b border-slate-100 overflow-hidden">
        <div className="container mx-auto px-6 md:px-8">

          {/* Top rule + tagline */}
          <div className="pt-6 pb-4">
            <div className="flex items-center justify-end">
              <span className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                <MapPin className="w-3 h-3" /> Philippines
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 py-6 md:py-10 items-center">
            <motion.div
              className="flex flex-col justify-center"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-[-0.03em] text-slate-900 leading-[1.08] mb-6">
                Skills that build<br />
                <span className="text-blue-700">real careers.</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                LISTA trains thousands of Filipinos in professional and technical skills — from digital literacy to vocational mastery — certified by TESDA.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 2026-05-13: single application entrypoint */}
                <Link href="/trainee/register">
                  <PrimaryButton className="h-12 px-8 bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold transition-colors shadow-lg shadow-blue-700/20">
                    Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                  </PrimaryButton>
                </Link>
                <Link href="/courses">
                  <PrimaryButton variant="ghost" className="h-12 px-8 border border-slate-300 text-slate-700 hover:bg-slate-50 text-base font-semibold transition-colors">
                    View Programs
                  </PrimaryButton>
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="relative w-full max-w-lg mx-auto lg:max-w-none lg:pl-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative aspect-[4/3] lg:aspect-[16/10] rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
                <img 
                  src="/hero.png"
                  alt="LISTA Students and Facilities" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
                
                {/* Floating Badge */}
                <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-sm border border-white/60 flex items-center gap-3 transition-transform hover:-translate-y-1">
                   <ShieldCheck className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">TESDA Accredited</p>
                      <p className="text-xs font-bold text-slate-900 leading-none">Recognized Nationwide</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>


      {/* ── Trust / Accreditation Bar ── */}
      <section className="py-16 border-b border-slate-100 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center mb-12">
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="flex gap-1.5 mb-2">
                <div className="w-8 h-1 bg-blue-600 rounded-full" />
                <div className="w-3 h-1 bg-blue-200 rounded-full" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Quality Assurance</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Accredited by National Institutions</h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
            {[
              { src: '/TESDA_Logo_official-removebg-preview.png', alt: 'TESDA Logo', label: 'TESDA' },
              { src: '/DepEd logo.png', alt: 'DepEd Logo', label: 'DEPED' },
              { src: '/ATI (Agricultural Training Institute) LOGO.png', alt: 'ATI Logo', label: 'ATI' },
              { src: '/NVTC (National Vocational Training Council) is INTERNATIONAL LOGO.webp.png', alt: 'NVTC Logo', label: 'NVTC' },
            ].map(({ src, alt, label }) => (
              <div key={label} className="flex flex-col items-center gap-3 group">
                <div className="h-16 md:h-20 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-110">
                  <img src={withBase(src)} alt={alt} className="max-h-full w-auto object-contain" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Professional Skills Upgrade (Video + Popups) ── */}
      <section className="py-20 bg-white border-t border-b border-slate-100 overflow-hidden relative">
        <div className="container mx-auto px-6 md:px-10 relative z-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-start gap-8 lg:gap-12">
            
            {/* Left: Content & Heading */}
            <motion.div 
              className="lg:col-span-5 order-2 lg:order-1 pt-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                  Real Skills
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                  Get Skills for a <br />
                  <span className="text-blue-700">Better Life.</span>
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                  We help you learn the skills that companies want. Whether you finished Grade 6, High School, or College, we have a program that will help you find a job or get promoted.
                </p>
              </div>
            </motion.div>

            {/* Right: Video Promotion */}
            <motion.div 
              className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Video Card */}
              <div className="w-full relative aspect-video rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-slate-900 group">
                <video 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                  poster="/hero.png"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="https://assets.mixkit.co/videos/preview/mixkit-working-on-a-laptop-in-a-cafe-4530-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="w-20 h-20 bg-blue-600/90 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1.5" />
                   </div>
                </div>

                <div className="absolute bottom-6 left-8 right-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                    <p className="text-white font-bold text-sm tracking-widest uppercase">Live Training Preview</p>
                  </div>
                </div>
              </div>
          </motion.div>
        </div>

        {/* Single Line Action Bar: Categories + CTA + Stats (Spans full width below both) */}
        <motion.div 
          className="mt-12 w-full flex flex-wrap xl:flex-nowrap items-center justify-center xl:justify-between gap-4 p-2.5 bg-slate-50/80 rounded-3xl border border-slate-100 backdrop-blur-sm shadow-xl shadow-slate-200/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* 1. Category Quick Links */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {benefits.map((item, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveBenefit(item)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all whitespace-nowrap group"
                whileHover={{ y: -2 }}
              >
                <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">{item.title.replace('For ', '')}</span>
              </motion.button>
            ))}
          </div>

          {/* Vertical Divider (Desktop Only) */}
          <div className="hidden xl:block h-10 w-px bg-slate-200 mx-2" />

          {/* 2. CTA & Stats Group */}
          <div className="flex items-center gap-6 py-1">
            <Link href="/courses">
              <PrimaryButton size="sm" className="h-11 px-8 text-[11px] font-black uppercase tracking-widest bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-700/20 group whitespace-nowrap rounded-2xl">
                Explore All Programs
                <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </PrimaryButton>
            </Link>
            
            <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm hover:z-10 transition-all">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} className="w-full h-full object-cover" alt="Student" />
                  </div>
                ))}
              </div>
              <div className="text-left leading-tight">
                <div className="text-[11px] font-black text-slate-900">12,000+</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Verified Students</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefit Details Popup (Modal) */}
        <AnimatePresence>
          {activeBenefit && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveBenefit(null)}
              />
              <motion.div 
                className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <activeBenefit.icon className="w-8 h-8" />
                    </div>
                    <button 
                      onClick={() => setActiveBenefit(null)}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">{activeBenefit.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-lg mb-8">
                    {activeBenefit.details}
                  </p>
                  <PrimaryButton 
                    className="w-full h-12 bg-blue-700 text-white"
                    onClick={() => setActiveBenefit(null)}
                  >
                    Got it, thanks!
                  </PrimaryButton>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>



      {/* ── All Programs (Free & Paid) ── */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-[0.2em]">Curriculum</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-3">Our Programs</h2>
              <p className="text-lg text-slate-600">
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
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium mb-4 md:hidden">
              <ArrowRight className="w-4 h-4" /> Swipe to see more
            </div>
            <motion.div
              variants={containerVars}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:overflow-visible md:pb-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayCourses.map(course => (
                <motion.div key={course.id} variants={itemVars} className="snap-start shrink-0 w-[85vw] md:w-auto">
                  <CourseCard course={course} hideLockOverlay={true} />
                </motion.div>
              ))}

            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Career Pathfinder / Assessment CTA ── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 p-10 md:p-14">
            {/* Left accent bar */}
            <div className="max-w-2xl space-y-5 pl-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-end gap-1.5 h-4">
                  <div className="w-1 h-2 bg-blue-200 rounded-full" />
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  <div className="w-1 h-3 bg-blue-400 rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Career Pathfinder</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Not sure where to start?
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
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

            <div className="shrink-0">
              <Link href="/assessment">
                <PrimaryButton size="lg" className="h-13 px-8 text-base font-bold bg-blue-700 hover:bg-blue-800 text-white border-none shadow-md group">
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
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/3 lg:sticky lg:top-32">
              <div className="relative pl-6 mb-8">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-blue-400 to-transparent rounded-full" />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">Process</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.15] mb-5">
                Your Pathway to Admission.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
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
                  <HeartHandshake className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                  <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Financial Assistance</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Scholarships & Grants</h3>
                <p className="text-slate-600 mb-7 leading-relaxed max-w-xl">
                  Financial constraints should never hinder your potential. Explore our comprehensive
                  merit and need-based scholarship programs designed to fully support your training.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-7 p-5 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <Landmark className="w-7 h-7 text-blue-600" />
                    ₱500k
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Annual Funding Pool</div>
                    <div className="text-sm text-slate-500">Awarded to aspiring professionals</div>
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
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 rounded-full border-2 border-blue-600/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">Social Proof</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-3">
              Real Skills. Real Success.
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl">
              Discover how our graduates transformed their passion into professional excellence
              through our accredited training programs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                className="bg-slate-50 p-8 rounded-xl border border-slate-200 flex flex-col hover:border-blue-200 hover:shadow-sm transition-all"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                {/* Quote mark */}
                <div className="text-4xl font-serif text-blue-200 leading-none mb-4 select-none">"</div>
                <p className="text-slate-700 leading-relaxed flex-1 text-[15px]">
                  {testimonial.quote}
                </p>
                <div className="mt-7 pt-6 border-t border-slate-200 flex items-center gap-4">
                  <img
                    src={withBase(testimonial.imageUrl)}
                    alt={testimonial.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">{testimonial.name}</p>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest News ── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-sm bg-blue-600" />
                  <div className="w-1.5 h-1.5 rounded-sm bg-blue-200" />
                  <div className="w-1.5 h-1.5 rounded-sm bg-blue-200" />
                  <div className="w-1.5 h-1.5 rounded-sm bg-blue-400" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">Insight</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-3">Latest Updates</h2>
              <p className="text-lg text-slate-600">
                Stay informed with the latest news, announcements, and success stories from our academy.
              </p>
            </div>
            <Link href="/about">
              <PrimaryButton variant="ghost" className="font-semibold text-blue-700 hover:text-blue-800 hover:bg-blue-50 shrink-0">
                Read all stories <ArrowRight className="ml-2 h-4 w-4" />
              </PrimaryButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPosts.slice(0, 6).map((post, i) => (
              <motion.div
                key={post.id}
                className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 leading-snug group-hover:text-blue-700 transition-colors text-slate-900 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 mb-5 line-clamp-2 text-sm leading-relaxed">{post.excerpt}</p>
                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                        {post.author.substring(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{post.author}</span>
                    </div>
                    {post.sourceUrl ? (
                      <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="text-blue-700 font-semibold text-sm inline-flex items-center gap-1 hover:underline">
                        Read more <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link href={`/news/${post.id}`} className="text-blue-700 font-semibold text-sm hover:underline">
                        Read more
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-blue-700 text-white text-center">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="max-w-3xl mx-auto space-y-7"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-bold uppercase tracking-widest border border-white/20">
              <GraduationCap className="h-3.5 w-3.5" />
              Applications Now Open
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to transform your career?</h2>
            <p className="text-xl text-blue-100">
              Join the next cohort and start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/trainee/register">
                <PrimaryButton size="lg" className="bg-white text-blue-700 hover:bg-blue-50 h-13 px-10 text-base font-bold shadow-lg border-none group">
                  Enroll now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </PrimaryButton>
              </Link>
              <Link href="/courses">
                <PrimaryButton size="lg" variant="outline" className="h-13 px-10 text-base font-semibold border-white/40 text-white hover:bg-white/10">
                  Browse programs
                </PrimaryButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

import { Reveal } from "@/components/lista-reveal";
import ScrollParallax from "@/components/scroll-parallax";
import { 
  FileText, 
  Search, 
  ClipboardCheck, 
  CreditCard, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Mail,
  Phone,
  Clock,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import PrimaryButton from "@/components/primary-button";
import { getPublicEnrollHref } from "@/lib/enroll-entry";

const steps = [
  {
    icon: Search,
    title: "01. Choose a Course",
    bisayaTitle: "Pili og Kurso",
    description: "Pick the training program that fits your goals. We can help you decide.",
    bisayaDescription: "Sugdi ang imong panaw pinaagi sa pagpili sa among mga kurso. Andam kami motabang kanimo.",
    tag: "Step 1"
  },
  {
    icon: ClipboardCheck,
    title: "02. Skills Check",
    bisayaTitle: "Pagsusi sa Kaalam",
    description: "Take a short test so we know how to help you best.",
    bisayaDescription: "Apil sa among assessment aron maseguro nga ang imong kurso haom sa imong kahanas.",
    tag: "Step 2"
  },
  {
    icon: FileText,
    title: "03. Submit Documents",
    bisayaTitle: "Pagsumite sa Dokumento",
    description: "Give us your required papers so we can process your enrollment.",
    bisayaDescription: "Isumite ang imong mga kinahanglanon nga papeles aron ma-proseso ang imong enrollment.",
    tag: "Step 3"
  },
  {
    icon: CreditCard,
    title: "04. Pay or Use Scholarship",
    bisayaTitle: "Pagparehistro",
    description: "Pay the tuition fee or apply for our government-funded scholarships.",
    bisayaDescription: "Iseguro ang imong slot pinaagi sa pagbayad o paggamit sa mga scholarship sa gobyerno.",
    tag: "Step 4"
  },
  {
    icon: UserCheck,
    title: "05. Attend Orientation",
    bisayaTitle: "Oryentasyon sa Eskwelahan",
    description: "Join our welcoming event to meet your teachers and get your training kits.",
    bisayaDescription: "Tambong sa among oryentasyon. Dawata ang imong training kits ug ilaila ang imong mga mentor.",
    tag: "Step 5"
  }
];

/** Single checklist — trainees see one list of everything to bring (no split categories). */
const enrollmentDocuments = [
  "PSA Birth Certificate (original)",
  "Valid government-issued ID (photocopy)",
  "Barangay Clearance",
  "High School Diploma (photocopy)",
  "Form 137 / Report Card (photocopy)",
  "Transcript of Records (photocopy, if available)",
  "Medical Certificate — fit to train",
  "Good Moral Character Certificate",
  "4 pieces 1×1 ID photos (white background)",
  "4 pieces 2×2 ID photos (white background)",
] as const;

export default function AdmissionsPage() {
  return (
    <div className="w-full bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Hero Section - Airy & Sophisticated */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-48 lg:pb-40 overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto md:mx-0 text-center md:text-left">
            <Reveal from="left" duration={600}>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <div className="relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                  <div className="absolute w-8 h-[1px] bg-gradient-to-r from-blue-600/30 to-transparent left-full ml-2" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] bg-blue-50/50 px-2 py-1 rounded">Admission Guide</span>
              </div>
            </Reveal>
            
            <Reveal delay={100} duration={800} className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.05] text-slate-900 text-balance">
              How to Enroll <br />
              <span className="text-slate-300">at</span> LISTA
            </Reveal>
            
            <Reveal delay={200} duration={800} className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12 max-w-2xl font-medium">
              Follow these simple steps to start your training with us. <br />
              <span className="text-blue-600 font-semibold text-lg italic mt-2 block">Dali ug sayon nga proseso para sa imong kaugmaon.</span>
            </Reveal>
            
            <Reveal delay={300} duration={800} className="public-hero-actions">
              {/* 2026-05-13: single application entrypoint */}
              <Link href={getPublicEnrollHref()}>
                <PrimaryButton size="lg" className="h-16 px-10 text-lg rounded-none bg-blue-600 hover:bg-blue-700 transition-colors duration-500 group">
                  Sign in to apply
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </PrimaryButton>
              </Link>
              <Link href="/courses">
                <PrimaryButton variant="outline" size="lg" className="h-14 sm:h-16 px-8 sm:px-10 text-lg rounded-none border-slate-200 text-slate-600 hover:bg-slate-50 w-full sm:w-auto">
                  View All Courses
                </PrimaryButton>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Process Section - Clean & Geometric */}
      <section className="overflow-visible py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-20 lg:flex-row lg:items-start">
            <div className="lg:sticky lg:top-28 lg:z-[3] shrink-0 lg:w-1/3 lg:self-start">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  Enrollment <br />
                  <span className="text-blue-600">Process</span>
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  We made enrolling fast and easy so you can start learning right away.
                </p>
                <div className="pt-8 border-t border-slate-100 flex items-center gap-6">
                   <div className="text-center">
                      <p className="text-3xl font-black text-slate-900">48h</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Response Time</p>
                   </div>
                   <div className="w-[1px] h-10 bg-slate-100"></div>
                   <div className="text-center">
                      <p className="text-3xl font-black text-slate-900">100%</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Digital Track</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="relative lg:w-2/3">
              <ScrollParallax
                speed={0.012}
                aria-hidden
                className="pointer-events-none absolute -top-8 right-0 z-[1] hidden h-48 w-48 rounded-full bg-blue-100/40 blur-3xl lg:block"
              />
              <div className="relative z-[3] space-y-4">
                {steps.map((step, idx) => (
                  <Reveal
                    key={idx}
                    inView
                    from="bottom"
                    duration={1000}
                    delay={idx * 100}
                    className="lista-reveal--slow group relative rounded-[2rem] border border-slate-100 bg-slate-50/50 p-10 transition-all duration-700 hover:border-blue-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50"
                  >
                    <div className="absolute top-10 right-10 text-6xl font-black text-slate-100 group-hover:text-blue-50 transition-colors pointer-events-none">
                      {idx + 1}
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <step.icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                          {step.tag}
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">{step.title}</h3>
                        <p className="text-blue-600 font-semibold text-sm italic mb-1">{step.bisayaTitle}</p>
                        <p className="text-slate-500 leading-relaxed text-lg max-w-xl">
                          {step.description}
                        </p>
                        <p className="text-slate-400 text-sm italic">
                          {step.bisayaDescription}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements — one checklist, clear order */}
      <section className="py-16 sm:py-24 lg:py-32 bg-slate-50/50 border-y border-slate-100">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto min-w-0 space-y-8 sm:space-y-10">
            <div className="text-center sm:text-left space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 text-balance">
                What to bring when you enroll
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Mga kinahanglanon sa pag-enrol:</span>{" "}
                dad-a ang tanan sa lista sa ubos. Ayaw lang ang usa.
              </p>
            </div>

            <Reveal inView from="scale" duration={600} className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 sm:p-6 space-y-4">
              <p className="text-sm font-bold uppercase tracking-wider text-amber-900">Before you come to campus</p>
              <ol className="list-decimal list-inside space-y-2 text-slate-800 text-base sm:text-lg font-medium leading-relaxed marker:font-bold marker:text-amber-800">
                <li>
                  <Link href={getPublicEnrollHref()} className="text-blue-700 underline underline-offset-2 hover:text-blue-900">
                    Sign in and complete the online application
                  </Link>{" "}
                  (create your LISTA account first).
                </li>
                <li>
                  Prepare every document in the checklist below inside one{" "}
                  <strong className="text-amber-950">long brown envelope</strong>.
                </li>
                <li>Bring the envelope and your account ready when you visit the main building.</li>
              </ol>
              <p className="text-sm text-amber-900/90 border-t border-amber-200/80 pt-3 leading-relaxed">
                <strong>Pahibalo:</strong> Maghimo og account ug kompletoha ang online form una. Ibutang ang tanan nga dokumento sa usa ka long brown envelope. Unya lang moadto sa main building.
              </p>
            </Reveal>

            <Reveal inView delay={100} duration={600} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
              <p className="text-lg font-bold text-slate-900 mb-1">Document checklist</p>
              <p className="text-sm text-slate-500 mb-6">Bring all {enrollmentDocuments.length} items. Photocopies are fine unless noted.</p>
              <ul className="space-y-3" aria-label="Enrollment document checklist">
                {enrollmentDocuments.map((doc, idx) => (
                  <li key={doc} className="flex gap-3 items-start text-base sm:text-[1.05rem] text-slate-800">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5 font-medium leading-snug">{doc}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-600">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" aria-hidden />
                <p>
                  Scholarship applicants (TWSP, etc.) may need extra papers — staff will confirm when you apply.
                </p>
              </div>
            </Reveal>

            <div className="text-center sm:text-left">
              <Link href={getPublicEnrollHref()}>
                <PrimaryButton className="w-full sm:w-auto h-12 sm:h-14 px-8 rounded-full font-bold">
                  Start online application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </PrimaryButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Support - Light & Approachable */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto min-w-0">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">
              <div className="space-y-8 sm:space-y-12 min-w-0">
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-balance">Admissions Inquiry</h2>
                  <p className="text-base sm:text-lg text-slate-500">Frequently asked questions regarding our institutional standards and enrollment procedures.</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { 
                      q: "Is there an age requirement?", 
                      bq: "Aduna ba'y age requirement?",
                      a: "Standard technical programs require applicants to be 18+. Community programs may accept 15+.",
                      ba: "Ang mga teknikal nga kurso kinahanglan 18 anyos pataas. Ang mga community programs modawat og 15 anyos pataas."
                    },
                    { 
                      q: "When do the cohorts begin?", 
                      bq: "Kanus-a magsugod ang klase?",
                      a: "We maintain a quarterly induction cycle: January, April, July, and October.",
                      ba: "Aduna kita'y quarterly nga pagsugod: Enero, Abril, Hulyo, ug Oktubre."
                    },
                    { 
                      q: "Are there weekend options?", 
                      bq: "Naa ba'y klase kon Sabado ug Domingo?",
                      a: "Yes, we offer specialized schedules for working professionals and industry practitioners.",
                      ba: "Oo, aduna kita'y espesyal nga schedule para sa mga nagtrabaho na."
                    }
                  ].map((faq, i) => (
                    <div key={i} className="group p-5 sm:p-8 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-[2rem] hover:bg-white hover:shadow-lg transition-all duration-500">
                      <h4 className="text-lg font-bold mb-1 flex items-center justify-between">
                        {faq.q}
                        <HelpCircle className="w-5 h-5 text-blue-200 group-hover:text-blue-600 transition-colors" />
                      </h4>
                      <p className="text-blue-600 font-semibold text-sm mb-4 italic">{faq.bq}</p>
                      <p className="text-slate-500 leading-relaxed mb-2">{faq.a}</p>
                      <p className="text-slate-400 text-sm italic">{faq.ba}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-w-0 w-full">
                <div className="bg-white border-2 border-blue-600 rounded-2xl sm:rounded-3xl lg:rounded-[4rem] p-5 sm:p-8 md:p-12 lg:p-16 shadow-xl sm:shadow-2xl shadow-blue-100/50 relative z-10 overflow-hidden">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-balance">Connect with us.</h3>
                  <p className="text-slate-500 text-base sm:text-lg mb-8 sm:mb-12 leading-relaxed">Our dedicated admissions department is available for virtual and in-person consultations.</p>
                  
                  <div className="space-y-6 sm:space-y-10">
                    <div className="flex gap-4 sm:gap-6 items-start min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Direct Line</p>
                        <a
                          href="tel:+639051095284"
                          className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          0905 109 5284
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 sm:gap-6 items-start min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Electronic Mail</p>
                        <a
                          href="mailto:admin@lorenzinternational.org"
                          className="block text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 break-all [overflow-wrap:anywhere] hover:text-blue-600 transition-colors"
                        >
                          admin@lorenzinternational.org
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 sm:gap-6 items-start min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Business Hours</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-balance">Mon — Fri, 8AM - 5PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 sm:mt-12 pt-8 sm:pt-10 border-t border-slate-100">
                    <PrimaryButton className="w-full h-12 sm:h-14 md:h-16 rounded-full text-base sm:text-lg font-bold group">
                      Schedule a Visit
                      <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </PrimaryButton>
                  </div>
                </div>
                
                {/* Decorative Elements — desktop only (avoid mobile overflow) */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-10 hidden md:block pointer-events-none" aria-hidden />
                <div className="absolute top-1/2 -left-10 w-32 h-32 bg-emerald-400 rounded-full blur-[60px] opacity-10 hidden md:block pointer-events-none" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Refined & Light */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-[5rem] p-16 md:p-24 text-center shadow-sm relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent opacity-50"></div>
             <div className="relative z-10 space-y-10">
               <h2 className="text-4xl md:text-6xl font-black tracking-tight">Begin your <br />transformation today.</h2>
               <p className="text-xl text-slate-400 font-light max-w-xl mx-auto">
                 Join a community dedicated to technical mastery and career-focused excellence. Slots for the current cohort are limited.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <Link href={getPublicEnrollHref()}>
                   <PrimaryButton size="lg" className="h-14 px-8 md:h-16 md:px-12 text-lg md:text-xl font-black rounded-none shadow-2xl shadow-blue-200/50 w-full sm:w-auto">
                      Enroll Now
                   </PrimaryButton>
                 </Link>
                 <Link href="/courses">
                   <button className="text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors">
                     Browse Curriculum
                     <ArrowRight className="w-4 h-4" />
                   </button>
                 </Link>
               </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}

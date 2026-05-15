import { motion } from "framer-motion";
import { 
  FileText, 
  Search, 
  ClipboardCheck, 
  CreditCard, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap, 
  Stethoscope, 
  Image as ImageIcon, 
  Mail,
  Phone,
  MapPin,
  Clock,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import PrimaryButton from "@/components/primary-button";

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
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

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

const requirements = [
  {
    icon: ShieldCheck,
    title: "Identification",
    bisayaTitle: "Pag-ila (Identification)",
    description: "Standard government verification",
    items: [
      { en: "PSA Birth Certificate (Original)", bis: "PSA Birth Certificate (Original)" },
      { en: "Valid Government ID", bis: "Valid ID sa Gobyerno" },
      { en: "Barangay Clearance", bis: "Barangay Clearance" }
    ]
  },
  {
    icon: GraduationCap,
    title: "Academic History",
    bisayaTitle: "Kasaysayan sa Pag-eskwela",
    description: "Educational foundation records",
    items: [
      { en: "High School Diploma", bis: "High School Diploma" },
      { en: "Form 137 / Report Card", bis: "Form 137 o Report Card" },
      { en: "Transcript of Records", bis: "Transcript of Records" }
    ]
  },
  {
    icon: Stethoscope,
    title: "Health & Conduct",
    bisayaTitle: "Panglawas ug Panggawi",
    description: "Readiness for technical training",
    items: [
      { en: "Medical Certificate (Fit to Train)", bis: "Medical Certificate (Andam mo-train)" },
      { en: "Good Moral Character Certificate", bis: "Good Moral Character Certificate" }
    ]
  },
  {
    icon: ImageIcon,
    title: "Visual Records",
    bisayaTitle: "Mga Hulagway (ID Photos)",
    description: "Official institutional identification",
    items: [
      { en: "4pcs 1x1 ID Photos", bis: "4 ka buok 1x1 nga hulagway" },
      { en: "4pcs 2x2 ID Photos", bis: "4 ka buok 2x2 nga hulagway" },
      { en: "Standard white background", bis: "Puti ang background" }
    ]
  }
];

export default function AdmissionsPage() {
  return (
    <div className="w-full bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Hero Section - Airy & Sophisticated */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                  <div className="absolute w-8 h-[1px] bg-gradient-to-r from-blue-600/30 to-transparent left-full ml-2" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] bg-blue-50/50 px-2 py-1 rounded">Admission Guide</span>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05] text-slate-900"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              How to Enroll <br />
              <span className="text-slate-300">at</span> LISTA
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12 max-w-2xl font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Follow these simple steps to start your training with us. <br />
              <span className="text-blue-600 font-semibold text-lg italic mt-2 block">Dali ug sayon nga proseso para sa imong kaugmaon.</span>
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* 2026-05-13: single application entrypoint */}
              <Link href="/trainee/register">
                <PrimaryButton size="lg" className="h-16 px-10 text-lg rounded-none bg-blue-600 hover:bg-blue-700 transition-colors duration-500 group">
                  Begin Application
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </PrimaryButton>
              </Link>
              <PrimaryButton variant="outline" size="lg" className="h-16 px-10 text-lg rounded-none border-slate-200 text-slate-600 hover:bg-slate-50">
                View All Courses
              </PrimaryButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Section - Clean & Geometric */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3">
              <div className="sticky top-32 space-y-8">
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

            <div className="lg:w-2/3">
              <motion.div 
                variants={containerVars}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-4"
              >
                {steps.map((step, idx) => (
                  <motion.div 
                    key={idx} 
                    variants={itemVars}
                    className="group relative bg-slate-50/50 border border-slate-100 p-10 rounded-[2rem] hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 hover:border-blue-100 transition-all duration-700"
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
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements - Minimalist Grid */}
      <section className="py-32 bg-slate-50/50 border-y border-slate-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Enrollment Requirements</h2>
            <div className="space-y-2">
              <p className="text-blue-600 font-bold tracking-wide uppercase text-sm">Mga Kinahanglanon sa Pag-enrol</p>
              <p className="text-xl text-slate-500 font-medium">Bring these documents when you enroll.</p>
            </div>
            
            {/* Prominent Bisaya Instruction */}
            <motion.div 
              className="flex flex-col gap-4 max-w-2xl mx-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="bg-blue-50 border border-blue-100 px-8 py-4 rounded-2xl">
                <p className="text-blue-800 font-bold text-lg">
                  ⚠️ Palihog ibutang ang tanang dokumento sa usa ka <span className="underline decoration-blue-300 decoration-2 underline-offset-4">"long brown envelope"</span>.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 px-8 py-5 rounded-2xl shadow-sm">
                <p className="text-emerald-900 font-bold text-lg leading-tight">
                  Important: Applicants must bring these documents and <span className="text-emerald-600">create an account (filling up the online form)</span> BEFORE proceeding to the main building.
                </p>
                <p className="text-emerald-700 font-medium text-sm mt-2 italic">
                  Pahibalo: Kinahanglan dad-on ang mga dokumento ug maghimo og account (pag-fill up sa form) BAG-O moadto sa main building.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {requirements.map((req, idx) => (
              <motion.div 
                key={idx}
                className="bg-white border border-slate-200/60 p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-8">
                  <req.icon className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-bold mb-1">{req.title}</h4>
                <p className="text-blue-600 font-bold text-xs mb-2 uppercase tracking-tight">{req.bisayaTitle}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{req.description}</p>
                <ul className="space-y-4">
                  {req.items.map((item, i) => (
                    <li key={i} className="text-sm text-slate-600 flex flex-col items-start gap-1">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span className="font-semibold">{item.en}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 ml-4.5 italic">({item.bis})</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ & Support - Light & Approachable */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-start">
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold tracking-tight">Admissions Inquiry</h2>
                  <p className="text-lg text-slate-500">Frequently asked questions regarding our institutional standards and enrollment procedures.</p>
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
                    <div key={i} className="group p-8 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all duration-500">
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

              <div className="relative">
                <div className="bg-white border-2 border-blue-600 rounded-[4rem] p-12 md:p-16 shadow-2xl shadow-blue-100/50 relative z-10">
                  <h3 className="text-3xl font-bold mb-8">Connect with us.</h3>
                  <p className="text-slate-500 text-lg mb-12">Our dedicated admissions department is available for virtual and in-person consultations.</p>
                  
                  <div className="space-y-10">
                    <div className="flex gap-6 items-start">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Direct Line</p>
                        <p className="text-2xl font-bold tracking-tight">0905 109 5284</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 items-start">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Electronic Mail</p>
                        <p className="text-2xl font-bold tracking-tight">admin@lorenzinternational.org</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 items-start">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Business Hours</p>
                        <p className="text-2xl font-bold tracking-tight">Mon — Fri, 8AM - 5PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-10 border-t border-slate-100">
                    <PrimaryButton className="w-full h-16 rounded-full text-lg font-bold group">
                      Schedule a Visit
                      <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </PrimaryButton>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-10"></div>
                <div className="absolute top-1/2 -left-10 w-32 h-32 bg-emerald-400 rounded-full blur-[60px] opacity-10"></div>
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
                 <Link href="/trainee/register">
                   <PrimaryButton size="lg" className="h-20 px-16 text-xl font-black rounded-none shadow-2xl shadow-blue-200/50">
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

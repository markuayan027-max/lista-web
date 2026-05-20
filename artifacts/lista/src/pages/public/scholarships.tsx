import { useMemo } from "react";
import { Award, DollarSign, ChevronRight, Clock, Banknote, Users, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import PrimaryButton from "@/components/primary-button";
import { useLocation } from "wouter";
import { useCourses, useFaqs } from "@/hooks/use-lista-data";
import {
  TESDA_SCHOLARSHIP_PROGRAMS,
  computeScholarshipPageStats,
  countScholarshipFaqs,
} from "@/lib/public-data-utils";
import { getPublicEnrollHref } from "@/lib/enroll-entry";

const STAT_ICONS = { Award, Users, Info, DollarSign } as const;

export default function ScholarshipsPage() {
  const [, setLocation] = useLocation();
  const { data: courses = [] } = useCourses();
  const { data: faqs = [] } = useFaqs();
  const scholarshipFaqs = countScholarshipFaqs(faqs);
  const heroStats = useMemo(
    () => computeScholarshipPageStats(courses, scholarshipFaqs),
    [courses, scholarshipFaqs],
  );

  const handleApply = (id: string) => {
    setLocation(getPublicEnrollHref({ scholarship: id }));
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      {/* Header & Stats Combined */}
      <section className="relative min-h-0 py-16 md:py-24 lg:min-h-[70dvh] lg:flex lg:flex-col lg:justify-center pt-20 pb-12 lg:pt-32 lg:pb-20 overflow-hidden bg-white rounded-b-[2rem] md:rounded-b-[3rem] shadow-sm mb-8">
        {/* Modern Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-3/4 h-[120%] bg-blue-50/40 -skew-x-12 translate-x-1/4 -translate-y-10 z-0" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-100/20 rounded-full blur-[120px] -translate-x-1/2 z-0" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-50/50 rounded-full blur-[100px] z-0" />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

        <div className="container mx-auto px-4 md:px-6 relative z-10 flex-1 flex flex-col justify-center">
          <div className="max-w-4xl mb-12 lg:mb-20">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 mb-6 lg:mb-8 backdrop-blur-sm shadow-sm">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-blue-600 animate-ping opacity-75" />
              </div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-[0.25em]">Financial Opportunity</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6 lg:mb-8 leading-[1.05] drop-shadow-sm text-balance">
              Empowering your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Educational Journey.</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-2xl font-medium">
              Breaking financial barriers through merit-based and need-based support. Discover the pathway to your professional success at LISTA.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            {heroStats.map((stat, i) => {
              const Icon = STAT_ICONS[stat.icon];
              return (
              <div key={i} className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-4 sm:p-6 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] text-pretty">{stat.label}</p>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-32 bg-slate-50/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-[2px] bg-blue-600" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.3em]">Scholarship Programs</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Financial Aid Opportunities</h2>
            </div>
            <p className="text-slate-500 max-w-md md:text-right font-medium">
              We offer various programs tailored to different needs, from technical skills training to academic assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {TESDA_SCHOLARSHIP_PROGRAMS.map((scholarship) => (
              <Card key={scholarship.id} className="group border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col relative z-10 bg-white rounded-[2.5rem] overflow-hidden hover:-translate-y-2">
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-bl-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700 z-0" />
                
                <CardHeader className="pb-6 pt-10 px-10 relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 group-hover:rotate-6 transition-transform duration-500">
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {scholarship.id}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {scholarship.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 pb-10 px-10 relative z-10">
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium italic opacity-80">
                    &ldquo;{scholarship.description}&rdquo;
                  </p>
                  
                  <div className="grid grid-cols-1 gap-6 mb-10 p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Benefit Amount</p>
                        <p className="font-bold text-slate-900">{scholarship.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Application Period</p>
                        <p className="font-bold text-slate-900">{scholarship.deadline}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Key Requirements</p>
                      <div className="h-px flex-1 bg-slate-100 ml-4" />
                    </div>
                    <ul className="grid grid-cols-1 gap-3">
                      {scholarship.eligibility.map((req, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-3 leading-relaxed group/item">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                          <span className="font-medium">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-10 px-10 relative z-10">
                  <PrimaryButton 
                    className="w-full group/btn h-14 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 transition-all duration-300" 
                    onClick={() => handleApply(scholarship.id)}
                  >
                    <span className="font-bold tracking-wide">Secure My Slot</span>
                    <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                  </PrimaryButton>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-[4rem] bg-slate-900 p-12 md:p-24 text-center shadow-2xl shadow-blue-900/20">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10 max-w-4xl mx-auto space-y-10">
              <div className="flex flex-col items-center gap-4">
                <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.5em]">Support & Guidance</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
                  Need help navigating <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">Financial Aid?</span>
                </h2>
              </div>
              
              <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
                Our dedicated admissions team is here to guide you through your financial options, eligibility requirements, and the application process.
              </p>
              
              <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-2xl mx-auto">
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 group">
                  <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">Call our hotline</p>
                  <a href="tel:09051095284" className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">0905 109 5284</a>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 group">
                  <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">Email inquiries</p>
                  <a href="mailto:admin@lorenzinternational.org" className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">admin@lorenz.org</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

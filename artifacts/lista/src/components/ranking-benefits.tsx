import { motion } from "framer-motion";
import { Award, TrendingUp, BriefcaseBusiness, GraduationCap, ChevronRight } from "lucide-react";
import { Link } from "wouter";

const benefits = [
  {
    icon: Award,
    title: "DepEd Ranking Advantage",
    description: "Earn up to 10 points for your DepEd ranking with our accredited 120-hour courses.",
    color: "bg-blue-50 text-blue-600",
    points: "+10 Pts"
  },
  {
    icon: BriefcaseBusiness,
    title: "Job Placement Priority",
    description: "High RP earners are prioritized for local and international job recommendations.",
    color: "bg-amber-50 text-amber-600",
    points: "Top Priority"
  },
  {
    icon: TrendingUp,
    title: "Skills Gamification",
    description: "Level up your profile as you master competencies. Compete with peers for the top spot.",
    color: "bg-emerald-50 text-emerald-600",
    points: "Level Up"
  },
  {
    icon: GraduationCap,
    title: "TESDA Compliance",
    description: "All courses are fully aligned with TESDA training regulations for global recognition.",
    color: "bg-purple-50 text-purple-600",
    points: "Global"
  }
];

export default function RankingBenefits() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-indigo/5 border border-primary-indigo/10 text-primary-indigo text-[10px] font-black uppercase tracking-[0.3em]">
                Career Advantage
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1]">
                Why Ranking <br />
                <span className="text-primary-electric">Points Matter.</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                At LISTA, we've transformed traditional technical education into a competitive journey. Your Ranking Points (RP) aren't just for show—they're your ticket to career success.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Link href="/rankings">
                <button className="flex items-center gap-3 text-slate-900 font-bold hover:text-primary-indigo transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center group-hover:border-primary-indigo/20 group-hover:shadow-md transition-all">
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  View Live Leaderboard
                </button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${benefit.color} flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform`}>
                    <benefit.icon className="h-7 w-7" />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{benefit.title}</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{benefit.points}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

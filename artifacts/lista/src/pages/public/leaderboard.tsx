import { motion } from "framer-motion";
import { Trophy, Medal, Star, TrendingUp, Search, Info, Award, User, Target, Zap, BookOpen, Users, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data for the leaderboard
const LEADERBOARD_DATA = [
  { id: 1, name: "Maria Clara Santos", points: 15420, rank: 1, batch: "Batch 18", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria", course: "Computer Systems Servicing NC II" },
  { id: 2, name: "Juan Dela Cruz", points: 14850, rank: 2, batch: "Batch 19", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan", course: "Electronic Products Assembly" },
  { id: 3, name: "Elena Ramos", points: 13900, rank: 3, batch: "Batch 18", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena", course: "Caregiving NC II" },
  { id: 4, name: "Roberto Garcia", points: 12100, rank: 4, batch: "Batch 19", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto", course: "Bread and Pastry Production NC II" },
  { id: 5, name: "Sofia Lopez", points: 11800, rank: 5, batch: "Batch 17", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia", course: "Dressmaking NC II" },
  { id: 6, name: "Miguel Angelo", points: 10500, rank: 6, batch: "Batch 19", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel", course: "Agricultural Crops Production NC I" },
  { id: 7, name: "Isabel Torres", points: 9800, rank: 7, batch: "Batch 18", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabel", course: "Computer Systems Servicing NC II" },
  { id: 8, name: "Antonio Luna", points: 9200, rank: 8, batch: "Batch 19", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio", course: "Caregiving NC II" },
];

export default function LeaderboardPage() {
  const [search, setSearch] = useState("");

  const filteredData = LEADERBOARD_DATA.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.course.toLowerCase().includes(search.toLowerCase())
  );

  const topThree = LEADERBOARD_DATA.slice(0, 3);
  const others = filteredData.filter(user => user.rank > 3);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header Section */}
      <section className="bg-primary-indigo text-white pt-24 pb-48 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-electric/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-gold/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent-gold text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles className="h-4 w-4" />
              Global Achievement Ranking
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              Hall of <span className="text-accent-gold">Fame.</span>
            </h1>
            <p className="text-blue-100/80 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
              Celebrating our top performers and dedicated learners. Earn Ranking Points (RP) 
              by completing courses, assessments, and community activities.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-28 relative z-20">
        {/* Podium Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end max-w-6xl mx-auto">
          {/* Silver - Rank 2 */}
          <div className="order-2 md:order-1">
            <PodiumCard 
              user={topThree[1]} 
              rankColor="text-slate-400" 
              bgColor="bg-slate-100" 
              medalIcon={<Medal className="h-6 w-6 text-slate-400" />} 
            />
          </div>
          {/* Gold - Rank 1 */}
          <div className="order-1 md:order-2">
            <PodiumCard 
              user={topThree[0]} 
              rankColor="text-accent-gold" 
              bgColor="bg-amber-50" 
              isGold 
              medalIcon={<Trophy className="h-8 w-8 text-accent-gold" />} 
            />
          </div>
          {/* Bronze - Rank 3 */}
          <div className="order-3">
            <PodiumCard 
              user={topThree[2]} 
              rankColor="text-orange-400" 
              bgColor="bg-orange-50" 
              medalIcon={<Medal className="h-6 w-6 text-orange-400" />} 
            />
          </div>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden max-w-6xl mx-auto">
          <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/30">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Student Rankings</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Real-time stats</p>
              </div>
            </div>
            <div className="relative max-w-md w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-indigo transition-colors" />
              <Input 
                placeholder="Search students or courses..." 
                className="pl-12 h-14 rounded-2xl bg-white border-slate-200 focus:ring-primary-indigo/20 focus:border-primary-indigo transition-all text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                  <th className="px-10 py-6">Rank</th>
                  <th className="px-10 py-6">Student</th>
                  <th className="px-10 py-6">Program</th>
                  <th className="px-10 py-6">Batch</th>
                  <th className="px-10 py-6 text-right">Points (RP)</th>
                </tr>
              </thead>
              <tbody>
                {others.length > 0 ? (
                  others.map((user, idx) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group border-b border-slate-50 hover:bg-slate-50/50 transition-all duration-300"
                    >
                      <td className="px-10 py-7">
                        <span className="text-xl font-black text-slate-300 group-hover:text-primary-indigo transition-colors">#{user.rank}</span>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl border-2 border-white overflow-hidden bg-white shadow-sm ring-1 ring-slate-100">
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 group-hover:text-primary-indigo transition-colors">{user.name}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest lg:hidden">{user.batch}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <span className="text-sm font-bold text-slate-600">{user.course}</span>
                      </td>
                      <td className="px-10 py-7">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{user.batch}</span>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-lg font-black text-slate-900">{user.points.toLocaleString()}</span>
                          <div className="w-8 h-8 rounded-full bg-primary-electric/10 flex items-center justify-center">
                            <Star className="h-4 w-4 text-primary-electric fill-primary-electric" />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                          <Search className="h-8 w-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold text-lg">No rankings found for "{search}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-20 max-w-6xl mx-auto">
          <div className="lg:col-span-4">
            <div className="bg-primary-indigo rounded-[2rem] p-10 text-white relative overflow-hidden h-full shadow-2xl shadow-primary-indigo/20">
              <Zap className="absolute top-6 right-6 h-32 w-32 text-white/5 -rotate-12" />
              <h3 className="text-3xl font-black mb-6 leading-tight">Mastery & <br />Progression</h3>
              <p className="text-blue-100 font-medium leading-relaxed mb-8 text-lg">
                Your Ranking Points (RP) reflect your commitment to technical excellence and professional growth.
              </p>
              <div className="space-y-4">
                {[
                  { icon: BookOpen, label: "Course Completion", points: "+500 RP" },
                  { icon: Target, label: "Assessment Success", points: "+1000 RP" },
                  { icon: Users, label: "Batch Collaboration", points: "+200 RP" },
                  { icon: TrendingUp, label: "Continuous Learning", points: "+50 RP" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-accent-gold" />
                      </div>
                      <span className="text-sm font-bold">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-accent-gold bg-accent-gold/10 px-2 py-1 rounded-md">{item.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200/60 shadow-sm flex flex-col hover:shadow-xl transition-shadow duration-500">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-accent-gold" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Priority Placement</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-8 flex-1">
                Top-tier students receive priority recommendations to our network of 50+ corporate partners 
                and premium internship placements.
              </p>
              <Button variant="ghost" className="p-0 text-primary-indigo font-black h-auto hover:bg-transparent hover:translate-x-2 transition-transform w-fit">
                Learn about rewards <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200/60 shadow-sm flex flex-col hover:shadow-xl transition-shadow duration-500">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-primary-electric" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Digital Excellence</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-8 flex-1">
                Your RP achievements are converted into verifiable digital badges that you can showcase 
                on your professional profiles and resume.
              </p>
              <Button variant="ghost" className="p-0 text-primary-electric font-black h-auto hover:bg-transparent hover:translate-x-2 transition-transform w-fit">
                View achievement tiers <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ user, rankColor, bgColor, medalIcon, isGold }: { 
  user: any; 
  rankColor: string; 
  bgColor: string; 
  medalIcon: React.ReactNode;
  isGold?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + (user.rank * 0.1), duration: 0.8, ease: "easeOut" }}
      className={cn(
        "relative rounded-[3rem] p-10 text-center border transition-all duration-700",
        isGold 
          ? "bg-white border-accent-gold/40 shadow-[0_48px_80px_-16px_rgba(251,191,36,0.25)] z-10 py-16" 
          : "bg-white/90 border-slate-200 shadow-2xl shadow-slate-200/50 z-0",
        isGold ? "md:scale-105" : "md:scale-95"
      )}
    >
      <div className={cn(
        "absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white transition-transform duration-500 hover:rotate-12", 
        bgColor
      )}>
        {medalIcon}
      </div>

      <div className="relative mb-8">
        <div className={cn(
          "mx-auto w-28 h-28 rounded-[2rem] p-1.5 border-4 bg-white shadow-inner overflow-hidden transition-transform duration-500 hover:scale-105",
          isGold ? "border-accent-gold ring-4 ring-accent-gold/10" : "border-slate-100"
        )}>
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className={cn(
          "absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-black text-white shadow-lg border-2 border-white", 
          isGold ? "bg-accent-gold" : "bg-slate-400"
        )}>
          RANK {user.rank}
        </div>
      </div>

      <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">{user.name}</h3>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">{user.course}</p>
      
      <div className={cn(
        "inline-flex items-center gap-3 px-6 py-3 rounded-2xl border",
        isGold ? "bg-amber-50/50 border-amber-100" : "bg-slate-50 border-slate-100"
      )}>
        <span className={cn("text-2xl font-black tracking-tighter", rankColor)}>{user.points.toLocaleString()}</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Points</span>
      </div>
    </motion.div>
  );
}

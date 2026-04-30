import { Building2, Users, Target, Award, Globe, BookOpen } from "lucide-react";
import AvatarInitials from "@/components/avatar-initials";
import StatCard from "@/components/stat-card";

const leadership = [
  { name: "Dr. Amanda Lorenz", role: "Founder & CEO", bio: "Former university dean with 20+ years of experience in vocational education." },
  { name: "Marcus Chen", role: "Chief Academic Officer", bio: "Curriculum design expert focused on aligning education with industry needs." },
  { name: "Sarah Jenkins", role: "Head of Technology Programs", bio: "Ex-FAANG engineer passionate about bringing cutting-edge tech to students." },
  { name: "James Wilson", role: "Head of Healthcare Programs", bio: "Registered nurse and administrator with a focus on operational excellence." },
  { name: "Priya Patel", role: "Director of Admissions", bio: "Dedicated to making education accessible and equitable for all applicants." },
  { name: "David Kim", role: "Director of Career Services", bio: "Connecting our graduates with top employers around the globe." }
];

export default function AboutPage() {
  return (
    <div className="w-full bg-white pb-24">
      {/* Header */}
      <section className="bg-slate-50 py-20 border-b border-card-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Empowering the next generation of professionals.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              At LISTA, we believe that practical, skills-based education is the key to unlocking human potential and driving economic growth.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">Our Story</h2>
              <p>
                Founded in 2010 by Dr. Amanda Lorenz, the Lorenz International Skills Training Academy (LISTA) began with a simple premise: traditional education often leaves a gap between what students learn and what employers actually need.
              </p>
              <p>
                We set out to bridge that gap by partnering directly with industry leaders to design intensive, hands-on training programs. What started as a small technology bootcamp has grown into a comprehensive academy offering courses in healthcare, business, design, and marketing.
              </p>
              <p>
                Today, LISTA is proud to have graduated over 15,000 students who now work at some of the world's most innovative companies. Our commitment remains the same: practical skills, expert instruction, and unwavering support for our students' success.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="aspect-square rounded-2xl bg-slate-100 p-8 flex flex-col justify-center items-center text-center space-y-4">
                  <Target className="w-12 h-12 text-primary" />
                  <h3 className="font-bold text-lg">Mission</h3>
                  <p className="text-sm text-muted-foreground">To provide accessible, high-quality skills training that transforms careers.</p>
               </div>
               <div className="aspect-square rounded-2xl bg-slate-100 p-8 flex flex-col justify-center items-center text-center space-y-4 translate-y-8">
                  <Globe className="w-12 h-12 text-primary" />
                  <h3 className="font-bold text-lg">Vision</h3>
                  <p className="text-sm text-muted-foreground">A world where anyone can acquire the skills needed to thrive in the modern economy.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-primary-foreground/20">
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black mb-2">14+</div>
              <div className="text-primary-foreground/80 font-medium">Years Operating</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black mb-2">15k</div>
              <div className="text-primary-foreground/80 font-medium">Alumni</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black mb-2">92%</div>
              <div className="text-primary-foreground/80 font-medium">Employment Rate</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black mb-2">200+</div>
              <div className="text-primary-foreground/80 font-medium">Partner Companies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our Leadership Team</h2>
            <p className="text-lg text-muted-foreground">
              Guided by experts in education, technology, and industry.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {leadership.map((person, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="mb-6 overflow-hidden rounded-full p-1 border-2 border-transparent group-hover:border-primary transition-colors">
                   <AvatarInitials name={person.name} size="lg" className="w-32 h-32 text-3xl" />
                </div>
                <h3 className="text-xl font-bold mb-1">{person.name}</h3>
                <p className="text-primary font-medium mb-4">{person.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditations */}
      <section className="py-16 bg-slate-50 border-t border-card-border">
        <div className="container mx-auto px-4 md:px-6 text-center">
           <h2 className="text-2xl font-bold tracking-tight mb-12">Accreditations & Memberships</h2>
           <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
              <div className="flex items-center gap-3 font-bold text-xl"><Award className="w-8 h-8"/> NVTC Accredited</div>
              <div className="flex items-center gap-3 font-bold text-xl"><BookOpen className="w-8 h-8"/> Dept. of Education</div>
              <div className="flex items-center gap-3 font-bold text-xl"><Users className="w-8 h-8"/> Global Skills Alliance</div>
              <div className="flex items-center gap-3 font-bold text-xl"><Building2 className="w-8 h-8"/> Tech Industry Board</div>
           </div>
        </div>
      </section>
    </div>
  );
}

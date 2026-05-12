import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, ShieldCheck, Zap } from "lucide-react";
import PrimaryButton from "./primary-button";
import { withBase } from "@/lib/with-base";

const premiumCourses = [
  {
    id: "pc1",
    title: "Advanced Web Development & React",
    category: "Software Engineering",
    duration: "12 Weeks",
    rating: 4.9,
    price: "₱15,000",
    description: "Master modern web development using React, Next.js, and TypeScript. Build enterprise-grade applications.",
    icon: Zap,
    isHot: true,
  },
  {
    id: "pc2",
    title: "Cybersecurity Essentials",
    category: "Information Security",
    duration: "8 Weeks",
    rating: 4.8,
    price: "₱12,500",
    description: "Learn to defend against cyber threats. Covers ethical hacking, network security, and risk management.",
    icon: ShieldCheck,
  },
  {
    id: "pc3",
    title: "Digital Marketing Masterclass",
    category: "Business",
    duration: "6 Weeks",
    rating: 4.7,
    price: "₱8,000",
    description: "Comprehensive training in SEO, social media marketing, and data-driven ad campaigns.",
    icon: Star,
  }
];

export default function PremiumCourses() {
  return (
    <section className="py-24 bg-white border-y border-slate-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              Premium Programs
            </h2>
            <p className="text-lg text-slate-600">
              Accelerate your career with our paid, intensive bootcamps taught by industry experts.
            </p>
          </div>
          <PrimaryButton variant="outline" className="text-slate-900 border-slate-300 hover:bg-slate-50 shrink-0">
            Explore Premium Courses <ArrowRight className="ml-2 h-4 w-4" />
          </PrimaryButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {premiumCourses.map((course, i) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group flex flex-col bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-8 transition-all hover:shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                    <Icon className="w-6 h-6 text-slate-700" strokeWidth={1.5} />
                  </div>
                  {course.isHot && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-wider border border-slate-200">
                      Popular
                    </span>
                  )}
                </div>

                <div className="space-y-3 flex-1 mb-6">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {course.category}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-slate-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-extrabold text-slate-900">
                      {course.price}
                    </div>
                    <PrimaryButton className="bg-slate-900 hover:bg-slate-800 text-white px-6">
                      Enroll
                    </PrimaryButton>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


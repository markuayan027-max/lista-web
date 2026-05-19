import { Link, useLocation } from "wouter";
import { Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Youtube } from "lucide-react";
import SiteLogo from "@/components/site-logo";
import { contactInfo, schoolInfo } from "@/lib/institutional-data";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const [location] = useLocation();

  const menuGroups = [
    {
      title: "Explore",
      links: [
        { label: "Home", href: "/" },
        { label: "About LISTA", href: "/about" },
        { label: "Training Courses", href: "/courses" },
        { label: "Scholarships", href: "/scholarships" },
        { label: "Competency Assessment", href: "/assessment" },
      ]
    },
    {
      title: "Quick Links",
      links: [
        { label: "Student Login", href: "/login" },
        { label: "Join the Academy", href: "/signup" },
        { label: "Course Schedule", href: "/courses" },
        { label: "Requirements", href: "/about" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ]
    }
  ];

  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="shrink-0 p-1 rounded-lg bg-slate-50 group-hover:bg-primary/5 transition-colors">
                <SiteLogo className="h-12 w-auto object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter leading-none">LISTA</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Academy</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Empowering generations through world-class technical training and innovative education. We bridge the gap between classroom learning and real-world success.
            </p>
            <div className="flex items-center gap-3 mt-4">

              <a href={contactInfo.youtube} target="_blank" rel="noopener noreferrer" className="h-11 w-11 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(255,0,0,0.12)] hover:border-[#FF0000]/20 hover:-translate-y-1 transition-all duration-300 group">
                <Youtube className="h-[22px] w-[22px] text-[#FF0000] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              </a>
              <a href="#" className="h-11 w-11 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(10,102,194,0.12)] hover:border-[#0A66C2]/20 hover:-translate-y-1 transition-all duration-300 group">
                <Linkedin className="h-[22px] w-[22px] text-[#0A66C2] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              </a>
              <a href="#" className="h-11 w-11 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(228,64,95,0.12)] hover:border-[#E4405F]/20 hover:-translate-y-1 transition-all duration-300 group">
                <Instagram className="h-[22px] w-[22px] text-[#E4405F] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Menu Columns */}
          {menuGroups.map((group, idx) => (
            <div key={idx} className="lg:col-span-2">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-foreground">{group.title}</h4>
              <ul className="space-y-4">
                {group.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-foreground">Get in Touch</h4>
            <div className="space-y-5">
              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-center shrink-0 group-hover:border-slate-200 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                  <MapPin className="h-[20px] w-[20px] text-slate-400 group-hover:text-slate-800 transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pt-2.5 group-hover:text-slate-700 transition-colors">
                  {contactInfo.mainAddress}
                </p>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-center shrink-0 group-hover:border-slate-200 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                  <Mail className="h-[20px] w-[20px] text-slate-400 group-hover:text-slate-800 transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <a href={`mailto:${contactInfo.email}`} className="text-sm text-muted-foreground hover:text-slate-900 transition-colors font-medium">
                  {contactInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-center shrink-0 group-hover:border-slate-200 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                  <Phone className="h-[20px] w-[20px] text-slate-400 group-hover:text-slate-800 transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <a href={`tel:${contactInfo.mobile1}`} className="text-sm text-muted-foreground hover:text-slate-900 transition-colors font-medium">
                  {contactInfo.telephone} / {contactInfo.mobile1}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-muted-foreground font-medium">
            <p>&copy; {currentYear} {schoolInfo.fullName}</p>
            <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300" />
            <p className="flex items-center gap-1">
              Officially Accredited by <span className="text-primary font-bold">TESDA</span> & <span className="text-primary font-bold">DepEd</span>
            </p>
          </div>
          <div className="flex items-center gap-6">
          </div>
        </div>
      </div>
    </footer>
  );
}


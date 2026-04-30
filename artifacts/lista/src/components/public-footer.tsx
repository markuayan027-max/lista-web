import { Link } from "wouter";
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-card-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tighter">LISTA</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Lorenz International Skills Training Academy provides world-class vocational training and professional development.
            </p>
            <div className="p-4 bg-muted/50 rounded-xl border border-card-border/50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Accreditation</p>
              <p className="text-xs text-muted-foreground leading-snug">
                Fully accredited by the National Vocational Training Council and Global Skills Alliance.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Programs</h4>
            <ul className="space-y-4">
              {["Technology", "Healthcare", "Business", "Design", "Marketing"].map((item) => (
                <li key={item}>
                  <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4">
              {["Scholarships", "Assessment", "Success Stories", "About Us", "FAQs"].map((item) => (
                <li key={item}>
                  <Link href={item === "Scholarships" ? "/scholarships" : item === "Assessment" ? "/assessment" : "/about"} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">
                  123 Academy Blvd, Suite 100<br />
                  Metro City, MC 54321
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:info@lista.edu" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  info@lista.edu
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href="tel:+1234567890" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-card-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-muted-foreground font-medium">
            &copy; {currentYear} Lorenz International Skills Training Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

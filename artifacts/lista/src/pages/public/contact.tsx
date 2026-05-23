import { Mail, MapPin, Phone, Clock, Youtube } from "lucide-react";
import { Link } from "wouter";
import PrimaryButton from "@/components/primary-button";
import { contactInfo, schoolInfo } from "@/lib/institutional-data";
import { getPublicEnrollHref } from "@/lib/enroll-entry";

export default function ContactPage() {
  return (
    <div className="w-full bg-white pb-24">
      <section className="bg-slate-50 py-20 border-b border-card-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto md:mx-0 text-center md:text-left">
            <h1 className="font-display text-[clamp(2rem,7vw,3.75rem)] font-semibold tracking-tight mb-6 text-balance">
              Contact LISTA
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Reach {schoolInfo.shortName} for admissions, scholarships, and training inquiries. Our team responds
              during office hours listed below.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <ContactRow
                icon={MapPin}
                label="Main campus"
                value={contactInfo.mainAddress}
              />
              <ContactRow
                icon={MapPin}
                label="Alternate campus"
                value={contactInfo.altAddress}
              />
              <ContactRow icon={Phone} label="Telephone" value={contactInfo.telephone} href={`tel:${contactInfo.telephone}`} />
              <ContactRow icon={Phone} label="Mobile" value={contactInfo.mobile1} href={`tel:${contactInfo.mobile1}`} />
              <ContactRow
                icon={Mail}
                label="Email"
                value={contactInfo.email}
                href={`mailto:${contactInfo.email}`}
              />
              <ContactRow icon={Clock} label="Office hours" value={contactInfo.officeHours} />
              <a
                href={contactInfo.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-indigo hover:underline"
              >
                <Youtube className="h-5 w-5" />
                Watch on YouTube
              </a>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-10 md:p-12 space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Next steps</h2>
              <p className="text-muted-foreground leading-relaxed">
                For enrollment requirements and document checklists, see the admissions page. Trainees sign in to
                complete their TESDA profile and course application online.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/admissions">
                  <PrimaryButton variant="outline" className="w-full sm:w-auto rounded-full">
                    Admissions guide
                  </PrimaryButton>
                </Link>
                <Link href={getPublicEnrollHref()}>
                  <PrimaryButton className="w-full sm:w-auto rounded-full">Sign in to enroll</PrimaryButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <p className="text-base md:text-lg font-semibold text-foreground leading-snug text-pretty">{value}</p>
  );
  return (
    <div className="flex gap-4 items-start">
      <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        {href ? (
          <a href={href} className="hover:text-primary-indigo transition-colors">
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

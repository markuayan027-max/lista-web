import { Building2, Users, Target, Award, Globe, BookOpen, FileCheck, Eye } from "lucide-react";
import AvatarInitials from "@/components/avatar-initials";
import { leadership, officialDocuments } from "@/lib/institutional-data";
import OptimizedImage from "@/components/optimized-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PARTNER_LOGOS_HOME } from "@/lib/image-assets";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  return (
    <div className="w-full bg-white pb-24">
      {/* Header */}
      <section className="bg-slate-50 py-20 border-b border-card-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Welcome to LISTA
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We provide high-quality technical skills training to help you succeed in your career and build a brighter future.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5 space-y-8 text-lg text-muted-foreground leading-relaxed">
              <div className="space-y-4">
                <div className="relative pl-6 mb-8">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-blue-400 to-transparent rounded-full" />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">Our Story</span>
              </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1]">Our Story</h2>
              </div>
              <p className="text-xl text-foreground font-medium border-l-4 border-primary pl-6 py-2 bg-slate-50/50 rounded-r-2xl">
                Growing from a family vision into a trusted technical school in Northern Mindanao.
              </p>
              <p>
                Started in 2014, LISTA was built to give the people of Gingoog City easy access to great education. We began as a small training center and have now become a nationally recognized school.
              </p>
              <p>
                We focus on teaching practical skills in <strong>Agriculture</strong>, <strong>Automotive</strong>, and <strong>Construction</strong>. We make sure what you learn is exactly what employers need today.
              </p>
              <p>
                Today, as an accredited TESDA Assessment Center, we are proud to help our students not just learn, but to find good jobs and succeed in life.
              </p>
            </div>
            
            <div className="lg:col-span-7">
               {/* A4 Carousel for Mission & Vision */}
               <div className="relative group w-full max-w-full sm:max-w-[595px] mx-auto aspect-[1/1.414] bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] rounded-sm border border-slate-100 overflow-hidden flex flex-col">
                 {/* Decorative background for the 'A4' sheet */}
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                 
                 <Carousel
                   opts={{
                     align: "start",
                     loop: true,
                   }}
                   className="flex-1 flex flex-col"
                 >
                   <CarouselContent className="flex-1">
                     {/* Mission Slide */}
                     <CarouselItem className="h-full">
                       <div className="h-full flex flex-col items-center justify-center p-12 md:p-20 text-center space-y-12">
                         <div className="shrink-0 w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 animate-in fade-in zoom-in duration-700">
                           <Target className="w-12 h-12 text-white" />
                         </div>
                         <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">
                           <h3 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase">Our Mission</h3>
                           <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
                           <p className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground leading-tight font-serif italic font-medium px-4">
                             "To give everyone the best technical training and education so they can succeed in their careers."
                           </p>
                         </div>
                       </div>
                     </CarouselItem>

                     {/* Vision Slide */}
                     <CarouselItem className="h-full">
                       <div className="h-full flex flex-col items-center justify-center p-12 md:p-20 text-center space-y-12">
                         <div className="shrink-0 w-24 h-24 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xl animate-in fade-in zoom-in duration-700">
                           <Globe className="w-12 h-12 text-primary" />
                         </div>
                         <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">
                           <h3 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase">Our Vision</h3>
                           <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
                           <p className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground leading-tight font-serif italic font-medium px-4">
                             "To be the best training center where skills are tested fairly and accurately."
                           </p>
                         </div>
                       </div>
                     </CarouselItem>
                   </CarouselContent>
                   
                   {/* Navigation Dots/Indicator */}
                   <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-primary/20 group-hover:bg-primary/40 transition-colors" />
                     <div className="w-3 h-3 rounded-full bg-primary" />
                   </div>

                   <CarouselPrevious className="left-2 sm:left-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm border-slate-200 min-h-11 min-w-11" />
                   <CarouselNext className="right-2 sm:right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm border-slate-200 min-h-11 min-w-11" />
                 </Carousel>

                 {/* A4 Sheet Footer decoration */}
                 <div className="h-2 w-full bg-slate-50 border-t border-slate-100" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-slate-50 relative overflow-hidden border-y border-slate-100">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 lg:divide-x lg:divide-slate-200">
            <div className="text-center px-4 space-y-2">
              <div className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">10+</div>
              <div className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">Years Operating</div>
            </div>
            <div className="text-center px-4 space-y-2">
              <div className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">1.5k</div>
              <div className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">Target Certifications</div>
            </div>
            <div className="text-center px-4 space-y-2">
              <div className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">75%</div>
              <div className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">Employment Rate</div>
            </div>
            <div className="text-center px-4 space-y-2">
              <div className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">4+</div>
              <div className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] text-pretty">National Accreditations</div>
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
                <div className="mb-6 relative group/avatar">
                   <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                   <div className="relative overflow-hidden rounded-full p-1 border-2 border-slate-100 group-hover:border-primary transition-all duration-500 scale-100 group-hover:scale-105">
                      {person.image ? (
                        <OptimizedImage
                          src={person.image}
                          alt={person.name}
                          imgClassName="w-32 h-32 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                      ) : (
                        <AvatarInitials name={person.name} size="lg" className="w-32 h-32 text-3xl" />
                      )}
                   </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{person.name}</h3>
                <p className="text-primary font-medium mb-4">{person.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Updated on 2026-05-01: Replaced placeholder icons with official logos and added missing primary partners (TESDA, ATI) */}
      {/* Accreditations */}
      <section className="py-20 bg-slate-50 border-t border-card-border">
        <div className="container mx-auto px-4 md:px-6 text-center">
           <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-16">Officially Accredited & Recognized By</h2>
           <ul className="mx-auto grid w-full max-w-5xl list-none grid-cols-2 gap-x-8 gap-y-12 p-0 lg:grid-cols-4 lg:gap-x-10 opacity-80">
              {PARTNER_LOGOS_HOME.map(({ src, alt, label, fullLabel, wide }) => (
                <li key={label} className="flex justify-center">
                  <figure className="flex w-full max-w-[11.5rem] flex-col items-center group">
                    <div
                      className={cn(
                        "mb-4 flex shrink-0 items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500",
                        wide
                          ? "h-12 w-[9.75rem] sm:h-14 sm:w-[11rem]"
                          : "size-[5.5rem] sm:size-28",
                      )}
                      aria-hidden
                    >
                      <OptimizedImage
                        src={src}
                        alt={alt}
                        width={wide ? 176 : 112}
                        height={wide ? 56 : 112}
                        imgClassName="max-h-full max-w-full object-contain object-center"
                        objectFit="contain"
                      />
                    </div>
                    <figcaption
                      className={cn(
                        "flex w-full flex-col items-center text-center",
                        fullLabel ? "min-h-[4.5rem] gap-1.5" : "min-h-[1.25rem]",
                      )}
                    >
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                      {fullLabel ? (
                        <p className="text-[11px] font-medium leading-snug text-pretty text-muted-foreground line-clamp-3">
                          {fullLabel}
                        </p>
                      ) : null}
                    </figcaption>
                  </figure>
                </li>
              ))}
           </ul>
        </div>
      </section>

      {/* Official Documents Gallery with Carousel */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Legal & Certifications</h2>
              <p className="text-lg text-muted-foreground">
                We maintain full transparency with our community. Scroll through our official credentials and click to view in high resolution.
              </p>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold bg-primary/5 px-4 py-2 rounded-full text-sm">
              <FileCheck className="w-4 h-4" />
              Verified Institutional Documents
            </div>
          </div>

          <div className="px-4 md:px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {officialDocuments.map((doc) => (
                  <CarouselItem key={doc.id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="group cursor-pointer p-1">
                          <div className="relative aspect-[1/1.41] overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50 shadow-sm group-hover:shadow-xl group-hover:border-primary/20 transition-all duration-500">
                            {/* Placeholder background pattern */}
                            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
                            
                            {/* Document Preview Image */}
                            <OptimizedImage
                              src={doc.image}
                              alt={doc.title}
                              imgClassName="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-white text-center backdrop-blur-[2px]">
                              <Eye className="w-10 h-10 mb-4 scale-50 group-hover:scale-100 transition-transform duration-500" />
                              <span className="font-bold text-sm tracking-widest uppercase">View Full Document</span>
                            </div>

                            {/* Badge */}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary tracking-tighter uppercase shadow-sm">
                              {doc.category}
                            </div>
                          </div>
                          <div className="mt-6 space-y-1">
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm md:text-base truncate">{doc.title}</h3>
                            <p className="text-xs text-muted-foreground font-medium">{doc.issuedBy}</p>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none bg-transparent shadow-none">
                        <DialogHeader className="sr-only">
                          <DialogTitle>{doc.title}</DialogTitle>
                          <DialogDescription>{doc.description}</DialogDescription>
                        </DialogHeader>
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                          <OptimizedImage
                            src={doc.image}
                            alt={doc.title}
                            imgClassName="max-w-full max-h-[85vh] w-auto h-auto rounded-lg shadow-2xl ring-4 ring-white/10 select-none"
                            onContextMenu={(e) => e.preventDefault()}
                          />
                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
                             <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white flex flex-col items-center">
                                <span className="text-sm font-bold">{doc.title}</span>
                                <span className="text-[10px] opacity-70 uppercase tracking-widest">{doc.issuedBy}</span>
                             </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="flex -left-2 sm:-left-12 min-h-11 min-w-11" />
              <CarouselNext className="flex -right-2 sm:-right-12 min-h-11 min-w-11" />
            </Carousel>
          </div>
        </div>
      </section>
    </div>
  );
}

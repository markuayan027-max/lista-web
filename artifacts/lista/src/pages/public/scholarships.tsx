import { useState } from "react";
import { Award, Calendar, DollarSign, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import PrimaryButton from "@/components/primary-button";
import ModalSuccess from "@/components/modal-success";

const scholarships = [
  {
    id: "s1",
    title: "Women in Tech Scholarship",
    description: "Designed to encourage and support women pursuing careers in software engineering, data science, and cybersecurity.",
    amount: "$2,500",
    deadline: "Dec 15, 2025",
    eligibility: [
      "Identify as a woman",
      "Enrolling in any Technology or Data program",
      "Demonstrate financial need"
    ]
  },
  {
    id: "s2",
    title: "Community Impact Grant",
    description: "For individuals who have demonstrated a strong commitment to community service and intend to use their new skills for social good.",
    amount: "$1,500",
    deadline: "Nov 30, 2025",
    eligibility: [
      "Proof of community service or volunteer work",
      "Short essay on planned impact",
      "Open to all programs"
    ]
  },
  {
    id: "s3",
    title: "Industry Excellence Award",
    description: "A merit-based scholarship for applicants with exceptional academic backgrounds or proven potential in their chosen field.",
    amount: "Full Tuition",
    deadline: "Jan 10, 2026",
    eligibility: [
      "Outstanding academic or professional record",
      "Letter of recommendation",
      "Available for Business and Healthcare programs"
    ]
  }
];

export default function ScholarshipsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<string | null>(null);

  const handleApply = (title: string) => {
    setSelectedScholarship(title);
    setModalOpen(true);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-8 backdrop-blur-sm">
             <Award className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Scholarships & Financial Aid
          </h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed">
            We believe that financial barriers should never stand in the way of your education. Explore our scholarship opportunities to help fund your journey.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="py-20 -mt-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scholarships.map((scholarship) => (
              <Card key={scholarship.id} className="border-card-border shadow-sm hover:shadow-md transition-shadow flex flex-col relative z-10 bg-white">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{scholarship.title}</CardTitle>
                  <CardDescription className="text-base mt-2">{scholarship.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-6">
                  <div className="flex gap-4 mb-6 pt-4 border-t border-card-border">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Award</p>
                      <p className="font-bold text-emerald-600 flex items-center gap-1">
                         {scholarship.amount}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Deadline</p>
                      <p className="font-bold flex items-center gap-1">
                         {scholarship.deadline}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-foreground">Eligibility requirements:</p>
                    <ul className="space-y-2">
                      {scholarship.eligibility.map((req, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <PrimaryButton 
                    className="w-full group" 
                    onClick={() => handleApply(scholarship.title)}
                  >
                    Apply for scholarship
                    <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </PrimaryButton>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 border border-card-border text-center space-y-6">
             <h2 className="text-2xl font-bold tracking-tight">Need help navigating financial aid?</h2>
             <p className="text-muted-foreground text-lg">Our admissions team is here to help you understand your options, including payment plans and student loans.</p>
             <a href="mailto:financialaid@lista.edu" className="inline-block text-primary font-bold hover:underline">Contact Financial Aid Office →</a>
          </div>
        </div>
      </section>

      <ModalSuccess
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Application Started"
        description={`You've initiated the application process for the ${selectedScholarship}. A detailed application form has been sent to your email.`}
      />
    </div>
  );
}

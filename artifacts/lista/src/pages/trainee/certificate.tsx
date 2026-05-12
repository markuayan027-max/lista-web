import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { certificates, courses } from "@/lib/institutional-data";
import StatusBadge from "@/components/status-badge";
import { Download, Eye, Award } from "lucide-react";
import { format } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function TraineeCertificatePage() {
  const { user } = useAuth();
  const myCerts = certificates.filter(c => c.userId === user?.id) || certificates;
  const [previewCert, setPreviewCert] = useState<any>(null);

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
        <p className="text-muted-foreground mt-1">View and download your earned credentials.</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {myCerts.map((cert) => {
          const course = courses.find(c => c.slug === cert.courseSlug);
          const isIssued = cert.status === "issued";

          return (
            <motion.div key={cert.id} variants={item}>
              <Card className={`overflow-hidden border-card-border h-full flex flex-col ${!isIssued ? 'opacity-70 grayscale-[0.2]' : ''}`}>
                <div className={`h-32 flex items-center justify-center ${isIssued ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Award className="h-16 w-16" />
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4 gap-2">
                    <h3 className="font-bold text-lg leading-tight">{course?.title}</h3>
                    <StatusBadge status={cert.status as any} />
                  </div>
                  
                  {isIssued && cert.issuedAt && (
                    <p className="text-sm text-muted-foreground mb-6">
                      Issued on {format(new Date(cert.issuedAt), "MMM dd, yyyy")}
                    </p>
                  )}
                  
                  {!isIssued && (
                    <p className="text-sm text-muted-foreground mb-6">
                      Complete all course requirements to earn this certificate.
                    </p>
                  )}

                  <div className="mt-auto flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 font-semibold"
                      onClick={() => setPreviewCert({ cert, course })}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                    {isIssued && (
                      <Button className="flex-1 font-semibold">
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Preview Dialog */}
      <Dialog open={!!previewCert} onOpenChange={(open) => !open && setPreviewCert(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white border-8 border-double border-muted">
          {previewCert && (
            <div className="p-12 text-center relative border-4 border-primary/20 m-2">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary m-4" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary m-4" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary m-4" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary m-4" />
              
              <div className="w-24 h-24 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-8 shadow-xl">
                <Award className="h-12 w-12" />
              </div>
              
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Lorenz International Skills Training Academy
              </h2>
              
              <h1 className="text-4xl font-serif text-primary mb-8 font-bold">
                Certificate of Completion
              </h1>
              
              <p className="text-muted-foreground mb-4">This is to certify that</p>
              
              <p className="text-3xl font-bold border-b border-muted-foreground pb-2 inline-block min-w-[300px] mb-8">
                {user?.name || "Trainee"}
              </p>
              
              <p className="text-muted-foreground mb-4">has successfully completed the course</p>
              
              <p className="text-2xl font-bold text-foreground mb-12">
                {previewCert.course?.title}
              </p>
              
              <div className="flex justify-center gap-24 text-sm font-medium">
                <div className="text-center">
                  <div className="border-b border-foreground w-40 pb-2 mb-2">
                    {previewCert.cert.issuedAt ? format(new Date(previewCert.cert.issuedAt), "MMMM dd, yyyy") : "Pending"}
                  </div>
                  <p className="text-muted-foreground">Date Issued</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-foreground w-40 pb-2 mb-2 font-serif italic text-lg">
                    Admin Signature
                  </div>
                  <p className="text-muted-foreground">Academy Director</p>
                </div>
              </div>
              
              {previewCert.cert.status !== "issued" && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center flex-col z-10">
                  <div className="bg-white p-6 rounded-xl border border-card-border shadow-xl max-w-sm">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">Not Yet Issued</h3>
                    <p className="text-sm text-muted-foreground">This is a preview. Your certificate will be issued once you complete all course requirements.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

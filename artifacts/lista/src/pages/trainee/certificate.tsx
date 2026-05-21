import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCourses, useTraineeDerivedCertificates } from "@/hooks/use-lista-data";
import { courseTitleBySlug, type ListaCertificate } from "@/lib/lista-insforge-data";
import { Info, Award, Calendar } from "lucide-react";
import { format } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
};

type PreviewRow = { cert: ListaCertificate; courseTitle: string };

export default function TraineeCertificatePage() {
  const { user } = useAuth();
  const { data: myCerts = [] } = useTraineeDerivedCertificates(user?.email);
  const { data: courses = [] } = useCourses();
  const [preview, setPreview] = useState<PreviewRow | null>(null);

  return (
    <div className="space-y-6 sm:space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Completions & credentials</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
          A short history of programs you finished at LISTA. Official TESDA National Certificates (NC) are emailed by TESDA to your Gmail—they do not download here.
        </p>
      </motion.div>

      <Alert className="border-blue-200 bg-blue-50/90 dark:bg-blue-950/30 dark:border-blue-900">
        <Info className="h-4 w-4 text-blue-700 dark:text-blue-400" aria-hidden />
        <AlertTitle className="text-blue-950 dark:text-blue-100">TESDA NC certificates</AlertTitle>
        <AlertDescription className="text-blue-900/90 dark:text-blue-100/85 text-sm leading-relaxed">
          LISTA marks course completion below for your records. Watch the Gmail you used at registration for official documents from TESDA.
          After staff marks your enrollment completed, you can register or apply again when new batches open.
        </AlertDescription>
      </Alert>

      {myCerts.length === 0 ? (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center space-y-3"
        >
          <Award className="h-10 w-10 text-muted-foreground mx-auto" aria-hidden />
          <h2 className="font-semibold text-lg">No completed programs yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Completed courses appear here once staff sets your enrollment status to completed. Until then, use My Applications and Courses.
          </p>
        </motion.section>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {myCerts.map((cert) => {
            const courseTitle = courseTitleBySlug(courses, cert.courseSlug);
            const ended = cert.issuedAt ? format(new Date(cert.issuedAt), "MMM d, yyyy") : "—";

            return (
              <motion.div key={cert.id} variants={item}>
                <Card className="h-full border-card-border flex flex-col overflow-hidden shadow-sm">
                  <CardContent className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Award className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="font-bold text-base leading-snug">{courseTitle}</h3>
                        <p className="text-xs text-muted-foreground">
                          NC {cert.ncLevel.replace(/^NC\s*/i, "")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span>Recorded completed {ended}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cert.progressStage === "passed"
                        ? "TESDA NC marked sent — check your Gmail for the official document from TESDA."
                        : "Awaiting staff to mark TESDA NC sent. Official NC is emailed by TESDA, not downloaded here."}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-auto w-full sm:w-auto"
                      onClick={() => setPreview({ cert, courseTitle })}
                    >
                      View summary
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-md">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle>Completion summary</DialogTitle>
              </DialogHeader>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground font-medium">Trainee</dt>
                  <dd className="font-semibold">{user?.name || "Trainee"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">Program</dt>
                  <dd className="font-semibold">{preview.courseTitle}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">NC level</dt>
                  <dd>{preview.cert.ncLevel}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">LISTA completion recorded</dt>
                  <dd>
                    {preview.cert.issuedAt
                      ? format(new Date(preview.cert.issuedAt), "MMMM d, yyyy")
                      : "—"}
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                This summary is not an NC certificate. TESDA issues official credentials by email.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

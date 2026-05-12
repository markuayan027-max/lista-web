import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { enrollments, courses } from "@/lib/institutional-data";
import StatusBadge from "@/components/status-badge";
import { CheckCircle2, Circle, FileText, Check, MessageSquare, GraduationCap } from "lucide-react";
import { format } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function TraineeApplicationPage() {
  const { user } = useAuth();
  const myEnrollment = enrollments.find(e => e.traineeEmail === user?.email) || enrollments[0];
  const myCourse = courses.find(c => c.slug === myEnrollment.courseSlug);
  
  // Mock timeline logic based on status
  const stages = [
    { title: "Submitted", desc: "Application received", icon: FileText, date: myEnrollment.createdAt },
    { title: "Document Review", desc: "Verifying prerequisites", icon: CheckCircle2, date: "Pending" },
    { title: "Interview", desc: "Initial assessment", icon: MessageSquare, date: "Pending" },
    { title: "Confirmed", desc: "Offer extended", icon: Check, date: "Pending" },
    { title: "Enrolled", desc: "Ready to start", icon: GraduationCap, date: "Pending" }
  ];
  
  let currentStageIndex = 0;
  if (myEnrollment.status === "confirmed") currentStageIndex = 3;
  if (myEnrollment.status === "rejected") currentStageIndex = 1; // arbitrary

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Application Status</h1>
        <p className="text-muted-foreground mt-1">Track your enrollment progress for {myCourse?.title}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="md:col-span-2 space-y-6"
        >
          <motion.div variants={item}>
            <Card className="border-card-border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Timeline</CardTitle>
                    <CardDescription>Reference: {myEnrollment.refNo}</CardDescription>
                  </div>
                  <StatusBadge status={myEnrollment.status as any} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8 pl-4 py-4 relative">
                  <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-muted" />
                  
                  {stages.map((stage, i) => {
                    const isCompleted = i < currentStageIndex;
                    const isCurrent = i === currentStageIndex;
                    const isUpcoming = i > currentStageIndex;
                    
                    return (
                      <div key={i} className="relative flex gap-6">
                        <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background ${
                          isCompleted ? 'border-primary text-primary' :
                          isCurrent ? 'border-primary bg-primary text-primary-foreground' :
                          'border-muted text-muted-foreground'
                        }`}>
                          <stage.icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col pb-2">
                          <h4 className={`text-sm font-semibold ${isUpcoming ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {stage.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">{stage.desc}</p>
                          {isCompleted && i === 0 && (
                            <p className="text-xs font-medium text-muted-foreground mt-1">
                              {format(new Date(stage.date), "MMM dd, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={item}>
            <Card className="border-card-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-card-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Resume.pdf</p>
                      <p className="text-xs text-muted-foreground">Uploaded {format(new Date(myEnrollment.createdAt), "MMM dd")}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-card-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">ID_Copy.jpg</p>
                      <p className="text-xs text-muted-foreground">Uploaded {format(new Date(myEnrollment.createdAt), "MMM dd")}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-card-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Staff Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  {myEnrollment.status === "pending" 
                    ? "Your application is currently under review. We will reach out if further documents are needed."
                    : myEnrollment.status === "confirmed" 
                    ? "Congratulations! Your application has been approved. Please check your email for next steps."
                    : "No notes at this time."}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Award, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/status-badge";
import PrimaryButton from "@/components/primary-button";
import { useToast } from "@/hooks/use-toast";
import { certificates as initialCertificates, courses, users } from "@/lib/institutional-data";
import { format } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function AdminCertificatesPage() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState(initialCertificates);
  
  const [form, setForm] = useState({ userId: "", courseSlug: "" });
  const trainees = users.filter(u => u.role === 'trainee');

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.courseSlug) {
      toast({ title: "Error", description: "Select trainee and course.", variant: "destructive" });
      return;
    }

    const course = courses.find(c => c.slug === form.courseSlug);
    const newCert = {
      id: `cert${Date.now()}`,
      userId: form.userId,
      courseSlug: form.courseSlug,
      ncLevel: course?.ncLevel ?? "NC II",
      status: "issued" as const,
      progressStage: "passed" as const,
      issuedAt: new Date().toISOString(),
      fileUrl: "#"
    };

    setCertificates([newCert, ...certificates]);
    setForm({ userId: "", courseSlug: "" });
    toast({
      title: "Certificate Issued",
      description: "Digital certificate has been generated successfully.",
    });
  };

  const handleRevoke = (id: string) => {
    setCertificates(certificates.map(c => c.id === id ? { ...c, status: "rejected" } : c));
    toast({
      title: "Certificate Revoked",
      description: "The certificate has been marked as invalid.",
      variant: "destructive"
    });
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
        <p className="text-muted-foreground text-sm mt-1">Issue and manage digital credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-card-border shadow-sm sticky top-6">
            <CardHeader>
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Issue New Certificate</CardTitle>
              <CardDescription>Generate a credential for course completion.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIssue} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold tracking-tight">Trainee</label>
                  <Select value={form.userId} onValueChange={(v) => setForm({...form, userId: v})}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select trainee" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainees.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold tracking-tight">Completed Course</label>
                  <Select value={form.courseSlug} onValueChange={(v) => setForm({...form, courseSlug: v})}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <PrimaryButton type="submit" className="w-full mt-2">
                  Issue Certificate
                </PrimaryButton>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-card-border shadow-sm overflow-hidden h-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-muted-foreground">Credential</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Trainee</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => {
                  const course = courses.find(c => c.slug === cert.courseSlug);
                  const trainee = users.find(u => u.id === cert.userId);
                  
                  return (
                    <TableRow key={cert.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-semibold">{course?.title || cert.courseSlug}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">ID: {cert.id.toUpperCase()}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {trainee?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cert.issuedAt ? format(new Date(cert.issuedAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={cert.status as any} />
                      </TableCell>
                      <TableCell className="text-right">
                        {cert.status === 'issued' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleRevoke(cert.id)}
                          >
                            <ShieldAlert className="h-4 w-4 mr-2" />
                            Revoke
                          </Button>
                        )}
                        {cert.status === 'rejected' && (
                          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">Revoked</span>
                        )}
                        {cert.status === 'in_progress' && (
                          <span className="text-xs text-muted-foreground">Pending completion</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

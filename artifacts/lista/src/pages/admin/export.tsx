import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileUp, FileText, Database, Users, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PrimaryButton from "@/components/primary-button";

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

const EXPORT_ENTITIES = [
  { id: "enrollments", title: "Enrollments Data", icon: Database, description: "Export student applications, statuses, and course choices." },
  { id: "users", title: "User Directory", icon: Users, description: "Export complete staff and trainee directory with roles." },
  { id: "schedules", title: "Master Schedule", icon: Calendar, description: "Export timetables, room allocations, and instructor assignments." },
  { id: "certificates", title: "Certificate Ledger", icon: FileText, description: "Export issued credentials for verification and audit." },
];

export default function AdminExportPage() {
  const { toast } = useToast();
  const [exportingId, setExportingId] = useState<string | null>(null);

  const handleExport = (id: string) => {
    setExportingId(id);
    
    // Simulate generation delay
    setTimeout(() => {
      setExportingId(null);
      toast({
        title: "Export Successful",
        description: "Your file has been downloaded successfully.",
      });
    }, 1200);
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="bg-primary text-primary-foreground p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileUp className="h-32 w-32" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">Data Export Center</h1>
          <p className="text-primary-foreground/80 mt-2 text-lg">
            Export institutional data for reporting, compliance, and audit purposes. Select an entity below to configure your export.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EXPORT_ENTITIES.map((entity) => {
          const Icon = entity.icon;
          const isExporting = exportingId === entity.id;

          return (
            <motion.div key={entity.id} variants={itemVariants}>
              <Card className="border-card-border shadow-sm h-full flex flex-col hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{entity.title}</CardTitle>
                      <CardDescription className="mt-1">{entity.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold tracking-tight uppercase text-muted-foreground">Start Date</label>
                      <Input type="date" className="bg-muted/30 h-9" defaultValue="2023-01-01" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold tracking-tight uppercase text-muted-foreground">End Date</label>
                      <Input type="date" className="bg-muted/30 h-9" defaultValue="2023-12-31" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-tight uppercase text-muted-foreground">Format</label>
                    <Select defaultValue="csv">
                      <SelectTrigger className="bg-muted/30 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                        <SelectItem value="pdf">PDF (Printable Report)</SelectItem>
                        <SelectItem value="json">JSON (Raw Data)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-card-border">
                  <Button 
                    className="w-full font-semibold" 
                    disabled={isExporting}
                    onClick={() => handleExport(entity.id)}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Export...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export {entity.title}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

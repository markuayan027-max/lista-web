import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Building2, Palette, Shield, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PrimaryButton from "@/components/primary-button";
import FormInputField from "@/components/form-input-field";
import {
  type SiteSettings,
  defaultSiteSettings,
  loadSiteSettings,
  saveSiteSettings,
} from "@/lib/public-data-utils";

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

const permissionsMatrix = [
  { module: "Enrollments", admin: true, staff: true, trainee: false },
  { module: "Schedules", admin: true, staff: true, trainee: true },
  { module: "Certificates", admin: true, staff: false, trainee: false },
  { module: "Announcements", admin: true, staff: true, trainee: false },
  { module: "System Settings", admin: true, staff: false, trainee: false },
];

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(() => defaultSiteSettings());

  useEffect(() => {
    setSettings(loadSiteSettings());
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      saveSiteSettings(settings);
      toast({
        title: "Settings saved",
        description: "Academy profile preferences are stored for this browser session.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      className="space-y-6 max-w-5xl"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage platform configuration and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-auto w-full justify-start overflow-x-auto hide-scrollbar flex-nowrap shrink-0">
          <TabsTrigger value="profile" className="rounded-lg px-4 py-2 font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Building2 className="h-4 w-4 mr-2" />
            Academy Profile
          </TabsTrigger>
          <TabsTrigger value="branding" className="rounded-lg px-4 py-2 font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Palette className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="permissions" className="rounded-lg px-4 py-2 font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4 mr-2" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-lg px-4 py-2 font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <LinkIcon className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="profile" className="m-0">
            <motion.div variants={itemVariants}>
              <Card className="border-card-border shadow-sm">
                <CardHeader>
                  <CardTitle>Institution Details</CardTitle>
                  <CardDescription>Public information displayed on certificates and portals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormInputField
                    label="Institution Name"
                    value={settings.institutionName}
                    onChange={(e) => setSettings((s) => ({ ...s, institutionName: e.target.value }))}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInputField label="Support Email" defaultValue="admin@lorenzinternational.org" type="email" />
                    <FormInputField label="Phone Number" defaultValue="09051095284" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold tracking-tight">Headquarters Address</label>
                    <Textarea defaultValue="FJY Bldg., National Highway, Brgy. 24-A, Gingoog City, Misamis Oriental 9014" className="resize-none border-card-border" />
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t border-card-border py-4 px-6 flex justify-end">
                  <PrimaryButton onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Profile
                  </PrimaryButton>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="branding" className="m-0">
            <motion.div variants={itemVariants}>
              <Card className="border-card-border shadow-sm">
                <CardHeader>
                  <CardTitle>Visual Identity</CardTitle>
                  <CardDescription>Customize how the platform looks for users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold tracking-tight block mb-2">Logo</label>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-sm">
                        LISTA
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">Upload New Logo</Button>
                        <p className="text-xs text-muted-foreground">Recommended: SVG or PNG, square, transparent background.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold tracking-tight">Primary Color</label>
                      <div className="flex gap-2">
                        <Input type="color" defaultValue="#0f172a" className="w-14 h-10 p-1 cursor-pointer" />
                        <Input defaultValue="#0f172a" className="font-mono text-sm bg-muted/30" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold tracking-tight">Accent Color</label>
                      <div className="flex gap-2">
                        <Input type="color" defaultValue="#3b82f6" className="w-14 h-10 p-1 cursor-pointer" />
                        <Input defaultValue="#3b82f6" className="font-mono text-sm bg-muted/30" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t border-card-border py-4 px-6 flex justify-end">
                  <PrimaryButton onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Branding
                  </PrimaryButton>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="permissions" className="m-0">
            <motion.div variants={itemVariants}>
              <Card className="border-card-border shadow-sm">
                <CardHeader>
                  <CardTitle>Access Control Matrix</CardTitle>
                  <CardDescription>Define which roles can access specific modules.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border-y border-card-border">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/30 text-muted-foreground">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Module</th>
                          <th className="px-6 py-3 font-semibold text-center">Administrator</th>
                          <th className="px-6 py-3 font-semibold text-center">Staff</th>
                          <th className="px-6 py-3 font-semibold text-center">Trainee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-card-border">
                        {permissionsMatrix.map((row) => (
                          <tr key={row.module} className="hover:bg-muted/10">
                            <td className="px-6 py-4 font-medium">{row.module}</td>
                            <td className="px-6 py-4 text-center">
                              <Checkbox checked={row.admin} disabled />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Checkbox defaultChecked={row.staff} />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Checkbox defaultChecked={row.trainee} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 py-4 px-6 flex justify-end">
                  <PrimaryButton onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Permissions
                  </PrimaryButton>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="integrations" className="m-0 space-y-4">
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-card-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Payment Gateway</CardTitle>
                  <CardDescription>Process course enrollments.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">Connected to Stripe</span>
                  </div>
                  <Button variant="outline" className="w-full font-semibold">Configure Settings</Button>
                </CardContent>
              </Card>

              <Card className="border-card-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Email Provider</CardTitle>
                  <CardDescription>Send transactional emails.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium text-amber-700">Action Required</span>
                  </div>
                  <Button className="w-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>Connect Provider</Button>
                </CardContent>
              </Card>

              <Card className="border-card-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Student Info System (SIS)</CardTitle>
                  <CardDescription>Sync grades and records.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    <span className="text-sm font-medium text-muted-foreground">Not Connected</span>
                  </div>
                  <Button className="w-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>Connect API</Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}

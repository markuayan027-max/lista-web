import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Megaphone, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import FormInputField from "@/components/form-input-field";
import PrimaryButton from "@/components/primary-button";
import { announcements as initialAnnouncements } from "@/lib/mock-data";
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

export default function AdminAnnouncementsPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", body: "", targetRole: "all" });

  const openNew = () => {
    setEditingId(null);
    setForm({ title: "", body: "", targetRole: "all" });
    setIsDialogOpen(true);
  };

  const openEdit = (announcement: typeof announcements[0]) => {
    setEditingId(announcement.id);
    setForm({ 
      title: announcement.title, 
      body: announcement.body, 
      targetRole: announcement.targetRole 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    toast({
      title: "Announcement Deleted",
      description: "The announcement has been removed.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.body) {
      toast({ title: "Validation Error", description: "Title and body are required.", variant: "destructive" });
      return;
    }

    if (editingId) {
      setAnnouncements(announcements.map(a => 
        a.id === editingId ? { ...a, ...form } : a
      ));
      toast({ title: "Announcement Updated" });
    } else {
      const newAnnouncement = {
        id: `a${Date.now()}`,
        title: form.title,
        body: form.body,
        targetRole: form.targetRole,
        createdAt: new Date().toISOString(),
        author: "Admin"
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      toast({ title: "Announcement Published" });
    }
    
    setIsDialogOpen(false);
  };

  const getTargetBadge = (target: string) => {
    switch(target) {
      case 'all': return <Badge className="bg-primary hover:bg-primary">All Users</Badge>;
      case 'staff': return <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">Staff Only</Badge>;
      case 'trainee': return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Trainees</Badge>;
      default: return <Badge>{target}</Badge>;
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground text-sm mt-1">Broadcast messages to the academy.</p>
        </div>
        
        <PrimaryButton className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" />
          New Announcement
        </PrimaryButton>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-card-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold text-muted-foreground w-1/3">Title</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Target</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Author</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Megaphone className="h-8 w-8 text-muted-foreground/50" />
                      <p>No announcements found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((announcement) => (
                  <TableRow key={announcement.id} className="group hover:bg-muted/30">
                    <TableCell>
                      <p className="font-semibold">{announcement.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1 max-w-md">{announcement.body}</p>
                    </TableCell>
                    <TableCell>
                      {getTargetBadge(announcement.targetRole)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {announcement.author}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(announcement.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(announcement)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(announcement.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </motion.div>

      {/* Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
              <DialogDescription>
                Publish a message to users.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormInputField
                label="Title"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="e.g. System Maintenance"
                required
              />
              
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold tracking-tight">Target Audience</label>
                <Select value={form.targetRole} onValueChange={(val) => setForm({...form, targetRole: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="trainee">Trainees Only</SelectItem>
                    <SelectItem value="staff">Staff Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-semibold tracking-tight">Message Body</label>
                <Textarea 
                  value={form.body}
                  onChange={(e) => setForm({...form, body: e.target.value})}
                  placeholder="Enter your message here..."
                  className="min-h-[120px] resize-none border-card-border focus-visible:ring-primary"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <PrimaryButton type="submit">{editingId ? 'Save Changes' : 'Publish'}</PrimaryButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}

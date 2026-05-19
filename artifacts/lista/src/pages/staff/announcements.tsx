import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import AnnouncementCard from "@/components/announcement-card";
import { useAnnouncements, useCreateAnnouncement } from "@/hooks/use-lista-data";

export default function StaffAnnouncementsPage() {
  const { toast } = useToast();
  const { data: announcements = [], isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const [isMobileComposerOpen, setIsMobileComposerOpen] = useState(false);

  const handlePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createAnnouncement.mutateAsync({
        title: formData.get("title") as string,
        body: formData.get("body") as string,
        targetRole: formData.get("targetRole") as string,
      });
      setIsMobileComposerOpen(false);
      e.currentTarget.reset();
      toast({
        title: "Announcement Posted",
        description: "Your message has been broadcasted successfully.",
      });
    } catch (err) {
      toast({
        title: "Post failed",
        description: err instanceof Error ? err.message : "Could not post announcement.",
        variant: "destructive",
      });
    }
  };

  const ComposerForm = () => (
    <form onSubmit={handlePost} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Title</label>
        <Input name="title" required placeholder="e.g. Campus Holiday Notice" className="bg-card" />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-semibold">Message</label>
        <Textarea 
          name="body" 
          required 
          placeholder="Type your announcement here..." 
          className="min-h-[150px] bg-card resize-none" 
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-semibold">Target Audience</label>
        <Select name="targetRole" required defaultValue="all">
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="Select audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            <SelectItem value="trainee">Trainees Only</SelectItem>
            <SelectItem value="staff">Staff Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button type="submit" className="w-full font-bold mt-2">
        <Send className="mr-2 h-4 w-4" /> Post Announcement
      </Button>
    </form>
  );

  return (
    <div className="space-y-8 h-full flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">Broadcast messages to trainees and staff.</p>
        </div>
        
        <div className="lg:hidden">
          <Dialog open={isMobileComposerOpen} onOpenChange={setIsMobileComposerOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold"><Plus className="mr-2 h-4 w-4" /> New Post</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compose Announcement</DialogTitle>
              </DialogHeader>
              <div className="pt-4">
                <ComposerForm />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 overflow-y-auto space-y-4 pr-2 pb-8"
        >
          {announcements.map(announcement => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block shrink-0"
        >
          <Card className="border-card-border shadow-sm sticky top-0">
            <CardHeader className="border-b border-card-border bg-muted/20">
              <CardTitle className="text-lg">Compose New Post</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ComposerForm />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

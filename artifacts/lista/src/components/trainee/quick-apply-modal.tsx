import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCourses, useQuickApplyTrainee } from "@/hooks/use-lista-data";
import { isCourseOpenForEnrollment } from "@/lib/public-data-utils";
import { useToast } from "@/hooks/use-toast";
import type { Enrollment } from "@/lib/institutional-data";

type QuickApplyModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<Enrollment> | null;
};

export default function QuickApplyModal({ open, onOpenChange, profile }: QuickApplyModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: courses = [] } = useCourses();
  const applyMutation = useQuickApplyTrainee();
  const [courseSlug, setCourseSlug] = useState("");

  const openCourses = courses.filter((c) => isCourseOpenForEnrollment(c));

  const handleSubmit = async () => {
    if (!user?.email || !courseSlug) return;
    try {
      await applyMutation.mutateAsync({ email: user.email, courseSlug });
      toast({
        title: "Application submitted",
        description: "Staff will review your course choice. You can track status anytime.",
      });
      onOpenChange(false);
      setCourseSlug("");
    } catch (err) {
      toast({
        title: "Could not apply",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Quick apply</DialogTitle>
          <DialogDescription>
            Your TESDA profile is already on file. Pick a course, review your details, and submit — no
            need to fill the registration wizard again.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm space-y-1">
          <p className="font-semibold text-foreground">
            {profile?.firstName} {profile?.lastName}
          </p>
          <p className="text-muted-foreground">{profile?.traineeEmail || user?.email}</p>
          <p className="text-muted-foreground">
            {profile?.city}, {profile?.province}
          </p>
        </div>

        <label className="text-sm font-semibold text-foreground" htmlFor="quick-apply-course">
          Course
        </label>
        <select
          id="quick-apply-course"
          className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm"
          value={courseSlug}
          onChange={(e) => setCourseSlug(e.target.value)}
        >
          <option value="">Select a program</option>
          {openCourses.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!courseSlug || applyMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            {applyMutation.isPending ? "Submitting…" : "Submit application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

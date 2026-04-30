import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import PrimaryButton from "./primary-button";
import { cn } from "@/lib/utils";

interface ModalSuccessProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  footer?: React.ReactNode;
}

export default function ModalSuccess({
  open,
  onOpenChange,
  title,
  description,
  footer,
}: ModalSuccessProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center p-8">
        <DialogHeader className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-emerald-100 p-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-6">
          {footer || (
            <PrimaryButton onClick={() => onOpenChange(false)} className="w-full sm:w-auto px-8">
              Continue
            </PrimaryButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useId, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { CourseBatchRow } from "@/lib/lista-insforge-data";
import { format } from "date-fns";

export type BatchPickerMode = "join" | "transfer";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: BatchPickerMode;
  batches: CourseBatchRow[];
  traineeName?: string;
  courseTitle?: string;
  loading?: boolean;
  onConfirm: (batchId: string) => void | Promise<void>;
};

export default function BatchPickerDialog({
  open,
  onOpenChange,
  mode,
  batches,
  traineeName,
  courseTitle,
  loading = false,
  onConfirm,
}: Props) {
  const titleId = useId();
  const descId = useId();
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (open && batches.length > 0) {
      setSelectedId(batches[0].id);
    }
  }, [open, batches]);

  const handleConfirm = async () => {
    if (!selectedId) return;
    await onConfirm(selectedId);
    onOpenChange(false);
  };

  const modeLabel = mode === "join" ? "Assign to batch" : "Transfer to batch";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <DialogHeader>
          <DialogTitle id={titleId}>{modeLabel}</DialogTitle>
          <DialogDescription id={descId}>
            {traineeName ? (
              <>
                Select an open batch for <strong>{traineeName}</strong>
                {courseTitle ? <> — {courseTitle}</> : null}. Only batches with available seats are listed.
              </>
            ) : (
              "Select an open batch with available seats."
            )}
          </DialogDescription>
        </DialogHeader>

        {batches.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2" role="status">
            No open batches with free seats for this course. Ask an administrator to create or open a batch.
          </p>
        ) : (
          <RadioGroup
            value={selectedId}
            onValueChange={setSelectedId}
            className="gap-2 max-h-[min(50vh,320px)] overflow-y-auto pr-1"
            aria-label="Available batches"
          >
            {batches.map((b) => {
              const seatsLeft = Math.max(0, b.capacity - (b.seatsTaken ?? 0));
              const inputId = `batch-${b.id}`;
              return (
                <div
                  key={b.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value={b.id} id={inputId} aria-describedby={`${inputId}-meta`} />
                  <Label htmlFor={inputId} className="flex-1 cursor-pointer font-normal">
                    <span className="font-semibold text-foreground">{b.batchCode}</span>
                    <span className="text-muted-foreground"> — {b.batchName}</span>
                    <span id={`${inputId}-meta`} className="block text-xs text-muted-foreground mt-1">
                      {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left ·{" "}
                      {format(new Date(b.startDate), "MMM d, yyyy")} – {format(new Date(b.endDate), "MMM d, yyyy")}
                    </span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !selectedId || batches.length === 0}
          >
            {loading ? "Saving…" : mode === "join" ? "Assign batch" : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

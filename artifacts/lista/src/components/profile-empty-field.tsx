import { Button } from "@/components/ui/button";

/** Read-only empty field placeholder for profile grids. */
export function ProfileFieldValue({ value }: { value?: string | null }) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    return (
      <span className="text-sm text-muted-foreground/80 italic pl-5">No data yet</span>
    );
  }
  return <p className="text-sm font-semibold text-foreground pl-5 break-words">{text}</p>;
}

/** Empty state row for profile data tables. */
export function ProfileTableEmpty({
  colSpan,
  message,
  actionLabel,
  onAction,
}: {
  colSpan: number;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center">
        <p className="text-xs text-muted-foreground mb-3">{message}</p>
        <Button type="button" size="sm" variant="outline" className="h-8 rounded-md" onClick={onAction}>
          {actionLabel}
        </Button>
      </td>
    </tr>
  );
}

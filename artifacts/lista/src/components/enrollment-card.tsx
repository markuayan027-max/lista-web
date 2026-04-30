import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import StatusBadge from "./status-badge";
import { courses } from "@/lib/mock-data";
import { format } from "date-fns";

interface Enrollment {
  refNo: string;
  traineeName: string;
  courseSlug: string;
  status: any;
  createdAt: string;
}

interface EnrollmentCardProps {
  enrollment: Enrollment;
  className?: string;
}

export default function EnrollmentCard({ enrollment, className }: EnrollmentCardProps) {
  const course = courses.find((c) => c.slug === enrollment.courseSlug);

  return (
    <Card className={cn("overflow-hidden border-card-border shadow-sm", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {enrollment.refNo}
              </span>
              <StatusBadge status={enrollment.status} />
            </div>
            <h4 className="font-bold text-lg">{enrollment.traineeName}</h4>
            <p className="text-sm text-muted-foreground font-medium">
              {course?.title || enrollment.courseSlug}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground">Applied on</p>
            <p className="text-sm font-medium">
              {format(new Date(enrollment.createdAt), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

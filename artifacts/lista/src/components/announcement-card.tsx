import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { User, Calendar } from "lucide-react";

interface Announcement {
  title: string;
  body: string;
  targetRole: string;
  author: string;
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <Card className="border-card-border shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold leading-tight">{announcement.title}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[10px] uppercase tracking-wider font-bold">
                {announcement.targetRole}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {announcement.body}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-card-border/50">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{announcement.author}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { motion } from "framer-motion";
import AnnouncementCard from "@/components/announcement-card";
import { useAnnouncements } from "@/hooks/use-lista-data";
import { isToday, isYesterday, isThisWeek, parseISO } from "date-fns";
import { AnnouncementListSkeleton } from "@/components/skeletons";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function TraineeAnnouncementsPage() {
  const { data: announcements = [], isLoading } = useAnnouncements();
  const visibleAnnouncements = announcements.filter(
    (a) => a.targetRole === "all" || a.targetRole === "trainee",
  );

  const grouped = visibleAnnouncements.reduce(
    (acc, curr) => {
      const date = parseISO(curr.createdAt);
      let group = "Earlier";
      if (isToday(date)) group = "Today";
      else if (isYesterday(date)) group = "Yesterday";
      else if (isThisWeek(date)) group = "This Week";

      if (!acc[group]) acc[group] = [];
      acc[group].push(curr);
      return acc;
    },
    {} as Record<string, typeof visibleAnnouncements>,
  );

  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground mt-1">Stay updated with the latest news and information.</p>
      </motion.div>

      {isLoading ? (
        <AnnouncementListSkeleton count={5} />
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
          {groupOrder.map((group) => {
            if (!grouped[group] || grouped[group].length === 0) return null;

            return (
              <motion.div key={group} className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-card-border pb-2">
                  {group}
                </h2>
                <motion.div className="space-y-4">
                  {grouped[group].map((announcement) => (
                    <motion.div key={announcement.id} variants={item}>
                      <AnnouncementCard announcement={announcement} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

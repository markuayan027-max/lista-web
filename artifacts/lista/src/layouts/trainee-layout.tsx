import { useAuth } from "@/context/auth-context";
import { useLocation, Redirect } from "wouter";
import { ModernSidebar } from "@/components/modern-sidebar";
import BottomNavTrainee from "@/components/bottom-nav-trainee";
import HomepageChatDeferred from "@/components/homepage-chat-deferred";
import AvatarInitials from "@/components/avatar-initials";
import { LogOut, Bell } from "lucide-react";
import {
  traineeModernSidebarMenu,
  traineePreferencesNavItems,
  traineeSecondarySidebarMenu,
} from "@/lib/trainee-nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const traineeSidebarProps = {
  menuItems: traineeModernSidebarMenu(),
  secondaryMenuItems: traineeSecondarySidebarMenu(),
  roleName: "Trainee",
  logoHref: "/trainee",
  announcementRole: "trainee" as const,
  profileHref: "/trainee/profile",
};

export default function TraineeLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isRegistered, registrationLoading } = useAuth();
  const [location, setLocation] = useLocation();

  if (registrationLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background" aria-busy="true" aria-label="Loading profile">
        <div className="w-full max-w-sm px-6 space-y-4">
          <div className="h-10 w-10 rounded-xl skeleton-shimmer mx-auto" />
          <div className="h-3 w-40 skeleton-shimmer mx-auto rounded-md" />
          <div className="h-2 w-56 skeleton-shimmer mx-auto rounded-md" />
        </div>
      </div>
    );
  }

  if (user?.role === "trainee" && !isRegistered && location !== "/trainee/register") {
    return <Redirect to="/trainee/register" />;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const accountItems = traineePreferencesNavItems();

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      <aside className="hidden md:flex h-full shrink-0">
        <ModernSidebar {...traineeSidebarProps} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8 min-w-0">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <BottomNavTrainee />
      <HomepageChatDeferred />
    </div>
  );
}

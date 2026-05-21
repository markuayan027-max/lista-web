import { useAuth } from "@/context/auth-context";
import { useLocation, Redirect } from "wouter";
import { ModernSidebar } from "@/components/modern-sidebar";
import BottomNavTrainee from "@/components/bottom-nav-trainee";
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
  const { user, logout, isRegistered } = useAuth();
  const [location, setLocation] = useLocation();

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
        <header className="h-16 bg-card border-b border-card-border flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight">Trainee Portal</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground relative hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
              aria-label="Announcements"
              onClick={() => setLocation("/trainee/announcements")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-white" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Account menu"
                >
                  <AvatarInitials name={user?.name || "Trainee"} size="sm" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold leading-none">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                      Trainee
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {accountItems.map((item) => (
                  <DropdownMenuItem
                    key={item.href}
                    onClick={() => setLocation(item.href)}
                    className="rounded-lg"
                  >
                    <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive font-semibold rounded-lg">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8 min-w-0">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <BottomNavTrainee />
    </div>
  );
}

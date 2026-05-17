import { useAuth } from "@/context/auth-context";
import { useLocation, Redirect } from "wouter";
import SidebarTrainee from "@/components/sidebar-trainee";
import { ModernSidebar } from "@/components/modern-sidebar";
import BottomNavTrainee from "@/components/bottom-nav-trainee";
import AvatarInitials from "@/components/avatar-initials";
import { LogOut, Bell, Menu, Home, ClipboardList, Calendar, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const TRAINEE_MENU = [
  { href: "/trainee", label: "Dashboard", icon: Home },
  { href: "/trainee/application", label: "Courses", icon: BookOpen },
  { href: "/trainee/tracking", label: "My Applications", icon: ClipboardList },
  { href: "/trainee/schedule", label: "Schedule", icon: Calendar },
  { href: "/trainee/certificate", label: "Certificates", icon: Award },
];

export default function TraineeLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isRegistered } = useAuth();
  const [location, setLocation] = useLocation();

  // Only trainees complete the TESDA profile/application — never staff or admin
  if (user?.role === "trainee" && !isRegistered && location !== "/trainee/register") {
    return <Redirect to="/trainee/register" />;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-full shrink-0">
        <ModernSidebar
          menuItems={TRAINEE_MENU}
          roleName="Trainee"
          logoHref="/trainee"
          announcementRole="trainee"
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-card-border flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
               <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarTrainee />
                </SheetContent>
              </Sheet>
            </div>
            <h1 className="text-lg font-bold tracking-tight hidden md:block">Trainee Portal</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground relative hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all"
              onClick={() => setLocation("/trainee/announcements")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-indigo-600 rounded-full border-2 border-white" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <AvatarInitials name={user?.name || "Trainee"} size="sm" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold leading-none">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Trainee</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/trainee/application")}>My Application</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/trainee/certificate")}>Certificates</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive font-bold">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNavTrainee />
    </div>
  );
}

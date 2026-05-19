import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";
import SidebarAdmin from "@/components/sidebar-admin";
import { ModernSidebar } from "@/components/modern-sidebar";
import AvatarInitials from "@/components/avatar-initials";
import { LogOut, Bell, Menu, BarChart3, ClipboardList, Users, Calendar, Award, FileUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const ADMIN_MENU = [
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: "/admin/enrollments", label: "Enrollments", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
  { href: "/admin/schedule", label: "Schedule", icon: Calendar },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/export", label: "Export", icon: FileUp },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getPageTitle = () => {
    const parts = location.split("/");
    if (parts.length <= 2) return "Analytics";
    const segment = parts[2];
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-full shrink-0">
        <ModernSidebar
          menuItems={ADMIN_MENU}
          roleName="Administrator"
          logoHref="/admin"
          announcementRole="admin"
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-card-border flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarAdmin />
                </SheetContent>
              </Sheet>
            </div>
            <h1 className="text-lg font-bold tracking-tight">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground relative hover:bg-primary-indigo/10 hover:text-primary-indigo rounded-full transition-all"
              onClick={() => setLocation("/admin/announcements")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary-indigo rounded-full border-2 border-card" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <AvatarInitials name={user?.name || "Admin"} size="sm" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold leading-none">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Administrator</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                <DropdownMenuLabel>Admin Control</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/admin/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/admin/users")}>User Management</DropdownMenuItem>
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
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

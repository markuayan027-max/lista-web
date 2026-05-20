import { useAuth } from "@/context/auth-context";
import { useLocation, Link } from "wouter";
import SidebarStaff from "@/components/sidebar-staff";
import AvatarInitials from "@/components/avatar-initials";
import { staffAccountNavItems } from "@/lib/staff-nav";
import { LogOut, Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const accountItems = staffAccountNavItems();

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-full shrink-0">
        <SidebarStaff />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-card-border flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 touch-target" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[min(100vw,280px)] border-0">
                  <SidebarStaff />
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="hidden sm:flex items-center relative max-w-md w-full">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Link href="/staff/search" className="w-full">
                <Input
                  placeholder="Global search..."
                  className="pl-10 bg-muted/50 border-transparent focus:bg-card transition-all rounded-xl cursor-pointer"
                  readOnly
                />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-card" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <AvatarInitials name={user?.name || "Staff"} size="sm" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold leading-none">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Staff Member</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                <DropdownMenuLabel>Staff Portal</DropdownMenuLabel>
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
                <DropdownMenuItem onClick={handleLogout} className="text-destructive font-bold">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 min-w-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

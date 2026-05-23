import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { getEnrollCta } from "@/lib/role-navigation";
import SiteLogo from "@/components/site-logo";

/** Primary nav — keep to 4 links; About/Scholarships/Assessment live in footer. */
const PRIMARY_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/admissions", label: "Admissions" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isRegistered } = useAuth();
  const enrollCta = getEnrollCta(user, isRegistered);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-slate-200/60 py-3"
          : "bg-white border-transparent py-5"
      )}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
            onClick={(e) => {
              if (location === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <div className="transition-transform group-hover:scale-105">
              <SiteLogo className="h-12 w-auto object-contain sm:h-14 md:h-16" priority />
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900">LISTA</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {PRIMARY_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-bold transition-all hover:text-primary-indigo whitespace-nowrap relative",
                  location === link.href
                    ? "text-primary-indigo after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary-indigo"
                    : "text-slate-500"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-primary-indigo transition-colors whitespace-nowrap">
              Log in
            </Link>
            <Link href={enrollCta.href}>
              <Button className="rounded-full px-8 h-11 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 border border-primary-border shadow-md shadow-slate-900/10 transition-all active:scale-95 whitespace-nowrap">
                {enrollCta.label}
              </Button>
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Open navigation menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex h-[100dvh] max-h-[100dvh] w-[min(100vw,400px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[400px]"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation menu</SheetTitle>
                  <SheetDescription>Site links and enrollment actions</SheetDescription>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-6 pb-4 pt-14">
                  {PRIMARY_NAV_LINKS.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          "text-xl font-semibold transition-colors hover:text-foreground",
                          location === link.href
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <div className="shrink-0 border-t border-card-border bg-background px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <div className="flex flex-col gap-4">
                    <SheetClose asChild>
                      <Link href="/login" className="text-lg font-bold text-muted-foreground">
                        Log in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href={enrollCta.href}>
                        <Button className="w-full rounded-xl py-6 text-lg font-semibold min-h-[3.25rem] bg-primary text-primary-foreground hover:bg-primary/90">
                          {enrollCta.label}
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

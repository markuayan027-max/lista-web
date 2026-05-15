import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/admissions", label: "Admissions" },
  { href: "/assessment", label: "Assessment" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

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
      <div className="container mx-auto px-4 md:px-6">
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
              <img src="/logo.webp" alt="LISTA Logo" className="h-16 w-auto object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900">LISTA</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {NAV_LINKS.map((link) => (
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
            {/* 2026-05-13: single application entrypoint */}
            <Link href="/trainee/register">
              <Button className="rounded-full px-8 h-11 font-black bg-primary-indigo hover:bg-slate-900 text-white border-none shadow-lg shadow-primary-indigo/20 transition-all active:scale-95 whitespace-nowrap">
                Enroll Now
              </Button>
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-8 mt-10">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "text-xl font-bold transition-colors hover:text-blue-700",
                        location === link.href
                          ? "text-blue-700"
                          : "text-slate-600"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-4 pt-6 border-t border-card-border">
                    <Link href="/login" className="text-lg font-bold text-muted-foreground">
                      Log in
                    </Link>
                    <Link href="/trainee/register">
                      <Button className="w-full rounded-xl py-6 text-lg font-bold">
                        Enroll now
                      </Button>
                    </Link>
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

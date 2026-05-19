import { Link } from "wouter";
import SiteLogo from "@/components/site-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="py-6 px-4 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="transition-transform group-hover:scale-105">
            <SiteLogo className="h-12 w-auto object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tighter">LISTA</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}

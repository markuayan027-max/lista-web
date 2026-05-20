import { useEffect } from "react";
import { Redirect } from "wouter";
import Navbar from "@/components/navbar";
import PublicFooter from "@/components/public-footer";
import HomepageChat from "@/components/homepage-chat";
import { useCourses } from "@/hooks/use-lista-data";
import { useAuth } from "@/context/auth-context";
import { getRoleHomePath } from "@/lib/role-navigation";
import { toast } from "sonner";

/** Signed-in users must sign out of their portal before browsing the public site. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data: courses = [] } = useCourses();
  const programCount = courses.length > 0 ? courses.length : undefined;

  useEffect(() => {
    if (loading || !user) return;
    toast.info("Sign out from your portal before visiting the public site.");
  }, [user, loading]);

  if (!loading && user) {
    return <Redirect to={getRoleHomePath(user.role)} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
      <HomepageChat programCount={programCount} />
    </div>
  );
}

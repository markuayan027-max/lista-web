import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // If user is detected (handled by AuthProvider automatically), redirect
    if (user) {
      if (user.role === "admin") setLocation("/admin");
      else if (user.role === "staff") setLocation("/staff");
      else setLocation("/trainee");
    }
  }, [user, setLocation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold">Completing Sign In...</h2>
        <p className="text-muted-foreground">Please wait while we secure your session.</p>
      </div>
    </div>
  );
}

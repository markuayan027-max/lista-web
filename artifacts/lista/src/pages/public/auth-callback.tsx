import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { getRoleHomePath } from "@/lib/role-navigation";
import { safeRedirectPath } from "@/lib/enroll-entry";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthCallbackPage() {
  const [_, setLocation] = useLocation();
  const { user, completeOAuthCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const postLoginPath = safeRedirectPath(
    new URLSearchParams(window.location.search).get("redirect"),
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    void (async () => {
      try {
        await completeOAuthCallback();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign-in could not be completed.");
      }
    })();
  }, [completeOAuthCallback]);

  useEffect(() => {
    if (!user) return;
    setLocation(postLoginPath ?? getRoleHomePath(user.role));
  }, [user, setLocation, postLoginPath]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-4 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold">Sign-in incomplete</h2>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button asChild>
          <Link href="/login">Back to log in</Link>
        </Button>
      </div>
    );
  }

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

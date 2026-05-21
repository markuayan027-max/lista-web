import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import FormInputField from "@/components/form-input-field";
import PasswordRequirements, {
  passwordRequirementsDescribedBy,
} from "@/components/password-requirements";
import PrimaryButton from "@/components/primary-button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { safeRedirectPath } from "@/lib/enroll-entry";
import { resolvePostLoginPath } from "@/lib/role-navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [_, setLocation] = useLocation();
  const { login, signUpWithOAuth, user, loading: authLoading } = useAuth();

  const postLoginPath = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return safeRedirectPath(params.get("redirect"));
  }, []);
   
  const [email, setEmail] = useState(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("email");
    return fromQuery?.trim() ?? "";
  });
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);

  const verifyEmailHref = useMemo(() => {
    const target = email.trim().toLowerCase();
    return target
      ? `/signup?verify=1&email=${encodeURIComponent(target)}`
      : "/signup?verify=1";
  }, [email]);

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("email");
    if (fromQuery?.trim()) setEmail(fromQuery.trim());
  }, []);

  useEffect(() => {
    if (!user) return;
    setLocation(resolvePostLoginPath(user.role, postLoginPath));
  }, [user, setLocation, postLoginPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setFormError("Enter your email and password to continue.");
      return;
    }
    setFormError(null);
    setNeedsEmailVerification(false);
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not sign in. Please try again.";
      const mustVerify =
        message.toLowerCase().includes("verif") || message.toLowerCase().includes("confirm");
      setNeedsEmailVerification(mustVerify);
      setFormError(
        mustVerify
          ? "Your email is not verified yet. Use the Sign up page to enter your 6-digit code (not Forgot password)."
          : message,
      );
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google') => {
    try {
      await signUpWithOAuth(provider);
    } catch (err: any) {
      toast.error(`Failed to connect with ${provider}`);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Log in</h1>
        {postLoginPath && (
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Sign in to continue your enrollment. You will return to your application after login.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => handleOAuth('google')}
          className="w-full flex items-center justify-center gap-3 h-14 rounded-xl border border-card-border bg-white font-semibold text-foreground hover:bg-slate-50 transition-all shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-card-border"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest">or with Email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && (
          <Alert variant="destructive" className="rounded-xl" role="alert">
            <AlertCircle className="h-4 w-4" aria-hidden />
            <AlertTitle>Could not sign in</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{formError}</p>
              {needsEmailVerification && (
                <p className="text-sm">
                  <Link href={verifyEmailHref} className="font-semibold underline">
                    Verify email on Sign up →
                  </Link>{" "}
                  (enter code in the <strong>Verification code</strong> box, then click{" "}
                  <strong>Sign Up</strong>).
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <FormInputField 
          label="Email" 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          required
          className="h-14 text-base rounded-xl"
        />
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
             <Label className="text-sm font-semibold tracking-tight">Password</Label>
          </div>
          <FormInputField 
            label=""
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            aria-describedby={passwordRequirementsDescribedBy(
              "login-password-requirements",
              password,
            )}
            className="h-14 text-base rounded-xl"
          />
          <PasswordRequirements
            password={password}
            id="login-password-requirements"
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" title="Forget password ?" className="text-sm font-medium text-muted-foreground hover:text-primary hover:underline transition-colors">
              Forget password ?
            </Link>
          </div>
        </div>

        <PrimaryButton
          type="submit"
          disabled={isLoading || authLoading}
          className="w-full h-14 text-lg font-bold rounded-xl mt-4 shadow-lg hover:shadow-xl transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            "Log in"
          )}
        </PrimaryButton>
      </form>
      
      <div className="text-center space-y-6">
        <p className="text-sm text-muted-foreground">
          Don't have an account? <Link href="/signup" className="font-bold text-primary hover:underline">Sign up</Link>
        </p>
        
        <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
          By continuing to Lorenz ISTA, you are agreeing to LISTA's <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

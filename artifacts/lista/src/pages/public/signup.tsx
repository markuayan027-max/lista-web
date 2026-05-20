import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import FormInputField from "@/components/form-input-field";
import PasswordRequirements, {
  passwordRequirementsDescribedBy,
} from "@/components/password-requirements";
import { getPasswordValidationError, isPasswordValid } from "@/lib/password-policy";
import PrimaryButton from "@/components/primary-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useVerificationResendCooldown } from "@/hooks/use-verification-resend-cooldown";
import { getRoleHomePath } from "@/lib/role-navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, UserRoundCheck } from "lucide-react";

function isAlreadyRegisteredError(err: unknown): boolean {
  const e = err as { message?: string; code?: string; error?: string; statusCode?: number };
  const msg = (e?.message ?? e?.error ?? "").toLowerCase();
  return (
    e?.statusCode === 409 ||
    e?.code === "user_already_exists" ||
    e?.code === "USER_EXISTS" ||
    msg.includes("already exists") ||
    msg.includes("already registered")
  );
}

function needsEmailVerification(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("verif") || lower.includes("confirm");
}

function isInvalidCredentialsMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    (lower.includes("invalid") && lower.includes("credential")) ||
    lower.includes("incorrect")
  );
}

function isNetworkError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("network request failed") ||
    msg.includes("cannot reach lista") ||
    msg.includes("timed out") ||
    msg.includes("aborted")
  );
}

export default function SignupPage() {
  const [_, setLocation] = useLocation();
  const { signUp, verifyEmail, resendVerificationEmail, signUpWithOAuth, login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingAccountEmail, setExistingAccountEmail] = useState<string | null>(null);
  const [existingAccountDialogOpen, setExistingAccountDialogOpen] = useState(false);

  const { secondsLeft, isOnCooldown, startCooldown } = useVerificationResendCooldown(email);

  const promptExistingAccount = (addr: string) => {
    const normalized = addr.trim().toLowerCase();
    setExistingAccountEmail(normalized);
    setExistingAccountDialogOpen(true);
  };

  const goToLogin = () => {
    const target = existingAccountEmail ?? email.trim().toLowerCase();
    setExistingAccountDialogOpen(false);
    setLocation(target ? `/login?email=${encodeURIComponent(target)}` : "/login");
  };

  const sendCodeDisabled = isSending || isOnCooldown;
  const sendCodeLabel = isSending
    ? "Sending…"
    : isOnCooldown
      ? `Resend in ${secondsLeft}s`
      : codeSent
        ? "Resend code"
        : "Send code";

  useEffect(() => {
    if (!user) return;
    setLocation(getRoleHomePath(user.role));
  }, [user, setLocation]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify") !== "1") return;
    const fromQuery = params.get("email")?.trim().toLowerCase();
    if (fromQuery) setEmail(fromQuery);
    toast.info(
      "Enter the 6-digit code from your email in Verification code, then click Sign Up. Use Resend code if needed.",
      { duration: 8000 },
    );
  }, []);

  /* ── "Send Code" inline button ──────────────────────────────────────── */
  const handleSendCode = async () => {
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password first.");
      return;
    }
    if (!isPasswordValid(password)) {
      toast.error(getPasswordValidationError(password) ?? "Password does not meet requirements.");
      return;
    }
    if (isOnCooldown) return;

    setIsSending(true);
    setExistingAccountEmail(null);
    const normalizedEmail = email.trim().toLowerCase();

    const showNetworkError = (err: unknown) => {
      if (!isNetworkError(err)) return false;
      const message =
        err instanceof Error
          ? err.message
          : "Cannot reach LISTA servers. Try Log in or check your connection.";
      toast.error(message);
      return true;
    };

    try {
      // Fast path: existing verified account (avoids signUp + email send hang)
      try {
        await login(normalizedEmail, password);
        toast.success("You're signed in. Continue with your trainee profile.");
        return;
      } catch (loginErr: unknown) {
        if (showNetworkError(loginErr)) return;

        const loginMessage =
          loginErr instanceof Error ? loginErr.message : "Could not sign in.";

        if (needsEmailVerification(loginMessage)) {
          try {
            await resendVerificationEmail(normalizedEmail);
            startCooldown();
            toast.success("Verification code sent! Check your inbox.");
            setCodeSent(true);
            return;
          } catch (resendErr: unknown) {
            if (showNetworkError(resendErr)) return;
            const resendMessage =
              resendErr instanceof Error ? resendErr.message : "Failed to resend code.";
            toast.error(resendMessage);
            return;
          }
        }

        if (isAlreadyRegisteredError(loginErr) && !isInvalidCredentialsMessage(loginMessage)) {
          promptExistingAccount(normalizedEmail);
          return;
        }
        // Invalid credentials → likely new user; continue to signUp below
      }

      await signUp(normalizedEmail, password);
      startCooldown();
      toast.success("Verification code sent! Check your inbox.");
      setCodeSent(true);
    } catch (err: unknown) {
      if (showNetworkError(err)) return;
      if (isAlreadyRegisteredError(err)) {
        promptExistingAccount(normalizedEmail);
        return;
      }
      const message =
        err instanceof Error ? err.message : "Failed to send verification code.";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  /* ── Form submit — verify OTP and complete sign-up ──────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!codeSent) {
      toast.error("Please send a verification code to your email first.");
      return;
    }
    if (!code.trim()) {
      toast.error("Please enter the verification code.");
      return;
    }
    setIsLoading(true);
    try {
      await verifyEmail(email.trim().toLowerCase(), code.trim());
      toast.success("Email verified — welcome to LISTA!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid or expired code. Try again.";
      if (isAlreadyRegisteredError(err) || message.toLowerCase().includes("already")) {
        promptExistingAccount(email);
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ── OAuth ───────────────────────────────────────────────────────────── */
  const handleOAuth = async () => {
    try {
      await signUpWithOAuth("google");
    } catch {
      toast.error("Failed to connect with Google.");
    }
  };

  return (
    <>
      <AlertDialog open={existingAccountDialogOpen} onOpenChange={setExistingAccountDialogOpen}>
        <AlertDialogContent className="max-w-[min(100vw-2rem,22rem)] gap-0 rounded-2xl border-border/50 p-0 shadow-xl sm:rounded-2xl">
          <div className="flex flex-col items-center px-6 pb-2 pt-8 text-center">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden
            >
              <UserRoundCheck className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <AlertDialogHeader className="space-y-2 text-center sm:text-center">
              <AlertDialogTitle className="text-xl font-semibold tracking-tight">
                Account already registered
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {existingAccountEmail ? (
                  <>
                    <span className="font-medium text-foreground">{existingAccountEmail}</span> is
                    already on LISTA. Use the log in page to continue your profile or enrollment.
                  </>
                ) : (
                  "This email is already registered. Use the log in page to continue."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="flex-col gap-2 border-t border-border/40 bg-muted/30 px-6 py-4 sm:flex-col sm:space-x-0">
            <AlertDialogAction
              className="h-11 w-full rounded-xl font-semibold"
              onClick={goToLogin}
            >
              Go to log in
            </AlertDialogAction>
            <AlertDialogCancel className="h-10 w-full rounded-xl border-0 bg-transparent text-sm font-medium text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground">
              Stay on sign up
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Sign up</h1>
      </div>

      {/* OAuth */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleOAuth}
          className="w-full flex items-center justify-center gap-3 h-14 rounded-xl border border-card-border bg-white font-semibold text-foreground hover:bg-slate-50 transition-all shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <FormInputField
          label=""
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setExistingAccountEmail(null);
            setExistingAccountDialogOpen(false);
          }}
          placeholder="email@example.com"
          required
          className="h-14 text-base rounded-xl"
        />

        {/* Verification code + inline send / resend (60s cooldown) */}
        <div className="space-y-0">
          <div className="relative">
            <input
              id="signup-verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Verification code"
              aria-describedby={isOnCooldown ? "signup-resend-cooldown-hint" : undefined}
              className="w-full h-14 px-4 text-base rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-[8.5rem] sm:pr-36"
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sendCodeDisabled}
              aria-disabled={sendCodeDisabled}
              aria-label={
                isOnCooldown
                  ? `Resend verification code available in ${secondsLeft} seconds`
                  : codeSent
                    ? "Resend verification code to your email"
                    : "Send verification code to your email"
              }
              className={cn(
                "absolute right-2 top-2 h-10 min-w-[7.25rem] px-3 text-xs font-extrabold rounded-lg transition-all duration-300 flex items-center justify-center gap-1",
                sendCodeDisabled
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-80"
                  : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden />
                  <span>Sending…</span>
                </>
              ) : (
                <span aria-live="polite">{sendCodeLabel}</span>
              )}
            </button>
          </div>
          {isOnCooldown && (
            <p
              id="signup-resend-cooldown-hint"
              className="mt-2 text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              You can request another code in{" "}
              <span className="font-semibold text-foreground tabular-nums">{secondsLeft}s</span>.
              Check spam if you do not see the email.
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <FormInputField
            label=""
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="new-password"
            aria-describedby={passwordRequirementsDescribedBy(
              "signup-password-requirements",
              password,
            )}
            className="h-14 text-base rounded-xl"
          />
          <PasswordRequirements
            password={password}
            id="signup-password-requirements"
          />
        </div>

        <PrimaryButton
          type="submit"
          disabled={isLoading}
          className="w-full h-14 text-lg font-bold rounded-xl mt-4 shadow-lg hover:shadow-xl transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
              Verifying email…
            </span>
          ) : (
            "Sign Up"
          )}
        </PrimaryButton>
      </form>

      <div className="text-center space-y-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">Log in</Link>
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
          By continuing to Lorenz ISTA, you are agreeing to LISTA's{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}

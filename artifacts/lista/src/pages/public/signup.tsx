import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import FormInputField from "@/components/form-input-field";
import PrimaryButton from "@/components/primary-button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [_, setLocation] = useLocation();
  const { signUp, verifyEmail, resendVerificationEmail, signUpWithOAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsSending(true);
    try {
      await signUp(email, password);
      toast.success("Verification code sent! Check your inbox.");
      setCodeSent(true);
    } catch (err: any) {
      // Account already exists → resend the verification email instead
      if (
        err?.message?.toLowerCase().includes("already") ||
        err?.code === "user_already_exists"
      ) {
        try {
          await resendVerificationEmail(email);
          toast.success("Code resent! Check your inbox.");
          setCodeSent(true);
        } catch (resendErr: any) {
          toast.error(resendErr?.message || "Failed to resend code.");
        }
      } else {
        toast.error(err?.message || "Failed to send verification code.");
      }
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
      await verifyEmail(email, code.trim());
      toast.success("Account created! You can now log in.");
      setLocation("/login");
    } catch (err: any) {
      toast.error(err?.message || "Invalid or expired code. Try again.");
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
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          className="h-14 text-base rounded-xl"
        />

        {/* Verification code + inline "Send Code" button — original design preserved */}
        <div className="relative group">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Verification code"
            className="w-full h-14 px-4 text-base rounded-xl border border-card-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-36"
          />
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isSending}
            className="absolute right-2 top-2 h-10 px-4 text-xs font-extrabold bg-slate-100 hover:bg-primary hover:text-white rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-1"
          >
            {isSending ? <><Loader2 className="w-3 h-3 animate-spin" /> Sending…</> : codeSent ? "Resend" : "Send Code"}
          </button>
        </div>

        {/* Password */}
        <FormInputField
          label=""
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="h-14 text-base rounded-xl"
        />

        <PrimaryButton
          type="submit"
          disabled={isLoading}
          className="w-full h-14 text-lg font-bold rounded-xl mt-4 shadow-lg hover:shadow-xl transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Creating account…
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
  );
}

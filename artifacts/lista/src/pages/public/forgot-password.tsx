import { useState } from "react";
import { Link, useLocation } from "wouter";
import FormInputField from "@/components/form-input-field";
import PasswordRequirements from "@/components/password-requirements";
import { getPasswordValidationError, isPasswordValid } from "@/lib/password-policy";
import PrimaryButton from "@/components/primary-button";
import { ChevronLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { authApiRequest } from "@/lib/auth-api";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Forgot / Reset Password — 3-step OTP flow
//
//  Step 1 – "request":
//    User enters their email and clicks "Send Code".
//    Calls auth.sendResetPasswordEmail({ email }) — server sends an OTP.
//
//  Step 2 – "reset":
//    User enters the OTP they received + their new password.
//    Calls auth.resetPassword({ newPassword, otp }) to finalise.
//
//  Step 3 – "done":
//    Success screen with a link back to login.
// ---------------------------------------------------------------------------

type Step = "request" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [_, setLocation] = useLocation();

  const [step, setStep] = useState<Step>("request");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // ── Step 1 ────────────────────────────────────────────────────────────────

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSending(true);
    try {
      await authApiRequest("/api/auth/email/send-reset-password", {
        method: "POST",
        body: { email: email.trim().toLowerCase() },
      });
      toast.success("Reset code sent! Check your inbox.");
      setStep("reset");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset code. Try again.";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async () => {
    setIsSending(true);
    try {
      await authApiRequest("/api/auth/email/send-reset-password", {
        method: "POST",
        body: { email: email.trim().toLowerCase() },
      });
      toast.success("Code resent!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend code.";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  // ── Step 2 ────────────────────────────────────────────────────────────────

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter the verification code.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsResetting(true);
    const normalizedEmail = email.trim().toLowerCase();
    const code = otp.trim();
    try {
      const { token } = await authApiRequest<{ token: string }>(
        "/api/auth/email/exchange-reset-password-token",
        {
          method: "POST",
          body: { email: normalizedEmail, code },
        },
      );
      await authApiRequest("/api/auth/email/reset-password", {
        method: "POST",
        body: { newPassword, otp: token },
      });
      setStep("done");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid or expired code. Please try again.";
      toast.error(message);
    } finally {
      setIsResetting(false);
    }
  };

  // ── Render — Step 3: Done ─────────────────────────────────────────────────

  if (step === "done") {
    return (
      <div className="w-full space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Password reset!
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Your password has been updated successfully.
            <br />
            You can now log in with your new password.
          </p>
        </div>
        <PrimaryButton
          onClick={() => setLocation("/login")}
          className="w-full h-12 rounded-xl"
        >
          Back to login
        </PrimaryButton>
      </div>
    );
  }

  // ── Render — Step 2: Enter OTP + new password ─────────────────────────────

  if (step === "reset") {
    return (
      <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Reset password
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Enter the code we sent to{" "}
            <span className="font-bold text-foreground">{email}</span> and
            choose a new password.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          {/* OTP input */}
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Verification code"
            className="w-full h-14 px-4 text-base rounded-xl border border-card-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all tracking-widest font-mono"
            required
            autoFocus
          />

          <div className="space-y-2">
            <FormInputField
              label=""
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              required
              autoComplete="new-password"
              aria-describedby="reset-password-requirements"
              className="h-14 text-base rounded-xl"
            />
            <PasswordRequirements
              password={newPassword}
              id="reset-password-requirements"
            />
          </div>

          <FormInputField
            label=""
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="h-14 text-base rounded-xl"
          />

          <PrimaryButton
            type="submit"
            disabled={isResetting}
            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {isResetting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Resetting…
              </span>
            ) : (
              "Reset Password"
            )}
          </PrimaryButton>
        </form>

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isSending}
              className="font-bold text-primary hover:underline disabled:opacity-50"
            >
              {isSending ? "Sending…" : "Resend code"}
            </button>
          </p>
          <button
            type="button"
            onClick={() => setStep("request")}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Change email
          </button>
        </div>
      </div>
    );
  }

  // ── Render — Step 1: Email entry ──────────────────────────────────────────

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Forgot password?
        </h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send a reset code.
        </p>
      </div>

      <form onSubmit={handleSendCode} className="space-y-6">
        <FormInputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          required
          className="h-14 text-base rounded-xl"
        />

        <PrimaryButton
          type="submit"
          disabled={isSending || !email}
          className="w-full h-14 text-lg font-bold rounded-xl mt-4 shadow-lg hover:shadow-xl transition-all"
        >
          {isSending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Sending…
            </span>
          ) : (
            "Send Reset Code"
          )}
        </PrimaryButton>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to login
        </Link>
      </div>

      <p className="text-[10px] text-muted-foreground text-center leading-relaxed max-w-xs mx-auto pt-4">
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
  );
}

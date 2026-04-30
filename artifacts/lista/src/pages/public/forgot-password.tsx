import { useState } from "react";
import { Link } from "wouter";
import { GraduationCap, ArrowLeft, MailCheck } from "lucide-react";
import FormInputField from "@/components/form-input-field";
import PrimaryButton from "@/components/primary-button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-6 text-primary">
            <GraduationCap className="w-8 h-8" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Reset Password</h1>
          <p className="text-muted-foreground">We'll send you instructions to reset it.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-10 border border-card-border shadow-sm">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInputField 
                label="Email Address" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
              />
              
              <PrimaryButton type="submit" className="w-full h-12 text-base">
                Send reset link
              </PrimaryButton>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <MailCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-xl font-bold">Check your email</h2>
                 <p className="text-muted-foreground text-sm">
                   If an account exists for <span className="font-bold text-foreground">{email}</span>, we've sent reset instructions.
                 </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/login" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/lib/mock-data";
import FormInputField from "@/components/form-input-field";
import PrimaryButton from "@/components/primary-button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [_, setLocation] = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("trainee");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // Call auth context
    login(email, role);
    
    // Redirect based on role
    if (role === "trainee") setLocation("/trainee");
    else if (role === "staff") setLocation("/staff");
    else if (role === "admin") setLocation("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-6 text-primary">
            <GraduationCap className="w-8 h-8" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to access your dashboard.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-10 border border-card-border shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <FormInputField 
              label="Email Address" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
            />
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                 <Label className="text-sm font-semibold tracking-tight">Password</Label>
                 <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                    Forgot password?
                 </Link>
              </div>
              <FormInputField 
                label="" // visually hidden
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-0"
              />
            </div>

            <div className="pt-2">
              <Label className="text-sm font-semibold tracking-tight block mb-3">Sign in as:</Label>
              <RadioGroup 
                value={role} 
                onValueChange={(val) => setRole(val as UserRole)}
                className="flex gap-2"
              >
                {[
                  { value: "trainee", label: "Trainee" },
                  { value: "staff", label: "Staff" },
                  { value: "admin", label: "Admin" }
                ].map(r => (
                  <Label 
                    key={r.value}
                    htmlFor={`role-${r.value}`}
                    className={`flex-1 text-center p-3 rounded-xl border cursor-pointer transition-all text-sm font-bold ${
                      role === r.value 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-card-border hover:border-primary/50 text-muted-foreground"
                    }`}
                  >
                    <RadioGroupItem value={r.value} id={`role-${r.value}`} className="sr-only" />
                    {r.label}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <PrimaryButton type="submit" className="w-full h-12 text-base mt-4">
              Sign in
            </PrimaryButton>
          </form>
          
          <div className="mt-8 pt-6 border-t border-card-border text-center">
            <p className="text-xs text-muted-foreground font-medium">
              Demo: enter any email + password and pick a role.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8 text-sm text-muted-foreground">
          Don't have an account? <Link href="/enroll" className="font-bold text-primary hover:underline">Apply for admission</Link>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext } from "react";
import type { User } from "../lib/institutional-data";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  signUpWithOAuth: (provider: "google") => Promise<void>;
  logout: () => Promise<void>;
  isRegistered: boolean;
  completeRegistration: () => void;
  markRegistrationPartial: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

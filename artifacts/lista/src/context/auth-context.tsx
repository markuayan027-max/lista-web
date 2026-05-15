import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, UserRole } from "../lib/institutional-data";
import { lista } from "../lib/insforge";

interface AuthContextType {
  user: User | null;
  /** True while restoring session from the backend */
  loading: boolean;
  /** Email + password login */
  login: (email: string, password: string) => Promise<void>;
  /**
   * Create a new account. Triggers a verification email with OTP.
   * Call verifyEmail() afterwards to complete registration.
   */
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  /**
   * Verify an email OTP (sign-up confirmation).
   * After success the session is established and `user` is populated.
   */
  verifyEmail: (email: string, otp: string) => Promise<void>;
  /** Resend the sign-up OTP to the supplied address */
  resendVerificationEmail: (email: string) => Promise<void>;
  /** OAuth redirect (Google) */
  signUpWithOAuth: (provider: "google") => Promise<void>;
  logout: () => Promise<void>;
  isRegistered: boolean;
  completeRegistration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive a LISTA User record from the InsForge / Supabase user object */
function mapInsForgeUser(insUser: any): User | null {
  if (!insUser) return null;
  const email: string = insUser.email || "";

  // Priority: role stored in app_metadata (set by admin)
  let role: UserRole = "trainee";
  const appRole = insUser.app_metadata?.role as string | undefined;
  if (appRole === "admin" || appRole === "staff") {
    role = appRole;
  }

  return {
    id: insUser.id,
    name:
      insUser.user_metadata?.full_name ||
      insUser.user_metadata?.name ||
      email.split("@")[0],
    email,
    role,
    avatarUrl: insUser.user_metadata?.avatar_url || "",
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  /** Restore an existing session on mount */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data, error } = await lista.auth.getCurrentUser();
        if (!error && data?.user) {
          const mapped = mapInsForgeUser(data.user);
          setUser(mapped);
          if (mapped) {
            setIsRegistered(
              localStorage.getItem(`reg_${mapped.id}`) === "true"
            );
          }
        }
      } catch (err) {
        console.error("[AuthProvider] Session restore failed:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  // ── Auth methods ─────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const { data, error } = await lista.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // SDK returns CreateSessionResponse; user lives at data.user
    const rawUser = (data as any)?.user ?? null;
    if (rawUser) {
      const mapped = mapInsForgeUser(rawUser);
      setUser(mapped);
      if (mapped) {
        setIsRegistered(localStorage.getItem(`reg_${mapped.id}`) === "true");
      }
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await lista.auth.signUp({
      email,
      password,
      ...(name ? { name } : {}),
    } as any);
    if (error) throw error;
    // Don't set user yet — the account must be verified first.
  };

  const verifyEmail = async (email: string, otp: string) => {
    const { data, error } = await lista.auth.verifyEmail({ email, otp });
    if (error) throw error;
    const rawUser = (data as any)?.user ?? null;
    if (rawUser) {
      const mapped = mapInsForgeUser(rawUser);
      setUser(mapped);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await lista.auth.resendVerificationEmail({ email });
    if (error) throw error;
  };

  const signUpWithOAuth = async (provider: "google") => {
    const { data, error } = await lista.auth.signInWithOAuth({
      provider,
      redirectTo: window.location.origin + "/auth/callback",
    });
    if (error) throw error;
    // InsForge PKCE flow returns the authorisation URL — we redirect manually.
    const url = (data as any)?.url;
    if (url) window.location.href = url;
  };

  const logout = async () => {
    await lista.auth.signOut();
    setUser(null);
    setIsRegistered(false);
  };

  const completeRegistration = () => {
    if (user) {
      localStorage.setItem(`reg_${user.id}`, "true");
      setIsRegistered(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isInitializing,
        login,
        signUp,
        verifyEmail,
        resendVerificationEmail,
        signUpWithOAuth,
        logout,
        isRegistered,
        completeRegistration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

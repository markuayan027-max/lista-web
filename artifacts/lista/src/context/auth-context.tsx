import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, UserRole } from "../lib/institutional-data";
import { lista } from "../lib/insforge";
import { isTraineeRegistrationComplete, skipsTraineeApplication } from "../lib/role-navigation";

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

const baseUrl = import.meta.env.VITE_INSFORGE_URL || "https://2r6c3q25.ap-southeast.insforge.app";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Staff/admin only from public.users or server-controlled app_metadata — never user_metadata. */
async function resolveUserRole(email: string, insUser: Record<string, unknown>): Promise<UserRole> {
  try {
    const { data } = await lista.from("users").select("role").eq("email", email.toLowerCase()).maybeSingle();
    const dbRole = (data as { role?: string } | null)?.role?.toLowerCase();
    if (dbRole === "admin" || dbRole === "staff") return dbRole;
  } catch {
    // ignore
  }
  const appMeta = insUser.app_metadata as Record<string, unknown> | undefined;
  const meta = insUser.metadata as Record<string, unknown> | undefined;
  const appRole = (appMeta?.role ?? meta?.role) as string | undefined;
  if (appRole === "admin" || appRole === "staff") return appRole;
  return "trainee";
}

async function mapInsForgeUser(insUser: any): Promise<User | null> {
  if (!insUser) return null;
  const email: string = insUser.email || "";

  const resolvedRole = await resolveUserRole(email, insUser as Record<string, unknown>);

  return {
    id: insUser.id,
    name:
      insUser.user_metadata?.full_name ||
      insUser.user_metadata?.name ||
      email.split("@")[0],
    email,
    role: resolvedRole,
    avatarUrl: insUser.user_metadata?.avatar_url || "",
  };
}

/** Merge session/current or refresh payload into lista_session and apply user state. */
async function applySessionPayload(
  payload: Record<string, unknown>,
  setUser: (u: User | null) => void,
  setIsRegistered: (v: boolean) => void,
) {
  localStorage.setItem("lista_session", JSON.stringify(payload));
  const token = payload.accessToken;
  lista.setAccessToken(typeof token === "string" ? token : null);
  const rawUser = (payload.user ?? null) as Record<string, unknown> | null;
  if (!rawUser) return;
  const mapped = await mapInsForgeUser(rawUser);
  setUser(mapped);
  if (mapped) {
    setIsRegistered(isTraineeRegistrationComplete(mapped));
  }
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
        const storedStr = localStorage.getItem("lista_session");
        if (storedStr) {
          const session = JSON.parse(storedStr) as Record<string, unknown>;
          lista.setAccessToken(typeof session.accessToken === "string" ? session.accessToken : null);

          // Optimistic UI from cache; role is re-resolved from server after verify.
          if (session.user) {
            const mapped = await mapInsForgeUser(session.user);
            setUser(mapped);
            if (mapped) {
              setIsRegistered(isTraineeRegistrationComplete(mapped));
            }
          }

          setIsInitializing(false);

          const res = await fetch(`${baseUrl}/api/auth/sessions/current`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });

          if (res.ok) {
            const current = (await res.json()) as Record<string, unknown>;
            await applySessionPayload(
              { ...session, ...current, user: current.user ?? session.user },
              setUser,
              setIsRegistered,
            );
            return;
          }

          const refreshRes = await fetch(`${baseUrl}/api/auth/refresh?client_type=mobile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: session.refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = (await refreshRes.json()) as Record<string, unknown>;
            await applySessionPayload(refreshData, setUser, setIsRegistered);
            return;
          }

          throw new Error("Session expired");
        }

        // Fallback to SDK cookies if no local storage
        const { data, error } = await lista.auth.getCurrentUser();
        if (!error && data?.user) {
          const mapped = await mapInsForgeUser(data.user);
          setUser(mapped);
          if (mapped) {
            setIsRegistered(isTraineeRegistrationComplete(mapped));
          }
        }
      } catch (err) {
        console.error("[AuthProvider] Session restore failed:", err);
        localStorage.removeItem("lista_session");
        lista.setAccessToken(null);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  // ── Auth methods ─────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const res = await fetch(`${baseUrl}/api/auth/sessions?client_type=mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Invalid login credentials");
    }
    
    const data = (await res.json()) as Record<string, unknown>;
    await applySessionPayload(data, setUser, setIsRegistered);
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
    const res = await fetch(`${baseUrl}/api/auth/email/verify?client_type=mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Invalid verification code");
    }

    const data = (await res.json()) as Record<string, unknown>;
    await applySessionPayload(data, setUser, setIsRegistered);
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
    localStorage.removeItem("lista_session");
    localStorage.removeItem("lista_trainee_profile_draft");
    localStorage.removeItem("lista_trainee_profile_pic");
    lista.setAccessToken(null);
    setUser(null);
    setIsRegistered(false);
  };

  const completeRegistration = () => {
    if (!user || skipsTraineeApplication(user)) return;
    localStorage.setItem(`reg_${user.id}`, "true");
    setIsRegistered(true);
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

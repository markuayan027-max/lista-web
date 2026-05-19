import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, UserRole } from "../lib/institutional-data";
import { lista } from "../lib/insforge";
import { isTraineeRegistrationComplete, skipsTraineeApplication } from "../lib/role-navigation";
import { resolveTraineeRegistrationFromCloud } from "../lib/trainee-registration-state";
import { clearLocalProfile, clearProfilePic } from "../lib/profile-utils";
import { authApiRequest, authApiUrl } from "../lib/auth-api";
import { ensureAccessToken, getStoredSession } from "../lib/auth-token";
import { ensurePublicTraineeUser } from "../lib/ensure-public-trainee";

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
  markRegistrationPartial: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Staff/admin from server-controlled app_metadata only — no browser InsForge users query (avoids CORS/503). */
async function resolveUserRole(_email: string, insUser: Record<string, unknown>): Promise<UserRole> {
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

async function hydrateTraineeRegistration(
  mapped: User,
  setIsRegistered: (v: boolean) => void,
): Promise<void> {
  if (skipsTraineeApplication(mapped)) {
    setIsRegistered(true);
    return;
  }
  if (isTraineeRegistrationComplete(mapped)) {
    setIsRegistered(true);
    return;
  }
  try {
    const fromCloud = await resolveTraineeRegistrationFromCloud(mapped);
    setIsRegistered(fromCloud);
  } catch {
    setIsRegistered(false);
  }
}

/** Normalize InsForge session JSON (camelCase or legacy snake_case). */
function normalizeAuthSession(payload: Record<string, unknown>): Record<string, unknown> {
  const accessToken = payload.accessToken ?? payload.access_token;
  const refreshToken = payload.refreshToken ?? payload.refresh_token;
  return {
    ...payload,
    ...(typeof accessToken === "string" ? { accessToken } : {}),
    ...(typeof refreshToken === "string" ? { refreshToken } : {}),
    user: payload.user,
  };
}

/** Merge session/current or refresh payload into lista_session and apply user state. */
async function applySessionPayload(
  payload: Record<string, unknown>,
  setUser: (u: User | null) => void,
  setIsRegistered: (v: boolean) => void,
) {
  const session = normalizeAuthSession(payload);
  localStorage.setItem("lista_session", JSON.stringify(session));
  const token = session.accessToken;
  lista.setAccessToken(typeof token === "string" ? token : null);
  const rawUser = (session.user ?? null) as Record<string, unknown> | null;
  if (!rawUser) {
    throw new Error("Sign-in succeeded but your profile could not be loaded. Please try again.");
  }
  const mapped = await mapInsForgeUser(rawUser);
  setUser(mapped);
  if (mapped) {
    if (mapped.role === "trainee") {
      void ensurePublicTraineeUser({
        email: mapped.email,
        firstName: mapped.name.split(" ")[0],
        lastName: mapped.name.split(" ").slice(1).join(" ") || "-",
      });
    }
    // Do not block sign-in / verify on enrollment fetch — resolves in background.
    void hydrateTraineeRegistration(mapped, setIsRegistered).catch(() => setIsRegistered(false));
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
        const session = getStoredSession();
        if (session) {
          lista.setAccessToken(
            typeof session.accessToken === "string" ? session.accessToken : null,
          );

          // Optimistic UI from cache only — no protected API calls until token is valid.
          if (session.user) {
            const mapped = await mapInsForgeUser(session.user);
            setUser(mapped);
          }

          const token = await ensureAccessToken();
          if (!token) {
            throw new Error("Session expired");
          }

          const verified = getStoredSession();
          if (verified) {
            await applySessionPayload(
              verified as Record<string, unknown>,
              setUser,
              setIsRegistered,
            );
          }
          return;
        }

        // In dev, auth goes through /api proxy — skip cross-origin SDK cookie probe.
        if (import.meta.env.DEV) {
          return;
        }

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
    const data = await authApiRequest<Record<string, unknown>>(
      "/api/auth/sessions?client_type=mobile",
      {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      },
    );
    await applySessionPayload(normalizeAuthSession(data), setUser, setIsRegistered);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    await authApiRequest("/api/auth/users?client_type=mobile", {
      method: "POST",
      body: {
        email: email.trim().toLowerCase(),
        password,
        ...(name ? { name } : {}),
      },
    });
    // Don't set user yet — the account must be verified first.
  };

  const verifyEmail = async (email: string, otp: string) => {
    const data = await authApiRequest<Record<string, unknown>>(
      "/api/auth/email/verify?client_type=mobile",
      {
        method: "POST",
        body: { email: email.trim().toLowerCase(), otp: otp.trim() },
      },
    );
    await applySessionPayload(normalizeAuthSession(data), setUser, setIsRegistered);
  };

  const resendVerificationEmail = async (email: string) => {
    await authApiRequest("/api/auth/email/send-verification", {
      method: "POST",
      body: { email: email.trim().toLowerCase() },
    });
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
    try {
      const storedStr = localStorage.getItem("lista_session");
      if (storedStr) {
        try {
          const session = JSON.parse(storedStr) as { accessToken?: string };
          if (session.accessToken) {
            await fetch(authApiUrl("/api/auth/sessions/current"), {
              method: "DELETE",
              headers: { Authorization: `Bearer ${session.accessToken}` },
            });
          }
        } catch {
          // Best-effort revoke for mobile sessions; local clear still runs in finally.
        }
      }
      await lista.auth.signOut();
    } catch (err) {
      console.warn("[AuthProvider] signOut failed:", err);
    } finally {
      const signingOutId = user?.id;
      localStorage.removeItem("lista_session");
      clearLocalProfile(signingOutId);
      clearProfilePic(signingOutId);
      lista.setAccessToken(null);
      setUser(null);
      setIsRegistered(false);
    }
  };

  const markRegistrationPartial = () => {
    if (!user || skipsTraineeApplication(user)) return;
    localStorage.setItem(`reg_${user.id}`, "partial");
    setIsRegistered(true);
  };

  const completeRegistration = () => {
    if (!user || skipsTraineeApplication(user)) return;
    localStorage.setItem(`reg_${user.id}`, "complete");
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
        markRegistrationPartial,
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

import { useState, ReactNode, useEffect } from "react";
import { User } from "../lib/institutional-data";
import { AuthContext, type AuthContextType } from "./use-auth";

export { useAuth } from "./use-auth";
export type { AuthContextType };
import {
  clearOAuthCallbackParams,
  clearPkceVerifierFromStorage,
  getPkceVerifierFromStorage,
  lista,
  readSdkAuthSession,
} from "../lib/insforge";
import { isTraineeRegistrationComplete, skipsTraineeApplication } from "../lib/role-navigation";
import { clearLocalProfile, clearProfilePic } from "../lib/profile-utils";
import { authApiRequest, authApiUrl } from "../lib/auth-api";
import { resolveUserRole } from "../lib/resolve-auth-role";
import {
  clearAccessTokenCache,
  ensureAccessToken,
  getStoredSession,
} from "../lib/auth-token";
import { clearTraineeSyncMarkers, syncTraineeSideEffects } from "../lib/auth-trainee-sync";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function mapInsForgeUser(insUser: any): Promise<User | null> {
  if (!insUser) return null;
  const email: string = insUser.email || "";

  const token = await ensureAccessToken();
  const resolvedRole = await resolveUserRole(
    email,
    insUser as Record<string, unknown>,
    token,
  );

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
    void syncTraineeSideEffects(mapped, setIsRegistered).catch(() => setIsRegistered(false));
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

          const token = await ensureAccessToken();
          if (!token) {
            throw new Error("Session expired");
          }

          const verified = getStoredSession();
          const rawUser = verified?.user as Record<string, unknown> | undefined;
          if (rawUser) {
            const mapped = await mapInsForgeUser(rawUser);
            setUser(mapped);
            if (mapped) {
              void syncTraineeSideEffects(mapped, setIsRegistered).catch(() =>
                setIsRegistered(false),
              );
            }
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
        clearAccessTokenCache();
        clearTraineeSyncMarkers();
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
    const url = (data as { url?: string })?.url;
    if (url) window.location.href = url;
  };

  const completeOAuthCallback = async () => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error_description") || params.get("error");
    if (oauthError) {
      throw new Error(oauthError);
    }

    const sdkSession = await readSdkAuthSession();
    if (sdkSession) {
      await applySessionPayload(
        normalizeAuthSession({
          accessToken: sdkSession.accessToken,
          refreshToken: sdkSession.refreshToken,
          user: sdkSession.user,
        }),
        setUser,
        setIsRegistered,
      );
      clearPkceVerifierFromStorage();
      clearOAuthCallbackParams();
      return;
    }

    const code = params.get("insforge_code");
    if (!code) {
      throw new Error("No sign-in session found. Please try again from the login page.");
    }

    const verifier = getPkceVerifierFromStorage();
    if (!verifier) {
      throw new Error(
        "Sign-in session expired. Close this tab and use Continue with Google again.",
      );
    }

    const data = await authApiRequest<Record<string, unknown>>(
      "/api/auth/oauth/exchange?client_type=mobile",
      {
        method: "POST",
        body: { code, code_verifier: verifier },
      },
    );
    clearPkceVerifierFromStorage();
    clearOAuthCallbackParams();
    await applySessionPayload(normalizeAuthSession(data), setUser, setIsRegistered);
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
      clearAccessTokenCache();
      clearTraineeSyncMarkers();
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
        completeOAuthCallback,
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


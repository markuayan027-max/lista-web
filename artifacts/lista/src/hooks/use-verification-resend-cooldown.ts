import { useCallback, useEffect, useState } from "react";

/** Cooldown after a verification email/code is sent (abuse prevention). */
export const VERIFICATION_RESEND_COOLDOWN_SEC = 60;

const STORAGE_PREFIX = "lista_signup_verification_sent_";

function storageKey(email: string): string {
  return `${STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

/** Seconds remaining for this email, derived from persisted send timestamp. */
export function readVerificationCooldownRemaining(email: string): number {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return 0;
  try {
    const raw = localStorage.getItem(storageKey(normalized));
    if (!raw) return 0;
    const sentAt = Number(raw);
    if (!Number.isFinite(sentAt)) return 0;
    const elapsed = Math.floor((Date.now() - sentAt) / 1000);
    return Math.max(0, VERIFICATION_RESEND_COOLDOWN_SEC - elapsed);
  } catch {
    return 0;
  }
}

export function persistVerificationCooldownStart(email: string): void {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  try {
    localStorage.setItem(storageKey(normalized), String(Date.now()));
  } catch {
    // Private browsing / quota — in-memory countdown still runs this session
  }
}

/**
 * 60s resend cooldown with localStorage persistence (survives refresh & other tabs).
 */
export function useVerificationResendCooldown(email: string) {
  const normalized = email.trim().toLowerCase();

  const [secondsLeft, setSecondsLeft] = useState(() =>
    readVerificationCooldownRemaining(normalized),
  );

  const syncFromStorage = useCallback(() => {
    setSecondsLeft(readVerificationCooldownRemaining(normalized));
  }, [normalized]);

  const startCooldown = useCallback(() => {
    persistVerificationCooldownStart(normalized);
    setSecondsLeft(VERIFICATION_RESEND_COOLDOWN_SEC);
  }, [normalized]);

  // Re-read when email changes
  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  // Tick every second while cooldown active
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(syncFromStorage, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft > 0, syncFromStorage]);

  // Tab switch / another tab sent code
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey(normalized)) syncFromStorage();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") syncFromStorage();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [normalized, syncFromStorage]);

  return {
    secondsLeft,
    isOnCooldown: secondsLeft > 0,
    startCooldown,
  };
}

import type { User } from "@/lib/institutional-data";
import { isTraineeRegistrationComplete, skipsTraineeApplication } from "@/lib/role-navigation";
import { resolveTraineeRegistrationFromCloud } from "@/lib/trainee-registration-state";
import { ensurePublicTraineeUser } from "@/lib/ensure-public-trainee";

const SYNC_STORAGE_PREFIX = "lista_trainee_sync:";
const SYNC_TTL_MS = 5 * 60_000;

let syncInFlightUserId: string | null = null;

function syncStorageKey(userId: string): string {
  return `${SYNC_STORAGE_PREFIX}${userId}`;
}

function recentlySynced(userId: string): boolean {
  try {
    const raw = sessionStorage.getItem(syncStorageKey(userId));
    if (!raw) return false;
    const at = Number(raw);
    return Number.isFinite(at) && Date.now() - at < SYNC_TTL_MS;
  } catch {
    return false;
  }
}

function markSynced(userId: string): void {
  try {
    sessionStorage.setItem(syncStorageKey(userId), String(Date.now()));
  } catch {
    // ignore
  }
}

export function clearTraineeSyncMarkers(): void {
  syncInFlightUserId = null;
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(SYNC_STORAGE_PREFIX)) sessionStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
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

/** One ensure-trainee + registration hydrate per user (survives Vite HMR reload). */
export async function syncTraineeSideEffects(
  mapped: User,
  setIsRegistered: (v: boolean) => void,
): Promise<void> {
  if (mapped.role !== "trainee") return;
  if (recentlySynced(mapped.id)) {
    if (skipsTraineeApplication(mapped) || isTraineeRegistrationComplete(mapped)) {
      setIsRegistered(true);
      return;
    }
    // TTL hit: still re-check cloud — local `reg_*` can be stale on a new device or after OAuth.
    try {
      const fromCloud = await resolveTraineeRegistrationFromCloud(mapped);
      setIsRegistered(fromCloud);
    } catch {
      try {
        const reg = localStorage.getItem(`reg_${mapped.id}`);
        setIsRegistered(reg === "complete" || reg === "partial");
      } catch {
        setIsRegistered(false);
      }
    }
    return;
  }
  if (syncInFlightUserId === mapped.id) return;

  syncInFlightUserId = mapped.id;
  try {
    await ensurePublicTraineeUser({
      email: mapped.email,
      firstName: mapped.name.split(" ")[0],
      lastName: mapped.name.split(" ").slice(1).join(" ") || "-",
    });
    await hydrateTraineeRegistration(mapped, setIsRegistered);
    markSynced(mapped.id);
  } finally {
    if (syncInFlightUserId === mapped.id) syncInFlightUserId = null;
  }
}

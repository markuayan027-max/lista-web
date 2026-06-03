let announcementsCache: { data: unknown; cachedAt: number } | null = null;

export const ANNOUNCEMENTS_CACHE_TTL_MS = 60_000;

export function getAnnouncementsCache(): typeof announcementsCache {
  return announcementsCache;
}

export function setAnnouncementsCache(data: unknown): void {
  announcementsCache = { data, cachedAt: Date.now() };
}

export function invalidateAnnouncementsCache(): void {
  announcementsCache = null;
}

export function isAnnouncementsCacheFresh(): boolean {
  if (!announcementsCache) return false;
  return Date.now() - announcementsCache.cachedAt < ANNOUNCEMENTS_CACHE_TTL_MS;
}

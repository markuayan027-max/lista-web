import type { NextFunction, Request, Response } from "express";

/** Restore original URL when Vercel rewrites `/api/(.*)` → `/api`. */
export function restoreVercelOriginalPath(req: Request, _res: Response, next: NextFunction) {
  const raw =
    (req.headers["x-vercel-original-url"] as string | undefined) ??
    (req.headers["x-forwarded-uri"] as string | undefined) ??
    (req.headers["x-invoke-path"] as string | undefined);

  if (!raw) return next();

  try {
    if (raw.startsWith("http")) {
      const u = new URL(raw);
      req.url = u.pathname + u.search;
    } else {
      req.url = raw.startsWith("/") ? raw : `/${raw}`;
    }
  } catch {
    // keep req.url
  }
  next();
}

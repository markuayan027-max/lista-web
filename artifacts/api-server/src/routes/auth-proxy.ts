import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const insforgeBase = (
  process.env.VITE_INSFORGE_URL ||
  process.env.INSFORGE_URL ||
  "https://2r6c3q25.ap-southeast.insforge.app"
).replace(/\/$/, "");

const FORWARD_REQUEST_HEADERS = ["content-type", "authorization", "x-csrf-token"] as const;

async function forwardAuth(req: Request, res: Response): Promise<void> {
  const suffix = req.url.startsWith("/") ? req.url : `/${req.url}`;
  const targetUrl = `${insforgeBase}/api/auth${suffix}`;

  try {
    const headers: Record<string, string> = {};
    for (const name of FORWARD_REQUEST_HEADERS) {
      const value = req.headers[name];
      if (typeof value === "string") headers[name] = value;
    }

    const hasBody = !["GET", "HEAD"].includes(req.method.toUpperCase());
    if (hasBody && !headers["content-type"]) {
      headers["content-type"] = "application/json";
    }

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
      signal: AbortSignal.timeout(25_000),
    });

    const body = await upstream.arrayBuffer();
    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (key === "transfer-encoding") return;
      res.setHeader(key, value);
    });
    res.send(Buffer.from(body));
  } catch (err) {
    logger.error({ err, targetUrl, method: req.method }, "InsForge auth proxy failed");
    res.status(502).json({
      error: "AUTH_PROXY_ERROR",
      message: "Cannot reach authentication service. Try again shortly.",
    });
  }
}

/** Forwards /api/auth/* to InsForge — avoids browser CORS/timeouts in local dev. */
const authProxyRouter: IRouter = Router();

authProxyRouter.use(forwardAuth);

export default authProxyRouter;

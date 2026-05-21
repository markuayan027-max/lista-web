/**
 * Vercel serverless entry — same-origin /api/* for lista-frontend (lista.dpdns.org).
 * Do not use Cloudflare Worker-only app-worker here (pino-http is fine on Node).
 */
import app from "../artifacts/api-server/src/app.js";

export default app;

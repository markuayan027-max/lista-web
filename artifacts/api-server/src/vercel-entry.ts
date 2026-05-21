import express from "express";
import { mountAppRoutes } from "./app-base.js";
import { workerRequestLogger } from "./middleware/http-logger-worker.js";
import { restoreVercelOriginalPath } from "./middleware/vercel-path.js";

/** Vercel serverless: no pino-http worker threads (avoids FUNCTION_INVOCATION_FAILED). */
const app = express();
app.use(restoreVercelOriginalPath);
app.use(workerRequestLogger);
mountAppRoutes(app);

export default app;

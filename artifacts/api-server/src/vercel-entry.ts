import express from "express";
import { mountAppRoutes } from "./app-base.js";
import { attachNodeRequestLogger } from "./middleware/http-logger-node.js";
import { restoreVercelOriginalPath } from "./middleware/vercel-path.js";

const app = express();
app.use(restoreVercelOriginalPath);
attachNodeRequestLogger(app);
mountAppRoutes(app);

export default app;

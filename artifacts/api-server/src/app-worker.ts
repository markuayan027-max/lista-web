import express from "express";
import { mountAppRoutes } from "./app-base.js";
import { workerRequestLogger } from "./middleware/http-logger-worker.js";

const app = express();
app.use(workerRequestLogger);
mountAppRoutes(app);

export default app;

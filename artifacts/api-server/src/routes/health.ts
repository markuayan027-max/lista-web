import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const healthPayload = () => HealthCheckResponse.parse({ status: "ok" });

router.get("/healthz", (_req, res) => {
  res.json(healthPayload());
});

/** Alias for deployment smoke tests (runbook uses /api/health). */
router.get("/health", (_req, res) => {
  res.json(healthPayload());
});

export default router;

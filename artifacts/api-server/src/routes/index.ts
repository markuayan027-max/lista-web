import { Router } from "express";
import healthRouter from "./health.js";
import dataRouter from "./data.js";
import traineesRouter from "./trainees.js";
import usersRouter from "./users.js";
import enrollmentsRouter from "./enrollments.js";
import batchesRouter from "./batches.js";
import authProxyRouter from "./auth-proxy.js";
import homepageChatRouter from "./homepage-chat.js";

const router = Router();

router.use("/auth", authProxyRouter);
router.use(homepageChatRouter);
router.use(healthRouter);
router.use(dataRouter);
router.use("/users", usersRouter);
router.use("/enrollments", enrollmentsRouter);
router.use("/batches", batchesRouter);
router.use("/trainees", traineesRouter);

export default router;

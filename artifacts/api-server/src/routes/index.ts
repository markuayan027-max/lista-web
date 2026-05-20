import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dataRouter from "./data";
import traineesRouter from "./trainees";
import usersRouter from "./users";
import enrollmentsRouter from "./enrollments";
import batchesRouter from "./batches";
import authProxyRouter from "./auth-proxy";
import homepageChatRouter from "./homepage-chat";

const router: IRouter = Router();

router.use("/auth", authProxyRouter);
router.use(homepageChatRouter);
router.use(healthRouter);
router.use(dataRouter);
router.use("/users", usersRouter);
router.use("/enrollments", enrollmentsRouter);
router.use("/batches", batchesRouter);
router.use("/trainees", traineesRouter);

export default router;

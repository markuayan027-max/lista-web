import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dataRouter from "./data";
import traineesRouter from "./trainees";
import usersRouter from "./users";
import authProxyRouter from "./auth-proxy";

const router: IRouter = Router();

router.use("/auth", authProxyRouter);
router.use(healthRouter);
router.use(dataRouter);
router.use("/users", usersRouter);
router.use("/trainees", traineesRouter);

export default router;

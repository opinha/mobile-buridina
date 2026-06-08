import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import aldeiaRouter from "./aldeias.js";
import membroRouter from "./membros.js";
import authRouter from "./auth.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aldeiaRouter);
router.use(membroRouter);
router.use("/auth", authRouter);

export default router;

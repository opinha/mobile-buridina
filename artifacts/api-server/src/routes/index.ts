import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aldeiaRouter from "./aldeias";
import membroRouter from "./membros";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aldeiaRouter);
router.use(membroRouter);

export default router;

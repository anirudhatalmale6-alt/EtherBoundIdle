import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import entitiesRouter from "./entities";
import functionsRouter from "./functions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(entitiesRouter);
router.use(functionsRouter);

export default router;

import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import entitiesRouter from "./entities";


const router = Router();

router.use(entitiesRouter);
router.use(healthRouter);
router.use(authRouter);

export default router;

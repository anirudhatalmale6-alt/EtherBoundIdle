import { Router, type IRouter } from "express";
import { sendSuccess } from "../lib/response";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  sendSuccess(res, { status: "ok" });
});

export default router;

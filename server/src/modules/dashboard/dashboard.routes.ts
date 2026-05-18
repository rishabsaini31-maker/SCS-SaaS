import { Router } from "express";
import * as controller from "./dashboard.controller";

const router = Router();

router.get("/metrics", controller.getMetrics);

export default router;

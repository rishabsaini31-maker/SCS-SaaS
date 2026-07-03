import { Router } from "express";
import * as controller from "./backup.controller";
import { searchRateLimiter } from "../../common/middlewares/rateLimiter";

const router = Router();

router.get("/", searchRateLimiter, controller.listBackups);
router.post("/trigger", searchRateLimiter, controller.triggerManualBackup);
router.get("/:id", searchRateLimiter, controller.getBackupById);

export default router;

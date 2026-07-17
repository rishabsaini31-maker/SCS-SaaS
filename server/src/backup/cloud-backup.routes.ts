import { Router } from "express";
import * as controller from "./cloud-backup.controller";
import { requireOwner } from "../common/middlewares/requireRole";

import * as drController from "./dr-monitoring.controller";

const router = Router();

// Apply owner restriction to all cloud backup routes
router.use(requireOwner);

router.get("/", controller.getBackupHistory);
router.get("/dashboard", controller.getDashboardStats);
router.get("/health", drController.getDRHealth);
router.get("/sla-analytics", drController.getSlaAnalytics);
router.post("/trigger", controller.triggerManualBackup);
router.post("/:id/verify", controller.verifyBackup);
router.post("/:id/verify-integrity", drController.verifyIntegrity);
router.post("/:id/retry", drController.retryBackup);
router.delete("/:id", drController.deleteBackup);
router.get("/:id/download", controller.downloadBackup);

export default router;

import { Router } from "express";
import * as controller from "./restore.controller";
import { requireOwner } from "../common/middlewares/requireRole";

const router = Router();

// Apply owner restriction to all cloud restore routes
router.use(requireOwner);

router.get("/history", controller.getRestoreHistory);
router.post("/:backupId/preview", controller.previewRestore);
router.post("/:backupId/trigger", controller.triggerRestore);
router.get("/progress/:restoreId", controller.getRestoreProgress);

export default router;

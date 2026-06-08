import { Router } from "express";
import * as controller from "./backup.controller";

const router = Router();

router.get("/", controller.listBackups);
router.post("/trigger", controller.triggerManualBackup);
router.get("/:id", controller.getBackupById);

export default router;

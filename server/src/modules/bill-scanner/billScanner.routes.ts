import { Router } from "express";
import multer from "multer";
import * as controller from "./billScanner.controller";
import * as localScannerController from "../local-scanner/localScanner.controller";

const upload = multer({
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  storage: multer.memoryStorage(),
});

const router = Router();

router.post("/scan", upload.single("billFile"), localScannerController.scanLocalBill);
router.post("/check-duplicate", controller.checkDuplicate);
router.post("/remember-mapping", controller.saveMapping);

export default router;

import { Router } from "express";
import * as controller from "./barcode.controller";

const router = Router();

router.post("/generate", controller.generate);
router.get("/:productId", controller.get);
router.post("/print-data", controller.printData);

export default router;

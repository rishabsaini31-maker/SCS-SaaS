import { Router } from "express";
import * as controller from "./barcode.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { barcodeRateLimiter } from "../../common/middlewares/rateLimiter";
import {
  generateBarcodeSchema,
  getBarcodeParamsSchema,
  printDataSchema,
  updatePrintingConfigSchema,
  printTsplSchema,
} from "./barcode.schema";

const router = Router();

router.get("/printing-config", barcodeRateLimiter, controller.getPrintingConfig);
router.patch(
  "/printing-config",
  barcodeRateLimiter,
  validateRequest({ body: updatePrintingConfigSchema }),
  controller.updatePrintingConfig,
);
router.post("/generate", barcodeRateLimiter, validateRequest({ body: generateBarcodeSchema }), controller.generate);
router.post("/print-data", barcodeRateLimiter, validateRequest({ body: printDataSchema }), controller.printData);
router.post("/print-tspl", barcodeRateLimiter, validateRequest({ body: printTsplSchema }), controller.printTspl);
router.get("/:productId", barcodeRateLimiter, validateRequest({ params: getBarcodeParamsSchema }), controller.get);

export default router;

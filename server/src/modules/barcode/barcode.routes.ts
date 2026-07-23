import { Router } from "express";
import * as controller from "./barcode.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { barcodeRateLimiter } from "../../common/middlewares/rateLimiter";
import { generateBarcodeSchema, getBarcodeParamsSchema, printDataSchema } from "./barcode.schema";

const router = Router();

router.post("/generate", barcodeRateLimiter, validateRequest({ body: generateBarcodeSchema }), controller.generate);
router.get("/:productId", barcodeRateLimiter, validateRequest({ params: getBarcodeParamsSchema }), controller.get);
router.post("/print-data", barcodeRateLimiter, validateRequest({ body: printDataSchema }), controller.printData);

export default router;

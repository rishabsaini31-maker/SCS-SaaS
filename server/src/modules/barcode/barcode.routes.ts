import { Router } from "express";
import * as controller from "./barcode.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { searchRateLimiter } from "../../common/middlewares/rateLimiter";
import { generateBarcodeSchema, getBarcodeParamsSchema, printDataSchema } from "./barcode.schema";

const router = Router();

router.post("/generate", searchRateLimiter, validateRequest({ body: generateBarcodeSchema }), controller.generate);
router.get("/:productId", searchRateLimiter, validateRequest({ params: getBarcodeParamsSchema }), controller.get);
router.post("/print-data", searchRateLimiter, validateRequest({ body: printDataSchema }), controller.printData);

export default router;

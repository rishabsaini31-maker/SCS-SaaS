import { Router } from "express";
import * as controller from "./purchases.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { searchRateLimiter } from "../../common/middlewares/rateLimiter";
import { createPurchaseSchema, purchaseIdSchema, updatePurchaseSchema } from "./purchases.schema";
import { z } from "zod";

const purchasesListQuerySchema = z.object({
	supplierId: z.string().optional(),
	status: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

const router = Router();

router.post("/", validateRequest({ body: createPurchaseSchema }), controller.create);
router.get("/", searchRateLimiter, validateRequest({ query: purchasesListQuerySchema }), controller.list);
router.get("/:id", validateRequest({ params: purchaseIdSchema }), controller.getById);
router.patch("/:id", validateRequest({ params: purchaseIdSchema, body: updatePurchaseSchema }), controller.update);

export default router;

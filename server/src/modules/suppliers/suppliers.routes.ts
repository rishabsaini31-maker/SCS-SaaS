import { Router } from "express";
import * as controller from "./suppliers.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { searchRateLimiter } from "../../common/middlewares/rateLimiter";
import {
	createSupplierSchema,
	supplierIdSchema,
	updateSupplierSchema,
} from "./suppliers.schema";
import { z } from "zod";

const suppliersListQuerySchema = z.object({
	search: z.string().optional(),
});

const router = Router();

router.post("/", validateRequest({ body: createSupplierSchema }), controller.create);
router.get("/", searchRateLimiter, validateRequest({ query: suppliersListQuerySchema }), controller.list);
router.get("/:id", validateRequest({ params: supplierIdSchema }), controller.getById);
router.get("/:id/recent-items", validateRequest({ params: supplierIdSchema }), controller.getRecentItems);
router.get("/:id/ledger", validateRequest({ params: supplierIdSchema }), controller.getLedger);
router.patch("/:id", validateRequest({ params: supplierIdSchema, body: updateSupplierSchema }), controller.update);
router.delete("/:id", validateRequest({ params: supplierIdSchema }), controller.deleteSupplier);

export default router;

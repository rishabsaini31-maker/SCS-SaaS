import { Router } from "express";
import * as controller from "./products.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import {
	createProductSchema,
	productIdSchema,
	updateProductSchema,
} from "./products.schema";
import { searchRateLimiter } from "../../common/middlewares/rateLimiter";
import { z } from "zod";

const productsListQuerySchema = z.object({
	category: z.string().optional(),
	status: z.string().optional(),
	search: z.string().optional(),
	barcode: z.string().optional(),
	threshold: z.coerce.number().int().optional(),
	q: z.string().optional(),
	query: z.string().optional(),
});

const activateBodySchema = z.object({
	sellingPrice: z.coerce.number(),
});

const router = Router();

router.post("/", validateRequest({ body: createProductSchema }), controller.create);
router.get("/", searchRateLimiter, validateRequest({ query: productsListQuerySchema }), controller.getProducts);
router.get("/suggest", searchRateLimiter, validateRequest({ query: productsListQuerySchema }), controller.suggest);
router.get("/low-stock", searchRateLimiter, validateRequest({ query: productsListQuerySchema }), controller.getLowStock);
router.post("/:id/activate", validateRequest({ params: productIdSchema, body: activateBodySchema }), controller.activate);
router.get("/:id", validateRequest({ params: productIdSchema }), controller.getById);
router.patch("/:id", validateRequest({ params: productIdSchema, body: updateProductSchema }), controller.update);
router.delete("/:id", validateRequest({ params: productIdSchema }), controller.deleteProduct);

export default router;

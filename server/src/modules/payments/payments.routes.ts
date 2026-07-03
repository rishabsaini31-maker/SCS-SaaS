import { Router } from "express";
import * as controller from "./payments.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { searchRateLimiter } from "../../common/middlewares/rateLimiter";
import {
	createPaymentSchema,
	paymentIdSchema,
	updatePaymentSchema,
} from "./payments.schema";
import { z } from "zod";

const paymentsListQuerySchema = z.object({
	customerId: z.string().optional(),
	supplierId: z.string().optional(),
});

const router = Router();

router.post("/", validateRequest({ body: createPaymentSchema }), controller.create);
router.get("/", searchRateLimiter, validateRequest({ query: paymentsListQuerySchema }), controller.list);
router.get("/:id", validateRequest({ params: paymentIdSchema }), controller.getById);
router.patch("/:id", validateRequest({ params: paymentIdSchema, body: updatePaymentSchema }), controller.update);

export default router;

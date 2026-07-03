import { Router } from "express";
import * as controller from "./customers.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { searchRateLimiter } from "../../common/middlewares/rateLimiter";
import {
	createCustomerSchema,
	customerIdSchema,
	updateCustomerSchema,
} from "./customers.schema";

import { z } from "zod";


const customersListQuerySchema = z.object({
	status: z.string().optional(),
	search: z.string().optional(),
});

const router = Router();

router.post("/", validateRequest({ body: createCustomerSchema }), controller.create);
router.get("/", searchRateLimiter, validateRequest({ query: customersListQuerySchema }), controller.list);
router.get("/:id", validateRequest({ params: customerIdSchema }), controller.getById);
router.get("/:id/ledger", validateRequest({ params: customerIdSchema }), controller.getLedger);
router.patch("/:id", validateRequest({ params: customerIdSchema, body: updateCustomerSchema }), controller.update);
router.delete("/:id", validateRequest({ params: customerIdSchema }), controller.deleteCustomer);

export default router;

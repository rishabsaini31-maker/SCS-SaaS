import { Router } from "express";
import * as controller from "./invoices.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { createInvoiceSchema, invoiceIdSchema, updateInvoiceSchema } from "./invoices.schema";
import { z } from "zod";

const invoicesListQuerySchema = z.object({
	customerId: z.string().optional(),
	status: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

const invoiceCustomerParamsSchema = z.object({
	customerId: z.string().min(1, "Customer ID is required"),
});

const router = Router();

router.post("/", validateRequest({ body: createInvoiceSchema }), controller.create);
router.get("/", validateRequest({ query: invoicesListQuerySchema }), controller.list);
router.get("/customer/:customerId", validateRequest({ params: invoiceCustomerParamsSchema }), controller.listByCustomer);
router.get("/:id", validateRequest({ params: invoiceIdSchema }), controller.getById);
router.patch("/:id", validateRequest({ params: invoiceIdSchema, body: updateInvoiceSchema }), controller.update);

export default router;

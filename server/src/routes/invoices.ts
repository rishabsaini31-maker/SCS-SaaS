import { Router } from "express";
import { createInvoiceController } from "../modules/invoices/invoice.controller";

const router = Router();

router.post("/", createInvoiceController);
// Add more invoice routes as needed

export default router;

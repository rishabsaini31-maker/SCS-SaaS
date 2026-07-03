import { Router } from "express";
import * as controller from "./ledger.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { searchRateLimiter } from "../../common/middlewares/rateLimiter";
import { customerLedgerParamsSchema, ledgerQuerySchema, supplierLedgerParamsSchema } from "./ledger.schema";

const router = Router();

router.get("/", searchRateLimiter, validateRequest({ query: ledgerQuerySchema }), controller.listAllLedgers);
router.get("/customer/:customerId", validateRequest({ params: customerLedgerParamsSchema }), controller.getCustomerLedger);
router.get("/supplier/:supplierId", validateRequest({ params: supplierLedgerParamsSchema }), controller.getSupplierLedger);

export default router;

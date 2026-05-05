import { Router } from "express";
import * as controller from "./ledger.controller";

const router = Router();

router.get("/", controller.listAllLedgers);
router.get("/customer/:customerId", controller.getCustomerLedger);
router.get("/supplier/:supplierId", controller.getSupplierLedger);

export default router;

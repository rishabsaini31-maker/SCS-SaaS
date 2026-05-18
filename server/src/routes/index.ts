import { Router } from "express";

import productsRouter from "../modules/products/products.routes";
import customersRouter from "../modules/customers/customers.routes";
import suppliersRouter from "../modules/suppliers/suppliers.routes";
import invoicesRouter from "../modules/invoices/invoices.routes";
import purchasesRouter from "../modules/purchases/purchases.routes";
import paymentsRouter from "../modules/payments/payments.routes";
import ledgerRouter from "../modules/ledger/ledger.routes";
import barcodeRouter from "../modules/barcode/barcode.routes";
import categoriesRouter from "../modules/categories/categories.routes";
import tenantRouter from "../modules/tenant/tenant.routes";
import dashboardRouter from "../modules/dashboard/dashboard.routes";
import reportsRouter from "../modules/reports/reports.routes";
import settingsRouter from "../modules/settings/settings.routes";

const router = Router();

// Register all module routes
router.use("/products", productsRouter);
router.use("/customers", customersRouter);
router.use("/suppliers", suppliersRouter);
router.use("/invoices", invoicesRouter);
router.use("/purchases", purchasesRouter);
router.use("/payments", paymentsRouter);
router.use("/categories", categoriesRouter);
router.use("/tenants", tenantRouter);
router.use("/ledger", ledgerRouter);
router.use("/barcode", barcodeRouter);
router.use("/dashboard", dashboardRouter);
router.use("/reports", reportsRouter);
router.use("/settings", settingsRouter);

export default router;

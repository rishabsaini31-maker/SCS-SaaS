import { Router } from "express";
import * as controller from "./reports.controller";

const router = Router();

router.get("/sales", controller.sales);
router.get("/purchases", controller.purchases);
router.get("/stock", controller.stock);
router.get("/sales-team", controller.salesTeam);
router.get("/detailed-sales", controller.detailedSales);
router.get("/daily-summary", controller.dailyBusinessSummary);

export default router;

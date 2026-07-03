import { Router } from "express";
import * as controller from "./reports.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { reportRateLimiter } from "../../common/middlewares/rateLimiter";
import { z } from "zod";

const reportsQuerySchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	date: z.string().optional(),
});

const router = Router();

router.get("/sales", reportRateLimiter, validateRequest({ query: reportsQuerySchema }), controller.sales);
router.get("/purchases", reportRateLimiter, validateRequest({ query: reportsQuerySchema }), controller.purchases);
router.get("/stock", reportRateLimiter, controller.stock);
router.get("/sales-team", reportRateLimiter, validateRequest({ query: reportsQuerySchema }), controller.salesTeam);
router.get("/detailed-sales", reportRateLimiter, validateRequest({ query: reportsQuerySchema }), controller.detailedSales);
router.get("/daily-summary", reportRateLimiter, validateRequest({ query: reportsQuerySchema }), controller.dailyBusinessSummary);

export default router;

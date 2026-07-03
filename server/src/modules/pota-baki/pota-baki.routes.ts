import { Router } from "express";
import * as controller from "./pota-baki.controller";
import { validateRequest } from "../../common/middlewares/validateRequest";
import { reportRateLimiter } from "../../common/middlewares/rateLimiter";
import { createCashTransactionSchema, updateOpeningBalanceSchema } from "./pota-baki.schema";
import { z } from "zod";

const potaBakiQuerySchema = z.object({
	month: z.coerce.number().int().optional(),
	year: z.coerce.number().int().optional(),
	date: z.string().optional(),
});

const transactionIdSchema = z.object({
	id: z.string().min(1, "Transaction ID is required"),
});

const router = Router();

router.get("/", reportRateLimiter, validateRequest({ query: potaBakiQuerySchema }), controller.getByDate);
router.get("/today", reportRateLimiter, controller.getToday);
router.get("/history", reportRateLimiter, controller.getHistory);
router.get("/daily-report", reportRateLimiter, controller.getDailyReport);
router.get("/monthly-report", reportRateLimiter, validateRequest({ query: potaBakiQuerySchema }), controller.getMonthlyReport);
router.post("/transactions", validateRequest({ body: createCashTransactionSchema }), controller.createTransaction);
router.delete("/transactions/:id", validateRequest({ params: transactionIdSchema }), controller.deleteTransaction);
router.post("/close", reportRateLimiter, controller.closeDay);
router.post("/reopen", reportRateLimiter, controller.reopenDay);
router.patch("/opening-balance", validateRequest({ body: updateOpeningBalanceSchema }), controller.updateOpening);


export default router;

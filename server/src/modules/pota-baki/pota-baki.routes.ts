import { Router } from "express";
import * as controller from "./pota-baki.controller";

const router = Router();

router.get("/", controller.getByDate);
router.get("/today", controller.getToday);
router.get("/history", controller.getHistory);
router.get("/daily-report", controller.getDailyReport);
router.get("/monthly-report", controller.getMonthlyReport);
router.post("/transactions", controller.createTransaction);
router.delete("/transactions/:id", controller.deleteTransaction);
router.post("/close", controller.closeDay);
router.post("/reopen", controller.reopenDay);
router.patch("/opening-balance", controller.updateOpening);


export default router;

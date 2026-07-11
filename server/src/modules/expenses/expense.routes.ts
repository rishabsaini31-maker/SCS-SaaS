import { Router } from "express";
import { authenticateJWT } from "../../common/middlewares/auth";
import { createExpenseHandler, getTodayExpensesHandler, getMonthExpensesHandler } from "./expense.controller";

const router = Router();

router.use(authenticateJWT);

router.post("/", async (req, res, next) => {
  try {
    await createExpenseHandler(req, res);
  } catch (error) {
    next(error);
  }
});
router.get("/today", async (req, res, next) => {
  try {
    await getTodayExpensesHandler(req, res);
  } catch (error) {
    next(error);
  }
});
router.get("/month", async (req, res, next) => {
  try {
    await getMonthExpensesHandler(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;

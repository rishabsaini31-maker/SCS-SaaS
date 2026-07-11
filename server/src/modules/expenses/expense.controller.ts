import { Request, Response } from "express";
import { createExpenseSchema } from "./expense.schema";
import * as expenseService from "./expense.service";
import { CustomError } from "../../common/errors/CustomError";
import prisma from "../../common/db/prisma";

export const createExpenseHandler = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw new CustomError("Tenant not found", 401);

  // Check permissions
  if (req.user?.role === "SALESMAN") {
    if (!req.user.staffId) throw new CustomError("Staff ID not found", 401);
    const staffUser = await prisma.staffUser.findUnique({
      where: { id: req.user.staffId }
    });
    if (!staffUser || !staffUser.canManageExpenses) {
      throw new CustomError("Unauthorized to manage expenses", 403);
    }
  }

  const parsed = createExpenseSchema.parse(req.body);
  const user = {
    id: req.user?.id || req.user?.staffId,
    name: req.user?.name,
    role: req.user?.role,
  };

  const expense = await expenseService.createExpense(tenantId, parsed, user);
  res.status(201).json(expense);
};

export const getTodayExpensesHandler = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw new CustomError("Tenant not found", 401);

  const dateParam = req.query.date as string;
  const date = dateParam ? new Date(dateParam) : new Date();

  const expenses = await expenseService.getExpensesByDate(tenantId, date);
  res.status(200).json(expenses);
};

export const getMonthExpensesHandler = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw new CustomError("Tenant not found", 401);

  const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
  const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;

  const expenses = await expenseService.getExpensesForMonth(tenantId, year, month);
  res.status(200).json(expenses);
};

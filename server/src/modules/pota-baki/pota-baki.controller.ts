import type { Request, Response, NextFunction } from "express";
import * as service from "./pota-baki.service";
import { createCashTransactionSchema, updateOpeningBalanceSchema } from "./pota-baki.schema";

const serializeCashTransaction = (tx: any) => {
  if (!tx) return tx;
  return {
    ...tx,
    amount: Number(tx.amount),
  };
};

const serializeCashBook = (cb: any) => {
  if (!cb) return cb;
  return {
    ...cb,
    openingBalance: Number(cb.openingBalance),
    totalCashIn: Number(cb.totalCashIn),
    totalCashOut: Number(cb.totalCashOut),
    closingBalance: Number(cb.closingBalance),
    transactions: cb.transactions ? cb.transactions.map(serializeCashTransaction) : undefined,
  };
};

export const getToday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cashBook = await service.getTodayCashBook(req.tenantId!);
    res.json(serializeCashBook(cashBook));
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await service.getCashBookHistory(req.tenantId!);
    res.json(history.map(serializeCashBook));
  } catch (err) {
    next(err);
  }
};

export const getDailyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await service.getDailyReport(req.tenantId!);
    res.json(report.map(cb => ({
      ...cb,
      openingBalance: Number(cb.openingBalance),
      totalCashIn: Number(cb.totalCashIn),
      totalCashOut: Number(cb.totalCashOut),
      closingBalance: Number(cb.closingBalance),
    })));
  } catch (err) {
    next(err);
  }
};

export const getMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const report = await service.getMonthlyReport(req.tenantId!, month, year);
    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCashTransactionSchema.parse(req.body);
    const transaction = await service.createCashTransaction(req.tenantId!, data);
    res.status(201).json(serializeCashTransaction(transaction));
  } catch (err) {
    next(err);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await service.deleteCashTransaction(req.tenantId!, id as string);
    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const closeDay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cashBook = await service.closeTodayCashBook(req.tenantId!);
    res.json(serializeCashBook(cashBook));
  } catch (err) {
    next(err);
  }
};

export const reopenDay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cashBook = await service.reopenTodayCashBook(req.tenantId!, req.user?.userId || "");
    res.json(serializeCashBook(cashBook));
  } catch (err) {
    next(err);
  }
};


export const updateOpening = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { openingBalance } = updateOpeningBalanceSchema.parse(req.body);
    const cashBook = await service.updateOpeningBalance(req.tenantId!, openingBalance);
    res.json(serializeCashBook(cashBook));
  } catch (err) {
    next(err);
  }
};

export const getByDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateStr: string = (req.query.date as string) || new Date().toISOString().substring(0, 10);
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
    
    const cashBook = await service.getCashBookByDate(req.tenantId!, dateStr);
    const previousDayClosing = await service.getPreviousDayClosing(req.tenantId!, targetDate);
    
    res.json({
      cashBook: cashBook ? serializeCashBook(cashBook) : null,
      transactions: cashBook?.transactions ? cashBook.transactions.map((t: any) => {
          return {
            ...t,
            amount: Number(t.amount)
          };
      }) : [],
      previousDayClosing
    });
  } catch (err) {
    next(err);
  }
};

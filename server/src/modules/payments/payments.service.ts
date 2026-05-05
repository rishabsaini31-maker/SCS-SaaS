import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type { CreatePaymentInput } from "./payments.schema";

async function generatePaymentNumber(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  if (!today) throw new CustomError("Date generation failed", 500);
  
  const todayStr = today.replace(/-/g, "");
  const count = await prisma.payment.count({
    where: { paymentNumber: { startsWith: `PAY-${todayStr}` } },
  });
  const seq = String(count + 1).padStart(5, "0");
  return `PAY-${todayStr}-${seq}`;
}

export const createPayment = async (data: CreatePaymentInput) => {
  if (!data.customerId && !data.supplierId) {
    throw new CustomError("Either customerId or supplierId is required", 400);
  }

  if (data.customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) throw new CustomError("Customer not found", 404);
  }

  if (data.supplierId) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });
    if (!supplier) throw new CustomError("Supplier not found", 404);
  }

  const payment = await prisma.$transaction(async (tx) => {
    const paymentNumber = await generatePaymentNumber();

    const newPayment = await tx.payment.create({
      data: {
        paymentNumber,
        customerId: data.customerId,
        supplierId: data.supplierId,
        invoiceId: data.invoiceId,
        purchaseId: data.purchaseId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
    });

    await tx.ledgerEntry.create({
      data: {
        customerId: data.customerId,
        supplierId: data.supplierId,
        paymentId: newPayment.id,
        type: "credit",
        amount: data.amount,
        description: `Payment ${paymentNumber}`,
      },
    });

    if (data.customerId) {
      await tx.customer.update({
        where: { id: data.customerId },
        data: { outstandingBalance: { decrement: data.amount } },
      });
    }

    if (data.supplierId) {
      await tx.supplier.update({
        where: { id: data.supplierId },
        data: { payableBalance: { decrement: data.amount } },
      });
    }

    return newPayment;
  });

  return getPayment(payment.id);
};

export const getPayment = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      customer: true,
      supplier: true,
      invoice: true,
      purchase: true,
      ledger: true,
    },
  });
  if (!payment) throw new CustomError("Payment not found", 404);
  return payment;
};

export const getPayments = async (filters?: {
  customerId?: string;
  supplierId?: string;
}) => {
  return prisma.payment.findMany({
    where: {
      ...(filters?.customerId && { customerId: filters.customerId }),
      ...(filters?.supplierId && { supplierId: filters.supplierId }),
    },
    include: {
      customer: true,
      supplier: true,
      invoice: true,
      purchase: true,
    },
    orderBy: { paymentDate: "desc" },
  });
};

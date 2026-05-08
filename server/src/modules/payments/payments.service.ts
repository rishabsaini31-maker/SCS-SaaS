import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type { CreatePaymentInput, UpdatePaymentInput } from "./payments.schema";

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

    if (data.amount > customer.outstandingBalance) {
      throw new CustomError(
        "Payment amount cannot be greater than customer outstanding balance",
        400,
      );
    }

    if (data.invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: data.invoiceId },
        include: { payments: true },
      });
      if (!invoice) throw new CustomError("Invoice not found", 404);
      if (invoice.customerId !== data.customerId) {
        throw new CustomError("Invoice does not belong to this customer", 400);
      }
      const paidSoFar = invoice.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      if (paidSoFar + data.amount > invoice.totalAmount) {
        throw new CustomError(
          "Payment amount exceeds invoice pending amount",
          400,
        );
      }
    }
  }

  if (data.supplierId) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });
    if (!supplier) throw new CustomError("Supplier not found", 404);

    if (data.amount > supplier.payableBalance) {
      throw new CustomError(
        "Payment amount cannot be greater than supplier payable balance",
        400,
      );
    }

    if (data.purchaseId) {
      const purchase = await prisma.purchase.findUnique({
        where: { id: data.purchaseId },
        include: { payments: true },
      });
      if (!purchase) throw new CustomError("Purchase not found", 404);
      if (purchase.supplierId !== data.supplierId) {
        throw new CustomError("Purchase does not belong to this supplier", 400);
      }
      const paidSoFar = purchase.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      if (paidSoFar + data.amount > purchase.totalAmount) {
        throw new CustomError(
          "Payment amount exceeds purchase pending amount",
          400,
        );
      }
    }
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

      if (data.invoiceId) {
        const invoice = await tx.invoice.findUnique({
          where: { id: data.invoiceId },
          include: { payments: true },
        });
        if (invoice) {
          const paidTotal = invoice.payments.reduce(
            (sum, payment) => sum + payment.amount,
            0,
          );
          const remaining = Math.max(0, invoice.totalAmount - paidTotal);
          await tx.invoice.update({
            where: { id: data.invoiceId },
            data: { status: remaining <= 0 ? "Paid" : "Pending" },
          });
        }
      }
    }

    if (data.supplierId) {
      await tx.supplier.update({
        where: { id: data.supplierId },
        data: { payableBalance: { decrement: data.amount } },
      });

      if (data.purchaseId) {
        const purchase = await tx.purchase.findUnique({
          where: { id: data.purchaseId },
          include: { payments: true },
        });
        if (purchase) {
          const paidTotal = purchase.payments.reduce(
            (sum, payment) => sum + payment.amount,
            0,
          );
          const remaining = Math.max(0, purchase.totalAmount - paidTotal);
          await tx.purchase.update({
            where: { id: data.purchaseId },
            data: { status: remaining <= 0 ? "Paid" : "Pending" },
          });
        }
      }
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

export const updatePayment = async (id: string, data: UpdatePaymentInput) => {
  await getPayment(id);
  return prisma.payment.update({
    where: { id },
    data,
  });
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

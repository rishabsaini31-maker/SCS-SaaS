import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type { CreatePaymentInput, UpdatePaymentInput } from "./payments.schema";
import {
  assertTenantOwnership,
  tenantCreateData,
  tenantWhere,
} from "../../common/tenant/tenant.utils";
import { runSerializableTransaction } from "../../common/db/transaction";

type PaymentNumberClient = {
  payment: {
    count: any;
  };
};

async function generatePaymentNumber(
  tenantId?: string,
  tx: PaymentNumberClient = prisma as any,
): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  if (!today) throw new CustomError("Date generation failed", 500);

  const todayStr = today.replace(/-/g, "");
  const count = await tx.payment.count({
    where: tenantWhere(tenantId, {
      paymentNumber: { startsWith: `PAY-${todayStr}` },
    }),
  });
  const seq = String(count + 1).padStart(5, "0");
  return `PAY-${todayStr}-${seq}`;
}

export const createPayment = async (
  data: CreatePaymentInput,
  tenantId?: string,
) => {
  if (!data.customerId && !data.supplierId) {
    throw new CustomError("Either customerId or supplierId is required", 400);
  }

  // SECURITY: PRODUCTION FIX - Move ALL validations inside serializable transaction
  // to prevent race condition where concurrent payments bypass balance checks
  const payment = await runSerializableTransaction(async (tx) => {
    // Validate entities exist and fetch current state INSIDE transaction (atomic)
    if (data.customerId) {
      const customer = await tx.customer.findFirst({
        where: tenantWhere(tenantId, { id: data.customerId }),
      });
      if (!customer) throw new CustomError("Customer not found", 404);

      // CRITICAL: Balance check happens INSIDE transaction - immune to race conditions
      if (data.amount > customer.outstandingBalance) {
        throw new CustomError(
          "Payment amount cannot be greater than customer outstanding balance",
          400,
        );
      }

      if (data.invoiceId) {
        const invoice = await tx.invoice.findFirst({
          where: tenantWhere(tenantId, { id: data.invoiceId }),
          include: { payments: true },
        });
        if (!invoice) throw new CustomError("Invoice not found", 404);
        if (invoice.customerId !== data.customerId) {
          throw new CustomError("Invoice does not belong to this customer", 400);
        }
        const paidSoFar = invoice.payments.reduce(
          (sum: number, payment: { amount: number }) => sum + payment.amount,
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
      const supplier = await tx.supplier.findFirst({
        where: tenantWhere(tenantId, { id: data.supplierId }),
      });
      if (!supplier) throw new CustomError("Supplier not found", 404);

      // CRITICAL: Balance check happens INSIDE transaction - immune to race conditions
      if (data.amount > supplier.payableBalance) {
        throw new CustomError(
          "Payment amount cannot be greater than supplier payable balance",
          400,
        );
      }

      if (data.purchaseId) {
        const purchase = await tx.purchase.findFirst({
          where: tenantWhere(tenantId, { id: data.purchaseId }),
          include: { payments: true },
        });
        if (!purchase) throw new CustomError("Purchase not found", 404);
        if (purchase.supplierId !== data.supplierId) {
          throw new CustomError("Purchase does not belong to this supplier", 400);
        }
        const paidSoFar = purchase.payments.reduce(
          (sum: number, payment: { amount: number }) => sum + payment.amount,
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
    const paymentNumber = await generatePaymentNumber(tenantId, tx);

    const newPayment = await tx.payment.create({
      data: tenantCreateData(tenantId, {
        paymentNumber,
        customerId: data.customerId,
        supplierId: data.supplierId,
        invoiceId: data.invoiceId,
        purchaseId: data.purchaseId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      }) as any,
    });

    await tx.ledgerEntry.create({
      data: tenantCreateData(tenantId, {
        customerId: data.customerId,
        supplierId: data.supplierId,
        paymentId: newPayment.id,
        type: "credit",
        amount: data.amount,
        description: `Payment ${paymentNumber}`,
      }) as any,
    });

    if (data.customerId) {
      await tx.customer.update({
        where: { id: data.customerId },
        data: { outstandingBalance: { decrement: data.amount } },
      });

      if (data.invoiceId) {
        const invoice = await tx.invoice.findFirst({
          where: tenantWhere(tenantId, { id: data.invoiceId }),
          include: { payments: true },
        });
        if (invoice) {
          const paidTotal = invoice.payments.reduce(
            (sum: number, payment: { amount: number }) =>
              sum + payment.amount,
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
        const purchase = await tx.purchase.findFirst({
          where: tenantWhere(tenantId, { id: data.purchaseId }),
          include: { payments: true },
        });
        if (purchase) {
          const paidTotal = purchase.payments.reduce(
            (sum: number, payment: { amount: number }) =>
              sum + payment.amount,
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

  return getPayment(payment.id, tenantId);
};

export const getPayment = async (id: string, tenantId?: string) => {
  const payment = await prisma.payment.findFirst({
    where: tenantWhere(tenantId, { id }),
    include: {
      customer: true,
      supplier: true,
      invoice: true,
      purchase: true,
      ledger: true,
    },
  });
  if (!payment) throw new CustomError("Payment not found", 404);
  assertTenantOwnership(tenantId, (payment as any).tenantId, "Payment");
  return payment;
};

export const updatePayment = async (
  id: string,
  data: UpdatePaymentInput,
  tenantId?: string,
) => {
  await getPayment(id, tenantId);
  const result = await prisma.payment.updateMany({
    where: tenantWhere(tenantId, { id }),
    data,
  });
  if (result.count !== 1) throw new CustomError("Payment not found", 404);
  return getPayment(id, tenantId);
};

export const getPayments = async (
  filters?: {
    customerId?: string;
    supplierId?: string;
  },
  tenantId?: string,
) => {
  return prisma.payment.findMany({
    where: {
      ...tenantWhere(tenantId),
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

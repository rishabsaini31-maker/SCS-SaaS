import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type { CreateInvoiceInput, UpdateInvoiceInput } from "./invoices.schema";
import {
  assertTenantOwnership,
  tenantCreateData,
  tenantWhere,
} from "../../common/tenant/tenant.utils";
import { runSerializableTransaction } from "../../common/db/transaction";

type InvoiceNumberClient = {
  tenantSetting: {
    findUnique: typeof prisma.tenantSetting.findUnique;
  };
  invoice: {
    count: typeof prisma.invoice.count;
  };
};

async function generateInvoiceNumber(
  tenantId?: string,
  tx: InvoiceNumberClient = prisma,
): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  if (!today) throw new CustomError("Date generation failed", 500);

  const settings = await tx.tenantSetting.findUnique({
    where: { tenantId },
    select: { invoicePrefix: true },
  });

  const prefix = settings?.invoicePrefix || "INV-";
  const todayStr = today.replace(/-/g, "");
  const count = await tx.invoice.count({
    where: tenantWhere(tenantId, {
      invoiceNumber: { startsWith: `${prefix}${todayStr}` },
    }),
  });
  const seq = String(count + 1).padStart(5, "0");
  return `${prefix}${todayStr}-${seq}`;
}

export const createInvoice = async (
  data: CreateInvoiceInput,
  tenantId?: string,
) => {
  const invoice = await runSerializableTransaction(async (tx) => {
    const customer = await tx.customer.findFirst({
      where: tenantWhere(tenantId, { id: data.customerId }),
    });
    if (!customer) throw new CustomError("Customer not found", 404);

    const invoiceNumber = await generateInvoiceNumber(tenantId, tx);

    let subtotal = 0;
    const lineItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];
    for (const item of data.lineItems) {
      const product = await tx.product.findFirst({
        where: tenantWhere(tenantId, { id: item.productId }),
      });
      if (!product) throw new CustomError(`Product not found`, 404);

      const stockReservation = await tx.product.updateMany({
        where: tenantWhere(tenantId, {
          id: item.productId,
          stock: { gte: item.quantity },
        }),
        data: { stock: { decrement: item.quantity } },
      });

      if (stockReservation.count !== 1) {
        throw new CustomError(`Insufficient stock for ${product.name}`, 400);
      }

      const totalPrice = product.sellingPrice * item.quantity;
      subtotal += totalPrice;
      lineItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        totalPrice,
      });
    }

    const gstAmount = subtotal * 0.18;
    const totalAmount = subtotal + gstAmount;

    const newInvoice = await tx.invoice.create({
      data: tenantCreateData(tenantId, {
        invoiceNumber,
        customerId: data.customerId,
        subtotal,
        gstAmount,
        totalAmount,
        status: data.status || "created",
        notes: data.notes,
      }) as any,
    });

    for (const item of lineItems) {
      await tx.invoiceLineItem.create({
        data: tenantCreateData(tenantId, {
          invoiceId: newInvoice.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        }) as any,
      });
    }

    await tx.ledgerEntry.create({
      data: tenantCreateData(tenantId, {
        customerId: data.customerId,
        invoiceId: newInvoice.id,
        type: "debit",
        amount: totalAmount,
        description: `Invoice ${invoiceNumber}`,
      }) as any,
    });

    await tx.customer.update({
      where: { id: data.customerId },
      data: { outstandingBalance: { increment: totalAmount } },
    });

    return newInvoice;
  });

  return getInvoice(invoice.id, tenantId);
};

export const getInvoice = async (id: string, tenantId?: string) => {
  const invoice = await prisma.invoice.findFirst({
    where: tenantWhere(tenantId, { id }),
    include: {
      customer: true,
      lineItems: { include: { product: true } },
      payments: true,
      ledger: true,
    },
  });
  if (!invoice) throw new CustomError("Invoice not found", 404);
  assertTenantOwnership(tenantId, (invoice as any).tenantId, "Invoice");
  return invoice;
};

export const getInvoices = async (
  filters?: {
    customerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  },
  tenantId?: string,
) => {
  const hasDateRange = Boolean(filters?.startDate || filters?.endDate);
  const start = filters?.startDate ? new Date(filters.startDate) : undefined;
  const end = filters?.endDate ? new Date(filters.endDate) : undefined;

  return prisma.invoice.findMany({
    where: {
      ...tenantWhere(tenantId),
      ...(filters?.customerId && { customerId: filters.customerId }),
      ...(filters?.status && { status: filters.status }),
      ...(hasDateRange && {
        invoiceDate: {
          ...(start && { gte: start }),
          ...(end && { lte: end }),
        },
      }),
    },
    include: {
      customer: true,
      lineItems: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateInvoice = async (
  id: string,
  data: UpdateInvoiceInput,
  tenantId?: string,
) => {
  await getInvoice(id, tenantId);
  return prisma.invoice.update({
    where: { id },
    data,
  });
};

export const getInvoicesByCustomer = async (
  customerId: string,
  tenantId?: string,
) => {
  const customer = await prisma.customer.findFirst({
    where: tenantWhere(tenantId, { id: customerId }),
  });
  if (!customer) throw new CustomError("Customer not found", 404);

  return prisma.invoice.findMany({
    where: tenantWhere(tenantId, { customerId }),
    include: {
      customer: true,
      lineItems: { include: { product: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

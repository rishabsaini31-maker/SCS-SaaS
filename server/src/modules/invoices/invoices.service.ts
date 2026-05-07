import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import type { CreateInvoiceInput } from "./invoices.schema";

async function generateInvoiceNumber(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  if (!today) throw new CustomError("Date generation failed", 500);

  const todayStr = today.replace(/-/g, "");
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: `INV-${todayStr}` } },
  });
  const seq = String(count + 1).padStart(5, "0");
  return `INV-${todayStr}-${seq}`;
}

export const createInvoice = async (data: CreateInvoiceInput) => {
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
  });
  if (!customer) throw new CustomError("Customer not found", 404);

  for (const item of data.lineItems) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product)
      throw new CustomError(`Product ${item.productId} not found`, 404);
    if (product.stock < item.quantity) {
      throw new CustomError(`Insufficient stock for ${product.name}`, 400);
    }
  }

  const invoice = await prisma.$transaction(async (tx) => {
    const invoiceNumber = await generateInvoiceNumber();

    let subtotal = 0;
    const lineItems: any[] = [];
    for (const item of data.lineItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) throw new CustomError(`Product not found`, 404);

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
      data: {
        invoiceNumber,
        customerId: data.customerId,
        subtotal,
        gstAmount,
        totalAmount,
        status: data.status || "created",
        notes: data.notes,
      },
    });

    for (const item of lineItems) {
      await tx.invoiceLineItem.create({
        data: {
          invoiceId: newInvoice.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        },
      });
    }

    for (const item of data.lineItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.ledgerEntry.create({
      data: {
        customerId: data.customerId,
        invoiceId: newInvoice.id,
        type: "debit",
        amount: totalAmount,
        description: `Invoice ${invoiceNumber}`,
      },
    });

    await tx.customer.update({
      where: { id: data.customerId },
      data: { outstandingBalance: { increment: totalAmount } },
    });

    return newInvoice;
  });

  return getInvoice(invoice.id);
};

export const getInvoice = async (id: string) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      lineItems: { include: { product: true } },
      payments: true,
      ledger: true,
    },
  });
  if (!invoice) throw new CustomError("Invoice not found", 404);
  return invoice;
};

export const getInvoices = async (filters?: {
  customerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const hasDateRange = Boolean(filters?.startDate || filters?.endDate);
  const start = filters?.startDate ? new Date(filters.startDate) : undefined;
  const end = filters?.endDate ? new Date(filters.endDate) : undefined;

  return prisma.invoice.findMany({
    where: {
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

export const getInvoicesByCustomer = async (customerId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) throw new CustomError("Customer not found", 404);

  return prisma.invoice.findMany({
    where: { customerId },
    include: {
      customer: true,
      lineItems: { include: { product: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

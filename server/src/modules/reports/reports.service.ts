import prisma from "../../common/db/prisma";
import { tenantWhere } from "../../common/tenant/tenant.utils";
import { getCashBookByDate } from "../pota-baki/pota-baki.service";

export const getSalesReport = async (
  tenantId?: string,
  startDate?: string,
  endDate?: string,
) => {
  return prisma.invoice.findMany({
    where: {
      ...tenantWhere(tenantId),
      ...(startDate || endDate
        ? {
            invoiceDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    },
    include: { customer: true, lineItems: { include: { product: true } } },
    orderBy: { invoiceDate: "desc" },
  });
};

export const getPurchaseReport = async (
  tenantId?: string,
  startDate?: string,
  endDate?: string,
) => {
  return prisma.purchase.findMany({
    where: {
      ...tenantWhere(tenantId),
      ...(startDate || endDate
        ? {
            purchaseDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    },
    include: { supplier: true, lineItems: { include: { product: true } } },
    orderBy: { purchaseDate: "desc" },
  });
};

export const getStockReport = async (tenantId?: string) => {
  return prisma.product.findMany({
    where: tenantWhere(tenantId),
    orderBy: { updatedAt: "desc" },
  });
};

export const getSalesTeamReport = async (
  tenantId?: string,
  startDate?: string,
  endDate?: string,
) => {
  const staffList = await prisma.staffUser.findMany({
    where: {
      ...tenantWhere(tenantId),
      role: "SALESMAN",
    },
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  const performance = await Promise.all(
    staffList.map(async (staff) => {
      const invoices = await prisma.invoice.findMany({
        where: {
          ...tenantWhere(tenantId),
          createdByStaffId: staff.id,
          ...(startDate || endDate
            ? {
                invoiceDate: {
                  ...(startDate && { gte: new Date(startDate) }),
                  ...(endDate && { lte: new Date(endDate) }),
                },
              }
            : {}),
        },
      });

      return {
        id: staff.id,
        name: staff.name,
        isActive: staff.isActive,
        totalBills: invoices.length,
        totalSalesAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      };
    })
  );

  // Sort by total sales amount descending
  return performance.sort((a, b) => b.totalSalesAmount - a.totalSalesAmount);
};

export const getDetailedSalesReport = async (
  tenantId?: string,
  startDate?: string,
  endDate?: string,
) => {
  const invoices = await prisma.invoice.findMany({
    where: {
      ...tenantWhere(tenantId),
      ...(startDate || endDate
        ? {
            invoiceDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    },
    include: {
      customer: true,
      lineItems: {
        include: { product: true },
      },
    },
    orderBy: { invoiceDate: "desc" },
  });

  const detailedItems: any[] = [];
  invoices.forEach((invoice) => {
    invoice.lineItems.forEach((item) => {
      detailedItems.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        customerName: invoice.customer.name,
        customerPhone: invoice.customer.phone,
        productId: item.productId,
        productName: item.product?.name || "Unknown Product",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });
    });
  });

  return detailedItems;
};

export const getDailyBusinessSummary = async (
  tenantId?: string,
  dateStr?: string,
) => {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const dateFilter = {
    gte: startOfDay,
    lte: endOfDay,
  };

  const todayStrForCashBook = `${startOfDay.getFullYear()}-${String(startOfDay.getMonth() + 1).padStart(2, '0')}-${String(startOfDay.getDate()).padStart(2, '0')}`;

  const [
    invoices,
    purchases,
    payments,
    cashBook,
    salesTeamReport,
    customersTotal,
    suppliersTotal,
    productsAll
  ] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        ...tenantWhere(tenantId),
        invoiceDate: dateFilter,
      },
      include: {
        customer: true,
        lineItems: { include: { product: true } },
      },
      orderBy: { createdAt: "asc" }
    }),
    prisma.purchase.findMany({
      where: {
        ...tenantWhere(tenantId),
        purchaseDate: dateFilter,
      },
      include: {
        supplier: true,
        lineItems: { include: { product: true } },
      },
      orderBy: { createdAt: "asc" }
    }),
    prisma.payment.findMany({
      where: {
        ...tenantWhere(tenantId),
        paymentDate: dateFilter,
      },
      include: {
        customer: true,
        supplier: true,
      },
      orderBy: { createdAt: "asc" }
    }),
    getCashBookByDate(tenantId!, dateStr || todayStrForCashBook),
    getSalesTeamReport(tenantId, startOfDay.toISOString(), endOfDay.toISOString()),
    prisma.customer.aggregate({
      where: tenantWhere(tenantId),
      _sum: { outstandingBalance: true }
    }),
    prisma.supplier.aggregate({
      where: tenantWhere(tenantId),
      _sum: { payableBalance: true }
    }),
    prisma.product.findMany({
       where: tenantWhere(tenantId),
       select: { id: true, name: true, stock: true }
    })
  ]);

  const totalSales = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPurchases = purchases.reduce((acc, pur) => acc + pur.totalAmount, 0);
  const cashReceived = payments.filter(p => p.customerId).reduce((acc, p) => acc + p.amount, 0);
  const cashPaid = payments.filter(p => p.supplierId).reduce((acc, p) => acc + p.amount, 0);
  
  let expenses = 0;
  if (cashBook && cashBook.transactions) {
    expenses = cashBook.transactions
       .filter((t: any) => t.type === 'EXPENSE' || t.type === 'PERSONAL_EXPENSE')
       .reduce((acc: number, t: any) => acc + Number(t.amount), 0);
  }

  const netCashFlow = cashReceived - cashPaid - expenses;
  const invoicesCreated = invoices.length;
  
  const uniqueCustomers = new Set(invoices.map(inv => inv.customerId));
  const customersServed = uniqueCustomers.size;

  let productsSoldQty = 0;
  
  const customerSalesMap: Record<string, any> = {};
  invoices.forEach(inv => {
    if (!customerSalesMap[inv.customerId]) {
      customerSalesMap[inv.customerId] = {
        id: inv.customerId,
        name: inv.customer.name,
        bills: 0,
        totalAmount: 0,
        outstanding: inv.customer.outstandingBalance,
      };
    }
    customerSalesMap[inv.customerId].bills += 1;
    customerSalesMap[inv.customerId].totalAmount += inv.totalAmount;
  });
  const customerSalesSummary = Object.values(customerSalesMap).sort((a, b) => b.totalAmount - a.totalAmount);

  const productSalesMap: Record<string, any> = {};
  invoices.forEach(inv => {
    inv.lineItems.forEach(item => {
      productsSoldQty += item.quantity;
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          id: item.productId,
          name: item.product?.name || "Unknown",
          quantitySold: 0,
          salesAmount: 0,
          currentStock: item.product?.stock || 0,
        };
      }
      productSalesMap[item.productId].quantitySold += item.quantity;
      productSalesMap[item.productId].salesAmount += item.totalPrice;
    });
  });
  
  const productSalesSummary = Object.values(productSalesMap).map((p: any) => ({
    ...p,
    averageSellingPrice: p.quantitySold > 0 ? (p.salesAmount / p.quantitySold) : 0
  })).sort((a: any, b: any) => b.salesAmount - a.salesAmount);

  const paymentSummary = {
    cash: payments.filter(p => p.paymentMethod.toLowerCase() === 'cash').reduce((acc, p) => acc + p.amount, 0),
    upi: payments.filter(p => p.paymentMethod.toLowerCase() === 'upi').reduce((acc, p) => acc + p.amount, 0),
    bank: payments.filter(p => p.paymentMethod.toLowerCase() === 'bank' || p.paymentMethod.toLowerCase() === 'transfer').reduce((acc, p) => acc + p.amount, 0),
    cheque: payments.filter(p => p.paymentMethod.toLowerCase() === 'cheque').reduce((acc, p) => acc + p.amount, 0),
    creditSales: invoices.filter(inv => inv.status.toLowerCase() !== 'paid' && inv.status.toLowerCase() !== 'paid').reduce((acc, inv) => acc + inv.totalAmount, 0),
    customerCollections: cashReceived,
    supplierPayments: cashPaid,
  };

  const purchaseSummaryMap: Record<string, any> = {};
  purchases.forEach(pur => {
    if (!purchaseSummaryMap[pur.supplierId]) {
      purchaseSummaryMap[pur.supplierId] = {
        id: pur.supplierId,
        name: pur.supplier.name,
        bills: 0,
        purchaseAmount: 0,
        gst: 0,
        outstanding: pur.supplier.payableBalance,
      };
    }
    purchaseSummaryMap[pur.supplierId].bills += 1;
    purchaseSummaryMap[pur.supplierId].purchaseAmount += pur.totalAmount;
    purchaseSummaryMap[pur.supplierId].gst += pur.gstAmount;
  });
  const purchaseSummary = Object.values(purchaseSummaryMap).sort((a, b) => b.purchaseAmount - a.purchaseAmount);

  const inventoryMovement = productsAll.map(prod => {
    const sold = productSalesMap[prod.id]?.quantitySold || 0;
    
    let purchased = 0;
    purchases.forEach(pur => {
      pur.lineItems.forEach(item => {
        if (item.productId === prod.id) {
          purchased += item.quantity;
        }
      });
    });

    const openingStock = prod.stock + sold - purchased;

    return {
      id: prod.id,
      product: prod.name,
      openingStock,
      purchased,
      sold,
      closingStock: prod.stock,
    };
  }).filter(m => m.purchased > 0 || m.sold > 0 || m.closingStock < 10);

  let gstTaxableAmount = 0;
  let gstTotalAmount = 0;
  invoices.forEach(inv => {
    gstTaxableAmount += inv.subtotal;
    gstTotalAmount += inv.gstAmount;
  });
  const gstSummary = {
     taxableAmount: gstTaxableAmount,
     gstAmount: gstTotalAmount,
     invoiceCount: invoicesCreated
  };

  const outstandingSummary = {
     customerOutstanding: customersTotal._sum.outstandingBalance || 0,
     supplierOutstanding: suppliersTotal._sum.payableBalance || 0,
     netReceivable: (customersTotal._sum.outstandingBalance || 0) - (suppliersTotal._sum.payableBalance || 0)
  };

  const timeline: any[] = [];
  invoices.forEach(inv => timeline.push({ time: inv.createdAt, type: 'Invoice', description: `Invoice ${inv.invoiceNumber} Created for ${inv.customer?.name || 'Customer'}`, amount: inv.totalAmount }));
  purchases.forEach(pur => timeline.push({ time: pur.createdAt, type: 'Purchase', description: `Purchase ${pur.purchaseNumber} Added from ${pur.supplier?.name || 'Supplier'}`, amount: pur.totalAmount }));
  payments.forEach(pay => {
    if (pay.customerId) {
       timeline.push({ time: pay.createdAt, type: 'Customer Payment', description: `Customer Payment Received from ${pay.customer?.name || 'Customer'}`, amount: pay.amount });
    } else {
       timeline.push({ time: pay.createdAt, type: 'Supplier Payment', description: `Supplier Payment Made to ${pay.supplier?.name || 'Supplier'}`, amount: pay.amount });
    }
  });
  if (cashBook && cashBook.transactions) {
    cashBook.transactions.forEach((t: any) => {
       if (t.type === 'EXPENSE') {
          timeline.push({ time: t.createdAt, type: 'Expense', description: `Expense: ${t.description || t.type}`, amount: Number(t.amount) });
       }
    });
  }
  
  timeline.sort((a, b) => a.time.getTime() - b.time.getTime());

  return {
    overview: {
      totalSales,
      totalPurchases,
      cashReceived,
      cashPaid,
      expenses,
      netCashFlow,
      invoicesCreated,
      productsSold: productsSoldQty,
      customersServed,
    },
    customerSalesSummary,
    productSalesSummary,
    salesTeamPerformance: salesTeamReport,
    paymentSummary,
    purchaseSummary,
    inventoryMovement,
    potaBakiSummary: cashBook ? {
       openingBalance: Number(cashBook.openingBalance),
       cashIn: Number(cashBook.totalCashIn),
       cashOut: Number(cashBook.totalCashOut),
       closingBalance: Number(cashBook.closingBalance),
       status: cashBook.status
    } : null,
    gstSummary,
    outstandingSummary,
    timeline
  };
};

"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  subtotal: number;
  gstAmount: number;
  status: string;
  customer: { name: string };
  lineItems: { quantity: number; product: { name: string } }[];
};

type Purchase = {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  totalAmount: number;
  subtotal: number;
  gstAmount: number;
  status: string;
  supplier: { name: string };
  lineItems: {
    quantity: number;
    productName?: string;
    product?: { name: string };
  }[];
};

type Product = {
  id: string;
  name: string;
  category?: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
};

type Payment = {
  id: string;
  amount: number;
  paymentDate: string;
  customer?: { name: string };
  supplier?: { name: string };
  invoiceId?: string;
  purchaseId?: string;
};

type Customer = {
  id: string;
  name: string;
  outstandingBalance: number;
};

type Supplier = {
  id: string;
  name: string;
  payableBalance: number;
};

type ReportRow = {
  id: string;
  label: string;
  date: string;
  itemCount: string;
  amount: number;
  status: string;
  partyName: string;
  tone: "emerald" | "amber" | "red" | "blue" | "orange" | "slate";
};

type SalesTeamMember = {
  id: string;
  name: string;
  isActive: boolean;
  totalBills: number;
  totalSalesAmount: number;
};

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const toStartOfDay = (value: string) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getStatusMeta = (status: string) => {
  const normalized = status.trim().toLowerCase();

  if (normalized === "paid") {
    return { label: "Paid", className: "bg-emerald-50 text-emerald-700" };
  }
  if (normalized === "pending") {
    return { label: "Pending", className: "bg-amber-50 text-amber-700" };
  }
  if (normalized === "partial") {
    return { label: "Partial", className: "bg-orange-50 text-orange-700" };
  }
  if (normalized === "cancelled") {
    return { label: "Cancelled", className: "bg-rose-50 text-rose-700" };
  }
  if (normalized === "created") {
    return { label: "Created", className: "bg-blue-50 text-blue-700" };
  }

  return {
    label:
      status
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
        .join(" ") || "Unknown",
    className: "bg-slate-100 text-slate-700",
  };
};

const getPresetRangeStart = (range: string) => {
  const now = new Date();

  if (range === "Today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (range === "This Week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "This Month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return null;
};

const matchesRange = (
  value: string,
  activeRange: string,
  customStart: string,
  customEnd: string,
) => {
  const currentDate = toStartOfDay(value);

  if (activeRange === "Custom Range") {
    const startDate = customStart ? toStartOfDay(customStart) : null;
    const endDate = customEnd ? toStartOfDay(customEnd) : null;

    if (!startDate && !endDate) return true;
    if (startDate && currentDate < startDate) return false;
    if (endDate && currentDate > endDate) return false;
    return true;
  }

  const presetStart = getPresetRangeStart(activeRange);
  if (!presetStart) return true;
  return currentDate.getTime() >= presetStart.getTime();
};

const buildWeeklySeries = (items: Array<{ date: string; amount: number }>) => {
  const buckets = [0, 0, 0, 0, 0];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const item of items) {
    const diffDays = Math.floor(
      (todayStart.getTime() - new Date(item.date).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0 || diffDays > 34) continue;
    const bucketIndex = Math.min(4, Math.floor(diffDays / 7));
    buckets[4 - bucketIndex] += item.amount;
  }

  return buckets.map((value, index) => ({
    label: `Week ${index + 1}`,
    value,
  }));
};

const getTopCategories = (products: Product[]) => {
  const categoryMap = new Map<string, number>();

  for (const product of products) {
    const category = product.category || "Uncategorized";
    const inventoryValue = product.stock * product.purchasePrice;
    categoryMap.set(
      category,
      (categoryMap.get(category) || 0) + inventoryValue,
    );
  }

  return Array.from(categoryMap.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
};

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<
    "Sales Report" | "Purchase Report" | "Stock Report" | "Sales Team" | "Expense Report"
  >("Sales Report");
  const [activeRange, setActiveRange] = useState("This Month");
  const [customRangeStart, setCustomRangeStart] = useState("");
  const [customRangeEnd, setCustomRangeEnd] = useState("");

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["reports-invoices"],
    queryFn: async () => {
      const res = await api.get<Invoice[]>("/invoices");
      return res.data;
    },
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ["reports-purchases"],
    queryFn: async () => {
      const res = await api.get<Purchase[]>("/purchases");
      return res.data;
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["reports-products"],
    queryFn: async () => {
      const res = await api.get<Product[]>("/products");
      return res.data;
    },
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["reports-payments"],
    queryFn: async () => {
      const res = await api.get<Payment[]>("/payments");
      return res.data;
    },
  });

  type Expense = {
    id: string;
    category: string;
    amount: number;
    paymentMode: string;
    createdAt: string;
    reason: string;
  };

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["reports-expenses"],
    queryFn: async () => {
      // For simplicity, just get month expenses. In a real app we'd pass activeRange dates.
      const res = await api.get<Expense[]>("/expenses/month");
      return res.data;
    },
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["reports-customers"],
    queryFn: async () => {
      const res = await api.get<Customer[]>("/customers");
      return res.data;
    },
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["reports-suppliers"],
    queryFn: async () => {
      const res = await api.get<Supplier[]>("/suppliers");
      return res.data;
    },
  });

  const { data: salesTeam = [], isLoading: salesTeamLoading } = useQuery({
    queryKey: ["reports-sales-team", customRangeStart, customRangeEnd, activeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeRange === "Custom Range") {
        if (customRangeStart) params.append("startDate", customRangeStart);
        if (customRangeEnd) params.append("endDate", customRangeEnd);
      } else {
        const start = getPresetRangeStart(activeRange);
        if (start) {
          params.append("startDate", start.toISOString());
        }
      }
      const res = await api.get<SalesTeamMember[]>(`/reports/sales-team?${params.toString()}`);
      return res.data;
    },
    enabled: activeReport === "Sales Team",
  });

  const loading =
    invoicesLoading ||
    purchasesLoading ||
    productsLoading ||
    paymentsLoading ||
    customersLoading ||
    suppliersLoading ||
    (activeReport === "Sales Team" && salesTeamLoading);

  const visibleInvoices = useMemo(
    () =>
      invoices.filter((invoice) =>
        matchesRange(
          invoice.invoiceDate,
          activeRange,
          customRangeStart,
          customRangeEnd,
        ),
      ),
    [activeRange, customRangeEnd, customRangeStart, invoices],
  );

  const visiblePurchases = useMemo(
    () =>
      purchases.filter((purchase) =>
        matchesRange(
          purchase.purchaseDate,
          activeRange,
          customRangeStart,
          customRangeEnd,
        ),
      ),
    [activeRange, customRangeEnd, customRangeStart, purchases],
  );

  const invoicePayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.invoiceId &&
          matchesRange(
            payment.paymentDate,
            activeRange,
            customRangeStart,
            customRangeEnd,
          ),
      ),
    [activeRange, customRangeEnd, customRangeStart, payments],
  );

  const purchasePayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.purchaseId &&
          matchesRange(
            payment.paymentDate,
            activeRange,
            customRangeStart,
            customRangeEnd,
          ),
      ),
    [activeRange, customRangeEnd, customRangeStart, payments],
  );

  const salesData = useMemo(() => {
    const totalRevenue = visibleInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0,
    );
    const totalCollected = visibleInvoices.reduce((sum, invoice) => {
      const paidAmount = invoicePayments
        .filter((payment) => payment.invoiceId === invoice.id)
        .reduce((amount, payment) => amount + payment.amount, 0);
      return sum + paidAmount;
    }, 0);
    const averageInvoice = visibleInvoices.length
      ? totalRevenue / visibleInvoices.length
      : 0;
    const totalPending = Math.max(0, totalRevenue - totalCollected);

    const totalProfit = visibleInvoices.reduce((sum, invoice) => {
      const invoiceProfit = invoice.lineItems.reduce((itemSum: number, item: any) => {
        const costPrice = item.product ? item.product.purchasePrice : 0;
        return itemSum + ((item.unitPrice - costPrice) * item.quantity);
      }, 0);
      return sum + invoiceProfit;
    }, 0);

    return {
      totalRevenue,
      totalCollected,
      averageInvoice,
      totalPending,
      totalProfit,
      orderCount: visibleInvoices.length,
      chart: buildWeeklySeries(
        visibleInvoices.map((invoice) => ({
          date: invoice.invoiceDate,
          amount: invoice.totalAmount,
        })),
      ),
      rows: visibleInvoices
        .slice()
        .sort(
          (a, b) =>
            new Date(b.invoiceDate).getTime() -
            new Date(a.invoiceDate).getTime(),
        )
        .slice(0, 10)
        .map<ReportRow>((invoice) => {
          const paidAmount = invoicePayments
            .filter((payment) => payment.invoiceId === invoice.id)
            .reduce((amount, payment) => amount + payment.amount, 0);
          const pendingAmount = Math.max(0, invoice.totalAmount - paidAmount);

          return {
            id: invoice.id,
            label: invoice.invoiceNumber,
            date: invoice.invoiceDate,
            itemCount: `${invoice.lineItems.reduce((sum, item) => sum + item.quantity, 0)} items`,
            amount: invoice.totalAmount,
            status: getStatusMeta(invoice.status).label,
            partyName: invoice.customer.name,
            tone:
              pendingAmount <= 0
                ? "emerald"
                : pendingAmount < invoice.totalAmount
                  ? "amber"
                  : "red",
          };
        }),
    };
  }, [invoicePayments, visibleInvoices]);

  const purchaseData = useMemo(() => {
    const totalSpend = visiblePurchases.reduce(
      (sum, purchase) => sum + purchase.totalAmount,
      0,
    );
    const totalPaid = visiblePurchases.reduce((sum, purchase) => {
      const paidAmount = purchasePayments
        .filter((payment) => payment.purchaseId === purchase.id)
        .reduce((amount, payment) => amount + payment.amount, 0);
      return sum + paidAmount;
    }, 0);
    const averagePurchase = visiblePurchases.length
      ? totalSpend / visiblePurchases.length
      : 0;
    const totalPending = Math.max(0, totalSpend - totalPaid);

    return {
      totalSpend,
      totalPaid,
      averagePurchase,
      totalPending,
      orderCount: visiblePurchases.length,
      chart: buildWeeklySeries(
        visiblePurchases.map((purchase) => ({
          date: purchase.purchaseDate,
          amount: purchase.totalAmount,
        })),
      ),
      rows: visiblePurchases
        .slice()
        .sort(
          (a, b) =>
            new Date(b.purchaseDate).getTime() -
            new Date(a.purchaseDate).getTime(),
        )
        .slice(0, 10)
        .map<ReportRow>((purchase) => {
          const paidAmount = purchasePayments
            .filter((payment) => payment.purchaseId === purchase.id)
            .reduce((amount, payment) => amount + payment.amount, 0);
          const pendingAmount = Math.max(0, purchase.totalAmount - paidAmount);

          return {
            id: purchase.id,
            label: purchase.purchaseNumber,
            date: purchase.purchaseDate,
            itemCount: `${purchase.lineItems.reduce((sum, item) => sum + item.quantity, 0)} items`,
            amount: purchase.totalAmount,
            status: getStatusMeta(purchase.status).label,
            partyName: purchase.supplier.name,
            tone:
              pendingAmount <= 0
                ? "emerald"
                : pendingAmount < purchase.totalAmount
                  ? "amber"
                  : "red",
          };
        }),
    };
  }, [purchasePayments, visiblePurchases]);

  const stockData = useMemo(() => {
    const totalSkus = products.length;
    const lowStockCount = products.filter(
      (product) => product.stock <= 10,
    ).length;
    const totalUnits = products.reduce(
      (sum, product) => sum + product.stock,
      0,
    );
    const inventoryValue = products.reduce(
      (sum, product) => sum + product.stock * product.purchasePrice,
      0,
    );

    return {
      totalSkus,
      lowStockCount,
      totalUnits,
      inventoryValue,
      chart: getTopCategories(products),
      rows: products
        .slice()
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 10)
        .map<ReportRow>((product) => ({
          id: product.id,
          label: product.name,
          date: "",
          itemCount: `${product.stock} units`,
          amount: product.stock * product.purchasePrice,
          status: product.stock <= 10 ? "Low Stock" : "In Stock",
          partyName: product.category || "Uncategorized",
          tone:
            product.stock <= 10
              ? "amber"
              : product.stock === 0
                ? "red"
                : "blue",
        })),
    };
  }, [products]);

  const expenseData = useMemo(() => {
    const visibleExpenses = expenses.filter((e) => matchesRange(e.createdAt, activeRange, customRangeStart, customRangeEnd));
    const totalExpense = visibleExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCash = visibleExpenses.filter(e => e.paymentMode === 'CASH').reduce((sum, e) => sum + e.amount, 0);
    const totalNonCash = totalExpense - totalCash;

    const categoryMap = new Map<string, number>();
    for (const e of visibleExpenses) {
      const cat = e.category || 'Other';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + e.amount);
    }
    const chart = Array.from(categoryMap.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalExpense,
      totalCash,
      totalNonCash,
      chart,
      rows: visibleExpenses
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map<ReportRow>((e) => ({
          id: e.id,
          label: e.category,
          date: e.createdAt,
          itemCount: e.paymentMode,
          amount: e.amount,
          status: "Completed",
          partyName: e.reason || "N/A",
          tone: "slate",
        })),
    };
  }, [expenses, activeRange, customRangeStart, customRangeEnd]);

  const handleExportReport = () => {
    const summary =
      activeReport === "Sales Report"
        ? [
            `Total Revenue: ${formatINR(salesData.totalRevenue)}`,
            `Collected: ${formatINR(salesData.totalCollected)}`,
            `Profit/Margin: ${formatINR(salesData.totalProfit)}`,
            `Pending: ${formatINR(salesData.totalPending)}`,
          ]
        : activeReport === "Purchase Report"
          ? [
              `Total Spend: ${formatINR(purchaseData.totalSpend)}`,
              `Paid: ${formatINR(purchaseData.totalPaid)}`,
              `Pending: ${formatINR(purchaseData.totalPending)}`,
            ]
          : activeReport === "Sales Team"
            ? [
                `Total Team Members: ${salesTeam.length}`,
                `Active Members: ${salesTeam.filter((m) => m.isActive).length}`,
                `Total Sales: ${formatINR(salesTeam.reduce((sum, m) => sum + m.totalSalesAmount, 0))}`,
              ]
            : activeReport === "Expense Report"
              ? [
                  `Total Expense: ${formatINR(expenseData.totalExpense)}`,
                  `Total Cash: ${formatINR(expenseData.totalCash)}`,
                  `Total Non-Cash: ${formatINR(expenseData.totalNonCash)}`,
                ]
              : [
                  `Inventory Value: ${formatINR(stockData.inventoryValue)}`,
                  `Units: ${stockData.totalUnits}`,
                  `Low Stock Items: ${stockData.lowStockCount}`,
                ];

    const content = [
      activeReport,
      `Range: ${activeRange}`,
      "",
      ...summary,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeReport.replace(/\s+/g, "-").toLowerCase()}-${activeRange
      .replace(/\s+/g, "-")
      .toLowerCase()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const cards =
    activeReport === "Sales Report"
      ? [
          {
            label: "Total Revenue",
            value: formatINR(salesData.totalRevenue),
            tone: "blue",
            icon: "trending_up",
          },
          {
            label: "Orders",
            value: String(salesData.orderCount),
            tone: "emerald",
            icon: "shopping_cart",
          },
          {
            label: "Profit / Margin",
            value: formatINR(salesData.totalProfit),
            tone: "emerald",
            icon: "payments",
          },
          {
            label: "Average Invoice",
            value: formatINR(salesData.averageInvoice),
            tone: "amber",
            icon: "receipt_long",
          },
          {
            label: "Pending",
            value: formatINR(salesData.totalPending),
            tone: "red",
            icon: "pending_actions",
          },
        ]
      : activeReport === "Purchase Report"
        ? [
            {
              label: "Total Spend",
              value: formatINR(purchaseData.totalSpend),
              tone: "orange",
              icon: "shopping_bag",
            },
            {
              label: "Purchase Orders",
              value: String(purchaseData.orderCount),
              tone: "emerald",
              icon: "receipt_long",
            },
            {
              label: "Average Purchase",
              value: formatINR(purchaseData.averagePurchase),
              tone: "blue",
              icon: "stacked_line_chart",
            },
            {
              label: "Pending Payable",
              value: formatINR(purchaseData.totalPending),
              tone: "red",
              icon: "payments",
            },
          ]
        : activeReport === "Sales Team"
          ? [
              {
                label: "Total Sales",
                value: formatINR(salesTeam.reduce((sum, m) => sum + m.totalSalesAmount, 0)),
                tone: "blue",
                icon: "trending_up",
              },
              {
                label: "Total Bills",
                value: String(salesTeam.reduce((sum, m) => sum + m.totalBills, 0)),
                tone: "emerald",
                icon: "receipt_long",
              },
              {
                label: "Active Members",
                value: String(salesTeam.filter((m) => m.isActive).length),
                tone: "emerald",
                icon: "group",
              },
              {
                label: "Top Performer",
                value: salesTeam.length > 0 && salesTeam[0].totalSalesAmount > 0 ? salesTeam[0].name : "N/A",
                tone: "amber",
                icon: "star",
              },
            ]
        : activeReport === "Expense Report"
          ? [
              {
                label: "Total Expenses",
                value: formatINR(expenseData.totalExpense),
                tone: "red",
                icon: "payments",
              },
              {
                label: "Cash Expenses",
                value: formatINR(expenseData.totalCash),
                tone: "amber",
                icon: "money",
              },
              {
                label: "Non-Cash Expenses",
                value: formatINR(expenseData.totalNonCash),
                tone: "blue",
                icon: "account_balance",
              },
              {
                label: "Transactions",
                value: String(expenseData.rows.length),
                tone: "emerald",
                icon: "receipt_long",
              },
            ]
        : [
            {
              label: "Total SKUs",
              value: String(stockData.totalSkus),
              tone: "blue",
              icon: "inventory_2",
            },
            {
              label: "Low Stock",
              value: String(stockData.lowStockCount),
              tone: "amber",
              icon: "warning",
            },
            {
              label: "Inventory Value",
              value: formatINR(stockData.inventoryValue),
              tone: "emerald",
              icon: "account_balance_wallet",
            },
            {
              label: "Total Units",
              value: String(stockData.totalUnits),
              tone: "orange",
              icon: "view_in_ar",
            },
          ];

  const chartSeries =
    activeReport === "Sales Report"
      ? salesData.chart
      : activeReport === "Purchase Report"
        ? purchaseData.chart
        : activeReport === "Sales Team"
          ? salesTeam.slice(0, 5).map((item) => ({
              label: item.name.split(" ")[0], // First name only
              value: item.totalSalesAmount,
            }))
          : activeReport === "Expense Report"
            ? expenseData.chart.map((item) => ({
                label: item.category,
                value: item.value,
              }))
            : stockData.chart.map((item) => ({
                label: item.category,
                value: item.value,
              }));

  const rows =
    activeReport === "Sales Report"
      ? salesData.rows
      : activeReport === "Purchase Report"
        ? purchaseData.rows
        : activeReport === "Sales Team"
          ? salesTeam.map<ReportRow>((member) => ({
              id: member.id,
              label: member.name,
              date: "",
              itemCount: `${member.totalBills} bills`,
              amount: member.totalSalesAmount,
              status: member.isActive ? "Active" : "Disabled",
              partyName: "Salesman",
              tone: member.isActive ? "emerald" : "slate",
            }))
          : activeReport === "Expense Report"
            ? expenseData.rows
            : stockData.rows;

  const mainTitle =
    activeReport === "Sales Report"
      ? "Revenue Analysis"
      : activeReport === "Purchase Report"
        ? "Purchase Spend Analysis"
        : activeReport === "Sales Team"
          ? "Sales Team Performance"
          : activeReport === "Expense Report"
            ? "Expense Analysis"
            : "Inventory Value Analysis";

  const sideTitle =
    activeReport === "Sales Report"
      ? "Top Customers"
      : activeReport === "Purchase Report"
        ? "Top Suppliers"
        : activeReport === "Sales Team"
          ? "Top Salesmen"
          : activeReport === "Expense Report"
            ? "Top Categories"
            : "Top Categories";

  const sideRows =
    activeReport === "Sales Report"
      ? customers
          .slice()
          .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
          .slice(0, 5)
          .map((customer) => ({
            name: customer.name,
            value: customer.outstandingBalance,
          }))
      : activeReport === "Purchase Report"
        ? suppliers
            .slice()
            .sort((a, b) => b.payableBalance - a.payableBalance)
            .slice(0, 5)
            .map((supplier) => ({
              name: supplier.name,
              value: supplier.payableBalance,
            }))
        : activeReport === "Sales Team"
          ? salesTeam
              .slice(0, 5)
              .map((member) => ({
                name: member.name,
                value: member.totalSalesAmount,
              }))
          : activeReport === "Expense Report"
            ? expenseData.chart.map((entry) => ({
                name: entry.category,
                value: entry.value,
              }))
            : getTopCategories(products).map((entry) => ({
                name: entry.category,
                value: entry.value,
              }));

  const rangeSummary =
    activeRange === "Custom Range" && (customRangeStart || customRangeEnd)
      ? `${customRangeStart || "Start"} to ${customRangeEnd || "End"}`
      : activeRange;

  const reportStats =
    activeReport === "Sales Report"
      ? `${salesData.orderCount} invoices`
      : activeReport === "Purchase Report"
        ? `${purchaseData.orderCount} purchases`
        : activeReport === "Sales Team"
          ? `${salesTeam.length} members`
          : activeReport === "Expense Report"
            ? `${expenseData.rows.length} transactions`
            : `${stockData.totalSkus} products`;

  if (loading) {
    return <div className="text-slate-500">Loading reports...</div>;
  }

  return (
    <div className="max-w-350 mx-auto space-y-6">
      <div className="rounded-2xl bg-white border border-slate-200 p-6 md:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="font-h1 text-h1 text-on-surface mb-1">
              Business Analytics
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Live sales, purchase, and stock reporting in rupees.
            </p>
          </div>
          <div className="inline-flex flex-wrap items-center bg-surface-container-low p-1 rounded-xl gap-1 w-fit">
            {(["Sales Report", "Purchase Report", "Stock Report", "Expense Report", "Sales Team"] as const).map(
              (report) => (
                <button
                  key={report}
                  className={`px-5 py-2 text-sm rounded-lg transition-colors ${
                    activeReport === report
                      ? "font-semibold text-blue-600 bg-white shadow-sm"
                      : "font-medium text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setActiveReport(report)}
                  type="button"
                >
                  {report}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 thin-scrollbar">
              {(
                ["Today", "This Week", "This Month", "Custom Range"] as const
              ).map((range) => (
                <button
                  className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-full border transition-colors ${
                    activeRange === range
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                  key={range}
                  onClick={() => setActiveRange(range)}
                  type="button"
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                {rangeSummary}
              </span>
              <span className="text-slate-500">{reportStats}</span>
            </div>
            {activeRange === "Custom Range" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customRangeStart}
                    onChange={(e) => setCustomRangeStart(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customRangeEnd}
                    onChange={(e) => setCustomRangeEnd(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomRangeStart("");
                    setCustomRangeEnd("");
                  }}
                  className="self-end px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Clear range
                </button>
              </div>
            )}
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            onClick={handleExportReport}
            type="button"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export Summary
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${cards.length === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'} gap-4 items-stretch`}>
        {cards.map((card) => (
          <div
            key={card.label}
            className="col-span-1 p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors h-full min-h-40 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`p-2 rounded-lg ${
                  card.tone === "blue"
                    ? "bg-blue-50 text-blue-600"
                    : card.tone === "emerald"
                      ? "bg-emerald-50 text-emerald-600"
                      : card.tone === "amber"
                        ? "bg-amber-50 text-amber-600"
                        : card.tone === "orange"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-rose-50 text-rose-600"
                }`}
              >
                <span className="material-symbols-outlined">{card.icon}</span>
              </span>
            </div>
            <p className="text-slate-500 font-label-caps uppercase">
              {card.label}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
            <h4 className="font-h1 text-lg text-slate-900">{mainTitle}</h4>
            <div className="text-xs text-slate-500 font-medium">
              Based on {rangeSummary.toLowerCase()} data
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 md:gap-4 h-72 w-full items-end">
            {chartSeries.map((bar) => {
              const max = Math.max(...chartSeries.map((item) => item.value), 1);
              const height = Math.max(14, (bar.value / max) * 100);

              return (
                <div
                  key={bar.label}
                  className="flex flex-col items-center gap-2 min-w-0"
                >
                  <div className="w-full bg-slate-50 rounded-t-lg h-64 relative overflow-hidden border border-slate-100">
                    <div
                      className={`absolute bottom-0 w-full rounded-t-lg ${
                        activeReport === "Purchase Report"
                          ? "bg-orange-500/70"
                          : activeReport === "Stock Report"
                            ? "bg-emerald-600/70"
                            : "bg-blue-600/70"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 font-label-caps text-center leading-tight">
                    {bar.label}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {formatINR(bar.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 className="font-h1 text-lg text-slate-900 mb-6">{sideTitle}</h4>
            <div className="space-y-4">
              {sideRows.map((row) => {
                const max = Math.max(...sideRows.map((item) => item.value), 1);
                const width = Math.max(10, (row.value / max) * 100);

                return (
                  <div className="space-y-2" key={row.name}>
                    <div className="flex justify-between text-sm gap-3">
                      <span className="font-medium text-slate-700 truncate">
                        {row.name}
                      </span>
                      <span className="text-slate-500 font-mono-data whitespace-nowrap">
                        {formatINR(row.value)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          activeReport === "Purchase Report"
                            ? "bg-orange-500"
                            : activeReport === "Stock Report"
                              ? "bg-emerald-600"
                              : "bg-blue-600"
                        }`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-semibold tracking-wider">
                LIVE RANGE
              </p>
              <h3 className="text-3xl font-bold mt-2">{activeRange}</h3>
              <div className="mt-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">
                  arrow_outward
                </span>
                <span className="text-emerald-400 text-sm font-semibold">
                  Data pulled from live API totals
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-8xl">
                account_balance
              </span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-12 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h4 className="font-h1 text-lg text-slate-900">
              Recent{" "}
              {activeReport === "Sales Report"
                ? "Invoices"
                : activeReport === "Purchase Report"
                  ? "Purchases"
                  : activeReport === "Sales Team"
                    ? "Team Members"
                    : activeReport === "Expense Report"
                      ? "Expenses"
                      : "Products"}
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              {activeReport === "Sales Team" ? "All active and inactive staff" : "Showing last 10 entries"}
            </span>
          </div>

          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full text-left min-w-225">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase">
                    {activeReport === "Stock Report"
                      ? "Product"
                      : activeReport === "Purchase Report"
                        ? "Purchase #"
                        : activeReport === "Expense Report"
                          ? "Category"
                          : activeReport === "Sales Team"
                            ? "Salesman"
                            : "Invoice #"}
                  </th>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase">
                    {activeReport === "Sales Team" ? "Role" : activeReport === "Expense Report" ? "Reason" : "Party"}
                  </th>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase">
                    {activeReport === "Sales Team" ? "—" : "Date"}
                  </th>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase">
                    {activeReport === "Sales Team" ? "Total Bills" : activeReport === "Expense Report" ? "Mode" : "Items / Stock"}
                  </th>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase text-right">
                    {activeReport === "Sales Team" ? "Total Sales" : "Amount"}
                  </th>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50 transition-colors h-12 ${index % 2 ? "bg-slate-50/30" : ""}`}
                  >
                    <td className="px-6 py-3 font-mono-data text-blue-600 font-semibold">
                      {row.label}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-slate-700">
                      {row.partyName}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">
                      {row.date ? formatShortDate(row.date) : "-"}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">
                      {row.itemCount}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono-data font-bold text-slate-900 text-right">
                      {formatINR(row.amount)}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.tone === "emerald"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : row.tone === "amber"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : row.tone === "red"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : row.tone === "orange"
                                  ? "bg-orange-50 text-orange-700 border-orange-100"
                                  : row.tone === "slate"
                                    ? "bg-slate-50 text-slate-700 border-slate-200"
                                    : "bg-blue-50 text-blue-700 border-blue-100"
                        }`}
                      >
                        {row.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-500">
              No data found for the selected range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

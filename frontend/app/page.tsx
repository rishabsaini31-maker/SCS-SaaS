"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Invoice = {
  id: string;
  invoiceNumber: string;
  customer: { name: string };
  totalAmount: number;
  status: string;
  invoiceDate: string;
};

type Product = {
  id: string;
  name: string;
  stock: number;
  sellingPrice: number;
};

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function DashboardPage() {
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("daily");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear()),
  );
  const [showAllInvoices, setShowAllInvoices] = useState(false);

  const invoiceDateParams = useMemo(() => {
    if (period === "daily") {
      const start = new Date(`${selectedDate}T00:00:00.000Z`);
      const end = new Date(`${selectedDate}T23:59:59.999Z`);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }

    if (period === "monthly") {
      const [year, month] = selectedMonth.split("-").map(Number);
      if (!year || !month) return {};
      const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }

    const yearNum = Number(selectedYear);
    if (!yearNum) return {};
    const start = new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(yearNum, 11, 31, 23, 59, 59, 999));
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [period, selectedDate, selectedMonth, selectedYear]);

  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    isError: invoicesError,
  } = useQuery({
    queryKey: ["invoices", period, selectedDate, selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await api.get<Invoice[]>("/invoices", {
        params: invoiceDateParams,
      });
      return res.data;
    },
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get<Product[]>("/products");
      return res.data;
    },
  });

  const loading = invoicesLoading || productsLoading;
  const hasError = invoicesError || productsError;

  const metrics = useMemo(() => {
    const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pendingInvoices = invoices.filter(
      (inv) => inv.status !== "created",
    ).length;
    const pendingAmount = invoices
      .filter((inv) => inv.status !== "created")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalStockValue = products.reduce(
      (sum, p) => sum + p.stock * p.sellingPrice,
      0,
    );
    const lowStockItems = products.filter((p) => p.stock < 10).length;

    return {
      totalSales,
      pendingInvoices,
      pendingAmount,
      totalStockValue,
      lowStockItems,
    };
  }, [invoices, products]);

  const visibleInvoices = showAllInvoices ? invoices : invoices.slice(0, 5);

  const statusClassMap: Record<string, string> = {
    created: "bg-blue-50 text-blue-700 border-blue-100",
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Pending: "bg-orange-50 text-orange-700 border-orange-100",
    Overdue: "bg-red-50 text-red-700 border-red-100",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Failed to load dashboard data.</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${period === "daily" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
            onClick={() => setPeriod("daily")}
          >
            Daily
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${period === "monthly" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${period === "yearly" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
            onClick={() => setPeriod("yearly")}
          >
            Yearly
          </button>

          {period === "daily" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="ml-auto px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          )}

          {period === "monthly" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="ml-auto px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          )}

          {period === "yearly" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="ml-auto px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {[0, 1, 2, 3, 4].map((offset) => {
                const year = String(new Date().getFullYear() - offset);
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Total Sales
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined text-lg">
                payments
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold">
            {formatINR(metrics.totalSales)}
          </h2>
          <p className="text-xs text-emerald-600 mt-2">
            {invoices.length} invoices
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Pending Payments
            </span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <span className="material-symbols-outlined text-lg">
                pending_actions
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold">
            {formatINR(metrics.pendingAmount)}
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            {metrics.pendingInvoices} pending
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4 mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Total Stock Value
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
              <span className="material-symbols-outlined text-lg">
                inventory_2
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold">
            {formatINR(metrics.totalStockValue)}
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            {products.length} {products.length === 1 ? "SKU" : "SKUs"} tracked
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow border-l-4 border-l-red-500">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider text-red-600">
              Low Stock
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <span className="material-symbols-outlined text-lg">warning</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold">{metrics.lowStockItems}</h2>
          <p className="text-xs text-red-600 mt-2">Items need restocking</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Recent Invoices</h3>
              <button
                className="text-blue-600 text-sm font-semibold hover:underline"
                onClick={() => setShowAllInvoices(!showAllInvoices)}
              >
                {showAllInvoices ? "Show Less" : "View All"}
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibleInvoices.length > 0 ? (
                  visibleInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {invoice.customer.name}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatShortDate(invoice.invoiceDate)}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {formatINR(invoice.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded border ${statusClassMap[invoice.status] || statusClassMap.created}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-slate-500 text-center"
                    >
                      No invoices
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Top Products</h3>
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-start p-3 border border-slate-100 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Stock: {product.stock} units
                    </p>
                  </div>
                  <p className="font-bold text-slate-900">
                    {formatINR(product.sellingPrice)}
                  </p>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-slate-500 text-center py-4">No products</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

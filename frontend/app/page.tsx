"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Invoice = {
  id: string;
  invoiceNumber: string;
  customer: { name: string };
  totalAmount: number;
  status: string;
};

type Product = {
  id: string;
  name: string;
  stock: number;
  sellingPrice: number;
};

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [salesRange, setSalesRange] = useState<"daily" | "weekly">("daily");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, productsRes] = await Promise.all([
          api.get("/invoices"),
          api.get("/products"),
        ]);
        setInvoices(invoicesRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pendingInvoices = invoices.filter(inv => inv.status !== "created").length;
    const pendingAmount = invoices
      .filter(inv => inv.status !== "created")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
    const lowStockItems = products.filter(p => p.stock < 10).length;

    return { totalSales, pendingInvoices, pendingAmount, totalStockValue, lowStockItems };
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

  return (
    <>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold">{formatINR(metrics.totalSales)}</h2>
          <p className="text-xs text-emerald-600 mt-2">{invoices.length} invoices</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Pending Payments</span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <span className="material-symbols-outlined text-lg">pending_actions</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold">{formatINR(metrics.pendingAmount)}</h2>
          <p className="text-xs text-slate-500 mt-2">{metrics.pendingInvoices} pending</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Stock Value</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <span className="material-symbols-outlined text-lg">inventory_2</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold">{formatINR(metrics.totalStockValue)}</h2>
          <p className="text-xs text-slate-500 mt-2">{products.length} SKUs</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow border-l-4 border-l-red-500">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider text-red-600">Low Stock</span>
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
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibleInvoices.length > 0 ? (
                  visibleInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-slate-700">{invoice.customer.name}</td>
                      <td className="px-6 py-4 font-semibold">{formatINR(invoice.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded border ${statusClassMap[invoice.status] || statusClassMap.created}`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-slate-500 text-center">No invoices</td>
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
                <div key={product.id} className="flex justify-between items-start p-3 border border-slate-100 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                    <p className="text-xs text-slate-500">Stock: {product.stock} units</p>
                  </div>
                  <p className="font-bold text-slate-900">{formatINR(product.sellingPrice)}</p>
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

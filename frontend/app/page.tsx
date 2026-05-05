 "use client";

import { mockDashboardMetrics } from "@/lib/data";
import { useMemo, useState } from "react";

type SalesRange = "daily" | "weekly";

type InvoiceStatus = "Paid" | "Pending" | "Overdue";

type Invoice = {
  id: string;
  customer: string;
  amount: number;
  status: InvoiceStatus;
};

export default function DashboardPage() {
  const [salesRange, setSalesRange] = useState<SalesRange>("daily");
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [activeInvoiceMenuId, setActiveInvoiceMenuId] = useState<string | null>(
    null,
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const invoices = useMemo<Invoice[]>(
    () => [
      {
        id: "INV-9821",
        customer: "Madan Electronics",
        amount: 42000,
        status: "Paid",
      },
      {
        id: "INV-9822",
        customer: "Ramesh & Sons",
        amount: 5000,
        status: "Pending",
      },
      {
        id: "INV-9823",
        customer: "Global Traders",
        amount: 18300,
        status: "Paid",
      },
      {
        id: "INV-9824",
        customer: "Sunrise Retail",
        amount: 112000,
        status: "Overdue",
      },
    ],
    [],
  );

  const visibleInvoices = showAllInvoices ? invoices : invoices.slice(0, 3);

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId],
  );

  const statusClassMap: Record<InvoiceStatus, string> = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Pending: "bg-orange-50 text-orange-700 border-orange-100",
    Overdue: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <>
      {/* Top Row: Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider font-label-caps">
              Today’s Sales
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined text-lg">
                payments
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display-sm">
            ₹{mockDashboardMetrics.totalSales.toLocaleString()}
          </h2>
          <div className="flex items-center mt-2 text-xs font-medium text-emerald-600">
            <span className="material-symbols-outlined text-sm mr-1">
              trending_up
            </span>
            <span>{mockDashboardMetrics.salesTrend}</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider font-label-caps">
              Pending Payments
            </span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <span className="material-symbols-outlined text-lg">
                pending_actions
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display-sm">
            ₹{mockDashboardMetrics.pendingInvoicesAmount.toLocaleString()}
          </h2>
          <div className="flex items-center mt-2 text-xs font-medium text-slate-500">
            <span>{mockDashboardMetrics.pendingInvoices} pending invoices</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider font-label-caps">
              Total Stock Value
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <span className="material-symbols-outlined text-lg">
                inventory_2
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display-sm">₹12.4M</h2>
          <div className="flex items-center mt-2 text-xs font-medium text-slate-500">
            <span>4,202 SKUs tracked</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-md transition-shadow border-l-4 border-l-red-500">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider font-label-caps text-red-600">
              Low Stock Alerts
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <span className="material-symbols-outlined text-lg">warning</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display-sm">18 Items</h2>
          <div className="flex items-center mt-2 text-xs font-medium text-red-600">
            <span>Critical restocking needed</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-8">
        {/* Left: Sales Performance & Table */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Sales Performance Chart (Visual Simulation) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold font-h1">Sales Performance</h3>
                <p className="text-sm text-slate-500 font-body-sm">
                  {salesRange === "daily"
                    ? "Daily revenue across all categories"
                    : "Weekly revenue across all categories"}
                </p>
              </div>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    salesRange === "daily"
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setSalesRange("daily")}
                  type="button"
                >
                  Daily
                </button>
                <button
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    salesRange === "weekly"
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setSalesRange("weekly")}
                  type="button"
                >
                  Weekly
                </button>
              </div>
            </div>
            <div className="h-[280px] w-full relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Sales Performance Chart"
                className="w-full h-full object-cover rounded-lg opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqz9zebnr-SMQjIK15Vzx9f6KCBiEo44EzxGRTa77IgDT8HeW9uXQuLME_FDcQbNDcvVZos-T_2K00NrRVC26d0dIeTodEaQvjVdEv2S146adPj8fMC75mDfJgwmeQrczWzH_Ef9O2U5fxS6kONo6JJCYqfLFXfF3mgVgqUFKq_Q_u-Td2VWT9ovXMOYxmEn2C37GJdmBTPAYQe_6NIB544c-W0yUNkwfqF_aDVOS7-HngK3Xwl7xt7ddm-Pub0V_0aVF0FJgPcW0"
              />
              {/* Data tooltips simulation */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg">
                {salesRange === "daily"
                  ? "Oct 12: ₹1,42,500"
                  : "Week 41: ₹8,95,400"}
              </div>
            </div>
          </div>
          {/* Recent Invoices Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold font-h1">Recent Invoices</h3>
              <button
                className="text-blue-600 text-sm font-semibold hover:underline"
                onClick={() => setShowAllInvoices((previous) => !previous)}
                type="button"
              >
                {showAllInvoices ? "Show Less" : "View All"}
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-label-caps">
                    Invoice #
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-label-caps">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-label-caps">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-label-caps">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-label-caps"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibleInvoices.map((invoice) => (
                  <tr
                    className={`transition-colors h-[48px] ${
                      selectedInvoiceId === invoice.id
                        ? "bg-blue-50/70"
                        : "hover:bg-slate-50"
                    }`}
                    key={invoice.id}
                    onClick={() => {
                      setSelectedInvoiceId(invoice.id);
                      setActiveInvoiceMenuId(null);
                    }}
                  >
                    <td className="px-6 py-4 font-mono-data text-slate-900 font-medium">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {invoice.customer}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-semibold">
                      ₹{invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-[11px] font-bold rounded-full border ${statusClassMap[invoice.status]}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        aria-label={`Open actions for ${invoice.id}`}
                        className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-slate-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedInvoiceId(invoice.id);
                          setActiveInvoiceMenuId((current) =>
                            current === invoice.id ? null : invoice.id,
                          );
                        }}
                        type="button"
                      >
                        more_horiz
                      </button>
                      {activeInvoiceMenuId === invoice.id ? (
                        <div className="absolute right-6 top-12 z-20 w-36 rounded-lg border border-slate-200 bg-white shadow-lg text-left">
                          <button
                            className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                            onClick={(event) => {
                              event.stopPropagation();
                              setActiveInvoiceMenuId(null);
                            }}
                            type="button"
                          >
                            View details
                          </button>
                          <button
                            className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                            onClick={(event) => {
                              event.stopPropagation();
                              setActiveInvoiceMenuId(null);
                            }}
                            type="button"
                          >
                            Download PDF
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-600">
              {selectedInvoice ? (
                <span>
                  Selected invoice: <strong>{selectedInvoice.id}</strong> -{" "}
                  {selectedInvoice.customer} ({selectedInvoice.status})
                </span>
              ) : (
                <span>Click an invoice row to preview details.</span>
              )}
            </div>
          </div>
        </div>
        {/* Right: Alerts & Top Sellers */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Critical Alerts Side Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold font-h1 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">
                campaign
              </span>
              Critical Alerts
            </h3>
            <div className="space-y-4">
              {/* Alert Item */}
              <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex gap-3">
                <span className="material-symbols-outlined text-red-600 shrink-0">
                  inventory_2
                </span>
                <div>
                  <p className="text-sm font-bold text-red-900 font-body-sm">
                    Low Stock: Premium Cotton S12
                  </p>
                  <p className="text-xs text-red-700">
                    Only 5 units remaining in Warehouse A.
                  </p>
                </div>
              </div>
              {/* Alert Item */}
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 flex gap-3">
                <span className="material-symbols-outlined text-orange-600 shrink-0">
                  pending_actions
                </span>
                <div>
                  <p className="text-sm font-bold text-orange-900 font-body-sm">
                    Payment Due: Ramesh
                  </p>
                  <p className="text-xs text-orange-700">
                    ₹5,000 pending for 14 days. Follow up required.
                  </p>
                </div>
              </div>
              {/* Alert Item */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
                <span className="material-symbols-outlined text-blue-600 shrink-0">
                  local_shipping
                </span>
                <div>
                  <p className="text-sm font-bold text-blue-900 font-body-sm">
                    Delayed Shipment
                  </p>
                  <p className="text-xs text-blue-700">
                    Logistics partner report: 3 orders delayed by rain.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Top Selling Products */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-h1">
                Top Selling Products
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                This Week
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Industrial Fan"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_Yol4dW9wRWEqRyRl4gGbttFmEnhGH59asumupKQOFwz723oHpc2e0TTLVeDTz4dOTT4Zf1pAizf0CqZ-DJPy--8Hzk7Q_JbB9MGKenBJUogc3H-RrB3ureTljgsLq37sfy0Mw-HapBFsjR6cGQg0B-vMf_dT4yrCwDtIVm_fXcCnjh8Nj-fi2WFfhKawTgh6ttAdRLnLmhflUT8yi6-guuDQ9txvH2B3eAyLl3AbUDqVmRW4HQDzIzN6Gm0LCQFAEQOJJf9gC-M"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    Vortex Industrial Fan X5
                  </p>
                  <p className="text-xs text-slate-500">142 units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">₹4.2L</p>
                  <p className="text-[10px] text-emerald-600 font-medium">
                    +18%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Smart Lighting Kit"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBlvg_jutuG_4h6xattbUMsT0RnWaieWfLBN4PqNakuaBw4YcuK8eggOJ-jm6VwNb0155_xkE35L942uSUtsvlLA0q5IIOy_cUAfMlwLofI9COj-0TKU0pTz-xaqF4zhh_Dte8lwDSCTZF968SvsBgQJ1pr3ijCJJsF5aMHtjL1XrRY1lWwlReqyATDGQ8B705hf73Jwc2rXEh86tUm5r4XvZsRgUDbrSPAk-Dv3Kjz6S9ibZed3LAKWjqqjWk3Slg2W1Hu0ao07A"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    Lumina Smart Panel Kit
                  </p>
                  <p className="text-xs text-slate-500">89 units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">₹2.8L</p>
                  <p className="text-[10px] text-emerald-600 font-medium">
                    +5%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Power Tool Set"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDL4f1zQ7Ej9HD9ceOmRNInqDui12CyKGuVWtLLJypVi590ZCCctxfjwLV1dWcEtRpRFbfdChly--dAal0mPqPFNxKu3w7anDwyAjNf1GOZPWWlCL3-aC8_2FuuR1qVxnB4SjoGxwGN5aP8CIsDUdoxxxuU1d9qSG8HwboNI4WAgkX1QNF0A_OXtJ2MkXwg6k1haAonYpLKX2JSylkuGs12nXprGIbimZAM9IzFWtK1N4nI80w9tnfzq1I39vYaY2lrbOkGJDHgUqw"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    Titan 18V Drill Combo
                  </p>
                  <p className="text-xs text-slate-500">64 units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">₹1.5L</p>
                  <p className="text-[10px] text-red-500 font-medium">-2%</p>
                </div>
              </div>
            </div>
            <button
              className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              onClick={() => setSelectedInvoiceId(invoices[0]?.id ?? null)}
              type="button"
            >
              View Inventory Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

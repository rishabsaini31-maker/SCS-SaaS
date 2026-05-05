 "use client";

import { useState } from "react";

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState("Sales Report");
  const [activeRange, setActiveRange] = useState("This Month");
  const [actionText, setActionText] = useState("Ready");
  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Page Header & Tab Selection */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface mb-1">
            Business Analytics
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Analyze your wholesale operations across all verticals.
          </p>
        </div>
        <div className="flex items-center bg-surface-container-low p-1 rounded-xl">
          <button
            className={`px-6 py-2 text-sm rounded-lg ${
              activeReport === "Sales Report"
                ? "font-semibold text-blue-600 bg-white shadow-sm"
                : "font-medium text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveReport("Sales Report")}
            type="button"
          >
            Sales Report
          </button>
          <button
            className={`px-6 py-2 text-sm rounded-lg ${
              activeReport === "Purchase Report"
                ? "font-semibold text-blue-600 bg-white shadow-sm"
                : "font-medium text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveReport("Purchase Report")}
            type="button"
          >
            Purchase Report
          </button>
          <button
            className={`px-6 py-2 text-sm rounded-lg ${
              activeReport === "Stock Report"
                ? "font-semibold text-blue-600 bg-white shadow-sm"
                : "font-medium text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveReport("Stock Report")}
            type="button"
          >
            Stock Report
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 thin-scrollbar">
          {["Today", "This Week", "This Month", "Custom Range"].map((range) => (
            <button
              className={`whitespace-nowrap px-4 py-1.5 text-xs font-semibold rounded-full ${
                activeRange === range
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              key={range}
              onClick={() => setActiveRange(range)}
              type="button"
            >
              {range}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            onClick={() => setActionText("Filters clicked")}
            type="button"
          >
            <span className="material-symbols-outlined text-sm">
              filter_list
            </span>
            Filters
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            onClick={() => setActionText("Export PDF clicked")}
            type="button"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Bento Grid - Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1 p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined">trending_up</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              +12.4%
            </span>
          </div>
          <p className="text-slate-500 font-label-caps uppercase">
            Total Revenue
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">$482,900.00</h3>
        </div>
        <div className="col-span-1 p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <span className="material-symbols-outlined">shopping_cart</span>
            </span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
              Stable
            </span>
          </div>
          <p className="text-slate-500 font-label-caps uppercase">
            Total Orders
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">1,284</h3>
        </div>
        <div className="col-span-1 md:col-span-2 p-6 bg-white border border-slate-200 rounded-xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <span className="material-symbols-outlined">
                  account_balance_wallet
                </span>
              </span>
            </div>
            <p className="text-slate-500 font-label-caps uppercase">
              Average Margin
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">24.8%</h3>
            <div className="mt-4 flex gap-1 items-end h-8">
              <div className="w-full bg-slate-100 rounded-t h-4"></div>
              <div className="w-full bg-slate-100 rounded-t h-6"></div>
              <div className="w-full bg-blue-200 rounded-t h-8"></div>
              <div className="w-full bg-blue-400 rounded-t h-5"></div>
              <div className="w-full bg-blue-600 rounded-t h-7"></div>
              <div className="w-full bg-slate-100 rounded-t h-4"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization & Data Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-h1 text-lg text-slate-900">Revenue Analysis</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-xs font-medium text-slate-500">
                  Current Month
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                <span className="text-xs font-medium text-slate-500">
                  Previous
                </span>
              </div>
            </div>
          </div>
          {/* Bar Chart Placeholder */}
          <div className="flex items-end justify-between gap-4 h-64 w-full">
            <div className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full bg-slate-50 rounded-t-lg h-32 relative">
                <div className="absolute bottom-0 w-full bg-blue-600/20 rounded-t-lg h-24"></div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 font-label-caps">
                WEEK 1
              </span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full bg-slate-50 rounded-t-lg h-48 relative">
                <div className="absolute bottom-0 w-full bg-blue-600/40 rounded-t-lg h-36"></div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 font-label-caps">
                WEEK 2
              </span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full bg-slate-50 rounded-t-lg h-64 relative">
                <div className="absolute bottom-0 w-full bg-blue-600/80 rounded-t-lg h-52"></div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 font-label-caps">
                WEEK 3
              </span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full bg-slate-50 rounded-t-lg h-56 relative">
                <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg h-44"></div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 font-label-caps">
                WEEK 4
              </span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full bg-slate-50 rounded-t-lg h-36 relative">
                <div className="absolute bottom-0 w-full bg-blue-600/10 rounded-t-lg h-20"></div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 font-label-caps">
                WEEK 5
              </span>
            </div>
          </div>
        </div>
        {/* Side Performance Stats */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6">
            <h4 className="font-h1 text-lg text-slate-900 mb-6">
              Top Product Categories
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    Industrial Tools
                  </span>
                  <span className="text-slate-500 font-mono-data">$142k</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    Electronics
                  </span>
                  <span className="text-slate-500 font-mono-data">$98k</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-400 h-1.5 rounded-full"
                    style={{ width: "52%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    Raw Materials
                  </span>
                  <span className="text-slate-500 font-mono-data">$64k</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-200 h-1.5 rounded-full"
                    style={{ width: "38%" }}
                  ></div>
                </div>
              </div>
            </div>
            <button
              className="w-full mt-6 py-2 text-xs font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => setActionText("View all categories clicked")}
              type="button"
            >
              VIEW ALL CATEGORIES
            </button>
          </div>
          <div className="p-6 bg-slate-900 rounded-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-semibold tracking-wider">
                ANNUAL TARGET
              </p>
              <h3 className="text-3xl font-bold mt-2">
                $5.2M / <span className="text-slate-500">$8.0M</span>
              </h3>
              <div className="mt-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">
                  arrow_outward
                </span>
                <span className="text-emerald-400 text-sm font-semibold">
                  On track to hit goal
                </span>
              </div>
            </div>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-8xl">
                account_balance
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Data Table */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden mt-4">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h4 className="font-h1 text-lg text-slate-900">
              Recent Transactions
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Showing last 10 entries
              </span>
              <button
                className="text-blue-600 hover:underline text-xs font-bold"
                onClick={() => setActionText("View all transactions clicked")}
                type="button"
              >
                VIEW ALL
              </button>
            </div>
          </div>
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase text-right">
                    Amount
                  </th>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase text-center">
                    Status
                  </th>
                  <th className="px-6 py-3 font-label-caps text-slate-500 uppercase text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors h-12">
                  <td className="px-6 py-3 font-mono-data text-blue-600 font-semibold">
                    #INV-9402
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                        TC
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        Titan Corp
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">
                    Oct 24, 2023
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">24 Units</td>
                  <td className="px-6 py-3 text-sm font-mono-data font-bold text-slate-900 text-right">
                    $12,400.00
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      PAID
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400"
                      onClick={() => setActionText("Action menu opened")}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">
                        more_vert
                      </span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors h-12 bg-slate-50/30">
                  <td className="px-6 py-3 font-mono-data text-blue-600 font-semibold">
                    #INV-9398
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                        NM
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        NextGen Mfg
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">
                    Oct 23, 2023
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">
                    112 Units
                  </td>
                  <td className="px-6 py-3 text-sm font-mono-data font-bold text-slate-900 text-right">
                    $48,200.00
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                      PENDING
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400"
                      onClick={() => setActionText("Action menu opened")}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">
                        more_vert
                      </span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors h-12">
                  <td className="px-6 py-3 font-mono-data text-blue-600 font-semibold">
                    #INV-9395
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                        SL
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        Skyline Logistics
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">
                    Oct 22, 2023
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">8 Units</td>
                  <td className="px-6 py-3 text-sm font-mono-data font-bold text-slate-900 text-right">
                    $4,120.00
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      PAID
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400"
                      onClick={() => setActionText("Action menu opened")}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">
                        more_vert
                      </span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors h-12 bg-slate-50/30">
                  <td className="px-6 py-3 font-mono-data text-blue-600 font-semibold">
                    #INV-9391
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                        HP
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        HydroPower Ltd
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">
                    Oct 21, 2023
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">45 Units</td>
                  <td className="px-6 py-3 text-sm font-mono-data font-bold text-slate-900 text-right">
                    $19,000.00
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                      OVERDUE
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400"
                      onClick={() => setActionText("Action menu opened")}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">
                        more_vert
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              End of current selection
            </p>
            <div className="flex items-center gap-2">
              <button
                className="p-1.5 border border-slate-200 rounded bg-white text-slate-400 hover:text-slate-600"
                onClick={() => setActionText("Previous page clicked")}
                type="button"
              >
                <span className="material-symbols-outlined text-sm">
                  chevron_left
                </span>
              </button>
              <span className="text-xs font-bold px-2">1</span>
              <button
                className="p-1.5 border border-slate-200 rounded bg-white text-slate-400 hover:text-slate-600"
                onClick={() => setActionText("Next page clicked")}
                type="button"
              >
                <span className="material-symbols-outlined text-sm">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500">Last action: {actionText}</p>
    </div>
  );
}

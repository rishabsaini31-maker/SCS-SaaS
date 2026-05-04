import { mockParties } from "@/lib/data";

export default function PartiesPage() {
  return (
    <div className="-m-8 flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Party List Column */}
      <section className="w-1/3 min-w-[380px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-h1 text-h1 text-on-surface">Active Parties</h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-bold text-secondary uppercase tracking-wider">
              128 Total
            </span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 text-xs font-semibold rounded-lg bg-primary-container text-on-primary-container">
              All
            </button>
            <button className="flex-1 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
              Customers
            </button>
            <button className="flex-1 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
              Suppliers
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 thin-scrollbar">
          {mockParties.map((party, idx) => (
            <div
              key={party.id}
              className={`p-4 transition-colors cursor-pointer group ${
                idx === 0
                  ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-primary"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {party.name}
                </span>
                <span
                  className={`font-mono-data text-body-sm font-semibold ${
                    party.balance < 0
                      ? "text-error"
                      : party.balance > 0
                      ? "text-tertiary"
                      : "text-slate-400"
                  }`}
                >
                  {party.balance < 0
                    ? `-$${Math.abs(party.balance).toFixed(2)}`
                    : party.balance > 0
                    ? `+$${party.balance.toFixed(2)}`
                    : `$${party.balance.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 text-[12px]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">
                    call
                  </span>{" "}
                  {party.phone}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${
                    party.status === "Debit"
                      ? "bg-red-100 text-red-700"
                      : party.status === "Credit"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {party.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Party Detail / Ledger View */}
      <section className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-8 thin-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Party Profile Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                <span>Parties</span>
                <span className="material-symbols-outlined text-xs">
                  chevron_right
                </span>
                <span className="text-primary">Suppliers</span>
              </nav>
              <div>
                <h2 className="text-display-sm font-display-sm text-on-surface mb-1">
                  Metro Logistics Group
                </h2>
                <div className="flex items-center gap-4 text-slate-500 text-body-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">
                      pin_drop
                    </span>{" "}
                    4512 Industrial Way, Chicago, IL 60609
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">
                      mail
                    </span>{" "}
                    billing@metrologistics.com
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                Edit Details
              </button>
              <button className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 text-sm font-semibold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-sm">print</span>
                Statement
              </button>
            </div>
          </div>

          {/* Ledger Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-label-caps font-label-caps text-slate-500 mb-2">
                Total Outstanding
              </p>
              <p className="text-display-sm font-bold text-error">$12,450.00</p>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">warning</span>
                Next payment due in 4 days
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-label-caps font-label-caps text-slate-500 mb-2">
                Credit Limit
              </p>
              <p className="text-display-sm font-bold text-on-surface">
                $50,000.00
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: "25%" }}
                ></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-label-caps font-label-caps text-slate-500 mb-2">
                Last Payment
              </p>
              <p className="text-display-sm font-bold text-tertiary">
                $4,500.00
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Received on Oct 12, 2023
              </p>
            </div>
          </div>

          {/* Ledger Table Container */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-h1 text-h1">Transaction Ledger</h3>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-sm">
                    filter_list
                  </span>
                </button>
                <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-sm">
                    file_download
                  </span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-label-caps font-label-caps text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-label-caps font-label-caps text-slate-500">
                      Type / Reference
                    </th>
                    <th className="px-6 py-4 text-label-caps font-label-caps text-slate-500 text-right">
                      Debit
                    </th>
                    <th className="px-6 py-4 text-label-caps font-label-caps text-slate-500 text-right">
                      Credit
                    </th>
                    <th className="px-6 py-4 text-label-caps font-label-caps text-slate-500 text-right">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors h-[48px]">
                    <td className="px-6 font-mono-data text-body-sm text-slate-600">
                      2023-10-24
                    </td>
                    <td className="px-6">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-red-400">
                          description
                        </span>
                        <span className="text-body-md font-medium">
                          Invoice #INV-9921
                        </span>
                      </div>
                    </td>
                    <td className="px-6 text-right font-mono-data text-error font-medium">
                      $8,450.00
                    </td>
                    <td className="px-6 text-right font-mono-data text-slate-400">
                      —
                    </td>
                    <td className="px-6 text-right font-mono-data text-on-surface font-semibold">
                      $12,450.00
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors h-[48px]">
                    <td className="px-6 font-mono-data text-body-sm text-slate-600">
                      2023-10-12
                    </td>
                    <td className="px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-sm text-green-400"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          payments
                        </span>
                        <span className="text-body-md font-medium">
                          Payment - Bank Transfer
                        </span>
                      </div>
                    </td>
                    <td className="px-6 text-right font-mono-data text-slate-400">
                      —
                    </td>
                    <td className="px-6 text-right font-mono-data text-tertiary font-medium">
                      $4,500.00
                    </td>
                    <td className="px-6 text-right font-mono-data text-on-surface font-semibold">
                      $4,000.00
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors h-[48px]">
                    <td className="px-6 font-mono-data text-body-sm text-slate-600">
                      2023-10-05
                    </td>
                    <td className="px-6">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-red-400">
                          description
                        </span>
                        <span className="text-body-md font-medium">
                          Invoice #INV-9856
                        </span>
                      </div>
                    </td>
                    <td className="px-6 text-right font-mono-data text-error font-medium">
                      $6,500.00
                    </td>
                    <td className="px-6 text-right font-mono-data text-slate-400">
                      —
                    </td>
                    <td className="px-6 text-right font-mono-data text-on-surface font-semibold">
                      $8,500.00
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors h-[48px]">
                    <td className="px-6 font-mono-data text-body-sm text-slate-600">
                      2023-09-28
                    </td>
                    <td className="px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-sm text-green-400"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          payments
                        </span>
                        <span className="text-body-md font-medium">
                          Payment - Cash Deposit
                        </span>
                      </div>
                    </td>
                    <td className="px-6 text-right font-mono-data text-slate-400">
                      —
                    </td>
                    <td className="px-6 text-right font-mono-data text-tertiary font-medium">
                      $2,000.00
                    </td>
                    <td className="px-6 text-right font-mono-data text-on-surface font-semibold">
                      $2,000.00
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors h-[48px]">
                    <td className="px-6 font-mono-data text-body-sm text-slate-600">
                      2023-09-15
                    </td>
                    <td className="px-6">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-red-400">
                          description
                        </span>
                        <span className="text-body-md font-medium">
                          Invoice #INV-9742
                        </span>
                      </div>
                    </td>
                    <td className="px-6 text-right font-mono-data text-error font-medium">
                      $4,000.00
                    </td>
                    <td className="px-6 text-right font-mono-data text-slate-400">
                      —
                    </td>
                    <td className="px-6 text-right font-mono-data text-on-surface font-semibold">
                      $4,000.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Pagination / Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-inter">
                Showing 1-5 of 42 transactions
              </span>
              <div className="flex gap-1">
                <button className="px-3 py-1 text-xs font-semibold rounded border border-slate-200 bg-white dark:bg-slate-700 disabled:opacity-50">
                  Prev
                </button>
                <button className="px-3 py-1 text-xs font-semibold rounded border border-slate-200 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  1
                </button>
                <button className="px-3 py-1 text-xs font-semibold rounded border border-slate-200 bg-white dark:bg-slate-700">
                  2
                </button>
                <button className="px-3 py-1 text-xs font-semibold rounded border border-slate-200 bg-white dark:bg-slate-700">
                  3
                </button>
                <button className="px-3 py-1 text-xs font-semibold rounded border border-slate-200 bg-white dark:bg-slate-700">
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-h1 text-h1 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">
                  trending_up
                </span>
                Buying Pattern
              </h4>
              <div className="h-32 flex items-end gap-2 px-2">
                <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-t-sm h-[40%]"></div>
                <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-t-sm h-[65%]"></div>
                <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-t-sm h-[35%]"></div>
                <div className="flex-1 bg-blue-500 rounded-t-sm h-[90%]"></div>
                <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-t-sm h-[55%]"></div>
                <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-t-sm h-[45%]"></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-4 text-center font-inter">
                Inventory purchase frequency increased by 15% this month
              </p>
            </div>
            <div className="bg-primary text-on-primary p-6 rounded-xl border border-primary shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-h1 text-h1 mb-2">Automated Reminders</h4>
                <p className="text-sm opacity-80 mb-6">
                  Smart alerts are active for this party. We'll notify you when
                  they exceed their credit limit or have overdue invoices.
                </p>
                <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Configure Alerts
                </button>
              </div>
              {/* Abstract Background Decoration */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute right-12 top-4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {/* Page Title & Quick Stats */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-display-sm font-display-sm text-on-surface">
            Payment Entries
          </h2>
          <p className="text-body-sm text-outline font-body-sm">
            Manage cash, bank and digital transactions
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-outline-variant rounded-lg px-4 py-2 flex flex-col items-end">
            <span className="text-label-caps text-outline uppercase font-label-caps">
              Daily Collection
            </span>
            <span className="text-h1 font-h1 text-primary">₹42,850.00</span>
          </div>
        </div>
      </div>

      {/* Bento Grid - Form Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-outline-variant overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h3 className="text-h1 font-h1 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                add_circle
              </span>
              New Payment Entry
            </h3>
            <span className="text-xs text-outline font-body-sm">
              TXID: #14892-AUTO
            </span>
          </div>
          <div className="p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-label-caps font-label-caps text-on-surface-variant block">
                    PAYMENT TYPE
                  </label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md font-body-md focus:ring-2 focus:ring-primary outline-none transition-all">
                      <option>Cash</option>
                      <option>Bank Transfer (IMPS/NEFT)</option>
                      <option>UPI</option>
                      <option>Cheque</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                      expand_more
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-label-caps font-label-caps text-on-surface-variant block">
                    AMOUNT (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-semibold">
                      ₹
                    </span>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-8 pr-4 py-2.5 text-body-md font-body-md font-mono-data focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="0.00"
                      type="number"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-label-caps font-label-caps text-on-surface-variant block">
                  PARTY NAME / ACCOUNT
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                    person_search
                  </span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-body-md font-body-md focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Start typing party name..."
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-label-caps font-label-caps text-on-surface-variant block">
                  NOTES / REFERENCE
                </label>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md font-body-md focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="Add transaction details, reference numbers or specific mentions..."
                  rows={3}
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  className="px-6 py-2.5 rounded-lg border border-outline-variant text-secondary font-medium hover:bg-surface-container transition-colors active:scale-95"
                  type="reset"
                >
                  Clear Form
                </button>
                <button
                  className="px-8 py-2.5 rounded-lg bg-primary text-on-primary font-medium shadow-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    save
                  </span>
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Side Helper / Summary Card */}
        <div className="space-y-6">
          <div className="bg-primary text-on-primary-container p-6 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-label-caps opacity-80 mb-1">CASH IN HAND</h4>
              <div className="text-3xl font-bold font-h1">₹1,28,450.00</div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">
                  VERIFIED TODAY
                </span>
                <span className="material-symbols-outlined text-sm">
                  check_circle
                </span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 scale-150 group-hover:rotate-12 transition-transform duration-500">
              <span className="material-symbols-outlined text-[120px]">
                account_balance_wallet
              </span>
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-xl p-6">
            <h4 className="text-label-caps text-on-surface-variant mb-4">
              PAYMENT METHOD MIX
            </h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-outline">Cash</span>
                  <span className="font-mono-data font-semibold">45%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "45%" }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-outline">Bank/UPI</span>
                  <span className="font-mono-data font-semibold">55%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tertiary"
                    style={{ width: "55%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-dashed border-outline rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              <span className="material-symbols-outlined text-outline">
                history
              </span>
            </div>
            <p className="text-body-sm text-outline italic">
              Daily ledger automatically updates upon recording.
            </p>
          </div>
        </div>
      </section>

      {/* Transactions Table Section */}
      <section className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-h1 font-h1">Recent Transactions</h3>
          <div className="flex gap-2">
            <button className="p-2 border border-outline-variant rounded-lg text-outline hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">
                filter_list
              </span>
            </button>
            <button className="p-2 border border-outline-variant rounded-lg text-outline hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">
                download
              </span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low text-label-caps text-outline border-b border-outline-variant">
                <th className="px-6 py-4 font-semibold tracking-wider">
                  TIMESTAMP
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  PARTY / ENTITY
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">TYPE</th>
                <th className="px-6 py-4 font-semibold tracking-wider">AMOUNT</th>
                <th className="px-6 py-4 font-semibold tracking-wider">STATUS</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {/* Row 1 */}
              <tr className="hover:bg-surface-container-low transition-colors group h-12">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-body-md font-mono-data">
                      Today, 02:45 PM
                    </span>
                    <span className="text-[10px] text-outline">INV-9021</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="font-medium text-on-surface">
                    Modern Retailers Pvt Ltd
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      account_balance
                    </span>
                    <span className="text-body-sm">Bank Transfer</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="font-mono-data font-bold text-primary">
                    ₹12,400.00
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    SUCCESS
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-outline hover:text-primary">
                    <span className="material-symbols-outlined text-[20px]">
                      visibility
                    </span>
                  </button>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-surface-container-low transition-colors group h-12">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-body-md font-mono-data">
                      Today, 11:15 AM
                    </span>
                    <span className="text-[10px] text-outline">CSH-4421</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="font-medium text-on-surface">
                    Sharma General Stores
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">
                      payments
                    </span>
                    <span className="text-body-sm">Cash</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="font-mono-data font-bold text-primary">
                    ₹3,200.00
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    SUCCESS
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-outline hover:text-primary">
                    <span className="material-symbols-outlined text-[20px]">
                      visibility
                    </span>
                  </button>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-surface-container-low transition-colors group h-12">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-body-md font-mono-data">
                      Yesterday, 06:10 PM
                    </span>
                    <span className="text-[10px] text-outline">UPI-8812</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="font-medium text-on-surface">
                    Global Imports Co.
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      qr_code_2
                    </span>
                    <span className="text-body-sm">UPI</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="font-mono-data font-bold text-primary">
                    ₹24,500.00
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    PENDING
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-outline hover:text-primary">
                    <span className="material-symbols-outlined text-[20px]">
                      visibility
                    </span>
                  </button>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-surface-container-low transition-colors group h-12">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-body-md font-mono-data">
                      Yesterday, 10:20 AM
                    </span>
                    <span className="text-[10px] text-outline">INV-8955</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="font-medium text-on-surface">
                    Krishna Logistics
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      account_balance
                    </span>
                    <span className="text-body-sm">Bank Transfer</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="font-mono-data font-bold text-primary">
                    ₹18,250.00
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    FAILED
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-outline hover:text-primary">
                    <span className="material-symbols-outlined text-[20px]">
                      visibility
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant flex justify-between items-center">
          <p className="text-body-sm text-outline">Showing 1-10 of 248 entries</p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded border border-outline-variant text-body-sm hover:bg-surface-container disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="px-3 py-1.5 rounded border border-outline-variant text-body-sm hover:bg-surface-container">
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-2xl">print</span>
      </button>
    </div>
  );
}

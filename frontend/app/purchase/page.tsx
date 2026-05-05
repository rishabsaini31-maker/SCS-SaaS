"use client";

import React, { useState } from 'react';

export default function PurchasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-display-sm font-h1 text-on-surface">Purchase</h2>
          <p className="text-body-sm text-outline mt-1">Manage inbound stock and supplier procurement.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface rounded-lg font-medium text-sm hover:bg-surface-container transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">history</span>
            View Purchase History
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-lg font-medium text-sm hover:brightness-110 shadow-sm transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">add</span>
            + New Purchase
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Form & Table */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Supplier Selection Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">local_shipping</span>
                Supplier Information
              </h3>
              <a className="text-xs font-semibold text-primary hover:underline" href="#">Add New Supplier</a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Supplier Name</label>
                <div className="relative">
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none">
                    <option>Select a supplier...</option>
                    <option>Global Logistics Corp</option>
                    <option>Prime Goods Wholesalers</option>
                    <option>TechSource Components</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reference No.</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="PO-10293" type="text" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="date" defaultValue="2023-11-24" />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Line Items</h3>
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm" 
                onClick={() => setIsModalOpen(true)}
              >
                <span className="material-symbols-outlined text-sm text-primary">add_circle</span>
                Quick Add Product
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-24 text-center">Qty</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Price</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">GST %</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 group">
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-1.5 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none font-medium">
                          <option>Premium Wireless Keyboard X2</option>
                          <option>Ergonomic Optical Mouse Gen 4</option>
                          <option>USB-C Hub Multiport</option>
                          <option value="new">+ Add New Product</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">search</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input className="w-full bg-slate-100 border-none rounded py-1.5 px-2 text-sm text-center focus:ring-2 focus:ring-blue-500/20" type="number" defaultValue="12" />
                    </td>
                    <td className="px-4 py-3">
                      <input className="w-full bg-transparent border-none p-0 text-sm text-right font-mono-data text-slate-900 focus:ring-0" type="text" defaultValue="$42.50" />
                    </td>
                    <td className="px-4 py-3">
                      <select className="w-full bg-transparent border-none p-0 text-sm text-center focus:ring-0 appearance-none">
                        <option>18%</option>
                        <option>12%</option>
                        <option>5%</option>
                        <option>0%</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-slate-900 font-mono-data">
                      $601.80
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-slate-300 hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 group">
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-1.5 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none font-medium">
                          <option>Ergonomic Optical Mouse Gen 4</option>
                          <option>Premium Wireless Keyboard X2</option>
                          <option>USB-C Hub Multiport</option>
                          <option value="new">+ Add New Product</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">search</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input className="w-full bg-slate-100 border-none rounded py-1.5 px-2 text-sm text-center focus:ring-2 focus:ring-blue-500/20" type="number" defaultValue="50" />
                    </td>
                    <td className="px-4 py-3">
                      <input className="w-full bg-transparent border-none p-0 text-sm text-right font-mono-data text-slate-900 focus:ring-0" type="text" defaultValue="$18.00" />
                    </td>
                    <td className="px-4 py-3">
                      <select className="w-full bg-transparent border-none p-0 text-sm text-center focus:ring-0 appearance-none">
                        <option>18%</option>
                        <option>12%</option>
                        <option>5%</option>
                        <option>0%</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-slate-900 font-mono-data">
                      $1,062.00
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-slate-300 hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </td>
                  </tr>
                  {/* Action row for adding */}
                  <tr>
                    <td className="p-0" colSpan={6}>
                      <button className="w-full py-4 text-sm text-slate-400 hover:text-primary hover:bg-blue-50/50 flex items-center justify-center gap-2 border-t border-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Add New Item Line
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Purchase History Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h1 text-on-surface">Recent Purchase History</h3>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>Showing last 5 entries</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Purchase ID</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Total Amount</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-mono-data text-sm font-semibold text-slate-900">#PO-88219</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Prime Goods Wholesalers</td>
                    <td className="px-6 py-4 text-sm text-slate-500">Nov 22, 2023</td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-slate-900">$3,420.00</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-tight">Paid</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-mono-data text-sm font-semibold text-slate-900">#PO-88210</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Global Logistics Corp</td>
                    <td className="px-6 py-4 text-sm text-slate-500">Nov 20, 2023</td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-slate-900">$12,850.25</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-tight">Pending</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-mono-data text-sm font-semibold text-slate-900">#PO-88198</td>
                    <td className="px-6 py-4 text-sm text-slate-600">TechSource Components</td>
                    <td className="px-6 py-4 text-sm text-slate-500">Nov 18, 2023</td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-slate-900">$840.00</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-tight">Paid</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg sticky top-24">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-900 font-mono-data">$1,410.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">GST (18%)</span>
                  <span className="text-slate-900 font-mono-data">$253.80</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="text-red-500 font-mono-data">-$0.00</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-900">Grand Total</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary tracking-tight font-mono-data">$1,663.80</p>
                    <p className="text-[10px] text-slate-400 font-medium">USD Equivalent: $1,663.80</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <button className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-sm shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">save</span>
                Save Purchase
              </button>
              <button className="w-full py-3 border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">print</span>
                Save &amp; Print
              </button>
              <button className="w-full py-3 text-slate-400 hover:text-red-500 rounded-lg font-semibold text-xs transition-all">
                Cancel Transaction
              </button>
            </div>

            <div className="px-6 pb-6">
              <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-lg">info</span>
                <p className="text-[11px] leading-relaxed text-blue-700/80">Stock levels will be updated automatically upon saving this purchase. Optimized for rapid entry (Enter to move to next field).</p>
              </div>
            </div>
          </div>

          {/* Secondary Info Card */}
          <div className="bg-slate-900 rounded-xl p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Stock Health</h4>
              <p className="text-xl font-bold mb-4">Inventory Shortfall</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">You have 14 items currently below threshold. Use 'Auto-Fill' to populate this purchase with required stock.</p>
              <button className="text-xs font-bold bg-white/10 hover:bg-white/20 py-2 px-4 rounded-full transition-colors">
                Smart Replenish
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-8xl">inventory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">add_box</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Quick Add Product</h3>
                  <p className="text-xs text-slate-500">Create new catalog item</p>
                </div>
              </div>
              <button 
                className="text-slate-400 hover:text-slate-600" 
                onClick={() => setIsModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-2.5 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Wireless Mouse Pro" type="text" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-2.5 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option>Electronics</option>
                  <option>Office Supplies</option>
                  <option>Hardware</option>
                  <option>Networking</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Purchase Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-2.5 pl-7 pr-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" type="number" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">GST %</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm py-2.5 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option>18%</option>
                    <option>12%</option>
                    <option>5%</option>
                    <option>0%</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50/50 flex items-center gap-3">
              <button 
                className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-white transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button className="flex-1 py-2.5 px-4 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-sm hover:brightness-110 transition-all">
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

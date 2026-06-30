"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";
import { useBusinessProfile } from "@/hooks/useSettings";

export default function DailyBusinessSummary() {
  const [activeRange, setActiveRange] = useState("Today");
  const [customDate, setCustomDate] = useState("");

  const todayStr = new Date().toLocaleDateString('en-CA');
  const yesterdayStr = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString('en-CA');
  
  const selectedDateStr = activeRange === "Today" ? todayStr : 
                          activeRange === "Yesterday" ? yesterdayStr : 
                          customDate || todayStr;

  const { data, isLoading } = useQuery({
    queryKey: ["daily-business-summary", selectedDateStr],
    queryFn: async () => {
      const res = await api.get(`/reports/daily-summary?date=${selectedDateStr}`);
      return res.data;
    },
    enabled: !!selectedDateStr,
  });

  const { data: businessProfile } = useBusinessProfile();
  const shopName = businessProfile?.businessName?.trim() || "Your Shop";

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const {
    overview,
    customerSalesSummary,
    productSalesSummary,
    salesTeamPerformance,
    paymentSummary,
    purchaseSummary,
    inventoryMovement,
    potaBakiSummary,
    gstSummary,
    outstandingSummary,
    timeline
  } = data || {};

  const SectionHeader = ({ num, title }: { num: string, title: string }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-blue-800 text-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm shrink-0">
        {num}
      </div>
      <h2 className="text-blue-900 font-bold text-base">{title}</h2>
    </div>
  );

  return (
    <>
      {/* --- OLD UI FOR SCREEN --- */}
      <div className="max-w-[1400px] mx-auto space-y-8 pb-12 print:hidden block">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daily Business Summary</h1>
            <p className="text-slate-500 mt-1">View a complete summary of your business for {selectedDateStr}.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {["Yesterday", "Today", "Custom"].map(range => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeRange === range ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {range}
                </button>
              ))}
            </div>
            {activeRange === "Custom" && (
              <input 
                type="date" 
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Export / Print
            </button>
          </div>
        </div>

        {!data ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">No data found for the selected date.</div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* SCREEN UI SECTION 1: BUSINESS OVERVIEW */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">monitoring</span>
                Business Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-2xl border border-blue-200">
                  <p className="text-blue-600 text-sm font-medium">Total Sales</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{formatINR(overview?.totalSales || 0)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 rounded-2xl border border-purple-200">
                  <p className="text-purple-600 text-sm font-medium">Total Purchases</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{formatINR(overview?.totalPurchases || 0)}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-200">
                  <p className="text-emerald-600 text-sm font-medium">Cash Received</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{formatINR(overview?.cashReceived || 0)}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-5 rounded-2xl border border-rose-200">
                  <p className="text-rose-600 text-sm font-medium">Cash Paid + Expenses</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{formatINR((overview?.cashPaid || 0) + (overview?.expenses || 0))}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-2xl border border-amber-200">
                  <p className="text-amber-600 text-sm font-medium">Net Cash Flow</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{formatINR(overview?.netCashFlow || 0)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Invoices</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{overview?.invoicesCreated || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined text-xl">receipt_long</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Products Sold</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{overview?.productsSold || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined text-xl">inventory_2</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Customers Served</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{overview?.customersServed || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined text-xl">group</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* SCREEN UI SECTION 2: CUSTOMER SALES SUMMARY */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-lg">person</span>
                  Customer Sales Summary (Top 10)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">Customer</th>
                        <th className="px-4 py-3">Bills</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3 rounded-r-xl">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerSalesSummary?.slice(0, 10).map((customer: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">{customer.name}</td>
                          <td className="px-4 py-3 text-slate-600">{customer.bills}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{formatINR(customer.totalAmount)}</td>
                          <td className="px-4 py-3 text-red-600">{formatINR(customer.outstanding)}</td>
                        </tr>
                      ))}
                      {customerSalesSummary?.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-500">No sales recorded today.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SCREEN UI SECTION 3: PRODUCT SALES SUMMARY */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-lg">shopping_bag</span>
                  Product Sales Summary (Top 10)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">Product</th>
                        <th className="px-4 py-3">Qty Sold</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3 rounded-r-xl">Avg Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productSalesSummary?.slice(0, 10).map((product: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                          <td className="px-4 py-3 text-slate-600">{product.quantitySold}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{formatINR(product.salesAmount)}</td>
                          <td className="px-4 py-3 text-slate-600">{formatINR(product.averageSellingPrice)}</td>
                        </tr>
                      ))}
                      {productSalesSummary?.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-500">No products sold today.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SCREEN UI SECTION 4: SALES TEAM PERFORMANCE */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-lg">badge</span>
                  Sales Team Performance
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">Salesman</th>
                        <th className="px-4 py-3">Bills</th>
                        <th className="px-4 py-3 rounded-r-xl">Sales Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesTeamPerformance?.map((staff: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">{staff.name}</td>
                          <td className="px-4 py-3 text-slate-600">{staff.totalBills}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{formatINR(staff.totalSalesAmount)}</td>
                        </tr>
                      ))}
                      {salesTeamPerformance?.length === 0 && (
                        <tr><td colSpan={3} className="px-4 py-4 text-center text-slate-500">No sales team performance recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SCREEN UI SECTION 5: PAYMENT SUMMARY */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-500 text-lg">account_balance_wallet</span>
                  Payment Summary
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">Cash Payments</p>
                    <p className="text-lg font-bold text-slate-900">{formatINR(paymentSummary?.cash || 0)}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">UPI Payments</p>
                    <p className="text-lg font-bold text-slate-900">{formatINR(paymentSummary?.upi || 0)}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">Bank / Transfer</p>
                    <p className="text-lg font-bold text-slate-900">{formatINR(paymentSummary?.bank || 0)}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">Cheque Payments</p>
                    <p className="text-lg font-bold text-slate-900">{formatINR(paymentSummary?.cheque || 0)}</p>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 col-span-2">
                    <p className="text-sm text-rose-600 font-medium">Credit Sales (Unpaid Invoices)</p>
                    <p className="text-lg font-bold text-rose-900">{formatINR(paymentSummary?.creditSales || 0)}</p>
                  </div>
                </div>
              </section>

              {/* SCREEN UI SECTION 6: PURCHASE SUMMARY */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-lg">local_shipping</span>
                  Purchase Summary
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">Supplier</th>
                        <th className="px-4 py-3">Bills</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3 rounded-r-xl">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {purchaseSummary?.map((supplier: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">{supplier.name}</td>
                          <td className="px-4 py-3 text-slate-600">{supplier.bills}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{formatINR(supplier.purchaseAmount)}</td>
                          <td className="px-4 py-3 text-red-600">{formatINR(supplier.outstanding)}</td>
                        </tr>
                      ))}
                      {purchaseSummary?.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-500">No purchases recorded today.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SCREEN UI SECTION 8: POTA BAKI SUMMARY */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-lg">savings</span>
                    Pota Baki Summary
                  </div>
                  {potaBakiSummary && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${potaBakiSummary.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {potaBakiSummary.status}
                    </span>
                  )}
                </h2>
                {potaBakiSummary ? (
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Opening Balance</span>
                      <span className="font-medium text-slate-900">{formatINR(potaBakiSummary.openingBalance)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-emerald-600 font-medium">Cash In</span>
                      <span className="font-bold text-emerald-600">+{formatINR(potaBakiSummary.cashIn)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-rose-600 font-medium">Cash Out</span>
                      <span className="font-bold text-rose-600">-{formatINR(potaBakiSummary.cashOut)}</span>
                    </div>
                    <div className="flex justify-between py-2 bg-slate-50 px-3 rounded-lg">
                      <span className="text-slate-900 font-bold">Closing Balance</span>
                      <span className="font-bold text-blue-600">{formatINR(potaBakiSummary.closingBalance)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-xl">No Cash Book record for this date.</div>
                )}
              </section>
              
              {/* SCREEN UI SECTION 9: GST SUMMARY & SECTION 10: OUTSTANDING */}
              <div className="space-y-8">
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500 text-lg">receipt_long</span>
                    GST Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-sm text-slate-500">Taxable Amount</p>
                      <p className="text-lg font-bold text-slate-900">{formatINR(gstSummary?.taxableAmount || 0)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-sm text-slate-500">GST Amount</p>
                      <p className="text-lg font-bold text-slate-900">{formatINR(gstSummary?.gstAmount || 0)}</p>
                    </div>
                    <div className="col-span-2 bg-blue-50 p-4 rounded-xl flex justify-between items-center">
                      <p className="text-sm text-blue-700 font-medium">Total Invoices Generated</p>
                      <p className="text-lg font-bold text-blue-900">{gstSummary?.invoiceCount || 0}</p>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500 text-lg">account_balance</span>
                    Total Outstanding Summary
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                      <span className="text-emerald-700 text-sm font-medium">Customer Outstanding (To Receive)</span>
                      <span className="font-bold text-emerald-700">{formatINR(outstandingSummary?.customerOutstanding || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl">
                      <span className="text-rose-700 text-sm font-medium">Supplier Outstanding (To Pay)</span>
                      <span className="font-bold text-rose-700">{formatINR(outstandingSummary?.supplierOutstanding || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-100 rounded-xl border border-slate-200">
                      <span className="text-slate-800 text-sm font-bold">Net Balance</span>
                      <span className="font-bold text-slate-900">{formatINR(outstandingSummary?.netReceivable || 0)}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* SCREEN UI SECTION 7 & 13: INVENTORY MOVEMENT & LOW STOCK */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 col-span-1 lg:col-span-2">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500 text-lg">inventory</span>
                  Inventory Movement & Low Stock Alerts
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">Product</th>
                        <th className="px-4 py-3">Opening</th>
                        <th className="px-4 py-3 text-emerald-600">Purchased</th>
                        <th className="px-4 py-3 text-rose-600">Sold</th>
                        <th className="px-4 py-3 rounded-r-xl">Closing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventoryMovement?.slice(0, 15).map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {item.product}
                            {item.closingStock < 10 && (
                              <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Low Stock</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{item.openingStock}</td>
                          <td className="px-4 py-3 text-emerald-600 font-medium">+{item.purchased}</td>
                          <td className="px-4 py-3 text-rose-600 font-medium">-{item.sold}</td>
                          <td className={`px-4 py-3 font-bold ${item.closingStock < 10 ? 'text-amber-600' : 'text-slate-900'}`}>{item.closingStock}</td>
                        </tr>
                      ))}
                      {inventoryMovement?.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-4 text-center text-slate-500">No inventory movement recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
              
              {/* SCREEN UI SECTION 14: DAILY TIMELINE */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 col-span-1 lg:col-span-2">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500 text-lg">history</span>
                  Daily Timeline
                </h2>
                <div className="relative border-l border-slate-200 ml-4 space-y-6">
                  {timeline?.map((event: any, idx: number) => {
                     const isIncome = event.type === 'Invoice' || event.type === 'Customer Payment';
                     const isExpense = event.type === 'Purchase' || event.type === 'Expense' || event.type === 'Supplier Payment';
                     return (
                    <div key={idx} className="relative pl-6">
                      <div className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white ${isIncome ? 'bg-emerald-500' : isExpense ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">{new Date(event.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-sm font-medium text-slate-900 mt-0.5">{event.description}</p>
                        </div>
                        <div className={`text-sm font-bold ${isIncome ? 'text-emerald-600' : isExpense ? 'text-rose-600' : 'text-slate-900'}`}>
                          {formatINR(event.amount)}
                        </div>
                      </div>
                    </div>
                  )})}
                  {timeline?.length === 0 && (
                    <div className="pl-6 text-sm text-slate-500">No activity recorded for this day.</div>
                  )}
                </div>
              </section>

            </div>
          </div>
        )}
      </div>

      {/* --- SIMPLE PROFESSIONAL PRINT LAYOUT --- */}
      <div className="hidden print:block print-area bg-white m-0 p-0" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px', color: '#000' }}>
        
        {/* Print Header */}
        <table style={{ width: '100%', borderBottom: '2px solid #000', marginBottom: '8px' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%', verticalAlign: 'bottom', paddingBottom: '6px' }}>
                <div style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '1px' }}>SCS FLOW</div>
                <div style={{ fontSize: '9px', color: '#555', letterSpacing: '2px' }}>SMART. SIMPLE. SCALABLE.</div>
              </td>
              <td style={{ width: '40%', textAlign: 'center', verticalAlign: 'bottom', paddingBottom: '6px' }}>
                <div style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '1px' }}>DAILY BUSINESS SUMMARY</div>
              </td>
              <td style={{ width: '30%', textAlign: 'right', verticalAlign: 'bottom', paddingBottom: '6px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{shopName}</div>
                <div style={{ fontSize: '10px', color: '#333' }}>Date: {selectedDateStr}</div>
                <div style={{ fontSize: '9px', color: '#777' }}>Generated: {new Date().toLocaleString()}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {!data ? (
          <div className="text-center py-10 text-slate-500">No data found for the selected date.</div>
        ) : (
          <div>
            
            {/* ===== SECTION 1: BUSINESS OVERVIEW ===== */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>1. Business Overview</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'left', fontWeight: 600 }}>Particulars</th>
                    <th style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                    <th style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'left', fontWeight: 600 }}>Particulars</th>
                    <th style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>Count / Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Total Sales</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{formatINR(overview?.totalSales || 0)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Invoices Created</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{overview?.invoicesCreated || 0}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Total Purchases</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{formatINR(overview?.totalPurchases || 0)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Products Sold</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{overview?.productsSold || 0} Units</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Cash Received</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{formatINR(overview?.cashReceived || 0)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Customers Served</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{overview?.customersServed || 0}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Cash Paid</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{formatINR(overview?.cashPaid || 0)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Expenses</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>{formatINR(overview?.expenses || 0)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>Net Cash Flow</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px', textAlign: 'right' }}>{formatINR(overview?.netCashFlow || 0)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}></td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Two-column layout for sections 2 & 3 */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '6px' }}>
                    {/* ===== SECTION 2: CUSTOMER SALES SUMMARY ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>2. Customer Sales Summary</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>Customer</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center', fontWeight: 600 }}>Bills</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Outstanding</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerSalesSummary?.slice(0, 10).map((c: any, i: number) => (
                          <tr key={i}>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>{c.name}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{c.bills}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(c.totalAmount)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(c.outstanding)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Total</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{customerSalesSummary?.reduce((a:number, c:any)=>a+c.bills,0) || 0}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(customerSalesSummary?.reduce((a:number, c:any)=>a+c.totalAmount,0) || 0)}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(customerSalesSummary?.reduce((a:number, c:any)=>a+c.outstanding,0) || 0)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '6px' }}>
                    {/* ===== SECTION 3: PRODUCT SALES SUMMARY ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>3. Product Sales Summary</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>Product</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center', fontWeight: 600 }}>Qty</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Avg. Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productSalesSummary?.slice(0, 10).map((p: any, i: number) => (
                          <tr key={i}>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>{p.name}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{p.quantitySold}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(p.salesAmount)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(p.averageSellingPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Total</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{productSalesSummary?.reduce((a:number, c:any)=>a+c.quantitySold,0) || 0}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(productSalesSummary?.reduce((a:number, c:any)=>a+c.salesAmount,0) || 0)}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>-</td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Two-column layout for sections 4 & 5 */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '6px' }}>
                    {/* ===== SECTION 4: SALES TEAM PERFORMANCE ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>4. Sales Team Performance</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>Salesman</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center', fontWeight: 600 }}>Bills</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Sales Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesTeamPerformance?.map((s: any, i: number) => (
                          <tr key={i}>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>{s.name}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{s.totalBills}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(s.totalSalesAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Total</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{salesTeamPerformance?.reduce((a:number, c:any)=>a+c.totalBills,0) || 0}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(salesTeamPerformance?.reduce((a:number, c:any)=>a+c.totalSalesAmount,0) || 0)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '6px' }}>
                    {/* ===== SECTION 5: PAYMENT SUMMARY ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>5. Payment Summary</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>Payment Mode</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Cash</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(paymentSummary?.cash || 0)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>UPI</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(paymentSummary?.upi || 0)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Bank / Transfer</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(paymentSummary?.bank || 0)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Cheque</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(paymentSummary?.cheque || 0)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Credit Sales (Unpaid)</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(paymentSummary?.creditSales || 0)}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Total Collections</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR((paymentSummary?.cash || 0) + (paymentSummary?.upi || 0) + (paymentSummary?.bank || 0) + (paymentSummary?.cheque || 0))}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Two-column layout for sections 6 & 7 */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '6px' }}>
                    {/* ===== SECTION 6: PURCHASE SUMMARY ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>6. Purchase Summary</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>Supplier</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center', fontWeight: 600 }}>Bills</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Outstanding</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseSummary?.slice(0, 10).map((s: any, i: number) => (
                          <tr key={i}>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>{s.name}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{s.bills}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(s.purchaseAmount)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(s.outstanding)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Total</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{purchaseSummary?.reduce((a:number, c:any)=>a+c.bills,0) || 0}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(purchaseSummary?.reduce((a:number, c:any)=>a+c.purchaseAmount,0) || 0)}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(purchaseSummary?.reduce((a:number, c:any)=>a+c.outstanding,0) || 0)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '6px' }}>
                    {/* ===== SECTION 7: INVENTORY MOVEMENT ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>7. Inventory Movement</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>Product</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center', fontWeight: 600 }}>Open</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center', fontWeight: 600 }}>In</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center', fontWeight: 600 }}>Out</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Close</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryMovement?.slice(0, 8).map((item: any, i: number) => (
                          <tr key={i}>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>{item.product}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{item.openingStock}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>+{item.purchased}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>-{item.sold}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{item.closingStock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Three-column layout for sections 8, 9, 10 */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '33.33%', verticalAlign: 'top', paddingRight: '6px' }}>
                    {/* ===== SECTION 8: POTA BAKI (CASH BOOK) ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>8. Pota Baki (Cash Book)</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Opening Balance</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(potaBakiSummary?.openingBalance || 0)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Cash In (+)</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(potaBakiSummary?.cashIn || 0)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Cash Out (-)</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(potaBakiSummary?.cashOut || 0)}</td>
                        </tr>
                        <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Closing Balance</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(potaBakiSummary?.closingBalance || 0)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Status</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{potaBakiSummary?.status || 'CLOSED'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{ width: '33.33%', verticalAlign: 'top', paddingLeft: '3px', paddingRight: '3px' }}>
                    {/* ===== SECTION 9: GST SUMMARY ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>9. GST Summary</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>Particulars</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Taxable Amount</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(gstSummary?.taxableAmount || 0)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>GST Amount</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(gstSummary?.gstAmount || 0)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Invoices Generated</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{gstSummary?.invoiceCount || 0}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{ width: '33.33%', verticalAlign: 'top', paddingLeft: '6px' }}>
                    {/* ===== SECTION 10: OUTSTANDING SUMMARY ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>10. Outstanding Summary</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Customer Outstanding (To Receive)</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(outstandingSummary?.customerOutstanding || 0)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Supplier Outstanding (To Pay)</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(outstandingSummary?.supplierOutstanding || 0)}</td>
                        </tr>
                        <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>Net Receivable</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{formatINR(outstandingSummary?.netReceivable || 0)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Three-column layout for sections 11, 12, 13 */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '33.33%', verticalAlign: 'top', paddingRight: '6px' }}>
                    {/* ===== SECTION 11: TOP 10 CUSTOMERS ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>11. Top 10 Customers</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>#</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>Customer</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerSalesSummary?.slice(0, 10).map((c: any, i: number) => (
                          <tr key={i}>
                            <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{i+1}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{c.name}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 6px', textAlign: 'right' }}>{formatINR(c.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                  <td style={{ width: '33.33%', verticalAlign: 'top', paddingLeft: '3px', paddingRight: '3px' }}>
                    {/* ===== SECTION 12: TOP 10 PRODUCTS ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>12. Top 10 Products</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>#</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>Product</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center', fontWeight: 600 }}>Qty</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productSalesSummary?.slice(0, 10).map((p: any, i: number) => (
                          <tr key={i}>
                            <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{i+1}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{p.name}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 6px', textAlign: 'center' }}>{p.quantitySold}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 6px', textAlign: 'right' }}>{formatINR(p.salesAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                  <td style={{ width: '33.33%', verticalAlign: 'top', paddingLeft: '6px' }}>
                    {/* ===== SECTION 13: LOW STOCK ALERTS ===== */}
                    <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>13. Low Stock Alerts</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>Product</th>
                          <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryMovement?.filter((i:any)=>i.closingStock<10).slice(0,10).map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{item.product}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 6px', textAlign: 'right', fontWeight: 700 }}>{item.closingStock}</td>
                          </tr>
                        ))}
                        {inventoryMovement?.filter((i:any)=>i.closingStock<10).length === 0 && (
                          <tr><td colSpan={2} style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center', color: '#999' }}>No low stock items</td></tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ===== SECTION 14: DAILY TIMELINE ===== */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>14. Daily Timeline</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600, width: '80px' }}>Time</th>
                    <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600 }}>Description</th>
                    <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontWeight: 600, width: '80px' }}>Type</th>
                    <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600, width: '100px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline?.slice(0,15).map((event: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{new Date(event.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                      <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{event.description}</td>
                      <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{event.type}</td>
                      <td style={{ border: '1px solid #ccc', padding: '2px 6px', textAlign: 'right' }}>{formatINR(event.amount)}</td>
                    </tr>
                  ))}
                  {timeline?.length === 0 && (
                    <tr><td colSpan={4} style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center', color: '#999' }}>No activity recorded</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Print Footer */}
            <table style={{ width: '100%', borderTop: '2px solid #000', marginTop: '12px', paddingTop: '4px', fontSize: '9px', color: '#777' }}>
              <tbody>
                <tr>
                  <td style={{ width: '33%', verticalAlign: 'top' }}>
                    <span style={{ fontWeight: 700, color: '#000' }}>SCS FLOW</span> &mdash; Smart. Simple. Scalable.
                  </td>
                  <td style={{ width: '34%', textAlign: 'center', verticalAlign: 'top' }}>
                    <span style={{ fontWeight: 600 }}>{shopName}</span> | Daily Business Summary &mdash; {selectedDateStr}
                  </td>
                  <td style={{ width: '33%', textAlign: 'right', verticalAlign: 'top' }}>
                    Page 1 of 1
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          aside, header {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-container {
            width: 100%;
            max-width: 100%;
          }
          .print-area table {
            page-break-inside: auto;
          }
          .print-area tr {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}

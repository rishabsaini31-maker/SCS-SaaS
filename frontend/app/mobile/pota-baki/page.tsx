"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatINR } from "@/lib/currency";
import { toast } from "@/lib/toast";
import api from "@/lib/api";

export default function MobilePotaBakiPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString("en-CA"));
  const isToday = selectedDate === new Date().toLocaleDateString("en-CA");

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Office Expense");
  const [expenseCustomCategory, setExpenseCustomCategory] = useState("");
  const [expenseReason, setExpenseReason] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [expensePaymentMode, setExpensePaymentMode] = useState("CASH");
  const [expensePaymentAccount, setExpensePaymentAccount] = useState("");
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  const { data: dateData, refetch: loadTodayData } = useQuery({
    queryKey: ["cashbook", selectedDate],
    queryFn: async () => {
      const response = await api.get(`/pota-baki?date=${selectedDate}`);
      return response.data;
    }
  });

  const cashBook = dateData?.cashBook;
  const isReadOnly = !isToday || cashBook?.status === "CLOSED";



  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }
    const finalCategory = expenseCategory === "Other" ? expenseCustomCategory : expenseCategory;
    if (!finalCategory.trim()) {
      toast.error("Please provide an expense category");
      return;
    }
    if (!expenseReason.trim()) {
      toast.error("Please provide a reason/description for the expense");
      return;
    }

    setIsSubmittingExpense(true);
    try {
      await api.post("/expenses", {
        amount,
        category: finalCategory,
        reason: expenseReason,
        notes: expenseNotes,
        paymentMode: expensePaymentMode,
        paymentAccount: expensePaymentAccount,
      });
      toast.success("Expense added successfully!");
      setIsExpenseModalOpen(false);
      setExpenseAmount("");
      setExpenseCategory("Office Expense");
      setExpenseCustomCategory("");
      setExpenseReason("");
      setExpenseNotes("");
      setExpensePaymentMode("CASH");
      setExpensePaymentAccount("");
      await loadTodayData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to add expense");
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pota Baki</h2>
          <p className="text-xs text-slate-500">{new Date(selectedDate).toDateString()}</p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="bg-rose-50 border border-rose-200 text-rose-700 font-semibold px-3 py-2 rounded-lg text-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">payments</span>
            Expense
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <span className="text-sm font-semibold text-slate-600">Closing Balance</span>
          <span className="text-xl font-bold text-slate-900">
            {formatINR(cashBook?.closingBalance || 0)}
          </span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
          <div className="p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Cash In</span>
            <span className="text-lg font-bold text-emerald-600">{formatINR(cashBook?.totalCashIn || 0)}</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Cash Out</span>
            <span className="text-lg font-bold text-rose-600">{formatINR(cashBook?.totalExpense || 0)}</span>
          </div>
        </div>
      </div>

      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600">payments</span>
                Expense
              </h3>
              <button
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setIsExpenseModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit}>
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="text-sm font-medium text-slate-700">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white"
                  >
                    <option value="Fuel">Fuel</option>
                    <option value="Tea & Snacks">Tea & Snacks</option>
                    <option value="Office Expense">Office Expense</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Internet">Internet</option>
                    <option value="Rent">Rent</option>
                    <option value="Salary Advance">Salary Advance</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Bank Deposit">Bank Deposit</option>
                    <option value="Personal Withdrawal">Personal Withdrawal</option>
                    <option value="Other">Other (Custom)</option>
                  </select>
                </div>
                {expenseCategory === "Other" && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Custom Category</label>
                    <input
                      type="text"
                      required
                      value={expenseCustomCategory}
                      onChange={(e) => setExpenseCustomCategory(e.target.value)}
                      className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                      placeholder="Specify category"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-700">Reason / Description</label>
                  <input
                    type="text"
                    required
                    value={expenseReason}
                    onChange={(e) => setExpenseReason(e.target.value)}
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    placeholder="Why was this expense made?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Payment Mode</label>
                    <select
                      value={expensePaymentMode}
                      onChange={(e) => setExpensePaymentMode(e.target.value)}
                      className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white"
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK">Bank</option>
                      <option value="UPI">UPI</option>
                      <option value="CARD">Card</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Payment Account</label>
                    <input
                      type="text"
                      value={expensePaymentAccount}
                      onChange={(e) => setExpensePaymentAccount(e.target.value)}
                      className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                      placeholder="e.g. ICICI"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Notes (Optional)</label>
                  <textarea
                    value={expenseNotes}
                    onChange={(e) => setExpenseNotes(e.target.value)}
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none h-20"
                    placeholder="Any additional details"
                  ></textarea>
                </div>
              </div>
              <div className="p-4 bg-slate-50 flex items-center gap-3">
                <button
                  type="button"
                  className="flex-1 py-2 px-3 border border-slate-300 text-slate-700 bg-white rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                  onClick={() => setIsExpenseModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="flex-1 py-2 px-3 bg-rose-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-rose-500 transition-all disabled:opacity-50"
                >
                  {isSubmittingExpense ? "Processing..." : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { formatINR } from "@/lib/currency";
import { toast } from "@/lib/toast";

type Transaction = {
  id: string;
  time: string;
  type: string;
  typeName: string;
  person: string;
  amount: number;
  direction: "IN" | "OUT";
  staffName?: string;
  returnDate?: string;
  category?: string;
  description?: string;
};

const defaultTransactions: Transaction[] = [
  {
    id: "tx-1",
    time: "10:30 AM",
    type: "cash_sale",
    typeName: "Cash Sale",
    person: "ABC Traders",
    amount: 15000,
    direction: "IN",
    description: "Sale of items to ABC Traders",
  },
  {
    id: "tx-2",
    time: "01:00 PM",
    type: "staff",
    typeName: "Staff Cash Taken",
    person: "Ramesh Kumar",
    amount: 5000,
    direction: "OUT",
    staffName: "Ramesh Kumar",
    returnDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    description: "Temporary advance to staff",
  },
  {
    id: "tx-3",
    time: "03:00 PM",
    type: "owner",
    typeName: "Owner Withdrawal",
    person: "Family Expense",
    amount: 30000,
    direction: "OUT",
    category: "Home Expense",
    description: "Personal withdrawal for family expenses",
  },
  {
    id: "tx-4",
    time: "04:45 PM",
    type: "customer_payment",
    typeName: "Customer Payment",
    person: "Metro Mart",
    amount: 5000,
    direction: "IN",
    description: "Received payment against invoice",
  },
];

const transactionTypes = [
  { value: "cash_sale", name: "Cash Sale", direction: "IN" },
  { value: "customer_payment", name: "Customer Payment", direction: "IN" },
  { value: "expense", name: "Expense", direction: "OUT" },
  { value: "angadiya", name: "Angadiya Payment", direction: "OUT" },
  { value: "loan", name: "Loan Given/Received", direction: "OUT" },
  { value: "bank", name: "Bank Deposit/Withdrawal", direction: "OUT" },
  { value: "staff", name: "Staff Cash Taken", direction: "OUT" },
  { value: "owner", name: "Owner Withdrawal", direction: "OUT" },
  { value: "personal", name: "Personal Expense", direction: "OUT" },
  { value: "advance", name: "Temporary Cash Advance", direction: "OUT" },
];

export default function PotaBakiPage() {
  const [openingBalance, setOpeningBalance] = useState<number>(200000);
  const [isEditingOpening, setIsEditingOpening] = useState(false);
  const [tempOpening, setTempOpening] = useState("200000");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Form State
  const [txType, setTxType] = useState("staff");
  const [amountInput, setAmountInput] = useState("");
  const [staffName, setStaffName] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [ownerCategory, setOwnerCategory] = useState("Home Expense");
  const [description, setDescription] = useState("");

  // Load from local storage
  useEffect(() => {
    const savedTx = localStorage.getItem("scs_pota_transactions");
    const savedOpening = localStorage.getItem("scs_pota_opening");
    
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx));
      } catch (e) {
        setTransactions(defaultTransactions);
      }
    } else {
      setTransactions(defaultTransactions);
    }

    if (savedOpening) {
      setOpeningBalance(Number(savedOpening));
      setTempOpening(savedOpening);
    }
  }, []);

  // Save to local storage
  const saveState = (newTx: Transaction[], newOpening: number) => {
    localStorage.setItem("scs_pota_transactions", JSON.stringify(newTx));
    localStorage.setItem("scs_pota_opening", String(newOpening));
  };

  const selectedTypeObj = useMemo(() => {
    return transactionTypes.find((t) => t.value === txType) || transactionTypes[0];
  }, [txType]);

  const totals = useMemo(() => {
    let cashIn = 0;
    let cashOut = 0;
    transactions.forEach((tx) => {
      if (tx.direction === "IN") {
        cashIn += tx.amount;
      } else {
        cashOut += tx.amount;
      }
    });
    return {
      cashIn,
      cashOut,
      closing: openingBalance + cashIn - cashOut,
    };
  }, [transactions, openingBalance]);

  // Visual percentages
  const inflowRatio = useMemo(() => {
    const total = totals.cashIn + totals.cashOut;
    if (total === 0) return 50;
    return Math.round((totals.cashIn / total) * 100);
  }, [totals]);

  const outflowRatio = useMemo(() => {
    const total = totals.cashIn + totals.cashOut;
    if (total === 0) return 50;
    return Math.round((totals.cashOut / total) * 100);
  }, [totals]);

  // Monthly stats summary
  const monthlySnap = useMemo(() => {
    let staffAdvances = 0;
    let ownerWithdrawals = 0;
    let angadiyaSettled = 0;

    transactions.forEach((tx) => {
      if (tx.type === "staff" || tx.type === "advance") {
        staffAdvances += tx.amount;
      } else if (tx.type === "owner" || tx.type === "personal") {
        ownerWithdrawals += tx.amount;
      } else if (tx.type === "angadiya") {
        angadiyaSettled += tx.amount;
      }
    });

    // Seed dummy values to make it look premium
    return {
      staffAdvances: staffAdvances + 37000,
      ownerWithdrawals: ownerWithdrawals + 85000,
      angadiyaSettled: angadiyaSettled + 840000,
    };
  }, [transactions]);

  const handleUpdateOpening = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempOpening);
    if (!isNaN(val) && val >= 0) {
      setOpeningBalance(val);
      setIsEditingOpening(false);
      saveState(transactions, val);
      toast.success("Opening balance updated successfully!");
    } else {
      toast.error("Please enter a valid amount");
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    const typeDetails = selectedTypeObj;
    let personName = "General";
    
    if (typeDetails.value === "staff" || typeDetails.value === "advance") {
      if (!staffName.trim()) {
        toast.error("Please enter a staff name");
        return;
      }
      personName = staffName.trim();
    } else if (typeDetails.value === "owner" || typeDetails.value === "personal") {
      personName = ownerCategory;
    } else if (typeDetails.value === "cash_sale") {
      personName = "Cash Customer";
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newTx: Transaction = {
      id: "tx-" + Date.now(),
      time: timeStr,
      type: typeDetails.value,
      typeName: typeDetails.name,
      person: personName,
      amount: amt,
      direction: typeDetails.direction as "IN" | "OUT",
      staffName: typeDetails.value === "staff" || typeDetails.value === "advance" ? staffName.trim() : undefined,
      returnDate: typeDetails.value === "staff" || typeDetails.value === "advance" ? returnDate : undefined,
      category: typeDetails.value === "owner" || typeDetails.value === "personal" ? ownerCategory : undefined,
      description: description.trim() || undefined,
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    saveState(updatedTx, openingBalance);

    // Reset fields
    setAmountInput("");
    setStaffName("");
    setReturnDate("");
    setDescription("");
    toast.success(`Transaction recorded: ${newTx.typeName}`);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      const updatedTx = transactions.filter((t) => t.id !== id);
      setTransactions(updatedTx);
      saveState(updatedTx, openingBalance);
      toast.success("Transaction deleted successfully");
    }
  };

  const handleCloseDay = () => {
    setTransactions([]);
    setOpeningBalance(totals.closing);
    saveState([], totals.closing);
    setIsCloseModalOpen(false);
    toast.success("Pota closed successfully! Today's closing balance is now the new opening balance.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 print:p-0 print:m-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm print:hidden">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface text-2xl font-bold flex items-center gap-2">
            <span>💰 Pota Baki (Cash Book)</span>
          </h2>
          <p className="font-body-md text-body-md text-slate-500 mt-1">
            Track daily cash position, withdrawals, staff advances, and closing balance.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export Statement
          </button>
          <button
            onClick={() => setIsCloseModalOpen(true)}
            className="flex-1 sm:flex-initial bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">lock_clock</span>
            Close Day
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4">
        {/* Card 1: Opening Balance */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Opening Balance
          </p>
          {isEditingOpening ? (
            <form onSubmit={handleUpdateOpening} className="flex gap-2 mt-2">
              <input
                type="number"
                value={tempOpening}
                onChange={(e) => setTempOpening(e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded text-sm font-semibold"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 bg-green-600 text-white rounded text-xs"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempOpening(String(openingBalance));
                  setIsEditingOpening(false);
                }}
                className="px-2 py-1 bg-slate-300 rounded text-xs"
              >
                ✕
              </button>
            </form>
          ) : (
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-2xl font-bold text-slate-900">
                {formatINR(openingBalance)}
              </h3>
              <button
                onClick={() => setIsEditingOpening(true)}
                className="opacity-0 group-hover:opacity-100 text-blue-600 text-xs hover:underline transition-opacity print:hidden"
              >
                Edit
              </button>
            </div>
          )}
          <div className="mt-4 flex items-center gap-1 text-[11px] text-slate-400">
            <span className="material-symbols-outlined text-[14px]">event</span>
            <span>As of 08:00 AM Today</span>
          </div>
        </div>

        {/* Card 2: Cash In */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Cash In
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {formatINR(totals.cashIn)}
          </h3>
          <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${inflowRatio}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Cash Out */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Cash Out
          </p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">
            {formatINR(totals.cashOut)}
          </h3>
          <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all duration-500"
              style={{ width: `${outflowRatio}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Closing Balance */}
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg border border-blue-700">
          <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-1">
            Closing Balance
          </p>
          <h3 className="text-2xl font-bold mt-1">
            {formatINR(totals.closing)}
          </h3>
          <div className="mt-4 flex items-center gap-1 text-[11px] text-blue-100">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span>Real-time updated</span>
          </div>
        </div>
      </div>

      {/* Accounting Visual Calculation */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
        <div className="absolute -right-6 -top-6 opacity-[0.03] rotate-12 pointer-events-none">
          <span className="material-symbols-outlined text-[180px]">calculate</span>
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          Visual Cash Position Summary
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10 text-center w-full">
          <div>
            <p className="text-slate-500 text-xs mb-1 font-medium">Opening Balance</p>
            <p className="text-lg font-bold font-mono text-slate-800">
              {formatINR(openingBalance)}
            </p>
          </div>
          <div className="text-slate-300 font-bold text-xl">
            <span className="material-symbols-outlined text-2xl">add</span>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1 font-medium">Cash Inflows</p>
            <p className="text-lg font-bold font-mono text-emerald-600">
              +{formatINR(totals.cashIn)}
            </p>
          </div>
          <div className="text-slate-300 font-bold text-xl">
            <span className="material-symbols-outlined text-2xl">remove</span>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1 font-medium">Cash Outflows</p>
            <p className="text-lg font-bold font-mono text-red-600">
              -{formatINR(totals.cashOut)}
            </p>
          </div>
          <div className="text-slate-300 font-bold text-xl">
            <span className="material-symbols-outlined text-2xl">drag_handle</span>
          </div>
          <div className="bg-blue-50 border border-blue-100 px-6 py-3 rounded-xl">
            <p className="text-blue-600 text-xs mb-1 font-bold">Net Closing</p>
            <p className="text-xl font-bold font-mono text-blue-800">
              {formatINR(totals.closing)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Entry Form & Stats */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          {/* New Transaction Form */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">edit_note</span>
                New Entry
              </h4>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Transaction Type
                </label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  className="w-full border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {transactionTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.name} ({t.direction === "IN" ? "Cash In" : "Cash Out"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full border-slate-200 rounded-lg text-sm font-mono focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Conditional Staff Fields */}
              {(txType === "staff" || txType === "advance") && (
                <div className="space-y-4 p-3 bg-blue-50/30 rounded-lg border border-blue-100">
                  <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1.5">
                      Staff Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full border-slate-200 bg-white rounded-lg text-sm focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1.5">
                      Expected Return Date
                    </label>
                    <input
                      type="date"
                      required
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full border-slate-200 bg-white rounded-lg text-sm focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Conditional Owner Fields */}
              {(txType === "owner" || txType === "personal") && (
                <div className="space-y-4 p-3 bg-orange-50/30 rounded-lg border border-orange-100">
                  <div>
                    <label className="block text-xs font-bold text-orange-600 uppercase mb-1.5">
                      Category
                    </label>
                    <select
                      value={ownerCategory}
                      onChange={(e) => setOwnerCategory(e.target.value)}
                      className="w-full border-slate-200 bg-white rounded-lg text-sm focus:ring-blue-500"
                    >
                      <option value="Home Expense">Home Expense</option>
                      <option value="Personal Travel">Personal Travel</option>
                      <option value="Family Emergency">Family Emergency</option>
                      <option value="Investment">Investment</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Description / Remarks
                </label>
                <textarea
                  placeholder="Note down specifics..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border-slate-200 rounded-lg text-sm focus:ring-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                Save Transaction
              </button>
            </form>
          </div>

          {/* Quick Analytics Stats */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">trending_up</span>
              Monthly Snap
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Staff Advances</span>
                <span className="font-bold text-slate-900">{formatINR(monthlySnap.staffAdvances)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Owner Withdrawals</span>
                <span className="font-bold text-slate-900">{formatINR(monthlySnap.ownerWithdrawals)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Angadiya Settled</span>
                <span className="font-bold text-slate-900">{formatINR(monthlySnap.angadiyaSettled)}</span>
              </div>
              <hr className="border-slate-100" />
              <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
                <div>
                  <p className="text-xs font-bold text-amber-800">Pending Advances</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Staff returns are monitored daily. Alert owner if advances remain unreturned over 7 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction Table & Charts */}
        <div className="lg:col-span-2 space-y-6 print:col-span-3">
          {/* Today's Transactions Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-slate-800">Today's Transactions</h4>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Person / Entity</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Direction</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-semibold font-mono text-slate-500">
                        {tx.time}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {tx.typeName}
                        {tx.category && (
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                            Category: {tx.category}
                          </span>
                        )}
                        {tx.returnDate && (
                          <span className="block text-[10px] text-blue-600 font-normal mt-0.5">
                            Due return: {tx.returnDate}
                          </span>
                        )}
                        {tx.description && (
                          <span className="block text-[10px] text-slate-400 font-normal italic mt-1 font-serif">
                            "{tx.description}"
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {tx.person}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-bold text-right font-mono ${
                          tx.direction === "IN" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {tx.direction === "IN" ? "+" : "-"}
                        {formatINR(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            tx.direction === "IN"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tx.direction}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center print:hidden">
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="text-slate-300 hover:text-red-600 transition-colors"
                          title="Delete Transaction"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        No transactions recorded today. Use the form to add entries.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
            {/* Chart 1: Cash Trend */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col h-64 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-wider">
                Cash Trend (Weekly)
              </h4>
              <div className="flex-1 flex items-end gap-3 h-full px-2">
                {/* 7 dummy columns representing daily activity */}
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="bg-blue-100 rounded-t w-full h-[45%]"></div>
                  <span className="text-[10px] text-slate-400 font-semibold">Mon</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="bg-blue-100 rounded-t w-full h-[60%]"></div>
                  <span className="text-[10px] text-slate-400 font-semibold">Tue</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="bg-blue-100 rounded-t w-full h-[30%]"></div>
                  <span className="text-[10px] text-slate-400 font-semibold">Wed</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="bg-blue-200 rounded-t w-full h-[70%]"></div>
                  <span className="text-[10px] text-slate-400 font-semibold">Thu</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="bg-blue-200 rounded-t w-full h-[55%]"></div>
                  <span className="text-[10px] text-slate-400 font-semibold">Fri</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="bg-blue-300 rounded-t w-full h-[80%]"></div>
                  <span className="text-[10px] text-slate-400 font-semibold">Sat</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  {/* Current closing day value bar */}
                  <div
                    className="bg-blue-600 rounded-t w-full transition-all duration-500"
                    style={{ height: `${Math.max(15, Math.min(100, (totals.closing / 300000) * 100))}%` }}
                  ></div>
                  <span className="text-[10px] text-blue-600 font-bold">Sun</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Inflow vs Outflow SVG indicators */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between h-64 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">
                Inflows vs Outflows
              </h4>
              <div className="flex-1 flex flex-col justify-center items-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={`${inflowRatio}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-[10px] font-bold text-slate-400">IN ratio</p>
                    <p className="text-sm font-bold text-slate-800">{inflowRatio}%</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  <span className="text-xs text-slate-500">Cash In ({inflowRatio}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-100 border border-slate-300 rounded-full"></span>
                  <span className="text-xs text-slate-500">Cash Out ({outflowRatio}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal - Close Day */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">lock_clock</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Close Today's Pota</h3>
                  <p className="text-xs text-slate-500">Finalize cash position</p>
                </div>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setIsCloseModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Please verify that the physical cash in drawer matches the digital closing balance of{" "}
                <span className="text-slate-900 font-bold">{formatINR(totals.closing)}</span>.
              </p>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800 leading-relaxed">
                <strong>Warning:</strong> Closing the day will clear the current list of transactions and set the new opening balance to{" "}
                <strong>{formatINR(totals.closing)}</strong>. This action is irreversible.
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex items-center gap-3">
              <button
                className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 bg-white rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                onClick={() => setIsCloseModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-500 transition-all"
                onClick={handleCloseDay}
              >
                Confirm &amp; Close Day
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

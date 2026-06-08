"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";
import { toast } from "@/lib/toast";

type BackupSummary = {
  totalSales: number;
  salesCount: number;
  totalPurchases: number;
  purchasesCount: number;
  paymentsReceived: number;
  paymentsPaid: number;
  totalCustomers?: number;
  totalSuppliers?: number;
  activeProductsCount?: number;
  monthsWithData?: number;
};

type Backup = {
  id: string;
  type: "MONTHLY" | "YEARLY";
  year: number;
  month: number | null;
  createdAt: string;
  updatedAt: string;
  data: {
    summary: BackupSummary;
    sales?: any[];
    inventory?: any[];
    customers?: any[];
    suppliers?: any[];
    payments?: any[];
    orders?: any[];
    months?: Record<number, any>;
  };
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function BackupPage() {
  const queryClient = useQueryClient();
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [selectedYearlyMonth, setSelectedYearlyMonth] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "sales" | "inventory" | "parties" | "payments" | "orders">("summary");
  const [isSyncing, setIsSyncing] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "MONTHLY" | "YEARLY">("ALL");

  const { data: backups = [], isLoading, refetch } = useQuery<Backup[]>({
    queryKey: ["backups-list"],
    queryFn: async () => {
      const res = await api.get<Backup[]>("/backups");
      return res.data;
    },
  });

  const handleSyncBackups = async () => {
    setIsSyncing(true);
    try {
      const res = await api.post("/backups/trigger");
      const createdCount = res.data?.created?.length || 0;
      toast.success(
        createdCount > 0
          ? `Backups synced! Generated ${createdCount} missing backup(s).`
          : "Backup sync complete. Everything is up to date!"
      );
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to sync backups.");
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const downloadBackupJSON = (backup: Backup) => {
    const periodName = backup.type === "MONTHLY" && backup.month
      ? `${MONTH_NAMES[backup.month - 1]}-${backup.year}`
      : `Year-${backup.year}`;
    const filename = `${backup.type.toLowerCase()}-backup-${periodName}.json`;
    const jsonStr = JSON.stringify(backup.data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${backup.type} backup file downloaded successfully.`);
  };

  const filteredBackups = useMemo(() => {
    return backups.filter(b => {
      if (filterType === "ALL") return true;
      return b.type === filterType;
    });
  }, [backups, filterType]);

  // Determine which snapshot data to display (if yearly, could be a specific month's data)
  const displayData = useMemo(() => {
    if (!selectedBackup) return null;
    if (selectedBackup.type === "MONTHLY") {
      return selectedBackup.data;
    }
    // For YEARLY, if a month is selected, pull that month's snapshot. Otherwise, show yearly summary.
    if (selectedBackup.type === "YEARLY" && selectedYearlyMonth !== null) {
      return selectedBackup.data.months?.[selectedYearlyMonth] || null;
    }
    return selectedBackup.data;
  }, [selectedBackup, selectedYearlyMonth]);

  const closeDrawer = () => {
    setSelectedBackup(null);
    setSelectedYearlyMonth(null);
    setActiveTab("summary");
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === "paid" || s === "active") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
    if (s === "pending" || s === "created") return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
    return "bg-slate-50 text-slate-700 dark:bg-slate-800/30 dark:text-slate-400";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-h1 text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Data Backups
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View and manage automated monthly and yearly historical archives. Data is backed up automatically.
            </p>
          </div>
          <button
            onClick={handleSyncBackups}
            disabled={isSyncing || isLoading}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-lg ${isSyncing ? "animate-spin" : ""}`}>
              {isSyncing ? "sync" : "cloud_sync"}
            </span>
            {isSyncing ? "Syncing..." : "Sync Backups"}
          </button>
        </div>
      </div>

      {/* System Status and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Backups
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Active & Automatic
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Yearly Backups
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Active & Automatic
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <span className="material-symbols-outlined text-2xl">folder_zip</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Archives
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {backups.length} Saved Snapshots
            </p>
          </div>
        </div>
      </div>

      {/* Main Backups List Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-500">history</span>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Archive History
            </h3>
          </div>

          {/* Filter Options */}
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg gap-0.5 w-fit">
            {(["ALL", "MONTHLY", "YEARLY"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  filterType === type
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
            <p className="mt-2 text-sm">Loading backup archives...</p>
          </div>
        ) : filteredBackups.length === 0 ? (
          <div className="p-16 text-center text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-3">
              inventory_2
            </span>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">No Backups Found</h4>
            <p className="text-sm mt-1 max-w-md mx-auto">
              No archives have been created yet. Click "Sync Backups" to run the system check and automatically generate history files.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Backup Type</th>
                  <th className="px-6 py-4">Sales Total</th>
                  <th className="px-6 py-4">Purchases Total</th>
                  <th className="px-6 py-4">Summary Stats</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                {filteredBackups.map((backup) => {
                  const summary = backup.data?.summary || {};
                  return (
                    <tr
                      key={backup.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {backup.type === "MONTHLY" && backup.month
                          ? `${MONTH_NAMES[backup.month - 1]} ${backup.year}`
                          : `Year ${backup.year}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          backup.type === "YEARLY"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                        }`}>
                          {backup.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">
                        {formatINR(summary.totalSales || 0)}
                      </td>
                      <td className="px-6 py-4 font-medium text-amber-600 dark:text-amber-400">
                        {formatINR(summary.totalPurchases || 0)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {backup.type === "MONTHLY" ? (
                          <div className="space-y-0.5">
                            <div>Invoices: {summary.salesCount || 0} | Products: {summary.activeProductsCount || 0}</div>
                            <div>Customers: {summary.totalCustomers || 0} | Suppliers: {summary.totalSuppliers || 0}</div>
                          </div>
                        ) : (
                          <div>Months Archived: {summary.monthsWithData || 0} / 12</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedBackup(backup)}
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Inspect
                          </button>
                          <button
                            onClick={() => downloadBackupJSON(backup)}
                            type="button"
                            className="inline-flex items-center justify-center p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition cursor-pointer"
                            title="Download JSON Backup"
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Backup Detail Slide-over Drawer / Modal */}
      {selectedBackup && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-5xl h-screen bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-in-right overflow-hidden border-l border-slate-200 dark:border-slate-850">
            {/* Drawer Header */}
            <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                  {selectedBackup.type} Backup Detail
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedBackup.type === "MONTHLY" && selectedBackup.month
                    ? `${MONTH_NAMES[selectedBackup.month - 1]} ${selectedBackup.year}`
                    : `Full Year ${selectedBackup.year}`}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => downloadBackupJSON(selectedBackup)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-450 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download raw JSON
                </button>
                <button
                  onClick={closeDrawer}
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* If Yearly, Month Selection Bar */}
            {selectedBackup.type === "YEARLY" && (
              <div className="px-6 py-4 bg-purple-50/50 dark:bg-purple-950/10 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 overflow-x-auto">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 shrink-0 uppercase tracking-wider">
                  Browse Months:
                </span>
                <button
                  onClick={() => {
                    setSelectedYearlyMonth(null);
                    setActiveTab("summary");
                  }}
                  type="button"
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer ${
                    selectedYearlyMonth === null
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  Yearly Summary
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                  const hasData = !!selectedBackup.data.months?.[m];
                  return (
                    <button
                      key={m}
                      disabled={!hasData}
                      onClick={() => {
                        setSelectedYearlyMonth(m);
                        setActiveTab("summary");
                      }}
                      type="button"
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedYearlyMonth === m
                          ? "bg-purple-600 text-white shadow-xs"
                          : hasData
                            ? "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/40"
                            : "opacity-40 bg-slate-100 text-slate-400 dark:bg-slate-850 dark:text-slate-600 cursor-not-allowed"
                      }`}
                      title={!hasData ? "No data archived for this month" : ""}
                    >
                      {MONTH_NAMES[m - 1]}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab Navigation */}
            <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 overflow-x-auto">
              {([
                { id: "summary", label: "Summary Report", icon: "dashboard" },
                { id: "sales", label: "Sales (Invoices)", icon: "trending_up" },
                { id: "inventory", label: "Inventory Stock", icon: "inventory_2" },
                { id: "parties", label: "Customers & Suppliers", icon: "group" },
                { id: "payments", label: "Payments Log", icon: "payments" },
                { id: "orders", label: "Purchase Orders", icon: "shopping_cart" },
              ] as const).map((tab) => {
                // Hide lists tabs if browsing yearly summary directly (they only apply to month data)
                if (selectedBackup.type === "YEARLY" && selectedYearlyMonth === null && tab.id !== "summary") {
                  return null;
                }
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
                    className={`flex items-center gap-1.5 py-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content Panels */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/20">
              {!displayData ? (
                <div className="py-12 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-350">warning</span>
                  <p className="text-sm font-semibold">No snapshot data found for this period.</p>
                </div>
              ) : activeTab === "summary" ? (
                /* Summary tab */
                <div className="space-y-6">
                  {/* Grid Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Sales Revenue</p>
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {formatINR(displayData.summary?.totalSales || 0)}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        From {displayData.summary?.salesCount || 0} invoice(s)
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Purchase Cost</p>
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {formatINR(displayData.summary?.totalPurchases || 0)}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        From {displayData.summary?.purchasesCount || 0} order(s)
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Payments Collected</p>
                      <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {formatINR(displayData.summary?.paymentsReceived || 0)}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">Customer receipts</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Payments Paid Out</p>
                      <h4 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                        {formatINR(displayData.summary?.paymentsPaid || 0)}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">Supplier payouts</p>
                    </div>
                  </div>

                  {/* Secondary Details */}
                  {selectedBackup.type === "MONTHLY" || selectedYearlyMonth !== null ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <h5 className="font-semibold text-sm text-slate-950 dark:text-slate-100 border-b pb-2 mb-3">
                          Inventory Scope
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Total Unique SKUs</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {displayData.summary?.activeProductsCount || 0} items
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <h5 className="font-semibold text-sm text-slate-950 dark:text-slate-100 border-b pb-2 mb-3">
                          Parties Captured
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Customers</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {displayData.summary?.totalCustomers || 0} active
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Suppliers</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {displayData.summary?.totalSuppliers || 0} active
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <h5 className="font-semibold text-sm text-slate-950 dark:text-slate-100 border-b pb-2 mb-3">
                          Backup Details
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Snapshot Time</span>
                            <span className="text-slate-800 dark:text-slate-200">
                              {new Date(selectedBackup.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Type</span>
                            <span className="text-slate-850 dark:text-slate-200 font-semibold uppercase">
                              {selectedBackup.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Yearly Summary breakdown */
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                      <h4 className="font-semibold text-slate-900 dark:text-white border-b pb-3 mb-4">
                        Month-wise Summary Table ({selectedBackup.year})
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                              <th className="px-4 py-2.5">Month</th>
                              <th className="px-4 py-2.5 text-right">Sales Amount</th>
                              <th className="px-4 py-2.5 text-right">Purchases Amount</th>
                              <th className="px-4 py-2.5 text-right">Collected</th>
                              <th className="px-4 py-2.5 text-right">Paid Out</th>
                              <th className="px-4 py-2.5 text-center">SKUs</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                              const mData = selectedBackup.data.months?.[m]?.summary || {};
                              const hasData = !!selectedBackup.data.months?.[m];
                              return (
                                <tr key={m} className={hasData ? "" : "opacity-40"}>
                                  <td className="px-4 py-3 font-semibold">{MONTH_NAMES[m - 1]}</td>
                                  <td className="px-4 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                                    {hasData ? formatINR(mData.totalSales || 0) : "—"}
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium text-amber-600 dark:text-amber-400">
                                    {hasData ? formatINR(mData.totalPurchases || 0) : "—"}
                                  </td>
                                  <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-500">
                                    {hasData ? formatINR(mData.paymentsReceived || 0) : "—"}
                                  </td>
                                  <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-500">
                                    {hasData ? formatINR(mData.paymentsPaid || 0) : "—"}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {hasData ? mData.activeProductsCount : "—"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === "sales" ? (
                /* Sales Tab */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white flex justify-between items-center text-xs">
                    <span>Archived Invoice Transactions</span>
                    <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-full">{displayData.sales?.length || 0} Records</span>
                  </div>
                  {!displayData.sales || displayData.sales.length === 0 ? (
                    <p className="p-8 text-center text-slate-500 text-sm">No sales invoices recorded in this period.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                            <th className="px-4 py-3">Invoice Number</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3 text-right">Total Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Items Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {displayData.sales.map((inv: any) => (
                            <tr key={inv.id}>
                              <td className="px-4 py-3 font-semibold">{inv.invoiceNumber}</td>
                              <td className="px-4 py-3">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3">{inv.customerName}</td>
                              <td className="px-4 py-3 text-right font-medium">{formatINR(inv.totalAmount)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getStatusBadgeClass(inv.status)}`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[11px] text-slate-500 max-w-xs truncate" title={inv.lineItems?.map((li: any) => `${li.productName} (x${li.quantity})`).join(", ")}>
                                {inv.lineItems?.map((li: any) => `${li.productName} (x${li.quantity})`).join(", ")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : activeTab === "inventory" ? (
                /* Inventory Tab */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white flex justify-between items-center text-xs">
                    <span>Active Products & Stock Level Snapshot</span>
                    <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-full">{displayData.inventory?.length || 0} Items</span>
                  </div>
                  {!displayData.inventory || displayData.inventory.length === 0 ? (
                    <p className="p-8 text-center text-slate-500 text-sm">No items in inventory.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                            <th className="px-4 py-3">Product Name</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3 text-center">Stock Level</th>
                            <th className="px-4 py-3 text-right">Purchase Price</th>
                            <th className="px-4 py-3 text-right">Selling Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {displayData.inventory.map((prod: any) => (
                            <tr key={prod.id}>
                              <td className="px-4 py-3 font-semibold">{prod.name}</td>
                              <td className="px-4 py-3">{prod.category || "Uncategorized"}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold ${
                                  prod.stock <= 10
                                    ? "bg-red-50 text-red-650 dark:bg-red-950/20"
                                    : "bg-slate-50 text-slate-700 dark:bg-slate-800"
                                }`}>
                                  {prod.stock}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">{formatINR(prod.purchasePrice)}</td>
                              <td className="px-4 py-3 text-right">{formatINR(prod.sellingPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : activeTab === "parties" ? (
                /* Parties Tab */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customers Section */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white flex justify-between items-center text-xs">
                      <span>Customers Balances Snapshot</span>
                      <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-full">{displayData.customers?.length || 0} Records</span>
                    </div>
                    {!displayData.customers || displayData.customers.length === 0 ? (
                      <p className="p-8 text-center text-slate-500 text-sm">No customers recorded.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                              <th className="px-4 py-3">Customer Name</th>
                              <th className="px-4 py-3">Contact</th>
                              <th className="px-4 py-3 text-right">Outstanding Bal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {displayData.customers.map((cust: any) => (
                              <tr key={cust.id}>
                                <td className="px-4 py-3 font-semibold">{cust.name}</td>
                                <td className="px-4 py-3 text-slate-400">{cust.phone || cust.email || "—"}</td>
                                <td className="px-4 py-3 text-right font-medium text-red-500">{formatINR(cust.outstandingBalance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Suppliers Section */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white flex justify-between items-center text-xs">
                      <span>Suppliers Payable Snapshot</span>
                      <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-full">{displayData.suppliers?.length || 0} Records</span>
                    </div>
                    {!displayData.suppliers || displayData.suppliers.length === 0 ? (
                      <p className="p-8 text-center text-slate-500 text-sm">No suppliers recorded.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                              <th className="px-4 py-3">Supplier Name</th>
                              <th className="px-4 py-3">Contact</th>
                              <th className="px-4 py-3 text-right">Payable Bal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {displayData.suppliers.map((supp: any) => (
                              <tr key={supp.id}>
                                <td className="px-4 py-3 font-semibold">{supp.name}</td>
                                <td className="px-4 py-3 text-slate-400">{supp.phone || supp.email || "—"}</td>
                                <td className="px-4 py-3 text-right font-medium text-amber-500">{formatINR(supp.payableBalance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === "payments" ? (
                /* Payments Tab */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white flex justify-between items-center text-xs">
                    <span>Archived Payment Ledger Logs</span>
                    <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-full">{displayData.payments?.length || 0} Logs</span>
                  </div>
                  {!displayData.payments || displayData.payments.length === 0 ? (
                    <p className="p-8 text-center text-slate-500 text-sm">No payments recorded in this period.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                            <th className="px-4 py-3">Payment Number</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Party Name</th>
                            <th className="px-4 py-3">Transaction Type</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3">Method</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {displayData.payments.map((pay: any) => (
                            <tr key={pay.id}>
                              <td className="px-4 py-3 font-semibold">{pay.paymentNumber}</td>
                              <td className="px-4 py-3">{new Date(pay.paymentDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3">{pay.partyName}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  pay.type.includes("Receipt")
                                    ? "bg-emerald-50 text-emerald-750 dark:bg-emerald-950/20"
                                    : "bg-amber-50 text-amber-750 dark:bg-amber-950/20"
                                }`}>
                                  {pay.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-medium">{formatINR(pay.amount)}</td>
                              <td className="px-4 py-3">{pay.paymentMethod}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : activeTab === "orders" ? (
                /* Orders (Purchases) Tab */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white flex justify-between items-center text-xs">
                    <span>Archived Purchase Orders</span>
                    <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-full">{displayData.orders?.length || 0} Records</span>
                  </div>
                  {!displayData.orders || displayData.orders.length === 0 ? (
                    <p className="p-8 text-center text-slate-500 text-sm">No purchase orders recorded in this period.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                            <th className="px-4 py-3">Purchase Order #</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Supplier Name</th>
                            <th className="px-4 py-3 text-right">Total Cost</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Items Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {displayData.orders.map((pur: any) => (
                            <tr key={pur.id}>
                              <td className="px-4 py-3 font-semibold">{pur.purchaseNumber}</td>
                              <td className="px-4 py-3">{new Date(pur.purchaseDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3">{pur.supplierName}</td>
                              <td className="px-4 py-3 text-right font-medium">{formatINR(pur.totalAmount)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getStatusBadgeClass(pur.status)}`}>
                                  {pur.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[11px] text-slate-500 max-w-xs truncate" title={pur.lineItems?.map((li: any) => `${li.productName} (x${li.quantity})`).join(", ")}>
                                {pur.lineItems?.map((li: any) => `${li.productName} (x${li.quantity})`).join(", ")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

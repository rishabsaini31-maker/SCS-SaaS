"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "@/lib/toast";

type BackupType = "DAILY" | "MONTHLY" | "YEARLY";
type BackupMode = "FULL" | "INCREMENTAL";
type BackupIntegrity = "UNVERIFIED" | "VERIFIED" | "CORRUPTED" | "MISSING";

type CloudBackup = {
  id: string;
  tenantId: string;
  fileName: string;
  year: number;
  month: number;
  backupDate: string;
  storagePath: string;
  fileSize: number;
  checksum: string;
  status: string;
  type: BackupType;
  mode: BackupMode;
  integrity: BackupIntegrity;
  retryCount: number;
  version: number;
  isCompressed: boolean;
  isImmutable: boolean;
  lastVerifiedAt: string | null;
  errorMessage?: string;
  durationMs?: number;
  changedRecordCount?: number;
  snapshotSummary?: any;
  createdAt: string;
};

type DRHealthStats = {
  r2Connected: boolean;
  totalBackups: number;
  dailyBackups: number;
  monthlyArchives: number;
  yearlyArchives: number;
  totalStorageBytes: number;
  successRate: number;
  failures: number;
  corrupted: number;
  lastVerificationTime: string | null;
  nextScheduledDate: string | null;
};

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function formatDuration(ms: number) {
  if (ms < 1000) return ms + "ms";
  if (ms < 60000) return (ms / 1000).toFixed(1) + "s";
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return mins + "m " + secs + "s";
}

function camelToTitle(str: string) {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

export default function BackupRecoverySection() {
  const queryClient = useQueryClient();
  const [isTriggering, setIsTriggering] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);

  // Restore States
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<CloudBackup | null>(null);
  const [restoreStep, setRestoreStep] = useState<1 | 2 | 3 | 4>(1);
  const [restoreScope, setRestoreScope] = useState({
    customers: true, suppliers: true, products: true, inventory: true,
    sales: true, purchases: true, payments: true, expenses: true, potaBaki: true, settings: true,
  });
  const [conflictHandling, setConflictHandling] = useState<"SKIP" | "OVERWRITE">("SKIP");
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [password, setPassword] = useState("");
  const [activeRestoreId, setActiveRestoreId] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<any>(null);

  // Snapshot Viewer State
  const [snapshotViewerOpen, setSnapshotViewerOpen] = useState(false);
  const [viewingSnapshot, setViewingSnapshot] = useState<CloudBackup | null>(null);

  const { data: stats, isLoading: isStatsLoading } = useQuery<DRHealthStats>({
    queryKey: ["cloud-backup-health"],
    queryFn: async () => {
      const res = await api.get<DRHealthStats>("/cloud-backups/health");
      return res.data;
    },
    refetchInterval: 30000,
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["cloud-backup-history"],
    queryFn: async () => {
      const res = await api.get<{ items: CloudBackup[]; total: number }>("/cloud-backups?limit=100");
      return res.data;
    },
  });

  // Polling for restore progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeRestoreId && restoreStep === 4) {
      interval = setInterval(async () => {
        try {
          const res = await api.get("/cloud-restores/progress/" + activeRestoreId);
          setProgressData(res.data);
          if (res.data.status === "COMPLETED" || res.data.status === "FAILED") {
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Failed to poll restore progress", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeRestoreId, restoreStep]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["cloud-backup-health"] });
    queryClient.invalidateQueries({ queryKey: ["cloud-backup-history"] });
  };

  const handleTriggerBackup = async (forceFull: boolean) => {
    setIsTriggering(true);
    try {
      const res = await api.post("/cloud-backups/trigger", { forceFull });
      toast.success(res.data.message || "Backup completed.");
      invalidateAll();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to trigger backup.");
    } finally {
      setIsTriggering(false);
    }
  };

  const handleDeleteBackup = async (backup: CloudBackup) => {
    if (backup.isImmutable) {
      toast.error("Cannot delete an immutable archive backup.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this backup? This cannot be undone.")) return;
    setIsDeleting(backup.id);
    try {
      await api.delete("/cloud-backups/" + backup.id);
      toast.success("Backup deleted.");
      invalidateAll();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete backup.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRetryBackup = async (id: string) => {
    setIsRetrying(id);
    try {
      await api.post("/cloud-backups/" + id + "/retry");
      toast.success("Backup retry initiated.");
      setTimeout(invalidateAll, 3000);
    } catch (err: any) {
      toast.error("Failed to retry backup.");
    } finally {
      setIsRetrying(null);
    }
  };

  const handleDownload = (backup: CloudBackup) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    window.open(apiUrl + "/cloud-backups/" + backup.id + "/download", "_blank");
  };

  const openRestoreModal = (backup: CloudBackup) => {
    if (backup.integrity === "CORRUPTED" || backup.integrity === "MISSING") {
      if (!window.confirm("This backup failed integrity checks. Restoring may cause data loss. Proceed anyway?")) return;
    }
    setSelectedBackup(backup);
    setRestoreStep(1);
    setRestoreModalOpen(true);
    setPreviewData(null);
    setPassword("");
    setProgressData(null);
    setActiveRestoreId(null);
  };

  const closeRestoreModal = () => {
    if (progressData && progressData.status !== "COMPLETED" && progressData.status !== "FAILED" && restoreStep === 4) {
      if (!window.confirm("Restore is in progress. Closing won't cancel it. Close anyway?")) return;
    }
    setRestoreModalOpen(false);
  };

  const handlePreview = async () => {
    if (!selectedBackup) return;
    setIsPreviewing(true);
    try {
      const res = await api.post("/cloud-restores/" + selectedBackup.id + "/preview");
      setPreviewData(res.data);
      setRestoreStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load preview.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleTriggerRestore = async () => {
    if (!selectedBackup || !password) return;
    try {
      const res = await api.post("/cloud-restores/" + selectedBackup.id + "/trigger", {
        password,
        scope: restoreScope,
        conflictHandling,
      });
      setActiveRestoreId(res.data.restoreId);
      setProgressData({ status: "PENDING" });
      setRestoreStep(4);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to start restore.");
    }
  };

  const toggleScope = (key: keyof typeof restoreScope) => {
    setRestoreScope((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const statusDotColor = (backup: CloudBackup) => {
    if (backup.status === "COMPLETED") return backup.mode === "FULL" ? "bg-purple-500" : "bg-blue-500";
    if (backup.status === "SKIPPED" || backup.status === "CANCELLED") return "bg-slate-400";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* ── Dashboard ── */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-h1 text-h1">Disaster Recovery</h3>
            <p className="text-sm text-slate-500">Manage manual snapshots, view backup history, and execute one-click restores.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleTriggerBackup(false)}
              disabled={isTriggering || !stats?.r2Connected}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isTriggering ? "Working..." : "Backup Now (Incremental)"}
            </button>
            <button
              onClick={() => handleTriggerBackup(true)}
              disabled={isTriggering || !stats?.r2Connected}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900 disabled:opacity-50 transition-colors"
            >
              Force Full Backup
            </button>
          </div>
        </div>
        <div className="p-6">
          {isStatsLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Loading stats...
            </div>
          ) : !stats ? (
            <p className="text-red-500">Failed to load stats.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <DashCard label="Storage Health">
                <span className="text-lg font-semibold flex items-center gap-2">
                  <span className={"w-2.5 h-2.5 rounded-full " + (stats.r2Connected ? "bg-green-500" : "bg-red-500")} />
                  {stats.r2Connected ? "Online" : "Offline"}
                </span>
              </DashCard>
              <DashCard label="Next Auto Backup">
                <span className="text-lg font-semibold text-slate-800">2:00 AM (Daily)</span>
              </DashCard>
              <DashCard label="Total Backups">
                <span className="text-lg font-semibold text-slate-700">{stats.totalBackups}</span>
              </DashCard>
              <DashCard label="Total Storage">
                <span className="text-lg font-semibold text-slate-700">{formatBytes(stats.totalStorageBytes)}</span>
              </DashCard>
              <DashCard label="Failed / Corrupt">
                <span className={"text-lg font-semibold " + (stats.failures > 0 || stats.corrupted > 0 ? "text-red-500" : "text-green-600")}>
                  {stats.failures} / {stats.corrupted}
                </span>
              </DashCard>
            </div>
          )}
        </div>
      </section>

      {/* ── History Timeline ── */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-h1 text-h1">Backup History</h3>
          <span className="text-xs font-mono text-slate-500">Incremental & Full Trace</span>
        </div>
        <div className="p-6">
          {isHistoryLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Loading timeline...
            </div>
          ) : !historyData?.items.length ? (
            <p className="text-slate-500 text-center py-8">No backups found.</p>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
              {historyData.items.map((backup) => (
                <div key={backup.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className={"absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-sm " + statusDotColor(backup)} />

                  <div className={"p-4 rounded-xl border transition-all shadow-sm " + (backup.isImmutable ? "border-amber-200 bg-amber-50/20" : "border-slate-100 bg-white hover:border-slate-300")}>
                    <div className="flex flex-col xl:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-slate-800 text-lg">
                            {new Date(backup.backupDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            {" • "}
                            {new Date(backup.backupDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {backup.mode === "INCREMENTAL" ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">INCREMENTAL</span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">FULL</span>
                          )}
                          {backup.isImmutable && <span title="Immutable Archive" className="text-amber-500 text-sm">🔒</span>}
                          {backup.isCompressed && <span title="Gzip Compressed" className="text-slate-400 text-xs font-mono">.gz</span>}
                        </div>

                        <div className="text-sm text-slate-600 space-y-1 mt-2">
                          <div className="flex gap-4 flex-wrap">
                            <span>
                              <strong>Status:</strong>{" "}
                              {backup.status === "COMPLETED" ? (
                                <span className="text-green-600 font-medium">Success</span>
                              ) : backup.status === "CANCELLED" ? (
                                <span className="text-slate-500 font-medium">Skipped (No Changes)</span>
                              ) : (
                                <span className="text-red-500 font-medium">{backup.status}</span>
                              )}
                            </span>
                            {backup.status === "COMPLETED" && <span><strong>Size:</strong> {formatBytes(backup.fileSize)}</span>}
                            {backup.durationMs != null && <span><strong>Duration:</strong> {formatDuration(backup.durationMs)}</span>}
                          </div>
                          {backup.status === "COMPLETED" && backup.changedRecordCount != null && (
                            <div><strong>Changed Records:</strong> {backup.changedRecordCount}</div>
                          )}
                          {backup.errorMessage && (
                            <div className="text-red-500 text-xs font-mono mt-1">{backup.errorMessage}</div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-start gap-2">
                        {backup.status === "COMPLETED" && (
                          <button
                            onClick={() => { setViewingSnapshot(backup); setSnapshotViewerOpen(true); }}
                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors"
                          >
                            View Snapshot
                          </button>
                        )}
                        {backup.status.includes("FAILED") && (
                          <button
                            onClick={() => handleRetryBackup(backup.id)}
                            disabled={isRetrying === backup.id}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg disabled:opacity-50"
                          >
                            {isRetrying === backup.id ? "Retrying..." : "Retry Upload"}
                          </button>
                        )}
                        <button onClick={() => handleDownload(backup)} disabled={backup.status !== "COMPLETED"} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50">
                          Download
                        </button>
                        <button onClick={() => openRestoreModal(backup)} disabled={backup.status !== "COMPLETED"} className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-white hover:bg-slate-900 rounded-lg disabled:opacity-50">
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup)}
                          disabled={isDeleting === backup.id || backup.isImmutable}
                          className={"px-3 py-1.5 text-xs font-medium rounded-lg " + (backup.isImmutable ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 disabled:opacity-50")}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Snapshot Viewer Modal ── */}
      {snapshotViewerOpen && viewingSnapshot && (
        <ModalOverlay onClose={() => setSnapshotViewerOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Backup Snapshot Summary</h3>
              <CloseBtn onClick={() => setSnapshotViewerOpen(false)} />
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Status + Type header */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-green-600 font-bold text-lg">Backup Completed Successfully ✓</p>
                </div>
                <div className="flex-1 border-l border-slate-200 pl-4">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</p>
                  <p className="font-bold text-lg text-slate-800">{viewingSnapshot.mode}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SnapshotStat label="Time" value={new Date(viewingSnapshot.backupDate).toLocaleDateString() + " • " + new Date(viewingSnapshot.backupDate).toLocaleTimeString()} />
                <SnapshotStat label="Duration" value={formatDuration(viewingSnapshot.durationMs || 0)} />
                <SnapshotStat label="File Size" value={formatBytes(viewingSnapshot.fileSize)} />
                <SnapshotStat label="Total Records" value={String(viewingSnapshot.changedRecordCount ?? 0)} className="text-indigo-600" />
              </div>

              {/* Changed / Unchanged Modules */}
              {viewingSnapshot.snapshotSummary && (
                <div className="grid md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="text-green-500">✓</span> Changed Modules
                    </h4>
                    {viewingSnapshot.snapshotSummary.changedModules?.length > 0 ? (
                      <ul className="space-y-2">
                        {viewingSnapshot.snapshotSummary.changedModules.map((mod: any, i: number) => (
                          <li key={i} className="flex justify-between text-sm p-2 bg-green-50 rounded border border-green-100 text-green-800 font-medium">
                            <span className="capitalize">{camelToTitle(mod.name)}</span>
                            <span>({mod.count})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No modules changed.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="text-slate-400">•</span> Unchanged Modules
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingSnapshot.snapshotSummary.unchangedModules?.map((mod: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 capitalize">
                          {camelToTitle(mod)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-bold text-slate-800 mb-3">Technical Details</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <DetailRow label="Encryption" value="AES-256 ✓" />
                  <DetailRow label="Compression" value={viewingSnapshot.isCompressed ? "GZIP ✓" : "None"} />
                  <DetailRow label="Cloudflare Upload" value="Success ✓" valueClass="text-green-600" />
                  <DetailRow
                    label="Verification"
                    value={viewingSnapshot.integrity + (viewingSnapshot.integrity === "VERIFIED" ? " ✓" : "")}
                    valueClass={viewingSnapshot.integrity === "VERIFIED" ? "text-green-600" : "text-slate-700"}
                  />
                </div>
                <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-500 break-all">
                  <p><span className="font-bold text-slate-700">Path:</span> {viewingSnapshot.storagePath}</p>
                  <p className="mt-1"><span className="font-bold text-slate-700">Checksum:</span> {viewingSnapshot.checksum}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setSnapshotViewerOpen(false)} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-semibold">Close</button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── Restore Modal ── */}
      {restoreModalOpen && (
        <ModalOverlay onClose={closeRestoreModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Enterprise One-Click Recovery</h3>
              <CloseBtn onClick={closeRestoreModal} />
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Step 1: Scope + Conflict */}
              {restoreStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">1. Select Scope</h4>
                    <p className="text-sm text-slate-500 mb-4">Choose which entities to restore.</p>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(restoreScope).map((key) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                          <input
                            type="checkbox"
                            checked={(restoreScope as any)[key]}
                            onChange={() => toggleScope(key as any)}
                            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                          />
                          <span className="text-sm font-medium capitalize">{camelToTitle(key)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">2. Conflict Resolution</h4>
                    <p className="text-sm text-slate-500 mb-4">
                      How to handle existing records? <span className="text-indigo-600 font-medium">Note: Incremental layers always OVERWRITE sequentially.</span>
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="radio" name="conflict" checked={conflictHandling === "SKIP"} onChange={() => setConflictHandling("SKIP")} className="mt-1 focus:ring-primary" />
                        <div>
                          <p className="font-medium text-slate-800">Skip Existing</p>
                          <p className="text-sm text-slate-500">Only add records that do not currently exist.</p>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="radio" name="conflict" checked={conflictHandling === "OVERWRITE"} onChange={() => setConflictHandling("OVERWRITE")} className="mt-1 focus:ring-primary" />
                        <div>
                          <p className="font-medium text-slate-800">Overwrite Existing</p>
                          <p className="text-sm text-slate-500">Replace records with the backup version.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Preview */}
              {restoreStep === 2 && previewData && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 mb-2">Dry Run Preview</h4>
                  <p className="text-sm text-slate-500 mb-4">Payload size for the selected snapshot.</p>
                  <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4 border border-slate-100">
                    {Object.entries(previewData).filter(([key]) => key !== "estimatedTimeMs").map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-sm capitalize text-slate-600">{camelToTitle(key)}</span>
                        <span className="font-medium">{String(value)} records</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex gap-2">
                    <span className="font-bold">Estimated Recovery Time:</span>
                    <span>~{Math.ceil((previewData.estimatedTimeMs || 5000) / 1000)} seconds</span>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {restoreStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100">
                    <p className="font-bold mb-1">⚠️ Warning: Destructive Action</p>
                    <p>A <strong>Safety Backup</strong> will be taken automatically before restore. Confirm your <strong>OWNER password</strong> to proceed.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Enter password..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Progress */}
              {restoreStep === 4 && progressData && (
                <div className="space-y-6 flex flex-col items-center justify-center py-8">
                  {progressData.status === "COMPLETED" ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">✓</div>
                      <h4 className="text-xl font-bold text-slate-800">Recovery Completed Successfully</h4>
                      {progressData.recoveryReport && (
                        <div className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-lg p-5 text-sm shadow-inner">
                          <h5 className="font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Recovery Report</h5>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            <span className="text-slate-500">Backup Version:</span>
                            <span className="font-bold text-slate-800">v{progressData.recoveryReport.backupVersion}</span>
                            <span className="text-slate-500">Layers Applied:</span>
                            <span className="font-bold text-indigo-600">{progressData.recoveryReport.layersApplied || 1} Layers</span>
                            <span className="text-slate-500">Restored Records:</span>
                            <span className="font-bold text-green-600">{progressData.recoveryReport.restored}</span>
                            <span className="text-slate-500">Failed Records:</span>
                            <span className="font-bold text-slate-800">{progressData.recoveryReport.failed}</span>
                          </div>
                        </div>
                      )}
                      <button onClick={closeRestoreModal} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-semibold">Close & Refresh</button>
                    </>
                  ) : progressData.status === "FAILED" ? (
                    <>
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mb-4">✕</div>
                      <h4 className="text-xl font-bold text-slate-800">Recovery Failed</h4>
                      <p className="text-red-600 max-w-md text-center bg-red-50 p-4 rounded-lg border border-red-100 font-mono text-xs shadow-inner">{progressData.errorMessage || "Unknown error"}</p>
                      <button onClick={closeRestoreModal} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-semibold">Close</button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4 shadow-sm" />
                      <h4 className="text-lg font-bold text-slate-800">Recovery in Progress</h4>
                      <p className="text-sm font-bold px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full mt-2 uppercase tracking-wide border border-blue-200">{progressData.status}</p>
                      <p className="text-slate-500 text-sm mt-4 text-center max-w-sm">Safety backup is taken first. The transaction will rollback on any failure.</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {restoreStep !== 4 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={closeRestoreModal} className="px-4 py-2 text-slate-600 hover:bg-slate-200 font-medium rounded-lg transition-colors">Cancel</button>
                {restoreStep === 1 && (
                  <button onClick={handlePreview} disabled={isPreviewing} className="px-4 py-2 bg-primary text-white hover:bg-primary/90 font-medium rounded-lg disabled:opacity-50 transition-colors">
                    {isPreviewing ? "Analyzing..." : "Next: Preview"}
                  </button>
                )}
                {restoreStep === 2 && (
                  <button onClick={() => setRestoreStep(3)} className="px-4 py-2 bg-primary text-white hover:bg-primary/90 font-medium rounded-lg transition-colors">
                    Next: Confirmation
                  </button>
                )}
                {restoreStep === 3 && (
                  <button onClick={handleTriggerRestore} disabled={!password} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg disabled:opacity-50 transition-colors">
                    Confirm & Start Recovery
                  </button>
                )}
              </div>
            )}
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

/* ── Tiny helper components ── */

function DashCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      {children}
    </div>
  );
}

function SnapshotStat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1 font-medium">{label}</p>
      <p className={"font-semibold text-sm " + (className || "")}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-1">
      <span className="text-slate-500">{label}</span>
      <span className={"font-semibold " + (valueClass || "text-slate-700")}>{value}</span>
    </div>
  );
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      {children}
    </div>
  );
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
      ✕
    </button>
  );
}

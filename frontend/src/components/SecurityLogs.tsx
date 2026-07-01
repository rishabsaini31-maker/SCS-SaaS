"use client";

import { useEffect, useState } from "react";
import { fetcher } from "@/lib/api";

type LogRow = {
  id: string;
  createdAt: string;
  tenantId?: string;
  ownerId?: string;
  staffId?: string;
  eventType: string;
  status: string;
  description?: string;
  ipAddress?: string;
  browser?: string;
  operatingSystem?: string;
  deviceType?: string;
  country?: string;
  city?: string;
  sessionId?: string;
};

export default function SecurityLogs() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [page]);

  async function loadLogs() {
    setIsLoading(true);
    try {
      const res = await fetcher(`/auth/logs?page=${page}&perPage=25`);
      setLogs(res.logs || []);
    } catch (err) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  function handleExportCsv() {
    const url = `/api/v1/auth/logs/export`;
    window.open(url, "_blank");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-600">Showing security events</div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 bg-white border rounded text-sm"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="py-2">Date</th>
              <th>User</th>
              <th>Role</th>
              <th>Event</th>
              <th>IP</th>
              <th>Browser</th>
              <th>Device</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No security events found.
                </td>
              </tr>
            ) : (
              logs.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-3">{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.ownerId || r.staffId || "-"}</td>
                  <td>{r.staffId ? "STAFF" : "OWNER"}</td>
                  <td>{r.eventType}</td>
                  <td>{r.ipAddress}</td>
                  <td>{r.browser}</td>
                  <td>{r.deviceType || r.operatingSystem}</td>
                  <td>{r.status}</td>
                  <td>{r.city || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

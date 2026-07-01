"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "@/lib/toast";

type SessionItem = {
  id: string;
  tokenId: string;
  ipAddress?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  lastSeenAt?: string | null;
  lastActivity?: string | null;
  createdAt?: string | null;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    try {
      const res = await api.get("/auth/sessions");
      setSessions(res.data.sessions || []);
    } catch {
      toast.error("Unable to load active sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  const revokeSession = async (sessionId: string) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      toast.success("Session revoked.");
      void loadSessions();
    } catch {
      toast.error("Unable to revoke session.");
    }
  };

  const revokeAll = async () => {
    try {
      await api.post("/auth/logout-all");
      toast.success("All sessions revoked.");
      setSessions([]);
    } catch {
      toast.error("Unable to revoke all sessions.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Active sessions</h1>
            <p className="mt-2 text-sm text-slate-500">Manage the devices and browsers currently signed in to your account.</p>
          </div>
          <button
            type="button"
            onClick={revokeAll}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout all devices
          </button>
        </div>
        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading sessions...</p>
        ) : null}
        {!loading && sessions.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No active sessions found.</p>
        ) : null}
        <div className="mt-6 space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{session.browser || "Unknown browser"}</p>
                  <p className="text-sm text-slate-500">{session.operatingSystem || "Unknown OS"} • {session.ipAddress || "Unknown IP"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => revokeSession(session.id)}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Revoke
                </button>
              </div>
              <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Last activity: {session.lastActivity ? new Date(session.lastActivity).toLocaleString() : "Unknown"}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-sm text-slate-500">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

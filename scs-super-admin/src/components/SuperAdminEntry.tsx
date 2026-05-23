"use client";

import { useAdminProfile } from "@/lib/hooks";
import SuperAdminDashboard from "@/components/SuperAdminDashboard";
import SuperAdminLogin from "@/components/SuperAdminLogin";

export default function SuperAdminEntry() {
  const { data: profile, isLoading, error } = useAdminProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#dbe7ff_0%,#f8fafc_45%,#eef2ff_100%)] text-on-surface">
        <div className="rounded-2xl border border-outline-variant bg-white/80 px-6 py-4 shadow-lg backdrop-blur">
          Loading super-admin workspace...
        </div>
      </div>
    );
  }

  if (profile?.admin?.id) {
    return <SuperAdminDashboard />;
  }

  if (error) {
    const status = (error as any)?.response?.status;
    if (status !== 401 && status !== 403) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4 text-on-surface">
          <div className="max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-xl">
            <h1 className="text-2xl font-bold">Unable to load admin session</h1>
            <p className="mt-2 text-sm text-secondary">
              The super-admin login is still available below.
            </p>
            <div className="mt-4">
              <SuperAdminLogin />
            </div>
          </div>
        </div>
      );
    }
  }

  return <SuperAdminLogin />;
}

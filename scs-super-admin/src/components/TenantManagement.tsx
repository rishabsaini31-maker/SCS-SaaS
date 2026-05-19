"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  useTenants,
  useUpdateTenantStatus,
  useLogout,
  useAdminProfile,
} from "@/lib/hooks";
import { useRouter } from "next/navigation";

export default function TenantManagement() {
  const router = useRouter();
  const { data: tenants, isLoading } = useTenants();
  const updateStatus = useUpdateTenantStatus();
  const logout = useLogout();
  const { data: profile } = useAdminProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/login");
  };

  const handleSuspend = async (tenantId: string) => {
    if (window.confirm("Are you sure you want to suspend this tenant?")) {
      await updateStatus.mutateAsync({
        tenantId,
        status: "SUSPENDED",
      });
    }
  };

  const handleActivate = async (tenantId: string) => {
    if (window.confirm("Are you sure you want to reactivate this tenant?")) {
      await updateStatus.mutateAsync({
        tenantId,
        status: "ACTIVE",
      });
    }
  };

  const filteredTenants = (tenants?.tenants || []).filter((tenant: any) => {
    const matchesSearch =
      tenant.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "ALL" || tenant.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-background font-body-md text-on-background flex min-h-screen">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="line-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#004ac6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#004ac6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* SideNavBar */}
      <aside className="bg-surface-container-low w-72 h-screen sticky top-0 left-0 border-r border-outline-variant flex flex-col py-6 shrink-0 z-40">
        <div className="px-6 mb-8">
          <h1 className="font-h1 text-h1 text-primary">SCS Admin</h1>
          <p className="text-secondary text-[11px] font-medium tracking-wider">
            Super Admin Panel
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
            href="/"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md">Dashboard</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary-container text-on-secondary-container border-l-4 border-primary transition-colors"
            href="/tenants"
          >
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-body-md">Tenants / Shops</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
            href="/create-shop"
          >
            <span className="material-symbols-outlined">add_business</span>
            <span className="font-body-md">Create Shop</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
            href="/users"
          >
            <span className="material-symbols-outlined">group</span>
            <span className="font-body-md">Active Users</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
            href="/reports"
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-body-md">SaaS Reports</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
            href="/settings"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md">System Settings</span>
          </Link>
        </nav>
        <div className="px-3 mt-auto border-t border-outline-variant pt-4">
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error-container/20 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md">
              {logout.isPending ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* TopAppBar */}
        <header className="bg-surface-container-lowest h-20 sticky top-0 z-50 border-b border-outline-variant flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-sm focus:ring-2 focus:ring-primary"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-8 w-px bg-outline-variant"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-label-caps text-on-surface">
                  {profile?.admin?.email || "Admin"}
                </p>
                <p className="text-[10px] text-secondary">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          <div className="flex flex-col gap-8">
            {/* Page Header */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display-sm text-display-sm text-on-surface mb-1">
                  Tenant Management
                </h2>
                <p className="text-secondary font-body-md">
                  Manage all registered shops and business tenants.
                </p>
              </div>
              <Link
                href="/create-shop"
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-medium hover:bg-primary-container transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Create New Tenant
              </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <button
                onClick={() => setFilterStatus("ALL")}
                className={`px-4 py-2 rounded-lg text-body-md font-medium transition-colors ${filterStatus === "ALL" ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"}`}
              >
                All Tenants
              </button>
              <button
                onClick={() => setFilterStatus("ACTIVE")}
                className={`px-4 py-2 rounded-lg text-body-md font-medium transition-colors ${filterStatus === "ACTIVE" ? "bg-green-600 text-white" : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"}`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus("SUSPENDED")}
                className={`px-4 py-2 rounded-lg text-body-md font-medium transition-colors ${filterStatus === "SUSPENDED" ? "bg-error text-on-error" : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"}`}
              >
                Suspended
              </button>
            </div>

            {/* Tenants Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center">
                  <p className="text-secondary">Loading tenants...</p>
                </div>
              ) : filteredTenants.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-secondary">No tenants found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container-low">
                        <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">
                          Business Name
                        </th>
                        <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">
                          Owner
                        </th>
                        <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">
                          Email
                        </th>
                        <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">
                          Phone
                        </th>
                        <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">
                          Status
                        </th>
                        <th className="text-right py-4 px-6 text-label-caps text-secondary font-semibold uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredTenants.map((tenant: any) => (
                        <tr
                          key={tenant.id}
                          className="hover:bg-surface-container-high transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-primary font-bold text-[12px]">
                                {tenant.businessName?.charAt(0).toUpperCase()}
                              </div>
                              <p className="font-medium text-on-surface">
                                {tenant.businessName}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-body-sm text-on-surface">
                            {tenant.ownerName}
                          </td>
                          <td className="py-4 px-6 text-body-sm text-secondary">
                            {tenant.email}
                          </td>
                          <td className="py-4 px-6 text-body-sm text-secondary">
                            {tenant.phone || "-"}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                                tenant.status === "ACTIVE"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-error-container text-error"
                              }`}
                            >
                              {tenant.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex gap-2 justify-end">
                              {tenant.status === "ACTIVE" ? (
                                <button
                                  onClick={() => handleSuspend(tenant.id)}
                                  disabled={updateStatus.isPending}
                                  className="px-3 py-1 text-error hover:bg-error-container/20 rounded text-body-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivate(tenant.id)}
                                  disabled={updateStatus.isPending}
                                  className="px-3 py-1 text-green-700 hover:bg-green-100/50 rounded text-body-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  Activate
                                </button>
                              )}
                              <button className="px-3 py-1 text-primary hover:bg-primary-container/20 rounded text-body-sm font-medium transition-colors">
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <p className="text-secondary text-label-caps mb-2 uppercase tracking-wider">
                  Total Tenants
                </p>
                <p className="font-display-sm text-display-sm text-on-surface">
                  {tenants?.tenants?.length || 0}
                </p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <p className="text-secondary text-label-caps mb-2 uppercase tracking-wider">
                  Active Tenants
                </p>
                <p className="font-display-sm text-display-sm text-green-700">
                  {tenants?.tenants?.filter((t: any) => t.status === "ACTIVE")
                    .length || 0}
                </p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <p className="text-secondary text-label-caps mb-2 uppercase tracking-wider">
                  Suspended Tenants
                </p>
                <p className="font-display-sm text-display-sm text-error">
                  {tenants?.tenants?.filter(
                    (t: any) => t.status === "SUSPENDED",
                  ).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

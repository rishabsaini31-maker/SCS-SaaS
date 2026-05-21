"use client";
import React from "react";
import Link from "next/link";
import { useDashboardMetrics, useLogout, useAdminProfile } from "@/lib/hooks";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { useRouter } from "next/navigation";

export default function SuperAdminDashboard() {
  const router = useRouter();
  
  // PRODUCTION SECURITY: Enable periodic session validation
  useSessionValidation();
  
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: profile } = useAdminProfile();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/login");
  };

  const totalShops = metrics?.totalTenants || 0;
  const activeShops = metrics?.activeTenants || 0;
  const totalInvoices = metrics?.invoiceCount || 0;
  const totalProducts = metrics?.productCount || 0;
  const activeSessions = metrics?.activeSessions || 0;

  const shopHealth =
    totalShops > 0 ? ((activeShops / totalShops) * 100).toFixed(1) : 0;

  return (
    <div className="bg-background font-body-md text-on-background flex min-h-screen">
      {/* SVG Gradient Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="line-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#004ac6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#004ac6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* SideNavBar */}
      <aside className="bg-surface-container-low dark:bg-surface-container-lowest w-72 h-screen sticky top-0 left-0 border-r border-outline-variant dark:border-outline flex flex-col py-6 shrink-0 z-40 overflow-y-auto">
        <div className="px-6 mb-8">
          <h1 className="font-h1 text-h1 text-primary dark:text-primary-fixed-dim">
            SCS Admin
          </h1>
          <p className="text-secondary text-[11px] font-medium tracking-wider">
            Super Admin Panel
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary-container dark:bg-on-primary-fixed-variant text-on-secondary-container dark:text-on-primary-container border-l-4 border-primary transition-colors duration-150"
            href="/"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md">Dashboard</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
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
        <header className="bg-surface-container-lowest h-20 w-full sticky top-0 z-50 border-b border-outline-variant shadow-sm flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-sm focus:ring-2 focus:ring-primary"
                placeholder="Search analytics, tenants, or logs..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="p-2 text-secondary hover:text-primary transition-colors rounded-full relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
            </div>
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

        {/* Content Canvas */}
        <div className="p-8 overflow-y-auto">
          <div className="flex flex-col gap-8">
            {/* Page Header */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display-sm text-display-sm text-on-surface mb-1">
                  Platform Overview
                </h2>
                <p className="text-secondary font-body-md">
                  Real-time performance and system health metrics.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">
                    calendar_today
                  </span>
                  Last 30 Days
                </button>
                <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-medium hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    download
                  </span>
                  Export Data
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Shops */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      storefront
                    </span>
                  </div>
                  <span className="text-tertiary font-medium text-[12px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      trending_up
                    </span>{" "}
                    +12%
                  </span>
                </div>
                <p className="text-secondary text-label-caps mb-1 uppercase tracking-wider">
                  Total Shops
                </p>
                <p className="font-display-sm text-display-sm text-on-surface">
                  {metricsLoading ? "..." : totalShops.toLocaleString()}
                </p>
              </div>

              {/* Active Shops */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <span className="text-green-700 font-medium text-[12px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      check_circle
                    </span>{" "}
                    {shopHealth}%
                  </span>
                </div>
                <p className="text-secondary text-label-caps mb-1 uppercase tracking-wider">
                  Active Shops
                </p>
                <p className="font-display-sm text-display-sm text-on-surface">
                  {metricsLoading ? "..." : activeShops.toLocaleString()}
                </p>
              </div>

              {/* Total Invoices */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary-container text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      receipt_long
                    </span>
                  </div>
                  <span className="text-primary font-medium text-[12px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      trending_up
                    </span>{" "}
                    +5.4k
                  </span>
                </div>
                <p className="text-secondary text-label-caps mb-1 uppercase tracking-wider">
                  Total Invoices
                </p>
                <p className="font-display-sm text-display-sm text-on-surface">
                  {metricsLoading ? "..." : totalInvoices.toLocaleString()}
                </p>
              </div>

              {/* Total Products */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-tertiary-container flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      inventory_2
                    </span>
                  </div>
                  <span className="text-secondary font-medium text-[12px]">
                    Avg{" "}
                    {totalProducts > 0
                      ? (totalProducts / totalShops || 0).toFixed(0)
                      : 0}
                    /shop
                  </span>
                </div>
                <p className="text-secondary text-label-caps mb-1 uppercase tracking-wider">
                  Total Products
                </p>
                <p className="font-display-sm text-display-sm text-on-surface">
                  {metricsLoading ? "..." : totalProducts.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Active Sessions & Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-body-lg text-on-surface">
                    Active Sessions
                  </h3>
                  <span className="material-symbols-outlined text-primary">
                    info
                  </span>
                </div>
                <p className="text-display-sm font-semibold text-on-surface">
                  {metricsLoading ? "..." : activeSessions}
                </p>
                <p className="text-body-sm text-secondary mt-2">
                  Current user sessions connected to the platform
                </p>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-body-lg text-on-surface">
                    System Health
                  </h3>
                  <span className="material-symbols-outlined text-green-600">
                    check_circle
                  </span>
                </div>
                <p className="text-display-sm font-semibold text-green-600">
                  Operational
                </p>
                <p className="text-body-sm text-secondary mt-2">
                  All systems functioning optimally
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
